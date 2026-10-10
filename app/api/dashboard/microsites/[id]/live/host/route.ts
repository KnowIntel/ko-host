// app/api/dashboard/microsites/[id]/live/host/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UnknownRecord = Record<
  string,
  unknown
>;

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

type PollChoice = {
  id: string;
  label: string;
};

type PollQuestion = {
  id: string;
  question: string;
  choices: PollChoice[];
};

function asRecord(
  value: unknown,
): UnknownRecord {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord;
  }

  return {};
}

function parseTriviaQuestion(
  value: unknown,
): TriviaQuestion | null {
  const source = asRecord(value);

  const id =
    typeof source.id === "string"
      ? source.id.trim()
      : "";

  const question =
    typeof source.question === "string"
      ? source.question.trim()
      : "";

  const rawChoices = Array.isArray(
    source.choices,
  )
    ? source.choices
    : [];

  const choices = rawChoices
    .map((choice) => {
      const item = asRecord(choice);

      const choiceId =
        typeof item.id === "string"
          ? item.id.trim()
          : "";

      const label =
        typeof item.label === "string"
          ? item.label.trim()
          : "";

      if (!choiceId || !label) {
        return null;
      }

      return {
        id: choiceId,
        label,
      };
    })
    .filter(
      (
        choice,
      ): choice is TriviaChoice =>
        choice !== null,
    );

  const correctChoiceId =
    typeof source.correctChoiceId ===
    "string"
      ? source.correctChoiceId.trim()
      : "";

  const rawPoints =
    typeof source.points === "number" &&
    Number.isFinite(source.points)
      ? Math.trunc(source.points)
      : 100;

  const points = Math.max(
    0,
    Math.min(rawPoints, 100000),
  );

  if (
    !id ||
    !question ||
    choices.length < 2 ||
    !correctChoiceId
  ) {
    return null;
  }

  if (
    !choices.some(
      (choice) =>
        choice.id === correctChoiceId,
    )
  ) {
    return null;
  }

  return {
    id,
    question,
    choices,
    correctChoiceId,
    points,
  };
}

function parsePollQuestion(
  value: unknown,
): PollQuestion | null {
  const source = asRecord(value);

  const id =
    typeof source.id === "string"
      ? source.id.trim()
      : "";

  const question =
    typeof source.question === "string"
      ? source.question.trim()
      : "";

  const rawChoices = Array.isArray(
    source.choices,
  )
    ? source.choices
    : [];

  const choices = rawChoices
    .map((choice) => {
      const item = asRecord(choice);

      const choiceId =
        typeof item.id === "string"
          ? item.id.trim()
          : "";

      const label =
        typeof item.label === "string"
          ? item.label.trim()
          : "";

      if (!choiceId || !label) {
        return null;
      }

      return {
        id: choiceId,
        label,
      };
    })
    .filter(
      (
        choice,
      ): choice is PollChoice =>
        choice !== null,
    );

  if (
    !id ||
    !question ||
    choices.length < 2
  ) {
    return null;
  }

  return {
    id,
    question,
    choices,
  };
}

