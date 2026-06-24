import type { MicrositeBlock } from "@/lib/templates/builder";

type ImageBlock = Extract<MicrositeBlock, { type: "image" }>;

export type ImageCaptionStylePatch = Record<string, any>;
export type ImagePatch = Record<string, any>;
export type ImageFadePatch = Record<string, any>;
export type ImageShadowPatch = Record<string, any>;

export function isImageBlock(block: any): block is ImageBlock {
  return block?.type === "image";
}

export function getImageCaptionStyle(block: any) {
  return ((block?.data as any)?.captionStyle ?? {}) as Record<string, any>;
}

export function applyImageCaptionStylePatch(
  block: MicrositeBlock,
  patch: ImageCaptionStylePatch,
): MicrositeBlock {
  if (!isImageBlock(block)) return block;

  return {
    ...block,
    data: {
      ...block.data,
      captionStyle: {
        ...getImageCaptionStyle(block),
        ...patch,
      },
    } as any,
  };
}

export function applyImagePatch(
  block: MicrositeBlock,
  patch: ImagePatch,
): MicrositeBlock {
  if (!isImageBlock(block)) return block;

  return {
    ...block,
    data: {
      ...block.data,
      image: {
        ...((block.data as any).image ?? {}),
        ...patch,
      },
    } as any,
  };
}

export function applyImageFadePatch(
  block: MicrositeBlock,
  patch: ImageFadePatch,
): MicrositeBlock {
  if (!isImageBlock(block)) return block;

  return {
    ...block,
    data: {
      ...block.data,
      image: {
        ...((block.data as any).image ?? {}),
        fade: {
          ...((block.data as any).image?.fade ?? {}),
          ...patch,
        },
      },
    } as any,
  };
}

export function applyImageShadowPatch(
  block: MicrositeBlock,
  patch: ImageShadowPatch,
): MicrositeBlock {
  if (!isImageBlock(block)) return block;

  return {
    ...block,
    data: {
      ...block.data,
      imageShadow: {
        ...((block.data as any).imageShadow ?? {}),
        ...patch,
      },
    } as any,
  };
}

export function applyImageCaptionPatch(
  block: MicrositeBlock,
  patch: {
    addCaption?: boolean;
    caption?: string;
  },
): MicrositeBlock {
  if (!isImageBlock(block)) return block;

  return {
    ...block,
    data: {
      ...block.data,
      ...patch,
    } as any,
  };
}

export function isImageCaptionFormattingTarget(
  selectedBlock: any,
  inspectorFocusTarget: any,
) {
  return (
    selectedBlock?.type === "image" &&
    inspectorFocusTarget?.type === "image-caption"
  );
}