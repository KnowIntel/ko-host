import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveScavengerHuntBlock = Extract<
  MicrositeBlock,
  { type: "live_scavenger_hunt" }
>;

export type LiveScavengerHuntTextTarget =
  | "heading"
  | "waitingText"
  | "joinRequiredText"
  | "itemTitle"
  | "itemDescription"
  | "completedLabel"
  | "progress";

export type LiveScavengerHuntStyleTarget =
  | "block"
  | "item"
  | "completedItem";

function isLiveScavengerHuntBlock(
  block: MicrositeBlock,
): block is LiveScavengerHuntBlock {
  return block.type === "live_scavenger_hunt";
}

function getTextStyleKey(
  target: LiveScavengerHuntTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "waitingText":
      return "waitingTextStyle";

    case "joinRequiredText":
      return "joinRequiredTextStyle";

    case "itemTitle":
      return "itemTitleStyle";

    case "itemDescription":
      return "itemDescriptionStyle";

    case "completedLabel":
      return "completedLabelStyle";

    case "progress":
      return "progressStyle";
  }
}

function getStyleKey(
  target: LiveScavengerHuntStyleTarget,
) {
  switch (target) {
    case "item":
      return "itemStyle";

    case "completedItem":
      return "completedItemStyle";

    case "block":
      return "style";
  }
}

export function getLiveScavengerHuntTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveScavengerHuntTextTarget,
) {
  if (
    !block ||
    block.type !== "live_scavenger_hunt"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyLiveScavengerHuntTextStylePatch(
  block: MicrositeBlock,
  target: LiveScavengerHuntTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveScavengerHuntBlock(block)) {
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

export function getLiveScavengerHuntStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveScavengerHuntStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_scavenger_hunt"
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

export function applyLiveScavengerHuntStylePatch(
  block: MicrositeBlock,
  target: LiveScavengerHuntStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveScavengerHuntBlock(block)) {
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