// components\live\admin\LiveManager.tsx

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

type ActivityChoice = {
  id: string;
  label: string;
};

type TriviaQuestion = {
  id: string;
  question: string;
  choices: ActivityChoice[];
  correctChoiceId: string;
  points: number;
};

type PollQuestion = {
  id: string;
  question: string;
  choices: ActivityChoice[];
};

type ActivityQuestion =
  | TriviaQuestion
  | PollQuestion;

type SpinWheelOption = {
  id: string;
  label: string;
  points: number;
};

type ScavengerHuntItem = {
  id: string;
  title: string;
  description: string;
  points: number;
};

type MysteryDropItem = {
  id: string;
  title: string;
  content: string;
  points: number;
};

type ActivityConfiguration = {
  questions?: ActivityQuestion[];

  options?: SpinWheelOption[];
  allowMultipleSpins?: boolean;

  items?: ScavengerHuntItem[];

  entryPoints?: number;
  maxEntriesPerParticipant?: number;

  drops?: MysteryDropItem[];
};

type Activity = {
  id: string;
  experienceId: string;
  activityType: string;
  name: string;
  status: string;

  configuration: ActivityConfiguration;

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
): ActivityChoice {
  return {
    id: makeLocalId("choice"),
    label,
  };
}

function newTriviaQuestion(): TriviaQuestion {
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

function newPollQuestion(): PollQuestion {
  return {
    id: makeLocalId(
      "poll-question",
    ),
    question: "",
    choices: [
      newChoice(),
      newChoice(),
    ],
  };
}

function isTriviaQuestion(
  question: ActivityQuestion,
): question is TriviaQuestion {
  return (
    "correctChoiceId" in question &&
    "points" in question
  );
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

function normalizeSpinWheelOptions(
  activity: Activity,
): SpinWheelOption[] {
  return Array.isArray(
    activity.configuration?.options,
  )
    ? activity.configuration.options
    : [];
}

function normalizeScavengerItems(
  activity: Activity,
): ScavengerHuntItem[] {
  return Array.isArray(
    activity.configuration?.items,
  )
    ? activity.configuration.items
    : [];
}

function normalizeMysteryDrops(
  activity: Activity,
): MysteryDropItem[] {
  return Array.isArray(
    activity.configuration?.drops,
  )
    ? activity.configuration.drops
    : [];
}

function newSpinWheelOption(): SpinWheelOption {
  return {
    id: makeLocalId("wheel-option"),
    label: "",
    points: 0,
  };
}

function newScavengerItem(): ScavengerHuntItem {
  return {
    id: makeLocalId("hunt-item"),
    title: "",
    description: "",
    points: 100,
  };
}

function newMysteryDrop(): MysteryDropItem {
  return {
    id: makeLocalId("mystery-drop"),
    title: "",
    content: "",
    points: 0,
  };
}

const CONFIGURABLE_ACTIVITY_TYPES = [
  "trivia",
  "poll",
  "spin_wheel",
  "scavenger_hunt",
  "lottery",
  "mystery_drop",
] as const;

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
    question: ActivityQuestion,
  ) => ActivityQuestion,
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

          activity.activityType ===
          "poll"
            ? newPollQuestion()
            : newTriviaQuestion(),
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
        question.choices.length <= 2
      ) {
        return question;
      }

      const choices =
        question.choices.filter(
          (choice) =>
            choice.id !== choiceId,
        );

      if (
        isTriviaQuestion(question)
      ) {
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
      }

      return {
        ...question,
        choices,
      };
    },
  );
}

