import { NextRequest, NextResponse } from "next/server";

import { getPublicState } from "@/lib/speed-dating/db";
import { ok, fail } from "@/lib/speed-dating/serializers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const sessionId = searchParams.get("sessionId");
    const slug = searchParams.get("slug") || "live";

    if (!sessionId) {
      return NextResponse.json(fail("Missing sessionId"), { status: 400 });
    }

    const state = await getPublicState(sessionId, slug);

    return NextResponse.json(ok(state));
  } catch (error) {
    console.error("STATE API ERROR:", error);

    return NextResponse.json(
      fail("Failed to fetch state", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}