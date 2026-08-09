import type { BuilderDraft } from "@/lib/templates/builder";
import type { SelectedContext } from "./types";

import {
  PAGE_TITLE_BLOCK_ID,
  createEmptySelection,
} from "@/components/templates/design-editors/shared/EditorSelection";

export function getSelectedContext(
  selection: ReturnType<typeof createEmptySelection>,
  draft: BuilderDraft,
): SelectedContext {
  if (selection.type === "page:title") {
    return {
      kind: "pageText",
      blockId: PAGE_TITLE_BLOCK_ID,
      label: "Title",
    };
  }

  if (selection.type !== "block") {
    return { kind: "none", label: "Nothing selected" };
  }

  const blockId = selection.blockId;
  const block = draft.blocks.find((item) => item.id === blockId);

  if (!block) {
    return { kind: "none", label: "Nothing selected" };
  }

  if (block.type === "label") {
    return {
      kind: "label",
      blockId,
      label: "Label",
    };
  }

  if (block.type === "text_fx") {
    return {
      kind: "textFx",
      blockId,
      label: block.label || "TextFX",
    };
  }

  if (block.type === "image") {
    return {
      kind: "image",
      blockId,
      label: "Image",
    };
  }

  if (block.type === "image_carousel") {
    return {
      kind: "imageCarousel",
      blockId,
      label: block.label || "Image Carousel",
    };
  }

  if (block.type === "shape") {
    return {
      kind: "shape",
      blockId,
      label: block.label || "Shape",
    };
  }

  return {
    kind: "otherBlock",
    blockId,
    blockType: block.type,
    label: block.label || block.type,
  };
}