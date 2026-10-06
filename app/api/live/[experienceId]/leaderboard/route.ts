import { NextResponse } from "next/server";

import { authenticateLiveParticipant } from "@/lib/live/authenticateParticipant";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
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
          error: authentication.error,
        },
        {
          status: authentication.status,
        },
      );
    }

    const url = new URL(request.url);

    const requestedLimit = Number(
      url.searchParams.get("limit") || 10,
    );

    const limit =
      Number.isFinite(requestedLimit)
        ? Math.max(
            1,
            Math.min(
              Math.trunc(requestedLimit),
              100,
            ),
          )
        : 10;

    const supabase = getSupabaseAdmin();

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
      throw participantsError;
    }

    const {
      data: transactions,
      error: transactionsError,
    } = await supabase
      .from("live_point_transactions")
      .select(`
        participant_id,
        amount
      `)
      .eq(
        "experience_id",
        safeExperienceId,
      );

    if (transactionsError) {
      throw transactionsError;
    }

    const scores =
      new Map<string, number>();

    for (
      const transaction of
      transactions ?? []
    ) {
      const participantId = String(
        transaction.participant_id || "",
      );

      scores.set(
        participantId,
        (scores.get(participantId) ?? 0) +
          Number(
            transaction.amount || 0,
          ),
      );
    }

    const ranked = (
      participants ?? []
    )
      .map((participant) => ({
        id: participant.id,

        displayName:
          participant.display_name,

        avatarUrl:
          participant.avatar_url,

        score:
          scores.get(
            participant.id,
          ) ?? 0,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.displayName.localeCompare(
          b.displayName,
        );
      })
      .map((participant, index) => ({
        ...participant,
        rank: index + 1,

        isCurrentParticipant:
          participant.id ===
          authentication.participant
            .participantId,
      }));

    return NextResponse.json({
      ok: true,

      leaderboard:
        ranked.slice(0, limit),

      currentParticipant:
        ranked.find(
          (participant) =>
            participant.id ===
            authentication.participant
              .participantId,
        ) ?? null,
    });
  } catch (error) {
    console.error(
      "Leaderboard GET failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load the Leaderboard.",
      },
      { status: 500 },
    );
  }
}