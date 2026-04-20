import { NextRequest, NextResponse } from "next/server";

import { joinAndRebuild, getPublicState } from "@/lib/speed-dating/db";
import { validateJoinInput } from "@/lib/speed-dating/guards";
import { ok, fail } from "@/lib/speed-dating/serializers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = validateJoinInput(body);

    const result = await joinAndRebuild({
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

    const state = await getPublicState(input.sessionId, input.slug);

    return NextResponse.json(
      ok({
        participant: result.participant,
        state,
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