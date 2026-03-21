"use client";

import type { ReactNode } from "react";

import type { BuilderDraft } from "@/lib/templates/builder";
import type { DraftWithPageExtras, InspectorFocusTarget } from "./types";

import type { CanvasGridItem } from "@/components/templates/design-editors/shared/GridCanvas";

import {
  PAGE_DESCRIPTION_BLOCK_ID,
  PAGE_SUBTEXT_BLOCK_ID,
  PAGE_SUBTITLE_BLOCK_ID,
  PAGE_TITLE_BLOCK_ID,
} from "@/components/templates/design-editors/shared/EditorSelection";

import { getInlineTextStyle, getPageAppearanceKey, isPageBlockId } from "./utils";

type RenderCanvasPreviewArgs = {
  item: CanvasGridItem;
  draft: BuilderDraft;
  designKey: string;
  updateTextByCanvasId: (blockId: string, value: string) => void;
  uploadImageToSelectedBlock: (blockId: string) => Promise<void>;
  uploadGalleryImagesToBlock: (blockId: string) => Promise<void>;
  uploadDroppedGalleryFiles: (blockId: string, files: FileList | File[]) => Promise<void>;
  focusInspectorForBlock: (target: InspectorFocusTarget) => void;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
  BlockRenderer: React.ComponentType<{ block: any; designKey: string }>;
  ImageUploadDropzone: React.ComponentType<{
    label?: string;
    className?: string;
    onUploaded: (url: string) => void;
  }>;
};

