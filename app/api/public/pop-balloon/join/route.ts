import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_TEXT_LENGTH = 500;

function cleanText(value: unknown, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const gameId = cleanText(body.gameId, 80);
    const name = cleanText(body.name, 80);

    if (!gameId || !name) {
      return NextResponse.json(
        { ok: false, error: "Missing gameId or name." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: game, error: gameError } = await supabaseAdmin
      .from("pop_balloon_games")
      .select("id")
      .eq("id", gameId)
      .maybeSingle();

    if (gameError || !game) {
      return NextResponse.json(
        { ok: false, error: gameError?.message ?? "Game not found." },
        { status: 404 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pop_balloon_participants")
      .insert({
        game_id: gameId,
        browser_key: cleanText(body.browserKey, 120),
        name,
        age: cleanText(body.age, 20),
        intro: cleanText(body.intro),
        looking_for: cleanText(body.lookingFor),
        fun_fact: cleanText(body.funFact),
        photo_url: cleanText(body.photoUrl, 1000),
        status: "active",
      })
      .select(
        "id, game_id, name, age, intro, looking_for, fun_fact, photo_url, status",
      )
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, participant: data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to join lineup." },
      { status: 500 },
    );
  }
}