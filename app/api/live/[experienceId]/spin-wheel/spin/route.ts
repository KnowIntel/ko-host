import { NextResponse } from "next/server";
import { randomInt } from "crypto";

import {
  asLiveRecord,
  broadcastLiveActivityChange,
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
        "spin_wheel",
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

    const configuration = asLiveRecord(
      context.activity.configuration,
    );

    const options = Array.isArray(
      configuration.options,
    )
      ? configuration.options
          .map(asLiveRecord)
          .filter(
            (option) =>
              typeof option.id === "string" &&
              typeof option.label ===
                "string",
          )
      : [];

    if (!options.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This Spin Wheel has no options.",
        },
        { status: 409 },
      );
    }

    const {
      data: existingRow,
      error: existingError,
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

    if (existingError) {
      throw existingError;
    }

    const existingState =
      asLiveRecord(existingRow?.state);

    const previousSpins = Array.isArray(
      existingState.spins,
    )
      ? existingState.spins
      : [];

    if (
      previousSpins.length > 0 &&
      configuration.allowMultipleSpins !==
        true
    ) {
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

    const winner =
      options[randomInt(options.length)];

    const rawPoints =
      typeof winner.points === "number"
        ? winner.points
        : Number(winner.points);

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

    const spinNumber =
      previousSpins.length + 1;

    const sourceId =
      `${context.activity.id}:spin:${spinNumber}`;

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
        source_type: "spin_wheel",
        source_id: sourceId,
        reason: `Spin Wheel: ${winner.label}`,
      });

    if (pointError) {
      if (pointError.code === "23505") {
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

      throw pointError;
    }

    const now = new Date().toISOString();

    const result = {
      optionId: String(winner.id),
      label: String(winner.label),
      awardedPoints,
      spunAt: now,
    };

    const nextState = {
      ...existingState,
      spins: [
        ...previousSpins,
        result,
      ],
      lastSpin: result,
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
        "Spin Wheel state update failed:",
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
      result,
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