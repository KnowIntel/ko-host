import { NextRequest, NextResponse } from "next/server";

import { validateJoinInput } from "@/lib/speed-dating/guards";
import { joinParticipant } from "@/lib/speed-dating/stateStore";
import { buildPublicState, ok, fail } from "@/lib/speed-dating/serializers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input = validateJoinInput(body);

    const { session, participant } = joinParticipant({
      sessionId: input.sessionId,
      slug: input.slug,
      browserKey: input.browserKey,
      name: input.name,
      title: input.title,
      bio: input.bio,
      iam: input.iam,
      seeking: input.seeking,
      imageUrl: input.imageUrl ?? null,
    });

    const publicState = buildPublicState({
      sessionId: session.sessionId,
      slug: session.slug,
      roundState: session.roundState,
      leftQueueEntries: session.leftQueue,
      rightQueueEntries: session.rightQueue,
      participantsById: session.participantsById,
      pairs: session.pairs,
    });

    return NextResponse.json(
      ok({
        participant,
        state: publicState,
      }),
    );
  } catch (error) {
    console.error("JOIN ERROR:", error);

    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : "Join failed",
        "BAD_REQUEST",
      ),
      { status: 400 },
    );
  }
}