import { NextRequest, NextResponse } from "next/server";

import { validateSkipInput } from "@/lib/speed-dating/guards";
import { skipAndRebuild, getPublicState } from "@/lib/speed-dating/db";
import { ok, fail } from "@/lib/speed-dating/serializers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = validateSkipInput(body);

    // ✅ DB-based skip (NO more stateStore)
    await skipAndRebuild({
      sessionId: input.sessionId,
      browserKey: input.browserKey,
    });

    // ✅ Always rebuild fresh public state from DB
    const state = await getPublicState(input.sessionId, "live");

    return NextResponse.json(ok({ state }));
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