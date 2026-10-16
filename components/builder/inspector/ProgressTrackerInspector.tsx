
"use client";

import type {
  MicrositeBlock,
  ProgressTrackerBlock,
  ProgressTrackerMeasurement,
  ProgressTrackerRow,
  TextStyle,
} from "@/lib/templates/builder";

import type {
  ProgressTrackerTextTarget,
  ProgressTrackerStyleTarget,
} from "@/components/builder/formatting/progressTrackerFormatting";

type Props = {
  block: ProgressTrackerBlock;

  updateSelectedBlock: (
    updater: (block: MicrositeBlock) => MicrositeBlock
  ) => void;

  progressTrackerTextTarget: ProgressTrackerTextTarget;
  setProgressTrackerTextTarget: (
    target: ProgressTrackerTextTarget
  ) => void;

  progressTrackerStyleTarget: ProgressTrackerStyleTarget;
  setProgressTrackerStyleTarget: (
    target: ProgressTrackerStyleTarget
  ) => void;
};

type TrackerData = ProgressTrackerBlock["data"];

const inputClass =
  "w-full min-w-0 rounded border px-3 py-2 text-sm";

const buttonClass =
  "rounded border px-3 py-2 text-sm hover:bg-gray-100";

const labelClass = "block text-xs font-medium mb-1";

const sectionClass = "space-y-3 rounded-lg border p-3";

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function optionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function targetNumber(value: string): number | null {
  return optionalNumber(value) ?? null;
}

export function ProgressTrackerInspector({
  block,
  updateSelectedBlock,
  progressTrackerTextTarget,
  setProgressTrackerTextTarget,
  progressTrackerStyleTarget,
  setProgressTrackerStyleTarget,
}: Props) {
  const data = block.data;

  function updateData(patch: Partial<TrackerData>) {
    updateSelectedBlock((current) => {
      if (current.type !== "progress_tracker") return current;

      return {
        ...current,
        data: {
          ...current.data,
          ...patch,
        },
      };
    });
  }

  function updateMeasurement(
    id: string,
    patch: Partial<ProgressTrackerMeasurement>
  ) {
    updateData({
      measurements: data.measurements.map((measurement) =>
        measurement.id === id
          ? { ...measurement, ...patch }
          : measurement
      ),
    });
  }

  function updateRow(id: string, patch: Partial<ProgressTrackerRow>) {
    updateData({
      rows: data.rows.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    });
  }

  function updateTarget(
    rowId: string,
    measurementId: string,
    value: string
  ) {
    updateData({
      rows: data.rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              targets: {
                ...row.targets,
                [measurementId]: targetNumber(value),
              },
            }
          : row
      ),
    });
  }

  function updateTitleStyle(patch: Partial<TextStyle>) {
    updateData({
      titleStyle: {
        ...(data.titleStyle ?? {}),
        ...patch,
      },
    });
  }

  function addRow() {
    updateData({
      rows: [
        ...data.rows,
        {
          id: makeId("row"),
          label: `Row ${data.rows.length + 1}`,
          targets: {},
        },
      ],
    });
  }

  function removeRow(id: string) {
    updateData({
      rows: data.rows.filter((row) => row.id !== id),
    });
  }

  function moveRow(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= data.rows.length) return;

    const rows = [...data.rows];
    [rows[index], rows[nextIndex]] = [
      rows[nextIndex],
      rows[index],
    ];

    updateData({ rows });
  }

  function addMeasurement() {
    updateData({
      measurements: [
        ...data.measurements,
        {
          id: makeId("measurement"),
          label: "New Measurement",
          unit: "",
visible: true,
targetEnabled: true,
actualEnabled: true,
presetValues: true,
progression: {
  mode: "none",
  step: 0,
},
        },
      ],
    });
  }

  function removeMeasurement(id: string) {
    updateData({
      measurements: data.measurements.filter(
        (measurement) => measurement.id !== id
      ),
      rows: data.rows.map((row) => {
        const targets = { ...row.targets };
        delete targets[id];

        return { ...row, targets };
      }),
    });
  }

  function moveMeasurement(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= data.measurements.length
    ) {
      return;
    }

    const measurements = [...data.measurements];

    [measurements[index], measurements[nextIndex]] = [
      measurements[nextIndex],
      measurements[index],
    ];

    updateData({ measurements });
  }

  function updateProgression(
    measurement: ProgressTrackerMeasurement,
    patch: Partial<ProgressTrackerMeasurement["progression"]>
  ) {
    updateMeasurement(measurement.id, {
      progression: {
        ...measurement.progression,
        ...patch,
      },
    });
  }

  return (
    <div className="space-y-4">
        {/* FORMATTING TARGETS */}
<section className={sectionClass}>
  <h3 className="text-sm font-semibold">
    Formatting Targets
  </h3>

  <div>
    <label className={labelClass}>
      Text Target
    </label>

    <select
      className={inputClass}
      value={progressTrackerTextTarget}
      onChange={(e) =>
        setProgressTrackerTextTarget(
          e.target.value as ProgressTrackerTextTarget
        )
      }
    >
      <option value="title">Tracker Title</option>
      <option value="rowLabel">Row Labels</option>
      <option value="measurementLabel">Measurement Labels</option>
      <option value="targetLabel">Target Labels</option>
      <option value="actualLabel">Actual Labels</option>
      <option value="sessionInfo">Session Information</option>
      <option value="completionStatus">Completion Status</option>
      <option value="buttonText">Button Text</option>
      <option value="historyText">History Text</option>
    </select>
  </div>

  <div>
    <label className={labelClass}>
      Appearance Target
    </label>

    <select
      className={inputClass}
      value={progressTrackerStyleTarget}
      onChange={(e) =>
        setProgressTrackerStyleTarget(
          e.target.value as ProgressTrackerStyleTarget
        )
      }
    >
      <option value="block">Entire Block</option>
      <option value="container">Tracker Container</option>
      <option value="row">Tracker Rows</option>
      <option value="measurementField">Measurement Fields</option>
      <option value="targetField">Target Fields</option>
      <option value="actualField">Actual Fields</option>
      <option value="progressIndicator">Progress Indicator</option>
      <option value="button">Action Buttons</option>
      <option value="historyContainer">History Container</option>
    </select>
  </div>

  <p className="text-xs text-gray-500">
    Select an element above, then use the top toolbar
    to customize its text or appearance.
  </p>
</section>
      {/* GENERAL */}
      <section className={sectionClass}>
        <h3 className="text-sm font-semibold">General</h3>

        <div>
          <label className={labelClass}>Tracker Title</label>
          <input
            type="text"
            className={inputClass}
            value={data.title}
            onChange={(e) =>
              updateData({ title: e.target.value })
            }
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.showHistory}
            onChange={(e) =>
              updateData({ showHistory: e.target.checked })
            }
          />
          Show History
        </label>
      </section>

      {/* IMAGE */}
      <section className={sectionClass}>
        <h3 className="text-sm font-semibold">Image</h3>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.showImage}
            onChange={(e) =>
              updateData({ showImage: e.target.checked })
            }
          />
          Show Image
        </label>

        {data.showImage && (
          <div>
            <label className={labelClass}>Image URL</label>
            <input
              type="url"
              className={inputClass}
              placeholder="https://..."
              value={data.imageUrl ?? ""}
              onChange={(e) =>
                updateData({ imageUrl: e.target.value })
              }
            />
          </div>
        )}
      </section>


