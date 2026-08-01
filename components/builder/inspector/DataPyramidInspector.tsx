"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  DataPyramidStyleTarget,
  DataPyramidTextTarget,
} from "@/components/builder/formatting/dataPyramidFormatting";

type DataPyramidInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  dataPyramidTextTarget: DataPyramidTextTarget;
  setDataPyramidTextTarget: Dispatch<
    SetStateAction<DataPyramidTextTarget>
  >;

  dataPyramidStyleTarget: DataPyramidStyleTarget;
  setDataPyramidStyleTarget: Dispatch<
    SetStateAction<DataPyramidStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function DataPyramidInspector({
  selectedBlock,
  updateSelectedBlock,

  dataPyramidTextTarget,
  setDataPyramidTextTarget,

  dataPyramidStyleTarget,
  setDataPyramidStyleTarget,

  makeClientId,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: DataPyramidInspectorProps) {
  const levels = Array.isArray(
    selectedBlock.data.levels,
  )
    ? selectedBlock.data.levels
    : [];

  const updateLevel = (
    levelId: string,
    patch: Record<string, unknown>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "data_pyramid"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              levels: (
                block.data.levels ?? []
              ).map((level: any) =>
                level.id === levelId
                  ? {
                      ...level,
                      ...patch,
                    }
                  : level,
              ),
            },
          },
    );
  };

  return (
    <div
      id="inspector-data-pyramid"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Data Pyramid
      </div>

      {/* Text Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Text Target
        </div>

        <select
          value={dataPyramidTextTarget}
          onChange={(e) =>
            setDataPyramidTextTarget(
              e.target.value as DataPyramidTextTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="heading">
            Heading
          </option>

          <option value="subtitle">
            Subtitle
          </option>

          <option value="levelNumber">
            Level Number
          </option>

          <option value="levelTitle">
            Level Title
          </option>

          <option value="levelValue">
            Level Value
          </option>

          <option value="levelDescription">
            Level Description
          </option>

          <option value="levelBadge">
            Level Badge
          </option>
        </select>
      </div>

      {/* Style Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Style Target
        </div>

        <select
          value={dataPyramidStyleTarget}
          onChange={(e) =>
            setDataPyramidStyleTarget(
              e.target.value as DataPyramidStyleTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="level">
            Level
          </option>

          <option value="icon">
            Icon
          </option>

          <option value="connector">
            Connector
          </option>

          <option value="block">
            Block
          </option>
        </select>
      </div>

      {/* Content */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Content
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Heading
          </div>

          <input
            value={
              selectedBlock.data.heading ?? ""
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "data_pyramid"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          heading:
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
            Subtitle
          </div>

          <textarea
            value={
              selectedBlock.data.subtitle ?? ""
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "data_pyramid"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          subtitle:
                            e.target.value,
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
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "data_pyramid"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showHeading:
                            e.target.checked,
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
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "data_pyramid"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showSubtitle:
                            e.target.checked,
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
            Alignment
          </div>

          <select
            value={
              selectedBlock.data.layout ??
              "centered"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "data_pyramid"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          layout:
                            e.target.value,
                        },
                      },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="centered">
              Centered
            </option>

            <option value="left_aligned">
              Left Aligned
            </option>

            <option value="right_aligned">
              Right Aligned
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Direction
          </div>

          <select
            value={
              selectedBlock.data.direction ??
              "largest_bottom"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "data_pyramid"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          direction:
                            e.target.value,
                        },
                      },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="largest_bottom">
              Largest at Bottom
            </option>

            <option value="largest_top">
              Largest at Top
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Shape
          </div>

          <select
            value={
              selectedBlock.data.shape ??
              "pyramid"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "data_pyramid"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          shape:
                            e.target.value,
                        },
                      },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="pyramid">
              Pyramid
            </option>

            <option value="stepped">
              Stepped
            </option>

            <option value="funnel">
              Funnel
            </option>
          </select>
        </div>
      </div>

      {/* Visibility */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Visibility
        </div>

        {[
          ["showValues", "Show values"],
          ["showDescriptions", "Show descriptions"],
          ["showBadges", "Show badges"],
          ["showIcons", "Show icons"],
          ["showLevelNumbers", "Show level numbers"],
          ["levelShadow", "Level shadow"],
          ["equalHeightLevels", "Equal-height levels"],
        ].map(([key, label]) => (
          <label
            key={key}
            className="mt-2 flex items-center gap-2 text-sm text-neutral-700"
          >
            <input
              type="checkbox"
              checked={
                selectedBlock.data[key] !== false
              }
              onChange={(e) =>
                updateSelectedBlock(
                  (block: any) =>
                    block.type !==
                    "data_pyramid"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            [key]:
                              e.target.checked,
                          },
                        },
                )
              }
            />

            {label}
          </label>
        ))}
      </div>

      {/* Sizing */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Sizing
        </div>

        {[
          ["padding", "Block Padding", 0, 80, 20],
          ["gap", "Level Gap", 0, 48, 10],
          ["levelPadding", "Level Padding", 0, 48, 16],
          ["levelRadius", "Level Radius", 0, 48, 14],
          ["borderWidth", "Border Width", 0, 12, 1],
          ["maxWidth", "Maximum Width", 240, 1200, 720],
          ["rotation", "Rotation", -15, 15, 0],
        ].map(
          ([
            key,
            label,
            min,
            max,
            fallback,
          ]) => (
            <div
              key={key as string}
              className="mt-3"
            >
              <div className={inspectorLabelClass()}>
                {label}
              </div>

              <input
                type="number"
                min={min as number}
                max={max as number}
                value={
                  selectedBlock.data[
                    key as string
                  ] ?? fallback
                }
                onChange={(e) =>
                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "data_pyramid"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              [key as string]:
                                Math.max(
                                  min as number,
                                  Math.min(
                                    max as number,
                                    Number(
                                      e.target.value,
                                    ) ||
                                      (fallback as number),
                                  ),
                                ),
                            },
                          },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>
          ),
        )}
      </div>

      {/* Animation */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Animation
        </div>

        <select
          value={
            selectedBlock.data.animationStyle ??
            "none"
          }
          onChange={(e) =>
            updateSelectedBlock(
              (block: any) =>
                block.type !==
                "data_pyramid"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        animationStyle:
                          e.target.value,
                      },
                    },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="none">
            None
          </option>

          <option value="fade">
            Fade
          </option>

          <option value="slide">
            Slide
          </option>

          <option value="grow">
            Grow
          </option>

          <option value="cascade">
            Cascade
          </option>
        </select>
      </div>

      {/* Levels */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Levels
        </div>

        {levels.map(
          (level: any, index: number) => (
            <div
              key={level.id}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Level {index + 1}
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Title
                </div>

                <input
                  value={level.title ?? ""}
                  onChange={(e) =>
                    updateLevel(level.id, {
                      title: e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Value
                </div>

                <input
                  value={level.value ?? ""}
                  onChange={(e) =>
                    updateLevel(level.id, {
                      value: e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Description
                </div>

                <textarea
                  value={
                    level.description ?? ""
                  }
                  onChange={(e) =>
                    updateLevel(level.id, {
                      description:
                        e.target.value,
                    })
                  }
                  className={inspectorTextareaClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Badge
                </div>

                <input
                  value={level.badge ?? ""}
                  onChange={(e) =>
                    updateLevel(level.id, {
                      badge: e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Icon
                </div>

                <select
                  value={
                    level.iconName ?? "star"
                  }
                  onChange={(e) =>
                    updateLevel(level.id, {
                      iconName:
                        e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                >
                  <option value="star">
                    Star
                  </option>

                  <option value="target">
                    Target
                  </option>

                  <option value="activity">
                    Activity
                  </option>

                  <option value="layers">
                    Layers
                  </option>

                  <option value="check">
                    Check
                  </option>

                  <option value="growth">
                    Growth
                  </option>

                  <option value="users">
                    Users
                  </option>

                  <option value="lightbulb">
                    Idea
                  </option>

                  <option value="flag">
                    Flag
                  </option>

                  <option value="award">
                    Award
                  </option>
                </select>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <div
                    className={`${inspectorLabelClass()} text-center`}
                  >
                    Background Color
                  </div>

                  <input
                    type="color"
                    value={
                      level.backgroundColor ||
                      "#FFFFFF"
                    }
                    onChange={(e) =>
                      updateLevel(level.id, {
                        backgroundColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>

                <div>
                  <div
                    className={`${inspectorLabelClass()} text-center`}
                  >
                    Border Color
                  </div>

                  <input
                    type="color"
                    value={
                      level.borderColor ||
                      "#E5E7EB"
                    }
                    onChange={(e) =>
                      updateLevel(level.id, {
                        borderColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>

                <div>
                  <div
                    className={`${inspectorLabelClass()} text-center`}
                  >
                    Accent Color
                  </div>

                  <input
                    type="color"
                    value={
                      level.accentColor ||
                      "#2563EB"
                    }
                    onChange={(e) =>
                      updateLevel(level.id, {
                        accentColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>

                <div>
                  <div
                    className={`${inspectorLabelClass()} text-center`}
                  >
                    Text Color
                  </div>

                  <input
                    type="color"
                    value={
                      level.textColor ||
                      "#111827"
                    }
                    onChange={(e) =>
                      updateLevel(level.id, {
                        textColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Link
                </div>

                <input
                  value={level.href ?? ""}
                  onChange={(e) =>
                    updateLevel(level.id, {
                      href: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className={inspectorInputClass()}
                />
              </div>

              <button
                type="button"
                className={`${toolSetButtonClass(
                  "remove",
                )} mt-3 w-full min-w-0 whitespace-nowrap px-3`}
                onClick={() =>
                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "data_pyramid"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              levels: (
                                block.data.levels ??
                                []
                              ).filter(
                                (
                                  item: any,
                                ) =>
                                  item.id !==
                                  level.id,
                              ),
                            },
                          },
                  )
                }
              >
                Remove Level
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
                block.type !==
                "data_pyramid"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        levels: [
                          ...(block.data.levels ??
                            []),

                          {
                            id: makeClientId(
                              "pyramidlevel",
                            ),

                            title: "New Level",
                            value: "100%",

                            description:
                              "Describe what this level represents.",

                            badge: "",

                            iconName: "star",

                            imageUrl: "",
                            imageStoragePath: "",
                            imageMimeType: "",

                            backgroundColor:
                              "#FFFFFF",

                            borderColor:
                              "#E5E7EB",

                            accentColor:
                              "#2563EB",

                            textColor:
                              "#111827",

                            href: "",
                          },
                        ],
                      },
                    },
            )
          }
        >
          Add Level
        </button>
      </div>
    </div>
  );
}