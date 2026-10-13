import { NextResponse } from "next/server";

import {
  broadcastLiveActivityChange,
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

    const body = await request.json().catch(() => ({}));

    const activityId =
      typeof body?.activityId === "string"
        ? body.activityId
        : undefined;

    const context =
      await getParticipantActivityRuntime(
        experienceId,
        "lottery",
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


const { data, error: entryError } =
  await context.supabase.rpc(
    "enter_live_lottery_atomic",
    {
      p_experience_id:
        context.safeExperienceId,
      p_participant_id:
        context.participant.participantId,
      p_activity_id:
        context.activity.id,
    },
  );

if (entryError) {
  const message = entryError.message || "";

  if (
    message ===
    "You have already reached the maximum number of entries"
  ) {
    return NextResponse.json(
      {
        ok: false,
        duplicate: true,
        error:
          "You have already reached the maximum number of entries.",
      },
      { status: 409 },
    );
  }

  const expectedConflicts = [
    "Live experience is not available",
    "Live participant is not active",
    "Lottery activity is not active",
    "Lottery activity is not selected",
    "Lottery activity is not current",
    "Live experience state not found",
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

  throw entryError;
}

const result = (
  Array.isArray(data) ? data[0] : data
) as {
  entry_number: number;
  entered_at: string;
  entry_count: number;
  max_entries: number;
} | null;

if (!result) {
  throw new Error(
    "Atomic Lottery entry returned no result.",
  );
}

const entry = {
  entryNumber: result.entry_number,
  enteredAt: result.entered_at,
};

const entryCount = result.entry_count;
const maxEntries = result.max_entries;


    await broadcastLiveActivityChange(
      context.supabase,
      context.safeExperienceId,
      context.activity.id,
    );

    return NextResponse.json({
      ok: true,
      entry,
      entryCount,
      maxEntries,
    });
  } catch (error) {
    console.error(
      "Lottery entry failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to enter the Lottery.",
      },
      { status: 500 },
    );
  }
}