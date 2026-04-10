import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const browserKey = searchParams.get("browserKey");

  if (!browserKey) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const store =
    globalThis.__KOHOST_SPEED_DATING_STORE__ as
      | {
          participants: any[];
          sessions: Record<string, any>;
        }
      | undefined;

  if (!store) {
    return NextResponse.json({ ok: true, session: null });
  }

  const participant = store.participants.find(
    (p) => p.browserKey === browserKey,
  );

  if (!participant) {
    return NextResponse.json({ ok: true, session: null });
  }

  const activeSession = Object.values(store.sessions || {}).find(
    (s: any) =>
      s.leftParticipant?.id === participant.id ||
      s.rightParticipant?.id === participant.id,
  );

  return NextResponse.json({
    ok: true,
    session: activeSession || null,
    participantId: participant.id,
  });
}