// app/api/video/upload/route.ts

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 150 * 1024 * 1024;

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function extFromVideo(file: File) {
  const nameExt = file.name.split(".").pop()?.toLowerCase();

  if (nameExt) return nameExt;
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";

  return "mp4";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_VIDEO_MIMES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported video type. Allowed: mp4, webm, mov." },
        { status: 400 },
      );
    }

    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "Video too large. Max 150MB." },
        { status: 413 },
      );
    }

    const sb = getSupabaseAdmin();

    const fileExt = extFromVideo(file);
    const fileName = `videos/video-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const bytes = Buffer.from(await file.arrayBuffer());

    const { error } = await sb.storage.from("uploads").upload(fileName, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

    if (error) {
      console.error("video upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = sb.storage
      .from("uploads")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error("video upload fatal:", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 },
    );
  }
}