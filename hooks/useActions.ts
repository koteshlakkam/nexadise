"use client";

import { useCallback, useState } from "react";
import { Action } from "@/lib/types";
import { fetchActions } from "@/services/action.service";

export function useActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchActions();
      setActions(response);
    } catch (serviceError) {
      const message =
        serviceError instanceof Error
          ? serviceError.message
          : "Something went wrong while loading actions.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { actions, isLoading, error, loadActions };
}
