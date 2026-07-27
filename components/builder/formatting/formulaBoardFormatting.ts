export type FormulaBoardTextTarget =
  | "heading"
  | "subtitle"
  | "formulaTitle"
  | "formula"
  | "description"
  | "variables"
  | "example";

export type FormulaBoardStyleTarget =
  | "card"
  | "formulaPanel"
  | "variablesPanel"
  | "examplePanel"
  | "diagram"
  | "block";

type StylePatch = Record<string, any>;

type FormulaBoardBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getTextStyleKey(
  target: FormulaBoardTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "formulaTitle":
      return "formulaTitleStyle";

    case "formula":
      return "formulaStyle";

    case "description":
      return "descriptionStyle";

    case "variables":
      return "variablesStyle";

    case "example":
      return "exampleStyle";
  }
}

function getStyleKey(
  target: Exclude<FormulaBoardStyleTarget, "block">,
) {
  switch (target) {
    case "card":
      return "cardStyle";

    case "formulaPanel":
      return "formulaPanelStyle";

    case "variablesPanel":
      return "variablesPanelStyle";

    case "examplePanel":
      return "examplePanelStyle";

    case "diagram":
      return "diagramStyle";
  }
}

export function getFormulaBoardTextStyle(
  block: FormulaBoardBlockShape | null | undefined,
  target: FormulaBoardTextTarget,
) {
  if (!block || block.type !== "formula_board") {
    return {};
  }

  const styleKey = getTextStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyFormulaBoardTextStylePatch<
  T extends FormulaBoardBlockShape,
>(
  block: T,
  target: FormulaBoardTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "formula_board") {
    return block;
  }

  const styleKey = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...(block.data[styleKey] ?? {}),
        ...patch,
      },
    },
  } as T;
}

export function applyFormulaBoardStylePatch<
  T extends FormulaBoardBlockShape,
>(
  block: T,
  target: FormulaBoardStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "formula_board") {
    return block;
  }

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...(block.appearance ?? {}),
        ...patch,
      },
    } as T;
  }

  const styleKey = getStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...(block.data[styleKey] ?? {}),
        ...patch,
      },
    },
  } as T;
}