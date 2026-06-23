"use client";

/**
 * Spreadsheet inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "spreadsheet"
 */
type SpreadsheetInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  FONT_FAMILY_OPTIONS: readonly string[];

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function SpreadsheetInspector({
  selectedBlock,
  updateSelectedBlock,
  FONT_FAMILY_OPTIONS,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: SpreadsheetInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Spreadsheet */}
    <div className={inspectorLabelClass()}>Spreadsheet</div>

    {(() => {
const selectedCellKey =
  typeof window !== "undefined"
    ? ((window as any).__koHostSpreadsheetActiveCell?.[selectedBlock.id] ??
        (selectedBlock.data as any).selectedCell ??
        "0:0")
    : ((selectedBlock.data as any).selectedCell ?? "0:0");

const selectedCells =
  Array.isArray((selectedBlock.data as any).selectedCells) &&
  (selectedBlock.data as any).selectedCells.length > 0
    ? ((selectedBlock.data as any).selectedCells as string[])
    : [selectedCellKey];

const selectedRowIndex = Number(String(selectedCellKey).split(":")[0] ?? 0);
const selectedColumnIndex = Number(String(selectedCellKey).split(":")[1] ?? 0);

const selectedCellData =
  ((selectedBlock.data as any).cells ?? {})[selectedCellKey] ?? null;

const selectedCellFormat = selectedCellData?.format ?? {};

const updateSelectedCellFormat = (patch: Record<string, any>) => {
  updateSelectedBlock((block: any) => {
    if (block.type !== "spreadsheet") return block;

    const activeCells =
      Array.isArray((block.data as any).selectedCells) &&
      (block.data as any).selectedCells.length > 0
        ? ((block.data as any).selectedCells as string[])
        : [((block.data as any).selectedCell ?? "0:0")];

    const nextCells = { ...(block.data.cells ?? {}) };

    activeCells.forEach((cellKey) => {
      const existingCell = nextCells[cellKey];

      nextCells[cellKey] = {
        id: existingCell?.id ?? `cell_${cellKey}_${Date.now()}`,
        value: existingCell?.value ?? "",
        format: {
          ...(existingCell?.format ?? {}),
          ...patch,
        },
      };
    });

    return {
      ...block,
      data: {
        ...block.data,
        cells: nextCells,
      },
    };
  });
};

const clearSelectedCells = () => {
  updateSelectedBlock((block: any) => {
    if (block.type !== "spreadsheet") return block;

    const activeCells =
      Array.isArray((block.data as any).selectedCells) &&
      (block.data as any).selectedCells.length > 0
        ? ((block.data as any).selectedCells as string[])
        : [((block.data as any).selectedCell ?? "0:0")];

    const nextCells = { ...(block.data.cells ?? {}) };

    activeCells.forEach((cellKey) => {
      const existingCell = nextCells[cellKey];

      nextCells[cellKey] = {
        id: existingCell?.id ?? `cell_${cellKey}_${Date.now()}`,
        value: "",
        format: existingCell?.format ?? {},
      };
    });

    return {
      ...block,
      data: {
        ...block.data,
        cells: nextCells,
      },
    };
  });
};

      return (
        <>
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
            Active Cell: {selectedRowIndex + 1}:{selectedColumnIndex + 1}
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Sheet Title</div>
            <input
              type="text"
              value={(selectedBlock.data as any).title ?? ""}
              onChange={(e) => {
                const nextTitle = e.target.value;

                updateSelectedBlock((block: any) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          title: nextTitle,
                        },
                      },
                );
              }}
              className={inspectorInputClass()}
              placeholder="Spreadsheet"
            />
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Caption</div>
            <input
              type="text"
              value={(selectedBlock.data as any).caption ?? ""}
              onChange={(e) => {
                const nextCaption = e.target.value;

                updateSelectedBlock((block: any) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          caption: nextCaption,
                        },
                      },
                );
              }}
              className={inspectorInputClass()}
              placeholder="Optional note or description"
            />
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showTitle !== false}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showTitle: e.target.checked,
                        },
                      },
                )
              }
            />
            Show Title
          </label>

<label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={(selectedBlock.data as any).showHeaders !== false}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "spreadsheet"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                showHeaders: e.target.checked,
              },
            },
      )
    }
  />
  Show Headers
</label>

          <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showGridlines !== false}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showGridlines: e.target.checked,
                        },
                      },
                )
              }
            />
            Show Gridlines
          </label>

          <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).editMode === true}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          editMode: e.target.checked,
                        },
                      },
                )
              }
            />
            Edit Spreadsheet Mode
          </label>

