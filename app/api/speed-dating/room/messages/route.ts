import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import { validateSendMessageInput } from "@/lib/speed-dating/guards";
import { ok, fail } from "@/lib/speed-dating/serializers";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const roomId = searchParams.get("roomId");
    if (!roomId) {
      return NextResponse.json(fail("Missing roomId"), { status: 400 });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("speed_dating_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const messages = (data ?? []).map((row) => ({
      id: row.id,
      roomId: row.room_id,
      senderId: row.sender_participant_id,
      text: row.text,
      imageUrl: row.image_url,
      createdAt: row.created_at,
    }));

    return NextResponse.json(ok({ messages }));
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    return NextResponse.json(
      fail("Failed to fetch messages", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = validateSendMessageInput(body);

    const supabase = getAdminClient();

    const { data: participant, error: participantError } = await supabase
      .from("speed_dating_participants")
      .select("id")
      .eq("session_id", input.sessionId)
      .eq("browser_key", input.browserKey)
      .maybeSingle();

    if (participantError) {
      throw participantError;
    }

    if (!participant) {
      return NextResponse.json(fail("Participant not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const { data: session, error: sessionError } = await supabase
      .from("speed_dating_sessions")
      .select("round, phase")
      .eq("session_id", input.sessionId)
      .single();

    if (sessionError) {
      throw sessionError;
    }

    if (session.phase !== "active") {
      return NextResponse.json(
        fail("Chat is closed during transition", "CONFLICT"),
        { status: 409 },
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("speed_dating_messages")
      .insert({
        session_id: input.sessionId,
        room_id: input.roomId,
        round: session.round,
        sender_participant_id: participant.id,
        type: input.type,
        text: input.text ?? null,
        image_url: input.imageUrl ?? null,
      })
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    const message = {
      id: inserted.id,
      roomId: inserted.room_id,
      senderId: inserted.sender_participant_id,
      text: inserted.text,
      imageUrl: inserted.image_url,
      createdAt: inserted.created_at,
    };

    return NextResponse.json(ok({ message }));
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : "Send failed",
        "BAD_REQUEST",
      ),
      { status: 400 },
    );
  }
}