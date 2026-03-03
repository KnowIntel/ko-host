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
    const itemId = body?.itemId ? String(body.itemId) : "";

    if (!itemId) return NextResponse.json({ ok: false, error: "Missing itemId" }, { status: 400 });

    const sb = getSupabaseAdmin();

    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (site.owner_clerk_user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const { data: item, error: itemErr } = await sb
      .from("gallery_items")
      .select("id, storage_bucket, storage_path")
      .eq("id", itemId)
      .eq("microsite_id", micrositeId)
      .maybeSingle();

    if (itemErr || !item) return NextResponse.json({ ok: false, error: "Item not found" }, { status: 404 });

    // Delete from storage (best-effort)
    const { error: storageErr } = await sb.storage
      .from(item.storage_bucket)
      .remove([item.storage_path]);

    if (storageErr) {
      // still proceed to DB delete, but log it
      console.error("gallery storage remove error:", storageErr);
    }

    const { error: delErr } = await sb
      .from("gallery_items")
      .delete()
      .eq("id", itemId)
      .eq("microsite_id", micrositeId);

    if (delErr) return NextResponse.json({ ok: false, error: delErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("gallery delete fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}