"use client";

import { useCallback, useState } from "react";
import { Analysis, Email } from "@/lib/types";
import { analyzeEmails } from "@/services/analysis.service";

export function useAnalysis() {
  const [analysis, setAnalysis] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (emails: Email[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeEmails(emails);
      setAnalysis(response);
    } catch (serviceError) {
      const message =
        serviceError instanceof Error
          ? serviceError.message
          : "Something went wrong while analyzing inbox.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analysis, isLoading, error, runAnalysis };
}
