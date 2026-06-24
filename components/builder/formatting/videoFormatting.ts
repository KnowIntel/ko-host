import type { MicrositeBlock } from "@/lib/templates/builder";

type VideoBlock = Extract<MicrositeBlock, { type: "video" }>;

export type VideoTextTarget = "title" | "caption";

export function isVideoBlock(block: MicrositeBlock): block is VideoBlock {
  return block.type === "video";
}

export function getVideoTextStyle(
  block: MicrositeBlock | null | undefined,
  target: VideoTextTarget,
) {
  if (!block || block.type !== "video") return {};

  return target === "title"
    ? ((block.data as any).titleStyle ?? {})
    : ((block.data as any).captionStyle ?? {});
}

export function applyVideoTextStylePatch(
  block: MicrositeBlock,
  target: VideoTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isVideoBlock(block)) return block;

  const styleKey = target === "title" ? "titleStyle" : "captionStyle";

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

export function applyVideoPatch(
  block: MicrositeBlock,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isVideoBlock(block)) return block;

  return {
    ...block,
    data: {
      ...block.data,
      ...patch,
    } as any,
  };
}