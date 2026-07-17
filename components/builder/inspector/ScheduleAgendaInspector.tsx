"use client";

import type { Dispatch, SetStateAction } from "react";

import type {
  ScheduleAgendaStyleTarget,
  ScheduleAgendaTextTarget,
} from "@/components/builder/formatting/scheduleAgendaFormatting";

/**
 * Schedule / Agenda inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "schedule_agenda"
 */
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

  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

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
return (
  <div className={inspectorCardClass()}>
    {/* Formatting */}
    <div className={inspectorLabelClass()}>Formatting</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Text Target</div>

      <select
        value={scheduleAgendaTextTarget}
        onChange={(e) =>
          setScheduleAgendaTextTarget(
            e.target.value as ScheduleAgendaTextTarget,
          )
        }
        className={inspectorInputClass()}
      >
        <option value="heading">Heading</option>
        <option value="time">Time</option>
        <option value="opening">Title</option>
        <option value="description">Description</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Target</div>

      <select
        value={scheduleAgendaStyleTarget}
        onChange={(e) =>
          setScheduleAgendaStyleTarget(
            e.target.value as ScheduleAgendaStyleTarget,
          )
        }
        className={inspectorInputClass()}
      >
        <option value="panel">Panel</option>
        <option value="block">Block</option>
      </select>
    </div>

    {/* Schedule / Agenda */}
    <div className="mt-6">
      <div className={inspectorLabelClass()}>Schedule</div>
    </div>

    <label className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={Boolean((selectedBlock.data as any).allowUserEngagement)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "schedule_agenda"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    allowUserEngagement: e.target.checked,
                  } as any,
                },
          )
        }
      />
      Allow user engagement
    </label>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "schedule_agenda"
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

    <div className="mt-4 space-y-3">
      {selectedBlock.data.items.map((item: any) => (
        <div
          key={item.id}
          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <div className={inspectorLabelClass()}>Time</div>
          <input
            type="text"
            value={item.time}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "schedule_agenda"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        items: block.data.items.map((entry: any) =>
                          entry.id === item.id
                            ? { ...entry, time: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Title</div>
            <input
              type="text"
              value={item.title}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "schedule_agenda"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry: any) =>
                            entry.id === item.id
                              ? { ...entry, title: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Description</div>
            <textarea
              value={item.description ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "schedule_agenda"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry: any) =>
                            entry.id === item.id
                              ? { ...entry, description: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorTextareaClass()}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className={toolSetButtonClass("remove")}
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "schedule_agenda"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items:
                            block.data.items.length > 1
                              ? block.data.items.filter(
                                  (entry: any) => entry.id !== item.id,
                                )
                              : block.data.items,
                        },
                      },
                )
              }
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
            block.type !== "schedule_agenda"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: [
                      ...block.data.items,
                      {
                        id: makeClientId("schedule"),
                        time: "12:00 PM",
                        title: "New Event",
                        description: "",
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