<div className="mt-4 grid grid-cols-2 gap-2">
  <button
    type="button"
    className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
onClick={() =>
  updateSelectedBlock((block: any) => {
    if (block.type !== "spreadsheet") return block;

    const insertAt = selectedRowIndex;
    const nextCells: Record<string, any> = {};

    Object.entries(block.data.cells ?? {}).forEach(([key, cell]) => {
      const [row, col] = key.split(":").map(Number);
      const nextRow = row >= insertAt ? row + 1 : row;
      nextCells[`${nextRow}:${col}`] = cell;
    });

    return {
      ...block,
      data: {
        ...block.data,
        rowCount: block.data.rowCount + 1,
        cells: nextCells,
        rowHeights: {
          ...block.data.rowHeights,
          [String(insertAt)]: 36,
        },
        selectedCell: `${insertAt}:${selectedColumnIndex}`,
        selectedCells: [`${insertAt}:${selectedColumnIndex}`],
      },
    };
  })
}
  >
    Add Row
  </button>

  <button
    type="button"
    className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
onClick={() =>
  updateSelectedBlock((block: any) => {
    if (block.type !== "spreadsheet") return block;

    const insertAt = selectedColumnIndex;
    const nextCells: Record<string, any> = {};

    Object.entries(block.data.cells ?? {}).forEach(([key, cell]) => {
      const [row, col] = key.split(":").map(Number);
      const nextCol = col >= insertAt ? col + 1 : col;
      nextCells[`${row}:${nextCol}`] = cell;
    });

    return {
      ...block,
      data: {
        ...block.data,
        columnCount: block.data.columnCount + 1,
        cells: nextCells,
        columnWidths: {
          ...block.data.columnWidths,
          [String(insertAt)]: 120,
        },
        selectedCell: `${selectedRowIndex}:${insertAt}`,
        selectedCells: [`${selectedRowIndex}:${insertAt}`],
      },
    };
  })
}
  >
    Add Column
  </button>
</div>

<div className="mt-4 grid grid-cols-2 gap-2">
  <button
    type="button"
    disabled={(selectedBlock.data as any).rowCount <= 1}
    className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
    onClick={() =>
      updateSelectedBlock((block: any) => {
        if (block.type !== "spreadsheet") return block;

        const nextCells: Record<string, any> = {};

        Object.entries(block.data.cells ?? {}).forEach(([key, cell]) => {
          const [row, col] = key.split(":").map(Number);
          if (row === selectedRowIndex) return;

          const nextRow = row > selectedRowIndex ? row - 1 : row;
          nextCells[`${nextRow}:${col}`] = cell;
        });

        return {
          ...block,
          data: {
            ...block.data,
            rowCount: Math.max(1, block.data.rowCount - 1),
            cells: nextCells,
            selectedCell: `${Math.max(0, selectedRowIndex - 1)}:${selectedColumnIndex}`,
          },
        };
      })
    }
  >
    Delete Row
  </button>

  <button
    type="button"
    disabled={(selectedBlock.data as any).columnCount <= 1}
    className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
    onClick={() =>
      updateSelectedBlock((block: any) => {
        if (block.type !== "spreadsheet") return block;

        const nextCells: Record<string, any> = {};

        Object.entries(block.data.cells ?? {}).forEach(([key, cell]) => {
          const [row, col] = key.split(":").map(Number);
          if (col === selectedColumnIndex) return;

          const nextCol = col > selectedColumnIndex ? col - 1 : col;
          nextCells[`${row}:${nextCol}`] = cell;
        });

        return {
          ...block,
          data: {
            ...block.data,
            columnCount: Math.max(1, block.data.columnCount - 1),
            cells: nextCells,
            selectedCell: `${selectedRowIndex}:${Math.max(0, selectedColumnIndex - 1)}`,
          },
        };
      })
    }
  >
    Delete Column
  </button>
</div>

<div className="mt-4">
  <button
    type="button"
    className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
    onClick={clearSelectedCells}
  >
    Clear Selected Cell Contents
  </button>
