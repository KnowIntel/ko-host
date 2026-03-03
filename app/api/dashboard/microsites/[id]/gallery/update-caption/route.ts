import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id: micrositeId } = await ctx.params;

    const body = await req.json().catch(() => null);
    const itemId = String(body?.itemId || "");
    const caption = body?.caption === null ? null : String(body?.caption ?? "").slice(0, 140);

    if (!itemId) return NextResponse.json({ ok: false, error: "Missing itemId" }, { status: 400 });

    const sb = getSupabaseAdmin();

    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id, paid_until")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (site.owner_clerk_user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    // ✅ ALL templates allowed — paid_until required
    const now = new Date();
    const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;
    if (!paidActive) return NextResponse.json({ ok: false, error: "Payment required" }, { status: 402 });

    const { data: item, error: itemErr } = await sb
      .from("gallery_items")
      .select("id, microsite_id")
      .eq("id", itemId)
      .maybeSingle();

    if (itemErr || !item) return NextResponse.json({ ok: false, error: "Item not found" }, { status: 404 });
    if (item.microsite_id !== micrositeId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const { data: updated, error: updErr } = await sb
      .from("gallery_items")
      .update({ caption })
      .eq("id", itemId)
      .select("id, caption")
      .single();

    if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, item: updated }, { status: 200 });
  } catch (e: any) {
    console.error("update-caption fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}