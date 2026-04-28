import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { processEmail } from "@/lib/ai";

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function getHeaderValue(
  headers: Array<{ name?: string; value?: string }> | undefined,
  name: string
): string | null {
  if (!headers) return null;
  const found = headers.find((h) => (h.name ?? "").toLowerCase() === name.toLowerCase());
  return found?.value ?? null;
}

function toReadableDate(internalDate: string | undefined): string | null {
  if (!internalDate) return null;
  const ms = Number(internalDate);
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function GET(req: Request) {
  const accessToken = getBearerToken(req);

  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing Authorization header (Bearer accessToken)" },
      { status: 401 }
    );
  }

  const url = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10";

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Gmail API request failed", status: res.status, body: text },
      { status: 502 }
    );
  }

  const data = (await res.json()) as { messages?: Array<{ id: string }> };
  const ids = (data.messages ?? []).map((m) => m.id).filter(Boolean);

  const emails = (
    await Promise.all(
      ids.map(async (id) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!msgRes.ok) return null;

        const msg = (await msgRes.json()) as {
          id?: string;
          snippet?: string;
          internalDate?: string;
          payload?: { headers?: Array<{ name?: string; value?: string }> };
        };

        const payloadHeaders = msg.payload?.headers;
        const subject = getHeaderValue(payloadHeaders, "Subject") ?? "";
        const from = getHeaderValue(payloadHeaders, "From") ?? "";
        const snippet = msg.snippet ?? "";
        const { summary, action, actionType, urgency } = await processEmail(subject, snippet);
        const date = toReadableDate(msg.internalDate) ?? "";

        const email = {
          id,
          subject,
          from,
          snippet,
          summary,
          date,
          action,
          actionType,
          urgency,
        };

        const upsertResult = await supabaseServer
          .from("emails")
          .upsert(
            {
              user_id: "test_user",
              gmail_message_id: email.id,
              subject: email.subject,
              sender: email.from,
              snippet: email.snippet,
              received_at: email.date,
              action: email.action,
              action_type: email.actionType,
            },
            { onConflict: "gmail_message_id" }
          );

        if (upsertResult.error) {
          console.error("[gmail/sync] Supabase upsert failed:", upsertResult.error);
        }

        return email;
      })
    )
  ).filter(Boolean) as Array<{
    id: string;
    subject: string;
    from: string;
    snippet: string;
    summary: string;
    date: string;
    action: "ACTION_REQUIRED" | "INFO";
    actionType: "REPLY" | "REVIEW" | "APPROVAL" | null;
    urgency: "LOW" | "MEDIUM" | "HIGH";
  }>;

  return NextResponse.json(emails);
}

