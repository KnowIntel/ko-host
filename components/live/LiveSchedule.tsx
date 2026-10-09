"use client";

import type { CSSProperties } from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type ScheduleEntry = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
};

type Response = {
  ok: boolean;
  entries?: ScheduleEntry[];
};

type Props = {
  heading: string;
  emptyText: string;
  currentLabel: string;
  upcomingLabel: string;
  completedLabel: string;
  showTimes: boolean;
  showDescriptions: boolean;
  showStatuses: boolean;

  headingStyle?: CSSProperties;
  timeStyle?: CSSProperties;
  titleStyle?: CSSProperties;
  descriptionStyle?: CSSProperties;
  statusStyle?: CSSProperties;
  emptyTextStyle?: CSSProperties;
  itemStyle?: CSSProperties;
  currentItemStyle?: CSSProperties;
};

function formatTime(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LiveSchedule({
  heading,
  emptyText,
  currentLabel,
  upcomingLabel,
  completedLabel,
  showTimes,
  showDescriptions,
  showStatuses,
  headingStyle,
  timeStyle,
  titleStyle,
  descriptionStyle,
  statusStyle,
  emptyTextStyle,
  itemStyle,
  currentItemStyle,
}: Props) {
  const { data, loading } =
    useLiveEndpoint<Response>(
      "schedule",
    );

  const entries =
    data?.entries ?? [];

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div
        className="text-xl font-semibold"
        style={headingStyle}
      >
        {heading}
      </div>

      {!loading &&
      entries.length === 0 ? (
        <div
          className="mt-2"
          style={emptyTextStyle}
        >
          {emptyText}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {entries.map((entry) => {
          const isCurrent =
            entry.status === "current";

          const statusLabel =
            entry.status === "current"
              ? currentLabel
              : entry.status ===
                  "completed"
                ? completedLabel
                : upcomingLabel;

          return (
            <div
              key={entry.id}
              className="p-3"
              style={{
                ...itemStyle,
                ...(isCurrent
                  ? currentItemStyle
                  : {}),
              }}
            >
              {showTimes &&
              entry.startsAt ? (
                <div
                  className="text-sm"
                  style={timeStyle}
                >
                  {formatTime(
                    entry.startsAt,
                  )}
                </div>
              ) : null}

              <div
                className="font-semibold"
                style={titleStyle}
              >
                {entry.title}
              </div>

              {showDescriptions &&
              entry.description ? (
                <div
                  className="mt-1"
                  style={
                    descriptionStyle
                  }
                >
                  {entry.description}
                </div>
              ) : null}

              {showStatuses ? (
                <div
                  className="mt-2 text-sm"
                  style={statusStyle}
                >
                  {statusLabel}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}