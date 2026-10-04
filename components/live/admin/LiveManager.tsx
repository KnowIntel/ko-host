"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Experience = {
  id: string;
  name: string;
  status: string;
  isEnabled: boolean;
};

type TriviaChoice = {
  id: string;
  label: string;
};

type TriviaQuestion = {
  id: string;
  question: string;
  choices: TriviaChoice[];
  correctChoiceId: string;
  points: number;
};

type Activity = {
  id: string;
  experienceId: string;
  activityType: string;
  name: string;
  status: string;

  configuration: {
    questions?: TriviaQuestion[];
  };

  scheduledFor: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SharedState = {
  currentActivityType: string | null;
  currentActivityId: string | null;

  state: {
    currentQuestionId?: string;
    [key: string]: unknown;
  };

  updatedAt: string | null;
};

type Props = {
  micrositeId: string;
  experience: Experience;
};

function makeLocalId(
  prefix: string,
) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function newChoice(
  label = "",
): TriviaChoice {
  return {
    id: makeLocalId("choice"),
    label,
  };
}

function newQuestion(): TriviaQuestion {
  const firstChoice = newChoice();
  const secondChoice = newChoice();

  return {
    id: makeLocalId("question"),
    question: "",
    choices: [
      firstChoice,
      secondChoice,
    ],
    correctChoiceId:
      firstChoice.id,
    points: 100,
  };
}

function normalizeQuestions(
  activity: Activity,
) {
  return Array.isArray(
    activity.configuration?.questions,
  )
    ? activity.configuration.questions
    : [];
}

export default function LiveManager({
  micrositeId,
  experience,
}: Props) {
  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [sharedState, setSharedState] =
    useState<SharedState>({
      currentActivityType: null,
      currentActivityId: null,
      state: {},
      updatedAt: null,
    });

  const [
    selectedActivityId,
    setSelectedActivityId,
  ] = useState<string | null>(
    null,
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [activating, setActivating] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const selectedActivity =
    useMemo(
      () =>
        activities.find(
          (activity) =>
            activity.id ===
            selectedActivityId,
        ) ?? null,
      [
        activities,
        selectedActivityId,
      ],
    );

  const questions =
    selectedActivity
      ? normalizeQuestions(
          selectedActivity,
        )
      : [];

  const currentActivity =
    useMemo(
      () =>
        activities.find(
          (activity) =>
            activity.id ===
            sharedState.currentActivityId,
        ) ?? null,
      [
        activities,
        sharedState.currentActivityId,
      ],
    );

  const loadActivities =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/dashboard/microsites/${micrositeId}/live/activities`,
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
              "Unable to load Live activities.",
          );
        }

        const nextActivities =
          Array.isArray(
            payload.activities,
          )
            ? payload.activities
            : [];

        setActivities(
          nextActivities,
        );

        setSharedState(
          payload.sharedState ?? {
            currentActivityType:
              null,
            currentActivityId:
              null,
            state: {},
            updatedAt: null,
          },
        );

        setSelectedActivityId(
          (current) => {
            if (
              current &&
              nextActivities.some(
                (
                  activity: Activity,
                ) =>
                  activity.id ===
                  current,
              )
            ) {
              return current;
            }

            return (
              payload.sharedState
                ?.currentActivityId ??
              nextActivities[0]?.id ??
              null
            );
          },
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load Live activities.",
        );
      } finally {
        setLoading(false);
      }
    }, [micrositeId]);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  function updateSelectedActivity(
    updater: (
      activity: Activity,
    ) => Activity,
  ) {
    if (!selectedActivityId) {
      return;
    }

    setActivities((current) =>
      current.map((activity) =>
        activity.id ===
        selectedActivityId
          ? updater(activity)
          : activity,
      ),
    );

    setMessage(null);
  }

  function updateQuestion(
    questionId: string,
    updater: (
      question: TriviaQuestion,
    ) => TriviaQuestion,
  ) {
    updateSelectedActivity(
      (activity) => ({
        ...activity,

        configuration: {
          ...activity.configuration,

          questions:
            normalizeQuestions(
              activity,
            ).map(
              (question) =>
                question.id ===
                questionId
                  ? updater(
                      question,
                    )
                  : question,
            ),
        },
      }),
    );
  }

  function addQuestion() {
    updateSelectedActivity(
      (activity) => ({
        ...activity,

        configuration: {
          ...activity.configuration,

          questions: [
            ...normalizeQuestions(
              activity,
            ),
            newQuestion(),
          ],
        },
      }),
    );
  }

  function removeQuestion(
    questionId: string,
  ) {
    updateSelectedActivity(
      (activity) => ({
        ...activity,

        configuration: {
          ...activity.configuration,

          questions:
            normalizeQuestions(
              activity,
            ).filter(
              (question) =>
                question.id !==
                questionId,
            ),
        },
      }),
    );
  }

  function addChoice(
    questionId: string,
  ) {
    updateQuestion(
      questionId,
      (question) => {
        if (
          question.choices.length >=
          10
        ) {
          return question;
        }

        return {
          ...question,
          choices: [
            ...question.choices,
            newChoice(),
          ],
        };
      },
    );
  }

  function updateChoice(
    questionId: string,
    choiceId: string,
    label: string,
  ) {
    updateQuestion(
      questionId,
      (question) => ({
        ...question,

        choices:
          question.choices.map(
            (choice) =>
              choice.id ===
              choiceId
                ? {
                    ...choice,
                    label,
                  }
                : choice,
          ),
      }),
    );
  }

  function removeChoice(
    questionId: string,
    choiceId: string,
  ) {
    updateQuestion(
      questionId,
      (question) => {
        if (
          question.choices.length <=
          2
        ) {
          return question;
        }

        const choices =
          question.choices.filter(
            (choice) =>
              choice.id !==
              choiceId,
          );

        const correctChoiceId =
          question.correctChoiceId ===
          choiceId
            ? choices[0]?.id ?? ""
            : question.correctChoiceId;

        return {
          ...question,
          choices,
          correctChoiceId,
        };
      },
    );
  }

  async function createTrivia() {
    setCreating(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/dashboard/microsites/${micrositeId}/live/activities`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            activityType:
              "trivia",
            name: "Live Trivia",
            configuration: {
              questions: [],
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
            "Unable to create Trivia activity.",
        );
      }

      setActivities(
        (current) => [
          payload.activity,
          ...current,
        ],
      );

      setSelectedActivityId(
        payload.activity.id,
      );

      setMessage(
        "Trivia activity created.",
      );
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create Trivia activity.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function saveActivity() {
    if (!selectedActivity) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/dashboard/microsites/${micrositeId}/live/activities`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            activityId:
              selectedActivity.id,

            name:
              selectedActivity.name,

            configuration:
              selectedActivity.configuration,
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
            "Unable to save activity.",
        );
      }

      setActivities(
        (current) =>
          current.map(
            (activity) =>
              activity.id ===
              payload.activity.id
                ? payload.activity
                : activity,
          ),
      );

      setMessage(
        "Activity saved.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save activity.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function activateActivity() {
    if (!selectedActivity) {
      return;
    }

    if (
      selectedActivity.activityType !==
      "trivia"
    ) {
      return;
    }

    const activityQuestions =
      normalizeQuestions(
        selectedActivity,
      );

    if (
      activityQuestions.length === 0
    ) {
      setError(
        "Add at least one question before activating this Trivia activity.",
      );

      return;
    }

    setActivating(true);
    setError(null);
    setMessage(null);

    try {
      /*
       * Save first so the runtime never
       * activates stale editor data.
       */
      const saveResponse =
        await fetch(
          `/api/dashboard/microsites/${micrositeId}/live/activities`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              activityId:
                selectedActivity.id,

              name:
                selectedActivity.name,

              status: "active",

              configuration:
                selectedActivity.configuration,
            }),
          },
        );

      const savePayload =
        await saveResponse.json();

      if (
        !saveResponse.ok ||
        !savePayload?.ok
      ) {
        throw new Error(
          savePayload?.error ||
            "Unable to activate activity.",
        );
      }

      const firstQuestion =
        normalizeQuestions(
          savePayload.activity,
        )[0];

      const stateResponse =
        await fetch(
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
                selectedActivity.id,

              state: {
                currentQuestionId:
                  firstQuestion.id,
              },
            }),
          },
        );

      const statePayload =
        await stateResponse.json();

      if (
        !stateResponse.ok ||
        !statePayload?.ok
      ) {
        throw new Error(
          statePayload?.error ||
            "Unable to update Live state.",
        );
      }

      setActivities(
        (current) =>
          current.map(
            (activity) =>
              activity.id ===
              savePayload.activity.id
                ? savePayload.activity
                : activity,
          ),
      );

      setSharedState(
        statePayload.sharedState,
      );

      setMessage(
        "Trivia is now the current Live activity.",
      );
    } catch (activateError) {
      setError(
        activateError instanceof Error
          ? activateError.message
          : "Unable to activate activity.",
      );
    } finally {
      setActivating(false);
    }
  }

  async function setCurrentQuestion(
    questionId: string,
  ) {
    if (!selectedActivity) {
      return;
    }

    setActivating(true);
    setError(null);
    setMessage(null);

    try {
      /*
       * Only an activity belonging to
       * this editor can be selected here.
       * The server-side state API remains
       * authoritative.
       */
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
              selectedActivity.id,

            state: {
              ...sharedState.state,

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

      setSharedState(
        payload.sharedState,
      );

      setMessage(
        "Current question updated.",
      );
    } catch (questionError) {
      setError(
        questionError instanceof Error
          ? questionError.message
          : "Unable to change the current question.",
      );
    } finally {
      setActivating(false);
    }
  }

  async function deleteActivity() {
    if (!selectedActivity) {
      return;
    }

    if (
      !window.confirm(
        `Delete "${selectedActivity.name}"?`,
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/dashboard/microsites/${micrositeId}/live/activities`,
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            activityId:
              selectedActivity.id,
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
            "Unable to delete activity.",
        );
      }

      setActivities(
        (current) =>
          current.filter(
            (activity) =>
              activity.id !==
              selectedActivity.id,
          ),
      );

      setSelectedActivityId(
        null,
      );

      setMessage(
        "Activity deleted.",
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete activity.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">
          Loading Live Manager...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-600">
            Experience
          </div>

          <div className="mt-1 font-semibold">
            {experience.name}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-600">
            Experience status
          </div>

          <div className="mt-1 font-semibold capitalize">
            {experience.status}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-600">
            Current activity
          </div>

          <div className="mt-1 font-semibold">
            {currentActivity?.name ??
              "None"}
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

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              Activities
            </h2>

            <button
              type="button"
              disabled={creating}
              onClick={() => {
                void createTrivia();
              }}
              className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {creating
                ? "Creating..."
                : "+ Trivia"}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {activities.length ===
            0 ? (
              <div className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">
                No Live activities
                yet.
              </div>
            ) : (
              activities.map(
                (activity) => {
                  const selected =
                    activity.id ===
                    selectedActivityId;

                  const current =
                    activity.id ===
                    sharedState.currentActivityId;

                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() =>
                        setSelectedActivityId(
                          activity.id,
                        )
                      }
                      className={`w-full rounded-xl border p-3 text-left ${
                        selected
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-medium">
                          {
                            activity.name
                          }
                        </div>

                        {current ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                            CURRENT
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 text-xs capitalize text-neutral-500">
                        {
                          activity.activityType
                        }{" "}
                        •{" "}
                        {
                          activity.status
                        }
                      </div>
                    </button>
                  );
                },
              )
            )}
          </div>
        </div>

        <div>
          {!selectedActivity ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">
                Select an activity
              </h2>

              <p className="mt-2 text-sm text-neutral-600">
                Select an existing
                activity or create a
                Trivia activity.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-neutral-500">
                      {
                        selectedActivity.activityType
                      }
                    </div>

                    <h2 className="mt-1 text-lg font-semibold">
                      Activity
                      Configuration
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        saving ||
                        activating
                      }
                      onClick={() => {
                        void saveActivity();
                      }}
                      className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : "Save"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        saving ||
                        activating
                      }
                      onClick={() => {
                        void activateActivity();
                      }}
                      className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {activating
                        ? "Updating..."
                        : sharedState.currentActivityId ===
                            selectedActivity.id
                          ? "Update Live"
                          : "Make Current"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        deleting ||
                        sharedState.currentActivityId ===
                          selectedActivity.id
                      }
                      onClick={() => {
                        void deleteActivity();
                      }}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deleting
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-xs font-medium text-neutral-600">
                    Activity name
                  </label>

                  <input
                    type="text"
                    value={
                      selectedActivity.name
                    }
                    onChange={(event) =>
                      updateSelectedActivity(
                        (activity) => ({
                          ...activity,
                          name:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Trivia Questions
                    </h2>

                    <p className="mt-1 text-sm text-neutral-600">
                      Configure the
                      questions, answer
                      choices, correct
                      answer and points.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addQuestion
                    }
                    className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    + Question
                  </button>
                </div>

                <div className="mt-5 space-y-5">
                  {questions.length ===
                  0 ? (
                    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-600">
                      No questions yet.
                      Add your first
                      Trivia question.
                    </div>
                  ) : (
                    questions.map(
                      (
                        question,
                        questionIndex,
                      ) => {
                        const isCurrentQuestion =
                          sharedState
                            .currentActivityId ===
                            selectedActivity.id &&
                          sharedState
                            .state
                            ?.currentQuestionId ===
                            question.id;

                        return (
                          <div
                            key={
                              question.id
                            }
                            className="rounded-2xl border border-neutral-200 p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold">
                                  Question{" "}
                                  {questionIndex +
                                    1}
                                </div>

                                {isCurrentQuestion ? (
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                                    LIVE
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex items-center gap-2">
                                {sharedState.currentActivityId ===
                                  selectedActivity.id &&
                                !isCurrentQuestion ? (
                                  <button
                                    type="button"
                                    disabled={
                                      activating
                                    }
                                    onClick={() => {
                                      void setCurrentQuestion(
                                        question.id,
                                      );
                                    }}
                                    className="text-xs font-medium text-neutral-700 underline underline-offset-4"
                                  >
                                    Go Live
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeQuestion(
                                      question.id,
                                    )
                                  }
                                  className="text-xs font-medium text-red-600 underline underline-offset-4"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <textarea
                              value={
                                question.question
                              }
                              onChange={(
                                event,
                              ) =>
                                updateQuestion(
                                  question.id,
                                  (
                                    current,
                                  ) => ({
                                    ...current,
                                    question:
                                      event
                                        .target
                                        .value,
                                  }),
                                )
                              }
                              rows={2}
                              placeholder="Enter the question..."
                              className="mt-3 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                            />

                            <div className="mt-4 space-y-2">
                              {question.choices.map(
                                (
                                  choice,
                                  choiceIndex,
                                ) => (
                                  <div
                                    key={
                                      choice.id
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="radio"
                                      name={`correct-${question.id}`}
                                      checked={
                                        question.correctChoiceId ===
                                        choice.id
                                      }
                                      onChange={() =>
                                        updateQuestion(
                                          question.id,
                                          (
                                            current,
                                          ) => ({
                                            ...current,
                                            correctChoiceId:
                                              choice.id,
                                          }),
                                        )
                                      }
                                      title="Correct answer"
                                    />

                                    <input
                                      type="text"
                                      value={
                                        choice.label
                                      }
                                      onChange={(
                                        event,
                                      ) =>
                                        updateChoice(
                                          question.id,
                                          choice.id,
                                          event
                                            .target
                                            .value,
                                        )
                                      }
                                      placeholder={`Answer ${choiceIndex + 1}`}
                                      className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                                    />

                                    <button
                                      type="button"
                                      disabled={
                                        question
                                          .choices
                                          .length <=
                                        2
                                      }
                                      onClick={() =>
                                        removeChoice(
                                          question.id,
                                          choice.id,
                                        )
                                      }
                                      className="px-2 text-sm text-red-600 disabled:opacity-30"
                                      title="Remove answer"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                              <button
                                type="button"
                                disabled={
                                  question
                                    .choices
                                    .length >=
                                  10
                                }
                                onClick={() =>
                                  addChoice(
                                    question.id,
                                  )
                                }
                                className="text-xs font-medium text-neutral-700 underline underline-offset-4 disabled:opacity-40"
                              >
                                + Answer
                              </button>

                              <label className="text-xs font-medium text-neutral-600">
                                Points
                                <input
                                  type="number"
                                  min={0}
                                  max={
                                    100000
                                  }
                                  value={
                                    question.points
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateQuestion(
                                      question.id,
                                      (
                                        current,
                                      ) => ({
                                        ...current,
                                        points:
                                          Math.max(
                                            0,
                                            Math.min(
                                              100000,
                                              Number(
                                                event
                                                  .target
                                                  .value,
                                              ) ||
                                                0,
                                            ),
                                          ),
                                      }),
                                    )
                                  }
                                  className="ml-2 w-24 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                                />
                              </label>
                            </div>
                          </div>
                        );
                      },
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}