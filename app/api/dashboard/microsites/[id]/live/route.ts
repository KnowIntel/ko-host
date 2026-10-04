// app\api\dashboard\microsites\[id]\live\route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeExperienceName(value: unknown) {
  const name = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);

  return name || "Live Experience";
}

async function getOwnedMicrosite(
  micrositeId: string,
  userId: string,
) {
  const sb = getSupabaseAdmin();

  const { data: site, error } = await sb
    .from("microsites")
    .select(
      "id, slug, title, owner_clerk_user_id",
    )
    .eq("id", micrositeId)
    .maybeSingle();

  if (error || !site) {
    return {
      site: null,
      status: 404,
      error: "Microsite not found.",
    };
  }

  if (site.owner_clerk_user_id !== userId) {
    return {
      site: null,
      status: 401,
      error: "Unauthorized.",
    };
  }

  return {
    site,
    status: 200,
    error: null,
  };
}

export async function GET(
  _req: Request,
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

    const ownership =
      await getOwnedMicrosite(
        micrositeId,
        userId,
      );

    if (!ownership.site) {
      return NextResponse.json(
        {
          ok: false,
          error: ownership.error,
        },
        { status: ownership.status },
      );
    }

    const sb = getSupabaseAdmin();

    const {
      data: experience,
      error: experienceError,
    } = await sb
      .from("live_experiences")
      .select(`
        id,
        microsite_id,
        owner_clerk_user_id,
        name,
        status,
        is_enabled,
        started_at,
        ended_at,
        created_at,
        updated_at
      `)
      .eq("microsite_id", micrositeId)
      .maybeSingle();

    if (experienceError) {
      console.error(
        "Live experience lookup failed:",
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

    return NextResponse.json({
      ok: true,
      experience: experience
        ? {
            id: experience.id,
            micrositeId:
              experience.microsite_id,
            name: experience.name,
            status: experience.status,
            isEnabled:
              experience.is_enabled,
            startedAt:
              experience.started_at,
            endedAt:
              experience.ended_at,
            createdAt:
              experience.created_at,
            updatedAt:
              experience.updated_at,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Live experience GET error:",
      error,
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
}

export async function POST(
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

    const ownership =
      await getOwnedMicrosite(
        micrositeId,
        userId,
      );

    if (!ownership.site) {
      return NextResponse.json(
        {
          ok: false,
          error: ownership.error,
        },
        { status: ownership.status },
      );
    }

    const body =
      await req.json().catch(() => ({}));

    const name = normalizeExperienceName(
      body?.name ||
        ownership.site.title ||
        "Live Experience",
    );

    const sb = getSupabaseAdmin();

    /*
     * One Live experience per microsite.
     *
     * If it already exists, enable it and update
     * its owner/name. Otherwise create it.
     */
    const {
      data: existingExperience,
      error: existingError,
    } = await sb
      .from("live_experiences")
      .select("id")
      .eq("microsite_id", micrositeId)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Live experience lookup failed:",
        existingError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to enable Live experience.",
        },
        { status: 500 },
      );
    }

    let experience:
      | {
          id: string;
          microsite_id: string;
          name: string;
          status: string;
          is_enabled: boolean;
          started_at: string | null;
          ended_at: string | null;
        }
      | null = null;

    if (existingExperience) {
      const {
        data,
        error,
      } = await sb
        .from("live_experiences")
        .update({
          owner_clerk_user_id: userId,
          name,
          is_enabled: true,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", existingExperience.id)
        .select(
          "id, microsite_id, name, status, is_enabled, started_at, ended_at",
        )
        .single();

      if (error || !data) {
        console.error(
          "Live experience update failed:",
          error,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to enable Live experience.",
          },
          { status: 500 },
        );
      }

      experience = data;
    } else {
      const {
        data,
        error,
      } = await sb
        .from("live_experiences")
        .insert({
          microsite_id: micrositeId,
          owner_clerk_user_id: userId,
          name,
          status: "before",
          is_enabled: true,
        })
        .select(
          "id, microsite_id, name, status, is_enabled, started_at, ended_at",
        )
        .single();

      if (error || !data) {
        console.error(
          "Live experience creation failed:",
          error,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to enable Live experience.",
          },
          { status: 500 },
        );
      }

      experience = data;
    }

    /*
     * Ensure every Live experience has exactly one
     * shared-state row.
     *
     * The database UNIQUE(experience_id) constraint
     * makes this safe to call repeatedly.
     */
    const {
      error: stateError,
    } = await sb
      .from("live_experience_state")
      .upsert(
        {
          experience_id: experience.id,
        },
        {
          onConflict: "experience_id",
          ignoreDuplicates: true,
        },
      );

    if (stateError) {
      console.error(
        "Live shared-state initialization failed:",
        stateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Live was created, but its shared state could not be initialized.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,

      experience: {
        id: experience.id,
        micrositeId:
          experience.microsite_id,
        name: experience.name,
        status: experience.status,
        isEnabled:
          experience.is_enabled,
        startedAt:
          experience.started_at,
        endedAt:
          experience.ended_at,
      },
    });
  } catch (error) {
    console.error(
      "Live experience POST error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to enable Live experience.",
      },
      { status: 500 },
    );
  }
}

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

    const ownership = await getOwnedMicrosite(
      micrositeId,
      userId,
    );

    if (!ownership.site) {
      return NextResponse.json(
        {
          ok: false,
          error: ownership.error,
        },
        { status: ownership.status },
      );
    }

    const body =
      await req.json().catch(() => ({}));

    const requestedStatus = String(
      body?.status ?? "",
    )
      .trim()
      .toLowerCase();

    const validStatuses = [
      "before",
      "live",
      "paused",
      "ended",
      "after",
    ] as const;

    type LiveStatus =
      (typeof validStatuses)[number];

    if (
      !validStatuses.includes(
        requestedStatus as LiveStatus,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid Live status.",
        },
        { status: 400 },
      );
    }

    const nextStatus =
      requestedStatus as LiveStatus;

    const sb = getSupabaseAdmin();

    const {
      data: experience,
      error: experienceError,
    } = await sb
      .from("live_experiences")
      .select(
        "id, microsite_id, name, status, is_enabled, started_at, ended_at",
      )
      .eq("microsite_id", micrositeId)
      .maybeSingle();

    if (experienceError) {
      console.error(
        "Live experience lookup failed:",
        experienceError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to update Live experience.",
        },
        { status: 500 },
      );
    }

    if (!experience) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Live has not been enabled for this microsite.",
        },
        { status: 404 },
      );
    }

    const now = new Date().toISOString();

    const updatePayload: {
      status: LiveStatus;
      updated_at: string;
      started_at?: string | null;
      ended_at?: string | null;
    } = {
      status: nextStatus,
      updated_at: now,
    };

    /*
     * First transition into Live records when the
     * experience actually started.
     */
    if (
      nextStatus === "live" &&
      !experience.started_at
    ) {
      updatePayload.started_at = now;
    }

    /*
     * Moving to ended records the end time.
     */
    if (nextStatus === "ended") {
      updatePayload.ended_at = now;
    }

    /*
     * Returning to a pre/post-running state clears
     * timestamps where appropriate.
     */
    if (nextStatus === "before") {
      updatePayload.started_at = null;
      updatePayload.ended_at = null;
    }

    if (
      nextStatus === "live" ||
      nextStatus === "paused"
    ) {
      updatePayload.ended_at = null;
    }

    const {
      data: updatedExperience,
      error: updateError,
    } = await sb
      .from("live_experiences")
      .update(updatePayload)
      .eq("id", experience.id)
      .eq(
        "owner_clerk_user_id",
        userId,
      )
      .select(
        "id, microsite_id, name, status, is_enabled, started_at, ended_at",
      )
      .single();

    if (updateError || !updatedExperience) {
      console.error(
        "Live lifecycle update failed:",
        updateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to update Live experience.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,

      experience: {
        id: updatedExperience.id,
        micrositeId:
          updatedExperience.microsite_id,
        name: updatedExperience.name,
        status: updatedExperience.status,
        isEnabled:
          updatedExperience.is_enabled,
        startedAt:
          updatedExperience.started_at,
        endedAt:
          updatedExperience.ended_at,
      },
    });
  } catch (error) {
    console.error(
      "Live experience PATCH error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to update Live experience.",
      },
      { status: 500 },
    );
  }
}