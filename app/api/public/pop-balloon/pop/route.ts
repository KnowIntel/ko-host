import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_REASON_LENGTH = 300;

function cleanText(value: unknown, maxLength = MAX_REASON_LENGTH) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const roundId =
      typeof body.roundId === "string" ? body.roundId.trim() : "";

    const participantId =
      typeof body.participantId === "string"
        ? body.participantId.trim()
        : "";

    const popReason = cleanText(body.popReason) || "Popped";

    if (!roundId || !participantId) {
      return NextResponse.json(
        { ok: false, error: "Missing roundId or participantId." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ensure entry exists before updating (basic integrity check)
    const { data: existingEntry, error: existingError } =
      await supabaseAdmin
        .from("pop_balloon_round_entries")
        .select("id")
        .eq("round_id", roundId)
        .eq("participant_id", participantId)
        .maybeSingle();

    if (existingError || !existingEntry) {
      return NextResponse.json(
        { ok: false, error: existingError?.message ?? "Entry not found." },
        { status: 404 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pop_balloon_round_entries")
      .update({
        balloon_status: "popped",
        pop_reason: popReason,
        popped_at: new Date().toISOString(),
      })
      .eq("round_id", roundId)
      .eq("participant_id", participantId)
      .select(
        "id, round_id, participant_id, balloon_status, pop_reason, popped_at",
      )
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, entry: data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to pop balloon." },
      { status: 500 },
    );
  }
}