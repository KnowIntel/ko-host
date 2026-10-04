"use client";

import {
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

import { useLiveRuntime } from "@/components/live/LiveRuntimeContext";

type LiveJoinExperienceProps = {
  heading?: string;
  helperText?: string;
  namePlaceholder?: string;
  joinButtonLabel?: string;
  connectedLabel?: string;
  leaveButtonLabel?: string;

  headingStyle?: CSSProperties;
  helperTextStyle?: CSSProperties;
  namePlaceholderStyle?: CSSProperties;
  joinButtonTextStyle?: CSSProperties;
  connectedLabelStyle?: CSSProperties;
  participantNameStyle?: CSSProperties;
  connectedMessageStyle?: CSSProperties;
  leaveButtonTextStyle?: CSSProperties;

  inputStyle?: CSSProperties;
  joinButtonStyle?: CSSProperties;
  leaveButtonStyle?: CSSProperties;
};

export default function LiveJoinExperience({
  heading = "Join Live Experience",
  helperText = "Enter a display name to participate.",
  namePlaceholder = "Display name",
  joinButtonLabel = "Join Experience",
  connectedLabel = "Live Participant",
  leaveButtonLabel = "Leave Experience",
  headingStyle,
helperTextStyle,
namePlaceholderStyle,
joinButtonTextStyle,
connectedLabelStyle,
participantNameStyle,
connectedMessageStyle,
leaveButtonTextStyle,
inputStyle,
joinButtonStyle,
leaveButtonStyle,
}: LiveJoinExperienceProps) {
const {
  experience,
  participant,
  authenticated,
  sharedState,
  sessionLoading,
  joining,
  leaving,
  joinError,
  joinExperience,
  leaveExperience,
} = useLiveRuntime();

  const [displayName, setDisplayName] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const joined =
      await joinExperience(displayName);

    if (joined) {
      setDisplayName("");
    }
  }

  if (!experience) {
    return null;
  }

  if (sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="text-center text-sm opacity-70">
          Loading Live experience...
        </div>
      </div>
    );
  }

if (authenticated && participant) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
      <div>
        <div
          className="text-xs font-medium uppercase tracking-wide opacity-60"
          style={connectedLabelStyle}
        >
          {connectedLabel}
        </div>

        <div
          className="mt-1 text-xl font-semibold"
          style={participantNameStyle}
        >
          {participant.displayName}
        </div>
      </div>

      <div
        className="text-sm opacity-70"
        style={connectedMessageStyle}
      >
        You&apos;re connected to{" "}
        {experience.name}.
      </div>

{typeof sharedState?.state?.message === "string" ? (
  <div className="text-sm font-medium">
    {sharedState.state.message}
  </div>
) : null}

{typeof sharedState?.state?.testValue === "number" ? (
  <div className="text-xs opacity-60">
    Test value: {sharedState.state.testValue}
  </div>
) : null}

      <button
        type="button"
        disabled={leaving}
        onClick={() => {
          void leaveExperience();
        }}
        className="rounded-lg border border-current px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          ...(leaveButtonStyle ?? {}),
          ...(leaveButtonTextStyle ?? {}),
        }}
      >
        {leaving ? "Leaving..." : leaveButtonLabel}
      </button>
    </div>
  );
}

return (
  <div className="flex h-full w-full flex-col items-center justify-center">
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm"
    >
      <div className="text-center">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading}
        </div>

        <div
          className="mt-1 whitespace-pre-wrap text-sm opacity-70"
          style={helperTextStyle}
        >
          {helperText}
        </div>
      </div>

      <input
        type="text"
        value={displayName}
        maxLength={50}
        autoComplete="off"
        disabled={joining}
        onChange={(event) =>
          setDisplayName(event.target.value)
        }
        placeholder={namePlaceholder}
        className="mt-4 w-full rounded-lg border border-current/20 bg-transparent px-3 py-2 outline-none"
        style={{
          ...(inputStyle ?? {}),
          ...(namePlaceholderStyle ?? {}),
        }}
      />

      {joinError ? (
        <div className="mt-2 text-sm text-red-600">
          {joinError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          joining ||
          !displayName.trim()
        }
        className="mt-3 w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          ...(joinButtonStyle ?? {}),
          ...(joinButtonTextStyle ?? {}),
        }}
      >
        {joining
          ? "Joining..."
          : joinButtonLabel}
      </button>
    </form>
  </div>
);
}