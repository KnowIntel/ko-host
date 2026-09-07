export type LetterFillTextTarget =
  | "heading"
  | "instructions"
  | "cellText"
  | "checkButton"
  | "resetButton"
  | "successMessage"
  | "errorMessage";

export type LetterFillStyleTarget =
  | "cell"
  | "correctCell"
  | "incorrectCell"
  | "checkButton"
  | "resetButton"
  | "block";

type StylePatch =
  Record<string, any>;

type LetterFillBlockShape = {
  type: string;

  data:
    Record<string, any>;

  appearance?:
    Record<string, any>;
};

function getTextStyleKey(
  target:
    LetterFillTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "instructions":
      return "instructionsStyle";

    case "cellText":
      return "cellTextStyle";

    case "checkButton":
      return "checkButtonTextStyle";

    case "resetButton":
      return "resetButtonTextStyle";

    case "successMessage":
      return "successMessageStyle";

    case "errorMessage":
      return "errorMessageStyle";
  }
}

function getStyleKey(
  target:
    Exclude<
      LetterFillStyleTarget,
      "block"
    >,
) {
  switch (target) {
    case "cell":
      return "cellStyle";

    case "correctCell":
      return "correctCellStyle";

    case "incorrectCell":
      return "incorrectCellStyle";

    case "checkButton":
      return "checkButtonStyle";

    case "resetButton":
      return "resetButtonStyle";
  }
}

export function getLetterFillTextStyle(
  block:
    | LetterFillBlockShape
    | null
    | undefined,

  target:
    LetterFillTextTarget,
) {
  if (
    !block ||
    block.type !==
      "letter_fill"
  ) {
    return {};
  }

  const styleKey =
    getTextStyleKey(
      target,
    );

  return (
    block.data[
      styleKey
    ] ??
    block.data.style ??
    {}
  );
}

export function applyLetterFillTextStylePatch<
  T extends
    LetterFillBlockShape,
>(
  block: T,

  target:
    LetterFillTextTarget,

  patch:
    StylePatch,
): T {
  if (
    block.type !==
    "letter_fill"
  ) {
    return block;
  }

  const styleKey =
    getTextStyleKey(
      target,
    );

  return {
    ...block,

    data: {
      ...block.data,

      [styleKey]: {
        ...(
          block.data[
            styleKey
          ] ??
          block.data.style ??
          {}
        ),

        ...patch,
      },
    },
  } as T;
}

export function applyLetterFillStylePatch<
  T extends
    LetterFillBlockShape,
>(
  block: T,

  target:
    LetterFillStyleTarget,

  patch:
    StylePatch,
): T {
  if (
    block.type !==
    "letter_fill"
  ) {
    return block;
  }

  if (
    target ===
    "block"
  ) {
    return {
      ...block,

      appearance: {
        ...(
          block.appearance ??
          {}
        ),

        ...patch,
      },
    } as T;
  }

  const styleKey =
    getStyleKey(
      target,
    );

  return {
    ...block,

    data: {
      ...block.data,

      [styleKey]: {
        ...(
          block.data[
            styleKey
          ] ??
          {}
        ),

        ...patch,
      },
    },
  } as T;
}