// components\live\admin\HostControl.tsx

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

type ParticipantRecord = {
  participantId: string;
  displayName: string;
  avatarUrl: string | null;
  status: string;
  score: number;
  joinedAt: string;
  lastSeenAt: string | null;
};

type HostActivityRuntimeParticipant = {
  participantId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  state: Record<string, unknown>;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type HostScavengerHuntItem = {
  id: string;
  title: string;
  description: string;
  points: number;
};

type HostScavengerHuntCompletion = {
  completedAt: string;
  awardedPoints: number;
  responseText: string;
};

type HostActivityRuntime = {
  activityType: string;
  configuration: Record<string, unknown>;
  participantCount: number;
  participantStates: HostActivityRuntimeParticipant[];
  sharedState: Record<string, unknown>;
};

type HostScheduleEntry = {
  id: string;
  title: string;
  description: string;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type HostSongRequest = {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatarUrl: string | null;
  songTitle: string;
  artistName: string | null;
  status: string;
  sortOrder: number;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
};

type HostAnnouncement = {
  id: string;
  title: string;
  message: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type HostOperations = {
  schedule: HostScheduleEntry[];
  songRequests: HostSongRequest[];
  announcements: HostAnnouncement[];
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

  participantRecords?: ParticipantRecord[];

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

  activityRuntime: HostActivityRuntime | null;

operations: HostOperations;

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
  changingHostAction,
  setChangingHostAction,
] = useState<string | null>(null);

  const [
    showEndConfirm,
    setShowEndConfirm,
  ] = useState(false);

    const [
    participantToRemove,
    setParticipantToRemove,
  ] = useState<LeaderboardEntry | null>(null);

  const [
    participantRecordsExpanded,
    setParticipantRecordsExpanded,
  ] = useState(false);

  const [
    participantRecordsSearch,
    setParticipantRecordsSearch,
  ] = useState("");

  const [
    participantRecordsFilter,
    setParticipantRecordsFilter,
  ] = useState<"all" | "active" | "removed">(
    "all",
  );

  const [
    participantToDelete,
    setParticipantToDelete,
  ] = useState<ParticipantRecord | null>(null);

const [
  changingLifecycle,
  setChangingLifecycle,
] = useState(false);

const [
  experienceName,
  setExperienceName,
] = useState("");

const [
  savingExperienceName,
  setSavingExperienceName,
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

  useEffect(() => {
  if (!data?.experience.name) {
    return;
  }

  setExperienceName(
    data.experience.name,
  );
}, [data?.experience.name]);

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

    const filteredParticipantRecords = useMemo(() => {
    const search = participantRecordsSearch
      .trim()
      .toLowerCase();

    return (data?.participantRecords ?? []).filter(
      (participant) => {
        const matchesSearch =
          participant.displayName
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          participantRecordsFilter === "all" ||
          participant.status === participantRecordsFilter;

        return matchesSearch && matchesStatus;
      },
    );
  }, [
    data?.participantRecords,
    participantRecordsSearch,
    participantRecordsFilter,
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

  async function saveExperienceName() {
  const name = experienceName.trim();

  if (!name) {
    setError(
      "Live Experience Title is required.",
    );
    return;
  }

  setSavingExperienceName(true);
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
          name,
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
          "Unable to update Live Experience Title.",
      );
    }

    await loadHostState();

    setMessage(
      "Live Experience Title updated.",
    );
  } catch (saveError) {
    setError(
      saveError instanceof Error
        ? saveError.message
        : "Unable to update Live Experience Title.",
    );
  } finally {
    setSavingExperienceName(false);
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

  async function runHostAction(
  action: string,
  values: Record<string, unknown> = {},
  successMessage = "Host action completed.",
) {
  setChangingHostAction(action);
  setError(null);
  setMessage(null);

  try {
    const response = await fetch(
      `/api/dashboard/microsites/${micrositeId}/live/host/actions`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          action,
          ...values,
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
          "Unable to perform Host action.",
      );
    }

    await loadHostState();

    setMessage(successMessage);

    return payload;
  } catch (actionError) {
    setError(
      actionError instanceof Error
        ? actionError.message
        : "Unable to perform Host action.",
    );

    return null;
  } finally {
    setChangingHostAction(null);
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

<div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
  <label className="block">
    <span className="text-sm font-semibold text-neutral-900">
      Live Experience Title
    </span>

    <span className="mt-1 block text-xs text-neutral-500">
      The name participants will see when
      connecting to this Live Experience.
    </span>

    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={experienceName}
        maxLength={100}
        disabled={savingExperienceName}
        onChange={(event) => {
          setExperienceName(
            event.target.value,
          );
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void saveExperienceName();
          }
        }}
        placeholder="Live Experience"
        className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <button
        type="button"
        disabled={
          savingExperienceName ||
          !experienceName.trim() ||
          experienceName.trim() ===
            data.experience.name
        }
        onClick={() => {
          void saveExperienceName();
        }}
        className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
      >
        {savingExperienceName
          ? "Saving..."
          : "Save Title"}
      </button>
    </div>
  </label>
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
      src="/media-icons/icon-back-left.svg"
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
      src="/media-icons/icon-forward-right.svg"
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

            {/* PARTICIPANT RECORDS */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
<button
  type="button"
  onClick={() =>
    setParticipantRecordsExpanded(
      (current) => !current,
    )
  }
  className="flex w-full items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left transition hover:border-neutral-300"
  aria-expanded={participantRecordsExpanded}
>
<div>
  <h2 className="text-lg font-semibold">
    Participant Records
  </h2>

  <p className="mt-1 text-sm text-neutral-600">
    View and manage all participant records,
    including previously removed participants.
  </p>
</div>

  <span
    className={[
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm text-neutral-600 transition-transform duration-200",
      participantRecordsExpanded ? "rotate-180" : "",
    ].join(" ")}
    aria-hidden="true"
  >
    ▼
  </span>
</button>

        {participantRecordsExpanded && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={participantRecordsSearch}
                onChange={(event) =>
                  setParticipantRecordsSearch(
                    event.target.value,
                  )
                }
                placeholder="Search participants..."
                className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
              />

              <select
                value={participantRecordsFilter}
                onChange={(event) =>
                  setParticipantRecordsFilter(
                    event.target.value as
                      | "all"
                      | "active"
                      | "removed",
                  )
                }
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Participants</option>
                <option value="active">Active</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200">
              {filteredParticipantRecords.length === 0 ? (
                <div className="p-4 text-sm text-neutral-500">
                  No matching participant records.
                </div>
              ) : (
                filteredParticipantRecords.map(
                  (participant) => (
                    <div
                      key={participant.participantId}
                      className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 p-4 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900">
                          {participant.displayName}
                        </div>

                        <div className="mt-1 text-xs text-neutral-500">
                          Joined:{" "}
                          {new Date(
                            participant.joinedAt,
                          ).toLocaleString()}
                        </div>

                        <div className="mt-1 text-xs text-neutral-500">
                          Points: {participant.score}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={
                            participant.status === "active"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800"
                              : "rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600"
                          }
                        >
                          {participant.status}
                        </span>

<button
  type="button"
  onClick={() => setParticipantToDelete(participant)}
  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
>
  Delete
</button>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* HOST OPERATIONS */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* SONG REQUESTS */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Song Requests
              </h2>

              <p className="mt-1 text-sm text-neutral-600">
                Manage the participant request queue.
              </p>
            </div>

            <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
              {data.operations.songRequests.length}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {data.operations.songRequests.length === 0 ? (
              <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
                No song requests yet.
              </div>
            ) : (
              data.operations.songRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-neutral-200 p-4"
                >
                  <div className="font-medium">
                    {request.songTitle}
                  </div>

                  {request.artistName ? (
                    <div className="mt-1 text-sm text-neutral-600">
                      {request.artistName}
                    </div>
                  ) : null}

                  <div className="mt-1 text-xs text-neutral-500">
                    Requested by {request.participantName}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "queued",
                      "playing",
                      "played",
                      "rejected",
                    ].map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={
                          changingHostAction !== null ||
                          request.status === status
                        }
                        onClick={() => {
                          void runHostAction(
                            "update_song_request",
                            {
                              requestId: request.id,
                              status,
                            },
                            "Song Request updated.",
                          );
                        }}
                        className={
                          request.status === status
                            ? "rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white"
                            : "rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-40"
                        }
                      >
                        {status === "queued"
                          ? "Queued"
                          : status === "playing"
                            ? "Playing"
                            : status === "played"
                              ? "Played"
                              : "Reject"}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

{/* SCHEDULE */}
<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-semibold">
        Schedule
      </h2>

      <p className="mt-1 text-sm text-neutral-600">
        Create and control event schedule items.
      </p>
    </div>

    <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
      {data.operations.schedule.length}
    </div>
  </div>

  {/* CREATE SCHEDULE ENTRY */}
  <form
    className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
    onSubmit={(event) => {
      event.preventDefault();

      const form =
        event.currentTarget;

      const formData =
        new FormData(form);

      const title = String(
        formData.get("scheduleTitle") ?? "",
      ).trim();

      const description = String(
        formData.get(
          "scheduleDescription",
        ) ?? "",
      ).trim();

      const startsAt = String(
        formData.get("scheduleStartsAt") ?? "",
      ).trim();

      const endsAt = String(
        formData.get("scheduleEndsAt") ?? "",
      ).trim();

      if (!title) {
        return;
      }

      void runHostAction(
        "create_schedule_entry",
        {
          title,
          description,
          startsAt,
          endsAt,
        },
        "Schedule entry created.",
      ).then(() => {
        form.reset();
      });
    }}
  >
    <div className="text-sm font-semibold">
      Add Schedule Entry
    </div>

    <div className="mt-3 grid gap-3">
      <input
        name="scheduleTitle"
        type="text"
        required
        maxLength={200}
        placeholder="Title"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />

      <textarea
        name="scheduleDescription"
        maxLength={1000}
        rows={3}
        placeholder="Description (optional)"
        className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">
            Start
          </span>

          <input
            name="scheduleStartsAt"
            type="datetime-local"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">
            End
          </span>

          <input
            name="scheduleEndsAt"
            type="datetime-local"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={
            changingHostAction !== null
          }
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {changingHostAction ===
          "create_schedule_entry"
            ? "Adding..."
            : "Add Entry"}
        </button>
      </div>
    </div>
  </form>

  {/* EXISTING SCHEDULE ENTRIES */}
  <div className="mt-5 space-y-3">
    {data.operations.schedule.length === 0 ? (
      <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
        No schedule entries.
      </div>
    ) : (
      data.operations.schedule.map((entry) => (
        <div
          key={entry.id}
          className="rounded-xl border border-neutral-200 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">
                {entry.title}
              </div>

              {entry.description ? (
                <div className="mt-1 text-sm text-neutral-600">
                  {entry.description}
                </div>
              ) : null}

              {entry.startsAt ||
              entry.endsAt ? (
                <div className="mt-2 text-xs text-neutral-500">
                  {entry.startsAt
                    ? new Date(
                        entry.startsAt,
                      ).toLocaleString()
                    : "No start time"}

                  {entry.endsAt
                    ? ` – ${new Date(
                        entry.endsAt,
                      ).toLocaleString()}`
                    : ""}
                </div>
              ) : null}
            </div>

            <div className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold capitalize">
              {entry.status}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "upcoming",
              "current",
              "completed",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                type="button"
                disabled={
                  changingHostAction !== null ||
                  entry.status === status
                }
                onClick={() => {
                  void runHostAction(
                    "update_schedule_entry",
                    {
                      entryId: entry.id,
                      status,
                    },
                    "Schedule updated.",
                  );
                }}
                className={
                  entry.status === status
                    ? "rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white"
                    : "rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-40"
                }
              >
                {status === "current"
                  ? "Make Current"
                  : status === "completed"
                    ? "Complete"
                    : status ===
                        "cancelled"
                      ? "Cancel"
                      : "Upcoming"}
              </button>
            ))}
          </div>
        </div>
      ))
    )}
  </div>
</div>
      </div>

      {/* ANNOUNCEMENTS */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Announcements
            </h2>

            <p className="mt-1 text-sm text-neutral-600">
              Create and publish announcements
              to participants.
            </p>
          </div>

          <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
            {
              data.operations.announcements
                .length
            }
          </div>
        </div>

        {/* CREATE ANNOUNCEMENT */}
        <form
          className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
          onSubmit={(event) => {
            event.preventDefault();

            const form =
              event.currentTarget;

            const formData =
              new FormData(form);

            const title = String(
              formData.get(
                "announcementTitle",
              ) ?? "",
            ).trim();

            const announcementMessage =
              String(
                formData.get(
                  "announcementMessage",
                ) ?? "",
              ).trim();

            if (!announcementMessage) {
              return;
            }

            void runHostAction(
              "create_announcement",
              {
                title,
                message:
                  announcementMessage,
              },
              "Announcement created.",
            ).then((result) => {
              if (result) {
                form.reset();
              }
            });
          }}
        >
          <div className="text-sm font-semibold">
            Add Announcement
          </div>

          <div className="mt-3 grid gap-3">
            <input
              name="announcementTitle"
              type="text"
              maxLength={200}
              placeholder="Title (optional)"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />

            <textarea
              name="announcementMessage"
              required
              maxLength={2000}
              rows={4}
              placeholder="Announcement message"
              className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />

            <div>
              <button
                type="submit"
                disabled={
                  changingHostAction !== null
                }
                className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {changingHostAction ===
                "create_announcement"
                  ? "Adding..."
                  : "Add Announcement"}
              </button>
            </div>
          </div>
        </form>

        {/* PREPARED ANNOUNCEMENTS */}
        <div className="mt-5">
          <div className="mb-3 text-sm font-semibold">
            Prepared Announcements
          </div>

          <div className="space-y-3">
            {data.operations.announcements
              .length === 0 ? (
              <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
                No announcements.
              </div>
            ) : (
              data.operations.announcements.map(
                (announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        {announcement.title ? (
                          <div className="font-medium">
                            {
                              announcement.title
                            }
                          </div>
                        ) : null}

                        <div
                          className={
                            announcement.title
                              ? "mt-1 text-sm text-neutral-600"
                              : "text-sm text-neutral-600"
                          }
                        >
                          {
                            announcement.message
                          }
                        </div>

                        <div className="mt-2 text-xs text-neutral-500">
                          Status:{" "}
                          <span className="font-medium capitalize">
                            {
                              announcement.status
                            }
                          </span>
                        </div>

                        {announcement.publishedAt ? (
                          <div className="mt-1 text-xs text-neutral-500">
                            Published{" "}
                            {new Date(
                              announcement.publishedAt,
                            ).toLocaleString()}
                          </div>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        disabled={
                          changingHostAction !==
                            null ||
                          announcement.status ===
                            "published"
                        }
                        onClick={() => {
                          void runHostAction(
                            "publish_announcement",
                            {
                              announcementId:
                                announcement.id,
                            },
                            "Announcement published.",
                          );
                        }}
                        className={
                          announcement.status ===
                          "published"
                            ? "rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                            : "rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-40"
                        }
                      >
                        {changingHostAction ===
                        "publish_announcement"
                          ? "Publishing..."
                          : announcement.status ===
                              "published"
                            ? "Published"
                            : "Publish"}
                      </button>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </div>

      {!data.activity ? (        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
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
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {data.activity.name}
                </h2>

                <p className="mt-1 text-sm text-neutral-600">
                  Live participant activity and Host controls.
                </p>
              </div>

              <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
                {data.activityRuntime?.participantStates.length ??
                  0}{" "}
                active
              </div>
            </div>

{/* LOTTERY */}
{data.activity.activityType ===
"lottery" ? (
  <div className="mt-5 space-y-4">
    {(() => {
      const entrants =
        data.activityRuntime?.participantStates
          .map((participant) => {
            const entries = Array.isArray(
              participant.state.entries,
            )
              ? participant.state.entries
              : [];

            const entryCount =
              typeof participant.state
                .entryCount === "number"
                ? participant.state.entryCount
                : entries.length;

            return {
              participant,
              entryCount,
            };
          })
          .filter(
            ({ entryCount }) =>
              entryCount > 0,
          ) ?? [];

      return (
        <>
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  Participants Entered
                </div>

                <div className="mt-0.5 text-xs text-neutral-500">
                  Participants currently
                  entered in this drawing.
                </div>
              </div>

              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
                {entrants.length}{" "}
                {entrants.length === 1
                  ? "entrant"
                  : "entrants"}
              </div>
            </div>

            {entrants.length === 0 ? (
              <div className="p-4 text-sm text-neutral-500">
                No participants have entered
                the drawing yet.
              </div>
            ) : (
              entrants.map(
                ({
                  participant,
                  entryCount,
                }) => (
                  <div
                    key={
                      participant.participantId
                    }
                    className="flex items-center justify-between gap-4 border-b border-neutral-100 p-4 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-neutral-900">
                        {
                          participant.displayName
                        }
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                      {entryCount}{" "}
                      {entryCount === 1
                        ? "entry"
                        : "entries"}
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          {data.activityRuntime?.sharedState
            .lotteryWinner ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Current Winner
              </div>

              <div className="mt-1 text-lg font-semibold">
                {String(
                  (
                    data.activityRuntime
                      .sharedState
                      .lotteryWinner as Record<
                      string,
                      unknown
                    >
                  ).displayName ??
                    "Winner",
                )}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            disabled={
              changingHostAction !== null ||
              entrants.length === 0
            }
            onClick={() => {
              void runHostAction(
                "draw_lottery_winner",
                {},
                "Lottery winner selected.",
              );
            }}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {changingHostAction ===
            "draw_lottery_winner"
              ? "Drawing..."
              : "Draw Winner"}
          </button>
        </>
      );
    })()}
  </div>
) : null}

            {/* MYSTERY DROP */}
            {data.activity.activityType ===
              "mystery_drop" &&
            Array.isArray(
              data.activityRuntime
                ?.configuration.drops,
            ) ? (
              <div className="mt-5 space-y-3">
                {(
                  data.activityRuntime
                    .configuration.drops as Array<
                    Record<string, unknown>
                  >
                ).map((drop) => {
                  const dropId = String(
                    drop.id ?? "",
                  );

                  const current =
                    data.activityRuntime
                      ?.sharedState
                      .currentDropId === dropId;

                  return (
                    <div
                      key={dropId}
                      className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 p-4"
                    >
                      <div>
                        <div className="font-medium">
                          {String(
                            drop.title ??
                              "Mystery Drop",
                          )}
                        </div>

                        <div className="mt-1 text-xs text-neutral-500">
                          {current
                            ? "Currently released"
                            : "Not released"}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          changingHostAction !==
                            null || current
                        }
                        onClick={() => {
                          void runHostAction(
                            "set_mystery_drop",
                            { dropId },
                            "Mystery Drop released.",
                          );
                        }}
                        className={
                          current
                            ? "rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                            : "rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-40"
                        }
                      >
                        {current
                          ? "Current"
                          : "Release"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}

{/* SPIN WHEEL */}
{data.activityRuntime &&
data.activity.activityType ===
  "spin_wheel" ? (
  <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200">
    {data.activityRuntime
      .participantStates.length === 0 ? (
      <div className="p-4 text-sm text-neutral-500">
        No participant activity yet.
      </div>
    ) : (
      data.activityRuntime.participantStates.map(
        (participant) => (
          <div
            key={participant.participantId}
            className="flex items-center justify-between gap-4 border-b border-neutral-100 p-4 last:border-b-0"
          >
            <div>
              <div className="font-medium">
                {participant.displayName}
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                Score: {participant.score}
              </div>
            </div>

            <div className="max-w-[55%] text-right text-xs text-neutral-500">
              {Object.keys(
                participant.state,
              ).length > 0
                ? Object.entries(
                    participant.state,
                  )
                    .map(
                      ([key, value]) =>
                        `${key}: ${
                          Array.isArray(value)
                            ? value.length
                            : String(
                                value ?? "",
                              )
                        }`,
                    )
                    .join(" • ")
                : "Waiting"}
            </div>
          </div>
        ),
      )
    )}
  </div>
) : null}

{/* SCAVENGER HUNT */}
{data.activityRuntime &&
data.activity.activityType ===
  "scavenger_hunt" ? (
  <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200">
    {data.activityRuntime
      .participantStates.length === 0 ? (
      <div className="p-4 text-sm text-neutral-500">
        No participant activity yet.
      </div>
    ) : (
      data.activityRuntime.participantStates.map(
        (participant) => {
          const configuredItems =
            Array.isArray(
              data.activityRuntime
                ?.configuration?.items,
            )
              ? (data.activityRuntime
                  .configuration
                  .items as HostScavengerHuntItem[])
              : [];

          const completedItems =
            participant.state
              .completedItems &&
            typeof participant.state
              .completedItems ===
              "object" &&
            !Array.isArray(
              participant.state
                .completedItems,
            )
              ? (participant.state
                  .completedItems as Record<
                  string,
                  HostScavengerHuntCompletion
                >)
              : {};

          const completions =
            Object.entries(
              completedItems,
            ).map(
              ([
                itemId,
                completion,
              ]) => ({
                item:
                  configuredItems.find(
                    (item) =>
                      item.id === itemId,
                  ) ?? null,
                completion,
              }),
            );

          const scavengerPoints =
            completions.reduce(
              (
                total,
                { completion },
              ) =>
                total +
                Math.max(
                  0,
                  Number(
                    completion
                      .awardedPoints,
                  ) || 0,
                ),
              0,
            );

          return (
            <div
              key={
                participant.participantId
              }
              className="border-b border-neutral-100 p-4 last:border-b-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-neutral-900">
                    {
                      participant.displayName
                    }
                  </div>

                  <div className="mt-1 text-sm text-neutral-600">
                    Scavenger Hunt Points:{" "}
                    <span className="font-semibold text-neutral-900">
                      {scavengerPoints}
                    </span>
                  </div>
                </div>

                <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                  {completions.length}{" "}
                  {completions.length === 1
                    ? "item"
                    : "items"}{" "}
                  completed
                </div>
              </div>

              {completions.length === 0 ? (
                <div className="mt-3 text-sm text-neutral-500">
                  No items completed yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {completions.map(
                    ({
                      item,
                      completion,
                    }) => (
                      <div
                        key={
                          item?.id ??
                          completion.completedAt
                        }
                        className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                      >
                        <div className="text-sm text-neutral-800">
                          <span className="font-semibold text-neutral-900">
                            Found:
                          </span>{" "}
                          {item?.title ??
                            "Scavenger Hunt Item"}
                        </div>

                        <div className="mt-2 text-sm text-neutral-800">
                          <span className="font-semibold text-neutral-900">
                            Description:
                          </span>{" "}
                          {completion.responseText ||
                            "No description provided."}
                        </div>

                        <div className="mt-2 text-sm text-neutral-800">
                          <span className="font-semibold text-neutral-900">
                            Points:
                          </span>{" "}
                          +
                          {Math.max(
                            0,
                            Number(
                              completion
                                .awardedPoints,
                            ) || 0,
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          );
        },
      )
    )}
  </div>
) : null}

            {/* OTHER LIVE BLOCKS */}
            {!data.activityRuntime &&
            data.activity.activityType !==
              "lottery" &&
            data.activity.activityType !==
              "mystery_drop" ? (
              <div className="mt-5 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
                This Live block does not
                require activity-specific
                Host controls.
              </div>
            ) : null}
          </div>

<Leaderboard
  entries={data.leaderboard}
  removingParticipant={changingHostAction === "remove_participant"}
onRemoveParticipant={(entry) => {
  setParticipantToRemove(entry);
}}

/>
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
  entries={data.leaderboard}
  removingParticipant={
    changingHostAction === "remove_participant"
  }
onRemoveParticipant={(entry) => {
  setParticipantToRemove(entry);
}}
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

      {participantToDelete && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-participant-title"
      aria-describedby="delete-participant-description"
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
    >
      <h2
        id="delete-participant-title"
        className="text-xl font-bold text-red-700"
      >
        Permanently Delete Participant?
      </h2>

      <p
        id="delete-participant-description"
        className="mt-3 text-sm text-neutral-700"
      >
        You are about to permanently delete{" "}
        <strong>{participantToDelete.displayName}</strong>.
        This will also delete their points, activity
        progress, votes, song requests, and session records.
      </p>

      <p className="mt-3 text-sm font-semibold text-red-700">
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setParticipantToDelete(null)}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={async () => {
            const participantId =
              participantToDelete.participantId;

            setParticipantToDelete(null);

            await runHostAction(
              "delete_participant",
              { participantId },
              "Participant permanently deleted.",
            );
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Permanently Delete
        </button>
      </div>
    </div>
  </div>
)}

            {participantToRemove ? (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-participant-title"
          aria-describedby="remove-participant-description"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              changingHostAction !== "remove_participant"
            ) {
              setParticipantToRemove(null);
            }
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Escape" &&
              changingHostAction !== "remove_participant"
            ) {
              setParticipantToRemove(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Participant Management
                </div>

                <h2
                  id="remove-participant-title"
                  className="mt-2 text-xl font-semibold text-neutral-900"
                >
                  Remove participant?
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close dialog"
                disabled={
                  changingHostAction === "remove_participant"
                }
                onClick={() => setParticipantToRemove(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <p
              id="remove-participant-description"
              className="mt-4 text-sm leading-6 text-neutral-600"
            >
              Are you sure you want to remove{" "}
              <span className="font-semibold text-neutral-900">
                {participantToRemove.displayName}
              </span>{" "}
              from this Live Experience?
            </p>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm leading-6 text-neutral-600">
                This participant will be disconnected
                from the Live Experience and will need
                to join again to participate.
                Their previous activity history and
                points will be preserved.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={
                  changingHostAction === "remove_participant"
                }
                onClick={() => setParticipantToRemove(null)}
                className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  changingHostAction === "remove_participant"
                }
                onClick={async () => {
                  const entry = participantToRemove;

                  const result = await runHostAction(
                    "remove_participant",
                    {
                      participantId: entry.participantId,
                    },
                    `${entry.displayName} was removed from the Live Experience.`,
                  );

                  if (result?.ok) {
                    setParticipantToRemove(null);
                  }
                }}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changingHostAction === "remove_participant"
                  ? "Removing..."
                  : "Remove Participant"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
  removingParticipant,
  onRemoveParticipant,
}: {
  entries: LeaderboardEntry[];
  removingParticipant: boolean;
  onRemoveParticipant: (entry: LeaderboardEntry) => void;
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

<div className="flex shrink-0 items-center gap-3">
  <div className="text-sm font-semibold">
    {entry.score} pts
  </div>

  <button
    type="button"
    title={`Remove ${entry.displayName}`}
    aria-label={`Remove ${entry.displayName}`}
    disabled={removingParticipant}
    onClick={() => onRemoveParticipant(entry)}
    className="flex h-8 w-8 items-center justify-center rounded-lg text-xl font-black text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-40"
  >
    ×
  </button>
</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}