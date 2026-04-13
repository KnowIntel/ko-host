import { NextResponse } from "next/server";

type Message = {
  id: string;
  sessionId: string;
  senderId: string;
  text?: string;
  attachmentUrl?: string;
  createdAt: number;
};

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
  .filter((m) => m.sessionId === sessionId)
  .sort((a, b) => a.createdAt - b.createdAt);

  return NextResponse.json({
    ok: true,
    messages,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

const sessionId =
  typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
const senderId =
  typeof body?.senderId === "string" ? body.senderId.trim() : "";
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

const exists = store.messages.some(
  (m) =>
    m.sessionId === message.sessionId &&
    m.senderId === message.senderId &&
    m.text === message.text &&
    Math.abs(m.createdAt - message.createdAt) < 1000
);

if (!exists) {
  store.messages.push(message);
}

store.messages = store.messages.slice(-500);

  return NextResponse.json({
    ok: true,
    message,
  });
}