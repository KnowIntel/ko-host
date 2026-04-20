import { NextRequest, NextResponse } from "next/server";

import { getPrivateRoom } from "@/lib/speed-dating/db";
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

    const room = await getPrivateRoom({
      sessionId: input.sessionId,
      browserKey: input.browserKey,
    });

    if (!room) {
      return NextResponse.json(fail("Participant not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    return NextResponse.json(ok(room));
  } catch (error) {
    console.error("PRIVATE ROOM ERROR:", error);

    return NextResponse.json(
      fail("Failed to fetch private room", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}