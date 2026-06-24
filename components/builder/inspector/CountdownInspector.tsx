"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";

type CountdownStyleTarget =
  | "background"
  | "tiles"
  | "values"
  | "units"
  | "heading";

type CountdownInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  countdownStyleTarget: CountdownStyleTarget;
  setCountdownStyleTarget: Dispatch<SetStateAction<CountdownStyleTarget>>;

  countdownTargetInputRef: RefObject<HTMLInputElement | null>;
  countdownHeadingInputRef: RefObject<HTMLInputElement | null>;
  countdownCompletedInputRef: RefObject<HTMLInputElement | null>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function CountdownInspector({
  selectedBlock,
  updateSelectedBlock,
  countdownStyleTarget,
  setCountdownStyleTarget,
  countdownTargetInputRef,
  countdownHeadingInputRef,
  countdownCompletedInputRef,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: CountdownInspectorProps) {
  return (
    <div id="inspector-countdown" className={inspectorCardClass()}>
      {/* Countdown */}
    <div className={inspectorLabelClass()}>Countdown</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Variant</div>

      <select
        value={
          selectedBlock.data.styleVariant === "stage" ||
          selectedBlock.data.styleVariant === "standard"
            ? selectedBlock.data.styleVariant
            : "cards"
        }
        onChange={(e) => {
          const nextStyleVariant = e.target.value as
            | "cards"
            | "stage"
            | "standard";

          updateSelectedBlock((block: any) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    styleVariant: nextStyleVariant,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
      >
        <option value="cards">Cards</option>
        <option value="stage">Stage</option>
        <option value="standard">Standard</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Animation Style</div>
<select
  value={
    ((selectedBlock.data as any).animationStyle ?? "none") === "slide"
      ? "bounce"
      : ((selectedBlock.data as any).animationStyle ?? "none")
  }
  onChange={(e) =>
    updateSelectedBlock((block: any) =>
      block.type !== "countdown"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              animationStyle: e.target.value as
                | "none"
                | "pulse"
                | "flip"
                | "bounce",
            },
          },
    )
  }
  className={inspectorInputClass()}
>
  <option value="none">None</option>
  <option value="pulse">Pulse</option>
  <option value="flip">Flip</option>
  <option value="bounce">Bounce</option>
</select>
    </div>

        <div className="mt-4">
      <div className={inspectorLabelClass()}>Target Date</div>
      <input
        ref={countdownTargetInputRef}
        type="datetime-local"
        value={selectedBlock.data.targetIso || ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    targetIso: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Countdown Style Target
      </div>

      <select
        value={countdownStyleTarget}
        onChange={(e) =>
          setCountdownStyleTarget(
            e.target.value as CountdownStyleTarget,
          )
        }
        className={inspectorInputClass()}
      >
        <option value="background">Background</option>

        {(((selectedBlock.data as any).styleVariant ?? "cards") === "cards" ||
          ((selectedBlock.data as any).styleVariant ?? "cards") === "hero" ||
          ((selectedBlock.data as any).styleVariant ?? "cards") === "default") ? (
          <option value="tiles">Tiles</option>
        ) : null}

        <option value="values">Values</option>

        <option value="units">Units</option>

        <option value="heading">Heading</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Alignment</div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {(["left", "center", "right"] as const).map((alignment) => {
          const active =
            (((selectedBlock.data as any).alignment ?? "center") as string) ===
            alignment;

          return (
            <button
              key={alignment}
              type="button"
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "countdown"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          alignment,
                        },
                      },
                )
              }
              className={[
                "rounded-lg border px-3 py-2 text-xs font-medium transition",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
            </button>
          );
        })}
      </div>
    </div>

        <div className="mt-4">
      <div className={inspectorLabelClass()}>Spacing Between Values</div>

      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={80}
          step={1}
          value={Number((selectedBlock.data as any).spacing ?? 12)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "countdown"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      spacing: Number(e.target.value),
                    },
                  },
            )
          }
          className="w-full"
        />

        <div className="w-12 text-right text-xs text-neutral-500">
          {Number((selectedBlock.data as any).spacing ?? 12)}px
        </div>
      </div>
    </div>

        {((selectedBlock.data as any).styleVariant ?? "cards") === "stage" ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>Stage Value/Unit Spacing</div>

        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={-40}
            max={20}
            step={1}
            value={Number((selectedBlock.data as any).stageUnitGap ?? -24)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "countdown"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        stageUnitGap: Number(e.target.value),
                      },
                    },
              )
            }
            className="w-full"
          />

          <div className="w-12 text-right text-xs text-neutral-500">
            {Number((selectedBlock.data as any).stageUnitGap ?? -24)}px
          </div>
        </div>
      </div>
    ) : null}

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showRings !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "countdown"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showRings: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Rings
      </label>
    </div>

        {(["cards", "hero"] as const).includes(
      ((selectedBlock.data as any).styleVariant ?? "cards") as any,
    ) ? (
      <div className="mt-3">
        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={(selectedBlock.data as any).showSeparator !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "countdown"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showSeparator: e.target.checked,
                      },
                    },
              )
            }
          />
          Show Separator
        </label>
      </div>
    ) : null}

    <div className="mt-4 space-y-2">
  <div className={inspectorLabelClass()}>Visible Units</div>

  {[
    ["showDays", "Show Days"],
    ["showHours", "Show Hours"],
    ["showMinutes", "Show Minutes"],
    ["showSeconds", "Show Seconds"],
    ["showSeparator", "Show Separator"],
  ].map(([key, label]) => (
    <label
      key={key}
      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800"
    >
      <input
        type="checkbox"
        checked={(selectedBlock.data as any)[key] !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "countdown"
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
      />
      {label}
    </label>
  ))}
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading (optional)</div>
      <input
        ref={countdownHeadingInputRef}
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "countdown"
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Target Date</div>
      <input
        ref={countdownTargetInputRef}
        type="datetime-local"
        value={selectedBlock.data.targetIso || ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    targetIso: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Completed Message</div>
      <input
        ref={countdownCompletedInputRef}
        type="text"
        value={selectedBlock.data.completedMessage}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    completedMessage: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
    </div>
  );
}