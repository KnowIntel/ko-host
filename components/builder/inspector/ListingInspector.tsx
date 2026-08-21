"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  ListingStyleTarget,
  ListingTextTarget,
} from "@/components/builder/formatting/listingFormatting";

type ListingMetadataItem = {
  id: string;
  label: string;
  value: string;
};

type ListingItemizedColumnKey =
  | "item"
  | "value";

type ListingInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  listingTextTarget: ListingTextTarget;

  setListingTextTarget: Dispatch<
    SetStateAction<ListingTextTarget>
  >;

  listingStyleTarget: ListingStyleTarget;

  setListingStyleTarget: Dispatch<
    SetStateAction<ListingStyleTarget>
  >;

  makeClientId: (
    prefix: string,
  ) => string;

  uploadImageToSelectedBlock: (
    blockId: string,
  ) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (
    position?: any,
  ) => string;
};

export function ListingInspector({
  selectedBlock,
  updateSelectedBlock,

  listingTextTarget,
  setListingTextTarget,

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
  const styleVariant =
    selectedBlock?.data?.styleVariant ===
    "itemized"
      ? "itemized"
      : "showcase";

  const isItemized =
    styleVariant === "itemized";

  const itemizedColumnOrder:
    ListingItemizedColumnKey[] =
    Array.isArray(
      selectedBlock.data
        .itemizedColumnOrder,
    ) &&
    selectedBlock.data
      .itemizedColumnOrder.length === 2
      ? selectedBlock.data
          .itemizedColumnOrder
      : [
          "item",
          "value",
        ];

  function updateListingData(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "listing"
          ? block
          : {
              ...block,

              data: {
                ...block.data,
                ...patch,
              },
            },
    );
  }

  function updateItemizedItem(
    itemId: string,

    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "listing"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                itemizedItems: (
                  block.data
                    .itemizedItems ??
                  []
                ).map(
                  (entry: any) =>
                    entry.id === itemId
                      ? {
                          ...entry,
                          ...patch,
                        }
                      : entry,
                ),
              },
            },
    );
  }

  function moveItemizedColumn(
    key: ListingItemizedColumnKey,

    direction: "left" | "right",
  ) {
    const currentIndex =
      itemizedColumnOrder.indexOf(
        key,
      );

    const nextIndex =
      direction === "left"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >=
        itemizedColumnOrder.length
    ) {
      return;
    }

    const nextOrder = [
      ...itemizedColumnOrder,
    ];

    const [
      movedColumn,
    ] = nextOrder.splice(
      currentIndex,
      1,
    );

    nextOrder.splice(
      nextIndex,
      0,
      movedColumn,
    );

    updateListingData({
      itemizedColumnOrder:
        nextOrder,
    });
  }

  function moveItemizedRow(
    itemId: string,

    direction: "up" | "down",
  ) {
    updateSelectedBlock(
      (block: any) => {
        if (
          block.type !== "listing"
        ) {
          return block;
        }

        const items = [
          ...(block.data
            .itemizedItems ??
            []),
        ];

        const currentIndex =
          items.findIndex(
            (item: any) =>
              item.id === itemId,
          );

        const nextIndex =
          direction === "up"
            ? currentIndex - 1
            : currentIndex + 1;

        if (
          currentIndex < 0 ||
          nextIndex < 0 ||
          nextIndex >= items.length
        ) {
          return block;
        }

        const [
          movedItem,
        ] = items.splice(
          currentIndex,
          1,
        );

        items.splice(
          nextIndex,
          0,
          movedItem,
        );

        return {
          ...block,

          data: {
            ...block.data,
            itemizedItems: items,
          },
        };
      },
    );
  }

  const itemizedItems =
    Array.isArray(
      selectedBlock.data
        .itemizedItems,
    )
      ? selectedBlock.data
          .itemizedItems
      : [];

  return (
    <div className="space-y-4">
      {/* ================================================================ */}
      {/* FORMATTING */}
      {/* ================================================================ */}

      <div
        className={
          inspectorCardClass()
        }
      >
        <div
          className={
            inspectorLabelClass()
          }
        >
          Formatting
        </div>

        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Text Target
          </div>

          <select
            value={
              listingTextTarget
            }
            onChange={(e) =>
              setListingTextTarget(
                e.target
                  .value as ListingTextTarget,
              )
            }
            className={
              inspectorInputClass()
            }
          >
            {!isItemized ? (
              <>
                <option value="title">
                  Title
                </option>

                <option value="description">
                  Description
                </option>

                <option value="metadata">
                  Metadata
                </option>

                <option value="price">
                  Price
                </option>

                <option value="quantity">
                  Quantity
                </option>
              </>
            ) : (
              <>
                <option value="itemizedHeading">
                  Heading
                </option>

                <option value="itemizedColumnHeader">
                  Column Headers
                </option>

                <option value="itemizedItem">
                  Item Text
                </option>

                <option value="itemizedValue">
                  Numeric Value
                </option>

                <option value="itemizedTotalLabel">
                  Total Label
                </option>

                <option value="itemizedTotalValue">
                  Total Value
                </option>
              </>
            )}
          </select>
        </div>

        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Style Target
          </div>

          <select
            value={
              listingStyleTarget
            }
            onChange={(e) =>
              setListingStyleTarget(
                e.target
                  .value as ListingStyleTarget,
              )
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="block">
              Block
            </option>

            {isItemized ? (
              <>
                <option value="itemizedRows">
                  Rows
                </option>

                <option value="itemizedTotalRow">
                  Total Row
                </option>
              </>
            ) : null}
          </select>
        </div>
      </div>

      {/* ================================================================ */}
      {/* LISTING */}
      {/* ================================================================ */}

      <div
        className={
          inspectorCardClass()
        }
      >
        <div
          className={
            inspectorLabelClass()
          }
        >
          Listing
        </div>

        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Style Variant
          </div>

          <select
            value={styleVariant}
onChange={(e) => {
  const nextVariant =
    e.target.value === "itemized"
      ? "itemized"
      : "showcase";

  updateListingData({
    styleVariant: nextVariant,
  });

  if (nextVariant === "itemized") {
    setListingTextTarget(
      "itemizedItem",
    );

    setListingStyleTarget(
      "block",
    );
  } else {
    setListingTextTarget(
      "title",
    );

    setListingStyleTarget(
      "block",
    );
  }
}}
            className={
              inspectorInputClass()
            }
          >
            <option value="showcase">
              Showcase Listing
            </option>

            <option value="itemized">
              Itemized List
            </option>
          </select>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ITEMIZED LIST */}
      {/* ================================================================ */}

      {isItemized ? (
        <>
          <div
            className={
              inspectorCardClass()
            }
          >
            <div
              className={
                inspectorLabelClass()
              }
            >
              Itemized Layout
            </div>

            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Heading
              </div>

              <input
                type="text"
                value={
                  selectedBlock.data
                    .itemizedHeading ??
                  ""
                }
                onChange={(e) =>
                  updateListingData({
                    itemizedHeading:
                      e.target.value,
                  })
                }
                placeholder="Optional"
                className={
                  inspectorInputClass()
                }
              />
            </div>

            <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800">
                  Column Headers
                </div>

                <div className="mt-1 text-xs text-neutral-500">
                  Display labels above
                  the two columns.
                </div>
              </div>

              <input
                type="checkbox"
                checked={
                  selectedBlock.data
                    .showItemizedColumnHeaders !==
                  false
                }
                onChange={(e) =>
                  updateListingData({
                    showItemizedColumnHeaders:
                      e.target.checked,
                  })
                }
              />
            </label>

            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Item Column Label
              </div>

              <input
                type="text"
                value={
                  selectedBlock.data
                    .itemColumnLabel ??
                  "ITEM"
                }
                onChange={(e) =>
                  updateListingData({
                    itemColumnLabel:
                      e.target.value,
                  })
                }
                className={
                  inspectorInputClass()
                }
              />
            </div>

            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Value Column Label
              </div>

              <input
                type="text"
                value={
                  selectedBlock.data
                    .valueColumnLabel ??
                  "VALUE"
                }
                onChange={(e) =>
                  updateListingData({
                    valueColumnLabel:
                      e.target.value,
                  })
                }
                className={
                  inspectorInputClass()
                }
              />
            </div>

            <div className="mt-5">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Column Order
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                Move the text and
                numeric columns left
                or right.
              </div>

              <div className="mt-3 space-y-2">
                {itemizedColumnOrder.map(
                  (
                    key,
                    index,
                  ) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1 text-sm font-medium text-neutral-800">
                        {key === "item"
                          ? "Item"
                          : "Value"}
                      </div>

                      <button
                        type="button"
                        disabled={
                          index === 0
                        }
                        onClick={() =>
                          moveItemizedColumn(
                            key,
                            "left",
                          )
                        }
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                          index === 0
                            ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                            : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                        ].join(" ")}
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        disabled={
                          index ===
                          itemizedColumnOrder.length -
                            1
                        }
                        onClick={() =>
                          moveItemizedColumn(
                            key,
                            "right",
                          )
                        }
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                          index ===
                          itemizedColumnOrder.length -
                            1
                            ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                            : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                        ].join(" ")}
                      >
                        →
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mt-5">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Total Label
              </div>

              <input
                type="text"
                value={
                  selectedBlock.data
                    .totalLabel ??
                  "TOTAL"
                }
                onChange={(e) =>
                  updateListingData({
                    totalLabel:
                      e.target.value,
                  })
                }
                className={
                  inspectorInputClass()
                }
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Prefix
                </div>

                <input
                  type="text"
                  value={
                    selectedBlock.data
                      .valuePrefix ??
                    "$"
                  }
                  onChange={(e) =>
                    updateListingData({
                      valuePrefix:
                        e.target.value,
                    })
                  }
                  placeholder="$"
                  className={
                    inspectorInputClass()
                  }
                />
              </div>

              <div>
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Suffix
                </div>

                <input
                  type="text"
                  value={
                    selectedBlock.data
                      .valueSuffix ??
                    ""
                  }
                  onChange={(e) =>
                    updateListingData({
                      valueSuffix:
                        e.target.value,
                    })
                  }
                  placeholder="Optional"
                  className={
                    inspectorInputClass()
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Decimal Places
              </div>

              <select
                value={
                  Number(
                    selectedBlock.data
                      .decimalPlaces ??
                      2,
                  )
                }
                onChange={(e) =>
                  updateListingData({
                    decimalPlaces:
                      Number(
                        e.target.value,
                      ),
                  })
                }
                className={
                  inspectorInputClass()
                }
              >
                <option value={0}>
                  0
                </option>

                <option value={1}>
                  1
                </option>

                <option value={2}>
                  2
                </option>

                <option value={3}>
                  3
                </option>

                <option value={4}>
                  4
                </option>
              </select>
            </div>
          </div>

          {/* ITEMIZED ROWS */}

          <div
            className={
              inspectorCardClass()
            }
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Items
              </div>

              <div className="text-xs text-neutral-500">
                {itemizedItems.length}{" "}
                {itemizedItems.length ===
                1
                  ? "item"
                  : "items"}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {itemizedItems.map(
                (
                  item: any,
                  index: number,
                ) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-neutral-900">
                        Item{" "}
                        {index + 1}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={
                            index === 0
                          }
                          onClick={() =>
                            moveItemizedRow(
                              item.id,
                              "up",
                            )
                          }
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                            index === 0
                              ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                              : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                          ].join(
                            " ",
                          )}
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          disabled={
                            index ===
                            itemizedItems.length -
                              1
                          }
                          onClick={() =>
                            moveItemizedRow(
                              item.id,
                              "down",
                            )
                          }
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                            index ===
                            itemizedItems.length -
                              1
                              ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                              : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                          ].join(
                            " ",
                          )}
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className={
                            toolSetButtonClass(
                              "remove",
                            )
                          }
                          onClick={() =>
                            updateSelectedBlock(
                              (
                                block: any,
                              ) =>
                                block.type !==
                                "listing"
                                  ? block
                                  : {
                                      ...block,

                                      data: {
                                        ...block.data,

                                        itemizedItems:
                                          (
                                            block
                                              .data
                                              .itemizedItems ??
                                            []
                                          ).length >
                                          1
                                            ? (
                                                block
                                                  .data
                                                  .itemizedItems ??
                                                []
                                              ).filter(
                                                (
                                                  entry: any,
                                                ) =>
                                                  entry.id !==
                                                  item.id,
                                              )
                                            : block
                                                .data
                                                .itemizedItems,
                                      },
                                    },
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div
                        className={
                          inspectorLabelClass()
                        }
                      >
                        Item
                      </div>

                      <input
                        type="text"
                        value={
                          item.item ??
                          ""
                        }
                        onChange={(e) =>
                          updateItemizedItem(
                            item.id,
                            {
                              item:
                                e.target
                                  .value,
                            },
                          )
                        }
                        className={
                          inspectorInputClass()
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <div
                        className={
                          inspectorLabelClass()
                        }
                      >
                        Value
                      </div>

                      <input
                        type="number"
                        step="0.01"
                        value={
                          Number.isFinite(
                            Number(
                              item.value,
                            ),
                          )
                            ? item.value
                            : 0
                        }
                        onChange={(e) =>
                          updateItemizedItem(
                            item.id,
                            {
                              value:
                                e.target
                                  .value ===
                                ""
                                  ? 0
                                  : Number(
                                      e
                                        .target
                                        .value,
                                    ),
                            },
                          )
                        }
                        className={
                          inspectorInputClass()
                        }
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                className={
                  toolSetButtonClass(
                    "front",
                  )
                }
                onClick={() =>
                  updateListingData({
                    itemizedItems: [
                      ...itemizedItems,

                      {
                        id: makeClientId(
                          "itemized",
                        ),

                        item:
                          "New Item",

                        value: 0,
                      },
                    ],
                  })
                }
              >
                Add Item
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* ================================================================ */}
      {/* SHOWCASE LISTING */}
      {/* ================================================================ */}

      {!isItemized ? (
        <div
          className={
            inspectorCardClass()
          }
        >
          <div
            className={
              inspectorLabelClass()
            }
          >
            Showcase Listing
          </div>

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Card Variant
            </div>

            <select
              value={
                selectedBlock.data
                  .cardVariant ??
                "stacked"
              }
              onChange={(e) =>
                updateListingData({
                  cardVariant:
                    e.target.value,
                })
              }
              className={
                inspectorInputClass()
              }
            >
              <option value="stacked">
                Stacked
              </option>

              <option value="compact">
                Compact
              </option>

              <option value="feature">
                Feature
              </option>
            </select>
          </div>

          <button
            type="button"
            className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={() =>
              void uploadImageToSelectedBlock(
                selectedBlock.id,
              )
            }
          >
            Browse Listing Image
          </button>

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Title
            </div>

            <input
              type="text"
              value={
                selectedBlock.data
                  .title
              }
              onChange={(e) =>
                updateListingData({
                  title:
                    e.target.value,
                })
              }
              className={
                inspectorInputClass()
              }
            />
          </div>

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Description
            </div>

            <textarea
              value={
                selectedBlock.data
                  .description
              }
              onChange={(e) =>
                updateListingData({
                  description:
                    e.target.value,
                })
              }
              className={
                inspectorTextareaClass()
              }
            />
          </div>

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Price
            </div>

            <input
              type="number"
              step="0.01"
              min="0"
              value={
                selectedBlock.data
                  .price ??
                ""
              }
              onChange={(e) =>
                updateListingData({
                  price:
                    e.target.value ===
                    ""
                      ? 0
                      : Math.max(
                          0,
                          Number(
                            e.target
                              .value,
                          ),
                        ),
                })
              }
              className={
                inspectorInputClass()
              }
            />
          </div>

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              SKU
            </div>

            <input
              type="text"
              value={
                selectedBlock.data
                  .sku ??
                ""
              }
              onChange={(e) =>
                updateListingData({
                  sku:
                    e.target.value,
                })
              }
              className={
                inspectorInputClass()
              }
              placeholder="Optional item code"
            />
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2">
            <input
              type="checkbox"
              checked={
                !!selectedBlock.data
                  .addToCart
              }
              onChange={(e) =>
                updateListingData({
                  addToCart:
                    e.target.checked,
                })
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-neutral-700">
              Include in Cart
            </span>
          </label>

          {/* Existing Showcase-specific controls can remain directly below this section. */}
        </div>
      ) : null}
    </div>
  );
}