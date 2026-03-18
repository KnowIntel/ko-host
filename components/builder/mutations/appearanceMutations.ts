// components\builder\mutations\appearanceMutations.ts
import type {
  BlockAppearance,
  BuilderDraft,
  MicrositeBlock,
  TextStyle,
} from "@/lib/templates/builder";

import {
  createDefaultBlockAppearance,
  createDefaultTextStyle,
  updateBlockAppearance as mergeBlockAppearance,
  updateTextStyle,
} from "@/lib/templates/builder";

import type { EditorSelection } from "@/components/templates/design-editors/shared/EditorSelection";

/* -------------------------------------------------------------------------- */
/* INTERNAL HELPERS */
/* -------------------------------------------------------------------------- */

function blockSupportsStyle(block: MicrositeBlock) {
  return (
    block.type === "label" ||
    block.type === "text_fx" ||
    block.type === "image_carousel" ||
    block.type === "cta" ||
    block.type === "links" ||
    block.type === "countdown" ||
    block.type === "poll" ||
    block.type === "rsvp" ||
    block.type === "faq" ||
    block.type === "thread"
  );
}

function blockSupportsAppearance(block: MicrositeBlock) {
  return block.type !== "padding";
}

/* -------------------------------------------------------------------------- */
/* STYLE */
/* -------------------------------------------------------------------------- */

export function updateBlockStyle(
  blocks: MicrositeBlock[],
  blockId: string,
  patch: Partial<TextStyle>,
) {
  return blocks.map((block) => {
    if (block.id !== blockId || !blockSupportsStyle(block)) {
      return block;
    }

    return {
      ...block,
      data: {
        ...block.data,
        style: updateTextStyle(block.data.style, patch),
      },
    } as MicrositeBlock;
  });
}

/* -------------------------------------------------------------------------- */
/* APPEARANCE */
/* -------------------------------------------------------------------------- */

export function updateBlockAppearance(
  blocks: MicrositeBlock[],
  blockId: string,
  patch: Partial<BlockAppearance>,
) {
  return blocks.map((block) => {
    if (block.id !== blockId || !blockSupportsAppearance(block)) {
      return block;
    }

    return {
      ...block,
      appearance: mergeBlockAppearance(block.appearance, patch),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* SELECTION HELPERS */
/* -------------------------------------------------------------------------- */

export function getSelectionBlockAppearance(
  draft: BuilderDraft,
  selection: EditorSelection,
): BlockAppearance {
  if (selection.type !== "block") {
    return createDefaultBlockAppearance();
  }

  const block = draft.blocks.find((b) => b.id === selection.blockId);

  return mergeBlockAppearance(block?.appearance, {});
}

export function applyAppearancePatchToSelection(
  draft: BuilderDraft,
  selection: EditorSelection,
  patch: Partial<BlockAppearance>,
): BuilderDraft {
  if (selection.type !== "block") {
    return draft;
  }

  return {
    ...draft,
    blocks: updateBlockAppearance(draft.blocks, selection.blockId, patch),
  };
}

/* -------------------------------------------------------------------------- */
/* TEXT STYLE SELECTION */
/* -------------------------------------------------------------------------- */

export function getSelectionTextStyle(
  draft: BuilderDraft,
  selection: EditorSelection,
): TextStyle {
  switch (selection.type) {
    case "page:title":
      return draft.titleStyle ?? createDefaultTextStyle();

    case "page:subtitle":
      return draft.subtitleStyle ?? createDefaultTextStyle();

    case "page:subtext":
      return draft.subtextStyle ?? createDefaultTextStyle();

    case "page:description":
      return draft.descriptionStyle ?? createDefaultTextStyle();

    case "page:countdownLabel":
      return draft.countdownLabelStyle ?? createDefaultTextStyle();

    case "block": {
      const block = draft.blocks.find((b) => b.id === selection.blockId);

      if (block && blockSupportsStyle(block)) {
        return block.data.style ?? createDefaultTextStyle();
      }

      return createDefaultTextStyle();
    }

    default:
      return createDefaultTextStyle();
  }
}

export function applyStylePatchToSelection(
  draft: BuilderDraft,
  selection: EditorSelection,
  patch: Partial<TextStyle>,
): BuilderDraft {
  switch (selection.type) {
    case "page:title":
      return {
        ...draft,
        titleStyle: updateTextStyle(draft.titleStyle, patch),
      };

    case "page:subtitle":
      return {
        ...draft,
        subtitleStyle: updateTextStyle(draft.subtitleStyle, patch),
      };

    case "page:subtext":
      return {
        ...draft,
        subtextStyle: updateTextStyle(draft.subtextStyle, patch),
      };

    case "page:description":
      return {
        ...draft,
        descriptionStyle: updateTextStyle(draft.descriptionStyle, patch),
      };

    case "page:countdownLabel":
      return {
        ...draft,
        countdownLabelStyle: updateTextStyle(
          draft.countdownLabelStyle,
          patch,
        ),
      };

    case "block":
      return {
        ...draft,
        blocks: updateBlockStyle(draft.blocks, selection.blockId, patch),
      };

    default:
      return draft;
  }
}