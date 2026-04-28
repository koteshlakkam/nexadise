import { Analysis, Email } from "@/lib/types";
import { EmailCard } from "./EmailCard";

interface EmailListProps {
  emails: Email[];
  analysis: Analysis[];
  isLoading?: boolean;
}

export function EmailList({ emails, analysis, isLoading = false }: EmailListProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading emails...</p>;
  }

  if (!emails.length) {
    return <p className="text-sm text-slate-500">No emails yet. Click "Fetch Emails".</p>;
  }

  const analysisByEmailId = new Map(analysis.map((item) => [item.emailId, item]));

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <EmailCard key={email.id} email={email} analysis={analysisByEmailId.get(email.id)} />
      ))}
    </div>
  );
}
