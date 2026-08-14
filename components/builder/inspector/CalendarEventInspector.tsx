"use client";

import type { Dispatch, SetStateAction } from "react";

import type {
  CalendarEventStyleTarget,
  CalendarEventTextTarget,
} from "@/components/builder/formatting/calendarEventFormatting";

/**
 * Calendar Event inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "calendar_event"
 */
type CalendarEventInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  calendarEventTextTarget: CalendarEventTextTarget;
  setCalendarEventTextTarget: Dispatch<
    SetStateAction<CalendarEventTextTarget>
  >;

  calendarEventStyleTarget: CalendarEventStyleTarget;
  setCalendarEventStyleTarget: Dispatch<
    SetStateAction<CalendarEventStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  uploadImageToSelectedBlock: (
    blockId: string,
    imageSlot?: any,
    imageId?: any,
    postId?: any,
  ) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function CalendarEventInspector({
  selectedBlock,
  updateSelectedBlock,
  calendarEventTextTarget,
  setCalendarEventTextTarget,
  calendarEventStyleTarget,
  setCalendarEventStyleTarget,
  makeClientId,
  uploadImageToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: CalendarEventInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Formatting */}
      <div className={inspectorLabelClass()}>Formatting</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Text Target</div>

  <select
    value={calendarEventTextTarget}
    onChange={(e) =>
      setCalendarEventTextTarget(
        e.target.value as CalendarEventTextTarget,
      )
    }
    className={inspectorInputClass()}
  >
    <optgroup label="Calendar">
      <option value="heading">Heading</option>
      <option value="subtitle">Subtitle</option>
      <option value="monthYearLabel">Month/Year Label</option>
      <option value="weeklyDayLabels">Weekly Day Labels</option>
      <option value="monthlyDateLabels">Monthly Date Labels</option>
      <option value="monthArrows">Month Arrows</option>
      <option value="emptyStateText">Empty State Text</option>
      <option value="scheduledLabel">Scheduled Label</option>
      <option value="eventDot">Event Dot</option>
    </optgroup>

    <optgroup label="Event">
      <option value="eventTitle">Event Title</option>
      <option value="eventSubtitle">Event Subtitle</option>
      <option value="eventDate">Event Date</option>
      <option value="eventMeetingMethod">
        Event Meeting Method
      </option>
      <option value="eventLocation">Event Location</option>
      <option value="eventAddress">Event Address</option>
      <option value="virtualMeetingLink">
        Virtual Meeting Link
      </option>
      <option value="eventDescription">
        Event Description
      </option>
      <option value="capacity">Capacity</option>
      <option value="categoryHostTags">
        Category &amp; Host Tags
      </option>
      <option value="ctaButton">CTA Button</option>
    </optgroup>

    <optgroup label="Professional Scheduling">
      <option value="professionalDetailsHeading">
        Visitor Details Heading
      </option>

      <option value="professionalFieldText">
        Form Field Text
      </option>

      <option value="professionalChoiceText">
        Appointment Choice Text
      </option>

      <option value="professionalTimesHeading">
        Available Times Heading
      </option>

      <option value="professionalTimeSlotText">
        Time Slot Text
      </option>

      <option value="professionalBookingButton">
        Booking Button Text
      </option>

      <option value="professionalConfirmationHeading">
        Confirmation Heading
      </option>

      <option value="professionalConfirmationMessage">
        Confirmation Message
      </option>
    </optgroup>
  </select>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Style Target</div>

  <select
    value={calendarEventStyleTarget}
    onChange={(e) =>
      setCalendarEventStyleTarget(
        e.target.value as CalendarEventStyleTarget,
      )
    }
    className={inspectorInputClass()}
  >
    <optgroup label="Calendar">
      <option value="calendar">Calendar</option>
      <option value="eventCard">Event Card</option>
      <option value="selectedDateCard">
        Selected Date Card
      </option>
      <option value="calendarDateCircles">
        Calendar Date Circles
      </option>
      <option value="monthArrowCircles">
        Month Arrow Circles
      </option>
      <option value="ctaButton">CTA Button</option>
    </optgroup>

    <optgroup label="Professional Scheduling">
      <option value="professionalDetailsPanel">
        Visitor Details Panel
      </option>

      <option value="professionalField">
        Form Fields
      </option>

      <option value="professionalChoiceButton">
        Appointment Choice Buttons
      </option>

      <option value="professionalTimesPanel">
        Available Times Panel
      </option>

      <option value="professionalTimeSlotButton">
        Time Slot Buttons
      </option>

      <option value="professionalBookingButton">
        Booking Button
      </option>

      <option value="professionalConfirmationPanel">
        Confirmation Panel
      </option>
    </optgroup>

    <option value="block">Entire Block</option>
  </select>
</div>

      {/* Calendar Event */}
      <div className="mt-6">
        <div className={inspectorLabelClass()}>Calendar Event</div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Time Format</div>

        <select
          value={(selectedBlock.data as any).timeFormat ?? "12h"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      timeFormat: e.target.value as "12h" | "24h",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="12h">12 Hour Clock</option>
          <option value="24h">24 Hour Clock</option>
        </select>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={
            (selectedBlock.data as any).showHeadingImage === true
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showHeadingImage: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Heading Image
      </label>

      {(selectedBlock.data as any).showHeadingImage === true ? (
        <>
          <div className="mt-3 flex items-center gap-3">
            {(selectedBlock.data as any).headingImageUrl ? (
              <img
                src={(selectedBlock.data as any).headingImageUrl}
                alt=""
                className="h-14 w-14 rounded-lg border object-cover"
              />
            ) : null}

            <button
              type="button"
              className="h-10 flex-1 rounded-xl border border-neutral-300 bg-white"
              onClick={() =>
                uploadImageToSelectedBlock(selectedBlock.id)
              }
            >
              Choose Image
            </button>
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>
              Image Size
            </div>

            <input
              type="range"
              min={32}
              max={160}
              value={
                (selectedBlock.data as any).headingImageSize ?? 64
              }
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          headingImageSize: Number(e.target.value),
                        },
                      },
                )
              }
            />
          </div>
        </>
      ) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : { ...block, data: { ...block.data, heading: e.target.value } },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <input
        type="text"
        value={selectedBlock.data.subtitle ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : { ...block, data: { ...block.data, subtitle: e.target.value } },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Style Variant</div>

  <select
    value={selectedBlock.data.variant}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "calendar_event"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                variant: e.target.value as
                  | "standard"
                  | "formal"
                  | "simplified"
                  | "compact"
                  | "professional",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="standard">Standard</option>
    <option value="formal">Formal</option>
    <option value="simplified">Simplified</option>
    <option value="compact">Compact</option>
    <option value="professional">Professional</option>
  </select>
</div>

    {selectedBlock.data.variant === "compact" ? (
  <div className="mt-4 space-y-3">
    <div className={inspectorLabelClass()}>Compact Settings</div>

    <div>
      <div className={inspectorLabelClass()}>
        Date Format
      </div>

      <select
        value={selectedBlock.data.compactDateFormat ?? "weekday"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    compactDateFormat:
                      e.target.value as
                        | "weekday"
                        | "short"
                        | "numeric",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="weekday">
          Saturday, May 25
        </option>

        <option value="short">
          May 25
        </option>

        <option value="numeric">
          05/25/2026
        </option>
      </select>
    </div>

    <div>
      <div className={inspectorLabelClass()}>
        Max Visible Events
      </div>

      <input
        type="number"
        min={1}
        max={20}
        value={selectedBlock.data.compactMaxVisibleEvents ?? 4}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    compactMaxVisibleEvents:
                      Number(e.target.value) || 4,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div>
      <div className={inspectorLabelClass()}>
        View All Text
      </div>

      <input
        type="text"
        value={
          selectedBlock.data.compactViewAllText ??
          "View All Events"
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    compactViewAllText: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div>
      <div className={inspectorLabelClass()}>
        View All URL
      </div>

      <input
        type="text"
        value={
          selectedBlock.data.compactViewAllUrl ?? ""
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    compactViewAllUrl: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

<label className="flex items-center gap-2 text-sm text-neutral-700">
  <input
    type="checkbox"
    checked={
      selectedBlock.data.showCompactImages !== false
    }
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "calendar_event"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                showCompactImages: e.target.checked,
              },
            },
      )
    }
  />
  Show Images
</label>

<label className="flex items-center gap-2 text-sm text-neutral-700">
  <input
    type="checkbox"
    checked={
      (selectedBlock.data as any).showHeadingImage === true
    }
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "calendar_event"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                showHeadingImage: e.target.checked,
              },
            },
      )
    }
  />
  Show Heading Image
