"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export type SyncSummary = {
	ok: boolean;
	query: string;
	user?: string;
	fetched: number;
	new: number;
	skipped: number;
	failed: number;
	durationMs: number;
	nextPageToken?: string | null;
	items?: Array<{ id: string; subject: string }>;
	failures?: Array<{ id: string; error: string }>;
};

type SyncOptions = {
	/** Max messages to scan from Gmail. Server clamps to 1-100. */
	limit?: number;
	/** Gmail "q" filter, e.g. "in:inbox newer_than:7d". */
	query?: string;
	/** Re-process even if we've seen the message before. */
	force?: boolean;
};

type ParsedError = { message: string; code?: string };

async function readError(res: Response): Promise<ParsedError> {
	const text = await res.text().catch(() => "");
	if (!text) return { message: `Request failed (${res.status})` };
	try {
		const parsed = JSON.parse(text);
		if (parsed && typeof parsed === "object") {
			const message =
				"error" in parsed
					? String((parsed as { error: unknown }).error)
					: text;
			const code =
				"code" in parsed &&
				typeof (parsed as { code: unknown }).code === "string"
					? String((parsed as { code: unknown }).code)
					: undefined;
			return { message, code };
		}
	} catch {
		/* not JSON */
	}
	return { message: text };
}

export function useGmailSync(
	onAfterSync?: (summary: SyncSummary) => void | Promise<void>,
) {
	const { data: session } = useSession();
	const [isSyncing, setIsSyncing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [needsReauth, setNeedsReauth] = useState(false);
	const [summary, setSummary] = useState<SyncSummary | null>(null);

	// If NextAuth couldn't refresh the access token, mark the session unhealthy.
	useEffect(() => {
		if (
			(session as { error?: string } | null)?.error ===
			"RefreshAccessTokenError"
		) {
			setNeedsReauth(true);
			setError(
				"Your Google session expired and we couldn't refresh it. Sign in again to keep syncing.",
			);
		}
	}, [session]);

	const reauth = useCallback(() => {
		setError(null);
		setNeedsReauth(false);
		void signIn("google", { prompt: "consent", callbackUrl: "/dashboard" });
	}, []);

	const sync = useCallback(
		async (opts: SyncOptions = {}) => {
			setError(null);
			setIsSyncing(true);
			try {
				const accessToken = session?.accessToken;
				if (!accessToken) {
					throw new Error(
						"Missing Google access token. Please sign in again and grant Gmail access.",
					);
				}

				const params = new URLSearchParams();
				if (opts.limit) params.set("limit", String(opts.limit));
				if (opts.query) params.set("query", opts.query);
				if (opts.force) params.set("force", "1");
				const qs = params.toString();

				const res = await fetch(
					`/api/gmail/sync${qs ? `?${qs}` : ""}`,
					{
						method: "POST",
						headers: { Authorization: `Bearer ${accessToken}` },
					},
				);
				if (!res.ok) {
					const parsed = await readError(res);
					if (
						parsed.code === "RefreshAccessTokenError" ||
						parsed.code === "GmailUnauthorized"
					) {
						setNeedsReauth(true);
					}
					throw new Error(parsed.message);
				}

				const data = (await res.json()) as SyncSummary;
				setSummary(data);

				// Persist last-sync timestamp so the Integrations page can show it.
				try {
					if (typeof window !== "undefined") {
						localStorage.setItem(
							"nexadise.gmail.lastSyncAt",
							new Date().toISOString(),
						);
					}
				} catch {
					/* private mode etc. — ignore */
				}

				if (onAfterSync) await onAfterSync(data);
				return data;
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: "Failed to sync Gmail.";
				setError(message);
				throw err;
			} finally {
				setIsSyncing(false);
			}
		},
		[session?.accessToken, onAfterSync],
	);

	const dismissSummary = useCallback(() => setSummary(null), []);

	return {
		sync,
		isSyncing,
		error,
		needsReauth,
		reauth,
		summary,
		dismissSummary,
	};
}
