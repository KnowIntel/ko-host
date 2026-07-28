"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  StatisticCardsStyleTarget,
  StatisticCardsTextTarget,
} from "@/components/builder/formatting/statisticCardsFormatting";

type StatisticCardsInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  statisticCardsTextTarget: StatisticCardsTextTarget;
  setStatisticCardsTextTarget: Dispatch<
    SetStateAction<StatisticCardsTextTarget>
  >;

  statisticCardsStyleTarget: StatisticCardsStyleTarget;
  setStatisticCardsStyleTarget: Dispatch<
    SetStateAction<StatisticCardsStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function StatisticCardsInspector({
  selectedBlock,
  updateSelectedBlock,

  statisticCardsTextTarget,
  setStatisticCardsTextTarget,

  statisticCardsStyleTarget,
  setStatisticCardsStyleTarget,

  makeClientId,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: StatisticCardsInspectorProps) {
  const cards = Array.isArray(
    selectedBlock.data.cards,
  )
    ? selectedBlock.data.cards
    : [];

  const updateCard = (
    cardId: string,
    patch: Record<string, unknown>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "statistic_cards"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              cards: (block.data.cards ?? []).map(
                (card: any) =>
                  card.id === cardId
                    ? {
                        ...card,
                        ...patch,
                      }
                    : card,
              ),
            },
          },
    );
  };

  return (
    <div
      id="inspector-statistic-cards"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Statistic Cards
      </div>

      {/* Text Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Text Target
        </div>

        <select
          value={statisticCardsTextTarget}
          onChange={(e) =>
            setStatisticCardsTextTarget(
              e.target
                .value as StatisticCardsTextTarget,
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

          <option value="label">
            Card Label
          </option>

          <option value="value">
            Value
          </option>

          <option value="prefix">
            Prefix
          </option>

          <option value="suffix">
            Suffix
          </option>

          <option value="description">
            Description
          </option>
        </select>
      </div>

      {/* Style Target */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Style Target
        </div>

        <select
          value={statisticCardsStyleTarget}
          onChange={(e) =>
            setStatisticCardsStyleTarget(
              e.target
                .value as StatisticCardsStyleTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="card">
            Card
          </option>

          <option value="icon">
            Icon
          </option>

          <option value="accent">
            Accent
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
                  "statistic_cards"
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
                  "statistic_cards"
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
              selectedBlock.data
                .showHeading !== false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
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
              selectedBlock.data
                .showSubtitle !== false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
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
            Layout Type
          </div>

          <select
            value={
              selectedBlock.data.layout ??
              "grid"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
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
            <option value="grid">
              Grid
            </option>

            <option value="row">
              Horizontal Row
            </option>

            <option value="stacked">
              Stacked
            </option>
          </select>
        </div>

        {selectedBlock.data.layout ===
        "grid" ? (
          <div className="mt-3">
            <div className={inspectorLabelClass()}>
              Columns
            </div>

            <select
              value={
                selectedBlock.data.columns ?? 3
              }
              onChange={(e) =>
                updateSelectedBlock(
                  (block: any) =>
                    block.type !==
                    "statistic_cards"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            columns: Number(
                              e.target.value,
                            ) as
                              | 1
                              | 2
                              | 3
                              | 4
                              | 5
                              | 6,
                          },
                        },
                )
              }
              className={inspectorInputClass()}
            >
              <option value={1}>
                1 Column
              </option>

              <option value={2}>
                2 Columns
              </option>

              <option value={3}>
                3 Columns
              </option>

              <option value={4}>
                4 Columns
              </option>

              <option value={5}>
                5 Columns
              </option>

              <option value={6}>
                6 Columns
              </option>
            </select>
          </div>
        ) : null}

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Card Style
          </div>

          <select
            value={
              selectedBlock.data.cardStyle ??
              "standard"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          cardStyle:
                            e.target.value,
                        },
                      },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="standard">
              Standard
            </option>

            <option value="accent">
              Top Accent
            </option>

            <option value="minimal">
              Minimal
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Icon Position
          </div>

          <select
            value={
              selectedBlock.data
                .iconPosition ?? "top"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          iconPosition:
                            e.target.value,
                        },
                      },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="top">
              Top
            </option>

            <option value="left">
              Left
            </option>

            <option value="right">
              Right
            </option>
          </select>
        </div>
      </div>

      {/* Visibility */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Visibility
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={
              selectedBlock.data.showIcons !==
              false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showIcons:
                            e.target.checked,
                        },
                      },
              )
            }
          />

          Show icons
        </label>

        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={
              selectedBlock.data
                .showDescriptions !== false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showDescriptions:
                            e.target.checked,
                        },
                      },
              )
            }
          />

          Show descriptions
        </label>

        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={
              selectedBlock.data
                .showAccent !== false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showAccent:
                            e.target.checked,
                        },
                      },
              )
            }
          />

          Show accent
        </label>

        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={
              selectedBlock.data
                .cardShadow !== false
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
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

          Card shadow
        </label>
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
            value={
              selectedBlock.data.padding ?? 20
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          padding: Math.max(
                            0,
                            Math.min(
                              80,
                              Number(
                                e.target.value,
                              ) || 0,
                            ),
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
            Card Gap
          </div>

          <input
            type="number"
            min={0}
            max={80}
            value={
              selectedBlock.data.gap ?? 16
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          gap: Math.max(
                            0,
                            Math.min(
                              80,
                              Number(
                                e.target.value,
                              ) || 0,
                            ),
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
            Inner Content Gap
          </div>

          <input
            type="number"
            min={0}
            max={48}
            value={
              selectedBlock.data.cardGap ?? 12
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          cardGap: Math.max(
                            0,
                            Math.min(
                              48,
                              Number(
                                e.target.value,
                              ) || 0,
                            ),
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
            Card Radius
          </div>

          <input
            type="number"
            min={0}
            max={48}
            value={
              selectedBlock.data.cardRadius ??
              18
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          cardRadius: Math.max(
                            0,
                            Math.min(
                              48,
                              Number(
                                e.target.value,
                              ) || 0,
                            ),
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
            Rotation
          </div>

          <input
            type="number"
            min={-15}
            max={15}
            value={
              selectedBlock.data.rotation ?? 0
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "statistic_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          rotation: Math.max(
                            -15,
                            Math.min(
                              15,
                              Number(
                                e.target.value,
                              ) || 0,
                            ),
                          ),
                        },
                      },
              )
            }
            className={inspectorInputClass()}
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
            selectedBlock.data
              .animationStyle ?? "none"
          }
          onChange={(e) =>
            updateSelectedBlock(
              (block: any) =>
                block.type !==
                "statistic_cards"
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

          <option value="count">
            Count Up
          </option>
        </select>
      </div>

      {/* Cards */}

      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          Cards
        </div>

        {cards.map(
          (card: any, index: number) => (
            <div
              key={card.id}
              className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Card {index + 1}
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Label
                </div>

                <input
                  value={card.label ?? ""}
                  onChange={(e) =>
                    updateCard(card.id, {
                      label: e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Prefix
                  </div>

                  <input
                    value={card.prefix ?? ""}
                    onChange={(e) =>
                      updateCard(card.id, {
                        prefix:
                          e.target.value,
                      })
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Value
                  </div>

                  <input
                    value={card.value ?? ""}
                    onChange={(e) =>
                      updateCard(card.id, {
                        value:
                          e.target.value,
                      })
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Suffix
                  </div>

                  <input
                    value={card.suffix ?? ""}
                    onChange={(e) =>
                      updateCard(card.id, {
                        suffix:
                          e.target.value,
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
                  Description
                </div>

                <textarea
                  value={
                    card.description ?? ""
                  }
                  onChange={(e) =>
                    updateCard(card.id, {
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
                  Icon
                </div>

                <select
                  value={
                    card.iconName ?? "chart"
                  }
                  onChange={(e) =>
                    updateCard(card.id, {
                      iconName:
                        e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                >
                  <option value="chart">
                    Chart
                  </option>

                  <option value="users">
                    Users
                  </option>

                  <option value="trending-up">
                    Trending Up
                  </option>

                  <option value="trending-down">
                    Trending Down
                  </option>

                  <option value="dollar-sign">
                    Revenue
                  </option>

                  <option value="shopping-cart">
                    Sales
                  </option>

                  <option value="eye">
                    Views
                  </option>

                  <option value="heart">
                    Likes
                  </option>

                  <option value="star">
                    Rating
                  </option>

                  <option value="clock">
                    Time
                  </option>

                  <option value="calendar">
                    Calendar
                  </option>

                  <option value="check">
                    Completed
                  </option>

                  <option value="target">
                    Target
                  </option>

                  <option value="download">
                    Downloads
                  </option>

                  <option value="upload">
                    Uploads
                  </option>

                  <option value="activity">
                    Activity
                  </option>

                  <option value="percent">
                    Percent
                  </option>
                </select>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Icon Color
                  </div>

                  <input
                    type="color"
                    value={
                      card.iconColor ||
                      "#2563EB"
                    }
                    onChange={(e) =>
                      updateCard(card.id, {
                        iconColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>

                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Icon Background
                  </div>

                  <input
                    type="color"
                    value={
                      card.iconBackgroundColor ||
                      "#DBEAFE"
                    }
                    onChange={(e) =>
                      updateCard(card.id, {
                        iconBackgroundColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>

                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Accent Color
                  </div>

                  <input
                    type="color"
                    value={
                      card.accentColor ||
                      "#2563EB"
                    }
                    onChange={(e) =>
                      updateCard(card.id, {
                        accentColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>

                <div>
                  <div
                    className={inspectorLabelClass()}
                  >
                    Card Background
                  </div>

                  <input
                    type="color"
                    value={
                      card.backgroundColor ||
                      "#FFFFFF"
                    }
                    onChange={(e) =>
                      updateCard(card.id, {
                        backgroundColor:
                          e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                  />
                </div>
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Border Color
                </div>

                <input
                  type="color"
                  value={
                    card.borderColor ||
                    "#E5E7EB"
                  }
                  onChange={(e) =>
                    updateCard(card.id, {
                      borderColor:
                        e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white p-1"
                />
              </div>

              <div className="mt-3">
                <div
                  className={inspectorLabelClass()}
                >
                  Link
                </div>

                <input
                  value={card.href ?? ""}
                  onChange={(e) =>
                    updateCard(card.id, {
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
                )} mt-3`}
                onClick={() =>
                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "statistic_cards"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              cards: (
                                block.data
                                  .cards ?? []
                              ).filter(
                                (
                                  item: any,
                                ) =>
                                  item.id !==
                                  card.id,
                              ),
                            },
                          },
                  )
                }
              >
                Remove Card
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
                "statistic_cards"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cards: [
                          ...(block.data.cards ??
                            []),

                          {
                            id: makeClientId(
                              "statisticcard",
                            ),

                            label:
                              "New Statistic",

                            value: "100",

                            prefix: "",

                            suffix: "",

                            description:
                              "Add supporting context for this statistic.",

                            iconName:
                              "chart",

                            iconColor:
                              "#2563EB",

                            iconBackgroundColor:
                              "#DBEAFE",

                            accentColor:
                              "#2563EB",

                            backgroundColor:
                              "#FFFFFF",

                            borderColor:
                              "#E5E7EB",

                            href: "",
                          },
                        ],
                      },
                    },
            )
          }
        >
          Add Card
        </button>
      </div>
    </div>
  );
}