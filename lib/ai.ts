import { GoogleGenerativeAI } from "@google/generative-ai";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export type EmailAction = "ACTION_REQUIRED" | "INFO";
export type EmailActionType =
	| "REPLY"
	| "REVIEW"
	| "APPROVAL"
	| "MEETING"
	| null;
export type EmailUrgency = "LOW" | "MEDIUM" | "HIGH";

export type AiSource = "openrouter" | "gemini" | "fallback" | "cached";

export type ProcessedEmail = {
	/** Tight 1-sentence gist — what the email is actually about, no fluff. */
	summary: string;
	/** Concrete next step the user should take, written as an imperative phrase. */
	suggestedAction: string;
	action: EmailAction;
	actionType: EmailActionType;
	urgency: EmailUrgency;
	/** Where this insight came from. */
	source: AiSource;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Diagnostics                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

type ProviderName = "openrouter" | "gemini";

type ProviderStats = {
	configured: boolean;
	model: string;
	callsAttempted: number;
	callsSucceeded: number;
	lastSuccessAt: string | null;
	lastError: string | null;
	lastErrorAt: string | null;
};

const stats: Record<ProviderName, ProviderStats> = {
	openrouter: {
		configured: false,
		model: "",
		callsAttempted: 0,
		callsSucceeded: 0,
		lastSuccessAt: null,
		lastError: null,
		lastErrorAt: null,
	},
	gemini: {
		configured: false,
		model: "",
		callsAttempted: 0,
		callsSucceeded: 0,
		lastSuccessAt: null,
		lastError: null,
		lastErrorAt: null,
	},
};

/** Single pinned OpenRouter model. Override with OPENROUTER_MODEL in .env. */
const DEFAULT_OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

function getOpenRouterModel(): string {
	return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
}

function refreshConfigSnapshot() {
	stats.openrouter.configured = Boolean(process.env.OPENROUTER_API_KEY);
	stats.openrouter.model = getOpenRouterModel();
	stats.gemini.configured = Boolean(process.env.GEMINI_API_KEY);
	stats.gemini.model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

function recordSuccess(p: ProviderName) {
	stats[p].callsSucceeded += 1;
	stats[p].lastSuccessAt = new Date().toISOString();
}
function recordError(p: ProviderName, err: unknown) {
	stats[p].lastError = err instanceof Error ? err.message : String(err);
	stats[p].lastErrorAt = new Date().toISOString();
}

export function getAiDiagnostics() {
	refreshConfigSnapshot();
	const active: ProviderName | "none" = stats.openrouter.configured
		? "openrouter"
		: stats.gemini.configured
			? "gemini"
			: "none";
	return { active, providers: stats, cacheSize: insightCache.size };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  In-memory insight cache                                                  */
/*  - Keyed by gmail_message_id (preferred) or content hash.                  */
/*  - Process-level. Survives across HTTP requests in the same Next.js dev    */
/*    server / serverless instance. Bounded LRU-ish via FIFO eviction.        */
/* ────────────────────────────────────────────────────────────────────────── */

const insightCache = new Map<string, ProcessedEmail>();
const MAX_CACHE = 1000;

function setCache(key: string, value: ProcessedEmail) {
	if (insightCache.has(key)) insightCache.delete(key);
	insightCache.set(key, value);
	while (insightCache.size > MAX_CACHE) {
		const firstKey = insightCache.keys().next().value;
		if (firstKey === undefined) break;
		insightCache.delete(firstKey);
	}
}

function getCache(key: string): ProcessedEmail | undefined {
	return insightCache.get(key);
}

export function clearInsightCache() {
	insightCache.clear();
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Prompt                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const INSIGHT_PROMPT = (subject: string, snippet: string, sender: string) =>
	[
		"You are an inbox assistant. Read the email below and return a STRICT JSON object — no markdown, no backticks, no prose around it.",
		"",
		"Output schema (all keys required, exact casing):",
		"{",
		'  "summary": string,             // ≤ 18 words. The actual point of the email — NOT a paraphrase of the subject or sender. State what is being requested, announced, or shared, with the most specific detail (a number, name, deadline, decision). Avoid generic phrases like "Welcome", "Update", or "Information about X".',
		'  "suggestedAction": string,     // ≤ 12 words. Imperative voice ("Reply confirming…", "Approve invoice #…", "Schedule a 30-min call with…"). If no action is needed write "No action needed".',
		'  "action": "ACTION_REQUIRED" | "INFO",  // ACTION_REQUIRED iff a human needs to do something concrete in response.',
		'  "actionType": "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null,  // null if action is "INFO".',
		'  "urgency": "LOW" | "MEDIUM" | "HIGH"   // HIGH for invoices/deadlines/incidents/explicit "urgent". MEDIUM for time-bound asks. LOW for FYIs and newsletters.',
		"}",
		"",
		"Heuristics:",
		"- Newsletters, marketing, receipts, and product announcements → action = INFO, actionType = null, urgency = LOW.",
		"- Calendar invites, scheduling requests → MEETING.",
		"- Invoices, payment confirmations needed, sign-offs → APPROVAL.",
		"- Direct questions to the recipient → REPLY.",
		"- Documents/PRs/proposals shared for feedback → REVIEW.",
		"- If the snippet is too short or empty to tell, infer from the subject and sender domain.",
		"",
		"Email:",
		`from: ${JSON.stringify(sender)}`,
		`subject: ${JSON.stringify(subject)}`,
		`snippet: ${JSON.stringify(snippet)}`,
		"",
		"Return only the JSON object, nothing else.",
	].join("\n");

/* ────────────────────────────────────────────────────────────────────────── */
/*  Validation + JSON extraction                                             */
/* ────────────────────────────────────────────────────────────────────────── */

function isProcessedEmailLike(x: unknown): x is Omit<ProcessedEmail, "source"> {
	if (!x || typeof x !== "object") return false;
	const o = x as Record<string, unknown>;
	const summaryOk =
		typeof o.summary === "string" && o.summary.trim().length > 0;
	const suggestedOk =
		typeof o.suggestedAction === "string" &&
		o.suggestedAction.trim().length > 0;
	const actionOk = o.action === "ACTION_REQUIRED" || o.action === "INFO";
	const actionTypeOk =
		o.actionType === null ||
		o.actionType === "REPLY" ||
		o.actionType === "REVIEW" ||
		o.actionType === "APPROVAL" ||
		o.actionType === "MEETING";
	const urgencyOk =
		o.urgency === "LOW" || o.urgency === "MEDIUM" || o.urgency === "HIGH";
	return summaryOk && suggestedOk && actionOk && actionTypeOk && urgencyOk;
}

/** Extract a JSON object from raw model output, even if wrapped in markdown
 *  code fences or surrounded by chatter. */
function extractJson(raw: string): unknown {
	const trimmed = raw.trim();
	// Direct parse
	try {
		return JSON.parse(trimmed);
	} catch {
		/* fall through */
	}
	// ```json ... ``` block
	const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fence) {
		try {
			return JSON.parse(fence[1]);
		} catch {
			/* fall through */
		}
	}
	// First {...} block
	const firstObj = trimmed.match(/\{[\s\S]*\}/);
	if (firstObj) {
		try {
			return JSON.parse(firstObj[0]);
		} catch {
			/* fall through */
		}
	}
	throw new Error("No JSON object found in model output");
}

function clampWords(s: string, max: number): string {
	const words = s.trim().split(/\s+/);
	if (words.length <= max) return s.trim();
	return words.slice(0, max).join(" ") + "…";
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Provider: OpenRouter                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

/** Single OpenRouter call against the configured model. */
async function callOpenRouter(prompt: string): Promise<string> {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

	const model = getOpenRouterModel();
	stats.openrouter.model = model;
	stats.openrouter.callsAttempted += 1;

	const referer = process.env.OPENROUTER_REFERER ?? "http://localhost:3000";
	const title = process.env.OPENROUTER_TITLE ?? "nexadise";

	let res: Response;
	try {
		res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
				"HTTP-Referer": referer,
				"X-Title": title,
			},
			body: JSON.stringify({
				model,
				messages: [{ role: "user", content: prompt }],
				// The model may or may not honor this — extractJson() handles either case.
				response_format: { type: "json_object" },
				temperature: 0.2,
				max_tokens: 320,
			}),
		});
	} catch (err) {
		recordError("openrouter", err);
		throw err;
	}

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		const err = new Error(
			`OpenRouter ${res.status} ${res.statusText}: ${body.slice(0, 300)}`,
		);
		recordError("openrouter", err);
		throw err;
	}

	const data = (await res.json().catch(() => ({}))) as {
		choices?: Array<{ message?: { content?: string } }>;
		error?: { message?: string; code?: number };
	};

	if (data.error?.message) {
		const err = new Error(`OpenRouter error: ${data.error.message}`);
		recordError("openrouter", err);
		throw err;
	}

	const content = data.choices?.[0]?.message?.content;
	if (!content) {
		const err = new Error("OpenRouter returned an empty completion");
		recordError("openrouter", err);
		throw err;
	}

	recordSuccess("openrouter");
	return String(content);
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Provider: Gemini (kept as fallback when OpenRouter is not configured)     */
/* ────────────────────────────────────────────────────────────────────────── */

function getGeminiModel() {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) return null;
	const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
	stats.gemini.model = modelName;
	const client = new GoogleGenerativeAI(apiKey);
	return client.getGenerativeModel({ model: modelName });
}

