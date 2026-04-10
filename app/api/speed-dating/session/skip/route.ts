import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const micrositeId = searchParams.get("micrositeId");
    const blockId = searchParams.get("blockId");

    if (!micrositeId || !blockId) {
      return NextResponse.json(
        { error: "Missing params" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionKey = cookieStore.get("kht_sd_session")?.value;

    if (!sessionKey) {
      return NextResponse.json(
        { error: "No session" },
        { status: 400 }
      );
    }

    const { data: participant, error: participantError } = await supabase
      .from("speed_dating_participants")
      .select("*")
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .eq("session_key", sessionKey)
      .maybeSingle();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from("speed_dating_sessions")
      .select("*")
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .eq("status", "active")
      .or(
        `participant_left_id.eq.${participant.id},participant_right_id.eq.${participant.id}`
      )
      .maybeSingle();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json({ success: true });
    }

    const { error: updateSessionError } = await supabase
      .from("speed_dating_sessions")
      .update({ status: "skipped" })
      .eq("id", session.id);

    if (updateSessionError) {
      return NextResponse.json(
        { error: updateSessionError.message },
        { status: 500 }
      );
    }

    const participantIds = [
      session.participant_left_id,
      session.participant_right_id,
    ].filter(Boolean);

    if (participantIds.length) {
      const { error: resetError } = await supabase
        .from("speed_dating_participants")
        .update({ status: "waiting" })
        .in("id", participantIds);

      if (resetError) {
        return NextResponse.json(
          { error: resetError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}