</label>

{(selectedBlock.data as any).showHeadingImage === true ? (
  <>
    <button
      type="button"
      onClick={() =>
        uploadImageToSelectedBlock(
          selectedBlock.id,
          "headingImageUrl",
        )
      }
      className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
    >
      Choose Heading Image
    </button>

    <div>
      <div className={inspectorLabelClass()}>
        Heading Image Size
      </div>

      <input
        type="range"
        min={40}
        max={180}
        value={
          (selectedBlock.data as any).headingImageSize ?? 80
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    headingImageSize: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>
  </>
) : null}
</div>
) : null}

{selectedBlock.data.variant === "professional" ? (
  <div className="mt-4 space-y-5">
    <div className={inspectorLabelClass()}>
      Professional Scheduling
    </div>

    {/* BOOKING DETAILS */}
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Booking Details
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Booking Subject / Event Name
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.professionalBookingSubject ??
            "Appointment"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      professionalBookingSubject: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder="Appointment"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Phone Field
        </div>

        <select
          value={
            selectedBlock.data.professionalPhoneMode ??
            "optional"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      professionalPhoneMode:
                        e.target.value as
                          | "hidden"
                          | "optional"
                          | "required",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="hidden">Hidden</option>
          <option value="optional">Optional</option>
          <option value="required">Required</option>
        </select>
      </div>
    </div>

    {/* APPOINTMENT CHOICES */}
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Appointment Choices
        </div>

        <button
          type="button"
          className={toolSetButtonClass("back")}
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      professionalChoices: [
                        ...(Array.isArray(
                          block.data.professionalChoices,
                        )
                          ? block.data.professionalChoices
                          : []),
                        {
                          id: makeClientId("calendarchoice"),
                          label: "New Choice",
                          description: "",
                          durationMinutes: 60,
                          enabled: true,
                        },
                      ],
                    },
                  },
            )
          }
        >
          + Add Choice
        </button>
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Choice Section Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.professionalChoiceSectionLabel ??
            "Appointment Type"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      professionalChoiceSectionLabel:
                        e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      {(selectedBlock.data.professionalChoices ?? []).length ? (
        <div className="space-y-3">
          {(selectedBlock.data.professionalChoices ?? []).map(
            (choice: any, choiceIndex: number) => (
              <div
                key={choice.id}
                className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-neutral-700">
                    Choice {choiceIndex + 1}
                  </div>

                  <label className="flex items-center gap-2 text-xs text-neutral-600">
                    <input
                      type="checkbox"
                      checked={choice.enabled !== false}
                      onChange={(e) =>
                        updateSelectedBlock((block: any) =>
                          block.type !== "calendar_event"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  professionalChoices: (
                                    block.data
                                      .professionalChoices ?? []
                                  ).map((entry: any) =>
                                    entry.id === choice.id
                                      ? {
                                          ...entry,
                                          enabled:
                                            e.target.checked,
                                        }
                                      : entry,
                                  ),
                                },
                              },
                        )
                      }
                    />
                    Enabled
                  </label>
                </div>

                <input
                  type="text"
                  value={choice.label ?? ""}
                  placeholder="Choice label"
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "calendar_event"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              professionalChoices: (
                                block.data
                                  .professionalChoices ?? []
                              ).map((entry: any) =>
                                entry.id === choice.id
                                  ? {
                                      ...entry,
                                      label:
                                        e.target.value,
                                    }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />

                <textarea
                  value={choice.description ?? ""}
                  placeholder="Description"
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "calendar_event"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              professionalChoices: (
                                block.data
                                  .professionalChoices ?? []
                              ).map((entry: any) =>
                                entry.id === choice.id
                                  ? {
                                      ...entry,
                                      description:
                                        e.target.value,
                                    }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={`${inspectorInputClass()} min-h-[64px] resize-none`}
                />

                <div>
                  <div className={inspectorLabelClass()}>
                    Duration (Minutes)
                  </div>

                  <input
                    type="number"
                    min={5}
                    max={1440}
                    step={5}
                    value={choice.durationMinutes ?? 60}
                    onChange={(e) =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalChoices: (
                                  block.data
                                    .professionalChoices ?? []
                                ).map((entry: any) =>
                                  entry.id === choice.id
                                    ? {
                                        ...entry,
                                        durationMinutes:
                                          Math.max(
                                            5,
                                            Number(
                                              e.target.value,
                                            ) || 60,
                                          ),
                                      }
                                    : entry,
                                ),
                              },
                            },
                      )
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={choiceIndex === 0}
                    className={toolSetButtonClass("back")}
                    onClick={() =>
                      updateSelectedBlock((block: any) => {
                        if (
                          block.type !== "calendar_event" ||
                          choiceIndex === 0
                        ) {
                          return block;
                        }

                        const nextChoices = [
                          ...(block.data.professionalChoices ??
                            []),
                        ];

                        [
                          nextChoices[choiceIndex - 1],
                          nextChoices[choiceIndex],
                        ] = [
                          nextChoices[choiceIndex],
                          nextChoices[choiceIndex - 1],
                        ];

                        return {
                          ...block,
                          data: {
                            ...block.data,
                            professionalChoices:
                              nextChoices,
                          },
                        };
                      })
                    }
                  >
                    Up
                  </button>

                  <button
                    type="button"
                    disabled={
                      choiceIndex ===
                      (selectedBlock.data
                        .professionalChoices?.length ?? 0) -
                        1
                    }
                    className={toolSetButtonClass("back")}
                    onClick={() =>
                      updateSelectedBlock((block: any) => {
                        if (
                          block.type !== "calendar_event"
                        ) {
                          return block;
                        }

                        const nextChoices = [
                          ...(block.data.professionalChoices ??
                            []),
                        ];

                        if (
                          choiceIndex >=
                          nextChoices.length - 1
                        ) {
                          return block;
                        }

                        [
                          nextChoices[choiceIndex],
                          nextChoices[choiceIndex + 1],
                        ] = [
                          nextChoices[choiceIndex + 1],
                          nextChoices[choiceIndex],
                        ];

                        return {
                          ...block,
                          data: {
                            ...block.data,
                            professionalChoices:
                              nextChoices,
                          },
                        };
                      })
                    }
                  >
                    Down
                  </button>

                  <button
                    type="button"
                    className={toolSetButtonClass("back")}
                    onClick={() =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalChoices: [
                                  ...(block.data
                                    .professionalChoices ?? []),
                                  {
                                    ...choice,
                                    id: makeClientId(
                                      "calendarchoice",
                                    ),
                                    label: `${
                                      choice.label ||
                                      "Choice"
                                    } Copy`,
                                  },
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
                    className={toolSetButtonClass("remove")}
                    onClick={() =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalChoices: (
                                  block.data
                                    .professionalChoices ?? []
                                ).filter(
                                  (entry: any) =>
                                    entry.id !== choice.id,
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
            ),
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-3 py-4 text-center text-xs text-neutral-500">
          No choices configured. Visitors will book a time
          without selecting an appointment type.
        </div>
      )}
    </div>

    {/* AVAILABLE TIME SLOTS */}
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Available Time Slots
        </div>

        <button
          type="button"
          className={toolSetButtonClass("back")}
          onClick={() =>
            updateSelectedBlock((block: any) => {
              if (block.type !== "calendar_event") {
                return block;
              }

              const fallbackDate =
                block.data.defaultSelectedDate ||
                new Date().toISOString().slice(0, 10);

              return {
                ...block,
                data: {
                  ...block.data,
                  professionalSlots: [
                    ...(Array.isArray(
                      block.data.professionalSlots,
                    )
                      ? block.data.professionalSlots
                      : []),
                    {
                      id: makeClientId("calendarslot"),
                      date: fallbackDate,
                      startTime: "09:00",
                      endTime: "10:00",
                      enabled: true,
                    },
                  ],
                },
              };
            })
          }
        >
          + Add Slot
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={
            selectedBlock.data
              .professionalShowUnavailableSlots === true
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      professionalShowUnavailableSlots:
                        e.target.checked,
                    },
                  },
            )
          }
        />
        Show booked/unavailable slots to visitors
      </label>

      {(selectedBlock.data.professionalSlots ?? []).length ? (
        <div className="space-y-3">
          {(selectedBlock.data.professionalSlots ?? []).map(
            (slot: any, slotIndex: number) => (
              <div
                key={slot.id}
                className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-neutral-700">
                    Slot {slotIndex + 1}
                  </div>

                  <label className="flex items-center gap-2 text-xs text-neutral-600">
                    <input
                      type="checkbox"
                      checked={slot.enabled !== false}
                      onChange={(e) =>
                        updateSelectedBlock((block: any) =>
                          block.type !== "calendar_event"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  professionalSlots: (
                                    block.data
                                      .professionalSlots ?? []
                                  ).map((entry: any) =>
                                    entry.id === slot.id
                                      ? {
                                          ...entry,
                                          enabled:
                                            e.target.checked,
                                        }
                                      : entry,
                                  ),
                                },
                              },
                        )
                      }
                    />
                    Enabled
                  </label>
                </div>

                <div>
                  <div className={inspectorLabelClass()}>
                    Date
                  </div>

                  <input
                    type="date"
                    value={slot.date ?? ""}
                    onChange={(e) =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalSlots: (
                                  block.data
                                    .professionalSlots ?? []
                                ).map((entry: any) =>
                                  entry.id === slot.id
                                    ? {
                                        ...entry,
                                        date:
                                          e.target.value,
                                      }
                                    : entry,
                                ),
                              },
                            },
                      )
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className={inspectorLabelClass()}>
                      Start Time
                    </div>

                    <input
                      type="time"
                      value={slot.startTime ?? ""}
                      onChange={(e) =>
                        updateSelectedBlock((block: any) =>
                          block.type !== "calendar_event"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  professionalSlots: (
                                    block.data
                                      .professionalSlots ?? []
                                  ).map((entry: any) =>
                                    entry.id === slot.id
                                      ? {
                                          ...entry,
                                          startTime:
                                            e.target.value,
                                        }
                                      : entry,
                                  ),
                                },
                              },
                        )
                      }
                      className={inspectorInputClass()}
                    />
                  </div>

                  <div>
                    <div className={inspectorLabelClass()}>
                      End Time
                    </div>

                    <input
                      type="time"
                      value={slot.endTime ?? ""}
                      onChange={(e) =>
                        updateSelectedBlock((block: any) =>
                          block.type !== "calendar_event"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  professionalSlots: (
                                    block.data
                                      .professionalSlots ?? []
                                  ).map((entry: any) =>
                                    entry.id === slot.id
                                      ? {
                                          ...entry,
                                          endTime:
                                            e.target.value,
                                        }
                                      : entry,
                                  ),
                                },
                              },
                        )
                      }
                      className={inspectorInputClass()}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={slotIndex === 0}
                    className={toolSetButtonClass("back")}
                    onClick={() =>
                      updateSelectedBlock((block: any) => {
                        if (
                          block.type !== "calendar_event" ||
                          slotIndex === 0
                        ) {
                          return block;
                        }

                        const nextSlots = [
                          ...(block.data.professionalSlots ??
                            []),
                        ];

                        [
                          nextSlots[slotIndex - 1],
                          nextSlots[slotIndex],
                        ] = [
                          nextSlots[slotIndex],
                          nextSlots[slotIndex - 1],
                        ];

                        return {
                          ...block,
                          data: {
                            ...block.data,
                            professionalSlots: nextSlots,
                          },
                        };
                      })
                    }
                  >
                    Up
                  </button>

                  <button
                    type="button"
                    disabled={
                      slotIndex ===
                      (selectedBlock.data
                        .professionalSlots?.length ?? 0) -
                        1
                    }
                    className={toolSetButtonClass("back")}
                    onClick={() =>
                      updateSelectedBlock((block: any) => {
                        if (
                          block.type !== "calendar_event"
                        ) {
                          return block;
                        }

                        const nextSlots = [
                          ...(block.data.professionalSlots ??
                            []),
                        ];

                        if (
                          slotIndex >= nextSlots.length - 1
                        ) {
                          return block;
                        }

                        [
                          nextSlots[slotIndex],
                          nextSlots[slotIndex + 1],
                        ] = [
                          nextSlots[slotIndex + 1],
                          nextSlots[slotIndex],
                        ];

                        return {
                          ...block,
                          data: {
                            ...block.data,
                            professionalSlots: nextSlots,
                          },
                        };
                      })
                    }
                  >
                    Down
                  </button>

                  <button
                    type="button"
                    className={toolSetButtonClass("back")}
                    onClick={() =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalSlots: [
                                  ...(block.data
                                    .professionalSlots ?? []),
                                  {
                                    ...slot,
                                    id: makeClientId(
                                      "calendarslot",
                                    ),
                                  },
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
                    className={toolSetButtonClass("remove")}
                    onClick={() =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalSlots: (
                                  block.data
                                    .professionalSlots ?? []
                                ).filter(
                                  (entry: any) =>
                                    entry.id !== slot.id,
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
            ),
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-3 py-4 text-center text-xs text-neutral-500">
          No available booking slots have been configured.
        </div>
      )}
    </div>

    {/* BUTTON + CONFIRMATION */}
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Booking Confirmation
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Submit Button Text
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.professionalSubmitButtonText ??
            "Book Appointment"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      professionalSubmitButtonText:
                        e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Confirmation Heading
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.professionalConfirmationHeading ??
            "Appointment Confirmed"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      professionalConfirmationHeading:
                        e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Confirmation Message
        </div>

        <textarea
          value={
            selectedBlock.data.professionalConfirmationMessage ??
            "Your appointment has been scheduled successfully."
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      professionalConfirmationMessage:
                        e.target.value,
                    },
                  },
            )
          }
          className={`${inspectorInputClass()} min-h-[80px] resize-none`}
        />
      </div>
    </div>
  </div>
) : null}

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Display Options</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          ["showHeading", "Heading"],
          ["showSubtitle", "Subtitle"],
          ["showCalendarHeading", "Calendar Title"],
          ["showEmptyState", "Empty State"],
          ["showCategoryBadge", "Category Badge"],
          ["showHost", "Host"],
          ["showCapacity", "Capacity"],
          ["showRsvpBadge", "RSVP Badge"],
          ["showEventImages", "Event Images"],
          ["showCtaButtons", "CTA Buttons"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any)[key] !== false}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          [key]: e.target.checked,
                        },
                      },
                )
              }
            />
            {label}
          </label>
        ))}
      </div>
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Calendar Styling</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
  ["backgroundColor", "Background"],
  ["textColor", "Text"],
  ["activeDateColor", "Active Date"],
  ["todayBorderColor", "Today Border"],
  ["dateBorderColor", "Date Border"],
  ["eventDotColor", "Event Dot"],
  ["scheduledLabelColor", "Scheduled Label"],
  ["monthLabelColor", "Month Label"],
  ["monthArrowColor", "Month Arrow"],
].map(([key, label]) => (
          <div key={key}>
            <div className={inspectorLabelClass()}>{label}</div>
            <input
              type="color"
              value={(selectedBlock.data.calendarStyle as any)?.[key] || "#000000"}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          calendarStyle: {
                            ...(block.data.calendarStyle ?? {}),
                            [key]: e.target.value,
                          },
                        },
                      },
                )
              }
              className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
            />
          </div>
        ))}
      </div>
    </div>

    <div className="mt-5">
  <div className={inspectorLabelClass()}>
    Selected Date Styling
  </div>

  <div className="mt-3 grid grid-cols-2 gap-3">
    {[
      [
        "selectedDateBackgroundColor",
        "Background",
      ],
      [
        "selectedDateBorderColor",
        "Border",
      ],
    ].map(([key, label]) => (
      <div key={key}>
        <div className={inspectorLabelClass()}>
          {label}
        </div>

        <input
          type="color"
          value={
            (selectedBlock.data.calendarStyle as any)?.[
              key
            ] || "#ffffff"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      calendarStyle: {
                        ...(block.data.calendarStyle ??
                          {}),
                        [key]: e.target.value,
                      },
                    },
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>
    ))}
  </div>
