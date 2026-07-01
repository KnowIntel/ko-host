"use client";

/**
 * Spin Wheel inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "spin_wheel"
 */
import type { Dispatch, SetStateAction } from "react";
import type {
  SpinWheelStyleTarget,
  SpinWheelTextTarget,
} from "@/components/builder/formatting/spinWheelFormatting";

type SpinWheelInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  spinWheelTextTarget: SpinWheelTextTarget;
  setSpinWheelTextTarget: Dispatch<SetStateAction<SpinWheelTextTarget>>;

  spinWheelStyleTarget: SpinWheelStyleTarget;
  setSpinWheelStyleTarget: Dispatch<SetStateAction<SpinWheelStyleTarget>>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function SpinWheelInspector({
  selectedBlock,
  updateSelectedBlock,

  spinWheelTextTarget,
  setSpinWheelTextTarget,

  spinWheelStyleTarget,
  setSpinWheelStyleTarget,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
}: SpinWheelInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Spin Wheel */}
    <div className={inspectorLabelClass()}>Spin Wheel</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>

    <select
      value={spinWheelTextTarget}
      onChange={(e) =>
        setSpinWheelTextTarget(e.target.value as SpinWheelTextTarget)
      }
      className={inspectorInputClass()}
    >
      <option value="title">Title</option>
      <option value="subtitle">Subtitle</option>
      <option value="items">Spin Wheel Items</option>
      <option value="buttonText">Button Text</option>
      <option value="winnerMessage">Winner Message</option>
      <option value="loserMessage">Loser Message</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Style Target</div>

    <select
      value={spinWheelStyleTarget}
      onChange={(e) =>
        setSpinWheelStyleTarget(e.target.value as SpinWheelStyleTarget)
      }
      className={inspectorInputClass()}
    >
      <option value="button">Button</option>
      <option value="block">Block</option>
    </select>
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Title</div>
      <input
        type="text"
        value={(selectedBlock.data as any).title ?? ""}
        onChange={(e) => {
          const nextTitle = e.target.value;

          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
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
        placeholder="Spin to Win"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <input
        type="text"
        value={(selectedBlock.data as any).subtitle ?? ""}
        onChange={(e) => {
          const nextSubtitle = e.target.value;

          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtitle: nextSubtitle,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="Unlock a surprise reward"
      />
    </div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Spin Wheel Items</div>

    <button
      type="button"
      onClick={() => {
        const items = (((selectedBlock.data as any).items ?? []) as any[]);
        const colors = ["#F97316", "#EC4899", "#8B5CF6", "#111827", "#14B8A6", "#F59E0B"];
        const nextIndex = items.length;

        updateSelectedBlock((block: any) =>
          block.type !== "spin_wheel"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  items: [
                    ...items,
                    {
                      id: `spinitem_${Date.now()}`,
                      label: `Item ${nextIndex + 1}`,
                      description: "",
                      weight: 1,
                      color: colors[nextIndex % colors.length],
                      textColor: "#FFFFFF",
                      icon: "gift",
                      prizeType: "message",
                      prizeValue: "",
                      isWinningItem: true,
                    },
                  ],
                },
              },
        );
      }}
      className={toolSetButtonClass("front")}
    >
      Add
    </button>
  </div>

  <div className="mt-3 space-y-3">
    {(((selectedBlock.data as any).items ?? []) as any[]).map(
      (item: any, index: number) => (
        <div
          key={item.id}
          className="rounded-xl border border-neutral-200 bg-white p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-sm font-semibold text-neutral-800">
              Item {index + 1}
            </div>

            <button
              type="button"
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "spin_wheel"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: (((block.data as any).items ?? []) as any[]).filter(
                            (entry: any) => entry.id !== item.id,
                          ),
                        },
                      },
                )
              }
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Remove
            </button>
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Label</div>
            <input
              type="text"
              value={item.label ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "spin_wheel"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: (((block.data as any).items ?? []) as any[]).map(
                            (entry: any) =>
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
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className={inspectorLabelClass()}>Segment Color</div>
              <input
                type="color"
                value={item.color ?? "#F97316"}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "spin_wheel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: (((block.data as any).items ?? []) as any[]).map(
                              (entry: any) =>
                                entry.id === item.id
                                  ? { ...entry, color: e.target.value }
                                  : entry,
                            ),
                          },
                        },
                  )
                }
                className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
              />
            </div>

            <div>
              <div className={inspectorLabelClass()}>Text Color</div>
              <input
                type="color"
                value={item.textColor ?? "#FFFFFF"}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "spin_wheel"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: (((block.data as any).items ?? []) as any[]).map(
                              (entry: any) =>
                                entry.id === item.id
                                  ? { ...entry, textColor: e.target.value }
                                  : entry,
                            ),
                          },
                        },
                  )
                }
                className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Weight</div>
            <input
              type="number"
              min={1}
              max={100}
              value={item.weight ?? 1}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "spin_wheel"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: (((block.data as any).items ?? []) as any[]).map(
                            (entry: any) =>
                              entry.id === item.id
                                ? {
                                    ...entry,
                                    weight: Math.max(1, Number(e.target.value) || 1),
                                  }
                                : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={item.isWinningItem !== false}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "spin_wheel"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: (((block.data as any).items ?? []) as any[]).map(
                            (entry: any) =>
                              entry.id === item.id
                                ? { ...entry, isWinningItem: e.target.checked }
                                : entry,
                          ),
                        },
                      },
                )
              }
            />
            Winning item
          </label>
        </div>
      ),
    )}
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Button Text</div>
      <input
        type="text"
        value={(selectedBlock.data as any).buttonText ?? ""}
        onChange={(e) => {
          const nextButtonText = e.target.value;

          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    buttonText: nextButtonText,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="Spin Now"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Winner Message</div>
      <input
        type="text"
        value={(selectedBlock.data as any).winnerMessage ?? ""}
        onChange={(e) => {
          const nextWinnerMessage = e.target.value;

          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    winnerMessage: nextWinnerMessage,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="You won!"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Loser Message</div>
      <input
        type="text"
        value={(selectedBlock.data as any).loserMessage ?? ""}
        onChange={(e) => {
          const nextLoserMessage = e.target.value;

          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    loserMessage: nextLoserMessage,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="Try again next time"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Wheel Style</div>
      <select
        value={(selectedBlock.data as any).wheelStyle ?? "premium"}
        onChange={(e) => {
          const nextWheelStyle = e.target.value as
            | "classic"
            | "premium"
            | "game_show"
            | "neon"
            | "minimal"
            | "luxury";

          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    wheelStyle: nextWheelStyle,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
      >
        <option value="premium">Premium</option>
        <option value="classic">Classic</option>
        <option value="game_show">Game Show</option>
        <option value="neon">Neon</option>
        <option value="minimal">Minimal</option>
        <option value="luxury">Luxury</option>
      </select>
    </div>

    <label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={(selectedBlock.data as any).allowMultipleSpins === true}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    allowMultipleSpins: e.target.checked,
                  },
                },
          )
        }
      />
      Allow Multiple Spins
    </label>

    <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={(selectedBlock.data as any).showConfetti !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showConfetti: e.target.checked,
                  },
                },
          )
        }
      />
      Show Confetti
    </label>

    <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={(selectedBlock.data as any).showSound !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showSound: e.target.checked,
                  },
                },
          )
        }
      />
      Show Sound
    </label>
    </div>
  );
}