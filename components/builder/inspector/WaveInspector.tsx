"use client";

type WaveInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
};

export function WaveInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
}: WaveInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Wave */}
    <div className={inspectorLabelClass()}>Wave</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Line Color</div>
      <input
        type="color"
        value={selectedBlock.data.lineColor ?? "#C8A97E"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    lineColor: e.target.value,
                  },
                },
          )
        }
        className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Line Thickness</div>
      <input
        type="range"
        min={1}
        max={20}
        step={1}
        value={Number(selectedBlock.data.lineThickness ?? 2)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    lineThickness: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Wave Height</div>
      <input
        type="range"
        min={5}
        max={80}
        step={1}
        value={Number(selectedBlock.data.waveHeight ?? 40)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    waveHeight: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Wave Frequency</div>
      <input
        type="range"
        min={1}
        max={8}
        step={1}
        value={Number(selectedBlock.data.waveFrequency ?? 3)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    waveFrequency: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Opacity</div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round((selectedBlock.data.opacity ?? 1) * 100)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    opacity: Number(e.target.value) / 100,
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.flipVertical)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "wave"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      flipVertical: e.target.checked,
                    },
                  },
            )
          }
        />
        Flip Vertical
      </label>
    </div>
    </div>
  );
}