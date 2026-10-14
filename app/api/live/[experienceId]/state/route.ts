// app\api\live\[experienceId]\state\route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getSupabaseAdmin,
} from "@/lib/supabaseAdmin";

import {
  readLiveActivitySelection,
} from "@/lib/live/activitySelection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UnknownRecord = Record<string, unknown>;

function asRecord(
  value: unknown,
): UnknownRecord {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

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
     * Confirm that this Live experience
     * is enabled and its microsite is
     * publicly available.
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
          error:
            "Unable to load Live experience.",
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
      ? new Date(
          microsite.paid_until,
        ).getTime()
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
          error:
            "Live experience unavailable.",
        },
        { status: 404 },
      );
    }

    /*
     * Load the experience's shared state.
     */
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
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .maybeSingle();

    if (stateError) {
      console.error(
        "Live shared state lookup failed:",
        stateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live state.",
        },
        { status: 500 },
      );
    }

    /*
     * Read and normalize the activity
     * selection configuration.
     */
    const runtimeState = asRecord(
      sharedState?.state,
    );

    const selection =
      readLiveActivitySelection(runtimeState);

    const allowMultipleActiveActivities =
      selection.allowMultipleActiveActivities;

    /*
     * Single Activity Mode:
     * Use the existing current activity.
     *
     * Multiple Activity Mode:
     * Use the explicitly selected IDs.
     */
    const selectedActivityIds =
      allowMultipleActiveActivities
        ? selection.activeActivityIds
        : sharedState?.current_activity_id &&
            UUID_PATTERN.test(
              sharedState.current_activity_id,
            )
          ? [sharedState.current_activity_id]
          : [];

    /*
     * Retrieve only activities belonging
     * to this experience that are active.
     *
     * Do not expose inactive or unrelated
     * activities through activeActivities.
     */
    let activeActivities: Array<{
      id: string;
      activityType: string;
      name: string;
    }> = [];

    if (selectedActivityIds.length > 0) {
      const {
        data: activities,
        error: activitiesError,
      } = await supabase
        .from("live_activities")
        .select(
          "id, activity_type, name, status",
        )
        .eq(
          "experience_id",
          safeExperienceId,
        )
        .eq("status", "active")
        .in(
          "id",
          selectedActivityIds,
        );

      if (activitiesError) {
        console.error(
          "Live active activities lookup failed:",
          activitiesError,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to load active Live activities.",
          },
          { status: 500 },
        );
      }

      const activitiesById = new Map(
        (activities ?? []).map(
          (activity) => [
            activity.id,
            activity,
          ],
        ),
      );

      /*
       * Preserve the host's selected
       * activity ordering.
       */
      activeActivities =
        selectedActivityIds.flatMap(
          (id) => {
            const activity =
              activitiesById.get(id);

            return activity
              ? [
                  {
                    id: activity.id,
                    activityType:
                      activity.activity_type,
                    name: activity.name,
                  },
                ]
              : [];
          },
        );
    }

    /*
     * Return existing legacy fields
     * alongside the new selection fields.
     */
    return NextResponse.json({
      ok: true,

      experience: {
        id: experience.id,
        status: experience.status,
      },

      sharedState: {
        currentActivityType:
          sharedState?.current_activity_type ??
          null,

        currentActivityId:
          sharedState?.current_activity_id ??
          null,

        state: runtimeState,

        updatedAt:
          sharedState?.updated_at ?? null,

        allowMultipleActiveActivities,

        activeActivityIds:
          activeActivities.map(
            (activity) => activity.id,
          ),

        activeActivities,
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
        error:
          "Unable to load Live state.",
      },
      { status: 500 },
    );
  }
}
