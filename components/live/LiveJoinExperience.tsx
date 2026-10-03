"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { useLiveRuntime } from "@/components/live/LiveRuntimeContext";

export default function LiveJoinExperience() {
  const {
    experience,
    participant,
    authenticated,
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
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide opacity-60">
            Live Participant
          </div>

          <div className="mt-1 text-xl font-semibold">
            {participant.displayName}
          </div>
        </div>

        <div className="text-sm opacity-70">
          You&apos;re connected to{" "}
          {experience.name}.
        </div>

        <button
          type="button"
          disabled={leaving}
          onClick={() => {
            void leaveExperience();
          }}
          className="rounded-lg border border-current px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {leaving
            ? "Leaving..."
            : "Leave Experience"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm"
      >
        <div className="text-center">
          <div className="text-xl font-semibold">
            Join {experience.name}
          </div>

          <div className="mt-1 text-sm opacity-70">
            Enter a display name to participate.
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
          placeholder="Display name"
          className="mt-4 w-full rounded-lg border border-current/20 bg-transparent px-3 py-2 outline-none"
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
        >
          {joining
            ? "Joining..."
            : "Join Experience"}
        </button>
      </form>
    </div>
  );
}