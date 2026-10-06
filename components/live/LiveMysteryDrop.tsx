"use client";

import {
  useState,
  type CSSProperties,
} from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type Drop = {
  id: string;
  title: string;
};

type RevealedDrop = {
  id: string;
  title: string;
  content: string;
  awardedPoints: number;
  revealedAt: string;
};

type Response = {
  ok: boolean;
  activeDrop?: Drop | null;

  participantState?: {
    revealedDrops?: Record<
      string,
      {
        revealedAt: string;
        awardedPoints: number;
      }
    >;
  };
};

type Props = {
  heading: string;
  waitingText: string;
  joinRequiredText: string;
  availableLabel: string;
  revealButtonLabel: string;
  revealedLabel: string;

  headingStyle?: CSSProperties;
  waitingTextStyle?: CSSProperties;
  joinRequiredTextStyle?: CSSProperties;
  availableLabelStyle?: CSSProperties;
  revealButtonTextStyle?: CSSProperties;
  revealedLabelStyle?: CSSProperties;
  contentStyle?: CSSProperties;

  dropStyle?: CSSProperties;
  revealButtonStyle?: CSSProperties;
};

export default function LiveMysteryDrop({
  heading,
  waitingText,
  joinRequiredText,
  availableLabel,
  revealButtonLabel,
  revealedLabel,
  headingStyle,
  waitingTextStyle,
  joinRequiredTextStyle,
  availableLabelStyle,
  revealButtonTextStyle,
  revealedLabelStyle,
  contentStyle,
  dropStyle,
  revealButtonStyle,
}: Props) {
  const {
    data,
    authenticated,
    experienceId,
  } =
    useLiveEndpoint<Response>(
      "mystery-drop",
    );

  const [revealing, setRevealing] =
    useState(false);

  const [revealed, setRevealed] =
    useState<RevealedDrop | null>(
      null,
    );

  const [error, setError] =
    useState("");

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

  const activeDrop =
    data?.activeDrop ?? null;

  async function reveal() {
    if (!experienceId || revealing) {
      return;
    }

    setRevealing(true);
    setError("");

    try {
      const response = await fetch(
        `/api/live/${encodeURIComponent(
          experienceId,
        )}/mystery-drop/reveal`,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        },
      );

      const payload =
        await response
          .json()
          .catch(() => null);

      if (
        !response.ok ||
        payload?.ok !== true ||
        !payload?.drop
      ) {
        setError(
          payload?.error ||
            "Unable to reveal the Mystery Drop.",
        );
        return;
      }

      setRevealed(
        payload.drop as RevealedDrop,
      );
    } finally {
      setRevealing(false);
    }
  }

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div
        className="text-xl font-semibold"
        style={headingStyle}
      >
        {heading}
      </div>

      {!activeDrop ? (
        <div
          className="mt-4"
          style={waitingTextStyle}
        >
          {waitingText}
        </div>
      ) : (
        <div
          className="mt-4 p-4"
          style={dropStyle}
        >
          <div
            style={availableLabelStyle}
          >
            {availableLabel}
          </div>

          <div className="mt-1 font-semibold">
            {activeDrop.title}
          </div>

          {revealed?.id ===
          activeDrop.id ? (
            <>
              <div
                className="mt-3"
                style={
                  revealedLabelStyle
                }
              >
                {revealedLabel}
              </div>

              <div
                className="mt-2 whitespace-pre-wrap"
                style={contentStyle}
              >
                {revealed.content}
              </div>

              {revealed.awardedPoints >
              0 ? (
                <div className="mt-2 text-sm">
                  +
                  {
                    revealed.awardedPoints
                  }{" "}
                  points
                </div>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              disabled={revealing}
              onClick={() =>
                void reveal()
              }
              className="mt-3 w-full px-4 py-3 disabled:opacity-50"
              style={{
                ...revealButtonStyle,
                ...revealButtonTextStyle,
              }}
            >
              {revealing
                ? "Revealing..."
                : revealButtonLabel}
            </button>
          )}
        </div>
      )}

      {error ? (
        <div className="mt-2 text-sm">
          {error}
        </div>
      ) : null}
    </div>
  );
}