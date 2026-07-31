export type ComparisonTableTextTarget =
  | "heading"
  | "subtitle"
  | "columnHeading"
  | "columnSubheading"
  | "columnBadge"
  | "rowLabel"
  | "rowDescription"
  | "cellValue";

export type ComparisonTableStyleTarget =
  | "header"
  | "rowLabel"
  | "cell"
  | "featured"
  | "block";

type StylePatch = Record<string, any>;

type ComparisonTableBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getTextStyleKey(
  target: ComparisonTableTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "columnHeading":
      return "columnHeadingStyle";

    case "columnSubheading":
      return "columnSubheadingStyle";

    case "columnBadge":
      return "columnBadgeStyle";

    case "rowLabel":
      return "rowLabelStyle";

    case "rowDescription":
      return "rowDescriptionStyle";

    case "cellValue":
      return "cellValueStyle";
  }
}

function getStyleKey(
  target: Exclude<
    ComparisonTableStyleTarget,
    "block"
  >,
) {
  switch (target) {
    case "header":
      return "headerAppearanceStyle";

    case "rowLabel":
      return "rowLabelAppearanceStyle";

    case "cell":
      return "cellAppearanceStyle";

    case "featured":
      return "featuredAppearanceStyle";
  }
}

export function getComparisonTableTextStyle(
  block:
    | ComparisonTableBlockShape
    | null
    | undefined,
  target: ComparisonTableTextTarget,
) {
  if (
    !block ||
    block.type !== "comparison_table"
  ) {
    return {};
  }

  const styleKey =
    getTextStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyComparisonTableTextStylePatch<
  T extends ComparisonTableBlockShape,
>(
  block: T,
  target: ComparisonTableTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "comparison_table") {
    return block;
  }

  const styleKey =
    getTextStyleKey(target);

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

export function applyComparisonTableStylePatch<
  T extends ComparisonTableBlockShape,
>(
  block: T,
  target: ComparisonTableStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "comparison_table") {
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

  const styleKey =
    getStyleKey(target);

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