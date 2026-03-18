// lib/templates/layouts/baseLayouts.ts

import type {
  DesignBlockMetadata,
  DesignLayoutMetadata,
} from "@/lib/templates/layouts/types";

const DEFAULT_FONT_FAMILY = "Inter, sans-serif";

function createBaseTextBlock(
  input: Partial<DesignBlockMetadata> & {
    id: string;
    type: "title" | "subtitle" | "tagline" | "description";
    x: number;
    y: number;
    w: number;
    h: number;
    zIndex: number;
    visible: boolean;
    text: NonNullable<DesignBlockMetadata["text"]>;
  }
): DesignBlockMetadata {
  return {
    id: input.id,
    type: input.type,
    visible: input.visible,
    x: input.x,
    y: input.y,
    w: input.w,
    h: input.h,
    zIndex: input.zIndex,
    rotation: input.rotation ?? 0,
    opacity: input.opacity ?? 1,
    borderRadius: input.borderRadius ?? 0,
    text: input.text,
  };
}

function createSimpleBlocks(): DesignBlockMetadata[] {
  return [
    createBaseTextBlock({
      id: "title",
      type: "title",
      visible: true,
      x: 120,
      y: 120,
      w: 960,
      h: 110,
      zIndex: 1,
      text: {
        value: "Your Title Here",
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: 56,
        fontWeight: 700,
        fontStyle: "normal",
        textAlign: "center",
        lineHeight: 1.1,
        letterSpacing: 0,
        color: "#111827",
        backgroundColor: "transparent",
        underline: false,
      },
    }),
    createBaseTextBlock({
      id: "subtitle",
      type: "subtitle",
      visible: true,
      x: 170,
      y: 255,
      w: 860,
      h: 72,
      zIndex: 2,
      text: {
        value: "Add a supporting subtitle",
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: 28,
        fontWeight: 500,
        fontStyle: "normal",
        textAlign: "center",
        lineHeight: 1.25,
        letterSpacing: 0,
        color: "#374151",
        backgroundColor: "transparent",
        underline: false,
      },
    }),
    createBaseTextBlock({
      id: "tagline",
      type: "tagline",
      visible: true,
      x: 280,
      y: 360,
      w: 640,
      h: 56,
      zIndex: 3,
      text: {
        value: "A short line to reinforce the message",
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: 20,
        fontWeight: 600,
        fontStyle: "normal",
        textAlign: "center",
        lineHeight: 1.2,
        letterSpacing: 0.5,
        color: "#6B7280",
        backgroundColor: "transparent",
        underline: false,
      },
    }),
    createBaseTextBlock({
      id: "description",
      type: "description",
      visible: true,
      x: 200,
      y: 455,
      w: 800,
      h: 180,
      zIndex: 4,
      text: {
        value:
          "Use this section for your main supporting details, description, instructions, schedule, or summary.",
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: 18,
        fontWeight: 400,
        fontStyle: "normal",
        textAlign: "center",
        lineHeight: 1.6,
        letterSpacing: 0,
        color: "#4B5563",
        backgroundColor: "transparent",
        underline: false,
      },
    }),
    {
      id: "image",
      type: "image",
      visible: false,
      x: 250,
      y: 680,
      w: 700,
      h: 420,
      zIndex: 5,
      rotation: 0,
      opacity: 1,
      borderRadius: 20,
      image: {
        objectFit: "cover",
        borderRadius: 20,
      },
    },
    {
      id: "gallery",
      type: "gallery",
      visible: false,
      x: 120,
      y: 1140,
      w: 960,
      h: 420,
      zIndex: 6,
      rotation: 0,
      opacity: 1,
      borderRadius: 16,
      gallery: {
        columns: 3,
        gap: 16,
        imageAspectRatio: "square",
        borderRadius: 16,
      },
    },
  ];
}

function createBlankBlocks(): DesignBlockMetadata[] {
  return [
    {
      ...createSimpleBlocks()[0],
      visible: false,
    },
    {
      ...createSimpleBlocks()[1],
      visible: false,
    },
    {
      ...createSimpleBlocks()[2],
      visible: false,
    },
    {
      ...createSimpleBlocks()[3],
      visible: false,
    },
    {
      ...createSimpleBlocks()[4],
      visible: false,
    },
    {
      ...createSimpleBlocks()[5],
      visible: false,
    },
  ];
}

export function createSimpleLayout(): DesignLayoutMetadata {
  return {
    id: "simple",
    label: "Simple",
    description: "Clean starting layout with core text blocks enabled.",
    cardLabel: "Simple",
    canvas: {
      width: 1200,
      minHeight: 1600,
      backgroundColor: "#FFFFFF",
    },
    page: {
      maxWidth: 1200,
      contentAlign: "center",
      paddingTop: 48,
      paddingRight: 48,
      paddingBottom: 48,
      paddingLeft: 48,
    },
    blocks: createSimpleBlocks(),
  };
}

export function createBlankLayout(): DesignLayoutMetadata {
  return {
    id: "blank",
    label: "Blank",
    description: "Empty starting layout for full manual customization.",
    cardLabel: "Blank",
    canvas: {
      width: 1200,
      minHeight: 1600,
      backgroundColor: "#FFFFFF",
    },
    page: {
      maxWidth: 1200,
      contentAlign: "center",
      paddingTop: 48,
      paddingRight: 48,
      paddingBottom: 48,
      paddingLeft: 48,
    },
    blocks: createBlankBlocks(),
  };
}