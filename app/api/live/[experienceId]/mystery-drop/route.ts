
import { NextResponse } from "next/server";

import {
  asLiveRecord,
  cleanLiveId,
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
   * Resolve the requested Mystery Drop activity.
   *
   * Single Activity Mode:
   * Uses the legacy current activity.
   *
   * Multiple Activity Mode:
   * Uses the explicitly selected activity ID.
   */
  const activityId = new URL(
    request.url,
  ).searchParams.get("activityId");

  const context =
    await getParticipantActivityRuntime(
      experienceId,
      "mystery_drop",
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
   * Load this Mystery Drop's configuration.
   */
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

  /*
   * Determine whether the experience
   * is using Single or Multiple Activity Mode.
   */
  const runtimeState = asLiveRecord(
    context.sharedState.state,
  );

  const selection =
    readLiveActivitySelection(runtimeState);

  /*
   * Multiple Activity Mode:
   * Read the selected drop from this
   * activity's independent runtime state.
   *
   * Single Activity Mode:
   * Preserve the legacy shared drop.
   */
  const activityRuntime = asLiveRecord(
    runtimeState.activityRuntime,
  );

  const currentActivityRuntime =
    asLiveRecord(
      activityRuntime[context.activity.id],
    );

  const activeDropSource =
    selection.allowMultipleActiveActivities
      ? currentActivityRuntime.currentDropId
      : runtimeState.currentDropId;

  const activeDropId = cleanLiveId(
    activeDropSource,
  );

  /*
   * Verify that the active drop exists
   * in this activity's configuration.
   */
  const activeDrop = drops.find(
    (drop) =>
      cleanLiveId(drop.id) ===
      activeDropId,
  );

  /*
   * Load this participant's state for
   * this specific Mystery Drop activity.
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
          "Unable to load Mystery Drop participant state.",
      },
      { status: 500 },
    );
  }

  /*
   * Return this activity's active drop
   * and this participant's independent state.
   */
  return NextResponse.json({
    ok: true,

    activity: {
      id: context.activity.id,
      name: context.activity.name,
    },

    activeDrop: activeDrop
      ? {
          id: activeDropId,
          title: String(
            activeDrop.title || "",
          ),
        }
      : null,

    participantState: asLiveRecord(
      participantState?.state,
    ),
  });
}
