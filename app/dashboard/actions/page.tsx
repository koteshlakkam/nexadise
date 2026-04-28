"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useGmailMessages, type GmailMessage } from "@/hooks/useGmailMessages";
import { useGmailSync } from "@/hooks/useGmailSync";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const PAGE_SIZE = 20;

type UrgencyFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";
type TypeFilter = "ALL" | "REPLY" | "REVIEW" | "APPROVAL" | "MEETING";

export default function ActionsPage() {
  const [urgency, setUrgency] = useState<UrgencyFilter>("ALL");
  const [type, setType] = useState<TypeFilter>("ALL");

  const apiFilters = useMemo(
    () => ({
      action: "ACTION_REQUIRED" as const,
      urgency: urgency === "ALL" ? null : urgency,
      actionType: type === "ALL" ? null : type,
    }),
    [urgency, type],
  );

  const {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    reload,
    loadMore,
  } = useGmailMessages(apiFilters, PAGE_SIZE);

  const {
    sync,
    isSyncing,
    error: syncError,
    needsReauth,
    reauth,
    summary,
    dismissSummary,
  } = useGmailSync(async () => {
    await reload();
  });

  const handleIntersect = useCallback(() => {
    void loadMore();
  }, [loadMore]);
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    handleIntersect,
    hasMore && !isLoading && !isLoadingMore,
  );

  const stats = useMemo(() => {
    const high = items.filter((i) => i.urgency === "HIGH").length;
    const medium = items.filter((i) => i.urgency === "MEDIUM").length;
    const low = items.filter((i) => i.urgency === "LOW").length;
    return { high, medium, low };
  }, [items]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-wide text-ink-500">Actions</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tighter2 text-ink-900 sm:text-3xl">
            What needs your attention
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Action-required messages from your inbox, with AI-suggested next steps.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => sync({ limit: 50, query: "in:inbox" })}
          isLoading={isSyncing}
          leadingIcon={<Icon.Mail className="h-3.5 w-3.5" />}
        >
          Sync Gmail
        </Button>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <StatCard
          label="High urgency"
          value={stats.high}
          tone="from-rose-50 to-rose-100/40 border-rose-100 text-rose-700"
          icon={<Icon.AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Medium"
          value={stats.medium}
          tone="from-amber-50 to-amber-100/40 border-amber-100 text-amber-700"
          icon={<Icon.Bolt className="h-4 w-4" />}
        />
        <StatCard
          label="Low"
          value={stats.low}
          tone="from-emerald-50 to-emerald-100/40 border-emerald-100 text-emerald-700"
          icon={<Icon.CheckCircle className="h-4 w-4" />}
        />
      </section>

      {summary && !error && !syncError && (
        <Banner tone="emerald" onDismiss={dismissSummary}>
          Synced {summary.new} new
          {summary.skipped > 0 ? `, skipped ${summary.skipped}` : ""}
          {summary.failed > 0 ? `, ${summary.failed} failed` : ""} ·{" "}
          {(summary.durationMs / 1000).toFixed(1)}s
        </Banner>
      )}

      {(error || syncError) && (
        <Banner tone="rose">
          <span className="block">{error || syncError}</span>
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
        </Banner>
      )}

      <Card padded={false}>
        <div className="space-y-3 border-b border-ink-100 bg-surface-muted/40 p-4">
          <FilterRow label="Urgency">
            {(["ALL", "HIGH", "MEDIUM", "LOW"] as UrgencyFilter[]).map((u) => (
              <Pill key={u} selected={urgency === u} onClick={() => setUrgency(u)}>
                {u === "ALL" ? "Any" : u.toLowerCase()}
              </Pill>
            ))}
          </FilterRow>
          <FilterRow label="Type">
            {(
              ["ALL", "REPLY", "REVIEW", "APPROVAL", "MEETING"] as TypeFilter[]
            ).map((t) => (
              <Pill key={t} selected={type === t} onClick={() => setType(t)}>
                {t === "ALL" ? "Any" : t.charAt(0) + t.slice(1).toLowerCase()}
              </Pill>
            ))}
          </FilterRow>
          <p className="text-2xs text-ink-500">
            {typeof total === "number"
              ? `${total.toLocaleString()} matching action${total === 1 ? "" : "s"}`
              : "—"}
          </p>
        </div>

        <div className="p-5">
          {isLoading ? (
            <SkeletonList />
          ) : items.length === 0 ? (
            <EmptyState
              title="Nothing needs your attention"
              body="Either you're caught up, or no messages have been synced yet — click Sync Gmail above."
            />
          ) : (
            <div className="space-y-2.5">
              {items.map((email) => (
                <ActionRow key={email.id} email={email} />
              ))}
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
                items.length > PAGE_SIZE && (
                  <p className="pt-3 text-center text-2xs text-ink-400">
                    No more actions.
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function ActionRow({ email }: { email: GmailMessage }) {
  const typeTone =
    email.actionType === "REPLY"
      ? "blue"
      : email.actionType === "REVIEW"
        ? "violet"
        : email.actionType === "APPROVAL"
          ? "amber"
          : email.actionType === "MEETING"
            ? "teal"
            : "slate";
  const urgencyTone =
    email.urgency === "HIGH"
      ? "red"
      : email.urgency === "MEDIUM"
        ? "amber"
        : "emerald";

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 transition-all duration-200 hover:border-ink-300 hover:shadow-soft">
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          email.urgency === "HIGH"
            ? "bg-rose-50 text-rose-600"
            : "bg-brand-50 text-brand-600",
        )}
      >
        <Icon.Bolt className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {email.actionType ? <Badge tone={typeTone}>{email.actionType}</Badge> : null}
          {email.urgency ? (
            <Badge tone={urgencyTone} dot>
              {email.urgency}
            </Badge>
          ) : null}
          <span className="text-2xs text-ink-400">
            {email.date
              ? new Date(email.date).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-ink-900">
          {email.subject || "(no subject)"}
        </p>
        <p className="mt-0.5 truncate text-2xs text-ink-500">{email.from}</p>

        {email.suggestedAction ? (
          <div className="mt-2.5 flex items-start gap-2 rounded-md border border-brand-100 bg-gradient-to-br from-brand-50/60 to-violet-50/40 px-3 py-2">
            <Icon.Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brand-600" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                Suggested action
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-800">
                {email.suggestedAction}
              </p>
            </div>
          </div>
        ) : email.summary ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-600">
            {email.summary}
          </p>
        ) : null}
      </div>
      <Link
        href={`/dashboard/inbox`}
        className="invisible flex h-8 items-center gap-1 rounded-md px-2 text-2xs font-medium text-ink-600 hover:bg-ink-100 group-hover:visible"
      >
        Open <Icon.ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${tone}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xs font-medium uppercase tracking-wide opacity-80">
          {label}
        </span>
        <span className="opacity-70">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tighter2">{value}</p>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <span className="shrink-0 text-2xs font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </span>
      <div className="flex shrink-0 items-center gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-all duration-150",
        selected
          ? "bg-ink-900 text-white shadow-soft"
          : "bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:text-ink-900",
      )}
    >
      {children}
    </button>
  );
}

function Banner({
  tone,
  children,
  onDismiss,
}: {
  tone: "emerald" | "rose";
  children: React.ReactNode;
  onDismiss?: () => void;
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";
  const iconColor = tone === "emerald" ? "text-emerald-600" : "text-rose-600";
  const Icn = tone === "emerald" ? Icon.CheckCircle : Icon.AlertTriangle;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${toneClass}`}>
      <Icn className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-2xs font-medium opacity-70 hover:opacity-100"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface-muted px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs">
        <Icon.CheckCircle className="h-5 w-5 text-emerald-500" />
      </div>
      <p className="text-sm font-medium text-ink-900">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-ink-500">{body}</p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4"
        >
          <div className="h-9 w-9 rounded-lg bg-ink-100 animate-pulse-soft" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-ink-100 animate-pulse-soft" />
            <div className="h-3 w-2/3 rounded bg-ink-100/70 animate-pulse-soft" />
            <div className="h-2.5 w-full rounded bg-ink-100/60 animate-pulse-soft" />
          </div>
        </div>
      ))}
    </div>
  );
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
