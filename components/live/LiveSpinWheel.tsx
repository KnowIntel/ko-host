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
  } = useLiveEndpoint<Response>(
    "spin-wheel",
  );

  const [spinning, setSpinning] =
    useState(false);

  const [rotation, setRotation] =
    useState(0);

  const [
    visibleResult,
    setVisibleResult,
  ] = useState<SpinResult | null>(
    null,
  );

  const [error, setError] =
    useState("");

  const lastSpin =
    visibleResult ??
    data?.participantState?.lastSpin ??
    null;

  const options = useMemo(
    () =>
      data?.activity?.options ?? [],
    [data?.activity?.options],
  );

  /*
   * ================================================================
   * WHEEL GEOMETRY
   * ================================================================
   *
   * The Live Spin Wheel uses the same SVG geometry approach as the
   * standard Spin Wheel.
   *
   * Segments and labels share the same SVG coordinate system so the
   * labels remain centered correctly regardless of the number of
   * configured options.
   */

  const wheelSize = 240;
  const wheelCenter =
    wheelSize / 2;
  const wheelRadius = 112;

  const anglePerOption =
    options.length > 0
      ? 360 / options.length
      : 360;

  const polarToCartesian = (
    angle: number,
  ) => {
    const radians =
      ((angle - 90) *
        Math.PI) /
      180;

    return {
      x:
        wheelCenter +
        wheelRadius *
          Math.cos(radians),

      y:
        wheelCenter +
        wheelRadius *
          Math.sin(radians),
    };
  };

  const createSegmentPath = (
    index: number,
  ) => {
    const startAngle =
      index * anglePerOption;

    const endAngle =
      startAngle +
      anglePerOption;

    const start =
      polarToCartesian(
        startAngle,
      );

    const end =
      polarToCartesian(
        endAngle,
      );

    const largeArcFlag =
      anglePerOption > 180
        ? 1
        : 0;

    return [
      `M ${wheelCenter} ${wheelCenter}`,
      `L ${start.x} ${start.y}`,
      `A ${wheelRadius} ${wheelRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  };

  const wrapWheelLabel = (
    label: string,
  ) => {
    const words = String(
      label || "",
    )
      .trim()
      .split(/\s+/);

    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const nextLine =
        currentLine
          ? `${currentLine} ${word}`
          : word;

      if (
        nextLine.length > 10 &&
        currentLine
      ) {
        lines.push(
          currentLine,
        );

        currentLine = word;
      } else {
        currentLine =
          nextLine;
      }
    });

    if (currentLine) {
      lines.push(
        currentLine,
      );
    }

    return lines.slice(
      0,
      3,
    );
  };

  /*
   * Builder-configured segment colors.
   *
   * These affect only the visual wheel. The server remains
   * authoritative for the selected option and awarded points.
   */

  const segmentColors = [
    wheelColor1 || "#111827",
    wheelColor2 || "#e5e7eb",
    wheelColor3 || "#9ca3af",
    wheelColor4 || "#f3f4f6",
    wheelColor5 || "#4b5563",
    wheelColor6 || "#d1d5db",
  ];

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
       * Ask the server for the real result BEFORE determining where
       * the visual wheel should stop.
       */

      const response =
        await fetch(
          `/api/live/${encodeURIComponent(
            experienceId,
          )}/spin-wheel/spin`,
          {
            method: "POST",
            credentials:
              "include",
            cache: "no-store",
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => null,
          );

      if (
        !response.ok ||
        payload?.ok !== true
      ) {
        setError(
          payload?.error ||
            "Unable to spin.",
        );

        setSpinning(false);

        return;
      }

      /*
       * Accept the server's authoritative result.
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
       * Some endpoint responses may expose the selected option
       * separately.
       */

      if (
        winningIndex < 0 &&
        typeof payload?.option
          ?.id === "string"
      ) {
        winningIndex =
          options.findIndex(
            (option) =>
              option.id ===
              payload.option.id,
          );
      }

      /*
       * Last-resort label match is only for locating the
       * server-selected segment.
       *
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

      if (
        winningIndex < 0
      ) {
        await refresh();

        setError(
          "Spin completed, but the wheel could not display the result.",
        );

        setSpinning(false);

        return;
      }

      const segmentSize =
        360 /
        options.length;

      /*
       * Pointer is fixed at 12 o'clock.
       *
       * Keep the existing Live Spin Wheel landing calculation
       * unchanged for this rendering update. Once static SVG
       * positioning is verified, pointer/result alignment can be
       * validated independently.
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
  (360 -
    winningCenter) %
  360;
      const adjustment =
        (desiredNormalized -
          normalizedCurrent +
          360) %
        360;

      /*
       * Eight complete turns plus the exact landing adjustment.
       */

      const nextRotation =
        rotation +
        360 * 8 +
        adjustment;

      setRotation(
        nextRotation,
      );

      /*
       * Let the wheel finish visually before revealing the result.
       */

      window.setTimeout(
        () => {
          if (
            resultSource
          ) {
            setVisibleResult(
              {
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
              },
            );
          }

          void (async () => {
            await refresh();

            try {
              await fetch(
                `/api/live/${encodeURIComponent(
                  experienceId,
                )}/spin-wheel/refresh`,
                {
                  method:
                    "POST",
                  credentials:
                    "include",
                  cache:
                    "no-store",
                },
              );
            } catch (
              refreshError
            ) {
              console.error(
                "Spin Wheel Live refresh failed:",
                refreshError,
              );
            }
          })();

          setSpinning(
            false,
          );
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

  if (!authenticated || !data?.activity) {
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
          style={
            !authenticated
              ? joinRequiredTextStyle
              : waitingTextStyle
          }
        >
          {!authenticated
            ? joinRequiredText
            : waitingText}
        </div>
      </div>
    );
  }

  const spins =
    data.participantState
      ?.spins ?? [];

  const canSpin =
    data.activity
      .allowMultipleSpins ||
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

        {/*
         * Rotate the complete SVG.
         *
         * Because both the segment paths and their text live inside
         * this SVG, labels remain attached to the correct segments
         * throughout the animation.
         */}
        <div
          className="relative aspect-square w-full"
          style={{
            transform: `rotate(${rotation}deg)`,

            transition:
              spinning
                ? "transform 3.2s cubic-bezier(0.12, 0.72, 0.18, 1)"
                : "none",
          }}
        >
          <svg
            viewBox={`0 0 ${wheelSize} ${wheelSize}`}
            className="h-full w-full overflow-hidden rounded-full border-4 border-neutral-900 shadow-md"
            style={
              wheelStyle
            }
          >
            {options.map(
              (
                option,
                index,
              ) => {
                /*
                 * Use the same angular midpoint for both the segment
                 * and its label.
                 */

                const midAngle =
                  index *
                    anglePerOption +
                  anglePerOption /
                    2;

                const textPoint =
                  polarToCartesian(
                    midAngle,
                  );

                /*
                 * Place the label halfway between the wheel center
                 * and the outer point at the segment's midpoint.
                 *
                 * This is the proven positioning method used by the
                 * standard Spin Wheel.
                 */

                const textX =
                  (wheelCenter +
                    textPoint.x) /
                  2;

                const textY =
                  (wheelCenter +
                    textPoint.y) /
                  2;

                const segmentColor =
                  segmentColors[
                    index %
                      segmentColors.length
                  ];

                const labelLines =
                  wrapWheelLabel(
                    option.label,
                  );

                return (
                  <g
                    key={
                      option.id ??
                      index
                    }
                  >
                    <path
                      d={createSegmentPath(
                        index,
                      )}
                      fill={
                        segmentColor
                      }
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />

                    <text
                      x={textX}
                      y={textY}
                      fill={
                        typeof wheelTextStyle
                          ?.color ===
                        "string"
                          ? wheelTextStyle.color
                          : "#FFFFFF"
                      }
                      fontSize={
                        typeof wheelTextStyle
                          ?.fontSize ===
                        "number"
                          ? wheelTextStyle.fontSize
                          : typeof wheelTextStyle
                                ?.fontSize ===
                              "string"
                            ? wheelTextStyle.fontSize
                            : 12
                      }
                      fontWeight={
                        wheelTextStyle
                          ?.fontWeight ??
                        "700"
                      }
                      fontStyle={
                        wheelTextStyle
                          ?.fontStyle
                      }
                      fontFamily={
                        wheelTextStyle
                          ?.fontFamily
                      }
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                    >
                      {labelLines.map(
                        (
                          line,
                          lineIndex,
                        ) => (
                          <tspan
                            key={`${option.id}_${lineIndex}`}
                            x={
                              textX
                            }
                            dy={
                              lineIndex ===
                              0
                                ? `${
                                    -(
                                      labelLines.length -
                                      1
                                    ) *
                                    6
                                  }`
                                : "12"
                            }
                          >
                            {
                              line
                            }
                          </tspan>
                        ),
                      )}
                    </text>
                  </g>
                );
              },
            )}

            {/* CENTER HUB */}
            <circle
              cx={
                wheelCenter
              }
              cy={
                wheelCenter
              }
              r="28"
              fill="#FFFFFF"
              stroke="#111827"
              strokeWidth="4"
            />

            <circle
              cx={
                wheelCenter
              }
              cy={
                wheelCenter
              }
              r="12"
              fill="#111827"
            />
          </svg>
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

      {lastSpin &&
      !spinning ? (
        <div
          className="mt-4 p-3"
          style={
            resultStyle
          }
        >
          <div
            className="font-semibold"
            style={
              resultHeadingStyle
            }
          >
            {resultHeading}
          </div>

          <div
            style={
              resultTextStyle
            }
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