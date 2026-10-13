// app\api\dashboard\microsites\[id]\live\host\actions\route.ts

import { randomInt } from "crypto";

import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  isLiveActivitySelected,
  readLiveActivitySelection,
} from "@/lib/live/activitySelection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UnknownRecord = Record<
  string,
  unknown
>;

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

function cleanText(
  value: unknown,
  maxLength: number,
) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

async function broadcastChange(
  sb: ReturnType<
    typeof getSupabaseAdmin
  >,
  experienceId: string,
  activityId?: string | null,
) {
  const channel = sb.channel(
    `live-experience-${experienceId}`,
  );

  try {
    await channel.send({
      type: "broadcast",
      event: "shared-state-changed",

      payload: {
        experienceId,

        activityId:
          activityId ?? null,

        updatedAt:
          new Date().toISOString(),
      },
    });
  } finally {
    await sb.removeChannel(channel);
  }
}

export async function POST(
  request: Request,

  ctx: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await ctx.params;

    const micrositeId = String(
      id || "",
    )
      .trim()
      .toLowerCase();

    if (
      !UUID_PATTERN.test(
        micrositeId,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid microsite.",
        },
        { status: 400 },
      );
    }

    const { userId } =
      await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const body = asRecord(
      await request.json().catch(
        () => ({}),
      ),
    );

    const action = cleanText(
      body.action,
      100,
    );

    if (!action) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Host action is required.",
        },
        { status: 400 },
      );
    }

    const sb =
      getSupabaseAdmin();

    /*
     * Verify ownership.
     */
    const {
      data: microsite,
      error: micrositeError,
    } = await sb
      .from("microsites")
      .select(
        "id, owner_clerk_user_id",
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
     * Resolve this owner's Live
     * experience.
     */
    const {
      data: experience,
      error: experienceError,
    } = await sb
      .from("live_experiences")
      .select(
        "id, status, is_enabled",
      )
      .eq(
        "microsite_id",
        micrositeId,
      )
      .eq(
        "owner_clerk_user_id",
        userId,
      )
      .maybeSingle();

    if (
      experienceError ||
      !experience
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Live experience could not be found.",
        },
        { status: 404 },
      );
    }

    if (!experience.is_enabled) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Live is not enabled.",
        },
        { status: 409 },
      );
    }

        /*
     * REMOVE PARTICIPANT
     *
     * Mark the participant as removed without
     * deleting their scores or activity history.
     */
    if (action === "remove_participant") {
      const participantId = cleanText(
        body.participantId,
        100,
      );

      if (!UUID_PATTERN.test(participantId)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Invalid participant ID.",
          },
          { status: 400 },
        );
      }

      const {
        data: participant,
        error: participantError,
      } = await sb
        .from("live_participants")
        .select("id, status")
        .eq("id", participantId)
        .eq("experience_id", experience.id)
        .maybeSingle();

      if (participantError) {
        return NextResponse.json(
          {
            ok: false,
            error: "Unable to verify participant.",
          },
          { status: 500 },
        );
      }

      if (!participant || participant.status !== "active") {
        return NextResponse.json(
          {
            ok: false,
            error: "Participant is no longer active.",
          },
          { status: 409 },
        );
      }

      const { data: removedParticipant, error: removeError } =
        await sb
          .from("live_participants")
          .update({
            status: "removed",
          })
          .eq("id", participantId)
          .eq("experience_id", experience.id)
          .eq("status", "active")
          .select("id")
          .maybeSingle();

      if (removeError) {
        return NextResponse.json(
          {
            ok: false,
            error: "Unable to remove participant.",
          },
          { status: 500 },
        );
      }

      if (!removedParticipant) {
        return NextResponse.json(
          {
            ok: false,
            error: "Participant is no longer active.",
          },
          { status: 409 },
        );
      }

      await broadcastChange(
        sb,
        experience.id,
      );

      return NextResponse.json({
        ok: true,
        action,
        participantId,
      });
    }
    
        /*
     * DELETE PARTICIPANT
     *
     * Permanently delete a participant and
     * their associated records through
     * database ON DELETE CASCADE rules.
     */
    if (action === "delete_participant") {
      const participantId = cleanText(
        body.participantId,
        100,
      );

      if (!UUID_PATTERN.test(participantId)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Invalid participant ID.",
          },
          { status: 400 },
        );
      }

      // Verify that the participant belongs
      // to this owner's Live experience.
      const {
        data: participant,
        error: participantError,
      } = await sb
        .from("live_participants")
        .select("id, display_name, status")
        .eq("id", participantId)
        .eq("experience_id", experience.id)
        .maybeSingle();

      if (participantError) {
        return NextResponse.json(
          {
            ok: false,
            error: "Unable to verify participant.",
          },
          { status: 500 },
        );
      }

      if (!participant) {
        return NextResponse.json(
          {
            ok: false,
            error: "Participant record not found.",
          },
          { status: 404 },
        );
      }

      // Delete only the verified participant
      // belonging to this experience.
      const {
        data: deletedParticipant,
        error: deleteError,
      } = await sb
        .from("live_participants")
        .delete()
        .eq("id", participantId)
        .eq("experience_id", experience.id)
        .select("id")
        .maybeSingle();

      if (deleteError) {
        console.error(
          "Permanent participant deletion failed:",
          deleteError,
        );

        return NextResponse.json(
          {
            ok: false,
            error: "Unable to delete participant.",
          },
          { status: 500 },
        );
      }

      if (!deletedParticipant) {
        return NextResponse.json(
          {
            ok: false,
            error: "Participant record no longer exists.",
          },
          { status: 409 },
        );
      }

      // Notify connected participants and
      // Host Control that state has changed.
      await broadcastChange(
        sb,
        experience.id,
      );

      return NextResponse.json({
        ok: true,
        action,
        participantId,
      });
    }

    /*
     * Current shared state.
     */
    const {
      data: sharedState,
      error: sharedStateError,
    } = await sb
      .from(
        "live_experience_state",
      )
      .select(
        "current_activity_type, current_activity_id, state",
      )
      .eq(
        "experience_id",
        experience.id,
      )
      .maybeSingle();

    if (sharedStateError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Live state.",
        },
        { status: 500 },
      );
    }

    const currentActivityId =
      sharedState
        ?.current_activity_id
        ? String(
            sharedState.current_activity_id,
          )
        : null;

    const currentActivityType =
      sharedState
        ?.current_activity_type
        ? String(
            sharedState.current_activity_type,
          )
        : null;

      const runtimeState =
        asRecord(
          sharedState?.state,
        );

      const selection =
        readLiveActivitySelection(runtimeState);


    /*
     * ================================================================
     * LOTTERY — DRAW WINNER
     * ================================================================
     */
    if (
      action ===
      "draw_lottery_winner"
    ) {
      const requestedActivityId =
        cleanText(body.activityId, 100)
          .toLowerCase();

      if (
        requestedActivityId &&
        !UUID_PATTERN.test(requestedActivityId)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "Invalid Lottery activity.",
          },
          { status: 400 },
        );
      }

      const lotteryActivityId =
        selection.allowMultipleActiveActivities
          ? requestedActivityId
          : currentActivityId;

      const isSelected =
        Boolean(lotteryActivityId) &&
        isLiveActivitySelected(
          lotteryActivityId ?? "",
          currentActivityId,
          selection,
        );

      if (
        !lotteryActivityId ||
        !isSelected ||
        (!selection.allowMultipleActiveActivities &&
          currentActivityType !== "lottery")
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Lottery is not the current Live activity.",
          },
          { status: 409 },
        );
      }

      const {
        data: activity,
        error: activityError,
      } = await sb
        .from("live_activities")
        .select(
          "id, activity_type, status",
        )
        .eq(
          "id",
          lotteryActivityId,
        )
        .eq(
          "experience_id",
          experience.id,
        )
        .maybeSingle();

      if (
        activityError ||
        !activity ||
        activity.activity_type !==
          "lottery" ||
        activity.status !==
          "active"
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Active Lottery could not be found.",
          },
          { status: 409 },
        );
      }

      /*
       * Every valid participant entry
       * becomes one ticket in the draw.
       */
      const {
        data: stateRows,
        error: stateError,
      } = await sb
        .from(
          "live_participant_activity_state",
        )
        .select(
          "participant_id, state",
        )
        .eq(
          "experience_id",
          experience.id,
        )
        .eq(
          "activity_id",
          lotteryActivityId,
        );

      if (stateError) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to load Lottery entries.",
          },
          { status: 500 },
        );
      }

      const tickets: string[] =
        [];

      for (
        const row of stateRows ?? []
      ) {
        const state = asRecord(
          row.state,
        );

        const entries =
          Array.isArray(
            state.entries,
          )
            ? state.entries
            : [];

        for (
          let index = 0;
          index < entries.length;
          index += 1
        ) {
          tickets.push(
            String(
              row.participant_id,
            ),
          );
        }
      }

      if (tickets.length === 0) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "No Lottery entries have been submitted.",
          },
          { status: 409 },
        );
      }

      const winnerParticipantId =
        tickets[
          randomInt(
            tickets.length,
          )
        ];

      const {
        data: winner,
        error: winnerError,
      } = await sb
        .from(
          "live_participants",
        )
        .select(
          "id, display_name, avatar_url",
        )
        .eq(
          "id",
          winnerParticipantId,
        )
        .eq(
          "experience_id",
          experience.id,
        )
        .maybeSingle();

      if (
        winnerError ||
        !winner
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Lottery winner could not be resolved.",
          },
          { status: 500 },
        );
      }

      const lotteryWinner = {
        participantId:
          winner.id,

        displayName:
          winner.display_name,

        avatarUrl:
          winner.avatar_url ??
          null,

        drawnAt:
          new Date().toISOString(),
      };

      /*
       * Single Activity Mode:
       * Store the winner in the legacy
       * shared lotteryWinner property.
       *
       * Multiple Activity Mode:
       * Store the winner independently
       * for the selected Lottery activity.
       */
