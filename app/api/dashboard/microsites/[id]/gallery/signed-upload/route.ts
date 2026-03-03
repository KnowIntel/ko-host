import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const BUCKET = "microsite-gallery";
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

function baseNameNoExt(path: string) {
  const file = path.split("/").pop() || "";
  const dot = file.lastIndexOf(".");
  return dot > 0 ? file.slice(0, dot) : file;
}

function dirName(path: string) {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id: micrositeId } = await ctx.params;

    const body = await req.json().catch(() => null);
    const mime = String(body?.mime || "");
    const caption = body?.caption ? String(body.caption).slice(0, 140) : null;
    const purpose = String(body?.purpose || "media"); // "media" | "thumbnail"
    const base_storage_path = body?.base_storage_path ? String(body.base_storage_path) : null;

    const isImage = ALLOWED_IMAGE_MIMES.has(mime);
    const isVideo = ALLOWED_VIDEO_MIMES.has(mime);
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { ok: false, error: "Unsupported type. Allowed: jpg/png/webp, mp4/webm." },
        { status: 400 }
      );
    }

    if (purpose !== "media" && purpose !== "thumbnail") {
      return NextResponse.json({ ok: false, error: "Invalid purpose" }, { status: 400 });
    }

    if (purpose === "thumbnail" && !isImage) {
      return NextResponse.json({ ok: false, error: "Thumbnail must be an image" }, { status: 400 });
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

    let next_sort_order: number | null = null;
    if (purpose === "media") {
      const { count, error: countErr } = await sb
        .from("gallery_items")
        .select("id", { count: "exact", head: true })
        .eq("microsite_id", micrositeId);

      if (countErr) return NextResponse.json({ ok: false, error: countErr.message }, { status: 500 });

      const current = count ?? 0;
      if (current >= MAX_ITEMS) {
        return NextResponse.json(
          { ok: false, error: `Gallery limit reached (${MAX_ITEMS}). Delete an item to add another.` },
          { status: 409 }
        );
      }
      next_sort_order = current;
    }

    let storage_path: string;
    if (purpose === "thumbnail") {
      if (!base_storage_path) {
        return NextResponse.json({ ok: false, error: "Missing base_storage_path" }, { status: 400 });
      }
      if (!base_storage_path.startsWith(`${micrositeId}/`)) {
        return NextResponse.json({ ok: false, error: "Invalid base_storage_path" }, { status: 400 });
      }
      const folder = dirName(base_storage_path);
      const base = baseNameNoExt(base_storage_path);
      storage_path = `${folder}/thumb-${base}.jpg`;
    } else {
      const ext = extFromMime(mime);
      storage_path = `${micrositeId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    }

    const media_type = purpose === "thumbnail" ? "image" : isVideo ? "video" : "image";

    const { data: signed, error: signedErr } = await sb.storage.from(BUCKET).createSignedUploadUrl(storage_path);
    if (signedErr || !signed) {
      console.error("signed upload error:", signedErr);
      return NextResponse.json({ ok: false, error: signedErr?.message ?? "Signed upload failed" }, { status: 500 });
    }

    const public_url = sb.storage.from(BUCKET).getPublicUrl(storage_path).data.publicUrl;

    return NextResponse.json({
      ok: true,
      purpose,
      bucket: BUCKET,
      storage_path,
      token: (signed as any).token,
      // ✅ NEW: send signed_url if available (lets the browser do XHR upload with progress)
      signed_url: (signed as any).signedUrl ?? (signed as any).signed_url ?? null,
      public_url,
      mime_type: purpose === "thumbnail" ? "image/jpeg" : mime,
      media_type,
      caption,
      next_sort_order,
    });
  } catch (e: any) {
    console.error("signed upload fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}