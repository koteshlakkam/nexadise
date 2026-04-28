"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useInsights, type InsightsData } from "@/hooks/useInsights";
import { cn } from "@/lib/cn";

const URGENCY_TONES: Record<"HIGH" | "MEDIUM" | "LOW" | "UNKNOWN", string> = {
  HIGH: "from-rose-500 to-rose-400",
  MEDIUM: "from-amber-500 to-amber-400",
  LOW: "from-emerald-500 to-emerald-400",
  UNKNOWN: "from-ink-400 to-ink-300",
};

const TYPE_TONES: Record<string, string> = {
  REPLY: "from-blue-500 to-blue-400",
  REVIEW: "from-violet-500 to-violet-400",
  APPROVAL: "from-amber-500 to-amber-400",
  MEETING: "from-teal-500 to-teal-400",
  NONE: "from-ink-400 to-ink-300",
};

export default function InsightsPage() {
  const { data, isLoading, error, reload } = useInsights({ limit: 2000 });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-wide text-ink-500">Insights</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tighter2 text-ink-900 sm:text-3xl">
            What your inbox is telling you
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            AI-derived patterns across your synced Gmail messages.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={reload}
          isLoading={isLoading}
          leadingIcon={<Icon.Sparkles className="h-3.5 w-3.5" />}
        >
          Refresh
        </Button>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <Icon.AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      {isLoading && !data ? (
        <SkeletonGrid />
      ) : data && data.total === 0 ? (
        <EmptyState />
      ) : data ? (
        <Insights data={data} />
      ) : null}
    </div>
  );
}

function Insights({ data }: { data: InsightsData }) {
  const urgencyTotal = data.byUrgency.HIGH + data.byUrgency.MEDIUM + data.byUrgency.LOW;
  const typeTotal =
    data.byActionType.REPLY +
    data.byActionType.REVIEW +
    data.byActionType.APPROVAL +
    data.byActionType.MEETING;

  return (
    <>
      {/* Top stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total messages"
          value={data.total.toLocaleString()}
          tone="from-brand-50 to-violet-50 border-brand-100 text-brand-700"
          icon={<Icon.Inbox className="h-4 w-4" />}
        />
        <StatCard
          label="Need action"
          value={`${data.actionRequired} · ${data.actionRequiredPct}%`}
          tone="from-rose-50 to-rose-100/40 border-rose-100 text-rose-700"
          icon={<Icon.Bolt className="h-4 w-4" />}
        />
        <StatCard
          label="High urgency"
          value={data.high.toLocaleString()}
          tone="from-amber-50 to-amber-100/40 border-amber-100 text-amber-700"
          icon={<Icon.AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Info / FYI"
          value={data.byAction.INFO.toLocaleString()}
          tone="from-emerald-50 to-emerald-100/40 border-emerald-100 text-emerald-700"
          icon={<Icon.CheckCircle className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Urgency breakdown */}
        <Card title="Urgency breakdown" description="Across all action-required messages">
          {urgencyTotal === 0 ? (
            <p className="text-sm text-ink-500">No urgency data yet.</p>
          ) : (
            <div className="space-y-4">
              {(["HIGH", "MEDIUM", "LOW"] as const).map((u) => (
                <Bar
                  key={u}
                  label={u}
                  value={data.byUrgency[u]}
                  total={urgencyTotal}
                  tone={URGENCY_TONES[u]}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Action type breakdown */}
        <Card title="Action type" description="What kind of work the AI surfaced">
          {typeTotal === 0 ? (
            <p className="text-sm text-ink-500">No actions detected yet.</p>
          ) : (
            <div className="space-y-4">
              {(["REPLY", "REVIEW", "APPROVAL", "MEETING"] as const).map((t) => (
                <Bar
                  key={t}
                  label={t.charAt(0) + t.slice(1).toLowerCase()}
                  value={data.byActionType[t]}
                  total={typeTotal}
                  tone={TYPE_TONES[t]}
                />
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Top senders */}
        <Card title="Top senders" description="Who's writing to you most">
          {data.topSenders.length === 0 ? (
            <p className="text-sm text-ink-500">No sender data yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {data.topSenders.map(({ sender, count }) => {
                const pct =
                  data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                return (
                  <li
                    key={sender}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-2xs font-semibold text-brand-700">
                        {sender.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="truncate text-ink-800">{sender}</span>
                    </span>
                    <span className="shrink-0 text-2xs text-ink-500">
                      {count} · {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Recent action items */}
        <Card
          title="Recent suggested actions"
          description="The AI-recommended next steps from your most recent action items"
        >
          {data.recentActions.length === 0 ? (
            <p className="text-sm text-ink-500">No recent action items.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActions.map((a) => {
                const urgencyClass =
                  a.urgency === "HIGH"
                    ? "bg-rose-50 text-rose-700 ring-rose-200/70"
                    : a.urgency === "MEDIUM"
                      ? "bg-amber-50 text-amber-800 ring-amber-200/70"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-200/70";
                return (
                  <li
                    key={a.id}
                    className="rounded-xl border border-ink-200 bg-white p-3 transition hover:border-ink-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium ring-1 ring-inset",
                          urgencyClass,
                        )}
                      >
                        {a.urgency}
                      </span>
                      <span className="text-2xs text-ink-400">
                        {a.date
                          ? new Date(a.date).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-medium text-ink-900">
                      {a.subject}
                    </p>
                    {a.suggestedAction && (
                      <p className="mt-1 text-xs leading-relaxed text-ink-600">
                        <span className="font-medium text-brand-700">→</span>{" "}
                        {a.suggestedAction}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </>
  );
}

/* ---------- subcomponents ---------- */

function Bar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium capitalize text-ink-700">{label.toLowerCase()}</span>
        <span className="text-ink-500">
          {value} · {pct}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
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
  value: string;
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

function EmptyState() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 shadow-xs">
          <Icon.Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-ink-900">No data to analyze yet</p>
        <p className="mt-1 max-w-sm text-xs text-ink-500">
          Sync your Gmail from the dashboard or inbox page — once you have messages, this page
          shows real urgency, action-type, and sender patterns derived from AI-classified emails.
        </p>
      </div>
    </Card>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-ink-200 bg-white p-4"
          >
            <div className="h-3 w-20 rounded bg-ink-100 animate-pulse-soft" />
            <div className="mt-3 h-7 w-16 rounded bg-ink-100 animate-pulse-soft" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-ink-200 bg-white p-5 space-y-4"
          >
            <div className="h-3 w-32 rounded bg-ink-100 animate-pulse-soft" />
            {[0, 1, 2].map((j) => (
              <div key={j} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-2.5 w-16 rounded bg-ink-100 animate-pulse-soft" />
                  <div className="h-2.5 w-10 rounded bg-ink-100 animate-pulse-soft" />
                </div>
                <div className="h-2.5 w-full rounded-full bg-ink-100 animate-pulse-soft" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
