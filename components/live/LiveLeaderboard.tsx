"use client";

import type { CSSProperties } from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type Player = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  rank: number;
  isCurrentParticipant: boolean;
};

type Response = {
  ok: boolean;
  leaderboard?: Player[];
};

type Props = {
  heading: string;
  emptyText: string;
  scoreLabel: string;
  rankLabel: string;
  participantLabel: string;
  showAvatar: boolean;
  showRank: boolean;
  showScore: boolean;
  maxEntries: number;

  headingStyle?: CSSProperties;
  rankStyle?: CSSProperties;
  participantStyle?: CSSProperties;
  scoreStyle?: CSSProperties;
  emptyTextStyle?: CSSProperties;
  rowStyle?: CSSProperties;
  currentParticipantStyle?: CSSProperties;
};

export default function LiveLeaderboard({
  heading,
  emptyText,
  scoreLabel,
  rankLabel,
  participantLabel,
  showAvatar,
  showRank,
  showScore,
  maxEntries,
  headingStyle,
  rankStyle,
  participantStyle,
  scoreStyle,
  emptyTextStyle,
  rowStyle,
  currentParticipantStyle,
}: Props) {
  const safeLimit = Math.max(
    1,
    Math.min(
      Math.trunc(maxEntries || 10),
      100,
    ),
  );

  const { data, loading } =
    useLiveEndpoint<Response>(
      `leaderboard?limit=${safeLimit}`,
    );

  const players =
    data?.leaderboard ?? [];

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div
        className="text-xl font-semibold"
        style={headingStyle}
      >
        {heading}
      </div>

      {!loading &&
      players.length === 0 ? (
        <div
          className="mt-2"
          style={emptyTextStyle}
        >
          {emptyText}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3"
            style={{
              ...rowStyle,
              ...(player.isCurrentParticipant
                ? currentParticipantStyle
                : {}),
            }}
          >
            {showRank ? (
              <div
                className="shrink-0"
                style={rankStyle}
                title={rankLabel}
              >
                #{player.rank}
              </div>
            ) : null}

            {showAvatar ? (
              player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border">
                  {player.displayName
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
              )
            ) : null}

            <div
              className="min-w-0 flex-1 truncate"
              style={participantStyle}
              title={participantLabel}
            >
              {player.displayName}
            </div>

            {showScore ? (
              <div
                className="shrink-0"
                style={scoreStyle}
              >
                {player.score}{" "}
                {scoreLabel}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}