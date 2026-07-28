export type StatisticCardsTextTarget =
  | "heading"
  | "subtitle"
  | "label"
  | "value"
  | "prefix"
  | "suffix"
  | "description";

export type StatisticCardsStyleTarget =
  | "card"
  | "icon"
  | "accent"
  | "block";

type StylePatch = Record<string, any>;

type StatisticCardsBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getTextStyleKey(
  target: StatisticCardsTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "label":
      return "labelStyle";

    case "value":
      return "valueStyle";

    case "prefix":
      return "prefixStyle";

    case "suffix":
      return "suffixStyle";

    case "description":
      return "descriptionStyle";
  }
}

function getStyleKey(
  target: Exclude<
    StatisticCardsStyleTarget,
    "block"
  >,
) {
  switch (target) {
    case "card":
      return "cardAppearanceStyle";

    case "icon":
      return "iconAppearanceStyle";

    case "accent":
      return "accentAppearanceStyle";
  }
}

export function getStatisticCardsTextStyle(
  block:
    | StatisticCardsBlockShape
    | null
    | undefined,
  target: StatisticCardsTextTarget,
) {
  if (
    !block ||
    block.type !== "statistic_cards"
  ) {
    return {};
  }

  const styleKey =
    getTextStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyStatisticCardsTextStylePatch<
  T extends StatisticCardsBlockShape,
>(
  block: T,
  target: StatisticCardsTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "statistic_cards") {
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

export function applyStatisticCardsStylePatch<
  T extends StatisticCardsBlockShape,
>(
  block: T,
  target: StatisticCardsStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "statistic_cards") {
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