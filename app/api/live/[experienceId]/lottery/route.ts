import { NextResponse } from "next/server";

import {
  asLiveRecord,
  getParticipantActivityRuntime,
} from "@/lib/live/participantActivityRuntime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const { experienceId } = await params;

  const context =
    await getParticipantActivityRuntime(
      experienceId,
      "lottery",
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

  const {
    data: participantState,
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

  const runtimeState = asLiveRecord(
    context.sharedState.state,
  );

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

    participantState:
      asLiveRecord(
        participantState?.state,
      ),

    winner:
      asLiveRecord(
        runtimeState.lotteryWinner,
      ),
  });
}