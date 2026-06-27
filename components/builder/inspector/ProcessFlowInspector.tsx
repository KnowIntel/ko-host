"use client";

import type { Dispatch, SetStateAction } from "react";

export type ProcessFlowStyleTarget =
  | "heading"
  | "subtitle"
  | "stepNumber"
  | "stepHeading"
  | "stepDescription"
  | "badge"
  | "duration";

type ProcessFlowInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  processFlowStyleTarget: ProcessFlowStyleTarget;
  setProcessFlowStyleTarget: Dispatch<
    SetStateAction<ProcessFlowStyleTarget>
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

export function ProcessFlowInspector({
  selectedBlock,
  updateSelectedBlock,

  processFlowStyleTarget,
  setProcessFlowStyleTarget,

  makeClientId,
  uploadImageToSelectedBlock,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: ProcessFlowInspectorProps) {
  return (
    <div
      id="inspector-process-flow"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Process Flow
      </div>

      {/* Formatting */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Formatting Target
        </div>

        <select
          value={processFlowStyleTarget}
          onChange={(e) =>
            setProcessFlowStyleTarget(
              e.target.value as ProcessFlowStyleTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="heading">Heading</option>
          <option value="subtitle">Subtitle</option>
          <option value="stepNumber">Step Number</option>
          <option value="stepHeading">Step Heading</option>
          <option value="stepDescription">
            Step Description
          </option>
          <option value="badge">Badge</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {/* Heading */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Heading
        </div>

        <input
          value={selectedBlock.data.heading ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "process_flow"
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

      {/* Subtitle */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Subtitle
        </div>

        <textarea
          value={selectedBlock.data.subtitle ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "process_flow"
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

      {/* Layout */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Layout
        </div>

        <select
          value={selectedBlock.data.layout ?? "horizontal"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "process_flow"
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
          <option value="horizontal">
            Horizontal
          </option>

          <option value="vertical">
            Vertical
          </option>

          <option value="zig_zag">
            Zig-Zag
          </option>
        </select>
      </div>

      {/* Steps */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Steps
        </div>

        {(selectedBlock.data.steps ?? []).map(
          (step: any) => (
            <div
              key={step.id}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className={inspectorLabelClass()}>
                Step Heading
              </div>

              <input
                value={step.heading ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !==
                    "process_flow"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            steps:
                              block.data.steps.map(
                                (item: any) =>
                                  item.id === step.id
                                    ? {
                                        ...item,
                                        heading:
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

              <div className="mt-3">
                <button
                  type="button"
                  className={toolSetButtonClass(
                    "remove",
                  )}
                  onClick={() =>
                    updateSelectedBlock(
                      (block: any) =>
                        block.type !==
                        "process_flow"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                steps:
                                  block.data.steps.filter(
                                    (
                                      item: any,
                                    ) =>
                                      item.id !==
                                      step.id,
                                  ),
                              },
                            },
                    )
                  }
                >
                  Remove Step
                </button>
              </div>
            </div>
          ),
        )}

        <button
          type="button"
          className={toolSetButtonClass("front")}
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "process_flow"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      steps: [
                        ...block.data.steps,
                        {
                          id: makeClientId(
                            "processstep",
                          ),
                          number: String(
                            block.data.steps.length +
                              1,
                          ).padStart(2, "0"),
                          icon: "⭐",
                          imageUrl: "",
                          heading: "New Step",
                          description: "",
                          badge: "",
                          duration: "",
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Step
        </button>
      </div>
    </div>
  );
}