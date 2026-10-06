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
    options: Array<{
      id: string;
      label: string;
      points: number;
    }>;
    allowMultipleSpins: boolean;
  };

  participantState?: {
    spins?: Array<{
      optionId: string;
      label: string;
      awardedPoints: number;
      spunAt: string;
    }>;
    lastSpin?: {
      optionId: string;
      label: string;
      awardedPoints: number;
      spunAt: string;
    };
  };
};

type Props = {
  heading: string;
  waitingText: string;
  joinRequiredText: string;
  spinButtonLabel: string;
  resultHeading: string;

  headingStyle?: CSSProperties;
  waitingTextStyle?: CSSProperties;
  joinRequiredTextStyle?: CSSProperties;
  spinButtonTextStyle?: CSSProperties;
  resultHeadingStyle?: CSSProperties;
  resultTextStyle?: CSSProperties;

  wheelStyle?: CSSProperties;
  spinButtonStyle?: CSSProperties;
  resultStyle?: CSSProperties;
};

export default function LiveSpinWheel({
  heading,
  waitingText,
  joinRequiredText,
  spinButtonLabel,
  resultHeading,
  headingStyle,
  waitingTextStyle,
  joinRequiredTextStyle,
  spinButtonTextStyle,
  resultHeadingStyle,
  resultTextStyle,
  wheelStyle,
  spinButtonStyle,
  resultStyle,
}: Props) {
  const {
    data,
    authenticated,
    experienceId,
    refresh,
  } =
    useLiveEndpoint<Response>(
      "spin-wheel",
    );

  const [spinning, setSpinning] =
    useState(false);

  const [error, setError] =
    useState("");

  const lastSpin =
    data?.participantState
      ?.lastSpin ?? null;

  async function spin() {
    if (!experienceId || spinning) {
      return;
    }

    setSpinning(true);
    setError("");

    try {
      const response = await fetch(
        `/api/live/${encodeURIComponent(
          experienceId,
        )}/spin-wheel/spin`,
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
            "Unable to spin.",
        );
        return;
      }

      await refresh();
    } finally {
      setSpinning(false);
    }
  }

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

  if (!data?.activity) {
    return (
      <div
        className="p-4 text-center"
        style={waitingTextStyle}
      >
        {waitingText}
      </div>
    );
  }

  const spins =
    data.participantState?.spins ??
    [];

  const canSpin =
    data.activity.allowMultipleSpins ||
    spins.length === 0;

  return (
    <div className="h-full w-full overflow-auto p-4 text-center">
      <div
        className="text-xl font-semibold"
        style={headingStyle}
      >
        {heading}
      </div>

      <div
        className="mx-auto mt-5 flex aspect-square w-full max-w-[240px] items-center justify-center rounded-full p-5"
        style={wheelStyle}
      >
        <div>
          {data.activity.options.map(
            (option) => (
              <div
                key={option.id}
                className="text-sm"
              >
                {option.label}
              </div>
            ),
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={
          spinning || !canSpin
        }
        onClick={() => void spin()}
        className="mt-4 w-full px-4 py-3 disabled:opacity-50"
        style={{
          ...spinButtonStyle,
          ...spinButtonTextStyle,
        }}
      >
        {spinning
          ? "Spinning..."
          : spinButtonLabel}
      </button>

      {lastSpin ? (
        <div
          className="mt-4 p-3"
          style={resultStyle}
        >
          <div
            className="font-semibold"
            style={resultHeadingStyle}
          >
            {resultHeading}
          </div>

          <div
            style={resultTextStyle}
          >
            {lastSpin.label}
            {lastSpin.awardedPoints >
            0
              ? ` (+${lastSpin.awardedPoints})`
              : ""}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-2 text-sm">
          {error}
        </div>
      ) : null}
    </div>
  );
}