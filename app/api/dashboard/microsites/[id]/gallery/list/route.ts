import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id: micrositeId } = await ctx.params;
    const sb = getSupabaseAdmin();

    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (site.owner_clerk_user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const { data: items, error: itemsErr } = await sb
      .from("gallery_items")
      .select("id, public_url, caption, sort_order, created_at")
      .eq("microsite_id", micrositeId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (itemsErr) return NextResponse.json({ ok: false, error: itemsErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, items: items ?? [] });
  } catch (e: any) {
    console.error("gallery dashboard list fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}