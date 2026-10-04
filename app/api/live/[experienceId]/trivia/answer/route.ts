// app\api\live\[experienceId]\trivia\answer\route.ts

import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      experienceId: string;
    }>;
  },
) {
  try {
    const { experienceId } = await params;

    const safeExperienceId = String(
      experienceId || "",
    )
      .trim()
      .toLowerCase();

    if (!UUID_PATTERN.test(safeExperienceId)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid Live experience.",
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
          error: authentication.error,
        },
        {
          status: authentication.status,
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const input = asRecord(body);

    const questionId =
      typeof input.questionId === "string"
        ? input.questionId.trim()
        : "";

    const choiceId =
      typeof input.choiceId === "string"
        ? input.choiceId.trim()
        : "";

    if (!questionId || !choiceId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Question and answer are required.",
        },
        { status: 400 },
      );
    }

    if (
      questionId.length > 200 ||
      choiceId.length > 200
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid Trivia answer.",
        },
        { status: 400 },
      );
    }

    const participant =
      authentication.participant;

    const supabase = getSupabaseAdmin();

    /*
     * The overall Live experience lifecycle is
     * server-authoritative.
     *
     * Trivia answers are accepted only while the
     * experience itself is Live. This prevents a
     * participant from bypassing the UI and submitting
     * answers during Pre-Event, Paused, Ended, or
     * Post-Event states.
     */
    const {
      data: experience,
      error: experienceError,
    } = await supabase
      .from("live_experiences")
      .select("id, status, is_enabled")
      .eq("id", safeExperienceId)
      .maybeSingle();

    if (experienceError) {
      console.error(
        "Trivia answer experience lookup failed:",
        experienceError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to submit Trivia answer.",
        },
        { status: 500 },
      );
    }

    if (
      !experience ||
      !experience.is_enabled
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This Live experience is not available.",
        },
        { status: 409 },
      );
    }

    if (experience.status !== "live") {
      return NextResponse.json(
        {
          ok: false,
          error:
            experience.status === "paused"
              ? "The host has paused the Live experience."
              : experience.status === "before"
                ? "The Live experience has not started yet."
                : experience.status === "ended"
                  ? "This Live experience has ended."
                  : experience.status === "after"
                    ? "The Live experience is now in Post-Event."
                    : "Trivia is not currently available.",
        },
        { status: 409 },
      );
    }

    /*
     * The browser does not choose which
     * activity is authoritative.
     */
    
    const {
      data: sharedState,
      error: sharedStateError,
    } = await supabase
      .from("live_experience_state")
      .select(`
        current_activity_type,
        current_activity_id,
        state
      `)
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .maybeSingle();

    if (sharedStateError) {
      console.error(
        "Trivia answer shared-state lookup failed:",
        sharedStateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to submit Trivia answer.",
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
      return NextResponse.json(
        {
          ok: false,
          error:
            "Trivia is not currently active.",
        },
        { status: 409 },
      );
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
        status,
        configuration
      `)
      .eq("id", activityId)
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .eq("activity_type", "trivia")
      .maybeSingle();

    if (activityError) {
      console.error(
        "Trivia answer activity lookup failed:",
        activityError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to submit Trivia answer.",
        },
        { status: 500 },
      );
    }

    if (
      !activity ||
      activity.status !== "active"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Trivia is not currently active.",
        },
        { status: 409 },
      );
    }

    const configuration =
      asRecord(activity.configuration);

    const questions = Array.isArray(
      configuration.questions,
    )
      ? configuration.questions
      : [];

    const runtimeState =
      asRecord(sharedState.state);

    const currentQuestionId =
      typeof runtimeState.currentQuestionId ===
      "string"
        ? runtimeState.currentQuestionId.trim()
        : "";

    /*
     * Match the read endpoint:
     * explicit current question first,
     * otherwise first configured question.
     */
    const authoritativeQuestionId =
      currentQuestionId ||
      String(
        asRecord(questions[0]).id || "",
      ).trim();

    if (
      !authoritativeQuestionId ||
      questionId !== authoritativeQuestionId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "That Trivia question is no longer active.",
        },
        { status: 409 },
      );
    }

    const question = questions.find(
      (candidate) =>
        String(
          asRecord(candidate).id || "",
        ).trim() ===
        authoritativeQuestionId,
    );

    const questionData =
      asRecord(question);

    const choices = Array.isArray(
      questionData.choices,
    )
      ? questionData.choices
      : [];

    const validChoice = choices.some(
      (candidate) =>
        String(
          asRecord(candidate).id || "",
        ).trim() === choiceId,
    );

    if (!validChoice) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid Trivia answer.",
        },
        { status: 400 },
      );
    }

    const correctChoiceId =
      typeof questionData.correctChoiceId ===
      "string"
        ? questionData.correctChoiceId.trim()
        : "";

    if (!correctChoiceId) {
      console.error(
        "Trivia question has no correctChoiceId:",
        authoritativeQuestionId,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "This Trivia question is not configured correctly.",
        },
        { status: 500 },
      );
    }

    const correct =
      choiceId === correctChoiceId;

    const rawPoints =
      typeof questionData.points === "number" &&
      Number.isFinite(questionData.points)
        ? Math.trunc(questionData.points)
        : 100;

    const possiblePoints = Math.max(
      0,
      Math.min(rawPoints, 100000),
    );

    const awardedPoints = correct
      ? possiblePoints
      : 0;

    /*
     * This source ID is also the idempotency
     * key enforced by the database index.
     */
    const sourceId = `${activity.id}:${authoritativeQuestionId}`;

    /*
     * Insert the point transaction first.
     *
     * Correct answers insert the configured
     * score. Incorrect answers insert 0.
     *
     * The 0-point transaction is intentional:
     * it makes every submitted question
     * participate in the same database-level
     * duplicate protection.
     */
    const {
      error: pointInsertError,
    } = await supabase
      .from("live_point_transactions")
      .insert({
        experience_id:
          safeExperienceId,
        participant_id:
          participant.participantId,
        amount: awardedPoints,
        source_type:
          "trivia_question",
        source_id: sourceId,
        reason: correct
          ? "Correct Trivia answer"
          : "Incorrect Trivia answer",
      });

    if (pointInsertError) {
      if (
        pointInsertError.code === "23505"
      ) {
        return NextResponse.json(
          {
            ok: false,
            duplicate: true,
            error:
              "You already answered this question.",
          },
          { status: 409 },
        );
      }

      console.error(
        "Trivia point transaction failed:",
        pointInsertError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to record Trivia answer.",
        },
        { status: 500 },
      );
    }

    const now =
      new Date().toISOString();

    /*
     * Participant state is presentation/
     * progress state. The point ledger above
     * remains the scoring source of truth.
     */
    const {
      data: existingStateRow,
      error: existingStateError,
    } = await supabase
      .from(
        "live_participant_activity_state",
      )
      .select(`
        state
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

    if (existingStateError) {
      console.error(
        "Trivia existing participant-state lookup failed:",
        existingStateError,
      );
    }

    const existingState =
      asRecord(
        existingStateRow?.state,
      );

    const existingAnswers =
      asRecord(existingState.answers);

    const nextAnswers = {
      ...existingAnswers,

      [authoritativeQuestionId]: {
        choiceId,
        correct,
        awardedPoints,
        answeredAt: now,
      },
    };

    const nextParticipantState = {
      ...existingState,
      answers: nextAnswers,
      lastAnsweredQuestionId:
        authoritativeQuestionId,
    };

    const {
      error: stateUpsertError,
    } = await supabase
      .from(
        "live_participant_activity_state",
      )
      .upsert(
        {
          experience_id:
            safeExperienceId,
          participant_id:
            participant.participantId,
          activity_id:
            activity.id,
          state:
            nextParticipantState,
          updated_at: now,
        },
        {
          onConflict:
            "participant_id,activity_id",
        },
      );

    if (stateUpsertError) {
      /*
       * The ledger write already succeeded.
       * Never award again just because the
       * convenience state write failed.
       */
      console.error(
        "Trivia participant-state update failed:",
        stateUpsertError,
      );
    }

    /*
     * Calculate the participant's authoritative
     * total directly from the ledger.
     */
    const {
      data: participantPoints,
      error: participantPointsError,
    } = await supabase
      .from(
        "live_point_transactions",
      )
      .select("amount")
      .eq(
        "experience_id",
        safeExperienceId,
      )
      .eq(
        "participant_id",
        participant.participantId,
      );

    if (participantPointsError) {
      console.error(
        "Trivia participant score lookup failed:",
        participantPointsError,
      );
    }

    const score = (
      participantPoints ?? []
    ).reduce(
      (total, row) =>
        total +
        Number(row.amount || 0),
      0,
    );

    /*
     * Realtime notification only.
     * No protected state is broadcast.
     */
    const channel =
      supabase.channel(
        `live-experience-${safeExperienceId}`,
      );

    try {
      await channel.send({
        type: "broadcast",
        event:
          "shared-state-changed",
        payload: {
          experienceId:
            safeExperienceId,
          activityId:
            activity.id,
          updatedAt: now,
        },
      });
    } catch (broadcastError) {
      console.error(
        "Trivia Broadcast failed:",
        broadcastError,
      );
    } finally {
      await supabase.removeChannel(
        channel,
      );
    }

    return NextResponse.json({
      ok: true,

      result: {
        questionId:
          authoritativeQuestionId,
        choiceId,
        correct,
        awardedPoints,
      },

      participant: {
        id:
          participant.participantId,
        score,
      },
    });
  } catch (error) {
    console.error(
      "Trivia answer POST error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to submit Trivia answer.",
      },
      { status: 500 },
    );
  }
}