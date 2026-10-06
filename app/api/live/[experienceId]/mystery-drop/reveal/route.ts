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

    const context =
      await getParticipantActivityRuntime(
        experienceId,
        "mystery_drop",
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

    const runtimeState = asLiveRecord(
      context.sharedState.state,
    );

    const currentDropId = cleanLiveId(
      runtimeState.currentDropId,
    );

    if (!currentDropId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "There is no Mystery Drop available right now.",
        },
        { status: 409 },
      );
    }

    const configuration = asLiveRecord(
      context.activity.configuration,
    );

    const drops = Array.isArray(
      configuration.drops,
    )
      ? configuration.drops.map(
          asLiveRecord,
        )
      : [];

    const drop = drops.find(
      (candidate) =>
        cleanLiveId(candidate.id) ===
        currentDropId,
    );

    if (!drop) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "The current Mystery Drop is unavailable.",
        },
        { status: 409 },
      );
    }

    const rawPoints =
      typeof drop.points === "number"
        ? drop.points
        : Number(drop.points);

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
      `${context.activity.id}:${currentDropId}`;

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
        source_type: "mystery_drop",
        source_id: sourceId,
        reason: `Mystery Drop: ${String(
          drop.title || "Drop",
        )}`,
      });

    if (pointError) {
      if (pointError.code === "23505") {
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

    const revealedDrops =
      asLiveRecord(
        existingState.revealedDrops,
      );

    const now = new Date().toISOString();

    const nextState = {
      ...existingState,
      revealedDrops: {
        ...revealedDrops,
        [currentDropId]: {
          revealedAt: now,
          awardedPoints,
        },
      },
    };

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
          state: nextState,
          updated_at: now,
        },
        {
          onConflict:
            "participant_id,activity_id",
        },
      );

    if (stateError) {
      console.error(
        "Mystery Drop state update failed:",
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

      drop: {
        id: currentDropId,
        title: String(
          drop.title || "",
        ),
        content: String(
          drop.content || "",
        ),
        awardedPoints,
        revealedAt: now,
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