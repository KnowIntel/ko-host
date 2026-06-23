"use client";

/**
 * Progress Bar inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "progress_bar"
 */
type ProgressBarInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function ProgressBarInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: ProgressBarInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Progress Bar */}
    <div className={inspectorLabelClass()}>Progress Bar</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Display Style</div>
      <select
        value={(selectedBlock.data as any).displayStyle ?? "bar"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "progress_bar"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    displayStyle: e.target.value as "bar" | "meter",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="bar">Bar</option>
        <option value="meter">Meter</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "progress_bar"
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
      />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Current Value</div>
        <input
          type="number"
          min={0}
          value={selectedBlock.data.value ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      value: Math.max(0, Number(e.target.value) || 0),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Max Value</div>
        <input
          type="number"
          min={1}
          value={selectedBlock.data.max ?? 100}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      max: Math.max(1, Number(e.target.value) || 1),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    {((selectedBlock.data as any).displayStyle ?? "bar") === "meter" ? (
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <div className={inspectorLabelClass()}>Meter Options</div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Sections</div>
          <input
            type="number"
            min={1}
            max={20}
            value={(selectedBlock.data as any).meterSectionCount ?? 6}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "progress_bar"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        meterSectionCount: Math.max(
                          1,
                          Math.min(20, Number(e.target.value) || 6),
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className={inspectorLabelClass()}>Start Color</div>
            <input
              type="color"
              value={(selectedBlock.data as any).meterStartColor ?? "#22c55e"}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          meterStartColor: e.target.value,
                        },
                      },
                )
              }
              className="h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
            />
          </div>

          <div>
            <div className={inspectorLabelClass()}>End Color</div>
            <input
              type="color"
              value={(selectedBlock.data as any).meterEndColor ?? "#ef4444"}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          meterEndColor: e.target.value,
                        },
                      },
                )
              }
              className="h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Needle Color</div>
          <input
            type="color"
            value={(selectedBlock.data as any).meterNeedleColor ?? "#111827"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "progress_bar"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        meterNeedleColor: e.target.value,
                      },
                    },
              )
            }
            className="h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
          />
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Caption Text</div>
          <input
            type="text"
            value={(selectedBlock.data as any).meterCaption ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "progress_bar"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        meterCaption: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
            placeholder="Optional caption..."
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showContext ?? true}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showContext: e.target.checked,
                        },
                      },
                )
              }
            />
            Display Context
          </label>
        </div>
      </div>
    ) : null}

{((selectedBlock.data as any).displayStyle ?? "bar") === "bar" ? (
  <>
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Bar Mode</div>
      <select
        value={(selectedBlock.data as any).barMode ?? "progressive"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "progress_bar"
              ? block
              : {
                  ...block,
                data: {
                  ...block.data,
                  barMode: e.target.value as
                    | "progressive"
                    | "split",

                  contextLocation:
                    e.target.value === "split"
                      ? "top"
                      : "bottom-left",
                },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="progressive">Progressive</option>
        <option value="split">Split Comparison</option>
      </select>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>
          Progress Color
        </div>
        <input
          type="color"
          value={
            (selectedBlock.data as any).barForegroundColor ??
            "#111827"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      barForegroundColor: e.target.value,
                    },
                  },
            )
          }
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Background Color
        </div>
        <input
          type="color"
          value={
            (selectedBlock.data as any).barBackgroundColor ??
            "#e5e7eb"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      barBackgroundColor: e.target.value,
                    },
                  },
            )
          }
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white"
        />
      </div>
    </div>

    {((selectedBlock.data as any).barMode ?? "progressive") ===
    "split" ? (
      <>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className={inspectorLabelClass()}>
              Heading A
            </div>
            <input
              type="text"
              value={
                (selectedBlock.data as any).splitHeadingA ??
                "Option A"
              }
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          splitHeadingA: e.target.value,
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div>
            <div className={inspectorLabelClass()}>
              Heading B
            </div>
            <input
              type="text"
              value={
                (selectedBlock.data as any).splitHeadingB ??
                "Option B"
              }
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          splitHeadingB: e.target.value,
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>
            Heading Separator
          </div>
          <select
            value={
              (selectedBlock.data as any)
                .splitHeadingSeparator ?? "none"
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "progress_bar"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        splitHeadingSeparator: e.target.value as
                          | "none"
                          | "|"
                          | ":"
                          | "-",
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="none">None</option>
            <option value="|">|</option>
            <option value=":">:</option>
            <option value="-">-</option>
          </select>
        </div>
      </>
    ) : null}

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={(selectedBlock.data as any).showContext ?? true}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showContext: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Context
      </label>
    </div>

    {((selectedBlock.data as any).showContext ?? true) ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Context Location
        </div>

        <select
          value={
            (selectedBlock.data as any).contextLocation ??
            (((selectedBlock.data as any).barMode ?? "progressive") ===
            "split"
              ? "top"
              : "bottom-left")
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      contextLocation: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          {((selectedBlock.data as any).barMode ??
            "progressive") === "split" ? (
            <>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </>
          ) : (
            <>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">
                Bottom Left
              </option>
              <option value="bottom-right">
                Bottom Right
              </option>
            </>
          )}
        </select>
      </div>
    ) : null}
  </>
) : null}
    </div>
  );
}