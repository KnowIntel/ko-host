import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
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
  {
    params,
  }: {
    params: Promise<{
      experienceId: string;
    }>;
  },
) {
  try {
    const { experienceId } =
      await params;

    const safeExperienceId = String(
      experienceId || "",
    )
      .trim()
      .toLowerCase();

    if (
      !UUID_PATTERN.test(
        safeExperienceId,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid Live experience.",
        },
        { status: 400 },
      );
    }

    const authentication =
      await authenticateLiveParticipant(
        safeExperienceId,
      );

    if (!authentication.ok) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          error:
            authentication.error,
        },
        {
          status:
            authentication.status,
        },
      );
    }

    const participant =
      authentication.participant;

    const supabase =
      getSupabaseAdmin();

    /*
     * Resolve the Poll exclusively from
     * authoritative shared Live state.
     */
    const {
      data: sharedState,
      error: sharedStateError,
    } = await supabase
      .from("live_experience_state")
      .select(`
        current_activity_type,
        current_activity_id,
        state,
        updated_at
      `)
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .maybeSingle();

    if (sharedStateError) {
      console.error(
        "Poll shared-state lookup failed:",
        sharedStateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Poll.",
        },
        { status: 500 },
      );
    }

    if (
      !sharedState ||
      sharedState.current_activity_type !==
        "poll" ||
      !sharedState.current_activity_id
    ) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        active: false,
        activity: null,
        participantState: null,
        results: null,
      });
    }

    const activityId = String(
      sharedState.current_activity_id,
    );

    const {
      data: activity,
      error: activityError,
    } = await supabase
      .from("live_activities")
      .select(`
        id,
        experience_id,
        activity_type,
        name,
        status,
        configuration,
        started_at,
        completed_at,
        updated_at
      `)
      .eq("id", activityId)
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .eq(
        "activity_type",
        "poll",
      )
      .maybeSingle();

    if (activityError) {
      console.error(
        "Poll activity lookup failed:",
        activityError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Poll.",
        },
        { status: 500 },
      );
    }

    if (
      !activity ||
      activity.status !== "active"
    ) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        active: false,
        activity: null,
        participantState: null,
        results: null,
      });
    }

    const configuration =
      asRecord(
        activity.configuration,
      );

    const questions =
      Array.isArray(
        configuration.questions,
      )
        ? configuration.questions
        : [];

    const runtimeState =
      asRecord(sharedState.state);

    const requestedQuestionId =
      typeof runtimeState.currentQuestionId ===
      "string"
        ? runtimeState.currentQuestionId.trim()
        : "";

    let questionSource:
      | unknown
      | null = null;

    if (requestedQuestionId) {
      questionSource =
        questions.find(
          (question) =>
            String(
              asRecord(question).id ||
                "",
            ).trim() ===
            requestedQuestionId,
        ) ?? null;
    }

    /*
     * Match Trivia behavior: if the host
     * has not selected a question yet,
     * use the first configured question.
     */
    if (
      !questionSource &&
      questions.length > 0
    ) {
      questionSource =
        questions[0];
    }

    const question =
      parsePollQuestion(
        questionSource,
      );

/*
 * Load authoritative Poll votes.
 */
const {
  data: voteRows,
  error: voteRowsError,
} = await supabase
  .from("live_poll_votes")
  .select(`
    participant_id,
    question_id,
    choice_id,
    created_at
  `)
  .eq(
    "experience_id",
    safeExperienceId,
  )
  .eq(
    "activity_id",
    activity.id,
  );

if (voteRowsError) {
  console.error(
    "Poll results lookup failed:",
    voteRowsError,
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

const participantVotes:
  Record<
    string,
    {
      choiceId: string;
      votedAt: string;
    }
  > = {};

for (const row of voteRows ?? []) {
  if (
    row.participant_id ===
    participant.participantId
  ) {
    participantVotes[
      row.question_id
    ] = {
      choiceId: row.choice_id,
      votedAt: row.created_at,
    };
  }
}

const counts =
  new Map<string, number>();

if (question) {
  for (const choice of question.choices) {
    counts.set(choice.id, 0);
  }
}

let totalVotes = 0;

if (question) {
  for (const row of voteRows ?? []) {
    if (
      row.question_id !== question.id ||
      !counts.has(row.choice_id)
    ) {
      continue;
    }

    counts.set(
      row.choice_id,
      (counts.get(row.choice_id) ?? 0) + 1,
    );

    totalVotes += 1;
  }
}

const results = question
  ? {
      questionId: question.id,
      totalVotes,

      choices: question.choices.map(
        (choice) => {
          const votes =
            counts.get(choice.id) ?? 0;

          return {
            id: choice.id,
            label: choice.label,
            votes,

            percentage:
              totalVotes > 0
                ? Math.round(
                    (votes / totalVotes) *
                      100,
                  )
                : 0,
          };
        },
      ),
    }
  : null;

return NextResponse.json({
  ok: true,
  authenticated: true,
  active: true,

  activity: {
    id: activity.id,
    name: activity.name,
    status: activity.status,
    question,
  },

  participantState: {
    votes: participantVotes,

    lastVotedQuestionId:
      question &&
      participantVotes[question.id]
        ? question.id
        : null,

    updatedAt:
      question &&
      participantVotes[question.id]
        ? participantVotes[question.id]
            .votedAt
        : null,
  },

  results,

  sharedStateUpdatedAt:
    sharedState.updated_at ?? null,
});
} catch (error) {
  console.error(
    "Poll GET failed:",
    error,
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Unable to load Poll.",
    },
    { status: 500 },
  );
}
}