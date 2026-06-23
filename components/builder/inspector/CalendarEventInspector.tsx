"use client";

import type { Dispatch, SetStateAction } from "react";

/**
 * Calendar Event inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "calendar_event"
 */
type CalendarEventTextTarget =
  | "heading"
  | "subtitle"
  | "eventTitle"
  | "eventSubtitle"
  | "eventDate"
  | "eventDetails";

type CalendarEventInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  calendarEventTextTarget: CalendarEventTextTarget;
  setCalendarEventTextTarget: Dispatch<
    SetStateAction<CalendarEventTextTarget>
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
  makeClientId,
  uploadImageToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: CalendarEventInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Calendar Event */}
    <div className={inspectorLabelClass()}>Calendar Event</div>

    <div className="mt-4">
  <div className={inspectorLabelClass()}>
    Time Format
  </div>

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
    checked={(selectedBlock.data as any).showHeadingImage === true}
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
        value={(selectedBlock.data as any).headingImageSize ?? 64}
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
  <div className={inspectorLabelClass()}>
    Text Target
  </div>

<select
  value={calendarEventTextTarget}
  onChange={(e) =>
    setCalendarEventTextTarget(
      e.target.value as
        | "heading"
        | "subtitle"
        | "eventTitle"
        | "eventSubtitle"
        | "eventDate"
        | "eventDetails",
    )
  }
  className={inspectorInputClass()}
>
  <option value="heading">Heading</option>
  <option value="subtitle">Subtitle</option>
  <option value="eventTitle">Event Title</option>
  <option value="eventSubtitle">Event Subtitle</option>
  <option value="eventDate">Event Date</option>
  <option value="eventDetails">Event Details</option>
</select>
</div>

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
  | "compact",
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