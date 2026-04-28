import { Action } from "@/lib/types";
import { ActionCard } from "./ActionCard";

interface ActionListProps {
  actions: Action[];
  isLoading?: boolean;
}

export function ActionList({ actions, isLoading = false }: ActionListProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading actions...</p>;
  }

  if (!actions.length) {
    return <p className="text-sm text-slate-500">No actions yet. Click "Fetch Emails" first.</p>;
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <ActionCard key={action.id} action={action} />
      ))}
    </div>
  );
}
