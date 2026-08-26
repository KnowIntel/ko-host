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
  const styleVariant =
    selectedBlock?.data?.styleVariant === "data_card"
      ? "data_card"
      : "simple";

  const isDataCard =
    styleVariant === "data_card";

  function updateHighlightData(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "highlight"
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

  function updateDataCardFrameStyle(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "highlight"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                dataCardFrameStyle: {
                  ...(block.data.dataCardFrameStyle ?? {}),
                  ...patch,
                },
              },
            },
    );
  }

  function updateDataCardImageFrameStyle(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "highlight"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                dataCardImageFrameStyle: {
                  ...(block.data.dataCardImageFrameStyle ?? {}),
                  ...patch,
                },
              },
            },
    );
  }

  /*
   * ================================================================
   * DATA CARD SOURCE
   * ================================================================
   */

  const linkedSourceBlock =
    (draft.blocks ?? []).find(
      (block: any) =>
        block.id ===
        selectedBlock.data.sourceBlockId,
    );

  const linkedPoll =
    linkedSourceBlock?.type === "poll"
      ? linkedSourceBlock
      : null;

  const availableDataPoints =
    linkedPoll &&
    Array.isArray(linkedPoll.data.options)
      ? linkedPoll.data.options
      : [];

  /*
   * ================================================================
   * DATA CARD
   * ================================================================
   */

  if (isDataCard) {
    return (
      <div className="space-y-4">
        {/* ============================================================ */}
        {/* HIGHLIGHT */}
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
            Highlight
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
              value="data_card"
              onChange={(e) =>
                updateHighlightData({
                  styleVariant:
                    e.target.value ===
                    "data_card"
                      ? "data_card"
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

              <option value="data_card">
                Data Card
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
                  highlightTextTarget
                }
                onChange={(e) =>
                  setHighlightTextTarget(
                    e.target
                      .value as HighlightTextTarget,
                  )
                }
                className={
                  inspectorInputClass()
                }
              >
                <option value="dataCardDataPointLabel">
                  Data Point Label
                </option>

                <option value="dataCardValue">
                  Total
                </option>

                <option value="dataCardUnit">
                  Units
                </option>

                <option value="dataCardPercentage">
                  Percentage
                </option>
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
                  highlightUnifiedStyleTarget
                }
                onChange={(e) =>
                  setHighlightUnifiedStyleTarget(
                    e.target
                      .value as HighlightStyleTarget,
                  )
                }
                className={
                  inspectorInputClass()
                }
              >
                <option value="block">
                  Block
                </option>

                <option value="dataCardFrame">
                  Data Card Frame
                </option>

                <option value="dataCardImageFrame">
                  Image Frame
                </option>

                <option value="dataCardProgressTrack">
                  Progress Track
                </option>

                <option value="dataCardProgressFill">
                  Progress Fill
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DATA SOURCE */}
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
            Data Source
          </div>

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Linked Block
            </div>

            <select
              value={
                selectedBlock.data
                  .sourceBlockId ??
                ""
              }
              onChange={(e) => {
                const nextBlockId =
                  e.target.value;

                updateHighlightData({
                  sourceType:
                    nextBlockId
                      ? "poll"
                      : "manual",

                  sourceBlockId:
                    nextBlockId,

                  /*
                   * A new source must clear the old data point because
                   * option IDs belong to their original source block.
                   */
                  sourceDataPointId:
                    "",

                  sourceDataPointLabel:
                    "",
                });
              }}
              className={
                inspectorInputClass()
              }
            >
              <option value="">
                Select a data block...
              </option>

              {(draft.blocks ?? [])
                .filter(
                  (block: any) =>
                    block.type ===
                    "poll",
                )
                .map(
                  (pollBlock: any) => (
                    <option
                      key={
                        pollBlock.id
                      }
                      value={
                        pollBlock.id
                      }
                    >
                      {pollBlock.data
                        ?.question ||
                        pollBlock.label ||
                        "Poll"}
                    </option>
                  ),
                )}
            </select>

            <div className="mt-1 text-xs text-neutral-500">
              Select the block whose results this card should display.
            </div>
          </div>

          {/* DATA POINT */}

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Data Point
            </div>

            <select
              value={
                selectedBlock.data
                  .sourceDataPointId ??
                ""
              }
              disabled={
                !linkedPoll
              }
              onChange={(e) => {
                const nextId =
                  e.target.value;

                const selectedOption =
                  availableDataPoints.find(
                    (option: any) =>
                      option.id ===
                      nextId,
                  );

                updateHighlightData({
                  sourceDataPointId:
                    nextId,

                  sourceDataPointLabel:
                    selectedOption?.text ??
                    "",
                });
              }}
              className={
                inspectorInputClass()
              }
            >
              <option value="">
                {linkedPoll
                  ? "Select a data point..."
                  : "Select a linked block first"}
              </option>

              {availableDataPoints.map(
                (option: any) => (
                  <option
                    key={
                      option.id
                    }
                    value={
                      option.id
                    }
                  >
                    {option.text ||
                      "Untitled option"}
                  </option>
                ),
              )}
            </select>

            <div className="mt-1 text-xs text-neutral-500">
              Each Highlight can select a different result from the same linked block.
            </div>
          </div>

          {/* CURRENT LINK SUMMARY */}

          {selectedBlock.data
            .sourceDataPointId ? (
            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
              <div className="text-xs font-medium text-neutral-500">
                Displaying
              </div>

              <div className="mt-1 text-sm font-semibold text-neutral-900">
                {selectedBlock.data
                  .sourceDataPointLabel ||
                  "Selected data point"}
              </div>
            </div>
          ) : null}
        </div>

        {/* ============================================================ */}
        {/* DATA CARD CONTENT */}
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
            Data Card Content
          </div>

          {/* UNITS */}

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Units
            </div>

            <input
              type="text"
              value={
                selectedBlock.data
                  .unitLabel ??
                "VOTES"
              }
              onChange={(e) =>
                updateHighlightData({
                  unitLabel:
                    e.target.value,
                })
              }
              placeholder="VOTES"
              className={
                inspectorInputClass()
              }
            />

            <div className="mt-1 text-xs text-neutral-500">
              Examples: Votes, Responses, Guests, Entries.
            </div>
          </div>

{/* SHOW TITLE */}

<label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
  <div>
    <div className="text-sm font-medium text-neutral-800">
      Show Title
    </div>

    <div className="mt-1 text-xs text-neutral-500">
      Display the title of the selected linked data point.
    </div>
  </div>

  <input
    type="checkbox"
    checked={
      selectedBlock.data
        .showDataCardTitle !==
      false
    }
    onChange={(e) =>
      updateHighlightData({
        showDataCardTitle:
          e.target.checked,
      })
    }
    className="h-4 w-4"
  />
</label>

          {/* SHOW PERCENTAGE */}

          <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
            <div>
              <div className="text-sm font-medium text-neutral-800">
                Show Percentage
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                Display this data point as a percentage of all results.
              </div>
            </div>

            <input
              type="checkbox"
              checked={
                selectedBlock.data
                  .showPercentage !==
                false
              }
              onChange={(e) =>
                updateHighlightData({
                  showPercentage:
                    e.target.checked,
                })
              }
              className="h-4 w-4"
            />
          </label>

          {/* SHOW PROGRESS BAR */}

          <label className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
            <div>
              <div className="text-sm font-medium text-neutral-800">
                Show Progress Bar
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                Visualize the selected data point's percentage.
              </div>
            </div>

            <input
              type="checkbox"
              checked={
                selectedBlock.data
                  .showProgressBar !==
                false
              }
              onChange={(e) =>
                updateHighlightData({
                  showProgressBar:
                    e.target.checked,
                })
              }
              className="h-4 w-4"
            />
          </label>
        </div>

        {/* ============================================================ */}
        {/* DATA CARD IMAGE */}
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
            Data Card Image
          </div>

          {/* PREVIEW */}

          {selectedBlock.data
            .dataCardImageUrl ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-2">
              <div className="flex min-h-[120px] items-center justify-center">
                <img
                  src={
                    selectedBlock.data
                      .dataCardImageUrl
                  }
                  alt={
                    selectedBlock.data
                      .dataCardImageAlt ||
                    ""
                  }
                  className="max-h-40 max-w-full object-contain"
                />
              </div>
            </div>
          ) : null}

          {/* UPLOAD */}

          <div className="mt-4">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={async (e) => {
                const file =
                  e.target.files?.[0];

                if (!file) {
                  return;
                }

                try {
                  setEditorUploadError(
                    "",
                  );

                  const uploaded =
                    await uploadBuilderImageFile(
                      file,
                    );

                  updateHighlightData({
                    dataCardImageUrl:
                      uploaded.url,

                    dataCardImageAlt:
                      file.name,

                    dataCardImageStoragePath:
                      uploaded.storagePath,

                    dataCardImageSizeBytes:
                      uploaded.imageSizeBytes,

                    dataCardImageOriginalSizeBytes:
                      uploaded.imageOriginalSizeBytes,

                    dataCardImageMimeType:
                      uploaded.imageMimeType,
                  });
                } catch {
                  setEditorUploadError(
                    "Highlight image upload failed.",
                  );
                } finally {
                  e.currentTarget.value =
                    "";
                }
              }}
              className={
                inspectorInputClass()
              }
            />

            {selectedBlock.data
              .dataCardImageUrl ? (
              <button
                type="button"
                className={`${toolSetButtonClass(
                  "front",
                )} mt-2`}
                onClick={() =>
                  updateHighlightData({
                    dataCardImageUrl:
                      "",

                    dataCardImageAlt:
                      "",

                    dataCardImageStoragePath:
                      "",

                    dataCardImageSizeBytes:
                      0,

                    dataCardImageOriginalSizeBytes:
                      0,

                    dataCardImageMimeType:
                      "",
                  })
                }
              >
                Remove Image
              </button>
            ) : null}
          </div>

          {/* IMAGE ORIENTATION */}

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Image Orientation
            </div>

            <select
              value={
                selectedBlock.data
                  .dataCardImageAspect ??
                "landscape"
              }
              onChange={(e) =>
                updateHighlightData({
                  dataCardImageAspect:
                    e.target.value,
                })
              }
              className={
                inspectorInputClass()
              }
            >
              <option value="landscape">
                Landscape
              </option>

              <option value="square">
                Square
              </option>

              <option value="portrait">
                Portrait
              </option>
            </select>
          </div>

          {/* FIT */}

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
                  .dataCardImageFit ??
                "zoom"
              }
              onChange={(e) =>
                updateHighlightData({
                  dataCardImageFit:
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

          {/* IMAGE FRAME SIZE */}

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Image Size
              </div>

              <div className="text-xs text-neutral-500">
                {selectedBlock.data
                  .dataCardImageSizePercent ??
                  100}
                %
              </div>
            </div>

            <input
              type="range"
              min={30}
              max={100}
              step={1}
              value={
                selectedBlock.data
                  .dataCardImageSizePercent ??
                100
              }
              onChange={(e) =>
                updateHighlightData({
                  dataCardImageSizePercent:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>

          {/* ZOOM */}

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
                    selectedBlock.data
                      .dataCardImageZoom ??
                      1,
                  ) * 100,
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
                  selectedBlock.data
                    .dataCardImageZoom ??
                    1,
                ) * 100,
              )}
              onChange={(e) =>
                updateHighlightData({
                  dataCardImageZoom:
                    Number(
                      e.target.value,
                    ) / 100,
                })
              }
              className="mt-2 w-full"
            />
          </div>

          {/* X */}

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
                {selectedBlock.data
                  .dataCardImagePositionX ??
                  50}
                %
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={
                selectedBlock.data
                  .dataCardImagePositionX ??
                50
              }
              onChange={(e) =>
                updateHighlightData({
                  dataCardImagePositionX:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>

          {/* Y */}

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
                {selectedBlock.data
                  .dataCardImagePositionY ??
                  50}
                %
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={
                selectedBlock.data
                  .dataCardImagePositionY ??
                50
              }
              onChange={(e) =>
                updateHighlightData({
                  dataCardImagePositionY:
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
        {/* DATA CARD FRAME */}
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
            Data Card Frame
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
                    .dataCardFrameStyle
                    ?.backgroundColor ??
                  "#111111"
                }
                onChange={(e) =>
                  updateDataCardFrameStyle({
                    backgroundColor:
                      e.target.value,
                  })
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
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
                    .dataCardFrameStyle
                    ?.borderColor ??
                  "#C9922E"
                }
                onChange={(e) =>
                  updateDataCardFrameStyle({
                    borderColor:
                      e.target.value,
                  })
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Border Width
              </div>

              <div className="text-xs text-neutral-500">
                {selectedBlock.data
                  .dataCardFrameStyle
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
                  .dataCardFrameStyle
                  ?.borderWidth ??
                1
              }
              onChange={(e) =>
                updateDataCardFrameStyle({
                  borderWidth:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Corner Radius
              </div>

              <div className="text-xs text-neutral-500">
                {selectedBlock.data
                  .dataCardFrameStyle
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
                  .dataCardFrameStyle
                  ?.borderRadius ??
                14
              }
              onChange={(e) =>
                updateDataCardFrameStyle({
                  borderRadius:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Padding
              </div>

              <div className="text-xs text-neutral-500">
                {selectedBlock.data
                  .dataCardFrameStyle
                  ?.padding ??
                  14}
                px
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={40}
              value={
                selectedBlock.data
                  .dataCardFrameStyle
                  ?.padding ??
                14
              }
              onChange={(e) =>
                updateDataCardFrameStyle({
                  padding:
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
        {/* IMAGE FRAME */}
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
            Image Frame
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
                    .dataCardImageFrameStyle
                    ?.backgroundColor ===
                  "transparent"
                    ? "#ffffff"
                    : selectedBlock.data
                          .dataCardImageFrameStyle
                          ?.backgroundColor ??
                      "#ffffff"
                }
                onChange={(e) =>
                  updateDataCardImageFrameStyle({
                    backgroundColor:
                      e.target.value,
                  })
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
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
                    .dataCardImageFrameStyle
                    ?.borderColor ===
                  "transparent"
                    ? "#ffffff"
                    : selectedBlock.data
                          .dataCardImageFrameStyle
                          ?.borderColor ??
                      "#ffffff"
                }
                onChange={(e) =>
                  updateDataCardImageFrameStyle({
                    borderColor:
                      e.target.value,
                  })
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Border Width
              </div>

              <div className="text-xs text-neutral-500">
                {selectedBlock.data
                  .dataCardImageFrameStyle
                  ?.borderWidth ??
                  0}
                px
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={12}
              value={
                selectedBlock.data
                  .dataCardImageFrameStyle
                  ?.borderWidth ??
                0
              }
              onChange={(e) =>
                updateDataCardImageFrameStyle({
                  borderWidth:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Corner Radius
              </div>

              <div className="text-xs text-neutral-500">
                {selectedBlock.data
                  .dataCardImageFrameStyle
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
                  .dataCardImageFrameStyle
                  ?.borderRadius ??
                8
              }
              onChange={(e) =>
                updateDataCardImageFrameStyle({
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

        {/* ============================================================ */}
        {/* PROGRESS BAR */}
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
            Progress Bar
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Bar Height
              </div>

              <div className="text-xs text-neutral-500">
                {selectedBlock.data
                  .progressBarHeight ??
                  10}
                px
              </div>
            </div>

            <input
              type="range"
              min={4}
              max={32}
              value={
                selectedBlock.data
                  .progressBarHeight ??
                10
              }
              onChange={(e) =>
                updateHighlightData({
                  progressBarHeight:
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
                Track Color
              </div>

              <input
                type="color"
                value={
                  selectedBlock.data
                    .progressBarTrackColor ??
                  "#2E2E2E"
                }
                onChange={(e) =>
                  updateHighlightData({
                    progressBarTrackColor:
                      e.target.value,
                  })
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
              />
            </div>

            <div>
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Fill Color
              </div>

              <input
                type="color"
                value={
                  selectedBlock.data
                    .progressBarFillColor ??
                  "#F3B632"
                }
                onChange={(e) =>
                  updateHighlightData({
                    progressBarFillColor:
                      e.target.value,
                  })
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Corner Radius
              </div>

              <div className="text-xs text-neutral-500">
                {selectedBlock.data
                  .progressBarBorderRadius ??
                  999}
                px
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={999}
              value={
                selectedBlock.data
                  .progressBarBorderRadius ??
                999
              }
              onChange={(e) =>
                updateHighlightData({
                  progressBarBorderRadius:
                    Number(
                      e.target.value,
                    ),
                })
              }
              className="mt-2 w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={inspectorCardClass()}>
      {/* Highlight */}
    <div className={inspectorLabelClass()}>Highlight</div>
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
    value="simple"
    onChange={(e) =>
      updateHighlightData({
        styleVariant:
          e.target.value ===
          "data_card"
            ? "data_card"
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

    <option value="data_card">
      Data Card
    </option>
  </select>
</div>

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
                showIcon: false,
                imageUrl: "",
                linearImageUrl: "",
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