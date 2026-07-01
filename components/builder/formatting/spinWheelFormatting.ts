import type { MicrositeBlock } from "@/lib/templates/builder";

type SpinWheelBlock = Extract<MicrositeBlock, { type: "spin_wheel" }>;

export type SpinWheelTextTarget =
  | "title"
  | "subtitle"
  | "items"
  | "buttonText"
  | "winnerMessage"
  | "loserMessage";

export type SpinWheelStyleTarget = "button" | "block";

function isSpinWheelBlock(block: MicrositeBlock): block is SpinWheelBlock {
  return block.type === "spin_wheel";
}

function getTextStyleKey(target: SpinWheelTextTarget) {
  return target === "title"
    ? "titleStyle"
    : target === "subtitle"
      ? "subtitleStyle"
      : target === "items"
        ? "itemStyle"
        : target === "buttonText"
          ? "buttonTextStyle"
          : target === "winnerMessage"
            ? "winnerMessageStyle"
            : "loserMessageStyle";
}

function getStyleKey(target: SpinWheelStyleTarget) {
  return target === "button" ? "buttonStyle" : "style";
}

export function getSpinWheelTextStyle(
  block: MicrositeBlock | null | undefined,
  target: SpinWheelTextTarget,
) {
  if (!block || block.type !== "spin_wheel") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applySpinWheelTextStylePatch(
  block: MicrositeBlock,
  target: SpinWheelTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isSpinWheelBlock(block)) return block;

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

export function applySpinWheelStylePatch(
  block: MicrositeBlock,
  target: SpinWheelStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isSpinWheelBlock(block)) return block;

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