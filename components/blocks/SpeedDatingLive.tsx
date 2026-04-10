// components\blocks\SpeedDatingLive.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
};

type Participant = {
  id: string;
  name: string;
  title: string;
  bio: string;
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700">
          {getInitials(participant.name)}
        </div>

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

export default function SpeedDatingLive({
  heading,
  roundDurationSeconds,
  showTimer,
  leftLabel = "Men",
  rightLabel = "Women",
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
  });
  const [joinAttempted, setJoinAttempted] = useState(false);
  const [apiState, setApiState] = useState<ApiState | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    setRound(0);
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (duration <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setRound((prev) => prev + 1);
          return duration;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progressPercent =
    duration > 0
      ? Math.max(0, Math.min(100, ((duration - timeLeft) / duration) * 100))
      : 0;

  const leftParticipants = apiState?.leftQueue ?? [];
  const rightParticipants = apiState?.rightQueue ?? [];
  const activePairs = apiState?.activePairs ?? [];

  const joinErrors = {
    name: joinAttempted && !joinForm.name.trim(),
    title: joinAttempted && !joinForm.title.trim(),
    bio: joinAttempted && !joinForm.bio.trim(),
    iam: joinAttempted && !joinForm.iam,
    seeking: joinAttempted && !joinForm.seeking,
  };

  const hasJoinErrors = Object.values(joinErrors).some(Boolean);

  async function fetchState() {
    try {
      const res = await fetch("/api/speed-dating", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) return;

      setApiState(data);
      setRound(typeof data.round === "number" ? data.round : 0);
      setTimeLeft(
        typeof data.timeLeftSeconds === "number"
          ? data.timeLeftSeconds
          : duration,
      );
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
      const res = await fetch("/api/speed-dating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          browserKey: getBrowserKey(),
          name: joinForm.name.trim(),
          title: joinForm.title.trim(),
          bio: joinForm.bio.trim(),
          iam: joinForm.iam,
          seeking: joinForm.seeking,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setJoinError(data?.error || "Could not join the queue.");
        return;
      }

      setApiState(data.state ?? null);
      setRound(typeof data.state?.round === "number" ? data.state.round : 0);
      setTimeLeft(
        typeof data.state?.timeLeftSeconds === "number"
          ? data.state.timeLeftSeconds
          : duration,
      );
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
              {loading ? "Joining..." : "Join Queue"}
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

<div className="mt-4">
  <SpeedDatingChat />
</div>
    </div>
  );
}