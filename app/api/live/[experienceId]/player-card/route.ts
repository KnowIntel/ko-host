import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
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

    const authentication =
      await authenticateLiveParticipant(
        safeExperienceId,
      );

    if (!authentication.ok) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          error: authentication.error,
        },
        {
          status: authentication.status,
        },
      );
    }

    const participant =
      authentication.participant;

    const supabase = getSupabaseAdmin();

    const {
      data: participantRow,
      error: participantError,
    } = await supabase
      .from("live_participants")
      .select(`
        id,
        experience_id,
        display_name,
        avatar_url,
        status,
        joined_at
      `)
      .eq(
        "id",
        participant.participantId,
      )
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .maybeSingle();

    if (participantError) {
      throw participantError;
    }

    if (
      !participantRow ||
      participantRow.status !== "active"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Participant is not available.",
        },
        { status: 404 },
      );
    }

    const {
      data: pointRows,
      error: pointsError,
    } = await supabase
      .from("live_point_transactions")
      .select("amount")
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .eq(
        "participant_id",
        participant.participantId,
      );

    if (pointsError) {
      throw pointsError;
    }

    const score = (
      pointRows ?? []
    ).reduce(
      (total, row) =>
        total + Number(row.amount || 0),
      0,
    );

    return NextResponse.json({
      ok: true,

      participant: {
        id: participantRow.id,

        displayName:
          participantRow.display_name,

        avatarUrl:
          participantRow.avatar_url,

        score,

        /*
         * Team and badges remain optional until
         * participant metadata/state formally
         * supplies them.
         */
        team: null,
        badges: [],

        joinedAt:
          participantRow.joined_at,
      },
    });
  } catch (error) {
    console.error(
      "Player Card GET failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load the Player Card.",
      },
      { status: 500 },
    );
  }
}