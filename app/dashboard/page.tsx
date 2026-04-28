"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { GmailRow } from "@/components/features/gmail/GmailRow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useGmailMessages } from "@/hooks/useGmailMessages";
import { useGmailSync } from "@/hooks/useGmailSync";
import { useInsights } from "@/hooks/useInsights";

const TODAY_PAGE_SIZE = 8;

type Task = {
  id: string;
  title: string;
  type: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const {
    items: gmailEmails,
    total: gmailTotal,
    isLoading: gmailLoading,
    error: gmailFetchError,
    reload: reloadGmail,
  } = useGmailMessages({}, TODAY_PAGE_SIZE);

  const { data: insights, reload: reloadInsights } = useInsights({ limit: 2000 });

  const {
    sync: syncGmail,
    isSyncing: gmailSyncing,
    error: gmailSyncError,
    needsReauth: gmailNeedsReauth,
    reauth: gmailReauth,
    summary: gmailSyncSummary,
    dismissSummary,
  } = useGmailSync(async () => {
    await Promise.all([reloadGmail(), reloadInsights()]);
  });
  const hasAutoSyncedGmail = useRef(false);

  const tasks: Task[] = useMemo(() => {
    return gmailEmails
      .filter((e) => e.action === "ACTION_REQUIRED")
      .map((e) => ({
        id: e.id,
        title: e.subject,
        type: e.actionType,
        priority: (e.urgency === "HIGH"
          ? "HIGH"
          : e.urgency === "MEDIUM"
            ? "MEDIUM"
            : "LOW") as Task["priority"],
      }));
  }, [gmailEmails]);

  const handleSyncGmail = async () => {
    try {
      await syncGmail({ limit: 50, query: "in:inbox" });
    } catch {
      /* surfaced via gmailSyncError */
    }
  };

  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken) return;
    if (hasAutoSyncedGmail.current) return;
    hasAutoSyncedGmail.current = true;
    void syncGmail({ limit: 50, query: "in:inbox" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const stats = useMemo(() => {
    const total = insights?.total ?? gmailTotal ?? gmailEmails.length;
    const actionRequired = insights?.actionRequired ?? tasks.length;
    const high = insights?.high ?? gmailEmails.filter((e) => e.urgency === "HIGH").length;
    const info = insights?.byAction.INFO ?? gmailEmails.filter((e) => e.action === "INFO").length;
    return [
      {
        label: "Total messages",
        value: total,
        icon: <Icon.Inbox className="h-4 w-4" />,
        tone: "from-brand-50 to-violet-50 border-brand-100 text-brand-700",
      },
      {
        label: "Need action",
        value: actionRequired,
        icon: <Icon.Bolt className="h-4 w-4" />,
        tone: "from-rose-50 to-rose-100/40 border-rose-100 text-rose-700",
      },
      {
        label: "High urgency",
        value: high,
        icon: <Icon.AlertTriangle className="h-4 w-4" />,
        tone: "from-amber-50 to-amber-100/40 border-amber-100 text-amber-700",
      },
      {
        label: "Info / FYI",
        value: info,
        icon: <Icon.CheckCircle className="h-4 w-4" />,
        tone: "from-emerald-50 to-emerald-100/40 border-emerald-100 text-emerald-700",
      },
    ];
  }, [insights, gmailTotal, gmailEmails, tasks.length]);

  const errorMessage = gmailSyncError || gmailFetchError;

  return (
    <div className="space-y-6">
      {/* Greeting + sync */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-wide text-ink-500">
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tighter2 text-ink-900 sm:text-3xl">
            Good {greeting()}
            {session?.user?.name ? `, ${firstName(session.user.name)}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Here&apos;s what needs your attention today.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSyncGmail}
          isLoading={gmailSyncing}
          leadingIcon={<Icon.Mail className="h-3.5 w-3.5" />}
        >
          Sync Gmail
        </Button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border bg-gradient-to-br p-4 ${s.tone}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xs font-medium uppercase tracking-wide opacity-80">
                {s.label}
              </span>
              <span className="opacity-70">{s.icon}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tighter2">{s.value}</p>
          </div>
        ))}
      </section>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <Icon.AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-rose-800">{errorMessage}</p>
            {gmailNeedsReauth && (
              <button
                type="button"
                onClick={gmailReauth}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-2.5 py-1 text-2xs font-medium text-white hover:bg-rose-700"
              >
                <Icon.Google className="h-3 w-3" />
                Sign in with Google again
              </button>
            )}
          </div>
        </div>
      )}

      {gmailSyncSummary && !errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Icon.CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-emerald-900">
              Synced {gmailSyncSummary.new} new
              {gmailSyncSummary.skipped > 0
                ? `, skipped ${gmailSyncSummary.skipped} already-synced`
                : ""}
              {gmailSyncSummary.failed > 0
                ? `, ${gmailSyncSummary.failed} failed`
                : ""}{" "}
              · {(gmailSyncSummary.durationMs / 1000).toFixed(1)}s
            </p>
            {gmailSyncSummary.failures && gmailSyncSummary.failures.length > 0 && (
              <p className="mt-0.5 text-2xs text-emerald-900/70">
                First failure: {gmailSyncSummary.failures[0].error}
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

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card
            title="Today's tasks"
            description="Action-required messages, ranked by priority."
            action={
              <Badge tone="brand" dot>
                {insights?.actionRequired ?? tasks.length} active
              </Badge>
            }
          >
            {tasks.length === 0 ? (
              <EmptyState
                icon={<Icon.CheckCircle className="h-5 w-5 text-emerald-500" />}
                title="You're all caught up"
                body="Sync Gmail to surface tasks that need your attention."
              />
            ) : (
              <div className="space-y-2.5">
                {tasks.slice(0, 5).map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
                <Link
                  href="/dashboard/actions"
                  className="block text-center text-2xs font-medium text-brand-600 hover:text-brand-700 pt-1"
                >
                  View all actions →
                </Link>
              </div>
            )}
          </Card>

          <Card
            title="Latest from Gmail"
            description={`Showing the most recent ${gmailEmails.length} message${gmailEmails.length === 1 ? "" : "s"}.`}
            action={
              <Link
                href="/dashboard/inbox"
                className="inline-flex items-center gap-1 text-2xs font-medium text-brand-600 hover:text-brand-700"
              >
                Open inbox <Icon.ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            {gmailLoading ? (
              <p className="text-sm text-ink-500">Loading Gmail messages…</p>
            ) : gmailEmails.length === 0 ? (
              <EmptyState
                icon={<Icon.Mail className="h-5 w-5 text-ink-400" />}
                title="No messages yet"
                body='Click "Sync Gmail" to fetch the latest messages.'
              />
            ) : (
              <div className="space-y-2.5">
                {gmailEmails.map((email) => (
                  <GmailRow key={email.id} email={email} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT RAIL */}
        <div className="space-y-6 lg:col-span-4">
          <Card
            title="Insights snapshot"
            description="Across your synced messages"
            action={
              <Link
                href="/dashboard/insights"
                className="text-2xs font-medium text-brand-600 hover:text-brand-700 transition"
              >
                Open insights
              </Link>
            }
          >
            {!insights || insights.total === 0 ? (
              <p className="text-sm text-ink-500">
                Sync Gmail to start seeing patterns here.
              </p>
            ) : (
              <div className="space-y-3">
                <MiniBar
                  label="High urgency"
                  value={insights.byUrgency.HIGH}
                  total={Math.max(insights.total, 1)}
                  tone="from-rose-500 to-rose-400"
                />
                <MiniBar
                  label="Medium"
                  value={insights.byUrgency.MEDIUM}
                  total={Math.max(insights.total, 1)}
                  tone="from-amber-500 to-amber-400"
                />
                <MiniBar
                  label="Low"
                  value={insights.byUrgency.LOW}
                  total={Math.max(insights.total, 1)}
                  tone="from-emerald-500 to-emerald-400"
                />
              </div>
            )}
          </Card>

          <Card
            title="Connected apps"
            description="Live integrations"
            action={
              <Link
                href="/dashboard/integrations"
                className="text-2xs font-medium text-brand-600 hover:text-brand-700 transition"
              >
                Manage
              </Link>
            }
          >
            <div className="space-y-2.5">
              <ConnectedRow
                icon={<Icon.Gmail className="h-5 w-5" />}
                name="Gmail"
                connected={
                  status === "authenticated" && Boolean(session?.accessToken)
                }
                hint={
                  session?.user?.email ? `Signed in as ${session.user.email}` : ""
                }
              />
              <p className="px-1 pt-2 text-2xs text-ink-500">
                More integrations coming soon — Slack, WhatsApp, Calendar, Notion, Linear,
                Stripe.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {status !== "authenticated" && (
        <div className="rounded-xl border border-ink-200 bg-white p-4 text-center text-sm text-ink-600">
          Sign in to sync your Gmail and unlock AI insights.
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function firstName(name: string) {
  return name.split(" ")[0] ?? "";
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface-muted px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs">
        {icon}
      </div>
      <p className="text-sm font-medium text-ink-900">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-ink-500">{body}</p>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const typeTone =
    task.type === "REPLY"
      ? "blue"
      : task.type === "REVIEW"
        ? "violet"
        : task.type === "APPROVAL"
          ? "amber"
          : task.type === "MEETING"
            ? "teal"
            : "slate";
  const priorityTone =
    task.priority === "HIGH" ? "red" : task.priority === "MEDIUM" ? "amber" : "emerald";

  return (
    <Link
      href="/dashboard/actions"
      className="group flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-3.5 transition-all duration-200 hover:border-ink-300 hover:shadow-soft"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon.Bolt className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">
          {task.title || "(Untitled task)"}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone={typeTone}>{task.type ?? "TASK"}</Badge>
          <Badge tone={priorityTone} dot>
            {task.priority}
          </Badge>
        </div>
      </div>
      <span
        className={cn(
          "invisible flex h-8 items-center gap-1 rounded-md px-2 text-2xs font-medium text-ink-600 group-hover:visible",
        )}
      >
        Open <Icon.ArrowUpRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

function MiniBar({
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
      <div className="mb-1 flex items-center justify-between text-2xs">
        <span className="font-medium text-ink-700">{label}</span>
        <span className="text-ink-500">
          {value} · {pct}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ConnectedRow({
  icon,
  name,
  connected,
  hint,
}: {
  icon: React.ReactNode;
  name: string;
  connected: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-surface-muted">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-900">{name}</p>
          {hint ? <p className="truncate text-2xs text-ink-500">{hint}</p> : null}
        </div>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-medium ring-1 ring-inset",
          connected
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
            : "bg-ink-100 text-ink-600 ring-ink-200",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            connected ? "bg-emerald-500 animate-pulse-soft" : "bg-ink-400",
          )}
        />
        {connected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}
