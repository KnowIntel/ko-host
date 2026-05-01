import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const gameId = typeof body.gameId === "string" ? body.gameId.trim() : "";

    if (!gameId) {
      return NextResponse.json(
        { ok: false, error: "Missing gameId." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: game, error: gameError } = await supabaseAdmin
      .from("pop_balloon_games")
      .select("id, status, current_round_id")
      .eq("id", gameId)
      .maybeSingle();

    if (gameError) {
      return NextResponse.json(
        { ok: false, error: gameError.message },
        { status: 500 },
      );
    }

    const { data: participants, error: participantsError } = await supabaseAdmin
      .from("pop_balloon_participants")
      .select("id, name, age, intro, looking_for, fun_fact, status")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true });

    if (participantsError) {
      return NextResponse.json(
        { ok: false, error: participantsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      game,
      participants: participants ?? [],
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load Pop the Balloon state." },
      { status: 500 },
    );
  }
}