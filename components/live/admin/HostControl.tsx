"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@supabase/supabase-js";

type ActivityChoice = {
  id: string;
  label: string;
};

type HostTriviaQuestion = {
  id: string;
  question: string;
  choices: ActivityChoice[];
  correctChoiceId: string;
  points: number;
  index: number;
};

type HostPollQuestion = {
  id: string;
  question: string;
  choices: ActivityChoice[];
  index: number;
};

type HostQuestion =
  | HostTriviaQuestion
  | HostPollQuestion;

type AnswerDistribution = {
  choiceId: string;
  label: string;
  count: number;
  percentage: number;
  isCorrect: boolean;
};

type VoteDistribution = {
  choiceId: string;
  label: string;
  count: number;
  percentage: number;
};

type TriviaParticipantResult = {
  participantId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  hasAnswered: boolean;
  choiceId: string | null;
  correct: boolean | null;
  awardedPoints: number | null;
  answeredAt: string | null;
};

type PollParticipantResult = {
  participantId: string;
  displayName: string;
  avatarUrl: string | null;
  hasVoted: boolean;
  choiceId: string | null;
  votedAt: string | null;
};

type LeaderboardEntry = {
  participantId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  lastSeenAt: string | null;
  rank: number;
};

type HostPayload = {
  ok: boolean;

  experience: {
    id: string;
    name: string;
    status: string;
    isEnabled: boolean;
    startedAt: string | null;
    endedAt: string | null;
    updatedAt: string;
  };

  sharedState: {
    currentActivityType: string | null;
    currentActivityId: string | null;

    state: {
      currentQuestionId?: string;
      [key: string]: unknown;
    };

    updatedAt: string | null;
  };

  participantCount: number;

  leaderboard: LeaderboardEntry[];

  activity: {
    id: string;
    activityType: string;
    name: string;
    status: string;
    scheduledFor: string | null;
    startedAt: string | null;
    completedAt: string | null;
    updatedAt: string;
  } | null;

  trivia: {
    questions: HostTriviaQuestion[];

    currentQuestion:
      | HostTriviaQuestion
      | null;

    results: {
      participantCount: number;
      answeredCount: number;
      unansweredCount: number;
      correctCount: number;
      incorrectCount: number;

      answerDistribution:
        AnswerDistribution[];

      participants:
        TriviaParticipantResult[];
    };
  } | null;

  poll: {
    questions: HostPollQuestion[];

    currentQuestion:
      | HostPollQuestion
      | null;

    results: {
      participantCount: number;
      votedCount: number;
      waitingCount: number;

      voteDistribution:
        VoteDistribution[];

      participants:
        PollParticipantResult[];
    };
  } | null;

  error?: string;
};

type Props = {
  micrositeId: string;
  experienceId: string;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "";

const supabaseAnonKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
);

function isTriviaQuestion(
  question: HostQuestion,
): question is HostTriviaQuestion {
  return (
    "correctChoiceId" in question &&
    "points" in question
  );
}

