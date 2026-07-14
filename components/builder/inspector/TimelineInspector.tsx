"use client";

import type { Dispatch, SetStateAction } from "react";

import type {
  TimelineStyleTarget,
  TimelineTextTarget,
} from "@/components/builder/formatting/timelineFormatting";

type TimelineInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  timelineTextTarget: TimelineTextTarget;
  setTimelineTextTarget: Dispatch<SetStateAction<TimelineTextTarget>>;

  timelineStyleTarget: TimelineStyleTarget;
  setTimelineStyleTarget: Dispatch<SetStateAction<TimelineStyleTarget>>;

  focusedTimelineEntryId: string | null;

  makeClientId: (prefix: string) => string;
  uploadImageToSelectedBlock: (...args: any[]) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function TimelineInspector({
  selectedBlock,
  updateSelectedBlock,
  timelineTextTarget,
  setTimelineTextTarget,
  timelineStyleTarget,
  setTimelineStyleTarget,
  focusedTimelineEntryId,
  makeClientId,
  uploadImageToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
}: TimelineInspectorProps) {
return (
  <div id="inspector-timeline" className={inspectorCardClass()}>
    {/* Formatting */}
    <div className={inspectorLabelClass()}>Formatting</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Text Target</div>

      <select
        value={timelineTextTarget}
        onChange={(e) =>
          setTimelineTextTarget(e.target.value as TimelineTextTarget)
        }
        className={inspectorInputClass()}
      >
        <option value="heading">Heading</option>
        <option value="date">Date</option>
        <option value="title">Title</option>
        <option value="subtitle">Subtitle</option>
        <option value="description">Description</option>
        <option value="ctaLabel">CTA Label</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Target</div>

      <select
        value={timelineStyleTarget}
        onChange={(e) =>
          setTimelineStyleTarget(e.target.value as TimelineStyleTarget)
        }
        className={inspectorInputClass()}
      >
        <option value="tile">Tile</option>
        <option value="ctaLabel">CTA Label</option>
        <option value="block">Block</option>
      </select>
    </div>

    {/* Story Timeline */}
    <div className="mt-6">
      <div className={inspectorLabelClass()}>Story Timeline</div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "timeline"
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

<div className="mt-4">
  <div className={inspectorLabelClass()}>Style Variant</div>

  <select
    value={selectedBlock.data.styleVariant ?? "classic"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "timeline"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                styleVariant: e.target.value as any,
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="classic">Classic Vertical</option>
    <option value="alternating">Alternating Vertical</option>
    <option value="horizontal">Horizontal Timeline</option>
    <option value="journey">Curved Journey</option>
    <option value="memory">Memory Cards</option>
  </select>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Card Layout</div>

  <select
    value={(selectedBlock.data as any).cardLayout ?? "standard"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "timeline"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                cardLayout: e.target.value as
                  | "standard"
                  | "spotlight"
                  | "story",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="standard">Standard</option>
    <option value="spotlight">Spotlight</option>
    <option value="story">Story</option>
  </select>
</div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Direction</div>
        <select
          value={selectedBlock.data.direction ?? "ascending"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      direction: e.target.value as "ascending" | "descending",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Connector</div>
        <select
          value={selectedBlock.data.connectorStyle ?? "solid"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      connectorStyle: e.target.value as any,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Connector Thickness</div>
      <input
        type="range"
        min={1}
        max={12}
        step={1}
        value={Number(selectedBlock.data.connectorThickness ?? 3)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    connectorThickness: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

{selectedBlock.data.styleVariant === "journey" ? (
  <>
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Connector Height</div>
      <input
        type="range"
        min={120}
        max={360}
        step={10}
        value={Number((selectedBlock.data as any).journeyConnectorHeight ?? 170)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    journeyConnectorHeight: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {Number((selectedBlock.data as any).journeyConnectorHeight ?? 170)}px
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Cards Per Row</div>
      <select
        value={Number((selectedBlock.data as any).journeyCardsPerRow ?? 3)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    journeyCardsPerRow: Number(e.target.value),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value={1}>1 Card</option>
        <option value={2}>2 Cards</option>
        <option value={3}>3 Cards</option>
        <option value={4}>4 Cards</option>
        <option value={5}>5 Cards</option>
      </select>
    </div>
  </>
) : null}

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Line Color</div>
        <input
          type="color"
          value={selectedBlock.data.lineColor ?? "#CBD5E1"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      lineColor: e.target.value,
                    },
                  },
            )
          }
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Node Color</div>
        <input
          type="color"
          value={selectedBlock.data.nodeColor ?? "#2563EB"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      nodeColor: e.target.value,
                    },
                  },
            )
          }
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
        />
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Card Width</div>
      <input
        type="range"
        min={160}
        max={520}
        step={10}
        value={Number((selectedBlock.data as any).cardWidth ?? 260)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cardWidth: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {Number((selectedBlock.data as any).cardWidth ?? 260)}px
      </div>
    </div>

{selectedBlock.data.styleVariant !== "journey" ? (
  <div className="mt-4">
    <div className={inspectorLabelClass()}>Spacing</div>
    <input
      type="range"
      min={0}
      max={80}
      step={1}
      value={Number(selectedBlock.data.spacing ?? 24)}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "timeline"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  spacing: Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />
  </div>
) : null}

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.shadow !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      shadow: e.target.checked,
                    },
                  },
            )
          }
        />
        Card Shadow
      </label>
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Entries</div>

      <div className="mt-3 space-y-3">
        {(selectedBlock.data.entries ?? []).map((entry: any) => (
<div
  key={entry.id}
  id={`timeline-entry-inspector-${entry.id}`}
  className={[
    "rounded-xl border p-3 transition",
    focusedTimelineEntryId === entry.id
      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
      : "border-neutral-200 bg-neutral-50",
  ].join(" ")}
>
            <div className={inspectorLabelClass()}>Date / Year</div>
            <input
              type="text"
              value={entry.date ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "timeline"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          entries: block.data.entries.map((item: any) =>
                            item.id === entry.id
                              ? { ...item, date: e.target.value }
                              : item,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Title</div>
              <input
                type="text"
                value={entry.title ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "timeline"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            entries: block.data.entries.map((item: any) =>
                              item.id === entry.id
                                ? { ...item, title: e.target.value }
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
              <div className={inspectorLabelClass()}>Subtitle</div>
              <input
                type="text"
                value={entry.subtitle ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "timeline"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            entries: block.data.entries.map((item: any) =>
                              item.id === entry.id
                                ? { ...item, subtitle: e.target.value }
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
  <div className={inspectorLabelClass()}>Description</div>
  <textarea
    value={entry.description ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "timeline"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                entries: block.data.entries.map((item: any) =>
                  item.id === entry.id
                    ? { ...item, description: e.target.value }
                    : item,
                ),
              },
            },
      )
    }
    className={inspectorTextareaClass()}
  />
</div>

{selectedBlock.data.styleVariant !== "classic" &&
selectedBlock.data.styleVariant !== "alternating" ? (
  <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
    <div className={inspectorLabelClass()}>Placement</div>

    <label className="mt-2 flex items-center gap-3 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={(entry as any).useDefaultPlacement !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    entries: block.data.entries.map((item: any) =>
                      item.id === entry.id
                        ? {
                            ...item,
                            useDefaultPlacement: e.target.checked,
                            placementOffset: e.target.checked
                              ? 0
                              : ((item as any).placementOffset ?? 0),
                          }
                        : item,
                    ),
                  },
                },
          )
        }
      />
      Default Alignment
    </label>

    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <div className={inspectorLabelClass()}>Height Placement</div>
        <div className="text-xs text-neutral-500">
          {Number((entry as any).placementOffset ?? 0)}px
        </div>
      </div>

      <input
        type="range"
        min={-160}
        max={160}
        step={5}
        value={Number((entry as any).placementOffset ?? 0)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    entries: block.data.entries.map((item: any) =>
                      item.id === entry.id
                        ? {
                            ...item,
                            useDefaultPlacement: false,
                            placementOffset: Number(e.target.value),
                          }
                        : item,
                    ),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>
  </div>
) : null}
<div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
  <div className={inspectorLabelClass()}>Image</div>

  <button
    type="button"
    className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
onClick={() =>
  void uploadImageToSelectedBlock(selectedBlock.id, entry.id)
}
  >
    Select Image
  </button>

  {entry.imageUrl ? (
    <button
      type="button"
      className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-700 hover:bg-neutral-100"
      onClick={() =>
        updateSelectedBlock((block: any) =>
          block.type !== "timeline"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  entries: block.data.entries.map((item: any) =>
                    item.id === entry.id
                      ? {
                          ...item,
                          imageUrl: "",
                          icon: "/media-icons/star.svg",
                          imageSize: 64,
                        }
                      : item,
                  ),
                },
              },
        )
      }
    >
      Reset Image
    </button>
  ) : null}

  <div className="mt-3">
    <div className="mb-1 flex items-center justify-between">
      <div className={inspectorLabelClass()}>Image Size</div>

      <div className="text-xs text-neutral-500">
        {Number((entry as any).imageSize ?? 64)}px
      </div>
    </div>

    <input
      type="range"
      min={24}
      max={160}
      step={2}
      value={Number((entry as any).imageSize ?? 64)}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "timeline"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  entries: block.data.entries.map((item: any) =>
                    item.id === entry.id
                      ? {
                          ...item,
                          imageSize: Number(e.target.value),
                        }
                      : item,
                  ),
                },
              },
        )
      }
      className="w-full"
    />
  </div>
