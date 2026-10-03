import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  LIVE_PARTICIPANT_SESSION_MAX_AGE,
  buildLiveParticipantCookieName,
  buildLiveParticipantSessionExpiry,
  createLiveParticipantToken,
  hashLiveParticipantToken,
} from "@/lib/live/participantSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_DISPLAY_NAME_LENGTH = 50;

function normalizeDisplayName(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_DISPLAY_NAME_LENGTH);
}

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
  let participantId: string | null = null;

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

    const body = await request.json().catch(() => null);

    const displayName = normalizeDisplayName(
      body?.displayName,
    );

    if (!displayName) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enter a display name.",
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    /*
     * Validate the Live experience and its parent microsite
     * before creating a participant.
     */
    const {
      data: experience,
      error: experienceError,
    } = await supabase
      .from("live_experiences")
      .select(`
        id,
        microsite_id,
        status,
        is_enabled,
        microsites!inner (
          id,
          is_published,
          is_active,
          paid_until
        )
      `)
      .eq("id", safeExperienceId)
      .maybeSingle();

    if (experienceError) {
      console.error(
        "Live experience lookup failed:",
        experienceError,
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to join this Live experience.",
        },
        { status: 500 },
      );
    }

    if (!experience || !experience.is_enabled) {
      return NextResponse.json(
        {
          ok: false,
          error: "This Live experience is not available.",
        },
        { status: 404 },
      );
    }

    const microsite = Array.isArray(
      experience.microsites,
    )
      ? experience.microsites[0]
      : experience.microsites;

    const paidUntil = microsite?.paid_until
      ? new Date(microsite.paid_until).getTime()
      : 0;

    const micrositeAvailable =
      Boolean(microsite) &&
      microsite.is_published === true &&
      microsite.is_active !== false &&
      Number.isFinite(paidUntil) &&
      paidUntil > Date.now();

    if (!micrositeAvailable) {
      return NextResponse.json(
        {
          ok: false,
          error: "This Live experience is not available.",
        },
        { status: 404 },
      );
    }

    /*
     * Create the participant.
     */
    const {
      data: participant,
      error: participantError,
    } = await supabase
      .from("live_participants")
      .insert({
        experience_id: safeExperienceId,
        display_name: displayName,
        status: "active",
      })
      .select(
        "id, experience_id, display_name, avatar_url, status, joined_at",
      )
      .single();

    if (participantError || !participant) {
      console.error(
        "Live participant creation failed:",
        participantError,
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to join this Live experience.",
        },
        { status: 500 },
      );
    }

    participantId = participant.id;

    /*
     * Generate an opaque browser credential.
     *
     * Only its SHA-256 hash is persisted.
     * The raw token exists only in the HttpOnly cookie.
     */
    const token = createLiveParticipantToken();
    const tokenHash =
      hashLiveParticipantToken(token);

    const expiresAt =
      buildLiveParticipantSessionExpiry();

    const { error: sessionError } =
      await supabase
        .from("live_participant_sessions")
        .insert({
          participant_id: participant.id,
          experience_id: safeExperienceId,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        });

    if (sessionError) {
      console.error(
        "Live participant session creation failed:",
        sessionError,
      );

      /*
       * Don't leave an orphan participant behind when
       * session creation fails.
       */
      await supabase
        .from("live_participants")
        .delete()
        .eq("id", participant.id);

      participantId = null;

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to create your Live session.",
        },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      ok: true,

      participant: {
        id: participant.id,
        experienceId: participant.experience_id,
        displayName: participant.display_name,
        avatarUrl: participant.avatar_url,
        status: participant.status,
        joinedAt: participant.joined_at,
      },

      experience: {
        id: experience.id,
        status: experience.status,
      },
    });

    response.cookies.set(
      buildLiveParticipantCookieName(
        safeExperienceId,
      ),
      token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV === "production",
        path: "/",
        maxAge:
          LIVE_PARTICIPANT_SESSION_MAX_AGE,
      },
    );

    return response;
  } catch (error) {
    console.error(
      "Live participant join error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to join this Live experience.",
      },
      { status: 500 },
    );
  }
}