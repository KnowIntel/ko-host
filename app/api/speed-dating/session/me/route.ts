import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
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
      return NextResponse.json({ session: null });
    }

    const { data: participant, error: participantError } = await supabase
      .from("speed_dating_participants")
      .select("*")
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .eq("session_key", sessionKey)
      .maybeSingle();

    if (participantError || !participant) {
      return NextResponse.json({ session: null });
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

    if (sessionError || !session) {
      return NextResponse.json({ session: null });
    }

    const { data: messages, error: messagesError } = await supabase
      .from("speed_dating_messages")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session,
      participant,
      messages: messages || [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}