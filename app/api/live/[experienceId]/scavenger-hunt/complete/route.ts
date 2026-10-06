import { NextResponse } from "next/server";

import {
  asLiveRecord,
  broadcastLiveActivityChange,
  cleanLiveId,
  getParticipantActivityRuntime,
} from "@/lib/live/participantActivityRuntime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const context =
      await getParticipantActivityRuntime(
        experienceId,
        "scavenger_hunt",
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

    const body =
      await request.json().catch(() => ({}));

    const itemId = cleanLiveId(
      asLiveRecord(body).itemId,
    );

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

    const configuration = asLiveRecord(
      context.activity.configuration,
    );

    const items = Array.isArray(
      configuration.items,
    )
      ? configuration.items.map(
          asLiveRecord,
        )
      : [];

    const item = items.find(
      (candidate) =>
        cleanLiveId(candidate.id) ===
        itemId,
    );

    if (!item) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid Scavenger Hunt item.",
        },
        { status: 400 },
      );
    }

    const rawPoints =
      typeof item.points === "number"
        ? item.points
        : Number(item.points);

    const awardedPoints =
      Number.isFinite(rawPoints)
        ? Math.max(
            0,
            Math.min(
              Math.trunc(rawPoints),
              100000,
            ),
          )
        : 0;

    const sourceId =
      `${context.activity.id}:${itemId}`;

    const {
      error: pointError,
    } = await context.supabase
      .from("live_point_transactions")
      .insert({
        experience_id:
          context.safeExperienceId,
        participant_id:
          context.participant.participantId,
        amount: awardedPoints,
        source_type:
          "scavenger_hunt_item",
        source_id: sourceId,
        reason: `Scavenger Hunt: ${String(
          item.title || "Item",
        )}`,
      });

    if (pointError) {
      if (pointError.code === "23505") {
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

      throw pointError;
    }

    const {
      data: existingRow,
    } = await context.supabase
      .from(
        "live_participant_activity_state",
      )
      .select("state")
      .eq(
        "experience_id",
        context.safeExperienceId,
      )
      .eq(
        "participant_id",
        context.participant.participantId,
      )
      .eq(
        "activity_id",
        context.activity.id,
      )
      .maybeSingle();

    const existingState =
      asLiveRecord(existingRow?.state);

    const completedItems =
      asLiveRecord(
        existingState.completedItems,
      );

    const now = new Date().toISOString();

    const nextCompletedItems = {
      ...completedItems,
      [itemId]: {
        completedAt: now,
        awardedPoints,
      },
    };

    const completedCount =
      Object.keys(
        nextCompletedItems,
      ).length;

    const allCompleted =
      items.length > 0 &&
      completedCount >= items.length;

    const {
      error: stateError,
    } = await context.supabase
      .from(
        "live_participant_activity_state",
      )
      .upsert(
        {
          experience_id:
            context.safeExperienceId,
          participant_id:
            context.participant.participantId,
          activity_id:
            context.activity.id,
          state: {
            ...existingState,
            completedItems:
              nextCompletedItems,
            completedCount,
          },
          completed_at: allCompleted
            ? now
            : null,
          updated_at: now,
        },
        {
          onConflict:
            "participant_id,activity_id",
        },
      );

    if (stateError) {
      console.error(
        "Scavenger Hunt state update failed:",
        stateError,
      );
    }

    await broadcastLiveActivityChange(
      context.supabase,
      context.safeExperienceId,
      context.activity.id,
    );

    return NextResponse.json({
      ok: true,
      itemId,
      awardedPoints,
      completedCount,
      totalItems: items.length,
      allCompleted,
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