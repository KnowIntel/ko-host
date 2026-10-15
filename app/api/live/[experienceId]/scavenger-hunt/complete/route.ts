
import { NextResponse } from "next/server";

import {
  asLiveRecord,
  broadcastLiveActivityChange,
  cleanLiveId,
  getParticipantActivityRuntime,
} from "@/lib/live/participantActivityRuntime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AtomicCompletionResult = {
  item_id: string;
  awarded_points: number;
  completed_count: number;
  total_items: number;
  all_completed: boolean;
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

    const body =
      await request.json().catch(() => ({}));

    const activityId =
      typeof body?.activityId === "string"
        ? body.activityId
        : undefined;

    const context =
      await getParticipantActivityRuntime(
        experienceId,
        "scavenger_hunt",
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
     * Preserve existing participant input handling.
     */
    const input = asLiveRecord(body);

    const itemId = cleanLiveId(input.itemId);

    const responseText = String(
      input.responseText ?? "",
    )
      .trim()
      .slice(0, 1000);

    if (!itemId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Scavenger Hunt item is required.",
        },
        { status: 400 },
      );
    }

    /*
     * The database function atomically handles:
     *
     * - Experience and participant validation
     * - Activity status and selection validation
     * - Configured item validation
     * - Duplicate completion prevention
     * - Point transaction insertion
     * - Completion history merging
     * - Completion count calculation
     * - Final completion timestamp
     */
    const isEdit = input.isEdit === true;

    if (isEdit) {
      const { data: updated, error: updateError } =
        await context.supabase.rpc(
          "update_live_scavenger_hunt_response_atomic",
          {
            p_experience_id: context.safeExperienceId,
            p_participant_id: context.participant.participantId,
            p_activity_id: context.activity.id,
            p_item_id: itemId,
            p_response_text: responseText,
          },
        );

      if (updateError) {
        const message = updateError.message || "";

        if (
          message === "Scavenger Hunt completion not found" ||
          message === "Scavenger Hunt item is not completed"
        ) {
          return NextResponse.json(
            { ok: false, error: message },
            { status: 409 },
          );
        }

        throw updateError;
      }

      await broadcastLiveActivityChange(
        context.supabase,
        context.safeExperienceId,
        context.activity.id,
      );

      return NextResponse.json({
        ok: true,
        itemId,
        updated: updated === true,
        awardedPoints: 0,
      });
    }

    const {
      data,
      error,
    } = await context.supabase.rpc(
      "complete_live_scavenger_hunt_item_atomic",
      {
        p_experience_id:
          context.safeExperienceId,
        p_participant_id:
          context.participant.participantId,
        p_activity_id:
          context.activity.id,
        p_item_id: itemId,
        p_response_text: responseText,
      },
    );

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            ok: false,
            duplicate: true,
            error:
              "You already completed this item.",
          },
          { status: 409 },
        );
      }

      const message = error.message || "";

      if (
        message ===
        "You already completed this item"
      ) {
        return NextResponse.json(
          {
            ok: false,
            duplicate: true,
            error:
              "You already completed this item.",
          },
          { status: 409 },
        );
      }

      const invalidInputErrors = [
        "Scavenger Hunt item is required",
        "Invalid Scavenger Hunt item",
      ];

      if (invalidInputErrors.includes(message)) {
        return NextResponse.json(
          {
            ok: false,
            error: message,
          },
          { status: 400 },
        );
      }

      const activityConflicts = [
        "Live experience is not available",
        "Live participant is not active",
        "Scavenger Hunt activity is not active",
        "Scavenger Hunt activity is not selected",
        "Scavenger Hunt activity is not current",
        "Live experience state not found",
      ];

      if (activityConflicts.includes(message)) {
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
    ) as AtomicCompletionResult | null;

    if (!result) {
      throw new Error(
        "Atomic Scavenger Hunt completion returned no result.",
      );
    }

    /*
     * Notify connected clients after the
     * database transaction succeeds.
     */
    await broadcastLiveActivityChange(
      context.supabase,
      context.safeExperienceId,
      context.activity.id,
    );

    /*
     * Preserve the response structure expected
     * by the existing Scavenger Hunt component.
     */
    return NextResponse.json({
      ok: true,
      itemId: result.item_id,
      awardedPoints: result.awarded_points,
      completedCount: result.completed_count,
      totalItems: result.total_items,
      allCompleted: result.all_completed,
    });
  } catch (error) {
    console.error(
      "Scavenger Hunt completion failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to complete this Scavenger Hunt item.",
      },
      { status: 500 },
    );
  }
}
