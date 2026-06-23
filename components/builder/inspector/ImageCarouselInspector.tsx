"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";

type ImageCarouselInspectorProps = {
  selectedBlock: any;
  setDraft: Dispatch<SetStateAction<any>>;

  updateSelectedBlock: any;

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
  updateSelectedBlock,
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
}: ImageCarouselInspectorProps) {
  return (
    <div id="inspector-image-carousel" className={inspectorCardClass()}>
      {/* Image Carousel */}
                    <div className={inspectorLabelClass()}>Image Carousel</div>

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={Boolean((selectedBlock.data as any).addCaption)}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "image_carousel"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                addCaption: e.target.checked,
              } as any,
            },
      )
    }
  />
  Add captions
</label>

                    <button
                      type="button"
                      className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() =>
                        void uploadMultipleImagesToCarousel(selectedBlock.id)
                      }
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
                        <div className={inspectorLabelClass()}>
                          Visible Count
                        </div>
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
                                Math.max(
                                  1,
                                  Math.min(6, Number(e.target.value) || 1),
                                ),
                              ),
                            }))
                          }
                          className={inspectorInputClass()}
                        />
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>
                          Interval (ms)
                        </div>
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

                    <div className="mt-4 space-y-4">
                      {selectedBlock.data.items.map((item: any, index: number) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                        >
                          <div className="mb-3 text-sm font-medium text-neutral-900">
                            Slide {index + 1}
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <div className={inspectorLabelClass()}>
                                Image Horizontal Position
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={item.positionX ?? 50}
                                onChange={(e) =>
                                  setDraft((prev: any) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "positionX",
                                      Number(e.target.value),
                                    ),
                                  }))
                                }
                                className="mt-2 w-full"
                              />
                              <div className="mt-1 text-xs text-neutral-500">
                                {item.positionX ?? 50}%
                              </div>
                            </div>

                            <div>
                              <div className={inspectorLabelClass()}>
                                Image Vertical Position
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={item.positionY ?? 50}
                                onChange={(e) =>
                                  setDraft((prev: any) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "positionY",
                                      Number(e.target.value),
                                    ),
                                  }))
                                }
                                className="mt-2 w-full"
                              />
                              <div className="mt-1 text-xs text-neutral-500">
                                {item.positionY ?? 50}%
                              </div>
                            </div>

                            <div>
                              <div className={inspectorLabelClass()}>
                                Image Zoom
                              </div>
                              <input
                                type="range"
                                min={50}
                                max={300}
                                value={Math.round((item.zoom ?? 1) * 100)}
                                onChange={(e) =>
                                  setDraft((prev: any) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "zoom",
                                      Number(e.target.value) / 100,
                                    ),
                                  }))
                                }
                                className="mt-2 w-full"
                              />
                              <div className="mt-1 text-xs text-neutral-500">
                                {Math.round((item.zoom ?? 1) * 100)}%
                              </div>
                            </div>

                            <div>
                              <div className={inspectorLabelClass()}>
                                Image Rotate
                              </div>
                              <input
                                type="range"
                                min={-180}
                                max={180}
                                value={item.rotation ?? 0}
                                onChange={(e) =>
                                  setDraft((prev: any) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "rotation",
                                      Number(e.target.value),
                                    ),
                                  }))
                                }
                                className="mt-2 w-full"
                              />
                              <div className="mt-1 text-xs text-neutral-500">
                                {item.rotation ?? 0}°
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>
                        Scroll Direction
                      </div>
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
                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.autoRotate)}
                          onChange={(e) =>
                            setDraft((prev: any) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "autoRotate",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Auto rotate
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.pauseOnHover)}
                          onChange={(e) =>
                            setDraft((prev: any) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "pauseOnHover",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Pause on hover
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.showOverlay)}
                          onChange={(e) =>
                            setDraft((prev: any) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "showOverlay",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Show overlay
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.showTitles)}
                          onChange={(e) =>
                            setDraft((prev: any) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "showTitles",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Show titles
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.openLinksInNewTab)}
                          onChange={(e) =>
                            setDraft((prev: any) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "openLinksInNewTab",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Open links in new tab
                      </label>
                    </div>

                    <div className="mt-5">
                      <div className={inspectorLabelClass()}>
                        Carousel Items
                      </div>

                      <div className="mt-3 space-y-3">
                        {selectedBlock.data.items.map((item: any, index: number) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="text-sm font-medium text-neutral-900">
                                Slide {index + 1}
                              </div>

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

                            <button
                              type="button"
                              className="mb-3 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                              onClick={() =>
                                void uploadImageToCarouselItem(
                                  selectedBlock.id,
                                  item.id,
                                )
                              }
                            >
                              {item.imageUrl ? "Replace Image" : "Upload Image"}
                            </button>

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
                              <div className={inspectorLabelClass()}>
                                Subtitle
                              </div>
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

                            {(selectedBlock.data as any).addCaption ? (
                              <div className="mt-4">
                                <div className={inspectorLabelClass()}>Caption</div>
                                <input
                                  type="text"
                                  value={(item as any).caption ?? ""}
                                  onChange={(e) =>
                                    setDraft((prev: any) => ({
                                      ...prev,
                                      blocks: updateImageCarouselItemField(
                                        prev.blocks,
                                        selectedBlock.id,
                                        item.id,
                                        "caption" as any,
                                        e.target.value,
                                      ),
                                    }))
                                  }
                                  className={inspectorInputClass()}
                                  placeholder={`Slide ${index + 1} caption...`}
                                />
                              </div>
                            ) : null}

                            <div className="mt-4">
                              <div className={inspectorLabelClass()}>
                                Link URL
                              </div>
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
                                      blocks: prev.blocks.map((block: any) =>
                                        block.id === selectedBlock.id &&
                                        block.type === "image_carousel"
                                          ? {
                                              ...block,
                                              data: {
                                                ...block.data,
                                                items: block.data.items.map(
                                                  (entry: any) =>
                                                    entry.id === item.id
                                                      ? {
                                                          ...entry,
                                                          openInNewTab:
                                                            e.target.checked,
                                                        }
                                                      : entry,
                                                ),
                                              },
                                            }
                                          : block,
                                      ),
                                    }))
                                  }
                                />
                                Open this slide in new tab
                              </label>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          className={toolSetButtonClass("front")}
                          onClick={() =>
                            setDraft((prev: any) => ({
                              ...prev,
                              blocks: addImageCarouselItem(
                                prev.blocks,
                                selectedBlock.id,
                              ),
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