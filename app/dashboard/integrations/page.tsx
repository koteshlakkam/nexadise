"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useGmailSync } from "@/hooks/useGmailSync";
import { cn } from "@/lib/cn";

type ComingSoonApp = {
  name: string;
  description: string;
  icon: React.ReactNode;
};

const COMING_SOON: ComingSoonApp[] = [
  {
    name: "Slack",
    description: "Surface DMs and channel mentions as actions.",
    icon: <Icon.Slack className="h-5 w-5" />,
  },
  {
    name: "WhatsApp",
    description: "Pull urgent threads into your daily queue.",
    icon: <Icon.Whatsapp className="h-5 w-5" />,
  },
  {
    name: "Google Calendar",
    description: "Auto-schedule meetings from email threads.",
    icon: <Icon.Mail className="h-5 w-5 text-ink-400" />,
  },
  {
    name: "Notion",
    description: "Push action items into your workspace.",
    icon: <Icon.Mail className="h-5 w-5 text-ink-400" />,
  },
  {
    name: "Linear",
    description: "Convert customer issues into Linear tickets.",
    icon: <Icon.Mail className="h-5 w-5 text-ink-400" />,
  },
  {
    name: "Stripe",
    description: "Approve invoices and refund requests in one click.",
    icon: <Icon.Mail className="h-5 w-5 text-ink-400" />,
  },
];

export default function IntegrationsPage() {
  const { data: session, status } = useSession();
  const {
    sync,
    isSyncing,
    error: syncError,
    needsReauth,
    reauth,
    summary,
    dismissSummary,
  } = useGmailSync();

  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const v = localStorage.getItem("nexadise.gmail.lastSyncAt");
        setLastSyncAt(v);
      }
    } catch {
      /* ignore */
    }
  }, [summary]);

  const sessionError = (session as { error?: string } | null)?.error;
  const gmailConnected =
    status === "authenticated" &&
    Boolean(session?.accessToken) &&
    sessionError !== "RefreshAccessTokenError";

  const gmailStatus: "connected" | "expired" | "disconnected" =
    sessionError === "RefreshAccessTokenError"
      ? "expired"
      : gmailConnected
        ? "connected"
        : "disconnected";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-2xs font-medium uppercase tracking-wide text-ink-500">
          Integrations
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tighter2 text-ink-900 sm:text-3xl">
          Connected apps
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Gmail is the only live integration today — more sources are on the way.
        </p>
      </header>

      {summary && !syncError && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Icon.CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <p className="flex-1 text-sm text-emerald-900">
            Synced {summary.new} new
            {summary.skipped > 0 ? `, skipped ${summary.skipped}` : ""}
            {summary.failed > 0 ? `, ${summary.failed} failed` : ""} ·{" "}
            {(summary.durationMs / 1000).toFixed(1)}s
          </p>
          <button
            type="button"
            onClick={dismissSummary}
            className="text-2xs font-medium text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {syncError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <Icon.AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-rose-800">{syncError}</p>
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

      {/* LIVE INTEGRATIONS */}
      <Card title="Live" description="Working integrations">
        <div className="flex items-start justify-between gap-3 rounded-xl border border-ink-200 bg-white p-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-surface-muted">
              <Icon.Gmail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink-900">Gmail</p>
                <StatusPill status={gmailStatus} />
              </div>
              <p className="mt-0.5 text-xs text-ink-600">
                {session?.user?.email
                  ? `Signed in as ${session.user.email}`
                  : "OAuth via Google · gmail.readonly scope"}
              </p>
              {lastSyncAt ? (
                <p className="mt-1 text-2xs text-ink-500">
                  Last sync · {new Date(lastSyncAt).toLocaleString()}
                </p>
              ) : (
                <p className="mt-1 text-2xs text-ink-500">
                  Never synced this session
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {gmailStatus === "connected" ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => sync({ limit: 50, query: "in:inbox" })}
                isLoading={isSyncing}
                leadingIcon={<Icon.Mail className="h-3.5 w-3.5" />}
              >
                Sync now
              </Button>
            ) : gmailStatus === "expired" ? (
              <Button
                size="sm"
                variant="primary"
                onClick={reauth}
                leadingIcon={<Icon.Google className="h-3.5 w-3.5" />}
              >
                Reconnect
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={reauth}
                leadingIcon={<Icon.Google className="h-3.5 w-3.5" />}
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* COMING SOON */}
      <Card
        title="Coming soon"
        description="Planned integrations — not connected yet"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {COMING_SOON.map((app) => (
            <div
              key={app.name}
              className="relative flex items-start gap-3 overflow-hidden rounded-xl border border-dashed border-ink-200 bg-surface-muted/40 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white opacity-70">
                {app.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink-700">{app.name}</p>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-2xs font-medium text-ink-600">
                    Coming soon
                  </span>
                </div>
                <p className="mt-0.5 text-2xs leading-relaxed text-ink-500">
                  {app.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatusPill({ status }: { status: "connected" | "expired" | "disconnected" }) {
  const cfg =
    status === "connected"
      ? {
          label: "Connected",
          dot: "bg-emerald-500 animate-pulse-soft",
          chip: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
        }
      : status === "expired"
        ? {
            label: "Session expired",
            dot: "bg-amber-500",
            chip: "bg-amber-50 text-amber-800 ring-amber-200/70",
          }
        : {
            label: "Disconnected",
            dot: "bg-ink-400",
            chip: "bg-ink-100 text-ink-600 ring-ink-200",
          };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-medium ring-1 ring-inset",
        cfg.chip,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
