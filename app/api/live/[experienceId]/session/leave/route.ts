import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildLiveParticipantCookieName,
  hashLiveParticipantToken,
} from "@/lib/live/participantSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      experienceId: string;
    }>;
  },
) {
  try {
    const { experienceId } = await params;

    const safeExperienceId = String(
      experienceId || "",
    )
      .trim()
      .toLowerCase();

    if (!UUID_PATTERN.test(safeExperienceId)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid Live experience.",
        },
        { status: 400 },
      );
    }

    const cookieName =
      buildLiveParticipantCookieName(
        safeExperienceId,
      );

    const token =
      request.cookies.get(cookieName)?.value ?? "";

    /*
     * If a credential exists, invalidate its database
     * session before clearing the browser cookie.
     */
    if (token) {
      const tokenHash =
        hashLiveParticipantToken(token);

      const supabase = getSupabaseAdmin();

      const { error } = await supabase
        .from("live_participant_sessions")
        .delete()
        .eq("experience_id", safeExperienceId)
        .eq("token_hash", tokenHash);

      if (error) {
        console.error(
          "Live participant session removal failed:",
          error,
        );

        return NextResponse.json(
          {
            ok: false,
            error: "Unable to leave the Live session.",
          },
          { status: 500 },
        );
      }
    }

    const response = NextResponse.json({
      ok: true,
    });

    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(
      "Live participant leave error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to leave the Live session.",
      },
      { status: 500 },
    );
  }
}