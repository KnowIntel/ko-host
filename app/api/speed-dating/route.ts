import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";

/* ================= TYPES ================= */

type IAm = "man" | "woman";
type Seeking = "men" | "women";
type Side = "left" | "right";

type Participant = {
  id: string;
  browserKey: string;
  name: string;
  title: string;
  bio: string;
  image_url?: string | null;
  iam: IAm;
  seeking: Seeking;
  side: Side;
  joinedAt: number;
  updatedAt: number;
  isActive: boolean;
  skippedRound?: number;
};

type PublicParticipant = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url?: string | null;
  side: Side;
  waiting: boolean;
};

type Pair = {
  id: string; // sessionId
  leftParticipant: PublicParticipant | null;
  rightParticipant: PublicParticipant | null;
  status: "active" | "open";
};

type JoinBody = {
  browserKey?: string;
  name?: string;
  title?: string;
  bio?: string;
  image_url?: string | null;
  iam?: IAm;
  seeking?: Seeking;
};

type ActionBody =
  | (JoinBody & { action?: "join" })
  | { action: "skip"; browserKey: string }
  | { action: "leave"; browserKey: string };

/* ================= CONFIG ================= */

const ROUND_DURATION_SECONDS = 120;

/* ================= GLOBAL STORE ================= */

declare global {
  var __KOHOST_SPEED_DATING_STORE__:
    | {
        participants: Participant[];
        round: number;
        roundStartedAt: number;
        sessions: Record<string, Pair>; // stable per round
      }
    | undefined;
}

function getStore() {
  if (!globalThis.__KOHOST_SPEED_DATING_STORE__) {
    globalThis.__KOHOST_SPEED_DATING_STORE__ = {
      participants: [],
      round: 0,
      roundStartedAt: Date.now(),
      sessions: {},
    };
  }
  return globalThis.__KOHOST_SPEED_DATING_STORE__;
}

/* ================= HELPERS ================= */

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function getSide(iam: IAm): Side {
  return iam === "man" ? "left" : "right";
}

function normalizeRound(store: ReturnType<typeof getStore>) {
  const now = Date.now();
  const elapsed = Math.floor((now - store.roundStartedAt) / 1000);

  if (elapsed >= ROUND_DURATION_SECONDS) {
    const steps = Math.floor(elapsed / ROUND_DURATION_SECONDS);
    store.round += steps;
    store.roundStartedAt += steps * ROUND_DURATION_SECONDS * 1000;

    // 🔥 CLEAR SESSIONS EACH ROUND
    store.sessions = {};
  }
}

function getTimeLeftSeconds(store: ReturnType<typeof getStore>) {
  const elapsed = Math.floor((Date.now() - store.roundStartedAt) / 1000);
  return Math.max(0, ROUND_DURATION_SECONDS - elapsed);
}

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

