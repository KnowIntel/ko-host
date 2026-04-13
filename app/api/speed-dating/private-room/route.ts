import { NextResponse } from "next/server";

type PublicParticipant = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url?: string | null;
  side: "left" | "right";
  waiting: boolean;
};

type Pair = {
  id: string;
  roomId: string;
  round: number;
  leftParticipant: PublicParticipant | null;
  rightParticipant: PublicParticipant | null;
  status: "active" | "open";
};

type Participant = {
  id: string;
  browserKey: string;
  name: string;
  title: string;
  bio: string;
  image_url?: string | null;
  iam: "man" | "woman";
  seeking: "men" | "women";
  side: "left" | "right";
  joinedAt: number;
  updatedAt: number;
  isActive: boolean;
  skippedPartnerId?: string;
  skippedPartnerRound?: number;
};

type Phase = "active" | "transition";

type SessionStore = {
  participants: Participant[];
  round: number;
  phase: Phase;
  phaseStartedAt: number;
  phaseEndsAt: number;
  activePairs: Pair[];
  rooms: Record<string, Pair>;
};

declare global {
  var __KOHOST_SPEED_DATING_STORE__:
    | Record<string, SessionStore>
    | undefined;
}

function getStore(sessionId: string) {
  const root = globalThis.__KOHOST_SPEED_DATING_STORE__ ?? {};
  const store = root[sessionId];
  return store ?? null;
}

function getTimeLeftSeconds(phaseEndsAt: number) {
  return Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "default";
  const browserKey = searchParams.get("browserKey") || "";
  const ROUND_DURATION_SECONDS = 120;
const TRANSITION_DURATION_SECONDS = 10;

function isCompatible(a: Participant, b: Participant) {
  return (
    a.side === "left" &&
    b.side === "right" &&
    a.seeking === "women" &&
    b.seeking === "men"
  );
}

function rotateLeftDown<T>(arr: T[], r: number) {
  if (!arr.length) return [];
  const o = r % arr.length;
  return [...arr.slice(o), ...arr.slice(0, o)];
}

function rotateRightUp<T>(arr: T[], r: number) {
  if (!arr.length) return [];
  const o = r % arr.length;
  return [...arr.slice(arr.length - o), ...arr.slice(0, arr.length - o)];
}

function toPublicParticipant(p: Participant, waiting: boolean): PublicParticipant {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    bio: p.bio,
    image_url: p.image_url ?? null,
    side: p.side,
    waiting,
  };
}

function buildPairsForRound(sessionId: string, store: SessionStore) {
  const round = store.round;

  const left = rotateLeftDown(
    store.participants.filter((p) => p.isActive && p.side === "left"),
    round,
  );

  const right = rotateRightUp(
    store.participants.filter((p) => p.isActive && p.side === "right"),
    round,
  );

  const pairs: Pair[] = [];
  const usedRightIds = new Set<string>();

  for (const l of left) {
    let matchedRight: Participant | null = null;

    for (const r of right) {
      if (usedRightIds.has(r.id)) continue;
      if (!isCompatible(l, r)) continue;

      const leftSkippedThisPair =
        l.skippedPartnerRound === round && l.skippedPartnerId === r.id;

      const rightSkippedThisPair =
        r.skippedPartnerRound === round && r.skippedPartnerId === l.id;

      if (leftSkippedThisPair || rightSkippedThisPair) continue;

      matchedRight = r;
      break;
    }

    if (matchedRight) {
      usedRightIds.add(matchedRight.id);

      const roomId = `${sessionId}__${round}__${l.id}__${matchedRight.id}`;

      pairs.push({
        id: `${l.id}_${matchedRight.id}_r${round}`,
        roomId,
        round,
        leftParticipant: toPublicParticipant(l, false),
        rightParticipant: toPublicParticipant(matchedRight, false),
        status: "active",
      });
    } else {
      pairs.push({
        id: `open_left_${l.id}_r${round}`,
        roomId: "",
        round,
        leftParticipant: toPublicParticipant(l, true),
        rightParticipant: null,
        status: "open",
      });
    }
  }

  for (const r of right) {
    if (usedRightIds.has(r.id)) continue;

    pairs.push({
      id: `open_right_${r.id}_r${round}`,
      roomId: "",
      round,
      leftParticipant: null,
      rightParticipant: toPublicParticipant(r, true),
      status: "open",
    });
  }

  return pairs;
}

