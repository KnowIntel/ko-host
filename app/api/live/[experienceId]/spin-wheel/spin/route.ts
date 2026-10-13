
import { NextResponse } from "next/server";

import {
  getParticipantActivityRuntime,
} from "@/lib/live/participantActivityRuntime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AtomicSpinResult = {
  option_id: string;
  option_label: string;
  awarded_points: number;
  spun_at: string;
};

export async function POST(
  request: Request,
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

    const body = await request.json().catch(() => ({}));

    const activityId =
      typeof body?.activityId === "string"
        ? body.activityId
        : undefined;

    const context =
      await getParticipantActivityRuntime(
        experienceId,
        "spin_wheel",
        activityId,
      );

    if (!context.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: context.error,
        },
        { status: context.status },
      );
    }

    /*
     * The database function handles:
     *
     * - Experience and participant validation
     * - Activity selection and status validation
     * - Random winner selection
     * - Multiple-spin eligibility
     * - Sequential spin numbering
     * - Point transaction insertion
     * - Participant history updates
     *
     * All operations occur atomically.
     */
    const {
      data,
      error,
    } = await context.supabase.rpc(
      "spin_live_wheel_atomic",
      {
        p_experience_id:
          context.safeExperienceId,
        p_participant_id:
          context.participant.participantId,
        p_activity_id:
          context.activity.id,
      },
    );

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            ok: false,
            duplicate: true,
            error:
              "This spin was already recorded.",
          },
          { status: 409 },
        );
      }

      const message = error.message || "";

      if (message === "You already spun this wheel") {
        return NextResponse.json(
          {
            ok: false,
            duplicate: true,
            error:
              "You already spun this wheel.",
          },
          { status: 409 },
        );
      }

      const expectedConflicts = [
        "Live experience is not available",
        "Live participant is not active",
        "Spin Wheel activity is not active",
        "Spin Wheel activity is not selected",
        "Spin Wheel activity is not current",
        "Live experience state not found",
        "This Spin Wheel has no options",
      ];

      if (expectedConflicts.includes(message)) {
        return NextResponse.json(
          {
            ok: false,
            error: message,
          },
          { status: 409 },
        );
      }

      throw error;
    }

    const result = (
      Array.isArray(data) ? data[0] : data
    ) as AtomicSpinResult | null;

    if (!result) {
      throw new Error(
        "Atomic Spin Wheel operation returned no result.",
      );
    }

    /*
     * Preserve the response structure expected
     * by the existing Spin Wheel component.
     */
    return NextResponse.json({
      ok: true,
      result: {
        optionId: result.option_id,
        label: result.option_label,
        awardedPoints: result.awarded_points,
        spunAt: result.spun_at,
      },
    });
  } catch (error) {
    console.error(
      "Spin Wheel POST failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to spin the wheel.",
      },
      { status: 500 },
    );
  }
}
