export type CircularHubTextTarget =
  | "heading"
  | "subtitle"
  | "centerTitle"
  | "centerSubtitle"
  | "nodeTitle"
  | "nodeSubtitle"
  | "nodeDescription"
  | "nodeBadge";

export type CircularHubStyleTarget =
  | "hub"
  | "node"
  | "icon"
  | "connector"
  | "block";

type StylePatch = Record<string, any>;

type CircularHubBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getTextStyleKey(
  target: CircularHubTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "centerTitle":
      return "centerTitleStyle";

    case "centerSubtitle":
      return "centerSubtitleStyle";

    case "nodeTitle":
      return "nodeTitleStyle";

    case "nodeSubtitle":
      return "nodeSubtitleStyle";

    case "nodeDescription":
      return "nodeDescriptionStyle";

    case "nodeBadge":
      return "nodeBadgeStyle";
  }
}

function getStyleKey(
  target: Exclude<
    CircularHubStyleTarget,
    "block"
  >,
) {
  switch (target) {
    case "hub":
      return "hubAppearanceStyle";

    case "node":
      return "nodeAppearanceStyle";

    case "icon":
      return "iconAppearanceStyle";

    case "connector":
      return "connectorAppearanceStyle";
  }
}

export function getCircularHubTextStyle(
  block:
    | CircularHubBlockShape
    | null
    | undefined,
  target: CircularHubTextTarget,
) {
  if (
    !block ||
    block.type !== "circular_hub"
  ) {
    return {};
  }

  const styleKey = getTextStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyCircularHubTextStylePatch<
  T extends CircularHubBlockShape,
>(
  block: T,
  target: CircularHubTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "circular_hub") {
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

export function applyCircularHubStylePatch<
  T extends CircularHubBlockShape,
>(
  block: T,
  target: CircularHubStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "circular_hub") {
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