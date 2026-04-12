// app\api\speed-dating\session\message\route.ts
import { NextResponse } from "next/server";

/* ========= TYPES ========= */

type Message = {
  id: string;
  sessionId: string;
  senderId: string;
  text?: string;
  attachmentUrl?: string;
  createdAt: number;
};

/* ========= GLOBAL STORE ========= */

declare global {
  var __KOHOST_SPEED_DATING_CHAT__:
    | {
        messages: Message[];
      }
    | undefined;
}

function getChatStore() {
  if (!globalThis.__KOHOST_SPEED_DATING_CHAT__) {
    globalThis.__KOHOST_SPEED_DATING_CHAT__ = {
      messages: [],
    };
  }
  return globalThis.__KOHOST_SPEED_DATING_CHAT__;
}

function makeId() {
  return `msg_${Math.random().toString(36).slice(2, 10)}`;
}

/* ========= GET (fetch messages for session) ========= */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId required" },
      { status: 400 },
    );
  }

  const store = getChatStore();

  const messages = store.messages
    .filter((m) => String(m.sessionId) === String(sessionId))
    .sort((a, b) => a.createdAt - b.createdAt);

  return NextResponse.json({
    ok: true,
    messages,
  });
}

/* ========= POST (send message) ========= */

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const sessionId =
    typeof body?.sessionId === "string" ? body.sessionId : "";
  const senderId =
    typeof body?.senderId === "string" ? body.senderId : "";
  const text =
    typeof body?.text === "string" ? body.text : "";
  const attachmentUrl =
    typeof body?.attachmentUrl === "string" ? body.attachmentUrl : "";

  if (!sessionId || !senderId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!text && !attachmentUrl) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const store = getChatStore();

  const message: Message = {
    id: makeId(),
    sessionId,
    senderId,
    text,
    attachmentUrl,
    createdAt: Date.now(),
  };

  store.messages.push(message);

  return NextResponse.json({
    ok: true,
    message,
  });
}