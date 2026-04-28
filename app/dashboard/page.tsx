"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { ActionList } from "@/components/features/actions/ActionList";
import { EmailList } from "@/components/features/emails/EmailList";
import { InsightsPanel } from "@/components/features/insights/InsightsPanel";
import { IntegrationList } from "@/components/features/integrations/IntegrationList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useActions } from "@/hooks/useActions";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useEmails } from "@/hooks/useEmails";
import { useIntegrations } from "@/hooks/useIntegrations";

/**
 * Dashboard composition layer:
 * - UI components stay presentational.
 * - Hooks coordinate state + service calls.
 * - Services are the only place that talks to APIs.
 */
export default function DashboardPage() {
  type Task = {
    id: string;
    title: string;
    sourceEmailId: string;
    type: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
    priority: "HIGH" | "MEDIUM" | "LOW";
    status: "PENDING" | "DONE";
  };

  const decodeHtml = (text: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  };

  const createTaskFromEmail = (email: {
    id: string;
    subject: string;
    summary?: string;
    snippet: string;
    action: "ACTION_REQUIRED" | "INFO";
    actionType: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
  }): Task | null => {
    if (email.action !== "ACTION_REQUIRED") return null;

    const text = (email.summary ?? "").toLowerCase();

    return {
      id: email.id,
      title: email.subject,
      sourceEmailId: email.id,
      type: email.actionType,
      priority: text.includes("urgent") ? "HIGH" : text.includes("meeting") ? "HIGH" : "LOW",
      status: "PENDING",
    };
  };

  const actionTone = (action: "ACTION_REQUIRED" | "INFO") => (action === "ACTION_REQUIRED" ? "red" : "slate");

  const actionTypeTone = (type: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null | undefined) => {
    if (type === "REPLY") return "blue";
    if (type === "REVIEW") return "violet";
    if (type === "APPROVAL") return "amber";
    if (type === "MEETING") return "teal";
    return "slate";
  };

  const urgencyTone = (u: "LOW" | "MEDIUM" | "HIGH" | undefined) => {
    if (u === "HIGH") return "red";
    if (u === "MEDIUM") return "amber";
    return "emerald";
  };

  const { data: session, status } = useSession();
  const { emails, isLoading: emailsLoading, error: emailsError, loadEmails } = useEmails();
  const { actions, isLoading: actionsLoading, error: actionsError, loadActions } = useActions();
  const {
    analysis,
    isLoading: analysisLoading,
    error: analysisError,
    runAnalysis,
  } = useAnalysis();
  const {
    integrations,
    isLoading: integrationsLoading,
    error: integrationsError,
    loadIntegrations,
  } = useIntegrations();

  const [gmailEmails, setGmailEmails] = useState<
    Array<{
      id: string;
      subject: string;
      from: string;
      snippet: string;
      summary?: string;
      date: string;
      action: "ACTION_REQUIRED" | "INFO";
      actionType: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
      urgency?: "LOW" | "MEDIUM" | "HIGH";
    }>
  >([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [showOnlyAction, setShowOnlyAction] = useState(false);
  const hasAutoSyncedGmail = useRef(false);

  const isFetchingData = emailsLoading || actionsLoading;

  const categorizedEmailCount = useMemo(() => {
    return analysis.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [analysis]);

  const loadGmailEmailsFromDb = async () => {
    setGmailError(null);
    setGmailLoading(true);
    try {
      const res = await fetch("/api/emails");
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed to load emails (${res.status})`);
      }

      const data = (await res.json()) as Array<{
        id: string;
        subject: string;
        from: string;
        snippet: string;
        summary?: string;
        date: string;
        action: "ACTION_REQUIRED" | "INFO";
        actionType: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
        urgency?: "LOW" | "MEDIUM" | "HIGH";
      }>;

      const normalized = Array.isArray(data) ? data : [];
      setGmailEmails(normalized);
      setTasks(normalized.map(createTaskFromEmail).filter(Boolean) as Task[]);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as any).message)
          : "Failed to load Gmail emails from database.";
      setGmailError(message);
    } finally {
      setGmailLoading(false);
    }
  };

  const handleFetchEmails = async () => {
    await Promise.all([loadEmails(), loadActions()]);
  };

  const handleAnalyzeInbox = async () => {
    const targetEmails = emails.length ? emails : await loadEmails();
    await runAnalysis(targetEmails);
  };

  const handleSyncGmail = async () => {
    setGmailError(null);

    const accessToken = session?.accessToken;
    if (!accessToken) {
      setGmailError("Missing Google access token. Please sign in again and grant Gmail access.");
      return;
    }

    setGmailLoading(true);
    try {
      const res = await fetch("/api/gmail/sync", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
      }

      await res.json().catch(() => null);
      await loadGmailEmailsFromDb();
    } catch (err) {
      setGmailError(err instanceof Error ? err.message : "Failed to sync Gmail.");
    } finally {
      setGmailLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      void loadGmailEmailsFromDb();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken) return;
    if (hasAutoSyncedGmail.current) return;
    hasAutoSyncedGmail.current = true;

    const run = async () => {
      setGmailError(null);
      setGmailLoading(true);
      try {
        const res = await fetch("/api/gmail/sync", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        await res.json().catch(() => null);
      } catch (err) {
        setGmailError(err instanceof Error ? err.message : "Failed to sync Gmail.");
      } finally {
        setGmailLoading(false);
        await loadGmailEmailsFromDb();
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const filteredGmailEmails = useMemo(() => {
    if (!showOnlyAction) return gmailEmails;
    return gmailEmails.filter((email) => email.action === "ACTION_REQUIRED");
  }, [gmailEmails, showOnlyAction]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Nexadise Dashboard</h1>
            <p className="text-sm text-slate-600">What should I do today</p>
          </div>
          <div className="text-left sm:text-right">
            {status === "authenticated" ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-700">{session.user?.email}</p>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google")}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Login with Google
              </button>
            )}
          </div>
        </header>

        <Card>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleFetchEmails} isLoading={isFetchingData}>
              Fetch Emails
            </Button>
            <Button onClick={handleSyncGmail} isLoading={gmailLoading}>
              Sync Gmail
            </Button>
            <Button onClick={handleAnalyzeInbox} isLoading={analysisLoading}>
              Analyze Inbox
            </Button>
            <Button onClick={loadIntegrations} isLoading={integrationsLoading}>
              Sync Integrations
            </Button>
          </div>
        </Card>

        {(emailsError || actionsError || analysisError || integrationsError || gmailError) && (
          <Card>
            <p className="text-sm text-rose-700">
              {emailsError || actionsError || analysisError || integrationsError || gmailError}
            </p>
          </Card>
        )}

        <Card title="Today’s Tasks">
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks yet. Sync Gmail to generate tasks.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {task.title || "(Untitled task)"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {task.type ?? "UNKNOWN"}
                      </span>
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          task.priority === "HIGH"
                            ? "bg-rose-100 text-rose-700"
                            : task.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700",
                        ].join(" ")}
                      >
                        {task.priority}
                      </span>
                      <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Gmail (latest)">
          {gmailLoading ? (
            <p className="text-sm text-slate-500">Loading Gmail emails...</p>
          ) : gmailEmails.length === 0 ? (
            <p className="text-sm text-slate-500">
              No Gmail emails yet. Click &quot;Sync Gmail&quot; to fetch the latest messages.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnlyAction(false)}
                  className={[
                    "rounded-full px-3 py-1 text-sm font-medium transition",
                    showOnlyAction
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-slate-900 text-white hover:bg-slate-700",
                  ].join(" ")}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setShowOnlyAction(true)}
                  className={[
                    "rounded-full px-3 py-1 text-sm font-medium transition",
                    showOnlyAction
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-100",
                  ].join(" ")}
                >
                  Action Required
                </button>
              </div>

              {filteredGmailEmails.length === 0 ? (
                <p className="text-sm text-slate-500">No action required emails found.</p>
              ) : null}

              {filteredGmailEmails.map((email) => (
                <div
                  key={email.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={actionTone(email.action)}>
                          {email.action === "ACTION_REQUIRED" ? "Action Required" : "Info"}
                        </Badge>
                        {email.actionType ? (
                          <Badge tone={actionTypeTone(email.actionType)}>{email.actionType}</Badge>
                        ) : null}
                        {email.urgency ? (
                          <Badge tone={urgencyTone(email.urgency)}>{email.urgency}</Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {email.subject || "(No subject)"}
                      </p>
                      <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          AI Insight
                        </p>
                        <p
                          className="mt-1 text-sm text-slate-700"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {email.summary ? decodeHtml(email.summary) : ""}
                        </p>
                      </div>
                      <p
                        className={[
                          "text-xs",
                          email.summary ? "text-green-600" : "text-amber-600",
                        ].join(" ")}
                      >
                        AI: {email.summary ? "ACTIVE" : "MISSING"}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-800">
                          Original Email
                        </summary>
                        <p className="mt-2 text-sm text-slate-600">
                          {email.snippet ? decodeHtml(email.snippet) : ""}
                        </p>
                      </details>
                      <p className="truncate text-sm text-slate-600">{email.from || "(Unknown)"}</p>
                    </div>
                    <p className="text-xs text-slate-500">{email.date || ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <section className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Card title="What you should do today">
              <ActionList actions={actions} isLoading={actionsLoading} />
            </Card>

            <Card title="Inbox (categorized)">
              <EmailList emails={emails} analysis={analysis} isLoading={emailsLoading} />
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <InsightsPanel analysis={analysis} isLoading={analysisLoading} />

            <Card title="Category Count">
              {Object.keys(categorizedEmailCount).length === 0 ? (
                <p className="text-sm text-slate-500">No categories yet. Analyze inbox first.</p>
              ) : (
                <div className="space-y-2 text-sm text-slate-700">
                  {Object.entries(categorizedEmailCount).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize">{category}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Connected Apps">
              <IntegrationList integrations={integrations} isLoading={integrationsLoading} />
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
