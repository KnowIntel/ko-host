import type { MicrositeBlock } from "@/lib/templates/builder";

type OptionButtonBlock = Extract<MicrositeBlock, { type: "option_button" }>;

export type OptionButtonTextTarget =
  | "heading"
  | "subtitle"
  | "optionText"
  | "placeholder";

export type OptionButtonStyleTarget = "field" | "block";

function isOptionButtonBlock(block: MicrositeBlock): block is OptionButtonBlock {
  return block.type === "option_button";
}

function getTextStyleKey(target: OptionButtonTextTarget) {
  return target === "heading"
    ? "style"
    : target === "subtitle"
      ? "descriptionStyle"
      : target === "placeholder"
        ? "placeholderStyle"
        : "labelStyle";
}

export function getOptionButtonTextStyle(
  block: MicrositeBlock | null | undefined,
  target: OptionButtonTextTarget,
) {
  if (!block || block.type !== "option_button") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyOptionButtonTextStylePatch(
  block: MicrositeBlock,
  target: OptionButtonTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isOptionButtonBlock(block)) return block;

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

      ...(target === "placeholder" && patch.color !== undefined
        ? { placeholderColor: patch.color }
        : {}),
    },
  };
}

export function applyOptionButtonStylePatch(
  block: MicrositeBlock,
  target: OptionButtonStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isOptionButtonBlock(block)) return block;

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

      activeStyle: {
        ...(data.activeStyle ?? {}),
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
            buttonBackgroundColor: patch.backgroundColor,
          }
        : {}),

      ...(patch.backgroundOpacity !== undefined
        ? {
            fieldBackgroundOpacity: patch.backgroundOpacity,
            buttonBackgroundOpacity: patch.backgroundOpacity,
          }
        : {}),

      ...(patch.borderColor !== undefined
        ? {
            fieldBorderColor: patch.borderColor,
            buttonBorderColor: patch.borderColor,
          }
        : {}),

      ...(patch.borderWidth !== undefined
        ? {
            fieldBorderWidth: Number(patch.borderWidth) || 0,
            buttonBorderWidth: Number(patch.borderWidth) || 0,
          }
        : {}),

      ...(patch.borderRadius !== undefined
        ? {
            fieldBorderRadius: Number(patch.borderRadius) || 0,
            buttonBorderRadius: Number(patch.borderRadius) || 0,
          }
        : {}),
    },
  };
}