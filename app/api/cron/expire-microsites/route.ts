import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STALE_DRAFT_MS = 60 * 60 * 1000; // 1 hour

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();
    const staleCutoffIso = new Date(Date.now() - STALE_DRAFT_MS).toISOString();

    // 1) Unpublish paid microsites whose access has ended
    const { data: expiredSites, error: selectExpiredError } = await supabase
      .from("microsites")
      .select("id")
      .eq("is_published", true)
      .not("paid_until", "is", null)
      .lte("paid_until", nowIso);

    if (selectExpiredError) {
      console.error("SELECT EXPIRED ERROR:", selectExpiredError);
      return NextResponse.json(
        { ok: false, step: "select_expired", error: selectExpiredError.message },
        { status: 500 }
      );
    }

    let unpublishedCount = 0;

    if (expiredSites && expiredSites.length > 0) {
      const expiredIds = expiredSites.map((s) => s.id);

      const { error: updateExpiredError } = await supabase
        .from("microsites")
        .update({ is_published: false })
        .in("id", expiredIds);

      if (updateExpiredError) {
        console.error("UPDATE EXPIRED ERROR:", updateExpiredError);
        return NextResponse.json(
          { ok: false, step: "update_expired", error: updateExpiredError.message },
          { status: 500 }
        );
      }

      unpublishedCount = expiredIds.length;
    }

    // 2) Delete stale unpaid unpublished drafts older than 1 hour
    const { data: staleDrafts, error: selectDraftsError } = await supabase
      .from("microsites")
      .select("id")
      .eq("is_published", false)
      .is("paid_until", null)
      .lte("created_at", staleCutoffIso);

    if (selectDraftsError) {
      console.error("SELECT STALE DRAFTS ERROR:", selectDraftsError);
      return NextResponse.json(
        { ok: false, step: "select_stale_drafts", error: selectDraftsError.message },
        { status: 500 }
      );
    }

    let deletedDraftCount = 0;

    if (staleDrafts && staleDrafts.length > 0) {
      const staleDraftIds = staleDrafts.map((s) => s.id);

      const { error: deleteDraftsError } = await supabase
        .from("microsites")
        .delete()
        .in("id", staleDraftIds);

      if (deleteDraftsError) {
        console.error("DELETE STALE DRAFTS ERROR:", deleteDraftsError);
        return NextResponse.json(
          { ok: false, step: "delete_stale_drafts", error: deleteDraftsError.message },
          { status: 500 }
        );
      }

      deletedDraftCount = staleDraftIds.length;
    }

    return NextResponse.json({
      ok: true,
      unpublishedCount,
      deletedDraftCount,
    });
  } catch (err: any) {
    console.error("CRON FATAL ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}