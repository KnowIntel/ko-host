import type { MicrositeBlock } from "@/lib/templates/builder";

type VisitorCountBlock = Extract<MicrositeBlock, { type: "visitor_counter" }>;

export type VisitorCountTextTarget =
  | "heading"
  | "subtitle"
  | "counterLabel";

export type VisitorCountStyleTarget = "tiles" | "block";

function isVisitorCountBlock(
  block: MicrositeBlock,
): block is VisitorCountBlock {
  return block.type === "visitor_counter";
}

function getTextStyleKey(target: VisitorCountTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "subtitle"
      ? "subtitleStyle"
      : "counterLabelStyle";
}

function getStyleKey(target: VisitorCountStyleTarget) {
  return target === "tiles" ? "tileStyle" : "style";
}

export function getVisitorCountTextStyle(
  block: MicrositeBlock | null | undefined,
  target: VisitorCountTextTarget,
) {
  if (!block || block.type !== "visitor_counter") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyVisitorCountTextStylePatch(
  block: MicrositeBlock,
  target: VisitorCountTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isVisitorCountBlock(block)) return block;

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

export function applyVisitorCountStylePatch(
  block: MicrositeBlock,
  target: VisitorCountStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isVisitorCountBlock(block)) return block;

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