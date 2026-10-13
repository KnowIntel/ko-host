
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const micrositeId = id.trim().toLowerCase();

    if (!UUID_PATTERN.test(micrositeId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid microsite." },
        { status: 400 },
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const sb = getSupabaseAdmin();

    const { data: microsite, error: micrositeError } = await sb
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
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { data: experience, error: experienceError } = await sb
      .from("live_experiences")
      .select("id")
      .eq("microsite_id", micrositeId)
      .eq("owner_clerk_user_id", userId)
      .maybeSingle();

    if (experienceError || !experience) {
      return NextResponse.json(
        { ok: false, error: "Live experience not found." },
        { status: experienceError ? 500 : 404 },
      );
    }

    const body = await req.json().catch(() => null);

        if (
      body?.allowMultipleActiveActivities === true &&
      process.env.ENABLE_MULTIPLE_LIVE_ACTIVITIES !== "true"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Multiple Activity Mode is not yet enabled.",
        },
        { status: 403 },
      );
    }

    if (
      !body ||
      typeof body.allowMultipleActiveActivities !== "boolean" ||
      !Array.isArray(body.activeActivityIds) ||
      body.activeActivityIds.some(
        (id: unknown) =>
          typeof id !== "string" || !UUID_PATTERN.test(id),
      )
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid activity selection." },
        { status: 400 },
      );
    }

    const activityIds: string[] = [
      ...new Set(
        (body.activeActivityIds as string[]).map((id) =>
          id.toLowerCase(),
        ),
      ),
    ];

    if (
      !body.allowMultipleActiveActivities &&
      activityIds.length > 1
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Single Activity Mode allows one selection.",
        },
        { status: 400 },
      );
    }

    const { data: sharedState, error: stateError } = await sb.rpc(
      "update_live_activity_selection_atomic",
      {
        p_experience_id: experience.id,
        p_allow_multiple: body.allowMultipleActiveActivities,
        p_activity_ids: activityIds,
      },
    );

    if (stateError || !sharedState) {
      console.error("Live selection update failed:", stateError);

      return NextResponse.json(
        { ok: false, error: "Unable to update activity selection." },
        { status: 500 },
      );
    }

    const channel = sb.channel(`live-experience-${experience.id}`);

    try {
      await channel.send({
        type: "broadcast",
        event: "shared-state-changed",
        payload: {
          experienceId: experience.id,
          updatedAt: sharedState.updated_at,
        },
      });
    } catch (error) {
      console.error("Live selection broadcast failed:", error);
    } finally {
      await sb.removeChannel(channel);
    }

    return NextResponse.json({
      ok: true,
      sharedState: {
        currentActivityType: sharedState.current_activity_type,
        currentActivityId: sharedState.current_activity_id,
        state: sharedState.state ?? {},
        updatedAt: sharedState.updated_at,
      },
    });
  } catch (error) {
    console.error("Live selection PATCH error:", error);

    return NextResponse.json(
      { ok: false, error: "Unable to update activity selection." },
      { status: 500 },
    );
  }
}
