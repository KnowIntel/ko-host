// app/api/dashboard/microsites/[id]/progress-tracker/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TrackerInfo = {
  id: string;
  title: string;
  pageId: string | null;
  pageSlug: string | null;
};

type DraftBlock = {
  id?: unknown;
  type?: unknown;
  data?: { title?: unknown } | null;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function blocksFromDraft(draft: unknown): DraftBlock[] {
  if (!draft || typeof draft !== "object" || !("blocks" in draft)) return [];
  const blocks = (draft as { blocks?: unknown }).blocks;
  return Array.isArray(blocks) ? (blocks as DraftBlock[]) : [];
}

function collectTrackers(
  draft: unknown,
  pageId: string | null,
  pageSlug: string | null,
  output: Map<string, TrackerInfo>,
) {
  for (const block of blocksFromDraft(draft)) {
    if (!block || block.type !== "progress_tracker") continue;
    if (typeof block.id !== "string" || !block.id.trim()) continue;
    const id = block.id;
    if (output.has(id)) continue;
    const rawTitle = block.data?.title;
    output.set(id, {
      id,
      title: typeof rawTitle === "string" && rawTitle.trim() ? rawTitle.trim() : "Progress Tracker",
      pageId,
      pageSlug,
    });
  }
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
      .select("id, title, owner_clerk_user_id, draft")
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

    // Discover configured trackers on every page, including trackers without state.
    // The published homepage prefers the first page's nonempty draft, otherwise
    // falls back to microsites.draft.
    const { data: pages, error: pagesError } = await sb
      .from("microsite_pages")
      .select("id, slug, draft, display_order, created_at")
      .eq("microsite_id", micrositeId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (pagesError) {
      console.error("Progress Tracker owner page lookup failed:", pagesError);
      return errorResponse("Unable to load tracker configurations.", 500);
    }

    const trackersById = new Map<string, TrackerInfo>();
    const firstPage = pages?.[0] ?? null;
    const firstPageDraft = firstPage?.draft;
    const homepageDraft = blocksFromDraft(firstPageDraft).length > 0
      ? firstPageDraft
      : site.draft;

    collectTrackers(
      homepageDraft,
      firstPage?.id ?? null,
      firstPage?.slug ?? null,
      trackersById,
    );

    for (const page of (pages ?? []).slice(1)) {
      collectTrackers(page.draft, page.id, page.slug, trackersById);
    }

    const trackers = Array.from(trackersById.values());

    const url = new URL(request.url);
    const blockId = url.searchParams.get("blockId")?.trim() || null;
    if (blockId && blockId.length > 256) {
      return errorResponse("Invalid tracker block ID.", 400);
    }

    // Bound the result size. Pagination can be added for large sites.
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
      trackers,
      states: states ?? [],
      history,
      limits: { states: 200, history: 1000 },
    });
  } catch (error) {
    console.error("Progress Tracker owner GET failed:", error);
    return errorResponse("Unable to load Progress Tracker management data.", 500);
  }
}
