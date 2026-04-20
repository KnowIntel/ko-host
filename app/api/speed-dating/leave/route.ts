import { NextRequest, NextResponse } from "next/server";

import { validateLeaveInput } from "@/lib/speed-dating/guards";
import { leaveParticipant } from "@/lib/speed-dating/stateStore";
import { buildPublicState, ok, fail } from "@/lib/speed-dating/serializers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input = validateLeaveInput(body);

    const session = leaveParticipant({
      sessionId: input.sessionId,
      browserKey: input.browserKey,
    });

    if (!session) {
      return NextResponse.json(fail("Session not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const publicState = buildPublicState({
      sessionId: session.sessionId,
      slug: session.slug,
      roundState: session.roundState,
      leftQueueEntries: session.leftQueue,
      rightQueueEntries: session.rightQueue,
      participantsById: session.participantsById,
      pairs: session.pairs,
    });

    return NextResponse.json(ok({ state: publicState }));
  } catch (error) {
    console.error("LEAVE ERROR:", error);

    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : "Leave failed",
        "BAD_REQUEST",
      ),
      { status: 400 },
    );
  }
}