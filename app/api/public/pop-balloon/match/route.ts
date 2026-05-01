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
    const roundId = typeof body.roundId === "string" ? body.roundId.trim() : "";

    const featuredParticipantId =
      typeof body.featuredParticipantId === "string"
        ? body.featuredParticipantId.trim()
        : null;

    const matchedParticipantId =
      typeof body.matchedParticipantId === "string"
        ? body.matchedParticipantId.trim()
        : "";

    const visibility =
      body.visibility === "private" ||
      body.visibility === "contact_form" ||
      body.visibility === "private_chat_later"
        ? body.visibility
        : "public";

    if (!gameId || !roundId || !matchedParticipantId) {
      return NextResponse.json(
        { ok: false, error: "Missing gameId, roundId, or matchedParticipantId." },
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

    const { data: match, error: matchError } = await supabaseAdmin
      .from("pop_balloon_matches")
      .insert({
        game_id: gameId,
        round_id: roundId,
        featured_participant_id: featuredParticipantId || null,
        matched_participant_id: matchedParticipantId,
        visibility,
      })
      .select(
        "id, game_id, round_id, featured_participant_id, matched_participant_id, visibility, created_at",
      )
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { ok: false, error: matchError?.message ?? "Unable to select match." },
        { status: 500 },
      );
    }

    await supabaseAdmin
      .from("pop_balloon_round_entries")
      .update({ balloon_status: "selected" })
      .eq("round_id", roundId)
      .eq("participant_id", matchedParticipantId);

    await supabaseAdmin
      .from("pop_balloon_rounds")
      .update({
        status: "ended",
        selected_match_id: match.id,
        ended_at: new Date().toISOString(),
      })
      .eq("id", roundId);

    await supabaseAdmin
      .from("pop_balloon_games")
      .update({
        status: "ended",
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId);

    return NextResponse.json({ ok: true, match });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to select match." },
      { status: 500 },
    );
  }
}