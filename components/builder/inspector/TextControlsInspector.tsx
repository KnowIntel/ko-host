"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

type TextFxCharacterEntry = {
  character: string;
  colorIndex: number;
  displayIndex: number;
};

function normalizeTextFxText(
  text: string,
) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/*
 * letterColors follows the exact same indexing model as renderTextFx:
 *
 * - regular characters consume a color slot
 * - spaces consume a color slot
 * - newline characters DO NOT consume a color slot
 */
function getTextFxColorCharacters(
  text: string,
) {
  return Array.from(
    normalizeTextFxText(text),
  ).filter(
    (character) =>
      character !== "\n",
  );
}

/*
 * UI entries exclude spaces and line breaks entirely.
 *
 * colorIndex remains the actual index inside letterColors, so hiding
 * spaces does not shift any saved color assignments.
 */
function getVisibleTextFxCharacterEntries(
  text: string,
): TextFxCharacterEntry[] {
  const normalized =
    normalizeTextFxText(text);

  const entries:
    TextFxCharacterEntry[] = [];

  let colorIndex = 0;
  let displayIndex = 0;

  Array.from(normalized).forEach(
    (character) => {
      if (character === "\n") {
        return;
      }

      if (character !== " ") {
        entries.push({
          character,
          colorIndex,
          displayIndex,
        });

        displayIndex += 1;
      }

      /*
       * Spaces still advance the saved-color index because the
       * renderer also counts them.
       */
      colorIndex += 1;
    },
  );

  return entries;
}

function getLetterColor(
  letterColors:
    | unknown[]
    | undefined,

  index: number,

  fallbackColor: string,
) {
  const value =
    letterColors?.[index];

  return typeof value === "string" &&
    value.trim()
    ? value
    : fallbackColor;
}

function normalizeLetterColors(
  characters: string[],

  currentColors:
    | unknown[],

  fallbackColor: string,
) {
  return characters.map(
    (_, index) =>
      getLetterColor(
        currentColors,
        index,
        fallbackColor,
      ),
  );
}

