"use client";

import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import type { GmailMessage } from "@/hooks/useGmailMessages";

const decodeHtml = (text: string) => {
  if (typeof document === "undefined") return text;
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
};

const ACTION_TYPE_TONES: Record<string, "blue" | "violet" | "amber" | "teal" | "slate"> = {
  REPLY: "blue",
  REVIEW: "violet",
  APPROVAL: "amber",
  MEETING: "teal",
};

const URGENCY_TONES: Record<string, "red" | "amber" | "emerald"> = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "emerald",
};

export function GmailRow({ email }: { email: GmailMessage }) {
  const actionTone = email.action === "ACTION_REQUIRED" ? "red" : "slate";
  const typeTone = email.actionType ? ACTION_TYPE_TONES[email.actionType] ?? "slate" : "slate";
  const urgencyTone = email.urgency ? URGENCY_TONES[email.urgency] ?? "slate" : "slate";

  const dateLabel = email.date
    ? new Date(email.date).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <article className="group rounded-xl border border-ink-200 bg-white p-4 transition-all duration-200 hover:border-ink-300 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={actionTone} dot>
              {email.action === "ACTION_REQUIRED" ? "Action" : "Info"}
            </Badge>
            {email.actionType ? <Badge tone={typeTone}>{email.actionType}</Badge> : null}
            {email.urgency ? <Badge tone={urgencyTone}>{email.urgency}</Badge> : null}
          </div>

          <p className="mt-2 truncate text-sm font-medium text-ink-900">
            {email.subject || "(No subject)"}
          </p>
          <p className="mt-0.5 truncate text-2xs text-ink-500">
            {email.from || "(Unknown sender)"}
          </p>

          {email.summary ? (
            <div
              className={
                email.aiSource === "fallback"
                  ? "mt-3 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50/70 to-amber-50/30 p-3"
                  : "mt-3 rounded-lg border border-brand-100 bg-gradient-to-br from-brand-50/60 to-violet-50/40 p-3"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon.Sparkles
                    className={
                      email.aiSource === "fallback"
                        ? "h-3 w-3 text-amber-600"
                        : "h-3 w-3 text-brand-600"
                    }
                  />
                  <p
                    className={
                      email.aiSource === "fallback"
                        ? "text-2xs font-semibold uppercase tracking-wide text-amber-700"
                        : "text-2xs font-semibold uppercase tracking-wide text-brand-700"
                    }
                  >
                    Nexa Insight
                    {/* {email.aiSource === "openrouter"
                      ? "OpenRouter"
                      : email.aiSource === "gemini"
                        ? "Gemini"
                        : email.aiSource === "fallback"
                          ? "Fallback (AI unreachable)"
                          : email.aiSource === "cached"
                            ? "Cached"
                            : "AI"} */}
                  </p>
                </div>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-800">
                {decodeHtml(email.summary)}
              </p>
              {email.suggestedAction ? (
                <div
                  className={
                    email.aiSource === "fallback"
                      ? "mt-2.5 flex items-start gap-2 rounded-md border border-amber-200/70 bg-white/70 px-2.5 py-1.5"
                      : "mt-2.5 flex items-start gap-2 rounded-md border border-brand-100/70 bg-white/70 px-2.5 py-1.5"
                  }
                >
                  <Icon.Bolt
                    className={
                      email.aiSource === "fallback"
                        ? "mt-0.5 h-3 w-3 shrink-0 text-amber-600"
                        : "mt-0.5 h-3 w-3 shrink-0 text-brand-600"
                    }
                  />
                  <div className="min-w-0">
                    <p
                      className={
                        email.aiSource === "fallback"
                          ? "text-[10px] font-semibold uppercase tracking-wide text-amber-700"
                          : "text-[10px] font-semibold uppercase tracking-wide text-brand-700"
                      }
                    >
                      Suggested action
                    </p>
                    <p className="mt-0.5 text-xs text-ink-700">
                      {decodeHtml(email.suggestedAction)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 inline-flex items-center gap-1.5 text-2xs text-amber-700">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-amber-500" />
              Gemini is analyzing this message…
            </p>
          )}

          <details className="group/details mt-2.5">
            <summary className="cursor-pointer list-none text-2xs font-medium text-ink-600 hover:text-ink-900">
              <span className="inline-flex items-center gap-1">
                <span className="transition group-open/details:rotate-90">›</span>
                Original message
              </span>
            </summary>
            <p className="mt-2 rounded-md border border-ink-100 bg-ink-50/40 p-2.5 text-xs leading-relaxed text-ink-600">
              {email.snippet ? decodeHtml(email.snippet) : "(empty)"}
            </p>
          </details>
        </div>
        <span className="shrink-0 text-2xs text-ink-400">{dateLabel}</span>
      </div>
    </article>
  );
}
