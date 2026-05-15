import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "uploads";

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function extFromMime(mime: string) {
  if (mime === "video/webm") return "webm";
  if (mime === "video/quicktime") return "mov";
  return "mp4";
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const mime = String(body?.mime || "");

    if (!ALLOWED_VIDEO_MIMES.has(mime)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported video type. Allowed: mp4, webm, mov." },
        { status: 400 },
      );
    }

    const sb = getSupabaseAdmin();

    const ext = extFromMime(mime);
    const storagePath = `videos/${userId}/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.${ext}`;

    const { data: signed, error: signedError } = await sb.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (signedError || !signed) {
      return NextResponse.json(
        { ok: false, error: signedError?.message || "Signed upload failed." },
        { status: 500 },
      );
    }

    const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      ok: true,
      signedUrl: (signed as any).signedUrl ?? (signed as any).signed_url,
      publicUrl: data.publicUrl,
      storagePath,
      mime,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected upload error.",
      },
      { status: 500 },
    );
  }
}