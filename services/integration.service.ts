import { MOCK_INTEGRATIONS } from "@/lib/constants";
import { Integration } from "@/lib/types";

/**
 * Service layer for app integration status and sync.
 * Designed to support many external sources over time.
 */
export async function fetchIntegrations(): Promise<Integration[]> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return MOCK_INTEGRATIONS;
  } catch (error) {
    console.error("Failed to fetch integrations", error);
    throw new Error("Unable to fetch integrations right now.");
  }
}