{/* ROWS */}
<section className={sectionClass}>
  <div className="flex items-center justify-between gap-2">
    <h3 className="text-sm font-semibold">Rows</h3>

    <button
      type="button"
      className={buttonClass}
      onClick={addRow}
    >
      + Add Row
    </button>
  </div>

  {/* CUSTOMIZABLE COLUMN HEADING */}
  <div>
    <label className={labelClass}>
      Row Column Heading
    </label>

    <input
      type="text"
      className={inputClass}
      placeholder="ROW"
      value={data.rowColumnHeading ?? "ROW"}
      onChange={(e) =>
        updateData({
          rowColumnHeading: e.target.value,
        })
      }
    />
  </div>

  {/* ROW MANAGEMENT */}
  {data.rows.length === 0 && (
    <p className="text-xs text-gray-500">
      No rows configured.
    </p>
  )}

  {data.rows.map((row, index) => (
    <div
      key={row.id}
      className="space-y-2 rounded border p-2"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          className={inputClass}
          value={row.label}
          placeholder="Row label"
          onChange={(e) =>
            updateRow(row.id, {
              label: e.target.value,
            })
          }
        />

        <button
          type="button"
          className={buttonClass}
          disabled={index === 0}
          onClick={() => moveRow(index, -1)}
          title="Move up"
        >
          ↑
        </button>

        <button
          type="button"
          className={buttonClass}
          disabled={index === data.rows.length - 1}
          onClick={() => moveRow(index, 1)}
          title="Move down"
        >
          ↓
        </button>
      </div>

      <button
        type="button"
        className="text-xs text-red-600"
        onClick={() => removeRow(row.id)}
      >
        Remove Row
      </button>
    </div>
  ))}
