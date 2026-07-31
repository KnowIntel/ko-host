"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  ComparisonTableStyleTarget,
  ComparisonTableTextTarget,
} from "@/components/builder/formatting/comparisonTableFormatting";

type ComparisonTableInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  comparisonTableTextTarget: ComparisonTableTextTarget;
  setComparisonTableTextTarget: Dispatch<
    SetStateAction<ComparisonTableTextTarget>
  >;

  comparisonTableStyleTarget: ComparisonTableStyleTarget;
  setComparisonTableStyleTarget: Dispatch<
    SetStateAction<ComparisonTableStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function ComparisonTableInspector({
  selectedBlock,
  updateSelectedBlock,

  comparisonTableTextTarget,
  setComparisonTableTextTarget,

  comparisonTableStyleTarget,
  setComparisonTableStyleTarget,

  makeClientId,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: ComparisonTableInspectorProps) {
const columns = Array.isArray(
  selectedBlock.data.columns,
)
  ? selectedBlock.data.columns
  : [];

const rows = Array.isArray(
  selectedBlock.data.rows,
)
  ? selectedBlock.data.rows
  : [];

const updateColumn = (
  columnId: string,
  patch: Record<string, unknown>,
) => {
  updateSelectedBlock((block: any) =>
    block.type !== "comparison_table"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            columns: (
              block.data.columns ?? []
            ).map((column: any) =>
              column.id === columnId
                ? {
                    ...column,
                    ...patch,
                  }
                : column,
            ),
          },
        },
  );
};

const updateRow = (
  rowId: string,
  patch: Record<string, unknown>,
) => {
  updateSelectedBlock((block: any) =>
    block.type !== "comparison_table"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            rows: (
              block.data.rows ?? []
            ).map((row: any) =>
              row.id === rowId
                ? {
                    ...row,
                    ...patch,
                  }
                : row,
            ),
          },
        },
  );
};

const updateCell = (
  rowId: string,
  columnId: string,
  patch: Record<string, unknown>,
) => {
  updateSelectedBlock((block: any) =>
    block.type !== "comparison_table"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            rows: (
              block.data.rows ?? []
            ).map((row: any) =>
              row.id !== rowId
                ? row
                : {
                    ...row,
                    cells: (
                      row.cells ?? []
                    ).map((cell: any) =>
                      cell.columnId ===
                      columnId
                        ? {
                            ...cell,
                            ...patch,
                          }
                        : cell,
                    ),
                  },
            ),
          },
        },
  );
};

  return (
    <div
      id="inspector-statistic-cards"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Statistic Cards
      </div>

      {/* Text Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Text Target
        </div>

        <select
          value={comparisonTableTextTarget}
          onChange={(e) =>
            setComparisonTableTextTarget(
              e.target
                .value as ComparisonTableTextTarget,
            )
          }
          className={inspectorInputClass()}
        >
<option value="heading">
  Heading
</option>

<option value="subtitle">
  Subtitle
</option>

<option value="columnHeading">
  Column Heading
</option>

<option value="columnSubheading">
  Column Subheading
</option>

<option value="columnBadge">
  Column Badge
</option>

<option value="rowLabel">
  Row Label
</option>

<option value="rowDescription">
  Row Description
</option>

<option value="cellValue">
  Cell Value
</option>
        </select>
      </div>

      {/* Style Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Style Target
        </div>

        <select
          value={comparisonTableStyleTarget}
          onChange={(e) =>
            setComparisonTableStyleTarget(
              e.target
                .value as ComparisonTableStyleTarget,
            )
          }
          className={inspectorInputClass()}
        >
<option value="header">
  Header
</option>

<option value="rowLabel">
  Row Label
</option>

<option value="cell">
  Cell
</option>

<option value="featured">
  Featured Column
</option>

<option value="block">
  Block
</option>
        </select>
      </div>

{/* Content */}

<div className="mt-5">
  <div className={inspectorLabelClass()}>
    Content
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Heading
    </div>

    <input
      value={
        selectedBlock.data.heading ?? ""
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading:
                      e.target.value,
                  },
                },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Subtitle
    </div>

    <textarea
      value={
        selectedBlock.data.subtitle ?? ""
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtitle:
                      e.target.value,
                  },
                },
        )
      }
      className={inspectorTextareaClass()}
    />
  </div>

  <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={
        selectedBlock.data.showHeading !==
        false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showHeading:
                      e.target.checked,
                  },
                },
        )
      }
    />

    Show heading
  </label>

  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={
        selectedBlock.data.showSubtitle !==
        false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showSubtitle:
                      e.target.checked,
                  },
                },
        )
      }
    />

    Show subtitle
  </label>
