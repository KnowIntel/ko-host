import { cookies } from "next/headers";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildLiveParticipantCookieName,
  hashLiveParticipantToken,
  safeTokenHashesMatch,
} from "@/lib/live/participantSession";

type AuthenticatedLiveParticipant = {
  participantId: string;
  experienceId: string;
  displayName: string;
  avatarUrl: string | null;
};

type AuthenticateParticipantResult =
  | {
      ok: true;
      participant: AuthenticatedLiveParticipant;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export async function authenticateLiveParticipant(
  experienceId: string,
): Promise<AuthenticateParticipantResult> {
  const cookieStore = await cookies();

  const cookieName =
    buildLiveParticipantCookieName(experienceId);

  const token =
    cookieStore.get(cookieName)?.value?.trim() ?? "";

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: "Live participant session not found.",
    };
  }

  const tokenHash =
    hashLiveParticipantToken(token);

  const sb = getSupabaseAdmin();

  const { data: session, error: sessionError } =
    await sb
      .from("live_participant_sessions")
      .select(
        `
          id,
          experience_id,
          participant_id,
          token_hash,
          expires_at,
          live_participants (
            id,
            experience_id,
            display_name,
            avatar_url,
            status
          )
        `,
      )
      .eq("experience_id", experienceId)
      .eq("token_hash", tokenHash)
      .maybeSingle();

  if (sessionError) {
    console.error(
      "Live participant authentication failed:",
      sessionError,
    );

    return {
      ok: false,
      status: 401,
      error: "Unable to authenticate participant.",
    };
  }

  if (!session) {
    return {
      ok: false,
      status: 401,
      error: "Live participant session is invalid.",
    };
  }

  if (
    !safeTokenHashesMatch(
      tokenHash,
      String(session.token_hash || ""),
    )
  ) {
    return {
      ok: false,
      status: 401,
      error: "Live participant session is invalid.",
    };
  }

  const expiresAt = new Date(
    String(session.expires_at || ""),
  );

  if (
    Number.isNaN(expiresAt.getTime()) ||
    expiresAt.getTime() <= Date.now()
  ) {
    return {
      ok: false,
      status: 401,
      error: "Live participant session has expired.",
    };
  }

  const participantValue =
    session.live_participants;

  const participant = Array.isArray(
    participantValue,
  )
    ? participantValue[0]
    : participantValue;

  if (
    !participant ||
    participant.experience_id !== experienceId
  ) {
    return {
      ok: false,
      status: 401,
      error: "Live participant was not found.",
    };
  }

  if (participant.status !== "active") {
    return {
      ok: false,
      status: 403,
      error: "Live participant is not active.",
    };
  }

  await Promise.all([
    sb
      .from("live_participant_sessions")
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq("id", session.id),

    sb
      .from("live_participants")
      .update({
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", participant.id),
  ]);

  return {
    ok: true,
    participant: {
      participantId: participant.id,
      experienceId: participant.experience_id,
      displayName: participant.display_name,
      avatarUrl: participant.avatar_url ?? null,
    },
  };
}