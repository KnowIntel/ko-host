"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  LetterFillStyleTarget,
  LetterFillTextTarget,
} from "@/components/builder/formatting/letterFillFormatting";

type LetterFillInspectorProps = {
  selectedBlock: any;

  updateSelectedBlock: any;

  letterFillTextTarget:
    LetterFillTextTarget;

  setLetterFillTextTarget:
    Dispatch<
      SetStateAction<
        LetterFillTextTarget
      >
    >;

  letterFillStyleTarget:
    LetterFillStyleTarget;

  setLetterFillStyleTarget:
    Dispatch<
      SetStateAction<
        LetterFillStyleTarget
      >
    >;

  inspectorCardClass:
    () => string;

  inspectorLabelClass:
    () => string;

  inspectorInputClass:
    () => string;

  inspectorTextareaClass:
    () => string;
};

export function LetterFillInspector({
  selectedBlock,

  updateSelectedBlock,

  letterFillTextTarget,

  setLetterFillTextTarget,

  letterFillStyleTarget,

  setLetterFillStyleTarget,

  inspectorCardClass,

  inspectorLabelClass,

  inspectorInputClass,

  inspectorTextareaClass,
}: LetterFillInspectorProps) {
  const data =
    selectedBlock?.type ===
    "letter_fill"
      ? selectedBlock.data
      : {};

const answer: string =
  typeof data.answer === "string"
    ? (data.answer as string)
    : "";

const normalizedAnswer: string =
  answer.replace(
    /\r\n/g,
    "\n",
  );

const answerCharacters: string[] =
  Array.from(
    normalizedAnswer,
  );

  const editableCharacters =
    answerCharacters.filter(
      (character) =>
        character !== " " &&
        character !== "\n" &&
        character !== "\t",
    );

  function patchLetterFillData(
    patch:
      Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !==
        "letter_fill"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                ...patch,
              },
            },
    );
  }

  return (
    <div
      id="inspector-letter-fill"
      className={
        inspectorCardClass()
      }
    >
      <div
        className={
          inspectorLabelClass()
        }
      >
        Letter Fill
      </div>

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        Visitors enter one
        character into each blank
        to complete the hidden
        answer.
      </p>

      {/* ============================================================ */}
      {/* FORMATTING */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Formatting
        </div>

        {/* TEXT TARGET */}

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Text Target
          </div>

          <select
            value={
              letterFillTextTarget
            }
            onChange={(e) =>
              setLetterFillTextTarget(
                e.target
                  .value as LetterFillTextTarget,
              )
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="heading">
              Heading
            </option>

            <option value="instructions">
              Instructions
            </option>

            <option value="cellText">
              Entered Characters
            </option>

            <option value="checkButton">
              Check Button
            </option>

            <option value="resetButton">
              Reset Button
            </option>

            <option value="successMessage">
              Success Message
            </option>

            <option value="errorMessage">
              Error Message
            </option>
          </select>
        </div>

        {/* STYLE TARGET */}

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Style Target
          </div>

          <select
            value={
              letterFillStyleTarget
            }
            onChange={(e) =>
              setLetterFillStyleTarget(
                e.target
                  .value as LetterFillStyleTarget,
              )
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="cell">
              Character Cell
            </option>

            <option value="correctCell">
              Correct Cell
            </option>

            <option value="incorrectCell">
              Incorrect Cell
            </option>

            <option value="checkButton">
              Check Button
            </option>

            <option value="resetButton">
              Reset Button
            </option>

            <option value="block">
              Block
            </option>
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONTENT */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Content
        </div>

        {/* HEADING */}

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Heading
          </div>

          <input
            type="text"
            value={
              data.heading ?? ""
            }
            onChange={(e) =>
              patchLetterFillData({
                heading:
                  e.target.value,
              })
            }
            className={
              inspectorInputClass()
            }
          />
        </div>

        {/* INSTRUCTIONS */}

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Instructions
          </div>

          <textarea
            value={
              data.instructions ??
              ""
            }
            onChange={(e) =>
              patchLetterFillData({
                instructions:
                  e.target.value,
              })
            }
            className={
              inspectorTextareaClass()
            }
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* ANSWER */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Correct Answer
        </div>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          The answer generates
          the blank cells. It is
          not displayed to
          visitors.
        </p>

        <div className="mt-3">
          <input
            type="text"
            value={answer}
            onChange={(e) =>
              patchLetterFillData({
                answer:
                  e.target.value,
              })
            }
            placeholder="APPLE"
            autoComplete="off"
            spellCheck={
              false
            }
            className={
              inspectorInputClass()
            }
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
          <span>
            {
              answerCharacters.length
            }{" "}
            total{" "}
            {answerCharacters.length ===
            1
              ? "character"
              : "characters"}
          </span>

          <span>
            {
              editableCharacters.length
            }{" "}
            {editableCharacters.length ===
            1
              ? "blank"
              : "blanks"}
          </span>
        </div>

        {/* CASE MODE */}

        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Letter Case
          </div>

          <select
            value={
              data.caseMode ??
              "uppercase"
            }
            onChange={(e) =>
              patchLetterFillData({
                caseMode:
                  e.target.value as
                    | "preserve"
                    | "uppercase"
                    | "lowercase",
              })
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="uppercase">
              Uppercase
            </option>

            <option value="lowercase">
              Lowercase
            </option>

            <option value="preserve">
              Preserve Answer Case
            </option>
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BLANK LAYOUT */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Blank Layout
        </div>

        {/* VARIANT */}

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Blank Style
          </div>

          <select
            value={
              data.styleVariant ??
              "square"
            }
            onChange={(e) =>
              patchLetterFillData({
                styleVariant:
                  e.target.value as
                    | "square"
                    | "underline",
              })
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="square">
              Square Cells
            </option>

            <option value="underline">
              Underline Cells
            </option>
          </select>
        </div>

        {/* CELL SIZE */}

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Cell Size
            </div>

            <div className="text-xs text-neutral-500">
              {Number(
                data.cellSize ??
                  52,
              )}
              px
            </div>
          </div>

          <input
            type="range"
            min={28}
            max={96}
            step={1}
            value={
              Number(
                data.cellSize ??
                  52,
              )
            }
            onChange={(e) =>
              patchLetterFillData({
                cellSize:
                  Number(
                    e.target.value,
                  ),
              })
            }
            className="mt-2 w-full"
          />
        </div>

        {/* CELL GAP */}

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Cell Spacing
            </div>

            <div className="text-xs text-neutral-500">
              {Number(
                data.cellGap ??
                  10,
              )}
              px
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={48}
            step={1}
            value={
              Number(
                data.cellGap ??
                  10,
              )
            }
            onChange={(e) =>
              patchLetterFillData({
                cellGap:
                  Number(
                    e.target.value,
                  ),
              })
            }
            className="mt-2 w-full"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* VALIDATION */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Answer Checking
        </div>

        <div className="mt-3">
  <div className={inspectorLabelClass()}>
    Button Alignment
  </div>

  <div className="mt-2 grid grid-cols-3 gap-2">
    <button
      type="button"
onClick={() =>
  patchLetterFillData({
    buttonAlign: "left",
  })
}
      className={[
        "rounded-lg border px-3 py-2 text-sm font-medium transition",

        (data.buttonAlign ?? "left") === "left"
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      ].join(" ")}
    >
      Left
    </button>

    <button
      type="button"
onClick={() =>
  patchLetterFillData({
    buttonAlign: "center",
  })
}
      className={[
        "rounded-lg border px-3 py-2 text-sm font-medium transition",

        data.buttonAlign === "center"
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      ].join(" ")}
    >
      Center
    </button>

    <button
      type="button"
onClick={() =>
  patchLetterFillData({
    buttonAlign: "right",
  })
}
      className={[
        "rounded-lg border px-3 py-2 text-sm font-medium transition",

        data.buttonAlign === "right"
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      ].join(" ")}
    >
      Right
    </button>
  </div>
</div>

        {/* VALIDATION MODE */}

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Validation Mode
          </div>

          <select
            value={
              data.validationMode ??
              "manual"
            }
            onChange={(e) =>
              patchLetterFillData({
                validationMode:
                  e.target.value as
                    | "live"
                    | "on_complete"
                    | "manual",
              })
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="manual">
              Check Button
            </option>

            <option value="on_complete">
              When Answer Is Complete
            </option>

            <option value="live">
              Live Character Check
            </option>
          </select>
        </div>

        {/* CHECK BUTTON */}

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-neutral-800">
          <input
            type="checkbox"
            checked={
              data.showCheckButton !==
              false
            }
            onChange={(e) =>
              patchLetterFillData({
                showCheckButton:
                  e.target.checked,
              })
            }
          />

          Show Check Answer button
        </label>

{data.showCheckButton !==
false ? (
  <>
    <div className="mt-3">
      <div
        className={
          inspectorLabelClass()
        }
      >
        Check Button Text
      </div>

      <input
        type="text"
        value={
          data.checkButtonText ??
          ""
        }
        onChange={(e) =>
          patchLetterFillData({
            checkButtonText:
              e.target.value,
          })
        }
        className={
          inspectorInputClass()
        }
      />
    </div>

    {/* ========================================================== */}
    {/* CHECK BUTTON HORIZONTAL PADDING */}
    {/* ========================================================== */}

    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Horizontal Padding
        </div>

        <div className="text-xs text-neutral-500">
          {Number(
            data.checkButtonPaddingX ??
              20,
          )}
          px
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={80}
        step={1}
        value={Number(
          data.checkButtonPaddingX ??
            20,
        )}
        onChange={(e) =>
          patchLetterFillData({
            checkButtonPaddingX:
              Number(
                e.target.value,
              ),
          })
        }
        className="mt-2 w-full"
      />
    </div>

    {/* ========================================================== */}
    {/* CHECK BUTTON VERTICAL PADDING */}
    {/* ========================================================== */}

    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Vertical Padding
        </div>

        <div className="text-xs text-neutral-500">
          {Number(
            data.checkButtonPaddingY ??
              8,
          )}
          px
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={40}
        step={1}
        value={Number(
          data.checkButtonPaddingY ??
            8,
        )}
        onChange={(e) =>
          patchLetterFillData({
            checkButtonPaddingY:
              Number(
                e.target.value,
              ),
          })
        }
        className="mt-2 w-full"
      />
    </div>
  </>
) : null}

        {/* RESET BUTTON */}

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-neutral-800">
          <input
            type="checkbox"
            checked={
              data.showResetButton !==
              false
            }
            onChange={(e) =>
              patchLetterFillData({
                showResetButton:
                  e.target.checked,
              })
            }
          />

          Show Reset button
        </label>

        {data.showResetButton !==
        false ? (
          <div className="mt-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Reset Button Text
            </div>

            <input
              type="text"
              value={
                data.resetButtonText ??
                ""
              }
              onChange={(e) =>
                patchLetterFillData({
                  resetButtonText:
                    e.target.value,
                })
              }
              className={
                inspectorInputClass()
              }
            />
          </div>
        ) : null}
      </div>

      {/* ============================================================ */}
      {/* ATTEMPTS / ANSWER REVEAL */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Attempts
        </div>

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Maximum Attempts
          </div>

          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={
              Number(
                data.maxAttempts ??
                  0,
              )
            }
            onChange={(e) =>
              patchLetterFillData({
                maxAttempts:
                  Math.max(
                    0,
                    Math.min(
                      100,
                      Number(
                        e.target.value,
                      ) || 0,
                    ),
                  ),
              })
            }
            className={
              inspectorInputClass()
            }
          />

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Set to 0 for unlimited
            attempts.
          </p>
        </div>

        <label className="mt-4 flex items-start gap-2 text-sm font-medium text-neutral-800">
          <input
            type="checkbox"
            checked={
              data.revealAnswerAfterAttempts ===
              true
            }
            onChange={(e) =>
              patchLetterFillData({
                revealAnswerAfterAttempts:
                  e.target.checked,
              })
            }
            className="mt-0.5"
          />

          <span>
            Reveal answer after
            maximum attempts are
            used
          </span>
        </label>
      </div>

      {/* ============================================================ */}
      {/* FEEDBACK */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Feedback
        </div>

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Success Message
          </div>

          <input
            type="text"
            value={
              data.successMessage ??
              ""
            }
            onChange={(e) =>
              patchLetterFillData({
                successMessage:
                  e.target.value,
              })
            }
            className={
              inspectorInputClass()
            }
          />
        </div>

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Try Again Message
          </div>

          <input
            type="text"
            value={
              data.errorMessage ??
              ""
            }
            onChange={(e) =>
              patchLetterFillData({
                errorMessage:
                  e.target.value,
              })
            }
            className={
              inspectorInputClass()
            }
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* OWNER ANSWER PREVIEW */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Answer Preview
        </div>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Owner-only preview.
          Visitors will see blank
          cells instead of these
          characters.
        </p>

        {answerCharacters.length >
        0 ? (
          <div
            className="mt-3 flex flex-wrap items-end"
            style={{
              gap:
                `${Math.max(
                  0,
                  Number(
                    data.cellGap ??
                      10,
                  ),
                )}px`,
            }}
          >
            {answerCharacters.map(
              (
                character,
                index,
              ) => {
                if (
                  character ===
                  " "
                ) {
                  return (
                    <div
                      key={`letter-fill-preview-space-${index}`}
                      style={{
                        width:
                          `${Math.max(
                            12,
                            Number(
                              data.cellSize ??
                                52,
                            ) *
                              0.55,
                          )}px`,
                      }}
                    />
                  );
                }

                if (
                  character ===
                  "\n"
                ) {
                  return (
                    <div
                      key={`letter-fill-preview-break-${index}`}
                      className="basis-full"
                    />
                  );
                }

                const previewSize =
                  Math.max(
                    28,
                    Math.min(
                      52,
                      Number(
                        data.cellSize ??
                          52,
                      ),
                    ),
                  );

                const displayCharacter =
                  data.caseMode ===
                  "lowercase"
                    ? character.toLowerCase()
                    : data.caseMode ===
                        "uppercase"
                      ? character.toUpperCase()
                      : character;

                return (
                  <div
                    key={`letter-fill-preview-${index}`}
                    className={[
                      "flex items-center justify-center text-sm font-semibold text-neutral-700",

                      data.styleVariant ===
                      "underline"
                        ? "border-b-2 border-neutral-400"
                        : "rounded-lg border border-neutral-300 bg-white",
                    ].join(
                      " ",
                    )}
                    style={{
                      width:
                        `${previewSize}px`,

                      height:
                        `${previewSize}px`,
                    }}
                  >
                    {
                      displayCharacter
                    }
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-neutral-300 bg-white px-3 py-4 text-sm text-neutral-500">
            Enter a correct
            answer to generate
            the blanks.
          </div>
        )}
      </div>
    </div>
  );
}