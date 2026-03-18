import imageCompression from "browser-image-compression";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function uploadImage(file: File) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: "image/webp",
  });

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.webp`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(fileName, compressed, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);

  return data.publicUrl;
}