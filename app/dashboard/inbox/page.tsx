"use client";

import { useCallback, useMemo, useState } from "react";
import { GmailRow } from "@/components/features/gmail/GmailRow";
import {
  GmailFiltersBar,
  INITIAL_FILTERS,
  toApiFilters,
  type FilterState,
} from "@/components/features/gmail/GmailFilters";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useGmailMessages } from "@/hooks/useGmailMessages";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useGmailSync } from "@/hooks/useGmailSync";

const PAGE_SIZE = 20;

export default function InboxPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const apiFilters = useMemo(() => toApiFilters(filters), [filters]);

  const {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    notice,
    ai,
    reload,
    loadMore,
  } = useGmailMessages(apiFilters, PAGE_SIZE);

  const {
    sync: syncGmail,
    isSyncing: syncing,
    error: syncError,
    needsReauth,
    reauth,
    summary: syncSummary,
    dismissSummary,
  } = useGmailSync(async () => {
    await reload();
  });

  // Sentinel — fires loadMore when scrolled near bottom of list
  const handleIntersect = useCallback(() => {
    void loadMore();
  }, [loadMore]);
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    handleIntersect,
    hasMore && !isLoading && !isLoadingMore,
  );

  const handleSync = async () => {
    try {
      await syncGmail({ limit: 50, query: "in:inbox" });
    } catch {
      /* surfaced via syncError */
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-wide text-ink-500">Inbox</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tighter2 text-ink-900 sm:text-3xl">
            Your full Gmail
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            AI-summarized messages, filtered by date, urgency, action type, or text.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSync}
          isLoading={syncing}
          leadingIcon={<Icon.Mail className="h-3.5 w-3.5" />}
        >
          Sync Gmail
        </Button>
      </header>

      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-ink-100 bg-surface-muted/40 p-4">
          <GmailFiltersBar value={filters} onChange={setFilters} total={total} />
        </div>

        <div className="p-5">
          {(error || syncError) && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <Icon.AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-rose-800">{error || syncError}</p>
                {needsReauth && (
                  <button
                    type="button"
                    onClick={reauth}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-2.5 py-1 text-2xs font-medium text-white hover:bg-rose-700"
                  >
                    <Icon.Google className="h-3 w-3" />
                    Sign in with Google again
                  </button>
                )}
              </div>
            </div>
          )}

          {syncSummary && !error && !syncError && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <Icon.CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-emerald-900">
                  Synced {syncSummary.new} new
                  {syncSummary.skipped > 0
                    ? `, skipped ${syncSummary.skipped} already-synced`
                    : ""}
                  {syncSummary.failed > 0 ? `, ${syncSummary.failed} failed` : ""} ·{" "}
                  {(syncSummary.durationMs / 1000).toFixed(1)}s
                </p>
                {syncSummary.failures && syncSummary.failures.length > 0 && (
                  <p className="mt-0.5 text-2xs text-emerald-900/70">
                    First failure: {syncSummary.failures[0].error}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={dismissSummary}
                className="text-2xs font-medium text-emerald-700 hover:text-emerald-900"
              >
                Dismiss
              </button>
            </div>
          )}

          {ai && ai.status !== "ok" && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <Icon.AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    {ai.status === "unconfigured"
                      ? "AI is not configured — using rule-based fallback"
                      : `${labelProvider(ai.provider)} is not responding — using rule-based fallback`}
                  </p>
                  {ai.status === "unconfigured" ? (
                    <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
                      Add{" "}
                      <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-2xs">
                        OPENROUTER_API_KEY=sk-or-...
                      </code>{" "}
                      to your <code className="font-mono">.env</code> file and restart the dev
                      server. Get a free key at{" "}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline"
                      >
                        openrouter.ai/keys
                      </a>
                      .
                    </p>
                  ) : (
                    <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
                      Model{" "}
                      <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-2xs">
                        {ai.model}
                      </code>{" "}
                      returned:{" "}
                      <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-2xs">
                        {ai.lastError}
                      </code>
                    </p>
                  )}
                  <p className="mt-2 text-2xs text-amber-900/70">
                    Visit{" "}
                    <a
                      href="/api/ai/health"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline"
                    >
                      /api/ai/health
                    </a>{" "}
                    for diagnostics. To use a different OpenRouter model, set{" "}
                    <code className="font-mono">OPENROUTER_MODEL</code> in <code>.env</code> — pick
                    one at{" "}
                    <a
                      href="https://openrouter.ai/models?max_price=0"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline"
                    >
                      openrouter.ai/models?max_price=0
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <SkeletonList />
          ) : items.length === 0 ? (
            <EmptyState
              filtered={
                filters.day !== "all" ||
                filters.urgency !== null ||
                filters.actionType !== null ||
                filters.q.trim().length > 0
              }
              onClear={() => setFilters(INITIAL_FILTERS)}
            />
          ) : (
            <div className="space-y-2.5">
              {items.map((email) => (
                <GmailRow key={email.id} email={email} />
              ))}

              {/* Sentinel for infinite scroll */}
              {hasMore ? (
                <div ref={sentinelRef} className="pt-2">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 bg-white py-6">
                      <Spinner />
                      <span className="text-2xs text-ink-500">Loading more…</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-2 text-2xs text-ink-400">
                      Scroll for more
                    </div>
                  )}
                </div>
              ) : (
                <p className="pt-3 text-center text-2xs text-ink-400">
                  You&apos;re all caught up — no more messages.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-ink-200 bg-white p-4"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded-full bg-ink-100 animate-pulse-soft" />
            <div className="h-4 w-12 rounded-full bg-ink-100 animate-pulse-soft" />
          </div>
          <div className="mt-3 h-3 w-2/3 rounded bg-ink-100 animate-pulse-soft" />
          <div className="mt-2 h-2.5 w-1/3 rounded bg-ink-100/70 animate-pulse-soft" />
          <div className="mt-3 h-12 rounded-md bg-ink-100/60 animate-pulse-soft" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface-muted px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs">
        <Icon.Inbox className="h-5 w-5 text-ink-400" />
      </div>
      <p className="text-sm font-medium text-ink-900">
        {filtered ? "No messages match these filters" : "No messages yet"}
      </p>
      <p className="mt-1 max-w-xs text-xs text-ink-500">
        {filtered
          ? "Try widening the date range or clearing the urgency / action filter."
          : 'Click "Sync Gmail" up top to fetch the latest messages.'}
      </p>
      {filtered ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

function labelProvider(p: "openrouter" | "gemini" | "none") {
  if (p === "openrouter") return "OpenRouter";
  if (p === "gemini") return "Gemini";
  return "AI";
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 animate-spin text-ink-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  );
}
