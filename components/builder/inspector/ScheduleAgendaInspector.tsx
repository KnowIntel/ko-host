"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  ScheduleAgendaStyleTarget,
  ScheduleAgendaTextTarget,
} from "@/components/builder/formatting/scheduleAgendaFormatting";

type ScheduleAgendaColumnKey =
  | "date"
  | "event"
  | "location"
  | "time";

type ScheduleAgendaInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  scheduleAgendaTextTarget: ScheduleAgendaTextTarget;

  setScheduleAgendaTextTarget: Dispatch<
    SetStateAction<ScheduleAgendaTextTarget>
  >;

  scheduleAgendaStyleTarget: ScheduleAgendaStyleTarget;

  setScheduleAgendaStyleTarget: Dispatch<
    SetStateAction<ScheduleAgendaStyleTarget>
  >;

  makeClientId: (
    prefix: string,
  ) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (
    position?: any,
  ) => string;
};

const PROFESSIONAL_COLUMNS: Array<{
  key: ScheduleAgendaColumnKey;
  label: string;
}> = [
  {
    key: "date",
    label: "Date",
  },
  {
    key: "event",
    label: "Event / Activity",
  },
  {
    key: "location",
    label: "Location",
  },
  {
    key: "time",
    label: "Time",
  },
];

export function ScheduleAgendaInspector({
  selectedBlock,
  updateSelectedBlock,

  scheduleAgendaTextTarget,
  setScheduleAgendaTextTarget,

  scheduleAgendaStyleTarget,
  setScheduleAgendaStyleTarget,

  makeClientId,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,

  toolSetButtonClass,
}: ScheduleAgendaInspectorProps) {
  const styleVariant =
    selectedBlock?.data?.styleVariant ===
    "professional"
      ? "professional"
      : "standard";

  const isProfessional =
    styleVariant === "professional";

  const columnOrder: ScheduleAgendaColumnKey[] =
    Array.isArray(
      selectedBlock.data.columnOrder,
    ) &&
    selectedBlock.data.columnOrder.length ===
      4
      ? selectedBlock.data.columnOrder
      : [
          "date",
          "event",
          "location",
          "time",
        ];

  function updateScheduleData(
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !==
        "schedule_agenda"
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

  function updateScheduleItem(
    itemId: string,
    patch: Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !==
        "schedule_agenda"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                items:
                  block.data.items.map(
                    (entry: any) =>
                      entry.id === itemId
                        ? {
                            ...entry,
                            ...patch,
                          }
                        : entry,
                  ),
              },
            },
    );
  }

  function moveColumn(
    columnKey: ScheduleAgendaColumnKey,
    direction: "left" | "right",
  ) {
    const currentIndex =
      columnOrder.indexOf(columnKey);

    const nextIndex =
      direction === "left"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= columnOrder.length
    ) {
      return;
    }

    const nextOrder = [
      ...columnOrder,
    ];

    const [
      movedColumn,
    ] = nextOrder.splice(
      currentIndex,
      1,
    );

    nextOrder.splice(
      nextIndex,
      0,
      movedColumn,
    );

    updateScheduleData({
      columnOrder: nextOrder,
    });
  }

  function moveScheduleItem(
    itemId: string,
    direction: "up" | "down",
  ) {
    updateSelectedBlock(
      (block: any) => {
        if (
          block.type !==
          "schedule_agenda"
        ) {
          return block;
        }

        const items = [
          ...block.data.items,
        ];

        const currentIndex =
          items.findIndex(
            (item: any) =>
              item.id === itemId,
          );

        if (currentIndex < 0) {
          return block;
        }

        const nextIndex =
          direction === "up"
            ? currentIndex - 1
            : currentIndex + 1;

        if (
          nextIndex < 0 ||
          nextIndex >= items.length
        ) {
          return block;
        }

        const [
          movedItem,
        ] = items.splice(
          currentIndex,
          1,
        );

        items.splice(
          nextIndex,
          0,
          movedItem,
        );

        return {
          ...block,

          data: {
            ...block.data,
            items,
          },
        };
      },
    );
  }

  function removeScheduleItem(
    itemId: string,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !==
        "schedule_agenda"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                items:
                  block.data.items
                    .length > 1
                    ? block.data.items.filter(
                        (
                          entry: any,
                        ) =>
                          entry.id !==
                          itemId,
                      )
                    : block.data.items,
              },
            },
    );
  }

  function addScheduleItem() {
    updateSelectedBlock(
      (block: any) =>
        block.type !==
        "schedule_agenda"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                items: [
                  ...block.data.items,

                  {
                    id: makeClientId(
                      "schedule",
                    ),

                    date: "MAY 17",

                    time:
                      "12:00 PM",

                    title:
                      "New Event",

                    description: "",

                    location: "",

                    indicatorColor:
                      "#4f83b6",
                  },
                ],
              },
            },
    );
  }

