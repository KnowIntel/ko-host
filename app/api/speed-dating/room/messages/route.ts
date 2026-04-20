import { NextRequest, NextResponse } from "next/server";

import { validateSendMessageInput } from "@/lib/speed-dating/guards";
import { ok, fail } from "@/lib/speed-dating/serializers";

/* TEMP IN-MEMORY STORE */
type Message = {
  id: string;
  roomId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  createdAt: number;
};

const messagesStore = new Map<string, Message[]>();

function createMessageId() {
  return `msg_${Math.random().toString(36).slice(2, 10)}`;
}

/* ================= GET ================= */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(fail("Missing roomId"), { status: 400 });
    }

    const messages = messagesStore.get(roomId) ?? [];

    return NextResponse.json(ok({ messages }));
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    return NextResponse.json(
      fail("Failed to fetch messages", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}

/* ================= POST ================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input = validateSendMessageInput(body);

    const message: Message = {
      id: createMessageId(),
      roomId: input.roomId,
      senderId: input.browserKey,
      text: input.text,
      imageUrl: input.imageUrl,
      createdAt: Date.now(),
    };

    const existing = messagesStore.get(input.roomId) ?? [];
    messagesStore.set(input.roomId, [...existing, message]);

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