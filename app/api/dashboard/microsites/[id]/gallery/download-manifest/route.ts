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

    // Verify ownership + paid active (all templates)
    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id, slug, paid_until")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (site.owner_clerk_user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;
    if (!paidActive) return NextResponse.json({ ok: false, error: "Payment required" }, { status: 402 });

    const { data: items, error: itemsErr } = await sb
      .from("gallery_items")
      .select("id, public_url, thumbnail_url, caption, sort_order, created_at, media_type, mime_type")
      .eq("microsite_id", micrositeId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.error("download-manifest items error:", itemsErr);
      return NextResponse.json({ ok: false, error: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ok: true,
        microsite: { id: site.id, slug: site.slug },
        items: items ?? [],
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("download-manifest fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}