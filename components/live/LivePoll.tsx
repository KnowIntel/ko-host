"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

import { useLiveRuntime } from "@/components/live/LiveRuntimeContext";

type PollChoice = {
  id: string;
  label: string;
};

type PollQuestion = {
  id: string;
  question: string;
  choices: PollChoice[];
};

type PollResultChoice = {
  id: string;
  label: string;
  votes: number;
  percentage: number;
};

type PollRuntimeData = {
  ok: boolean;
  authenticated?: boolean;
  active?: boolean;

  activity?: {
    id: string;
    name: string;
    status: string;
    question: PollQuestion | null;
  } | null;

  participantState?: {
    votes?: Record<
      string,
      {
        choiceId?: string;
        votedAt?: string;
      }
    >;
    lastVotedQuestionId?: string | null;
    updatedAt?: string | null;
  } | null;

  results?: {
    questionId: string;
    totalVotes: number;
    choices: PollResultChoice[];
  } | null;

  error?: string;
};

type LivePollProps = {
  heading: string;
  waitingText: string;
  joinRequiredText: string;
  submitButtonLabel: string;
  votedLabel: string;
  resultsHeading: string;
  showResults: boolean;

  headingStyle?: CSSProperties;
  waitingTextStyle?: CSSProperties;
  joinRequiredTextStyle?: CSSProperties;
  questionStyle?: CSSProperties;
  choiceTextStyle?: CSSProperties;
  submitButtonTextStyle?: CSSProperties;
  votedLabelStyle?: CSSProperties;
  resultsHeadingStyle?: CSSProperties;
  resultsTextStyle?: CSSProperties;

  choiceStyle?: CSSProperties;
  selectedChoiceStyle?: CSSProperties;
  submitButtonStyle?: CSSProperties;
  resultsStyle?: CSSProperties;
};

