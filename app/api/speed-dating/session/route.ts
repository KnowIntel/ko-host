import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const stores =
    globalThis.__KOHOST_SPEED_DATING_STORE__ as
      | Record<
          string,
          {
            participants: any[];
            sessions: Record<string, any>;
          }
        >
      | undefined;

  if (!stores) {
    return NextResponse.json({ ok: true, session: null });
  }

  for (const store of Object.values(stores)) {
    const session = store.sessions?.[sessionId];
    if (session) {
      return NextResponse.json({
        ok: true,
        session,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    session: null,
  });
}