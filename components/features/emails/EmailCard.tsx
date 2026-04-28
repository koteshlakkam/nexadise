import { EMAIL_SOURCE_LABELS } from "@/lib/constants";
import { Analysis, Email } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface EmailCardProps {
  email: Email;
  analysis?: Analysis;
}

const sourceIcon = (source: Email["source"]) => {
  if (source === "gmail") return <Icon.Gmail className="h-4 w-4" />;
  if (source === "slack") return <Icon.Slack className="h-4 w-4" />;
  return <Icon.Whatsapp className="h-4 w-4" />;
};

const initials = (name: string) =>
  name
    .replace(/<.*?>/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "?";

const avatarBg = (seed: string) => {
  const palettes = [
    "bg-brand-100 text-brand-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-teal-100 text-teal-700",
  ];
  const idx = Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % palettes.length;
  return palettes[idx];
};

export function EmailCard({ email, analysis }: EmailCardProps) {
  const categoryTone =
    analysis?.category === "urgent"
      ? "red"
      : analysis?.category === "invoice"
        ? "amber"
        : analysis?.category === "lead"
          ? "indigo"
          : analysis?.category === "task"
            ? "emerald"
            : "slate";

  const priorityTone =
    analysis?.priority === "high"
      ? "red"
      : analysis?.priority === "medium"
        ? "amber"
        : "emerald";

  return (
    <article className="group relative flex gap-3 rounded-xl border border-ink-200 bg-white p-4 transition-all duration-200 hover:border-ink-300 hover:shadow-soft">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          avatarBg(email.sender),
        )}
      >
        {initials(email.sender)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-900">{email.sender}</p>
            <p className="mt-0.5 truncate text-sm text-ink-700">{email.subject}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-2xs text-ink-500">
            {sourceIcon(email.source)}
            <span>{EMAIL_SOURCE_LABELS[email.source]}</span>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500">
          {email.snippet}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-2xs text-ink-400">
            {new Date(email.receivedAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          {analysis ? (
            <div className="flex items-center gap-1.5">
              <Badge tone={categoryTone} className="capitalize">
                {analysis.category}
              </Badge>
              <Badge tone={priorityTone} dot>
                {analysis.priority}
              </Badge>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
