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
    return value as Record<
      string,
      unknown
    >;
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

    /*
     * Participant identity comes from
     * the secure server-authenticated
     * Live participant session.
     */
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

    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const input =
      asRecord(body);

    const questionId =
      typeof input.questionId ===
      "string"
        ? input.questionId.trim()
        : "";

    const choiceId =
      typeof input.choiceId ===
      "string"
        ? input.choiceId.trim()
        : "";

    if (
      !questionId ||
      !choiceId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Question and choice are required.",
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
          error:
            "Invalid Poll vote.",
        },
        { status: 400 },
      );
    }

    const participant =
      authentication.participant;

    const supabase =
      getSupabaseAdmin();

    /*
     * Poll voting is only allowed while
     * the overall experience is Live.
     */
    const {
      data: experience,
      error: experienceError,
    } = await supabase
      .from("live_experiences")
      .select(`
        id,
        status,
        is_enabled
      `)
      .eq(
        "id",
        safeExperienceId,
      )
      .maybeSingle();

    if (experienceError) {
      console.error(
        "Poll vote experience lookup failed:",
        experienceError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to submit Poll vote.",
        },
        { status: 500 },
      );
    }

    if (
      !experience ||
      !experience.is_enabled ||
      experience.status !== "live"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Voting is only available while the Live experience is active.",
        },
        { status: 409 },
      );
    }

    /*
     * The browser cannot choose which
     * activity or question is active.
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
        "Poll vote shared-state lookup failed:",
        sharedStateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to submit Poll vote.",
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
      return NextResponse.json(
        {
          ok: false,
          error:
            "Poll is not currently active.",
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
      .eq(
        "activity_type",
        "poll",
      )
      .maybeSingle();

    if (activityError) {
      console.error(
        "Poll vote activity lookup failed:",
        activityError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to submit Poll vote.",
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
            "Poll is not currently active.",
        },
        { status: 409 },
      );
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

    const currentQuestionId =
      typeof runtimeState.currentQuestionId ===
      "string"
        ? runtimeState.currentQuestionId.trim()
        : "";

    /*
     * Same behavior as Poll GET and
     * Trivia: explicit current question
     * first, otherwise question one.
     */
    const authoritativeQuestionId =
      currentQuestionId ||
      String(
        asRecord(
          questions[0],
        ).id || "",
      ).trim();

    if (
      !authoritativeQuestionId ||
      questionId !==
        authoritativeQuestionId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "That Poll question is no longer active.",
        },
        { status: 409 },
      );
    }

    const question =
      questions.find(
        (candidate) =>
          String(
            asRecord(candidate).id ||
              "",
          ).trim() ===
          authoritativeQuestionId,
      );

    const questionData =
      asRecord(question);

    const choices =
      Array.isArray(
        questionData.choices,
      )
        ? questionData.choices
        : [];

    const validChoice =
      choices.some(
        (candidate) =>
          String(
            asRecord(candidate).id ||
              "",
          ).trim() ===
          choiceId,
      );

    if (!validChoice) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid Poll choice.",
        },
        { status: 400 },
      );
    }

/*
 * Database-enforced one-vote-per-question protection.
 */
const now = new Date().toISOString();

const { error: voteInsertError } =
  await supabase
    .from("live_poll_votes")
    .insert({
      experience_id: safeExperienceId,
      participant_id:
        participant.participantId,
      activity_id: activity.id,
      question_id:
        authoritativeQuestionId,
      choice_id: choiceId,
      created_at: now,
    });

if (voteInsertError) {
  if (voteInsertError.code === "23505") {
    return NextResponse.json(
      {
        ok: false,
        duplicate: true,
        error:
          "You already voted on this question.",
      },
      { status: 409 },
    );
  }

  console.error(
    "Poll vote insert failed:",
    voteInsertError,
  );

  return NextResponse.json(
    {
      ok: false,
      error: "Unable to record Poll vote.",
    },
    { status: 500 },
  );
}

    /*
     * Notify connected runtimes and Host
     * Control that authoritative Poll
     * state/results should be refetched.
     *
     * No participant vote is placed in
     * the Broadcast payload.
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
        "Poll Broadcast failed:",
        broadcastError,
      );
    } finally {
      await supabase.removeChannel(
        channel,
      );
    }

    return NextResponse.json({
      ok: true,

      vote: {
        questionId:
          authoritativeQuestionId,

        choiceId,

        votedAt: now,
      },
    });
  } catch (error) {
    console.error(
      "Poll vote POST failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to submit Poll vote.",
      },
      { status: 500 },
    );
  }
}