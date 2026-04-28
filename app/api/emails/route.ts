import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { processEmail } from "@/lib/ai";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("emails")
    .select("*")
    .order("received_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const emails = await Promise.all(
    (data ?? []).map(async (row: any) => {
      const subject = String(row.subject ?? "");
      const snippet = String(row.snippet ?? "");

      const summary =
        row.summary != null ? String(row.summary) : (await processEmail(subject, snippet)).summary;

      return {
        id: String(row.gmail_message_id ?? row.id ?? ""),
        subject,
        from: String(row.sender ?? ""),
        snippet,
        summary,
        date: String(row.received_at ?? ""),
        action: (row.action as "ACTION_REQUIRED" | "INFO") ?? "INFO",
        actionType: (row.action_type as "REPLY" | "REVIEW" | "APPROVAL" | null) ?? null,
      };
    })
  );

  return NextResponse.json(emails.filter((e) => e.id));
}

