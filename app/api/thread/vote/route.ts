import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const VOTE_COOKIE_NAME = "kht_thread_votes";
const MAX_STORED_VOTES = 500;

type StoredVoteMap = Record<string, -1 | 1>;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function parseStoredVotes(raw: string | undefined): StoredVoteMap {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next: StoredVoteMap = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (value === 1 || value === -1) {
        next[key] = value;
      }
    }

    return next;
  } catch {
    return {};
  }
}

function trimStoredVotes(map: StoredVoteMap): StoredVoteMap {
  const entries = Object.entries(map);
  if (entries.length <= MAX_STORED_VOTES) return map;

  const trimmed = entries.slice(entries.length - MAX_STORED_VOTES);
  return Object.fromEntries(trimmed) as StoredVoteMap;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const messageId =
      typeof body?.messageId === "string" ? body.messageId.trim() : "";

    const rawTargetVote: number | null =
      body?.targetVote === 1 || body?.targetVote === -1
        ? body.targetVote
        : body?.delta === 1 || body?.delta === -1
          ? body.delta
          : null;

    if (!messageId) {
      return badRequest("Missing messageId.");
    }

    if (rawTargetVote !== 1 && rawTargetVote !== -1) {
      return badRequest("targetVote must be 1 or -1.");
    }

    const targetVote: 1 | -1 = rawTargetVote;

    const supabaseAdmin = getSupabaseAdmin();

    const { data: currentMessage, error: currentMessageError } =
      await supabaseAdmin
        .from("microsite_thread_messages")
        .select("id, votes")
        .eq("id", messageId)
        .single();

    if (currentMessageError || !currentMessage) {
      return NextResponse.json(
        { error: currentMessageError?.message || "Message not found." },
        { status: 404 },
      );
    }

    const cookieStore = await cookies();
    const storedVotes = parseStoredVotes(
      cookieStore.get(VOTE_COOKIE_NAME)?.value,
    );

const previousVoteRaw = storedVotes[messageId];
const previousVote: -1 | 0 | 1 =
  previousVoteRaw === 1 || previousVoteRaw === -1 ? previousVoteRaw : 0;

if (previousVote === targetVote) {
  const response = NextResponse.json({
    message: {
      id: String(currentMessage.id),
      votes: Number(currentMessage.votes ?? 0),
      userVote: targetVote,
    },
  });

  response.cookies.set({
    name: VOTE_COOKIE_NAME,
    value: JSON.stringify(trimStoredVotes(storedVotes)),
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

let actualDelta: -2 | -1 | 1 | 2;

if (previousVote === 0) {
  actualDelta = targetVote;
} else {
  actualDelta = (targetVote - previousVote) as -2 | -1 | 1 | 2;
}

const { data, error } = await supabaseAdmin.rpc("increment_thread_vote", {
  message_id_input: messageId,
  delta_input: actualDelta,
});

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update vote." },
        { status: 500 },
      );
    }

    const resolvedMessage = Array.isArray(data) ? data[0] : data;

    if (!resolvedMessage) {
      return NextResponse.json(
        { error: "Vote update returned no message." },
        { status: 500 },
      );
    }

    const nextStoredVotes = trimStoredVotes({
      ...storedVotes,
      [messageId]: targetVote,
    });

    const response = NextResponse.json({
      message: {
        id: String(
          (resolvedMessage as any).id ??
            (resolvedMessage as any).message_id ??
            messageId,
        ),
        votes: Number(
          (resolvedMessage as any).votes ??
            (resolvedMessage as any).vote_count ??
            0,
        ),
        userVote: targetVote,
      },
    });

    response.cookies.set({
      name: VOTE_COOKIE_NAME,
      value: JSON.stringify(nextStoredVotes),
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to update vote." },
      { status: 500 },
    );
  }
}