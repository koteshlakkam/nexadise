"use client";

import { useCallback, useEffect, useState } from "react";

export type InsightsData = {
  ok: boolean;
  scope: { since: string | null; until: string | null; scanned: number; limit: number };
  total: number;
  actionRequired: number;
  actionRequiredPct: number;
  high: number;
  byUrgency: { HIGH: number; MEDIUM: number; LOW: number; UNKNOWN: number };
  byAction: { ACTION_REQUIRED: number; INFO: number; UNKNOWN: number };
  byActionType: {
    REPLY: number;
    REVIEW: number;
    APPROVAL: number;
    MEETING: number;
    NONE: number;
  };
  topSenders: Array<{ sender: string; count: number }>;
  recentActions: Array<{
    id: string;
    subject: string;
    sender: string;
    urgency: string;
    actionType: string | null;
    suggestedAction: string;
    summary: string;
    date: string;
  }>;
  notice?: string;
};

type Options = { since?: string | null; until?: string | null; limit?: number };

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  if (!text) return `Request failed (${res.status})`;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      return String((parsed as { error: unknown }).error);
    }
  } catch {
    /* not JSON */
  }
  return text;
}

export function useInsights(options: Options = {}) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optsKey = JSON.stringify(options);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.since) params.set("since", options.since);
      if (options.until) params.set("until", options.until);
      if (options.limit) params.set("limit", String(options.limit));
      const qs = params.toString();
      const res = await fetch(`/api/insights${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error(await readError(res));
      const json = (await res.json()) as InsightsData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optsKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, reload: load };
}
