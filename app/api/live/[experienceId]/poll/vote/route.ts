import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  isLiveActivitySelected,
  readLiveActivitySelection,
} from "@/lib/live/activitySelection";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AtomicPollVoteResult = {
  question_id: string;
  choice_id: string;
  voted_at: string;
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
          error: "Invalid Poll activity.",
        },
        { status: 400 },
      );
    }

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
          "poll")
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

      const activityRuntime =
        asRecord(runtimeState.activityRuntime);

      const currentActivityRuntime =
        asRecord(activityRuntime[activity.id]);

      /*
       * Single Activity Mode uses the legacy
       * shared currentQuestionId.
       *
       * Multiple Activity Mode uses the
       * question selected for this Poll.
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
     * Atomically validate the current activity,
     * current question, selected choice, and
     * duplicate-vote constraint before recording
     * the participant's vote.
     *
     * The database function repeats authoritative
     * validation under row locks, preventing
     * changes between validation and insertion.
     */
    const { data: voteData, error: voteError } =
      await supabase.rpc(
        "submit_live_poll_vote_atomic",
        {
          p_experience_id: safeExperienceId,
          p_participant_id:
            participant.participantId,
          p_activity_id: activity.id,
          p_question_id: questionId,
          p_choice_id: choiceId,
        },
      );

    if (voteError) {
      if (voteError.code === "23505") {
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

      const message = voteError.message || "";

      const invalidVoteErrors = [
        "Invalid Poll vote",
        "Invalid Poll question",
        "Invalid Poll choice",
      ];

      if (invalidVoteErrors.includes(message)) {
        return NextResponse.json(
          {
            ok: false,
            error: message,
          },
          { status: 400 },
        );
      }

      const conflictErrors = [
        "Live experience is not available",
        "Live participant is not active",
        "Poll activity is not active",
        "Poll activity is not selected",
        "Poll activity is not current",
        "Live experience state not found",
        "That Poll question is no longer active",
      ];

      if (conflictErrors.includes(message)) {
        return NextResponse.json(
          {
            ok: false,
            error: message,
          },
          { status: 409 },
        );
      }

      console.error(
        "Atomic Poll vote failed:",
        voteError,
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to record Poll vote.",
        },
        { status: 500 },
      );
    }

    const voteResult = (
      Array.isArray(voteData)
        ? voteData[0]
        : voteData
    ) as AtomicPollVoteResult | null;

    if (!voteResult) {
      throw new Error(
        "Atomic Poll vote returned no result.",
      );
    }

    const now = voteResult.voted_at;


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
          questionId: voteResult.question_id,
          choiceId: voteResult.choice_id,
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