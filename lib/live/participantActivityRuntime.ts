import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function asLiveRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

export function cleanLiveId(
  value: unknown,
  maxLength = 200,
) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function getParticipantActivityRuntime(
  experienceId: string,
  activityType: string,
) {
  const safeExperienceId = String(
    experienceId || "",
  )
    .trim()
    .toLowerCase();

  if (!UUID_PATTERN.test(safeExperienceId)) {
    return {
      ok: false as const,
      status: 400,
      error: "Invalid Live experience.",
    };
  }

  const authentication =
    await authenticateLiveParticipant(
      safeExperienceId,
    );

  if (!authentication.ok) {
    return {
      ok: false as const,
      status: authentication.status,
      error: authentication.error,
      authenticated: false,
    };
  }

  const participant =
    authentication.participant;

  const supabase = getSupabaseAdmin();

  const {
    data: experience,
    error: experienceError,
  } = await supabase
    .from("live_experiences")
    .select("id, status, is_enabled")
    .eq("id", safeExperienceId)
    .maybeSingle();

  if (experienceError) {
    console.error(
      "Live activity experience lookup failed:",
      experienceError,
    );

    return {
      ok: false as const,
      status: 500,
      error:
        "Unable to load the Live activity.",
    };
  }

  if (!experience || !experience.is_enabled) {
    return {
      ok: false as const,
      status: 409,
      error:
        "This Live experience is not available.",
    };
  }

  if (experience.status !== "live") {
    return {
      ok: false as const,
      status: 409,
      error:
        experience.status === "paused"
          ? "The host has paused the Live experience."
          : experience.status === "before"
            ? "The Live experience has not started yet."
            : experience.status === "ended"
              ? "This Live experience has ended."
              : experience.status === "after"
                ? "The Live experience is now in Post-Event."
                : "This Live activity is not currently available.",
    };
  }

  const {
    data: sharedState,
    error: sharedStateError,
  } = await supabase
    .from("live_experience_state")
    .select(`
      current_activity_type,
      current_activity_id,
      state
    `)
    .eq(
      "experience_id",
      safeExperienceId,
    )
    .maybeSingle();

  if (sharedStateError) {
    console.error(
      "Live activity shared-state lookup failed:",
      sharedStateError,
    );

    return {
      ok: false as const,
      status: 500,
      error:
        "Unable to load the Live activity.",
    };
  }

  if (
    !sharedState ||
    sharedState.current_activity_type !==
      activityType ||
    !sharedState.current_activity_id
  ) {
    return {
      ok: false as const,
      status: 409,
      error:
        "This Live activity is not currently active.",
    };
  }

  const activityId = String(
    sharedState.current_activity_id,
  );

  const {
    data: activity,
    error: activityError,
  } = await supabase
    .from("live_activities")
    .select(`
      id,
      experience_id,
      activity_type,
      name,
      status,
      configuration
    `)
    .eq("id", activityId)
    .eq(
      "experience_id",
      safeExperienceId,
    )
    .eq(
      "activity_type",
      activityType,
    )
    .maybeSingle();

  if (activityError) {
    console.error(
      "Live activity lookup failed:",
      activityError,
    );

    return {
      ok: false as const,
      status: 500,
      error:
        "Unable to load the Live activity.",
    };
  }

  if (
    !activity ||
    activity.status !== "active"
  ) {
    return {
      ok: false as const,
      status: 409,
      error:
        "This Live activity is not currently active.",
    };
  }

  return {
    ok: true as const,
    safeExperienceId,
    participant,
    supabase,
    experience,
    sharedState,
    activity,
  };
}

export async function broadcastLiveActivityChange(
  supabase: ReturnType<
    typeof getSupabaseAdmin
  >,
  experienceId: string,
  activityId: string,
) {
  const channel = supabase.channel(
    `live-experience-${experienceId}`,
  );

  try {
    await channel.send({
      type: "broadcast",
      event: "shared-state-changed",
      payload: {
        experienceId,
        activityId,
        updatedAt:
          new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "Live activity Broadcast failed:",
      error,
    );
  } finally {
    await supabase.removeChannel(channel);
  }
}