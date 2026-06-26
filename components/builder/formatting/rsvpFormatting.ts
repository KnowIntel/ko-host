import type { MicrositeBlock } from "@/lib/templates/builder";

type RsvpBlock = Extract<MicrositeBlock, { type: "rsvp" }>;

export type RsvpTextTarget =
  | "heading"
  | "helperText"
  | "badgeText"
  | "sectionLabel"
  | "placeholderText"
  | "optionText"
  | "submitButton"
  | "confirmationTitle"
  | "confirmationMessage";

export type RsvpStyleTarget =
  | "field"
  | "section"
  | "buttonDefault"
  | "buttonSelection"
  | "submitButton"
  | "block";

function isRsvpBlock(block: MicrositeBlock): block is RsvpBlock {
  return block.type === "rsvp";
}

function getTextStyleKey(target: RsvpTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "helperText"
      ? "helperTextStyle"
      : target === "badgeText"
        ? "badgeTextStyle"
        : target === "sectionLabel"
          ? "sectionLabelStyle"
          : target === "placeholderText"
            ? "placeholderStyle"
            : target === "optionText"
              ? "optionTextStyle"
              : target === "submitButton"
                ? "submitButtonTextStyle"
                : target === "confirmationTitle"
                  ? "confirmationTitleStyle"
                  : "confirmationMessageStyle";
}

export function getRsvpTextStyle(
  block: MicrositeBlock | null | undefined,
  target: RsvpTextTarget,
) {
  if (!block || block.type !== "rsvp") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyRsvpTextStylePatch(
  block: MicrositeBlock,
  target: RsvpTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isRsvpBlock(block)) return block;

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

      ...(target === "placeholderText" && patch.color !== undefined
        ? { placeholderColor: patch.color }
        : {}),
    },
  };
}

function getStyleKey(target: RsvpStyleTarget) {
  return target === "field"
    ? "fieldStyle"
    : target === "section"
      ? "sectionStyle"
      : target === "buttonDefault"
        ? "buttonDefaultStyle"
        : target === "buttonSelection"
          ? "buttonSelectionStyle"
          : target === "submitButton"
            ? "submitButtonStyle"
            : "blockStyle";
}

export function applyRsvpStylePatch(
  block: MicrositeBlock,
  target: RsvpStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isRsvpBlock(block)) return block;

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

  const styleKey = getStyleKey(target);

  return {
    ...block,
    data: {
      ...data,
      [styleKey]: {
        ...(data[styleKey] ?? {}),
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

      ...(target === "field" && patch.backgroundColor !== undefined
        ? { fieldBackgroundColor: patch.backgroundColor }
        : {}),

      ...(target === "section" && patch.backgroundColor !== undefined
        ? { sectionBackgroundColor: patch.backgroundColor }
        : {}),

      ...(target === "buttonDefault" && patch.backgroundColor !== undefined
        ? { buttonBackgroundColor: patch.backgroundColor }
        : {}),

      ...(target === "buttonSelection" && patch.backgroundColor !== undefined
        ? { selectedButtonBackgroundColor: patch.backgroundColor }
        : {}),

      ...(target === "submitButton" && patch.backgroundColor !== undefined
        ? { submitButtonBackgroundColor: patch.backgroundColor }
        : {}),
    },
  };
}