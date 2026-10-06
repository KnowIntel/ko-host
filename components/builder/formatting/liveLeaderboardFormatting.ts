import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveLeaderboardBlock = Extract<
  MicrositeBlock,
  { type: "live_leaderboard" }
>;

export type LiveLeaderboardTextTarget =
  | "heading"
  | "rank"
  | "participant"
  | "score"
  | "emptyText";

export type LiveLeaderboardStyleTarget =
  | "block"
  | "row"
  | "currentParticipant";

function isLiveLeaderboardBlock(
  block: MicrositeBlock,
): block is LiveLeaderboardBlock {
  return block.type === "live_leaderboard";
}

function getTextStyleKey(
  target: LiveLeaderboardTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "rank":
      return "rankStyle";

    case "participant":
      return "participantStyle";

    case "score":
      return "scoreStyle";

    case "emptyText":
      return "emptyTextStyle";
  }
}

function getStyleKey(
  target: LiveLeaderboardStyleTarget,
) {
  switch (target) {
    case "row":
      return "rowStyle";

    case "currentParticipant":
      return "currentParticipantStyle";

    case "block":
      return "style";
  }
}

export function getLiveLeaderboardTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveLeaderboardTextTarget,
) {
  if (
    !block ||
    block.type !== "live_leaderboard"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyLiveLeaderboardTextStylePatch(
  block: MicrositeBlock,
  target: LiveLeaderboardTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveLeaderboardBlock(block)) {
    return block;
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...data,
      [styleKey]: {
        ...(data[styleKey] ?? {}),
        ...patch,
      },
    },
  };
}

export function getLiveLeaderboardStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveLeaderboardStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_leaderboard"
  ) {
    return {};
  }

  const data = block.data as any;

  if (target === "block") {
    return {
      ...(data.style ?? {}),
      ...(block.appearance ?? {}),
    };
  }

  const styleKey = getStyleKey(target);

  return data[styleKey] ?? {};
}

export function applyLiveLeaderboardStylePatch(
  block: MicrositeBlock,
  target: LiveLeaderboardStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveLeaderboardBlock(block)) {
    return block;
  }

  const data = block.data as any;

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...(block.appearance ?? {}),
        ...patch,
      },
      data: {
        ...data,
        style: {
          ...(data.style ?? {}),
          ...patch,
        },
      },
    };
  }

  const styleKey = getStyleKey(target);

  return {
    ...block,
    data: {
      ...data,
      [styleKey]: {
        ...(data[styleKey] ?? {}),
        ...patch,
      },
    },
  };
}