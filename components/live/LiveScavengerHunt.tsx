// components\live\LiveScavengerHunt.tsx

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
    responseText: string;
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
  responsePlaceholder: string;
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
  responsePlaceholder,
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

const [editingId, setEditingId] =
  useState("");

const [responses, setResponses] =
  useState<Record<string, string>>({});

  const [error, setError] =
    useState("");

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

  const items =
    data?.activity?.items ?? [];

  const completed =
    data?.participantState
      ?.completedItems ?? {};

async function complete(
  itemId: string,
  responseText: string,
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
  responseText,
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
      setEditingId("");
    } finally {
      setSubmittingId("");
    }
  }

  if (!data?.activity) {
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
          style={waitingTextStyle}
        >
          {waitingText}
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
  const completion =
    completed[item.id];

  const isCompleted =
    Boolean(completion);

  const isEditing =
    editingId === item.id;

  const responseValue =
    responses[item.id] ??
    completion?.responseText ??
    "";

  return (
    <div
      key={item.id}
      className="w-full p-3 text-left"
      style={{
        ...itemStyle,
        ...(isCompleted
          ? completedItemStyle
          : {}),
      }}
    >
      <button
        type="button"
        disabled={Boolean(submittingId)}
        onClick={() => {
          setResponses((current) => ({
            ...current,
            [item.id]:
              current[item.id] ??
              completion?.responseText ??
              "",
          }));

          setEditingId(
            isEditing ? "" : item.id,
          );

          setError("");
        }}
        className="block w-full text-left disabled:cursor-default"
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
            style={itemDescriptionStyle}
          >
            {item.description}
          </div>
        ) : null}

        {isCompleted && !isEditing ? (
          <div
            className="mt-2 text-sm"
            style={completedLabelStyle}
          >
            {completedLabel}
          </div>
        ) : null}
      </button>

      {isEditing ? (
        <div className="mt-3">
          <input
            type="text"
            value={responseValue}
            placeholder={responsePlaceholder}
            disabled={
              submittingId === item.id
            }
            onChange={(event) =>
              setResponses(
                (current) => ({
                  ...current,
                  [item.id]:
                    event.target.value,
                }),
              )
            }
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 disabled:opacity-50"
          />

          <button
            type="button"
            disabled={
              submittingId === item.id
            }
            onClick={() =>
              void complete(
                item.id,
                responseValue,
              )
            }
            className="mt-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submittingId === item.id
              ? "Saving..."
              : isCompleted
                ? "Update"
                : "Complete"}
          </button>
        </div>
      ) : null}
    </div>
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