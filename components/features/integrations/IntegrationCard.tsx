import { Integration } from "@/lib/types";
import { Card } from "@/components/ui/Card";

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const isConnected = integration.status === "connected";

  return (
    <Card className="transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {integration.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{integration.name}</p>
            <p className="text-xs text-slate-500">
              Last synced: {new Date(integration.lastSyncedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            isConnected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {integration.status}
        </span>
      </div>
    </Card>
  );
}
