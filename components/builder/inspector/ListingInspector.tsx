"use client";

import type { Dispatch, SetStateAction } from "react";

/**
 * Listing inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "listing"
 */
type ListingStyleTarget =
  | "title"
  | "description"
  | "metadata"
  | "price"
  | "quantity";

type ListingMetadataItem = {
  id: string;
  label: string;
  value: string;
};

type ListingInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  listingStyleTarget: ListingStyleTarget;
  setListingStyleTarget: Dispatch<SetStateAction<ListingStyleTarget>>;

  makeClientId: (prefix: string) => string;
  uploadImageToSelectedBlock: (blockId: string) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function ListingInspector({
  selectedBlock,
  updateSelectedBlock,
  listingStyleTarget,
  setListingStyleTarget,
  makeClientId,
  uploadImageToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
}: ListingInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Listing */}
    <div className={inspectorLabelClass()}>Listing</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Text Target</div>

      <select
        value={listingStyleTarget}
        onChange={(e) =>
          setListingStyleTarget(
            e.target.value as
              | "title"
              | "description"
              | "metadata"
              | "price"
              | "quantity",
          )
        }
        className={inspectorInputClass()}
      >
        <option value="title">Title</option>
        <option value="description">Description</option>
        <option value="metadata">Metadata</option>
        <option value="price">Price</option>
        <option value="quantity">Quantity</option>
      </select>
    </div>

        <div className="mt-4">
      <div className={inspectorLabelClass()}>Card Variant</div>
      <select
        value={selectedBlock.data.cardVariant ?? "stacked"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cardVariant: e.target.value as
                      | "stacked"
                      | "compact"
                      | "feature",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="stacked">Stacked</option>
        <option value="compact">Compact</option>
        <option value="feature">Feature</option>
      </select>
    </div>

    <button
      type="button"
      className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
      onClick={() => void uploadImageToSelectedBlock(selectedBlock.id)}
    >
      Browse Listing Image
    </button>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Title</div>
      <input
        type="text"
        value={selectedBlock.data.title}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    title: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Description</div>
      <textarea
        value={selectedBlock.data.description}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    description: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Price</div>
      <input
        type="number"
        step="0.01"
        min="0"
        value={selectedBlock.data.price ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    price:
                      e.target.value === ""
                        ? 0
                        : Math.max(0, Number(e.target.value)),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Enter price"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>SKU</div>
      <input
        type="text"
        value={selectedBlock.data.sku ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    sku: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Optional item code"
      />
    </div>

    <div className="mt-4 space-y-2">
      <label className="text-sm font-medium">Add to cart</label>
      <label className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2">
        <input
          type="checkbox"
          checked={!!selectedBlock.data?.addToCart}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "listing"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      addToCart: e.target.checked,
                    },
                  },
            )
          }
          className="h-4 w-4"
        />
        <span className="text-sm text-neutral-700">Include in Cart</span>
      </label>
    </div>

    {(selectedBlock.data.cardVariant ?? "stacked") !== "feature" ? (
      <>
        <div className="mt-4">
          <div className={inspectorLabelClass()}>Price Position</div>

          <select
            value={(selectedBlock.data as any).pricePlacement ?? "mid"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        pricePlacement: e.target.value as "mid" | "lower",
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="mid">Mid-level</option>
            <option value="lower">Lower-level</option>
          </select>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Quantity Position</div>

          <select
            value={(selectedBlock.data as any).quantityPlacement ?? "mid"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        quantityPlacement: e.target.value as "mid" | "lower",
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="mid">Mid-level</option>
            <option value="lower">Lower-level</option>
          </select>
        </div>
      </>
    ) : null}

    {(selectedBlock.data.cardVariant ?? "stacked") === "feature" ? (
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="text-sm font-semibold text-neutral-800">
          Feature Options
        </div>

        <div className="mt-4 space-y-2">
          {[
            ["showTitle", "Show Title"],
            ["showPrice", "Show Price"],
            ["showImage", "Show Image"],
            ["showBullets", "Show Bullets"],
            ["showButton", "Show Button"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2"
            >
              <input
                type="checkbox"
                checked={!!((selectedBlock.data as any)[key] ?? true)}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "listing"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            [key]: e.target.checked,
                          },
                        },
                  )
                }
                className="h-4 w-4"
              />
              <span className="text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Price Position</div>
          <select
            value={(selectedBlock.data as any).pricePosition ?? "right"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        pricePosition: e.target.value as
                          | "left"
                          | "right"
                          | "belowTitle",
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="belowTitle">Below Title</option>
          </select>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Image Shape</div>
          <select
            value={(selectedBlock.data as any).imageShape ?? "rounded"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        imageShape: e.target.value as
                          | "square"
                          | "rounded"
                          | "circle"
                          | "ticket"
                          | "badge",
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="circle">Circle</option>
            <option value="ticket">Ticket</option>
            <option value="badge">Badge</option>
          </select>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className={inspectorLabelClass()}>Image Width %</div>
            <div className="text-xs text-neutral-500">
              {(selectedBlock.data as any).imageWidthPercent ?? 35}%
            </div>
          </div>

          <input
            type="range"
            min={20}
            max={50}
            value={(selectedBlock.data as any).imageWidthPercent ?? 35}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        imageWidthPercent: Number(e.target.value),
                      },
                    },
              )
            }
            className="mt-2 w-full"
          />
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Bullet Style</div>
          <select
            value={(selectedBlock.data as any).bulletStyle ?? "dot"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        bulletStyle: e.target.value as
                          | "dot"
                          | "checkmark"
                          | "arrow"
                          | "star"
                          | "icon",
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="dot">Dot</option>
            <option value="checkmark">Checkmark</option>
            <option value="arrow">Arrow</option>
            <option value="star">Star</option>
            <option value="icon">Icon</option>
          </select>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Feature Bullets</div>

          <div className="mt-3 space-y-2">
            {((selectedBlock.data as any).featureBullets ?? []).map(
              (item: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "listing"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                featureBullets: (
                                  (block.data as any).featureBullets ?? []
                                ).map((entry: string, entryIndex: number) =>
                                  entryIndex === index
                                    ? e.target.value
                                    : entry,
                                ),
                              },
                            },
                      )
                    }
                    className={inspectorInputClass()}
                  />

                  <button
                    type="button"
                    className={toolSetButtonClass("remove")}
                    onClick={() =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "listing"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                featureBullets: (
                                  (block.data as any).featureBullets ?? []
                                ).filter(
                                  (_entry: string, entryIndex: number) =>
                                    entryIndex !== index,
                                ),
                              },
                            },
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ),
            )}

            <button
              type="button"
              className={toolSetButtonClass("front")}
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "listing"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          featureBullets: [
                            ...((block.data as any).featureBullets ?? []),
                            "New feature",
                          ],
                        },
                      },
                )
              }
            >
              Add Feature Bullet
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Button Text</div>
          <input
            type="text"
            value={(selectedBlock.data as any).buttonText ?? "Buy Ticket"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        buttonText: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Button Link</div>
          <input
            type="text"
            value={(selectedBlock.data as any).buttonLink ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        buttonLink: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
            placeholder="https://..."
          />
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Button Alignment</div>
          <select
            value={(selectedBlock.data as any).buttonAlignment ?? "right"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "listing"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        buttonAlignment: e.target.value as
                          | "left"
                          | "center"
                          | "right"
                          | "hidden",
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
    ) : null}

    {(selectedBlock.data.cardVariant ?? "stacked") === "stacked" ? (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Image Height %</div>

          <div className="text-xs text-neutral-500">
            {selectedBlock.data.imageHeightPercent ?? 50}%
          </div>
        </div>

        <input
          type="range"
          min={20}
          max={80}
          value={selectedBlock.data.imageHeightPercent ?? 50}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "listing"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      imageHeightPercent: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>
    ) : null}

    {(selectedBlock.data.cardVariant ?? "stacked") === "compact" ? (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Image Width %</div>

          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).imageWidthPercent ?? 35}%
          </div>
        </div>

        <input
          type="range"
          min={15}
          max={80}
          value={(selectedBlock.data as any).imageWidthPercent ?? 35}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "listing"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      imageWidthPercent: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>
    ) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Card Rotation</div>
      <input
        type="range"
        min={-45}
        max={45}
        value={(selectedBlock.data as any).rotation ?? 0}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    rotation: Math.max(
                      -45,
                      Math.min(45, Number(e.target.value) || 0),
                    ),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {(selectedBlock.data as any).rotation ?? 0}°
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Card Scale</div>
      <input
        type="range"
        min={50}
        max={100}
        value={Math.round(((selectedBlock.data as any).scale ?? 1) * 100)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    scale: Math.max(
                      0.5,
                      Math.min(1, Number(e.target.value) / 100 || 1),
                    ),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {Math.round(((selectedBlock.data as any).scale ?? 1) * 100)}%
      </div>
    </div>

    <div className="mt-4">
  <div className={inspectorLabelClass()}>Metadata Separator</div>

  <select
    value={(selectedBlock.data as any).metadataSeparator ?? ":"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "listing"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                metadataSeparator: e.target.value as "none" | ":" | "-" | "|",
              } as any,
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="none">None</option>
    <option value=":">:</option>
    <option value="-">-</option>
    <option value="|">|</option>
  </select>
</div>

{(selectedBlock.data.cardVariant ?? "stacked") !== "feature" ? (
  <div className="mt-5">
    <div className={inspectorLabelClass()}>Metadata</div>

      <div className="mt-3 space-y-3">
        {selectedBlock.data.metadata.map((item: ListingMetadataItem) => (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className={inspectorLabelClass()}>Label</div>
            <input
              type="text"
              value={item.label}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "listing"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          metadata: block.data.metadata.map((entry: ListingMetadataItem) =>
                            entry.id === item.id
                              ? { ...entry, label: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <div className="mt-4">
              <div className={inspectorLabelClass()}>Value</div>
              <input
                type="text"
                value={item.value}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "listing"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            metadata: block.data.metadata.map((entry: ListingMetadataItem) =>
                              entry.id === item.id
                                ? { ...entry, value: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "listing"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            metadata: block.data.metadata.filter(
                              (entry: ListingMetadataItem) => entry.id !== item.id
                            ),
                          },
                        },
                  )
                }
                title="Remove metadata item"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className={toolSetButtonClass("front")}
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "listing"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      metadata: [
                        ...block.data.metadata,
                        {
                          id: makeClientId("meta"),
                          label: "Label",
                          value: "Value",
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Metadata Item
        </button>
      </div>
    </div>
  ) : null}
    </div>
  );
}