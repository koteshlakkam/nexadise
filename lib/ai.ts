import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateSummary(subject: string, snippet: string) {
  const model = getGeminiModel();
  if (!model) return snippet;

  console.log("🔥 GEMINI CALLED");

  const prompt = [
    "Write a short 1-2 sentence summary of the email.",
    "Return plain text only.",
    "",
    `subject: ${JSON.stringify(subject)}`,
    `snippet: ${JSON.stringify(snippet)}`,
  ].join("\n");

  try {
    const res = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 120 },
    });
    const text = res.response.text().trim();
    return text || snippet;
  } catch (err) {
    console.warn("[ai] Gemini summary failed; using snippet fallback.", err);
    return snippet;
  }
}

type EmailAnalysis = {
  action: "ACTION_REQUIRED" | "INFO";
  actionType: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
  urgency: "LOW" | "MEDIUM" | "HIGH";
};

function ruleBasedAnalyzeEmail(subject: string, snippet: string): EmailAnalysis {
  const text = `${subject} ${snippet}`.toLowerCase();

  const actionRequired = ["meeting", "call", "reply", "urgent"].some((k) => text.includes(k));
  const action: EmailAnalysis["action"] = actionRequired ? "ACTION_REQUIRED" : "INFO";

  let actionType: EmailAnalysis["actionType"] = null;
  if (["meeting", "call", "schedule"].some((k) => text.includes(k))) actionType = "MEETING";
  else if (["invoice", "payment", "approve"].some((k) => text.includes(k))) actionType = "APPROVAL";
  else if (["check", "verify", "feedback"].some((k) => text.includes(k))) actionType = "REVIEW";
  else if (["message", "email", "respond"].some((k) => text.includes(k))) actionType = "REPLY";

  const urgency: EmailAnalysis["urgency"] = ["urgent", "payment", "invoice"].some((k) =>
    text.includes(k)
  )
    ? "HIGH"
    : actionRequired
      ? "MEDIUM"
      : "LOW";

  return { action, actionType, urgency };
}

function isEmailAnalysis(x: unknown): x is EmailAnalysis {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;

  const actionOk = obj.action === "ACTION_REQUIRED" || obj.action === "INFO";
  const actionTypeOk =
    obj.actionType === null ||
    obj.actionType === "REPLY" ||
    obj.actionType === "REVIEW" ||
    obj.actionType === "APPROVAL" ||
    obj.actionType === "MEETING";
  const urgencyOk = obj.urgency === "LOW" || obj.urgency === "MEDIUM" || obj.urgency === "HIGH";

  return actionOk && actionTypeOk && urgencyOk;
}

let warnedMissingKey = false;

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn(
        '[ai] GEMINI_API_KEY is missing. Add `GEMINI_API_KEY=...` to `.env.local` and restart the dev server. Falling back to non-AI behavior.'
      );
    }
    return null;
  }

  // Default must be a model name supported by the Gemini API for generateContent.
  // Some "gemini-1.5-*" model IDs 404 on v1beta depending on rollout/project.
  const modelName = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({ model: modelName });
}

async function geminiStrictJson(prompt: string): Promise<string> {
  const model = getGeminiModel();
  if (!model) throw new Error("Missing GEMINI_API_KEY");

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 256,
      // SDK type support varies; this nudges strict JSON output when supported.
      responseMimeType: "application/json",
    } as unknown as Record<string, unknown>,
  });

  return res.response.text().trim();
}

async function analyzeEmail(subject: string, snippet: string): Promise<EmailAnalysis> {
  const prompt = [
    "Return strict JSON only (no markdown, no backticks, no prose).",
    "",
    'Output schema: {"action":"ACTION_REQUIRED"|"INFO","actionType":"REPLY"|"REVIEW"|"APPROVAL"|"MEETING"|null,"urgency":"LOW"|"MEDIUM"|"HIGH"}',
    "",
    "Rules:",
    "- If email contains meeting/call/reply/urgent → ACTION_REQUIRED; otherwise → INFO",
    "- APPROVAL → invoice, payment, approve",
    "- REVIEW → check, verify, feedback",
    "- REPLY → message, email, respond",
    "- MEETING → meeting, call, schedule",
    "- urgency HIGH if urgent/payment/invoice",
    "",
    `subject: ${JSON.stringify(subject)}`,
    `snippet: ${JSON.stringify(snippet)}`,
  ].join("\n");

  try {
    const text = await geminiStrictJson(prompt);
    const parsed = JSON.parse(text) as unknown;
    if (isEmailAnalysis(parsed)) return parsed;
  } catch {
    // fall back to deterministic rules
  }

  return ruleBasedAnalyzeEmail(subject, snippet);
}

export type ProcessedEmail = {
  summary: string;
  action: "ACTION_REQUIRED" | "INFO";
  actionType: "REPLY" | "REVIEW" | "APPROVAL" | "MEETING" | null;
  urgency: "LOW" | "MEDIUM" | "HIGH";
};

export async function processEmail(subject: string, snippet: string): Promise<ProcessedEmail> {
  const [summary, analysis] = await Promise.all([
    generateSummary(subject, snippet),
    analyzeEmail(subject, snippet),
  ]);

  return {
    summary,
    action: analysis.action,
    actionType: analysis.actionType,
    urgency: analysis.urgency,
  };
}
