"use client";

import { useEffect, useRef, useState } from "react";
import SpeedDatingChat from "./SpeedDatingChat";

type Participant = {
  id: string;
  browserKey: string;
  name: string;
  iam: "man" | "woman";
  seeking: "man" | "woman";
};

type Pair = {
  id: string;
  round: number;
  leftParticipant?: Participant;
  rightParticipant?: Participant;
};

type ApiState = {
  round: number;
  roundEndsAt: string;
  roundDurationSeconds: number;
  leftColumn: Participant[];
  rightColumn: Participant[];
  activePairs: Pair[];
};

export default function SpeedDatingLive() {
  const sessionId =
    typeof window !== "undefined" ? window.location.hostname : "";

  const [browserKey] = useState(() => {
    if (typeof window === "undefined") return "";
    let key = localStorage.getItem("sd_browserKey");
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem("sd_browserKey", key);
    }
    return key;
  });

  const [round, setRound] = useState(0);
  const [roundEndsAt, setRoundEndsAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [leftColumn, setLeftColumn] = useState<Participant[]>([]);
  const [rightColumn, setRightColumn] = useState<Participant[]>([]);
  const [boardPairs, setBoardPairs] = useState<Pair[]>([]);
  const [activeChatPair, setActiveChatPair] = useState<Pair | null>(null);

  const lastPlayedRoundRef = useRef<number | null>(null);

  // 🔁 POLL STATE (MERGE ONLY)
  useEffect(() => {
    let cancelled = false;

    async function fetchState() {
      const res = await fetch("/api/speed-dating", { cache: "no-store" });
      const incoming: ApiState = await res.json();

      if (cancelled) return;

      // ✅ ROUND CHANGE ONLY
      if (incoming.round !== round) {
        setRound(incoming.round);
        setRoundEndsAt(new Date(incoming.roundEndsAt).getTime());
      }

      // ✅ SAFE MERGE (no overwrites)
      setLeftColumn(incoming.leftColumn ?? []);
      setRightColumn(incoming.rightColumn ?? []);
      setBoardPairs(incoming.activePairs ?? []);

      // ✅ RESOLVE MY PAIR (no flicker)
      setActiveChatPair((prev) => {
        const mine =
          incoming.activePairs?.find(
            (p) =>
              p.leftParticipant?.browserKey === browserKey ||
              p.rightParticipant?.browserKey === browserKey
          ) ?? null;

        if (!mine) {
          if (prev && prev.round === incoming.round) return prev;
          return null;
        }

        if (!prev) return mine;
        if (prev.round !== incoming.round) return mine;
        if (prev.id === mine.id) return prev;

        return mine;
      });
    }

    fetchState();
    const id = setInterval(fetchState, 2000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [browserKey, round]);

  // ⏱️ LOCAL TIMER (NO SERVER OVERRIDE)
  useEffect(() => {
    if (!roundEndsAt) return;

    const tick = () => {
      const next = Math.max(
        0,
        Math.ceil((roundEndsAt - Date.now()) / 1000)
      );
      setTimeLeft(next);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [roundEndsAt]);

  // 🔊 SOUND — ONCE PER ROUND
  useEffect(() => {
    if (!round) return;

    if (lastPlayedRoundRef.current === null) {
      lastPlayedRoundRef.current = round;
      return;
    }

    if (round > lastPlayedRoundRef.current) {
      try {
        const audio = new Audio("/sounds/round-start.mp3");
        audio.play().catch(() => {});
      } catch {}

      lastPlayedRoundRef.current = round;
    }
  }, [round]);

  return (
    <div className="w-full flex flex-col gap-6">

      {/* TIMER */}
      <div className="text-center text-2xl font-bold">
        {timeLeft}s
      </div>

      {/* BOARD */}
      <div className="grid grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="flex flex-col gap-2">
          {leftColumn.map((p) => (
            <div key={p.id} className="p-2 border rounded">
              {p.name}
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-2">
          {rightColumn.map((p) => (
            <div key={p.id} className="p-2 border rounded">
              {p.name}
            </div>
          ))}
        </div>

      </div>

      {/* PAIRS */}
      <div className="flex flex-col gap-2">
        {boardPairs.map((pair) => (
          <div key={pair.id} className="border p-2 rounded">
            {pair.leftParticipant?.name} ↔ {pair.rightParticipant?.name}
          </div>
        ))}
      </div>

      {/* CHAT (STABLE MOUNT) */}
      {activeChatPair && (
        <SpeedDatingChat
          key={`${sessionId}:${activeChatPair.id}:${activeChatPair.round}`}
          sessionId={sessionId}
          pairId={activeChatPair.id}
          round={activeChatPair.round}
          browserKey={browserKey}
        />
      )}

    </div>
  );
}