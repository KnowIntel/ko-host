import type {
  SpeedDatingApiError,
  SpeedDatingApiSuccess,
  SpeedDatingPair,
  SpeedDatingParticipantProfile,
  SpeedDatingPublicPairState,
  SpeedDatingPublicParticipantCard,
  SpeedDatingPublicState,
  SpeedDatingQueueEntry,
  SpeedDatingRoundState,
} from "./types";

export function ok<T>(data: T): SpeedDatingApiSuccess<T> {
  return {
    ok: true,
    data,
  };
}

export function fail(
  error: string,
  code: SpeedDatingApiError["code"] = "BAD_REQUEST",
): SpeedDatingApiError {
  return {
    ok: false,
    error,
    code,
  };
}

export function toPublicParticipantCard(
  participant: SpeedDatingParticipantProfile,
): SpeedDatingPublicParticipantCard {
  return {
    participantId: participant.id,
    name: participant.name,
    title: participant.title,
    bio: participant.bio,
    imageUrl: participant.imageUrl ?? null,
    iam: participant.iam,
    seeking: participant.seeking,
  };
}

export function toPublicPairState(params: {
  pair: SpeedDatingPair;
  leftParticipant: SpeedDatingParticipantProfile | null;
  rightParticipant: SpeedDatingParticipantProfile | null;
}): SpeedDatingPublicPairState {
  const { pair, leftParticipant, rightParticipant } = params;

  return {
    pairId: pair.pairId,
    round: pair.round,
    leftParticipant: leftParticipant
      ? toPublicParticipantCard(leftParticipant)
      : null,
    rightParticipant: rightParticipant
      ? toPublicParticipantCard(rightParticipant)
      : null,
    openSlotLeft: !leftParticipant,
    openSlotRight: !rightParticipant,
  };
}

export function buildPublicState(params: {
  sessionId: string;
  slug: string;
  roundState: SpeedDatingRoundState;
  leftQueueEntries: SpeedDatingQueueEntry[];
  rightQueueEntries: SpeedDatingQueueEntry[];
  participantsById: Map<string, SpeedDatingParticipantProfile>;
  pairs: SpeedDatingPair[];
}): SpeedDatingPublicState {
  const {
    sessionId,
    slug,
    roundState,
    leftQueueEntries,
    rightQueueEntries,
    participantsById,
    pairs,
  } = params;

  const leftQueue = leftQueueEntries
    .map((entry) => participantsById.get(entry.participantId))
    .filter(Boolean)
    .map((participant) =>
      toPublicParticipantCard(participant as SpeedDatingParticipantProfile),
    );

  const rightQueue = rightQueueEntries
    .map((entry) => participantsById.get(entry.participantId))
    .filter(Boolean)
    .map((participant) =>
      toPublicParticipantCard(participant as SpeedDatingParticipantProfile),
    );

  const activePairs = pairs.map((pair) =>
    toPublicPairState({
      pair,
      leftParticipant: pair.leftParticipantId
        ? participantsById.get(pair.leftParticipantId) ?? null
        : null,
      rightParticipant: pair.rightParticipantId
        ? participantsById.get(pair.rightParticipantId) ?? null
        : null,
    }),
  );

  return {
    sessionId,
    slug,
    round: roundState.round,
    phase: roundState.phase,
    roundDurationSeconds: roundState.roundDurationSeconds,
    transitionDurationSeconds: roundState.transitionDurationSeconds,
    roundStartedAt: roundState.roundStartedAt,
    roundEndsAt: roundState.roundEndsAt,
    phaseStartedAt: roundState.phaseStartedAt,
    phaseEndsAt: roundState.phaseEndsAt,
    serverNow: roundState.serverNow,
    queues: {
      leftQueue,
      rightQueue,
    },
    activePairs,
  };
}