export default function HostControl({
  micrositeId,
  experienceId,
}: Props) {
  const [data, setData] =
    useState<HostPayload | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    changingQuestion,
    setChangingQuestion,
  ] = useState(false);

  const [
    showEndConfirm,
    setShowEndConfirm,
  ] = useState(false);

  const [
    changingLifecycle,
    setChangingLifecycle,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const loadHostState =
    useCallback(
      async ({
        showLoading = false,
      }: {
        showLoading?: boolean;
      } = {}) => {
        if (showLoading) {
          setLoading(true);
        }

        try {
          const response = await fetch(
            `/api/dashboard/microsites/${micrositeId}/live/host`,
            {
              method: "GET",
              cache: "no-store",
            },
          );

          const payload =
            await response.json();

          if (
            !response.ok ||
            !payload?.ok
          ) {
            throw new Error(
              payload?.error ||
                "Unable to load Host Control.",
            );
          }

          setData(payload);
          setError(null);
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load Host Control.",
          );
        } finally {
          if (showLoading) {
            setLoading(false);
          }
        }
      },
      [micrositeId],
    );

  useEffect(() => {
    void loadHostState({
      showLoading: true,
    });
  }, [loadHostState]);

  /*
   * Server APIs broadcast this event
   * whenever shared Live state changes
   * or a participant submits an
   * answer/vote.
   *
   * Broadcast contains no protected
   * results. Host Control refetches
   * authoritative server data.
   */
  useEffect(() => {
    if (!experienceId) {
      return;
    }

    const channel = supabase.channel(
      `live-experience-${experienceId}`,
    );

    channel.on(
      "broadcast",
      {
        event: "shared-state-changed",
      },
      () => {
        void loadHostState();
      },
    );

    void channel.subscribe();

    return () => {
      void supabase.removeChannel(
        channel,
      );
    };
  }, [
    experienceId,
    loadHostState,
  ]);

  const activityType =
    data?.activity?.activityType ??
    null;

  const trivia =
    data?.trivia ?? null;

  const poll =
    data?.poll ?? null;

  const questions: HostQuestion[] =
    useMemo(() => {
      if (activityType === "trivia") {
        return trivia?.questions ?? [];
      }

      if (activityType === "poll") {
        return poll?.questions ?? [];
      }

      return [];
    }, [
      activityType,
      trivia,
      poll,
    ]);

  const currentQuestion:
    | HostQuestion
    | null = useMemo(() => {
    if (activityType === "trivia") {
      return (
        trivia?.currentQuestion ?? null
      );
    }

    if (activityType === "poll") {
      return (
        poll?.currentQuestion ?? null
      );
    }

    return null;
  }, [
    activityType,
    trivia,
    poll,
  ]);

  const currentQuestionIndex =
    useMemo(() => {
      if (!currentQuestion) {
        return -1;
      }

      return questions.findIndex(
        (question) =>
          question.id ===
          currentQuestion.id,
      );
    }, [
      currentQuestion,
      questions,
    ]);

  const previousQuestion =
    currentQuestionIndex > 0
      ? questions[
          currentQuestionIndex - 1
        ]
      : null;

  const nextQuestion =
    currentQuestionIndex >= 0 &&
    currentQuestionIndex <
      questions.length - 1
      ? questions[
          currentQuestionIndex + 1
        ]
      : null;

  function getExperienceStatusLabel(
    status: string,
  ) {
    switch (status) {
      case "before":
        return "Pre-Event";

      case "live":
        return "Live";

      case "paused":
        return "Paused";

      case "ended":
        return "Ended";

      case "after":
        return "Post-Event";

      default:
        return status;
    }
  }

  async function setExperienceStatus(
    status:
      | "before"
      | "live"
      | "paused"
      | "ended"
      | "after",
  ) {
    setChangingLifecycle(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/dashboard/microsites/${micrositeId}/live`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        },
      );

      const payload =
        await response.json();

      if (
        !response.ok ||
        !payload?.ok
      ) {
        throw new Error(
          payload?.error ||
            "Unable to update Live experience.",
        );
      }

      await loadHostState();

      const labels = {
        before:
          "Experience moved to Pre-Event.",

        live:
          "Experience is Live.",

        paused:
          "Experience paused.",

        ended:
          "Experience ended.",

        after:
          "Experience moved to Post-Event.",
      };

      setMessage(labels[status]);
    } catch (lifecycleError) {
      setError(
        lifecycleError instanceof Error
          ? lifecycleError.message
          : "Unable to update Live experience.",
      );
    } finally {
      setChangingLifecycle(false);
    }
  }

  async function setCurrentQuestion(
    questionId: string,
  ) {
    if (!data?.activity) {
      return;
    }

    const type =
      data.activity.activityType;

    if (
      type !== "trivia" &&
      type !== "poll"
    ) {
      return;
    }

    setChangingQuestion(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/dashboard/microsites/${micrositeId}/live/state`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentActivityType:
              type,

            currentActivityId:
              data.activity.id,

            state: {
              ...data.sharedState.state,

              currentQuestionId:
                questionId,
            },
          }),
        },
      );

      const payload =
        await response.json();

      if (
        !response.ok ||
        !payload?.ok
      ) {
        throw new Error(
          payload?.error ||
            "Unable to change the current question.",
        );
      }

      /*
       * Do not wait solely for our own
       * Broadcast event.
       */
      await loadHostState();

      setMessage(
        "Live question updated.",
      );
    } catch (questionError) {
      setError(
        questionError instanceof Error
          ? questionError.message
          : "Unable to change the current question.",
      );
    } finally {
      setChangingQuestion(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">
          Loading Host Control...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error ||
          "Unable to load Host Control."}
      </div>
    );
  }

  const isTrivia =
    data.activity?.activityType ===
    "trivia";

  const isPoll =
    data.activity?.activityType ===
    "poll";

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-600">
            Experience
          </div>

          <div className="mt-1 font-semibold">
            {data.experience.name}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-600">
            Status
          </div>

          <div className="mt-1 font-semibold">
            {getExperienceStatusLabel(
              data.experience.status,
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-600">
            Current activity
          </div>

          <div className="mt-1 font-semibold">
            {data.activity?.name ??
              "None"}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-600">
            Participants
          </div>

          <div className="mt-1 text-2xl font-semibold">
            {data.participantCount}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Experience Control
            </h2>

            <p className="mt-1 text-sm text-neutral-600">
              Control the overall Live
              experience lifecycle.
            </p>
          </div>

          <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            {getExperienceStatusLabel(
              data.experience.status,
            )}
          </div>
        </div>

<div className="mt-5 flex flex-wrap gap-2">
  <button
    type="button"
    disabled={
      changingLifecycle ||
      data.experience.status === "before"
    }
    onClick={() => {
      void setExperienceStatus("before");
    }}
    className="flex min-w-[92px] flex-col items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100"
  >
    <img
      src="/media-icons/arrow-left-thick.svg"
      alt=""
      aria-hidden="true"
      className="h-5 w-5 brightness-0 invert"
    />
    <span>Pre-Event</span>
  </button>

  <button
    type="button"
    disabled={
      changingLifecycle ||
      data.experience.status === "live"
    }
    onClick={() => {
      void setExperienceStatus("live");
    }}
    className="flex min-w-[92px] flex-col items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100"
  >
    <img
      src="/media-icons/icon-play.svg"
      alt=""
      aria-hidden="true"
      className="h-5 w-5 brightness-0 invert"
    />

    <span>
      {changingLifecycle
        ? "Updating..."
        : data.experience.status === "paused"
          ? "Resume Live"
          : "Go Live"}
    </span>
  </button>

  <button
    type="button"
    disabled={
      changingLifecycle ||
      data.experience.status !== "live"
    }
    onClick={() => {
      void setExperienceStatus("paused");
    }}
    className="flex min-w-[92px] flex-col items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100"
  >
    <img
      src="/media-icons/icon-pause.svg"
      alt=""
      aria-hidden="true"
      className="h-5 w-5 brightness-0 invert"
    />
    <span>Pause</span>
  </button>

  <button
    type="button"
    disabled={
      changingLifecycle ||
      data.experience.status === "ended"
    }
    onClick={() => {
      setShowEndConfirm(true);
    }}
    className="flex min-w-[92px] flex-col items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100"
  >
    <img
      src="/media-icons/icon-stop.svg"
      alt=""
      aria-hidden="true"
      className="h-5 w-5 brightness-0 invert"
    />
    <span>End</span>
  </button>

  <button
    type="button"
    disabled={
      changingLifecycle ||
      data.experience.status === "after"
    }
    onClick={() => {
      void setExperienceStatus("after");
    }}
    className="flex min-w-[92px] flex-col items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100"
  >
    <img
      src="/media-icons/arrow-right-thick.svg"
      alt=""
      aria-hidden="true"
      className="h-5 w-5 brightness-0 invert"
    />
    <span>Post-Event</span>
  </button>
</div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-semibold text-neutral-900">
              Pre-Event
            </div>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              Participants are arriving
              or waiting for the event to
              begin.
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-semibold text-neutral-900">
              Live
            </div>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              The event is underway and
              live activities are
              running.
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-semibold text-neutral-900">
              Paused
            </div>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              Temporarily pause the live
              experience. Resume when
              ready.
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-semibold text-neutral-900">
              Ended
            </div>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              The live portion of the
              event has finished.
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-semibold text-neutral-900">
              Post-Event
            </div>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              Show results, winners,
              photos, or other post-event
              content.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {message}
        </div>
      ) : null}

      {!data.activity ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            No current activity
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Select and activate an
            activity from Live Manager
            before opening Host Control.
          </p>
        </div>
      ) : !isTrivia && !isPoll ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            {data.activity.name}
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Host Control for this
            activity type will be added
            with its Live implementation.
          </p>
        </div>
      ) : !currentQuestion ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            No{" "}
            {isTrivia
              ? "Trivia"
              : "Poll"}{" "}
            question
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            This activity does not have a
            current{" "}
            {isTrivia
              ? "Trivia"
              : "Poll"}{" "}
            question.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-800">
                    LIVE
                  </span>

                  <span className="text-xs text-neutral-500">
                    Question{" "}
                    {currentQuestionIndex +
                      1}{" "}
                    of {questions.length}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold">
                  {
                    currentQuestion.question
                  }
                </h2>

                {isTrivia &&
                isTriviaQuestion(
                  currentQuestion,
                ) ? (
                  <div className="mt-2 text-sm text-neutral-600">
                    {
                      currentQuestion.points
                    }{" "}
                    points
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-neutral-600">
                    Live Poll
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    changingQuestion ||
                    !previousQuestion
                  }
                  onClick={() => {
                    if (
                      previousQuestion
                    ) {
                      void setCurrentQuestion(
                        previousQuestion.id,
                      );
                    }
                  }}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={
                    changingQuestion ||
                    !nextQuestion
                  }
                  onClick={() => {
                    if (nextQuestion) {
                      void setCurrentQuestion(
                        nextQuestion.id,
                      );
                    }
                  }}
                  className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {changingQuestion
                    ? "Updating..."
                    : "Next →"}
                </button>
              </div>
            </div>

            {isTrivia && trivia ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <MetricCard
                  label="Participants"
                  value={
                    trivia.results
                      .participantCount
                  }
                />

                <MetricCard
                  label="Answered"
                  value={
                    trivia.results
                      .answeredCount
                  }
                />

                <MetricCard
                  label="Correct"
                  value={
                    trivia.results
                      .correctCount
                  }
                />

                <MetricCard
                  label="Waiting"
                  value={
                    trivia.results
                      .unansweredCount
                  }
                />
              </div>
            ) : null}

            {isPoll && poll ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Participants"
                  value={
                    poll.results
                      .participantCount
                  }
                />

                <MetricCard
                  label="Voted"
                  value={
                    poll.results
                      .votedCount
                  }
                />

                <MetricCard
                  label="Waiting"
                  value={
                    poll.results
                      .waitingCount
                  }
                />
              </div>
            ) : null}
          </div>

          {isTrivia && trivia ? (
            <>
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">
                    Live Answers
                  </h2>

                  <p className="mt-1 text-sm text-neutral-600">
                    Results update as
                    participants answer.
                  </p>

                  <div className="mt-5 space-y-3">
                    {trivia.results.answerDistribution.map(
                      (choice) => (
                        <div
                          key={
                            choice.choiceId
                          }
                          className={`rounded-xl border p-4 ${
                            choice.isCorrect
                              ? "border-green-300 bg-green-50"
                              : "border-neutral-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="font-medium">
                              {
                                choice.label
                              }

                              {choice.isCorrect ? (
                                <span className="ml-2 text-xs font-semibold text-green-700">
                                  CORRECT
                                </span>
                              ) : null}
                            </div>

                            <div className="text-sm font-semibold">
                              {
                                choice.count
                              }{" "}
                              (
                              {
                                choice.percentage
                              }
                              %)
                            </div>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full bg-neutral-900 transition-all"
                              style={{
                                width: `${choice.percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <Leaderboard
                  entries={
                    data.leaderboard
                  }
                />
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Participant Status
                    </h2>

                    <p className="mt-1 text-sm text-neutral-600">
                      See who has answered
                      the current question.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void loadHostState();
                    }}
                    className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
                  >
                    Refresh
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                        <th className="px-3 py-3 font-medium">
                          Participant
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Status
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Result
                        </th>

                        <th className="px-3 py-3 text-right font-medium">
                          Score
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {trivia.results
                        .participants
                        .length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-6 text-center text-neutral-500"
                          >
                            No participants
                            yet.
                          </td>
                        </tr>
                      ) : (
                        trivia.results.participants.map(
                          (
                            participant,
                          ) => (
                            <tr
                              key={
                                participant.participantId
                              }
                              className="border-b border-neutral-100 last:border-0"
                            >
                              <td className="px-3 py-3 font-medium">
                                {
                                  participant.displayName
                                }
                              </td>

                              <td className="px-3 py-3">
                                {participant.hasAnswered
                                  ? "Answered"
                                  : "Waiting"}
                              </td>

                              <td className="px-3 py-3">
                                {!participant.hasAnswered
                                  ? "—"
                                  : participant.correct
                                    ? "Correct"
                                    : "Incorrect"}
                              </td>

                              <td className="px-3 py-3 text-right font-semibold">
                                {
                                  participant.score
                                }
                              </td>
                            </tr>
                          ),
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {isPoll && poll ? (
            <>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">
                  Live Results
                </h2>

                <p className="mt-1 text-sm text-neutral-600">
                  Results update as
                  participants vote.
                </p>

                <div className="mt-5 space-y-3">
                  {poll.results.voteDistribution.map(
                    (choice) => (
                      <div
                        key={
                          choice.choiceId
                        }
                        className="rounded-xl border border-neutral-200 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-medium">
                            {choice.label}
                          </div>

                          <div className="text-sm font-semibold">
                            {choice.count}{" "}
                            (
                            {
                              choice.percentage
                            }
                            %)
                          </div>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-neutral-900 transition-all"
                            style={{
                              width: `${choice.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Participant Status
                    </h2>

                    <p className="mt-1 text-sm text-neutral-600">
                      See who has voted on
                      the current question.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void loadHostState();
                    }}
                    className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
                  >
                    Refresh
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                        <th className="px-3 py-3 font-medium">
                          Participant
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Status
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Vote
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {poll.results
                        .participants
                        .length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 py-6 text-center text-neutral-500"
                          >
                            No participants
                            yet.
                          </td>
                        </tr>
                      ) : (
                        poll.results.participants.map(
                          (
                            participant,
                          ) => {
                            const choice =
                              currentQuestion.choices.find(
                                (
                                  item,
                                ) =>
                                  item.id ===
                                  participant.choiceId,
                              );

                            return (
                              <tr
                                key={
                                  participant.participantId
                                }
                                className="border-b border-neutral-100 last:border-0"
                              >
                                <td className="px-3 py-3 font-medium">
                                  {
                                    participant.displayName
                                  }
                                </td>

                                <td className="px-3 py-3">
                                  {participant.hasVoted
                                    ? "Voted"
                                    : "Waiting"}
                                </td>

                                <td className="px-3 py-3">
                                  {participant.hasVoted
                                    ? choice?.label ??
                                      "Submitted"
                                    : "—"}
                                </td>
                              </tr>
                            );
                          },
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Questions
            </h2>

            <p className="mt-1 text-sm text-neutral-600">
              Jump directly to any
              configured question.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {questions.map(
                (
                  question,
                  index,
                ) => {
                  const isCurrent =
                    question.id ===
                    currentQuestion.id;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      disabled={
                        changingQuestion ||
                        isCurrent
                      }
                      onClick={() => {
                        void setCurrentQuestion(
                          question.id,
                        );
                      }}
                      className={`rounded-xl border p-3 text-left ${
                        isCurrent
                          ? "border-green-300 bg-green-50"
                          : "border-neutral-200 hover:bg-neutral-50"
                      } disabled:cursor-default`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-medium text-neutral-500">
                          Question{" "}
                          {index + 1}
                        </div>

                        {isCurrent ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                            LIVE
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 line-clamp-2 text-sm font-medium">
                        {
                          question.question
                        }
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </>
      )}

      {showEndConfirm ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-live-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowEndConfirm(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  End Live Experience
                </div>

                <h2
                  id="end-live-title"
                  className="mt-2 text-xl font-semibold text-neutral-900"
                >
                  End this Live
                  experience?
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEndConfirm(false);
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              This will mark the
              experience as ended. You
              can still move it to the
              Post-Event state or restart
              it later if needed.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEndConfirm(false);
                }}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  changingLifecycle
                }
                onClick={async () => {
                  setShowEndConfirm(
                    false,
                  );

                  await setExperienceStatus(
                    "ended",
                  );
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                End Experience
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-neutral-50 p-4">
      <div className="text-xs text-neutral-500">
        {label}
      </div>

      <div className="mt-1 text-xl font-semibold">
        {value}
      </div>
    </div>
  );
}

function Leaderboard({
  entries,
}: {
  entries: LeaderboardEntry[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Leaderboard
      </h2>

      <div className="mt-5 space-y-2">
        {entries.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
            No participants yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={
                entry.participantId
              }
              className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold">
                  #{entry.rank}
                </div>

                <div className="truncate text-sm font-medium">
                  {
                    entry.displayName
                  }
                </div>
              </div>

              <div className="text-sm font-semibold">
                {entry.score} pts
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}