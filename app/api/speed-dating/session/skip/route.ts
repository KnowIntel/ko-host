import { NextRequest, NextResponse } from "next/server";

import { skipAndRebuild, getPublicState } from "@/lib/speed-dating/db";
import { validateSkipInput } from "@/lib/speed-dating/guards";
import { ok, fail } from "@/lib/speed-dating/serializers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = validateSkipInput(body);

    await skipAndRebuild({
      sessionId: input.sessionId,
      browserKey: input.browserKey,
    });

    const state = await getPublicState(input.sessionId, "live");

    return NextResponse.json(ok({ state }));
  } catch (error) {
    console.error("SKIP ERROR:", error);

    return NextResponse.json(
      fail("Failed to skip match", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}