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
  return (
    <div
      id="inspector-formula-board"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Formula Board
      </div>

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
          <option value="formula">Formula</option>
          <option value="description">
            Description
          </option>
          <option value="variables">Variables</option>
          <option value="example">
            Worked Example
          </option>
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
            Formula Panel
          </option>
          <option value="variablesPanel">
            Variables Panel
          </option>
          <option value="examplePanel">
            Example Panel
          </option>
          <option value="diagram">Diagram</option>
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

        {selectedBlock.data.layout !== "stacked" && (
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
        )}
      </div>

      {/* Formulas */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Formulas
        </div>

        {(selectedBlock.data.formulas ?? []).map(
          (formula: any, formulaIndex: number) => (
            <div
              key={formula.id}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className={inspectorLabelClass()}>
                  Formula {formulaIndex + 1}
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
                                formulas:
                                  block.data.formulas.filter(
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
                    updateSelectedBlock(
                      (block: any) =>
                        block.type !==
                        "formula_board"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                formulas:
                                  block.data.formulas.map(
                                    (item: any) =>
                                      item.id ===
                                      formula.id
                                        ? {
                                            ...item,
                                            title:
                                              e.target
                                                .value,
                                          }
                                        : item,
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
                  Formula
                </div>

                <textarea
                  value={formula.formula ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock(
                      (block: any) =>
                        block.type !==
                        "formula_board"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                formulas:
                                  block.data.formulas.map(
                                    (item: any) =>
                                      item.id ===
                                      formula.id
                                        ? {
                                            ...item,
                                            formula:
                                              e.target
                                                .value,
                                          }
                                        : item,
                                  ),
                              },
                            },
                    )
                  }
                  className={inspectorTextareaClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Description
                </div>

                <textarea
                  value={formula.description ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock(
                      (block: any) =>
                        block.type !==
                        "formula_board"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                formulas:
                                  block.data.formulas.map(
                                    (item: any) =>
                                      item.id ===
                                      formula.id
                                        ? {
                                            ...item,
                                            description:
                                              e.target
                                                .value,
                                          }
                                        : item,
                                  ),
                              },
                            },
                    )
                  }
                  className={inspectorTextareaClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Variables
                </div>

                <textarea
                  value={formula.variables ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock(
                      (block: any) =>
                        block.type !==
                        "formula_board"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                formulas:
                                  block.data.formulas.map(
                                    (item: any) =>
                                      item.id ===
                                      formula.id
                                        ? {
                                            ...item,
                                            variables:
                                              e.target
                                                .value,
                                          }
                                        : item,
                                  ),
                              },
                            },
                    )
                  }
                  className={inspectorTextareaClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Worked Example
                </div>

                <textarea
                  value={formula.example ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock(
                      (block: any) =>
                        block.type !==
                        "formula_board"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                formulas:
                                  block.data.formulas.map(
                                    (item: any) =>
                                      item.id ===
                                      formula.id
                                        ? {
                                            ...item,
                                            example:
                                              e.target
                                                .value,
                                          }
                                        : item,
                                  ),
                              },
                            },
                    )
                  }
                  className={inspectorTextareaClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Diagram URL
                </div>

                <input
                  value={formula.diagramUrl ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock(
                      (block: any) =>
                        block.type !==
                        "formula_board"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                formulas:
                                  block.data.formulas.map(
                                    (item: any) =>
                                      item.id ===
                                      formula.id
                                        ? {
                                            ...item,
                                            diagramUrl:
                                              e.target
                                                .value,
                                          }
                                        : item,
                                  ),
                              },
                            },
                    )
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
                      updateSelectedBlock(
                        (block: any) =>
                          block.type !==
                          "formula_board"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  formulas:
                                    block.data.formulas.map(
                                      (item: any) =>
                                        item.id ===
                                        formula.id
                                          ? {
                                              ...item,
                                              diagramUrl:
                                                "",
                                            }
                                          : item,
                                    ),
                                },
                              },
                      )
                    }
                  >
                    Remove Diagram
                  </button>
                </div>
              ) : null}
            </div>
          ),
        )}

        <button
          type="button"
          className={`mt-3 ${toolSetButtonClass(
            "front",
          )}`}
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "formula_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      formulas: [
                        ...(block.data.formulas ?? []),
                        {
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
                  },
            )
          }
        >
          Add Formula
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
                        padding: Number(e.target.value),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Formula Gap
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
                        cardShadow: e.target.checked,
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