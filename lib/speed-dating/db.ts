import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  SPEED_DATING_DEFAULT_ROUND_DURATION_SECONDS,
  SPEED_DATING_MAX_ROUND_DURATION_SECONDS,
  SPEED_DATING_MIN_ROUND_DURATION_SECONDS,
  SPEED_DATING_TRANSITION_SECONDS,
} from "./constants";
import type {
  SpeedDatingIam,
  SpeedDatingParticipantProfile,
  SpeedDatingPrivateRoomState,
  SpeedDatingPublicState,
  SpeedDatingSeeking,
} from "./types";
import { buildPublicState } from "./serializers";

type SessionRow = {
  session_id: string;
  slug: string;
  round: number;
  phase: "active" | "transition";
  round_duration_seconds: number;
  transition_duration_seconds: number;
  round_started_at: string;
  round_ends_at: string;
  phase_started_at: string;
  phase_ends_at: string;
  created_at: string;
  updated_at: string;
};

type ParticipantRow = {
  id: string;
  session_id: string;
  browser_key: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  image_url: string | null;
  iam: SpeedDatingIam;
  seeking: SpeedDatingSeeking;
  joined_at: string;
  updated_at: string;
};

type QueueEntryRow = {
  id: string;
  session_id: string;
  participant_id: string;
  side: "left" | "right";
  joined_at: string;
};

