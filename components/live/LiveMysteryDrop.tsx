
"use client";

import {
  useEffect,
  useRef,
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

  activity?: {
    id: string;
    name: string;
  };

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
    activityId,
    loading,
    error: loadError,
  } = useLiveEndpoint<Response>("mystery-drop");

  const [revealing, setRevealing] =
    useState(false);

  const [revealed, setRevealed] =
    useState<RevealedDrop | null>(null);

  const [error, setError] =
    useState("");

  const requestGeneration = useRef(0);

  const displayedActivityId =
    data?.activity?.id ?? null;

  useEffect(() => {
    requestGeneration.current += 1;

    setRevealing(false);
    setRevealed(null);
    setError("");

    return () => {
      requestGeneration.current += 1;
    };
  }, [activityId, experienceId]);

  const activityMatchesSelection =
    Boolean(displayedActivityId) &&
    (activityId === null ||
      displayedActivityId === activityId);

  const activeDrop =
    activityMatchesSelection
      ? data?.activeDrop ?? null
      : null;

  async function reveal() {
    if (
      !experienceId ||
      !authenticated ||
      revealing ||
      !activeDrop ||
      !displayedActivityId ||
      !activityMatchesSelection
    ) {
      return;
    }

    const generation =
      ++requestGeneration.current;

    const requestActivityId =
      activityId ?? displayedActivityId;

    const requestedDropId = activeDrop.id;

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activityId: requestActivityId,
          }),
        },
      );

      const payload = await response
        .json()
        .catch(() => null);

      if (
        generation !== requestGeneration.current
      ) {
        return;
      }

      if (
        !response.ok ||
        payload?.ok !== true ||
        !payload?.drop
      ) {
        setError(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to reveal the Mystery Drop.",
        );
        return;
      }

      const result = payload.drop as RevealedDrop;

      if (result.id !== requestedDropId) {
        setError(
          "The active Mystery Drop changed. Please try again.",
        );
        return;
      }

      setRevealed(result);
    } catch (revealError) {
      if (
        generation !== requestGeneration.current
      ) {
        return;
      }

      console.error(
        "Mystery Drop reveal failed:",
        revealError,
      );

      setError(
        "Unable to reveal the Mystery Drop.",
      );
    } finally {
      if (
        generation === requestGeneration.current
      ) {
        setRevealing(false);
      }
    }
  }

  if (!authenticated) {
    return (
      <div className="h-full w-full overflow-auto p-4">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading}
        </div>

        <div
          className="mt-2 text-center"
          style={joinRequiredTextStyle}
        >
          {joinRequiredText}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div
        className="text-xl font-semibold"
        style={headingStyle}
      >
        {heading}
      </div>

      {loading ? (
        <div
          className="mt-2"
          style={waitingTextStyle}
        >
          Loading Mystery Drop...
        </div>
      ) : loadError ? (
        <div
          className="mt-2"
          style={waitingTextStyle}
        >
          {loadError}
        </div>
      ) : !activeDrop ? (
        <div
          className="mt-2"
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

          {revealed?.id === activeDrop.id ? (
            <>
              <div
                className="mt-3"
                style={revealedLabelStyle}
              >
                {revealedLabel}
              </div>

              <div
                className="mt-2 whitespace-pre-wrap"
                style={contentStyle}
              >
                {revealed.content}
              </div>

              {revealed.awardedPoints > 0 ? (
                <div className="mt-2 text-sm">
                  +{revealed.awardedPoints} points
                </div>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              disabled={revealing}
              onClick={() => void reveal()}
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
