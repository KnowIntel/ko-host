import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type PublicLiveExperience = {
  id: string;
  micrositeId: string;
  name: string;
  status:
    | "before"
    | "live"
    | "paused"
    | "ended"
    | "after";
  isEnabled: boolean;
  startedAt: string | null;
  endedAt: string | null;
};

export async function getLiveExperienceForMicrosite(
  micrositeId: string,
): Promise<PublicLiveExperience | null> {
  const safeMicrositeId = String(
    micrositeId || "",
  )
    .trim()
    .toLowerCase();

  if (!safeMicrositeId) {
    return null;
  }

  const supabase = getSupabaseAdmin();

  const {
    data,
    error,
  } = await supabase
    .from("live_experiences")
    .select(`
      id,
      microsite_id,
      name,
      status,
      is_enabled,
      started_at,
      ended_at
    `)
    .eq("microsite_id", safeMicrositeId)
    .maybeSingle();

  if (error) {
    console.error(
      "Live experience lookup failed:",
      error,
    );

    return null;
  }

  if (!data || data.is_enabled !== true) {
    return null;
  }

  return {
    id: String(data.id),
    micrositeId: String(data.microsite_id),
    name: String(
      data.name || "Live Experience",
    ),
    status:
      data.status as PublicLiveExperience["status"],
    isEnabled: true,
    startedAt:
      data.started_at
        ? String(data.started_at)
        : null,
    endedAt:
      data.ended_at
        ? String(data.ended_at)
        : null,
  };
}