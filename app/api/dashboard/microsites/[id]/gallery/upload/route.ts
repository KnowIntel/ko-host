import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const BUCKET = "microsite-gallery";
const MAX_BYTES = 8 * 1024 * 1024;

function safeExtFromMime(mime: string): "jpg" | "png" | "webp" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth(); // ✅ FIXED (await)

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: micrositeId } = await ctx.params;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
    }

    const base64 = String(body.base64 || "");
    const mime = String(body.mime || "");
    const caption = body.caption ? String(body.caption).slice(0, 140) : null;

    if (!base64 || !mime.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "Invalid image payload" }, { status: 400 });
    }

    const b64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const bytes = Buffer.from(b64, "base64");

    if (bytes.length === 0) {
      return NextResponse.json({ ok: false, error: "Empty file" }, { status: 400 });
    }

    if (bytes.length > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "File too large" }, { status: 413 });
    }

    const sb = getSupabaseAdmin();

    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id, template_key, paid_until")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    if (site.owner_clerk_user_id !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    if (site.template_key !== "wedding_rsvp") {
      return NextResponse.json(
        { ok: false, error: "Gallery not enabled for this template yet" },
        { status: 400 }
      );
    }

    const now = new Date();
    const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;

    if (!paidActive) {
      return NextResponse.json({ ok: false, error: "Payment required" }, { status: 402 });
    }

    const ext = safeExtFromMime(mime);
    const objectName = `${micrositeId}/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.${ext}`;

    const { error: uploadErr } = await sb.storage
      .from(BUCKET)
      .upload(objectName, bytes, {
        contentType: mime,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadErr) {
      console.error("gallery upload error:", uploadErr);
      return NextResponse.json({ ok: false, error: uploadErr.message }, { status: 500 });
    }

    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(objectName);
    const publicUrl = pub?.publicUrl;

    if (!publicUrl) {
      return NextResponse.json(
        { ok: false, error: "Could not build public URL" },
        { status: 500 }
      );
    }

    const { data: row, error: insertErr } = await sb
      .from("gallery_items")
      .insert({
        microsite_id: micrositeId,
        storage_bucket: BUCKET,
        storage_path: objectName,
        public_url: publicUrl,
        caption,
      })
      .select("id, public_url, caption, sort_order, created_at")
      .single();

    if (insertErr) {
      console.error("gallery insert error:", insertErr);
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: row });
  } catch (e: any) {
    console.error("gallery upload fatal:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Error" },
      { status: 500 }
    );
  }
}