</div>

<div className="mt-5">
  <div className={inspectorLabelClass()}>
    Form Styling
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Background
    </div>

    <input
      type="color"
      value={
        selectedBlock.data.calendarStyle
          ?.formBackgroundColor || "#ffffff"
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "calendar_event"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  calendarStyle: {
                    ...(block.data.calendarStyle ??
                      {}),
                    formBackgroundColor:
                      e.target.value,
                  },
                },
              },
        )
      }
      className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
    />
  </div>
</div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Event Card Styling</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
{[
  ["backgroundColor", "Card Background"],
  ["borderColor", "Border"],
  ["textColor", "Text"],
].map(([key, label]) => (
          <div key={key}>
            <div className={inspectorLabelClass()}>{label}</div>
            <input
              type="color"
              value={(selectedBlock.data.detailStyle as any)?.[key] || "#ffffff"}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          detailStyle: {
                            ...(block.data.detailStyle ?? {}),
                            [key]: e.target.value,
                          },
                        },
                      },
                )
              }
              className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Border Radius: {(selectedBlock.data.detailStyle?.borderRadius ?? 16)}px
        </div>
        <input
          type="range"
          min={0}
          max={40}
          value={selectedBlock.data.detailStyle?.borderRadius ?? 16}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      detailStyle: {
                        ...(block.data.detailStyle ?? {}),
                        borderRadius: Number(e.target.value),
                      },
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.detailStyle?.shadowEnabled)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "calendar_event"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      detailStyle: {
                        ...(block.data.detailStyle ?? {}),
                        shadowEnabled: e.target.checked,
                      },
                    },
                  },
            )
          }
        />
        Enable event card shadow
      </label>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Empty State Text</div>
      <input
        type="text"
        value={selectedBlock.data.emptyStateText ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: { ...block.data, emptyStateText: e.target.value },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-5 space-y-3">
      <div className={inspectorLabelClass()}>Events</div>

{selectedBlock.data.variant === "professional" ? (
  <div className="mb-5 space-y-5">
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className={inspectorLabelClass()}>
        Professional Choices
      </div>

      <div className="mt-3 space-y-3">
        {(selectedBlock.data.professionalChoices ?? []).map(
          (choice: any, choiceIndex: number) => (
            <div
              key={choice.id}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="space-y-2">
                <input
                  type="text"
                  value={choice.label ?? ""}
                  placeholder="Choice label"
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "calendar_event"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              professionalChoices: (
                                block.data.professionalChoices ?? []
                              ).map((entry: any) =>
                                entry.id === choice.id
                                  ? {
                                      ...entry,
                                      label: e.target.value,
                                    }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />

                <input
                  type="text"
                  value={choice.description ?? ""}
                  placeholder="Optional description"
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "calendar_event"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              professionalChoices: (
                                block.data.professionalChoices ?? []
                              ).map((entry: any) =>
                                entry.id === choice.id
                                  ? {
                                      ...entry,
                                      description: e.target.value,
                                    }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />

                <div>
                  <div className={inspectorLabelClass()}>
                    Duration (minutes)
                  </div>

                  <input
                    type="number"
                    min={5}
                    max={1440}
                    step={5}
                    value={choice.durationMinutes ?? 60}
                    onChange={(e) =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalChoices: (
                                  block.data.professionalChoices ?? []
                                ).map((entry: any) =>
                                  entry.id === choice.id
                                    ? {
                                        ...entry,
                                        durationMinutes: Math.max(
                                          5,
                                          Number(e.target.value) || 60,
                                        ),
                                      }
                                    : entry,
                                ),
                              },
                            },
                      )
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={choice.enabled !== false}
                      onChange={(e) =>
                        updateSelectedBlock((block: any) =>
                          block.type !== "calendar_event"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  professionalChoices: (
                                    block.data.professionalChoices ?? []
                                  ).map((entry: any) =>
                                    entry.id === choice.id
                                      ? {
                                          ...entry,
                                          enabled: e.target.checked,
                                        }
                                      : entry,
                                  ),
                                },
                              },
                        )
                      }
                    />
                    Enabled
                  </label>

                  <button
                    type="button"
                    className={toolSetButtonClass("remove")}
                    onClick={() =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalChoices: (
                                  block.data.professionalChoices ?? []
                                ).filter(
                                  (entry: any) => entry.id !== choice.id,
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
            </div>
          ),
        )}
      </div>

      <button
        type="button"
        className={`${toolSetButtonClass("front")} mt-3`}
        onClick={() =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    professionalChoices: [
                      ...(block.data.professionalChoices ?? []),
                      {
                        id: makeClientId("calendarchoice"),
                        label: "New Choice",
                        description: "",
                        durationMinutes: 60,
                        enabled: true,
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Choice
      </button>
    </div>

    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className={inspectorLabelClass()}>
        Available Time Slots
      </div>

      <div className="mt-3 space-y-3">
        {(selectedBlock.data.professionalSlots ?? []).map(
          (slot: any) => (
            <div
              key={slot.id}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className={inspectorLabelClass()}>
                    Date
                  </div>

                  <input
                    type="date"
                    value={slot.date ?? ""}
                    onChange={(e) =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalSlots: (
                                  block.data.professionalSlots ?? []
                                ).map((entry: any) =>
                                  entry.id === slot.id
                                    ? {
                                        ...entry,
                                        date: e.target.value,
                                      }
                                    : entry,
                                ),
                              },
                            },
                      )
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className={inspectorLabelClass()}>
                      Start Time
                    </div>

                    <input
                      type="time"
                      value={slot.startTime ?? ""}
                      onChange={(e) =>
                        updateSelectedBlock((block: any) =>
                          block.type !== "calendar_event"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  professionalSlots: (
                                    block.data.professionalSlots ?? []
                                  ).map((entry: any) =>
                                    entry.id === slot.id
                                      ? {
                                          ...entry,
                                          startTime: e.target.value,
                                        }
                                      : entry,
                                  ),
                                },
                              },
                        )
                      }
                      className={inspectorInputClass()}
                    />
                  </div>

                  <div>
                    <div className={inspectorLabelClass()}>
                      End Time
                    </div>

                    <input
                      type="time"
                      value={slot.endTime ?? ""}
                      onChange={(e) =>
                        updateSelectedBlock((block: any) =>
                          block.type !== "calendar_event"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  professionalSlots: (
                                    block.data.professionalSlots ?? []
                                  ).map((entry: any) =>
                                    entry.id === slot.id
                                      ? {
                                          ...entry,
                                          endTime: e.target.value,
                                        }
                                      : entry,
                                  ),
                                },
                              },
                        )
                      }
                      className={inspectorInputClass()}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={slot.enabled !== false}
                      onChange={(e) =>
                        updateSelectedBlock((block: any) =>
                          block.type !== "calendar_event"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  professionalSlots: (
                                    block.data.professionalSlots ?? []
                                  ).map((entry: any) =>
                                    entry.id === slot.id
                                      ? {
                                          ...entry,
                                          enabled: e.target.checked,
                                        }
                                      : entry,
                                  ),
                                },
                              },
                        )
                      }
                    />
                    Available
                  </label>

                  <button
                    type="button"
                    className={toolSetButtonClass("remove")}
                    onClick={() =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "calendar_event"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                professionalSlots: (
                                  block.data.professionalSlots ?? []
                                ).filter(
                                  (entry: any) => entry.id !== slot.id,
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
            </div>
          ),
        )}
      </div>

      <button
        type="button"
        className={`${toolSetButtonClass("front")} mt-3`}
        onClick={() =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    professionalSlots: [
                      ...(block.data.professionalSlots ?? []),
                      {
                        id: makeClientId("calendarslot"),
                        date:
                          block.data.defaultSelectedDate ||
                          new Date().toISOString().slice(0, 10),
                        startTime: "09:00",
                        endTime: "10:00",
                        enabled: true,
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Time Slot
      </button>
    </div>
  </div>
) : null}

{selectedBlock.data.events.map((event: any, eventIndex: number) => (
  <div
    key={event.id}
    className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
  >
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
<button
  type="button"
  onClick={() =>
    void uploadImageToSelectedBlock(selectedBlock.id, undefined, event.id)
  }
  className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-white text-xs text-neutral-400 hover:border-neutral-900 hover:text-neutral-900"
  title="Browse event image"
>
  {event.imageUrl ? (
    <img
      src={event.imageUrl}
      alt={event.imageAlt || event.title || "Event"}
      className="h-full w-full object-cover"
    />
  ) : (
    <span>IMG</span>
  )}
</button>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-neutral-900">
          {event.title || "Untitled Event"}
        </div>

        <div className="mt-1 text-xs text-neutral-500">
          {event.date || "No date"}
          {(event.startTime || event.endTime) &&
            ` • ${event.startTime || ""}${
              event.endTime ? ` - ${event.endTime}` : ""
            }`}
        </div>

        {(event.category || event.meetingMethod) && (
          <div className="mt-1 text-xs text-neutral-400">
            {[event.category, event.meetingMethod]
              .filter(Boolean)
              .join(" • ")}
          </div>
        )}
      </div>
    </div>

    <div className="space-y-3">
            <input
              type="text"
              value={event.title}
              placeholder="Event title"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, title: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <input
              type="text"
              value={event.subtitle ?? ""}
              placeholder="Subtitle"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, subtitle: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                value={event.date}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "calendar_event"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            events: block.data.events.map((entry: any) =>
                              entry.id === event.id
                                ? { ...entry, date: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />

              <input
                type="time"
                value={event.startTime}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "calendar_event"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            events: block.data.events.map((entry: any) =>
                              entry.id === event.id
                                ? { ...entry, startTime: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />

              <input
                type="time"
                value={event.endTime}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "calendar_event"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            events: block.data.events.map((entry: any) =>
                              entry.id === event.id
                                ? { ...entry, endTime: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <input
              type="text"
              value={event.meetingMethod ?? ""}
              placeholder="Meeting method"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, meetingMethod: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <input
              type="text"
              value={event.location ?? ""}
              placeholder="Location"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, location: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <input
              type="text"
              value={event.address ?? ""}
              placeholder="Address"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, address: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <input
              type="text"
              value={event.virtualLink ?? ""}
              placeholder="Virtual meeting link"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, virtualLink: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <textarea
              value={event.notes ?? ""}
              placeholder="Notes / description"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, notes: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={`${inspectorInputClass()} min-h-[80px] resize-none`}
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={event.category ?? ""}
                placeholder="Category"
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "calendar_event"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            events: block.data.events.map((entry: any) =>
                              entry.id === event.id
                                ? { ...entry, category: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />

              <input
                type="text"
                value={event.host ?? ""}
                placeholder="Host"
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "calendar_event"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            events: block.data.events.map((entry: any) =>
                              entry.id === event.id
                                ? { ...entry, host: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <input
              type="text"
              value={event.capacity ?? ""}
              placeholder="Capacity / spots available"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, capacity: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />


            <input
              type="text"
              value={event.imageAlt ?? ""}
              placeholder="Image alt text"
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: block.data.events.map((entry: any) =>
                            entry.id === event.id
                              ? { ...entry, imageAlt: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

<div className="grid grid-cols-2 gap-2">
  <input
    type="text"
    value={event.buttonText ?? ""}
    placeholder="CTA button text"
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "calendar_event"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                events: block.data.events.map((entry: any) =>
                  entry.id === event.id
                    ? { ...entry, buttonText: e.target.value }
                    : entry,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
  />

  <input
    type="text"
    value={event.buttonUrl ?? ""}
    placeholder="CTA button URL"
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "calendar_event"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                events: block.data.events.map((entry: any) =>
                  entry.id === event.id
                    ? { ...entry, buttonUrl: e.target.value }
                    : entry,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
  />

  <input
    type="text"
    value={event.addToCalendarText ?? ""}
    placeholder="Add to calendar text"
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "calendar_event"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                events: block.data.events.map((entry: any) =>
                  entry.id === event.id
                    ? { ...entry, addToCalendarText: e.target.value }
                    : entry,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
  />

  <input
    type="text"
    value={event.addToCalendarUrl ?? ""}
    placeholder="Add to calendar URL"
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "calendar_event"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                events: block.data.events.map((entry: any) =>
                  entry.id === event.id
                    ? { ...entry, addToCalendarUrl: e.target.value }
                    : entry,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
  />
</div>

<div className="grid grid-cols-2 gap-2">
  <label className="flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={event.showLive === true}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "calendar_event"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  events: block.data.events.map((entry: any) =>
                    entry.id === event.id
                      ? {
                          ...entry,
                          showLive: e.target.checked,
                        }
                      : entry,
                  ),
                },
              },
        )
      }
    />
    Show LIVE Pill
  </label>

  <label className="flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={event.showSubtitle !== false}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "calendar_event"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  events: block.data.events.map((entry: any) =>
                    entry.id === event.id
                      ? {
                          ...entry,
                          showSubtitle: e.target.checked,
                        }
                      : entry,
                  ),
                },
              },
        )
      }
    />
    Show Subtitle
  </label>

  <label className="flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={event.showStartTime !== false}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "calendar_event"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  events: block.data.events.map((entry: any) =>
                    entry.id === event.id
                      ? {
                          ...entry,
                          showStartTime: e.target.checked,
                        }
                      : entry,
                  ),
                },
              },
        )
      }
    />
    Show Start Time
  </label>

  <label className="flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={event.showEndTime !== false}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "calendar_event"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  events: block.data.events.map((entry: any) =>
                    entry.id === event.id
                      ? {
                          ...entry,
                          showEndTime: e.target.checked,
                        }
                      : entry,
                  ),
                },
              },
        )
      }
    />
    Show End Time
  </label>