</div>

{/* Layout */}

<div className="mt-5">
  <div className={inspectorLabelClass()}>
    Layout
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Layout Type
    </div>

    <select
      value={
        selectedBlock.data.layout ??
        "table"
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    layout:
                      e.target.value,
                  },
                },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="table">
        Table
      </option>

      <option value="cards">
        Cards
      </option>

      <option value="stacked">
        Stacked
      </option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Header Style
    </div>

    <select
      value={
        selectedBlock.data.headerStyle ??
        "standard"
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    headerStyle:
                      e.target.value,
                  },
                },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="standard">
        Standard
      </option>

      <option value="accent">
        Accent
      </option>

      <option value="minimal">
        Minimal
      </option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Cell Alignment
    </div>

    <select
      value={
        selectedBlock.data.cellAlignment ??
        "center"
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cellAlignment:
                      e.target.value,
                  },
                },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="left">
        Left
      </option>

      <option value="center">
        Center
      </option>

      <option value="right">
        Right
      </option>
    </select>
  </div>
</div>

{/* Visibility */}

<div className="mt-5">
  <div className={inspectorLabelClass()}>
    Visibility
  </div>

  <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={
        selectedBlock.data
          .showColumnSubheadings !== false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showColumnSubheadings:
                      e.target.checked,
                  },
                },
        )
      }
    />

    Show column subheadings
  </label>

  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={
        selectedBlock.data
          .showColumnBadges !== false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showColumnBadges:
                      e.target.checked,
                  },
                },
        )
      }
    />

    Show column badges
  </label>

  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={
        selectedBlock.data
          .showColumnIcons !== false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showColumnIcons:
                      e.target.checked,
                  },
                },
        )
      }
    />

    Show column icons
  </label>

  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={
        selectedBlock.data
          .showRowDescriptions !== false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showRowDescriptions:
                      e.target.checked,
                  },
                },
        )
      }
    />

    Show row descriptions
  </label>

  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={
        selectedBlock.data
          .alternateRows !== false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    alternateRows:
                      e.target.checked,
                  },
                },
        )
      }
    />

    Alternate row backgrounds
  </label>

  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={
        selectedBlock.data
          .stickyFirstColumn !== false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    stickyFirstColumn:
                      e.target.checked,
                  },
                },
        )
      }
    />

    Sticky first column
  </label>
</div>

{/* Spacing */}

<div className="mt-5">
  <div className={inspectorLabelClass()}>
    Spacing
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Block Padding
    </div>

    <input
      type="number"
      min={0}
      max={80}
      value={
        selectedBlock.data.padding ?? 20
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    padding: Math.max(
                      0,
                      Math.min(
                        80,
                        Number(
                          e.target.value,
                        ) || 0,
                      ),
                    ),
                  },
                },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Column Gap
    </div>

    <input
      type="number"
      min={0}
      max={48}
      value={
        selectedBlock.data.columnGap ?? 0
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    columnGap: Math.max(
                      0,
                      Math.min(
                        48,
                        Number(
                          e.target.value,
                        ) || 0,
                      ),
                    ),
                  },
                },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Row Gap
    </div>

    <input
      type="number"
      min={0}
      max={48}
      value={
        selectedBlock.data.rowGap ?? 0
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    rowGap: Math.max(
                      0,
                      Math.min(
                        48,
                        Number(
                          e.target.value,
                        ) || 0,
                      ),
                    ),
                  },
                },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Cell Padding
    </div>

    <input
      type="number"
      min={0}
      max={48}
      value={
        selectedBlock.data.cellPadding ?? 16
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cellPadding: Math.max(
                      0,
                      Math.min(
                        48,
                        Number(
                          e.target.value,
                        ) || 0,
                      ),
                    ),
                  },
                },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Border Radius
    </div>

    <input
      type="number"
      min={0}
      max={48}
      value={
        selectedBlock.data.borderRadius ??
        16
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "comparison_table"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    borderRadius: Math.max(
                      0,
                      Math.min(
                        48,
                        Number(
                          e.target.value,
                        ) || 0,
                      ),
                    ),
                  },
                },
        )
      }
      className={inspectorInputClass()}
    />
  </div>
