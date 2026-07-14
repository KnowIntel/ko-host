import type { MicrositeBlock } from "@/lib/templates/builder";

type TimelineBlock = Extract<MicrositeBlock, { type: "timeline" }>;

export type TimelineTextTarget =
  | "heading"
  | "date"
  | "title"
  | "subtitle"
  | "description"
  | "ctaLabel";

export type TimelineStyleTarget =
  | "tile"
  | "ctaLabel"
  | "block";

function isTimelineBlock(
  block: MicrositeBlock,
): block is TimelineBlock {
  return block.type === "timeline";
}

function getTextStyleKey(target: TimelineTextTarget) {
  return target === "heading"
    ? "titleStyle"
    : target === "date"
      ? "dateStyle"
      : target === "title"
        ? "entryTitleStyle"
        : target === "subtitle"
          ? "subtitleStyle"
          : target === "description"
            ? "descriptionStyle"
            : "ctaLabelStyle";
}

export function getTimelineTextStyle(
  block: MicrositeBlock | null | undefined,
  target: TimelineTextTarget,
) {
  if (!block || block.type !== "timeline") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? {};
}

export function applyTimelineTextStylePatch(
  block: MicrositeBlock,
  target: TimelineTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isTimelineBlock(block)) return block;

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

export function applyTimelineStylePatch(
  block: MicrositeBlock,
  target: TimelineStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isTimelineBlock(block)) return block;

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...(block.appearance ?? {}),
        ...patch,
      },
    };
  }

  const data = block.data as any;
  const styleKey =
    target === "tile"
      ? "tileStyle"
      : "ctaLabelStyle";

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