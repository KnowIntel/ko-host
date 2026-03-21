"use client";

import type { BuilderDraft, MicrositeBlock, TextStyle } from "@/lib/templates/builder";
import type { AppearancePatch, DraftWithPageExtras } from "../types";

type UseEditorActionsArgs = {
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
};

export function useEditorActions({ draft, setDraft }: UseEditorActionsArgs) {
  function updateDraft(updater: React.SetStateAction<BuilderDraft>) {
    setDraft(updater);
  }

  function updateSelectedBlock(
    _selectedBlock: MicrositeBlock | null,
    updater: (block: MicrositeBlock) => MicrositeBlock,
  ) {
    if (!_selectedBlock) return;

    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === _selectedBlock.id ? updater(block) : block,
      ),
    }));
  }

  function setPageColor(value: string) {
    setDraft((prev) => ({
      ...(prev as DraftWithPageExtras),
      pageColor: value,
    }));
  }

  function setPageBackgroundImage(value: string) {
    setDraft((prev) => ({
      ...(prev as DraftWithPageExtras),
      pageBackgroundImage: value,
    }));
  }

  function setPageBackgroundImageFit(value: "clip" | "zoom" | "stretch") {
    setDraft((prev) => ({
      ...(prev as DraftWithPageExtras),
      pageBackgroundImageFit: value,
    }));
  }

  function applyStylePatch(_selection: any, _patch: Partial<TextStyle>) {
    // final integration step will move real behavior here
  }

  function applyAppearancePatch(_selection: any, _patch: AppearancePatch) {
    // final integration step will move real behavior here
  }

  return {
    draft,
    setDraft,
    updateDraft,
    updateSelectedBlock,
    setPageColor,
    setPageBackgroundImage,
    setPageBackgroundImageFit,
    applyStylePatch,
    applyAppearancePatch,
  };
}