"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  StoryCardsStyleTarget,
  StoryCardsTextTarget,
} from "@/components/builder/formatting/storyCardsFormatting";

type StoryCardsInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  storyCardsTextTarget: StoryCardsTextTarget;
  setStoryCardsTextTarget: Dispatch<
    SetStateAction<StoryCardsTextTarget>
  >;

  storyCardsStyleTarget: StoryCardsStyleTarget;
  setStoryCardsStyleTarget: Dispatch<
    SetStateAction<StoryCardsStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  uploadImageToStoryCard: (
    blockId: string,
    cardId: string,
  ) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function StoryCardsInspector({
  selectedBlock,
  updateSelectedBlock,

  storyCardsTextTarget,
  setStoryCardsTextTarget,

  storyCardsStyleTarget,
  setStoryCardsStyleTarget,

  makeClientId,
  uploadImageToStoryCard,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: StoryCardsInspectorProps) {
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
      block.type !== "story_cards"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              cards: (
                block.data.cards ?? []
              ).map((card: any) =>
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
      id="inspector-story-cards"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Story Cards
      </div>

      {/* Formatting targets */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Text Target
        </div>

        <select
          value={storyCardsTextTarget}
          onChange={(e) =>
            setStoryCardsTextTarget(
              e.target.value as StoryCardsTextTarget,
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

          <option value="eyebrow">
            Eyebrow
          </option>

          <option value="cardTitle">
            Card Title
          </option>

          <option value="cardSubtitle">
            Card Subtitle
          </option>

          <option value="cardDescription">
            Card Description
          </option>

          <option value="badge">
            Badge
          </option>

          <option value="date">
            Date
          </option>

          <option value="author">
            Author
          </option>

          <option value="buttonLabel">
            Button Label
          </option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Style Target
        </div>

        <select
          value={storyCardsStyleTarget}
          onChange={(e) =>
            setStoryCardsStyleTarget(
              e.target.value as StoryCardsStyleTarget,
            )
          }
          className={inspectorInputClass()}
        >
          <option value="card">
            Card
          </option>

          <option value="image">
            Image
          </option>

          <option value="icon">
            Icon
          </option>

          <option value="accent">
            Accent
          </option>

          <option value="button">
            Button
          </option>

          <option value="block">
            Block
          </option>
        </select>
      </div>

      {/* Main content */}

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
                  block.type !== "story_cards"
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
                  block.type !== "story_cards"
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
                  block.type !== "story_cards"
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
                  block.type !== "story_cards"
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
                  block.type !== "story_cards"
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

            <option value="horizontal">
              Horizontal Row
            </option>

            <option value="stacked">
              Stacked
            </option>

            <option value="timeline">
              Timeline
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
                    "story_cards"
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
            Image Position
          </div>

          <select
            value={
              selectedBlock.data.imagePosition ??
              "top"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !== "story_cards"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          imagePosition:
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

            <option value="background">
              Background
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
          ["showImages", "Show images"],
          ["showEyebrows", "Show eyebrows"],
          ["showSubtitles", "Show card subtitles"],
          ["showDescriptions", "Show descriptions"],
          ["showBadges", "Show badges"],
          ["showDates", "Show dates"],
          ["showAuthors", "Show authors"],
          ["showButtons", "Show buttons"],
          ["showIcons", "Show icons"],
          ["showAccent", "Show accent"],
          ["cardShadow", "Card shadow"],
          ["equalHeightCards", "Equal-height cards"],
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
                    "story_cards"
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
          ["gap", "Card Gap", 0, 80, 16],
          ["cardGap", "Content Gap", 0, 48, 12],
          ["cardPadding", "Card Padding", 0, 48, 18],
          ["cardRadius", "Card Radius", 0, 48, 18],
          ["imageHeight", "Image Size", 80, 500, 180],
          ["borderWidth", "Border Width", 0, 12, 1],
          ["rotation", "Rotation", -180, 180, 0],
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
                      "story_cards"
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
                "story_cards"
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

          <option value="cascade">
            Cascade
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
                <div className={inspectorLabelClass()}>
                  Eyebrow
                </div>

                <input
                  value={card.eyebrow ?? ""}
                  onChange={(e) =>
                    updateCard(card.id, {
                      eyebrow:
                        e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Title
                </div>

                <input
                  value={card.title ?? ""}
                  onChange={(e) =>
                    updateCard(card.id, {
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
                  value={card.subtitle ?? ""}
                  onChange={(e) =>
                    updateCard(card.id, {
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

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <div className={inspectorLabelClass()}>
                    Badge
                  </div>

                  <input
                    value={card.badge ?? ""}
                    onChange={(e) =>
                      updateCard(card.id, {
                        badge:
                          e.target.value,
                      })
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div>
                  <div className={inspectorLabelClass()}>
                    Date
                  </div>

                  <input
                    value={card.date ?? ""}
                    onChange={(e) =>
                      updateCard(card.id, {
                        date:
                          e.target.value,
                      })
                    }
                    className={inspectorInputClass()}
                  />
                </div>
              </div>

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Author
                </div>

                <input
                  value={card.author ?? ""}
                  onChange={(e) =>
                    updateCard(card.id, {
                      author:
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
                    card.iconName ??
                    "lightbulb"
                  }
                  onChange={(e) =>
                    updateCard(card.id, {
                      iconName:
                        e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                >
                  <option value="lightbulb">
                    Idea
                  </option>

                  <option value="trending-up">
                    Growth
                  </option>

                  <option value="flag">
                    Flag
                  </option>

                  <option value="star">
                    Star
                  </option>

                  <option value="users">
                    Users
                  </option>

                  <option value="heart">
                    Heart
                  </option>

                  <option value="calendar">
                    Calendar
                  </option>

                  <option value="check">
                    Check
                  </option>

                  <option value="target">
                    Target
                  </option>

                  <option value="book">
                    Book
                  </option>

                  <option value="award">
                    Award
                  </option>

                  <option value="activity">
                    Activity
                  </option>
                </select>
              </div>

              {/* Image */}

              <div className="mt-3">
                <div className={inspectorLabelClass()}>
                  Card Image
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={() =>
                      void uploadImageToStoryCard(
                        selectedBlock.id,
                        card.id,
                      )
                    }
                  >
                    {card.imageUrl
                      ? "Replace Image"
                      : "Upload Image"}
                  </button>

                  {card.imageUrl ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() =>
                        updateCard(card.id, {
                          imageUrl: "",
                          imageStoragePath: "",
                          imageMimeType: "",
                          imageSizeBytes:
                            undefined,
                          imageOriginalSizeBytes:
                            undefined,
                        })
                      }
                    >
                      Remove Image
                    </button>
                  ) : null}
                </div>

                {card.imageUrl ? (
                  <div className="mt-3 h-28 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <img
                      src={card.imageUrl}
                      alt={
                        card.title
                          ? `${card.title} preview`
                          : `Card ${index + 1} preview`
                      }
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `${
                          card.imagePositionX ??
                          50
                        }% ${
                          card.imagePositionY ??
                          50
                        }%`,

                        transform: `scale(${
                          card.imageZoom ?? 1
                        })`,
                      }}
                    />
                  </div>
                ) : null}

                {card.imageUrl ? (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className={inspectorLabelClass()}>
                        Horizontal Position
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={
                          card.imagePositionX ??
                          50
                        }
                        onChange={(e) =>
                          updateCard(card.id, {
                            imagePositionX:
                              Number(
                                e.target.value,
                              ),
                          })
                        }
                        className="mt-2 w-full"
                      />
                    </div>

                    <div>
                      <div className={inspectorLabelClass()}>
                        Vertical Position
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={
                          card.imagePositionY ??
                          50
                        }
                        onChange={(e) =>
                          updateCard(card.id, {
                            imagePositionY:
                              Number(
                                e.target.value,
                              ),
                          })
                        }
                        className="mt-2 w-full"
                      />
                    </div>

                    <div>
                      <div className={inspectorLabelClass()}>
                        Image Zoom
                      </div>

                      <input
                        type="range"
                        min={50}
                        max={300}
                        value={Math.round(
                          (card.imageZoom ?? 1) *
                            100,
                        )}
                        onChange={(e) =>
                          updateCard(card.id, {
                            imageZoom:
                              Number(
                                e.target.value,
                              ) / 100,
                          })
                        }
                        className="mt-2 w-full"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Colors */}

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

                <div>
                  <div
                    className={`${inspectorLabelClass()} text-center`}
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

                <div>
                  <div
                    className={`${inspectorLabelClass()} text-center`}
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
              </div>

              {/* Button */}

              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
                <div className={inspectorLabelClass()}>
                  Button
                </div>

                <div className="mt-3">
                  <div className={inspectorLabelClass()}>
                    Button Label
                  </div>

                  <input
                    value={
                      card.buttonLabel ?? ""
                    }
                    onChange={(e) =>
                      updateCard(card.id, {
                        buttonLabel:
                          e.target.value,
                      })
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div className="mt-3">
                  <div className={inspectorLabelClass()}>
                    Link
                  </div>

                  <input
                    value={card.href ?? ""}
                    onChange={(e) =>
                      updateCard(card.id, {
                        href:
                          e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className={inspectorInputClass()}
                  />
                </div>

                <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={Boolean(
                      card.openInNewTab,
                    )}
                    onChange={(e) =>
                      updateCard(card.id, {
                        openInNewTab:
                          e.target.checked,
                      })
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
                      "story_cards"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              cards: (
                                block.data.cards ??
                                []
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
                "story_cards"
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
                              "storycard",
                            ),

                            eyebrow:
                              "New Chapter",

                            title:
                              "New Story",

                            subtitle:
                              "Add a short supporting subtitle.",

                            description:
                              "Tell the story behind this moment, person, idea, or milestone.",

                            badge: "",

                            date: "",

                            author: "",

                            buttonLabel:
                              "Read More",

                            href: "",

                            openInNewTab:
                              false,

                            iconName:
                              "lightbulb",

                            imageUrl: "",

                            imageStoragePath:
                              "",

                            imageMimeType:
                              "",

                            imagePositionX:
                              50,

                            imagePositionY:
                              50,

                            imageZoom: 1,

                            backgroundColor:
                              "#FFFFFF",

                            borderColor:
                              "#E5E7EB",

                            accentColor:
                              "#2563EB",
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