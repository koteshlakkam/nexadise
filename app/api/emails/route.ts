import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { processEmail, getAiDiagnostics } from "@/lib/ai";

const ALLOWED_URGENCY = new Set(["LOW", "MEDIUM", "HIGH"]);
const ALLOWED_ACTION_TYPES = new Set(["REPLY", "REVIEW", "APPROVAL", "MEETING"]);
const ALLOWED_ACTION = new Set(["ACTION_REQUIRED", "INFO"]);

const clampInt = (raw: string | null, fallback: number, min: number, max: number) => {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

type AppliedFilters = {
  since: string | null;
  until: string | null;
  urgency: string | null;
  actionType: string | null;
  action: string | null;
  q: string | null;
};

/** Build a Supabase query, optionally skipping certain filters that we know
 *  will be applied client-side because the column doesn't exist yet. */
function buildQuery(
  filters: AppliedFilters,
  skip: { urgency?: boolean; actionType?: boolean; action?: boolean },
  limit: number,
  offset: number,
) {
  let q = supabaseServer
    .from("emails")
    .select("*", { count: "exact" })
    .order("received_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.since) q = q.gte("received_at", filters.since);
  if (filters.until) q = q.lt("received_at", filters.until);
  if (filters.urgency && !skip.urgency) q = q.eq("urgency", filters.urgency);
  if (filters.actionType && !skip.actionType) q = q.eq("action_type", filters.actionType);
  if (filters.action && !skip.action) q = q.eq("action", filters.action);
  if (filters.q) {
    const escaped = filters.q.replace(/[%,]/g, " ").trim();
    if (escaped) {
      q = q.or(
        `subject.ilike.%${escaped}%,sender.ilike.%${escaped}%,snippet.ilike.%${escaped}%`,
      );
    }
  }

  return q;
}

/** Detect Supabase / Postgres "undefined column" errors and identify the column. */
function detectMissingColumn(message: string | null | undefined): string | null {
  if (!message) return null;
  const m = message.match(/column [^"\s]*?\.?"?(\w+)"?\s+does not exist/i);
  return m?.[1] ?? null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = clampInt(url.searchParams.get("limit"), 20, 1, 100);
  const offset = clampInt(url.searchParams.get("offset"), 0, 0, 10_000);

  const filters: AppliedFilters = {
    since: url.searchParams.get("since"),
    until: url.searchParams.get("until"),
    urgency: (url.searchParams.get("urgency") ?? "").toUpperCase() || null,
    actionType: (url.searchParams.get("actionType") ?? "").toUpperCase() || null,
    action: (url.searchParams.get("action") ?? "").toUpperCase() || null,
    q: url.searchParams.get("q")?.trim() || null,
  };

  if (filters.urgency && !ALLOWED_URGENCY.has(filters.urgency)) filters.urgency = null;
  if (filters.actionType && !ALLOWED_ACTION_TYPES.has(filters.actionType))
    filters.actionType = null;
  if (filters.action && !ALLOWED_ACTION.has(filters.action)) filters.action = null;

  // Track which filters had to fall back to in-memory because the DB column
  // doesn't exist (yet).
  const inMemory = { urgency: false, actionType: false, action: false };

  // When in-memory filtering is active we need to over-fetch so we can serve a
  // full page after the in-memory pass.
  const overFetchMultiplier = filters.urgency || filters.actionType || filters.action ? 5 : 1;
  let dbLimit = Math.min(100, limit * overFetchMultiplier);

  let attempt = 0;
  let data: Array<Record<string, unknown>> = [];
  let totalFromDb: number | null = null;
  // Try up to 4 times — once per potentially-missing column (urgency, action_type, action) plus the initial.
  while (attempt < 4) {
    const skip = {
      urgency: inMemory.urgency,
      actionType: inMemory.actionType,
      action: inMemory.action,
    };

    const result = await buildQuery(filters, skip, dbLimit, offset);
    if (!result.error) {
      data = (result.data ?? []) as Array<Record<string, unknown>>;
      totalFromDb = result.count ?? null;
      break;
    }

    const missing = detectMissingColumn(result.error.message);
    if (!missing) {
      // Unrelated error — surface it cleanly.
      return NextResponse.json(
        { error: result.error.message || "Failed to load emails." },
        { status: 500 },
      );
    }

    // Map the missing column to one of our filters and retry.
    let didFallback = false;
    if (missing === "urgency" && filters.urgency && !inMemory.urgency) {
      inMemory.urgency = true;
      didFallback = true;
    }
    if (missing === "action_type" && filters.actionType && !inMemory.actionType) {
      inMemory.actionType = true;
      didFallback = true;
    }
    if (missing === "action" && filters.action && !inMemory.action) {
      inMemory.action = true;
      didFallback = true;
    }
    // If the missing column isn't one we filter on, just retry without that
    // filter being applied at all (it shouldn't have been requested).
    if (!didFallback) {
      console.warn(
        `[api/emails] Unexpected missing column "${missing}". Returning empty page.`,
      );
      return NextResponse.json({ items: [], hasMore: false, total: 0, nextOffset: offset });
    }

    // Now we're using in-memory filtering — bump the over-fetch.
    dbLimit = 100;
    attempt += 1;
  }

  // Hydrate with AI if cached fields are missing.
  const hydrated = await Promise.all(
    data.map(async (row) => {
      const subject = String(row.subject ?? "");
      const snippet = String(row.snippet ?? "");
      const sender = String(row.sender ?? "");

      let summary = row.summary != null ? String(row.summary) : "";
      let suggestedAction =
        row.suggested_action != null ? String(row.suggested_action) : "";
      let urgencyVal = (row.urgency != null ? String(row.urgency) : "") as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "";
      // Default to "cached" if we don't need to re-call AI; if any field is
      // missing, processEmail tells us whether OpenRouter, Gemini, or the
      // rule-based fallback ran.
      let aiSource: "openrouter" | "gemini" | "fallback" | "cached" = "cached";

      if (!summary || !suggestedAction || !urgencyVal) {
        const cacheKey = String(row.gmail_message_id ?? row.id ?? "");
        const insight = await processEmail(subject, snippet, sender, {
          cacheKey: cacheKey || undefined,
        });
        summary = summary || insight.summary;
        suggestedAction = suggestedAction || insight.suggestedAction;
        urgencyVal = (urgencyVal || insight.urgency) as typeof urgencyVal;
        aiSource = insight.source;
      }

      return {
        id: String(row.gmail_message_id ?? row.id ?? ""),
        subject,
        from: sender,
        snippet,
        summary,
        suggestedAction,
        aiSource,
        date: String(row.received_at ?? ""),
        action: ((row.action as string) ?? "INFO") as "ACTION_REQUIRED" | "INFO",
        actionType: ((row.action_type as string) ?? null) as
          | "REPLY"
          | "REVIEW"
          | "APPROVAL"
          | "MEETING"
          | null,
        urgency: urgencyVal as "LOW" | "MEDIUM" | "HIGH",
      };
    }),
  );

  // Apply in-memory filters now that AI has hydrated missing fields.
  let filtered = hydrated.filter((e) => e.id);
  if (inMemory.urgency && filters.urgency)
    filtered = filtered.filter((e) => e.urgency === filters.urgency);
  if (inMemory.actionType && filters.actionType)
    filtered = filtered.filter((e) => e.actionType === filters.actionType);
  if (inMemory.action && filters.action)
    filtered = filtered.filter((e) => e.action === filters.action);

  // Slice down to the requested page size.
  const page = filtered.slice(0, limit);

  const usedInMemory = inMemory.urgency || inMemory.actionType || inMemory.action;
  // If we're filtering in memory we can't know the exact total cheaply.
  const total = usedInMemory ? null : totalFromDb;
  // hasMore: if we filtered in memory and got at least limit results out of
  // the over-fetched batch, there might be more on the next page.
  const hasMore = usedInMemory
    ? filtered.length > limit || (totalFromDb ?? 0) > offset + dbLimit
    : (totalFromDb ?? 0) > offset + page.length;

  // Surface AI status so the UI can show degraded mode and explain why.
  const diag = getAiDiagnostics();
  const activeStats =
    diag.active === "openrouter"
      ? diag.providers.openrouter
      : diag.active === "gemini"
        ? diag.providers.gemini
        : null;

  const aiStatus: "ok" | "degraded" | "unconfigured" =
    diag.active === "none"
      ? "unconfigured"
      : activeStats && activeStats.callsSucceeded === 0 && activeStats.lastError
        ? "degraded"
        : "ok";

  return NextResponse.json({
    items: page,
    hasMore,
    total,
    nextOffset: offset + (usedInMemory ? dbLimit : page.length),
    notice: usedInMemory
      ? "Some filters were applied in memory because the matching DB column does not exist yet. For best performance run: alter table emails add column if not exists urgency text, add column if not exists summary text, add column if not exists suggested_action text;"
      : undefined,
    ai: {
      status: aiStatus,
      provider: diag.active,
      model: activeStats?.model ?? "",
      lastError: activeStats?.lastError ?? null,
      successes: activeStats?.callsSucceeded ?? 0,
      attempts: activeStats?.callsAttempted ?? 0,
      cacheSize: diag.cacheSize,
    },
  });
}
