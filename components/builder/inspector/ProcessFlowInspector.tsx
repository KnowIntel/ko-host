"use client";

import type { Dispatch, SetStateAction } from "react";

import type {
  ProcessFlowStyleTarget,
  ProcessFlowTextTarget,
} from "@/components/builder/formatting/processFlowFormatting";

type ProcessFlowInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  processFlowTextTarget: ProcessFlowTextTarget;
  setProcessFlowTextTarget: Dispatch<
    SetStateAction<ProcessFlowTextTarget>
  >;

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

  processFlowTextTarget,
  setProcessFlowTextTarget,

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

      {/* Text Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Text Target
        </div>

        <select
          value={processFlowTextTarget}
          onChange={(e) =>
            setProcessFlowTextTarget(
              e.target.value as ProcessFlowTextTarget,
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

      {/* Style Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Style Target
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
          <option value="card">Card</option>
          <option value="stepIcon">Step Icon</option>
          <option value="connector">Connector</option>
          <option value="block">Block</option>
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

{/* Card Spacing */}

<div className="mt-5">
  <div className={inspectorLabelClass()}>
    Card Spacing
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Horizontal Spacing
    </div>

    <input
      type="range"
      min={0}
      max={80}
      step={1}
      value={
        selectedBlock.data.horizontalGap ??
        selectedBlock.data.gap ??
        16
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !== "process_flow"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    horizontalGap: Number(
                      e.target.value,
                    ),
                  },
                },
        )
      }
      className="mt-2 w-full"
    />

    <div className="mt-1 text-xs text-neutral-500">
      {selectedBlock.data.horizontalGap ??
        selectedBlock.data.gap ??
        16}
      px
    </div>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Vertical Spacing
    </div>

    <input
      type="range"
      min={0}
      max={80}
      step={1}
      value={
        selectedBlock.data.verticalGap ??
        selectedBlock.data.gap ??
        16
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !== "process_flow"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    verticalGap: Number(
                      e.target.value,
                    ),
                  },
                },
        )
      }
      className="mt-2 w-full"
    />

    <div className="mt-1 text-xs text-neutral-500">
      {selectedBlock.data.verticalGap ??
        selectedBlock.data.gap ??
        16}
      px
    </div>
  </div>
</div>

{/* Steps */}

