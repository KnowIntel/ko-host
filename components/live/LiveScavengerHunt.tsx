"use client";

import {
  useState,
  type CSSProperties,
} from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type HuntItem = {
  id: string;
  title: string;
  description: string;
  points: number;
};

type Response = {
  ok: boolean;

  activity?: {
    id: string;
    name: string;
    items: HuntItem[];
  };

  participantState?: {
    completedItems?: Record<
      string,
      {
        completedAt: string;
        awardedPoints: number;
      }
    >;
  };
};

type Props = {
  heading: string;
  waitingText: string;
  joinRequiredText: string;
  completedLabel: string;
  progressLabel: string;
  showProgress: boolean;
  showPoints: boolean;

  headingStyle?: CSSProperties;
  waitingTextStyle?: CSSProperties;
  joinRequiredTextStyle?: CSSProperties;
  itemTitleStyle?: CSSProperties;
  itemDescriptionStyle?: CSSProperties;
  completedLabelStyle?: CSSProperties;
  progressStyle?: CSSProperties;

  itemStyle?: CSSProperties;
  completedItemStyle?: CSSProperties;
};

export default function LiveScavengerHunt({
  heading,
  waitingText,
  joinRequiredText,
  completedLabel,
  progressLabel,
  showProgress,
  showPoints,
  headingStyle,
  waitingTextStyle,
  joinRequiredTextStyle,
  itemTitleStyle,
  itemDescriptionStyle,
  completedLabelStyle,
  progressStyle,
  itemStyle,
  completedItemStyle,
}: Props) {
  const {
    data,
    authenticated,
    experienceId,
    refresh,
  } =
    useLiveEndpoint<Response>(
      "scavenger-hunt",
    );

  const [submittingId, setSubmittingId] =
    useState("");

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

  const items =
    data?.activity?.items ?? [];

  const completed =
    data?.participantState
      ?.completedItems ?? {};

  async function complete(
    itemId: string,
  ) {
    if (
      !experienceId ||
      submittingId
    ) {
      return;
    }

    setSubmittingId(itemId);
    setError("");

    try {
      const response = await fetch(
        `/api/live/${encodeURIComponent(
          experienceId,
        )}/scavenger-hunt/complete`,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            itemId,
          }),
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
            "Unable to complete item.",
        );
        return;
      }

      await refresh();
    } finally {
      setSubmittingId("");
    }
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

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div
        className="text-xl font-semibold"
        style={headingStyle}
      >
        {heading}
      </div>

      {showProgress ? (
        <div
          className="mt-2"
          style={progressStyle}
        >
          {progressLabel}:{" "}
          {Object.keys(completed).length}
          /{items.length}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const isCompleted =
            Boolean(
              completed[item.id],
            );

          return (
            <button
              type="button"
              key={item.id}
              disabled={
                isCompleted ||
                Boolean(submittingId)
              }
              onClick={() =>
                void complete(item.id)
              }
              className="block w-full p-3 text-left disabled:cursor-default"
              style={{
                ...itemStyle,
                ...(isCompleted
                  ? completedItemStyle
                  : {}),
              }}
            >
              <div
                className="font-semibold"
                style={itemTitleStyle}
              >
                {item.title}

                {showPoints ? (
                  <span>
                    {" "}
                    ({item.points} pts)
                  </span>
                ) : null}
              </div>

              {item.description ? (
                <div
                  className="mt-1"
                  style={
                    itemDescriptionStyle
                  }
                >
                  {item.description}
                </div>
              ) : null}

              {isCompleted ? (
                <div
                  className="mt-2 text-sm"
                  style={
                    completedLabelStyle
                  }
                >
                  {completedLabel}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mt-3 text-sm">
          {error}
        </div>
      ) : null}
    </div>
  );
}