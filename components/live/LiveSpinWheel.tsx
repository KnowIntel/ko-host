"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
} from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type SpinResult = {
  optionId: string;
  label: string;
  awardedPoints: number;
  spunAt: string;
};

type WheelOption = {
  id: string;
  label: string;
  points: number;
};

type Response = {
  ok: boolean;

  activity?: {
    id: string;
    name: string;
    options: WheelOption[];
    allowMultipleSpins: boolean;
  };

  participantState?: {
    spins?: SpinResult[];
    lastSpin?: SpinResult;
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
wheelTextStyle?: CSSProperties;
spinButtonTextStyle?: CSSProperties;
resultHeadingStyle?: CSSProperties;
resultTextStyle?: CSSProperties;

wheelStyle?: CSSProperties;
spinButtonStyle?: CSSProperties;
resultStyle?: CSSProperties;

wheelColor1?: string;
wheelColor2?: string;
wheelColor3?: string;
wheelColor4?: string;
wheelColor5?: string;
wheelColor6?: string;
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
wheelTextStyle,
spinButtonTextStyle,
resultHeadingStyle,
resultTextStyle,
wheelStyle,
spinButtonStyle,
resultStyle,
wheelColor1,
wheelColor2,
wheelColor3,
wheelColor4,
wheelColor5,
wheelColor6,
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

  const [rotation, setRotation] =
    useState(0);

  const [visibleResult, setVisibleResult] =
    useState<SpinResult | null>(null);

  const [error, setError] =
    useState("");

  const lastSpin =
    visibleResult ??
    data?.participantState
      ?.lastSpin ??
    null;

  const options =
    useMemo(
      () =>
        data?.activity?.options ??
        [],
      [data?.activity?.options],
    );

  /*
   * Create equal visual segments.
   *
   * The colors are intentionally generated
   * rather than tied to the result logic.
   * The server remains authoritative.
   */
  const wheelBackground =
    useMemo(() => {
      if (options.length === 0) {
        return undefined;
      }

      const segmentSize =
        360 / options.length;

const segmentColors = [
  wheelColor1 || "#111827",
  wheelColor2 || "#e5e7eb",
  wheelColor3 || "#9ca3af",
  wheelColor4 || "#f3f4f6",
  wheelColor5 || "#4b5563",
  wheelColor6 || "#d1d5db",
];

      const segments =
        options.map(
          (_, index) => {
            const start =
              index *
              segmentSize;

            const end =
              start +
              segmentSize;

            const color =
              segmentColors[
                index %
                  segmentColors.length
              ];

            return `${color} ${start}deg ${end}deg`;
          },
        );

      return `conic-gradient(from -90deg, ${segments.join(
        ", ",
      )})`;
    }, [
  options,
  wheelColor1,
  wheelColor2,
  wheelColor3,
  wheelColor4,
  wheelColor5,
  wheelColor6,
]);

  async function spin() {
    if (
      !experienceId ||
      spinning ||
      options.length === 0
    ) {
      return;
    }

    setSpinning(true);
    setVisibleResult(null);
    setError("");

    try {
      /*
       * Ask the server for the real result
       * BEFORE determining where the visual
       * wheel should stop.
       */
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

      /*
       * Accept the server's authoritative
       * result.
       */
      const resultSource =
        payload.result ??
        payload.spin ??
        payload.lastSpin ??
        null;

      const resultOptionId =
        typeof resultSource?.optionId ===
        "string"
          ? resultSource.optionId
          : null;

      let winningIndex =
        resultOptionId
          ? options.findIndex(
              (option) =>
                option.id ===
                resultOptionId,
            )
          : -1;

      /*
       * Some endpoint responses may expose
       * the selected option separately.
       */
      if (
        winningIndex < 0 &&
        typeof payload?.option?.id ===
          "string"
      ) {
        winningIndex =
          options.findIndex(
            (option) =>
              option.id ===
              payload.option.id,
          );
      }

      /*
       * Last-resort label match is only for
       * locating the server-selected segment.
       * It does NOT choose the winner.
       */
      if (
        winningIndex < 0 &&
        typeof resultSource?.label ===
          "string"
      ) {
        winningIndex =
          options.findIndex(
            (option) =>
              option.label ===
              resultSource.label,
          );
      }

      if (winningIndex < 0) {
        await refresh();

        setError(
          "Spin completed, but the wheel could not display the result.",
        );

        return;
      }

      const segmentSize =
        360 / options.length;

      /*
       * Pointer is fixed at 12 o'clock.
       *
       * Rotate the center of the winning
       * segment underneath that pointer.
       */
      const winningCenter =
        winningIndex *
          segmentSize +
        segmentSize / 2;

      const normalizedCurrent =
        ((rotation % 360) +
          360) %
        360;

const desiredNormalized =
  (270 -
    winningCenter +
    360) %
  360;

      const adjustment =
        (desiredNormalized -
          normalizedCurrent +
          360) %
        360;

      /*
       * Five complete turns plus the exact
       * landing adjustment.
       */
const nextRotation =
  rotation +
  360 * 8 +
  adjustment;

      setRotation(
        nextRotation,
      );

      /*
       * Let the wheel finish visually before
       * revealing the result.
       */
      window.setTimeout(
        () => {
          if (resultSource) {
            setVisibleResult({
              optionId:
                resultSource.optionId ??
                options[
                  winningIndex
                ].id,

              label:
                resultSource.label ??
                options[
                  winningIndex
                ].label,

              awardedPoints:
                Number(
                  resultSource.awardedPoints ??
                    options[
                      winningIndex
                    ].points ??
                    0,
                ),

              spunAt:
                resultSource.spunAt ??
                new Date().toISOString(),
            });
          }

          void refresh();

          setSpinning(false);
        },
        3200,
      );
    } catch (spinError) {
      console.error(
        "Spin Wheel request failed:",
        spinError,
      );

      setError(
        "Unable to spin.",
      );

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

      {/* WHEEL */}
      <div className="relative mx-auto mt-6 w-full max-w-[280px]">
        {/* POINTER */}
        <div className="absolute left-1/2 top-[-4px] z-20 -translate-x-1/2">
          <div
            className="h-0 w-0"
            style={{
              borderLeft:
                "12px solid transparent",
              borderRight:
                "12px solid transparent",
              borderTop:
                "24px solid #111827",
            }}
          />
        </div>

        <div
          className="relative aspect-square w-full overflow-hidden rounded-full border-4 border-neutral-900 shadow-md"
          style={{
            ...wheelStyle,

            background:
              wheelBackground,

            transform: `rotate(${rotation}deg)`,

            transition:
              spinning
                ? "transform 3.2s cubic-bezier(0.12, 0.72, 0.18, 1)"
                : "none",
          }}
        >
{/* SEGMENT LABELS */}
{options.map((option, index) => {
  const segmentSize =
    360 / options.length;

  const angle =
    index * segmentSize +
    segmentSize / 2;

  const radians =
    ((angle - 90) * Math.PI) / 180;

  const radius = 26;

  const x =
    50 + Math.cos(radians) * radius;

  const y =
    50 + Math.sin(radians) * radius;

  return (
    <div
      key={option.id}
      className="pointer-events-none absolute max-w-[90px] -translate-x-1/2 -translate-y-1/2 text-center text-xs font-bold"
      style={{
        ...wheelTextStyle,
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
      }}
    >
      {option.label}
    </div>
  );
})}

          {/* CENTER HUB */}
          <div className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-neutral-900 bg-white shadow-sm">
            <div className="h-3 w-3 rounded-full bg-neutral-900" />
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={
          spinning ||
          !canSpin
        }
        onClick={() =>
          void spin()
        }
        className="mt-5 w-full px-4 py-3 disabled:opacity-50"
        style={{
          ...spinButtonStyle,
          ...spinButtonTextStyle,
        }}
      >
        {spinning
          ? "Spinning..."
          : spinButtonLabel}
      </button>

      {lastSpin && !spinning ? (
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