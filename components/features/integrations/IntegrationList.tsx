import { Integration } from "@/lib/types";
import { IntegrationCard } from "./IntegrationCard";
import { Icon } from "@/components/ui/Icon";

interface IntegrationListProps {
  integrations: Integration[];
  isLoading?: boolean;
}

export function IntegrationList({ integrations, isLoading = false }: IntegrationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-ink-100 animate-pulse-soft" />
              <div className="space-y-1.5">
                <div className="h-3 w-20 rounded bg-ink-100 animate-pulse-soft" />
                <div className="h-2.5 w-28 rounded bg-ink-100/70 animate-pulse-soft" />
              </div>
            </div>
            <div className="h-5 w-20 rounded-full bg-ink-100 animate-pulse-soft" />
          </div>
        ))}
      </div>
    );
  }

  if (!integrations.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface-muted px-6 py-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs">
          <Icon.Settings className="h-5 w-5 text-ink-400" />
        </div>
        <p className="text-sm font-medium text-ink-900">No integrations</p>
        <p className="mt-1 max-w-xs text-xs text-ink-500">
          Click Sync Integrations to connect your tools.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.id} integration={integration} />
      ))}
    </div>
  );
}
