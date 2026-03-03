import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const BUCKET = "microsite-gallery";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id: micrositeId } = await ctx.params;

    const body = await req.json().catch(() => null);
    const storage_path = String(body?.storage_path || "");
    const public_url = String(body?.public_url || "");
    const caption = body?.caption ? String(body.caption).slice(0, 140) : null;
    const media_type = String(body?.media_type || "image");
    const mime_type = body?.mime_type ? String(body.mime_type) : null;
    const sort_order = typeof body?.sort_order === "number" ? body.sort_order : null;

    if (!storage_path || !public_url || sort_order === null) {
      return NextResponse.json({ ok: false, error: "Missing finalize fields" }, { status: 400 });
    }

    if (media_type !== "image" && media_type !== "video") {
      return NextResponse.json({ ok: false, error: "Invalid media_type" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id, template_key, paid_until")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (site.owner_clerk_user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    if (site.template_key !== "wedding_rsvp") {
      return NextResponse.json({ ok: false, error: "Gallery not enabled for this template" }, { status: 400 });
    }

    const now = new Date();
    const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;
    if (!paidActive) return NextResponse.json({ ok: false, error: "Payment required" }, { status: 402 });

    // Insert row
    const { data: row, error: insErr } = await sb
      .from("gallery_items")
      .insert({
        microsite_id: micrositeId,
        storage_bucket: BUCKET,
        storage_path,
        public_url,
        caption,
        sort_order,
        media_type,
        mime_type,
      })
      .select("id, public_url, caption, sort_order, created_at, media_type, mime_type")
      .single();

    if (insErr) {
      console.error("gallery finalize insert error:", insErr);
      return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: row });
  } catch (e: any) {
    console.error("gallery finalize fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}