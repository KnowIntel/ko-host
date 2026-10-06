"use client";

import {
  useState,
  type CSSProperties,
} from "react";

import { useLiveEndpoint } from "@/components/live/useLiveEndpoint";

type QueueItem = {
  id: string;
  songTitle: string;
  artistName: string | null;
  status: string;
  requestedByCurrentParticipant: boolean;
};

type Response = {
  ok: boolean;
  queue?: QueueItem[];
};

type Props = {
  heading: string;
  helperText: string;
  joinRequiredText: string;
  songPlaceholder: string;
  artistPlaceholder: string;
  submitButtonLabel: string;
  submittedLabel: string;
  queueHeading: string;
  showQueue: boolean;

  headingStyle?: CSSProperties;
  helperTextStyle?: CSSProperties;
  joinRequiredTextStyle?: CSSProperties;
  inputTextStyle?: CSSProperties;
  submitButtonTextStyle?: CSSProperties;
  submittedLabelStyle?: CSSProperties;
  queueHeadingStyle?: CSSProperties;
  queueTextStyle?: CSSProperties;

  inputStyle?: CSSProperties;
  submitButtonStyle?: CSSProperties;
  queueStyle?: CSSProperties;
};

export default function LiveSongRequest({
  heading,
  helperText,
  joinRequiredText,
  songPlaceholder,
  artistPlaceholder,
  submitButtonLabel,
  submittedLabel,
  queueHeading,
  showQueue,
  headingStyle,
  helperTextStyle,
  joinRequiredTextStyle,
  inputTextStyle,
  submitButtonTextStyle,
  submittedLabelStyle,
  queueHeadingStyle,
  queueTextStyle,
  inputStyle,
  submitButtonStyle,
  queueStyle,
}: Props) {
  const {
    data,
    authenticated,
    experienceId,
    refresh,
  } =
    useLiveEndpoint<Response>(
      "song-request",
    );

  const [songTitle, setSongTitle] =
    useState("");

  const [artistName, setArtistName] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit() {
    if (
      !experienceId ||
      !songTitle.trim() ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/live/${encodeURIComponent(
          experienceId,
        )}/song-request`,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            songTitle,
            artistName,
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
            "Unable to submit request.",
        );
        return;
      }

      setSongTitle("");
      setArtistName("");
      setSubmitted(true);

      await refresh();
    } finally {
      setSubmitting(false);
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

  return (
    <div className="h-full w-full overflow-auto p-4">
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

      <input
        value={songTitle}
        onChange={(event) => {
          setSongTitle(
            event.target.value,
          );
          setSubmitted(false);
        }}
        placeholder={songPlaceholder}
        className="mt-4 w-full px-3 py-2"
        style={{
          ...inputStyle,
          ...inputTextStyle,
        }}
      />

      <input
        value={artistName}
        onChange={(event) =>
          setArtistName(
            event.target.value,
          )
        }
        placeholder={artistPlaceholder}
        className="mt-2 w-full px-3 py-2"
        style={{
          ...inputStyle,
          ...inputTextStyle,
        }}
      />

      <button
        type="button"
        disabled={
          submitting ||
          !songTitle.trim()
        }
        onClick={() => void submit()}
        className="mt-3 w-full px-4 py-3 disabled:opacity-50"
        style={{
          ...submitButtonStyle,
          ...submitButtonTextStyle,
        }}
      >
        {submitting
          ? "Submitting..."
          : submitButtonLabel}
      </button>

      {submitted ? (
        <div
          className="mt-2 text-center"
          style={submittedLabelStyle}
        >
          {submittedLabel}
        </div>
      ) : null}

      {error ? (
        <div className="mt-2 text-sm">
          {error}
        </div>
      ) : null}

      {showQueue ? (
        <div
          className="mt-5 p-3"
          style={queueStyle}
        >
          <div
            className="font-semibold"
            style={queueHeadingStyle}
          >
            {queueHeading}
          </div>

          <div className="mt-2 space-y-2">
            {(data?.queue ?? []).map(
              (item) => (
                <div
                  key={item.id}
                  style={queueTextStyle}
                >
                  {item.songTitle}
                  {item.artistName
                    ? ` — ${item.artistName}`
                    : ""}
                </div>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}