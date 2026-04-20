import {
  SPEED_DATING_DEFAULT_ROUND_DURATION_SECONDS,
  SPEED_DATING_MAX_ROUND_DURATION_SECONDS,
  SPEED_DATING_MIN_ROUND_DURATION_SECONDS,
} from "./constants";
import type {
  SpeedDatingPair,
  SpeedDatingParticipantProfile,
  SpeedDatingQueueEntry,
  SpeedDatingRoundState,
} from "./types";

type SessionState = {
  sessionId: string;
  slug: string;

  roundState: SpeedDatingRoundState;

  participantsById: Map<string, SpeedDatingParticipantProfile>;
  participantsByBrowserKey: Map<string, string>;

  leftQueue: SpeedDatingQueueEntry[];
  rightQueue: SpeedDatingQueueEntry[];

  pairs: SpeedDatingPair[];
};

const sessions = new Map<string, SessionState>();

function nowIso() {
  return new Date().toISOString();
}

function createParticipantId(browserKey: string) {
  return `participant_${browserKey}`;
}

function createPairId(sessionId: string, round: number, index: number) {
  return `pair_${sessionId}_${round}_${index}`;
}

function createRoomId(sessionId: string, round: number, index: number) {
  return `room_${sessionId}_${round}_${index}`;
}

function normalizeRoundDurationSeconds(value?: number) {
  const raw = Number.isFinite(value) ? Math.floor(value as number) : SPEED_DATING_DEFAULT_ROUND_DURATION_SECONDS;

  return Math.max(
    SPEED_DATING_MIN_ROUND_DURATION_SECONDS,
    Math.min(SPEED_DATING_MAX_ROUND_DURATION_SECONDS, raw),
  );
}

function createInitialRoundState(params: {
  sessionId: string;
  slug: string;
  roundDurationSeconds?: number;
}): SpeedDatingRoundState {
  const startedAt = new Date();
  const roundDurationSeconds = normalizeRoundDurationSeconds(
    params.roundDurationSeconds,
  );
  const endsAt = new Date(startedAt.getTime() + roundDurationSeconds * 1000);

  return {
    sessionId: params.sessionId,
    slug: params.slug,
    round: 0,
    roundDurationSeconds,
    roundStartedAt: startedAt.toISOString(),
    roundEndsAt: endsAt.toISOString(),
    serverNow: startedAt.toISOString(),
  };
}

function createEmptySession(params: {
  sessionId: string;
  slug: string;
  roundDurationSeconds?: number;
}): SessionState {
  return {
    sessionId: params.sessionId,
    slug: params.slug,
    roundState: createInitialRoundState(params),
    participantsById: new Map(),
    participantsByBrowserKey: new Map(),
    leftQueue: [],
    rightQueue: [],
    pairs: [],
  };
}

function getQueueSide(iam: "man" | "woman"): "left" | "right" {
  return iam === "man" ? "left" : "right";
}

function upsertQueueEntry(
  queue: SpeedDatingQueueEntry[],
  participantId: string,
  joinedAt: string,
) {
  const exists = queue.some((entry) => entry.participantId === participantId);
  if (exists) return queue;

  return [...queue, { participantId, joinedAt }];
}

function removeQueueEntry(
  queue: SpeedDatingQueueEntry[],
  participantId: string,
) {
  return queue.filter((entry) => entry.participantId !== participantId);
}

function removeParticipantFromAllPairs(
  pairs: SpeedDatingPair[],
  participantId: string,
) {
  return pairs.map((pair) => {
    const nextLeft =
      pair.leftParticipantId === participantId ? null : pair.leftParticipantId;
    const nextRight =
      pair.rightParticipantId === participantId ? null : pair.rightParticipantId;

    return {
      ...pair,
      leftParticipantId: nextLeft,
      rightParticipantId: nextRight,
      updatedAt: nowIso(),
      active: Boolean(nextLeft || nextRight),
      status: undefined,
    };
  });
}

function compactPairs(pairs: SpeedDatingPair[]) {
  return pairs.filter(
    (pair) => pair.leftParticipantId !== null || pair.rightParticipantId !== null,
  );
}

function seekingMatchesIam(
  seeking: "men" | "women",
  iam: "man" | "woman",
) {
  return (
    (seeking === "men" && iam === "man") ||
    (seeking === "women" && iam === "woman")
  );
}

