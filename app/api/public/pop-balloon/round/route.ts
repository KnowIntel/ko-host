import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await req.json();

    const gameId = typeof body.gameId === "string" ? body.gameId.trim() : "";

    const featuredParticipantId =
      typeof body.featuredParticipantId === "string"
        ? body.featuredParticipantId.trim()
        : null;

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : null;

    if (!gameId) {
      return NextResponse.json(
        { ok: false, error: "Missing gameId." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: game, error: gameError } = await supabaseAdmin
      .from("pop_balloon_games")
      .select("id, microsite_id")
      .eq("id", gameId)
      .maybeSingle();

    if (gameError || !game) {
      return NextResponse.json(
        { ok: false, error: gameError?.message ?? "Game not found." },
        { status: 404 },
      );
    }

    const { data: microsite, error: micrositeError } = await supabaseAdmin
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("id", game.microsite_id)
      .maybeSingle();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { ok: false, error: micrositeError?.message ?? "Microsite not found." },
        { status: 404 },
      );
    }

    if (microsite.owner_clerk_user_id !== userId) {
      return NextResponse.json(
        { ok: false, error: "Forbidden." },
        { status: 403 },
      );
    }

    const { data: round, error: roundError } = await supabaseAdmin
      .from("pop_balloon_rounds")
      .insert({
        game_id: gameId,
        featured_participant_id: featuredParticipantId || null,
        status: "live",
        prompt,
        started_at: new Date().toISOString(),
      })
      .select("id, game_id, featured_participant_id, status, prompt, started_at")
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { ok: false, error: roundError?.message ?? "Unable to create round." },
        { status: 500 },
      );
    }

    await supabaseAdmin
      .from("pop_balloon_games")
      .update({
        current_round_id: round.id,
        status: "live",
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId);

    const { data: participants, error: participantsError } = await supabaseAdmin
      .from("pop_balloon_participants")
      .select("id")
      .eq("game_id", gameId)
      .eq("status", "active");

    if (participantsError) {
      return NextResponse.json(
        { ok: false, error: participantsError.message },
        { status: 500 },
      );
    }

    const entriesPayload =
      participants?.map((participant) => ({
        round_id: round.id,
        participant_id: participant.id,
        balloon_status: "active",
      })) ?? [];

    if (entriesPayload.length > 0) {
      const { error: entriesError } = await supabaseAdmin
        .from("pop_balloon_round_entries")
        .insert(entriesPayload);

      if (entriesError) {
        return NextResponse.json(
          { ok: false, error: entriesError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      ok: true,
      round,
      entriesCreated: entriesPayload.length,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to start round." },
      { status: 500 },
    );
  }
}