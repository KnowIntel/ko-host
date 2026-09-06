"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  DonationStyleTarget,
  DonationTextTarget,
} from "@/components/builder/formatting/donationFormatting";

type DonationInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  makeClientId: (prefix: string) => string;

  CATEGORY_BUTTONS: any;

  donationTextTarget: DonationTextTarget;
  setDonationTextTarget: (
    target: DonationTextTarget,
  ) => void;

  donationStyleTarget: DonationStyleTarget;
  setDonationStyleTarget: (
    target: DonationStyleTarget,
  ) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;
};

export function DonationInspector({
  selectedBlock,
  updateSelectedBlock,

  makeClientId,

  CATEGORY_BUTTONS,

  donationTextTarget,
  setDonationTextTarget,

  donationStyleTarget,
  setDonationStyleTarget,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
}: DonationInspectorProps) {

  const [
  iconSearch,
  setIconSearch,
] = useState("");

const [
  activeIconTarget,
  setActiveIconTarget,
] = useState<
  | "donorIcon"
  | "percentageIcon"
  | "daysLeftIcon"
>("donorIcon");

const iconTools = useMemo(
  () =>
    (CATEGORY_BUTTONS.Icons ?? []).filter(
      (tool: any) =>
        tool.kind === "block" &&
        tool.type === "icon",
    ),
  [CATEGORY_BUTTONS],
);

const filteredIconTools = useMemo(() => {
  const query =
    iconSearch
      .trim()
      .toLowerCase();

  if (!query) {
    return iconTools;
  }

  return iconTools.filter(
    (tool: any) => {
      const label =
        String(
          tool.label ?? "",
        ).toLowerCase();

      const iconName =
        String(
          tool.iconName ?? "",
        ).toLowerCase();

      return (
        label.includes(query) ||
        iconName.includes(query)
      );
    },
  );
}, [
  iconSearch,
  iconTools,
]);


  const data =
    selectedBlock.data as any;

  const styleVariant =
    data.styleVariant ??
    "standard";

  const isProfessional =
    styleVariant ===
    "professional";

  const donationOptions =
    Array.isArray(
      data.donationOptions,
    )
      ? data.donationOptions
      : [];

  function patchDonationData(
    patch: Record<
      string,
      any
    >,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !==
        "donation"
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

  return (
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
        Donation
      </div>

      {/* ============================================================ */}
      {/* STYLE VARIANT */}
      {/* ============================================================ */}

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
onChange={(e) => {
  const nextVariant =
    e.target.value as
      | "standard"
      | "professional";

  if (
    nextVariant ===
    "professional"
  ) {
    patchDonationData({
      styleVariant:
        "professional",

      goalAmount:
        data.goalAmount ??
        250000,

      raisedAmount:
        data.raisedAmount ??
        146785,

      donorCount:
        data.donorCount ??
        856,

      deadline:
        data.deadline ??
        "",

      donorLabel:
        data.donorLabel ??
        "Donors",

      percentageLabel:
        data.percentageLabel ??
        "of Goal",

      daysLeftLabel:
        data.daysLeftLabel ??
        "Days Left",

      progressTrackStyle: {
        backgroundColor:
          "#ffffff",

        borderColor:
          "#ef7d70",

        borderWidth:
          1,

        borderRadius:
          999,

        height:
          20,

        ...(data.progressTrackStyle ??
          {}),
      },

      progressFillStyle: {
        backgroundColor:
          "#e96c6c",

        borderRadius:
          999,

        ...(data.progressFillStyle ??
          {}),
      },

      metricCardStyle: {
        backgroundColor:
          "transparent",

        borderColor:
          "#e5e7eb",

        borderWidth:
          0,

        borderRadius:
          16,

        gap:
          16,

        padding:
          10,

        ...(data.metricCardStyle ??
          {}),
      },
    });

    return;
  }

  patchDonationData({
    styleVariant:
      "standard",
  });
}}
          className={
            inspectorInputClass()
          }
        >
          <option value="standard">
            Standard
          </option>

          <option value="professional">
            Professional
          </option>
        </select>
      </div>

      {/* ============================================================ */}
      {/* FORMATTING */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Formatting
        </div>

        {/* TEXT TARGET */}

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
              donationTextTarget
            }
            onChange={(e) =>
              setDonationTextTarget(
                e.target
                  .value as DonationTextTarget,
              )
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="title">
              Title
            </option>

            <option value="description">
              Description
            </option>

            {isProfessional ? (
              <>
                <option value="goalAmount">
                  Goal Amount
                </option>

<option value="raisedAmount">
  Raised Amount
</option>

<option value="raisedAmountDescriptor">
  Raised Amount Status
</option>

<option value="donorValue">
  Donor Count Value
</option>

                <option value="donorLabel">
                  Donor Count Label
                </option>

                <option value="percentageValue">
                  Goal Percentage Value
                </option>

                <option value="percentageLabel">
                  Goal Percentage Label
                </option>

                <option value="daysValue">
                  Days Left Value
                </option>

                <option value="daysLabel">
                  Days Left Label
                </option>
              </>
            ) : null}

            <option value="button">
              Donation Buttons
            </option>
          </select>
        </div>

        {/* STYLE TARGET */}

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
              donationStyleTarget
            }
            onChange={(e) =>
              setDonationStyleTarget(
                e.target
                  .value as DonationStyleTarget,
              )
            }
            className={
              inspectorInputClass()
            }
          >
            <option value="block">
              Block
            </option>

            {isProfessional ? (
              <>
                <option value="progressTrack">
                  Goal Progress Track
                </option>

                <option value="progressFill">
                  Goal Progress Fill
                </option>

                <option value="metricCards">
                  Impact Stats
                </option>
              </>
            ) : null}

            <option value="button">
              Donation Buttons
            </option>
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SHARED CONTENT */}
      {/* ============================================================ */}

      <div className="mt-4">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Title
        </div>

        <input
          type="text"
          value={
            data.heading ??
            ""
          }
          onChange={(e) =>
            patchDonationData({
              heading:
                e.target.value,
            })
          }
          className={
            inspectorInputClass()
          }
        />
      </div>

      <div className="mt-4">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Description
        </div>

        <textarea
          value={
            data.description ??
            ""
          }
          onChange={(e) =>
            patchDonationData({
              description:
                e.target.value,
            })
          }
          className={
            inspectorTextareaClass()
          }
        />
      </div>

      {/* ============================================================ */}
      {/* PROFESSIONAL */}
      {/* ============================================================ */}

      {isProfessional ? (
        <>
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Campaign Progress
            </div>

            {/* GOAL */}

            <div className="mt-3">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Total Goal Amount
              </div>

              <input
                type="number"
                min={0}
                step="0.01"
                value={
                  Number(
                    data.goalAmount ??
                      0,
                  )
                }
                onChange={(e) =>
                  patchDonationData({
                    goalAmount:
                      Math.max(
                        0,
                        Number(
                          e.target
                            .value,
                        ) || 0,
                      ),
                  })
                }
                className={
                  inspectorInputClass()
                }
              />

              <label className="mt-3 flex items-center gap-2 text-sm font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={
                    data.showGoalAmountDecimals ??
                    false
                  }
                  onChange={(e) =>
                    patchDonationData({
                      showGoalAmountDecimals:
                        e.target.checked,
                    })
                  }
                />

                Show decimal places
              </label>
            </div>

            {/* RAISED */}

            <div className="mt-3">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Raised Amount
              </div>

              <input
                type="number"
                min={0}
                step="0.01"
                value={
                  Number(
                    data.raisedAmount ??
                      0,
                  )
                }
                onChange={(e) =>
                  patchDonationData({
                    raisedAmount:
                      Math.max(
                        0,
                        Number(
                          e.target
                            .value,
                        ) || 0,
                      ),
                  })
                }
                className={
                  inspectorInputClass()
                }
              />

              <label className="mt-3 flex items-center gap-2 text-sm font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={
                    data.showRaisedAmountDecimals ??
                    true
                  }
                  onChange={(e) =>
                    patchDonationData({
                      showRaisedAmountDecimals:
                        e.target.checked,
                    })
                  }
                />

                Show decimal places
              </label>
            </div>

            {/* RAISED AMOUNT STATUS */}

            <div className="mt-3">
              <div className={inspectorLabelClass()}>
                Raised Amount Descriptor
              </div>

              <input
                type="text"
                value={
                  data.raisedAmountDescriptor ??
                  "raised of"
                }
                onChange={(e) =>
                  patchDonationData({
                    raisedAmountDescriptor:
                      e.target.value,
                  })
                }
                className={inspectorInputClass()}
                placeholder="raised of"
              />

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Example: $146,785.00 raised of $250,000 goal
              </p>
            </div>

            <div className="mt-3">
              <div className={inspectorLabelClass()}>
                Goal Descriptor
              </div>

              <input
                type="text"
                value={
                  data.goalDescriptor ??
                  "goal"
                }
                onChange={(e) =>
                  patchDonationData({
                    goalDescriptor:
                      e.target.value,
                  })
                }
                className={inspectorInputClass()}
                placeholder="goal"
              />

              <label className="mt-3 flex items-center gap-2 text-sm font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={
                    data.showRaisedStatusGoalDecimals ??
                    false
                  }
                  onChange={(e) =>
                    patchDonationData({
                      showRaisedStatusGoalDecimals:
                        e.target.checked,
                    })
                  }
                />

                Show goal decimal places in status
              </label>
            </div>

<div className="mt-3">
  <div className={inspectorLabelClass()}>
    Goal Descriptor
  </div>

  <input
    type="text"
    value={
      data.goalDescriptor ??
      "goal"
    }
    onChange={(e) =>
      patchDonationData({
        goalDescriptor:
          e.target.value,
      })
    }
    className={inspectorInputClass()}
    placeholder="goal"
  />
</div>

            {/* DONORS */}

            <div className="mt-3">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Number of Donors
              </div>

              <input
                type="number"
                min={0}
                step={1}
                value={
                  Number(
                    data.donorCount ??
                      0,
                  )
                }
                onChange={(e) =>
                  patchDonationData({
                    donorCount:
                      Math.max(
                        0,
                        Math.floor(
                          Number(
                            e.target
                              .value,
                          ) || 0,
                        ),
                      ),
                  })
                }
                className={
                  inspectorInputClass()
                }
              />
            </div>

            {/* DEADLINE */}

<div className="mt-3">
  <div className={inspectorLabelClass()}>
    Campaign Deadline
  </div>

  <input
    type="date"
    value={
      data.deadline ??
      ""
    }
    onChange={(e) =>
      patchDonationData({
        deadline:
          e.target.value,
      })
    }
    className={inspectorInputClass()}
  />

  <p className="mt-2 text-xs leading-5 text-neutral-500">
    Days Left is calculated automatically. Once the deadline passes, the value
    stays at 0 instead of becoming negative.
  </p>
</div>
          </div>

{/* ======================================================== */}
{/* PROFESSIONAL LAYOUT */}
{/* ======================================================== */}

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>
    Professional Layout
  </div>

  <div className="mt-4">
    <div className="flex items-center justify-between gap-3">
      <div className={inspectorLabelClass()}>
        Progress Bar Height
      </div>

      <div className="text-xs text-neutral-500">
        {Number(
          data.progressTrackStyle?.height ??
            20,
        )}
        px
      </div>
    </div>

    <input
      type="range"
      min={4}
      max={60}
      step={1}
      value={Number(
        data.progressTrackStyle?.height ??
          20,
      )}
      onChange={(e) =>
        patchDonationData({
          progressTrackStyle: {
            ...(data.progressTrackStyle ??
              {}),

            height:
              Number(
                e.target.value,
              ),
          },
        })
      }
      className="mt-2 w-full"
    />
  </div>

  <div className="mt-4">
    <div className="flex items-center justify-between gap-3">
      <div className={inspectorLabelClass()}>
        Impact Card Spacing
      </div>

      <div className="text-xs text-neutral-500">
        {Number(
          data.metricCardStyle?.gap ??
            16,
        )}
        px
      </div>
    </div>

    <input
      type="range"
      min={0}
      max={48}
      step={1}
      value={Number(
        data.metricCardStyle?.gap ??
          16,
      )}
      onChange={(e) =>
        patchDonationData({
          metricCardStyle: {
            ...(data.metricCardStyle ??
              {}),

            gap:
              Number(
                e.target.value,
              ),
          },
        })
      }
      className="mt-2 w-full"
    />
  </div>

  <div className="mt-4">
    <div className="flex items-center justify-between gap-3">
      <div className={inspectorLabelClass()}>
        Impact Card Padding
      </div>

      <div className="text-xs text-neutral-500">
        {Number(
          data.metricCardStyle?.padding ??
            10,
        )}
        px
      </div>
    </div>

    <input
      type="range"
      min={0}
      max={48}
      step={1}
      value={Number(
        data.metricCardStyle?.padding ??
          10,
      )}
      onChange={(e) =>
        patchDonationData({
          metricCardStyle: {
            ...(data.metricCardStyle ??
              {}),

            padding:
              Number(
                e.target.value,
              ),
          },
        })
      }
      className="mt-2 w-full"
    />
  </div>
</div>


          {/* ======================================================== */}
          {/* IMPACT STATS */}
          {/* ======================================================== */}

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Impact Stats
            </div>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              These three cards appear beneath the campaign progress.
            </p>

            {/* DONORS CARD */}

            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
              <div className="text-sm font-semibold text-neutral-900">
                Donors
              </div>

              <div className="mt-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Icon
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveIconTarget(
                      "donorIcon",
                    );

                    setIconSearch("");
                  }}
                  className={[
                    "mt-2 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition",

                    activeIconTarget ===
                    "donorIcon"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100",
                  ].join(" ")}
                >
                  {data.donorIcon ? (
                    <img
                      src={
                        data.donorIcon
                      }
                      alt=""
                      className="h-6 w-6 shrink-0 object-contain"
                    />
                  ) : (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-dashed border-neutral-300 text-xs">
                      +
                    </div>
                  )}

                  <span className="min-w-0 flex-1">
                    {data.donorIcon
                      ? "Change Icon"
                      : "Choose Icon"}
                  </span>
                </button>
              </div>

              <div className="mt-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Label
                </div>

                <input
                  type="text"
                  value={
                    data.donorLabel ??
                    "Donors"
                  }
                  onChange={(e) =>
                    patchDonationData({
                      donorLabel:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>
            </div>

            {/* PERCENTAGE CARD */}

            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
              <div className="text-sm font-semibold text-neutral-900">
                Goal Percentage
              </div>

              <div className="mt-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Icon
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveIconTarget(
                      "percentageIcon",
                    );

                    setIconSearch("");
                  }}
                  className={[
                    "mt-2 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition",

                    activeIconTarget ===
                    "percentageIcon"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100",
                  ].join(" ")}
                >
                  {data.percentageIcon ? (
                    <img
                      src={
                        data.percentageIcon
                      }
                      alt=""
                      className="h-6 w-6 shrink-0 object-contain"
                    />
                  ) : (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-dashed border-neutral-300 text-xs">
                      +
                    </div>
                  )}

                  <span className="min-w-0 flex-1">
                    {data.percentageIcon
                      ? "Change Icon"
                      : "Choose Icon"}
                  </span>
                </button>
              </div>

              <div className="mt-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Label
                </div>

                <input
                  type="text"
                  value={
                    data.percentageLabel ??
                    "of Goal"
                  }
                  onChange={(e) =>
                    patchDonationData({
                      percentageLabel:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>
            </div>

            {/* DAYS LEFT CARD */}

            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
              <div className="text-sm font-semibold text-neutral-900">
                Days Left
              </div>

              <div className="mt-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Icon
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveIconTarget(
                      "daysLeftIcon",
                    );

                    setIconSearch("");
                  }}
                  className={[
                    "mt-2 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition",

                    activeIconTarget ===
                    "daysLeftIcon"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100",
                  ].join(" ")}
                >
                  {data.daysLeftIcon ? (
                    <img
                      src={
                        data.daysLeftIcon
                      }
                      alt=""
                      className="h-6 w-6 shrink-0 object-contain"
                    />
                  ) : (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-dashed border-neutral-300 text-xs">
                      +
                    </div>
                  )}

                  <span className="min-w-0 flex-1">
                    {data.daysLeftIcon
                      ? "Change Icon"
                      : "Choose Icon"}
                  </span>
                </button>
              </div>

              <div className="mt-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Label
                </div>

                <input
                  type="text"
                  value={
                    data.daysLeftLabel ??
                    "Days Left"
                  }
                  onChange={(e) =>
                    patchDonationData({
                      daysLeftLabel:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>
            </div>

            {/* ====================================================== */}
            {/* ICON PICKER */}
            {/* ====================================================== */}

            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Choose Icon For{" "}
                {activeIconTarget ===
                "donorIcon"
                  ? "Donors"
                  : activeIconTarget ===
                      "percentageIcon"
                    ? "Goal Percentage"
                    : "Days Left"}
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  value={
                    iconSearch
                  }
                  onChange={(e) =>
                    setIconSearch(
                      e.target.value,
                    )
                  }
                  placeholder="Search icons..."
                  className={
                    inspectorInputClass()
                  }
                />

                {iconSearch ? (
                  <button
                    type="button"
                    onClick={() =>
                      setIconSearch("")
                    }
                    className="mt-2 text-xs font-medium text-neutral-500 hover:text-neutral-900"
                  >
                    Clear search
                  </button>
                ) : null}
              </div>

              <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2">
                {filteredIconTools.length >
                0 ? (
                  <div className="grid grid-cols-1 gap-1">
                    {filteredIconTools.map(
                      (
                        tool: any,
                      ) => {
                        const iconName =
                          tool.iconName ??
                          "star";

                        const iconUrl =
                          `/media-icons/${iconName}.svg`;

                        const currentIcon =
                          String(
                            data[
                              activeIconTarget
                            ] ?? "",
                          );

                        const isActive =
                          currentIcon ===
                          iconUrl;

                        return (
                          <button
                            key={
                              iconName
                            }
                            type="button"
                            onClick={() =>
                              patchDonationData(
                                {
                                  [activeIconTarget]:
                                    iconUrl,
                                },
                              )
                            }
                            className={[
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",

                              isActive
                                ? "bg-neutral-900 text-white"
                                : "text-neutral-800 hover:bg-neutral-100",
                            ].join(
                              " ",
                            )}
                          >
                            <img
                              src={
                                iconUrl
                              }
                              alt=""
                              className="h-5 w-5 shrink-0 object-contain"
                            />

                            <span className="min-w-0 flex-1 truncate">
                              {
                                tool.label
                              }
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-neutral-500">
                    No matching
                    icons
                  </div>
                )}
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                {
                  filteredIconTools.length
                }{" "}
                {filteredIconTools.length ===
                1
                  ? "icon"
                  : "icons"}{" "}
                found
              </div>

              {data[
                activeIconTarget
              ] ? (
                <button
                  type="button"
                  onClick={() =>
                    patchDonationData(
                      {
                        [activeIconTarget]:
                          "",
                      },
                    )
                  }
                  className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Remove Selected
                  Icon
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {/* ============================================================ */}
      {/* DONATION OPTIONS */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Donation Options
        </div>

        {/* CUSTOM */}

        <label className="mt-3 flex items-center gap-2 text-sm font-medium text-neutral-800">
          <input
            type="checkbox"
            checked={
              data.allowCustomAmount ??
              true
            }
            onChange={(e) =>
              patchDonationData({
                allowCustomAmount:
                  e.target.checked,
              })
            }
          />

          Allow custom donation amount
        </label>

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Custom Button Label
          </div>

          <input
            type="text"
            value={
              data.customAmountLabel ??
              "Custom Amount"
            }
            onChange={(e) =>
              patchDonationData({
                customAmountLabel:
                  e.target.value,
              })
            }
            className={
              inspectorInputClass()
            }
            placeholder="Custom Amount"
          />
        </div>

        {/* BUTTONS */}

        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Donation Buttons
          </div>

          <div className="mt-3 space-y-3">
            {donationOptions.map(
              (
                option: any,
                index: number,
              ) => (
                <div
                  key={
                    option.id ||
                    `donation-option-${index}`
                  }
                  className="rounded-xl border border-neutral-200 bg-white p-3"
                >
                  <div className="grid gap-3">
                    <div>
                      <div
                        className={
                          inspectorLabelClass()
                        }
                      >
                        Button Label
                      </div>

                      <input
                        type="text"
                        value={
                          option.label ??
                          ""
                        }
                        onChange={(e) =>
                          patchDonationData({
                            donationOptions:
                              donationOptions.map(
                                (
                                  item: any,
                                ) =>
                                  item.id !==
                                  option.id
                                    ? item
                                    : {
                                        ...item,

                                        label:
                                          e
                                            .target
                                            .value,
                                      },
                              ),
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
                        Amount
                      </div>

                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={
                          option.amount ??
                          0
                        }
                        onChange={(e) =>
                          patchDonationData({
                            donationOptions:
                              donationOptions.map(
                                (
                                  item: any,
                                ) =>
                                  item.id !==
                                  option.id
                                    ? item
                                    : {
                                        ...item,

                                        amount:
                                          Math.max(
                                            1,
                                            Number(
                                              e
                                                .target
                                                .value,
                                            ) ||
                                              1,
                                          ),
                                      },
                              ),
                          })
                        }
                        className={
                          inspectorInputClass()
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        patchDonationData({
                          donationOptions:
                            donationOptions.filter(
                              (
                                item: any,
                              ) =>
                                item.id !==
                                option.id,
                            ),
                        })
                      }
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-red-300 bg-white px-4 text-sm font-medium text-red-600 hover:border-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              patchDonationData({
                donationOptions: [
                  ...donationOptions,

                  {
                    id:
                      makeClientId(
                        "donationopt",
                      ),

                    label:
                      "$10",

                    amount:
                      10,
                  },
                ],
              })
            }
            className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 hover:border-neutral-900"
          >
            Add Donation Button
          </button>
        </div>

        {/* SPACING */}

        <div className="mt-4">
          <div
            className="flex items-center justify-between gap-3"
          >
            <div
              className={
                inspectorLabelClass()
              }
            >
              Button Spacing
            </div>

            <div className="text-xs text-neutral-500">
              {Number(
                data.buttonSpacing ??
                  8,
              )}
              px
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={64}
            step={1}
            value={
              Number(
                data.buttonSpacing ??
                  8,
              )
            }
            onChange={(e) =>
              patchDonationData({
                buttonSpacing:
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