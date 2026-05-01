"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";

type MatchResultMode =
  | "public"
  | "private"
  | "contact_form"
  | "private_chat_later";

type Theme = "red_balloons" | "hearts" | "party" | "formal" | "custom";
type PlayerStatus = "active" | "popped" | "kept" | "selected";
type RoundStatus = "waiting" | "live" | "ended";

type Player = {
  id: string;
  name: string;
  intro: string;
  age?: string;
  lookingFor?: string;
  funFact?: string;
  status: PlayerStatus;
  popReason?: string;
};

type Props = {
  micrositeId?: string | null;
  blockId?: string;
  title?: string;
  hostName?: string;
  lineupSlots?: number;
  requirePopReason?: boolean;
  audienceVotingEnabled?: boolean;
  anonymousViewingEnabled?: boolean;
  matchResultMode?: MatchResultMode;
  theme?: Theme;
  prompt?: string;
  isHost?: boolean;
};

const POP_REASONS = [
  "Not my type",
  "Different values",
  "No chemistry",
  "Age/lifestyle mismatch",
  "Their answer changed my mind",
  "Other",
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function PopBalloonLive({
  micrositeId = null,
  blockId,
  title = "Pop the Balloon",
  hostName = "Host",
  lineupSlots = 6,
  requirePopReason = true,
  audienceVotingEnabled = false,
  anonymousViewingEnabled = true,
  matchResultMode = "public",
  theme = "red_balloons",
prompt = "Introduce yourself and decide who keeps their balloon.",
isHost = false,
}: Props) {
  const safeSlots = Math.max(2, Math.min(12, Math.floor(lineupSlots || 6)));

  const starterPlayers = useMemo<Player[]>(
    () =>
      Array.from({ length: safeSlots }).map((_, index) => ({
        id: `player-${index + 1}`,
        name: `Player ${index + 1}`,
        intro: index === 0 ? "Ready to meet someone fun." : "Waiting for intro.",
        age: "",
        lookingFor: "",
        funFact: "",
        status: "active",
      })),
    [safeSlots],
  );

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>("waiting");
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const canUseLocalMode = !micrositeId;
  const gameReady = Boolean(gameId) || canUseLocalMode;
  const [mounted, setMounted] = useState(false);

  const [joinName, setJoinName] = useState("");
  const [joinAge, setJoinAge] = useState("");
  const [joinIntro, setJoinIntro] = useState("");
  const [joinLookingFor, setJoinLookingFor] = useState("");
  const [joinFunFact, setJoinFunFact] = useState("");
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinConsent, setJoinConsent] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const [popTargetId, setPopTargetId] = useState<string | null>(null);
  const [popReasonDraft, setPopReasonDraft] = useState(POP_REASONS[0]);

  const activePlayers = players.filter((player) => player.status !== "popped");
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId);
  const popTarget = players.find((player) => player.id === popTargetId);
  const activeLineupCount = players.filter(
  (p) => p.status === "active"
).length;

const lineupFull = activeLineupCount >= safeSlots;

  const themeLabel =
    theme === "hearts"
      ? "Hearts"
      : theme === "party"
        ? "Party"
        : theme === "formal"
          ? "Formal"
          : theme === "custom"
            ? "Custom"
            : "Red Balloons";

useEffect(() => {
  async function loadGame() {
    if (!micrositeId || !blockId) return;

    try {
      const res = await fetch("/api/public/pop-balloon/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          micrositeId,
          blockId,
          title,
          hostName,
        }),
      });

      const data = await res.json();

      if (data?.ok && data.game) {
        setGameId(data.game.id ?? null);
        setCurrentRoundId(data.game.current_round_id ?? null);
      }
    } catch {}
  }

  void loadGame();
}, [micrositeId, blockId, title, hostName]);

