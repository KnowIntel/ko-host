"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ParticipantCardData = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  image_url?: string | null;
  side?: "left" | "right";
  waiting?: boolean;
};

type RoomState = {
  ok: boolean;
  participant: ParticipantCardData | null;
  room: {
    id: string;
    roomId: string;
    round: number;
    status: "active" | "open";
  } | null;
  partner: ParticipantCardData | null;
  round: number;
  phase: "active" | "transition";
  phaseStartedAt?: number;
  phaseEndsAt?: number;
  timeLeftSeconds: number;
  oppositeLineup: ParticipantCardData[];
  waiting: boolean;
};

type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  text?: string;
  createdAt: number;
};

type Props = {
  slug: string;
};

function getBrowserKey() {
  if (typeof window === "undefined") return "";

  let key = window.localStorage.getItem("kohost_speed_dating_key");
  if (!key) {
    key = `bk_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem("kohost_speed_dating_key", key);
  }
  return key;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function ParticipantCard({
  participant,
  tone = "default",
}: {
  participant: ParticipantCardData;
  tone?: "default" | "active" | "waiting";
}) {
  const toneClass =
    tone === "active"
      ? "border-blue-200 bg-blue-50"
      : tone === "waiting"
        ? "border-amber-200 bg-amber-50"
        : "border-neutral-200 bg-white";

  return (
    <div className={`rounded-2xl border p-3 shadow-sm ${toneClass}`}>
      <div className="flex items-start gap-3">
        {participant.image_url ? (
          <img
            src={participant.image_url}
            alt={participant.name || "Participant"}
            className="h-11 w-11 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700">
            {getInitials(participant.name || "?")}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-neutral-900">
            {participant.name}
          </div>

          <div className="mt-0.5 truncate text-xs text-neutral-500">
            {participant.title || ""}
          </div>

          <div className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
            {participant.bio || ""}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-500">
      {label}
    </div>
  );
}

export default function SpeedDatingPrivateRoom({ slug }: Props) {
const [state, setState] = useState<RoomState | null>(null);
const [profile, setProfile] = useState<ParticipantCardData | null>(null);
const [stableRoomId, setStableRoomId] = useState<string | null>(null);
const [stablePartner, setStablePartner] = useState<ParticipantCardData | null>(null);
const activeRoundRef = useRef<number | null>(null);
  const [phaseEndsAt, setPhaseEndsAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const lastRoomIdRef = useRef<string | null>(null);

  const browserKey = useMemo(() => getBrowserKey(), []);
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return slug;
    return window.location.hostname;
  }, [slug]);

  async function fetchPrivateRoom() {
    const res = await fetch(
      `/api/speed-dating/private-room?sessionId=${encodeURIComponent(sessionId)}&browserKey=${encodeURIComponent(browserKey)}`,
      { cache: "no-store" },
    );

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return;

    const nextState = data as RoomState;
    setState(nextState);

if (nextState.participant) {
  setProfile(nextState.participant);
}

if (typeof nextState.phaseEndsAt === "number") {
  setPhaseEndsAt(nextState.phaseEndsAt);
}

if (nextState.phase === "transition") {
  activeRoundRef.current = nextState.round;
  return;
}

const incomingRoomId = nextState.room?.roomId || null;
const roundChanged =
  activeRoundRef.current === null || activeRoundRef.current !== nextState.round;

if (roundChanged) {
  activeRoundRef.current = nextState.round;
  setStableRoomId(incomingRoomId);
  setStablePartner(nextState.partner || null);
  return;
}

if (incomingRoomId) {
  setStableRoomId((prev) => (prev === incomingRoomId ? prev : incomingRoomId));
  setStablePartner(nextState.partner || null);
}

  async function fetchMessages(roomId: string) {
    if (!roomId) return;

    const res = await fetch(
      `/api/speed-dating/room/messages?roomId=${encodeURIComponent(roomId)}`,
      { cache: "no-store" },
    );

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return;

    const next = Array.isArray(data.messages) ? data.messages : [];

    setMessages((prev) => {
      if (!prev.length) return next;

      const byId = new Map<string, ChatMessage>();

      for (const msg of prev) {
        byId.set(msg.id, msg);
      }

      for (const msg of next) {
        byId.set(msg.id, msg);
      }

      return Array.from(byId.values()).sort((a, b) => a.createdAt - b.createdAt);
    });
  }

  async function sendMessage() {
const roomId = stableRoomId || state?.room?.roomId || "";
    const senderId = profile?.id || "";
    const text = input.trim();

    if (sending) return;
    if (!roomId || !senderId || !text) return;

    setSending(true);

    try {
      const res = await fetch(`/api/speed-dating/room/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          senderId,
          text,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        console.error("SEND FAILED:", data);
        return;
      }

      setInput("");

      if (data.message) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === data.message.id);
          if (exists) return prev;
          return [...prev, data.message].sort((a, b) => a.createdAt - b.createdAt);
        });
      }

      await fetchMessages(roomId);
    } finally {
      setSending(false);
    }
  }

  async function handleExit() {
    try {
      const res = await fetch(
        `/api/speed-dating?sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "leave",
            browserKey,
          }),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        if (typeof window !== "undefined") {
          window.location.href = `/s/${encodeURIComponent(slug)}`;
        }
        return;
      }

      if (typeof window !== "undefined") {
        window.location.href = `/s/${encodeURIComponent(slug)}`;
      }
    } catch (error) {
      console.error("Exit failed", error);
      if (typeof window !== "undefined") {
        window.location.href = `/s/${encodeURIComponent(slug)}`;
      }
    }
  }

  useEffect(() => {
    void fetchPrivateRoom();

    const interval = window.setInterval(() => {
      void fetchPrivateRoom();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [browserKey, sessionId]);

  useEffect(() => {
    if (!phaseEndsAt) return;

    const tick = () => {
      const next = Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
      setTimeLeft(next);
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [phaseEndsAt]);

useEffect(() => {
  const nextRoomId = stableRoomId || state?.room?.roomId || null;

  if (lastRoomIdRef.current !== nextRoomId) {
    setMessages([]);
    lastRoomIdRef.current = nextRoomId;
  }
}, [stableRoomId, state?.room?.roomId]);

useEffect(() => {
  const roomId = stableRoomId || state?.room?.roomId || "";
  if (!roomId) return;

  void fetchMessages(roomId);

  const interval = window.setInterval(() => {
    void fetchMessages(roomId);
  }, 1500);

  return () => window.clearInterval(interval);
}, [stableRoomId, state?.room?.roomId]);

  const isTransition = state?.phase === "transition";
  const participant = profile;
const partner = stablePartner || state?.partner || null;
const oppositeLineup = state?.oppositeLineup || [];
const participantId = participant?.id || "";
const roomId = stableRoomId || state?.room?.roomId || "";

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-neutral-900">
            Private Dating Room
          </div>
          <div className="mt-1 text-sm text-neutral-600">
            {isTransition
              ? "Transition period between rounds"
              : "Private participant room"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleExit()}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700"
        >
          Exit
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-3 text-sm font-semibold text-neutral-900">
              Your Profile
            </div>

            {participant ? (
              <ParticipantCard participant={participant} tone="active" />
            ) : (
              <EmptySlot label="No active participant session found" />
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-neutral-900">
              Current Match
            </div>

            {partner ? (
              <ParticipantCard participant={partner} tone="active" />
            ) : isTransition ? (
              <EmptySlot label="Transitioning to next round" />
            ) : (
              <EmptySlot label="Waiting for a match" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-neutral-900">
              Private Chat
            </div>

            {roomId && participantId && !isTransition ? (
              <>
                <div className="mb-3 h-56 overflow-auto space-y-2">
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
                              isMe
                                ? "bg-neutral-900 text-white"
                                : "bg-neutral-100 text-neutral-900"
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-neutral-500">
                      No messages yet.
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="h-10 flex-1 rounded-xl border border-neutral-300 px-3 text-sm outline-none"
                  />

                  <button
                    type="button"
                    disabled={sending || !input.trim() || !participantId || !roomId}
                    onClick={() => void sendMessage()}
                    className="rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
                {isTransition
                  ? "Chat is paused during the transition period."
                  : "Waiting for an active private room."}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {isTransition ? "Next Round Starts In" : "Time Remaining"}
            </div>

            <div className="mt-1 text-3xl font-semibold text-neutral-900">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>

            <div className="mt-2 text-sm text-neutral-500">
              Round {(state?.round ?? 0) + 1}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-neutral-900">
              Opposite-side Lineup
            </div>

            <div className="space-y-2">
              {oppositeLineup.length ? (
                oppositeLineup.map((item) => (
                  <ParticipantCard
                    key={item.id}
                    participant={item}
                    tone={item.waiting ? "waiting" : "default"}
                  />
                ))
              ) : (
                <EmptySlot label="No opposite-side participants yet" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}