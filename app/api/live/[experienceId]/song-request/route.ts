import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(
  value: unknown,
  maxLength: number,
) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

async function getContext(
  experienceId: string,
) {
  const safeExperienceId = String(
    experienceId || "",
  )
    .trim()
    .toLowerCase();

  if (!UUID_PATTERN.test(safeExperienceId)) {
    return {
      ok: false as const,
      status: 400,
      error:
        "Invalid Live experience.",
    };
  }

  const authentication =
    await authenticateLiveParticipant(
      safeExperienceId,
    );

  if (!authentication.ok) {
    return {
      ok: false as const,
      status: authentication.status,
      error: authentication.error,
    };
  }

  const supabase = getSupabaseAdmin();

  const {
    data: experience,
    error,
  } = await supabase
    .from("live_experiences")
    .select("id, status, is_enabled")
    .eq("id", safeExperienceId)
    .maybeSingle();

  if (
    error ||
    !experience ||
    !experience.is_enabled
  ) {
    return {
      ok: false as const,
      status: error ? 500 : 409,
      error:
        "This Live experience is not available.",
    };
  }

  return {
    ok: true as const,
    safeExperienceId,
    authentication,
    supabase,
    experience,
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
    const { experienceId } = await params;

    const context =
      await getContext(experienceId);

    if (!context.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: context.error,
        },
        { status: context.status },
      );
    }

    const {
      data,
      error,
    } = await context.supabase
      .from("live_song_requests")
      .select(`
        id,
        participant_id,
        song_title,
        artist_name,
        status,
        sort_order,
        requested_at
      `)
      .eq(
        "experience_id",
        context.safeExperienceId,
      )
      .in("status", [
        "queued",
        "playing",
      ])
      .order("sort_order", {
        ascending: true,
      })
      .order("requested_at", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,

      queue: (data ?? []).map(
        (row) => ({
          id: row.id,
          songTitle:
            row.song_title,
          artistName:
            row.artist_name,
          status: row.status,
          requestedAt:
            row.requested_at,
          requestedByCurrentParticipant:
            row.participant_id ===
            context.authentication
              .participant.participantId,
        }),
      ),
    });
  } catch (error) {
    console.error(
      "Song Request GET failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load the song queue.",
      },
      { status: 500 },
    );
  }
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

    const context =
      await getContext(experienceId);

    if (!context.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: context.error,
        },
        { status: context.status },
      );
    }

    if (
      context.experience.status !==
      "live"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Song requests are only available while the Live experience is active.",
        },
        { status: 409 },
      );
    }

    const body =
      await request.json().catch(() => ({}));

    const source =
      body &&
      typeof body === "object" &&
      !Array.isArray(body)
        ? (body as Record<
            string,
            unknown
          >)
        : {};

    const songTitle = cleanText(
      source.songTitle,
      300,
    );

    const artistName = cleanText(
      source.artistName,
      300,
    );

    if (!songTitle) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Song title is required.",
        },
        { status: 400 },
      );
    }

    const now =
      new Date().toISOString();

    const {
      data: requestRow,
      error: insertError,
    } = await context.supabase
      .from("live_song_requests")
      .insert({
        experience_id:
          context.safeExperienceId,

        participant_id:
          context.authentication
            .participant.participantId,

        song_title: songTitle,

        artist_name:
          artistName || null,

        status: "queued",

        requested_at: now,

        updated_at: now,
      })
      .select(`
        id,
        song_title,
        artist_name,
        status,
        requested_at
      `)
      .single();

    if (
      insertError ||
      !requestRow
    ) {
      throw insertError;
    }

    const channel =
      context.supabase.channel(
        `live-experience-${context.safeExperienceId}`,
      );

    try {
      await channel.send({
        type: "broadcast",
        event:
          "shared-state-changed",

        payload: {
          experienceId:
            context.safeExperienceId,
          updatedAt: now,
        },
      });
    } catch (broadcastError) {
      console.error(
        "Song Request Broadcast failed:",
        broadcastError,
      );
    } finally {
      await context.supabase.removeChannel(
        channel,
      );
    }

    return NextResponse.json(
      {
        ok: true,

        request: {
          id: requestRow.id,
          songTitle:
            requestRow.song_title,
          artistName:
            requestRow.artist_name,
          status:
            requestRow.status,
          requestedAt:
            requestRow.requested_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Song Request POST failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to submit the song request.",
      },
      { status: 500 },
    );
  }
}