/*
 * Save the Lottery winner atomically.
 *
 * Single Activity Mode:
 * Updates the legacy lotteryWinner field.
 *
 * Multiple Activity Mode:
 * Updates only this Lottery activity's
 * activityRuntime entry.
 *
 * PostgreSQL revalidates activity selection
 * while holding the experience lock.
 */
const {
  error: updateError,
} = await sb.rpc(
  "update_live_experience_state_atomic",
  {
    p_experience_id: experience.id,
    p_state_patch: {},
    p_activity_id: lotteryActivityId,
    p_activity_type: "lottery",
    p_update_current_activity: false,
    p_host_runtime_key: "lotteryWinner",
    p_host_runtime_value: lotteryWinner,
  },
);

      if (updateError) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to save Lottery winner.",
          },
          { status: 500 },
        );
      }

      await broadcastChange(
        sb,
        experience.id,
        lotteryActivityId,
      );

      return NextResponse.json({
        ok: true,
        action,
        lotteryWinner,
      });
    }



    /*
     * ================================================================
     * MYSTERY DROP — SET CURRENT DROP
     * ================================================================
     */
    if (action === "set_mystery_drop") {
      const requestedActivityId =
        cleanText(body.activityId, 100)
          .toLowerCase();

      if (
        requestedActivityId &&
        !UUID_PATTERN.test(requestedActivityId)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "Invalid Mystery Drop activity.",
          },
          { status: 400 },
        );
      }

      /*
       * Single Activity Mode uses the legacy
       * current activity.
       *
       * Multiple Activity Mode requires an
       * explicitly selected activity ID.
       */
      const mysteryDropActivityId =
        selection.allowMultipleActiveActivities
          ? requestedActivityId
          : currentActivityId;

      const isSelected =
        Boolean(mysteryDropActivityId) &&
        isLiveActivitySelected(
          mysteryDropActivityId ?? "",
          currentActivityId,
          selection,
        );

      if (
        !mysteryDropActivityId ||
        !isSelected ||
        (!selection.allowMultipleActiveActivities &&
          currentActivityType !== "mystery_drop")
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Mystery Drop is not the current Live activity.",
          },
          { status: 409 },
        );
      }

      const dropId = cleanText(
        body.dropId,
        200,
      );

      if (!dropId) {
        return NextResponse.json(
          {
            ok: false,
            error: "Drop ID is required.",
          },
          { status: 400 },
        );
      }

      /*
       * Verify the selected Mystery Drop
       * belongs to this Live experience
       * and is currently active.
       */
      const {
        data: activity,
        error: activityError,
      } = await sb
        .from("live_activities")
        .select(
          "id, activity_type, status, configuration",
        )
        .eq(
          "id",
          mysteryDropActivityId,
        )
        .eq(
          "experience_id",
          experience.id,
        )
        .maybeSingle();

      if (
        activityError ||
        !activity ||
        activity.activity_type !== "mystery_drop" ||
        activity.status !== "active"
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Active Mystery Drop could not be found.",
          },
          { status: 409 },
        );
      }

      /*
       * Confirm the requested drop exists
       * in this activity's configuration.
       */
      const configuration =
        asRecord(activity.configuration);

      const drops =
        Array.isArray(configuration.drops)
          ? configuration.drops
          : [];

      const dropExists = drops.some(
        (value) => {
          const drop = asRecord(value);

          return (
            cleanText(drop.id, 200) ===
            dropId
          );
        },
      );

      if (!dropExists) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Mystery Drop could not be found.",
          },
          { status: 404 },
        );
      }

      /*
       * Single Activity Mode:
       * Preserve the legacy shared
       * currentDropId property.
       *
       * Multiple Activity Mode:
       * Store the selected drop under
       * this activity's own runtime state.
       */
