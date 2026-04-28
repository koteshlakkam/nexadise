import { Analysis } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

interface InsightsPanelProps {
  analysis: Analysis[];
  isLoading?: boolean;
}

export function InsightsPanel({ analysis, isLoading = false }: InsightsPanelProps) {
  if (isLoading) {
    return (
      <Card title="Inbox insights" description="Analyzing your messages…">
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-ink-200 bg-surface-muted p-4"
            >
              <div className="h-3 w-20 rounded bg-ink-200 animate-pulse-soft" />
              <div className="mt-3 h-7 w-12 rounded bg-ink-200 animate-pulse-soft" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!analysis.length) {
    return (
      <Card
        title="Inbox insights"
        description="AI summaries and priorities appear here once analysis runs."
      >
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface-muted px-6 py-8 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs">
            <Icon.Sparkles className="h-5 w-5 text-brand-500" />
          </div>
          <p className="text-sm font-medium text-ink-900">No insights yet</p>
          <p className="mt-1 max-w-xs text-xs text-ink-500">
            Run Analyze Inbox to surface priorities, urgencies, and suggested actions.
          </p>
        </div>
      </Card>
    );
  }

  const total = analysis.length;
  const high = analysis.filter((a) => a.priority === "high").length;
  const urgent = analysis.filter((a) => a.category === "urgent").length;
  const invoices = analysis.filter((a) => a.category === "invoice").length;

  const stats = [
    {
      label: "High priority",
      value: high,
      tone: "from-rose-50 to-rose-100/40 border-rose-100 text-rose-700",
      icon: <Icon.AlertTriangle className="h-4 w-4" />,
    },
    {
      label: "Urgent",
      value: urgent,
      tone: "from-amber-50 to-amber-100/40 border-amber-100 text-amber-700",
      icon: <Icon.Bolt className="h-4 w-4" />,
    },
    {
      label: "Invoices",
      value: invoices,
      tone: "from-emerald-50 to-emerald-100/40 border-emerald-100 text-emerald-700",
      icon: <Icon.Mail className="h-4 w-4" />,
    },
  ];

  return (
    <Card
      title="Inbox insights"
      description={`${total} message${total === 1 ? "" : "s"} analyzed`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border bg-gradient-to-br p-4 ${s.tone}`}
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
      </div>
    </Card>
  );
}
