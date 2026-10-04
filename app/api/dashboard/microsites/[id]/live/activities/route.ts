import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ACTIVITY_STATUSES = [
  "draft",
  "locked",
  "upcoming",
  "active",
  "completed",
  "cancelled",
] as const;

type ActivityStatus =
  (typeof ACTIVITY_STATUSES)[number];

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

type TriviaConfiguration = {
  questions: TriviaQuestion[];
};

function cleanText(
  value: unknown,
  maxLength: number,
) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeDate(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid scheduled date.");
  }

  return date.toISOString();
}

function normalizeTriviaConfiguration(
  value: unknown,
): TriviaConfiguration {
  const source =
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const rawQuestions =
    Array.isArray(source.questions)
      ? source.questions
      : [];

  if (rawQuestions.length > 100) {
    throw new Error(
      "Trivia activities may contain at most 100 questions.",
    );
  }

  const questions: TriviaQuestion[] = [];
  const usedQuestionIds = new Set<string>();

  for (const rawQuestion of rawQuestions) {
    if (
      !rawQuestion ||
      typeof rawQuestion !== "object" ||
      Array.isArray(rawQuestion)
    ) {
      throw new Error(
        "Invalid Trivia question.",
      );
    }

    const questionSource =
      rawQuestion as Record<string, unknown>;

    let questionId = cleanText(
      questionSource.id,
      100,
    );

    if (!questionId) {
      questionId = makeId("question");
    }

    if (usedQuestionIds.has(questionId)) {
      throw new Error(
        "Trivia question IDs must be unique.",
      );
    }

    usedQuestionIds.add(questionId);

    const question = cleanText(
      questionSource.question,
      500,
    );

    if (!question) {
      throw new Error(
        "Every Trivia question requires question text.",
      );
    }

    const rawChoices =
      Array.isArray(questionSource.choices)
        ? questionSource.choices
        : [];

    if (
      rawChoices.length < 2 ||
      rawChoices.length > 10
    ) {
      throw new Error(
        "Each Trivia question requires between 2 and 10 choices.",
      );
    }

    const choices: TriviaChoice[] = [];
    const usedChoiceIds = new Set<string>();

    for (const rawChoice of rawChoices) {
      if (
        !rawChoice ||
        typeof rawChoice !== "object" ||
        Array.isArray(rawChoice)
      ) {
        throw new Error(
          "Invalid Trivia answer choice.",
        );
      }

      const choiceSource =
        rawChoice as Record<string, unknown>;

      let choiceId = cleanText(
        choiceSource.id,
        100,
      );

      if (!choiceId) {
        choiceId = makeId("choice");
      }

      if (usedChoiceIds.has(choiceId)) {
        throw new Error(
          "Answer choice IDs must be unique within each question.",
        );
      }

      usedChoiceIds.add(choiceId);

      const label = cleanText(
        choiceSource.label,
        300,
      );

      if (!label) {
        throw new Error(
          "Every Trivia answer choice requires text.",
        );
      }

      choices.push({
        id: choiceId,
        label,
      });
    }

    const correctChoiceId = cleanText(
      questionSource.correctChoiceId,
      100,
    );

    if (
      !correctChoiceId ||
      !usedChoiceIds.has(correctChoiceId)
    ) {
      throw new Error(
        "Every Trivia question requires a valid correct answer.",
      );
    }

    const rawPoints =
      typeof questionSource.points === "number"
        ? questionSource.points
        : Number(questionSource.points);

    const points = Number.isFinite(rawPoints)
      ? Math.floor(rawPoints)
      : 100;

    if (points < 0 || points > 100000) {
      throw new Error(
        "Trivia points must be between 0 and 100000.",
      );
    }

    questions.push({
      id: questionId,
      question,
      choices,
      correctChoiceId,
      points,
    });
  }

  return {
    questions,
  };
}

async function getOwnerContext(
  micrositeId: string,
  userId: string,
) {
  const sb = getSupabaseAdmin();

  const {
    data: microsite,
    error: micrositeError,
  } = await sb
    .from("microsites")
    .select(
      "id, slug, title, owner_clerk_user_id",
    )
    .eq("id", micrositeId)
    .maybeSingle();

  if (
    micrositeError ||
    !microsite ||
    microsite.owner_clerk_user_id !== userId
  ) {
    return {
      sb,
      microsite: null,
      experience: null,
      status: 401,
      error: "Unauthorized.",
    };
  }

  const {
    data: experience,
    error: experienceError,
  } = await sb
    .from("live_experiences")
    .select(
      "id, microsite_id, name, status, is_enabled",
    )
    .eq("microsite_id", micrositeId)
    .eq("owner_clerk_user_id", userId)
    .maybeSingle();

  if (experienceError) {
    console.error(
      "Live experience lookup failed:",
      experienceError,
    );

    return {
      sb,
      microsite,
      experience: null,
      status: 500,
      error:
        "Unable to load Live experience.",
    };
  }

  if (!experience) {
    return {
      sb,
      microsite,
      experience: null,
      status: 404,
      error:
        "Live has not been enabled for this microsite.",
    };
  }

  return {
    sb,
    microsite,
    experience,
    status: 200,
    error: null,
  };
}