/*
 * Release the Mystery Drop atomically.
 *
 * Single Activity Mode:
 * Updates the legacy currentDropId field.
 *
 * Multiple Activity Mode:
 * Updates only this Mystery Drop activity's
 * activityRuntime entry.
 *
 * PostgreSQL revalidates activity selection
 * while holding the experience lock.
 */
const {
  error: updateError,
} = await sb.rpc(
  "update_live_experience_state_atomic",
  {
    p_experience_id: experience.id,
    p_state_patch: {},
    p_activity_id: mysteryDropActivityId,
    p_activity_type: "mystery_drop",
    p_update_current_activity: false,
    p_host_runtime_key: "currentDropId",
    p_host_runtime_value: dropId,
  },
);

      if (updateError) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to release Mystery Drop.",
          },
          { status: 500 },
        );
      }

      /*
       * Notify connected clients using
       * the activity that was updated.
       */
      await broadcastChange(
        sb,
        experience.id,
        mysteryDropActivityId,
      );

      return NextResponse.json({
        ok: true,
        action,
        currentDropId: dropId,
      });
    }


    /*
     * ================================================================
     * SONG REQUEST — CHANGE QUEUE STATUS
     * ================================================================
     */
    if (
      action ===
      "update_song_request"
    ) {
      const requestId =
        cleanText(
          body.requestId,
          100,
        );

      const status =
        cleanText(
          body.status,
          50,
        );

      if (
        !UUID_PATTERN.test(
          requestId,
        ) ||
        ![
          "queued",
          "playing",
          "played",
          "rejected",
        ].includes(status)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid Song Request update.",
          },
          { status: 400 },
        );
      }


      /*
       * Atomically update the Song Request status.
       *
       * PostgreSQL locks the Live experience,
       * validates the request, and ensures that
       * only one song is playing at a time.
       */
      const {
        data: songData,
        error: songError,
      } = await sb.rpc(
        "update_live_song_request_status_atomic",
        {
          p_experience_id: experience.id,
          p_request_id: requestId,
          p_status: status,
        },
      );

      if (songError) {
        console.error(
          "Atomic Song Request update failed:",
          songError,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Song Request could not be updated.",
          },
          { status: 500 },
        );
      }

      const songRequest = Array.isArray(songData)
        ? songData[0]
        : songData;

      if (!songRequest) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Song Request could not be found.",
          },
          { status: 404 },
        );
      }



      await broadcastChange(
        sb,
        experience.id,
        currentActivityId,
      );

      return NextResponse.json({
        ok: true,

        action,

        songRequest: {
          id: songRequest.id,

          songTitle:
            songRequest.song_title,

          artistName:
            songRequest.artist_name ??
            null,

          status:
            songRequest.status,

          sortOrder:
            songRequest.sort_order,

          requestedAt:
            songRequest.requested_at,
        },
      });
    }

    /*
 * ================================================================
 * SCHEDULE — CREATE ENTRY
 * ================================================================
 */
