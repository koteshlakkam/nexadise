import { Action } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ActionCardProps {
  action: Action;
}

export function ActionCard({ action }: ActionCardProps) {
  const tone =
    action.type === "invoice"
      ? "amber"
      : action.type === "reply"
        ? "blue"
        : action.type === "schedule"
          ? "teal"
          : action.type === "followup"
            ? "violet"
            : "slate";

  const statusTone = action.status === "completed" ? "emerald" : "amber";

  return (
    <Card className="transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{action.title}</p>
          <p className="text-xs text-slate-500">{action.description}</p>
        </div>
        <Badge tone={tone} className="capitalize">
          {action.type}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>Status</span>
        <Badge tone={statusTone} className="uppercase">
          {action.status}
        </Badge>
      </div>
    </Card>
  );
}
