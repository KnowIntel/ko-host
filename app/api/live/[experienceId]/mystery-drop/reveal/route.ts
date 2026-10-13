
import { NextResponse } from "next/server";

import {
  broadcastLiveActivityChange,
  getParticipantActivityRuntime,
} from "@/lib/live/participantActivityRuntime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AtomicRevealRow = {
  drop_id: string;
  drop_title: string;
  drop_content: string;
  awarded_points: number;
  revealed_at: string;
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

    /*
     * Resolve the requested activity.
     *
     * Single Activity Mode:
     * Uses the current activity.
     *
     * Multiple Activity Mode:
     * Uses the explicitly selected activity.
     */
    const body = await request
      .json()
      .catch(() => ({}));

    const activityId =
      typeof body?.activityId === "string"
        ? body.activityId
        : undefined;

    const context =
      await getParticipantActivityRuntime(
        experienceId,
        "mystery_drop",
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
     * Perform the complete reveal in one
     * database transaction.
     *
     * The function:
     * - Revalidates activity selection.
     * - Reads the current drop.
     * - Calculates awarded points.
     * - Inserts the point transaction.
     * - Merges participant reveal history.
     *
     * If either write fails, the entire
     * operation is rolled back.
     */
    const {
      data,
      error,
    } = await context.supabase.rpc(
      "reveal_live_mystery_drop_atomic",
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
      /*
       * Existing unique index prevents
       * duplicate rewards for the same
       * participant, activity, and drop.
       */
      if (error.code === "23505") {
        return NextResponse.json(
          {
            ok: false,
            duplicate: true,
            error:
              "You already revealed this Mystery Drop.",
          },
          { status: 409 },
        );
      }

      /*
       * Expected validation failures
       * from the atomic database function.
       */
      const message = error.message || "";

      if (
        message ===
          "There is no Mystery Drop available right now" ||
        message ===
          "The current Mystery Drop is unavailable" ||
        message ===
          "Mystery Drop activity is not selected" ||
        message ===
          "Mystery Drop activity is not current" ||
        message ===
          "Mystery Drop activity is not active" ||
        message ===
          "Live participant is not active"
      ) {
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

    /*
     * The SQL function returns one row
     * containing the authoritative result.
     */
    const result = (
      Array.isArray(data)
        ? data[0]
        : data
    ) as AtomicRevealRow | null;

    if (!result) {
      throw new Error(
        "Atomic Mystery Drop reveal returned no result.",
      );
    }

    /*
     * Notify connected clients after the
     * database transaction succeeds.
     *
     * Notification failures should not
     * incorrectly report that the reward
     * transaction itself failed.
     */
    try {
      await broadcastLiveActivityChange(
        context.supabase,
        context.safeExperienceId,
        context.activity.id,
      );
    } catch (broadcastError) {
      console.error(
        "Mystery Drop broadcast failed:",
        broadcastError,
      );
    }

    return NextResponse.json({
      ok: true,

      drop: {
        id: result.drop_id,

        title: result.drop_title,

        content: result.drop_content,

        awardedPoints:
          result.awarded_points,

        revealedAt:
          result.revealed_at,
      },
    });
  } catch (error) {
    console.error(
      "Mystery Drop reveal failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to reveal the Mystery Drop.",
      },
      { status: 500 },
    );
  }
}
