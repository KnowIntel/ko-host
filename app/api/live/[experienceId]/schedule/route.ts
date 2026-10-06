import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  try {
    const { experienceId } = await params;

    const safeExperienceId = String(
      experienceId || "",
    )
      .trim()
      .toLowerCase();

    if (!UUID_PATTERN.test(safeExperienceId)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid Live experience.",
        },
        { status: 400 },
      );
    }

    const authentication =
      await authenticateLiveParticipant(
        safeExperienceId,
      );

    if (!authentication.ok) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          error: authentication.error,
        },
        {
          status: authentication.status,
        },
      );
    }

    const supabase = getSupabaseAdmin();

    const {
      data: entries,
      error,
    } = await supabase
      .from("live_schedule_entries")
      .select(`
        id,
        title,
        description,
        starts_at,
        ends_at,
        status,
        sort_order
      `)
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .neq("status", "cancelled")
      .order("sort_order", {
        ascending: true,
      })
      .order("starts_at", {
        ascending: true,
        nullsFirst: false,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,

      entries: (entries ?? []).map(
        (entry) => ({
          id: entry.id,
          title: entry.title,
          description:
            entry.description,
          startsAt:
            entry.starts_at,
          endsAt:
            entry.ends_at,
          status: entry.status,
        }),
      ),
    });
  } catch (error) {
    console.error(
      "Live Schedule GET failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load the Live Schedule.",
      },
      { status: 500 },
    );
  }
}