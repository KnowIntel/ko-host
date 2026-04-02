// app/api/thread/messages/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 2000;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function clampLimit(limit: number) {
  return Math.min(MAX_LIMIT, Math.max(1, limit));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const micrositeId = searchParams.get("micrositeId")?.trim() || "";
    const threadBlockId = searchParams.get("threadBlockId")?.trim() || "";
    const sort = searchParams.get("sort")?.trim() || "created_desc";
    const limit = clampLimit(
      parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT),
    );

    if (!micrositeId) {
      return badRequest("Missing micrositeId.");
    }

    if (!threadBlockId) {
      return badRequest("Missing threadBlockId.");
    }

    const supabaseAdmin = getSupabaseAdmin();

    const baseQuery = supabaseAdmin
      .from("microsite_thread_messages")
      .select(
        "id, microsite_id, thread_block_id, author_name, message_text, votes, created_at, updated_at",
      )
      .eq("microsite_id", micrositeId)
      .eq("thread_block_id", threadBlockId);

    let orderedQuery;

    if (sort === "votes_desc") {
      orderedQuery = baseQuery
        .order("votes", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false });
    } else if (sort === "created_asc") {
      orderedQuery = baseQuery
        .order("created_at", { ascending: true, nullsFirst: true })
        .order("id", { ascending: true });
    } else {
      orderedQuery = baseQuery
        .order("created_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false });
    }

    const { data, error } = await orderedQuery.limit(limit);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load thread messages." },
        { status: 500 },
      );
    }

    const messages = Array.isArray(data) ? data : [];

    return NextResponse.json(
      {
        messages,
        count: messages.length,
        micrositeId,
        threadBlockId,
        sort,
        limit,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
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

    return NextResponse.json(
      {
        message: data,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create thread message." },
      { status: 500 },
    );
  }
}