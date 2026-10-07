//  app\api\live\[experienceId]\session\route.ts

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

export async function GET(
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
          authenticated: false,
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

    if (!token) {
      return NextResponse.json({
        ok: true,
        authenticated: false,
        participant: null,
      });
    }

    const tokenHash =
      hashLiveParticipantToken(token);

    const supabase = getSupabaseAdmin();

    const {
      data: session,
      error: sessionError,
    } = await supabase
      .from("live_participant_sessions")
      .select(`
        id,
        participant_id,
        experience_id,
        expires_at,
        last_used_at,
        live_participants!inner (
          id,
          experience_id,
          display_name,
          avatar_url,
          status,
          joined_at,
          last_seen_at
        )
      `)
      .eq("experience_id", safeExperienceId)
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (sessionError) {
      console.error(
        "Live participant session lookup failed:",
        sessionError,
      );

      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          error: "Unable to restore your Live session.",
        },
        { status: 500 },
      );
    }

    const participant = session
      ? Array.isArray(session.live_participants)
        ? session.live_participants[0]
        : session.live_participants
      : null;

    const expiresAt = session?.expires_at
      ? new Date(session.expires_at).getTime()
      : 0;

    const sessionValid =
      Boolean(session) &&
      Boolean(participant) &&
      participant?.experience_id ===
        safeExperienceId &&
      participant?.status === "active" &&
      Number.isFinite(expiresAt) &&
      expiresAt > Date.now();

    if (!sessionValid) {
      /*
       * Remove the unusable browser credential.
       * Expired DB session cleanup can happen separately.
       */
      const response = NextResponse.json({
        ok: true,
        authenticated: false,
        participant: null,
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
    }

    const now = new Date().toISOString();

    /*
     * Best-effort activity timestamps.
     * Failure here should not invalidate an otherwise
     * legitimate participant session.
     */
    await Promise.all([
      supabase
        .from("live_participant_sessions")
        .update({
          last_used_at: now,
        })
        .eq("id", session!.id),

      supabase
        .from("live_participants")
        .update({
          last_seen_at: now,
          updated_at: now,
        })
        .eq("id", participant.id),
    ]);

    return NextResponse.json({
      ok: true,
      authenticated: true,

      participant: {
        id: participant.id,
        experienceId:
          participant.experience_id,
        displayName:
          participant.display_name,
        avatarUrl:
          participant.avatar_url,
        status:
          participant.status,
        joinedAt:
          participant.joined_at,
      },
    });
  } catch (error) {
    console.error(
      "Live participant session restore error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        error: "Unable to restore your Live session.",
      },
      { status: 500 },
    );
  }
}