type PairRow = {
  id: string;
  session_id: string;
  round: number;
  room_id: string;
  left_participant_id: string | null;
  right_participant_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeRoundDurationSeconds(value?: number) {
  const raw = Number.isFinite(value)
    ? Math.floor(value as number)
    : SPEED_DATING_DEFAULT_ROUND_DURATION_SECONDS;

  return Math.max(
    SPEED_DATING_MIN_ROUND_DURATION_SECONDS,
    Math.min(SPEED_DATING_MAX_ROUND_DURATION_SECONDS, raw),
  );
}

function nowIso() {
  return new Date().toISOString();
}

function getQueueSide(iam: SpeedDatingIam): "left" | "right" {
  return iam === "man" ? "left" : "right";
}

function seekingMatchesIam(
  seeking: SpeedDatingSeeking,
  iam: SpeedDatingIam,
) {
  return (
    (seeking === "men" && iam === "man") ||
    (seeking === "women" && iam === "woman")
  );
}

function isCompatible(
  left: SpeedDatingParticipantProfile,
  right: SpeedDatingParticipantProfile,
) {
  return (
    seekingMatchesIam(left.seeking, right.iam) &&
    seekingMatchesIam(right.seeking, left.iam)
  );
}

function toParticipantProfile(row: ParticipantRow): SpeedDatingParticipantProfile {
  return {
    id: row.id,
    browserKey: row.browser_key,
    sessionId: row.session_id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    bio: row.bio,
    imageUrl: row.image_url,
    iam: row.iam,
    seeking: row.seeking,
    joinedAt: row.joined_at,
    updatedAt: row.updated_at,
    active: true,
  };
}

function rotateArrayDown<T>(items: T[], steps = 1) {
  if (!items.length) return items;
  const normalized = ((steps % items.length) + items.length) % items.length;
  if (normalized === 0) return [...items];
  return [
    ...items.slice(items.length - normalized),
    ...items.slice(0, items.length - normalized),
  ];
}

function rotateArrayUp<T>(items: T[], steps = 1) {
  if (!items.length) return items;
  const normalized = ((steps % items.length) + items.length) % items.length;
  if (normalized === 0) return [...items];
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

async function getSessionOrThrow(supabase: SupabaseClient, sessionId: string) {
  const { data, error } = await supabase
    .from("speed_dating_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error || !data) {
    throw new Error("Session not found");
  }

  return data as SessionRow;
}

async function fetchParticipantsMap(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<Map<string, SpeedDatingParticipantProfile>> {
  const { data, error } = await supabase
    .from("speed_dating_participants")
    .select("*")
    .eq("session_id", sessionId);

  if (error) throw error;

  const map = new Map<string, SpeedDatingParticipantProfile>();
  for (const row of (data ?? []) as ParticipantRow[]) {
    map.set(row.id, toParticipantProfile(row));
  }
  return map;
}

async function fetchQueue(
  supabase: SupabaseClient,
  sessionId: string,
  side: "left" | "right",
) {
  const { data, error } = await supabase
    .from("speed_dating_queue_entries")
    .select("*")
    .eq("session_id", sessionId)
    .eq("side", side)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as QueueEntryRow[];
}

async function fetchPairs(
  supabase: SupabaseClient,
  sessionId: string,
  round: number,
) {
  const { data, error } = await supabase
    .from("speed_dating_pairs")
    .select("*")
    .eq("session_id", sessionId)
    .eq("round", round)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PairRow[];
}

async function createSession(params: {
  supabase: SupabaseClient;
  sessionId: string;
  slug: string;
  roundDurationSeconds?: number;
}) {
  const roundDurationSeconds = normalizeRoundDurationSeconds(
    params.roundDurationSeconds,
  );
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + roundDurationSeconds * 1000);

  const payload = {
    session_id: params.sessionId,
    slug: params.slug,
    round: 0,
    phase: "active" as const,
    round_duration_seconds: roundDurationSeconds,
    transition_duration_seconds: SPEED_DATING_TRANSITION_SECONDS,
    round_started_at: startedAt.toISOString(),
    round_ends_at: endsAt.toISOString(),
    phase_started_at: startedAt.toISOString(),
    phase_ends_at: endsAt.toISOString(),
  };

  const { data, error } = await params.supabase
    .from("speed_dating_sessions")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as SessionRow;
}

export async function getOrCreateSession(params: {
  sessionId: string;
  slug: string;
  roundDurationSeconds?: number;
}) {
  const supabase = getAdminClient();

  const { data } = await supabase
    .from("speed_dating_sessions")
    .select("*")
    .eq("session_id", params.sessionId)
    .maybeSingle();

  if (data) {
    return data as SessionRow;
  }

  return createSession({
    supabase,
    sessionId: params.sessionId,
    slug: params.slug,
    roundDurationSeconds: params.roundDurationSeconds,
  });
}

export async function advanceSessionIfNeeded(sessionId: string) {
  const supabase = getAdminClient();
  const session = await getSessionOrThrow(supabase, sessionId);
  const now = Date.now();
  const phaseEndsAtMs = new Date(session.phase_ends_at).getTime();

  if (now < phaseEndsAtMs) {
    return session;
  }

  if (session.phase === "active") {
    const startedAt = new Date();
    const endsAt = new Date(
      startedAt.getTime() + session.transition_duration_seconds * 1000,
    );

    const { data, error } = await supabase
      .from("speed_dating_sessions")
      .update({
        phase: "transition",
        phase_started_at: startedAt.toISOString(),
        phase_ends_at: endsAt.toISOString(),
      })
      .eq("session_id", sessionId)
      .select("*")
      .single();

    if (error) throw error;
    return data as SessionRow;
  }

  const nextRound = session.round + 1;
  const startedAt = new Date();
  const endsAt = new Date(
    startedAt.getTime() + session.round_duration_seconds * 1000,
  );

  const { data, error } = await supabase
    .from("speed_dating_sessions")
    .update({
      round: nextRound,
      phase: "active",
      round_started_at: startedAt.toISOString(),
      round_ends_at: endsAt.toISOString(),
      phase_started_at: startedAt.toISOString(),
      phase_ends_at: endsAt.toISOString(),
    })
    .eq("session_id", sessionId)
    .select("*")
    .single();

  if (error) throw error;

  await rebuildPairsForCurrentRound(sessionId);
  await deleteOldMessages(sessionId, nextRound);

  return data as SessionRow;
}

export async function ensureFreshSession(params: {
  sessionId: string;
  slug: string;
  roundDurationSeconds?: number;
}) {
  await getOrCreateSession(params);
  return advanceSessionIfNeeded(params.sessionId);
}

export async function upsertParticipant(params: {
  sessionId: string;
  slug: string;
  browserKey: string;
  name: string;
  title: string;
  bio: string;
  iam: SpeedDatingIam;
  seeking: SpeedDatingSeeking;
  imageUrl?: string | null;
}) {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("speed_dating_participants")
    .upsert(
      {
        session_id: params.sessionId,
        browser_key: params.browserKey,
        slug: params.slug,
        name: params.name,
        title: params.title,
        bio: params.bio,
        image_url: params.imageUrl ?? null,
        iam: params.iam,
        seeking: params.seeking,
        updated_at: nowIso(),
      },
      {
        onConflict: "session_id,browser_key",
      },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as ParticipantRow;
}

export async function getParticipantByBrowserKey(params: {
  sessionId: string;
  browserKey: string;
}) {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("speed_dating_participants")
    .select("*")
    .eq("session_id", params.sessionId)
    .eq("browser_key", params.browserKey)
    .maybeSingle();

  if (error) throw error;
  return (data as ParticipantRow | null) ?? null;
}

export async function upsertQueueEntry(params: {
  sessionId: string;
  participantId: string;
  side: "left" | "right";
}) {
  const supabase = getAdminClient();

  await supabase
    .from("speed_dating_queue_entries")
    .delete()
    .eq("session_id", params.sessionId)
    .eq("participant_id", params.participantId);

  const { error } = await supabase.from("speed_dating_queue_entries").insert({
    session_id: params.sessionId,
    participant_id: params.participantId,
    side: params.side,
    joined_at: nowIso(),
  });

  if (error) throw error;
}

export async function rebuildPairsForCurrentRound(sessionId: string) {
  const supabase = getAdminClient();
  const session = await getSessionOrThrow(supabase, sessionId);

  if (session.phase !== "active") {
    return;
  }

  const participantsMap = await fetchParticipantsMap(supabase, sessionId);
  const leftQueue = await fetchQueue(supabase, sessionId, "left");
  const rightQueue = await fetchQueue(supabase, sessionId, "right");

  const leftParticipants = rotateArrayDown(
    leftQueue
      .map((q) => participantsMap.get(q.participant_id) ?? null)
      .filter(Boolean) as SpeedDatingParticipantProfile[],
    session.round,
  );

  const rightParticipants = rotateArrayUp(
    rightQueue
      .map((q) => participantsMap.get(q.participant_id) ?? null)
      .filter(Boolean) as SpeedDatingParticipantProfile[],
    session.round,
  );

  const usedRightIds = new Set<string>();
  const rows: Array<{
    session_id: string;
    round: number;
    left_participant_id: string | null;
    right_participant_id: string | null;
    active: boolean;
  }> = [];

  for (const leftParticipant of leftParticipants) {
    let matchedRight: SpeedDatingParticipantProfile | null = null;

    for (const rightParticipant of rightParticipants) {
      if (usedRightIds.has(rightParticipant.id)) continue;

      if (isCompatible(leftParticipant, rightParticipant)) {
        matchedRight = rightParticipant;
        usedRightIds.add(rightParticipant.id);
        break;
      }
    }

    rows.push({
      session_id: sessionId,
      round: session.round,
      left_participant_id: leftParticipant.id,
      right_participant_id: matchedRight?.id ?? null,
      active: true,
    });
  }

  for (const rightParticipant of rightParticipants) {
    if (usedRightIds.has(rightParticipant.id)) continue;

    rows.push({
      session_id: sessionId,
      round: session.round,
      left_participant_id: null,
      right_participant_id: rightParticipant.id,
      active: true,
    });
  }

  const { error: delError } = await supabase
    .from("speed_dating_pairs")
    .delete()
    .eq("session_id", sessionId)
    .eq("round", session.round);

  if (delError) throw delError;

  if (!rows.length) return;

  const { error: insError } = await supabase
    .from("speed_dating_pairs")
    .insert(rows);

  if (insError) throw insError;
}

export async function joinAndRebuild(params: {
  sessionId: string;
  slug: string;
  browserKey: string;
  name: string;
  title: string;
  bio: string;
  iam: SpeedDatingIam;
  seeking: SpeedDatingSeeking;
  imageUrl?: string | null;
  roundDurationSeconds?: number;
}) {
  const session = await ensureFreshSession({
    sessionId: params.sessionId,
    slug: params.slug,
    roundDurationSeconds: params.roundDurationSeconds,
  });

  const participant = await upsertParticipant({
    sessionId: params.sessionId,
    slug: params.slug,
    browserKey: params.browserKey,
    name: params.name,
    title: params.title,
    bio: params.bio,
    iam: params.iam,
    seeking: params.seeking,
    imageUrl: params.imageUrl,
  });

  await upsertQueueEntry({
    sessionId: params.sessionId,
    participantId: participant.id,
    side: getQueueSide(params.iam),
  });

  await rebuildPairsForCurrentRound(params.sessionId);

  return {
    session: await ensureFreshSession({
      sessionId: params.sessionId,
      slug: params.slug,
      roundDurationSeconds: params.roundDurationSeconds,
    }),
    participant: toParticipantProfile(participant),
  };
}

export async function deleteOldMessages(sessionId: string, currentRound: number) {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("speed_dating_messages")
    .delete()
    .eq("session_id", sessionId)
    .lt("round", currentRound);

  if (error) throw error;
}

export async function leaveAndCleanup(params: {
  sessionId: string;
  browserKey: string;
}) {
  const supabase = getAdminClient();
  const participant = await getParticipantByBrowserKey(params);

  if (!participant) {
    return ensureFreshSession({
      sessionId: params.sessionId,
      slug: "live",
    });
  }

  const session = await ensureFreshSession({
    sessionId: params.sessionId,
    slug: participant.slug,
  });

  const { data: pairRows, error: pairErr } = await supabase
    .from("speed_dating_pairs")
    .select("*")
    .eq("session_id", params.sessionId)
    .eq("round", session.round)
    .or(
      `left_participant_id.eq.${participant.id},right_participant_id.eq.${participant.id}`,
    );

  if (pairErr) throw pairErr;

  const roomIds = ((pairRows ?? []) as PairRow[]).map((p) => p.room_id);

  await supabase
    .from("speed_dating_queue_entries")
    .delete()
    .eq("session_id", params.sessionId)
    .eq("participant_id", participant.id);

  if (roomIds.length) {
    await supabase
      .from("speed_dating_messages")
      .delete()
      .eq("session_id", params.sessionId)
      .in("room_id", roomIds);
  }

  await supabase
    .from("speed_dating_pairs")
    .delete()
    .eq("session_id", params.sessionId)
    .eq("round", session.round)
    .or(
      `left_participant_id.eq.${participant.id},right_participant_id.eq.${participant.id}`,
    );

  await supabase
    .from("speed_dating_participants")
    .delete()
    .eq("id", participant.id);

  await rebuildPairsForCurrentRound(params.sessionId);

  return ensureFreshSession({
    sessionId: params.sessionId,
    slug: participant.slug,
  });
}

export async function skipAndRebuild(params: {
  sessionId: string;
  browserKey: string;
}) {
  const supabase = getAdminClient();
  const participant = await getParticipantByBrowserKey(params);

  if (!participant) {
    return ensureFreshSession({
      sessionId: params.sessionId,
      slug: "live",
    });
  }

  const session = await ensureFreshSession({
    sessionId: params.sessionId,
    slug: participant.slug,
  });

  const { data: pairRows, error: pairErr } = await supabase
    .from("speed_dating_pairs")
    .select("*")
    .eq("session_id", params.sessionId)
    .eq("round", session.round)
    .or(
      `left_participant_id.eq.${participant.id},right_participant_id.eq.${participant.id}`,
    );

  if (pairErr) throw pairErr;

  const roomIds = ((pairRows ?? []) as PairRow[]).map((p) => p.room_id);

  if (roomIds.length) {
    await supabase
      .from("speed_dating_messages")
      .delete()
      .eq("session_id", params.sessionId)
      .in("room_id", roomIds);
  }

  await supabase
    .from("speed_dating_pairs")
    .delete()
    .eq("session_id", params.sessionId)
    .eq("round", session.round)
    .or(
      `left_participant_id.eq.${participant.id},right_participant_id.eq.${participant.id}`,
    );

  await supabase
    .from("speed_dating_queue_entries")
    .update({ joined_at: nowIso() })
    .eq("session_id", params.sessionId)
    .eq("participant_id", participant.id);

  await rebuildPairsForCurrentRound(params.sessionId);

  return ensureFreshSession({
    sessionId: params.sessionId,
    slug: participant.slug,
  });
}

export async function getPublicState(sessionId: string, slug = "live") {
  const supabase = getAdminClient();
  const session = await ensureFreshSession({ sessionId, slug });

  const participantsById = await fetchParticipantsMap(supabase, sessionId);
  const leftQueue = await fetchQueue(supabase, sessionId, "left");
  const rightQueue = await fetchQueue(supabase, sessionId, "right");
  const pairs = await fetchPairs(supabase, sessionId, session.round);

  return buildPublicState({
    sessionId: session.session_id,
    slug: session.slug,
    roundState: {
      sessionId: session.session_id,
      slug: session.slug,
      round: session.round,
      phase: session.phase,
      roundDurationSeconds: session.round_duration_seconds,
      transitionDurationSeconds: session.transition_duration_seconds,
      roundStartedAt: session.round_started_at,
      roundEndsAt: session.round_ends_at,
      phaseStartedAt: session.phase_started_at,
      phaseEndsAt: session.phase_ends_at,
      serverNow: nowIso(),
    },
    leftQueueEntries: leftQueue.map((q) => ({
      participantId: q.participant_id,
      joinedAt: q.joined_at,
    })),
    rightQueueEntries: rightQueue.map((q) => ({
      participantId: q.participant_id,
      joinedAt: q.joined_at,
    })),
    participantsById,
    pairs: pairs.map((p) => ({
      pairId: p.id,
      roomId: p.room_id,
      sessionId: p.session_id,
      round: p.round,
      leftParticipantId: p.left_participant_id,
      rightParticipantId: p.right_participant_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      active: p.active,
    })),
  });
}

export async function getPrivateRoom(params: {
  sessionId: string;
  browserKey: string;
}) {
  const supabase = getAdminClient();
  const session = await ensureFreshSession({
    sessionId: params.sessionId,
    slug: "live",
  });

  const participant = await getParticipantByBrowserKey(params);
  if (!participant) return null;

  const me = toParticipantProfile(participant);

  const { data: pairData, error: pairErr } = await supabase
    .from("speed_dating_pairs")
    .select("*")
    .eq("session_id", params.sessionId)
    .eq("round", session.round)
    .or(`left_participant_id.eq.${participant.id},right_participant_id.eq.${participant.id}`)
    .maybeSingle();

  if (pairErr) throw pairErr;

  const pair = (pairData as PairRow | null) ?? null;
  const otherParticipantId =
    pair?.left_participant_id === participant.id
      ? pair.right_participant_id
      : pair?.right_participant_id === participant.id
      ? pair.left_participant_id
      : null;

  let otherParticipant: SpeedDatingParticipantProfile | null = null;

  if (otherParticipantId) {
    const { data } = await supabase
      .from("speed_dating_participants")
      .select("*")
      .eq("id", otherParticipantId)
      .maybeSingle();

    if (data) {
      otherParticipant = toParticipantProfile(data as ParticipantRow);
    }
  }

  const side = getQueueSide(participant.iam);
  const oppositeSide = side === "left" ? "right" : "left";
  const oppositeQueue = await fetchQueue(supabase, params.sessionId, oppositeSide);

  const participantsMap = await fetchParticipantsMap(supabase, params.sessionId);
  const upcomingQueue = oppositeQueue
    .map((entry) => participantsMap.get(entry.participant_id) ?? null)
    .filter(Boolean)
    .filter((p) => p!.id !== otherParticipantId) as SpeedDatingParticipantProfile[];

  const timeRemainingSeconds = Math.max(
    0,
    Math.ceil(
      (new Date(session.phase_ends_at).getTime() - Date.now()) / 1000,
    ),
  );

  const result: SpeedDatingPrivateRoomState = {
    roomId: pair?.room_id ?? (`00000000-0000-0000-0000-000000000000` as string),
    pairId: pair?.id ?? null,
    sessionId: session.session_id,
    slug: session.slug,
    round: session.round,
    phase: session.phase,
    roundDurationSeconds: session.round_duration_seconds,
    transitionDurationSeconds: session.transition_duration_seconds,
    roundStartedAt: session.round_started_at,
    roundEndsAt: session.round_ends_at,
    phaseStartedAt: session.phase_started_at,
    phaseEndsAt: session.phase_ends_at,
    serverNow: nowIso(),
    timeRemainingSeconds,
    me,
    otherParticipant,
    upcomingQueue,
    hasMatch: Boolean(pair && otherParticipant),
  };

  return result;
}