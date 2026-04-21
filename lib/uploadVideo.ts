import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const MAX_FILE_SIZE_MB = 5;
const BUCKET_NAME = "uploads";

export async function uploadVideo(file: File) {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error("Video must be under 5MB");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("Invalid file type");
  }

  const ext = file.name.split(".").pop() || "mp4";

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