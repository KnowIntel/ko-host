// components\live\LiveTrivia.tsx

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

import { useLiveRuntime } from "@/components/live/LiveRuntimeContext";

type TriviaChoice = {
  id: string;
  label: string;
};

type TriviaQuestion = {
  id: string;
  question: string;
  choices: TriviaChoice[];
  points: number;
};

type LeaderboardEntry = {
  participantId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  rank: number;
};

type TriviaRuntimeData = {
  ok: boolean;
  authenticated?: boolean;
  active?: boolean;

  activity?: {
    id: string;
    name: string;
    status: string;
    question: TriviaQuestion | null;
    updatedAt: string | null;
  } | null;

  participantState?: {
    answers?: Record<
      string,
      {
        choiceId?: string;
        correct?: boolean;
        awardedPoints?: number;
        answeredAt?: string;
      }
    >;
    lastAnsweredQuestionId?: string;
    completedAt?: string | null;
    updatedAt?: string | null;
  } | null;

  participant?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    score: number;
    rank: number | null;
  } | null;

  leaderboard?: LeaderboardEntry[];

  error?: string;
};

type LiveTriviaProps = {
  heading: string;
  waitingText: string;
  joinRequiredText: string;
  submitButtonLabel: string;
  correctLabel: string;
  incorrectLabel: string;
  answeredLabel: string;
  leaderboardHeading: string;
  showLeaderboard: boolean;

  headingStyle?: CSSProperties;
  waitingTextStyle?: CSSProperties;
  joinRequiredTextStyle?: CSSProperties;
  questionStyle?: CSSProperties;
  choiceTextStyle?: CSSProperties;
  submitButtonTextStyle?: CSSProperties;
  resultStyle?: CSSProperties;
  scoreStyle?: CSSProperties;
  leaderboardHeadingStyle?: CSSProperties;
  leaderboardTextStyle?: CSSProperties;

  choiceStyle?: CSSProperties;
  selectedChoiceStyle?: CSSProperties;
  submitButtonStyle?: CSSProperties;
  leaderboardStyle?: CSSProperties;
};

