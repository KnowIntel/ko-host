"use client";

import { useMemo, useState } from "react";

import ToolboxPanel, {
  type PageBlockType,
} from "@/components/templates/design-editors/shared/ToolboxPanel";

import GridCanvas, {
  type CanvasGridItem,
} from "@/components/templates/design-editors/shared/GridCanvas";

import BlockRenderer from "@/components/preview/BlockRenderer";

import {
  PAGE_DESCRIPTION_BLOCK_ID,
  PAGE_SUBTEXT_BLOCK_ID,
  PAGE_SUBTITLE_BLOCK_ID,
  PAGE_TITLE_BLOCK_ID,
  createEmptySelection,
  isCanvasBlockSelected,
  selectionFromCanvasBlockId,
} from "@/components/templates/design-editors/shared/EditorSelection";

import type {
  BuilderBlockType,
  BuilderDraft,
  ShapeType,
  TextAlign,
  TextStyle,
} from "@/lib/templates/builder";

import {
  addBlockTypeToDraft,
  addShapeBlockToDraft,
  removeBlockFromDraft,
  applyStylePatchToSelection,
  applyAppearancePatchToSelection,
  getSelectionBlockAppearance,
  getSelectionTextStyle,
  readFileAsDataUrl,
} from "@/components/templates/design-editors/shared/editorUtils";

import { normalizeCanvasItems } from "@/components/builder/canvas/canvasItemTransforms";

import {
  buildPageCanvasItems,
  applyCanvasItemsToDraft,
} from "@/components/builder/canvas/pageCanvasBuilder";

import {
  getMetadata,
  getResolvedPageColor,
  getCanvasInnerBackgroundStyle,
} from "@/components/builder/metadata/metadataResolver";

import {
  getCanvasShellClass,
  panelCardClass,
  panelTitleClass,
  panelFieldClass,
  panelButtonClass,
} from "@/components/builder/ui/editorPanelStyles";

type Props = {
  templateKey: string;
  designKey: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
};

