// components\live\LiveLottery.tsx

"use client";

import {
  useState,
  type CSSProperties,
} from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type Response = {
  ok: boolean;

  activity?: {
    id: string;
    name: string;
    maxEntriesPerParticipant: number;
  };

  participantState?: {
    entries?: Array<{
      entryNumber: number;
      enteredAt: string;
    }>;
    entryCount?: number;
  };

  winner?: {
    participantId?: string;
    displayName?: string;
    drawnAt?: string;
  };
};

type Props = {
  heading: string;
  helperText: string;
  joinRequiredText: string;
  enterButtonLabel: string;
  enteredLabel: string;
  winnerHeading: string;
  waitingForDrawText: string;

  headingStyle?: CSSProperties;
  helperTextStyle?: CSSProperties;
  joinRequiredTextStyle?: CSSProperties;
  enterButtonTextStyle?: CSSProperties;
  enteredLabelStyle?: CSSProperties;
  winnerHeadingStyle?: CSSProperties;
  winnerTextStyle?: CSSProperties;
  waitingForDrawTextStyle?: CSSProperties;

  enterButtonStyle?: CSSProperties;
  winnerStyle?: CSSProperties;
};

export default function LiveLottery({
  heading,
  helperText,
  joinRequiredText,
  enterButtonLabel,
  enteredLabel,
  winnerHeading,
  waitingForDrawText,
  headingStyle,
  helperTextStyle,
  joinRequiredTextStyle,
  enterButtonTextStyle,
  enteredLabelStyle,
  winnerHeadingStyle,
  winnerTextStyle,
  waitingForDrawTextStyle,
  enterButtonStyle,
  winnerStyle,
}: Props) {
const {
  data,
  loading,
  error: loadError,
  authenticated,
  experienceId,
  refresh,
} =
  useLiveEndpoint<Response>(
    "lottery",
  );

  const [entering, setEntering] =
    useState(false);

  const [error, setError] =
    useState("");

  if (
    !authenticated ||
    loading ||
    loadError ||
    !data?.activity
  ) {
    const statusText = !authenticated
      ? joinRequiredText
      : loading
        ? "Loading Lottery..."
        : loadError
          ? loadError
          : "No active Lottery is available.";

    const statusStyle = !authenticated
      ? joinRequiredTextStyle
      : helperTextStyle;

    return (
      <div className="h-full w-full overflow-auto p-4 text-center">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading}
        </div>

        <div
          className="mt-2"
          style={statusStyle}
        >
          {statusText}
        </div>
      </div>
    );
  }
  const entryCount =
    data.participantState
      ?.entryCount ??
    data.participantState?.entries
      ?.length ??
    0;

  const maxEntries =
    data.activity
      .maxEntriesPerParticipant;

  const canEnter =
    entryCount < maxEntries;

  async function enter() {
    if (!experienceId || entering) {
      return;
    }

    setEntering(true);
    setError("");

    try {
      const response = await fetch(
        `/api/live/${encodeURIComponent(
          experienceId,
        )}/lottery/enter`,
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
        payload?.ok !== true
      ) {
        setError(
          payload?.error ||
            "Unable to enter.",
        );
        return;
      }

      await refresh();
    } finally {
      setEntering(false);
    }
  }

  return (
    <div className="h-full w-full overflow-auto p-4 text-center">
      <div
        className="text-xl font-semibold"
        style={headingStyle}
      >
        {heading}
      </div>

      <div
        className="mt-1"
        style={helperTextStyle}
      >
        {helperText}
      </div>

      {canEnter ? (
        <button
          type="button"
          disabled={entering}
          onClick={() => void enter()}
          className="mt-4 mx-auto block w-4/5 px-4 py-3 disabled:opacity-50"
          style={{
            ...enterButtonStyle,
            ...enterButtonTextStyle,
          }}
        >
          {entering
            ? "Entering..."
            : enterButtonLabel}
        </button>
      ) : (
        <div
          className="mt-4"
          style={enteredLabelStyle}
        >
          {enteredLabel}
        </div>
      )}

      {maxEntries > 1 &&
      entryCount > 0 ? (
        <div className="mt-2 text-sm">
          {entryCount}/{maxEntries} entries
        </div>
      ) : null}

      {data.winner?.displayName ? (
        <div
          className="mt-5 p-4"
          style={winnerStyle}
        >
          <div
            className="font-semibold"
            style={winnerHeadingStyle}
          >
            {winnerHeading}
          </div>

          <div
            style={winnerTextStyle}
          >
            {data.winner.displayName}
          </div>
        </div>
      ) : (
        <div
          className="mt-5"
          style={
            waitingForDrawTextStyle
          }
        >
          {waitingForDrawText}
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