"use client";

import { useEffect, useMemo, useRef } from "react";

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
  updateTextFx: (
  patch: Partial<
    NonNullable<
      Extract<
        import("@/lib/templates/builder").MicrositeBlock,
        { type: "text_fx" }
      >["data"]["fx"]
    >
  >,
) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;
};

function getTextFxCharacters(text: string) {
  return Array.from(text || "");
}

function getLetterColor(
  letterColors: string[] | undefined,
  index: number,
  fallbackColor: string,
) {
  const value = letterColors?.[index];

  return typeof value === "string" && value.trim()
    ? value
    : fallbackColor;
}

function normalizeLetterColors(
  characters: string[],
  currentColors: string[],
  fallbackColor: string,
) {
  return characters.map((_, index) =>
    getLetterColor(currentColors, index, fallbackColor),
  );
}

function arraysMatch(left: string[], right: string[]) {
  if (left.length !== right.length) return false;

  return left.every((value, index) => value === right[index]);
}

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
  const textFxText =
    selectedTextFxBlock?.type === "text_fx"
      ? String(selectedTextFxBlock.data.text ?? "")
      : "";

  const textFxCharacters = useMemo(
    () => getTextFxCharacters(textFxText),
    [textFxText],
  );

  const defaultTextFxColor =
    selectedTextFxBlock?.data.style?.color ?? "#000000";

  const textFxLetterColors = useMemo(() => {
    const value = (selectedTextFxBlock?.data.fx as any)?.letterColors;

    return Array.isArray(value)
      ? value.filter((color): color is string => typeof color === "string")
      : [];
  }, [selectedTextFxBlock]);

  const normalizedLetterColors = useMemo(
    () =>
      normalizeLetterColors(
        textFxCharacters,
        textFxLetterColors,
        defaultTextFxColor,
      ),
    [textFxCharacters, textFxLetterColors, defaultTextFxColor],
  );

  const previousTextRef = useRef(textFxText);

  /*
   * Keep the per-letter color list synchronized whenever characters
   * are added or removed from the TextFX text.
   */
  useEffect(() => {
    if (selectedTextFxBlock?.type !== "text_fx") {
      previousTextRef.current = "";
      return;
    }

    const textChanged = previousTextRef.current !== textFxText;
    previousTextRef.current = textFxText;

    if (!textChanged) return;

    if (!textFxCharacters.length) {
      if (textFxLetterColors.length) {
        updateTextFx({
          letterColors: [],
        });
      }

      return;
    }

    if (!arraysMatch(textFxLetterColors, normalizedLetterColors)) {
      updateTextFx({
        letterColors: normalizedLetterColors,
      });
    }
  }, [
    selectedTextFxBlock,
    textFxText,
    textFxCharacters.length,
    textFxLetterColors,
    normalizedLetterColors,
    updateTextFx,
  ]);

  function handleTextChange(value: string) {
    updateTextByCanvasId(selectedContext.blockId, value);

    if (selectedBlock?.type !== "text_fx") return;

    const nextCharacters = getTextFxCharacters(value);

    const nextColors = normalizeLetterColors(
      nextCharacters,
      textFxLetterColors,
      defaultTextFxColor,
    );

    updateTextFx({
      letterColors: nextColors,
    });
  }

  function updateTextFxLetterColor(index: number, color: string) {
    if (
      index < 0 ||
      index >= textFxCharacters.length ||
      textFxCharacters[index] === " "
    ) {
      return;
    }

    const nextColors = [...normalizedLetterColors];
    nextColors[index] = color;

    updateTextFx({
      letterColors: nextColors,
    });
  }

  function applyOneColorToAllLetters(color: string) {
    updateTextFx({
      letterColors: textFxCharacters.map(() => color),
    });
  }

  function clearTextFxLetterColors() {
    updateTextFx({
      letterColors: [],
    });
  }

  const isEditableTextSelection =
    selectedContext.kind === "pageText" ||
    selectedContext.kind === "label" ||
    selectedContext.kind === "textFx";

  return (
    <>
      {isEditableTextSelection ? (
        <div className={inspectorCardClass()}>
          <div className={inspectorLabelClass()}>Text</div>

          <textarea
            value={selectedTextValue}
            onChange={(event) => handleTextChange(event.target.value)}
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
                  onChange={(event) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "text_fx"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              positionX: Number(event.target.value),
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
                  onChange={(event) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "text_fx"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              positionY: Number(event.target.value),
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
        <>
          <div className={inspectorCardClass()}>
            <div className={inspectorLabelClass()}>TextFX Controls</div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <div className={inspectorLabelClass()}>Curve</div>

                <input
                  type="number"
                  min={0}
                  max={100}
                  value={
                    (selectedTextFxBlock.data.fx as any)?.intensity ?? 0
                  }
                  onChange={(event) =>
                    updateTextFx({
                      intensity: Math.max(
                        0,
                        Math.min(100, Number(event.target.value) || 0),
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
                    (selectedTextFxBlock.data.fx as any)?.transformStyle ??
                    "normal"
                  }
onChange={(e) => {
  const nextStyle = e.target.value as
    | "normal"
    | "wave"
    | "rise"
    | "dipLetters"
    | "stagger"
    | "tiltLeft"
    | "tiltRight"
    | "bounce";

  updateTextFx({
    transformStyle: nextStyle,
    ...(nextStyle !== "normal"
      ? {
          mode: "straight" as const,
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
                    (selectedTextFxBlock.data.fx as any)?.transformStrength ??
                    100
                  }
                  onChange={(event) =>
                    updateTextFx({
                      transformStrength: Math.max(
                        0,
                        Math.min(200, Number(event.target.value) || 0),
                      ),
                    })
                  }
                  className="mt-2 w-full"
                />

                <div className="mt-1 text-xs text-neutral-500">
                  {(selectedTextFxBlock.data.fx as any)?.transformStrength ??
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
                  value={
                    (selectedTextFxBlock.data.fx as any)?.rotation ?? 0
                  }
                  onChange={(event) =>
                    updateTextFx({
                      rotation: Math.max(
                        -180,
                        Math.min(180, Number(event.target.value) || 0),
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
                    ((selectedTextFxBlock.data.fx as any)?.opacity ?? 1) * 100,
                  )}
                  onChange={(event) =>
                    updateTextFx({
                      opacity:
                        Math.max(
                          0,
                          Math.min(100, Number(event.target.value) || 0),
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
                    ((selectedTextFxBlock.data.fx as any)?.letterScaleX ?? 1) *
                      100,
                  )}
                  onChange={(event) =>
                    updateTextFx({
                      letterScaleX:
                        Math.max(
                          50,
                          Math.min(200, Number(event.target.value) || 100),
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
                      (selectedTextFxBlock.data.fx as any)?.shadowEnabled ===
                      true
                    }
                    onChange={(event) =>
                      updateTextFx({
                        shadowEnabled: event.target.checked,
                      })
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
                        (selectedTextFxBlock.data.fx as any)?.shadowColor ??
                        "#000000"
                      }
                      onChange={(event) =>
                        updateTextFx({
                          shadowColor: event.target.value,
                        })
                      }
                      className={inspectorInputClass()}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className={inspectorLabelClass()}>Blur</div>

                      <div className="text-xs text-neutral-500">
                        {Math.round(
                          (((selectedTextFxBlock.data.fx as any)?.shadowBlur ??
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
                        (selectedTextFxBlock.data.fx as any)?.shadowBlur ?? 10
                      }
                      onChange={(event) =>
                        updateTextFx({
                          shadowBlur: Math.max(
                            0,
                            Math.min(40, Number(event.target.value) || 0),
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
                          ((selectedTextFxBlock.data.fx as any)
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
                        (selectedTextFxBlock.data.fx as any)?.shadowOffsetX ??
                        0
                      }
                      onChange={(event) =>
                        updateTextFx({
                          shadowOffsetX: Number(event.target.value) || 0,
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
                          ((selectedTextFxBlock.data.fx as any)
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
                        (selectedTextFxBlock.data.fx as any)?.shadowOffsetY ??
                        0
                      }
                      onChange={(event) =>
                        updateTextFx({
                          shadowOffsetY: Number(event.target.value) || 0,
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
                      (selectedTextFxBlock.data.fx as any)?.outlineEnabled ===
                      true
                    }
                    onChange={(event) =>
                      updateTextFx({
                        outlineEnabled: event.target.checked,
                      })
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
                        (selectedTextFxBlock.data.fx as any)?.outlineColor
                          ? String(
                              (selectedTextFxBlock.data.fx as any)
                                .outlineColor,
                            )
                          : "#000000"
                      }
                      onChange={(event) =>
                        updateTextFx({
                          outlineColor: event.target.value,
                        })
                      }
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
                        (selectedTextFxBlock.data.fx as any)?.outlineWidth ?? 2,
                      )}
                      onChange={(event) =>
                        updateTextFx({
                          outlineWidth: Math.max(
                            0,
                            Math.min(12, Number(event.target.value) || 0),
                          ),
                        })
                      }
                      className={inspectorInputClass()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={inspectorCardClass()}>
            <div className={inspectorLabelClass()}>Per-Letter Colors</div>

            <div className="mt-2 text-sm text-neutral-600">
              Assign a separate color to each visible character.
            </div>

            {textFxCharacters.length ? (
              <>
                <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className={inspectorLabelClass()}>
                        Apply Color to All
                      </div>

                      <div className="mt-1 text-xs text-neutral-500">
                        This replaces all individual character colors.
                      </div>
                    </div>

                    <input
                      type="color"
                      value={defaultTextFxColor}
                      onChange={(event) =>
                        applyOneColorToAllLetters(event.target.value)
                      }
                      className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
                      title="Apply one color to all characters"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={clearTextFxLetterColors}
                    className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Reset to Main Text Color
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {textFxCharacters.map((character, index) => {
                    const isSpace = character === " ";
                    const isLineBreak =
                      character === "\n" || character === "\r";

                    const characterColor = getLetterColor(
                      normalizedLetterColors,
                      index,
                      defaultTextFxColor,
                    );

                    const characterLabel = isSpace
                      ? "Space"
                      : isLineBreak
                        ? "Line break"
                        : character;

                    const canChooseColor = !isSpace && !isLineBreak;

                    return (
                      <div
                        key={`${character}-${index}`}
                        className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className={inspectorLabelClass()}>
                              Character {index + 1}
                            </div>

                            <div
                              className="mt-2 flex h-10 min-w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-2 text-lg font-semibold"
                              style={{
                                color: characterColor,
                              }}
                            >
                              {characterLabel}
                            </div>
                          </div>

                          <input
                            type="color"
                            value={characterColor}
                            onChange={(event) =>
                              updateTextFxLetterColor(
                                index,
                                event.target.value,
                              )
                            }
                            disabled={!canChooseColor}
                            className={[
                              "h-10 w-12 rounded-lg border border-neutral-300 bg-white p-1",
                              canChooseColor
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-40",
                            ].join(" ")}
                            title={
                              canChooseColor
                                ? `Color for character ${index + 1}`
                                : `${characterLabel} does not display a color`
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
                Enter TextFX text to configure individual letter colors.
              </div>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}