</div>

      {/* Animation */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Animation
        </div>

        <select
          value={
            selectedBlock.data
              .animationStyle ?? "none"
          }
          onChange={(e) =>
            updateSelectedBlock(
              (block: any) =>
                block.type !==
                "comparison_table"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        animationStyle:
                          e.target.value,
                      },
                    },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="none">
            None
          </option>

          <option value="fade">
            Fade
          </option>

          <option value="slide">
            Slide
          </option>

          <option value="grow">
            Grow
          </option>

          <option value="highlight">
            Highlight
          </option>
        </select>
      </div>

      {/* Columns */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Columns
        </div>

        {columns.map(
          (column: any, index: number) => (
            <div
              key={column.id}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Column {index + 1}
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Heading
                </div>

                <input
                  value={column.heading ?? ""}
                  onChange={(e) =>
                    updateColumn(column.id, {
                      heading: e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Subheading
                </div>

                <input
                  value={column.subheading ?? ""}
                  onChange={(e) =>
                    updateColumn(column.id, {
                      subheading:
                        e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Badge
                </div>

                <input
                  value={column.badge ?? ""}
                  onChange={(e) =>
                    updateColumn(column.id, {
                      badge: e.target.value,
                    })
                  }
                  placeholder="Most Popular"
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Accent
                  </div>

                  <input
                    type="color"
                    value={
                      column.accentColor ||
                      "#2563EB"
                    }
                    onChange={(e) =>
                      updateColumn(column.id, {
                        accentColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>

                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Background
                  </div>

                  <input
                    type="color"
                    value={
                      column.backgroundColor ||
                      "#FFFFFF"
                    }
                    onChange={(e) =>
                      updateColumn(column.id, {
                        backgroundColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>

                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Border
                  </div>

                  <input
                    type="color"
                    value={
                      column.borderColor ||
                      "#E5E7EB"
                    }
                    onChange={(e) =>
                      updateColumn(column.id, {
                        borderColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>
              </div>

              <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={
                    column.featured === true
                  }
                  onChange={(e) =>
                    updateColumn(column.id, {
                      featured:
                        e.target.checked,
                    })
                  }
                />

                Featured column
              </label>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Link
                </div>

                <input
                  value={column.href ?? ""}
                  onChange={(e) =>
                    updateColumn(column.id, {
                      href: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className={inspectorInputClass()}
                />
              </div>

              <button
                type="button"
                className={`${toolSetButtonClass(
                  "remove",
                )} mt-3 w-full min-w-0 whitespace-nowrap px-3`}
                onClick={() =>
                  updateSelectedBlock(
                    (block: any) => {
                      if (
                        block.type !==
                        "comparison_table"
                      ) {
                        return block;
                      }

                      const nextColumns = (
                        block.data.columns ?? []
                      ).filter(
                        (item: any) =>
                          item.id !== column.id,
                      );

                      const nextRows = (
                        block.data.rows ?? []
                      ).map((row: any) => ({
                        ...row,
                        cells: (
                          row.cells ?? []
                        ).filter(
                          (cell: any) =>
                            cell.columnId !==
                            column.id,
                        ),
                      }));

                      return {
                        ...block,
                        data: {
                          ...block.data,
                          columns: nextColumns,
                          rows: nextRows,
                        },
                      };
                    },
                  )
                }
              >
                Remove Column
              </button>
            </div>
          ),
        )}

        <button
          type="button"
          className={`${toolSetButtonClass(
            "front",
          )} mt-3`}
          onClick={() =>
            updateSelectedBlock(
              (block: any) => {
                if (
                  block.type !==
                  "comparison_table"
                ) {
                  return block;
                }

                const columnId =
                  makeClientId(
                    "comparisoncolumn",
                  );

                const nextColumn = {
                  id: columnId,

                  heading: "New Column",
                  subheading: "",
                  badge: "",

                  imageUrl: "",
                  imageStoragePath: "",
                  imageMimeType: "",

                  accentColor: "#2563EB",
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E5E7EB",

                  featured: false,
                  href: "",
                };

                const nextRows = (
                  block.data.rows ?? []
                ).map((row: any) => ({
                  ...row,
                  cells: [
                    ...(row.cells ?? []),

                    {
                      id: makeClientId(
                        "comparisoncell",
                      ),

                      columnId,

                      value: "—",

                      iconName: "",
                      iconColor: "#2563EB",

                      imageUrl: "",
                      imageStoragePath: "",
                      imageMimeType: "",
                    },
                  ],
                }));

                return {
                  ...block,
                  data: {
                    ...block.data,
                    columns: [
                      ...(block.data.columns ??
                        []),

                      nextColumn,
                    ],

                    rows: nextRows,
                  },
                };
              },
            )
          }
        >
          Add Column
        </button>
      </div>

      {/* Rows */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Rows
        </div>

        {rows.map(
          (row: any, rowIndex: number) => (
            <div
              key={row.id}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Row {rowIndex + 1}
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Label
                </div>

                <input
                  value={row.label ?? ""}
                  onChange={(e) =>
                    updateRow(row.id, {
                      label: e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Description
                </div>

                <textarea
                  value={
                    row.description ?? ""
                  }
                  onChange={(e) =>
                    updateRow(row.id, {
                      description:
                        e.target.value,
                    })
                  }
                  className={inspectorTextareaClass()}
                />
              </div>

              <div className="mt-4">
                <div
                  className={inspectorLabelClass()}
                >
                  Cell Values
                </div>

                {columns.map(
                  (column: any) => {
                    const cell = (
                      row.cells ?? []
                    ).find(
                      (item: any) =>
                        item.columnId ===
                        column.id,
                    );

                    if (!cell) {
                      return null;
                    }

                    return (
                      <div
                        key={cell.id}
                        className="mt-3 rounded-lg border border-neutral-200 bg-white p-3"
                      >
                        <div className="text-xs font-medium text-neutral-500">
                          {column.heading ||
                            "Untitled column"}
                        </div>

                        <div className="mt-2">
                          <div
                            className={inspectorLabelClass()}
                          >
                            Value
                          </div>

                          <input
                            value={
                              cell.value ?? ""
                            }
                            onChange={(e) =>
                              updateCell(
                                row.id,
                                cell.id,
                                {
                                  value:
                                    e.target
                                      .value,
                                },
                              )
                            }
                            className={inspectorInputClass()}
                          />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <div
                              className={inspectorLabelClass()}
                            >
                              Icon
                            </div>

                            <select
                              value={
                                cell.iconName ??
                                ""
                              }
                              onChange={(e) =>
                                updateCell(
                                  row.id,
                                  cell.id,
                                  {
                                    iconName:
                                      e.target
                                        .value,
                                  },
                                )
                              }
                              className={inspectorInputClass()}
                            >
                              <option value="">
                                None
                              </option>

                              <option value="check">
                                Check
                              </option>

                              <option value="x">
                                X
                              </option>

                              <option value="minus">
                                Minus
                              </option>

                              <option value="star">
                                Star
                              </option>

                              <option value="circle">
                                Circle
                              </option>

                              <option value="info">
                                Info
                              </option>
                            </select>
                          </div>

                          <div>
                            <div
                              className={inspectorLabelClass()}
                            >
                              Icon Color
                            </div>

                            <input
                              type="color"
                              value={
                                cell.iconColor ||
                                "#2563EB"
                              }
                              onChange={(e) =>
                                updateCell(
                                  row.id,
                                  cell.id,
                                  {
                                    iconColor:
                                      e.target
                                        .value,
                                  },
                                )
                              }
                              className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              <button
                type="button"
                className={`${toolSetButtonClass(
                  "remove",
                )} mt-3 w-full min-w-0 whitespace-nowrap px-3`}
                onClick={() =>
                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "comparison_table"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              rows: (
                                block.data
                                  .rows ?? []
                              ).filter(
                                (
                                  item: any,
                                ) =>
                                  item.id !==
                                  row.id,
                              ),
                            },
                          },
                  )
                }
              >
                Remove Row
              </button>
            </div>
          ),
        )}

        <button
          type="button"
          className={`${toolSetButtonClass(
            "front",
          )} mt-3`}
          onClick={() =>
            updateSelectedBlock(
              (block: any) => {
                if (
                  block.type !==
                  "comparison_table"
                ) {
                  return block;
                }

                const nextRowId =
                  makeClientId(
                    "comparisonrow",
                  );

                return {
                  ...block,
                  data: {
                    ...block.data,
                    rows: [
                      ...(block.data.rows ??
                        []),

                      {
                        id: nextRowId,

                        label: "New Row",

                        description:
                          "Add supporting details for this comparison row.",

                        cells: (
                          block.data
                            .columns ?? []
                        ).map(
                          (
                            column: any,
                          ) => ({
                            id: makeClientId(
                              "comparisoncell",
                            ),

                            columnId:
                              column.id,

                            value: "—",

                            iconName: "",

                            iconColor:
                              "#2563EB",

                            imageUrl: "",

                            imageStoragePath:
                              "",

                            imageMimeType:
                              "",
                          }),
                        ),
                      },
                    ],
                  },
                };
              },
            )
          }
        >
          Add Row
        </button>
      </div>
    </div>
  );
}