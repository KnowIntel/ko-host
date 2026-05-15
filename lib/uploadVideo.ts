//lib\uploadVideo.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const MAX_FILE_SIZE_MB = 150;
const BUCKET_NAME = "uploads";

export async function uploadVideo(file: File) {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error("Video must be under 5MB");
  }

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
  throw new Error("Invalid video type");
}

  const ext =
  file.name.split(".").pop()?.toLowerCase() ||
  (file.type === "video/webm"
    ? "webm"
    : file.type === "video/quicktime"
      ? "mov"
      : "mp4");

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  return {
    url: data.publicUrl,
    path: fileName,
  };
}

export async function deleteVideo(path?: string) {
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw error;
  }
}