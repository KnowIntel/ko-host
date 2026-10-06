"use client";

import type { CSSProperties } from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type Announcement = {
  id: string;
  title: string | null;
  message: string;
  publishedAt: string;
};

type Response = {
  ok: boolean;
  announcements?: Announcement[];
};

type Props = {
  heading: string;
  emptyText: string;
  latestLabel: string;
  showTimestamp: boolean;

  headingStyle?: CSSProperties;
  emptyTextStyle?: CSSProperties;
  latestLabelStyle?: CSSProperties;
  announcementTitleStyle?: CSSProperties;
  announcementTextStyle?: CSSProperties;
  timestampStyle?: CSSProperties;

  announcementStyle?: CSSProperties;
};

export default function LiveAnnouncement({
  heading,
  emptyText,
  latestLabel,
  showTimestamp,
  headingStyle,
  emptyTextStyle,
  latestLabelStyle,
  announcementTitleStyle,
  announcementTextStyle,
  timestampStyle,
  announcementStyle,
}: Props) {
  const { data, loading } =
    useLiveEndpoint<Response>(
      "announcements",
    );

  const announcements =
    data?.announcements ?? [];

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div
        className="text-xl font-semibold"
        style={headingStyle}
      >
        {heading}
      </div>

      {!loading &&
      announcements.length === 0 ? (
        <div
          className="mt-4"
          style={emptyTextStyle}
        >
          {emptyText}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {announcements.map(
          (announcement, index) => (
            <div
              key={announcement.id}
              className="p-4"
              style={announcementStyle}
            >
              {index === 0 ? (
                <div
                  className="mb-1 text-sm"
                  style={
                    latestLabelStyle
                  }
                >
                  {latestLabel}
                </div>
              ) : null}

              {announcement.title ? (
                <div
                  className="font-semibold"
                  style={
                    announcementTitleStyle
                  }
                >
                  {announcement.title}
                </div>
              ) : null}

              <div
                className="whitespace-pre-wrap"
                style={
                  announcementTextStyle
                }
              >
                {announcement.message}
              </div>

              {showTimestamp ? (
                <div
                  className="mt-2 text-xs"
                  style={timestampStyle}
                >
                  {new Date(
                    announcement.publishedAt,
                  ).toLocaleString()}
                </div>
              ) : null}
            </div>
          ),
        )}
      </div>
    </div>
  );
}