return (
  <div className="space-y-4">
    {/* ================================================================ */}
    {/* FORMATTING */}
    {/* ================================================================ */}

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
        Formatting
      </div>

      <div className="mt-4">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Text Target
        </div>

        <select
          value={
            scheduleAgendaTextTarget
          }
          onChange={(e) =>
            setScheduleAgendaTextTarget(
              e.target
                .value as ScheduleAgendaTextTarget,
            )
          }
          className={
            inspectorInputClass()
          }
        >
          <option value="heading">
            Heading
          </option>

          {isProfessional ? (
            <>
              <option value="headerNote">
                Header Note
              </option>

              <option value="columnHeader">
                Column Headers
              </option>

              <option value="date">
                Date
              </option>

              <option value="title">
                Event Title
              </option>

              <option value="description">
                Event Description
              </option>

              <option value="location">
                Location
              </option>

              <option value="time">
                Time
              </option>
            </>
          ) : (
            <>
              <option value="time">
                Time
              </option>

              <option value="title">
                Title
              </option>

              <option value="description">
                Description
              </option>
            </>
          )}
        </select>
      </div>

      <div className="mt-4">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Style Target
        </div>

        <select
          value={
            scheduleAgendaStyleTarget
          }
          onChange={(e) =>
            setScheduleAgendaStyleTarget(
              e.target
                .value as ScheduleAgendaStyleTarget,
            )
          }
          className={
            inspectorInputClass()
          }
        >
          <option value="block">
            Block
          </option>

          <option value="panel">
            {isProfessional
              ? "Rows"
              : "Panel"}
          </option>
        </select>
      </div>
    </div>

    {/* ================================================================ */}
    {/* SCHEDULE / AGENDA */}
    {/* ================================================================ */}

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
        Schedule / Agenda
      </div>

      <div className="mt-4">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Style Variant
        </div>

        <select
          value={styleVariant}
          onChange={(e) =>
            updateScheduleData({
              styleVariant:
                e.target.value ===
                "professional"
                  ? "professional"
                  : "standard",
            })
          }
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

      <div className="mt-4">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Heading
        </div>

        <input
          type="text"
          value={
            selectedBlock.data
              .heading ?? ""
          }
          onChange={(e) =>
            updateScheduleData({
              heading:
                e.target.value,
            })
          }
          className={
            inspectorInputClass()
          }
        />
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={Boolean(
            selectedBlock.data
              .allowUserEngagement,
          )}
          onChange={(e) =>
            updateScheduleData({
              allowUserEngagement:
                e.target.checked,
            })
          }
        />

        Allow user engagement
      </label>
    </div>

      {/* ================================================================ */}
      {/* PROFESSIONAL LAYOUT */}
      {/* ================================================================ */}

      {isProfessional ? (
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
            Professional Layout
          </div>

          <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
            <div>
              <div className="text-sm font-medium text-neutral-800">
                Column Headers
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                Show labels above
                the schedule columns.
              </div>
            </div>

            <input
              type="checkbox"
              checked={
                selectedBlock.data
                  .showColumnHeaders !==
                false
              }
              onChange={(e) =>
                updateScheduleData({
                  showColumnHeaders:
                    e.target.checked,
                })
              }
            />
          </label>

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Header Note
            </div>

            <input
              type="text"
              value={
                selectedBlock.data
                  .headerNote ?? ""
              }
              onChange={(e) =>
                updateScheduleData({
                  headerNote:
                    e.target.value,
                })
              }
              placeholder="All times local"
              className={
                inspectorInputClass()
              }
            />
          </div>

          <div className="mt-5">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Column Labels
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs text-neutral-500">
                  Date
                </div>

                <input
                  value={
                    selectedBlock.data
                      .dateColumnLabel ??
                    "DATE"
                  }
                  onChange={(e) =>
                    updateScheduleData({
                      dateColumnLabel:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>

              <div>
                <div className="text-xs text-neutral-500">
                  Event / Activity
                </div>

                <input
                  value={
                    selectedBlock.data
                      .eventColumnLabel ??
                    "EVENT / ACTIVITY"
                  }
                  onChange={(e) =>
                    updateScheduleData({
                      eventColumnLabel:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>

              <div>
                <div className="text-xs text-neutral-500">
                  Location
                </div>

                <input
                  value={
                    selectedBlock.data
                      .locationColumnLabel ??
                    "LOCATION"
                  }
                  onChange={(e) =>
                    updateScheduleData({
                      locationColumnLabel:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>

              <div>
                <div className="text-xs text-neutral-500">
                  Time
                </div>

                <input
                  value={
                    selectedBlock.data
                      .timeColumnLabel ??
                    "TIME"
                  }
                  onChange={(e) =>
                    updateScheduleData({
                      timeColumnLabel:
                        e.target.value,
                    })
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>
            </div>
          </div>

          {/* COLUMN ORDER */}

          <div className="mt-6">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Column Order
            </div>

            <div className="mt-1 text-xs leading-5 text-neutral-500">
              Use the arrows to move
              each column left or
              right.
            </div>

            <div className="mt-3 space-y-2">
              {columnOrder.map(
                (
                  columnKey,
                  index,
                ) => {
                  const column =
                    PROFESSIONAL_COLUMNS.find(
                      (candidate) =>
                        candidate.key ===
                        columnKey,
                    );

                  if (!column) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        columnKey
                      }
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1 text-sm font-medium text-neutral-800">
                        {
                          column.label
                        }
                      </div>

                      <button
                        type="button"
                        disabled={
                          index === 0
                        }
                        onClick={() =>
                          moveColumn(
                            columnKey,
                            "left",
                          )
                        }
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                          index === 0
                            ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                            : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                        ].join(
                          " ",
                        )}
                        title="Move column left"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        disabled={
                          index ===
                          columnOrder.length -
                            1
                        }
                        onClick={() =>
                          moveColumn(
                            columnKey,
                            "right",
                          )
                        }
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                          index ===
                          columnOrder.length -
                            1
                            ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                            : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                        ].join(
                          " ",
                        )}
                        title="Move column right"
                      >
                        →
                      </button>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ================================================================ */}
      {/* ITEMS */}
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
            Schedule Items
          </div>

          <div className="text-xs text-neutral-500">
            {
              selectedBlock.data
                .items.length
            }{" "}
            {selectedBlock.data
              .items.length === 1
              ? "item"
              : "items"}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {selectedBlock.data.items.map(
            (
              item: any,
              index: number,
            ) => (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      Item{" "}
                      {index + 1}
                    </div>

                    <div className="mt-1 text-xs text-neutral-500">
                      {isProfessional
                        ? "Professional schedule row"
                        : "Standard schedule item"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={
                        index === 0
                      }
                      onClick={() =>
                        moveScheduleItem(
                          item.id,
                          "up",
                        )
                      }
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                        index === 0
                          ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                      ].join(
                        " ",
                      )}
                      title="Move item up"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      disabled={
                        index ===
                        selectedBlock
                          .data.items
                          .length -
                          1
                      }
                      onClick={() =>
                        moveScheduleItem(
                          item.id,
                          "down",
                        )
                      }
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                        index ===
                        selectedBlock
                          .data.items
                          .length -
                          1
                          ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                      ].join(
                        " ",
                      )}
                      title="Move item down"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className={
                        toolSetButtonClass(
                          "remove",
                        )
                      }
                      onClick={() =>
                        removeScheduleItem(
                          item.id,
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>

                {isProfessional ? (
                  <>
                    <div className="mt-4">
                      <div
                        className={
                          inspectorLabelClass()
                        }
                      >
                        Indicator Color
                      </div>

                      <input
                        type="color"
                        value={
                          item.indicatorColor ??
                          "#4f83b6"
                        }
                        onChange={(e) =>
                          updateScheduleItem(
                            item.id,
                            {
                              indicatorColor:
                                e.target
                                  .value,
                            },
                          )
                        }
                        className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-neutral-300 bg-white p-1"
                      />
                    </div>

                    <div className="mt-4">
                      <div
                        className={
                          inspectorLabelClass()
                        }
                      >
                        Date
                      </div>

                      <input
                        value={
                          item.date ??
                          ""
                        }
                        onChange={(e) =>
                          updateScheduleItem(
                            item.id,
                            {
                              date: e
                                .target
                                .value,
                            },
                          )
                        }
                        placeholder="MAY 15"
                        className={
                          inspectorInputClass()
                        }
                      />
                    </div>
                  </>
                ) : null}

                <div className="mt-4">
                  <div
                    className={
                      inspectorLabelClass()
                    }
                  >
                    Time
                  </div>

                  <input
                    value={
                      item.time ?? ""
                    }
                    onChange={(e) =>
                      updateScheduleItem(
                        item.id,
                        {
                          time: e
                            .target
                            .value,
                        },
                      )
                    }
                    placeholder="9:00 AM"
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
                    {isProfessional
                      ? "Event / Activity"
                      : "Title"}
                  </div>

                  <input
                    value={
                      item.title ?? ""
                    }
                    onChange={(e) =>
                      updateScheduleItem(
                        item.id,
                        {
                          title: e
                            .target
                            .value,
                        },
                      )
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
                      item.description ??
                      ""
                    }
                    onChange={(e) =>
                      updateScheduleItem(
                        item.id,
                        {
                          description:
                            e.target
                              .value,
                        },
                      )
                    }
                    className={
                      inspectorTextareaClass()
                    }
                  />
                </div>

                {isProfessional ? (
                  <div className="mt-4">
                    <div
                      className={
                        inspectorLabelClass()
                      }
                    >
                      Location
                    </div>

                    <input
                      value={
                        item.location ??
                        ""
                      }
                      onChange={(e) =>
                        updateScheduleItem(
                          item.id,
                          {
                            location:
                              e.target
                                .value,
                          },
                        )
                      }
                      placeholder="Rome"
                      className={
                        inspectorInputClass()
                      }
                    />
                  </div>
                ) : null}
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
            onClick={
              addScheduleItem
            }
          >
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
}