export async function GET(
  _request: Request,
  ctx: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await ctx.params;

    const micrositeId = String(id || "")
      .trim()
      .toLowerCase();

    if (!UUID_PATTERN.test(micrositeId)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid microsite.",
        },
        { status: 400 },
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const sb = getSupabaseAdmin();

    /*
     * Verify microsite ownership first.
     */
    const {
      data: microsite,
      error: micrositeError,
    } = await sb
      .from("microsites")
      .select(
        "id, owner_clerk_user_id, slug, title",
      )
      .eq("id", micrositeId)
      .maybeSingle();

    if (
      micrositeError ||
      !microsite ||
      microsite.owner_clerk_user_id !==
        userId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    /*
     * Resolve the owner's Live experience.
     */
    const {
      data: experience,
      error: experienceError,
    } = await sb
      .from("live_experiences")
      .select(`
        id,
        microsite_id,
        name,
        status,
        is_enabled,
        started_at,
        ended_at,
        created_at,
        updated_at
      `)
      .eq(
        "microsite_id",
        micrositeId,
      )
      .eq(
        "owner_clerk_user_id",
        userId,
      )
      .maybeSingle();

    if (experienceError) {
      console.error(
        "Host Control experience lookup failed:",
        experienceError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live experience.",
        },
        { status: 500 },
      );
    }

    if (!experience) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Live has not been enabled for this microsite.",
        },
        { status: 404 },
      );
    }

    /*
     * Resolve authoritative shared state.
     */
    const {
      data: sharedState,
      error: sharedStateError,
    } = await sb
      .from("live_experience_state")
      .select(`
        current_activity_type,
        current_activity_id,
        state,
        updated_at
      `)
      .eq(
        "experience_id",
        experience.id,
      )
      .maybeSingle();

    if (sharedStateError) {
      console.error(
        "Host Control shared-state lookup failed:",
        sharedStateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live state.",
        },
        { status: 500 },
      );
    }

    /*
     * Active participants are used for
     * Host Control counts and leaderboard.
     */
    const {
      data: participants,
      error: participantsError,
    } = await sb
      .from("live_participants")
      .select(`
        id,
        display_name,
        avatar_url,
        status,
        created_at,
        last_seen_at
      `)
      .eq(
        "experience_id",
        experience.id,
      );

    if (participantsError) {
      console.error(
        "Host Control participant lookup failed:",
        participantsError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live participants.",
        },
        { status: 500 },
      );
    }

const activeParticipants = (
  participants ?? []
).filter(
  (participant) =>
    participant.status === "active",
);

    /*
     * Score comes from the immutable
     * point ledger.
     */
    const {
      data: pointRows,
      error: pointError,
    } = await sb
      .from("live_point_transactions")
      .select(`
        participant_id,
        amount
      `)
      .eq(
        "experience_id",
        experience.id,
      );

    if (pointError) {
      console.error(
        "Host Control point lookup failed:",
        pointError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live scores.",
        },
        { status: 500 },
      );
    }

    const scoreByParticipant =
      new Map<string, number>();

    for (const row of pointRows ?? []) {
      const participantId = String(
        row.participant_id || "",
      );

      if (!participantId) {
        continue;
      }

      scoreByParticipant.set(
        participantId,
        (scoreByParticipant.get(
          participantId,
        ) ?? 0) +
          Number(row.amount || 0),
      );
    }
    
        const participantRecords = (
      participants ?? []
    )
      .map((participant) => ({
        participantId: participant.id,
        displayName: participant.display_name,
        avatarUrl: participant.avatar_url ?? null,
        status: participant.status,
        score:
          scoreByParticipant.get(participant.id) ?? 0,
        joinedAt: participant.created_at,
        lastSeenAt: participant.last_seen_at ?? null,
      }))
      .sort(
        (a, b) =>
          new Date(b.joinedAt).getTime() -
          new Date(a.joinedAt).getTime(),
      );

    const leaderboard = (
      activeParticipants
    )
      .map((participant) => ({
        participantId:
          participant.id,

        displayName:
          participant.display_name,

        avatarUrl:
          participant.avatar_url ??
          null,

        score:
          scoreByParticipant.get(
            participant.id,
          ) ?? 0,

        lastSeenAt:
          participant.last_seen_at ??
          null,
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.displayName.localeCompare(
            b.displayName,
          ),
      )
      .map((participant, index) => ({
        ...participant,
        rank: index + 1,
      }));

      /*
 * ================================================================
 * GLOBAL LIVE OPERATIONS
 *
 * These tools are experience-wide and can remain visible in Host
 * Control regardless of which activity is currently active.
 * ================================================================
 */

const [
  scheduleResult,
  songRequestResult,
  announcementResult,
] = await Promise.all([
  sb
    .from("live_schedule_entries")
    .select(`
      id,
      title,
      description,
      starts_at,
      ends_at,
      status,
      sort_order,
      created_at,
      updated_at
    `)
    .eq(
      "experience_id",
      experience.id,
    )
    .order("sort_order", {
      ascending: true,
    })
    .order("starts_at", {
      ascending: true,
    }),

  sb
    .from("live_song_requests")
    .select(`
      id,
      participant_id,
      song_title,
      artist_name,
      status,
      sort_order,
      requested_at,
      updated_at
    `)
    .eq(
      "experience_id",
      experience.id,
    )
    .order("sort_order", {
      ascending: true,
    })
    .order("requested_at", {
      ascending: true,
    }),

  sb
    .from("live_announcements")
    .select(`
      id,
      title,
      message,
      status,
      published_at,
      created_at,
      updated_at
    `)
    .eq(
      "experience_id",
      experience.id,
    )
    .order("created_at", {
      ascending: false,
    }),
]);

if (scheduleResult.error) {
  console.error(
    "Host Control schedule lookup failed:",
    scheduleResult.error,
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Unable to load Live Schedule.",
    },
    { status: 500 },
  );
}

if (songRequestResult.error) {
  console.error(
    "Host Control Song Request lookup failed:",
    songRequestResult.error,
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Unable to load Song Requests.",
    },
    { status: 500 },
  );
}

