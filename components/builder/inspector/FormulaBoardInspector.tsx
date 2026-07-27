"use client";

import type { Dispatch, SetStateAction } from "react";

import type {
  FormulaBoardStyleTarget,
  FormulaBoardTextTarget,
} from "@/components/builder/formatting/formulaBoardFormatting";

type FormulaBoardInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  formulaBoardTextTarget: FormulaBoardTextTarget;
  setFormulaBoardTextTarget: Dispatch<
    SetStateAction<FormulaBoardTextTarget>
  >;

  formulaBoardStyleTarget: FormulaBoardStyleTarget;
  setFormulaBoardStyleTarget: Dispatch<
    SetStateAction<FormulaBoardStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  uploadImageToSelectedBlock: (
    blockId: string,
    itemId?: string,
  ) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

function getRandomInteger(min: number, max: number) {
  const safeMin = Math.ceil(Math.min(min, max));
  const safeMax = Math.floor(Math.max(min, max));

  return Math.floor(
    Math.random() * (safeMax - safeMin + 1) + safeMin,
  );
}

function getOperationSymbol(operation: string) {
  switch (operation) {
    case "skills_addition":
      return "+";

    case "skills_subtraction":
      return "−";

    case "skills_multiplication":
      return "×";

    case "skills_division":
      return "÷";

    default:
      return "";
  }
}

function getChallengeEquation(
  operation: string,
  operandA: number,
  operandB: number,
) {
  const symbol = getOperationSymbol(operation);

  return `${operandA} ${symbol} ${operandB} = ?`;
}

function createChallengeOperands(
  operation: string,
  min: number,
  max: number,
) {
  if (operation === "skills_division") {
    /*
     * Generate a nonzero divisor and a whole-number quotient.
     * The dividend is calculated from them so division always
     * has a whole-number answer.
     */
    const divisorMin = Math.max(1, min);
    const divisorMax = Math.max(divisorMin, max);

    const divisor = getRandomInteger(
      divisorMin,
      divisorMax,
    );

    const quotient = getRandomInteger(min, max);

    return {
      operandA: divisor * quotient,
      operandB: divisor,
    };
  }

  const first = getRandomInteger(min, max);
  const second = getRandomInteger(min, max);

  if (operation === "skills_subtraction") {
    /*
     * Keep generated subtraction answers nonnegative.
     */
    return {
      operandA: Math.max(first, second),
      operandB: Math.min(first, second),
    };
  }

  return {
    operandA: first,
    operandB: second,
  };
}

