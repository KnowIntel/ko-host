import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: Request,
  ctx: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await ctx.params;

    const micrositeId = String(id || "")
      .trim()
      .toLowerCase();

    if (!UUID_PATTERN.test(micrositeId)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid microsite.",
        },
        { status: 400 },
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const sb = getSupabaseAdmin();

    const {
      data: microsite,
      error: micrositeError,
    } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("id", micrositeId)
      .maybeSingle();

    if (
      micrositeError ||
      !microsite ||
      microsite.owner_clerk_user_id !== userId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const {
      data: experience,
      error: experienceError,
    } = await sb
      .from("live_experiences")
      .select("id")
      .eq("microsite_id", micrositeId)
      .eq("owner_clerk_user_id", userId)
      .maybeSingle();

    if (experienceError) {
      console.error(
        "Live experience lookup failed:",
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

    if (!experience) {
      return NextResponse.json(
        {
          ok: false,
          error: "Live has not been enabled for this microsite.",
        },
        { status: 404 },
      );
    }

    const body = await req.json().catch(() => ({}));

    const rawState =
      body?.state &&
      typeof body.state === "object" &&
      !Array.isArray(body.state)
        ? body.state
        : {};

    const currentActivityType =
      typeof body?.currentActivityType === "string" &&
      body.currentActivityType.trim()
        ? body.currentActivityType.trim().slice(0, 100)
        : null;

    const requestedActivityId =
      typeof body?.currentActivityId === "string"
        ? body.currentActivityId.trim().toLowerCase()
        : "";

    if (
      requestedActivityId &&
      !UUID_PATTERN.test(requestedActivityId)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid Live activity.",
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    const {
      data: sharedState,
      error: stateError,
    } = await sb
      .from("live_experience_state")
      .upsert(
        {
          experience_id: experience.id,
          current_activity_type: currentActivityType,
          current_activity_id:
            requestedActivityId || null,
          state: rawState,
          updated_at: now,
        },
        {
          onConflict: "experience_id",
        },
      )
      .select(`
        experience_id,
        current_activity_type,
        current_activity_id,
        state,
        updated_at
      `)
      .single();

    if (stateError || !sharedState) {
      console.error(
        "Live shared-state update failed:",
        stateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to update Live state.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      sharedState: {
        currentActivityType:
          sharedState.current_activity_type,
        currentActivityId:
          sharedState.current_activity_id,
        state: sharedState.state ?? {},
        updatedAt: sharedState.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Live shared-state PATCH error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update Live state.",
      },
      { status: 500 },
    );
  }
}