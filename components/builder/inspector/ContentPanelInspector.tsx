"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  ContentPanelStyleTarget,
  ContentPanelTextTarget,
} from "@/components/builder/formatting/contentPanelFormatting";

type ContentPanelStyleTarget =
  | "heading"
  | "subtitle"
  | "navigation"
  | "panel";

type ContentPanelInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  contentPanelStyleTarget: ContentPanelStyleTarget;
  setContentPanelStyleTarget: Dispatch<
    SetStateAction<ContentPanelStyleTarget>
  >;

  contentPanelTextTarget: ContentPanelTextTarget;
setContentPanelTextTarget: (target: ContentPanelTextTarget) => void;
contentPanelStyleTarget: ContentPanelStyleTarget;
setContentPanelStyleTarget: (target: ContentPanelStyleTarget) => void;

  makeClientId: (prefix: string) => string;

  uploadImageToSelectedBlock: (...args: any[]) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function ContentPanelInspector({
  selectedBlock,
  updateSelectedBlock,
  contentPanelStyleTarget,
  setContentPanelStyleTarget,
  makeClientId,
  uploadImageToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,

  contentPanelTextTarget,
setContentPanelTextTarget,
contentPanelStyleTarget,
setContentPanelStyleTarget,
}: ContentPanelInspectorProps) {
  return (
    <div id="inspector-content-panel" className={inspectorCardClass()}>
      {/* Content Panel */}
    <div className={inspectorLabelClass()}>Content Panel</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>
    <select
      value={contentPanelTextTarget}
      onChange={(e) =>
        setContentPanelTextTarget(e.target.value as ContentPanelTextTarget)
      }
      className={inspectorInputClass()}
    >
      <option value="heading">Heading</option>
      <option value="subtitle">Subtitle</option>
      <option value="activeNavigation">Active Navigation</option>
      <option value="inactiveNavigation">Inactive Navigation</option>
      <option value="content">Content</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Style Target</div>
    <select
      value={contentPanelStyleTarget}
      onChange={(e) =>
        setContentPanelStyleTarget(e.target.value as ContentPanelStyleTarget)
      }
      className={inspectorInputClass()}
    >
      <option value="form">Form</option>
      <option value="activeNavigation">Active Navigation</option>
      <option value="inactiveNavigation">Inactive Navigation</option>
      <option value="panel">Panel</option>
    </select>
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "content_panel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Information Hub"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <input
        type="text"
        value={selectedBlock.data.subtitle ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "content_panel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtitle: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Explore each section below."
      />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2">
      <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={selectedBlock.data.showHeading !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showHeading: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Heading
      </label>

      <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={selectedBlock.data.showSubtitle !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showSubtitle: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Subtitle
      </label>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Panel Style</div>
      <select
        value={selectedBlock.data.variant ?? "tabs"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "content_panel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    variant: e.target.value as
                      | "tabs"
                      | "sidebar"
                      | "cards"
                      | "accordion",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="tabs">Tabs</option>
        <option value="sidebar">Sidebar</option>
        <option value="cards">Cards</option>
        <option value="accordion">Accordion</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Transition</div>
      <select
        value={selectedBlock.data.transition ?? "fade"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "content_panel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    transition: e.target.value as
                      | "none"
                      | "fade"
                      | "slide_left"
                      | "slide_right"
                      | "flip"
                      | "scale",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="none">None</option>
        <option value="fade">Fade</option>
        <option value="slide_left">Slide Left</option>
        <option value="slide_right">Slide Right</option>
        <option value="flip">Flip</option>
        <option value="scale">Scale</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Target</div>
      <select
        value={contentPanelStyleTarget}
        onChange={(e) =>
          setContentPanelStyleTarget(
            e.target.value as "heading" | "subtitle" | "navigation" | "panel",
          )
        }
        className={inspectorInputClass()}
      >
        <option value="heading">Heading</option>
        <option value="subtitle">Subtitle</option>
        <option value="navigation">Navigation</option>
        <option value="panel">Panel Content</option>
      </select>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Active Nav Background</div>
        <input
          type="color"
          value={(selectedBlock.data as any).activeNavigationBackground ?? "#dbeafe"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      activeNavigationBackground: e.target.value,
                    },
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Active Nav Text</div>
        <input
          type="color"
          value={(selectedBlock.data as any).activeNavigationColor ?? "#1d4ed8"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      activeNavigationColor: e.target.value,
                    },
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Inactive Nav Background</div>
        <input
          type="color"
          value={(selectedBlock.data as any).inactiveNavigationBackground ?? "#ffffff"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      inactiveNavigationBackground: e.target.value,
                    },
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Panel Background</div>
        <input
          type="color"
          value={(selectedBlock.data as any).panelBackground ?? "#f9fafb"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      panelBackground: e.target.value,
                    },
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2">
      <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.rememberSelection)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      rememberSelection: e.target.checked,
                    },
                  },
            )
          }
        />
        Remember
      </label>

      <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={selectedBlock.data.autoHeight !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      autoHeight: e.target.checked,
                    },
                  },
            )
          }
        />
        Auto Height
      </label>
    </div>

    {selectedBlock.data.autoHeight === false ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>Fixed Height</div>
        <input
          type="number"
          min={180}
          max={900}
          value={selectedBlock.data.fixedHeight ?? 420}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "content_panel"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      fixedHeight: Number(e.target.value),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    ) : null}

    <div className="mt-5 space-y-3">
      <div className={inspectorLabelClass()}>Panels</div>

      {selectedBlock.data.panels.map((panel: any, panelIndex: number) => {
        const safeGrid = {
          columns: panel.grid?.columns ?? [
            { id: makeClientId("col"), label: "Item", type: "text" as const },
            { id: makeClientId("col"), label: "Details", type: "text" as const },
          ],
          rows: panel.grid?.rows ?? [
            {
              id: makeClientId("row"),
              cells: [
                { id: makeClientId("cell"), type: "text" as const, value: "" },
                { id: makeClientId("cell"), type: "text" as const, value: "" },
              ],
            },
          ],
          showRowLines: Boolean(panel.grid?.showRowLines),
          showColumnLines: Boolean(panel.grid?.showColumnLines),
          showHeaderRow: panel.grid?.showHeaderRow !== false,
          freezeHeaderRow: panel.grid?.freezeHeaderRow !== false,
        };

        return (
          <div
            key={panel.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-neutral-700">
                Panel {panelIndex + 1}
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  className={toolSetButtonClass("back")}
                  onClick={() =>
                    updateSelectedBlock((block: any) => {
                      if (block.type !== "content_panel") return block;

                      const panels = [...block.data.panels];
                      const previous = panels[panelIndex - 1];

                      if (!previous) return block;

                      panels[panelIndex - 1] = panels[panelIndex];
                      panels[panelIndex] = previous;

                      return {
                        ...block,
                        data: {
                          ...block.data,
                          panels,
                        },
                      };
                    })
                  }
                >
                  ↑
                </button>

                <button
                  type="button"
                  className={toolSetButtonClass("front")}
                  onClick={() =>
                    updateSelectedBlock((block: any) => {
                      if (block.type !== "content_panel") return block;

                      const panels = [...block.data.panels];
                      const next = panels[panelIndex + 1];

                      if (!next) return block;

                      panels[panelIndex + 1] = panels[panelIndex];
                      panels[panelIndex] = next;

                      return {
                        ...block,
                        data: {
                          ...block.data,
                          panels,
                        },
                      };
                    })
                  }
                >
                  ↓
                </button>

                <button
                  type="button"
                  className={toolSetButtonClass("remove")}
                  onClick={() =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "content_panel"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              panels:
                                block.data.panels.length > 1
                                  ? block.data.panels.filter(
                                      (item: any) => item.id !== panel.id,
                                    )
                                  : block.data.panels,
                              defaultPanelId:
                                block.data.defaultPanelId === panel.id
                                  ? block.data.panels.find(
                                      (item: any) => item.id !== panel.id,
                                    )?.id
                                  : block.data.defaultPanelId,
                            },
                          },
                    )
                  }
                >
                  ×
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Title</div>
              <input
                type="text"
                value={panel.title}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "content_panel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            panels: block.data.panels.map((item: any) =>
                              item.id === panel.id
                                ? { ...item, title: e.target.value }
                                : item,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Subtitle</div>
              <input
                type="text"
                value={panel.subtitle ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "content_panel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            panels: block.data.panels.map((item: any) =>
                              item.id === panel.id
                                ? { ...item, subtitle: e.target.value }
                                : item,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <div className="mt-4">
              <div className={inspectorLabelClass()}>Content Style</div>
              <select
                value={panel.contentStyle ?? "plain_text"}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "content_panel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            panels: block.data.panels.map((item: any) =>
                              item.id === panel.id
                                ? {
                                    ...item,
                                    contentStyle: e.target.value as
                                      | "plain_text"
                                      | "list_grid",
                                    grid: item.grid ?? safeGrid,
                                  }
                                : item,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              >
                <option value="plain_text">Plain Text</option>
                <option value="list_grid">List Grid</option>
              </select>
            </div>

            {panel.contentStyle !== "list_grid" ? (
              <div className="mt-3">
                <div className={inspectorLabelClass()}>Content</div>
                <textarea
                  value={panel.content ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "content_panel"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              panels: block.data.panels.map((item: any) =>
                                item.id === panel.id
                                  ? { ...item, content: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorTextareaClass()}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
                <div className={inspectorLabelClass()}>Grid Options</div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    ["showRowLines", "Row Lines"],
                    ["showColumnLines", "Column Lines"],
                    ["showHeaderRow", "Header Row"],
                    ["freezeHeaderRow", "Freeze Header"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={
                          key === "showRowLines"
                            ? safeGrid.showRowLines
                            : key === "showColumnLines"
                              ? safeGrid.showColumnLines
                              : key === "showHeaderRow"
                                ? safeGrid.showHeaderRow
                                : safeGrid.freezeHeaderRow
                        }
                        onChange={(e) =>
                          updateSelectedBlock((block: any) =>
                            block.type !== "content_panel"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    panels: block.data.panels.map((item: any) =>
                                      item.id === panel.id
                                        ? {
                                            ...item,
                                            grid: {
                                              columns:
                                                item.grid?.columns ??
                                                safeGrid.columns,
                                              rows:
                                                item.grid?.rows ??
                                                safeGrid.rows,
                                              showRowLines:
                                                key === "showRowLines"
                                                  ? e.target.checked
                                                  : Boolean(
                                                      item.grid?.showRowLines,
                                                    ),
                                              showColumnLines:
                                                key === "showColumnLines"
                                                  ? e.target.checked
                                                  : Boolean(
                                                      item.grid
                                                        ?.showColumnLines,
                                                    ),
                                              showHeaderRow:
                                                key === "showHeaderRow"
                                                  ? e.target.checked
                                                  : item.grid
                                                      ?.showHeaderRow !== false,
                                              freezeHeaderRow:
                                                key === "freezeHeaderRow"
                                                  ? e.target.checked
                                                  : item.grid
                                                      ?.freezeHeaderRow !==
                                                    false,
                                            },
                                          }
                                        : item,
                                    ),
                                  },
                                },
                          )
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className={inspectorLabelClass()}>Columns</div>

                  <div className="mt-3 space-y-3">
                    {safeGrid.columns.map((column: any, columnIndex: number) => (
                      <div
                        key={column.id}
                        className="rounded-xl border border-neutral-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-semibold text-neutral-700">
                            Column {columnIndex + 1}
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              className={toolSetButtonClass("back")}
                              onClick={() =>
                                updateSelectedBlock((block: any) => {
                                  if (block.type !== "content_panel") return block;

                                  return {
                                    ...block,
                                    data: {
                                      ...block.data,
                                      panels: block.data.panels.map((item: any) => {
                                        if (item.id !== panel.id) return item;

                                        const grid = item.grid ?? safeGrid;
                                        const columns = [...grid.columns];
                                        const previous = columns[columnIndex - 1];

                                        if (!previous) return item;

                                        columns[columnIndex - 1] =
                                          columns[columnIndex];
                                        columns[columnIndex] = previous;

                                        return {
                                          ...item,
                                          grid: {
                                            ...grid,
                                            columns,
                                          },
                                        };
                                      }),
                                    },
                                  };
                                })
                              }
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              className={toolSetButtonClass("front")}
                              onClick={() =>
                                updateSelectedBlock((block: any) => {
                                  if (block.type !== "content_panel") return block;

                                  return {
                                    ...block,
                                    data: {
                                      ...block.data,
                                      panels: block.data.panels.map((item: any) => {
                                        if (item.id !== panel.id) return item;

                                        const grid = item.grid ?? safeGrid;
                                        const columns = [...grid.columns];
                                        const next = columns[columnIndex + 1];

                                        if (!next) return item;

                                        columns[columnIndex + 1] =
                                          columns[columnIndex];
                                        columns[columnIndex] = next;

                                        return {
                                          ...item,
                                          grid: {
                                            ...grid,
                                            columns,
                                          },
                                        };
                                      }),
                                    },
                                  };
                                })
                              }
                            >
                              ↓
                            </button>

                            <button
                              type="button"
                              className={toolSetButtonClass("remove")}
                              onClick={() =>
                                updateSelectedBlock((block: any) =>
                                  block.type !== "content_panel"
                                    ? block
                                    : {
                                        ...block,
                                        data: {
                                          ...block.data,
                                          panels: block.data.panels.map((item: any) => {
                                            if (item.id !== panel.id) return item;

                                            const grid = item.grid ?? safeGrid;

                                            if (grid.columns.length <= 1) {
                                              return item;
                                            }

                                            return {
                                              ...item,
                                              grid: {
                                                ...grid,
                                                columns: grid.columns.filter(
                                                  (entry: any) =>
                                                    entry.id !== column.id,
                                                ),
                                                rows: grid.rows.map((row: any) => ({
                                                  ...row,
                                                  cells: row.cells.filter(
                                                    (_cell: any, cellIndex: number) =>
                                                      cellIndex !== columnIndex,
                                                  ),
                                                })),
                                              },
                                            };
                                          }),
                                        },
                                      },
                                )
                              }
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className={inspectorLabelClass()}>
                            Column Label
                          </div>
                          <input
                            type="text"
                            value={column.label}
                            onChange={(e) =>
                              updateSelectedBlock((block: any) =>
                                block.type !== "content_panel"
                                  ? block
                                  : {
                                      ...block,
                                      data: {
                                        ...block.data,
                                        panels: block.data.panels.map((item: any) => {
                                          if (item.id !== panel.id) return item;

                                          const grid = item.grid ?? safeGrid;

                                          return {
                                            ...item,
                                            grid: {
                                              ...grid,
                                              columns: grid.columns.map(
                                                (entry: any) =>
                                                  entry.id === column.id
                                                    ? {
                                                        ...entry,
                                                        label: e.target.value,
                                                      }
                                                    : entry,
                                              ),
                                            },
                                          };
                                        }),
                                      },
                                    },
                              )
                            }
                            className={inspectorInputClass()}
                          />
                        </div>

                        <div className="mt-3">
                          <div className={inspectorLabelClass()}>
                            Column Type
                          </div>
                          <select
                            value={column.type ?? "text"}
                            onChange={(e) =>
                              updateSelectedBlock((block: any) =>
                                block.type !== "content_panel"
                                  ? block
                                  : {
                                      ...block,
                                      data: {
                                        ...block.data,
                                        panels: block.data.panels.map((item: any) => {
                                          if (item.id !== panel.id) return item;

                                          const grid = item.grid ?? safeGrid;

                                          return {
                                            ...item,
                                            grid: {
                                              ...grid,
                                              columns: grid.columns.map(
                                                (entry: any) =>
                                                  entry.id === column.id
                                                    ? {
                                                        ...entry,
                                                        type: e.target.value as
                                                          | "text"
                                                          | "image",
                                                      }
                                                    : entry,
                                              ),
                                              rows: grid.rows.map((row: any) => ({
                                                ...row,
                                                cells: row.cells.map(
                                                  (cell: any, cellIndex: number) =>
                                                    cellIndex === columnIndex
                                                      ? {
                                                          ...cell,
                                                          type: e.target.value as
                                                            | "text"
                                                            | "image",
                                                        }
                                                      : cell,
                                                ),
                                              })),
                                            },
                                          };
                                        }),
                                      },
                                    },
                              )
                            }
                            className={inspectorInputClass()}
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`${toolSetButtonClass("front")} mt-3`}
                    onClick={() =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "content_panel"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                panels: block.data.panels.map((item: any) => {
                                  if (item.id !== panel.id) return item;

                                  const grid = item.grid ?? safeGrid;

                                  return {
                                    ...item,
                                    grid: {
                                      ...grid,
                                      columns: [
                                        ...grid.columns,
                                        {
                                          id: makeClientId("col"),
                                          label: "New Column",
                                          type: "text" as const,
                                        },
                                      ],
                                      rows: grid.rows.map((row: any) => ({
                                        ...row,
                                        cells: [
                                          ...row.cells,
                                          {
                                            id: makeClientId("cell"),
                                            type: "text" as const,
                                            value: "",
                                          },
                                        ],
                                      })),
                                    },
                                  };
                                }),
                              },
                            },
                      )
                    }
                  >
                    Add Column
                  </button>
                </div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Rows</div>

  <div className="mt-3 space-y-3">
    {safeGrid.rows.map((row: any, rowIndex: number) => (
      <div
        key={row.id}
        className="rounded-xl border border-neutral-200 bg-white p-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-neutral-700">
            Row {rowIndex + 1}
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              className={toolSetButtonClass("back")}
              onClick={() =>
                updateSelectedBlock((block: any) => {
                  if (block.type !== "content_panel") return block;

                  return {
                    ...block,
                    data: {
                      ...block.data,
                      panels: block.data.panels.map((item: any) => {
                        if (item.id !== panel.id) return item;

                        const grid = item.grid ?? safeGrid;
                        const rows = [...grid.rows];
                        const previous = rows[rowIndex - 1];

                        if (!previous) return item;

                        rows[rowIndex - 1] = rows[rowIndex];
                        rows[rowIndex] = previous;

                        return {
                          ...item,
                          grid: {
                            ...grid,
                            rows,
                          },
                        };
                      }),
                    },
                  };
                })
              }
            >
              ↑
            </button>

            <button
              type="button"
              className={toolSetButtonClass("front")}
              onClick={() =>
                updateSelectedBlock((block: any) => {
                  if (block.type !== "content_panel") return block;

                  return {
                    ...block,
                    data: {
                      ...block.data,
                      panels: block.data.panels.map((item: any) => {
                        if (item.id !== panel.id) return item;

                        const grid = item.grid ?? safeGrid;
                        const rows = [...grid.rows];
                        const next = rows[rowIndex + 1];

                        if (!next) return item;

                        rows[rowIndex + 1] = rows[rowIndex];
                        rows[rowIndex] = next;

                        return {
                          ...item,
                          grid: {
                            ...grid,
                            rows,
                          },
                        };
                      }),
                    },
                  };
                })
              }
            >
              ↓
            </button>

            <button
              type="button"
              className={toolSetButtonClass("remove")}
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "content_panel"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          panels: block.data.panels.map((item: any) => {
                            if (item.id !== panel.id) return item;

                            const grid = item.grid ?? safeGrid;

                            if (grid.rows.length <= 1) return item;

                            return {
                              ...item,
                              grid: {
                                ...grid,
                                rows: grid.rows.filter(
                                  (entry: any) => entry.id !== row.id,
                                ),
                              },
                            };
                          }),
                        },
                      },
                )
              }
            >
              ×
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {safeGrid.columns.map((column: any, columnIndex: number) => {
            const cell =
              row.cells[columnIndex] ?? {
                id: makeClientId("cell"),
                type: column.type ?? "text",
                value: "",
              };

            return (
              <div key={`${row.id}-${column.id}`}>
                <div className={inspectorLabelClass()}>
                  {column.label || `Column ${columnIndex + 1}`}
                </div>

{(column.type ?? "text") === "image" ? (
  <div className="mt-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3">
    {cell.imageUrl ? (
      <img
        src={cell.imageUrl}
        alt={cell.imageAlt || column.label}
        className="mb-3 h-20 w-20 rounded-lg object-cover"
      />
    ) : null}

    <button
      type="button"
      className={toolSetButtonClass("front")}
      onClick={() =>
        void uploadImageToSelectedBlock(
          selectedBlock.id,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            panelId: panel.id,
            rowId: row.id,
            columnIndex,
          },
        )
      }
    >
      {cell.imageUrl ? "Replace Image" : "Upload Image"}
    </button>
  </div>
) : (
                  <input
                    type="text"
                    value={cell.value ?? ""}
                    onChange={(e) =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "content_panel"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                panels: block.data.panels.map((item: any) => {
                                  if (item.id !== panel.id) return item;

                                  const grid = item.grid ?? safeGrid;

                                  return {
                                    ...item,
                                    grid: {
                                      ...grid,
                                      rows: grid.rows.map((entry: any) => {
                                        if (entry.id !== row.id) return entry;

                                        const cells = [...entry.cells];

                                        while (cells.length < grid.columns.length) {
                                          const targetColumn =
                                            grid.columns[cells.length];

                                          cells.push({
                                            id: makeClientId("cell"),
                                            type: targetColumn?.type ?? "text",
                                            value: "",
                                          });
                                        }

                                        cells[columnIndex] = {
                                          ...cells[columnIndex],
                                          type: column.type ?? "text",
                                          value: e.target.value,
                                        };

                                        return {
                                          ...entry,
                                          cells,
                                        };
                                      }),
                                    },
                                  };
                                }),
                              },
                            },
                      )
                    }
                    className={inspectorInputClass()}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>

  <button
    type="button"
    className={`${toolSetButtonClass("front")} mt-3`}
    onClick={() =>
      updateSelectedBlock((block: any) =>
        block.type !== "content_panel"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                panels: block.data.panels.map((item: any) => {
                  if (item.id !== panel.id) return item;

                  const grid = item.grid ?? safeGrid;

                  return {
                    ...item,
                    grid: {
                      ...grid,
                      rows: [
                        ...grid.rows,
                        {
                          id: makeClientId("row"),
                          cells: grid.columns.map((column: any) => ({
                            id: makeClientId("cell"),
                            type: column.type ?? "text",
                            value: "",
                          })),
                        },
                      ],
                    },
                  };
                }),
              },
            },
      )
    }
  >
    Add Row
  </button>
</div>

              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <div className={inspectorLabelClass()}>Icon</div>
                <input
                  type="text"
                  value={panel.icon ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "content_panel"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              panels: block.data.panels.map((item: any) =>
                                item.id === panel.id
                                  ? { ...item, icon: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                  placeholder="✨"
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>Badge</div>
                <input
                  type="text"
                  value={panel.badge ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "content_panel"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              panels: block.data.panels.map((item: any) =>
                                item.id === panel.id
                                  ? { ...item, badge: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                  placeholder="New"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Image URL</div>
              <input
                type="text"
                value={panel.imageUrl ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "content_panel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            panels: block.data.panels.map((item: any) =>
                              item.id === panel.id
                                ? { ...item, imageUrl: e.target.value }
                                : item,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
                placeholder="https://..."
              />
            </div>

            <button
              type="button"
              className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
              onClick={() =>
                void uploadImageToSelectedBlock(
                  selectedBlock.id,
                  undefined,
                  undefined,
                  undefined,
                  panel.id,
                )
              }
            >
              Browse Panel Image
            </button>

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Image Position</div>
              <select
                value={panel.imagePosition ?? "above"}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "content_panel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            panels: block.data.panels.map((item: any) =>
                              item.id === panel.id
                                ? {
                                    ...item,
                                    imagePosition: e.target.value as
                                      | "above"
                                      | "below"
                                      | "left"
                                      | "right",
                                  }
                                : item,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={Boolean(panel.featured)}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "content_panel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            panels: block.data.panels.map((item: any) =>
                              item.id === panel.id
                                ? {
                                    ...item,
                                    featured: e.target.checked,
                                  }
                                : item,
                            ),
                          },
                        },
                  )
                }
              />
              Featured Panel
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "content_panel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            defaultPanelId: panel.id,
                          },
                        },
                  )
                }
              >
                {selectedBlock.data.defaultPanelId === panel.id
                  ? "Default Panel"
                  : "Set Default"}
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "content_panel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            panels: [
                              ...block.data.panels.slice(0, panelIndex + 1),
                              {
                                ...panel,
                                id: makeClientId("panel"),
                                title: `${panel.title || "Panel"} Copy`,
                              },
                              ...block.data.panels.slice(panelIndex + 1),
                            ],
                          },
                        },
                  )
                }
              >
                Duplicate
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block: any) =>
            block.type !== "content_panel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    panels: [
                      ...block.data.panels,
                      {
                        id: makeClientId("panel"),
                        title: "New Panel",
                        subtitle: "",
                        content: "Add your panel content here.",
                        contentStyle: "plain_text",
                        grid: {
                          showRowLines: false,
                          showColumnLines: false,
                          showHeaderRow: true,
                          freezeHeaderRow: true,
                          columns: [
                            {
                              id: makeClientId("col"),
                              label: "Item",
                              type: "text",
                            },
                            {
                              id: makeClientId("col"),
                              label: "Details",
                              type: "text",
                            },
                          ],
                          rows: [
                            {
                              id: makeClientId("row"),
                              cells: [
                                {
                                  id: makeClientId("cell"),
                                  type: "text",
                                  value: "",
                                },
                                {
                                  id: makeClientId("cell"),
                                  type: "text",
                                  value: "",
                                },
                              ],
                            },
                          ],
                        },
                        imagePosition: "above",
                        icon: "📌",
                        badge: "",
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Panel
      </button>
    </div>
    </div>
  );
}