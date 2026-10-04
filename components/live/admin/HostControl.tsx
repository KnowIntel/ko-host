"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@supabase/supabase-js";

type TriviaChoice = {
  id: string;
  label: string;
};

type HostQuestion = {
  id: string;
  question: string;
  choices: TriviaChoice[];
  correctChoiceId: string;
  points: number;
  index: number;
};

type AnswerDistribution = {
  choiceId: string;
  label: string;
  count: number;
  percentage: number;
  isCorrect: boolean;
};

type ParticipantResult = {
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
    questions: HostQuestion[];

    currentQuestion:
      | HostQuestion
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
        ParticipantResult[];
    };
  } | null;

  error?: string;
};

type Props = {
  micrositeId: string;
  experienceId: string;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const supabaseAnonKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
);

export default function HostControl({
  micrositeId,
  experienceId,
}: Props) {
  const [data, setData] =
    useState<HostPayload | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [changingQuestion, setChangingQuestion] =
    useState(false);

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
   * The existing server APIs broadcast this
   * event whenever shared Live state changes
   * or a participant submits an answer.
   *
   * Broadcast contains no protected results.
   * We fetch authoritative Host data after
   * receiving the notification.
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

  const trivia = data?.trivia ?? null;

  const questions =
    trivia?.questions ?? [];

  const currentQuestion =
    trivia?.currentQuestion ?? null;

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
      before: "Experience reset to Before.",
      live: "Experience is Live.",
      paused: "Experience paused.",
      ended: "Experience ended.",
      after: "Experience moved to After.",
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
    if (
      !data?.activity ||
      data.activity.activityType !==
        "trivia"
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
              "trivia",

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

          <div className="mt-1 font-semibold capitalize">
            {data.experience.status}
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

    <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-700">
      {data.experience.status}
    </div>
  </div>

  <div className="mt-5 flex flex-wrap gap-2">
    <button
      type="button"
      disabled={
        changingLifecycle ||
        data.experience.status ===
          "before"
      }
      onClick={() => {
        void setExperienceStatus(
          "before",
        );
      }}
      className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Before
    </button>

    <button
      type="button"
      disabled={
        changingLifecycle ||
        data.experience.status ===
          "live"
      }
      onClick={() => {
        void setExperienceStatus(
          "live",
        );
      }}
      className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {changingLifecycle
        ? "Updating..."
        : data.experience.status ===
            "paused"
          ? "Resume Live"
          : "Go Live"}
    </button>

    <button
      type="button"
      disabled={
        changingLifecycle ||
        data.experience.status !==
          "live"
      }
      onClick={() => {
        void setExperienceStatus(
          "paused",
        );
      }}
      className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Pause
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
  className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
>
  End
</button>

    <button
      type="button"
      disabled={
        changingLifecycle ||
        data.experience.status ===
          "after"
      }
      onClick={() => {
        void setExperienceStatus(
          "after",
        );
      }}
      className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      After
    </button>
  </div>

  <div className="mt-4 text-xs text-neutral-500">
    Before = not started • Live =
    running • Paused = temporarily
    stopped • Ended = finished • After
    = post-event state
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
      ) : data.activity.activityType !==
        "trivia" ? (
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
      ) : !trivia ||
        !currentQuestion ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            No Trivia question
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            This activity does not have
            a current Trivia question.
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

                <div className="mt-2 text-sm text-neutral-600">
                  {
                    currentQuestion.points
                  }{" "}
                  points
                </div>
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

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">
                  Participants
                </div>

                <div className="mt-1 text-xl font-semibold">
                  {
                    trivia.results
                      .participantCount
                  }
                </div>
              </div>

              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">
                  Answered
                </div>

                <div className="mt-1 text-xl font-semibold">
                  {
                    trivia.results
                      .answeredCount
                  }
                </div>
              </div>

              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">
                  Correct
                </div>

                <div className="mt-1 text-xl font-semibold">
                  {
                    trivia.results
                      .correctCount
                  }
                </div>
              </div>

              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="text-xs text-neutral-500">
                  Waiting
                </div>

                <div className="mt-1 text-xl font-semibold">
                  {
                    trivia.results
                      .unansweredCount
                  }
                </div>
              </div>
            </div>
          </div>

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
                          {choice.label}

                          {choice.isCorrect ? (
                            <span className="ml-2 text-xs font-semibold text-green-700">
                              CORRECT
                            </span>
                          ) : null}
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
              <h2 className="text-lg font-semibold">
                Leaderboard
              </h2>

              <div className="mt-5 space-y-2">
                {data.leaderboard
                  .length === 0 ? (
                  <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
                    No participants yet.
                  </div>
                ) : (
                  data.leaderboard.map(
                    (entry) => (
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
                    ),
                  )
                )}
              </div>
            </div>
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
                    .participants.length ===
                  0 ? (
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
                      (participant) => (
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
                  End this Live experience?
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
              This will mark the experience as
              ended. You can still move it to
              the After state or restart it
              later if needed.
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
                disabled={changingLifecycle}
                onClick={async () => {
                  setShowEndConfirm(false);

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