async function createActivity(
  activityType:
    | "trivia"
    | "poll"
    | "spin_wheel"
    | "scavenger_hunt"
    | "lottery"
    | "mystery_drop",
) {
  setCreating(true);
  setError(null);
  setMessage(null);

  const defaults = {
    trivia: {
      name: "Live Trivia",
      configuration: {
        questions: [],
      },
    },

    poll: {
      name: "Live Poll",
      configuration: {
        questions: [],
      },
    },

    spin_wheel: {
      name: "Live Spin Wheel",
      configuration: {
        options: [],
        allowMultipleSpins: false,
      },
    },

    scavenger_hunt: {
      name: "Scavenger Hunt",
      configuration: {
        items: [],
      },
    },

    lottery: {
      name: "Live Lottery",
      configuration: {
        entryPoints: 0,
        maxEntriesPerParticipant: 1,
      },
    },

    mystery_drop: {
      name: "Mystery Drop",
      configuration: {
        drops: [],
      },
    },
  } satisfies Record<
    typeof activityType,
    {
      name: string;
      configuration: ActivityConfiguration;
    }
  >;

  const definition =
    defaults[activityType];

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
          activityType,
          name: definition.name,
          configuration:
            definition.configuration,
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
          "Unable to create Live activity.",
      );
    }

    setActivities((current) => [
      payload.activity,
      ...current,
    ]);

    setSelectedActivityId(
      payload.activity.id,
    );

    setMessage(
      `${definition.name} activity created.`,
    );
  } catch (createError) {
    setError(
      createError instanceof Error
        ? createError.message
        : "Unable to create Live activity.",
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
    !CONFIGURABLE_ACTIVITY_TYPES.includes(
      selectedActivity.activityType as
        (typeof CONFIGURABLE_ACTIVITY_TYPES)[number],
    )
  ) {
    return;
  }

  const activityType =
    selectedActivity.activityType;

const isUpdatingCurrentActivity =
  sharedState.currentActivityId ===
    selectedActivity.id &&
  sharedState.currentActivityType ===
    activityType;

let nextState: Record<
  string,
  unknown
> = isUpdatingCurrentActivity
  ? { ...sharedState.state }
  : {};

if (
  !isUpdatingCurrentActivity &&
  (activityType === "trivia" ||
    activityType === "poll")
) {
    const activityQuestions =
      normalizeQuestions(
        selectedActivity,
      );

    if (
      activityQuestions.length === 0
    ) {
      setError(
        `Add at least one question before activating this ${
          activityType === "poll"
            ? "Poll"
            : "Trivia"
        } activity.`,
      );

      return;
    }

    nextState = {
      currentQuestionId:
        activityQuestions[0].id,
    };
  }

  if (
    activityType === "spin_wheel" &&
    normalizeSpinWheelOptions(
      selectedActivity,
    ).length === 0
  ) {
    setError(
      "Add at least one wheel option before activating this Spin Wheel.",
    );

    return;
  }

  if (
    activityType ===
      "scavenger_hunt" &&
    normalizeScavengerItems(
      selectedActivity,
    ).length === 0
  ) {
    setError(
      "Add at least one item before activating this Scavenger Hunt.",
    );

    return;
  }

  if (
    activityType ===
      "mystery_drop" &&
    normalizeMysteryDrops(
      selectedActivity,
    ).length === 0
  ) {
    setError(
      "Add at least one drop before activating Mystery Drop.",
    );

    return;
  }

  setActivating(true);
  setError(null);
  setMessage(null);

  try {
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

    /*
     * Use the server-normalized version
     * when establishing initial state.
     */
    if (
      activityType === "trivia" ||
      activityType === "poll"
    ) {
      const firstQuestion =
        normalizeQuestions(
          savePayload.activity,
        )[0];

      if (!firstQuestion) {
        throw new Error(
          "This activity does not contain a valid question.",
        );
      }

      nextState = {
        currentQuestionId:
          firstQuestion.id,
      };
    }

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
              activityType,

            currentActivityId:
              selectedActivity.id,

            state: nextState,
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

    setActivities((current) =>
      current.map((activity) =>
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
      `${savePayload.activity.name} is now the current Live activity.`,
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
  selectedActivity.activityType,

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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
  <div className="flex items-center gap-2">
    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
      Build It
    </span>

    <span className="text-neutral-300">
      →
    </span>

    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
      Run It
    </span>
  </div>

  <div className="mt-4 grid gap-4 md:grid-cols-2">
    {/* Live Manager */}
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
          ⚙
        </div>

        <div>
          <div className="font-semibold">
            Live Manager
          </div>

          <div className="text-xs font-medium text-neutral-500">
            Set up the experience
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-600">
        Create and configure what participants
        will interact with.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Activities",
          "Questions",
          "Options",
          "Points",
          "Rules",
          "Content",
        ].map((item) => (
          <span
            key={item}
            className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-600"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 text-xs font-semibold text-neutral-800">
        Configure here.
      </div>
    </div>

    {/* Host Control */}
    <div className="rounded-xl border border-neutral-900 bg-neutral-900 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg">
          ▶
        </div>

        <div>
          <div className="font-semibold">
            Host Control
          </div>

          <div className="text-xs font-medium text-neutral-300">
            Run the experience
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-300">
        Control what happens while your Live
        experience is running.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Go Live / Pause / End",
          "Current Activity",
          "Schedule",
          "Requests",
          "Drops",
          "Drawings",
          "Announcements",
        ].map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-neutral-200"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 text-xs font-semibold text-white">
        Control the live action.
      </div>
    </div>
  </div>

  <div className="mt-4 border-t border-neutral-100 pt-4 text-center text-xs text-neutral-500">
    <span className="font-semibold text-neutral-700">
      Think of it this way:
    </span>{" "}
    Live Manager builds the playbook. Host Control
    runs the show.
  </div>
</div>
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
<div>
  <div>
    <h2 className="font-semibold">
      Activities
    </h2>

    <p className="mt-1 text-xs text-neutral-500">
      Add and configure Live activities.
    </p>
  </div>

  <div className="mt-4 grid grid-cols-2 gap-2">
    {[
      ["trivia", "Trivia"],
      ["poll", "Poll"],
      ["spin_wheel", "Spin Wheel"],
      ["scavenger_hunt", "Scavenger Hunt"],
      ["lottery", "Lottery"],
      ["mystery_drop", "Mystery Drop"],
    ].map(([type, label]) => (
      <button
        key={type}
        type="button"
        disabled={creating}
        onClick={() => {
          void createActivity(
            type as
              | "trivia"
              | "poll"
              | "spin_wheel"
              | "scavenger_hunt"
              | "lottery"
              | "mystery_drop",
          );
        }}
        className="flex min-h-10 w-full items-center justify-start rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-xs font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50"
      >
        <span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium">
          +
        </span>

        <span>{label}</span>
      </button>
    ))}
  </div>
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
                Select an existing activity or create a new Live activity.
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
                      Activity Configuration
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

              {(
                selectedActivity.activityType ===
                  "trivia" ||
                selectedActivity.activityType ===
                  "poll"
              ) ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {selectedActivity.activityType ===
                        "poll"
                          ? "Poll Questions"
                          : "Trivia Questions"}
                      </h2>

                      <p className="mt-1 text-sm text-neutral-600">
                        {selectedActivity.activityType ===
                        "poll"
                          ? "Configure the poll questions and voting choices."
                          : "Configure the questions, answer choices, correct answer and points."}
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
                        Add your first{" "}
                        {selectedActivity.activityType ===
                        "poll"
                          ? "Poll"
                          : "Trivia"}{" "}
                        question.
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
                                      {isTriviaQuestion(
                                        question,
                                      ) ? (
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
                                              ) =>
                                                isTriviaQuestion(
                                                  current,
                                                )
                                                  ? {
                                                      ...current,
                                                      correctChoiceId:
                                                        choice.id,
                                                    }
                                                  : current,
                                            )
                                          }
                                          title="Correct answer"
                                        />
                                      ) : null}

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
                                        placeholder={`${
                                          selectedActivity.activityType ===
                                          "poll"
                                            ? "Choice"
                                            : "Answer"
                                        } ${
                                          choiceIndex +
                                          1
                                        }`}
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
                                        title={
                                          selectedActivity.activityType ===
                                          "poll"
                                            ? "Remove choice"
                                            : "Remove answer"
                                        }
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
                                  {selectedActivity.activityType ===
                                  "poll"
                                    ? "+ Choice"
                                    : "+ Answer"}
                                </button>

                                {isTriviaQuestion(
                                  question,
                                ) ? (
                                  <label className="text-xs font-medium text-neutral-600">
                                    Points

                                    <input
                                      type="number"
                                      min={
                                        0
                                      }
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
                                          ) =>
                                            isTriviaQuestion(
                                              current,
                                            )
                                              ? {
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
                                                }
                                              : current,
                                        )
                                      }
                                      className="ml-2 w-24 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                                    />
                                  </label>
                                ) : null}
                              </div>
                            </div>
                          );
                        },
                      )
                    )}
                  </div>
                </div>
              ) : null}

              {selectedActivity.activityType ===
              "spin_wheel" ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Wheel Options
                      </h2>

                      <p className="mt-1 text-sm text-neutral-600">
                        Configure the outcomes participants can land on.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedActivity(
                          (
                            activity,
                          ) => ({
                            ...activity,

                            configuration:
                              {
                                ...activity.configuration,

                                options: [
                                  ...normalizeSpinWheelOptions(
                                    activity,
                                  ),

                                  newSpinWheelOption(),
                                ],
                              },
                          }),
                        )
                      }
                      className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
                    >
                      + Option
                    </button>
                  </div>

                  <label className="mt-5 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        selectedActivity
                          .configuration
                          .allowMultipleSpins ===
                        true
                      }
                      onChange={(
                        event,
                      ) =>
                        updateSelectedActivity(
                          (
                            activity,
                          ) => ({
                            ...activity,

                            configuration:
                              {
                                ...activity.configuration,

                                allowMultipleSpins:
                                  event
                                    .target
                                    .checked,
                              },
                          }),
                        )
                      }
                    />

                    Allow multiple spins per participant
                  </label>

                  <div className="mt-5 space-y-3">
                    {normalizeSpinWheelOptions(
                      selectedActivity,
                    ).map(
                      (option) => (
                        <div
                          key={
                            option.id
                          }
                          className="flex flex-wrap gap-2 rounded-xl border border-neutral-200 p-3"
                        >
                          <input
                            value={
                              option.label
                            }
                            placeholder="Option label"
                            onChange={(
                              event,
                            ) =>
                              updateSelectedActivity(
                                (
                                  activity,
                                ) => ({
                                  ...activity,

                                  configuration:
                                    {
                                      ...activity.configuration,

                                      options:
                                        normalizeSpinWheelOptions(
                                          activity,
                                        ).map(
                                          (
                                            item,
                                          ) =>
                                            item.id ===
                                            option.id
                                              ? {
                                                  ...item,

                                                  label:
                                                    event
                                                      .target
                                                      .value,
                                                }
                                              : item,
                                        ),
                                    },
                                }),
                              )
                            }
                            className="min-w-[180px] flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />

<input
  type="number"
  min={0}
  max={100000}
  value={
    option.points === 0
      ? ""
      : option.points
  }
  placeholder="0 points"
  onChange={(event) => {
    const value =
      event.target.value;

    updateSelectedActivity(
      (activity) => ({
        ...activity,

        configuration: {
          ...activity.configuration,

          options:
            normalizeSpinWheelOptions(
              activity,
            ).map((item) =>
              item.id === option.id
                ? {
                    ...item,

                    points:
                      value === ""
                        ? 0
                        : Math.max(
                            0,
                            Math.min(
                              100000,
                              Number(value) ||
                                0,
                            ),
                          ),
                  }
                : item,
            ),
        },
      }),
    );
  }}
  className="w-28 rounded-xl border border-neutral-300 px-3 py-2 text-sm"
/>

                          <button
                            type="button"
                            onClick={() =>
                              updateSelectedActivity(
                                (
                                  activity,
                                ) => ({
                                  ...activity,

                                  configuration:
                                    {
                                      ...activity.configuration,

                                      options:
                                        normalizeSpinWheelOptions(
                                          activity,
                                        ).filter(
                                          (
                                            item,
                                          ) =>
                                            item.id !==
                                            option.id,
                                        ),
                                    },
                                }),
                              )
                            }
                            className="px-2 text-sm text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              {selectedActivity.activityType ===
              "scavenger_hunt" ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Scavenger Hunt Items
                      </h2>

                      <p className="mt-1 text-sm text-neutral-600">
                        Configure the tasks participants can complete.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedActivity(
                          (
                            activity,
                          ) => ({
                            ...activity,

                            configuration:
                              {
                                ...activity.configuration,

                                items: [
                                  ...normalizeScavengerItems(
                                    activity,
                                  ),

                                  newScavengerItem(),
                                ],
                              },
                          }),
                        )
                      }
                      className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
                    >
                      + Item
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    {normalizeScavengerItems(
                      selectedActivity,
                    ).map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          className="rounded-xl border border-neutral-200 p-4"
                        >
                          <input
                            value={
                              item.title
                            }
                            placeholder="Item title"
                            onChange={(
                              event,
                            ) =>
                              updateSelectedActivity(
                                (
                                  activity,
                                ) => ({
                                  ...activity,

                                  configuration:
                                    {
                                      ...activity.configuration,

                                      items:
                                        normalizeScavengerItems(
                                          activity,
                                        ).map(
                                          (
                                            current,
                                          ) =>
                                            current.id ===
                                            item.id
                                              ? {
                                                  ...current,

                                                  title:
                                                    event
                                                      .target
                                                      .value,
                                                }
                                              : current,
                                        ),
                                    },
                                }),
                              )
                            }
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />

                          <textarea
                            value={
                              item.description
                            }
                            placeholder="Description"
                            rows={2}
                            onChange={(
                              event,
                            ) =>
                              updateSelectedActivity(
                                (
                                  activity,
                                ) => ({
                                  ...activity,

                                  configuration:
                                    {
                                      ...activity.configuration,

                                      items:
                                        normalizeScavengerItems(
                                          activity,
                                        ).map(
                                          (
                                            current,
                                          ) =>
                                            current.id ===
                                            item.id
                                              ? {
                                                  ...current,

                                                  description:
                                                    event
                                                      .target
                                                      .value,
                                                }
                                              : current,
                                        ),
                                    },
                                }),
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />

                          <div className="mt-2 flex items-center justify-between gap-3">
                            <label className="text-xs text-neutral-600">
                              Points{" "}

                              <input
                                type="number"
                                min={
                                  0
                                }
                                max={
                                  100000
                                }
                                value={
                                  item.points
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateSelectedActivity(
                                    (
                                      activity,
                                    ) => ({
                                      ...activity,

                                      configuration:
                                        {
                                          ...activity.configuration,

                                          items:
                                            normalizeScavengerItems(
                                              activity,
                                            ).map(
                                              (
                                                current,
                                              ) =>
                                                current.id ===
                                                item.id
                                                  ? {
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
                                                    }
                                                  : current,
                                            ),
                                        },
                                    }),
                                  )
                                }
                                className="ml-2 w-24 rounded-xl border border-neutral-300 px-3 py-2"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                updateSelectedActivity(
                                  (
                                    activity,
                                  ) => ({
                                    ...activity,

                                    configuration:
                                      {
                                        ...activity.configuration,

                                        items:
                                          normalizeScavengerItems(
                                            activity,
                                          ).filter(
                                            (
                                              current,
                                            ) =>
                                              current.id !==
                                              item.id,
                                          ),
                                      },
                                  }),
                                )
                              }
                              className="text-xs font-medium text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              {selectedActivity.activityType ===
              "lottery" ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">
                    Lottery Configuration
                  </h2>

                  <p className="mt-1 text-sm text-neutral-600">
                    Configure participant entry limits. Winner selection will be controlled by Host Control.
                  </p>

                  <label className="mt-5 block text-sm font-medium">
                    Maximum entries per participant

                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={
                        selectedActivity
                          .configuration
                          .maxEntriesPerParticipant ??
                        1
                      }
                      onChange={(
                        event,
                      ) =>
                        updateSelectedActivity(
                          (
                            activity,
                          ) => ({
                            ...activity,

                            configuration:
                              {
                                ...activity.configuration,

                                maxEntriesPerParticipant:
                                  Math.max(
                                    1,
                                    Math.min(
                                      100,
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ) ||
                                        1,
                                    ),
                                  ),
                              },
                          }),
                        )
                      }
                      className="mt-1 block w-32 rounded-xl border border-neutral-300 px-3 py-2"
                    />
                  </label>
                </div>
              ) : null}

              {selectedActivity.activityType ===
              "mystery_drop" ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Mystery Drops
                      </h2>

                      <p className="mt-1 text-sm text-neutral-600">
                        Configure protected content that the host can release during the experience.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedActivity(
                          (
                            activity,
                          ) => ({
                            ...activity,

                            configuration:
                              {
                                ...activity.configuration,

                                drops: [
                                  ...normalizeMysteryDrops(
                                    activity,
                                  ),

                                  newMysteryDrop(),
                                ],
                              },
                          }),
                        )
                      }
                      className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
                    >
                      + Drop
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    {normalizeMysteryDrops(
                      selectedActivity,
                    ).map(
                      (drop) => (
                        <div
                          key={
                            drop.id
                          }
                          className="rounded-xl border border-neutral-200 p-4"
                        >
                          <input
                            value={
                              drop.title
                            }
                            placeholder="Drop title"
                            onChange={(
                              event,
                            ) =>
                              updateSelectedActivity(
                                (
                                  activity,
                                ) => ({
                                  ...activity,

                                  configuration:
                                    {
                                      ...activity.configuration,

                                      drops:
                                        normalizeMysteryDrops(
                                          activity,
                                        ).map(
                                          (
                                            current,
                                          ) =>
                                            current.id ===
                                            drop.id
                                              ? {
                                                  ...current,

                                                  title:
                                                    event
                                                      .target
                                                      .value,
                                                }
                                              : current,
                                        ),
                                    },
                                }),
                              )
                            }
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />

                          <textarea
                            value={
                              drop.content
                            }
                            rows={3}
                            placeholder="Hidden content"
                            onChange={(
                              event,
                            ) =>
                              updateSelectedActivity(
                                (
                                  activity,
                                ) => ({
                                  ...activity,

                                  configuration:
                                    {
                                      ...activity.configuration,

                                      drops:
                                        normalizeMysteryDrops(
                                          activity,
                                        ).map(
                                          (
                                            current,
                                          ) =>
                                            current.id ===
                                            drop.id
                                              ? {
                                                  ...current,

                                                  content:
                                                    event
                                                      .target
                                                      .value,
                                                }
                                              : current,
                                        ),
                                    },
                                }),
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />

                          <div className="mt-2 flex items-center justify-between gap-3">
                            <label className="text-xs text-neutral-600">
                              Points{" "}

<input
  type="number"
  min={0}
  max={100000}
  value={
    drop.points === 0
      ? ""
      : drop.points
  }
  placeholder="100"
  onChange={(event) => {
    const value =
      event.target.value;

    updateSelectedActivity(
      (activity) => ({
        ...activity,

        configuration: {
          ...activity.configuration,

          drops:
            normalizeMysteryDrops(
              activity,
            ).map((current) =>
              current.id === drop.id
                ? {
                    ...current,

                    points:
                      value === ""
                        ? 0
                        : Math.max(
                            0,
                            Math.min(
                              100000,
                              Number(value) ||
                                0,
                            ),
                          ),
                  }
                : current,
            ),
        },
      }),
    );
  }}
  className="ml-2 w-24 rounded-xl border border-neutral-300 px-3 py-2"
/>
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                updateSelectedActivity(
                                  (
                                    activity,
                                  ) => ({
                                    ...activity,

                                    configuration:
                                      {
                                        ...activity.configuration,

                                        drops:
                                          normalizeMysteryDrops(
                                            activity,
                                          ).filter(
                                            (
                                              current,
                                            ) =>
                                              current.id !==
                                              drop.id,
                                          ),
                                      },
                                  }),
                                )
                              }
                              className="text-xs font-medium text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}