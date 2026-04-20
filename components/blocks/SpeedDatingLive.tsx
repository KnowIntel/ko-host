"use client";

import { useEffect, useMemo, useState } from "react";

type Participant = {
  participantId: string;
  name: string;
  title: string;
  bio: string;
  imageUrl?: string | null;
};

type Pair = {
  pairId: string;
  leftParticipant: Participant | null;
  rightParticipant: Participant | null;
  openSlotLeft: boolean;
  openSlotRight: boolean;
};

type PublicState = {
  round: number;
  roundDurationSeconds: number;
  roundStartedAt: string;
  roundEndsAt: string;
  serverNow: string;
  queues: {
    leftQueue: Participant[];
    rightQueue: Participant[];
  };
  activePairs: Pair[];
};

type PrivateRoom = {
  roomId: string | null;
  pairId: string | null;
  round: number;
  participant: Participant | null;
  partner: Participant | null;
  hasMatch: boolean;
};

type Props = {
  heading?: string;
  roundDurationSeconds: number;
  showTimer: boolean;
  leftLabel?: string;
  rightLabel?: string;
  roundStartSound?: "none" | "arrival" | "spark" | "commence" | "cloak" | "vanish";
};

function getBrowserKey() {
  let key = localStorage.getItem("kohost_speed_dating_key");
  if (!key) {
    key = `bk_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("kohost_speed_dating_key", key);
  }
  return key;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export default function SpeedDatingLive({
  heading,
  showTimer,
  leftLabel = "Men",
  rightLabel = "Women",
}: Props) {
  const [state, setState] = useState<PublicState | null>(null);
  const [room, setRoom] = useState<PrivateRoom | null>(null);

  const [joinForm, setJoinForm] = useState({
    name: "",
    title: "",
    bio: "",
    iam: "" as "" | "man" | "woman",
    seeking: "" as "" | "men" | "women",
  });

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  const [viewMode, setViewMode] = useState<"public" | "private">("public");
  const [lastStableRoom, setLastStableRoom] = useState<PrivateRoom | null>(null);

  const sessionId =
    typeof window !== "undefined" ? window.location.hostname : "default";

  const browserKey =
    typeof window !== "undefined" ? getBrowserKey() : "";

  async function fetchState() {
    const res = await fetch(
      `/api/speed-dating/state?sessionId=${encodeURIComponent(sessionId)}`,
      { cache: "no-store" }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return;

    setState(data.data);
  }

async function fetchPrivateRoom() {
  const res = await fetch(
    `/api/speed-dating/private-room?sessionId=${encodeURIComponent(
      sessionId
    )}&browserKey=${encodeURIComponent(browserKey)}`,
    { cache: "no-store" }
  );

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) return;

  const nextRoom = data.data as PrivateRoom;

  if (nextRoom?.participant) {
    setRoom(nextRoom);
    setLastStableRoom(nextRoom);
  } else {
    setRoom(nextRoom);
  }
}

  async function handleJoin() {
    setJoinError("");

    if (
      !joinForm.name.trim() ||
      !joinForm.title.trim() ||
      !joinForm.bio.trim() ||
      !joinForm.iam ||
      !joinForm.seeking
    ) {
      setJoinError("Fill all fields");
      return;
    }

    setJoining(true);

    try {
      const res = await fetch("/api/speed-dating/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          slug: "live",
          browserKey,
          ...joinForm,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setJoinError(data?.error || "Join failed");
        return;
      }

      setState(data.data.state);
      await fetchPrivateRoom();
      setViewMode("private");
    } catch {
      setJoinError("Join failed");
    } finally {
      setJoining(false);
    }
  }

  async function handleSkip() {
    await fetch("/api/speed-dating/skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        browserKey,
      }),
    });

    await fetchState();
    await fetchPrivateRoom();
  }

async function handleExit() {
  await fetch("/api/speed-dating/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      browserKey,
    }),
  });

  setRoom(null);
  setLastStableRoom(null);
  setViewMode("public");
  await fetchState();
}

useEffect(() => {
  void fetchState();

  const interval = window.setInterval(() => {
    void fetchState();
    if (viewMode === "private") {
      void fetchPrivateRoom();
    }
  }, 1000);

  return () => window.clearInterval(interval);
}, [viewMode]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

const timeLeft = useMemo(() => {
  if (!state) return 0;

  const roundEndsAtMs = new Date(state.roundEndsAt).getTime();
  return Math.max(0, Math.ceil((roundEndsAtMs - nowMs) / 1000));
}, [state?.roundEndsAt, nowMs]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const left = state?.queues.leftQueue ?? [];
  const right = state?.queues.rightQueue ?? [];
  const pairs = state?.activePairs ?? [];

const activeRoom = room?.participant ? room : lastStableRoom;
const inRoom = viewMode === "private";

  return (
    <div className="h-full w-full overflow-auto rounded-xl p-4">
      <div className="mb-4 flex justify-between">
        <div className="text-base font-semibold">
          {heading || "Speed Dating"}
        </div>
        <div className="text-xs">Round {(state?.round ?? 0) + 1}</div>
      </div>

      {inRoom ? (
        <div className="border rounded p-4 space-y-4">
          <div className="font-semibold">Private Room</div>

          <div className="grid grid-cols-2 gap-4">
            <Card p={activeRoom?.participant!} />
            {activeRoom?.partner ? <Card p={activeRoom.partner} /> : <Empty />}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              {activeRoom?.hasMatch ? "Matched" : "Waiting for match..."}
            </div>

            <div className="flex gap-2">
              {activeRoom?.hasMatch && (
                <button
                  onClick={handleSkip}
                  className="px-3 h-9 rounded border text-sm"
                >
                  Skip
                </button>
              )}

              <button
                onClick={handleExit}
                className="px-3 h-9 rounded bg-black text-white text-sm"
              >
                Exit
              </button>
            </div>
          </div>

            {activeRoom?.roomId && activeRoom?.hasMatch ? (
              <Chat roomId={activeRoom.roomId} participantId={browserKey} />
            ) : (
            <div className="text-sm text-neutral-400">
              Chat will appear when matched
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 border rounded p-3">
            <div className="font-semibold mb-2">Join</div>

            <input
              placeholder="Name"
              className="w-full border px-2 h-10 rounded mb-2"
              value={joinForm.name}
              onChange={(e) =>
                setJoinForm((s) => ({ ...s, name: e.target.value }))
              }
            />

            <input
              placeholder="Title"
              className="w-full border px-2 h-10 rounded mb-2"
              value={joinForm.title}
              onChange={(e) =>
                setJoinForm((s) => ({ ...s, title: e.target.value }))
              }
            />

            <textarea
              placeholder="Bio"
              className="w-full border px-2 py-2 rounded mb-2"
              value={joinForm.bio}
              onChange={(e) =>
                setJoinForm((s) => ({ ...s, bio: e.target.value }))
              }
            />

            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setJoinForm((s) => ({ ...s, iam: "man" }))}
                className={`flex-1 border rounded h-10 ${
                  joinForm.iam === "man" ? "bg-black text-white" : ""
                }`}
              >
                Man
              </button>
              <button
                type="button"
                onClick={() => setJoinForm((s) => ({ ...s, iam: "woman" }))}
                className={`flex-1 border rounded h-10 ${
                  joinForm.iam === "woman" ? "bg-black text-white" : ""
                }`}
              >
                Woman
              </button>
            </div>

            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setJoinForm((s) => ({ ...s, seeking: "men" }))}
                className={`flex-1 border rounded h-10 ${
                  joinForm.seeking === "men" ? "bg-black text-white" : ""
                }`}
              >
                Seeking Men
              </button>
              <button
                type="button"
                onClick={() => setJoinForm((s) => ({ ...s, seeking: "women" }))}
                className={`flex-1 border rounded h-10 ${
                  joinForm.seeking === "women" ? "bg-black text-white" : ""
                }`}
              >
                Seeking Women
              </button>
            </div>

            {joinError && <div className="text-red-500 text-sm mb-2">{joinError}</div>}

            <button
              type="button"
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-black text-white h-10 rounded"
            >
              {joining ? "Joining..." : "Join"}
            </button>
          </div>

          {showTimer && (
            <div className="mb-4 border p-3 rounded">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div>{leftLabel}</div>
              <div className="space-y-2 mt-2">
                {left.map((p) => (
                  <Card key={p.participantId} p={p} />
                ))}
              </div>
            </div>

            <div>
              <div>{rightLabel}</div>
              <div className="space-y-2 mt-2">
                {right.map((p) => (
                  <Card key={p.participantId} p={p} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {pairs.map((pair) => (
              <div key={pair.pairId} className="grid grid-cols-3 gap-2">
                {pair.leftParticipant ? <Card p={pair.leftParticipant} /> : <Empty />}
                <div className="flex items-center justify-center">↔</div>
                {pair.rightParticipant ? <Card p={pair.rightParticipant} /> : <Empty />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Card({ p }: { p: Participant }) {
  return (
    <div className="border rounded p-2">
      <div className="flex gap-2">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 border flex items-center justify-center text-xs">
            {getInitials(p.name)}
          </div>
        )}
        <div>
          <div className="text-sm font-semibold">{p.name}</div>
          <div className="text-xs text-neutral-500">{p.title}</div>
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return <div className="border-dashed border p-2 text-xs">Open</div>;
}

function Chat({
  roomId,
  participantId,
}: {
  roomId: string;
  participantId: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  async function fetchMessages() {
    const res = await fetch(
      `/api/speed-dating/room/messages?roomId=${encodeURIComponent(roomId)}`,
      { cache: "no-store" }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return;

    setMessages(data.data?.messages || []);
  }

  async function sendMessage() {
    if (!input.trim()) return;

    await fetch(`/api/speed-dating/room/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: typeof window !== "undefined" ? window.location.hostname : "default",
        roomId,
        browserKey: participantId,
        type: "text",
        text: input.trim(),
      }),
    });

    setInput("");
    await fetchMessages();
  }

  useEffect(() => {
    void fetchMessages();

    const interval = window.setInterval(() => {
      void fetchMessages();
    }, 1500);

    return () => window.clearInterval(interval);
  }, [roomId]);

  return (
    <div className="border rounded p-3">
      <div className="h-40 overflow-auto space-y-2 mb-2">
        {messages.map((m) => {
          const isMe = m.senderId === participantId;

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-1 rounded text-sm ${
                  isMe ? "bg-black text-white" : "bg-neutral-200"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-2 h-9 rounded"
          placeholder="Message..."
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-3 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}