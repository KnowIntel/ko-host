// app\api\live\[experienceId]\trivia\answer\route.ts

import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  isLiveActivitySelected,
  readLiveActivitySelection,
} from "@/lib/live/activitySelection";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AtomicTriviaAnswerResult = {
  question_id: string;
  choice_id: string;
  correct: boolean;
  awarded_points: number;
  participant_score: number;
  answered_at: string;
};


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

    const requestedActivityId =
      typeof input.activityId === "string"
        ? input.activityId.trim().toLowerCase()
        : "";

    if (
      requestedActivityId &&
      !UUID_PATTERN.test(requestedActivityId)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid Trivia activity.",
        },
        { status: 400 },
      );
    }

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

    const selection =
      readLiveActivitySelection(
        sharedState?.state,
      );

    const currentActivityId =
      sharedState?.current_activity_id
        ? String(
            sharedState.current_activity_id,
          )
        : null;

    const activityId =
      selection.allowMultipleActiveActivities
        ? requestedActivityId
        : currentActivityId;

    const isSelected =
      Boolean(activityId) &&
      isLiveActivitySelected(
        activityId ?? "",
        currentActivityId,
        selection,
      );

    if (
      !sharedState ||
      !activityId ||
      !isSelected ||
      (!selection.allowMultipleActiveActivities &&
        sharedState.current_activity_type !==
          "trivia")
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

      const activityRuntime =
        asRecord(runtimeState.activityRuntime);

      const currentActivityRuntime =
        asRecord(activityRuntime[activity.id]);

      /*
       * Single Activity Mode uses the legacy
       * shared currentQuestionId.
       *
       * Multiple Activity Mode uses the
       * question selected for this Trivia activity.
       */
      const questionIdSource =
        selection.allowMultipleActiveActivities
          ? currentActivityRuntime.currentQuestionId
          : runtimeState.currentQuestionId;

      const currentQuestionId =
        typeof questionIdSource === "string"
          ? questionIdSource.trim()
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


    /*
     * Atomically validate the current Trivia question,
     * determine correctness, award points, update
     * participant history, and calculate the score.
     *
     * All database operations execute in one
     * transaction under authoritative row locks.
     */
    const { data: answerData, error: answerError } =
      await supabase.rpc(
        "submit_live_trivia_answer_atomic",
        {
          p_experience_id: safeExperienceId,
          p_participant_id: participant.participantId,
          p_activity_id: activity.id,
          p_question_id: questionId,
          p_choice_id: choiceId,
        },
      );

    if (answerError) {
      if (answerError.code === "23505") {
        return NextResponse.json(
          {
            ok: false,
            duplicate: true,
            error: "You already answered this question.",
          },
          { status: 409 },
        );
      }

      const message = answerError.message || "";

      if (
        [
          "Invalid Trivia answer",
          "Invalid Trivia question",
        ].includes(message)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: message,
          },
          { status: 400 },
        );
      }

      if (
        [
          "Live experience is not available",
          "Live participant is not active",
          "Trivia activity is not active",
          "Trivia activity is not selected",
          "Trivia activity is not current",
          "Live experience state not found",
          "That Trivia question is no longer active",
        ].includes(message)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: message,
          },
          { status: 409 },
        );
      }

      if (
        message === "Trivia question is not configured correctly"
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "This Trivia question is not configured correctly.",
          },
          { status: 500 },
        );
      }

      console.error(
        "Atomic Trivia answer failed:",
        answerError,
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to record Trivia answer.",
        },
        { status: 500 },
      );
    }

    const answerResult = (
      Array.isArray(answerData)
        ? answerData[0]
        : answerData
    ) as AtomicTriviaAnswerResult | null;

    if (!answerResult) {
      throw new Error(
        "Atomic Trivia answer returned no result.",
      );
    }

    const now = answerResult.answered_at;
    const correct = answerResult.correct;
    const awardedPoints = answerResult.awarded_points;
    const score = answerResult.participant_score;


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
          questionId: answerResult.question_id,
          choiceId: answerResult.choice_id,
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