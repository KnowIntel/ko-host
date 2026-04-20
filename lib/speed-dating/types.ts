export type SpeedDatingIam = "man" | "woman";
export type SpeedDatingSeeking = "men" | "women";

export type SpeedDatingParticipantId = string;
export type SpeedDatingPairId = string;
export type SpeedDatingRoomId = string;
export type SpeedDatingMessageId = string;

export interface SpeedDatingParticipantProfile {
  id: SpeedDatingParticipantId;
  browserKey: string;
  sessionId: string;
  slug: string;

  name: string;
  title: string;
  bio: string;
  imageUrl?: string | null;

  iam: SpeedDatingIam;
  seeking: SpeedDatingSeeking;

  joinedAt: string;
  updatedAt: string;
  active: boolean;
}

export interface SpeedDatingQueueEntry {
  participantId: SpeedDatingParticipantId;
  joinedAt: string;
}

export interface SpeedDatingPair {
  pairId: SpeedDatingPairId;
  roomId: SpeedDatingRoomId;
  sessionId: string;
  round: number;

  leftParticipantId: SpeedDatingParticipantId | null;
  rightParticipantId: SpeedDatingParticipantId | null;

  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface SpeedDatingRoundState {
  sessionId: string;
  slug: string;

  round: number;
  roundDurationSeconds: number;
  roundStartedAt: string;
  roundEndsAt: string;

  serverNow: string;
}

export interface SpeedDatingPublicParticipantCard {
  participantId: SpeedDatingParticipantId;
  name: string;
  title: string;
  bio: string;
  imageUrl?: string | null;
  iam: SpeedDatingIam;
  seeking: SpeedDatingSeeking;
}

export interface SpeedDatingPublicQueueState {
  leftQueue: SpeedDatingPublicParticipantCard[];
  rightQueue: SpeedDatingPublicParticipantCard[];
}

export interface SpeedDatingPublicPairState {
  pairId: SpeedDatingPairId;
  round: number;
  leftParticipant: SpeedDatingPublicParticipantCard | null;
  rightParticipant: SpeedDatingPublicParticipantCard | null;
  openSlotLeft: boolean;
  openSlotRight: boolean;
}

export interface SpeedDatingPublicState {
  sessionId: string;
  slug: string;

  round: number;
  roundDurationSeconds: number;
  roundStartedAt: string;
  roundEndsAt: string;
  serverNow: string;

  queues: SpeedDatingPublicQueueState;
  activePairs: SpeedDatingPublicPairState[];
}

export interface SpeedDatingPrivateRoomState {
  roomId: SpeedDatingRoomId;
  pairId: SpeedDatingPairId;
  sessionId: string;
  slug: string;
  round: number;

  me: SpeedDatingParticipantProfile;
  otherParticipant: SpeedDatingParticipantProfile | null;

  roomOpen: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface SpeedDatingChatMessage {
  messageId: SpeedDatingMessageId;
  roomId: SpeedDatingRoomId;
  sessionId: string;
  round: number;

  senderParticipantId: SpeedDatingParticipantId;
  senderBrowserKey: string;

  type: "text" | "image";
  text?: string;
  imageUrl?: string;

  createdAt: string;
}

export interface SpeedDatingJoinInput {
  sessionId: string;
  slug: string;
  browserKey: string;

  name: string;
  title: string;
  bio: string;
  iam: SpeedDatingIam;
  seeking: SpeedDatingSeeking;
  imageUrl?: string | null;
}

export interface SpeedDatingLeaveInput {
  sessionId: string;
  browserKey: string;
}

export interface SpeedDatingSkipInput {
  sessionId: string;
  browserKey: string;
}

export interface SpeedDatingPrivateRoomInput {
  sessionId: string;
  browserKey: string;
}

export interface SpeedDatingSendMessageInput {
  sessionId: string;
  roomId: string;
  browserKey: string;

  type: "text" | "image";
  text?: string;
  imageUrl?: string;
}

export interface SpeedDatingUploadResponse {
  imageUrl: string;
}

export interface SpeedDatingApiSuccess<T> {
  ok: true;
  data: T;
}

export interface SpeedDatingApiError {
  ok: false;
  error: string;
  code:
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNPROCESSABLE"
    | "INTERNAL_ERROR";
}

export type SpeedDatingApiResponse<T> =
  | SpeedDatingApiSuccess<T>
  | SpeedDatingApiError;