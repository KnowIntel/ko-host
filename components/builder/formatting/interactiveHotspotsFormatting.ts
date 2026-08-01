export type InteractiveHotspotsTextTarget =
  | "heading"
  | "subtitle"
  | "hotspotTitle"
  | "hotspotSubtitle"
  | "hotspotDescription"
  | "hotspotBadge"
  | "markerLabel"
  | "buttonLabel";

export type InteractiveHotspotsStyleTarget =
  | "canvas"
  | "marker"
  | "panel"
  | "hotspotImage"
  | "connector"
  | "button"
  | "block";

type StylePatch = Record<string, any>;

type InteractiveHotspotsBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getTextStyleKey(
  target: InteractiveHotspotsTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "hotspotTitle":
      return "hotspotTitleStyle";

    case "hotspotSubtitle":
      return "hotspotSubtitleStyle";

    case "hotspotDescription":
      return "hotspotDescriptionStyle";

    case "hotspotBadge":
      return "hotspotBadgeStyle";

    case "markerLabel":
      return "markerLabelStyle";

    case "buttonLabel":
      return "buttonLabelStyle";
  }
}

function getStyleKey(
  target: Exclude<
    InteractiveHotspotsStyleTarget,
    "block"
  >,
) {
  switch (target) {
    case "canvas":
      return "canvasAppearanceStyle";

    case "marker":
      return "markerAppearanceStyle";

    case "panel":
      return "panelAppearanceStyle";

    case "hotspotImage":
      return "hotspotImageAppearanceStyle";

    case "connector":
      return "connectorAppearanceStyle";

    case "button":
      return "buttonAppearanceStyle";
  }
}

export function getInteractiveHotspotsTextStyle(
  block:
    | InteractiveHotspotsBlockShape
    | null
    | undefined,
  target: InteractiveHotspotsTextTarget,
) {
  if (
    !block ||
    block.type !== "interactive_hotspots"
  ) {
    return {};
  }

  const styleKey =
    getTextStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyInteractiveHotspotsTextStylePatch<
  T extends InteractiveHotspotsBlockShape,
>(
  block: T,
  target: InteractiveHotspotsTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "interactive_hotspots") {
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

export function applyInteractiveHotspotsStylePatch<
  T extends InteractiveHotspotsBlockShape,
>(
  block: T,
  target: InteractiveHotspotsStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "interactive_hotspots") {
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