import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveTriviaBlock = Extract<
  MicrositeBlock,
  { type: "live_trivia" }
>;

export type LiveTriviaTextTarget =
  | "heading"
  | "waitingText"
  | "joinRequiredText"
  | "question"
  | "choice"
  | "submitButton"
  | "result"
  | "score"
  | "leaderboardHeading"
  | "leaderboardText";

export type LiveTriviaStyleTarget =
  | "block"
  | "choice"
  | "selectedChoice"
  | "submitButton"
  | "leaderboard";

function isLiveTriviaBlock(
  block: MicrositeBlock,
): block is LiveTriviaBlock {
  return block.type === "live_trivia";
}

function getTextStyleKey(
  target: LiveTriviaTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "waitingText":
      return "waitingTextStyle";

    case "joinRequiredText":
      return "joinRequiredTextStyle";

    case "question":
      return "questionStyle";

    case "choice":
      return "choiceTextStyle";

    case "submitButton":
      return "submitButtonTextStyle";

    case "result":
      return "resultStyle";

    case "score":
      return "scoreStyle";

    case "leaderboardHeading":
      return "leaderboardHeadingStyle";

    case "leaderboardText":
      return "leaderboardTextStyle";
  }
}

function getStyleKey(
  target: LiveTriviaStyleTarget,
) {
  switch (target) {
    case "choice":
      return "choiceStyle";

    case "selectedChoice":
      return "selectedChoiceStyle";

    case "submitButton":
      return "submitButtonStyle";

    case "leaderboard":
      return "leaderboardStyle";

    case "block":
      return "style";
  }
}

export function getLiveTriviaTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveTriviaTextTarget,
) {
  if (
    !block ||
    block.type !== "live_trivia"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey =
    getTextStyleKey(target);

  return (
    data[styleKey] ??
    data.style ??
    {}
  );
}

export function applyLiveTriviaTextStylePatch(
  block: MicrositeBlock,
  target: LiveTriviaTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveTriviaBlock(block)) {
    return block;
  }

  const data = block.data as any;
  const styleKey =
    getTextStyleKey(target);

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

export function getLiveTriviaStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveTriviaStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_trivia"
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

  const styleKey =
    getStyleKey(target);

  return data[styleKey] ?? {};
}

export function applyLiveTriviaStylePatch(
  block: MicrositeBlock,
  target: LiveTriviaStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveTriviaBlock(block)) {
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

  const styleKey =
    getStyleKey(target);

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