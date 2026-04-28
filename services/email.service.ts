import { MOCK_EMAILS } from "@/lib/constants";
import { Email } from "@/lib/types";

/**
 * Service layer for email fetching.
 * Replace mocked data with real API integration later.
 */
export async function fetchEmails(): Promise<Email[]> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_EMAILS;
  } catch (error) {
    console.error("Failed to fetch emails", error);
    throw new Error("Unable to fetch emails right now.");
  }
}
