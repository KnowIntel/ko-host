import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
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
    choices.length < 2
  ) {
    return null;
  }

  return {
    id,
    question,
    choices,
    points,
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
     * Resolve the authoritative current
     * activity from shared Live state.
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
        "Trivia shared-state lookup failed:",
        sharedStateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Trivia.",
        },
        { status: 500 },
      );
    }

    if (
      !sharedState ||
      sharedState.current_activity_type !==
        "trivia" ||
      !sharedState.current_activity_id
    ) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        active: false,
        activity: null,
        participantState: null,
        leaderboard: [],
      });
    }

    const activityId = String(
      sharedState.current_activity_id,
    );

    /*
     * Load protected activity configuration.
     * Correct answers remain server-side.
     */
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
        "trivia",
      )
      .maybeSingle();

    if (activityError) {
      console.error(
        "Trivia activity lookup failed:",
        activityError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Trivia.",
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
        leaderboard: [],
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
     * If the host has not explicitly
     * selected a question yet, use the
     * first configured question.
     */
    if (
      !questionSource &&
      questions.length > 0
    ) {
      questionSource =
        questions[0];
    }

    const question =
      parseTriviaQuestion(
        questionSource,
      );

    /*
     * Never expose correctChoiceId or
     * any other protected answer key.
     */
    const publicQuestion = question
      ? {
          id: question.id,
          question:
            question.question,
          choices:
            question.choices,
          points:
            question.points,
        }
      : null;

    const {
      data: participantActivityState,
      error:
        participantActivityStateError,
    } = await supabase
      .from(
        "live_participant_activity_state",
      )
      .select(`
        state,
        completed_at,
        updated_at
      `)
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .eq(
        "participant_id",
        participant.participantId,
      )
      .eq(
        "activity_id",
        activity.id,
      )
      .maybeSingle();

    if (
      participantActivityStateError
    ) {
      console.error(
        "Trivia participant-state lookup failed:",
        participantActivityStateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load participant Trivia state.",
        },
        { status: 500 },
      );
    }

    const participantState =
      asRecord(
        participantActivityState?.state,
      );

    const {
      data: pointRows,
      error: pointError,
    } = await supabase
      .from(
        "live_point_transactions",
      )
      .select(`
        participant_id,
        amount
      `)
      .eq(
        "experience_id",
        safeExperienceId,
      );

    if (pointError) {
      console.error(
        "Trivia leaderboard point lookup failed:",
        pointError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load leaderboard.",
        },
        { status: 500 },
      );
    }

    const {
      data: participants,
      error: participantsError,
    } = await supabase
      .from("live_participants")
      .select(`
        id,
        display_name,
        avatar_url
      `)
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .eq("status", "active");

    if (participantsError) {
      console.error(
        "Trivia leaderboard participant lookup failed:",
        participantsError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load leaderboard.",
        },
        { status: 500 },
      );
    }

    const scoreByParticipant =
      new Map<string, number>();

    for (const row of pointRows ?? []) {
      const participantId =
        String(
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

    const leaderboard = (
      participants ?? []
    )
      .map((entry) => ({
        participantId: entry.id,
        displayName:
          entry.display_name,
        avatarUrl:
          entry.avatar_url ?? null,
        score:
          scoreByParticipant.get(
            entry.id,
          ) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.displayName.localeCompare(
            b.displayName,
          ),
      )
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    const myLeaderboardEntry =
      leaderboard.find(
        (entry) =>
          entry.participantId ===
          participant.participantId,
      ) ?? null;

    return NextResponse.json({
      ok: true,
      authenticated: true,
      active: Boolean(
        publicQuestion,
      ),

      activity: {
        id: activity.id,
        name: activity.name,
        status: activity.status,
        question:
          publicQuestion,
        updatedAt:
          activity.updated_at,
      },

      participantState: {
        ...participantState,
        completedAt:
          participantActivityState?.completed_at ??
          null,
        updatedAt:
          participantActivityState?.updated_at ??
          null,
      },

      participant: {
        id:
          participant.participantId,
        displayName:
          participant.displayName,
        avatarUrl:
          participant.avatarUrl,
        score:
          myLeaderboardEntry?.score ??
          0,
        rank:
          myLeaderboardEntry?.rank ??
          null,
      },

      leaderboard,

      sharedUpdatedAt:
        sharedState.updated_at,
    });
  } catch (error) {
    console.error(
      "Trivia runtime GET error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load Trivia.",
      },
      { status: 500 },
    );
  }
}