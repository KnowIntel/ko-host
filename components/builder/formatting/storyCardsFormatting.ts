export type StoryCardsTextTarget =
  | "heading"
  | "subtitle"
  | "eyebrow"
  | "cardTitle"
  | "cardSubtitle"
  | "cardDescription"
  | "badge"
  | "date"
  | "author"
  | "buttonLabel";

export type StoryCardsStyleTarget =
  | "card"
  | "image"
  | "icon"
  | "accent"
  | "button"
  | "block";

type StylePatch = Record<string, any>;

type StoryCardsBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getTextStyleKey(
  target: StoryCardsTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "eyebrow":
      return "eyebrowStyle";

    case "cardTitle":
      return "cardTitleStyle";

    case "cardSubtitle":
      return "cardSubtitleStyle";

    case "cardDescription":
      return "cardDescriptionStyle";

    case "badge":
      return "badgeStyle";

    case "date":
      return "dateStyle";

    case "author":
      return "authorStyle";

    case "buttonLabel":
      return "buttonLabelStyle";
  }
}

function getStyleKey(
  target: Exclude<
    StoryCardsStyleTarget,
    "block"
  >,
) {
  switch (target) {
    case "card":
      return "cardAppearanceStyle";

    case "image":
      return "imageAppearanceStyle";

    case "icon":
      return "iconAppearanceStyle";

    case "accent":
      return "accentAppearanceStyle";

    case "button":
      return "buttonAppearanceStyle";
  }
}

export function getStoryCardsTextStyle(
  block:
    | StoryCardsBlockShape
    | null
    | undefined,
  target: StoryCardsTextTarget,
) {
  if (
    !block ||
    block.type !== "story_cards"
  ) {
    return {};
  }

  const styleKey =
    getTextStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyStoryCardsTextStylePatch<
  T extends StoryCardsBlockShape,
>(
  block: T,
  target: StoryCardsTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "story_cards") {
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

export function applyStoryCardsStylePatch<
  T extends StoryCardsBlockShape,
>(
  block: T,
  target: StoryCardsStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "story_cards") {
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