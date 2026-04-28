import { EMAIL_SOURCE_LABELS } from "@/lib/constants";
import { Analysis, Email } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface EmailCardProps {
  email: Email;
  analysis?: Analysis;
}

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
    analysis?.priority === "high" ? "red" : analysis?.priority === "medium" ? "amber" : "emerald";

  return (
    <Card className="transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{email.subject}</p>
          <p className="text-xs text-slate-500">From: {email.sender}</p>
        </div>
        <Badge tone="slate">{EMAIL_SOURCE_LABELS[email.source]}</Badge>
      </div>

      <p className="mt-3 text-sm text-slate-700">{email.snippet}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{new Date(email.receivedAt).toLocaleString()}</span>
        {analysis ? (
          <div className="flex items-center gap-2">
            <Badge tone={categoryTone} className="capitalize">
              {analysis.category}
            </Badge>
            <Badge tone={priorityTone} className="uppercase">
              {analysis.priority}
            </Badge>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
