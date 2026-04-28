import { Analysis } from "@/lib/types";
import { Card } from "@/components/ui/Card";

interface InsightsPanelProps {
  analysis: Analysis[];
  isLoading?: boolean;
}

export function InsightsPanel({ analysis, isLoading = false }: InsightsPanelProps) {
  if (isLoading) {
    return <Card title="Inbox Insights">Analyzing inbox...</Card>;
  }

  if (!analysis.length) {
    return (
      <Card title="Inbox Insights">
        <p className="text-sm text-slate-500">Run analysis to see AI summaries and priorities.</p>
      </Card>
    );
  }

  const highPriorityCount = analysis.filter((item) => item.priority === "high").length;
  const urgentCount = analysis.filter((item) => item.category === "urgent").length;
  const invoiceCount = analysis.filter((item) => item.category === "invoice").length;

  return (
    <Card title="Inbox Insights">
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-rose-50 p-3 text-rose-700">
          <p className="text-xs font-medium">High Priority</p>
          <p className="text-xl font-semibold">{highPriorityCount}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 text-amber-700">
          <p className="text-xs font-medium">Urgent</p>
          <p className="text-xl font-semibold">{urgentCount}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
          <p className="text-xs font-medium">Invoices</p>
          <p className="text-xl font-semibold">{invoiceCount}</p>
        </div>
      </div>
    </Card>
  );
}