</div>

<div className="mt-3">
  <div className={inspectorLabelClass()}>Card Fill Color</div>
  <input
    type="color"
    value={(entry as any).cardBackground ?? selectedBlock.data.cardBackground ?? "#FFFFFF"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "timeline"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                entries: block.data.entries.map((item: any) =>
                  item.id === entry.id
                    ? { ...item, cardBackground: e.target.value }
                    : item,
                ),
              },
            },
      )
    }
    className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
  />
</div>

<div className="mt-3 grid grid-cols-2 gap-3">
  <div>
    <div className={inspectorLabelClass()}>Accent</div>
                <input
                  type="color"
                  value={entry.accentColor ?? "#2563EB"}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "timeline"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              entries: block.data.entries.map((item: any) =>
                                item.id === entry.id
                                  ? { ...item, accentColor: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>Frame</div>
                <select
                  value={entry.imageShape ?? "circle"}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "timeline"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              entries: block.data.entries.map((item: any) =>
                                item.id === entry.id
                                  ? { ...item, imageShape: e.target.value as any }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                >
                  <option value="circle">Circle</option>
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                  <option value="diamond">Diamond</option>
                  <option value="hexagon">Hexagon</option>
                  <option value="blob">Blob</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className={inspectorLabelClass()}>CTA Label</div>
                <input
                  type="text"
                  value={entry.ctaLabel ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "timeline"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              entries: block.data.entries.map((item: any) =>
                                item.id === entry.id
                                  ? { ...item, ctaLabel: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>CTA URL</div>
                <input
                  type="text"
                  value={entry.ctaUrl ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "timeline"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              entries: block.data.entries.map((item: any) =>
                                item.id === entry.id
                                  ? { ...item, ctaUrl: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "timeline"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            entries: block.data.entries.filter(
                              (item: any) => item.id !== entry.id,
                            ),
                          },
                        },
                  )
                }
                title="Remove timeline entry"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className={toolSetButtonClass("front")}
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      entries: [
                        ...block.data.entries,
                        {
                          id: makeClientId("timelineentry"),
                          date: "New Date",
                          title: "New Timeline Entry",
                          subtitle: "",
                          description: "Add a short description.",
                          imageUrl: "",
                          icon: "/media-icons/star.svg",
                          imageSize: 64,
                          imageShape: "circle",
                          accentColor: block.data.nodeColor ?? "#2563EB",
                          cardBackground: block.data.cardBackground ?? "#FFFFFF",
                          alignment: "auto",
                          animation: "fade",
                          useDefaultPlacement: true,
                          placementOffset: 0,
                          ctaLabel: "",
                          ctaUrl: "",
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Timeline Entry
        </button>
      </div>
    </div>
    </div>
  );
}