import type { MicrositeBlock } from "@/lib/templates/builder";

type PollBlock = Extract<MicrositeBlock, { type: "poll" }>;

export type PollTextTarget = "question" | "optionText";
export type PollStyleTarget = "field" | "block";

function isPollBlock(block: MicrositeBlock): block is PollBlock {
  return block.type === "poll";
}

function getTextStyleKey(target: PollTextTarget) {
  return target === "question" ? "questionStyle" : "optionTextStyle";
}

export function getPollTextStyle(
  block: MicrositeBlock | null | undefined,
  target: PollTextTarget,
) {
  if (!block || block.type !== "poll") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyPollTextStylePatch(
  block: MicrositeBlock,
  target: PollTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isPollBlock(block)) return block;

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

      ...(target === "question" && patch.color !== undefined
        ? { questionColor: patch.color }
        : {}),

      ...(target === "optionText" && patch.color !== undefined
        ? { optionTextColor: patch.color }
        : {}),
    },
  };
}

export function applyPollStylePatch(
  block: MicrositeBlock,
  target: PollStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isPollBlock(block)) return block;

  const data = block.data as any;

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...block.appearance,
        ...patch,
      },
      data: {
        ...data,
        blockStyle: {
          ...(data.blockStyle ?? {}),
          ...patch,
        },
      },
    };
  }

  return {
    ...block,
    data: {
      ...data,

      fieldStyle: {
        ...(data.fieldStyle ?? {}),
        ...(patch.backgroundColor !== undefined
          ? { backgroundColor: patch.backgroundColor }
          : {}),
        ...(patch.backgroundOpacity !== undefined
          ? { backgroundOpacity: patch.backgroundOpacity }
          : {}),
        ...(patch.borderColor !== undefined
          ? { borderColor: patch.borderColor }
          : {}),
        ...(patch.borderWidth !== undefined
          ? { borderWidth: Number(patch.borderWidth) || 0 }
          : {}),
        ...(patch.borderRadius !== undefined
          ? { borderRadius: Number(patch.borderRadius) || 0 }
          : {}),
      },

      ...(patch.backgroundColor !== undefined
        ? {
            fieldBackgroundColor: patch.backgroundColor,
            optionBackgroundColor: patch.backgroundColor,
          }
        : {}),

      ...(patch.backgroundOpacity !== undefined
        ? {
            fieldBackgroundOpacity: patch.backgroundOpacity,
            optionBackgroundOpacity: patch.backgroundOpacity,
          }
        : {}),

      ...(patch.borderColor !== undefined
        ? {
            fieldBorderColor: patch.borderColor,
            optionBorderColor: patch.borderColor,
          }
        : {}),

      ...(patch.borderWidth !== undefined
        ? {
            fieldBorderWidth: Number(patch.borderWidth) || 0,
            optionBorderWidth: Number(patch.borderWidth) || 0,
          }
        : {}),

      ...(patch.borderRadius !== undefined
        ? {
            fieldBorderRadius: Number(patch.borderRadius) || 0,
            optionBorderRadius: Number(patch.borderRadius) || 0,
          }
        : {}),
    },
  };
}