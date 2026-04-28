"use client";

import { useCallback, useState } from "react";
import { Integration } from "@/lib/types";
import { fetchIntegrations } from "@/services/integration.service";

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIntegrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchIntegrations();
      setIntegrations(response);
    } catch (serviceError) {
      const message =
        serviceError instanceof Error
          ? serviceError.message
          : "Something went wrong while syncing integrations.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { integrations, isLoading, error, loadIntegrations };
}
