import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const store =
    globalThis.__KOHOST_SPEED_DATING_STORE__ as
      | {
          sessions: Record<string, any>;
        }
      | undefined;

  if (!store) {
    return NextResponse.json({ ok: true, session: null });
  }

  const session = store.sessions?.[sessionId] ?? null;

  return NextResponse.json({
    ok: true,
    session,
  });
}