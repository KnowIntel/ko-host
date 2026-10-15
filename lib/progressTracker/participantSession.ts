import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SESSION_DURATION_DAYS = 90;
const COOKIE_PREFIX = "kht_progress_";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ParticipantSession = {
  participantId: string;
  micrositeId: string;
};

type AuthenticationResult =
  | {
      ok: true;
      participant: ParticipantSession;
    }
  | {
      ok: false;
      status: 401 | 403 | 500;
      error: string;
    };

function getCookieName(micrositeId: string): string {
  return `${COOKIE_PREFIX}${micrositeId}`;
}

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getExpirationDate(): Date {
  const expires = new Date();

  expires.setDate(
    expires.getDate() + SESSION_DURATION_DAYS,
  );

  return expires;
}

export async function authenticateProgressParticipant(
  micrositeId: string,
): Promise<AuthenticationResult> {
  if (!UUID_PATTERN.test(micrositeId)) {
    return {
      ok: false,
      status: 403,
      error: "Invalid microsite.",
    };
  }

  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      getCookieName(micrositeId),
    )?.value ?? "";

  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return {
      ok: false,
      status: 401,
      error: "Progress Tracker session not found.",
    };
  }

  const tokenHash = hashToken(token);

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("progress_tracker_participant_sessions")
    .select(
      "id, site_key, participant_id, token_hash, expires_at",
    )
    .eq("site_key", micrositeId)
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error(
      "Progress Tracker authentication failed:",
      error,
    );

    return {
      ok: false,
      status: 500,
      error: "Unable to authenticate participant.",
    };
  }

  if (!data) {
    return {
      ok: false,
      status: 401,
      error: "Invalid Progress Tracker session.",
    };
  }

  const storedHash = String(data.token_hash ?? "");

  const providedBuffer = Buffer.from(tokenHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (
    providedBuffer.length !== storedBuffer.length ||
    !crypto.timingSafeEqual(
      providedBuffer,
      storedBuffer,
    )
  ) {
    return {
      ok: false,
      status: 401,
      error: "Invalid Progress Tracker session.",
    };
  }

  const expiresAt = new Date(
    String(data.expires_at ?? ""),
  );

  if (
    !Number.isFinite(expiresAt.getTime()) ||
    expiresAt.getTime() <= Date.now()
  ) {
    return {
      ok: false,
      status: 401,
      error: "Progress Tracker session expired.",
    };
  }

  await supabase
    .from("progress_tracker_participant_sessions")
    .update({
      last_used_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  return {
    ok: true,
    participant: {
      participantId: data.participant_id,
      micrositeId: data.site_key,
    },
  };
}

/**
 * Creates a new anonymous participant session.
 *
 * IMPORTANT:
 * Call this only from an authorized server endpoint
 * after verifying that the visitor may access the
 * published microsite.
 */
export async function createProgressParticipantSession(
  micrositeId: string,
): Promise<AuthenticationResult> {
  if (!UUID_PATTERN.test(micrositeId)) {
    return {
      ok: false,
      status: 403,
      error: "Invalid microsite.",
    };
  }

  const existing =
    await authenticateProgressParticipant(micrositeId);

  if (existing.ok) {
    return existing;
  }

  if (existing.status === 500) {
    return existing;
  }

  const participantId = crypto.randomUUID();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = getExpirationDate();

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("progress_tracker_participant_sessions")
    .insert({
      site_key: micrositeId,
      participant_id: participantId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      last_used_at: new Date().toISOString(),
    });

  if (error) {
    console.error(
      "Progress Tracker session creation failed:",
      error,
    );

    return {
      ok: false,
      status: 500,
      error: "Unable to create participant session.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(
    getCookieName(micrositeId),
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    },
  );

  return {
    ok: true,
    participant: {
      participantId,
      micrositeId,
    },
  };
}