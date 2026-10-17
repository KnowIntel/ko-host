// app/api/dashboard/microsites/[id]/progress-tracker/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: micrositeId } = await ctx.params;
    if (!UUID_RE.test(micrositeId)) {
      return errorResponse("Invalid microsite ID.", 400);
    }

    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized.", 401);

    const sb = getSupabaseAdmin();
    const { data: site, error: siteError } = await sb
      .from("microsites")
      .select("id, title, owner_clerk_user_id")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteError) {
      console.error("Progress Tracker owner site lookup failed:", siteError);
      return errorResponse("Unable to verify microsite ownership.", 500);
    }
    if (!site) return errorResponse("Microsite not found.", 404);
    if (site.owner_clerk_user_id !== userId) {
      return errorResponse("Unauthorized.", 403);
    }

    const url = new URL(request.url);
    const blockId = url.searchParams.get("blockId")?.trim() || null;
    if (blockId && blockId.length > 256) {
      return errorResponse("Invalid tracker block ID.", 400);
    }

    // Bound the result size. The interface can later add pagination for large sites.
    let statesQuery = sb
      .from("progress_tracker_states")
      .select("id, site_key, block_id, participant_id, current_targets, actuals, completed_rows, session_number, updated_at, created_at")
      .eq("site_key", micrositeId)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (blockId) statesQuery = statesQuery.eq("block_id", blockId);

    const { data: states, error: statesError } = await statesQuery;
    if (statesError) {
      console.error("Progress Tracker owner state lookup failed:", statesError);
      return errorResponse("Unable to load participant progress.", 500);
    }

    const stateIds = (states ?? []).map((state) => state.id);
    let history: Array<Record<string, unknown>> = [];
    if (stateIds.length > 0) {
      const { data, error: historyError } = await sb
        .from("progress_tracker_history")
        .select("id, state_id, session_number, snapshot, completed_at")
        .in("state_id", stateIds)
        .order("completed_at", { ascending: false })
        .limit(1000);
      if (historyError) {
        console.error("Progress Tracker owner history lookup failed:", historyError);
        return errorResponse("Unable to load tracker history.", 500);
      }
      history = data ?? [];
    }

    return NextResponse.json({
      ok: true,
      microsite: { id: site.id, title: site.title },
      states: states ?? [],
      history,
      limits: { states: 200, history: 1000 },
    });
  } catch (error) {
    console.error("Progress Tracker owner GET failed:", error);
    return errorResponse("Unable to load Progress Tracker management data.", 500);
  }
}
