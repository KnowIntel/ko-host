import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
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
          error: "Invalid Live experience.",
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    /*
     * Confirm that this Live experience is enabled and belongs
     * to a microsite that is currently publicly available.
     */
    const {
      data: experience,
      error: experienceError,
    } = await supabase
      .from("live_experiences")
      .select(`
        id,
        status,
        is_enabled,
        microsites!inner (
          id,
          is_published,
          is_active,
          paid_until
        )
      `)
      .eq("id", safeExperienceId)
      .maybeSingle();

    if (experienceError) {
      console.error(
        "Live experience state access lookup failed:",
        experienceError,
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to load Live experience.",
        },
        { status: 500 },
      );
    }

    const microsite = experience
      ? Array.isArray(experience.microsites)
        ? experience.microsites[0]
        : experience.microsites
      : null;

    const paidUntil = microsite?.paid_until
      ? new Date(microsite.paid_until).getTime()
      : 0;

    const experienceAvailable =
      Boolean(experience) &&
      experience?.is_enabled === true &&
      Boolean(microsite) &&
      microsite?.is_published === true &&
      microsite?.is_active === true &&
      Number.isFinite(paidUntil) &&
      paidUntil > Date.now();

    if (!experienceAvailable) {
      return NextResponse.json(
        {
          ok: false,
          error: "Live experience unavailable.",
        },
        { status: 404 },
      );
    }

    const {
      data: sharedState,
      error: stateError,
    } = await supabase
      .from("live_experience_state")
      .select(`
        experience_id,
        current_activity_type,
        current_activity_id,
        state,
        updated_at
      `)
      .eq("experience_id", safeExperienceId)
      .maybeSingle();

    if (stateError) {
      console.error(
        "Live shared state lookup failed:",
        stateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to load Live state.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,

      experience: {
        id: experience.id,
        status: experience.status,
      },

      sharedState: sharedState
        ? {
            currentActivityType:
              sharedState.current_activity_type,
            currentActivityId:
              sharedState.current_activity_id,
            state:
              sharedState.state ?? {},
            updatedAt:
              sharedState.updated_at,
          }
        : {
            currentActivityType: null,
            currentActivityId: null,
            state: {},
            updatedAt: null,
          },
    });
  } catch (error) {
    console.error(
      "Live shared state restore error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load Live state.",
      },
      { status: 500 },
    );
  }
}