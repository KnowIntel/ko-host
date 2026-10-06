// components\builder\formatting\liveSpinWheelFormatting.ts

import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveSpinWheelBlock = Extract<
  MicrositeBlock,
  { type: "live_spin_wheel" }
>;

export type LiveSpinWheelTextTarget =
  | "heading"
  | "waitingText"
  | "joinRequiredText"
  | "wheelText"
  | "spinButton"
  | "resultHeading"
  | "resultText";

export type LiveSpinWheelStyleTarget =
  | "block"
  | "wheel"
  | "spinButton"
  | "result";

function isLiveSpinWheelBlock(
  block: MicrositeBlock,
): block is LiveSpinWheelBlock {
  return block.type === "live_spin_wheel";
}

function getTextStyleKey(
  target: LiveSpinWheelTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "waitingText":
      return "waitingTextStyle";

    case "joinRequiredText":
      return "joinRequiredTextStyle";

    case "wheelText":
      return "wheelTextStyle";

    case "spinButton":
      return "spinButtonTextStyle";

    case "resultHeading":
      return "resultHeadingStyle";

    case "resultText":
      return "resultTextStyle";
  }
}

function getStyleKey(
  target: LiveSpinWheelStyleTarget,
) {
  switch (target) {
    case "wheel":
      return "wheelStyle";

    case "spinButton":
      return "spinButtonStyle";

    case "result":
      return "resultStyle";

    case "block":
      return "style";
  }
}

export function getLiveSpinWheelTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveSpinWheelTextTarget,
) {
  if (
    !block ||
    block.type !== "live_spin_wheel"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey =
    getTextStyleKey(target);

  return (
    data[styleKey] ??
    data.style ??
    {}
  );
}

export function applyLiveSpinWheelTextStylePatch(
  block: MicrositeBlock,
  target: LiveSpinWheelTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveSpinWheelBlock(block)) {
    return block;
  }

  const data = block.data as any;
  const styleKey =
    getTextStyleKey(target);

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

export function getLiveSpinWheelStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveSpinWheelStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_spin_wheel"
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

  const styleKey =
    getStyleKey(target);

  return data[styleKey] ?? {};
}

export function applyLiveSpinWheelStylePatch(
  block: MicrositeBlock,
  target: LiveSpinWheelStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveSpinWheelBlock(block)) {
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

  const styleKey =
    getStyleKey(target);

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