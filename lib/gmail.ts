/**
 * Gmail API helpers — message parsing, body extraction, label decoding.
 *
 * Docs:
 *   https://developers.google.com/gmail/api/reference/rest/v1/users.messages
 *   https://developers.google.com/gmail/api/guides/sync
 */

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export type GmailMessageMeta = { id: string; threadId?: string };

export type GmailHeader = { name?: string; value?: string };

export type GmailMessagePart = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: { size?: number; data?: string; attachmentId?: string };
  parts?: GmailMessagePart[];
};

export type GmailMessage = {
  id: string;
  threadId?: string;
  snippet?: string;
  internalDate?: string;
  labelIds?: string[];
  payload?: GmailMessagePart;
};

export type ParsedMessage = {
  id: string;
  threadId: string | null;
  subject: string;
  from: string;
  to: string;
  date: string; // ISO
  snippet: string;
  body: string;
  labels: string[];
  isUnread: boolean;
  isImportant: boolean;
  isStarred: boolean;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Decoders                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

/** Gmail uses base64url (RFC 4648 §5) — `-` and `_` instead of `+` and `/`. */
export function decodeBase64Url(input: string): string {
  if (!input) return "";
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  try {
    // Buffer is available in Node runtime (Next route handlers).
    return Buffer.from(padded, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

/** Convert HTML to a reasonable plain-text approximation for AI input. */
export function stripHtml(html: string): string {
  if (!html) return "";
  return (
    html
      // Drop scripts / styles entirely
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      // Block-level tags become newlines
      .replace(/<\/?(p|div|br|li|ul|ol|tr|td|th|h[1-6])[^>]*>/gi, "\n")
      // Strip everything else
      .replace(/<[^>]+>/g, " ")
      // Decode common entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      // Collapse whitespace
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Header / part walking                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

export function getHeader(headers: GmailHeader[] | undefined, name: string): string | null {
  if (!headers) return null;
  const found = headers.find((h) => (h.name ?? "").toLowerCase() === name.toLowerCase());
  return found?.value ?? null;
}

/** Walk a payload tree and return the first part matching `mimeType`. */
function findPartByMime(
  part: GmailMessagePart | undefined,
  mimeType: string,
): GmailMessagePart | null {
  if (!part) return null;
  if (part.mimeType === mimeType) return part;
  for (const child of part.parts ?? []) {
    const found = findPartByMime(child, mimeType);
    if (found) return found;
  }
  return null;
}

/** Extract the best plain-text body out of a Gmail message payload.
 *  Prefers text/plain over text/html. Returns "" if nothing usable. */
export function extractBodyText(payload: GmailMessagePart | undefined): string {
  if (!payload) return "";

  // Single-part: body lives directly on the payload
  if (payload.body?.data && (!payload.parts || payload.parts.length === 0)) {
    const decoded = decodeBase64Url(payload.body.data);
    return payload.mimeType === "text/html" ? stripHtml(decoded) : decoded;
  }

  // Multipart: prefer text/plain
  const plain = findPartByMime(payload, "text/plain");
  if (plain?.body?.data) return decodeBase64Url(plain.body.data);

  // Fallback to text/html
  const html = findPartByMime(payload, "text/html");
  if (html?.body?.data) return stripHtml(decodeBase64Url(html.body.data));

  return "";
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Date parsing                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

export function gmailInternalDateToIso(internalDate: string | undefined): string {
  if (!internalDate) return "";
  const ms = Number(internalDate);
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  High-level parser                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

const MAX_BODY_CHARS = 4000; // plenty of context for AI; protects against huge marketing emails

export function parseGmailMessage(msg: GmailMessage): ParsedMessage {
  const headers = msg.payload?.headers;
  const subject = (getHeader(headers, "Subject") ?? "").trim();
  const from = (getHeader(headers, "From") ?? "").trim();
  const to = (getHeader(headers, "To") ?? "").trim();
  const dateHeader = getHeader(headers, "Date");
  const date =
    gmailInternalDateToIso(msg.internalDate) ||
    (dateHeader ? safeIso(dateHeader) : "") ||
    "";

  const rawBody = extractBodyText(msg.payload);
  const cleanedBody = rawBody.replace(/‌|​|﻿/g, "").trim(); // zero-width chars
  const body = cleanedBody.length > MAX_BODY_CHARS
    ? cleanedBody.slice(0, MAX_BODY_CHARS) + " …[truncated]"
    : cleanedBody;

  const labels = msg.labelIds ?? [];

  return {
    id: msg.id,
    threadId: msg.threadId ?? null,
    subject: subject || "(no subject)",
    from: from || "(unknown sender)",
    to,
    date,
    snippet: (msg.snippet ?? "").trim(),
    body,
    labels,
    isUnread: labels.includes("UNREAD"),
    isImportant: labels.includes("IMPORTANT"),
    isStarred: labels.includes("STARRED"),
  };
}

function safeIso(input: string): string {
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  API calls                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export type ListOptions = {
  accessToken: string;
  query?: string; // Gmail "q" search syntax, e.g. "in:inbox newer_than:30d"
  maxResults?: number;
  pageToken?: string;
};

export async function listMessages(opts: ListOptions): Promise<{
  messages: GmailMessageMeta[];
  nextPageToken: string | null;
  resultSizeEstimate: number;
}> {
  const url = new URL(`${GMAIL_BASE}/messages`);
  url.searchParams.set("maxResults", String(opts.maxResults ?? 50));
  if (opts.query) url.searchParams.set("q", opts.query);
  if (opts.pageToken) url.searchParams.set("pageToken", opts.pageToken);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${opts.accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GmailApiError(res.status, `messages.list failed: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    messages?: GmailMessageMeta[];
    nextPageToken?: string;
    resultSizeEstimate?: number;
  };

  return {
    messages: data.messages ?? [],
    nextPageToken: data.nextPageToken ?? null,
    resultSizeEstimate: data.resultSizeEstimate ?? 0,
  };
}

export async function getMessage(
  id: string,
  accessToken: string,
  format: "full" | "metadata" | "minimal" = "full",
): Promise<GmailMessage> {
  const url = new URL(`${GMAIL_BASE}/messages/${encodeURIComponent(id)}`);
  url.searchParams.set("format", format);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GmailApiError(res.status, `messages.get(${id}) failed: ${body.slice(0, 300)}`);
  }

  return (await res.json()) as GmailMessage;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Errors                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export class GmailApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "GmailApiError";
  }
}
