"use client";

/**
 * Label inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "label"
 */
type LabelInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LabelInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LabelInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Label</div>

      {/* ============================================================ */}
      {/* LABEL TEXT */}
      {/* ============================================================ */}

<div className="mt-4">
  <div className={inspectorLabelClass()}>Text</div>

  <textarea
    value={selectedBlock.data.text ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "label"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                text: e.target.value,
              },
            },
      )
    }
    rows={4}
    className={[
      inspectorInputClass(),
      "min-h-[110px] resize-y py-3",
    ].join(" ")}
    placeholder="Enter label text..."
  />
</div>

      {/* ============================================================ */}
      {/* POSITION */}
      {/* ============================================================ */}

      <div className="mt-6">
        <div className={inspectorLabelClass()}>Label Position</div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Horizontal Position</div>

        <input
          type="range"
          min={0}
          max={100}
          value={(selectedBlock.data as any).positionX ?? 50}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "label"
                ? block
                : {
                    ...block,
                    data: {
                      ...(block.data as any),
                      positionX: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />

        <div className="mt-1 text-xs text-neutral-500">
          {(selectedBlock.data as any).positionX ?? 50}%
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Vertical Position</div>

        <input
          type="range"
          min={0}
          max={100}
          value={(selectedBlock.data as any).positionY ?? 50}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "label"
                ? block
                : {
                    ...block,
                    data: {
                      ...(block.data as any),
                      positionY: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />

        <div className="mt-1 text-xs text-neutral-500">
          {(selectedBlock.data as any).positionY ?? 50}%
        </div>
      </div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Rotation
  </div>

  <input
    type="range"
    min={-180}
    max={180}
    step={1}
    value={
      (selectedBlock.data as any).rotation ??
      0
    }
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "label"
          ? block
          : {
              ...block,
              data: {
                ...(block.data as any),
                rotation: Number(e.target.value),
              },
            },
      )
    }
    className="mt-2 w-full"
  />

  <div className="mt-1 text-xs text-neutral-500">
    {(selectedBlock.data as any).rotation ?? 0}°
  </div>
</div>


      {/* ============================================================ */}
      {/* FADE EDGES */}
      {/* ============================================================ */}

      <div className="mt-6">
        <div className={inspectorLabelClass()}>Fade Edges</div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {(
            [
              ["top", "Top"],
              ["bottom", "Bottom"],
              ["left", "Left"],
              ["right", "Right"],
            ] as [string, string][]
          ).map(([edge, label]) => (
            <label
              key={edge}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800"
            >
              <input
                type="checkbox"
                checked={Boolean((selectedBlock.data as any).fade?.[edge])}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "label"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...(block.data as any),

                            fade: {
                              ...((block.data as any).fade ?? {}),

                              [edge]: e.target.checked,

                              size:
                                (block.data as any).fade?.size ?? 15,
                            },
                          },
                        },
                  )
                }
              />

              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Fade Size</div>

        <input
          type="range"
          min={0}
          max={50}
          value={(selectedBlock.data as any).fade?.size ?? 15}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "label"
                ? block
                : {
                    ...block,

                    data: {
                      ...(block.data as any),

                      fade: {
                        ...((block.data as any).fade ?? {}),

                        size:
                          Number(e.target.value),
                      },
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />

        <div className="mt-1 text-xs text-neutral-500">
          {(selectedBlock.data as any).fade?.size ?? 15}%
        </div>
      </div>
    </div>
  );
}