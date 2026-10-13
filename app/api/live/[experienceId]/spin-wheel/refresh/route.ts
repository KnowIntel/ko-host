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
        "spin_wheel",
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

    await broadcastLiveActivityChange(
      context.supabase,
      context.safeExperienceId,
      context.activity.id,
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Spin Wheel refresh failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to refresh the Live experience.",
      },
      { status: 500 },
    );
  }
}