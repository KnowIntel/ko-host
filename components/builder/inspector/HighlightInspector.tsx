"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  HighlightStyleTarget,
  HighlightTextTarget,
} from "@/components/builder/formatting/highlightFormatting";


/**
 * Highlight inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "highlight"
 */

type HighlightInspectorSectionProps = {
  selectedBlock: any;
  draft: any;

  updateSelectedBlock: any;

  highlightTextTarget: HighlightTextTarget;
  setHighlightTextTarget: Dispatch<SetStateAction<HighlightTextTarget>>;

  highlightUnifiedStyleTarget: HighlightStyleTarget;
  setHighlightUnifiedStyleTarget: Dispatch<
    SetStateAction<HighlightStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  uploadBuilderImageFile: (file: File) => Promise<any>;
  setEditorUploadError: (message: string) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function HighlightInspector({
  selectedBlock,
  draft,
  updateSelectedBlock,

  highlightTextTarget,
  setHighlightTextTarget,

  highlightUnifiedStyleTarget,
  setHighlightUnifiedStyleTarget,

  makeClientId,
  uploadBuilderImageFile,
  setEditorUploadError,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: HighlightInspectorSectionProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Highlight */}
    <div className={inspectorLabelClass()}>Highlight</div>
<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>

    <select
      value={highlightTextTarget}
      onChange={(e) =>
        setHighlightTextTarget(
          e.target.value as HighlightTextTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="heading">Heading</option>
      <option value="subtitle">Subtitle</option>
      <option value="label">Label</option>
      <option value="linearUnitLabel">Linear Unit Label</option>
      <option value="value">Value</option>
      <option value="prefix">Prefix</option>
      <option value="suffix">Suffix</option>
      <option value="description">Description</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Style Target</div>

    <select
      value={highlightUnifiedStyleTarget}
      onChange={(e) =>
        setHighlightUnifiedStyleTarget(
          e.target.value as HighlightStyleTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="section">Section</option>
      <option value="block">Block</option>
    </select>
  </div>
</div>
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
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

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={selectedBlock.data.showHeading !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <input
        type="text"
        value={selectedBlock.data.subtitle ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
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
        className={inspectorInputClass()}
      />
    </div>

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={selectedBlock.data.showSubtitle === true}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Display Style</div>
      <select
        value={selectedBlock.data.displayStyle ?? "grid"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    displayStyle: e.target.value as "grid" | "list" | "linear",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="grid">Grid</option>
        <option value="list">List</option>
        <option value="linear">Linear</option>
      </select>
    </div>

    {selectedBlock.data.displayStyle === "linear" ? (
  <>
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Line Divider</div>
      <select
        value={selectedBlock.data.linearDividerStyle ?? "closed_solid"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    linearDividerStyle: e.target.value as
                      | "none"
                      | "closed_solid"
                      | "open_solid"
                      | "closed_dotted"
                      | "open_dotted",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="none">None</option>
        <option value="closed_solid">Closed Solid Line</option>
        <option value="open_solid">Open Solid Line</option>
        <option value="closed_dotted">Closed Dotted Line</option>
        <option value="open_dotted">Open Dotted Line</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Divider Line Color</div>
      <input
        type="color"
        value={
          selectedBlock.data.linearDividerColor?.startsWith("#")
            ? selectedBlock.data.linearDividerColor
            : "#d1d5db"
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    linearDividerColor: e.target.value,
                  },
                },
          )
        }
        className="h-10 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
      />
    </div>
  </>
) : null}

    <div className="mt-4">
  <div className={inspectorLabelClass()}>Rotation</div>
  <input
    type="range"
    min={-45}
    max={45}
    step={1}
    value={selectedBlock.data.rotation ?? 0}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "highlight"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                rotation: Number(e.target.value) || 0,
              },
            },
      )
    }
    className="w-full"
  />
  <div className="mt-1 text-xs text-neutral-500">
    {selectedBlock.data.rotation ?? 0}°
  </div>
</div>

<div className="mt-5">
  <div className={inspectorLabelClass()}>Highlight Cards</div>
</div>

    <div className="mt-3 grid gap-4">
      {(selectedBlock.data.cards ?? []).map((card: any, cardIndex: number) => (
        <div
          key={card.id}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-neutral-700">
              Card {cardIndex + 1}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "highlight") return block;

                    const cards = [...(block.data.cards ?? [])];
                    if (cardIndex <= 0) return block;

                    [cards[cardIndex - 1], cards[cardIndex]] = [
                      cards[cardIndex],
                      cards[cardIndex - 1],
                    ];

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        cards,
                      },
                    };
                  })
                }
              >
                ↑
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "highlight") return block;

                    const cards = [...(block.data.cards ?? [])];
                    if (cardIndex >= cards.length - 1) return block;

                    [cards[cardIndex], cards[cardIndex + 1]] = [
                      cards[cardIndex + 1],
                      cards[cardIndex],
                    ];

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        cards,
                      },
                    };
                  })
                }
              >
                ↓
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "highlight"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            cards: [
                              ...(block.data.cards ?? []).slice(0, cardIndex + 1),
                              {
                                ...card,
                                id: makeClientId("highlight"),
                              },
                              ...(block.data.cards ?? []).slice(cardIndex + 1),
                            ],
                          },
                        },
                  )
                }
              >
                Duplicate
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "highlight"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            cards: (block.data.cards ?? []).filter(
                              (item: any) => item.id !== card.id,
                            ),
                          },
                        },
                  )
                }
              >
                Remove
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Highlight Type</div>
            <select
              value={card.type}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "highlight"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          cards: (block.data.cards ?? []).map((item: any) =>
                            item.id !== card.id
                              ? item
                              : {
                                  ...item,
                                  type: e.target.value as any,
                                  label:
                                    e.target.value === "money_raised"
                                      ? "Raised"
                                      : e.target.value === "progress"
                                        ? "Progress"
                                        : e.target.value === "countdown"
                                          ? "Days Left"
                                          : e.target.value === "rsvp_count"
                                            ? "Guests Attending"
                                            : e.target.value === "poll_result"
                                              ? "Poll Result"
                                              : e.target.value === "visitor_count"
                                                ? "Page Views"
                                              : e.target.value === "enrollment_records"
                                                ? "Members Joined"
                                                : e.target.value === "calendar_events"
                                                  ? "Events"
                                                  : e.target.value === "post_board_discussions"
                                                    ? "Discussions"
                                                    : item.label || "New Stat",
                                },
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            >
              <option value="manual_stat">Manual Stat</option>
              <option value="money_raised">Money Raised</option>
              <option value="progress">Progress</option>
              <option value="countdown">Countdown</option>
              <option value="rsvp_count">RSVP Count</option>
              <option value="poll_result">Poll Result</option>
              <option value="visitor_count">Visitor Count</option>
              <option value="enrollment_records">Enrollment Records</option>
              <option value="calendar_events">Calendar Events</option>
              <option value="post_board_discussions">Post Board Discussions</option>
            </select>
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Label</div>
            <input
              type="text"
              value={card.label ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "highlight"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          cards: (block.data.cards ?? []).map((item: any) =>
                            item.id === card.id
                              ? { ...item, label: e.target.value }
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
  <div className={inspectorLabelClass()}>Linear Unit Label</div>
  <input
    type="text"
    value={card.unitLabel ?? card.linearLabel ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "highlight"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                cards: (block.data.cards ?? []).map((item: any) =>
                  item.id === card.id
                    ? {
                        ...item,
                        unitLabel: e.target.value,
                        linearLabel: e.target.value,
                      }
                    : item,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
    placeholder="Members, Views, Raised, Days"
  />
</div>

          {card.type === "manual_stat" ? (
            <div className="mt-3">
              <div className={inspectorLabelClass()}>Value</div>
              <input
                type="text"
                value={card.value ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "highlight"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            cards: (block.data.cards ?? []).map((item: any) =>
                              item.id === card.id
                                ? { ...item, value: e.target.value }
                                : item,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>
          ) : null}

          {card.type === "money_raised" ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className={inspectorLabelClass()}>Amount</div>
                <input
                  type="number"
                  value={card.amount ?? 0}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "highlight"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              cards: (block.data.cards ?? []).map((item: any) =>
                                item.id === card.id
                                  ? { ...item, amount: Number(e.target.value) || 0 }
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
                <div className={inspectorLabelClass()}>Goal</div>
                <input
                  type="number"
                  value={card.goalAmount ?? 0}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "highlight"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              cards: (block.data.cards ?? []).map((item: any) =>
                                item.id === card.id
                                  ? { ...item, goalAmount: Number(e.target.value) || 0 }
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
          ) : null}

          {card.type === "progress" ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className={inspectorLabelClass()}>Current</div>
                <input
                  type="number"
                  value={card.currentValue ?? 0}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "highlight"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              cards: (block.data.cards ?? []).map((item: any) =>
                                item.id === card.id
                                  ? { ...item, currentValue: Number(e.target.value) || 0 }
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
                <div className={inspectorLabelClass()}>Goal</div>
                <input
                  type="number"
                  value={card.goalValue ?? 0}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "highlight"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              cards: (block.data.cards ?? []).map((item: any) =>
                                item.id === card.id
                                  ? { ...item, goalValue: Number(e.target.value) || 0 }
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
          ) : null}

          {card.type === "countdown" ? (
            <div className="mt-3 grid gap-3">
              <div>
                <div className={inspectorLabelClass()}>Target Date</div>
                <input
                  type="date"
                  value={card.targetDate ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "highlight"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              cards: (block.data.cards ?? []).map((item: any) =>
                                item.id === card.id
                                  ? { ...item, targetDate: e.target.value }
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
                <div className={inspectorLabelClass()}>Countdown Units</div>
                <select
                  value={card.countdownUnits ?? "days"}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "highlight"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              cards: (block.data.cards ?? []).map((item: any) =>
                                item.id === card.id
                                  ? { ...item, countdownUnits: e.target.value as any }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                >
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
          ) : null}

{[
  "rsvp_count",
  "poll_result",
  "visitor_count",
  "enrollment_records",
  "calendar_events",
  "post_board_discussions",
].includes(card.type) ? (
  <div className="mt-3 grid gap-3">
    {card.type === "rsvp_count" ? (
      <>
        <div>
          <div className={inspectorLabelClass()}>Source RSVP/Form Block</div>
          <select
            value={card.sourceFormBlockId ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "highlight"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cards: (block.data.cards ?? []).map((item: any) =>
                          item.id === card.id
                            ? {
                                ...item,
                                sourceType: "rsvp",
                                sourceFormBlockId: e.target.value,
                              }
                            : item,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="">Select RSVP/form block</option>
            {draft.blocks
.filter((block: any) => block.type === "form_field")
.map((formBlock: any) => (
                <option key={formBlock.id} value={formBlock.id}>
                  {formBlock.label || formBlock.data.label || "Form Field"}
                </option>
              ))}
          </select>
        </div>

        <div>
          <div className={inspectorLabelClass()}>Count Type</div>
          <select
            value={card.countType ?? "total_responses"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "highlight"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cards: (block.data.cards ?? []).map((item: any) =>
                          item.id === card.id
                            ? { ...item, countType: e.target.value }
                            : item,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="maybe">Maybe</option>
            <option value="total_responses">Total Responses</option>
          </select>
        </div>
      </>
    ) : null}

    {card.type === "poll_result" ? (
      <>
        <div>
          <div className={inspectorLabelClass()}>Source Poll Block</div>
          <select
            value={card.sourceBlockId ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "highlight"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cards: (block.data.cards ?? []).map((item: any) =>
                          item.id === card.id
                            ? {
                                ...item,
                                sourceType: "poll",
                                sourceBlockId: e.target.value,
                              }
                            : item,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="">Select poll block</option>
            {draft.blocks
.filter((block: any) => block.type === "poll")
.map((pollBlock: any) => (
                <option key={pollBlock.id} value={pollBlock.id}>
                  {pollBlock.data.question || pollBlock.label || "Poll"}
                </option>
              ))}
          </select>
        </div>

        <div>
          <div className={inspectorLabelClass()}>Display Type</div>
          <select
            value={card.displayType ?? "count"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "highlight"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cards: (block.data.cards ?? []).map((item: any) =>
                          item.id === card.id
                            ? { ...item, displayType: e.target.value as any }
                            : item,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="count">Vote Count</option>
            <option value="percentage">Percentage</option>
            <option value="winner">Winning Option</option>
          </select>
        </div>

        <div>
          <div className={inspectorLabelClass()}>Poll Option ID</div>
          <input
            type="text"
            value={card.pollOptionId ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "highlight"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cards: (block.data.cards ?? []).map((item: any) =>
                          item.id === card.id
                            ? { ...item, pollOptionId: e.target.value }
                            : item,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
            placeholder="Optional for later live result lookup"
          />
        </div>
      </>
    ) : null}

    {card.type === "visitor_count" ? (
      <div>
        <div className={inspectorLabelClass()}>Metric Type</div>
        <select
          value={card.countType ?? "total_visits"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "highlight"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      cards: (block.data.cards ?? []).map((item: any) =>
                        item.id === card.id
                          ? {
                              ...item,
                              sourceType: "visitor_counter",
                              countType: e.target.value,
                            }
                          : item,
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="total_visits">Total Visits</option>
          <option value="unique_visitors">Unique Visitors</option>
          <option value="todays_visits">Today’s Visits</option>
        </select>
      </div>
    ) : null}

    {card.type === "enrollment_records" ? (
      <>
        <div>
          <div className={inspectorLabelClass()}>Source Enrollment Board Block</div>
          <select
            value={card.sourceBlockId ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "highlight"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cards: (block.data.cards ?? []).map((item: any) =>
                          item.id === card.id
                            ? {
                                ...item,
                                sourceType: "enrollment_board",
                                sourceBlockId: e.target.value,
                              }
                            : item,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="">Select enrollment board block</option>
            {draft.blocks
.filter((block: any) => block.type === "enrollment_board")
.map((enrollmentBlock: any) => (
                <option key={enrollmentBlock.id} value={enrollmentBlock.id}>
                  {enrollmentBlock.label || "Enrollment Board"}
                </option>
              ))}
          </select>
        </div>

        <div>
          <div className={inspectorLabelClass()}>Count Type</div>
          <select
            value={card.countType ?? "active_enrollments"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "highlight"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cards: (block.data.cards ?? []).map((item: any) =>
                          item.id === card.id
                            ? { ...item, countType: e.target.value }
                            : item,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="active_enrollments">Active Enrollments</option>
            <option value="total_submissions">Total Submissions</option>
          </select>
        </div>
      </>
    ) : null}

    <div>
      <div className={inspectorLabelClass()}>Manual Fallback Value</div>
      <input
        type="text"
        value={card.fallbackValue ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cards: (block.data.cards ?? []).map((item: any) =>
                      item.id === card.id
                        ? { ...item, fallbackValue: e.target.value }
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
) : null}

{card.type === "calendar_events" ? (
  <>
    <div>
      <div className={inspectorLabelClass()}>Source Calendar/Schedule Block</div>
      <select
        value={card.sourceBlockId ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cards: (block.data.cards ?? []).map((item: any) =>
                      item.id === card.id
                        ? {
                            ...item,
                            sourceBlockId: e.target.value,
                            countType: "total_events",
                          }
                        : item,
                    ),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="">Select schedule/calendar block</option>
        {draft.blocks
.filter((block: any) => block.type === "schedule_agenda")
.map((scheduleBlock: any) => (
            <option key={scheduleBlock.id} value={scheduleBlock.id}>
              {scheduleBlock.label || "Schedule / Agenda"}
            </option>
          ))}
      </select>
    </div>

    <div>
      <div className={inspectorLabelClass()}>Count Type</div>
      <select
        value={card.countType ?? "total_events"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cards: (block.data.cards ?? []).map((item: any) =>
                      item.id === card.id
                        ? { ...item, countType: e.target.value }
                        : item,
                    ),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="total_events">Total Events</option>
      </select>
    </div>
  </>
) : null}

{card.type === "post_board_discussions" ? (
  <>
    <div>
      <div className={inspectorLabelClass()}>Source Post Board Block</div>
      <select
        value={card.sourceBlockId ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cards: (block.data.cards ?? []).map((item: any) =>
                      item.id === card.id
                        ? {
                            ...item,
                            sourceBlockId: e.target.value,
                            countType: "top_level_posts",
                          }
                        : item,
                    ),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="">Select post board block</option>
        {draft.blocks
.filter((block: any) => block.type === "post_board")
.map((postBoardBlock: any) => (
            <option key={postBoardBlock.id} value={postBoardBlock.id}>
              {postBoardBlock.label || "Post Board"}
            </option>
          ))}
      </select>
    </div>

    <div>
      <div className={inspectorLabelClass()}>Count Type</div>
      <select
        value={card.countType ?? "top_level_posts"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cards: (block.data.cards ?? []).map((item: any) =>
                      item.id === card.id
                        ? { ...item, countType: e.target.value }
                        : item,
                    ),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="top_level_posts">Initiation Posts Only</option>
      </select>
    </div>
  </>
) : null}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className={inspectorLabelClass()}>Prefix</div>
              <input
                type="text"
                value={card.prefix ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "highlight"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            cards: (block.data.cards ?? []).map((item: any) =>
                              item.id === card.id
                                ? { ...item, prefix: e.target.value }
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
              <div className={inspectorLabelClass()}>Suffix</div>
              <input
                type="text"
                value={card.suffix ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "highlight"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            cards: (block.data.cards ?? []).map((item: any) =>
                              item.id === card.id
                                ? { ...item, suffix: e.target.value }
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

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Description</div>
            <textarea
              value={card.description ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "highlight"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          cards: (block.data.cards ?? []).map((item: any) =>
                            item.id === card.id
                              ? { ...item, description: e.target.value }
                              : item,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
              rows={2}
            />
          </div>

          <div className="mt-3">
  <div className={inspectorLabelClass()}>Linear Image</div>

  {card.imageUrl ? (
    <div className="mb-2 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <img
        src={card.imageUrl}
        alt=""
        className="h-20 w-full object-cover"
      />
    </div>
  ) : null}

<input
  type="file"
  accept="image/jpeg,image/png,image/webp,image/gif"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setEditorUploadError("");

      const uploaded = await uploadBuilderImageFile(file);

      updateSelectedBlock((block: any) =>
        block.type !== "highlight"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                cards: (block.data.cards ?? []).map((item: any) =>
                  item.id === card.id
                    ? {
                        ...item,
                        imageUrl: uploaded.url,
                        imageStoragePath: uploaded.storagePath,
                        imageSizeBytes: uploaded.imageSizeBytes,
                        imageOriginalSizeBytes:
                          uploaded.imageOriginalSizeBytes,
                        imageMimeType: uploaded.imageMimeType,
                      }
                    : item,
                ),
              },
            },
      );
    } catch {
      setEditorUploadError("Highlight image upload failed.");
    } finally {
      e.currentTarget.value = "";
    }
  }}
  className={inspectorInputClass()}
/>

  {card.imageUrl ? (
    <button
      type="button"
      className={`${toolSetButtonClass("front")} mt-2`}
      onClick={() =>
        updateSelectedBlock((block: any) =>
          block.type !== "highlight"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  cards: (block.data.cards ?? []).map((item: any) =>
                    item.id === card.id
                      ? {
                          ...item,
                          imageUrl: "",
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

<div className="mt-3">
  <div className={inspectorLabelClass()}>Image Position</div>
  <select
    value={card.imagePosition ?? "left"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "highlight"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                cards: (block.data.cards ?? []).map((item: any) =>
                  item.id === card.id
                    ? {
                        ...item,
                        imagePosition: e.target.value as "left" | "right",
                      }
                    : item,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="left">Left</option>
    <option value="right">Right</option>
  </select>
</div>

<div className="mt-3">
  <div className={inspectorLabelClass()}>Image Size</div>
  <input
    type="range"
    min={20}
    max={120}
    step={1}
    value={card.imageSize ?? 40}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "highlight"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                cards: (block.data.cards ?? []).map((item: any) =>
                  item.id === card.id
                    ? {
                        ...item,
                        imageSize: Number(e.target.value) || 40,
                      }
                    : item,
                ),
              },
            },
      )
    }
    className="w-full"
  />
  <div className="mt-1 text-xs text-neutral-500">
    {card.imageSize ?? 40}px
  </div>
</div>
        </div>
      ))}
    </div>

    <div className="mt-4 flex justify-center">
  <button
    type="button"
    className={toolSetButtonClass("front")}
    onClick={() =>
      updateSelectedBlock((block: any) => {
        if (block.type !== "highlight") return block;

        return {
          ...block,
          data: {
            ...block.data,
            cards: [
              ...(block.data.cards ?? []),
              {
                id: makeClientId("highlight"),
                type: "manual_stat",
                label: "New Stat",
                value: "100",
                suffix: "+",
                description: "Key detail",
                icon: "✨",
                showIcon: true,
              },
            ],
          },
        };
      })
    }
  >
    Add Card
  </button>
</div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
      Source-linked highlight cards use fallback values for now. Live count APIs can be connected later.
    </div>
    </div>
  );
}