// components\blocks\SpeedDatingLive.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const SpeedDatingChat = dynamic(() => import("./SpeedDatingChat"), {
  ssr: false,
});

type Props = {
  heading?: string;
  roundDurationSeconds: number;
  showTimer: boolean;
  leftLabel?: string;
  rightLabel?: string;
roundStartSound?: "none" | "arrival" | "spark" | "commence" | "cloak" | "vanish";
};

type Participant = {
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
  leftParticipant: Participant | null;
  rightParticipant: Participant | null;
  status: "active" | "open";
};

type ApiState = {
  round: number;
  roundDurationSeconds: number;
  timeLeftSeconds: number;
  leftQueue: Participant[];
  rightQueue: Participant[];
  activePairs: Pair[];
};

type JoinFormState = {
  name: string;
  title: string;
  bio: string;
  iam: "man" | "woman" | "";
  seeking: "men" | "women" | "";
  image: File | null;
};

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

function getBrowserKey() {
  if (typeof window === "undefined") return "";

  let key = window.localStorage.getItem("kohost_speed_dating_key");

  if (!key) {
    key = `bk_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem("kohost_speed_dating_key", key);
  }

  return key;
}

function ParticipantCard({
  participant,
  tone = "default",
}: {
  participant: Participant;
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
            {getInitials(participant.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-neutral-900">
            {participant.name}
          </div>

          <div className="mt-0.5 truncate text-xs text-neutral-500">
            {participant.title}
          </div>

          <div className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
            {participant.bio}
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

function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;

  return <div className="mt-1 text-xs text-red-600">{message}</div>;
}

const ROUND_START_SOUND_MAP = {
  arrival: "/sounds/sfx_checkin.mp3",
  spark: "/sounds/sfx_chime.mp3",
  commence: "/sounds/sfx_gong.mp3",
  cloak: "/sounds/sfx_summon.mp3",
  vanish: "/sounds/sfx_vanish.mp3",
} as const;

export default function SpeedDatingLive({
  heading,
  roundDurationSeconds,
  showTimer,
  leftLabel = "Men",
  rightLabel = "Women",
  roundStartSound = "spark",
}: Props) {
  const duration = useMemo(
    () =>
      Math.max(
        30,
        Number.isFinite(roundDurationSeconds)
          ? Math.floor(roundDurationSeconds)
          : 120,
      ),
    [roundDurationSeconds],
  );

  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
const [joinForm, setJoinForm] = useState<JoinFormState>({
  name: "",
  title: "",
  bio: "",
  iam: "",
  seeking: "",
  image: null,
});
  const [joinAttempted, setJoinAttempted] = useState(false);
  const [apiState, setApiState] = useState<ApiState | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [serverTimeLeft, setServerTimeLeft] = useState(duration);
const [activeChatPair, setActiveChatPair] = useState<Pair | null>(null);
const lastRoundSeenRef = useRef<number | null>(null);

  const lastPlayedRoundRef = useRef(0);
  useEffect(() => {
  const interval = window.setInterval(() => {
    setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
  }, 1000);

  return () => window.clearInterval(interval);
}, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progressPercent =
    duration > 0
      ? Math.max(0, Math.min(100, ((duration - timeLeft) / duration) * 100))
      : 0;

  const leftParticipants = apiState?.leftQueue ?? [];
  const rightParticipants = apiState?.rightQueue ?? [];
  const activePairs = apiState?.activePairs ?? [];

  const browserKey = getBrowserKey();


const myPair = activePairs.find((pair) => {
  return (
    pair.leftParticipant?.id === browserKey ||
    pair.rightParticipant?.id === browserKey
  );
}) ?? null;

useEffect(() => {
  const currentRound = apiState?.round ?? null;
  if (currentRound == null) return;

setActiveChatPair((prev) => {
  if (!myPair) return null;

  if (!prev) return myPair;

  if (prev.id === myPair.id) return prev;

  return myPair;
});
}, [myPair, apiState?.round]);

const matchedPair = activeChatPair;

const isInRotation =
  leftParticipants.some((participant) => participant.id === browserKey) ||
  rightParticipants.some((participant) => participant.id === browserKey) ||
  !!myPair;

const joinErrors = {
  name: joinAttempted && !joinForm.name.trim(),
  title: joinAttempted && !joinForm.title.trim(),
  bio: joinAttempted && !joinForm.bio.trim(),
  iam: joinAttempted && !joinForm.iam,
  seeking: joinAttempted && !joinForm.seeking,
};


async function fetchState() {
  try {
    const sessionId = window.location.hostname;

    const res = await fetch(`/api/speed-dating?sessionId=${sessionId}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) return;

setApiState((prev) => {
  if (!prev) return data;

  return {
    ...prev,
    ...data,
    activePairs:
      data.activePairs && data.activePairs.length > 0
        ? data.activePairs
        : prev.activePairs,
  };
});

    if (typeof data.round === "number") {
      setRound(data.round);
    }

if (typeof data.timeLeftSeconds === "number") {
  setServerTimeLeft(data.timeLeftSeconds);

if (data.round !== round) {
  setTimeLeft(data.timeLeftSeconds);
}
}
  } catch (error) {
    console.error("Speed dating state fetch failed:", error);
  }
}
useEffect(() => {
  void fetchState();

  const interval = window.setInterval(() => {
    void fetchState();
  }, 2000);

  return () => window.clearInterval(interval);
}, [duration]);

