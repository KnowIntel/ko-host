import type { MicrositeBlock } from "@/lib/templates/builder";

type CarouselBlock = Extract<MicrositeBlock, { type: "image_carousel" }>;

export type CarouselTextTarget =
  | "title"
  | "subtitle"
  | "caption"
  | "linkUrl";

export function isCarouselBlock(block: MicrositeBlock): block is CarouselBlock {
  return block.type === "image_carousel";
}

export function getCarouselTextStyle(
  block: MicrositeBlock | null | undefined,
  target: CarouselTextTarget,
) {
  if (!block || block.type !== "image_carousel") return {};

  const styleKey =
    target === "title"
      ? "titleStyle"
      : target === "subtitle"
        ? "subtitleStyle"
        : target === "linkUrl"
          ? "linkUrlStyle"
          : "captionStyle";

  return ((block.data as any)[styleKey] ?? {}) as Record<string, any>;
}

export function applyCarouselTextStylePatch(
  block: MicrositeBlock,
  target: CarouselTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isCarouselBlock(block)) return block;

  const styleKey =
    target === "title"
      ? "titleStyle"
      : target === "subtitle"
        ? "subtitleStyle"
        : target === "linkUrl"
          ? "linkUrlStyle"
          : "captionStyle";

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...((block.data as any)[styleKey] ?? {}),
        ...patch,
      },
    } as any,
  };
}

export function applyCarouselItemPatch(
  block: MicrositeBlock,
  itemIndex: number,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isCarouselBlock(block)) return block;

  const items = ((block.data as any).items ?? []) as any[];

  return {
    ...block,
    data: {
      ...block.data,
      items: items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    } as any,
  };
}

export function applyCarouselItemImagePatch(
  block: MicrositeBlock,
  itemIndex: number,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isCarouselBlock(block)) return block;

  const items = ((block.data as any).items ?? []) as any[];

  return {
    ...block,
    data: {
      ...block.data,
      items: items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              image: {
                ...(item.image ?? {}),
                ...patch,
              },
            }
          : item,
      ),
    } as any,
  };
}