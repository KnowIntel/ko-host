"use client";

import { useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { CarouselTextTarget } from "@/components/builder/formatting/carouselFormatting";

type ImageCarouselInspectorProps = {
  selectedBlock: any;
  setDraft: Dispatch<SetStateAction<any>>;
  updateSelectedBlock: any;

  carouselTextTarget: CarouselTextTarget;
  setCarouselTextTarget: (target: CarouselTextTarget) => void;

  uploadMultipleImagesToCarousel: (blockId: string) => Promise<any> | void;
  uploadImageToCarouselItem: (
    blockId: string,
    itemId: string,
  ) => Promise<any> | void;

  updateImageCarouselField: any;
  updateImageCarouselNumericField: any;
  updateImageCarouselItemField: any;
  updateImageCarouselToggle: any;

  removeImageCarouselItem: (
    blocks: any[],
    blockId: string,
    itemId: string,
  ) => any[];

  addImageCarouselItem: (blocks: any[], blockId: string) => any[];

  carouselHeadingInputRef: RefObject<HTMLInputElement | null>;
  carouselItemTitleInputRefs: RefObject<Record<string, HTMLInputElement | null>>;
  carouselItemSubtitleInputRefs: RefObject<
    Record<string, HTMLInputElement | null>
  >;
  carouselItemHrefInputRefs: RefObject<Record<string, HTMLInputElement | null>>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  toolSetButtonClass: (position?: any) => string;
};

export function ImageCarouselInspector({
  selectedBlock,
  setDraft,
  uploadMultipleImagesToCarousel,
  uploadImageToCarouselItem,
  updateImageCarouselField,
  updateImageCarouselNumericField,
  updateImageCarouselItemField,
  updateImageCarouselToggle,
  removeImageCarouselItem,
  addImageCarouselItem,
  carouselHeadingInputRef,
  carouselItemTitleInputRefs,
  carouselItemSubtitleInputRefs,
  carouselItemHrefInputRefs,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
  carouselTextTarget,
  setCarouselTextTarget,
}: ImageCarouselInspectorProps) {
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(
    selectedBlock.data.items?.[0]?.id ?? null,
  );

  return (
    <div id="inspector-image-carousel" className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Image Carousel</div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>Formatting</div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Text Target</div>
          <select
            value={carouselTextTarget}
            onChange={(e) =>
              setCarouselTextTarget(e.target.value as CarouselTextTarget)
            }
            className={inspectorInputClass()}
          >
            <option value="title">Title</option>
            <option value="subtitle">Subtitle</option>
            <option value="caption">Captions</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={() => void uploadMultipleImagesToCarousel(selectedBlock.id)}
      >
        Add Images
      </button>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Heading</div>
        <input
          ref={carouselHeadingInputRef}
          type="text"
          value={selectedBlock.data.heading ?? ""}
          onChange={(e) =>
            setDraft((prev: any) => ({
              ...prev,
              blocks: updateImageCarouselField(
                prev.blocks,
                selectedBlock.id,
                "heading",
                e.target.value,
              ),
            }))
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className={inspectorLabelClass()}>Visible Count</div>
          <input
            type="number"
            min={1}
            max={6}
            value={selectedBlock.data.visibleCount ?? 1}
            onChange={(e) =>
              setDraft((prev: any) => ({
                ...prev,
                blocks: updateImageCarouselNumericField(
                  prev.blocks,
                  selectedBlock.id,
                  "visibleCount",
                  Math.max(1, Math.min(6, Number(e.target.value) || 1)),
                ),
              }))
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Interval (ms)</div>
          <input
            type="number"
            min={1000}
            step={500}
            value={selectedBlock.data.intervalMs ?? 3000}
            onChange={(e) =>
              setDraft((prev: any) => ({
                ...prev,
                blocks: updateImageCarouselNumericField(
                  prev.blocks,
                  selectedBlock.id,
                  "intervalMs",
                  Math.max(1000, Number(e.target.value) || 3000),
                ),
              }))
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Scroll Direction</div>
        <select
          value={selectedBlock.data.scrollDirection ?? "left"}
          onChange={(e) =>
            setDraft((prev: any) => ({
              ...prev,
              blocks: updateImageCarouselField(
                prev.blocks,
                selectedBlock.id,
                "scrollDirection",
                e.target.value,
              ),
            }))
          }
          className={inspectorInputClass()}
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="up">Up</option>
          <option value="down">Down</option>
        </select>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {[
          ["autoRotate", "Auto rotate"],
          ["pauseOnHover", "Pause on hover"],
          ["showOverlay", "Show overlay"],
          ["showTitles", "Show titles"],
          ["openLinksInNewTab", "Open links in new tab"],
        ].map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800"
          >
            <input
              type="checkbox"
              checked={Boolean(selectedBlock.data[key])}
              onChange={(e) =>
                setDraft((prev: any) => ({
                  ...prev,
                  blocks: updateImageCarouselToggle(
                    prev.blocks,
                    selectedBlock.id,
                    key,
                    e.target.checked,
                  ),
                }))
              }
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-5">
        <div className={inspectorLabelClass()}>Carousel Items</div>

        <div className="mt-3 space-y-3">
          {selectedBlock.data.items.map((item: any, index: number) => {
            const expanded = expandedSlideId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left text-sm font-medium text-neutral-900"
                  onClick={() =>
                    setExpandedSlideId((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                >
                  <span>Slide {index + 1}</span>
                  <span className="text-xs text-neutral-500">
                    {expanded ? "Collapse" : "Expand"}
                  </span>
                </button>

                {expanded ? (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                        onClick={() =>
                          void uploadImageToCarouselItem(
                            selectedBlock.id,
                            item.id,
                          )
                        }
                      >
                        {item.imageUrl ? "Replace Image" : "Upload Image"}
                      </button>

                      <button
                        type="button"
                        className={toolSetButtonClass("remove")}
                        onClick={() =>
                          setDraft((prev: any) => ({
                            ...prev,
                            blocks: removeImageCarouselItem(
                              prev.blocks,
                              selectedBlock.id,
                              item.id,
                            ),
                          }))
                        }
                        title="Remove slide"
                      >
                        ×
                      </button>
                    </div>

                    {item.imageUrl ? (
                      <div className="mb-3 h-24 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white">
                        <img
                          src={item.imageUrl}
                          alt={item.title || `Slide ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}

                    <div>
                      <div className={inspectorLabelClass()}>Title</div>
                      <input
                        ref={(el) => {
                          carouselItemTitleInputRefs.current[item.id] = el;
                        }}
                        type="text"
                        value={item.title ?? ""}
                        onChange={(e) =>
                          setDraft((prev: any) => ({
                            ...prev,
                            blocks: updateImageCarouselItemField(
                              prev.blocks,
                              selectedBlock.id,
                              item.id,
                              "title",
                              e.target.value,
                            ),
                          }))
                        }
                        className={inspectorInputClass()}
                      />
                    </div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Subtitle</div>
                      <input
                        ref={(el) => {
                          carouselItemSubtitleInputRefs.current[item.id] = el;
                        }}
                        type="text"
                        value={item.subtitle ?? ""}
                        onChange={(e) =>
                          setDraft((prev: any) => ({
                            ...prev,
                            blocks: updateImageCarouselItemField(
                              prev.blocks,
                              selectedBlock.id,
                              item.id,
                              "subtitle",
                              e.target.value,
                            ),
                          }))
                        }
                        className={inspectorInputClass()}
                      />
                    </div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Caption</div>
                      <input
                        type="text"
                        value={item.caption ?? ""}
                        onChange={(e) =>
                          setDraft((prev: any) => ({
                            ...prev,
                            blocks: updateImageCarouselItemField(
                              prev.blocks,
                              selectedBlock.id,
                              item.id,
                              "caption",
                              e.target.value,
                            ),
                          }))
                        }
                        className={inspectorInputClass()}
                        placeholder={`Slide ${index + 1} caption...`}
                      />
                    </div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Link URL</div>
                      <input
                        ref={(el) => {
                          carouselItemHrefInputRefs.current[item.id] = el;
                        }}
                        type="text"
                        value={item.href ?? ""}
                        onChange={(e) =>
                          setDraft((prev: any) => ({
                            ...prev,
                            blocks: updateImageCarouselItemField(
                              prev.blocks,
                              selectedBlock.id,
                              item.id,
                              "href",
                              e.target.value,
                            ),
                          }))
                        }
                        className={inspectorInputClass()}
                        placeholder="/gallery/sights or https://..."
                      />
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(item.openInNewTab)}
                          onChange={(e) =>
                            setDraft((prev: any) => ({
                              ...prev,
                              blocks: updateImageCarouselItemField(
                                prev.blocks,
                                selectedBlock.id,
                                item.id,
                                "openInNewTab",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Open this slide in new tab
                      </label>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3">
                      {[
                        ["positionX", "Image Horizontal Position", 0, 100, "%"],
                        ["positionY", "Image Vertical Position", 0, 100, "%"],
                        ["zoom", "Image Zoom", 50, 300, "%"],
                        ["rotation", "Image Rotate", -180, 180, "°"],
                      ].map(([key, label, min, max, suffix]) => {
                        const rawValue =
                          key === "zoom"
                            ? Math.round((item.zoom ?? 1) * 100)
                            : (item[key as string] ?? (key === "rotation" ? 0 : 50));

                        return (
                          <div key={key}>
                            <div className={inspectorLabelClass()}>{label}</div>
                            <input
                              type="range"
                              min={min as number}
                              max={max as number}
                              value={rawValue}
                              onChange={(e) =>
                                setDraft((prev: any) => ({
                                  ...prev,
                                  blocks: updateImageCarouselItemField(
                                    prev.blocks,
                                    selectedBlock.id,
                                    item.id,
                                    key,
                                    key === "zoom"
                                      ? Number(e.target.value) / 100
                                      : Number(e.target.value),
                                  ),
                                }))
                              }
                              className="mt-2 w-full"
                            />
                            <div className="mt-1 text-xs text-neutral-500">
                              {rawValue}
                              {suffix}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          <button
            type="button"
            className={toolSetButtonClass("front")}
            onClick={() =>
              setDraft((prev: any) => ({
                ...prev,
                blocks: addImageCarouselItem(prev.blocks, selectedBlock.id),
              }))
            }
          >
            Add Slide
          </button>
        </div>
      </div>
    </div>
  );
}