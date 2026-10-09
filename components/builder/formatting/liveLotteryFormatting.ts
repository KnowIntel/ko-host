// components\builder\formatting\liveLotteryFormatting.ts

import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveLotteryBlock = Extract<
  MicrositeBlock,
  { type: "live_lottery" }
>;

export type LiveLotteryTextTarget =
  | "heading"
  | "helperText"
  | "joinRequiredText"
  | "enterButton"
  | "enteredLabel"
  | "winnerHeading"
  | "winnerText"
  | "waitingForDrawText";

export type LiveLotteryStyleTarget =
  | "block"
  | "enterButton"
  | "winner";

function isLiveLotteryBlock(
  block: MicrositeBlock,
): block is LiveLotteryBlock {
  return block.type === "live_lottery";
}

function getTextStyleKey(
  target: LiveLotteryTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "helperText":
      return "helperTextStyle";

    case "joinRequiredText":
      return "joinRequiredTextStyle";

    case "enterButton":
      return "enterButtonTextStyle";

    case "enteredLabel":
      return "enteredLabelStyle";

    case "winnerHeading":
      return "winnerHeadingStyle";

    case "winnerText":
      return "winnerTextStyle";

    case "waitingForDrawText":
      return "waitingForDrawTextStyle";
  }
}

function getStyleKey(
  target: LiveLotteryStyleTarget,
) {
  switch (target) {
    case "enterButton":
      return "enterButtonStyle";

    case "winner":
      return "winnerStyle";

    case "block":
      return "style";
  }
}

export function getLiveLotteryTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveLotteryTextTarget,
) {
  if (
    !block ||
    block.type !== "live_lottery"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyLiveLotteryTextStylePatch(
  block: MicrositeBlock,
  target: LiveLotteryTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveLotteryBlock(block)) {
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

export function getLiveLotteryStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveLotteryStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_lottery"
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

export function applyLiveLotteryStylePatch(
  block: MicrositeBlock,
  target: LiveLotteryStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveLotteryBlock(block)) {
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