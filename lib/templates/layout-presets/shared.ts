import type {
  DesignLayoutDefinition,
  OptionalBlockConfig,
  PageTextBlockConfig,
} from "./types";

type Placement = {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
};

type TextBlockInput = {
  text?: string;
  placement: Placement;
  style?: PageTextBlockConfig["style"];
  visible?: boolean;
};

type ImageBlockInput = {
  placement: Placement;
  src?: string;
  alt?: string;
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
};

type LayoutBuilderInput = {
  designKey: string;
  label: string;
  description?: string;
  thumbnail?: string;
  recommended?: boolean;
  pageColor?: string;

  title?: TextBlockInput;
  subtitle?: TextBlockInput;
  subtitleSecondary?: TextBlockInput;
  tagline?: TextBlockInput;
  taglineSecondary?: TextBlockInput;
  descriptionBlock?: TextBlockInput;
  descriptionSecondary?: TextBlockInput;

  image?: ImageBlockInput;

  optionalBlocks?: OptionalBlockConfig[];
};

function buildTextBlock(
  type: PageTextBlockConfig["type"],
  input?: TextBlockInput,
): PageTextBlockConfig | null {
  if (!input) return null;

  return {
    type,
    visible: input.visible ?? true,
    text: input.text,
    placement: input.placement,
    style: input.style,
  };
}

function buildImageBlock(input?: ImageBlockInput): OptionalBlockConfig | null {
  if (!input) return null;

  return {
    type: "image",
    placement: input.placement,
    config: {
      src: input.src,
      alt: input.alt,
      fit: input.fit ?? "cover",
      borderRadius: input.borderRadius,
      borderWidth: input.borderWidth,
      borderColor: input.borderColor,
      backgroundColor: input.backgroundColor,
    },
  };
}

export function createLayoutPreset(
  config: LayoutBuilderInput,
): DesignLayoutDefinition {
  const pageTextBlocks: PageTextBlockConfig[] = [];
  const optionalBlocks: OptionalBlockConfig[] = [];

  const title = buildTextBlock("title", config.title);
  const subtitle = buildTextBlock("subtitle", config.subtitle);
  const subtitleSecondary = buildTextBlock(
    "subtitle_secondary",
    config.subtitleSecondary,
  );
  const tagline = buildTextBlock("tagline", config.tagline);
  const taglineSecondary = buildTextBlock(
    "tagline_secondary",
    config.taglineSecondary,
  );
  const description = buildTextBlock("description", config.descriptionBlock);
  const descriptionSecondary = buildTextBlock(
    "description_secondary",
    config.descriptionSecondary,
  );

  const image = buildImageBlock(config.image);

  if (title) pageTextBlocks.push(title);
  if (subtitle) pageTextBlocks.push(subtitle);
  if (subtitleSecondary) pageTextBlocks.push(subtitleSecondary);
  if (tagline) pageTextBlocks.push(tagline);
  if (taglineSecondary) pageTextBlocks.push(taglineSecondary);
  if (description) pageTextBlocks.push(description);
  if (descriptionSecondary) pageTextBlocks.push(descriptionSecondary);

  if (image) optionalBlocks.push(image);
  if (config.optionalBlocks?.length) optionalBlocks.push(...config.optionalBlocks);

  return {
    designKey: config.designKey,
    recommended: config.recommended,
    card: {
      label: config.label,
      description: config.description,
      thumbnail: config.thumbnail,
    },
    page: {
      backgroundColor: config.pageColor,
    },
    pageTextBlocks,
    optionalBlocks,
  };
}