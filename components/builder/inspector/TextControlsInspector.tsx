"use client";

/**
 * Text controls inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * showTextControls === true
 */
type TextControlsInspectorProps = {
  selectedBlock: any;
  selectedContext: any;
  selectedTextValue: string;
  selectedTextFxBlock: any;

  updateTextByCanvasId: (blockId: string, value: string) => void;
  updateSelectedBlock: any;
  updateTextFx: (patch: Record<string, any>) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;
};

export function TextControlsInspector({
  selectedBlock,
  selectedContext,
  selectedTextValue,
  selectedTextFxBlock,
  updateTextByCanvasId,
  updateSelectedBlock,
  updateTextFx,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
}: TextControlsInspectorProps) {
  return (
    <>
      {selectedContext.kind === "pageText" ||
      selectedContext.kind === "label" ||
      selectedContext.kind === "textFx" ? (
        <div className={inspectorCardClass()}>
          <div className={inspectorLabelClass()}>Text</div>

          <textarea
            value={selectedTextValue}
            onChange={(e) =>
              updateTextByCanvasId(selectedContext.blockId, e.target.value)
            }
            className={inspectorTextareaClass()}
            placeholder="Enter text..."
          />

          {selectedBlock?.type === "text_fx" ? (
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <div className={inspectorLabelClass()}>
                  Horizontal Position
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedBlock.data.positionX ?? 50}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "text_fx"
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
                <div className={inspectorLabelClass()}>
                  Vertical Position
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedBlock.data.positionY ?? 50}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "text_fx"
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
            </div>
          ) : null}
        </div>
      ) : null}

      {selectedTextFxBlock ? (
        <div className={inspectorCardClass()}>
          <div className={inspectorLabelClass()}>TextFX Controls</div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <div className={inspectorLabelClass()}>Curve</div>
              <input
                type="number"
                min={0}
                max={100}
                value={(selectedTextFxBlock?.data.fx as any)?.intensity ?? 50}
                onChange={(e) =>
                  updateTextFx({
                    intensity: Math.max(
                      0,
                      Math.min(100, Number(e.target.value) || 0),
                    ),
                  })
                }
                className={inspectorInputClass()}
              />
            </div>

            <div>
              <div className={inspectorLabelClass()}>Transform Style</div>

              <select
                value={
                  (selectedTextFxBlock?.data.fx as any)?.transformStyle ??
                  "normal"
                }
                onChange={(e) => {
                  const nextStyle = e.target.value;

                  updateTextFx({
                    transformStyle: nextStyle,
                    ...(nextStyle !== "normal"
                      ? {
                          mode: "straight",
                        }
                      : {}),
                  });
                }}
                className={inspectorInputClass()}
              >
                <option value="normal">Normal</option>
                <option value="wave">Wave</option>
                <option value="rise">Rise</option>
                <option value="dipLetters">Dip Letters</option>
                <option value="stagger">Stagger</option>
                <option value="tiltLeft">Tilt Left</option>
                <option value="tiltRight">Tilt Right</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>

            <div>
              <div className={inspectorLabelClass()}>
                Transform Strength
              </div>

              <input
                type="range"
                min={0}
                max={200}
                value={
                  (selectedTextFxBlock?.data.fx as any)?.transformStrength ??
                  100
                }
                onChange={(e) =>
                  updateTextFx({
                    transformStrength: Math.max(
                      0,
                      Math.min(200, Number(e.target.value) || 0),
                    ),
                  })
                }
                className="mt-2 w-full"
              />

              <div className="mt-1 text-xs text-neutral-500">
                {(selectedTextFxBlock?.data.fx as any)?.transformStrength ??
                  100}
                %
              </div>
            </div>

            <div>
              <div className={inspectorLabelClass()}>Rotate</div>
              <input
                type="number"
                min={-180}
                max={180}
                value={(selectedTextFxBlock?.data.fx as any)?.rotation ?? 0}
                onChange={(e) =>
                  updateTextFx({
                    rotation: Math.max(
                      -180,
                      Math.min(180, Number(e.target.value) || 0),
                    ),
                  })
                }
                className={inspectorInputClass()}
              />
            </div>

            <div>
              <div className={inspectorLabelClass()}>Opacity (%)</div>
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(
                  ((selectedTextFxBlock?.data.fx as any)?.opacity ?? 1) * 100,
                )}
                onChange={(e) =>
                  updateTextFx({
                    opacity:
                      Math.max(
                        0,
                        Math.min(100, Number(e.target.value) || 0),
                      ) / 100,
                  })
                }
                className={inspectorInputClass()}
              />
            </div>

            <div>
              <div className={inspectorLabelClass()}>Letter Width (%)</div>
              <input
                type="number"
                min={50}
                max={200}
                value={Math.round(
                  ((selectedTextFxBlock?.data.fx as any)?.letterScaleX ?? 1) *
                    100,
                )}
                onChange={(e) =>
                  updateTextFx({
                    letterScaleX:
                      Math.max(
                        50,
                        Math.min(200, Number(e.target.value) || 100),
                      ) / 100,
                  })
                }
                className={inspectorInputClass()}
              />
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
              <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={
                    (selectedTextFxBlock?.data.fx as any)?.shadowEnabled ===
                    true
                  }
                  onChange={(e) =>
                    updateTextFx({ shadowEnabled: e.target.checked })
                  }
                />
                Text Shadow
              </label>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className={inspectorLabelClass()}>Shadow Color</div>
                  <input
                    type="color"
                    value={
                      (selectedTextFxBlock?.data.fx as any)?.shadowColor ??
                      "#000000"
                    }
                    onChange={(e) =>
                      updateTextFx({ shadowColor: e.target.value })
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className={inspectorLabelClass()}>Blur</div>
                    <div className="text-xs text-neutral-500">
                      {Math.round(
                        (((selectedTextFxBlock?.data.fx as any)?.shadowBlur ??
                          10) /
                          40) *
                          100,
                      )}
                      %
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={
                      (selectedTextFxBlock?.data.fx as any)?.shadowBlur ?? 10
                    }
                    onChange={(e) =>
                      updateTextFx({
                        shadowBlur: Math.max(
                          0,
                          Math.min(40, Number(e.target.value) || 0),
                        ),
                      })
                    }
                    className="mt-2 w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className={inspectorLabelClass()}>Offset X</div>
                    <div className="text-xs text-neutral-500">
                      {Math.round(
                        ((selectedTextFxBlock?.data.fx as any)
                          ?.shadowOffsetX ?? 0) + 50,
                      )}
                      %
                    </div>
                  </div>

                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={
                      (selectedTextFxBlock?.data.fx as any)?.shadowOffsetX ?? 0
                    }
                    onChange={(e) =>
                      updateTextFx({
                        shadowOffsetX: Number(e.target.value) || 0,
                      })
                    }
                    className="mt-2 w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className={inspectorLabelClass()}>Offset Y</div>
                    <div className="text-xs text-neutral-500">
                      {Math.round(
                        ((selectedTextFxBlock?.data.fx as any)
                          ?.shadowOffsetY ?? 0) + 50,
                      )}
                      %
                    </div>
                  </div>

                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={
                      (selectedTextFxBlock?.data.fx as any)?.shadowOffsetY ?? 0
                    }
                    onChange={(e) =>
                      updateTextFx({
                        shadowOffsetY: Number(e.target.value) || 0,
                      })
                    }
                    className="mt-2 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
              <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={
                    (selectedTextFxBlock?.data.fx as any)?.outlineEnabled ===
                    true
                  }
                  onChange={(e) =>
                    updateTextFx({ outlineEnabled: e.target.checked })
                  }
                />
                Text Outline
              </label>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className={inspectorLabelClass()}>Outline Color</div>
                  <input
                    type="color"
                    value={
                      (selectedTextFxBlock?.data.fx as any)?.outlineColor
                        ? String(
                            (selectedTextFxBlock?.data.fx as any).outlineColor,
                          )
                        : "#000000"
                    }
                    onChange={(e) => {
                      updateTextFx({ outlineColor: e.target.value });
                    }}
                    className={inspectorInputClass()}
                  />
                </div>

                <div>
                  <div className={inspectorLabelClass()}>Width</div>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={Number(
                      (selectedTextFxBlock?.data.fx as any)?.outlineWidth ?? 2,
                    )}
                    onChange={(e) => {
                      updateTextFx({
                        outlineWidth: Math.max(
                          0,
                          Math.min(12, Number(e.target.value) || 0),
                        ),
                      });
                    }}
                    className={inspectorInputClass()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}