async function loadStateFromGameId(nextGameId: string) {
  try {
    const res = await fetch("/api/public/pop-balloon/state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId: nextGameId }),
    });

    const data = await res.json();

    if (data?.ok) {
      if (data.game) {
        setRoundStatus(
          data.game.status === "live" ||
            data.game.status === "ended" ||
            data.game.status === "waiting"
            ? data.game.status
            : "waiting",
        );

        setCurrentRoundId(data.game.current_round_id ?? null);
      }

      if (Array.isArray(data.participants)) {
        setPlayers(
          data.participants.map((participant: any) => ({
            id: participant.id,
            name: participant.name ?? "Participant",
            age: participant.age ?? "",
            intro: participant.intro ?? "",
            lookingFor: participant.looking_for ?? "",
            funFact: participant.fun_fact ?? "",
            status:
              participant.status === "popped" ||
              participant.status === "kept" ||
              participant.status === "selected" ||
              participant.status === "active"
                ? participant.status
                : "active",
          })),
        );
      }
    }
  } catch {}
}

useEffect(() => {
  if (!gameId) return;

  void loadStateFromGameId(gameId);
}, [gameId]);

useEffect(() => {
  if (!gameId) return;

  const channel = supabase
    .channel(`pop-balloon-${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pop_balloon_participants",
        filter: `game_id=eq.${gameId}`,
      },
      () => {
        void loadStateFromGameId(gameId);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pop_balloon_games",
        filter: `id=eq.${gameId}`,
      },
      () => {
        void loadStateFromGameId(gameId);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}, [gameId]);

async function joinLineup() {

  const trimmedName = joinName.trim();
  const trimmedIntro = joinIntro.trim();

  if (!trimmedName) return;
  if (!gameId) {
  setPlayers((current) => [
    ...current,
    {
      id: `local-player-${Date.now()}`,
      name: trimmedName,
      age: joinAge.trim(),
      intro: trimmedIntro || "Ready to play.",
      lookingFor: joinLookingFor.trim(),
      funFact: joinFunFact.trim(),
      status: "active",
    },
  ]);

  setJoinName("");
  setJoinAge("");
  setJoinIntro("");
  setJoinLookingFor("");
  setJoinFunFact("");
  return;
}

  try {
    const res = await fetch("/api/public/pop-balloon/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        name: trimmedName,
        age: joinAge.trim(),
        intro: trimmedIntro,
        lookingFor: joinLookingFor.trim(),
        funFact: joinFunFact.trim(),
      }),
    });

    const data = await res.json();

    if (data?.ok && data.participant) {
      setPlayers((current) => [
        ...current,
        {
          id: data.participant.id,
          name: data.participant.name,
          age: data.participant.age ?? "",
          intro: data.participant.intro ?? "",
          lookingFor: data.participant.looking_for ?? "",
          funFact: data.participant.fun_fact ?? "",
          status: "active",
        },
      ]);
    }
  } catch {}

  setJoinName("");
  setJoinAge("");
  setJoinIntro("");
  setJoinLookingFor("");
  setJoinFunFact("");
}

async function popBalloon(playerId: string, reason: string) {
  if (!gameId || !currentRoundId) return;

  setPlayers((current) =>
    current.map((p) =>
      p.id === playerId
        ? { ...p, status: "popped", popReason: reason }
        : p,
    ),
  );

  try {
    await fetch("/api/public/pop-balloon/pop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roundId: currentRoundId,
        participantId: playerId,
        popReason: reason,
      }),
    });
  } catch {}
}

function requestPop(playerId: string) {
  if (!requirePopReason) {
    void popBalloon(playerId, "Popped");
    return;
  }

  setPopTargetId(playerId);
  setPopReasonDraft(POP_REASONS[0]);
}

function confirmPop() {
  if (!popTargetId) return;

  void popBalloon(popTargetId, popReasonDraft.trim() || "Popped");
  setPopTargetId(null);
  setPopReasonDraft(POP_REASONS[0]);
}

function keepBalloon(playerId: string) {
  setPlayers((current) =>
    current.map((player) =>
      player.id === playerId ? { ...player, status: "kept" } : player,
    ),
  );
}

async function selectMatch(playerId: string) {
  if (!gameId || !currentRoundId) return;

  setSelectedPlayerId(playerId);
  setRoundStatus("ended");

  setPlayers((current) =>
    current.map((p) =>
      p.id === playerId ? { ...p, status: "selected" } : p,
    ),
  );

  try {
    await fetch("/api/public/pop-balloon/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId,
        roundId: currentRoundId,
        matchedParticipantId: playerId,
        visibility: matchResultMode,
      }),
    });
  } catch {}
}

function removePlayer(playerId: string) {
  setPlayers((current) => current.filter((player) => player.id !== playerId));

  if (selectedPlayerId === playerId) {
    setSelectedPlayerId(null);
  }

  if (popTargetId === playerId) {
    setPopTargetId(null);
  }
}

function resetRound() {
  setSelectedPlayerId(null);
  setPopTargetId(null);
  setPlayers((current) =>
    current.map((player) => ({
      ...player,
      status: "active",
      popReason: undefined,
    })),
  );
  setRoundStatus("waiting");
}

useEffect(() => {
  setMounted(true);
}, []);

return (
  <div className="relative h-full w-full overflow-auto rounded-3xl bg-white p-4 text-neutral-950">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
          {hostName}
        </div>
        <h3 className="mt-1 text-2xl font-bold">{title}</h3>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">{prompt}</p>
      </div>

      <div className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        {themeLabel}
      </div>
    </div>

<div className="mt-5 rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <div className="text-sm font-bold">Join Lineup</div>
      <div className="mt-1 text-xs text-neutral-500">
        {players.length}/{safeSlots} lineup spots filled
      </div>
    </div>

    <div className="flex items-center gap-2">
      {lineupFull ? (
        <div className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">
          Lineup full
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setJoinSuccess(false);
          setJoinModalOpen(true);
        }}
        disabled={lineupFull}
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Join Lineup
      </button>
    </div>
  </div>

  {joinSuccess ? (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
      You joined the lineup.
    </div>
  ) : null}

{mounted && joinModalOpen
  ? createPortal(
  <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 px-4 pt-[10vh]">
    <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold">Join the Lineup</div>
          <div className="mt-1 text-sm text-neutral-500">
            Add your info before entering the game.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setJoinModalOpen(false)}
          className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-semibold text-neutral-700"
        >
          ×
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-400"
        />

        <input
          type="text"
          value={joinAge}
          onChange={(e) => setJoinAge(e.target.value)}
          placeholder="Age optional"
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-400"
        />

        <input
          type="text"
          value={joinIntro}
          onChange={(e) => setJoinIntro(e.target.value)}
          placeholder="Short intro"
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-400 sm:col-span-2"
        />

        <input
          type="text"
          value={joinLookingFor}
          onChange={(e) => setJoinLookingFor(e.target.value)}
          placeholder="Looking for"
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-400"
        />

        <input
          type="text"
          value={joinFunFact}
          onChange={(e) => setJoinFunFact(e.target.value)}
          placeholder="Fun fact"
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-400"
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setJoinConsent((current) => !current);
        }}
        className="relative z-[10000] mt-4 flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-sm text-neutral-700 pointer-events-auto"
      >
        <span
          className={[
            "pointer-events-none mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold",
            joinConsent
              ? "border-red-600 bg-red-600 text-white"
              : "border-neutral-400 bg-white text-transparent",
          ].join(" ")}
        >
          ✓
        </span>

        <span className="pointer-events-none">
          I understand this is a public interactive game and that my profile information may be visible to other participants and viewers.
        </span>
      </button>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setJoinModalOpen(false)}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700"
        >
          Cancel
        </button>

        <button
          type="button"
onClick={async () => {
  if (!joinConsent || !joinName.trim()) return;

  await joinLineup();

  setJoinModalOpen(false);
  setJoinConsent(false);
  setJoinSuccess(true);
}}
          disabled={!joinName.trim() || !joinConsent || lineupFull}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Join
        </button>
      </div>
    </div>
  </div>
    ,
    document.body,
  )
  : null}
</div>

<div className="mt-5 rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
  <div className="text-center">
    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
      Featured Contestant
    </div>
    <div className="mt-2 text-xl font-bold">Contestant Card</div>
    <div className="mt-1 text-sm text-neutral-500">
      {isHost
  ? "Host starts the round, contestant introduces themselves, lineup decides."
  : roundStatus === "live"
    ? "Round is live. Keep your balloon or pop it."
    : "Waiting for the host to start the round."}
    </div>
  </div>

  {isHost ? (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button
        type="button"
onClick={async () => {
  if (!gameReady) return;

  setRoundStatus("live");

  if (!gameId) return;

  try {
    const res = await fetch("/api/public/pop-balloon/round", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId,
        prompt,
      }),
    });

    const data = await res.json();

    if (data?.ok && data.round?.id) {
      setCurrentRoundId(data.round.id);
    }
  } catch {}
}}
        disabled={!gameId}
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Start Round
      </button>

      <button
        type="button"
        onClick={() => setRoundStatus("ended")}
        className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800"
      >
        End Round
      </button>

      <button
        type="button"
        onClick={resetRound}
        className="rounded-xl border border-neutral-300 bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
      >
        Reset Round
      </button>
    </div>
  ) : null}
</div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <div
            key={player.id}
            className={[
              "rounded-3xl border p-4 transition",
              player.status === "popped"
                ? "border-neutral-200 bg-neutral-100 opacity-60"
                : player.status === "selected"
                  ? "border-emerald-300 bg-emerald-50"
                  : player.status === "kept"
                    ? "border-red-200 bg-red-50"
                    : "border-neutral-200 bg-white",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{player.name}</div>

                {player.age ? (
                  <div className="mt-0.5 text-xs text-neutral-500">
                    Age: {player.age}
                  </div>
                ) : null}

                <div className="mt-1 line-clamp-2 text-xs text-neutral-500">
                  {player.intro}
                </div>
              </div>

              <div className="text-4xl leading-none">
                {player.status === "popped" ? "💥" : "🎈"}
              </div>
            </div>

            {player.lookingFor ? (
              <div className="mt-3 rounded-2xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                Looking for: {player.lookingFor}
              </div>
            ) : null}

            {player.funFact ? (
              <div className="mt-2 rounded-2xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                Fun fact: {player.funFact}
              </div>
            ) : null}

            {player.popReason ? (
              <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs text-neutral-600">
                Popped: {player.popReason}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  roundStatus !== "live" ||
                  player.status === "popped" ||
                  player.status === "selected"
                }
                onClick={() => keepBalloon(player.id)}
                className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Keep Balloon
              </button>

              <button
                type="button"
                disabled={
                  roundStatus !== "live" ||
                  player.status === "popped" ||
                  player.status === "selected"
                }
                onClick={() => requestPop(player.id)}
                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Pop
              </button>

{!isHost && player.status !== "popped" && player.status !== "selected" ? (
  <button
    type="button"
    onClick={() => removePlayer(player.id)}
    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
  >
    Leave Lineup
  </button>
) : null}

{isHost ? (
  <>
    <button
      type="button"
      disabled={player.status === "popped"}
      onClick={() => selectMatch(player.id)}
      className="rounded-xl border border-neutral-300 bg-neutral-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      Select Match
    </button>

    <button
      type="button"
      onClick={() => removePlayer(player.id)}
      className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
    >
      Remove
    </button>
  </>
) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="text-sm font-bold">Round Status</div>

        <div className="mt-2 text-sm text-neutral-600">
          Current round: {roundStatus}
        </div>

        <div className="mt-2 text-sm text-neutral-600">
          Remaining balloons: {activePlayers.length}
        </div>

        {isHost ? (
        <>
            <div className="mt-1 text-sm text-neutral-600">
            Match mode: {matchResultMode}
            </div>

            <div className="mt-1 text-sm text-neutral-600">
            Anonymous viewing: {anonymousViewingEnabled ? "On" : "Off"}
            </div>

            <div className="mt-1 text-sm text-neutral-600">
            Audience voting: {audienceVotingEnabled ? "On" : "Off"}
            </div>
        </>
        ) : null}

        {selectedPlayer ? (
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            Match selected: {selectedPlayer.name}
          </div>
        ) : activePlayers.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700">
            No Match
          </div>
        ) : null}
      </div>

      {popTarget ? (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 px-4 pt-[10vh]">
          <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-xl">
            <div className="text-lg font-bold">Why pop your balloon?</div>
            <div className="mt-1 text-sm text-neutral-500">
              Popping for: {popTarget.name}
            </div>

            <div className="mt-4 space-y-2">
              {POP_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    checked={popReasonDraft === reason}
                    onChange={() => setPopReasonDraft(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {popReasonDraft === "Other" ? (
              <input
                type="text"
                value={popReasonDraft}
                onChange={(e) => setPopReasonDraft(e.target.value)}
                placeholder="Enter reason"
                className="mt-3 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-400"
              />
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPopTargetId(null);
                  setPopReasonDraft(POP_REASONS[0]);
                }}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmPop}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirm Pop
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}