function arraysMatch(
  left: string[],
  right: string[],
) {
  if (
    left.length !== right.length
  ) {
    return false;
  }

  return left.every(
    (value, index) =>
      value === right[index],
  );
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

const textFxColorCharacters =
  useMemo(
    () =>
      getTextFxColorCharacters(
        textFxText,
      ),
    [textFxText],
  );

const visibleTextFxCharacters =
  useMemo(
    () =>
      getVisibleTextFxCharacterEntries(
        textFxText,
      ),
    [textFxText],
  );

const defaultTextFxColor =
  selectedTextFxBlock?.data.style?.color ??
  "#000000";

/*
 * IMPORTANT:
 * Do not filter this array.
 *
 * letterColors is positional data. Removing an invalid/empty entry
 * would shift every character after it onto the wrong color.
 */
const textFxLetterColors =
  useMemo(() => {
    const value =
      (
        selectedTextFxBlock?.data
          .fx as any
      )?.letterColors;

    return Array.isArray(value)
      ? value
      : [];
  }, [selectedTextFxBlock]);

const normalizedLetterColors =
  useMemo(
    () =>
      normalizeLetterColors(
        textFxColorCharacters,
        textFxLetterColors,
        defaultTextFxColor,
      ),
    [
      textFxColorCharacters,
      textFxLetterColors,
      defaultTextFxColor,
    ],
  );

/*
 * Selected entries are actual letterColors indexes rather than
 * display positions. Therefore hidden spaces cannot break selection.
 */
const [
  selectedLetterColorIndexes,
  setSelectedLetterColorIndexes,
] = useState<number[]>([]);

const [
  selectedLetterColor,
  setSelectedLetterColor,
] = useState(
  defaultTextFxColor,
);

const isLetterColorDraggingRef =
  useRef(false);

const letterColorDragModeRef =
  useRef<"add" | "remove">(
    "add",
  );

const previousTextRef =
  useRef(textFxText);

/*
 * Keep letterColors synchronized to the renderer's character model.
 *
 * Newlines do not consume slots.
 * Spaces do consume slots, but they remain hidden in the editor UI.
 */
useEffect(() => {
  if (
    selectedTextFxBlock?.type !==
    "text_fx"
  ) {
    previousTextRef.current =
      "";

    setSelectedLetterColorIndexes(
      [],
    );

    return;
  }

  const textChanged =
    previousTextRef.current !==
    textFxText;

  previousTextRef.current =
    textFxText;

  if (!textChanged) {
    return;
  }

  if (
    !textFxColorCharacters.length
  ) {
    if (
      textFxLetterColors.length
    ) {
      updateTextFx({
        letterColors: [],
      });
    }

    setSelectedLetterColorIndexes(
      [],
    );

    return;
  }

  if (
    !arraysMatch(
      textFxLetterColors.map(
        (value, index) =>
          getLetterColor(
            textFxLetterColors,
            index,
            defaultTextFxColor,
          ),
      ),

      normalizedLetterColors,
    )
  ) {
    updateTextFx({
      letterColors:
        normalizedLetterColors,
    });
  }

  /*
   * Remove selections that no longer exist after editing the text.
   */
  setSelectedLetterColorIndexes(
    (current) =>
      current.filter(
        (index) =>
          index >= 0 &&
          index <
            textFxColorCharacters.length &&
          textFxColorCharacters[index] !==
            " ",
      ),
  );
}, [
  selectedTextFxBlock,
  textFxText,
  textFxColorCharacters,
  textFxLetterColors,
  normalizedLetterColors,
  defaultTextFxColor,
  updateTextFx,
]);

useEffect(() => {
  function stopLetterColorDrag() {
    isLetterColorDraggingRef.current =
      false;
  }

  window.addEventListener(
    "mouseup",
    stopLetterColorDrag,
  );

  window.addEventListener(
    "pointerup",
    stopLetterColorDrag,
  );

  return () => {
    window.removeEventListener(
      "mouseup",
      stopLetterColorDrag,
    );

    window.removeEventListener(
      "pointerup",
      stopLetterColorDrag,
    );
  };
}, []);

function handleTextChange(
  value: string,
) {
  updateTextByCanvasId(
    selectedContext.blockId,
    value,
  );

  if (
    selectedBlock?.type !==
    "text_fx"
  ) {
    return;
  }

  const nextCharacters =
    getTextFxColorCharacters(
      value,
    );

  const nextColors =
    normalizeLetterColors(
      nextCharacters,
      textFxLetterColors,
      defaultTextFxColor,
    );

  updateTextFx({
    letterColors:
      nextColors,
  });
}

function setLetterSelectionState(
  colorIndex: number,
  shouldSelect: boolean,
) {
  setSelectedLetterColorIndexes(
    (current) => {
      const next =
        new Set(current);

      if (shouldSelect) {
        next.add(
          colorIndex,
        );
      } else {
        next.delete(
          colorIndex,
        );
      }

      return Array.from(
        next,
      ).sort(
        (a, b) => a - b,
      );
    },
  );
}

function handleLetterPointerDown(
  colorIndex: number,
) {
  const alreadySelected =
    selectedLetterColorIndexes.includes(
      colorIndex,
    );

  const nextMode:
    | "add"
    | "remove" =
    alreadySelected
      ? "remove"
      : "add";

  letterColorDragModeRef.current =
    nextMode;

  isLetterColorDraggingRef.current =
    true;

  setLetterSelectionState(
    colorIndex,
    nextMode === "add",
  );
}

function handleLetterPointerEnter(
  colorIndex: number,
) {
  if (
    !isLetterColorDraggingRef.current
  ) {
    return;
  }

  setLetterSelectionState(
    colorIndex,
    letterColorDragModeRef.current ===
      "add",
  );
}

function applyColorToSelectedLetters(
  color: string,
) {
  setSelectedLetterColor(
    color,
  );

  if (
    !selectedLetterColorIndexes.length
  ) {
    return;
  }

  const nextColors = [
    ...normalizedLetterColors,
  ];

  selectedLetterColorIndexes.forEach(
    (colorIndex) => {
      if (
        colorIndex >= 0 &&
        colorIndex <
          nextColors.length &&
        textFxColorCharacters[
          colorIndex
        ] !== " "
      ) {
        nextColors[
          colorIndex
        ] = color;
      }
    },
  );

  updateTextFx({
    letterColors:
      nextColors,
  });
}

function selectAllVisibleLetters() {
  setSelectedLetterColorIndexes(
    visibleTextFxCharacters.map(
      (entry) =>
        entry.colorIndex,
    ),
  );
}

function clearLetterSelection() {
  setSelectedLetterColorIndexes(
    [],
  );
}

function applyOneColorToAllLetters(
  color: string,
) {
  setSelectedLetterColor(
    color,
  );

  /*
   * Preserve spaces in their correct slots even though they are
   * hidden from the character editor.
   */
  updateTextFx({
    letterColors:
      textFxColorCharacters.map(
        () => color,
      ),
  });
}

function clearTextFxLetterColors() {
  updateTextFx({
    letterColors: [],
  });

  setSelectedLetterColorIndexes(
    [],
  );

  setSelectedLetterColor(
    defaultTextFxColor,
  );
}

  const isEditableTextSelection =
    selectedContext.kind === "pageText" ||
    selectedContext.kind === "label" ||
    selectedContext.kind === "textFx";

  return (
    <>
      {isEditableTextSelection ? (
<div className={inspectorCardClass()}>
  <div className={inspectorLabelClass()}>
    Character Colors
  </div>

  <div className="mt-2 text-sm text-neutral-600">
    Click or drag across letters to select them, then choose one color for the
    entire selection.
  </div>

  {visibleTextFxCharacters.length > 0 ? (
    <>
      {/* ============================================================ */}
      {/* CHARACTER PICKER */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={inspectorLabelClass()}>
              Select Letters
            </div>

            <div className="mt-1 text-xs text-neutral-500">
              Spaces are hidden automatically.
            </div>
          </div>

          <div className="text-xs font-medium text-neutral-500">
            {selectedLetterColorIndexes.length} selected
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTextFxCharacters.map((entry) => {
            const isSelected =
              selectedLetterColorIndexes.includes(
                entry.colorIndex,
              );

            const characterColor =
              getLetterColor(
                normalizedLetterColors,
                entry.colorIndex,
                defaultTextFxColor,
              );

            return (
              <button
                key={`${entry.colorIndex}-${entry.displayIndex}`}
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();

                  handleLetterPointerDown(
                    entry.colorIndex,
                  );
                }}
                onPointerEnter={() => {
                  handleLetterPointerEnter(
                    entry.colorIndex,
                  );
                }}
                className={[
                  "relative flex h-10 min-w-9 select-none items-center justify-center rounded-lg border px-2 text-base font-semibold transition",
                  isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                    : "border-neutral-200 bg-white hover:border-neutral-400",
                ].join(" ")}
                title={`Character ${
                  entry.displayIndex + 1
                }: ${entry.character}`}
              >
                <span
                  style={{
                    color: isSelected
                      ? undefined
                      : characterColor,
                  }}
                >
                  {entry.character}
                </span>

                <span
                  className="absolute bottom-1 left-1 right-1 h-1 rounded-full"
                  style={{
                    backgroundColor:
                      characterColor,
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllVisibleLetters}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Select All
          </button>

          <button
            type="button"
            onClick={clearLetterSelection}
            disabled={
              selectedLetterColorIndexes.length ===
              0
            }
            className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SELECTION COLOR */}
      {/* ============================================================ */}

      <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className={inspectorLabelClass()}>
              Selection Color
            </div>

            <div className="mt-1 text-xs text-neutral-500">
              {selectedLetterColorIndexes.length > 0
                ? `Apply to ${selectedLetterColorIndexes.length} selected ${
                    selectedLetterColorIndexes.length ===
                    1
                      ? "letter"
                      : "letters"
                  }.`
                : "Select one or more letters first."}
            </div>
          </div>

          <input
            type="color"
            value={selectedLetterColor}
            disabled={
              selectedLetterColorIndexes.length ===
              0
            }
            onChange={(event) => {
              applyColorToSelectedLetters(
                event.target.value,
              );
            }}
            className={[
              "h-11 w-16 rounded-xl border border-neutral-300 bg-white p-1",
              selectedLetterColorIndexes.length > 0
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-40",
            ].join(" ")}
            title="Apply color to selected letters"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* QUICK ACTIONS */}
      {/* ============================================================ */}

      <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>
          Quick Actions
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-neutral-800">
              One Color for All
            </div>

            <div className="mt-1 text-xs text-neutral-500">
              Replace all individual character colors.
            </div>
          </div>

          <input
            type="color"
            value={defaultTextFxColor}
            onChange={(event) => {
              applyOneColorToAllLetters(
                event.target.value,
              );
            }}
            className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
            title="Apply one color to all letters"
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
    </>
  ) : (
    <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
      Select TextFX blocks to configure individual character colors.
    </div>
  )}
</div>
      ) : null}

{selectedTextFxBlock ? (
  <>
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>TextFX Text</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Text</div>

        <textarea
          value={selectedTextFxBlock.data.text ?? ""}
          onChange={(event) =>
            handleTextChange(event.target.value)
          }
          rows={3}
          className={inspectorTextareaClass()}
          placeholder="Enter TextFX text..."
        />
      </div>
    </div>

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

<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Character Stretch</div>

  <div className="mt-4">
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs font-medium text-neutral-700">
        Horizontal Stretch
      </div>

      <div className="text-xs font-medium text-neutral-500">
        {Math.round(
          ((selectedTextFxBlock.data.fx as any)?.letterScaleX ?? 1) *
            100,
        )}
        %
      </div>
    </div>

    <input
      type="range"
      min={50}
      max={200}
      step={1}
      value={Math.round(
        ((selectedTextFxBlock.data.fx as any)?.letterScaleX ?? 1) *
          100,
      )}
      onChange={(event) =>
        updateTextFx({
          letterScaleX:
            Math.max(
              50,
              Math.min(
                200,
                Number(event.target.value) || 100,
              ),
            ) / 100,
        })
      }
      className="mt-2 w-full"
    />

    <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
      <span>50%</span>
      <span>100%</span>
      <span>200%</span>
    </div>
  </div>

  <div className="mt-5">
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs font-medium text-neutral-700">
        Vertical Stretch
      </div>

      <div className="text-xs font-medium text-neutral-500">
        {Math.round(
          ((selectedTextFxBlock.data.fx as any)?.letterScaleY ?? 1) *
            100,
        )}
        %
      </div>
    </div>

    <input
      type="range"
      min={50}
      max={200}
      step={1}
      value={Math.round(
        ((selectedTextFxBlock.data.fx as any)?.letterScaleY ?? 1) *
          100,
      )}
      onChange={(event) =>
        updateTextFx({
          letterScaleY:
            Math.max(
              50,
              Math.min(
                200,
                Number(event.target.value) || 100,
              ),
            ) / 100,
        })
      }
      className="mt-2 w-full"
    />

    <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
      <span>50%</span>
      <span>100%</span>
      <span>200%</span>
    </div>
  </div>
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

<div
  className={
    inspectorCardClass()
  }
>
  <div
    className={
      inspectorLabelClass()
    }
  >
    Character Colors
  </div>

  <div className="mt-2 text-sm text-neutral-600">
    Click or drag across letters to select them, then choose one color for the entire selection.
  </div>

  {visibleTextFxCharacters.length ? (
    <>
      {/* CHARACTER PICKER */}

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div
              className={
                inspectorLabelClass()
              }
            >
              Select Letters
            </div>

            <div className="mt-1 text-xs text-neutral-500">
              Spaces are hidden automatically.
            </div>
          </div>

          <div className="text-xs font-medium text-neutral-500">
            {selectedLetterColorIndexes.length} selected
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTextFxCharacters.map(
            (entry) => {
              const isSelected =
                selectedLetterColorIndexes.includes(
                  entry.colorIndex,
                );

              const characterColor =
                getLetterColor(
                  normalizedLetterColors,
                  entry.colorIndex,
                  defaultTextFxColor,
                );

              return (
                <button
                  key={`${entry.colorIndex}-${entry.displayIndex}`}
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();

                    handleLetterPointerDown(
                      entry.colorIndex,
                    );
                  }}
                  onPointerEnter={() =>
                    handleLetterPointerEnter(
                      entry.colorIndex,
                    )
                  }
                  className={[
                    "relative flex h-10 min-w-9 select-none items-center justify-center rounded-lg border px-2 text-base font-semibold transition",

                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                      : "border-neutral-200 bg-white hover:border-neutral-400",
                  ].join(" ")}
                  title={`Character ${
                    entry.displayIndex + 1
                  }: ${entry.character}`}
                >
                  <span
                    style={{
                      color:
                        isSelected
                          ? undefined
                          : characterColor,
                    }}
                  >
                    {entry.character}
                  </span>

                  <span
                    className="absolute bottom-1 left-1 right-1 h-1 rounded-full"
                    style={{
                      backgroundColor:
                        characterColor,
                    }}
                  />
                </button>
              );
            },
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={
              selectAllVisibleLetters
            }
            className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Select All
          </button>

          <button
            type="button"
            onClick={
              clearLetterSelection
            }
            disabled={
              !selectedLetterColorIndexes.length
            }
            className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* APPLY COLOR */}

      <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Selection Color
            </div>

            <div className="mt-1 text-xs text-neutral-500">
              {selectedLetterColorIndexes.length
                ? `Apply to ${selectedLetterColorIndexes.length} selected ${
                    selectedLetterColorIndexes.length === 1
                      ? "letter"
                      : "letters"
                  }.`
                : "Select one or more letters first."}
            </div>
          </div>

          <input
            type="color"
            value={
              selectedLetterColor
            }
            disabled={
              !selectedLetterColorIndexes.length
            }
            onChange={(event) =>
              applyColorToSelectedLetters(
                event.target.value,
              )
            }
            className={[
              "h-11 w-16 rounded-xl border border-neutral-300 bg-white p-1",

              selectedLetterColorIndexes.length
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-40",
            ].join(" ")}
            title="Apply color to selected letters"
          />
        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Quick Actions
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-neutral-800">
              One Color for All
            </div>

            <div className="mt-1 text-xs text-neutral-500">
              Replace all individual character colors.
            </div>
          </div>

          <input
            type="color"
            value={
              defaultTextFxColor
            }
            onChange={(event) =>
              applyOneColorToAllLetters(
                event.target.value,
              )
            }
            className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
            title="Apply one color to all letters"
          />
        </div>

        <button
          type="button"
          onClick={
            clearTextFxLetterColors
          }
          className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Reset to Main Text Color
        </button>
      </div>
    </>
  ) : (
    <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
      Select TextFX blocks to configure individual character colors.
    </div>
  )}
</div>
        </>
      ) : null}
    </>
  );
}