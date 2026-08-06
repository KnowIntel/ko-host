"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  InteractiveHotspotsStyleTarget,
  InteractiveHotspotsTextTarget,
} from "@/components/builder/formatting/interactiveHotspotsFormatting";

type InteractiveHotspotsInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  interactiveHotspotsTextTarget: InteractiveHotspotsTextTarget;
  setInteractiveHotspotsTextTarget: Dispatch<
    SetStateAction<InteractiveHotspotsTextTarget>
  >;

  interactiveHotspotsStyleTarget: InteractiveHotspotsStyleTarget;
  setInteractiveHotspotsStyleTarget: Dispatch<
    SetStateAction<InteractiveHotspotsStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  uploadInteractiveHotspotsBackground: (
    blockId: string,
  ) => Promise<any> | void;

  uploadImageToInteractiveHotspot: (
    blockId: string,
    hotspotId: string,
  ) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (
    position?: any,
  ) => string;
};

export function InteractiveHotspotsInspector({
  selectedBlock,
  updateSelectedBlock,

  interactiveHotspotsTextTarget,
  setInteractiveHotspotsTextTarget,

  interactiveHotspotsStyleTarget,
  setInteractiveHotspotsStyleTarget,

  makeClientId,

  uploadInteractiveHotspotsBackground,
  uploadImageToInteractiveHotspot,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: InteractiveHotspotsInspectorProps) {
  const hotspots = Array.isArray(
    selectedBlock.data.hotspots,
  )
    ? selectedBlock.data.hotspots
    : [];

  const updateHotspot = (
    hotspotId: string,
    patch: Record<string, unknown>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !==
      "interactive_hotspots"
        ? block
        : {
            ...block,

            data: {
              ...block.data,

              hotspots: (
                block.data.hotspots ?? []
              ).map((hotspot: any) =>
                hotspot.id === hotspotId
                  ? {
                      ...hotspot,
                      ...patch,
                    }
                  : hotspot,
              ),
            },
          },
    );
  };

  return (
    <div
      id="inspector-interactive-hotspots"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Interactive Hotspots
      </div>

      {/* Text Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Text Target
        </div>

        <select
          value={
            interactiveHotspotsTextTarget
          }
          onChange={(e) =>
            setInteractiveHotspotsTextTarget(
              e.target
                .value as InteractiveHotspotsTextTarget,
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

          <option value="hotspotTitle">
            Hotspot Title
          </option>

          <option value="hotspotSubtitle">
            Hotspot Subtitle
          </option>

          <option value="hotspotDescription">
            Hotspot Description
          </option>

          <option value="hotspotBadge">
            Hotspot Badge
          </option>

          <option value="markerLabel">
            Marker Label
          </option>

          <option value="buttonLabel">
            Button Label
          </option>
        </select>
      </div>

      {/* Style Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Style Target
        </div>

        <select
          value={
            interactiveHotspotsStyleTarget
          }
          onChange={(e) =>
            setInteractiveHotspotsStyleTarget(
              e.target
                .value as InteractiveHotspotsStyleTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="canvas">
            Canvas
          </option>

          <option value="marker">
            Marker
          </option>

          <option value="panel">
            Detail Panel
          </option>

          <option value="hotspotImage">
            Hotspot Image
          </option>

          <option value="connector">
            Connector
          </option>

          <option value="button">
            Button
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
                  "interactive_hotspots"
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
                  "interactive_hotspots"
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
              selectedBlock.data.showHeading !==
              false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "interactive_hotspots"
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
              selectedBlock.data.showSubtitle !==
              false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "interactive_hotspots"
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

      {/* Background Image */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Background Image
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={() =>
              void uploadInteractiveHotspotsBackground(
                selectedBlock.id,
              )
            }
          >
            {selectedBlock.data
              .backgroundImageUrl
              ? "Replace Image"
              : "Upload Image"}
          </button>

          {selectedBlock.data
            .backgroundImageUrl ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
              onClick={() =>
                updateSelectedBlock(
                  (block: any) =>
                    block.type !==
                    "interactive_hotspots"
                      ? block
                      : {
                          ...block,

                          data: {
                            ...block.data,

                            backgroundImageUrl:
                              "",

                            backgroundImageStoragePath:
                              "",

                            backgroundImageMimeType:
                              "",

                            backgroundImageSizeBytes:
                              undefined,

                            backgroundImageOriginalSizeBytes:
                              undefined,
                          },
                        },
                )
              }
            >
              Remove Image
            </button>
          ) : null}
        </div>

        {selectedBlock.data
          .backgroundImageUrl ? (
          <div className="mt-3 h-32 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <img
              src={
                selectedBlock.data
                  .backgroundImageUrl
              }
              alt="Hotspot background preview"
              className="h-full w-full object-cover"
              style={{
                objectPosition: `${
                  selectedBlock.data
                    .backgroundPositionX ?? 50
                }% ${
                  selectedBlock.data
                    .backgroundPositionY ?? 50
                }%`,

                transform: `scale(${
                  selectedBlock.data
                    .backgroundZoom ?? 1
                })`,
              }}
            />
          </div>
        ) : null}

        {selectedBlock.data
          .backgroundImageUrl ? (
          <div className="mt-3 space-y-3">
            <div>
              <div
                className={inspectorLabelClass()}
              >
                Horizontal Position
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={
                  selectedBlock.data
                    .backgroundPositionX ?? 50
                }
                onChange={(e) =>
                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "interactive_hotspots"
                        ? block
                        : {
                            ...block,

                            data: {
                              ...block.data,

                              backgroundPositionX:
                                Number(
                                  e.target.value,
                                ),
                            },
                          },
                  )
                }
                className="mt-2 w-full"
              />
            </div>

            <div>
              <div
                className={inspectorLabelClass()}
              >
                Vertical Position
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={
                  selectedBlock.data
                    .backgroundPositionY ?? 50
                }
                onChange={(e) =>
                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "interactive_hotspots"
                        ? block
                        : {
                            ...block,

                            data: {
                              ...block.data,

                              backgroundPositionY:
                                Number(
                                  e.target.value,
                                ),
                            },
                          },
                  )
                }
                className="mt-2 w-full"
              />
            </div>

            <div>
              <div
                className={inspectorLabelClass()}
              >
                Background Zoom
              </div>

              <input
                type="range"
                min={50}
                max={300}
                value={Math.round(
                  (selectedBlock.data
                    .backgroundZoom ?? 1) *
                    100,
                )}
                onChange={(e) =>
                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "interactive_hotspots"
                        ? block
                        : {
                            ...block,

                            data: {
                              ...block.data,

                              backgroundZoom:
                                Number(
                                  e.target.value,
                                ) / 100,
                            },
                          },
                  )
                }
                className="mt-2 w-full"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Layout */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Layout
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Content Type
          </div>

          <select
            value={
              selectedBlock.data.layout ??
              "image"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "interactive_hotspots"
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
            <option value="image">
              Image
            </option>

            <option value="diagram">
              Diagram
            </option>

            <option value="map">
              Map
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Marker Style
          </div>

          <select
            value={
              selectedBlock.data.markerStyle ??
              "number"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "interactive_hotspots"
                    ? block
                    : {
                        ...block,

                        data: {
                          ...block.data,
                          markerStyle:
                            e.target.value,
                        },
                      },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="dot">
              Dot
            </option>

            <option value="number">
              Number
            </option>

            <option value="icon">
              Icon
            </option>

            <option value="pulse">
              Pulse
            </option>
          </select>
        </div>

<div className="mt-3">
  <div className={inspectorLabelClass()}>
    Detail Panel Position
  </div>

  <select
    value={
      selectedBlock.data.panelPosition ??
      "right"
    }
    onChange={(e) =>
      updateSelectedBlock(
        (block: any) =>
          block.type !==
          "interactive_hotspots"
            ? block
            : {
                ...block,

                data: {
                  ...block.data,
                  panelPosition:
                    e.target.value,
                },
              },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="left">
      Left
    </option>

    <option value="right">
      Right
    </option>

    <option value="bottom">
      Bottom
    </option>

    <option value="overlay">
      Overlay
    </option>
  </select>

  {selectedBlock.data.panelPosition ===
  "overlay" ? (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className={inspectorLabelClass()}>
        Overlay Panel Position
      </div>

      <div className="mt-3">
        <div className={inspectorLabelClass()}>
          Horizontal Position
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={
            selectedBlock.data
              .overlayPanelPositionX ?? 75
          }
          onChange={(e) =>
            updateSelectedBlock(
              (block: any) =>
                block.type !==
                "interactive_hotspots"
                  ? block
                  : {
                      ...block,

                      data: {
                        ...block.data,

                        overlayPanelPositionX:
                          Number(
                            e.target.value,
                          ),
                      },
                    },
            )
          }
          className="mt-2 w-full"
        />

        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data
            .overlayPanelPositionX ?? 75}
          %
        </div>
      </div>

      <div className="mt-3">
        <div className={inspectorLabelClass()}>
          Vertical Position
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={
            selectedBlock.data
              .overlayPanelPositionY ?? 72
          }
          onChange={(e) =>
            updateSelectedBlock(
              (block: any) =>
                block.type !==
                "interactive_hotspots"
                  ? block
                  : {
                      ...block,

                      data: {
                        ...block.data,

                        overlayPanelPositionY:
                          Number(
                            e.target.value,
                          ),
                      },
                    },
            )
          }
          className="mt-2 w-full"
        />

        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data
            .overlayPanelPositionY ?? 72}
          %
        </div>
      </div>
    </div>
  ) : null}
</div>
      </div>

      {/* Visibility */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Visibility
        </div>

        {[
          ["showMarkers", "Show markers"],
          [
            "showMarkerLabels",
            "Show marker labels",
          ],
          [
            "showHotspotImages",
            "Show hotspot images",
          ],
          [
            "showSubtitles",
            "Show hotspot subtitles",
          ],
          [
            "showDescriptions",
            "Show descriptions",
          ],
          ["showBadges", "Show badges"],
          ["showButtons", "Show buttons"],
          [
            "showConnectorLines",
            "Show connector lines",
          ],
          ["panelShadow", "Panel shadow"],
          ["markerShadow", "Marker shadow"],
          [
            "openFirstHotspot",
            "Open first hotspot initially",
          ],
        ].map(([key, label]) => (
          <label
            key={key}
            className="mt-2 flex items-center gap-2 text-sm text-neutral-700"
          >
            <input
              type="checkbox"
              checked={
                selectedBlock.data[key] !==
                false
              }
              onChange={(e) =>
                updateSelectedBlock(
                  (block: any) =>
                    block.type !==
                    "interactive_hotspots"
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
            "canvasHeight",
            "Canvas Height",
            220,
            1000,
            480,
          ],

          [
            "markerSize",
            "Marker Size",
            20,
            100,
            38,
          ],

          [
            "markerBorderWidth",
            "Marker Border Width",
            0,
            12,
            3,
          ],

          [
            "panelWidth",
            "Panel Width",
            220,
            640,
            320,
          ],

          [
            "panelPadding",
            "Panel Padding",
            0,
            48,
            18,
          ],

          [
            "panelRadius",
            "Panel Radius",
            0,
            48,
            18,
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
              <div
                className={inspectorLabelClass()}
              >
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
                onChange={(e) => {
                  const rawValue =
                    Number(e.target.value);

                  const value =
                    Number.isFinite(rawValue)
                      ? Math.max(
                          min as number,
                          Math.min(
                            max as number,
                            rawValue,
                          ),
                        )
                      : (fallback as number);

                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "interactive_hotspots"
                        ? block
                        : {
                            ...block,

                            data: {
                              ...block.data,

                              [key as string]:
                                value,
                            },
                          },
                  );
                }}
                className={inspectorInputClass()}
              />
            </div>
          ),
        )}
      </div>

      {/* Global Colors */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Global Colors
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <div
              className={`${inspectorLabelClass()} text-center`}
            >
              Canvas Color
            </div>

            <input
              type="color"
              value={
                selectedBlock.data
                  .canvasBackgroundColor ||
                "#F3F4F6"
              }
              onChange={(e) =>
                updateSelectedBlock(
                  (block: any) =>
                    block.type !==
                    "interactive_hotspots"
                      ? block
                      : {
                          ...block,

                          data: {
                            ...block.data,

                            canvasBackgroundColor:
                              e.target.value,
                          },
                        },
                )
              }
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
            />
          </div>

          <div>
            <div
              className={`${inspectorLabelClass()} text-center`}
            >
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
                    "interactive_hotspots"
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
                "interactive_hotspots"
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

          <option value="pop">
            Pop
          </option>

          <option value="pulse">
            Pulse
          </option>
        </select>
      </div>

      {/* Hotspots */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Hotspots
        </div>

        {hotspots.map(
          (
            hotspot: any,
            index: number,
          ) => (
            <div
              key={hotspot.id}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Hotspot {index + 1}
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Title
                </div>

                <input
                  value={
                    hotspot.title ?? ""
                  }
                  onChange={(e) =>
                    updateHotspot(
                      hotspot.id,
                      {
                        title:
                          e.target.value,
                      },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Subtitle
                </div>

                <input
                  value={
                    hotspot.subtitle ?? ""
                  }
                  onChange={(e) =>
                    updateHotspot(
                      hotspot.id,
                      {
                        subtitle:
                          e.target.value,
                      },
                    )
                  }
                  className={inspectorInputClass()}
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
                    hotspot.description ?? ""
                  }
                  onChange={(e) =>
                    updateHotspot(
                      hotspot.id,
                      {
                        description:
                          e.target.value,
                      },
                    )
                  }
                  className={inspectorTextareaClass()}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Badge
                  </div>

                  <input
                    value={
                      hotspot.badge ?? ""
                    }
                    onChange={(e) =>
                      updateHotspot(
                        hotspot.id,
                        {
                          badge:
                            e.target.value,
                        },
                      )
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Marker Label
                  </div>

                  <input
                    value={
                      hotspot.markerLabel ??
                      ""
                    }
                    onChange={(e) =>
                      updateHotspot(
                        hotspot.id,
                        {
                          markerLabel:
                            e.target.value,
                        },
                      )
                    }
                    className={inspectorInputClass()}
                  />
                </div>
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Icon
                </div>

                <select
                  value={
                    hotspot.iconName ??
                    "star"
                  }
                  onChange={(e) =>
                    updateHotspot(
                      hotspot.id,
                      {
                        iconName:
                          e.target.value,
                      },
                    )
                  }
                  className={inspectorInputClass()}
                >
                  <option value="star">
                    Star
                  </option>

                  <option value="info">
                    Information
                  </option>

                  <option value="target">
                    Target
                  </option>

                  <option value="check">
                    Check
                  </option>

                  <option value="heart">
                    Heart
                  </option>

                  <option value="flag">
                    Flag
                  </option>

                  <option value="lightbulb">
                    Idea
                  </option>

                  <option value="pin">
                    Pin
                  </option>

                  <option value="plus">
                    Plus
                  </option>
                </select>
              </div>

              {/* Position */}

              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Marker Position
                </div>

                <div className="mt-3">
                  <div
                    className={inspectorLabelClass()}
                  >
                    Horizontal Position
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={
                      hotspot.positionX ??
                      50
                    }
                    onChange={(e) =>
                      updateHotspot(
                        hotspot.id,
                        {
                          positionX:
                            Number(
                              e.target
                                .value,
                            ),
                        },
                      )
                    }
                    className="mt-2 w-full"
                  />

                  <div className="mt-1 text-xs text-neutral-500">
                    {hotspot.positionX ??
                      50}
                    %
                  </div>
                </div>

                <div className="mt-3">
                  <div
                    className={inspectorLabelClass()}
                  >
                    Vertical Position
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={
                      hotspot.positionY ??
                      50
                    }
                    onChange={(e) =>
                      updateHotspot(
                        hotspot.id,
                        {
                          positionY:
                            Number(
                              e.target
                                .value,
                            ),
                        },
                      )
                    }
                    className="mt-2 w-full"
                  />

                  <div className="mt-1 text-xs text-neutral-500">
                    {hotspot.positionY ??
                      50}
                    %
                  </div>
                </div>
              </div>

              {/* Detail Image */}

              <div className="mt-4">
                <div
                  className={inspectorLabelClass()}
                >
                  Detail Image
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={() =>
                      void uploadImageToInteractiveHotspot(
                        selectedBlock.id,
                        hotspot.id,
                      )
                    }
                  >
                    {hotspot.imageUrl
                      ? "Replace Image"
                      : "Upload Image"}
                  </button>

                  {hotspot.imageUrl ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() =>
                        updateHotspot(
                          hotspot.id,
                          {
                            imageUrl: "",
                            imageStoragePath:
                              "",
                            imageMimeType: "",
                            imageSizeBytes:
                              undefined,
                            imageOriginalSizeBytes:
                              undefined,
                          },
                        )
                      }
                    >
                      Remove Image
                    </button>
                  ) : null}
                </div>

                {hotspot.imageUrl ? (
                  <div className="mt-3 h-28 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <img
                      src={
                        hotspot.imageUrl
                      }
                      alt={
                        hotspot.title
                          ? `${hotspot.title} preview`
                          : `Hotspot ${index + 1} preview`
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>

              {/* Marker Colors */}

              <div className="mt-4">
                <div
                  className={inspectorLabelClass()}
                >
                  Marker Colors
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <div
                      className={`${inspectorLabelClass()} text-center`}
                    >
                      Text
                    </div>

                    <input
                      type="color"
                      value={
                        hotspot.markerColor ||
                        "#FFFFFF"
                      }
                      onChange={(e) =>
                        updateHotspot(
                          hotspot.id,
                          {
                            markerColor:
                              e.target
                                .value,
                          },
                        )
                      }
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                    />
                  </div>

                  <div>
                    <div
                      className={`${inspectorLabelClass()} text-center`}
                    >
                      Background
                    </div>

                    <input
                      type="color"
                      value={
                        hotspot.markerBackgroundColor ||
                        "#2563EB"
                      }
                      onChange={(e) =>
                        updateHotspot(
                          hotspot.id,
                          {
                            markerBackgroundColor:
                              e.target
                                .value,
                          },
                        )
                      }
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                    />
                  </div>

                  <div>
                    <div
                      className={`${inspectorLabelClass()} text-center`}
                    >
                      Border
                    </div>

                    <input
                      type="color"
                      value={
                        hotspot.markerBorderColor ||
                        "#FFFFFF"
                      }
                      onChange={(e) =>
                        updateHotspot(
                          hotspot.id,
                          {
                            markerBorderColor:
                              e.target
                                .value,
                          },
                        )
                      }
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Panel Colors */}

              <div className="mt-4">
                <div
                  className={inspectorLabelClass()}
                >
                  Detail Panel Colors
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <div
                      className={`${inspectorLabelClass()} text-center`}
                    >
                      Background
                    </div>

                    <input
                      type="color"
                      value={
                        hotspot.panelBackgroundColor ||
                        "#FFFFFF"
                      }
                      onChange={(e) =>
                        updateHotspot(
                          hotspot.id,
                          {
                            panelBackgroundColor:
                              e.target
                                .value,
                          },
                        )
                      }
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                    />
                  </div>

                  <div>
                    <div
                      className={`${inspectorLabelClass()} text-center`}
                    >
                      Border
                    </div>

                    <input
                      type="color"
                      value={
                        hotspot.panelBorderColor ||
                        "#E5E7EB"
                      }
                      onChange={(e) =>
                        updateHotspot(
                          hotspot.id,
                          {
                            panelBorderColor:
                              e.target
                                .value,
                          },
                        )
                      }
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                    />
                  </div>

                  <div>
                    <div
                      className={`${inspectorLabelClass()} text-center`}
                    >
                      Accent
                    </div>

                    <input
                      type="color"
                      value={
                        hotspot.accentColor ||
                        "#2563EB"
                      }
                      onChange={(e) =>
                        updateHotspot(
                          hotspot.id,
                          {
                            accentColor:
                              e.target
                                .value,
                          },
                        )
                      }
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Button */}

              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Button
                </div>

                <div className="mt-3">
                  <div
                    className={inspectorLabelClass()}
                  >
                    Button Label
                  </div>

                  <input
                    value={
                      hotspot.buttonLabel ??
                      ""
                    }
                    onChange={(e) =>
                      updateHotspot(
                        hotspot.id,
                        {
                          buttonLabel:
                            e.target.value,
                        },
                      )
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div className="mt-3">
                  <div
                    className={inspectorLabelClass()}
                  >
                    Link
                  </div>

                  <input
                    value={
                      hotspot.href ?? ""
                    }
                    onChange={(e) =>
                      updateHotspot(
                        hotspot.id,
                        {
                          href:
                            e.target.value,
                        },
                      )
                    }
                    placeholder="https://..."
                    className={inspectorInputClass()}
                  />
                </div>

                <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={Boolean(
                      hotspot.openInNewTab,
                    )}
                    onChange={(e) =>
                      updateHotspot(
                        hotspot.id,
                        {
                          openInNewTab:
                            e.target.checked,
                        },
                      )
                    }
                  />

                  Open in new tab
                </label>
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
                      "interactive_hotspots"
                        ? block
                        : {
                            ...block,

                            data: {
                              ...block.data,

                              hotspots: (
                                block.data
                                  .hotspots ?? []
                              ).filter(
                                (
                                  item: any,
                                ) =>
                                  item.id !==
                                  hotspot.id,
                              ),
                            },
                          },
                  )
                }
              >
                Remove Hotspot
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
                "interactive_hotspots"
                  ? block
                  : {
                      ...block,

                      data: {
                        ...block.data,

                        hotspots: [
                          ...(block.data
                            .hotspots ?? []),

                          {
                            id: makeClientId(
                              "interactivehotspot",
                            ),

                            title:
                              "New Hotspot",

                            subtitle:
                              "Supporting detail",

                            description:
                              "Explain what visitors should know about this highlighted area.",

                            badge: "",

                            markerLabel:
                              String(
                                (
                                  block.data
                                    .hotspots ??
                                  []
                                ).length +
                                  1,
                              ),

                            iconName:
                              "info",

                            positionX: 50,
                            positionY: 50,

                            imageUrl: "",
                            imageStoragePath:
                              "",
                            imageMimeType:
                              "",

                            markerColor:
                              "#FFFFFF",

                            markerBackgroundColor:
                              "#2563EB",

                            markerBorderColor:
                              "#FFFFFF",

                            panelBackgroundColor:
                              "#FFFFFF",

                            panelBorderColor:
                              "#BFDBFE",

                            accentColor:
                              "#2563EB",

                            href: "",

                            buttonLabel:
                              "Learn More",

                            openInNewTab:
                              false,
                          },
                        ],
                      },
                    },
            )
          }
        >
          Add Hotspot
        </button>
      </div>
    </div>
  );
}