<div className="mt-5">
  <div className={inspectorLabelClass()}>
    Steps
  </div>

  {(selectedBlock.data.steps ?? []).map(
    (
      step: any,
      stepIndex: number,
    ) => (
      <div
        key={step.id}
        className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Step {stepIndex + 1}
        </div>

        {/* Step Number */}

        <div className="mt-3">
          <div
            className={inspectorLabelClass()}
          >
            Step Number
          </div>

          <input
            value={step.number ?? ""}
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "process_flow"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,

                          steps: (
                            block.data.steps ??
                            []
                          ).map(
                            (item: any) =>
                              item.id ===
                              step.id
                                ? {
                                    ...item,
                                    number:
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

        {/* Step Heading */}

        <div className="mt-3">
          <div
            className={inspectorLabelClass()}
          >
            Step Heading
          </div>

          <input
            value={step.heading ?? ""}
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "process_flow"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,

                          steps: (
                            block.data.steps ??
                            []
                          ).map(
                            (item: any) =>
                              item.id ===
                              step.id
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
        </div>

        {/* Description */}

        <div className="mt-3">
          <div
            className={inspectorLabelClass()}
          >
            Description
          </div>

          <textarea
            value={
              step.description ?? ""
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "process_flow"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,

                          steps: (
                            block.data.steps ??
                            []
                          ).map(
                            (item: any) =>
                              item.id ===
                              step.id
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

        {/* Pills */}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <div
              className={inspectorLabelClass()}
            >
              Pill Label
            </div>

            <input
              value={step.badge ?? ""}
              onChange={(e) =>
                updateSelectedBlock(
                  (block: any) =>
                    block.type !==
                    "process_flow"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,

                            steps: (
                              block.data
                                .steps ?? []
                            ).map(
                              (
                                item: any,
                              ) =>
                                item.id ===
                                step.id
                                  ? {
                                      ...item,
                                      badge:
                                        e
                                          .target
                                          .value,
                                    }
                                  : item,
                            ),
                          },
                        },
                )
              }
              placeholder="Step 1"
              className={inspectorInputClass()}
            />
          </div>

          <div>
            <div
              className={inspectorLabelClass()}
            >
              Secondary Pill
            </div>

            <input
              value={
                step.duration ?? ""
              }
              onChange={(e) =>
                updateSelectedBlock(
                  (block: any) =>
                    block.type !==
                    "process_flow"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,

                            steps: (
                              block.data
                                .steps ?? []
                            ).map(
                              (
                                item: any,
                              ) =>
                                item.id ===
                                step.id
                                  ? {
                                      ...item,
                                      duration:
                                        e
                                          .target
                                          .value,
                                    }
                                  : item,
                            ),
                          },
                        },
                )
              }
              placeholder="5 min"
              className={inspectorInputClass()}
            />
          </div>
        </div>

        {/* Icon */}

        <div className="mt-3">
          <div
            className={inspectorLabelClass()}
          >
            Icon
          </div>

          <input
            value={step.icon ?? ""}
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "process_flow"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,

                          steps: (
                            block.data.steps ??
                            []
                          ).map(
                            (item: any) =>
                              item.id ===
                              step.id
                                ? {
                                    ...item,
                                    icon:
                                      e.target
                                        .value,
                                  }
                                : item,
                          ),
                        },
                      },
              )
            }
            placeholder="⭐"
            className={inspectorInputClass()}
          />

          <div className="mt-1 text-xs text-neutral-500">
            Enter an emoji or symbol. An
            uploaded image will replace the
            icon when present.
          </div>
        </div>

        {/* Step Image */}

        <div className="mt-4">
          <div
            className={inspectorLabelClass()}
          >
            Step Image
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={toolSetButtonClass(
                "front",
              )}
              onClick={() =>
                uploadImageToSelectedBlock(
                  selectedBlock.id,
                  step.id,
                )
              }
            >
              {step.imageUrl
                ? "Replace Image"
                : "Upload Image"}
            </button>

            {step.imageUrl ? (
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

                              steps: (
                                block.data
                                  .steps ?? []
                              ).map(
                                (
                                  item: any,
                                ) =>
                                  item.id ===
                                  step.id
                                    ? {
                                        ...item,
                                        imageUrl:
                                          "",
                                        imageStoragePath:
                                          "",
                                        imageMimeType:
                                          "",
                                        imageSizeBytes:
                                          undefined,
                                        imageOriginalSizeBytes:
                                          undefined,
                                      }
                                    : item,
                              ),
                            },
                          },
                  )
                }
              >
                Remove Image
              </button>
            ) : null}
          </div>

          {step.imageUrl ? (
            <div className="mt-3 flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <img
                src={step.imageUrl}
                alt={
                  step.heading
                    ? `${step.heading} preview`
                    : `Step ${stepIndex + 1} preview`
                }
                className="h-full w-full object-contain"
              />
            </div>
          ) : null}
        </div>

        {/* Remove */}

        <button
          type="button"
          className={`${toolSetButtonClass(
            "remove",
          )} mt-4 w-full`}
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

                        steps: (
                          block.data.steps ??
                          []
                        ).filter(
                          (item: any) =>
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
    ),
  )}

  <button
    type="button"
    className={`${toolSetButtonClass(
      "front",
    )} mt-3`}
    onClick={() =>
      updateSelectedBlock(
        (block: any) =>
          block.type !== "process_flow"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  steps: [
                    ...(block.data.steps ??
                      []),

                    {
                      id: makeClientId(
                        "processstep",
                      ),

                      number: String(
                        (
                          block.data.steps ??
                          []
                        ).length + 1,
                      ).padStart(
                        2,
                        "0",
                      ),

                      icon: "⭐",

                      imageUrl: "",
                      imageStoragePath:
                        "",
                      imageMimeType: "",

                      heading:
                        "New Step",

                      description:
                        "Describe what happens during this step.",

                      badge: `Step ${
                        (
                          block.data.steps ??
                          []
                        ).length + 1
                      }`,

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