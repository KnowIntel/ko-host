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

  console.log("RSVP TEXT PATCH", { target, styleKey, patch });

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

  console.log("RSVP STYLE PATCH", { target, patch });

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
        ...patch,
      },
    },
  };
}