"use client";

import type { RefObject } from "react";

import type {
  PollStyleTarget,
  PollTextTarget,
} from "@/components/builder/formatting/pollFormatting";

/**
 * Poll inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "poll"
 */

type PollInspectorProps = {
  selectedBlock: any;
  draft: any;

  updateSelectedBlock: any;
  makeClientId: (
    prefix: string,
  ) => string;

  uploadPollOptionImage: (
    blockId: string,
    optionId: string,
  ) => Promise<any> | void;

  pollTextTarget: PollTextTarget;

  setPollTextTarget: (
    target: PollTextTarget,
  ) => void;

  pollStyleTarget: PollStyleTarget;

  setPollStyleTarget: (
    target: PollStyleTarget,
  ) => void;

  pollQuestionInputRef: RefObject<
    HTMLTextAreaElement | null
  >;

  pollOptionInputRefs: RefObject<
    Record<
      string,
      HTMLInputElement | null
    >
  >;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (
    position?: any,
  ) => string;
};

export function PollInspector({
  selectedBlock,
  draft,

  updateSelectedBlock,
  makeClientId,

  uploadPollOptionImage,

  pollTextTarget,
  setPollTextTarget,

  pollStyleTarget,
  setPollStyleTarget,

  pollQuestionInputRef,
  pollOptionInputRefs,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: PollInspectorProps) {
  const styleVariant =
    selectedBlock?.data
      ?.styleVariant ===
    "showcase"
      ? "showcase"
      : "simple";

  const isShowcase =
    styleVariant === "showcase";

  const options =
    Array.isArray(
      selectedBlock?.data
        ?.options,
    )
      ? selectedBlock.data
          .options
      : [];

  function updatePollData(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "poll"
          ? block
          : {
              ...block,

              data: {
                ...block.data,
                ...patch,
              },
            },
    );
  }

  function updatePollOption(
    optionId: string,
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "poll"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                options:
                  (
                    block.data
                      .options ??
                    []
                  ).map(
                    (
                      option: any,
                    ) =>
                      option.id ===
                      optionId
                        ? {
                            ...option,
                            ...patch,
                          }
                        : option,
                  ),
              },
            },
    );
  }

  function updateTitleFrameStyle(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "poll"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                titleFrameStyle: {
                  ...(
                    block.data
                      .titleFrameStyle ??
                    {}
                  ),

                  ...patch,
                },
              },
            },
    );
  }

  function updateOptionFrameStyle(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "poll"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                optionFrameStyle: {
                  ...(
                    block.data
                      .optionFrameStyle ??
                    {}
                  ),

                  ...patch,
                },
              },
            },
    );
  }

  function updateImageFrameStyle(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "poll"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                imageFrameStyle: {
                  ...(
                    block.data
                      .imageFrameStyle ??
                    {}
                  ),

                  ...patch,
                },
              },
            },
    );
  }

  function updateSelectionIndicatorStyle(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "poll"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                selectionIndicatorStyle: {
                  ...(
                    block.data
                      .selectionIndicatorStyle ??
                    {}
                  ),

                  ...patch,
                },
              },
            },
    );
  }

  function updateSubmitButtonStyle(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "poll"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                submitButtonStyle: {
                  ...(
                    block.data
                      .submitButtonStyle ??
                    {}
                  ),

                  ...patch,
                },
              },
            },
    );
  }

  return (
    <div className="space-y-4">
      {/* ================================================================ */}
      {/* POLL */}
      {/* ================================================================ */}

      <div
        id="inspector-poll"
        className={
          inspectorCardClass()
        }
      >
        <div
          className={
            inspectorLabelClass()
          }
        >
          Poll
        </div>

        {/* STYLE VARIANT */}

        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Style Variant
          </div>

          <select
            value={
              styleVariant
            }
            onChange={(e) =>
              updatePollData({
                styleVariant:
                  e.target.value ===
                  "showcase"
                    ? "showcase"
                    : "simple",
              })
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="simple">
              Simple
            </option>

            <option value="showcase">
              Showcase
            </option>
          </select>
        </div>

        {/* FORMATTING */}

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Formatting
          </div>

          <div className="mt-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Text Target
            </div>

            <select
              value={
                pollTextTarget
              }
              onChange={(e) =>
                setPollTextTarget(
                  e.target
                    .value as PollTextTarget,
                )
              }
              className={
                inspectorInputClass()
              }
            >
<option value="question">
  {isShowcase
    ? "Poll Title"
    : "Poll Question"}
</option>

<option value="optionText">
  Choice Label
</option>

{isShowcase ? (
  <>
    <option value="selectedOptionText">
      Selected Choice Label
    </option>

    <option value="submitButton">
      Submit Button Label
    </option>
  </>
) : null}
            </select>
          </div>

          <div className="mt-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Style Target
            </div>

            <select
              value={
                pollStyleTarget
              }
              onChange={(e) =>
                setPollStyleTarget(
                  e.target
                    .value as PollStyleTarget,
                )
              }
              className={
                inspectorInputClass()
              }
            >
{!isShowcase ? (
  <option value="field">
    Field
  </option>
) : null}

<option value="block">
  Block
</option>

{isShowcase ? (
  <>
    <option value="titleFrame">
      Title Frame
    </option>

    <option value="optionFrame">
      Choice Frame
    </option>

    <option value="imageFrame">
      Image Frame
    </option>

    <option value="selectionIndicator">
      Selection Indicator
    </option>

    <option value="submitButton">
      Submit Button
    </option>
  </>
) : null}
            </select>
          </div>
        </div>

        {/* QUESTION / TITLE */}

        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            {isShowcase
              ? "Title"
              : "Question"}
          </div>

          <textarea
            ref={
              pollQuestionInputRef
            }
            value={
              selectedBlock.data
                .question
            }
            onChange={(e) =>
              updatePollData({
                question:
                  e.target.value,
              })
            }
            className={
              inspectorTextareaClass()
            }
          />
        </div>

        {/* LINKED HIGHLIGHT */}

        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Linked Highlight
          </div>

          <select
            value={
              selectedBlock.data
                .sourceBlockId ??
              ""
            }
            onChange={(e) =>
              updatePollData({
                sourceBlockId:
                  e.target.value,

                sourceType:
                  e.target.value
                    ? "highlight"
                    : undefined,
              })
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="">
              Select highlight block
            </option>

            {draft.blocks
              .filter(
                (block: any) =>
                  block.type ===
                  "highlight",
              )
              .map(
                (
                  highlightBlock: any,
                ) => (
                  <option
                    key={
                      highlightBlock.id
                    }
                    value={
                      highlightBlock.id
                    }
                  >
                    {highlightBlock.label ||
                      highlightBlock
                        .data
                        .heading ||
                      "Highlight"}
                  </option>
                ),
              )}
          </select>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SHOWCASE CONFIGURATION */}
      {/* ================================================================ */}

      {isShowcase ? (
        <>
          <div
            className={
              inspectorCardClass()
            }
          >
            <div
              className={
                inspectorLabelClass()
              }
            >
              Showcase Layout
            </div>

            {/* SELECTION MODE */}

            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Selection Mode
              </div>

              <select
                value={
                  selectedBlock.data
                    .selectionMode ??
                  "single"
                }
                onChange={(e) =>
                  updatePollData({
                    selectionMode:
                      e.target.value ===
                      "multiple"
                        ? "multiple"
                        : "single",
                  })
                }
                className={
                  inspectorInputClass()
                }
              >
                <option value="single">
                  Single Select
                </option>

                <option value="multiple">
                  Multi Select
                </option>
              </select>
            </div>

            {/* TITLE FRAME */}

            <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800">
                  Title Frame
                </div>

                <div className="mt-1 text-xs text-neutral-500">
                  Display a frame behind the poll title.
                </div>
              </div>

              <input
                type="checkbox"
                checked={
                  selectedBlock.data
                    .showTitleFrame !==
                  false
                }
                onChange={(e) =>
                  updatePollData({
                    showTitleFrame:
                      e.target
                        .checked,
                  })
                }
                className="h-4 w-4"
              />
            </label>

            {/* IMAGE ORIENTATION */}

            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Choice Image Orientation
              </div>

              <select
                value={
                  selectedBlock.data
                    .optionImageAspect ??
                  "portrait"
                }
                onChange={(e) =>
                  updatePollData({
                    optionImageAspect:
                      e.target.value,
                  })
                }
                className={
                  inspectorInputClass()
                }
              >
                <option value="portrait">
                  Portrait
                </option>

                <option value="square">
                  Square
                </option>

                <option value="landscape">
                  Landscape
                </option>
              </select>
            </div>

            {/* IMAGE FIT */}

            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Image Fit
              </div>

              <select
                value={
                  selectedBlock.data
                    .optionImageFit ??
                  "zoom"
                }
                onChange={(e) =>
                  updatePollData({
                    optionImageFit:
                      e.target.value,
                  })
                }
                className={
                  inspectorInputClass()
                }
              >
                <option value="zoom">
                  Zoom / Cover
                </option>

                <option value="clip">
                  Clip / Contain
                </option>

                <option value="stretch">
                  Stretch
                </option>
              </select>
            </div>

            {/* GLOBAL IMAGE SIZE */}

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Choice Image Size
                </div>

                <div className="text-xs font-medium text-neutral-500">
                  {selectedBlock.data
                    .optionImageSizePercent ??
                    100}
                  %
                </div>
              </div>

              <input
                type="range"
                min={40}
                max={140}
                step={1}
                value={
                  selectedBlock.data
                    .optionImageSizePercent ??
                  100
                }
                onChange={(e) =>
                  updatePollData({
                    optionImageSizePercent:
                      Math.max(
                        40,
                        Math.min(
                          140,
                          Number(
                            e.target
                              .value,
                          ) ||
                            100,
                        ),
                      ),
                  })
                }
                className="mt-2 w-full"
              />
            </div>

            {/* SUBMIT BUTTON */}

            <div className="mt-5">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Submit Button Label
              </div>

              <input
                type="text"
                value={
                  selectedBlock.data
                    .submitButtonText ??
                  "Submit Vote"
                }
                onChange={(e) =>
                  updatePollData({
                    submitButtonText:
                      e.target.value,
                  })
                }
                className={
                  inspectorInputClass()
                }
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* SHOWCASE FRAMES */}
          {/* ============================================================ */}

          <div
            className={
              inspectorCardClass()
            }
          >
            <div
              className={
                inspectorLabelClass()
              }
            >
              Showcase Frames
            </div>

            {/* TITLE FRAME */}

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-sm font-semibold text-neutral-800">
                Title Frame
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Background
                  </div>

                  <input
                    type="color"
                    value={
                      selectedBlock.data
                        .titleFrameStyle
                        ?.backgroundColor ??
                      "#111111"
                    }
                    onChange={(e) =>
                      updateTitleFrameStyle({
                        backgroundColor:
                          e.target
                            .value,
                      })
                    }
                    className={
                      inspectorInputClass()
                    }
                  />
                </div>

                <div>
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Border
                  </div>

                  <input
                    type="color"
                    value={
                      selectedBlock.data
                        .titleFrameStyle
                        ?.borderColor ??
                      "#C9922E"
                    }
                    onChange={(e) =>
                      updateTitleFrameStyle({
                        borderColor:
                          e.target
                            .value,
                      })
                    }
                    className={
                      inspectorInputClass()
                    }
                  />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Border Width
                  </div>

                  <div className="text-xs text-neutral-500">
                    {selectedBlock.data
                      .titleFrameStyle
                      ?.borderWidth ??
                      1}
                    px
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={12}
                  value={
                    selectedBlock.data
                      .titleFrameStyle
                      ?.borderWidth ??
                    1
                  }
                  onChange={(e) =>
                    updateTitleFrameStyle({
                      borderWidth:
                        Number(
                          e.target
                            .value,
                        ),
                    })
                  }
                  className="mt-2 w-full"
                />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Corner Radius
                  </div>

                  <div className="text-xs text-neutral-500">
                    {selectedBlock.data
                      .titleFrameStyle
                      ?.borderRadius ??
                      14}
                    px
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={60}
                  value={
                    selectedBlock.data
                      .titleFrameStyle
                      ?.borderRadius ??
                    14
                  }
                  onChange={(e) =>
                    updateTitleFrameStyle({
                      borderRadius:
                        Number(
                          e.target
                            .value,
                        ),
                    })
                  }
                  className="mt-2 w-full"
                />
              </div>
            </div>

            {/* OPTION FRAME */}

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-sm font-semibold text-neutral-800">
                Choice Frame
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Background
                  </div>

                  <input
                    type="color"
                    value={
                      selectedBlock.data
                        .optionFrameStyle
                        ?.backgroundColor ===
                      "transparent"
                        ? "#ffffff"
                        : selectedBlock.data
                              .optionFrameStyle
                              ?.backgroundColor ??
                          "#ffffff"
                    }
                    onChange={(e) =>
                      updateOptionFrameStyle({
                        backgroundColor:
                          e.target
                            .value,
                      })
                    }
                    className={
                      inspectorInputClass()
                    }
                  />
                </div>

                <div>
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Border
                  </div>

                  <input
                    type="color"
                    value={
                      selectedBlock.data
                        .optionFrameStyle
                        ?.borderColor ??
                      "#C9922E"
                    }
                    onChange={(e) =>
                      updateOptionFrameStyle({
                        borderColor:
                          e.target
                            .value,
                      })
                    }
                    className={
                      inspectorInputClass()
                    }
                  />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Border Width
                  </div>

                  <div className="text-xs text-neutral-500">
                    {selectedBlock.data
                      .optionFrameStyle
                      ?.borderWidth ??
                      1}
                    px
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={12}
                  value={
                    selectedBlock.data
                      .optionFrameStyle
                      ?.borderWidth ??
                    1
                  }
                  onChange={(e) =>
                    updateOptionFrameStyle({
                      borderWidth:
                        Number(
                          e.target
                            .value,
                        ),
                    })
                  }
                  className="mt-2 w-full"
                />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Corner Radius
                  </div>

                  <div className="text-xs text-neutral-500">
                    {selectedBlock.data
                      .optionFrameStyle
                      ?.borderRadius ??
                      12}
                    px
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={60}
                  value={
                    selectedBlock.data
                      .optionFrameStyle
                      ?.borderRadius ??
                    12
                  }
                  onChange={(e) =>
                    updateOptionFrameStyle({
                      borderRadius:
                        Number(
                          e.target
                            .value,
                        ),
                    })
                  }
                  className="mt-2 w-full"
                />
              </div>
            </div>

            {/* IMAGE FRAME */}

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-sm font-semibold text-neutral-800">
                Image Frame
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Background
                  </div>

                  <input
                    type="color"
                    value={
                      selectedBlock.data
                        .imageFrameStyle
                        ?.backgroundColor ??
                      "#111111"
                    }
                    onChange={(e) =>
                      updateImageFrameStyle({
                        backgroundColor:
                          e.target
                            .value,
                      })
                    }
                    className={
                      inspectorInputClass()
                    }
                  />
                </div>

                <div>
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Border
                  </div>

                  <input
                    type="color"
                    value={
                      selectedBlock.data
                        .imageFrameStyle
                        ?.borderColor ??
                      "#C9922E"
                    }
                    onChange={(e) =>
                      updateImageFrameStyle({
                        borderColor:
                          e.target
                            .value,
                      })
                    }
                    className={
                      inspectorInputClass()
                    }
                  />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Border Width
                  </div>

                  <div className="text-xs text-neutral-500">
                    {selectedBlock.data
                      .imageFrameStyle
                      ?.borderWidth ??
                      1}
                    px
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={12}
                  value={
                    selectedBlock.data
                      .imageFrameStyle
                      ?.borderWidth ??
                    1
                  }
                  onChange={(e) =>
                    updateImageFrameStyle({
                      borderWidth:
                        Number(
                          e.target
                            .value,
                        ),
                    })
                  }
                  className="mt-2 w-full"
                />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Corner Radius
                  </div>

                  <div className="text-xs text-neutral-500">
                    {selectedBlock.data
                      .imageFrameStyle
                      ?.borderRadius ??
                      8}
                    px
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={60}
                  value={
                    selectedBlock.data
                      .imageFrameStyle
                      ?.borderRadius ??
                    8
                  }
                  onChange={(e) =>
                    updateImageFrameStyle({
                      borderRadius:
                        Number(
                          e.target
                            .value,
                        ),
                    })
                  }
                  className="mt-2 w-full"
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SELECTION INDICATOR */}
          {/* ============================================================ */}

          <div
            className={
              inspectorCardClass()
            }
          >
            <div
              className={
                inspectorLabelClass()
              }
            >
              Selection Indicator
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Circle Size
                </div>

                <div className="text-xs text-neutral-500">
                  {selectedBlock.data
                    .selectionIndicatorStyle
                    ?.size ??
                    34}
                  px
                </div>
              </div>

              <input
                type="range"
                min={18}
                max={72}
                value={
                  selectedBlock.data
                    .selectionIndicatorStyle
                    ?.size ??
                  34
                }
                onChange={(e) =>
                  updateSelectionIndicatorStyle({
                    size:
                      Number(
                        e.target.value,
                      ),
                  })
                }
                className="mt-2 w-full"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Unselected Border
                </div>

                <input
                  type="color"
                  value={
                    selectedBlock.data
                      .selectionIndicatorStyle
                      ?.borderColor ??
                    "#FFFFFF"
                  }
                  onChange={(e) =>
                    updateSelectionIndicatorStyle({
                      borderColor:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>

              <div>
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Selected Color
                </div>

                <input
                  type="color"
                  value={
                    selectedBlock.data
                      .selectionIndicatorStyle
                      ?.selectedColor ??
                    "#C9922E"
                  }
                  onChange={(e) =>
                    updateSelectionIndicatorStyle({
                      selectedColor:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Circle Border Width
                </div>

                <div className="text-xs text-neutral-500">
                  {selectedBlock.data
                    .selectionIndicatorStyle
                    ?.borderWidth ??
                    2}
                  px
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={10}
                value={
                  selectedBlock.data
                    .selectionIndicatorStyle
                    ?.borderWidth ??
                  2
                }
                onChange={(e) =>
                  updateSelectionIndicatorStyle({
                    borderWidth:
                      Number(
                        e.target.value,
                      ),
                  })
                }
                className="mt-2 w-full"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* SUBMIT BUTTON APPEARANCE */}
          {/* ============================================================ */}

          <div
            className={
              inspectorCardClass()
            }
          >
            <div
              className={
                inspectorLabelClass()
              }
            >
              Submit Button
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Background
                </div>

                <input
                  type="color"
                  value={
                    selectedBlock.data
                      .submitButtonStyle
                      ?.backgroundColor ??
                    "#B91C1C"
                  }
                  onChange={(e) =>
                    updateSubmitButtonStyle({
                      backgroundColor:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>

              <div>
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Border
                </div>

                <input
                  type="color"
                  value={
                    selectedBlock.data
                      .submitButtonStyle
                      ?.borderColor ??
                    "#EF4444"
                  }
                  onChange={(e) =>
                    updateSubmitButtonStyle({
                      borderColor:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Corner Radius
                </div>

                <div className="text-xs text-neutral-500">
                  {selectedBlock.data
                    .submitButtonStyle
                    ?.borderRadius ??
                    10}
                  px
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={60}
                value={
                  selectedBlock.data
                    .submitButtonStyle
                    ?.borderRadius ??
                  10
                }
                onChange={(e) =>
                  updateSubmitButtonStyle({
                    borderRadius:
                      Number(
                        e.target.value,
                      ),
                  })
                }
                className="mt-2 w-full"
              />
            </div>
          </div>
        </>
      ) : null}

      {/* ================================================================ */}
      {/* OPTIONS */}
      {/* ================================================================ */}

      <div
        className={
          inspectorCardClass()
        }
      >
        <div className="flex items-center justify-between gap-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Choices
          </div>

          <div className="text-xs text-neutral-500">
            {options.length}{" "}
            {options.length === 1
              ? "choice"
              : "choices"}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {options.map(
            (
              option: any,
              index: number,
            ) => (
              <div
                key={
                  option.id
                }
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="text-sm font-semibold text-neutral-900">
                  Choice{" "}
                  {index + 1}
                </div>

                {/* LABEL */}

                <div className="mt-4">
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Label
                  </div>

                  <input
                    ref={(el) => {
                      pollOptionInputRefs.current[
                        option.id
                      ] = el;
                    }}
                    type="text"
                    value={
                      option.text
                    }
                    onChange={(e) =>
                      updatePollOption(
                        option.id,
                        {
                          text:
                            e.target
                              .value,
                        },
                      )
                    }
                    className={
                      inspectorInputClass()
                    }
                  />
                </div>

                {isShowcase ? (
                  <>
                    {/* IMAGE PREVIEW */}

                    {option.imageUrl ? (
                      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
                        <div className="flex min-h-[100px] items-center justify-center">
                          <img
                            src={
                              option.imageUrl
                            }
                            alt={
                              option.imageAlt ||
                              option.text ||
                              ""
                            }
                            className="max-h-32 max-w-full object-contain"
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* IMAGE UPLOAD */}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                        onClick={() =>
                          void uploadPollOptionImage(
                            selectedBlock.id,
                            option.id,
                          )
                        }
                      >
                        {option.imageUrl
                          ? "Replace Image"
                          : "Browse Image"}
                      </button>

                      {option.imageUrl ? (
                        <button
                          type="button"
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                          onClick={() =>
                            updatePollOption(
                              option.id,
                              {
                                imageUrl:
                                  "",

                                imageAlt:
                                  "",

                                imageStoragePath:
                                  "",

                                imageSizeBytes:
                                  0,

                                imageOriginalSizeBytes:
                                  0,

                                imageMimeType:
                                  "",
                              },
                            )
                          }
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    {/* IMAGE ZOOM */}

                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={
                            inspectorLabelClass()
                          }
                        >
                          Image Zoom
                        </div>

                        <div className="text-xs text-neutral-500">
                          {Math.round(
                            Number(
                              option.imageZoom ??
                                1,
                            ) *
                              100,
                          )}
                          %
                        </div>
                      </div>

                      <input
                        type="range"
                        min={50}
                        max={200}
                        step={1}
                        value={Math.round(
                          Number(
                            option.imageZoom ??
                              1,
                          ) *
                            100,
                        )}
                        onChange={(e) =>
                          updatePollOption(
                            option.id,
                            {
                              imageZoom:
                                Math.max(
                                  50,
                                  Math.min(
                                    200,
                                    Number(
                                      e.target
                                        .value,
                                    ) ||
                                      100,
                                  ),
                                ) /
                                100,
                            },
                          )
                        }
                        className="mt-2 w-full"
                      />
                    </div>

                    {/* X POSITION */}

                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={
                            inspectorLabelClass()
                          }
                        >
                          Horizontal Position
                        </div>

                        <div className="text-xs text-neutral-500">
                          {option.imagePositionX ??
                            50}
                          %
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={
                          option.imagePositionX ??
                          50
                        }
                        onChange={(e) =>
                          updatePollOption(
                            option.id,
                            {
                              imagePositionX:
                                Number(
                                  e.target
                                    .value,
                                ),
                            },
                          )
                        }
                        className="mt-2 w-full"
                      />
                    </div>

                    {/* Y POSITION */}

                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={
                            inspectorLabelClass()
                          }
                        >
                          Vertical Position
                        </div>

                        <div className="text-xs text-neutral-500">
                          {option.imagePositionY ??
                            50}
                          %
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={
                          option.imagePositionY ??
                          50
                        }
                        onChange={(e) =>
                          updatePollOption(
                            option.id,
                            {
                              imagePositionY:
                                Number(
                                  e.target
                                    .value,
                                ),
                            },
                          )
                        }
                        className="mt-2 w-full"
                      />
                    </div>
                  </>
                ) : null}

                {/* REMOVE */}

                <button
                  type="button"
                  className={
                    toolSetButtonClass(
                      "remove",
                    )
                  }
                  onClick={() =>
                    updateSelectedBlock(
                      (
                        block: any,
                      ) =>
                        block.type !==
                        "poll"
                          ? block
                          : {
                              ...block,

                              data: {
                                ...block.data,

                                options:
                                  (
                                    block
                                      .data
                                      .options ??
                                    []
                                  ).length >
                                  2
                                    ? (
                                        block
                                          .data
                                          .options ??
                                        []
                                      ).filter(
                                        (
                                          item: any,
                                        ) =>
                                          item.id !==
                                          option.id,
                                      )
                                    : block
                                        .data
                                        .options,
                              },
                            },
                    )
                  }
                >
                  Remove Choice
                </button>
              </div>
            ),
          )}

          <button
            type="button"
            className={
              toolSetButtonClass(
                "front",
              )
            }
            onClick={() =>
              updatePollData({
                options: [
                  ...options,

                  {
                    id:
                      makeClientId(
                        "opt",
                      ),

                    text:
                      "New option",

                    imageUrl:
                      "",

                    imageAlt:
                      "",

                    imageStoragePath:
                      "",

                    imageSizeBytes:
                      0,

                    imageOriginalSizeBytes:
                      0,

                    imageMimeType:
                      "",

                    imagePositionX:
                      50,

                    imagePositionY:
                      50,

                    imageZoom:
                      1,

                    imageRotation:
                      0,

                    imageOpacity:
                      1,
                  },
                ],
              })
            }
          >
            Add Choice
          </button>
        </div>
      </div>
    </div>
  );
}