export function renderCanvasPreview({
  item,
  draft,
  designKey,
  updateTextByCanvasId,
  uploadImageToSelectedBlock,
  uploadGalleryImagesToBlock,
  uploadDroppedGalleryFiles,
  focusInspectorForBlock,
  setDraft,
  BlockRenderer,
  ImageUploadDropzone,
}: RenderCanvasPreviewArgs): ReactNode {
  if (isPageBlockId(item.id)) {
    const textValue =
      item.id === PAGE_TITLE_BLOCK_ID
        ? draft.title || ""
        : item.id === PAGE_SUBTITLE_BLOCK_ID
          ? draft.subtitle || ""
          : item.id === PAGE_SUBTEXT_BLOCK_ID
            ? draft.subtext || ""
            : draft.description || "";

    const pageTextStyle =
      item.id === PAGE_TITLE_BLOCK_ID
        ? draft.titleStyle
        : item.id === PAGE_SUBTITLE_BLOCK_ID
          ? draft.subtitleStyle
          : item.id === PAGE_SUBTEXT_BLOCK_ID
            ? draft.subtextStyle
            : draft.descriptionStyle;

    const appearanceKey = getPageAppearanceKey(item.id);
    const pageBlockBg =
      appearanceKey &&
      (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]?.backgroundColor &&
      (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]?.backgroundColor !==
        "transparent"
        ? (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]?.backgroundColor
        : "transparent";

    return (
      <div
        className="h-full w-full p-3"
        style={{
          backgroundColor: pageBlockBg,
        }}
      >
        <textarea
          value={textValue}
          onChange={(e) => updateTextByCanvasId(item.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-full w-full resize-none bg-transparent outline-none"
          placeholder={item.label || item.type}
          style={getInlineTextStyle(pageTextStyle)}
        />
      </div>
    );
  }

  const block = draft.blocks.find((b) => b.id === item.id);

  if (!block) {
    return <div className="text-xs uppercase text-white/60">{item.type}</div>;
  }

  if (block.type === "label") {
    return (
      <div
        className="h-full w-full p-2"
        style={{
          backgroundColor:
            block.appearance?.backgroundColor &&
            block.appearance.backgroundColor !== "transparent"
              ? block.appearance.backgroundColor
              : "transparent",
          borderColor: block.appearance?.borderColor || undefined,
          borderWidth:
            typeof block.appearance?.borderWidth === "number"
              ? `${block.appearance.borderWidth}px`
              : undefined,
          borderStyle:
            typeof block.appearance?.borderWidth === "number" &&
            block.appearance.borderWidth > 0
              ? "solid"
              : undefined,
          borderRadius:
            typeof block.appearance?.borderRadius === "number"
              ? `${block.appearance.borderRadius}px`
              : undefined,
        }}
      >
        <textarea
          value={block.data.text || ""}
          onChange={(e) => updateTextByCanvasId(block.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-full w-full resize-none bg-transparent outline-none"
          placeholder="Label"
          style={getInlineTextStyle(block.data.style)}
        />
      </div>
    );
  }

  if (block.type === "text_fx") {
    return (
      <div className="h-full w-full">
        <BlockRenderer block={block} designKey={designKey} />
      </div>
    );
  }

  if (block.type === "image") {
    return block.data.image.url ? (
      <div
        className="h-full w-full"
        onDoubleClick={() => void uploadImageToSelectedBlock(block.id)}
        title="Double-click to replace image"
      >
        <BlockRenderer block={block} designKey={designKey} />
      </div>
    ) : (
      <ImageUploadDropzone
        label="Drag image here or click to browse"
        className="h-full w-full"
        onUploaded={(url) => {
          setDraft((prev) => ({
            ...prev,
            blocks: prev.blocks.map((item) =>
              item.id === block.id && item.type === "image"
                ? {
                    ...item,
                    data: {
                      image: {
                        ...item.data.image,
                        url,
                      },
                    },
                  }
                : item,
            ),
          }));
        }}
      />
    );
  }

  if (block.type === "gallery") {
    return (
      <div
        className="h-full w-full"
        onDoubleClick={() => void uploadGalleryImagesToBlock(block.id)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void uploadDroppedGalleryFiles(block.id, e.dataTransfer.files);
        }}
        title="Double-click or drag images here"
      >
        <BlockRenderer block={block} designKey={designKey} />
      </div>
    );
  }

  if (block.type === "poll") {
    return (
      <div className="h-full w-full">
        <div
          className="h-full w-full rounded-xl border border-neutral-200 bg-neutral-50 p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : undefined,
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              focusInspectorForBlock({
                type: "poll-question",
                blockId: block.id,
              });
            }}
            className="block w-full text-left text-sm text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.question || "Your question here"}
          </button>

          <div className="mt-3 space-y-2">
            {block.data.options.map((option: any) => (
              <button
                key={option.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  focusInspectorForBlock({
                    type: "poll-option",
                    blockId: block.id,
                    optionId: option.id,
                  });
                }}
                className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-800"
              >
                {option.text || "Option"}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "rsvp") {
    return (
      <div className="h-full w-full">
        <div
          className="h-full w-full cursor-text"
          onClick={(e) => {
            e.stopPropagation();
            focusInspectorForBlock({
              type: "rsvp-heading",
              blockId: block.id,
            });
          }}
        >
          <BlockRenderer block={block} designKey={designKey} />
        </div>
      </div>
    );
  }

  if (block.type === "countdown") {
    return (
      <div className="h-full w-full">
        <div className="h-full w-full rounded-xl border border-transparent p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              focusInspectorForBlock({
                type: "countdown-heading",
                blockId: block.id,
              });
            }}
            className="block w-full text-left"
          >
            <BlockRenderer block={block} designKey={designKey} />
          </button>
        </div>
      </div>
    );
  }

  if (block.type === "faq") {
    return (
      <div className="h-full w-full overflow-auto rounded-xl">
        <div className="space-y-2 p-2">
          {block.data.items.length ? (
            block.data.items.map((faqItem: any) => (
              <div
                key={faqItem.id}
                className="rounded-xl border border-neutral-200 bg-white/60 p-2"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "faq-question",
                      blockId: block.id,
                      itemId: faqItem.id,
                    });
                  }}
                  className="block w-full text-left text-sm font-medium text-neutral-900"
                >
                  {faqItem.question || "Question"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "faq-answer",
                      blockId: block.id,
                      itemId: faqItem.id,
                    });
                  }}
                  className="mt-2 block w-full text-left text-sm text-neutral-700"
                >
                  {faqItem.answer || "Answer"}
                </button>
              </div>
            ))
          ) : (
            <div
              className="h-full w-full cursor-text"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <BlockRenderer block={block} designKey={designKey} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "thread") {
    return (
      <div
        className="h-full w-full cursor-text"
        onClick={(e) => {
          e.stopPropagation();
          focusInspectorForBlock({
            type: "thread-subject",
            blockId: block.id,
          });
        }}
      >
        <BlockRenderer block={block} designKey={designKey} />
      </div>
    );
  }

  if (block.type === "links") {
    return (
      <div className="h-full w-full overflow-auto rounded-xl p-2">
        {block.data.heading ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              focusInspectorForBlock({
                type: "links-heading",
                blockId: block.id,
              });
            }}
            className="mb-2 block w-full text-left text-sm font-medium text-neutral-900"
          >
            {block.data.heading}
          </button>
        ) : null}

        <div className="space-y-2">
          {block.data.items.map((linkItem: any) => (
            <div
              key={linkItem.id}
              className="rounded-xl border border-neutral-200 bg-white/70 p-2"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  focusInspectorForBlock({
                    type: "links-item-label",
                    blockId: block.id,
                    itemId: linkItem.id,
                  });
                }}
                className="block w-full text-left text-sm font-medium text-neutral-900"
              >
                {linkItem.label || "Link"}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  focusInspectorForBlock({
                    type: "links-item-url",
                    blockId: block.id,
                    itemId: linkItem.id,
                  });
                }}
                className="mt-1 block w-full text-left text-xs text-neutral-600"
              >
                {linkItem.url || "#"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "image_carousel") {
    return (
      <div
        className="h-full w-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          focusInspectorForBlock({
            type: "carousel-heading",
            blockId: block.id,
          });
        }}
        title="Edit carousel in inspector"
      >
        <BlockRenderer block={block} designKey={designKey} />
      </div>
    );
  }

  if (block.type === "form_field") {
    return (
      <div className="h-full w-full">
        <BlockRenderer block={block} designKey={designKey} />
      </div>
    );
  }

  return <BlockRenderer block={block} designKey={designKey} />;
}