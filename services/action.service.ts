import { MOCK_ACTIONS } from "@/lib/constants";
import { Action } from "@/lib/types";

/**
 * Service layer for action retrieval.
 * Replace with backend endpoint when available.
 */
export async function fetchActions(): Promise<Action[]> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_ACTIONS;
  } catch (error) {
    console.error("Failed to fetch actions", error);
    throw new Error("Unable to fetch actions right now.");
  }
}