export default function LivePoll({
  heading,
  waitingText,
  joinRequiredText,
  submitButtonLabel,
  votedLabel,
  resultsHeading,
  showResults,

  headingStyle,
  waitingTextStyle,
  joinRequiredTextStyle,
  questionStyle,
  choiceTextStyle,
  submitButtonTextStyle,
  votedLabelStyle,
  resultsHeadingStyle,
  resultsTextStyle,

  choiceStyle,
  selectedChoiceStyle,
  submitButtonStyle,
  resultsStyle,
}: LivePollProps) {
const {
  experience,
  authenticated,
  participant,
  sharedState,
  realtimeRevision,
  sessionLoading,
} = useLiveRuntime();

  const [runtimeData, setRuntimeData] =
    useState<PollRuntimeData | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [selectedChoiceId, setSelectedChoiceId] =
    useState("");

  const [error, setError] =
    useState("");

  const experienceId =
    experience?.id ?? null;

  const experienceStatus =
    experience?.status ?? null;

  const currentActivityType =
    sharedState?.currentActivityType ?? null;

  const currentActivityId =
    sharedState?.currentActivityId ?? null;

  const currentQuestionId =
    typeof sharedState?.state?.currentQuestionId ===
    "string"
      ? sharedState.state.currentQuestionId
      : null;

  const refreshPoll =
    useCallback(async () => {
      if (
        !experienceId ||
        !authenticated
      ) {
        setRuntimeData(null);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `/api/live/${experienceId}/poll`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const payload =
          (await response.json()) as PollRuntimeData;

        if (!response.ok || !payload.ok) {
          throw new Error(
            payload.error ||
              "Unable to load Poll.",
          );
        }

        setRuntimeData(payload);
        setError("");
      } catch (refreshError) {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : "Unable to load Poll.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      experienceId,
      authenticated,
    ]);

  /*
   * Refetch whenever the authoritative
   * shared Live state changes.
   *
   * LiveRuntimeContext already listens
   * to the shared-state Broadcast.
   */
useEffect(() => {
  void refreshPoll();
}, [
  refreshPoll,
  realtimeRevision,
  currentActivityType,
  currentActivityId,
  currentQuestionId,
  sharedState?.updatedAt,
]);

  const question =
    runtimeData?.activity?.question ??
    null;

  const existingVote =
    useMemo(() => {
      if (!question) {
        return null;
      }

      return (
        runtimeData?.participantState
          ?.votes?.[question.id] ?? null
      );
    }, [
      runtimeData?.participantState,
      question,
    ]);

  const submittedChoiceId =
    typeof existingVote?.choiceId ===
    "string"
      ? existingVote.choiceId
      : "";

  /*
   * Keep the selected choice synchronized
   * when the host changes questions.
   */
  useEffect(() => {
    if (!question) {
      setSelectedChoiceId("");
      return;
    }

    setSelectedChoiceId(
      submittedChoiceId || "",
    );
  }, [
    question?.id,
    submittedChoiceId,
  ]);

  const canSubmit =
    Boolean(
      experienceId &&
        authenticated &&
        participant &&
        experienceStatus === "live" &&
        runtimeData?.active &&
        question &&
        selectedChoiceId &&
        !submittedChoiceId &&
        !submitting,
    );

  async function submitVote() {
    if (
      !experienceId ||
      !question ||
      !selectedChoiceId ||
      submittedChoiceId ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/live/${experienceId}/poll/vote`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            questionId: question.id,
            choiceId:
              selectedChoiceId,
          }),
        },
      );

      const payload =
        (await response.json()) as {
          ok?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !payload.ok
      ) {
        throw new Error(
          payload.error ||
            "Unable to submit vote.",
        );
      }

      await refreshPoll();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit vote.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getLifecycleMessage() {
    switch (experienceStatus) {
      case "before":
        return "The Live experience has not started yet.";

      case "paused":
        return "The Live experience is paused.";

      case "ended":
        return "The Live experience has ended.";

      case "after":
        return "This Live experience is in Post-Event mode.";

      default:
        return waitingText;
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
            {heading}
          </div>

          <div
            className="mt-4"
            style={waitingTextStyle}
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (
    !experience ||
    !experience.isEnabled
  ) {
    return (
      <div className="h-full w-full overflow-auto p-4">
        <div className="mx-auto w-full max-w-xl">
          <div
            className="text-xl font-semibold"
            style={headingStyle}
          >
            {heading}
          </div>

          <div
            className="mt-4"
            style={waitingTextStyle}
          >
            {waitingText}
          </div>
        </div>
      </div>
    );
  }

  if (
    !authenticated ||
    !participant
  ) {
    return (
      <div className="h-full w-full overflow-auto p-4">
        <div className="mx-auto w-full max-w-xl">
          <div
            className="text-xl font-semibold"
            style={headingStyle}
          >
            {heading}
          </div>

          <div
            className="mt-4"
            style={joinRequiredTextStyle}
          >
            {joinRequiredText}
          </div>
        </div>
      </div>
    );
  }

  if (
    experienceStatus !== "live"
  ) {
    return (
      <div className="h-full w-full overflow-auto p-4">
        <div className="mx-auto w-full max-w-xl">
          <div
            className="text-xl font-semibold"
            style={headingStyle}
          >
            {heading}
          </div>

          <div
            className="mt-4"
            style={waitingTextStyle}
          >
            {getLifecycleMessage()}
          </div>
        </div>
      </div>
    );
  }

  if (
    currentActivityType !== "poll" ||
    !currentActivityId ||
    !runtimeData?.active ||
    !question
  ) {
    return (
      <div className="h-full w-full overflow-auto p-4">
        <div className="mx-auto w-full max-w-xl">
          <div
            className="text-xl font-semibold"
            style={headingStyle}
          >
            {heading}
          </div>

          <div
            className="mt-4"
            style={waitingTextStyle}
          >
            {loading
              ? "Loading..."
              : waitingText}
          </div>

          {error ? (
            <div className="mt-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
        </div>
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
          {heading}
        </div>

        <div
          className="mt-4 text-lg font-semibold"
          style={questionStyle}
        >
          {question.question}
        </div>

        <div className="mt-4 space-y-2">
          {question.choices.map(
            (choice) => {
              const isSelected =
                selectedChoiceId ===
                choice.id;

              const isSubmitted =
                Boolean(
                  submittedChoiceId,
                );

              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => {
                    if (!isSubmitted) {
                      setSelectedChoiceId(
                        choice.id,
                      );
                    }
                  }}
                  className="block w-full px-3 py-3 text-left disabled:cursor-default"
                  style={{
                    ...(choiceStyle ??
                      {}),

                    ...(isSelected
                      ? selectedChoiceStyle ??
                        {}
                      : {}),

                    ...(choiceTextStyle ??
                      {}),
                  }}
                >
                  {choice.label}
                </button>
              );
            },
          )}
        </div>

        {!submittedChoiceId ? (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              void submitVote()
            }
            className="mt-4 w-full px-4 py-3 text-center disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              ...(submitButtonStyle ??
                {}),
              ...(submitButtonTextStyle ??
                {}),
            }}
          >
            {submitting
              ? "Submitting..."
              : submitButtonLabel}
          </button>
        ) : (
          <div
            className="mt-4 text-center"
            style={votedLabelStyle}
          >
            {votedLabel}
          </div>
        )}

        {error ? (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {showResults &&
        runtimeData.results?.questionId ===
          question.id ? (
          <div
            className="mt-5 p-3"
            style={resultsStyle}
          >
            <div
              className="font-semibold"
              style={resultsHeadingStyle}
            >
              {resultsHeading}
            </div>

            <div className="mt-3 space-y-3">
              {runtimeData.results.choices.map(
                (result) => (
                  <div
                    key={result.id}
                    style={resultsTextStyle}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        {result.label}
                      </span>

                      <span>
                        {result.percentage}% (
                        {result.votes})
                      </span>
                    </div>

                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-current opacity-40"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              result.percentage,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            <div
              className="mt-3 text-xs opacity-70"
              style={resultsTextStyle}
            >
              {runtimeData.results
                .totalVotes}{" "}
              {runtimeData.results
                .totalVotes === 1
                ? "vote"
                : "votes"}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}