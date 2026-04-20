import { NextRequest, NextResponse } from "next/server";

import { validatePrivateRoomInput } from "@/lib/speed-dating/guards";
import { getSessionState, getParticipantByBrowserKey } from "@/lib/speed-dating/stateStore";
import { ok, fail } from "@/lib/speed-dating/serializers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const sessionId = searchParams.get("sessionId");
    const browserKey = searchParams.get("browserKey");

    const input = validatePrivateRoomInput({
      sessionId,
      browserKey,
    });

    const session = getSessionState(input.sessionId);

    if (!session) {
      return NextResponse.json(fail("Session not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const participant = getParticipantByBrowserKey({
      sessionId: input.sessionId,
      browserKey: input.browserKey,
    });

    const currentRound = session.roundState.round;

    const pair = session.pairs.find(
      (p) =>
        p.round === currentRound &&
        (p.leftParticipantId === participant?.id ||
          p.rightParticipantId === participant?.id),
    );

    const partnerId =
      pair?.leftParticipantId === participant?.id
        ? pair?.rightParticipantId
        : pair?.rightParticipantId === participant?.id
        ? pair?.leftParticipantId
        : null;

    const partner = partnerId
      ? session.participantsById.get(partnerId) ?? null
      : null;

    return NextResponse.json(
      ok({
        roomId: pair?.roomId ?? null,
        pairId: pair?.pairId ?? null,
        round: currentRound,
        participant,
        partner,
        hasMatch: Boolean(pair && partner),
      }),
    );
  } catch (error) {
    console.error("PRIVATE ROOM ERROR:", error);

    return NextResponse.json(
      fail("Failed to fetch private room", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}