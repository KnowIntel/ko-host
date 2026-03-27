// app/api/thread/vote/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const messageId =
      typeof body?.messageId === "string" ? body.messageId.trim() : "";
    const delta =
      typeof body?.delta === "number" && Number.isFinite(body.delta)
        ? body.delta
        : 0;

    if (!messageId) {
      return badRequest("Missing messageId.");
    }

    if (delta !== 1 && delta !== -1) {
      return badRequest("Delta must be 1 or -1.");
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("microsite_thread_messages")
      .select("id, votes")
      .eq("id", messageId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: existingError?.message || "Message not found." },
        { status: 404 },
      );
    }

    const nextVotes = (existing.votes ?? 0) + delta;

    const { data, error } = await supabaseAdmin
      .from("microsite_thread_messages")
      .update({ votes: nextVotes })
      .eq("id", messageId)
      .select("id, microsite_id, thread_block_id, author_name, message_text, votes, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update vote." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update vote." },
      { status: 500 },
    );
  }
}