function toPublic(p: Participant, waiting: boolean): PublicParticipant {
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

/* ================= CORE ENGINE ================= */

function buildPairs(store: ReturnType<typeof getStore>) {
  const round = store.round;

  const left = rotateLeftDown(
    store.participants.filter((p) => p.isActive && p.side === "left"),
    round,
  );

  const right = rotateRightUp(
    store.participants.filter((p) => p.isActive && p.side === "right"),
    round,
  );

  const max = Math.max(left.length, right.length);
  const pairs: Pair[] = [];
  const activeIds = new Set<string>();

  for (let i = 0; i < max; i++) {
    const l = left[i] ?? null;
    const r = right[i] ?? null;

    // skip logic
    if (l && l.skippedRound === round) continue;
    if (r && r.skippedRound === round) continue;

    if (l && r && isCompatible(l, r)) {
      const sessionId = `${l.id}_${r.id}_r${round}`;

      activeIds.add(l.id);
      activeIds.add(r.id);

      const pair: Pair = {
        id: sessionId,
        leftParticipant: toPublic(l, false),
        rightParticipant: toPublic(r, false),
        status: "active",
      };

      store.sessions[sessionId] = pair;
      pairs.push(pair);
    } else {
      if (l) {
        pairs.push({
          id: makeId("open"),
          leftParticipant: toPublic(l, true),
          rightParticipant: null,
          status: "open",
        });
      }

      if (r) {
        pairs.push({
          id: makeId("open"),
          leftParticipant: null,
          rightParticipant: toPublic(r, true),
          status: "open",
        });
      }
    }
  }

  return { pairs, left, right, activeIds };
}

/* ================= STATE ================= */

function buildState() {
  const store = getStore();
  normalizeRound(store);

  const { pairs, left, right, activeIds } = buildPairs(store);

  return {
    ok: true,
    round: store.round,
    roundDurationSeconds: ROUND_DURATION_SECONDS,
    timeLeftSeconds: getTimeLeftSeconds(store),
    leftQueue: left.map((p) => toPublic(p, !activeIds.has(p.id))),
    rightQueue: right.map((p) => toPublic(p, !activeIds.has(p.id))),
    activePairs: pairs,
  };
}

/* ================= VALIDATION ================= */

function validateJoin(body: JoinBody) {
  if (!body.browserKey) return "browserKey required";
  if (!body.name) return "name required";
  if (!body.title) return "title required";
  if (!body.bio) return "bio required";
  if (!body.iam) return "iam required";
  if (!body.seeking) return "seeking required";
  return null;
}

async function parseActionBody(req: Request): Promise<ActionBody> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();

    const actionValue = formData.get("action");
    const action =
      typeof actionValue === "string" && actionValue.length
        ? actionValue
        : "join";

    if (action === "skip") {
      return {
        action: "skip",
        browserKey: String(formData.get("browserKey") || ""),
      };
    }

    if (action === "leave") {
      return {
        action: "leave",
        browserKey: String(formData.get("browserKey") || ""),
      };
    }

    const browserKeyValue = formData.get("browserKey");
    const nameValue = formData.get("name");
    const titleValue = formData.get("title");
    const bioValue = formData.get("bio");
    const iamValue = formData.get("iam");
    const seekingValue = formData.get("seeking");
    const imageValue = formData.get("image");

    let image_url: string | null = null;

    if (imageValue instanceof File && imageValue.size > 0) {
      const bytes = await imageValue.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = imageValue.type || "application/octet-stream";
      image_url = `data:${mimeType};base64,${base64}`;
    }

    return {
      action: "join",
      browserKey:
        typeof browserKeyValue === "string" ? browserKeyValue : undefined,
      name: typeof nameValue === "string" ? nameValue : undefined,
      title: typeof titleValue === "string" ? titleValue : undefined,
      bio: typeof bioValue === "string" ? bioValue : undefined,
      iam: typeof iamValue === "string" ? (iamValue as IAm) : undefined,
      seeking:
        typeof seekingValue === "string"
          ? (seekingValue as Seeking)
          : undefined,
      image_url,
    };
  }

  return (await req.json()) as ActionBody;
}

/* ================= ROUTES ================= */

export async function GET() {
  return NextResponse.json(buildState());
}

export async function POST(req: Request) {
  const body = await parseActionBody(req);
  const store = getStore();
  const now = Date.now();

  /* ===== JOIN ===== */
  if (!("action" in body) || body.action === "join") {
    const err = validateJoin(body);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });

    const idx = store.participants.findIndex(
      (p) => p.browserKey === body.browserKey,
    );

    const existing = idx >= 0 ? store.participants[idx] : null;

    const base: Participant = {
      id: existing ? existing.id : makeId("p"),
      browserKey: body.browserKey!,
      name: body.name!,
      title: body.title!,
      bio: body.bio!,
      image_url:
        "image_url" in body && body.image_url
          ? body.image_url
          : existing?.image_url ?? null,
      iam: body.iam!,
      seeking: body.seeking!,
      side: getSide(body.iam!),
      joinedAt: existing ? existing.joinedAt : now,
      updatedAt: now,
      isActive: true,
    };

    if (idx >= 0) store.participants[idx] = base;
    else store.participants.push(base);

    return NextResponse.json({ ok: true, state: buildState() });
  }

  /* ===== SKIP ===== */
  if (body.action === "skip") {
    const p = store.participants.find(
      (x) => x.browserKey === body.browserKey,
    );
    if (p) p.skippedRound = store.round;

    return NextResponse.json({ ok: true, state: buildState() });
  }

  /* ===== LEAVE ===== */
  if (body.action === "leave") {
    const p = store.participants.find(
      (x) => x.browserKey === body.browserKey,
    );
    if (p) p.isActive = false;

    return NextResponse.json({ ok: true, state: buildState() });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}