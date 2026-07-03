import type { MicrositeBlock } from "@/lib/templates/builder";

type HighlightBlock = Extract<MicrositeBlock, { type: "highlight" }>;

export type HighlightTextTarget =
  | "heading"
  | "subtitle"
  | "label"
  | "linearUnitLabel"
  | "value"
  | "prefix"
  | "suffix"
  | "description";

export type HighlightStyleTarget = "section" | "block";

function isHighlightBlock(block: MicrositeBlock): block is HighlightBlock {
  return block.type === "highlight";
}

function getTextStyleKey(target: HighlightTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "subtitle"
      ? "subtitleStyle"
      : target === "label"
        ? "labelStyle"
        : target === "linearUnitLabel"
          ? "linearUnitLabelStyle"
          : target === "value"
            ? "valueStyle"
            : target === "prefix"
              ? "prefixStyle"
              : target === "suffix"
                ? "suffixStyle"
                : "descriptionStyle";
}

function getStyleKey(target: HighlightStyleTarget) {
  return target === "section" ? "cardStyle" : "style";
}

export function getHighlightTextStyle(
  block: MicrositeBlock | null | undefined,
  target: HighlightTextTarget,
) {
  if (!block || block.type !== "highlight") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyHighlightTextStylePatch(
  block: MicrositeBlock,
  target: HighlightTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isHighlightBlock(block)) return block;

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

export function applyHighlightStylePatch(
  block: MicrositeBlock,
  target: HighlightStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isHighlightBlock(block)) return block;

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