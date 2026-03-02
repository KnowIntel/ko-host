import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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

    const now = new Date().toISOString();

    // Find expired + published microsites
    const { data: expiredSites, error: selectError } = await supabase
      .from("microsites")
      .select("id")
      .eq("is_published", true)
      .lte("paid_until", now);

    if (selectError) {
      console.error("SELECT ERROR:", selectError);
      return NextResponse.json(
        { ok: false, step: "select", error: selectError.message },
        { status: 500 }
      );
    }

    if (!expiredSites || expiredSites.length === 0) {
      return NextResponse.json({ ok: true, unpublishedCount: 0 });
    }

    const ids = expiredSites.map((s) => s.id);

    const { error: updateError } = await supabase
      .from("microsites")
      .update({ is_published: false })
      .in("id", ids);

    if (updateError) {
      console.error("UPDATE ERROR:", updateError);
      return NextResponse.json(
        { ok: false, step: "update", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      unpublishedCount: ids.length,
    });
  } catch (err: any) {
    console.error("CRON FATAL ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}