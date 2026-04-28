import { Analysis, Email } from "@/lib/types";

/**
 * Service layer for AI inbox analysis.
 * This currently uses deterministic rules and can be replaced by an AI API.
 */
export async function analyzeEmails(emails: Email[]): Promise<Analysis[]> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 700));

    return emails.map((email) => {
      const content = `${email.subject} ${email.snippet}`.toLowerCase();

      if (content.includes("invoice")) {
        return {
          emailId: email.id,
          category: "invoice",
          summary: "Payment-related message detected.",
          priority: "high",
          suggestedAction: "Review and process invoice.",
        } satisfies Analysis;
      }

      if (content.includes("urgent") || content.includes("immediate")) {
        return {
          emailId: email.id,
          category: "urgent",
          summary: "Time-sensitive request detected.",
          priority: "high",
          suggestedAction: "Reply immediately with next steps.",
        } satisfies Analysis;
      }

      if (content.includes("schedule") || content.includes("call")) {
        return {
          emailId: email.id,
          category: "lead",
          summary: "Potential opportunity or follow-up detected.",
          priority: "medium",
          suggestedAction: "Schedule a follow-up call.",
        } satisfies Analysis;
      }

      return {
        emailId: email.id,
        category: "task",
        summary: "General actionable message.",
        priority: "low",
        suggestedAction: "Add to task queue.",
      } satisfies Analysis;
    });
  } catch (error) {
    console.error("Failed to analyze emails", error);
    throw new Error("Unable to analyze inbox right now.");
  }
}
