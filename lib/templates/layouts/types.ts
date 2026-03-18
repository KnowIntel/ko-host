// lib\templates\layouts\types.ts

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
  | "image"
  | "gallery"
  | "shape"
  | "cta"
  | "poll"
  | "rsvp"
  | "countdown"
  | "faq"
  | "thread"
  | "links"
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
    text?:
    | string
    | {
        value?: string;
        fontFamily?: string;
        fontSize?: number;
        fontWeight?: number;
        fontStyle?: string;
        textAlign?: string;
        lineHeight?: number;
        letterSpacing?: number;
        color?: string;
        backgroundColor?: string;
        underline?: boolean;
      };
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

/* -------------------------------------------------------------------------- */
/* COMPATIBILITY TYPES */
/* -------------------------------------------------------------------------- */

export interface DesignBlockMetadata {
  id?: string;
  type?: string;
  label?: string;
  visible?: boolean;
  required?: boolean;
  locked?: boolean;
    text?:
    | string
    | {
        value?: string;
        fontFamily?: string;
        fontSize?: number;
        fontWeight?: number;
        fontStyle?: string;
        textAlign?: string;
        lineHeight?: number;
        letterSpacing?: number;
        color?: string;
        backgroundColor?: string;
        underline?: boolean;
      };

  /* legacy flat coordinates */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  zIndex?: number;

  /* legacy visual fields */
  rotation?: number;
  opacity?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;

  placement?: BlockPlacement;
  grid?: {
    colStart?: number;
    rowStart?: number;
    colSpan?: number;
    rowSpan?: number;
    zIndex?: number;
  };

  style?: TextStyle | Record<string, any>;
  frame?: BlockFrame;
  appearance?: BlockFrame | Record<string, any>;
  data?: Record<string, any>;
  config?: Record<string, any>;
}

export type DesignLayoutMetadata = DesignLayoutDefinition;