import { Integration } from "@/lib/types";
import { IntegrationCard } from "./IntegrationCard";

interface IntegrationListProps {
  integrations: Integration[];
  isLoading?: boolean;
}

export function IntegrationList({ integrations, isLoading = false }: IntegrationListProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Syncing integrations...</p>;
  }

  if (!integrations.length) {
    return <p className="text-sm text-slate-500">No integrations found. Click "Sync Integrations".</p>;
  }

  return (
    <div className="space-y-3">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.id} integration={integration} />
      ))}
    </div>
  );
}
