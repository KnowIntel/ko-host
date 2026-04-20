import { NextRequest, NextResponse } from "next/server";

import { getPublicStateParts } from "@/lib/speed-dating/stateStore";
import { buildPublicState, ok, fail } from "@/lib/speed-dating/serializers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const sessionId = searchParams.get("sessionId");
    const slug = searchParams.get("slug") || "";

    if (!sessionId) {
      return NextResponse.json(fail("Missing sessionId"), { status: 400 });
    }

    const parts = getPublicStateParts(sessionId);

    if (!parts) {
      return NextResponse.json(
        ok({
          sessionId,
          slug,
          round: 0,
          roundDurationSeconds: 120,
          roundStartedAt: new Date().toISOString(),
          roundEndsAt: new Date(Date.now() + 120 * 1000).toISOString(),
          serverNow: new Date().toISOString(),
          queues: {
            leftQueue: [],
            rightQueue: [],
          },
          activePairs: [],
        }),
      );
    }

    const publicState = buildPublicState({
      sessionId: parts.sessionId,
      slug: parts.slug || slug,
      roundState: parts.roundState,
      leftQueueEntries: parts.leftQueueEntries,
      rightQueueEntries: parts.rightQueueEntries,
      participantsById: parts.participantsById,
      pairs: parts.pairs,
    });

    return NextResponse.json(ok(publicState));
  } catch (error) {
    console.error("STATE API ERROR:", error);
    return NextResponse.json(
      fail("Failed to fetch state", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}