function serializeActivity(activity: any) {
  return {
    id: activity.id,
    experienceId: activity.experience_id,
    activityType: activity.activity_type,
    name: activity.name,
    status: activity.status,
    configuration:
      activity.configuration ?? {},
    scheduledFor:
      activity.scheduled_for,
    startedAt: activity.started_at,
    completedAt:
      activity.completed_at,
    createdAt: activity.created_at,
    updatedAt: activity.updated_at,
  };
}

export async function GET(
  _req: Request,
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

    const context =
      await getOwnerContext(
        micrositeId,
        userId,
      );

    if (!context.experience) {
      return NextResponse.json(
        {
          ok: false,
          error: context.error,
        },
        {
          status: context.status,
        },
      );
    }

    const {
      data: activities,
      error: activitiesError,
    } = await context.sb
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
        created_at,
        updated_at
      `)
      .eq(
        "experience_id",
        context.experience.id,
      )
      .order("created_at", {
        ascending: false,
      });

    if (activitiesError) {
      console.error(
        "Live activities lookup failed:",
        activitiesError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live activities.",
        },
        { status: 500 },
      );
    }

    const {
      data: sharedState,
      error: stateError,
    } = await context.sb
      .from("live_experience_state")
      .select(`
        current_activity_type,
        current_activity_id,
        state,
        updated_at
      `)
      .eq(
        "experience_id",
        context.experience.id,
      )
      .maybeSingle();

    if (stateError) {
      console.error(
        "Live shared-state lookup failed:",
        stateError,
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

    return NextResponse.json({
      ok: true,

      experience: {
        id: context.experience.id,
        micrositeId:
          context.experience.microsite_id,
        name: context.experience.name,
        status:
          context.experience.status,
        isEnabled:
          context.experience.is_enabled,
      },

      activities: (activities ?? []).map(
        serializeActivity,
      ),

      sharedState: {
        currentActivityType:
          sharedState?.current_activity_type ??
          null,

        currentActivityId:
          sharedState?.current_activity_id ??
          null,

        state:
          sharedState?.state ?? {},

        updatedAt:
          sharedState?.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error(
      "Live activities GET error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load Live activities.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
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

    const context =
      await getOwnerContext(
        micrositeId,
        userId,
      );

    if (!context.experience) {
      return NextResponse.json(
        {
          ok: false,
          error: context.error,
        },
        {
          status: context.status,
        },
      );
    }

    const body =
      await req.json().catch(() => ({}));

    const activityType = cleanText(
      body?.activityType,
      100,
    ).toLowerCase();

    /*
     * Phase 3 begins with Trivia.
     *
     * Additional Live activity types can be
     * added here without changing the ownership
     * or persistence architecture.
     */
    if (activityType !== "trivia") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unsupported Live activity type.",
        },
        { status: 400 },
      );
    }

    const name =
      cleanText(body?.name, 150) ||
      "Live Trivia";

    let configuration:
      TriviaConfiguration;

    try {
      configuration =
        normalizeTriviaConfiguration(
          body?.configuration ?? {
            questions: [],
          },
        );
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Invalid Trivia configuration.",
        },
        { status: 400 },
      );
    }

    let scheduledFor: string | null;

    try {
      scheduledFor = normalizeDate(
        body?.scheduledFor,
      );
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Invalid scheduled date.",
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    const {
      data: activity,
      error: insertError,
    } = await context.sb
      .from("live_activities")
      .insert({
        experience_id:
          context.experience.id,

        activity_type: "trivia",

        name,

        status: "draft",

        configuration,

        scheduled_for:
          scheduledFor,

        updated_at: now,
      })
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
        created_at,
        updated_at
      `)
      .single();

    if (insertError || !activity) {
      console.error(
        "Live activity creation failed:",
        insertError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to create Live activity.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        activity:
          serializeActivity(activity),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Live activities POST error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to create Live activity.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
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

    const context =
      await getOwnerContext(
        micrositeId,
        userId,
      );

    if (!context.experience) {
      return NextResponse.json(
        {
          ok: false,
          error: context.error,
        },
        {
          status: context.status,
        },
      );
    }

    const body =
      await req.json().catch(() => ({}));

    const activityId = cleanText(
      body?.activityId,
      100,
    ).toLowerCase();

    if (!UUID_PATTERN.test(activityId)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid Live activity.",
        },
        { status: 400 },
      );
    }

    const {
      data: existingActivity,
      error: existingError,
    } = await context.sb
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
        created_at,
        updated_at
      `)
      .eq("id", activityId)
      .eq(
        "experience_id",
        context.experience.id,
      )
      .maybeSingle();

    if (existingError) {
      console.error(
        "Live activity lookup failed:",
        existingError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live activity.",
        },
        { status: 500 },
      );
    }

    if (!existingActivity) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Live activity not found.",
        },
        { status: 404 },
      );
    }

    if (
      existingActivity.activity_type !==
      "trivia"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unsupported Live activity type.",
        },
        { status: 400 },
      );
    }

    const updatePayload:
      Record<string, unknown> = {
        updated_at:
          new Date().toISOString(),
      };

    if (body?.name !== undefined) {
      const name = cleanText(
        body.name,
        150,
      );

      if (!name) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Activity name is required.",
          },
          { status: 400 },
        );
      }

      updatePayload.name = name;
    }

    if (
      body?.configuration !== undefined
    ) {
      try {
        updatePayload.configuration =
          normalizeTriviaConfiguration(
            body.configuration,
          );
      } catch (error) {
        return NextResponse.json(
          {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Invalid Trivia configuration.",
          },
          { status: 400 },
        );
      }
    }

    if (
      body?.scheduledFor !== undefined
    ) {
      try {
        updatePayload.scheduled_for =
          normalizeDate(
            body.scheduledFor,
          );
      } catch (error) {
        return NextResponse.json(
          {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Invalid scheduled date.",
          },
          { status: 400 },
        );
      }
    }

    if (body?.status !== undefined) {
      const requestedStatus =
        cleanText(
          body.status,
          50,
        ).toLowerCase();

      if (
        !ACTIVITY_STATUSES.includes(
          requestedStatus as ActivityStatus,
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid activity status.",
          },
          { status: 400 },
        );
      }

      const nextStatus =
        requestedStatus as ActivityStatus;

      updatePayload.status =
        nextStatus;

      if (
        nextStatus === "active" &&
        !existingActivity.started_at
      ) {
        updatePayload.started_at =
          new Date().toISOString();
      }

      if (
        nextStatus === "completed"
      ) {
        updatePayload.completed_at =
          new Date().toISOString();
      }

      if (
        nextStatus === "draft" ||
        nextStatus === "locked" ||
        nextStatus === "upcoming" ||
        nextStatus === "active"
      ) {
        updatePayload.completed_at =
          null;
      }
    }

    const {
      data: updatedActivity,
      error: updateError,
    } = await context.sb
      .from("live_activities")
      .update(updatePayload)
      .eq("id", activityId)
      .eq(
        "experience_id",
        context.experience.id,
      )
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
        created_at,
        updated_at
      `)
      .single();

    if (
      updateError ||
      !updatedActivity
    ) {
      console.error(
        "Live activity update failed:",
        updateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to update Live activity.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      activity:
        serializeActivity(
          updatedActivity,
        ),
    });
  } catch (error) {
    console.error(
      "Live activities PATCH error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to update Live activity.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
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

    const context =
      await getOwnerContext(
        micrositeId,
        userId,
      );

    if (!context.experience) {
      return NextResponse.json(
        {
          ok: false,
          error: context.error,
        },
        {
          status: context.status,
        },
      );
    }

    const body =
      await req.json().catch(() => ({}));

    const activityId = cleanText(
      body?.activityId,
      100,
    ).toLowerCase();

    if (!UUID_PATTERN.test(activityId)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid Live activity.",
        },
        { status: 400 },
      );
    }

    const {
      data: activity,
      error: activityError,
    } = await context.sb
      .from("live_activities")
      .select("id")
      .eq("id", activityId)
      .eq(
        "experience_id",
        context.experience.id,
      )
      .maybeSingle();

    if (activityError) {
      console.error(
        "Live activity lookup failed:",
        activityError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live activity.",
        },
        { status: 500 },
      );
    }

    if (!activity) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Live activity not found.",
        },
        { status: 404 },
      );
    }

    const {
      data: sharedState,
      error: stateError,
    } = await context.sb
      .from("live_experience_state")
      .select("current_activity_id")
      .eq(
        "experience_id",
        context.experience.id,
      )
      .maybeSingle();

    if (stateError) {
      console.error(
        "Live shared-state lookup failed:",
        stateError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to verify Live state.",
        },
        { status: 500 },
      );
    }

    if (
      sharedState?.current_activity_id ===
      activityId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "The current Live activity cannot be deleted. Activate another activity or clear the current activity first.",
        },
        { status: 409 },
      );
    }

    const {
      error: deleteError,
    } = await context.sb
      .from("live_activities")
      .delete()
      .eq("id", activityId)
      .eq(
        "experience_id",
        context.experience.id,
      );

    if (deleteError) {
      console.error(
        "Live activity deletion failed:",
        deleteError,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to delete Live activity.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      deletedActivityId: activityId,
    });
  } catch (error) {
    console.error(
      "Live activities DELETE error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to delete Live activity.",
      },
      { status: 500 },
    );
  }
}