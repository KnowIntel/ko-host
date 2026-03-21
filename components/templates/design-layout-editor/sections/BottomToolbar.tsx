"use client";

import type { BuilderDraft } from "@/lib/templates/builder";
import type { BottomCategory, ToolDropPayload } from "../types";

import { CATEGORY_BUTTONS, CATEGORY_ORDER } from "../constants";
import {
  actionButtonClass,
  bottomCategoryClass,
  getToolGlyph,
  toolButtonClass,
} from "../utils";

type BottomToolbarProps = {
  bottomBarRef: React.RefObject<HTMLDivElement | null>;
  dockedScrollRef: React.RefObject<HTMLDivElement | null>;
  toolMenuRef: React.RefObject<HTMLDivElement | null>;
  scrollbarWidth: number;
  activeCategory: BottomCategory;
  openToolMenu: BottomCategory | null;
  publishHref?: string;
  publishLabel?: string;
  draft: BuilderDraft;

  onToggleToolMenu: (category: BottomCategory) => void;
  onAddBlock: (type: any) => void;
  onAddShape: (type: any) => void;
  onAddPageBlock: (type: any) => void;
  onSetOpenToolMenu: React.Dispatch<React.SetStateAction<BottomCategory | null>>;
  onOpenPreviewWindow: () => void;
  onSaveDraft: (draft: BuilderDraft) => void | Promise<void>;
  onPublishClick?: (draft: BuilderDraft) => void;
};

export default function BottomToolbar(props: BottomToolbarProps) {
  const {
    bottomBarRef,
    dockedScrollRef,
    toolMenuRef,
    scrollbarWidth,
    activeCategory,
    openToolMenu,
    publishHref,
    publishLabel = "Publish",
    draft,
    onToggleToolMenu,
    onAddBlock,
    onAddShape,
    onAddPageBlock,
    onSetOpenToolMenu,
    onOpenPreviewWindow,
    onSaveDraft,
    onPublishClick,
  } = props;

  return (
    <div
      ref={bottomBarRef}
      className="sticky bottom-0 z-50 border-t border-black/10 bg-[#e9e9e9] shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
    >
      <div className="border-b border-black/10 px-6 py-2">
        <div className="rounded-md border border-black/10 bg-white/80 px-2 py-1 shadow-sm backdrop-blur-sm">
          <div
            ref={dockedScrollRef}
            className="overflow-x-auto overflow-y-hidden"
            style={{ height: 18 }}
          >
            <div
              style={{
                width: scrollbarWidth,
                height: 1,
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-6 border-b border-black/10 px-6 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_ORDER.map((category) => (
            <div key={category} className="relative">
              <button
                type="button"
                onClick={() => onToggleToolMenu(category)}
                className={bottomCategoryClass(activeCategory === category)}
              >
                <span>{getToolGlyph(category)}</span>
                <span>{category}</span>
              </button>

              {openToolMenu === category ? (
                <div
                  ref={toolMenuRef}
                  className="absolute bottom-[calc(100%+10px)] left-0 z-[80] w-max max-w-[420px] rounded-2xl border border-neutral-300 bg-white p-3 shadow-2xl"
                >
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {category} Tools
                  </div>

                  <div className="flex max-w-[400px] flex-wrap gap-2">
                    {CATEGORY_BUTTONS[category].map((tool) => (
                      <button
                        key={`${category}-${tool.kind}-${tool.type}`}
                        type="button"
                        className={toolButtonClass()}
                        onClick={() => {
                          if (tool.kind === "block") onAddBlock(tool.type);
                          if (tool.kind === "shape") onAddShape(tool.type);
                          if (tool.kind === "page") onAddPageBlock(tool.type);
                          onSetOpenToolMenu(null);
                        }}
                        draggable
                        onDragStart={(e) => {
                          const payload: ToolDropPayload =
                            tool.kind === "block"
                              ? { kind: "block", type: tool.type as any }
                              : tool.kind === "shape"
                                ? { kind: "shape", type: tool.type as any }
                                : { kind: "page", type: tool.type as any };

                          e.dataTransfer.setData(
                            "application/kht-tool",
                            JSON.stringify(payload),
                          );
                        }}
                        title={tool.label}
                      >
                        {getToolGlyph(tool.label)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={actionButtonClass(false)}
            onClick={onOpenPreviewWindow}
          >
            Open Preview
          </button>

          <button
            type="button"
            className={actionButtonClass(true)}
            onClick={() => void onSaveDraft(draft)}
          >
            Save Draft
          </button>

          {publishHref ? (
            <button
              type="button"
              onClick={() => onPublishClick?.(draft)}
              className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-950 bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-black"
            >
              {publishLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}