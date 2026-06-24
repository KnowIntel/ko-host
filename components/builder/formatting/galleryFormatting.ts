import type { MicrositeBlock } from "@/lib/templates/builder";

type GalleryBlock = Extract<MicrositeBlock, { type: "gallery" }>;

export type GalleryTextTarget = "title" | "description" | "metadata";

export function isGalleryBlock(block: MicrositeBlock): block is GalleryBlock {
  return block.type === "gallery";
}

export function getGalleryTextStyle(
  block: MicrositeBlock | null | undefined,
  target: GalleryTextTarget,
) {
  if (!block || block.type !== "gallery") return {};

  const styleKey =
    target === "description"
      ? "descriptionStyle"
      : target === "metadata"
        ? "metadataStyle"
        : "titleStyle";

  return ((block.data as any)[styleKey] ?? {}) as Record<string, any>;
}

export function applyGalleryTextStylePatch(
  block: MicrositeBlock,
  target: GalleryTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isGalleryBlock(block)) return block;

  const styleKey =
    target === "description"
      ? "descriptionStyle"
      : target === "metadata"
        ? "metadataStyle"
        : "titleStyle";

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