if (announcementResult.error) {
  console.error(
    "Host Control Announcement lookup failed:",
    announcementResult.error,
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Unable to load Announcements.",
    },
    { status: 500 },
  );
}

const participantById =
  new Map(
    (activeParticipants).map(
      (participant) => [
        String(participant.id),

        {
          displayName:
            participant.display_name,

          avatarUrl:
            participant.avatar_url ??
            null,
        },
      ],
    ),
  );

const schedule =
  (
    scheduleResult.data ?? []
  ).map((entry) => ({
    id: entry.id,

    title: entry.title,

    description:
      entry.description ?? "",

    startsAt:
      entry.starts_at,

    endsAt:
      entry.ends_at,

    status:
      entry.status,

    sortOrder:
      entry.sort_order,

    createdAt:
      entry.created_at,

    updatedAt:
      entry.updated_at,
  }));

const songRequests =
  (
    songRequestResult.data ?? []
  ).map((request) => {
    const participant =
      participantById.get(
        String(
          request.participant_id,
        ),
      );

    return {
      id: request.id,

      participantId:
        request.participant_id,

      participantName:
        participant?.displayName ??
        "Participant",

      participantAvatarUrl:
        participant?.avatarUrl ??
        null,

      songTitle:
        request.song_title,

      artistName:
        request.artist_name ??
        null,

      status:
        request.status,

      sortOrder:
        request.sort_order,

      requestedAt:
        request.requested_at,

      createdAt:
        request.requested_at,

      updatedAt:
        request.updated_at,
    };
  });

const announcements =
  (
    announcementResult.data ?? []
  ).map((announcement) => ({
    id:
      announcement.id,

    title:
      announcement.title,

    message:
      announcement.message,

    status:
      announcement.status,

    publishedAt:
      announcement.published_at,

    createdAt:
      announcement.created_at,

    updatedAt:
      announcement.updated_at,
  }));

const operations = {
  schedule,
  songRequests,
  announcements,
};

    const currentActivityId =
      sharedState?.current_activity_id
        ? String(
            sharedState.current_activity_id,
          )
        : null;

    /*
     * There may be no current activity.
     */
    if (!currentActivityId) {
      return NextResponse.json({
        ok: true,

        microsite: {
          id: microsite.id,
          title: microsite.title,
          slug: microsite.slug,
        },

        experience: {
          id: experience.id,
          name: experience.name,
          status: experience.status,
          isEnabled:
            experience.is_enabled,
          startedAt:
            experience.started_at,
          endedAt:
            experience.ended_at,
          updatedAt:
            experience.updated_at,
        },

        sharedState: {
          currentActivityType:
            sharedState?.current_activity_type ??
            null,

          currentActivityId: null,

          state:
            sharedState?.state ?? {},

          updatedAt:
            sharedState?.updated_at ??
            null,
        },

        participantCount:
          activeParticipants.length,

        leaderboard,
        participantRecords,

activity: null,

trivia: null,
poll: null,

activityRuntime: null,

operations,
      });
    }

    /*
     * Load the current activity only from
     * this Live experience.
     */
    const {
      data: activity,
      error: activityError,
    } = await sb
      .from("live_activities")
      .select(`
        id,
        experience_id,
        activity_type,
        name,
        status,
        configuration,
        scheduled_for,
        started_at,
        completed_at,
        updated_at
      `)
      .eq(
        "id",
        currentActivityId,
      )
      .eq(
        "experience_id",
        experience.id,
      )
      .maybeSingle();

    if (activityError) {
      console.error(
        "Host Control activity lookup failed:",
        activityError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load current Live activity.",
        },
        { status: 500 },
      );
    }

    if (!activity) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Current Live activity could not be found.",
        },
        { status: 409 },
      );
    }

    let trivia: UnknownRecord | null =
      null;

    let poll: UnknownRecord | null =
      null;

