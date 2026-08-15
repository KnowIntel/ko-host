"use client";

import { useMemo, useState } from "react";

import type {
  ChecklistStyleTarget,
  ChecklistTextTarget,
} from "@/components/builder/formatting/checklistFormatting";

type ChecklistInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  makeClientId: (prefix: string) => string;

  CATEGORY_BUTTONS?: any;

  checklistTextTarget: ChecklistTextTarget;
  setChecklistTextTarget: (target: ChecklistTextTarget) => void;

  checklistStyleTarget: ChecklistStyleTarget;
  setChecklistStyleTarget: (target: ChecklistStyleTarget) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

function getIconTools(CATEGORY_BUTTONS: any) {
  return (CATEGORY_BUTTONS?.Icons ?? []).filter(
    (tool: any) =>
      tool.kind === "block" &&
      tool.type === "icon",
  );
}

export function ChecklistInspector({
  selectedBlock,
  updateSelectedBlock,
  makeClientId,
  CATEGORY_BUTTONS,

  checklistTextTarget,
  setChecklistTextTarget,

  checklistStyleTarget,
  setChecklistStyleTarget,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: ChecklistInspectorProps) {
  const [expandedIconPickerId, setExpandedIconPickerId] =
    useState<string | null>(null);

  const [iconSearchByItem, setIconSearchByItem] =
    useState<Record<string, string>>({});

  const styleVariant =
    selectedBlock?.data?.styleVariant === "professional"
      ? "professional"
      : "standard";

  const isProfessional =
    styleVariant === "professional";

  const iconTools = useMemo(
    () => getIconTools(CATEGORY_BUTTONS),
    [CATEGORY_BUTTONS],
  );

  function updateChecklistData(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock((block: any) =>
      block.type !== "checklist"
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

  function updateChecklistItem(
    itemId: string,
    patch: Record<string, any>,
  ) {
    updateSelectedBlock((block: any) =>
      block.type !== "checklist"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              items: block.data.items.map(
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

  function removeChecklistItem(itemId: string) {
    updateSelectedBlock((block: any) =>
      block.type !== "checklist"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              items:
                block.data.items.length > 1
                  ? block.data.items.filter(
                      (entry: any) =>
                        entry.id !== itemId,
                    )
                  : block.data.items,
            },
          },
    );
  }

  function addChecklistItem() {
    updateSelectedBlock((block: any) =>
      block.type !== "checklist"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              items: [
                ...block.data.items,
                {
                  id: makeClientId("check"),
                  label: "New item",
                  checked: false,

iconName: "",
iconUrl: "",
iconSize: 28,

time: "",
                  title: "New item",
                  subtitle: "",
                  details: "",
                },
              ],
            },
          },
    );
  }

  function getFilteredIconTools(
    itemId: string,
  ) {
    const query = String(
      iconSearchByItem[itemId] ?? "",
    )
      .trim()
      .toLowerCase();

    if (!query) return iconTools;

    return iconTools.filter((tool: any) => {
      const label = String(
        tool.label ?? "",
      ).toLowerCase();

      const iconName = String(
        tool.iconName ?? "",
      ).toLowerCase();

      return (
        label.includes(query) ||
        iconName.includes(query)
      );
    });
  }

  return (
    <div className="space-y-4">
      {/* ================================================================ */}
      {/* MAIN SETTINGS */}
      {/* ================================================================ */}

      <div className={inspectorCardClass()}>
        <div className={inspectorLabelClass()}>
          Checklist
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>
            Style Variant
          </div>

          <select
            value={styleVariant}
            onChange={(e) => {
              const nextVariant =
                e.target.value === "professional"
                  ? "professional"
                  : "standard";

              updateChecklistData({
                styleVariant: nextVariant,
              });

              /*
               * Return formatting targets to sensible
               * defaults whenever the owner changes variants.
               */
              if (nextVariant === "professional") {
                setChecklistTextTarget("heading");
                setChecklistStyleTarget("row");
              }
            }}
            className={inspectorInputClass()}
          >
            <option value="standard">
              Standard
            </option>

            <option value="professional">
              Professional
            </option>
          </select>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>
            Heading
          </div>

          <input
            type="text"
            value={
              selectedBlock.data.heading ?? ""
            }
            onChange={(e) =>
              updateChecklistData({
                heading: e.target.value,
              })
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>

      {/* ================================================================ */}
      {/* PROFESSIONAL FORMATTING TARGETS */}
      {/* ================================================================ */}

      {isProfessional ? (
        <div className={inspectorCardClass()}>
          <div className={inspectorLabelClass()}>
            Formatting
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>
              Text Target
            </div>

            <select
              value={checklistTextTarget}
              onChange={(e) =>
                setChecklistTextTarget(
                  e.target
                    .value as ChecklistTextTarget,
                )
              }
              className={inspectorInputClass()}
            >
              <option value="heading">
                Heading
              </option>

              <option value="columnHeader">
                Column Headers
              </option>

              <option value="time">
                Time
              </option>

              <option value="title">
                Item Title
              </option>

              <option value="subtitle">
                Item Subtitle
              </option>

              <option value="details">
                Details
              </option>

              <option value="completedText">
                Completed Text
              </option>
            </select>

            <div className="mt-2 text-xs leading-5 text-neutral-500">
              The top toolbar typography controls
              apply to this text group.
            </div>
          </div>

          <div className="mt-5">
            <div className={inspectorLabelClass()}>
              Style Target
            </div>

            <select
              value={checklistStyleTarget}
              onChange={(e) =>
                setChecklistStyleTarget(
                  e.target
                    .value as ChecklistStyleTarget,
                )
              }
              className={inspectorInputClass()}
            >
              <option value="row">
                Checklist Row
              </option>

              <option value="completedRow">
                Completed Row
              </option>

              <option value="iconCell">
                Icon Cell
              </option>

              <option value="status">
                Check Control
              </option>

              <option value="block">
                Entire Block
              </option>
            </select>

            <div className="mt-2 text-xs leading-5 text-neutral-500">
              The top toolbar fill, border, and
              radius controls apply to this area.
            </div>
          </div>
        </div>
      ) : null}

      {/* ================================================================ */}
      {/* PROFESSIONAL LAYOUT */}
      {/* ================================================================ */}

{isProfessional ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>
      Professional Layout
    </div>

    <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
      <div>
        <div className="text-sm font-medium text-neutral-800">
          Column Headers
        </div>

        <div className="mt-1 text-xs text-neutral-500">
          Display headings above the checklist columns.
        </div>
      </div>

      <input
        type="checkbox"
        checked={
          selectedBlock.data.showColumnHeaders !== false
        }
        onChange={(e) =>
          updateChecklistData({
            showColumnHeaders: e.target.checked,
          })
        }
      />
    </label>

    {selectedBlock.data.showColumnHeaders !== false ? (
      <div className="mt-4 grid grid-cols-1 gap-3">
        <div>
          <div className={inspectorLabelClass()}>
            Time Column
          </div>

          <input
            type="text"
            value={
              selectedBlock.data.timeColumnLabel ??
              "TIME"
            }
            onChange={(e) =>
              updateChecklistData({
                timeColumnLabel: e.target.value,
              })
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>
            Action Column
          </div>

          <input
            type="text"
            value={
              selectedBlock.data.actionColumnLabel ??
              "ACTION"
            }
            onChange={(e) =>
              updateChecklistData({
                actionColumnLabel: e.target.value,
              })
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>
            Details Column
          </div>

          <input
            type="text"
            value={
              selectedBlock.data.detailsColumnLabel ??
              "DETAILS"
            }
            onChange={(e) =>
              updateChecklistData({
                detailsColumnLabel: e.target.value,
              })
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>
            Status Column
          </div>

          <input
            type="text"
            value={
              selectedBlock.data.statusColumnLabel ??
              ""
            }
            onChange={(e) =>
              updateChecklistData({
                statusColumnLabel: e.target.value,
              })
            }
            placeholder="Optional"
            className={inspectorInputClass()}
          />
        </div>
      </div>
    ) : null}

    <div className="mt-5 grid grid-cols-1 gap-4">
      <div>
        <div className={inspectorLabelClass()}>
          Completed Row Tint
        </div>

        <input
          type="color"
          value={
            selectedBlock.data.completedTintColor ??
            "#e8f1eb"
          }
          onChange={(e) =>
            updateChecklistData({
              completedTintColor: e.target.value,

              completedRowStyle: {
                ...(
                  selectedBlock.data.completedRowStyle ??
                  {}
                ),

                backgroundColor: e.target.value,
              },
            })
          }
          className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-neutral-300 bg-white p-1"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Completed Text Color
        </div>

        <input
          type="color"
          value={
            selectedBlock.data.completedTextColor ??
            "#365c43"
          }
          onChange={(e) =>
            updateChecklistData({
              completedTextColor: e.target.value,
            })
          }
          className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-neutral-300 bg-white p-1"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <div className={inspectorLabelClass()}>
            All Icon Sizes
          </div>

          <div className="text-xs text-neutral-500">
            {Math.max(
              16,
              Math.min(
                64,
                Number(
                  selectedBlock.data.iconSize ?? 28,
                ),
              ),
            )}
            px
          </div>
        </div>

        <input
          type="range"
          min={16}
          max={64}
          value={Math.max(
            16,
            Math.min(
              64,
              Number(
                selectedBlock.data.iconSize ?? 28,
              ),
            ),
          )}
          onChange={(e) => {
            const nextIconSize = Math.max(
              16,
              Math.min(
                64,
                Number(e.target.value) || 28,
              ),
            );

            updateSelectedBlock((block: any) =>
              block.type !== "checklist"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,

                      iconSize: nextIconSize,

                      items: block.data.items.map(
                        (item: any) => ({
                          ...item,
                          iconSize: nextIconSize,
                        }),
                      ),
                    },
                  },
            );
          }}
          className="mt-2 w-full"
        />

        <div className="mt-1 text-xs leading-5 text-neutral-500">
          Sets all Professional checklist icons to the same size.
          Individual item icon sizes can be adjusted separately below.
        </div>
      </div>
    </div>
  </div>
) : null}

      {/* ================================================================ */}
      {/* CHECKLIST ITEMS */}
      {/* ================================================================ */}

      <div className={inspectorCardClass()}>
        <div className="flex items-center justify-between gap-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Checklist Items
          </div>

          <div className="text-xs text-neutral-500">
            {
              selectedBlock.data.items
                .length
            }{" "}
            {selectedBlock.data.items
              .length === 1
              ? "item"
              : "items"}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {selectedBlock.data.items.map(
            (
              item: any,
              index: number,
            ) => {
              const filteredIcons =
                getFilteredIconTools(
                  item.id,
                );

              const selectedIconName =
                item.iconName ||
                (
                  String(
                    item.iconUrl ?? "",
                  )
                    .split("/")
                    .pop() ?? ""
                ).replace(/\.svg$/i, "");

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">
                        Item {index + 1}
                      </div>

                      <div className="mt-1 text-xs text-neutral-500">
                        {isProfessional
                          ? "Professional checklist row"
                          : "Standard checklist item"}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={toolSetButtonClass(
                        "remove",
                      )}
                      onClick={() =>
                        removeChecklistItem(
                          item.id,
                        )
                      }
                      title="Remove checklist item"
                    >
                      ×
                    </button>
                  </div>

                  {/* ====================================================== */}
                  {/* STANDARD ITEM */}
                  {/* ====================================================== */}

                  {!isProfessional ? (
                    <div className="mt-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(
                            item.checked,
                          )}
                          onChange={(e) =>
                            updateChecklistItem(
                              item.id,
                              {
                                checked:
                                  e.target
                                    .checked,
                              },
                            )
                          }
                          className="mt-4"
                        />

                        <div className="min-w-0 flex-1">
                          <div
                            className={
                              inspectorLabelClass()
                            }
                          >
                            Label
                          </div>

                          <input
                            type="text"
                            value={
                              item.label ?? ""
                            }
                            onChange={(e) =>
                              updateChecklistItem(
                                item.id,
                                {
                                  label:
                                    e.target
                                      .value,

                                  title:
                                    item.title ||
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
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* ================================================== */}
                      {/* PROFESSIONAL ITEM */}
                      {/* ================================================== */}

                      <div className="mt-4">
                        <label className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-3 py-3">
                          <div>
                            <div className="text-sm font-medium text-neutral-800">
                              Default Completed
                            </div>

                            <div className="mt-1 text-xs text-neutral-500">
                              Initial checked
                              state before a
                              visitor changes it.
                            </div>
                          </div>

                          <input
                            type="checkbox"
                            checked={Boolean(
                              item.checked,
                            )}
                            onChange={(e) =>
                              updateChecklistItem(
                                item.id,
                                {
                                  checked:
                                    e.target
                                      .checked,
                                },
                              )
                            }
                          />
                        </label>
                      </div>

                      {/* ICON */}

                      <div className="mt-4">
                        <div
                          className={
                            inspectorLabelClass()
                          }
                        >
                          Icon
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedIconPickerId(
                              (current) =>
                                current ===
                                item.id
                                  ? null
                                  : item.id,
                            )
                          }
                          className="mt-2 flex h-12 w-full items-center gap-3 rounded-xl border border-neutral-300 bg-white px-3 text-left text-sm text-neutral-800 hover:bg-neutral-100"
                        >
                          {item.iconUrl ? (
                            <img
                              src={
                                item.iconUrl
                              }
                              alt=""
                              className="h-7 w-7 shrink-0 object-contain"
                            />
                          ) : (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
                              +
                            </div>
                          )}

                          <span className="min-w-0 flex-1 truncate">
                            {selectedIconName
                              ? selectedIconName
                              : "Choose icon"}
                          </span>

                          <span className="text-neutral-400">
                            {expandedIconPickerId ===
                            item.id
                              ? "▲"
                              : "▼"}
                          </span>
                        </button>

                        {expandedIconPickerId ===
                        item.id ? (
                          <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                            <div className="border-b border-neutral-200 p-2">
                              <input
                                type="text"
                                value={
                                  iconSearchByItem[
                                    item.id
                                  ] ?? ""
                                }
                                onChange={(
                                  e,
                                ) =>
                                  setIconSearchByItem(
                                    (
                                      current,
                                    ) => ({
                                      ...current,

                                      [item.id]:
                                        e.target
                                          .value,
                                    }),
                                  )
                                }
                                placeholder="Search icons..."
                                className={
                                  inspectorInputClass()
                                }
                              />
                            </div>

                            {iconTools.length ? (
                              <div className="max-h-56 overflow-y-auto p-2">
                                {filteredIcons.length ? (
                                  <div className="grid grid-cols-1 gap-1">
                                    {filteredIcons.map(
                                      (
                                        tool: any,
                                      ) => {
                                        const iconName =
                                          tool.iconName ??
                                          "star";

                                        const active =
                                          selectedIconName ===
                                          iconName;

                                        return (
                                          <button
                                            key={
                                              iconName
                                            }
                                            type="button"
                                            onClick={() => {
                                              updateChecklistItem(
                                                item.id,
                                                {
                                                  iconName,

                                                  iconUrl: `/media-icons/${iconName}.svg`,
                                                },
                                              );

                                              setExpandedIconPickerId(
                                                null,
                                              );
                                            }}
                                            className={[
                                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",

                                              active
                                                ? "bg-neutral-900 text-white"
                                                : "text-neutral-800 hover:bg-neutral-100",
                                            ].join(
                                              " ",
                                            )}
                                          >
                                            <img
                                              src={`/media-icons/${iconName}.svg`}
                                              alt=""
                                              className="h-5 w-5 shrink-0 object-contain"
                                            />

                                            <span className="min-w-0 flex-1 truncate">
                                              {
                                                tool.label
                                              }
                                            </span>
                                          </button>
                                        );
                                      },
                                    )}
                                  </div>
                                ) : (
                                  <div className="px-3 py-5 text-center text-sm text-neutral-500">
                                    No matching
                                    icons
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="px-4 py-5 text-sm text-neutral-500">
                                No icons
                                available.
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>

                      {/* TIME */}

                      <div className="mt-4">
                        <div
                          className={
                            inspectorLabelClass()
                          }
                        >
                          Time
                        </div>

                        <input
                          type="text"
                          value={
                            item.time ?? ""
                          }
                          onChange={(e) =>
                            updateChecklistItem(
                              item.id,
                              {
                                time:
                                  e.target
                                    .value,
                              },
                            )
                          }
                          placeholder="9:00 AM"
                          className={
                            inspectorInputClass()
                          }
                        />
                      </div>

                      {/* TITLE */}

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
                            item.title ??
                            item.label ??
                            ""
                          }
                          onChange={(e) =>
                            updateChecklistItem(
                              item.id,
                              {
                                title:
                                  e.target
                                    .value,

                                label:
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

                      {/* SUBTITLE */}

                      <div className="mt-4">
                        <div
                          className={
                            inspectorLabelClass()
                          }
                        >
                          Subtitle
                        </div>

                        <input
                          type="text"
                          value={
                            item.subtitle ??
                            ""
                          }
                          onChange={(e) =>
                            updateChecklistItem(
                              item.id,
                              {
                                subtitle:
                                  e.target
                                    .value,
                              },
                            )
                          }
                          placeholder="Optional supporting text"
                          className={
                            inspectorInputClass()
                          }
                        />
                      </div>

                      {/* DETAILS */}

                      <div className="mt-4">
                        <div
                          className={
                            inspectorLabelClass()
                          }
                        >
                          Details
                        </div>

                        <textarea
                          value={
                            item.details ??
                            ""
                          }
                          onChange={(e) =>
                            updateChecklistItem(
                              item.id,
                              {
                                details:
                                  e.target
                                    .value,
                              },
                            )
                          }
                          placeholder="Add instructions, notes, or other details..."
                          className="mt-2 min-h-[90px] w-full resize-y rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            },
          )}

          <button
            type="button"
            className={toolSetButtonClass(
              "front",
            )}
            onClick={addChecklistItem}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}