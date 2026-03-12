export const PAGE_TITLE_BLOCK_ID = "__page_title__";
export const PAGE_SUBTITLE_BLOCK_ID = "__page_subtitle__";
export const PAGE_SUBTEXT_BLOCK_ID = "__page_subtext__";
export const PAGE_DESCRIPTION_BLOCK_ID = "__page_description__";

export type EditorSelection =
  | { type: "none" }
  | { type: "page:title" }
  | { type: "page:subtitle" }
  | { type: "page:subtext" }
  | { type: "page:description" }
  | { type: "page:countdownLabel" }
  | { type: "block"; blockId: string };

export function createEmptySelection(): EditorSelection {
  return { type: "none" };
}

export function selectTitle(): EditorSelection {
  return { type: "page:title" };
}

export function selectSubtitle(): EditorSelection {
  return { type: "page:subtitle" };
}

export function selectSubtext(): EditorSelection {
  return { type: "page:subtext" };
}

export function selectDescription(): EditorSelection {
  return { type: "page:description" };
}

export function selectCountdownLabel(): EditorSelection {
  return { type: "page:countdownLabel" };
}

export function selectBlock(blockId: string): EditorSelection {
  return { type: "block", blockId };
}

export function isPageSelection(selection: EditorSelection): boolean {
  return (
    selection.type === "page:title" ||
    selection.type === "page:subtitle" ||
    selection.type === "page:subtext" ||
    selection.type === "page:description" ||
    selection.type === "page:countdownLabel"
  );
}

export function isBlockSelection(
  selection: EditorSelection,
): selection is { type: "block"; blockId: string } {
  return selection.type === "block";
}

export function selectionFromCanvasBlockId(blockId: string): EditorSelection {
  if (blockId === PAGE_TITLE_BLOCK_ID) return { type: "page:title" };
  if (blockId === PAGE_SUBTITLE_BLOCK_ID) return { type: "page:subtitle" };
  if (blockId === PAGE_SUBTEXT_BLOCK_ID) return { type: "page:subtext" };
  if (blockId === PAGE_DESCRIPTION_BLOCK_ID) return { type: "page:description" };
  return { type: "block", blockId };
}

export function isCanvasBlockSelected(
  selection: EditorSelection,
  blockId: string,
): boolean {
  if (blockId === PAGE_TITLE_BLOCK_ID) return selection.type === "page:title";
  if (blockId === PAGE_SUBTITLE_BLOCK_ID) return selection.type === "page:subtitle";
  if (blockId === PAGE_SUBTEXT_BLOCK_ID) return selection.type === "page:subtext";
  if (blockId === PAGE_DESCRIPTION_BLOCK_ID) return selection.type === "page:description";

  return selection.type === "block" && selection.blockId === blockId;
}