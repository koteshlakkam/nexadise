import { Action } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface ActionCardProps {
  action: Action;
}

const typeMeta: Record<
  Action["type"],
  { tone: "amber" | "blue" | "teal" | "violet" | "slate"; label: string }
> = {
  invoice: { tone: "amber", label: "Invoice" },
  reply: { tone: "blue", label: "Reply" },
  schedule: { tone: "teal", label: "Schedule" },
  followup: { tone: "violet", label: "Follow-up" },
};

export function ActionCard({ action }: ActionCardProps) {
  const meta = typeMeta[action.type] ?? { tone: "slate" as const, label: action.type };
  const completed = action.status === "completed";

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 transition-all duration-200",
        "hover:border-ink-300 hover:shadow-soft",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          completed
            ? "bg-emerald-50 text-emerald-600"
            : "bg-brand-50 text-brand-600",
        )}
      >
        {completed ? (
          <Icon.Check className="h-4 w-4" />
        ) : (
          <Icon.Bolt className="h-4 w-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-sm font-medium text-ink-900",
              completed && "line-through text-ink-500",
            )}
          >
            {action.title}
          </p>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        {action.description ? (
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            {action.description}
          </p>
        ) : null}
      </div>

      <Badge tone={completed ? "emerald" : "amber"} dot>
        {completed ? "Done" : "Pending"}
      </Badge>
    </div>
  );
}
