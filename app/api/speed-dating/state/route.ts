import { NextRequest, NextResponse } from "next/server";

import { getOrCreateSessionState } from "@/lib/speed-dating/stateStore";
import { buildPublicState, ok, fail } from "@/lib/speed-dating/serializers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const sessionId = searchParams.get("sessionId");
    const slug = searchParams.get("slug") || "live";

    if (!sessionId) {
      return NextResponse.json(fail("Missing sessionId"), { status: 400 });
    }

    const session = getOrCreateSessionState({
      sessionId,
      slug,
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

    return NextResponse.json(ok(publicState));
  } catch (error) {
    console.error("STATE API ERROR:", error);
    return NextResponse.json(
      fail("Failed to fetch state", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}