async function callGemini(prompt: string): Promise<string> {
	const model = getGeminiModel();
	if (!model) throw new Error("GEMINI_API_KEY not set");
	stats.gemini.callsAttempted += 1;
	try {
		const res = await model.generateContent({
			contents: [{ role: "user", parts: [{ text: prompt }] }],
			generationConfig: {
				temperature: 0.2,
				maxOutputTokens: 320,
				responseMimeType: "application/json",
			} as unknown as Record<string, unknown>,
		});
		const text = res.response.text().trim();
		recordSuccess("gemini");
		return text;
	} catch (err) {
		recordError("gemini", err);
		throw err;
	}
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Probe — exercise whichever provider is active                            */
/* ────────────────────────────────────────────────────────────────────────── */

export async function probeAi(): Promise<
	| { ok: true; provider: ProviderName; model: string; sample: string }
	| {
			ok: false;
			provider: ProviderName | "none";
			model: string;
			error: string;
			hint?: string;
	  }
> {
	refreshConfigSnapshot();
	const provider: ProviderName | "none" = stats.openrouter.configured
		? "openrouter"
		: stats.gemini.configured
			? "gemini"
			: "none";

	if (provider === "none") {
		return {
			ok: false,
			provider,
			model: "",
			error: "No AI provider configured.",
			hint: "Add OPENROUTER_API_KEY=sk-or-... to .env (free at https://openrouter.ai/keys), then restart the dev server.",
		};
	}

	const prompt = 'Reply with only the JSON {"ok": true} — nothing else.';
	try {
		const raw =
			provider === "openrouter"
				? await callOpenRouter(prompt)
				: await callGemini(prompt);
		return {
			ok: true,
			provider,
			model: stats[provider].model,
			sample: raw.slice(0, 200),
		};
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		let hint: string | undefined;
		if (/no endpoints|not found|404|unsupported/i.test(msg)) {
			hint =
				provider === "openrouter"
					? `Model "${stats.openrouter.model}" has no free endpoints right now. Pick another at https://openrouter.ai/models?max_price=0 and set OPENROUTER_MODEL in .env.`
					: `Model "${stats.gemini.model}" not available on v1beta for your key. Try GEMINI_MODEL=gemini-2.0-flash in .env.`;
		} else if (/api key|unauthorized|401|permission/i.test(msg)) {
			hint =
				provider === "openrouter"
					? "OPENROUTER_API_KEY appears invalid. Generate one at https://openrouter.ai/keys"
					: "GEMINI_API_KEY appears invalid. Generate one at https://aistudio.google.com/apikey";
		} else if (/503|overloaded|high demand/i.test(msg)) {
			hint =
				"Provider is overloaded. Try again, or switch model via env.";
		} else if (/quota|429|rate/i.test(msg)) {
			hint =
				"Rate limit / quota hit. Wait a moment, or switch to a different free model.";
		} else if (/fetch failed|enotfound|econnrefused|network/i.test(msg)) {
			hint =
				"Network can't reach the provider. Check internet/proxy/firewall.";
		}
		return {
			ok: false,
			provider,
			model: stats[provider].model,
			error: msg,
			hint,
		};
	}
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Rule-based fallback                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function ruleBasedFallback(subject: string, snippet: string): ProcessedEmail {
	const text = `${subject} ${snippet}`.toLowerCase();
	const actionRequired = [
		"meeting",
		"call",
		"reply",
		"urgent",
		"approve",
		"review",
	].some((k) => text.includes(k));

	let actionType: EmailActionType = null;
	if (["meeting", "call", "schedule"].some((k) => text.includes(k)))
		actionType = "MEETING";
	else if (["invoice", "payment", "approve"].some((k) => text.includes(k)))
		actionType = "APPROVAL";
	else if (
		["check", "verify", "feedback", "review"].some((k) => text.includes(k))
	)
		actionType = "REVIEW";
	else if (["respond", "reply"].some((k) => text.includes(k)))
		actionType = "REPLY";

	const urgency: EmailUrgency = ["urgent", "today", "asap", "deadline"].some(
		(k) => text.includes(k),
	)
		? "HIGH"
		: actionRequired
			? "MEDIUM"
			: "LOW";

	const compact = snippet
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.slice(0, 18)
		.join(" ");

	const suggestedAction = !actionRequired
		? "No action needed"
		: actionType === "MEETING"
			? "Reply with availability and propose a slot"
			: actionType === "APPROVAL"
				? "Review and approve the request"
				: actionType === "REVIEW"
					? "Open the doc and leave feedback"
					: "Send a short reply";

	return {
		summary: compact || subject || "(empty message)",
		suggestedAction,
		action: actionRequired ? "ACTION_REQUIRED" : "INFO",
		actionType: actionRequired ? actionType : null,
		urgency,
		source: "fallback",
	};
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Public API                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export async function processEmail(
	subject: string,
	snippet: string,
	sender = "",
	options: { cacheKey?: string } = {},
): Promise<ProcessedEmail> {
	const { cacheKey } = options;

	// 1. Cache hit — return immediately.
	if (cacheKey) {
		const cached = getCache(cacheKey);
		if (cached) return { ...cached, source: "cached" };
	}

	refreshConfigSnapshot();
	const prompt = INSIGHT_PROMPT(subject, snippet, sender);

	// 2. Try OpenRouter first if configured.
	if (stats.openrouter.configured) {
		try {
			const raw = await callOpenRouter(prompt);
			const parsed = extractJson(raw);
			if (isProcessedEmailLike(parsed)) {
				const result: ProcessedEmail = {
					summary: clampWords(parsed.summary, 22),
					suggestedAction: clampWords(parsed.suggestedAction, 16),
					action: parsed.action,
					actionType: parsed.actionType,
					urgency: parsed.urgency,
					source: "openrouter",
				};
				if (cacheKey) setCache(cacheKey, result);
				return result;
			}
			const malformed = `OpenRouter returned malformed/invalid output. raw=${String(raw).slice(0, 200)}`;
			stats.openrouter.lastError = malformed;
			stats.openrouter.lastErrorAt = new Date().toISOString();
			console.warn("[ai]", malformed);
		} catch (err) {
			console.warn("[ai] OpenRouter call failed:", err);
		}
	}

	// 3. Try Gemini if configured.
	if (stats.gemini.configured) {
		try {
			const raw = await callGemini(prompt);
			const parsed = extractJson(raw);
			if (isProcessedEmailLike(parsed)) {
				const result: ProcessedEmail = {
					summary: clampWords(parsed.summary, 22),
					suggestedAction: clampWords(parsed.suggestedAction, 16),
					action: parsed.action,
					actionType: parsed.actionType,
					urgency: parsed.urgency,
					source: "gemini",
				};
				if (cacheKey) setCache(cacheKey, result);
				return result;
			}
			const malformed = `Gemini returned malformed/invalid output. raw=${String(raw).slice(0, 200)}`;
			stats.gemini.lastError = malformed;
			stats.gemini.lastErrorAt = new Date().toISOString();
			console.warn("[ai]", malformed);
		} catch (err) {
			console.warn("[ai] Gemini call failed:", err);
		}
	}

	// 4. Rule-based fallback.
	const fallback = ruleBasedFallback(subject, snippet);
	if (cacheKey) setCache(cacheKey, fallback);
	return fallback;
}
