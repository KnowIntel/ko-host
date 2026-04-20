import { NextRequest, NextResponse } from "next/server";

import { leaveAndCleanup, getPublicState } from "@/lib/speed-dating/db";
import { validateLeaveInput } from "@/lib/speed-dating/guards";
import { ok, fail } from "@/lib/speed-dating/serializers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = validateLeaveInput(body);

    await leaveAndCleanup({
      sessionId: input.sessionId,
      browserKey: input.browserKey,
    });

    const state = await getPublicState(input.sessionId, "live");

    return NextResponse.json(ok({ state }));
  } catch (error) {
    console.error("LEAVE ERROR:", error);

    return NextResponse.json(
      fail("Failed to leave session", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}