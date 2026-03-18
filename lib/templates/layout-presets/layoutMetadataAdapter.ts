import type {
  OverlayDesignMetadata,
  OverlayPageElement,
} from "@/lib/templates/templateDesignOverlayMetadata";
import type { BuilderBlockType } from "@/lib/templates/builder";
import { getTemplateLayoutRegistry } from "./layoutRegistry";

type PageBlockKey =
  | "title"
  | "subtitle"
  | "subtitle_secondary"
  | "tagline"
  | "tagline_secondary"
  | "description"
  | "description_secondary";

type LayoutTextBlock = {
  type: string;
  visible?: boolean;
  text?: string;
  style?: unknown;
  placement?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    zIndex?: number;
  };
};

type LayoutShape = {
  page?: {
    backgroundColor?: string;
  };
  pageTextBlocks?: LayoutTextBlock[];
  optionalBlocks?: Array<{
    type: string;
    placement?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      zIndex?: number;
    };
    config?: Record<string, any>;
  }>;
};

function toOverlayGrid(block: {
  placement?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    zIndex?: number;
  };
}) {
  if (!block?.placement) {
    return {
      colStart: 1,
      rowStart: 1,
      colSpan: 1,
      rowSpan: 1,
      zIndex: 1,
    };
  }

  const { x, y, width, height, zIndex } = block.placement;

  return {
    colStart: x ?? 1,
    rowStart: y ?? 1,
    colSpan: width ?? 1,
    rowSpan: height ?? 1,
    zIndex: zIndex ?? 1,
  };
}

function getPageBlock(layout: LayoutShape, key: PageBlockKey) {
  return layout.pageTextBlocks?.find((b) => b.type === key) ?? null;
}

function resolvePageBlock(
  layout: LayoutShape,
  key: PageBlockKey,
): OverlayPageElement {
  const block = getPageBlock(layout, key);

  if (!block || block.visible === false) {
    return {
      enabled: false,
      value: "",
      grid: {
        colStart: 1,
        rowStart: 1,
        colSpan: 1,
        rowSpan: 1,
        zIndex: 1,
      },
    };
  }

  return {
    enabled: true,
    value: block.text ?? "",
    style: block.style as OverlayPageElement["style"],
    grid: toOverlayGrid(block),
  };
}

function mergeTextValues(
  primary: OverlayPageElement,
  secondary: OverlayPageElement,
): OverlayPageElement {
  if (!primary.enabled && !secondary.enabled) {
    return primary;
  }

  const primaryValue = primary.value?.trim() ?? "";
  const secondaryValue = secondary.value?.trim() ?? "";
  const mergedValue = [primaryValue, secondaryValue].filter(Boolean).join("\n");

  return {
    enabled: primary.enabled || secondary.enabled,
    value: mergedValue,
    style: primary.style ?? secondary.style,
    grid: primary.grid ?? secondary.grid,
  };
}

function buildOverlaySeedBlocks(layout: LayoutShape) {
  return (
    layout.optionalBlocks
      ?.filter((block) => block.type === "image")
      .map((block, index) => ({
        key: `layout-seed-image-${index + 1}`,
        enabled: true,
        type: "image" as BuilderBlockType,
        label: `Image ${index + 1}`,
        grid: toOverlayGrid(block),
        imageUrl:
          block.config?.src ||
          block.config?.imageSrc ||
          block.config?.url ||
          block.config?.image ||
          "",
        fit:
          block.config?.fit ||
          block.config?.objectFit ||
          block.config?.mode ||
          "cover",
      })) ?? []
  );
}

export function resolveLayoutOverlayMetadata(
  templateKey: string,
  designKey: string,
): OverlayDesignMetadata | null {
  const registry = getTemplateLayoutRegistry(templateKey);

  if (!registry) return null;

  const layout = registry.layouts.find((l) => l.designKey === designKey);

  if (!layout) return null;

  const title = resolvePageBlock(layout, "title");
  const subtitle = resolvePageBlock(layout, "subtitle");
  const subtitleSecondary = resolvePageBlock(layout, "subtitle_secondary");
  const tagline = resolvePageBlock(layout, "tagline");
  const taglineSecondary = resolvePageBlock(layout, "tagline_secondary");
  const description = resolvePageBlock(layout, "description");
  const descriptionSecondary = resolvePageBlock(layout, "description_secondary");

  return {
    pageColor: layout.page?.backgroundColor ?? "#ffffff",
    page: {
      title,
      subtitle: mergeTextValues(subtitle, subtitleSecondary),
      tagline: mergeTextValues(tagline, taglineSecondary),
      description: mergeTextValues(description, descriptionSecondary),
    },
    blocks: buildOverlaySeedBlocks(layout),
  };
}