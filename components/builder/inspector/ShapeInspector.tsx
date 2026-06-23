"use client";

/**
 * Shape inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "shape"
 */
type ShapeInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function ShapeInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: ShapeInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Shape */}
    <div className={inspectorLabelClass()}>Shape</div>

    <div className="mt-4 grid grid-cols-1 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Horizontal Position</div>
        <input
          type="range"
          min={0}
          max={100}
          value={selectedBlock.data.positionX ?? 50}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      positionX: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.positionX ?? 50}%
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Vertical Position</div>
        <input
          type="range"
          min={0}
          max={100}
          value={selectedBlock.data.positionY ?? 50}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      positionY: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.positionY ?? 50}%
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Scale</div>
        <input
          type="range"
          min={50}
          max={300}
          value={Math.round((selectedBlock.data.scale ?? 1) * 100)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      scale: Number(e.target.value) / 100,
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {Math.round((selectedBlock.data.scale ?? 1) * 100)}%
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Rotation</div>
        <input
          type="range"
          min={-180}
          max={180}
          value={selectedBlock.data.rotation ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      rotation: Number(e.target.value) || 0,
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.rotation ?? 0}°
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Opacity</div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((selectedBlock.data.opacity ?? 1) * 100)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "shape"
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
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {Math.round((selectedBlock.data.opacity ?? 1) * 100)}%
        </div>
      </div>
    </div>

<div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <label className="flex items-center justify-between gap-3">
    <div className={inspectorLabelClass()}>Shadow</div>

    <input
      type="checkbox"
      checked={Boolean((selectedBlock.data as any).shadowEnabled)}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "shape"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  shadowEnabled: e.target.checked,
                },
              },
        )
      }
    />
  </label>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <div className={inspectorLabelClass()}>Blur</div>
          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).shadowBlur ?? 0}px
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={(selectedBlock.data as any).shadowBlur ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      shadowBlur: Number(e.target.value),
                    },
                  },
            )
          }
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Shadow Color</div>

        <input
          type="color"
          value={(selectedBlock.data as any).shadowColor ?? "#000000"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      shadowColor: e.target.value,
                    },
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className={inspectorLabelClass()}>Offset X</div>

          <input
            type="number"
            value={(selectedBlock.data as any).shadowX ?? 0}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "shape"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        shadowX: Number(e.target.value),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Offset Y</div>

          <input
            type="number"
            value={(selectedBlock.data as any).shadowY ?? 0}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "shape"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        shadowY: Number(e.target.value),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Fade Edges</div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {(["top", "bottom", "left", "right"] as const).map((dir) => (
          <label
            key={dir}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800"
          >
            <input
              type="checkbox"
              checked={Boolean(selectedBlock.data.fade?.[dir])}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "shape"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          fade: {
                            ...block.data.fade,
                            [dir]: e.target.checked,
                          },
                        },
                      },
                )
              }
            />
            {dir.charAt(0).toUpperCase() + dir.slice(1)}
          </label>
        ))}
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Fade Size</div>
        <input
          type="range"
          min={0}
          max={50}
          value={selectedBlock.data.fade?.size ?? 15}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      fade: {
                        ...block.data.fade,
                        size: Number(e.target.value),
                      },
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.fade?.size ?? 15}%
        </div>
      </div>
    </div>
    </div>
  );
}