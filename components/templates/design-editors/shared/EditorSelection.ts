export const PAGE_TITLE_BLOCK_ID = "__page_title__";

export type EditorSelection =
  | { type: "none" }
  | { type: "page:title" }
  | { type: "page:countdownLabel" }
  | { type: "block"; blockId: string };

export function createEmptySelection(): EditorSelection {
  return { type: "none" };
}

export function selectTitle(): EditorSelection {
  return { type: "page:title" };
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
    selection.type === "page:countdownLabel"
  );
}

export function isBlockSelection(
  selection: EditorSelection,
): selection is { type: "block"; blockId: string } {
  return selection.type === "block";
}

export function selectionFromCanvasBlockId(
  blockId: string,
): EditorSelection {
  switch (blockId) {
    case PAGE_TITLE_BLOCK_ID:
      return { type: "page:title" };

    default:
      return { type: "block", blockId };
  }
}

export function isCanvasBlockSelected(
  selection: EditorSelection,
  blockId: string,
): boolean {
  switch (blockId) {
    case PAGE_TITLE_BLOCK_ID:
      return selection.type === "page:title";

    default:
      return selection.type === "block" && selection.blockId === blockId;
  }
}