function refreshRoundState(sessionId: string, store: SessionStore) {
  const now = Date.now();

  while (now >= store.phaseEndsAt) {
    if (store.phase === "active") {
      store.phase = "transition";
      store.phaseStartedAt = store.phaseEndsAt;
      store.phaseEndsAt =
        store.phaseStartedAt + TRANSITION_DURATION_SECONDS * 1000;
      continue;
    }

    store.round += 1;
    store.phase = "active";
    store.phaseStartedAt = store.phaseEndsAt;
    store.phaseEndsAt =
      store.phaseStartedAt + ROUND_DURATION_SECONDS * 1000;

    const pairs = buildPairsForRound(sessionId, store);
    store.activePairs = pairs;
    store.rooms = {};

    for (const pair of pairs) {
      if (pair.status === "active" && pair.roomId) {
        store.rooms[pair.roomId] = pair;
      }
    }
  }

  if (!store.activePairs.length && store.phase === "active") {
    const pairs = buildPairsForRound(sessionId, store);
    store.activePairs = pairs;
    store.rooms = {};

    for (const pair of pairs) {
      if (pair.status === "active" && pair.roomId) {
        store.rooms[pair.roomId] = pair;
      }
    }
  }
}

  if (!browserKey) {
    return NextResponse.json(
      { ok: false, error: "browserKey required" },
      { status: 400 },
    );
  }

const store = getStore(sessionId);

if (!store) {
  return NextResponse.json({
    ok: true,
    participant: null,
    room: null,
    partner: null,
    round: 0,
    phase: "active",
    timeLeftSeconds: 0,
    oppositeLineup: [],
    waiting: false,
  });
}

refreshRoundState(sessionId, store);

const participant =
  store.participants.find((p) => p.browserKey === browserKey) ?? null;

if (!participant) {
  return NextResponse.json({
    ok: true,
    participant: null,
    room: null,
    partner: null,
    round: store.round,
    phase: store.phase,
    timeLeftSeconds: getTimeLeftSeconds(store.phaseEndsAt),
    oppositeLineup: [],
    waiting: false,
  });
}

  const room =
    Object.values(store.rooms).find(
      (pair) =>
        pair.status === "active" &&
        (
          pair.leftParticipant?.id === participant.id ||
          pair.rightParticipant?.id === participant.id
        ),
    ) ?? null;

  const partner =
    !room
      ? null
      : room.leftParticipant?.id === participant.id
        ? room.rightParticipant
        : room.leftParticipant;

const oppositeLineup = store.participants
  .filter((p) => p.isActive && p.side !== participant.side)
  .map((p) => ({
    id: p.id,
    name: p.name,
    title: p.title,
    bio: p.bio,
    image_url: p.image_url ?? null,
    side: p.side,
    waiting: !Object.values(store.rooms).some(
      (pair) =>
        pair.status === "active" &&
        (
          pair.leftParticipant?.id === p.id ||
          pair.rightParticipant?.id === p.id
        ),
    ),
  }))
  .sort((a, b) => Number(b.waiting) - Number(a.waiting) || a.name.localeCompare(b.name));

  return NextResponse.json({
    ok: true,
    participant: {
      id: participant.id,
      name: participant.name,
      title: participant.title,
      bio: participant.bio,
      image_url: participant.image_url ?? null,
      side: participant.side,
    },
    room: room
      ? {
          id: room.id,
          roomId: room.roomId,
          round: room.round,
          status: room.status,
        }
      : null,
    partner,
    round: store.round,
    phase: store.phase,
    timeLeftSeconds: getTimeLeftSeconds(store.phaseEndsAt),
    oppositeLineup,
    waiting: !room,
  });
}