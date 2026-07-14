import type { MicrositeBlock } from "@/lib/templates/builder";

type CountdownBlock = Extract<MicrositeBlock, { type: "countdown" }>;

export type CountdownTextTarget =
  | "heading"
  | "values"
  | "units"
  | "completedMessage";

export type CountdownStyleTarget =
  | "tiles"
  | "block";

function isCountdownBlock(
  block: MicrositeBlock,
): block is CountdownBlock {
  return block.type === "countdown";
}

function getTextStyleKey(target: CountdownTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "values"
      ? "standardValueStyle"
      : target === "units"
        ? "standardUnitStyle"
        : "completedMessageStyle";
}

export function getCountdownTextStyle(
  block: MicrositeBlock | null | undefined,
  target: CountdownTextTarget,
) {
  if (!block || block.type !== "countdown") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyCountdownTextStylePatch(
  block: MicrositeBlock,
  target: CountdownTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isCountdownBlock(block)) return block;

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

export function applyCountdownStylePatch(
  block: MicrositeBlock,
  target: CountdownStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isCountdownBlock(block)) return block;

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

  return {
    ...block,
    data: {
      ...data,
      tileStyle: {
        ...(data.tileStyle ?? {}),
        ...patch,
      },
    },
  };
}