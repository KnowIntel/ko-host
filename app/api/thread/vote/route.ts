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

    const { data, error } = await supabaseAdmin.rpc(
      "increment_thread_vote",
      {
        message_id_input: messageId,
        delta_input: delta,
      },
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update vote." },
        { status: 500 },
      );
    }

    const resolvedMessage = Array.isArray(data) ? data[0] : data;

    if (!resolvedMessage) {
      return NextResponse.json(
        { error: "Vote update returned no message." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: {
        id: String(
          (resolvedMessage as any).id ??
            (resolvedMessage as any).message_id ??
            messageId,
        ),
        votes: Number(
          (resolvedMessage as any).votes ??
            (resolvedMessage as any).vote_count ??
            0,
        ),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update vote." },
      { status: 500 },
    );
  }
}