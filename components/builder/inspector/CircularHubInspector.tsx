"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  CircularHubStyleTarget,
  CircularHubTextTarget,
} from "@/components/builder/formatting/circularHubFormatting";

type CircularHubInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  circularHubTextTarget: CircularHubTextTarget;
  setCircularHubTextTarget: Dispatch<
    SetStateAction<CircularHubTextTarget>
  >;

  circularHubStyleTarget: CircularHubStyleTarget;
  setCircularHubStyleTarget: Dispatch<
    SetStateAction<CircularHubStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function CircularHubInspector({
  selectedBlock,
  updateSelectedBlock,

  circularHubTextTarget,
  setCircularHubTextTarget,

  circularHubStyleTarget,
  setCircularHubStyleTarget,

  makeClientId,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: CircularHubInspectorProps) {
  const nodes = Array.isArray(
    selectedBlock.data.nodes,
  )
    ? selectedBlock.data.nodes
    : [];

  const updateNode = (
    nodeId: string,
    patch: Record<string, unknown>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "circular_hub"
        ? block
        : {
            ...block,

            data: {
              ...block.data,

              nodes: (
                block.data.nodes ?? []
              ).map((node: any) =>
                node.id === nodeId
                  ? {
                      ...node,
                      ...patch,
                    }
                  : node,
              ),
            },
          },
    );
  };

  return (
    <div
      id="inspector-circular-hub"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Circular Hub
      </div>

      {/* Text Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Text Target
        </div>

        <select
          value={circularHubTextTarget}
          onChange={(e) =>
            setCircularHubTextTarget(
              e.target.value as CircularHubTextTarget,
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

          <option value="centerTitle">
            Center Title
          </option>

          <option value="centerSubtitle">
            Center Subtitle
          </option>

          <option value="nodeTitle">
            Node Title
          </option>

          <option value="nodeSubtitle">
            Node Subtitle
          </option>

          <option value="nodeDescription">
            Node Description
          </option>

          <option value="nodeBadge">
            Node Badge
          </option>
        </select>
      </div>

      {/* Style Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Style Target
        </div>

        <select
          value={circularHubStyleTarget}
          onChange={(e) =>
            setCircularHubStyleTarget(
              e.target.value as CircularHubStyleTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="hub">
            Center Hub
          </option>

          <option value="node">
            Node
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

      {/* Main Content */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Main Content
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
                  "circular_hub"
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
                  "circular_hub"
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
                  "circular_hub"
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
                  "circular_hub"
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

      {/* Center Hub */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Center Hub
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Center Title
          </div>

          <input
            value={
              selectedBlock.data.centerTitle ?? ""
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "circular_hub"
                    ? block
                    : {
                        ...block,

                        data: {
                          ...block.data,
                          centerTitle:
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
            Center Subtitle
          </div>

          <input
            value={
              selectedBlock.data
                .centerSubtitle ?? ""
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "circular_hub"
                    ? block
                    : {
                        ...block,

                        data: {
                          ...block.data,
                          centerSubtitle:
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
            Hub Background Color
          </div>

          <input
            type="color"
            value={
              selectedBlock.data
                .hubBackgroundColor ||
              "#2563EB"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "circular_hub"
                    ? block
                    : {
                        ...block,

                        data: {
                          ...block.data,
                          hubBackgroundColor:
                            e.target.value,
                        },
                      },
              )
            }
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={
              selectedBlock.data.showCenter !== false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "circular_hub"
                    ? block
                    : {
                        ...block,

                        data: {
                          ...block.data,
                          showCenter:
                            e.target.checked,
                        },
                      },
              )
            }
          />

          Show center hub
        </label>
      </div>

      {/* Layout */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Layout
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Layout Type
          </div>

          <select
            value={
              selectedBlock.data.layout ??
              "radial"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "circular_hub"
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
            <option value="radial">
              Radial
            </option>

            <option value="orbit">
              Orbit
            </option>

            <option value="spokes">
              Spokes
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
          [
            "showNodeDescriptions",
            "Show node descriptions",
          ],
          ["showBadges", "Show badges"],
          ["showIcons", "Show icons"],
          ["showConnectors", "Show connectors"],
          ["nodeShadow", "Node shadow"],
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
                    "circular_hub"
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
          [
            "padding",
            "Block Padding",
            0,
            80,
            20,
          ],

          [
            "gap",
            "Node Gap",
            0,
            80,
            16,
          ],

          [
            "hubRadius",
            "Hub Radius",
            40,
            180,
            72,
          ],

          [
            "nodeRadius",
            "Node Radius",
            0,
            80,
            18,
          ],

          [
            "nodeSize",
            "Node Size",
            90,
            280,
            150,
          ],

          [
            "borderWidth",
            "Border Width",
            0,
            12,
            1,
          ],

          [
            "rotation",
            "Rotation",
            -180,
            180,
            0,
          ],
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
                      "circular_hub"
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

      {/* Connector Color */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Connector
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Connector Color
          </div>

          <input
            type="color"
            value={
              selectedBlock.data
                .connectorColor ||
              "#CBD5E1"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "circular_hub"
                    ? block
                    : {
                        ...block,

                        data: {
                          ...block.data,
                          connectorColor:
                            e.target.value,
                        },
                      },
              )
            }
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
          />
        </div>
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
                "circular_hub"
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

          <option value="spin">
            Spin
          </option>

          <option value="pulse">
            Pulse
          </option>

          <option value="grow">
            Grow
          </option>
        </select>
      </div>

      {/* Nodes */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Nodes
        </div>

        {nodes.map(
          (node: any, index: number) => (
            <div
              key={node.id}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Node {index + 1}
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Title
                </div>

                <input
                  value={node.title ?? ""}
                  onChange={(e) =>
                    updateNode(node.id, {
                      title:
                        e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Subtitle
                </div>

                <input
                  value={node.subtitle ?? ""}
                  onChange={(e) =>
                    updateNode(node.id, {
                      subtitle:
                        e.target.value,
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
                    node.description ?? ""
                  }
                  onChange={(e) =>
                    updateNode(node.id, {
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
                  value={node.badge ?? ""}
                  onChange={(e) =>
                    updateNode(node.id, {
                      badge:
                        e.target.value,
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
                    node.iconName ?? "target"
                  }
                  onChange={(e) =>
                    updateNode(node.id, {
                      iconName:
                        e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                >
                  <option value="target">
                    Target
                  </option>

                  <option value="users">
                    Users
                  </option>

                  <option value="activity">
                    Activity
                  </option>

                  <option value="layers">
                    Layers
                  </option>

                  <option value="chart">
                    Chart
                  </option>

                  <option value="trending-up">
                    Growth
                  </option>

                  <option value="star">
                    Star
                  </option>

                  <option value="check">
                    Check
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

                  <option value="heart">
                    Heart
                  </option>
                </select>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <div
                    className={`${inspectorLabelClass()} text-center`}
                  >
                    Background Color
                  </div>

                  <input
                    type="color"
                    value={
                      node.backgroundColor ||
                      "#FFFFFF"
                    }
                    onChange={(e) =>
                      updateNode(node.id, {
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
                      node.borderColor ||
                      "#E5E7EB"
                    }
                    onChange={(e) =>
                      updateNode(node.id, {
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
                      node.accentColor ||
                      "#2563EB"
                    }
                    onChange={(e) =>
                      updateNode(node.id, {
                        accentColor:
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
                  value={node.href ?? ""}
                  onChange={(e) =>
                    updateNode(node.id, {
                      href:
                        e.target.value,
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
                      "circular_hub"
                        ? block
                        : {
                            ...block,

                            data: {
                              ...block.data,

                              nodes: (
                                block.data.nodes ??
                                []
                              ).filter(
                                (
                                  item: any,
                                ) =>
                                  item.id !==
                                  node.id,
                              ),
                            },
                          },
                  )
                }
              >
                Remove Node
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
                "circular_hub"
                  ? block
                  : {
                      ...block,

                      data: {
                        ...block.data,

                        nodes: [
                          ...(block.data.nodes ??
                            []),

                          {
                            id: makeClientId(
                              "circularhubnode",
                            ),

                            title: "New Node",

                            subtitle:
                              "Supporting area",

                            description:
                              "Explain how this node connects to the center.",

                            badge: "",

                            iconName:
                              "target",

                            imageUrl: "",

                            imageStoragePath:
                              "",

                            imageMimeType:
                              "",

                            backgroundColor:
                              "#FFFFFF",

                            borderColor:
                              "#E5E7EB",

                            accentColor:
                              "#2563EB",

                            href: "",
                          },
                        ],
                      },
                    },
            )
          }
        >
          Add Node
        </button>
      </div>
    </div>
  );
}