</div>


            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={Boolean(event.rsvpRequired)}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "calendar_event"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            events: block.data.events.map((entry: any) =>
                              entry.id === event.id
                                ? { ...entry, rsvpRequired: e.target.checked }
                                : entry,
                            ),
                          },
                        },
                  )
                }
              />
              RSVP Required
            </label>
          </div>

          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className={toolSetButtonClass("back")}
              disabled={eventIndex === 0}
              onClick={() =>
                updateSelectedBlock((block: any) => {
                  if (block.type !== "calendar_event" || eventIndex === 0) return block;

                  const nextEvents = [...block.data.events];
                  [nextEvents[eventIndex - 1], nextEvents[eventIndex]] = [
                    nextEvents[eventIndex],
                    nextEvents[eventIndex - 1],
                  ];

                  return {
                    ...block,
                    data: {
                      ...block.data,
                      events: nextEvents,
                    },
                  };
                })
              }
            >
              Up
            </button>

            <button
              type="button"
              className={toolSetButtonClass("back")}
              disabled={eventIndex === selectedBlock.data.events.length - 1}
              onClick={() =>
                updateSelectedBlock((block: any) => {
                  if (
                    block.type !== "calendar_event" ||
                    eventIndex >= block.data.events.length - 1
                  ) {
                    return block;
                  }

                  const nextEvents = [...block.data.events];
                  [nextEvents[eventIndex], nextEvents[eventIndex + 1]] = [
                    nextEvents[eventIndex + 1],
                    nextEvents[eventIndex],
                  ];

                  return {
                    ...block,
                    data: {
                      ...block.data,
                      events: nextEvents,
                    },
                  };
                })
              }
            >
              Down
            </button>

            <button
              type="button"
              className={toolSetButtonClass("back")}
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events: [
                            ...block.data.events,
                            {
                              ...event,
                              id: makeClientId("calendarevent"),
                              title: `${event.title || "Event"} Copy`,
                            },
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
              className={toolSetButtonClass("remove")}
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "calendar_event"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          events:
                            block.data.events.length > 1
                              ? block.data.events.filter((entry: any) => entry.id !== event.id)
                              : block.data.events,
                        },
                      },
                )
              }
            >
              x
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block: any) =>
            block.type !== "calendar_event"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    events: [
                      ...block.data.events,
                      {
                        id: makeClientId("calendarevent"),
                        title: "New Event",
                        subtitle: "",
                        date: new Date().toISOString().slice(0, 10),
                        startTime: "18:00",
                        endTime: "19:00",
                        meetingMethod: "",
                        location: "",
                        address: "",
                        virtualLink: "",
                        notes: "",
                        host: "",
                        category: "",
                        capacity: "",
                        rsvpRequired: false,
                        imageUrl: "",
                        imageStoragePath: "",
                        imageAlt: "",
                        imagePosition: "right",
                        buttonText: "",
                        buttonUrl: "",
                        addToCalendarText: "Add to Calendar",
                        addToCalendarUrl: "",
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Event
      </button>
    </div>
    </div>
  );
}