"use client";

import type {
  ChartStyleTarget,
  ChartTextTarget,
} from "@/components/builder/formatting/chartFormatting";

type ChartInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  makeClientId: (prefix: string) => string;

  chartTextTarget: ChartTextTarget;
  setChartTextTarget: React.Dispatch<
    React.SetStateAction<ChartTextTarget>
  >;

  chartStyleTarget: ChartStyleTarget;
  setChartStyleTarget: React.Dispatch<
    React.SetStateAction<ChartStyleTarget>
  >;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

const SERIES_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#EA580C",
  "#DC2626",
  "#0891B2",
  "#DB2777",
  "#65A30D",
];

export function ChartInspector({
  selectedBlock,
  updateSelectedBlock,
  makeClientId,
  chartTextTarget,
  setChartTextTarget,
  chartStyleTarget,
  setChartStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: ChartInspectorProps) {
  const data = selectedBlock.data as any;

  const rows = Array.isArray(data.rows)
    ? data.rows
    : [];

  const series = Array.isArray(data.series)
    ? data.series
    : [];

  function updateData(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock((block: any) =>
      block.type !== "chart"
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

  function updateSeries(
    seriesId: string,
    patch: Record<string, any>,
  ) {
    updateSelectedBlock((block: any) => {
      if (block.type !== "chart") {
        return block;
      }

      const currentSeries = Array.isArray(
        block.data.series,
      )
        ? block.data.series
        : [];

      const currentRows = Array.isArray(
        block.data.rows,
      )
        ? block.data.rows
        : [];

      const targetSeries =
        currentSeries.find(
          (item: any) =>
            item.id === seriesId,
        );

      if (!targetSeries) {
        return block;
      }

      const oldName = targetSeries.name;
      const nextName =
        patch.name !== undefined
          ? String(patch.name)
          : oldName;

      const nextSeries =
        currentSeries.map(
          (item: any) =>
            item.id === seriesId
              ? {
                  ...item,
                  ...patch,
                }
              : item,
        );

      const nextRows =
        nextName !== oldName
          ? currentRows.map(
              (row: any) => {
                const values = {
                  ...(row.values ?? {}),
                };

                const existingValue =
                  values[oldName] ?? 0;

                delete values[oldName];

                values[nextName] =
                  existingValue;

                return {
                  ...row,
                  values,
                };
              },
            )
          : currentRows;

      return {
        ...block,
        data: {
          ...block.data,
          series: nextSeries,
          rows: nextRows,
        },
      };
    });
  }

  function addSeries() {
    updateSelectedBlock((block: any) => {
      if (block.type !== "chart") {
        return block;
      }

      const currentSeries = Array.isArray(
        block.data.series,
      )
        ? block.data.series
        : [];

      const currentRows = Array.isArray(
        block.data.rows,
      )
        ? block.data.rows
        : [];

      const seriesNumber =
        currentSeries.length + 1;

      let nextName =
        `Series ${seriesNumber}`;

      let suffix = seriesNumber;

      while (
        currentSeries.some(
          (item: any) =>
            item.name === nextName,
        )
      ) {
        suffix += 1;
        nextName = `Series ${suffix}`;
      }

      const newSeries = {
        id: makeClientId(
          "chart_series",
        ),
        name: nextName,
        color:
          SERIES_COLORS[
            currentSeries.length %
              SERIES_COLORS.length
          ],
        visible: true,
      };

      return {
        ...block,
        data: {
          ...block.data,

          series: [
            ...currentSeries,
            newSeries,
          ],

          rows: currentRows.map(
            (row: any) => ({
              ...row,
              values: {
                ...(row.values ?? {}),
                [nextName]: 0,
              },
            }),
          ),
        },
      };
    });
  }

  function removeSeries(
    seriesId: string,
  ) {
    updateSelectedBlock((block: any) => {
      if (block.type !== "chart") {
        return block;
      }

      const currentSeries = Array.isArray(
        block.data.series,
      )
        ? block.data.series
        : [];

      if (currentSeries.length <= 1) {
        return block;
      }

      const removed =
        currentSeries.find(
          (item: any) =>
            item.id === seriesId,
        );

      if (!removed) {
        return block;
      }

      const currentRows = Array.isArray(
        block.data.rows,
      )
        ? block.data.rows
        : [];

      return {
        ...block,
        data: {
          ...block.data,

          series:
            currentSeries.filter(
              (item: any) =>
                item.id !== seriesId,
            ),

          rows: currentRows.map(
            (row: any) => {
              const values = {
                ...(row.values ?? {}),
              };

              delete values[removed.name];

              return {
                ...row,
                values,
              };
            },
          ),
        },
      };
    });
  }

  function addRow() {
    updateSelectedBlock((block: any) => {
      if (block.type !== "chart") {
        return block;
      }

      const currentRows = Array.isArray(
        block.data.rows,
      )
        ? block.data.rows
        : [];

      const currentSeries = Array.isArray(
        block.data.series,
      )
        ? block.data.series
        : [];

      const rowNumber =
        currentRows.length + 1;

      const values =
        currentSeries.reduce(
          (
            result: Record<
              string,
              number
            >,
            item: any,
          ) => {
            result[item.name] = 0;
            return result;
          },
          {},
        );

      return {
        ...block,
        data: {
          ...block.data,
          rows: [
            ...currentRows,
            {
              id: makeClientId(
                "chart_row",
              ),
              label:
                `Category ${rowNumber}`,
              values,
            },
          ],
        },
      };
    });
  }

  function updateRow(
    rowId: string,
    patch: Record<string, any>,
  ) {
    updateSelectedBlock((block: any) =>
      block.type !== "chart"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              rows: (
                Array.isArray(
                  block.data.rows,
                )
                  ? block.data.rows
                  : []
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
  }

  function updateRowValue(
    rowId: string,
    seriesName: string,
    value: number,
  ) {
    updateSelectedBlock((block: any) =>
      block.type !== "chart"
        ? block
        : {
            ...block,
            data: {
              ...block.data,

              rows: (
                Array.isArray(
                  block.data.rows,
                )
                  ? block.data.rows
                  : []
              ).map((row: any) =>
                row.id === rowId
                  ? {
                      ...row,
                      values: {
                        ...(row.values ??
                          {}),
                        [seriesName]:
                          value,
                      },
                    }
                  : row,
              ),
            },
          },
    );
  }

  function removeRow(rowId: string) {
    updateSelectedBlock((block: any) =>
      block.type !== "chart"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              rows: (
                Array.isArray(
                  block.data.rows,
                )
                  ? block.data.rows
                  : []
              ).filter(
                (row: any) =>
                  row.id !== rowId,
              ),
            },
          },
    );
  }

  const chartType =
    data.chartType ?? "line";

  const usesAxes =
    chartType !== "pie" &&
    chartType !== "doughnut";

  const usesLineControls =
    chartType === "line" ||
    chartType === "area";

  const usesBarControls =
    chartType === "bar" ||
    chartType ===
      "horizontal_bar";

  const usesPieControls =
    chartType === "pie" ||
    chartType === "doughnut";

  return (
    <div
      id="inspector-chart"
      className={inspectorCardClass()}
    >
      <div
        className={inspectorLabelClass()}
      >
        Chart
      </div>

      {/* Formatting */}
<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Text Target
  </div>

  <select
    value={chartTextTarget}
    onChange={(e) =>
      setChartTextTarget(
        e.target.value as ChartTextTarget,
      )
    }
    className={inspectorInputClass()}
  >
    <option value="heading">Heading</option>
    <option value="subtitle">Subtitle</option>
    <option value="legend">Legend</option>
    <option value="axis">Axis Values</option>
    <option value="axisLabel">Axis Labels</option>
    <option value="dataLabel">Data Labels</option>
  </select>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Style Target
  </div>

  <select
    value={chartStyleTarget}
    onChange={(e) =>
      setChartStyleTarget(
        e.target.value as ChartStyleTarget,
      )
    }
    className={inspectorInputClass()}
  >
    <option value="block">Block</option>
  </select>
</div>

      {/* Chart Type */}
      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Chart Type
        </div>

        <select
          value={chartType}
          onChange={(e) =>
            updateData({
              chartType:
                e.target.value,
            })
          }
          className={inspectorInputClass()}
        >
          <option value="line">
            Line
          </option>

          <option value="bar">
            Bar
          </option>

          <option value="horizontal_bar">
            Horizontal Bar
          </option>

          <option value="area">
            Area
          </option>

          <option value="pie">
            Pie
          </option>

          <option value="doughnut">
            Doughnut
          </option>

          <option value="scatter">
            Scatter
          </option>
        </select>
      </div>

      {/* Heading */}
      <div className="mt-6">
        <div
          className={inspectorLabelClass()}
        >
          Content
        </div>

        <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={
              data.showHeading !==
              false
            }
            onChange={(e) =>
              updateData({
                showHeading:
                  e.target.checked,
              })
            }
          />

          Show Heading
        </label>

        {data.showHeading !==
        false ? (
          <input
            type="text"
            value={
              data.heading ?? ""
            }
            onChange={(e) =>
              updateData({
                heading:
                  e.target.value,
              })
            }
            className={`${inspectorInputClass()} mt-2`}
            placeholder="Chart heading"
          />
        ) : null}

        <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={
              data.showSubtitle !==
              false
            }
            onChange={(e) =>
              updateData({
                showSubtitle:
                  e.target.checked,
              })
            }
          />

          Show Subtitle
        </label>

        {data.showSubtitle !==
        false ? (
          <input
            type="text"
            value={
              data.subtitle ?? ""
            }
            onChange={(e) =>
              updateData({
                subtitle:
                  e.target.value,
              })
            }
            className={`${inspectorInputClass()} mt-2`}
            placeholder="Chart subtitle"
          />
        ) : null}
      </div>

      {/* Series */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Data Series
          </div>

          <button
            type="button"
            onClick={addSeries}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            + Add Series
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {series.map(
            (
              item: any,
              index: number,
            ) => (
              <div
                key={
                  item.id ??
                  `${item.name}-${index}`
                }
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={
                      item.name ?? ""
                    }
                    onChange={(e) =>
                      updateSeries(
                        item.id,
                        {
                          name:
                            e.target
                              .value,
                        },
                      )
                    }
                    className={`${inspectorInputClass()} min-w-0 flex-1`}
                    placeholder="Series name"
                  />

                  <input
                    type="color"
                    value={
                      item.color ??
                      SERIES_COLORS[
                        index %
                          SERIES_COLORS.length
                      ]
                    }
                    onChange={(e) =>
                      updateSeries(
                        item.id,
                        {
                          color:
                            e.target
                              .value,
                        },
                      )
                    }
                    className="h-10 w-12 shrink-0 rounded-lg border border-neutral-300 bg-white p-1"
                    title="Series color"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={
                        item.visible !==
                        false
                      }
                      onChange={(e) =>
                        updateSeries(
                          item.id,
                          {
                            visible:
                              e.target
                                .checked,
                          },
                        )
                      }
                    />

                    Visible
                  </label>

                  {series.length >
                  1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        removeSeries(
                          item.id,
                        )
                      }
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ),
          )}
        </div>

        {usesPieControls ? (
          <div className="mt-2 text-xs leading-relaxed text-neutral-500">
            Pie and Doughnut
            charts use the first
            visible series for slice
            values.
          </div>
        ) : null}

        {chartType ===
        "scatter" ? (
          <div className="mt-2 text-xs leading-relaxed text-neutral-500">
            Scatter charts use the
            first visible series for
            X values and the second
            visible series for Y
            values.
          </div>
        ) : null}
      </div>

      {/* Data Rows */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Chart Data
          </div>

          <button
            type="button"
            onClick={addRow}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            + Add Row
          </button>
        </div>

        <div className="mt-3 space-y-4">
          {rows.map(
            (
              row: any,
              rowIndex: number,
            ) => (
              <div
                key={
                  row.id ??
                  `row-${rowIndex}`
                }
                className="rounded-xl border border-neutral-200 bg-white p-3"
              >
<div className="flex items-center gap-2">
  <input
    type="text"
    value={
      row.label ?? ""
    }
    onChange={(e) =>
      updateRow(
        row.id,
        {
          label:
            e.target.value,
        },
      )
    }
    className={`${inspectorInputClass()} min-w-0 flex-1`}
    placeholder="Category"
  />

  {usesPieControls ? (
    <input
      type="color"
      value={
        row.color ??
        SERIES_COLORS[
          rowIndex %
            SERIES_COLORS.length
        ]
      }
      onChange={(e) =>
        updateRow(
          row.id,
          {
            color:
              e.target.value,
          },
        )
      }
      className="h-10 w-12 shrink-0 rounded-lg border border-neutral-300 bg-white p-1"
      title="Slice color"
    />
  ) : null}

  <button
                    type="button"
                    onClick={() =>
                      removeRow(
                        row.id,
                      )
                    }
                    className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    title="Remove row"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 grid gap-2">
                  {series.map(
                    (
                      item: any,
                      seriesIndex: number,
                    ) => (
                      <label
                        key={
                          item.id ??
                          seriesIndex
                        }
                        className="grid grid-cols-[minmax(0,1fr)_110px] items-center gap-3"
                      >
                        <span className="truncate text-xs font-medium text-neutral-600">
                          {
                            item.name
                          }
                        </span>

                        <input
                          type="number"
                          step="any"
                          value={
                            row.values?.[
                              item
                                .name
                            ] ?? 0
                          }
                          onChange={(
                            e,
                          ) =>
                            updateRowValue(
                              row.id,
                              item.name,
                              Number(
                                e.target
                                  .value,
                              ) ||
                                0,
                            )
                          }
                          className={
                            inspectorInputClass()
                          }
                        />
                      </label>
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Display */}
      <div className="mt-6">
        <div
          className={inspectorLabelClass()}
        >
          Display
        </div>

        <div className="mt-3 space-y-2">
          {[
            [
              "showLegend",
              "Show Legend",
              true,
            ],
            [
              "showTooltip",
              "Show Tooltip",
              true,
            ],
            [
              "showDataLabels",
              "Show Data Labels",
              false,
            ],
          ].map(
            ([
              key,
              label,
              defaultValue,
            ]) => (
              <label
                key={String(key)}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={
                    data[key as string] ??
                    defaultValue
                  }
                  onChange={(e) =>
                    updateData({
                      [key as string]:
                        e.target
                          .checked,
                    })
                  }
                />

                {label}
              </label>
            ),
          )}

          {usesAxes ? (
            <>
              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={
                    data.showGrid !==
                    false
                  }
                  onChange={(e) =>
                    updateData({
                      showGrid:
                        e.target
                          .checked,
                    })
                  }
                />

                Show Grid
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={
                    data.showXAxis !==
                    false
                  }
                  onChange={(e) =>
                    updateData({
                      showXAxis:
                        e.target
                          .checked,
                    })
                  }
                />

                Show X Axis
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={
                    data.showYAxis !==
                    false
                  }
                  onChange={(e) =>
                    updateData({
                      showYAxis:
                        e.target
                          .checked,
                    })
                  }
                />

                Show Y Axis
              </label>
            </>
          ) : null}
        </div>
      </div>

      {/* Legend */}
      {data.showLegend !== false ? (
        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Legend Position
          </div>

          <select
            value={
              data.legendPosition ??
              "bottom"
            }
            onChange={(e) =>
              updateData({
                legendPosition:
                  e.target.value,
              })
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="top">
              Top
            </option>
            <option value="bottom">
              Bottom
            </option>
            <option value="left">
              Left
            </option>
            <option value="right">
              Right
            </option>
          </select>
        </div>
      ) : null}

      {/* Axis labels */}
      {usesAxes ? (
        <div className="mt-6">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Axis Labels
          </div>

          <label className="mt-3 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={
                data.showXAxisLabel ===
                true
              }
              onChange={(e) =>
                updateData({
                  showXAxisLabel:
                    e.target.checked,
                })
              }
            />

            Show X Axis Label
          </label>

          {data.showXAxisLabel ===
          true ? (
            <input
              type="text"
              value={
                data.xAxisLabel ??
                ""
              }
              onChange={(e) =>
                updateData({
                  xAxisLabel:
                    e.target.value,
                })
              }
              className={`${inspectorInputClass()} mt-2`}
              placeholder="X axis label"
            />
          ) : null}

          <label className="mt-3 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={
                data.showYAxisLabel ===
                true
              }
              onChange={(e) =>
                updateData({
                  showYAxisLabel:
                    e.target.checked,
                })
              }
            />

            Show Y Axis Label
          </label>

          {data.showYAxisLabel ===
          true ? (
            <input
              type="text"
              value={
                data.yAxisLabel ??
                ""
              }
              onChange={(e) =>
                updateData({
                  yAxisLabel:
                    e.target.value,
                })
              }
              className={`${inspectorInputClass()} mt-2`}
              placeholder="Y axis label"
            />
          ) : null}
        </div>
      ) : null}

      {/* Colors */}
      <div className="mt-6">
        <div
          className={inspectorLabelClass()}
        >
          Chart Colors
        </div>

        {usesAxes ? (
          <>
            <div className="mt-3">
              <div className="text-xs font-medium text-neutral-600">
                Grid Color
              </div>

              <input
                type="color"
                value={
                  data.gridColor ??
                  "#E5E7EB"
                }
                onChange={(e) =>
                  updateData({
                    gridColor:
                      e.target.value,
                  })
                }
                className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
              />
            </div>

            <div className="mt-3">
              <div className="text-xs font-medium text-neutral-600">
                Axis Color
              </div>

              <input
                type="color"
                value={
                  data.axisColor ??
                  "#9CA3AF"
                }
                onChange={(e) =>
                  updateData({
                    axisColor:
                      e.target.value,
                  })
                }
                className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Type-specific */}
      {usesLineControls ? (
        <div className="mt-6">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Line Settings
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>
                Line Width
              </span>
              <span>
                {Number(
                  data.lineWidth ??
                    3,
                )}
                px
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={Number(
                data.lineWidth ?? 3,
              )}
              onChange={(e) =>
                updateData({
                  lineWidth:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>

          <label className="mt-3 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={
                data.showPoints !==
                false
              }
              onChange={(e) =>
                updateData({
                  showPoints:
                    e.target.checked,
                })
              }
            />

            Show Points
          </label>

          {data.showPoints !==
          false ? (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>
                  Point Size
                </span>
                <span>
                  {Number(
                    data.pointSize ??
                      5,
                  )}
                  px
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={Number(
                  data.pointSize ??
                    5,
                )}
                onChange={(e) =>
                  updateData({
                    pointSize:
                      Number(
                        e.target
                          .value,
                      ),
                  })
                }
                className="mt-2 w-full"
              />
            </div>
          ) : null}

          {chartType ===
          "area" ? (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>
                  Area Opacity
                </span>
                <span>
                  {Math.round(
                    Number(
                      data.areaOpacity ??
                        0.22,
                    ) * 100,
                  )}
                  %
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(
                  Number(
                    data.areaOpacity ??
                      0.22,
                  ) * 100,
                )}
                onChange={(e) =>
                  updateData({
                    areaOpacity:
                      Number(
                        e.target
                          .value,
                      ) / 100,
                  })
                }
                className="mt-2 w-full"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {usesBarControls ? (
        <div className="mt-6">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Bar Settings
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>
                Bar Radius
              </span>
              <span>
                {Number(
                  data.barRadius ??
                    6,
                )}
                px
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={Number(
                data.barRadius ?? 6,
              )}
              onChange={(e) =>
                updateData({
                  barRadius:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>
                Bar Gap
              </span>
              <span>
                {Number(
                  data.barGap ?? 8,
                )}
                px
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={Number(
                data.barGap ?? 8,
              )}
              onChange={(e) =>
                updateData({
                  barGap:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>
        </div>
      ) : null}

      {usesPieControls ? (
        <div className="mt-6">
          <div
            className={
              inspectorLabelClass()
            }
          >
            {chartType ===
            "doughnut"
              ? "Doughnut Settings"
              : "Pie Settings"}
          </div>

          {chartType ===
          "doughnut" ? (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>
                  Inner Radius
                </span>
                <span>
                  {Number(
                    data.pieInnerRadius ??
                      55,
                  )}
                </span>
              </div>

              <input
                type="range"
                min={20}
                max={90}
                step={1}
                value={Number(
                  data.pieInnerRadius ||
                    55,
                )}
                onChange={(e) =>
                  updateData({
                    pieInnerRadius:
                      Number(
                        e.target
                          .value,
                      ),
                  })
                }
                className="mt-2 w-full"
              />
            </div>
          ) : null}

          <div className="mt-3">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>
                Outer Radius
              </span>
              <span>
                {Number(
                  data.pieOuterRadius ??
                    90,
                )}
              </span>
            </div>

            <input
              type="range"
              min={20}
              max={140}
              step={1}
              value={Number(
                data.pieOuterRadius ??
                  90,
              )}
              onChange={(e) =>
                updateData({
                  pieOuterRadius:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>
                Slice Gap
              </span>
              <span>
                {Number(
                  data.piePaddingAngle ??
                    2,
                )}
                °
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={Number(
                data.piePaddingAngle ??
                  2,
              )}
              onChange={(e) =>
                updateData({
                  piePaddingAngle:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>
        </div>
      ) : null}

      {chartType === "scatter" ? (
        <div className="mt-6">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Scatter Settings
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>
                Point Size
              </span>
              <span>
                {Number(
                  data.scatterPointSize ??
                    7,
                )}
                px
              </span>
            </div>

            <input
              type="range"
              min={2}
              max={20}
              step={1}
              value={Number(
                data.scatterPointSize ??
                  7,
              )}
              onChange={(e) =>
                updateData({
                  scatterPointSize:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>
        </div>
      ) : null}

      {/* Animation */}
      <div className="mt-6">
        <div
          className={inspectorLabelClass()}
        >
          Animation
        </div>

        <select
          value={
            data.animationStyle ??
            "none"
          }
          onChange={(e) =>
            updateData({
              animationStyle:
                e.target.value,
            })
          }
          className={inspectorInputClass()}
        >
          <option value="none">
            None
          </option>

          <option value="fade">
            Fade
          </option>

          <option value="grow">
            Grow
          </option>
        </select>
      </div>
    </div>
  );
}