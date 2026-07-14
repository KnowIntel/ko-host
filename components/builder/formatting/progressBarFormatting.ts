import type { MicrositeBlock } from "@/lib/templates/builder";

type ProgressBarBlock = Extract<MicrositeBlock, { type: "progress_bar" }>;

export type ProgressBarTextTarget =
  | "heading"
  | "context"
  | "meterValue"
  | "caption";

function isProgressBarBlock(
  block: MicrositeBlock,
): block is ProgressBarBlock {
  return block.type === "progress_bar";
}

function getTextStyleKey(target: ProgressBarTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "context"
      ? "contextStyle"
      : target === "meterValue"
        ? "meterValueStyle"
        : "meterCaptionStyle";
}

export function getProgressBarTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ProgressBarTextTarget,
) {
  if (!block || block.type !== "progress_bar") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyProgressBarTextStylePatch(
  block: MicrositeBlock,
  target: ProgressBarTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isProgressBarBlock(block)) return block;

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