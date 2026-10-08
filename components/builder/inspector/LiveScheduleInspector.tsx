"use client";

import type {
  LiveScheduleStyleTarget,
  LiveScheduleTextTarget,
} from "@/components/builder/formatting/liveScheduleFormatting";

type LiveScheduleInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  liveScheduleTextTarget: LiveScheduleTextTarget;
  setLiveScheduleTextTarget: (
    target: LiveScheduleTextTarget,
  ) => void;
  liveScheduleStyleTarget: LiveScheduleStyleTarget;
  setLiveScheduleStyleTarget: (
    target: LiveScheduleStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveScheduleInspector({
  selectedBlock,
  updateSelectedBlock,
  liveScheduleTextTarget,
  setLiveScheduleTextTarget,
  liveScheduleStyleTarget,
  setLiveScheduleStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveScheduleInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_schedule"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              ...updates,
            },
          },
    );
  };

  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>
        Schedule
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>
          Formatting
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Text Target
          </div>

          <select
            value={liveScheduleTextTarget}
            onChange={(e) =>
              setLiveScheduleTextTarget(
                e.target.value as LiveScheduleTextTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="heading">Heading</option>
            <option value="time">Time</option>
            <option value="title">Item Title</option>
            <option value="description">
              Item Description
            </option>
            <option value="status">Status</option>
            <option value="emptyText">
              Empty Text
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={liveScheduleStyleTarget}
            onChange={(e) =>
              setLiveScheduleStyleTarget(
                e.target.value as LiveScheduleStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">Entire Block</option>
            <option value="item">
              Schedule Item
            </option>
            <option value="currentItem">
              Current Item
            </option>
          </select>
        </div>
                <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Animation
          </div>

          <select
            value={selectedBlock.data.animation ?? "none"}
            onChange={(e) =>
              updateSelectedBlock((block: any) => ({
                ...block,
                data: {
                  ...block.data,
                  animation: e.target.value,
                },
              }))
            }
            className={inspectorInputClass()}
          >
            <option value="none">None</option>
            <option value="focus">Focus</option>
            <option value="spotlight">Spotlight</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Heading
        </div>

        <input
          type="text"
          value={selectedBlock.data.heading ?? ""}
          onChange={(e) =>
            updateData({
              heading: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Empty Text
        </div>

        <textarea
          value={selectedBlock.data.emptyText ?? ""}
          onChange={(e) =>
            updateData({
              emptyText: e.target.value,
            })
          }
          rows={2}
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Current Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.currentLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              currentLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Upcoming Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.upcomingLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              upcomingLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Completed Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.completedLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              completedLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 space-y-3">
        {[
          ["showTimes", "Show Times"],
          ["showDescriptions", "Show Descriptions"],
          ["showStatuses", "Show Statuses"],
        ].map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={
                selectedBlock.data[key] !== false
              }
              onChange={(e) =>
                updateData({
                  [key]: e.target.checked,
                })
              }
            />

            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}