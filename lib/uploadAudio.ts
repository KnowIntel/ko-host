import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function uploadAudio(file: File) {
  const fileExtension =
    file.name.split(".").pop()?.toLowerCase() || "mp3";

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExtension}`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } =
    supabase.storage.from("uploads").getPublicUrl(fileName);

  return {
    url: data.publicUrl,
    storagePath: fileName,
    audioSizeBytes: file.size,
    audioMimeType: file.type,
  };
}