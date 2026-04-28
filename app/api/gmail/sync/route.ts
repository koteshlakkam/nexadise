import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabaseServer";
import { processEmail } from "@/lib/ai";
import {
  GmailApiError,
  getMessage,
  listMessages,
  parseGmailMessage,
} from "@/lib/gmail";

/**
 * POST/GET /api/gmail/sync
 *
 * Pulls the latest INBOX messages from the user's Gmail, runs AI insight on
 * messages we haven't seen before, persists everything to Supabase, and
 * returns a summary the UI can show.
 *
 * Auth: prefers a NextAuth server-side session. Falls back to a Bearer token
 *       in the Authorization header for legacy clients.
 *
 * Query params:
 *   ?limit=50          — max messages to scan from Gmail (1-100, default 50)
 *   ?query=in:inbox    — Gmail search expression (default "in:inbox")
 *   ?force=1           — re-process even if the message is already in DB
 */

const MAX_LIMIT = 100;

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}

async function handle(req: Request) {
  const session = await getServerSession(authOptions).catch(() => null);

  // The server-side session is the source of truth — it auto-refreshes the
  // access token. If refresh failed, surface a clear "sign in again" error
  // before we even try to call Gmail.
  if (session?.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      {
        error:
          "Your Google session has expired and the refresh token is no longer valid. Please sign out and sign in again to grant Gmail access.",
        code: "RefreshAccessTokenError",
      },
      { status: 401 },
    );
  }

  const accessToken =
    (session?.accessToken as string | undefined) ?? getBearerToken(req);
  const userEmail = session?.user?.email ?? "test_user";

  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          "Not authenticated. Sign in with Google again so we can request a fresh access token with Gmail scope.",
      },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const limit = clampInt(url.searchParams.get("limit"), 50, 1, MAX_LIMIT);
  const query = url.searchParams.get("query")?.trim() || "in:inbox";
  const force = url.searchParams.get("force") === "1";

  const startedAt = Date.now();

  // 1. List recent message IDs.
  let listing;
  try {
    listing = await listMessages({ accessToken, query, maxResults: limit });
  } catch (err) {
    return jsonError(err, "Failed to list Gmail messages.");
  }

  const messageIds = listing.messages.map((m) => m.id).filter(Boolean);
  if (messageIds.length === 0) {
    return NextResponse.json({
      ok: true,
      query,
      fetched: 0,
      new: 0,
      skipped: 0,
      failed: 0,
      durationMs: Date.now() - startedAt,
      items: [],
    });
  }

  // 2. Find which IDs we already have so we can skip them.
  let existingIds = new Set<string>();
  if (!force) {
    const { data: existingRows, error: existingErr } = await supabaseServer
      .from("emails")
      .select("gmail_message_id")
      .in("gmail_message_id", messageIds);

    if (existingErr) {
      console.warn(
        "[gmail/sync] Could not check existing rows, will sync everything:",
        existingErr.message,
      );
    } else {
      existingIds = new Set(
        (existingRows ?? []).map((r) => String(r.gmail_message_id)),
      );
    }
  }

  const idsToFetch = messageIds.filter((id) => !existingIds.has(id));

  // 3. For each new ID, pull the full message + run AI + persist.
  const results = await Promise.allSettled(
    idsToFetch.map((id) => syncOne(id, accessToken, userEmail)),
  );

  const synced: Array<{ id: string; subject: string }> = [];
  const failures: Array<{ id: string; error: string }> = [];
  for (let i = 0; i < results.length; i += 1) {
    const r = results[i];
    if (r.status === "fulfilled") {
      synced.push(r.value);
    } else {
      failures.push({
        id: idsToFetch[i],
        error: r.reason instanceof Error ? r.reason.message : String(r.reason),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    query,
    user: userEmail,
    fetched: messageIds.length,
    new: synced.length,
    skipped: existingIds.size,
    failed: failures.length,
    nextPageToken: listing.nextPageToken,
    durationMs: Date.now() - startedAt,
    items: synced,
    ...(failures.length ? { failures } : {}),
  });
}

/**
 * Fetch one Gmail message in full, run AI on the parsed body, and upsert
 * into Supabase. Returns the minimal info the caller needs for its summary.
 */
async function syncOne(
  id: string,
  accessToken: string,
  userId: string,
): Promise<{ id: string; subject: string }> {
  const raw = await getMessage(id, accessToken, "full");
  const parsed = parseGmailMessage(raw);

  // Use the actual body for AI input — much richer signal than Gmail's snippet.
  const aiInput = parsed.body && parsed.body.length > 60 ? parsed.body : parsed.snippet;
  const insight = await processEmail(parsed.subject, aiInput, parsed.from, {
    cacheKey: id,
  });

  // Tolerate missing columns: try the full row, fall back to the legacy minimum.
  const fullRow = {
    user_id: userId,
    gmail_message_id: id,
    thread_id: parsed.threadId,
    subject: parsed.subject,
    sender: parsed.from,
    recipient: parsed.to,
    snippet: parsed.snippet,
    body: parsed.body,
    summary: insight.summary,
    suggested_action: insight.suggestedAction,
    received_at: parsed.date,
    action: insight.action,
    action_type: insight.actionType,
    urgency: insight.urgency,
    labels: parsed.labels,
    is_unread: parsed.isUnread,
    is_important: parsed.isImportant,
    is_starred: parsed.isStarred,
  };

  let upsert = await supabaseServer
    .from("emails")
    .upsert(fullRow, { onConflict: "gmail_message_id" });

  if (upsert.error) {
    console.warn(
      "[gmail/sync] Full upsert failed, retrying with legacy columns only:",
      upsert.error.message,
    );
    upsert = await supabaseServer.from("emails").upsert(
      {
        user_id: userId,
        gmail_message_id: id,
        subject: parsed.subject,
        sender: parsed.from,
        snippet: parsed.snippet,
        received_at: parsed.date,
        action: insight.action,
        action_type: insight.actionType,
      },
      { onConflict: "gmail_message_id" },
    );
  }

  if (upsert.error) {
    throw new Error(`Supabase upsert failed: ${upsert.error.message}`);
  }

  return { id, subject: parsed.subject };
}

function jsonError(err: unknown, fallback: string) {
  if (err instanceof GmailApiError) {
    if (err.status === 401 || err.status === 403) {
      return NextResponse.json(
        {
          error:
            "Gmail rejected the access token. This usually means your session expired — sign out and sign in again so we can capture a fresh refresh token.",
          status: err.status,
          code: "GmailUnauthorized",
        },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: err.message, status: err.status },
      { status: 502 },
    );
  }
  const message = err instanceof Error ? err.message : fallback;
  return NextResponse.json({ error: message }, { status: 500 });
}
