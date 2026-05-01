import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const micrositeId =
      typeof body.micrositeId === "string" ? body.micrositeId.trim() : "";

    const blockId =
      typeof body.blockId === "string" ? body.blockId.trim() : "";

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Pop the Balloon";

    const hostName =
      typeof body.hostName === "string" && body.hostName.trim()
        ? body.hostName.trim()
        : "Host";

    if (!micrositeId || !blockId) {
      return NextResponse.json(
        { ok: false, error: "Missing micrositeId or blockId." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingGame, error: existingGameError } = await supabaseAdmin
      .from("pop_balloon_games")
      .select("id, microsite_id, block_id, current_round_id, status")
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .maybeSingle();

    if (existingGameError) {
      return NextResponse.json(
        { ok: false, error: existingGameError.message },
        { status: 500 },
      );
    }

    if (existingGame) {
      return NextResponse.json({ ok: true, game: existingGame });
    }

    const { data: game, error: gameError } = await supabaseAdmin
      .from("pop_balloon_games")
      .insert({
        microsite_id: micrositeId,
        block_id: blockId,
        title,
        host_name: hostName,
        status: "waiting",
      })
      .select("id, microsite_id, block_id, current_round_id, status")
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { ok: false, error: gameError?.message ?? "Unable to create game." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, game });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load game." },
      { status: 500 },
    );
  }
}