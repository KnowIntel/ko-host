"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

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

  CATEGORY_BUTTONS: any;
  getIconNameFromUrl: (url: string) => string;

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

  CATEGORY_BUTTONS,
  getIconNameFromUrl,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: ProcessFlowInspectorProps) {

  const [stepIconSearch, setStepIconSearch] =
  useState<Record<string, string>>({});

const iconTools = useMemo(
  () =>
    (CATEGORY_BUTTONS.Icons ?? []).filter(
      (tool: any) =>
        tool.kind === "block" &&
        tool.type === "icon",
    ),
  [CATEGORY_BUTTONS],
);

const getFilteredStepIcons = (
  stepId: string,
) => {
  const query = (
    stepIconSearch[stepId] ?? ""
  )
    .trim()
    .toLowerCase();

  if (!query) {
    return iconTools;
  }

  return iconTools.filter(
    (tool: any) => {
      const label = String(
        tool.label ?? "",
      ).toLowerCase();

      const iconName = String(
        tool.iconName ?? "",
      ).toLowerCase();

      return (
        label.includes(query) ||
        iconName.includes(query)
      );
    },
  );
};

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
    Card Width
  </div>

  <input
    type="range"
    min={120}
    max={600}
    step={5}
    value={
      selectedBlock.data.cardWidth ??
      260
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

                  cardWidth: Number(
                    e.target.value,
                  ),
                },
              },
      )
    }
    className="mt-2 w-full"
  />

  <div className="mt-1 text-xs text-neutral-500">
    {selectedBlock.data.cardWidth ??
      260}
    px
  </div>
</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Horizontal Spacing
    </div>

<input
  type="range"
  min={0}
  max={160}
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
      max={160}
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

{/* Icon Library */}

<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Icon
  </div>

  <input
    type="text"
    value={
      stepIconSearch[step.id] ?? ""
    }
    onChange={(e) =>
      setStepIconSearch(
        (current) => ({
          ...current,
          [step.id]:
            e.target.value,
        }),
      )
    }
    placeholder="Search icons..."
    className={inspectorInputClass()}
  />

  {stepIconSearch[step.id] ? (
    <button
      type="button"
      onClick={() =>
        setStepIconSearch(
          (current) => ({
            ...current,
            [step.id]: "",
          }),
        )
      }
      className="mt-2 text-xs font-medium text-neutral-500 hover:text-neutral-900"
    >
      Clear search
    </button>
  ) : null}

  <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1">
    {getFilteredStepIcons(
      step.id,
    ).length ? (
      getFilteredStepIcons(
        step.id,
      ).map((tool: any) => {
        const iconName =
          tool.iconName;

        const iconUrl =
          `/media-icons/${iconName}.svg`;

        const selectedIconName =
          step.iconUrl
            ? getIconNameFromUrl(
                step.iconUrl,
              )
            : "";

        const isActive =
          selectedIconName ===
          iconName;

        return (
          <button
            key={iconName}
            type="button"
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
                          ).map(
                            (item: any) =>
                              item.id ===
                              step.id
                                ? {
                                    ...item,

                                    iconUrl,

                                    imageUrl:
                                      "",
                                    imageStoragePath:
                                      "",
                                  }
                                : item,
                          ),
                        },
                      },
              )
            }
            className={[
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",

              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-800 hover:bg-neutral-100",
            ].join(" ")}
          >
            <img
              src={iconUrl}
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
            />

            <span className="min-w-0 flex-1 truncate">
              {tool.label}
            </span>
          </button>
        );
      })
    ) : (
      <div className="px-3 py-4 text-center text-sm text-neutral-500">
        No matching icons
      </div>
    )}
  </div>

  {step.iconUrl ? (
    <button
      type="button"
      className={`${toolSetButtonClass(
        "remove",
      )} mt-2`}
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
                    ).map(
                      (item: any) =>
                        item.id ===
                        step.id
                          ? {
                              ...item,
                              iconUrl: "",
                            }
                          : item,
                    ),
                  },
                },
        )
      }
    >
      Remove Icon
    </button>
  ) : null}

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Icon Size
    </div>

    <input
      type="range"
      min={12}
      max={96}
      step={1}
      value={
        step.iconSize ?? 28
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
                              iconSize:
                                Number(
                                  e.target
                                    .value,
                                ),
                            }
                          : item,
                    ),
                  },
                },
        )
      }
      className="mt-2 w-full"
    />

    <div className="mt-1 text-xs text-neutral-500">
      {step.iconSize ?? 28}px
    </div>
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
                ...(block.data.steps ?? []),
                {
                  id: makeClientId(
                    "processstep",
                  ),
                  number: String(
                    (block.data.steps ?? [])
                      .length + 1,
                  ).padStart(2, "0"),

                  icon: "⭐",
                  iconUrl: "",
                  iconSize: 28,

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