let activityRuntime:
  | UnknownRecord
  | null = null;

/*
 * Load generic participant activity
 * state for the newer Live activity
 * types.
 *
 * Trivia and Poll keep their existing
 * specialized authoritative handling.
 */
if (
  [
    "spin_wheel",
    "scavenger_hunt",
    "lottery",
    "mystery_drop",
  ].includes(
    String(
      activity.activity_type,
    ),
  )
) {
  const {
    data: runtimeRows,
    error: runtimeRowsError,
  } = await sb
    .from(
      "live_participant_activity_state",
    )
    .select(`
      participant_id,
      state,
      completed_at,
      created_at,
      updated_at
    `)
    .eq(
      "experience_id",
      experience.id,
    )
    .eq(
      "activity_id",
      activity.id,
    );

  if (runtimeRowsError) {
    console.error(
      "Host Control activity runtime lookup failed:",
      runtimeRowsError,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load Live activity results.",
      },
      { status: 500 },
    );
  }

  activityRuntime = {
    activityType:
      activity.activity_type,

    configuration:
      asRecord(
        activity.configuration,
      ),

    participantCount:
      activeParticipants.length,

    participantStates:
      (
        runtimeRows ?? []
      ).map((row) => {
        const participant =
          participantById.get(
            String(
              row.participant_id,
            ),
          );

        return {
          participantId:
            row.participant_id,

          displayName:
            participant?.displayName ??
            "Participant",

          avatarUrl:
            participant?.avatarUrl ??
            null,

          score:
            scoreByParticipant.get(
              String(
                row.participant_id,
              ),
            ) ?? 0,

          state:
            asRecord(
              row.state,
            ),

          completedAt:
            row.completed_at,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,
        };
      }),

    sharedState:
      asRecord(
        sharedState?.state,
      ),
  };
}

    /*
     * ================================================================
     * TRIVIA
     * ================================================================
     */
    if (
      activity.activity_type ===
      "trivia"
    ) {
      const configuration = asRecord(
        activity.configuration,
      );

      const rawQuestions =
        Array.isArray(
          configuration.questions,
        )
          ? configuration.questions
          : [];

      const questions = rawQuestions
        .map(parseTriviaQuestion)
        .filter(
          (
            question,
          ): question is TriviaQuestion =>
            question !== null,
        );

      const runtimeState = asRecord(
        sharedState?.state,
      );

      const requestedQuestionId =
        typeof runtimeState.currentQuestionId ===
        "string"
          ? runtimeState.currentQuestionId.trim()
          : "";

      const currentQuestion =
        questions.find(
          (question) =>
            question.id ===
            requestedQuestionId,
        ) ??
        questions[0] ??
        null;

      const {
        data: participantStates,
        error: participantStateError,
      } = await sb
        .from(
          "live_participant_activity_state",
        )
        .select(`
          participant_id,
          state,
          completed_at,
          updated_at
        `)
        .eq(
          "experience_id",
          experience.id,
        )
        .eq(
          "activity_id",
          activity.id,
        );

      if (participantStateError) {
        console.error(
          "Host Control participant-state lookup failed:",
          participantStateError,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to load Trivia participant results.",
          },
          { status: 500 },
        );
      }

      const stateByParticipant =
        new Map<
          string,
          UnknownRecord
        >();

      for (
        const row of
          participantStates ?? []
      ) {
        stateByParticipant.set(
          String(
            row.participant_id,
          ),
          asRecord(row.state),
        );
      }

      const answerCountByChoice =
        new Map<string, number>();

      if (currentQuestion) {
        for (
          const choice of
            currentQuestion.choices
        ) {
          answerCountByChoice.set(
            choice.id,
            0,
          );
        }
      }

      let answeredCount = 0;
      let correctCount = 0;

      const participantResults = (
        activeParticipants
      ).map((participant) => {
        const participantState =
          stateByParticipant.get(
            participant.id,
          ) ?? {};

        const answers = asRecord(
          participantState.answers,
        );

        const currentAnswer =
          currentQuestion
            ? asRecord(
                answers[
                  currentQuestion.id
                ],
              )
            : {};

        const choiceId =
          typeof currentAnswer.choiceId ===
          "string"
            ? currentAnswer.choiceId
            : null;

        const hasAnswered =
          Boolean(choiceId);

        const correct =
          currentAnswer.correct ===
          true;

        const awardedPoints =
          typeof currentAnswer.awardedPoints ===
            "number" &&
          Number.isFinite(
            currentAnswer.awardedPoints,
          )
            ? currentAnswer.awardedPoints
            : 0;

        const answeredAt =
          typeof currentAnswer.answeredAt ===
          "string"
            ? currentAnswer.answeredAt
            : null;

        if (
          hasAnswered &&
          choiceId
        ) {
          answeredCount += 1;

          answerCountByChoice.set(
            choiceId,
            (answerCountByChoice.get(
              choiceId,
            ) ?? 0) + 1,
          );

          if (correct) {
            correctCount += 1;
          }
        }

        return {
          participantId:
            participant.id,

          displayName:
            participant.display_name,

          avatarUrl:
            participant.avatar_url ??
            null,

          score:
            scoreByParticipant.get(
              participant.id,
            ) ?? 0,

          hasAnswered,

          choiceId,

          correct:
            hasAnswered
              ? correct
              : null,

          awardedPoints:
            hasAnswered
              ? awardedPoints
              : null,

          answeredAt,
        };
      });

      const participantCount =
        activeParticipants.length;

      const unansweredCount =
        Math.max(
          participantCount -
            answeredCount,
          0,
        );

      const incorrectCount =
        Math.max(
          answeredCount -
            correctCount,
          0,
        );

      const answerDistribution =
        currentQuestion
          ? currentQuestion.choices.map(
              (choice) => {
                const count =
                  answerCountByChoice.get(
                    choice.id,
                  ) ?? 0;

                return {
                  choiceId:
                    choice.id,

                  label:
                    choice.label,

                  count,

                  percentage:
                    answeredCount > 0
                      ? Math.round(
                          (count /
                            answeredCount) *
                            100,
                        )
                      : 0,

                  isCorrect:
                    choice.id ===
                    currentQuestion.correctChoiceId,
                };
              },
            )
          : [];

      trivia = {
        questions: questions.map(
          (
            question,
            index,
          ) => ({
            id: question.id,
            question:
              question.question,
            points:
              question.points,
            choices:
              question.choices,
            correctChoiceId:
              question.correctChoiceId,
            index,
          }),
        ),

        currentQuestion:
          currentQuestion
            ? {
                id:
                  currentQuestion.id,

                question:
                  currentQuestion.question,

                choices:
                  currentQuestion.choices,

                correctChoiceId:
                  currentQuestion.correctChoiceId,

                points:
                  currentQuestion.points,

                index:
                  questions.findIndex(
                    (question) =>
                      question.id ===
                      currentQuestion.id,
                  ),
              }
            : null,

        results: {
          participantCount,
          answeredCount,
          unansweredCount,
          correctCount,
          incorrectCount,
          answerDistribution,
          participants:
            participantResults,
        },
      };
    }

    /*
     * ================================================================
     * POLL
     * ================================================================
     */
    if (
      activity.activity_type ===
      "poll"
    ) {
      const configuration =
        asRecord(
          activity.configuration,
        );

      const questions = (
        Array.isArray(
          configuration.questions,
        )
          ? configuration.questions
          : []
      )
        .map(parsePollQuestion)
        .filter(
          (
            question,
          ): question is PollQuestion =>
            question !== null,
        )
        .map(
          (
            question,
            index,
          ) => ({
            ...question,
            index,
          }),
        );

      const runtimeState =
        asRecord(
          sharedState?.state,
        );

      const requestedQuestionId =
        typeof runtimeState.currentQuestionId ===
        "string"
          ? runtimeState.currentQuestionId.trim()
          : "";

      const currentQuestion =
        questions.find(
          (question) =>
            question.id ===
            requestedQuestionId,
        ) ??
        questions[0] ??
        null;

      /*
       * Poll votes come exclusively from
       * the atomic server-authoritative
       * vote table.
       */
      const {
        data: pollVoteRows,
        error: pollVoteRowsError,
      } = await sb
        .from("live_poll_votes")
        .select(`
          participant_id,
          question_id,
          choice_id,
          created_at
        `)
        .eq(
          "experience_id",
          experience.id,
        )
        .eq(
          "activity_id",
          activity.id,
        );

      if (pollVoteRowsError) {
        console.error(
          "Host Control Poll vote lookup failed:",
          pollVoteRowsError,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to load Poll results.",
          },
          { status: 500 },
        );
      }

      const countByChoice =
        new Map<string, number>();

      if (currentQuestion) {
        for (
          const choice of
            currentQuestion.choices
        ) {
          countByChoice.set(
            choice.id,
            0,
          );
        }
      }

      const currentVotes =
        currentQuestion
          ? (
              pollVoteRows ?? []
            ).filter(
              (row) =>
                row.question_id ===
                currentQuestion.id,
            )
          : [];

      const voteByParticipant =
        new Map<
          string,
          {
            choiceId: string;
            votedAt: string;
          }
        >();

      for (
        const row of currentVotes
      ) {
        if (
          !countByChoice.has(
            row.choice_id,
          )
        ) {
          continue;
        }

        countByChoice.set(
          row.choice_id,
          (countByChoice.get(
            row.choice_id,
          ) ?? 0) + 1,
        );

        voteByParticipant.set(
          row.participant_id,
          {
            choiceId:
              row.choice_id,

            votedAt:
              row.created_at,
          },
        );
      }

      const participantCount =
        activeParticipants.length;

      const votedCount =
        voteByParticipant.size;

      const waitingCount =
        Math.max(
          participantCount -
            votedCount,
          0,
        );

      const voteDistribution =
        currentQuestion
          ? currentQuestion.choices.map(
              (choice) => {
                const count =
                  countByChoice.get(
                    choice.id,
                  ) ?? 0;

                return {
                  choiceId:
                    choice.id,

                  label:
                    choice.label,

                  count,

                  percentage:
                    votedCount > 0
                      ? Math.round(
                          (count /
                            votedCount) *
                            100,
                        )
                      : 0,
                };
              },
            )
          : [];

      const participantResults = (
        activeParticipants
      ).map((participant) => {
        const vote =
          voteByParticipant.get(
            participant.id,
          );

        return {
          participantId:
            participant.id,

          displayName:
            participant.display_name,

          avatarUrl:
            participant.avatar_url ??
            null,

          hasVoted:
            Boolean(vote),

          choiceId:
            vote?.choiceId ??
            null,

          votedAt:
            vote?.votedAt ??
            null,
        };
      });

      poll = {
        questions,

        currentQuestion,

        results: {
          participantCount,
          votedCount,
          waitingCount,
          voteDistribution,
          participants:
            participantResults,
        },
      };
    }

    return NextResponse.json({
      ok: true,

      microsite: {
        id: microsite.id,
        title: microsite.title,
        slug: microsite.slug,
      },

      experience: {
        id: experience.id,
        name: experience.name,
        status:
          experience.status,
        isEnabled:
          experience.is_enabled,
        startedAt:
          experience.started_at,
        endedAt:
          experience.ended_at,
        updatedAt:
          experience.updated_at,
      },

      sharedState: {
        currentActivityType:
          sharedState?.current_activity_type ??
          null,

        currentActivityId:
          currentActivityId,

        state:
          sharedState?.state ?? {},

        updatedAt:
          sharedState?.updated_at ??
          null,
      },

      participantCount:
        activeParticipants.length,

      leaderboard,
        participantRecords,

      activity: {
        id: activity.id,
        activityType:
          activity.activity_type,
        name: activity.name,
        status: activity.status,
        scheduledFor:
          activity.scheduled_for,
        startedAt:
          activity.started_at,
        completedAt:
          activity.completed_at,
        updatedAt:
          activity.updated_at,
      },

trivia,
poll,

activityRuntime,

operations,
    });
  } catch (error) {
    console.error(
      "Host Control GET error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load Host Control.",
      },
      { status: 500 },
    );
  }
}