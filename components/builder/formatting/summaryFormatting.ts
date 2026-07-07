import type { MicrositeBlock } from "@/lib/templates/builder";

type SummaryBlock = Extract<MicrositeBlock, { type: "summary" }>;

export type SummaryTextTarget =
  | "heading"
  | "subheader"
  | "contentLabel"
  | "content"
  | "footerLabel"
  | "footerAggregate"
  | "footerCaption";

function isSummaryBlock(block: MicrositeBlock): block is SummaryBlock {
  return block.type === "summary";
}

function getTextStyleKey(target: SummaryTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "subheader"
      ? "subheaderStyle"
      : target === "contentLabel"
        ? "contentLabelStyle"
        : target === "content"
          ? "contentStyle"
          : target === "footerLabel"
            ? "footerLabelStyle"
            : target === "footerAggregate"
              ? "footerAggregateStyle"
              : "footerCaptionStyle";
}

export function getSummaryTextStyle(
  block: MicrositeBlock | null | undefined,
  target: SummaryTextTarget,
) {
  if (!block || block.type !== "summary") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applySummaryTextStylePatch(
  block: MicrositeBlock,
  target: SummaryTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isSummaryBlock(block)) return block;

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