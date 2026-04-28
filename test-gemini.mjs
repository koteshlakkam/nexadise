/**
 * Standalone AI connectivity test.
 *
 * Usage:
 *   node test-gemini.mjs
 *
 * Tests OpenRouter against the configured model (defaults to
 * nvidia/nemotron-3-super-120b-a12b:free), falls back to Gemini if no
 * OpenRouter key is set.
 *
 * Safe to delete — this file isn't imported by the app.
 */
import { readFileSync } from "node:fs";

// Manual .env parsing so this script has zero deps.
try {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* .env may not exist — that's fine. */
}

const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const orKey = process.env.OPENROUTER_API_KEY;
const orModel = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
const geminiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

console.log("OpenRouter key:", Boolean(orKey), orKey ? `(${orKey.length} chars)` : "");
console.log("OpenRouter model:", orModel);
console.log("Gemini key:", Boolean(geminiKey), geminiKey ? `(${geminiKey.length} chars)` : "");
console.log("Gemini model:", geminiModel);
console.log();

if (orKey) {
  console.log("=== Testing OpenRouter ===");
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${orKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Nexadise diagnostic",
      },
      body: JSON.stringify({
        model: orModel,
        messages: [{ role: "user", content: 'Reply with only the JSON {"ok": true}.' }],
        response_format: { type: "json_object" },
        temperature: 0,
        max_tokens: 16,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.log(`FAILED: ${res.status} ${res.statusText}`);
      console.log(text.slice(0, 500));
      console.log(
        "\nIf this is a 404, the model has no free endpoints right now. Pick another from",
      );
      console.log("https://openrouter.ai/models?max_price=0 and set OPENROUTER_MODEL in .env.");
      process.exit(1);
    }
    const data = JSON.parse(text);
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.log("FAILED: empty completion");
      process.exit(1);
    }
    console.log("OK. Response:", content.trim());
    process.exit(0);
  } catch (err) {
    console.log("FAILED:", err?.message ?? err);
    process.exit(1);
  }
}

if (geminiKey) {
  console.log("=== Testing Gemini (fallback) ===");
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const client = new GoogleGenerativeAI(geminiKey);
    const model = client.getGenerativeModel({ model: geminiModel });
    const res = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: 'Reply with only the JSON {"ok": true}.' }] },
      ],
      generationConfig: { temperature: 0, maxOutputTokens: 16 },
    });
    console.log("OK. Response:", res.response.text().trim());
    process.exit(0);
  } catch (err) {
    console.log("FAILED:", err?.message ?? err);
    if (err?.cause) console.log("cause:", err.cause);
    process.exit(1);
  }
}

console.log("No AI provider configured.");
console.log("Add OPENROUTER_API_KEY=sk-or-... to .env (free at https://openrouter.ai/keys).");
process.exit(1);
