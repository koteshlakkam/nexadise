import { Action } from "@/lib/types";
import { ActionCard } from "./ActionCard";
import { Icon } from "@/components/ui/Icon";

interface ActionListProps {
  actions: Action[];
  isLoading?: boolean;
}

export function ActionList({ actions, isLoading = false }: ActionListProps) {
  if (isLoading) {
    return <SkeletonList />;
  }

  if (!actions.length) {
    return (
      <EmptyState
        title="No actions yet"
        description="Click Fetch Emails to get started — Nexadise will surface what needs your attention."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {actions.map((action) => (
        <ActionCard key={action.id} action={action} />
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface-muted px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs">
        <Icon.Sparkles className="h-5 w-5 text-brand-500" />
      </div>
      <p className="text-sm font-medium text-ink-900">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-ink-500">{description}</p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4"
        >
          <div className="h-8 w-8 shrink-0 rounded-lg bg-ink-100 animate-pulse-soft" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-ink-100 animate-pulse-soft" />
            <div className="h-2.5 w-full rounded bg-ink-100/70 animate-pulse-soft" />
          </div>
        </div>
      ))}
    </div>
  );
}
