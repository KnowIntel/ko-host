export type TemplateKey = string;
export type DesignLayoutKey = string;

export type TextAlign = "left" | "center" | "right";

export type PageTextBlockType =
  | "title"
  | "subtitle"
  | "subtitle_secondary"
  | "tagline"
  | "tagline_secondary"
  | "description"
  | "description_secondary";

export type OptionalBlockType =
  | "label"
  | "image"
  | "links"
  | "cta"
  | "countdown"
  | "padding"
  | "poll"
  | "rsvp"
  | "faq"
  | "gallery"
  | "thread"
  | "showcase"
  | "festiveBackground"
  | "shape"
  | "spacer";

export interface LayoutCardMetadata {
  label: string;
  description?: string;
  thumbnail?: string;
}

export interface PageDefaults {
  backgroundColor?: string;
  pageWidth?: number;
  pageHeight?: number;
}

export interface BlockPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  align?: TextAlign;
}

export interface BlockFrame {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export interface PageTextBlockConfig {
  type: PageTextBlockType;
  visible: boolean;
  placement: BlockPlacement;
  text?: string;
  style?: TextStyle;
  frame?: BlockFrame;
}

export interface OptionalBlockConfig {
  type: OptionalBlockType;
  placement: BlockPlacement;
  config?: Record<string, any>;
}

export interface DesignLayoutDefinition {
  designKey: DesignLayoutKey;
  card: LayoutCardMetadata;
  recommended?: boolean;
  page?: PageDefaults;
  pageTextBlocks?: PageTextBlockConfig[];
  optionalBlocks?: OptionalBlockConfig[];
}

export interface TemplateLayoutRegistry {
  templateKey: TemplateKey;
  layouts: DesignLayoutDefinition[];
}

export interface LayoutPreviewTextItem {
  text: string;
  style?: TextStyle;
}

export interface LayoutPreviewImageItem {
  src?: string;
  alt?: string;
}

export interface LayoutCardPreviewData {
  backgroundColor?: string;
  title?: LayoutPreviewTextItem;
  subtitle?: LayoutPreviewTextItem;
  subtitleSecondary?: LayoutPreviewTextItem;
  tagline?: LayoutPreviewTextItem;
  taglineSecondary?: LayoutPreviewTextItem;
  description?: LayoutPreviewTextItem;
  descriptionSecondary?: LayoutPreviewTextItem;
  image?: LayoutPreviewImageItem;
}