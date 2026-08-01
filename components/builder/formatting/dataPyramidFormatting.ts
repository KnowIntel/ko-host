export type DataPyramidTextTarget =
  | "heading"
  | "subtitle"
  | "levelNumber"
  | "levelTitle"
  | "levelValue"
  | "levelDescription"
  | "levelBadge";

export type DataPyramidStyleTarget =
  | "level"
  | "icon"
  | "connector"
  | "block";

type StylePatch = Record<string, any>;

type DataPyramidBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getTextStyleKey(
  target: DataPyramidTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "levelNumber":
      return "levelNumberStyle";

    case "levelTitle":
      return "levelTitleStyle";

    case "levelValue":
      return "levelValueStyle";

    case "levelDescription":
      return "levelDescriptionStyle";

    case "levelBadge":
      return "levelBadgeStyle";
  }
}

function getStyleKey(
  target: Exclude<
    DataPyramidStyleTarget,
    "block"
  >,
) {
  switch (target) {
    case "level":
      return "levelAppearanceStyle";

    case "icon":
      return "iconAppearanceStyle";

    case "connector":
      return "connectorAppearanceStyle";
  }
}

export function getDataPyramidTextStyle(
  block:
    | DataPyramidBlockShape
    | null
    | undefined,
  target: DataPyramidTextTarget,
) {
  if (
    !block ||
    block.type !== "data_pyramid"
  ) {
    return {};
  }

  const styleKey = getTextStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyDataPyramidTextStylePatch<
  T extends DataPyramidBlockShape,
>(
  block: T,
  target: DataPyramidTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "data_pyramid") {
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

export function applyDataPyramidStylePatch<
  T extends DataPyramidBlockShape,
>(
  block: T,
  target: DataPyramidStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "data_pyramid") {
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