if (
  action ===
  "create_schedule_entry"
) {
  const title = cleanText(
    body.title,
    200,
  );

  const description = cleanText(
    body.description,
    1000,
  );

  const startsAtRaw = cleanText(
    body.startsAt,
    100,
  );

  const endsAtRaw = cleanText(
    body.endsAt,
    100,
  );

  if (!title) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Schedule title is required.",
      },
      { status: 400 },
    );
  }

  const parseOptionalDate = (
    value: string,
  ) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(
      date.getTime(),
    )
      ? undefined
      : date.toISOString();
  };

  const startsAt =
    parseOptionalDate(startsAtRaw);

  const endsAt =
    parseOptionalDate(endsAtRaw);

  if (
    startsAt === undefined ||
    endsAt === undefined
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid Schedule date or time.",
      },
      { status: 400 },
    );
  }

  if (
    startsAt &&
    endsAt &&
    new Date(endsAt).getTime() <
      new Date(startsAt).getTime()
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Schedule end time cannot be before the start time.",
      },
      { status: 400 },
    );
  }


  /*
   * Atomically create the Schedule entry.
   *
   * PostgreSQL locks the Live experience,
   * calculates the next sort position,
   * and inserts the entry in one transaction.
   */
  const {
    data: entryData,
    error: entryError,
  } = await sb.rpc(
    "create_live_schedule_entry_atomic",
    {
      p_experience_id: experience.id,
      p_title: title,
      p_description: description,
      p_starts_at: startsAt,
      p_ends_at: endsAt,
    },
  );

  if (entryError) {
    console.error(
      "Atomic Schedule creation failed:",
      entryError,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Schedule entry could not be created.",
      },
      { status: 500 },
    );
  }

  const entry = Array.isArray(entryData)
    ? entryData[0]
    : entryData;

  if (!entry) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Schedule entry could not be created.",
      },
      { status: 500 },
    );
  }



  await broadcastChange(
    sb,
    experience.id,
    currentActivityId,
  );

  return NextResponse.json({
    ok: true,
    action,
    entry: {
      id: entry.id,

      title:
        entry.title,

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
    },
  });
}

