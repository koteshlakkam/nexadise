import { Analysis, Email } from "@/lib/types";
import { EmailCard } from "./EmailCard";
import { Icon } from "@/components/ui/Icon";

interface EmailListProps {
  emails: Email[];
  analysis: Analysis[];
  isLoading?: boolean;
}

export function EmailList({ emails, analysis, isLoading = false }: EmailListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl border border-ink-200 bg-white p-4"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-ink-100 animate-pulse-soft" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-ink-100 animate-pulse-soft" />
              <div className="h-3 w-2/3 rounded bg-ink-100/70 animate-pulse-soft" />
              <div className="h-2.5 w-full rounded bg-ink-100/60 animate-pulse-soft" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface-muted px-6 py-10 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs">
          <Icon.Inbox className="h-5 w-5 text-ink-400" />
        </div>
        <p className="text-sm font-medium text-ink-900">Inbox is empty</p>
        <p className="mt-1 max-w-xs text-xs text-ink-500">
          Click Fetch Emails to load your latest messages.
        </p>
      </div>
    );
  }

  const analysisByEmailId = new Map(analysis.map((item) => [item.emailId, item]));

  return (
    <div className="space-y-2.5">
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          analysis={analysisByEmailId.get(email.id)}
        />
      ))}
    </div>
  );
}
