"use client";

import { useCallback, useState } from "react";
import { Email } from "@/lib/types";
import { fetchEmails } from "@/services/email.service";

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmails = useCallback(async (): Promise<Email[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchEmails();
      setEmails(response);
      return response;
    } catch (serviceError) {
      const message =
        serviceError instanceof Error
          ? serviceError.message
          : "Something went wrong while loading emails.";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { emails, isLoading, error, loadEmails };
}
