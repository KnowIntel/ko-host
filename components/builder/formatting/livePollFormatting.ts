import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LivePollBlock = Extract<
  MicrositeBlock,
  { type: "live_poll" }
>;

export type LivePollTextTarget =
  | "heading"
  | "waitingText"
  | "joinRequiredText"
  | "question"
  | "choice"
  | "submitButton"
  | "votedLabel"
  | "resultsHeading"
  | "resultsText";

export type LivePollStyleTarget =
  | "block"
  | "choice"
  | "selectedChoice"
  | "submitButton"
  | "results";

function isLivePollBlock(
  block: MicrositeBlock,
): block is LivePollBlock {
  return block.type === "live_poll";
}

function getTextStyleKey(
  target: LivePollTextTarget,
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

case "votedLabel":
  return "votedLabelStyle";

    case "resultsHeading":
      return "resultsHeadingStyle";

    case "resultsText":
      return "resultsTextStyle";
  }
}

function getStyleKey(
  target: LivePollStyleTarget,
) {
  switch (target) {
    case "choice":
      return "choiceStyle";

    case "selectedChoice":
      return "selectedChoiceStyle";

    case "submitButton":
      return "submitButtonStyle";

    case "results":
      return "resultsStyle";

    case "block":
      return "style";
  }
}

export function getLivePollTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LivePollTextTarget,
) {
  if (
    !block ||
    block.type !== "live_poll"
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

export function applyLivePollTextStylePatch(
  block: MicrositeBlock,
  target: LivePollTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLivePollBlock(block)) {
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

export function getLivePollStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LivePollStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_poll"
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

export function applyLivePollStylePatch(
  block: MicrositeBlock,
  target: LivePollStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLivePollBlock(block)) {
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