import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * GET /api/insights
 *
 * Returns aggregated stats over the user's emails table — what the dashboard
 * Insights page renders. Computed in JS over a bounded fetch (good for up to
 * a few thousand emails). When the table grows, this can be replaced with
 * SQL aggregations or a materialized view.
 *
 * Query params:
 *   ?since=ISO          — restrict to emails received on/after this timestamp
 *   ?until=ISO          — restrict to emails received before this timestamp
 *   ?limit=2000         — max rows scanned (default 2000, max 10000)
 */

const MAX_SCAN = 10_000;

const URGENCY_KEYS = ["HIGH", "MEDIUM", "LOW"] as const;
const ACTION_KEYS = ["ACTION_REQUIRED", "INFO"] as const;
const ACTION_TYPE_KEYS = ["REPLY", "REVIEW", "APPROVAL", "MEETING"] as const;

type EmailRow = Record<string, unknown>;

const clampInt = (raw: string | null, fallback: number, min: number, max: number) => {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const since = url.searchParams.get("since");
  const until = url.searchParams.get("until");
  const limit = clampInt(url.searchParams.get("limit"), 2000, 1, MAX_SCAN);

  // select("*") returns whatever columns the table actually has — if newer
  // columns like `urgency` or `suggested_action` haven't been added yet,
  // Supabase silently omits them rather than failing the whole query.
  let query = supabaseServer
    .from("emails")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(limit);

  if (since) query = query.gte("received_at", since);
  if (until) query = query.lt("received_at", until);

  const { data, error } = await query;
  if (error) {
    // If the table is missing entirely or some other column-level issue
    // crops up, return a stable empty response so the UI doesn't crash.
    console.warn("[api/insights] Supabase query failed:", error.message);
    return NextResponse.json({
      ok: true,
      scope: { since, until, scanned: 0, limit },
      ...computeInsights([]),
      notice: error.message,
    });
  }

  const rows = (data ?? []) as EmailRow[];
  const insights = computeInsights(rows);

  // Detect schema gaps so the UI can show a one-time hint.
  const sample = rows.slice(0, 5);
  const hasUrgency = sample.some((r) => "urgency" in r);
  const hasSuggested = sample.some((r) => "suggested_action" in r);
  const missingCols: string[] = [];
  if (!hasUrgency && rows.length > 0) missingCols.push("urgency");
  if (!hasSuggested && rows.length > 0) missingCols.push("suggested_action");

  return NextResponse.json({
    ok: true,
    scope: { since, until, scanned: rows.length, limit },
    ...insights,
    ...(missingCols.length
      ? {
          notice: `Some columns aren't in your Supabase emails table yet (${missingCols.join(
            ", ",
          )}) — once added, this page will show full insight data. Run: alter table emails add column if not exists urgency text, add column if not exists suggested_action text;`,
        }
      : {}),
  });
}

function computeInsights(rows: EmailRow[]) {
  const total = rows.length;

  const byUrgency: Record<(typeof URGENCY_KEYS)[number] | "UNKNOWN", number> = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    UNKNOWN: 0,
  };

  const byAction: Record<(typeof ACTION_KEYS)[number] | "UNKNOWN", number> = {
    ACTION_REQUIRED: 0,
    INFO: 0,
    UNKNOWN: 0,
  };

  const byActionType: Record<(typeof ACTION_TYPE_KEYS)[number] | "NONE", number> = {
    REPLY: 0,
    REVIEW: 0,
    APPROVAL: 0,
    MEETING: 0,
    NONE: 0,
  };

  const senderCounts = new Map<string, number>();

  type RecentAction = {
    id: string;
    subject: string;
    sender: string;
    urgency: string;
    actionType: string | null;
    suggestedAction: string;
    summary: string;
    date: string;
  };
  const recentActions: RecentAction[] = [];

  for (const row of rows) {
    const urgency = String(row.urgency ?? "").toUpperCase();
    if (urgency === "HIGH" || urgency === "MEDIUM" || urgency === "LOW") {
      byUrgency[urgency] += 1;
    } else {
      byUrgency.UNKNOWN += 1;
    }

    const action = String(row.action ?? "").toUpperCase();
    if (action === "ACTION_REQUIRED" || action === "INFO") {
      byAction[action] += 1;
    } else {
      byAction.UNKNOWN += 1;
    }

    const actionType = String(row.action_type ?? "").toUpperCase();
    if (
      actionType === "REPLY" ||
      actionType === "REVIEW" ||
      actionType === "APPROVAL" ||
      actionType === "MEETING"
    ) {
      byActionType[actionType] += 1;
    } else {
      byActionType.NONE += 1;
    }

    const sender = senderDisplay(String(row.sender ?? ""));
    if (sender) {
      senderCounts.set(sender, (senderCounts.get(sender) ?? 0) + 1);
    }

    if (action === "ACTION_REQUIRED" && recentActions.length < 8) {
      recentActions.push({
        id: String(row.gmail_message_id ?? ""),
        subject: String(row.subject ?? "(no subject)"),
        sender,
        urgency: (row.urgency as string) ?? "LOW",
        actionType: (row.action_type as string) ?? null,
        suggestedAction: String(row.suggested_action ?? ""),
        summary: String(row.summary ?? ""),
        date: String(row.received_at ?? ""),
      });
    }
  }

  const topSenders = [...senderCounts.entries()]
    .map(([sender, count]) => ({ sender, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const actionRequired = byAction.ACTION_REQUIRED;
  const actionRequiredPct = total > 0 ? Math.round((actionRequired / total) * 100) : 0;

  return {
    total,
    actionRequired,
    actionRequiredPct,
    high: byUrgency.HIGH,
    byUrgency,
    byAction,
    byActionType,
    topSenders,
    recentActions,
  };
}

/** Pull the friendly display name from a "Name <email>" header; fall back to the address. */
function senderDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const named = trimmed.match(/^"?([^"<]+?)"?\s*<([^>]+)>$/);
  if (named) return named[1].trim();
  return trimmed;
}
