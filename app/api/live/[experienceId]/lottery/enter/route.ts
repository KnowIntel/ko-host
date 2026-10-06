import { NextResponse } from "next/server";

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

    const rawMax =
      Number(
        configuration.maxEntriesPerParticipant,
      );

    const maxEntries =
      Number.isFinite(rawMax)
        ? Math.max(
            1,
            Math.min(
              Math.trunc(rawMax),
              100,
            ),
          )
        : 1;

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

    const entries = Array.isArray(
      existingState.entries,
    )
      ? existingState.entries
      : [];

    if (entries.length >= maxEntries) {
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

    const now = new Date().toISOString();

    const entry = {
      entryNumber: entries.length + 1,
      enteredAt: now,
    };

    const nextEntries = [
      ...entries,
      entry,
    ];

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
            entries: nextEntries,
            entryCount:
              nextEntries.length,
          },
          updated_at: now,
        },
        {
          onConflict:
            "participant_id,activity_id",
        },
      );

    if (stateError) {
      throw stateError;
    }

    await broadcastLiveActivityChange(
      context.supabase,
      context.safeExperienceId,
      context.activity.id,
    );

    return NextResponse.json({
      ok: true,
      entry,
      entryCount: nextEntries.length,
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