useEffect(() => {
  const currentRound = apiState?.round ?? 0;

  if (roundStartSound === "none") {
    lastPlayedRoundRef.current = currentRound;
    return;
  }

  if (currentRound <= 0) {
    lastPlayedRoundRef.current = currentRound;
    return;
  }

  if (lastPlayedRoundRef.current === 0) {
    lastPlayedRoundRef.current = currentRound;
    return;
  }

if (
  currentRound > lastPlayedRoundRef.current &&
  currentRound === round
) {
    const soundSrc = ROUND_START_SOUND_MAP[roundStartSound];
    if (!soundSrc) return;

    const audio = new Audio(soundSrc);
    audio.currentTime = 0;
    void audio.play().catch(() => {});
    lastPlayedRoundRef.current = currentRound;
  }
}, [apiState?.round, roundStartSound]);

async function handleSkip() {
  if (!matchedPair) return;

  try {
    const sessionId = window.location.hostname;

const skippedPartnerId =
  matchedPair.leftParticipant?.id === browserKey
    ? matchedPair.rightParticipant?.id
    : matchedPair.leftParticipant?.id;

    const res = await fetch(`/api/speed-dating?sessionId=${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "skip",
        browserKey,
        skippedPartnerId,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) return;

    const nextState = data.state ?? null;

    setApiState((prev) => nextState ?? prev);

    if (typeof nextState?.round === "number") {
      setRound(nextState.round);
    }

if (typeof nextState?.timeLeftSeconds === "number") {
  setServerTimeLeft(nextState.timeLeftSeconds);
  setTimeLeft(nextState.timeLeftSeconds);
}
  } catch (error) {
    console.error("Skip failed", error);
  }
}

async function handleExit() {
  if (!isInRotation) return;

  try {
    const sessionId = window.location.hostname;

    const res = await fetch(`/api/speed-dating?sessionId=${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "leave",
        browserKey,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) return;

    const nextState = data.state ?? null;

    setApiState((prev) => nextState ?? prev);

    if (typeof nextState?.round === "number") {
      setRound(nextState.round);
    }

if (typeof nextState?.timeLeftSeconds === "number") {
  setServerTimeLeft(nextState.timeLeftSeconds);
  setTimeLeft(nextState.timeLeftSeconds);
}
  } catch (error) {
    console.error("Exit failed", error);
  }
}

  function updateJoinForm<K extends keyof JoinFormState>(
    key: K,
    value: JoinFormState[K],
  ) {
    setJoinForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (joinError) {
      setJoinError("");
    }
  }

  async function handleJoinPreview() {
    const nextJoinAttempted = true;
    setJoinAttempted(nextJoinAttempted);
    setJoinError("");

    const nextHasErrors =
      !joinForm.name.trim() ||
      !joinForm.title.trim() ||
      !joinForm.bio.trim() ||
      !joinForm.iam ||
      !joinForm.seeking;

    if (nextHasErrors) return;

    setLoading(true);

    try {
const formData = new FormData();

formData.append("browserKey", browserKey);
formData.append("name", joinForm.name.trim());
formData.append("title", joinForm.title.trim());
formData.append("bio", joinForm.bio.trim());
formData.append("iam", joinForm.iam);
formData.append("seeking", joinForm.seeking);

if (joinForm.image) {
  formData.append("image", joinForm.image);
}

const sessionId = window.location.hostname;

const res = await fetch(`/api/speed-dating?sessionId=${sessionId}`, {
  method: "POST",
  body: formData,
});

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setJoinError(data?.error || "Could not join the queue.");
        return;
      }

const nextState = data.state ?? null;

setApiState((prev) => nextState ?? prev);

if (typeof nextState?.round === "number") {
  setRound(nextState.round);
}

if (typeof nextState?.timeLeftSeconds === "number") {
  setServerTimeLeft(nextState.timeLeftSeconds);
  setTimeLeft(nextState.timeLeftSeconds);
}
    } catch (error) {
      console.error("Speed dating join failed:", error);
      setJoinError("Could not join the queue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full overflow-auto rounded-xl p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-neutral-900">
            {heading || "Speed Dating"}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Live matchmaking board
          </div>
        </div>

        <div className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600">
          Round {round + 1}
        </div>
      </div>

      {showTimer ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Time Remaining
          </div>

          <div className="mt-1 text-3xl font-semibold text-neutral-900">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1.4fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-neutral-900">
            Join Event
          </div>

          <div className="space-y-3">
            <div>
              <input
                value={joinForm.name}
                onChange={(e) => updateJoinForm("name", e.target.value)}
                placeholder="Name"
                className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none"
              />
              <FieldError show={joinErrors.name} message="Name is required." />
            </div>

            <div>
              <input
                value={joinForm.title}
                onChange={(e) => updateJoinForm("title", e.target.value)}
                placeholder="Title"
                className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none"
              />
              <FieldError
                show={joinErrors.title}
                message="Title is required."
              />
            </div>

            <div>
              <textarea
                value={joinForm.bio}
                onChange={(e) => updateJoinForm("bio", e.target.value)}
                placeholder="Bio"
                className="w-full rounded-xl border border-neutral-300 px-3 py-3 text-sm outline-none"
                rows={4}
              />
              <FieldError show={joinErrors.bio} message="Bio is required." />
            </div>

<div>
  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
    Profile Image (optional)
  </div>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => updateJoinForm("image", e.target.files?.[0] || null)}
    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm outline-none"
  />
</div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                I am
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                  <input
                    type="radio"
                    name="speed-dating-iam"
                    checked={joinForm.iam === "man"}
                    onChange={() => updateJoinForm("iam", "man")}
                  />
                  Man
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                  <input
                    type="radio"
                    name="speed-dating-iam"
                    checked={joinForm.iam === "woman"}
                    onChange={() => updateJoinForm("iam", "woman")}
                  />
                  Woman
                </label>
              </div>

              <FieldError show={joinErrors.iam} message='Select "I am".' />
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Seeking
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                  <input
                    type="radio"
                    name="speed-dating-seeking"
                    checked={joinForm.seeking === "men"}
                    onChange={() => updateJoinForm("seeking", "men")}
                  />
                  Men
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                  <input
                    type="radio"
                    name="speed-dating-seeking"
                    checked={joinForm.seeking === "women"}
                    onChange={() => updateJoinForm("seeking", "women")}
                  />
                  Women
                </label>
              </div>

              <FieldError
                show={joinErrors.seeking}
                message='Select "Seeking".'
              />
            </div>

            {joinError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                {joinError}
              </div>
            ) : null}

            <button
              type="button"
              disabled={loading}
              onClick={() => void handleJoinPreview()}
              className="h-11 w-full rounded-xl bg-neutral-900 text-white disabled:opacity-60"
            >
              {loading ? "Joining..." : "Join Rotation"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="font-semibold text-neutral-900">{leftLabel}</div>

              <div className="mt-3 space-y-2">
                {leftParticipants.length ? (
                  leftParticipants.map((participant) => (
                    <ParticipantCard
                      key={participant.id}
                      participant={participant}
                      tone={participant.waiting ? "waiting" : "active"}
                    />
                  ))
                ) : (
                  <EmptySlot label={`No ${leftLabel.toLowerCase()} yet`} />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="font-semibold text-neutral-900">{rightLabel}</div>

              <div className="mt-3 space-y-2">
                {rightParticipants.length ? (
                  rightParticipants.map((participant) => (
                    <ParticipantCard
                      key={participant.id}
                      participant={participant}
                      tone={participant.waiting ? "waiting" : "active"}
                    />
                  ))
                ) : (
                  <EmptySlot label={`No ${rightLabel.toLowerCase()} yet`} />
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 font-semibold text-neutral-900">
              Active Pairs
            </div>

            {activePairs.length ? (
              activePairs.map((pair) => (
                <div key={pair.id} className="mb-2 grid grid-cols-3 gap-2">
                  {pair.leftParticipant ? (
                    <ParticipantCard participant={pair.leftParticipant} />
                  ) : (
                    <EmptySlot label="Open slot" />
                  )}

                  <div className="flex items-center justify-center text-neutral-500">
                    ↔
                  </div>

                  {pair.rightParticipant ? (
                    <ParticipantCard participant={pair.rightParticipant} />
                  ) : (
                    <EmptySlot label="Open slot" />
                  )}
                </div>
              ))
            ) : (
              <EmptySlot label="No active pairs yet" />
            )}
          </div>
        </div>
      </div>

<div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
  <div className="mb-3 flex items-center justify-between gap-3">
    <div>
      <div className="text-sm font-semibold text-neutral-900">
        Private Date Room
      </div>
<div className="mt-1 text-xs text-neutral-500">
{activeChatPair
  ? "You are matched for this round."
  : isInRotation
    ? "You are in the rotation and waiting for a match."
    : "Join the rotation to enter the queue and wait for a match."}
</div>
    </div>

    <div className="flex items-center gap-2">

<button
  type="button"
  disabled={!matchedPair}
  onClick={() => void handleSkip()}
  className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  Skip
</button>

<button
  type="button"
  disabled={!isInRotation}
  onClick={() => void handleExit()}
  className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  Exit
</button>
    </div>
  </div>

  <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        You
      </div>

{leftParticipants.find((participant) => participant.id === browserKey) ? (
  <ParticipantCard
    participant={leftParticipants.find((participant) => participant.id === browserKey)!}
    tone="active"
  />
) : rightParticipants.find((participant) => participant.id === browserKey) ? (
  <ParticipantCard
    participant={rightParticipants.find((participant) => participant.id === browserKey)!}
    tone="active"
  />
) : myPair?.leftParticipant?.id === browserKey ? (
  <ParticipantCard participant={myPair.leftParticipant} tone="active" />
) : myPair?.rightParticipant?.id === browserKey ? (
  <ParticipantCard participant={myPair.rightParticipant} tone="active" />
) : (
  <EmptySlot label="Join the rotation to appear here" />
)}
    </div>

    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Current Match
      </div>

{matchedPair?.leftParticipant?.id === browserKey && matchedPair?.rightParticipant ? (
  <ParticipantCard participant={matchedPair.rightParticipant} tone="active" />
) : matchedPair?.rightParticipant?.id === browserKey && matchedPair?.leftParticipant ? (
  <ParticipantCard participant={matchedPair.leftParticipant} tone="active" />
) : (
  <EmptySlot label="No match for this round" />
)}
    </div>
  </div>

{activeChatPair ? (
<SpeedDatingChat
  key={`${activeChatPair.id}`}
  sessionId={activeChatPair.id}
/>
) : (
  <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
    Your private message thread will appear here when you are matched.
  </div>
)}
</div>
    </div>
  );
}