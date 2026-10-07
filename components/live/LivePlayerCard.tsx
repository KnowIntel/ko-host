"use client";

import type { CSSProperties } from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type Props = {
  heading: string;
  scoreLabel: string;
  teamLabel: string;
  badgesLabel: string;
  joinRequiredText: string;
  showAvatar: boolean;
  showDisplayName: boolean;
  showScore: boolean;
  showTeam: boolean;
  showBadges: boolean;

  headingStyle?: CSSProperties;
  nameStyle?: CSSProperties;
  detailStyle?: CSSProperties;
  joinRequiredTextStyle?: CSSProperties;
  cardStyle?: CSSProperties;
  avatarStyle?: CSSProperties;
};

type Response = {
  ok: boolean;
  participant?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    score: number;
    team: string | null;
    badges: string[];
  };
};

export default function LivePlayerCard({
  heading,
  scoreLabel,
  teamLabel,
  badgesLabel,
  joinRequiredText,
  showAvatar,
  showDisplayName,
  showScore,
  showTeam,
  showBadges,
  headingStyle,
  nameStyle,
  detailStyle,
  joinRequiredTextStyle,
  cardStyle,
  avatarStyle,
}: Props) {
  const {
    data,
    loading,
    authenticated,
  } = useLiveEndpoint<Response>(
    "player-card",
  );

  if (!authenticated) {
    return (
      <div
        className="p-4 text-center"
        style={joinRequiredTextStyle}
      >
        {joinRequiredText}
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="p-4 text-center">
        Loading...
      </div>
    );
  }

  const participant =
    data?.participant;

  if (!participant) {
    return null;
  }

  const avatarUrl =
    typeof participant.avatarUrl ===
      "string" &&
    participant.avatarUrl.trim()
      ? participant.avatarUrl.trim()
      : null;

  const avatarFallback =
    participant.displayName
      .trim()
      .slice(0, 1)
      .toUpperCase();

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div
        className="mx-auto w-full max-w-md p-4"
        style={cardStyle}
      >
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading}
        </div>

        <div className="mt-4 flex items-center gap-4">
          {showAvatar ? (
            avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${participant.displayName} avatar`}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
                style={avatarStyle}
              />
            ) : (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-xl font-semibold"
                style={avatarStyle}
                aria-label={`${participant.displayName} avatar`}
              >
                {avatarFallback}
              </div>
            )
          ) : null}

          <div className="min-w-0 flex-1">
            {showDisplayName ? (
              <div
                className="font-semibold"
                style={nameStyle}
              >
                {participant.displayName}
              </div>
            ) : null}

            {showScore ? (
              <div style={detailStyle}>
                {scoreLabel}:{" "}
                {participant.score}
              </div>
            ) : null}

            {showTeam &&
            participant.team ? (
              <div style={detailStyle}>
                {teamLabel}:{" "}
                {participant.team}
              </div>
            ) : null}

            {showBadges &&
            participant.badges.length >
              0 ? (
              <div style={detailStyle}>
                {badgesLabel}:{" "}
                {participant.badges.join(
                  ", ",
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}