import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const BUCKET = "microsite-gallery";

// Image + video limits
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// ✅ Change after you answer A/B (25MB default here)
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

// Max items per microsite
const MAX_ITEMS = 24;

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_MIMES = new Set(["video/mp4", "video/webm"]);

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
  return "bin";
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id: micrositeId } = await ctx.params;

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });

    const base64 = String(body.base64 || "");
    const mime = String(body.mime || "");
    const caption = body.caption ? String(body.caption).slice(0, 140) : null;

    if (!base64 || !mime) {
      return NextResponse.json({ ok: false, error: "Invalid media payload" }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_MIMES.has(mime);
    const isVideo = ALLOWED_VIDEO_MIMES.has(mime);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type. Allowed: jpg/png/webp, mp4/webm." },
        { status: 400 }
      );
    }

    const b64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const bytes = Buffer.from(b64, "base64");

    if (bytes.length === 0) {
      return NextResponse.json({ ok: false, error: "Empty file" }, { status: 400 });
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (bytes.length > maxBytes) {
      return NextResponse.json(
        { ok: false, error: `File too large. Max ${(maxBytes / (1024 * 1024)).toFixed(0)}MB.` },
        { status: 413 }
      );
    }

    const sb = getSupabaseAdmin();

    // Ownership + template + paid checks
    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id, template_key, paid_until")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (site.owner_clerk_user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    if (site.template_key !== "wedding_rsvp") {
      return NextResponse.json(
        { ok: false, error: "Gallery not enabled for this template yet" },
        { status: 400 }
      );
    }

    const now = new Date();
    const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;
    if (!paidActive) return NextResponse.json({ ok: false, error: "Payment required" }, { status: 402 });

    // Max count
    const { count, error: countErr } = await sb
      .from("gallery_items")
      .select("id", { count: "exact", head: true })
      .eq("microsite_id", micrositeId);

    if (countErr) {
      console.error("gallery count error:", countErr);
      return NextResponse.json({ ok: false, error: countErr.message }, { status: 500 });
    }

    const current = count ?? 0;
    if (current >= MAX_ITEMS) {
      return NextResponse.json(
        { ok: false, error: `Gallery limit reached (${MAX_ITEMS}). Delete a photo to add another.` },
        { status: 409 }
      );
    }

    const ext = extFromMime(mime);
    const objectName = `${micrositeId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    const { error: uploadErr } = await sb.storage.from(BUCKET).upload(objectName, bytes, {
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
      return NextResponse.json({ ok: false, error: "Could not build public URL" }, { status: 500 });
    }

    const media_type = isVideo ? "video" : "image";

    const { data: row, error: insertErr } = await sb
      .from("gallery_items")
      .insert({
        microsite_id: micrositeId,
        storage_bucket: BUCKET,
        storage_path: objectName,
        public_url: publicUrl,
        caption,
        sort_order: current,
        media_type,
        mime_type: mime,
      })
      .select("id, public_url, caption, sort_order, created_at, media_type, mime_type")
      .single();

    if (insertErr) {
      console.error("gallery insert error:", insertErr);
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: row, remaining: MAX_ITEMS - (current + 1) });
  } catch (e: any) {
    console.error("gallery upload fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}