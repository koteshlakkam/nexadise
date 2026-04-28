import { Integration } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface IntegrationCardProps {
  integration: Integration;
}

const renderIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("gmail")) return <Icon.Gmail className="h-5 w-5" />;
  if (n.includes("slack")) return <Icon.Slack className="h-5 w-5" />;
  if (n.includes("whatsapp")) return <Icon.Whatsapp className="h-5 w-5" />;
  return <Icon.Mail className="h-5 w-5 text-ink-500" />;
};

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const isConnected = integration.status === "connected";

  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3.5 transition-all duration-200 hover:border-ink-300 hover:shadow-soft">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-surface-muted">
          {renderIcon(integration.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-900">{integration.name}</p>
          <p className="mt-0.5 truncate text-2xs text-ink-500">
            Synced {new Date(integration.lastSyncedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-medium ring-1 ring-inset",
          isConnected
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
            : "bg-ink-100 text-ink-600 ring-ink-200",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isConnected ? "bg-emerald-500 animate-pulse-soft" : "bg-ink-400",
          )}
        />
        {isConnected ? "Connected" : "Disconnected"}
      </div>
    </div>
  );
}
