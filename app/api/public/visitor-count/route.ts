import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const micrositeId = searchParams.get("micrositeId")?.trim() || "";
    const metricType = searchParams.get("metricType")?.trim() || "site_visits";

    if (!micrositeId) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    let query = supabaseAdmin
      .from("microsite_visits")
      .select("id", { count: "exact", head: true })
      .eq("microsite_id", micrositeId)
      .eq("is_owner_or_admin", false);

    if (metricType === "today_visits") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      query = query.gte("created_at", today.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      console.error("visitor-count lookup failed", error);
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    return NextResponse.json({
      count: count ?? 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("visitor-count route failed", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}