import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveMysteryDropBlock = Extract<
  MicrositeBlock,
  { type: "live_mystery_drop" }
>;

export type LiveMysteryDropTextTarget =
  | "heading"
  | "waitingText"
  | "joinRequiredText"
  | "availableLabel"
  | "revealButton"
  | "revealedLabel"
  | "content";

export type LiveMysteryDropStyleTarget =
  | "block"
  | "drop"
  | "revealButton";

function isLiveMysteryDropBlock(
  block: MicrositeBlock,
): block is LiveMysteryDropBlock {
  return block.type === "live_mystery_drop";
}

function getTextStyleKey(
  target: LiveMysteryDropTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "waitingText":
      return "waitingTextStyle";

    case "joinRequiredText":
      return "joinRequiredTextStyle";

    case "availableLabel":
      return "availableLabelStyle";

    case "revealButton":
      return "revealButtonTextStyle";

    case "revealedLabel":
      return "revealedLabelStyle";

    case "content":
      return "contentStyle";
  }
}

function getStyleKey(
  target: LiveMysteryDropStyleTarget,
) {
  switch (target) {
    case "drop":
      return "dropStyle";

    case "revealButton":
      return "revealButtonStyle";

    case "block":
      return "style";
  }
}

export function getLiveMysteryDropTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveMysteryDropTextTarget,
) {
  if (
    !block ||
    block.type !== "live_mystery_drop"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyLiveMysteryDropTextStylePatch(
  block: MicrositeBlock,
  target: LiveMysteryDropTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveMysteryDropBlock(block)) {
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

export function getLiveMysteryDropStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveMysteryDropStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_mystery_drop"
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

export function applyLiveMysteryDropStylePatch(
  block: MicrositeBlock,
  target: LiveMysteryDropStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveMysteryDropBlock(block)) {
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