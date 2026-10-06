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
      data: announcements,
      error,
    } = await supabase
      .from("live_announcements")
      .select(`
        id,
        title,
        message,
        published_at
      `)
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .eq("status", "published")
      .order("published_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,

      announcements:
        (announcements ?? []).map(
          (announcement) => ({
            id: announcement.id,

            title:
              announcement.title,

            message:
              announcement.message,

            publishedAt:
              announcement.published_at,
          }),
        ),
    });
  } catch (error) {
    console.error(
      "Announcements GET failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load announcements.",
      },
      { status: 500 },
    );
  }
}