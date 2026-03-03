import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function isValidSlug(slug: string) {
  return /^[a-z0-9-]{2,40}$/.test(slug);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = (searchParams.get("slug") || "").trim().toLowerCase();

    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, template_key, is_published, expires_at, paid_until")
      .eq("slug", slug)
      .maybeSingle();

    if (siteErr || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    if (site.template_key !== "wedding_rsvp") {
      return NextResponse.json({ ok: true, items: [] });
    }

    const now = new Date();
    const isExpired = site.expires_at ? new Date(site.expires_at) <= now : false;
    const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;

    if (!site.is_published || isExpired || !paidActive) {
      return NextResponse.json({ ok: false, error: "Unavailable" }, { status: 403 });
    }

    const { data: items, error: itemsErr } = await sb
      .from("gallery_items")
      .select("id, public_url, caption, sort_order, created_at, media_type, mime_type")
      .eq("microsite_id", site.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.error("gallery list error:", itemsErr);
      return NextResponse.json({ ok: false, error: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, items: items ?? [] });
  } catch (e: any) {
    console.error("gallery list fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}