/*
 * ================================================================
 * SCHEDULE — EDIT ENTRY
 * ================================================================
 */
if (action === "edit_schedule_entry") {
  const entryId = cleanText(body.entryId, 100);
  const title = cleanText(body.title, 200);
  const description = cleanText(body.description, 1000);
  const startsAtRaw = cleanText(body.startsAt, 100);
  const endsAtRaw = cleanText(body.endsAt, 100);

  if (!UUID_PATTERN.test(entryId) || !title) {
    return NextResponse.json(
      {
        ok: false,
        error: "Valid Schedule entry and title are required.",
      },
      { status: 400 },
    );
  }

  const parseOptionalDate = (value: string) => {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? undefined
      : date.toISOString();
  };

  const startsAt = parseOptionalDate(startsAtRaw);
  const endsAt = parseOptionalDate(endsAtRaw);

  if (startsAt === undefined || endsAt === undefined) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid Schedule date or time.",
      },
      { status: 400 },
    );
  }

  if (
    startsAt &&
    endsAt &&
    new Date(endsAt).getTime() <
      new Date(startsAt).getTime()
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Schedule end time cannot be before the start time.",
      },
      { status: 400 },
    );
  }

  const { data: entry, error: entryError } = await sb
    .from("live_schedule_entries")
    .update({
      title,
      description,
      starts_at: startsAt,
      ends_at: endsAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", entryId)
    .eq("experience_id", experience.id)
    .neq("status", "current")
    .select(
      "id, title, description, starts_at, ends_at, status, sort_order",
    )
    .maybeSingle();

  if (entryError) {
    console.error("Schedule edit failed:", entryError);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to save Schedule changes.",
      },
      { status: 500 },
    );
  }

  if (!entry) {
    return NextResponse.json(
      {
        ok: false,
        error: "Schedule entry not found or currently active.",
      },
      { status: 409 },
    );
  }

  await broadcastChange(
    sb,
    experience.id,
    currentActivityId,
  );

  return NextResponse.json({
    ok: true,
    action,
    entry,
  });
}

    /*
     * ================================================================
     * SCHEDULE — CHANGE STATUS
     * ================================================================
     */
    if (
      action ===
      "update_schedule_entry"
    ) {
      const entryId =
        cleanText(
          body.entryId,
          100,
        );

      const status =
        cleanText(
          body.status,
          50,
        );

      if (
        !UUID_PATTERN.test(
          entryId,
        ) ||
        ![
          "upcoming",
          "current",
          "completed",
          "cancelled",
        ].includes(status)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid Schedule update.",
          },
          { status: 400 },
        );
      }


      /*
       * Atomically update the Schedule status.
       *
       * PostgreSQL locks the Live experience,
       * validates the selected entry, and
       * ensures only one entry is current.
       */
      const {
        data: entryData,
        error: entryError,
      } = await sb.rpc(
        "update_live_schedule_entry_status_atomic",
        {
          p_experience_id: experience.id,
          p_entry_id: entryId,
          p_status: status,
        },
      );

      if (entryError) {
        console.error(
          "Atomic Schedule status update failed:",
          entryError,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Schedule entry could not be updated.",
          },
          { status: 500 },
        );
      }

      const entry = Array.isArray(entryData)
        ? entryData[0]
        : entryData;

      if (!entry) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Schedule entry could not be found.",
          },
          { status: 404 },
        );
      }



      await broadcastChange(
        sb,
        experience.id,
        currentActivityId,
      );

      return NextResponse.json({
        ok: true,
        action,
        entry,
      });
    }

        /*
     * ================================================================
     * ANNOUNCEMENT — CREATE
     * ================================================================
     */
    if (
      action ===
      "create_announcement"
    ) {
      const title = cleanText(
        body.title,
        200,
      );

      const message = cleanText(
        body.message,
        2000,
      );

      if (!message) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Announcement message is required.",
          },
          { status: 400 },
        );
      }

      const now =
        new Date().toISOString();

      const {
        data: announcement,
        error: announcementError,
      } = await sb
        .from(
          "live_announcements",
        )
        .insert({
          experience_id:
            experience.id,

          title:
            title || null,

          message,

          status: "draft",

          published_at: null,

          created_at: now,

          updated_at: now,
        })
        .select(
          "id, title, message, status, published_at, created_at, updated_at",
        )
        .single();

      if (
        announcementError ||
        !announcement
      ) {
        console.error(
          "Announcement creation failed:",
          announcementError,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Announcement could not be created.",
          },
          { status: 500 },
        );
      }

      await broadcastChange(
        sb,
        experience.id,
        currentActivityId,
      );

      return NextResponse.json({
        ok: true,
        action,

        announcement: {
          id: announcement.id,

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
        },
      });
    }

    /*
     * ================================================================
     * ANNOUNCEMENT — PUBLISH
     * ================================================================
     */
    if (
      action ===
      "publish_announcement"
    ) {
      const announcementId =
        cleanText(
          body.announcementId,
          100,
        );

      if (
        !UUID_PATTERN.test(
          announcementId,
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid Announcement.",
          },
          { status: 400 },
        );
      }

      const publishedAt =
        new Date().toISOString();

      const {
        data: announcement,
        error:
          announcementError,
      } = await sb
        .from(
          "live_announcements",
        )
        .update({
          status: "published",
          published_at:
            publishedAt,
          updated_at:
            publishedAt,
        })
        .eq(
          "id",
          announcementId,
        )
        .eq(
          "experience_id",
          experience.id,
        )
        .select(
          "id, title, message, status, published_at",
        )
        .maybeSingle();

      if (
        announcementError ||
        !announcement
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Announcement could not be published.",
          },
          { status: 404 },
        );
      }

      await broadcastChange(
        sb,
        experience.id,
        currentActivityId,
      );

      return NextResponse.json({
        ok: true,
        action,
        announcement,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unsupported Host action.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error(
      "Host action POST error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to perform Host action.",
      },
      { status: 500 },
    );
  }
}