import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

async function getSessionKey() {
  const cookieStore = await cookies();
  const existing = cookieStore.get("kht_sd_session")?.value;

  if (existing) return existing;

  const newKey = crypto.randomUUID();

  cookieStore.set("kht_sd_session", newKey, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  return newKey;
}

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  const body = await req.json();

  const {
    micrositeId,
    blockId,
    name,
    title,
    bio,
    imageUrl,
    gender,
    seeking,
  } = body;

  if (!micrositeId || !blockId || !name || !title || !bio) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const sessionKey = await getSessionKey();

  const { data, error } = await supabase
    .from("speed_dating_participants")
    .upsert(
      {
        microsite_id: micrositeId,
        block_id: blockId,
        session_key: sessionKey,
        name,
        title,
        bio,
        image_url: imageUrl || null,
        gender,
        seeking,
        status: "waiting",
      },
      {
        onConflict: "microsite_id,block_id,session_key",
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ participant: data });
}