function isCompatible(params: {
  leftParticipant: SpeedDatingParticipantProfile;
  rightParticipant: SpeedDatingParticipantProfile;
}) {
  const { leftParticipant, rightParticipant } = params;

  return (
    seekingMatchesIam(leftParticipant.seeking, rightParticipant.iam) &&
    seekingMatchesIam(rightParticipant.seeking, leftParticipant.iam)
  );
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

function getActiveParticipantIdsFromQueue(
  queue: SpeedDatingQueueEntry[],
  participantsById: Map<string, SpeedDatingParticipantProfile>,
) {
  return queue
    .map((entry) => entry.participantId)
    .filter((participantId) => {
      const participant = participantsById.get(participantId);
      return Boolean(participant?.active);
    });
}

function buildPairsForCurrentRound(session: SessionState) {
  const participantsById = session.participantsById;
  const round = session.roundState.round;

  const leftIds = getActiveParticipantIdsFromQueue(
    session.leftQueue,
    participantsById,
  );

  const rightIds = getActiveParticipantIdsFromQueue(
    session.rightQueue,
    participantsById,
  );

  const rotatedLeftIds = rotateArrayDown(leftIds, round);
  const rotatedRightIds = rotateArrayUp(rightIds, round);

  const maxLen = Math.max(rotatedLeftIds.length, rotatedRightIds.length);
  const nextPairs: SpeedDatingPair[] = [];

  for (let index = 0; index < maxLen; index += 1) {
    const leftParticipantId = rotatedLeftIds[index] ?? null;
    const rightParticipantId = rotatedRightIds[index] ?? null;

    const createdAt = nowIso();

    nextPairs.push({
      pairId: createPairId(session.sessionId, round, index),
      roomId: createRoomId(session.sessionId, round, index),
      sessionId: session.sessionId,
      round,
      leftParticipantId,
      rightParticipantId,
      createdAt,
      updatedAt: createdAt,
      active: Boolean(leftParticipantId || rightParticipantId),
    });
  }

  session.pairs = nextPairs;
}

function syncServerNow(session: SessionState) {
  session.roundState.serverNow = nowIso();
}

function refreshRoundIfNeeded(session: SessionState) {
  syncServerNow(session);

  const now = Date.now();
  const roundEndsAt = new Date(session.roundState.roundEndsAt).getTime();

  if (now < roundEndsAt) return false;

  const nextRound = session.roundState.round + 1;
  const nextStartedAt = new Date();
  const nextEndsAt = new Date(
    nextStartedAt.getTime() + session.roundState.roundDurationSeconds * 1000,
  );

  session.roundState = {
    ...session.roundState,
    round: nextRound,
    roundStartedAt: nextStartedAt.toISOString(),
    roundEndsAt: nextEndsAt.toISOString(),
    serverNow: nextStartedAt.toISOString(),
  };

  buildPairsForCurrentRound(session);
  return true;
}

export function getOrCreateSessionState(params: {
  sessionId: string;
  slug: string;
  roundDurationSeconds?: number;
}) {
  const existing = sessions.get(params.sessionId);

  if (existing) {
    if (params.slug && existing.slug !== params.slug) {
      existing.slug = params.slug;
      existing.roundState.slug = params.slug;
    }

    if (typeof params.roundDurationSeconds === "number") {
      existing.roundState.roundDurationSeconds = normalizeRoundDurationSeconds(
        params.roundDurationSeconds,
      );
    }

    refreshRoundIfNeeded(existing);
    syncServerNow(existing);
    return existing;
  }

  const created = createEmptySession(params);
  sessions.set(params.sessionId, created);
  refreshRoundIfNeeded(created);
  syncServerNow(created);
  return created;
}

export function getSessionState(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  refreshRoundIfNeeded(session);
  syncServerNow(session);
  return session;
}

export function joinParticipant(params: {
  sessionId: string;
  slug: string;
  browserKey: string;
  name: string;
  title: string;
  bio: string;
  iam: "man" | "woman";
  seeking: "men" | "women";
  imageUrl?: string | null;
  roundDurationSeconds?: number;
}) {
  const session = getOrCreateSessionState({
    sessionId: params.sessionId,
    slug: params.slug,
    roundDurationSeconds: params.roundDurationSeconds,
  });

  const participantId =
    session.participantsByBrowserKey.get(params.browserKey) ??
    createParticipantId(params.browserKey);

  const timestamp = nowIso();

  const participant: SpeedDatingParticipantProfile = {
    id: participantId,
    browserKey: params.browserKey,
    sessionId: params.sessionId,
    slug: params.slug,
    name: params.name,
    title: params.title,
    bio: params.bio,
    imageUrl: params.imageUrl ?? null,
    iam: params.iam,
    seeking: params.seeking,
    joinedAt:
      session.participantsById.get(participantId)?.joinedAt ?? timestamp,
    updatedAt: timestamp,
    active: true,
  };

  session.participantsById.set(participantId, participant);
  session.participantsByBrowserKey.set(params.browserKey, participantId);

  session.leftQueue = removeQueueEntry(session.leftQueue, participantId);
  session.rightQueue = removeQueueEntry(session.rightQueue, participantId);

  const side = getQueueSide(params.iam);
  if (side === "left") {
    session.leftQueue = upsertQueueEntry(session.leftQueue, participantId, timestamp);
  } else {
    session.rightQueue = upsertQueueEntry(session.rightQueue, participantId, timestamp);
  }

  buildPairsForCurrentRound(session);
  syncServerNow(session);

  return {
    session,
    participant,
  };
}

export function leaveParticipant(params: {
  sessionId: string;
  browserKey: string;
}) {
  const session = getSessionState(params.sessionId);
  if (!session) return null;

  const participantId = session.participantsByBrowserKey.get(params.browserKey);
  if (!participantId) return session;

  const existing = session.participantsById.get(participantId);
  if (existing) {
    session.participantsById.set(participantId, {
      ...existing,
      active: false,
      updatedAt: nowIso(),
    });
  }

  session.leftQueue = removeQueueEntry(session.leftQueue, participantId);
  session.rightQueue = removeQueueEntry(session.rightQueue, participantId);
  session.pairs = compactPairs(
    removeParticipantFromAllPairs(session.pairs, participantId),
  );

  buildPairsForCurrentRound(session);
  syncServerNow(session);

  return session;
}

export function skipParticipant(params: {
  sessionId: string;
  browserKey: string;
}) {
  const session = getSessionState(params.sessionId);
  if (!session) return null;

  const participantId = session.participantsByBrowserKey.get(params.browserKey);
  if (!participantId) return session;

  const participant = session.participantsById.get(participantId);
  if (!participant || !participant.active) return session;

  session.pairs = session.pairs.map((pair) => {
    const isLeft = pair.leftParticipantId === participantId;
    const isRight = pair.rightParticipantId === participantId;

    if (!isLeft && !isRight) return pair;

    return {
      ...pair,
      leftParticipantId: isLeft ? null : pair.leftParticipantId,
      rightParticipantId: isRight ? null : pair.rightParticipantId,
      updatedAt: nowIso(),
      active: true,
    };
  });

  session.leftQueue = removeQueueEntry(session.leftQueue, participantId);
  session.rightQueue = removeQueueEntry(session.rightQueue, participantId);

  const requeueTime = nowIso();
  if (participant.iam === "man") {
    session.leftQueue = [...session.leftQueue, { participantId, joinedAt: requeueTime }];
  } else {
    session.rightQueue = [...session.rightQueue, { participantId, joinedAt: requeueTime }];
  }

  session.pairs = compactPairs(session.pairs);
  buildPairsForCurrentRound(session);
  syncServerNow(session);

  return session;
}

export function getParticipantByBrowserKey(params: {
  sessionId: string;
  browserKey: string;
}) {
  const session = getSessionState(params.sessionId);
  if (!session) return null;

  const participantId = session.participantsByBrowserKey.get(params.browserKey);
  if (!participantId) return null;

  return session.participantsById.get(participantId) ?? null;
}

export function getPublicStateParts(sessionId: string) {
  const session = getSessionState(sessionId);
  if (!session) return null;

  return {
    sessionId: session.sessionId,
    slug: session.slug,
    roundState: session.roundState,
    leftQueueEntries: session.leftQueue,
    rightQueueEntries: session.rightQueue,
    participantsById: session.participantsById,
    pairs: session.pairs,
  };
}