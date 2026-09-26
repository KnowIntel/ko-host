import crypto from "crypto";

export const MAILBOX_CODE_PATTERN =
  /^[A-Za-z0-9]{10}$/;

export function normalizeMailboxCode(
  input: string,
) {
  return String(input || "")
    .trim()
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 10);
}

export function buildMailboxAccessCookieName(
  mailboxCode: string,
) {
  return `khc_mailbox_${mailboxCode}`;
}

export function buildMailboxAccessCookieValue(
  mailboxCode: string,
  pinHash: string,
) {
  return crypto
    .createHash("sha256")
    .update(`${mailboxCode}:${pinHash}`)
    .digest("hex");
}

export function safeHashesMatch(
  incomingHash: string,
  expectedHash: string,
) {
  try {
    const incomingBuffer = Buffer.from(
      incomingHash,
      "hex",
    );

    const expectedBuffer = Buffer.from(
      expectedHash,
      "hex",
    );

    if (
      incomingBuffer.length === 0 ||
      incomingBuffer.length !==
        expectedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      incomingBuffer,
      expectedBuffer,
    );
  } catch {
    return false;
  }
}

export function mailboxIsExpired(
  expiresAt: string,
  status: string,
) {
  const expirationTime =
    new Date(expiresAt).getTime();

  return (
    !Number.isFinite(expirationTime) ||
    expirationTime <= Date.now() ||
    status === "expired"
  );
}