export default function LiveTrivia({
  heading,
  waitingText,
  joinRequiredText,
  submitButtonLabel,
  correctLabel,
  incorrectLabel,
  answeredLabel,
  leaderboardHeading,
  showLeaderboard,

  headingStyle,
  waitingTextStyle,
  joinRequiredTextStyle,
  questionStyle,
  choiceTextStyle,
  submitButtonTextStyle,
  resultStyle,
  scoreStyle,
  leaderboardHeadingStyle,
  leaderboardTextStyle,

  choiceStyle,
  selectedChoiceStyle,
  submitButtonStyle,
  leaderboardStyle,
}: LiveTriviaProps) {
const {
  experience,
  authenticated,
  participant,
  sharedState,
  realtimeRevision,
  sessionLoading,
} = useLiveRuntime();

  const [runtimeData, setRuntimeData] =
    useState<TriviaRuntimeData | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [selectedChoiceId, setSelectedChoiceId] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const loadTrivia = useCallback(async () => {
    if (!experience?.id || !authenticated) {
      setRuntimeData(null);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/live/${experience.id}/trivia`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const payload =
        (await response.json()) as TriviaRuntimeData;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.error ||
            "Unable to load Live Trivia.",
        );
      }

      setRuntimeData(payload);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load Live Trivia.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    experience?.id,
    authenticated,
  ]);

  /*
   * Initial load and every authoritative
   * shared-state refresh.
   *
   * LiveRuntimeContext already receives the
   * Supabase Broadcast and refreshes
   * sharedState, so the activity surface only
   * needs to react to that state changing.
   */
useEffect(() => {
  void loadTrivia();
}, [
  loadTrivia,
  realtimeRevision,
  sharedState?.updatedAt,
  sharedState?.currentActivityId,
  sharedState?.currentActivityType,
]);

  const question =
    runtimeData?.activity?.question ?? null;

  const answers =
    runtimeData?.participantState?.answers ??
    {};

  const submittedAnswer = question
    ? answers[question.id]
    : undefined;

  /*
   * Reset the local choice when the host
   * advances to another question.
   */
  useEffect(() => {
    if (!question?.id) {
      setSelectedChoiceId("");
      return;
    }

    setSelectedChoiceId(
      submittedAnswer?.choiceId ?? "",
    );
  }, [
    question?.id,
    submittedAnswer?.choiceId,
  ]);

  const leaderboard =
    runtimeData?.leaderboard ?? [];

  const participantScore =
    runtimeData?.participant?.score ?? 0;

  const participantRank =
    runtimeData?.participant?.rank ?? null;

  const canSubmit =
    experience?.status === "live" &&
    Boolean(question) &&
    Boolean(selectedChoiceId) &&
    !submittedAnswer &&
    !submitting;

  const resultText = useMemo(() => {
    if (!submittedAnswer) {
      return "";
    }

    if (submittedAnswer.correct === true) {
      return correctLabel || "Correct!";
    }

    if (submittedAnswer.correct === false) {
      return incorrectLabel || "Not quite!";
    }

    return answeredLabel || "Answer submitted";
  }, [
    submittedAnswer,
    correctLabel,
    incorrectLabel,
    answeredLabel,
  ]);

  async function submitAnswer() {
    if (
      !experience?.id ||
      !question ||
      !selectedChoiceId ||
      submittedAnswer ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/live/${experience.id}/trivia/answer`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            questionId: question.id,
            choiceId: selectedChoiceId,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        /*
         * A duplicate means another request
         * already committed the answer.
         * Refresh so the UI reflects the
         * authoritative server state.
         */
        if (payload?.duplicate === true) {
          await loadTrivia();
          return;
        }

        throw new Error(
          payload?.error ||
            "Unable to submit Trivia answer.",
        );
      }

      /*
       * Do not manufacture score/progress
       * locally. Reload the server-authoritative
       * participant state and ledger score.
       */
      await loadTrivia();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit Trivia answer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionLoading) {
    return (
      <div className="h-full w-full overflow-auto p-4">
        <div className="mx-auto w-full max-w-xl">
          <div
            className="text-xl font-semibold"
            style={headingStyle}
          >
            {heading || "Live Trivia"}
          </div>

          <div
            className="mt-2 text-center text-sm opacity-70"
            style={waitingTextStyle}
          >
            Loading Live experience...
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="h-full w-full overflow-auto p-4">
        <div className="mx-auto w-full max-w-xl">
          <div
            className="text-xl font-semibold"
            style={headingStyle}
          >
            {heading || "Live Trivia"}
          </div>

          <div
            className="mt-2 text-center text-sm opacity-70"
            style={waitingTextStyle}
          >
            {waitingText ||
              "Waiting for the next question..."}
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated || !participant) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-start overflow-auto p-4">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading || "Live Trivia"}
        </div>

        <div
          className="mt-2 text-center text-sm opacity-70"
          style={joinRequiredTextStyle}
        >
          {joinRequiredText ||
            "Join the Live experience to play."}
        </div>
      </div>
    );
  }

  /*
   * Experience lifecycle controls participant interaction.
   *
   * Participants may remain joined throughout the full
   * experience, but Trivia is only interactive while the
   * experience itself is Live.
   */

  if (experience.status === "before") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-start overflow-auto p-4">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading || "Live Trivia"}
        </div>

        <div
          className="mt-2 text-center text-sm opacity-70"
          style={waitingTextStyle}
        >
          The Live experience has not started yet.
        </div>
      </div>
    );
  }

  if (experience.status === "paused") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-start overflow-auto p-4">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading || "Live Trivia"}
        </div>

        <div
          className="mt-2 text-center text-sm opacity-70"
          style={waitingTextStyle}
        >
          The host has paused the Live experience.
        </div>
      </div>
    );
  }

  if (experience.status === "ended") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-start overflow-auto p-4">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading || "Live Trivia"}
        </div>

        <div
          className="mt-2 text-center text-sm opacity-70"
          style={waitingTextStyle}
        >
          This Live experience has ended.
        </div>
      </div>
    );
  }

  if (experience.status === "after") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-start overflow-auto p-4">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading || "Live Trivia"}
        </div>

        <div
          className="mt-2 text-center text-sm opacity-70"
          style={waitingTextStyle}
        >
          The Live experience is now in Post-Event.
        </div>
      </div>
    );
  }

  if (loading && !runtimeData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-start overflow-auto p-4">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading || "Live Trivia"}
        </div>

        <div
          className="mt-2 text-center text-sm opacity-70"
          style={waitingTextStyle}
        >
          Loading Trivia...
        </div>
      </div>
    );
  }

  if (
    !runtimeData?.active ||
    !question
  ) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-start overflow-auto p-4">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading || "Live Trivia"}
        </div>

        <div
          className="mt-2 text-center text-sm opacity-70"
          style={waitingTextStyle}
        >
          {waitingText ||
            "Waiting for the next question..."}
        </div>

        {error ? (
          <div className="mt-3 text-center text-xs text-red-600">
            {error}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div className="mx-auto w-full max-w-xl">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading || "Live Trivia"}
        </div>

        <div
          className="mt-4 text-lg font-semibold"
          style={questionStyle}
        >
          {question.question}
        </div>

        <div className="mt-4 space-y-2">
          {question.choices.map((choice) => {
            const selected =
              selectedChoiceId === choice.id;

            return (
              <button
                key={choice.id}
                type="button"
                disabled={Boolean(
                  submittedAnswer,
                )}
                onClick={() => {
                  if (!submittedAnswer) {
                    setSelectedChoiceId(
                      choice.id,
                    );
                  }
                }}
                className="block w-full px-3 py-3 text-left disabled:cursor-default"
                style={{
                  ...(choiceStyle ?? {}),
                  ...(selected
                    ? selectedChoiceStyle ?? {}
                    : {}),
                  ...(choiceTextStyle ?? {}),
                }}
              >
                {choice.label}
              </button>
            );
          })}
        </div>

        {!submittedAnswer ? (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              void submitAnswer();
            }}
            className="mt-4 w-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              ...(submitButtonStyle ?? {}),
              ...(submitButtonTextStyle ?? {}),
            }}
          >
            {submitting
              ? "Submitting..."
              : submitButtonLabel ||
                "Submit Answer"}
          </button>
        ) : (
          <div
            className="mt-4 text-center font-semibold"
            style={resultStyle}
          >
            {resultText}

            {submittedAnswer.awardedPoints ? (
              <span>
                {" "}
                +{submittedAnswer.awardedPoints}
              </span>
            ) : null}
          </div>
        )}

        <div
          className="mt-3 text-center text-sm"
          style={scoreStyle}
        >
          Score: {participantScore}
          {participantRank !== null
            ? ` • Rank #${participantRank}`
            : ""}
        </div>

        {error ? (
          <div className="mt-3 text-center text-xs text-red-600">
            {error}
          </div>
        ) : null}

        {showLeaderboard ? (
          <div
            className="mt-5 p-3"
            style={leaderboardStyle}
          >
            <div
              className="font-semibold"
              style={
                leaderboardHeadingStyle
              }
            >
              {leaderboardHeading ||
                "Leaderboard"}
            </div>

            <div className="mt-2 space-y-1">
              {leaderboard.length === 0 ? (
                <div
                  className="text-sm opacity-60"
                  style={
                    leaderboardTextStyle
                  }
                >
                  No scores yet.
                </div>
              ) : (
                leaderboard.map((entry) => (
                  <div
                    key={entry.participantId}
                    className="flex items-center justify-between gap-3"
                    style={
                      leaderboardTextStyle
                    }
                  >
                    <div className="min-w-0 truncate">
                      #{entry.rank}{" "}
                      {entry.displayName}
                    </div>

                    <div className="shrink-0 font-semibold">
                      {entry.score}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}