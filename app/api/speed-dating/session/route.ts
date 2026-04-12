import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "default";

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

  const store = stores?.[sessionId];

  if (!store) {
    return NextResponse.json({ ok: true, session: null });
  }

  const session = store.sessions?.[sessionId] || null;

  return NextResponse.json({
    ok: true,
    session,
  });
}