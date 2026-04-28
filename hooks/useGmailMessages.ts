"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GmailMessage = {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  summary?: string;
  suggestedAction?: string;
  /** Where the insight came from: openrouter / gemini AI, rule-based fallback, or cached. */
  aiSource?: "openrouter" | "gemini" | "fallback" | "cached";
  date: string;
  action: "ACTION_REQUIRED" | "INFO";
  actionType: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
  urgency?: "LOW" | "MEDIUM" | "HIGH";
};

export type AiStatus = {
  status: "ok" | "degraded" | "unconfigured";
  provider: "openrouter" | "gemini" | "none";
  model: string;
  lastError: string | null;
  successes: number;
  attempts: number;
  cacheSize?: number;
};

export type GmailFilters = {
  /** ISO date — receives messages on or after this timestamp */
  since?: string | null;
  /** ISO date — receives messages strictly before this timestamp */
  until?: string | null;
  urgency?: "LOW" | "MEDIUM" | "HIGH" | null;
  actionType?: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
  action?: "ACTION_REQUIRED" | "INFO" | null;
  q?: string;
};

type ApiResponse = {
  items: GmailMessage[];
  hasMore: boolean;
  total: number | null;
  nextOffset: number;
  notice?: string;
  ai?: AiStatus;
};

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  if (!text) return `Request failed (${res.status})`;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      return String((parsed as { error: unknown }).error);
    }
  } catch {
    // not JSON, fall through
  }
  return text;
}

const PAGE_SIZE = 20;

function buildQuery(filters: GmailFilters, limit: number, offset: number) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (filters.since) params.set("since", filters.since);
  if (filters.until) params.set("until", filters.until);
  if (filters.urgency) params.set("urgency", filters.urgency);
  if (filters.actionType) params.set("actionType", filters.actionType);
  if (filters.action) params.set("action", filters.action);
  if (filters.q && filters.q.trim()) params.set("q", filters.q.trim());
  return params.toString();
}

export function useGmailMessages(filters: GmailFilters, pageSize = PAGE_SIZE) {
  const [items, setItems] = useState<GmailMessage[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [ai, setAi] = useState<AiStatus | null>(null);

  // Track the request so stale fetches don't overwrite fresh data when filters change.
  const requestId = useRef(0);
  const filtersKey = JSON.stringify(filters);

  const loadFirstPage = useCallback(async () => {
    const myId = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/emails?${buildQuery(filters, pageSize, 0)}`);
      if (!res.ok) {
        throw new Error(await readError(res));
      }
      const data = (await res.json()) as ApiResponse;
      if (myId !== requestId.current) return; // stale
      setItems(data.items ?? []);
      setHasMore(Boolean(data.hasMore));
      setTotal(data.total ?? null);
      setNotice(data.notice ?? null);
      setAi(data.ai ?? null);
    } catch (err) {
      if (myId !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Failed to load emails.");
      setItems([]);
      setHasMore(false);
    } finally {
      if (myId === requestId.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, pageSize]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || isLoading || !hasMore) return;
    const myId = requestId.current;
    setIsLoadingMore(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/emails?${buildQuery(filters, pageSize, items.length)}`,
      );
      if (!res.ok) {
        throw new Error(await readError(res));
      }
      const data = (await res.json()) as ApiResponse;
      if (myId !== requestId.current) return; // stale (filters changed)
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = (data.items ?? []).filter((i) => !seen.has(i.id));
        return [...prev, ...fresh];
      });
      setHasMore(Boolean(data.hasMore));
      setTotal(data.total ?? null);
      if (data.notice) setNotice(data.notice);
      if (data.ai) setAi(data.ai);
    } catch (err) {
      if (myId !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Failed to load more.");
    } finally {
      if (myId === requestId.current) setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, hasMore, isLoading, isLoadingMore, items.length, pageSize]);

  // Reload whenever filters change.
  useEffect(() => {
    void loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  return {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    notice,
    ai,
    reload: loadFirstPage,
    loadMore,
  };
}
