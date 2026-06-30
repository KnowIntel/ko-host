import type { MicrositeBlock } from "@/lib/templates/builder";

type PostBoardBlock = Extract<MicrositeBlock, { type: "post_board" }>;

export type PostBoardTextTarget =
  | "heading"
  | "subtitle"
  | "pinnedPill"
  | "pinnedLabel"
  | "ownerDisplayName"
  | "actionButtons"
  | "title"
  | "messageText"
  | "defaultProfile";

export type PostBoardStyleTarget =
  | "section"
  | "pinnedPill"
  | "actionButtons"
  | "defaultProfile"
  | "block";

function isPostBoardBlock(block: MicrositeBlock): block is PostBoardBlock {
  return block.type === "post_board";
}

function getTextStyleKey(target: PostBoardTextTarget) {
  return target === "heading"
    ? "blockHeadingStyle"
    : target === "subtitle"
      ? "subtitleStyle"
      : target === "pinnedPill"
        ? "pinnedPillTextStyle"
        : target === "pinnedLabel"
          ? "pinnedLabelStyle"
          : target === "ownerDisplayName"
            ? "ownerDisplayNameStyle"
            : target === "actionButtons"
              ? "actionButtonTextStyle"
              : target === "title"
                ? "headingStyle"
                : target === "messageText"
                  ? "bodyStyle"
                  : "defaultProfileTextStyle";
}

function getStyleKey(target: PostBoardStyleTarget) {
  return target === "section"
    ? "cardStyle"
    : target === "pinnedPill"
      ? "pinnedPillStyle"
      : target === "actionButtons"
        ? "buttonStyle"
        : target === "defaultProfile"
          ? "defaultProfileStyle"
          : "style";
}

export function getPostBoardTextStyle(
  block: MicrositeBlock | null | undefined,
  target: PostBoardTextTarget,
) {
  if (!block || block.type !== "post_board") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyPostBoardTextStylePatch(
  block: MicrositeBlock,
  target: PostBoardTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isPostBoardBlock(block)) return block;

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

export function applyPostBoardStylePatch(
  block: MicrositeBlock,
  target: PostBoardStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isPostBoardBlock(block)) return block;

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