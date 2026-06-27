import type { MicrositeBlock } from "@/lib/templates/builder";

type EnrollmentBoardBlock = Extract<
  MicrositeBlock,
  { type: "enrollment_board" }
>;

export type EnrollmentBoardTextTarget =
  | "heading"
  | "subtitle"
  | "fieldLabel"
  | "placeholderText"
  | "fieldText"
  | "totalEnrolledLabel"
  | "submitButtonText"
  | "successMessage"
  | "alreadyEnrolledMessage"
  | "emptyListMessage";

export type EnrollmentBoardStyleTarget =
  | "field"
  | "enrollmentSection"
  | "submitButton"
  | "block";

function isEnrollmentBoardBlock(
  block: MicrositeBlock,
): block is EnrollmentBoardBlock {
  return block.type === "enrollment_board";
}

function getTextStyleKey(target: EnrollmentBoardTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "subtitle"
      ? "subtitleStyle"
      : target === "fieldLabel"
        ? "fieldLabelStyle"
        : target === "placeholderText"
          ? "placeholderStyle"
          : target === "fieldText"
            ? "fieldTextStyle"
            : target === "totalEnrolledLabel"
              ? "totalEnrolledLabelStyle"
              : target === "submitButtonText"
                ? "submitButtonTextStyle"
                : target === "successMessage"
                  ? "successMessageStyle"
                  : target === "alreadyEnrolledMessage"
                    ? "alreadyEnrolledMessageStyle"
                    : "emptyListMessageStyle";
}

export function getEnrollmentBoardTextStyle(
  block: MicrositeBlock | null | undefined,
  target: EnrollmentBoardTextTarget,
) {
  if (!block || block.type !== "enrollment_board") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyEnrollmentBoardTextStylePatch(
  block: MicrositeBlock,
  target: EnrollmentBoardTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isEnrollmentBoardBlock(block)) return block;

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

function getStyleKey(target: EnrollmentBoardStyleTarget) {
  return target === "field"
    ? "fieldStyle"
    : target === "enrollmentSection"
      ? "enrollmentSectionStyle"
      : target === "submitButton"
        ? "submitButtonStyle"
        : "blockStyle";
}

export function applyEnrollmentBoardStylePatch(
  block: MicrositeBlock,
  target: EnrollmentBoardStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isEnrollmentBoardBlock(block)) return block;

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
        ...patch,
      },
    },
  };
}