import { NextResponse } from "next/server";

type Message = {
  id: string;
  roomId: string;
  senderId: string;
  text?: string;
  createdAt: number;
};

declare global {
  var __KOHOST_SPEED_DATING_ROOM_MESSAGES__:
    | {
        messages: Message[];
      }
    | undefined;
}

function getStore() {
  if (!globalThis.__KOHOST_SPEED_DATING_ROOM_MESSAGES__) {
    globalThis.__KOHOST_SPEED_DATING_ROOM_MESSAGES__ = {
      messages: [],
    };
  }

  return globalThis.__KOHOST_SPEED_DATING_ROOM_MESSAGES__;
}

function makeId() {
  return `msg_${Math.random().toString(36).slice(2, 10)}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId") || "";

  if (!roomId) {
    return NextResponse.json(
      { ok: false, error: "roomId required" },
      { status: 400 },
    );
  }

  const store = getStore();

  const messages = store.messages
    .filter((m) => m.roomId === roomId)
    .sort((a, b) => a.createdAt - b.createdAt);

  return NextResponse.json({ ok: true, messages });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const roomId = typeof body?.roomId === "string" ? body.roomId.trim() : "";
  const senderId = typeof body?.senderId === "string" ? body.senderId.trim() : "";
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!roomId || !senderId || !text) {
    return NextResponse.json(
      { ok: false, error: "roomId, senderId, and text required" },
      { status: 400 },
    );
  }

  const store = getStore();

  const message: Message = {
    id: makeId(),
    roomId,
    senderId,
    text,
    createdAt: Date.now(),
  };

  const exists = store.messages.some(
    (m) =>
      m.roomId === message.roomId &&
      m.senderId === message.senderId &&
      m.text === message.text &&
      Math.abs(m.createdAt - message.createdAt) < 1000,
  );

  if (!exists) {
    store.messages.push(message);
  }

  store.messages = store.messages.slice(-500);

  return NextResponse.json({ ok: true, message });
}