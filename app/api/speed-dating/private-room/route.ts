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