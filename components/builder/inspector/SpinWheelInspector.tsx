"use client";

/**
 * Spin Wheel inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "spin_wheel"
 */
type SpinWheelInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function SpinWheelInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: SpinWheelInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Spin Wheel */}
    <div className={inspectorLabelClass()}>Spin Wheel</div>

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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Spin Wheel Items</div>
      <textarea
        value={((selectedBlock.data as any).items ?? [])
          .map((item: any) => item.label)
          .join("\n")}
        onChange={(e) => {
const lines = e.target.value.split("\n");

          const colors = [
            "#F97316",
            "#EC4899",
            "#8B5CF6",
            "#111827",
            "#14B8A6",
            "#F59E0B",
          ];

          updateSelectedBlock((block: any) => {
            if (block.type !== "spin_wheel") return block;

            return {
              ...block,
              data: {
                ...block.data,
                items: lines.map((label, index) => {
                  const existingItem = block.data.items?.[index];

                  return {
                    id: existingItem?.id ?? `spinitem_${index}_${Date.now()}`,
                    label: label,
                    description: existingItem?.description ?? "",
                    weight: existingItem?.weight ?? 1,
                    color: existingItem?.color ?? colors[index % colors.length],
                    textColor: existingItem?.textColor ?? "#FFFFFF",
                    icon: existingItem?.icon ?? "gift",
                    prizeType: existingItem?.prizeType ?? "message",
                    prizeValue: existingItem?.prizeValue ?? "",
                    isWinningItem:
                      existingItem?.isWinningItem ?? !label.toLowerCase().includes("try again"),
                  };
                }),
              },
            };
          });
        }}
        className={`${inspectorInputClass()} min-h-[130px] resize-y py-3`}
        placeholder={"10% Off\nFree Entry\nMystery Gift\nTry Again"}
      />

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        Each line creates one wheel segment. Empty lines are ignored.
      </p>
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