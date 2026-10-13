
import { NextResponse } from "next/server";

import {
  asLiveRecord,
  getParticipantActivityRuntime,
} from "@/lib/live/participantActivityRuntime";

import {
  readLiveActivitySelection,
} from "@/lib/live/activitySelection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      experienceId: string;
    }>;
  },
) {
  const { experienceId } = await params;

  /*
   * Resolve the requested Lottery activity.
   *
   * Single Activity Mode:
   * The helper uses the current activity.
   *
   * Multiple Activity Mode:
   * The helper validates the requested
   * activity against the selected IDs.
   */
  const activityId = new URL(
    request.url,
  ).searchParams.get("activityId");

  const context =
    await getParticipantActivityRuntime(
      experienceId,
      "lottery",
      activityId ?? undefined,
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
   * Load Lottery configuration.
   */
  const configuration = asLiveRecord(
    context.activity.configuration,
  );

  /*
   * Load this participant's entries
   * for this specific Lottery activity.
   */
  const {
    data: participantState,
    error: participantStateError,
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

  if (participantStateError) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load Lottery entries.",
      },
      { status: 500 },
    );
  }

  /*
   * Read the shared Live runtime state
   * and determine the current mode.
   */
  const runtimeState = asLiveRecord(
    context.sharedState.state,
  );

  const selection =
    readLiveActivitySelection(runtimeState);

  /*
   * Multiple Activity Mode:
   * Each Lottery has its own winner.
   *
   * Single Activity Mode:
   * Preserve the legacy shared winner.
   */
  const activityRuntime = asLiveRecord(
    runtimeState.activityRuntime,
  );

  const currentActivityRuntime =
    asLiveRecord(
      activityRuntime[context.activity.id],
    );

  const winnerSource =
    selection.allowMultipleActiveActivities
      ? currentActivityRuntime.lotteryWinner
      : runtimeState.lotteryWinner;

  const winner = asLiveRecord(
    winnerSource,
  );

  /*
   * Return the selected Lottery,
   * participant entries, and winner.
   */
  return NextResponse.json({
    ok: true,

    activity: {
      id: context.activity.id,
      name: context.activity.name,

      maxEntriesPerParticipant:
        typeof configuration.maxEntriesPerParticipant ===
        "number"
          ? configuration.maxEntriesPerParticipant
          : 1,
    },

    participantState: asLiveRecord(
      participantState?.state,
    ),

    winner,
  });
}
