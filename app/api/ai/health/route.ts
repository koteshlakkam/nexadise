import { NextResponse } from "next/server";
import { probeAi, getAiDiagnostics } from "@/lib/ai";

/**
 * Diagnostic endpoint. Hit GET /api/ai/health to see which AI provider is
 * active and exercise it with a real call. Returns the actual error and a
 * hint when the provider is broken.
 */
export async function GET() {
  const probe = await probeAi();
  const diagnostics = getAiDiagnostics();

  return NextResponse.json(
    {
      ok: probe.ok,
      provider: probe.provider,
      model: probe.model,
      ...(probe.ok
        ? { sample: (probe as { sample: string }).sample }
        : {
            error: (probe as { error: string }).error,
            hint: (probe as { hint?: string }).hint,
          }),
      diagnostics,
    },
    { status: probe.ok ? 200 : 503 },
  );
}
