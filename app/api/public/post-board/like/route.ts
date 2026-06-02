import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "kht_post_board_session";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function makeSessionId() {
  return `pbs_${crypto.randomUUID()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const micrositeId =
      typeof body?.micrositeId === "string" ? body.micrositeId.trim() : "";
    const blockId =
      typeof body?.blockId === "string" ? body.blockId.trim() : "";
    const postId =
      typeof body?.postId === "string" ? body.postId.trim() : "";

    if (!micrositeId) return badRequest("Missing micrositeId.");
    if (!blockId) return badRequest("Missing blockId.");
    if (!postId) return badRequest("Missing postId.");

    const cookieStore = await cookies();
    const existingSession = cookieStore.get(COOKIE_NAME)?.value;
    const sessionId = existingSession || makeSessionId();

    const supabaseAdmin = getSupabaseAdmin();

    const { error: insertError } = await supabaseAdmin
      .from("post_board_likes")
      .insert({
        microsite_id: micrositeId,
        block_id: blockId,
        post_id: postId,
        session_id: sessionId,
      });

    if (insertError && insertError.code !== "23505") {
      return NextResponse.json(
        { error: insertError.message || "Failed to like post." },
        { status: 500 },
      );
    }

    const { count, error: countError } = await supabaseAdmin
      .from("post_board_likes")
      .select("id", { count: "exact", head: true })
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .eq("post_id", postId);

    if (countError) {
      return NextResponse.json(
        { error: countError.message || "Failed to count likes." },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      liked: true,
      likeCount: count ?? 0,
      alreadyLiked: insertError?.code === "23505",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionId,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to like post." },
      { status: 500 },
    );
  }
}