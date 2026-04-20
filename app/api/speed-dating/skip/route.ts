import { NextRequest, NextResponse } from "next/server";

import { validateSkipInput } from "@/lib/speed-dating/guards";
import { skipParticipant } from "@/lib/speed-dating/stateStore";
import { buildPublicState, ok, fail } from "@/lib/speed-dating/serializers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input = validateSkipInput(body);

    const session = skipParticipant({
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
    console.error("SKIP ERROR:", error);

    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : "Skip failed",
        "BAD_REQUEST",
      ),
      { status: 400 },
    );
  }
}