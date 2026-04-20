"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Participant = {
  participantId?: string;
  id?: string;
  name: string;
  title: string;
  bio: string;
  imageUrl?: string | null;
  image_url?: string | null;
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
  phase: "active" | "transition";
  roundDurationSeconds: number;
  transitionDurationSeconds: number;
  roundStartedAt: string;
  roundEndsAt: string;
  phaseStartedAt: string;
  phaseEndsAt: string;
  serverNow: string;
  queues: {
    leftQueue: Participant[];
    rightQueue: Participant[];
  };
  activePairs: Pair[];
};

type PrivateRoomState = {
  roomId: string;
  pairId: string | null;
  sessionId: string;
  slug: string;
  round: number;
  phase: "active" | "transition";
  roundDurationSeconds: number;
  transitionDurationSeconds: number;
  roundStartedAt: string;
  roundEndsAt: string;
  phaseStartedAt: string;
  phaseEndsAt: string;
  serverNow: string;
  me: Participant | null;
  otherParticipant: Participant | null;
  upcomingQueue: Participant[];
  hasMatch: boolean;
};

type Props = {
  heading?: string;
  roundDurationSeconds: number;
  showTimer: boolean;
  leftLabel?: string;
  rightLabel?: string;
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
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [privateRoom, setPrivateRoom] = useState<PrivateRoomState | null>(null);
  const [joined, setJoined] = useState(false);

  const [joinForm, setJoinForm] = useState({
    name: "",
    title: "",
    bio: "",
    iam: "" as "" | "man" | "woman",
    seeking: "" as "" | "men" | "women",
  });

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());

  const sessionId =
    typeof window !== "undefined" ? window.location.hostname : "default";
  const browserKey =
    typeof window !== "undefined" ? getBrowserKey() : "";

  const hasBootedRef = useRef(false);

  async function fetchPublicState() {
    const res = await fetch(
      `/api/speed-dating/state?sessionId=${encodeURIComponent(sessionId)}`,
      { cache: "no-store" },
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return;
    setPublicState(data.data);
  }

  async function fetchPrivateRoom() {
    const res = await fetch(
      `/api/speed-dating/private-room?sessionId=${encodeURIComponent(
        sessionId,
      )}&browserKey=${encodeURIComponent(browserKey)}`,
      { cache: "no-store" },
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return;
    setPrivateRoom(data.data);
    setJoined(true);
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

      setJoined(true);
      await fetchPublicState();
      await fetchPrivateRoom();
    } finally {
      setJoining(false);
    }
  }

  async function handleExit() {
    await fetch("/api/speed-dating/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        browserKey,
      }),
    });

    setJoined(false);
    setPrivateRoom(null);
    await fetchPublicState();
  }

  async function handleSkip() {
    await fetch("/api/speed-dating/skip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        browserKey,
      }),
    });

    await fetchPublicState();
    await fetchPrivateRoom();
  }

  useEffect(() => {
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;

    void fetchPublicState();
    void fetchPrivateRoom();

    const stateInterval = window.setInterval(() => {
      void fetchPublicState();
      if (joined) {
        void fetchPrivateRoom();
      }
    }, 1000);

    const clockInterval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => {
      window.clearInterval(stateInterval);
      window.clearInterval(clockInterval);
    };
  }, [joined]);

  const timerSource = joined && privateRoom ? privateRoom : publicState;

  const timeLeft = useMemo(() => {
    if (!timerSource) return 0;

    const phaseEndsAtMs = new Date(timerSource.phaseEndsAt).getTime();
    return Math.max(0, Math.ceil((phaseEndsAtMs - nowMs) / 1000));
  }, [timerSource?.phaseEndsAt, nowMs]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (joined && privateRoom?.me) {
    return (
      <div className="h-full w-full overflow-auto rounded-xl p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold">
              {heading || "Speed Dating"}
            </div>
            <div className="text-xs text-neutral-500">
              Round {privateRoom.round + 1}
            </div>
          </div>

          {showTimer ? (
            <div className="rounded-xl border px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                {privateRoom.phase === "transition"
                  ? "Next Round Starts In"
                  : "Time Remaining"}
              </div>
              <div className="text-3xl font-semibold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1fr]">
          <Panel title="Your Profile">
            <Card p={privateRoom.me} />
          </Panel>

          <Panel title="Current Match">
            {privateRoom.otherParticipant ? (
              <Card p={privateRoom.otherParticipant} />
            ) : (
              <Empty label="Waiting for match" />
            )}
          </Panel>

          <Panel title="Upcoming Queue">
            <div className="space-y-2">
              {privateRoom.upcomingQueue.length ? (
                privateRoom.upcomingQueue.map((p) => (
                  <Card key={p.id || p.participantId || p.name} p={p} />
                ))
              ) : (
                <Empty label="No upcoming matches yet" />
              )}
            </div>
          </Panel>
        </div>

        <div className="mt-4 flex gap-2">
          {privateRoom.hasMatch && privateRoom.phase === "active" ? (
            <button
              type="button"
              onClick={() => void handleSkip()}
              className="h-10 rounded-xl border px-4 text-sm"
            >
              Skip
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => void handleExit()}
            className="h-10 rounded-xl bg-black px-4 text-sm text-white"
          >
            Exit
          </button>
        </div>

        <div className="mt-4">
          {privateRoom.phase === "active" &&
          privateRoom.hasMatch &&
          privateRoom.roomId ? (
            <Chat roomId={privateRoom.roomId} participantId={browserKey} />
          ) : (
            <Panel title="Chat">
              <div className="text-sm text-neutral-500">
                {privateRoom.phase === "transition"
                  ? "Chat closed for round transition."
                  : "Waiting for a compatible match."}
              </div>
            </Panel>
          )}
        </div>
      </div>
    );
  }

  const left = publicState?.queues.leftQueue ?? [];
  const right = publicState?.queues.rightQueue ?? [];
  const pairs = publicState?.activePairs ?? [];

  return (
    <div className="h-full w-full overflow-auto rounded-xl p-4">
      <div className="mb-4 flex justify-between">
        <div className="text-base font-semibold">
          {heading || "Speed Dating"}
        </div>
        <div className="text-xs">
          Round {(publicState?.round ?? 0) + 1}
        </div>
      </div>

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

        {joinError ? (
          <div className="mb-2 text-sm text-red-500">{joinError}</div>
        ) : null}

        <button
          type="button"
          onClick={() => void handleJoin()}
          disabled={joining}
          className="w-full bg-black text-white h-10 rounded"
        >
          {joining ? "Joining..." : "Join"}
        </button>
      </div>

      {showTimer ? (
        <div className="mb-4 rounded-xl border px-4 py-3">
          <div className="text-xs uppercase tracking-[0.14em] text-neutral-500">
            {publicState?.phase === "transition"
              ? "Next Round Starts In"
              : "Time Remaining"}
          </div>
          <div className="text-3xl font-semibold">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <Panel title={leftLabel}>
          <div className="space-y-2">
            {left.length ? (
              left.map((p) => (
                <Card key={p.id || p.participantId || p.name} p={p} />
              ))
            ) : (
              <Empty label={`No ${leftLabel.toLowerCase()} yet`} />
            )}
          </div>
        </Panel>

        <Panel title={rightLabel}>
          <div className="space-y-2">
            {right.length ? (
              right.map((p) => (
                <Card key={p.id || p.participantId || p.name} p={p} />
              ))
            ) : (
              <Empty label={`No ${rightLabel.toLowerCase()} yet`} />
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Active Pairs">
          <div className="space-y-2">
            {pairs.length ? (
              pairs.map((pair) => (
                <div key={pair.pairId} className="grid grid-cols-3 gap-2">
                  {pair.leftParticipant ? (
                    <Card p={pair.leftParticipant} />
                  ) : (
                    <Empty label="Open slot" />
                  )}

                  <div className="flex items-center justify-center">↔</div>

                  {pair.rightParticipant ? (
                    <Card p={pair.rightParticipant} />
                  ) : (
                    <Empty label="Open slot" />
                  )}
                </div>
              ))
            ) : (
              <Empty label="No active pairs yet" />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-neutral-900">{title}</div>
      {children}
    </div>
  );
}

function Card({ p }: { p: Participant }) {
  const image = p.imageUrl || p.image_url || null;

  return (
    <div className="border rounded p-2">
      <div className="flex gap-2">
        {image ? (
          <img
            src={image}
            alt={p.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 border flex items-center justify-center text-xs">
            {getInitials(p.name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold">{p.name}</div>
          <div className="text-xs text-neutral-500">{p.title}</div>
          <div className="text-xs text-neutral-500 line-clamp-2">{p.bio}</div>
        </div>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="border-dashed border p-2 text-xs text-neutral-400">
      {label}
    </div>
  );
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
      { cache: "no-store" },
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
        sessionId:
          typeof window !== "undefined" ? window.location.hostname : "default",
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-neutral-900">Chat</div>

      <div className="mb-3 h-48 overflow-auto space-y-2">
        {messages.length ? (
          messages.map((m) => {
            const isMe = m.senderId === participantId;

            return (
              <div
                key={m.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                    isMe ? "bg-black text-white" : "bg-neutral-100"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-neutral-500">No messages yet.</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-2 h-10 rounded"
          placeholder="Message..."
        />
        <button
          type="button"
          onClick={() => void sendMessage()}
          className="bg-black text-white px-3 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}