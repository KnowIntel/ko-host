// app/api/dashboard/microsites/[id]/progress-tracker/reset/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type RequestBody = { stateId?: unknown; blockId?: unknown; historyId?: unknown };

function failure(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: micrositeId } = await ctx.params;
    if (!UUID_RE.test(micrositeId)) return failure("Invalid microsite ID.", 400);

    const { userId } = await auth();
    if (!userId) return failure("Unauthorized.", 401);

    const body = (await request.json().catch(() => null)) as RequestBody | null;
    if (!body || typeof body.stateId !== "string" || !UUID_RE.test(body.stateId))
      return failure("Invalid progress state ID.", 400);
    if (typeof body.blockId !== "string" || !body.blockId.trim() || body.blockId.length > 256)
      return failure("Invalid tracker block ID.", 400);
    if (body.historyId !== undefined && (typeof body.historyId !== "string" || !UUID_RE.test(body.historyId)))
      return failure("Invalid history record ID.", 400);

    const sb = getSupabaseAdmin();
    const { data: site, error: siteError } = await sb.from("microsites")
      .select("id, owner_clerk_user_id").eq("id", micrositeId).maybeSingle();
    if (siteError) return failure("Unable to verify microsite ownership.", 500);
    if (!site) return failure("Microsite not found.", 404);
    if (site.owner_clerk_user_id !== userId) return failure("Unauthorized.", 403);

    const { data: state, error: stateError } = await sb.from("progress_tracker_states")
      .select("id").eq("id", body.stateId).eq("site_key", micrositeId)
      .eq("block_id", body.blockId).maybeSingle();
    if (stateError) return failure("Unable to verify tracker state.", 500);
    if (!state) return failure("Progress state not found.", 404);

    const { data: deletedCount, error: deleteError } = await sb.rpc(
      "clear_progress_tracker_history",
      { p_state_id: state.id, p_history_id: body.historyId ?? null },
    );
    if (deleteError) {
      console.error("Progress Tracker history cleanup failed:", deleteError);
      return failure("Unable to delete completed-session history.", 500);
    }

    return NextResponse.json({ ok: true, deletedCount: Number(deletedCount ?? 0) });
  } catch (error) {
    console.error("Progress Tracker history cleanup failed:", error);
    return failure("Unable to delete completed-session history.", 500);
  }
}