</div>

          <div className="mt-4">
  <div className={inspectorLabelClass()}>Selected Row Height</div>
  <input
    type="number"
    min={24}
    max={200}
    value={(selectedBlock.data as any).rowHeights?.[String(selectedRowIndex)] ?? 36}
    onChange={(e) => {
      const nextHeight = Math.max(24, Math.min(200, Number(e.target.value) || 36));

      updateSelectedBlock((block: any) =>
        block.type !== "spreadsheet"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                rowHeights: {
                  ...block.data.rowHeights,
                  [String(selectedRowIndex)]: nextHeight,
                },
              },
            },
      );
    }}
    className={inspectorInputClass()}
  />
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Selected Column Width</div>
  <input
    type="number"
    min={48}
    max={400}
    value={(selectedBlock.data as any).columnWidths?.[String(selectedColumnIndex)] ?? 120}
    onChange={(e) => {
      const nextWidth = Math.max(48, Math.min(400, Number(e.target.value) || 120));

      updateSelectedBlock((block: any) =>
        block.type !== "spreadsheet"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                columnWidths: {
                  ...block.data.columnWidths,
                  [String(selectedColumnIndex)]: nextWidth,
                },
              },
            },
      );
    }}
    className={inspectorInputClass()}
  />
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Selected Cell Font Family</div>
  <select
    value={selectedCellFormat.fontFamily ?? "Inter"}
    onChange={(e) => updateSelectedCellFormat({ fontFamily: e.target.value })}
    className={inspectorInputClass()}
  >
{FONT_FAMILY_OPTIONS.filter((font) => font !== "inherit").map((font) => (
  <option key={font} value={font}>
    {font}
  </option>
))}
  </select>
</div>

<div className="mt-4">
  <div className="mb-1 flex items-center justify-between">
    <div className={inspectorLabelClass()}>Selected Cell Font Size</div>
    <div className="text-xs text-neutral-500">
      {selectedCellFormat.fontSize ?? 14}px
    </div>
  </div>

  <input
    type="range"
    min={8}
    max={72}
    value={selectedCellFormat.fontSize ?? 14}
    onChange={(e) =>
      updateSelectedCellFormat({
        fontSize: Math.max(8, Math.min(72, Number(e.target.value) || 14)),
      })
    }
    className="w-full"
  />
</div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div>
              <div className={inspectorLabelClass()}>Cell Text</div>
              <input
                type="color"
                onChange={(e) => updateSelectedCellFormat({ textColor: e.target.value })}
                className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-neutral-300 bg-white p-1"
              />
            </div>

            <div>
              <div className={inspectorLabelClass()}>Cell Fill</div>
              <input
                type="color"
                onChange={(e) =>
                  updateSelectedCellFormat({ backgroundColor: e.target.value })
                }
                className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-neutral-300 bg-white p-1"
              />
            </div>
          </div>

<div className="mt-4 grid grid-cols-3 gap-2">
  <button
    type="button"
    className={`h-10 rounded-xl border px-3 text-sm font-bold hover:bg-neutral-50 ${
      selectedCellFormat.bold === true
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-300 bg-white text-neutral-800"
    }`}
    onClick={() => updateSelectedCellFormat({ bold: selectedCellFormat.bold !== true })}
  >
    B
  </button>

  <button
    type="button"
    className={`h-10 rounded-xl border px-3 text-sm italic hover:bg-neutral-50 ${
      selectedCellFormat.italic === true
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-300 bg-white text-neutral-800"
    }`}
    onClick={() =>
      updateSelectedCellFormat({ italic: selectedCellFormat.italic !== true })
    }
  >
    I
  </button>

  <button
    type="button"
    className={`h-10 rounded-xl border px-3 text-sm underline hover:bg-neutral-50 ${
      selectedCellFormat.underline === true
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-300 bg-white text-neutral-800"
    }`}
    onClick={() =>
      updateSelectedCellFormat({
        underline: selectedCellFormat.underline !== true,
      })
    }
  >
    U
  </button>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Horizontal Alignment</div>
  <select
    className={inspectorInputClass()}
    onChange={(e) =>
      updateSelectedCellFormat({
        horizontalAlign: e.target.value as "left" | "center" | "right",
      })
    }
    defaultValue=""
  >
    <option value="" disabled>
      Choose alignment
    </option>
    <option value="left">Left</option>
    <option value="center">Center</option>
    <option value="right">Right</option>
  </select>
</div>

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={
      ((selectedBlock.data as any).cells?.[selectedCellKey]?.format?.wrapText ??
        false) === true
    }
    onChange={(e) => updateSelectedCellFormat({ wrapText: e.target.checked })}
  />
  Wrap Text
</label>

<label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={
      ((selectedBlock.data as any).cells?.[selectedCellKey]?.format?.locked ??
        false) === true
    }
    onChange={(e) => updateSelectedCellFormat({ locked: e.target.checked })}
  />
  Lock Selected Cell
</label>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs leading-5 text-neutral-600">
            Select a cell in Edit Spreadsheet Mode, then use these controls to style that active cell.
          </div>
        </>
      );
    })()}
    </div>
  );
}