export function FormulaBoardInspector({
  selectedBlock,
  updateSelectedBlock,

  formulaBoardTextTarget,
  setFormulaBoardTextTarget,

  formulaBoardStyleTarget,
  setFormulaBoardStyleTarget,

  makeClientId,
  uploadImageToSelectedBlock,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: FormulaBoardInspectorProps) {
  const operation =
    selectedBlock.data.operation ?? "reference";

  const isSkillsChallenge =
    operation === "skills_addition" ||
    operation === "skills_subtraction" ||
    operation === "skills_multiplication" ||
    operation === "skills_division";

  const updateFormula = (
    formulaId: string,
    patch: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "formula_board"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              formulas: (block.data.formulas ?? []).map(
                (item: any) =>
                  item.id === formulaId
                    ? {
                        ...item,
                        ...patch,
                      }
                    : item,
              ),
            },
          },
    );
  };

  const generateRandomProblems = () => {
    updateSelectedBlock((block: any) => {
      if (block.type !== "formula_board") {
        return block;
      }

      const activeOperation =
        block.data.operation ?? "reference";

      if (activeOperation === "reference") {
        return block;
      }

      const rawMin = Number(
        block.data.challengeMin ?? 1,
      );

      const rawMax = Number(
        block.data.challengeMax ?? 12,
      );

      const rawCount = Number(
        block.data.challengeProblemCount ?? 6,
      );

      const min = Number.isFinite(rawMin)
        ? Math.trunc(rawMin)
        : 1;

      const max = Number.isFinite(rawMax)
        ? Math.trunc(rawMax)
        : 12;

      const normalizedMin = Math.min(min, max);
      const normalizedMax = Math.max(min, max);

      const count = Number.isFinite(rawCount)
        ? Math.max(1, Math.min(50, Math.trunc(rawCount)))
        : 6;

      const formulas = Array.from(
        { length: count },
        (_, index) => {
          const operands = createChallengeOperands(
            activeOperation,
            normalizedMin,
            normalizedMax,
          );

          return {
            id: makeClientId("formula"),
            title: `Question ${index + 1}`,
            formula: "",
            description: "",
            variables: "",
            example: "",
            diagramUrl: "",
            operandA: operands.operandA,
            operandB: operands.operandB,
          };
        },
      );

      return {
        ...block,
        data: {
          ...block.data,
          challengeMin: normalizedMin,
          challengeMax: normalizedMax,
          challengeProblemCount: count,
          formulas,
        },
      };
    });
  };

  return (
    <div
      id="inspector-formula-board"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Formula Board
      </div>

      {/* Operation */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Use Type
        </div>

        <select
          value={operation}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "formula_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      operation: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="reference">
            Formula Reference Board
          </option>

          <option value="skills_addition">
            Skills Challenge: Addition
          </option>

          <option value="skills_subtraction">
            Skills Challenge: Subtraction
          </option>

          <option value="skills_multiplication">
            Skills Challenge: Multiplication
          </option>

          <option value="skills_division">
            Skills Challenge: Division
          </option>
        </select>

        <div className="mt-2 text-xs leading-relaxed text-neutral-500">
          {isSkillsChallenge
            ? "Generate random problems or enter each pair of numbers manually."
            : "Present formulas, explanations, variables, examples, and diagrams as a reference resource."}
        </div>
      </div>

      {/* Random Problem Generator */}

      {isSkillsChallenge ? (
        <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className={inspectorLabelClass()}>
            Random Problem Generator
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className={inspectorLabelClass()}>
                Minimum
              </div>

              <input
                type="number"
                value={
                  selectedBlock.data.challengeMin ?? 1
                }
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "formula_board"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            challengeMin: Number(
                              e.target.value,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <div>
              <div className={inspectorLabelClass()}>
                Maximum
              </div>

              <input
                type="number"
                value={
                  selectedBlock.data.challengeMax ?? 12
                }
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "formula_board"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            challengeMax: Number(
                              e.target.value,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>
              Number of Problems
            </div>

            <input
              type="number"
              min={1}
              max={50}
              value={
                selectedBlock.data
                  .challengeProblemCount ?? 6
              }
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "formula_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          challengeProblemCount:
                            Math.max(
                              1,
                              Math.min(
                                50,
                                Number(
                                  e.target.value,
                                ),
                              ),
                            ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <button
            type="button"
            className={`mt-3 w-full ${toolSetButtonClass(
              "front",
            )}`}
            onClick={generateRandomProblems}
          >
            Generate Random Problems
          </button>

          <div className="mt-2 text-xs leading-relaxed text-neutral-500">
            Subtraction problems generate nonnegative
            answers. Division problems generate whole-number
            answers.
          </div>
        </div>
      ) : null}

      {/* Challenge Messages */}

      {isSkillsChallenge ? (
        <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className={inspectorLabelClass()}>
            Challenge Messages
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>
              Submit Button Text
            </div>

            <input
              value={
                selectedBlock.data.submitButtonText ??
                "Submit Answer"
              }
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "formula_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          submitButtonText:
                            e.target.value,
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>
              Correct Response
            </div>

            <input
              value={
                selectedBlock.data.correctResponseText ??
                "Correct! Great job!"
              }
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "formula_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          correctResponseText:
                            e.target.value,
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>
              Incorrect Response
            </div>

            <input
              value={
                selectedBlock.data
                  .incorrectResponseText ??
                "Not quite—try again!"
              }
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "formula_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          incorrectResponseText:
                            e.target.value,
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>
        </div>
      ) : null}

      {/* Text Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Text Target
        </div>

        <select
          value={formulaBoardTextTarget}
          onChange={(e) =>
            setFormulaBoardTextTarget(
              e.target.value as FormulaBoardTextTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="heading">Heading</option>
          <option value="subtitle">Subtitle</option>

          <option value="formulaTitle">
            Formula Title
          </option>

          <option value="formula">
            {isSkillsChallenge ? "Equation" : "Formula"}
          </option>

          {!isSkillsChallenge ? (
            <>
              <option value="description">
                Description
              </option>

              <option value="variables">
                Variables
              </option>

              <option value="example">
                Worked Example
              </option>
            </>
          ) : null}
        </select>
      </div>

      {/* Style Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Style Target
        </div>

        <select
          value={formulaBoardStyleTarget}
          onChange={(e) =>
            setFormulaBoardStyleTarget(
              e.target.value as FormulaBoardStyleTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="card">Card</option>

          <option value="formulaPanel">
            {isSkillsChallenge
              ? "Equation Panel"
              : "Formula Panel"}
          </option>

          {!isSkillsChallenge ? (
            <>
              <option value="variablesPanel">
                Variables Panel
              </option>

              <option value="examplePanel">
                Example Panel
              </option>

              <option value="diagram">
                Diagram
              </option>
            </>
          ) : null}

          <option value="block">Block</option>
        </select>
      </div>

      {/* General */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          General
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Heading
          </div>

          <input
            value={selectedBlock.data.heading ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
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

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Subtitle
          </div>

          <textarea
            value={selectedBlock.data.subtitle ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        subtitle: e.target.value,
                      },
                    },
              )
            }
            className={inspectorTextareaClass()}
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={
              selectedBlock.data.showHeading !== false
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showHeading: e.target.checked,
                      },
                    },
              )
            }
          />

          Show heading
        </label>

        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={
              selectedBlock.data.showSubtitle !== false
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showSubtitle: e.target.checked,
                      },
                    },
              )
            }
          />

          Show subtitle
        </label>
      </div>

      {/* Layout */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Layout
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Display
          </div>

          <select
            value={selectedBlock.data.layout ?? "grid"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        layout: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="grid">Grid</option>
            <option value="stacked">Stacked</option>
          </select>
        </div>

        {selectedBlock.data.layout !== "stacked" ? (
          <div className="mt-3">
            <div className={inspectorLabelClass()}>
              Columns
            </div>

            <select
              value={selectedBlock.data.columns ?? 2}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "formula_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          columns: Number(
                            e.target.value,
                          ) as 1 | 2 | 3,
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
            </select>
          </div>
        ) : null}
      </div>

      {/* Formulas / Questions */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          {isSkillsChallenge
            ? "Challenge Questions"
            : "Formulas"}
        </div>

        {(selectedBlock.data.formulas ?? []).map(
          (formula: any, formulaIndex: number) => {
            const operandA = Number.isFinite(
              Number(formula.operandA),
            )
              ? Number(formula.operandA)
              : 1;

            const operandB = Number.isFinite(
              Number(formula.operandB),
            )
              ? Number(formula.operandB)
              : 1;

            const equation = getChallengeEquation(
              operation,
              operandA,
              operandB,
            );

            return (
              <div
                key={formula.id}
                className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={inspectorLabelClass()}>
                    {isSkillsChallenge
                      ? `Question ${formulaIndex + 1}`
                      : `Formula ${formulaIndex + 1}`}
                  </div>

                  <button
                    type="button"
                    className={toolSetButtonClass(
                      "remove",
                    )}
                    onClick={() =>
                      updateSelectedBlock(
                        (block: any) =>
                          block.type !==
                          "formula_board"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  formulas: (
                                    block.data.formulas ??
                                    []
                                  ).filter(
                                    (item: any) =>
                                      item.id !==
                                      formula.id,
                                  ),
                                },
                              },
                      )
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3">
                  <div className={inspectorLabelClass()}>
                    Title
                  </div>

                  <input
                    value={formula.title ?? ""}
                    onChange={(e) =>
                      updateFormula(formula.id, {
                        title: e.target.value,
                      })
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                {isSkillsChallenge ? (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <div
                          className={inspectorLabelClass()}
                        >
                          Number A
                        </div>

                        <input
                          type="number"
                          value={operandA}
                          onChange={(e) =>
                            updateFormula(formula.id, {
                              operandA: Number(
                                e.target.value,
                              ),
                            })
                          }
                          className={inspectorInputClass()}
                        />
                      </div>

                      <div>
                        <div
                          className={inspectorLabelClass()}
                        >
                          Number B
                        </div>

                        <input
                          type="number"
                          value={operandB}
                          min={
                            operation ===
                            "skills_division"
                              ? 1
                              : undefined
                          }
                          onChange={(e) =>
                            updateFormula(formula.id, {
                              operandB: Number(
                                e.target.value,
                              ),
                            })
                          }
                          className={inspectorInputClass()}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <div
                        className={inspectorLabelClass()}
                      >
                        Equation Preview
                      </div>

                      <div className="mt-1 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-center text-lg font-semibold text-neutral-800">
                        {equation}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-3">
                      <div
                        className={inspectorLabelClass()}
                      >
                        Formula
                      </div>

                      <textarea
                        value={formula.formula ?? ""}
                        onChange={(e) =>
                          updateFormula(formula.id, {
                            formula: e.target.value,
                          })
                        }
                        className={inspectorTextareaClass()}
                      />
                    </div>

                    <div className="mt-3">
                      <div
                        className={inspectorLabelClass()}
                      >
                        Description
                      </div>

                      <textarea
                        value={
                          formula.description ?? ""
                        }
                        onChange={(e) =>
                          updateFormula(formula.id, {
                            description:
                              e.target.value,
                          })
                        }
                        className={inspectorTextareaClass()}
                      />
                    </div>

                    <div className="mt-3">
                      <div
                        className={inspectorLabelClass()}
                      >
                        Variables
                      </div>

                      <textarea
                        value={
                          formula.variables ?? ""
                        }
                        onChange={(e) =>
                          updateFormula(formula.id, {
                            variables:
                              e.target.value,
                          })
                        }
                        className={inspectorTextareaClass()}
                      />
                    </div>

                    <div className="mt-3">
                      <div
                        className={inspectorLabelClass()}
                      >
                        Worked Example
                      </div>

                      <textarea
                        value={formula.example ?? ""}
                        onChange={(e) =>
                          updateFormula(formula.id, {
                            example: e.target.value,
                          })
                        }
                        className={inspectorTextareaClass()}
                      />
                    </div>

                    <div className="mt-3">
                      <div
                        className={inspectorLabelClass()}
                      >
                        Diagram URL
                      </div>

                      <input
                        value={
                          formula.diagramUrl ?? ""
                        }
                        onChange={(e) =>
                          updateFormula(formula.id, {
                            diagramUrl:
                              e.target.value,
                          })
                        }
                        className={inspectorInputClass()}
                        placeholder="https://..."
                      />
                    </div>

                    <button
                      type="button"
                      className={`mt-3 ${toolSetButtonClass(
                        "front",
                      )}`}
                      onClick={() =>
                        uploadImageToSelectedBlock(
                          selectedBlock.id,
                          formula.id,
                        )
                      }
                    >
                      Upload Diagram
                    </button>

                    {formula.diagramUrl ? (
                      <div className="mt-3">
                        <img
                          src={formula.diagramUrl}
                          alt={
                            formula.title
                              ? `${formula.title} diagram`
                              : "Formula diagram"
                          }
                          className="max-h-40 w-full rounded-lg border border-neutral-200 object-contain"
                        />

                        <button
                          type="button"
                          className={`mt-2 ${toolSetButtonClass(
                            "remove",
                          )}`}
                          onClick={() =>
                            updateFormula(formula.id, {
                              diagramUrl: "",
                            })
                          }
                        >
                          Remove Diagram
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            );
          },
        )}

        <button
          type="button"
          className={`mt-3 ${toolSetButtonClass(
            "front",
          )}`}
          onClick={() =>
            updateSelectedBlock((block: any) => {
              if (block.type !== "formula_board") {
                return block;
              }

              const currentItems =
                block.data.formulas ?? [];

              const operands = createChallengeOperands(
                operation,
                Number(block.data.challengeMin ?? 1),
                Number(block.data.challengeMax ?? 12),
              );

              return {
                ...block,
                data: {
                  ...block.data,
                  formulas: [
                    ...currentItems,
                    isSkillsChallenge
                      ? {
                          id: makeClientId("formula"),
                          title: `Question ${
                            currentItems.length + 1
                          }`,
                          formula: "",
                          description: "",
                          variables: "",
                          example: "",
                          diagramUrl: "",
                          operandA:
                            operands.operandA,
                          operandB:
                            operands.operandB,
                        }
                      : {
                          id: makeClientId("formula"),
                          title: "New Formula",
                          formula: "x = y",
                          description: "",
                          variables: "",
                          example: "",
                          diagramUrl: "",
                        },
                  ],
                },
              };
            })
          }
        >
          {isSkillsChallenge
            ? "Add Question"
            : "Add Formula"}
        </button>
      </div>

      {/* Animation */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Animation
        </div>

        <select
          value={
            selectedBlock.data.animationStyle ?? "none"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "formula_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      animationStyle: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="pop">Pop</option>
        </select>
      </div>

      {/* Spacing */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Spacing
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Block Padding
          </div>

          <input
            type="number"
            min={0}
            max={80}
            value={selectedBlock.data.padding ?? 20}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        padding: Number(
                          e.target.value,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            {isSkillsChallenge
              ? "Question Gap"
              : "Formula Gap"}
          </div>

          <input
            type="number"
            min={0}
            max={80}
            value={selectedBlock.data.gap ?? 16}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        gap: Number(e.target.value),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Card Content Gap
          </div>

          <input
            type="number"
            min={0}
            max={80}
            value={selectedBlock.data.cardGap ?? 12}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cardGap: Number(
                          e.target.value,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>

      {/* Advanced */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Advanced
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Rotation
          </div>

          <input
            type="number"
            min={-180}
            max={180}
            value={selectedBlock.data.rotation ?? 0}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        rotation: Number(
                          e.target.value,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={
              selectedBlock.data.cardShadow !== false
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "formula_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cardShadow:
                          e.target.checked,
                      },
                    },
              )
            }
          />

          Show card shadow
        </label>
      </div>
    </div>
  );
}