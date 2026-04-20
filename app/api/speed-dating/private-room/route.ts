import { NextRequest, NextResponse } from "next/server";

import {
  getParticipantByBrowserKey,
  getSessionState,
} from "@/lib/speed-dating/stateStore";
import { validatePrivateRoomInput } from "@/lib/speed-dating/guards";
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

    const me = getParticipantByBrowserKey({
      sessionId: input.sessionId,
      browserKey: input.browserKey,
    });

    if (!me) {
      return NextResponse.json(fail("Participant not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const currentRound = session.roundState.round;

    const pair =
      session.roundState.phase === "active"
        ? session.pairs.find(
            (p) =>
              p.round === currentRound &&
              (p.leftParticipantId === me.id || p.rightParticipantId === me.id),
          ) ?? null
        : null;

    const otherParticipantId =
      pair?.leftParticipantId === me.id
        ? pair.rightParticipantId
        : pair?.rightParticipantId === me.id
        ? pair.leftParticipantId
        : null;

    const otherParticipant = otherParticipantId
      ? session.participantsById.get(otherParticipantId) ?? null
      : null;

    const oppositeQueue =
      me.iam === "man" ? session.rightQueue : session.leftQueue;

const upcomingQueue = oppositeQueue
  .map((entry) => session.participantsById.get(entry.participantId) ?? null)
  .filter(Boolean)
  .filter((participant) => participant!.active)
  .filter((participant) => participant!.id !== otherParticipantId)
  .filter((participant) => participant!.id !== me.id) as typeof me[];

    const roomId =
      pair?.roomId ?? `waiting_${session.sessionId}_${me.id}`;

    return NextResponse.json(
      ok({
        roomId,
        pairId: pair?.pairId ?? null,
        sessionId: session.sessionId,
        slug: session.slug,
        round: session.roundState.round,
        phase: session.roundState.phase,
        roundDurationSeconds: session.roundState.roundDurationSeconds,
        transitionDurationSeconds: session.roundState.transitionDurationSeconds,
        roundStartedAt: session.roundState.roundStartedAt,
        roundEndsAt: session.roundState.roundEndsAt,
        phaseStartedAt: session.roundState.phaseStartedAt,
        phaseEndsAt: session.roundState.phaseEndsAt,
        serverNow: session.roundState.serverNow,
        me,
        otherParticipant,
        upcomingQueue,
        hasMatch: Boolean(pair && otherParticipant),
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