export default function DesignLayoutEditor({
  templateKey,
  designKey,
  draft,
  setDraft,
}: Props) {

  const [selection, setSelection] = useState(createEmptySelection());

  const metadata = useMemo(
    () => getMetadata(templateKey, designKey),
    [templateKey, designKey],
  );

  const pageCanvasItems = useMemo(
    () => buildPageCanvasItems(draft, metadata),
    [draft, metadata],
  );

  const canvasItems = useMemo(() => {

    const blockItems: CanvasGridItem[] = draft.blocks.map(block => ({
      id: block.id,
      type: block.type,
      label: block.label,
      grid: block.grid,
    }));

    return normalizeCanvasItems([
      ...pageCanvasItems,
      ...blockItems,
    ]);

  }, [pageCanvasItems, draft.blocks]);

  const selectedStyle = getSelectionTextStyle(draft, selection);
  const selectedAppearance = getSelectionBlockAppearance(draft, selection);

  function applyStylePatch(patch: Partial<TextStyle>) {
    setDraft(prev =>
      applyStylePatchToSelection(prev, selection, patch),
    );
  }

  function applyAppearancePatch(patch: any) {
    setDraft(prev =>
      applyAppearancePatchToSelection(prev, selection, patch),
    );
  }

  function addBlock(type: BuilderBlockType) {
    setDraft(prev => ({
      ...prev,
      blocks: addBlockTypeToDraft(prev.blocks, type),
    }));
  }

  function addShape(type: ShapeType) {
    setDraft(prev => ({
      ...prev,
      blocks: addShapeBlockToDraft(prev.blocks, type),
    }));
  }

  function addPageBlock(type: PageBlockType) {

    if (type === "title") return;
    if (type === "subtitle") return;
    if (type === "tagline") return;
    if (type === "description") return;
  }

  function removeCanvasBlock(blockId: string) {

    if (
      blockId === PAGE_TITLE_BLOCK_ID ||
      blockId === PAGE_SUBTITLE_BLOCK_ID ||
      blockId === PAGE_SUBTEXT_BLOCK_ID ||
      blockId === PAGE_DESCRIPTION_BLOCK_ID
    ) {
      return;
    }

    setDraft(prev => ({
      ...prev,
      blocks: removeBlockFromDraft(prev.blocks, blockId),
    }));
  }

  function handleMoveBlock(blockId: string, patch: any) {

    setDraft(prev =>
      applyCanvasItemsToDraft(prev, canvasItems),
    );
  }

  function handleResizeBlock(blockId: string, patch: any) {

    setDraft(prev =>
      applyCanvasItemsToDraft(prev, canvasItems),
    );
  }

  function handleCanvasSelect(nextSelection: any) {

    if (nextSelection.type === "block") {
      setSelection(selectionFromCanvasBlockId(nextSelection.blockId));
      return;
    }

    setSelection(nextSelection);
  }

  async function handleBackgroundImageUpload(file: File | null) {

    if (!file) return;

    const url = await readFileAsDataUrl(file);

    setDraft(prev => ({
      ...prev,
      pageBackground: url,
    }));
  }

  function renderCanvasPreview(item: CanvasGridItem) {

    const block = draft.blocks.find(b => b.id === item.id);

    if (!block) {
      return <div className="text-xs uppercase text-white/60">{item.type}</div>;
    }

    return <BlockRenderer block={block} designKey={designKey} />;
  }

  const resolvedPageColor = getResolvedPageColor(draft, designKey, metadata);

  return (
    <div className="space-y-6">

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_360px]">

        <ToolboxPanel
          selectedFontFamily={selectedStyle.fontFamily ?? "inherit"}
          selectedFontSize={selectedStyle.fontSize ?? 16}
          selectedBold={selectedStyle.bold ?? false}
          selectedItalic={selectedStyle.italic ?? false}
          selectedUnderline={selectedStyle.underline ?? false}
          selectedColor={selectedStyle.color ?? "#111827"}
          selectedBackgroundColor={selectedAppearance.backgroundColor ?? "transparent"}
          selectedBorderColor={selectedAppearance.borderColor ?? "#D1D5DB"}
          selectedBorderWidth={selectedAppearance.borderWidth ?? 0}
          selectedBorderRadius={selectedAppearance.borderRadius ?? 16}

          onFontFamilyChange={v => applyStylePatch({ fontFamily: v })}
          onFontSizeChange={v => applyStylePatch({ fontSize: v })}
          onBoldChange={v => applyStylePatch({ bold: v })}
          onItalicChange={v => applyStylePatch({ italic: v })}
          onUnderlineChange={v => applyStylePatch({ underline: v })}
          onAlignChange={(v: TextAlign) => applyStylePatch({ align: v })}
          onColorChange={v => applyStylePatch({ color: v })}

          onBackgroundColorChange={v => applyAppearancePatch({ backgroundColor: v })}
          onBorderColorChange={v => applyAppearancePatch({ borderColor: v })}
          onBorderWidthChange={v => applyAppearancePatch({ borderWidth: v })}
          onBorderRadiusChange={v => applyAppearancePatch({ borderRadius: v })}

          onAddBlock={addBlock}
          onAddShape={addShape}
          onAddPageBlock={addPageBlock}
        />

        <div className="min-w-0">

          <div className={getCanvasShellClass(designKey)}>

            <div className="flex min-h-[560px] flex-col px-6 py-8">

              <div
                className="w-full rounded-[28px]"
                style={getCanvasInnerBackgroundStyle(draft, designKey, metadata)}
              >

                <GridCanvas
                  blocks={canvasItems}
                  selection={selection as any}
                  onSelect={handleCanvasSelect}
                  onMoveBlock={handleMoveBlock}
                  onResizeBlock={handleResizeBlock}
                  onBringToFront={() => {}}
                  onRemoveBlock={removeCanvasBlock}
                  renderBlockPreview={renderCanvasPreview}
                  isItemSelected={(blockId, nextSelection) =>
                    isCanvasBlockSelected(nextSelection as any, blockId)
                  }
                />

              </div>

            </div>

          </div>

        </div>

        <div className="space-y-4">

          <div className={panelCardClass(designKey)}>

            <div className={panelTitleClass(designKey)}>
              Background Image
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                void handleBackgroundImageUpload(e.target.files?.[0] || null)
              }
              className="block w-full text-sm"
            />

          </div>

          <div className={panelCardClass(designKey)}>

            <div className={panelTitleClass(designKey)}>
              Page Color
            </div>

            <div className="mt-3 flex items-center gap-3">

              <input
                type="color"
                value={resolvedPageColor}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    pageColor: e.target.value,
                  }))
                }
                className="h-11 w-16"
              />

              <input
                type="text"
                value={resolvedPageColor}
                onChange={(e) =>
                  setDraft(prev => ({
                    ...prev,
                    pageColor: e.target.value,
                  }))
                }
                className={panelFieldClass(designKey)}
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}