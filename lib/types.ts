export type SourceType = "gmail" | "whatsapp" | "slack";

export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  source: SourceType;
}

export type AnalysisCategory = "task" | "lead" | "invoice" | "urgent" | "other";
export type AnalysisPriority = "high" | "medium" | "low";

export interface Analysis {
  emailId: string;
  category: AnalysisCategory;
  summary: string;
  priority: AnalysisPriority;
  suggestedAction: string;
}

export type ActionType = "reply" | "schedule" | "invoice" | "followup";
export type ActionStatus = "pending" | "completed";

export interface Action {
  id: string;
  emailId: string;
  type: ActionType;
  title: string;
  description: string;
  status: ActionStatus;
}

export type IntegrationStatus = "connected" | "disconnected";

export interface Integration {
  id: string;
  name: string;
  status: IntegrationStatus;
  icon: string;
  lastSyncedAt: string;
}
