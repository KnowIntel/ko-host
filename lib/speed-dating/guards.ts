import {
  SPEED_DATING_ALLOWED_IAM,
  SPEED_DATING_ALLOWED_MESSAGE_TYPES,
  SPEED_DATING_ALLOWED_SEEKING,
  SPEED_DATING_MAX_BIO_LENGTH,
  SPEED_DATING_MAX_NAME_LENGTH,
  SPEED_DATING_MAX_TEXT_MESSAGE_LENGTH,
  SPEED_DATING_MAX_TITLE_LENGTH,
} from "./constants";
import type {
  SpeedDatingIam,
  SpeedDatingJoinInput,
  SpeedDatingPrivateRoomInput,
  SpeedDatingSeeking,
  SpeedDatingSendMessageInput,
  SpeedDatingSkipInput,
  SpeedDatingLeaveInput,
} from "./types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidIam(value: unknown): value is SpeedDatingIam {
  return typeof value === "string" &&
    (SPEED_DATING_ALLOWED_IAM as readonly string[]).includes(value);
}

function isValidSeeking(value: unknown): value is SpeedDatingSeeking {
  return typeof value === "string" &&
    (SPEED_DATING_ALLOWED_SEEKING as readonly string[]).includes(value);
}

export function validateJoinInput(raw: unknown): SpeedDatingJoinInput {
  const body = (raw ?? {}) as Record<string, unknown>;

  const sessionId = cleanString(body.sessionId);
  const slug = cleanString(body.slug);
  const browserKey = cleanString(body.browserKey);
  const name = cleanString(body.name);
  const title = cleanString(body.title);
  const bio = cleanString(body.bio);
  const iam = body.iam;
  const seeking = body.seeking;
  const imageUrl = cleanString(body.imageUrl) || null;

  if (!isNonEmptyString(sessionId)) {
    throw new Error("Missing sessionId");
  }

  if (!isNonEmptyString(slug)) {
    throw new Error("Missing slug");
  }

  if (!isNonEmptyString(browserKey)) {
    throw new Error("Missing browserKey");
  }

  if (!isNonEmptyString(name)) {
    throw new Error("Name is required");
  }

  if (name.length > SPEED_DATING_MAX_NAME_LENGTH) {
    throw new Error("Name is too long");
  }

  if (!isNonEmptyString(title)) {
    throw new Error("Title is required");
  }

  if (title.length > SPEED_DATING_MAX_TITLE_LENGTH) {
    throw new Error("Title is too long");
  }

  if (!isNonEmptyString(bio)) {
    throw new Error("Bio is required");
  }

  if (bio.length > SPEED_DATING_MAX_BIO_LENGTH) {
    throw new Error("Bio is too long");
  }

  if (!isValidIam(iam)) {
    throw new Error("Invalid iam value");
  }

  if (!isValidSeeking(seeking)) {
    throw new Error("Invalid seeking value");
  }

  return {
    sessionId,
    slug,
    browserKey,
    name,
    title,
    bio,
    iam,
    seeking,
    imageUrl,
  };
}

export function validateLeaveInput(raw: unknown): SpeedDatingLeaveInput {
  const body = (raw ?? {}) as Record<string, unknown>;

  const sessionId = cleanString(body.sessionId);
  const browserKey = cleanString(body.browserKey);

  if (!isNonEmptyString(sessionId)) {
    throw new Error("Missing sessionId");
  }

  if (!isNonEmptyString(browserKey)) {
    throw new Error("Missing browserKey");
  }

  return { sessionId, browserKey };
}

export function validateSkipInput(raw: unknown): SpeedDatingSkipInput {
  const body = (raw ?? {}) as Record<string, unknown>;

  const sessionId = cleanString(body.sessionId);
  const browserKey = cleanString(body.browserKey);

  if (!isNonEmptyString(sessionId)) {
    throw new Error("Missing sessionId");
  }

  if (!isNonEmptyString(browserKey)) {
    throw new Error("Missing browserKey");
  }

  return { sessionId, browserKey };
}

export function validatePrivateRoomInput(
  raw: unknown
): SpeedDatingPrivateRoomInput {
  const body = (raw ?? {}) as Record<string, unknown>;

  const sessionId = cleanString(body.sessionId);
  const browserKey = cleanString(body.browserKey);

  if (!isNonEmptyString(sessionId)) {
    throw new Error("Missing sessionId");
  }

  if (!isNonEmptyString(browserKey)) {
    throw new Error("Missing browserKey");
  }

  return { sessionId, browserKey };
}

export function validateSendMessageInput(
  raw: unknown
): SpeedDatingSendMessageInput {
  const body = (raw ?? {}) as Record<string, unknown>;

  const sessionId = cleanString(body.sessionId);
  const roomId = cleanString(body.roomId);
  const browserKey = cleanString(body.browserKey);
  const type = cleanString(body.type);
  const text = cleanString(body.text);
  const imageUrl = cleanString(body.imageUrl);

  if (!isNonEmptyString(sessionId)) {
    throw new Error("Missing sessionId");
  }

  if (!isNonEmptyString(roomId)) {
    throw new Error("Missing roomId");
  }

  if (!isNonEmptyString(browserKey)) {
    throw new Error("Missing browserKey");
  }

  if (!(SPEED_DATING_ALLOWED_MESSAGE_TYPES as readonly string[]).includes(type)) {
    throw new Error("Invalid message type");
  }

  if (type === "text") {
    if (!isNonEmptyString(text)) {
      throw new Error("Text is required");
    }

    if (text.length > SPEED_DATING_MAX_TEXT_MESSAGE_LENGTH) {
      throw new Error("Text message too long");
    }
  }

  if (type === "image") {
    if (!isNonEmptyString(imageUrl)) {
      throw new Error("imageUrl is required");
    }
  }

  return {
    sessionId,
    roomId,
    browserKey,
    type: type as "text" | "image",
    text: text || undefined,
    imageUrl: imageUrl || undefined,
  };
}