import crypto from "crypto";

export const LIVE_PARTICIPANT_SESSION_MAX_AGE =
  60 * 60 * 24 * 30;

export function buildLiveParticipantCookieName(
  experienceId: string,
) {
  const safeExperienceId = String(
    experienceId || "",
  )
    .trim()
    .toLowerCase();

  return `kht_live_${safeExperienceId}`;
}

export function createLiveParticipantToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashLiveParticipantToken(
  token: string,
) {
  return crypto
    .createHash("sha256")
    .update(String(token || ""), "utf8")
    .digest("hex");
}

export function buildLiveParticipantSessionExpiry() {
  return new Date(
    Date.now() +
      LIVE_PARTICIPANT_SESSION_MAX_AGE * 1000,
  );
}

export function safeTokenHashesMatch(
  incomingHash: string,
  storedHash: string,
) {
  const incoming = Buffer.from(
    String(incomingHash || ""),
    "utf8",
  );

  const stored = Buffer.from(
    String(storedHash || ""),
    "utf8",
  );

  if (
    incoming.length === 0 ||
    incoming.length !== stored.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    incoming,
    stored,
  );
}