</section>


      {/* MEASUREMENTS */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Measurements</h3>

          <button
            type="button"
            className={buttonClass}
            onClick={addMeasurement}
          >
            + Add
          </button>
        </div>

        {data.measurements.length === 0 && (
          <p className="text-xs text-gray-500">
            Add a measurement to begin.
          </p>
        )}

        {data.measurements.map((measurement, index) => (
          <div
            key={measurement.id}
            className="space-y-3 rounded-lg border p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">
                Measurement {index + 1}
              </span>

              <div className="flex gap-1">
                <button
                  type="button"
                  className={buttonClass}
                  disabled={index === 0}
                  onClick={() => moveMeasurement(index, -1)}
                >
                  ↑
                </button>

                <button
                  type="button"
                  className={buttonClass}
                  disabled={
                    index === data.measurements.length - 1
                  }
                  onClick={() => moveMeasurement(index, 1)}
                >
                  ↓
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                className={inputClass}
                value={measurement.label}
                onChange={(e) =>
                  updateMeasurement(measurement.id, {
                    label: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className={labelClass}>Unit</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Optional (lbs, km, min...)"
                value={measurement.unit ?? ""}
                onChange={(e) =>
                  updateMeasurement(measurement.id, {
                    unit: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={measurement.visible}
                  onChange={(e) =>
                    updateMeasurement(measurement.id, {
                      visible: e.target.checked,
                    })
                  }
                />
                Visible
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={measurement.targetEnabled}
                  onChange={(e) =>
                    updateMeasurement(measurement.id, {
                      targetEnabled: e.target.checked,
                    })
                  }
                />
                Enable Target Values
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={measurement.actualEnabled}
                  onChange={(e) =>
                    updateMeasurement(measurement.id, {
                      actualEnabled: e.target.checked,
                    })
                  }
                />
                Enable Actual Values
              </label>
              <label className="flex items-center gap-2 text-sm">
  <input
    type="checkbox"
    checked={measurement.presetValues !== false}
    disabled={
      !measurement.targetEnabled ||
      !measurement.actualEnabled
    }
    onChange={(e) =>
      updateMeasurement(measurement.id, {
        presetValues: e.target.checked,
      })
    }
  />
  Preset Values
</label>
            </div>

            {/* TARGET VALUES */}
            {measurement.targetEnabled && (
              <div className="space-y-2 border-t pt-3">
                <h4 className="text-xs font-semibold">
                  Targets by Row
                </h4>

                {data.rows.map((row) => (
                  <label
                    key={row.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {row.label}
                    </span>

                    <input
                      type="number"
                      step="any"
                      className="w-24 rounded border px-2 py-1 text-sm"
                      value={
                        row.targets[measurement.id] ?? ""
                      }
                      onChange={(e) =>
                        updateTarget(
                          row.id,
                          measurement.id,
                          e.target.value
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            )}

            {/* PROGRESSION */}
            <div className="space-y-3 border-t pt-3">
              <h4 className="text-xs font-semibold">
                Automatic Progression
              </h4>

              <div>
                <label className={labelClass}>
                  Progression Mode
                </label>
                <select
                  className={inputClass}
                  value={measurement.progression.mode}
                  onChange={(e) =>
                    updateProgression(measurement, {
                      mode: e.target.value as
                        | "none"
                        | "increase"
                        | "decrease",
                    })
                  }
                >
                  <option value="none">None</option>
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </div>

              {measurement.progression.mode !== "none" && (
                <>
                  <div>
                    <label className={labelClass}>
                      Step Amount
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className={inputClass}
                      value={measurement.progression.step}
                      onChange={(e) =>
                        updateProgression(measurement, {
                          step: Math.max(
                            0,
                            optionalNumber(e.target.value) ?? 0
                          ),
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>
                        Minimum
                      </label>
                      <input
                        type="number"
                        step="any"
                        className={inputClass}
                        value={
                          measurement.progression.min ?? ""
                        }
                        onChange={(e) =>
                          updateProgression(measurement, {
                            min: optionalNumber(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Maximum
                      </label>
                      <input
                        type="number"
                        step="any"
                        className={inputClass}
                        value={
                          measurement.progression.max ?? ""
                        }
                        onChange={(e) =>
                          updateProgression(measurement, {
                            max: optionalNumber(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              className="text-sm text-red-600"
              onClick={() =>
                removeMeasurement(measurement.id)
              }
            >
              Remove Measurement
            </button>
          </div>
        ))}
      </section>

      {/* COMPLETION SETTINGS */}
      <section className={sectionClass}>
        <h3 className="text-sm font-semibold">
          Completion & Progression
        </h3>

        <div>
          <label className={labelClass}>
            When to Apply Progression
          </label>

          <select
            className={inputClass}
            value={data.progressionTrigger}
            onChange={(e) =>
              updateData({
                progressionTrigger: e.target.value as
                  | "completion"
                  | "manual",
              })
            }
          >
            <option value="completion">
              After Overall Completion
            </option>
            <option value="manual">
              Manual Only
            </option>
          </select>
        </div>
      </section>
    </div>
  );
}
