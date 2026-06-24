"use client";

import type { RefObject } from "react";
import type { GalleryTextTarget } from "@/components/builder/formatting/galleryFormatting";

type GalleryInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  selectedGalleryImageId: string | null;
  galleryImageCardRefs: RefObject<Record<string, HTMLDivElement | null>>;

  galleryTextTarget: GalleryTextTarget;
  setGalleryTextTarget: (target: GalleryTextTarget) => void;

  uploadGalleryImagesToBlock: (blockId: string) => Promise<any> | void;
  moveGalleryImage: (
    blockId: string,
    imageId: string,
    direction: "up" | "down",
  ) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function GalleryInspector({
  selectedBlock,
  updateSelectedBlock,
  selectedGalleryImageId,
  galleryImageCardRefs,
  galleryTextTarget,
  setGalleryTextTarget,
  uploadGalleryImagesToBlock,
  moveGalleryImage,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
}: GalleryInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Gallery */}
    <div className={inspectorLabelClass()}>Gallery</div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>
    <select
      value={galleryTextTarget}
      onChange={(e) =>
        setGalleryTextTarget(e.target.value as GalleryTextTarget)
      }
      className={inspectorInputClass()}
    >
      <option value="title">Title</option>
      <option value="description">Description</option>
      <option value="metadata">Metadata</option>
    </select>
  </div>
</div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Columns</div>
        <input
          type="number"
          min={1}
          max={12}
          value={(selectedBlock.data as any).columns ?? 2}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      columns: Math.max(
                        1,
                        Math.min(12, Number(e.target.value) || 1),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Rows</div>
        <input
          type="number"
          min={1}
          max={12}
          value={
            (selectedBlock.data as any).rows ??
            Math.max(
              1,
              Math.ceil(
                (selectedBlock.data.images?.length ?? 0) /
                  ((selectedBlock.data as any).columns ?? 2),
              ),
            )
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      rows: Math.max(
                        1,
                        Math.min(12, Number(e.target.value) || 1),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <div className={inspectorLabelClass()}>Display Text</div>

      <div className="mt-3 grid gap-2">
        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={Boolean((selectedBlock.data as any).showTitle)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "gallery"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showTitle: e.target.checked,
                      } as any,
                    },
              )
            }
          />
          Show Title
        </label>

        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={Boolean((selectedBlock.data as any).showDescription)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "gallery"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showDescription: e.target.checked,
                      } as any,
                    },
              )
            }
          />
          Show Description
        </label>

        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={Boolean((selectedBlock.data as any).showMetadata)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "gallery"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showMetadata: e.target.checked,
                      } as any,
                    },
              )
            }
          />
          Show Metadata
        </label>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Text Placement</div>
        <select
          value={(selectedBlock.data as any).textPlacement ?? "bottom"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      textPlacement:
                        e.target.value === "top" ? "top" : "bottom",
                    } as any,
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Text Style Target</div>
        <select
          value={(selectedBlock.data as any).galleryTextTarget ?? "title"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      galleryTextTarget:
                        e.target.value === "description" ||
                        e.target.value === "metadata"
                          ? e.target.value
                          : "title",
                    } as any,
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="title">Title</option>
          <option value="description">Description</option>
          <option value="metadata">Metadata</option>
        </select>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-4">
      <div>
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Horizontal Photo Spacing</div>
          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).columnGap ?? 8}px
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={(selectedBlock.data as any).columnGap ?? 8}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      columnGap: Number(e.target.value),
                    } as any,
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Vertical Photo Spacing</div>
          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).rowGap ?? 8}px
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={(selectedBlock.data as any).rowGap ?? 8}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      rowGap: Number(e.target.value),
                    } as any,
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Photo Frame Thickness</div>
          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).frameThickness ?? 0}px
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={24}
          value={(selectedBlock.data as any).frameThickness ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      frameThickness: Number(e.target.value),
                    } as any,
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Photo Frame Color</div>
        <input
          type="color"
          value={(selectedBlock.data as any).frameColor ?? "#ffffff"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      frameColor: e.target.value,
                    } as any,
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>
    </div>

    <button
      type="button"
      className="mt-5 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
      onClick={() => void uploadGalleryImagesToBlock(selectedBlock.id)}
    >
      Add Images
    </button>

    <div className="mt-4 space-y-3">
      {selectedBlock.data.images.map((image: any, index: number) => (
        <div
          key={image.id}
          ref={(node) => {
            galleryImageCardRefs.current[image.id] = node;
          }}
          className={[
            "rounded-xl border bg-neutral-50 p-3 transition",
            selectedGalleryImageId === image.id
              ? "border-blue-500 ring-2 ring-blue-200"
              : "border-neutral-200",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-neutral-900">
                Image {index + 1}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() => moveGalleryImage(selectedBlock.id, image.id, "up")}
                disabled={index === 0}
                title="Move up"
              >
                ↑
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  moveGalleryImage(selectedBlock.id, image.id, "down")
                }
                disabled={index === selectedBlock.data.images.length - 1}
                title="Move down"
              >
                ↓
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "gallery"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            images: block.data.images.filter(
                              (galleryImage: any) => galleryImage.id !== image.id,
                            ),
                          },
                        },
                  )
                }
                title="Remove image"
              >
                ×
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Title</div>
            <input
              type="text"
              value={(image as any).title ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "gallery"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          images: block.data.images.map((galleryImage: any) =>
                            galleryImage.id === image.id
                              ? {
                                  ...galleryImage,
                                  title: e.target.value,
                                }
                              : galleryImage,
                          ),
                        } as any,
                      },
                )
              }
              className={inspectorInputClass()}
              placeholder={`Image ${index + 1} title...`}
            />
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Description</div>
            <textarea
              value={(image as any).description ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "gallery"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          images: block.data.images.map((galleryImage: any) =>
                            galleryImage.id === image.id
                              ? {
                                  ...galleryImage,
                                  description: e.target.value,
                                }
                              : galleryImage,
                          ),
                        } as any,
                      },
                )
              }
              className={inspectorTextareaClass()}
              placeholder={`Image ${index + 1} description...`}
            />
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Metadata</div>
            <input
              type="text"
              value={(image as any).metadata ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "gallery"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          images: block.data.images.map((galleryImage: any) =>
                            galleryImage.id === image.id
                              ? {
                                  ...galleryImage,
                                  metadata: e.target.value,
                                }
                              : galleryImage,
                          ),
                        } as any,
                      },
                )
              }
              className={inspectorInputClass()}
              placeholder={`Image ${index + 1} metadata...`}
            />
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Image Link URL</div>
            <input
              type="url"
              value={(image as any).href ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "gallery"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          images: block.data.images.map((galleryImage: any) =>
                            galleryImage.id === image.id
                              ? { ...galleryImage, href: e.target.value }
                              : galleryImage,
                          ),
                        } as any,
                      },
                )
              }
              className={inspectorInputClass()}
              placeholder="https://example.com"
            />
          </div>
        </div>
      ))}

      {!selectedBlock.data.images.length ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
          No gallery images yet.
        </div>
      ) : null}
    </div>
    </div>
  );
}