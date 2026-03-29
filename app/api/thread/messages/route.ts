// app/api/thread/messages/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const micrositeId = searchParams.get("micrositeId")?.trim();
    const threadBlockId = searchParams.get("threadBlockId")?.trim();

    if (!micrositeId) {
      return badRequest("Missing micrositeId.");
    }

    if (!threadBlockId) {
      return badRequest("Missing threadBlockId.");
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("microsite_thread_messages")
      .select(
        "id, microsite_id, thread_block_id, author_name, message_text, votes, created_at, updated_at",
      )
      .eq("microsite_id", micrositeId)
      .eq("thread_block_id", threadBlockId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load thread messages." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      messages: data ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load thread messages." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const micrositeId =
      typeof body?.micrositeId === "string" ? body.micrositeId.trim() : "";
    const threadBlockId =
      typeof body?.threadBlockId === "string" ? body.threadBlockId.trim() : "";
    const authorName =
      typeof body?.authorName === "string" ? body.authorName.trim() : "";
    const messageText =
      typeof body?.messageText === "string" ? body.messageText.trim() : "";

    if (!micrositeId) {
      return badRequest("Missing micrositeId.");
    }

    if (!threadBlockId) {
      return badRequest("Missing threadBlockId.");
    }

    if (!messageText) {
      return badRequest("Message text is required.");
    }

    const safeAuthorName = authorName || "Guest";

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("microsite_thread_messages")
      .insert({
        microsite_id: micrositeId,
        thread_block_id: threadBlockId,
        author_name: safeAuthorName,
        message_text: messageText,
        votes: 0,
      })
      .select(
        "id, microsite_id, thread_block_id, author_name, message_text, votes, created_at, updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create thread message." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create thread message." },
      { status: 500 },
    );
  }
}