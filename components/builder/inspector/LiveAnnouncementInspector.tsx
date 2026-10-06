"use client";

import type {
  LiveAnnouncementStyleTarget,
  LiveAnnouncementTextTarget,
} from "@/components/builder/formatting/liveAnnouncementFormatting";

type LiveAnnouncementInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  liveAnnouncementTextTarget: LiveAnnouncementTextTarget;
  setLiveAnnouncementTextTarget: (
    target: LiveAnnouncementTextTarget,
  ) => void;
  liveAnnouncementStyleTarget: LiveAnnouncementStyleTarget;
  setLiveAnnouncementStyleTarget: (
    target: LiveAnnouncementStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveAnnouncementInspector({
  selectedBlock,
  updateSelectedBlock,
  liveAnnouncementTextTarget,
  setLiveAnnouncementTextTarget,
  liveAnnouncementStyleTarget,
  setLiveAnnouncementStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveAnnouncementInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_announcement"
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
        Announcement
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
            value={liveAnnouncementTextTarget}
            onChange={(e) =>
              setLiveAnnouncementTextTarget(
                e.target.value as LiveAnnouncementTextTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="heading">Heading</option>
            <option value="emptyText">
              Empty Text
            </option>
            <option value="latestLabel">
              Latest Label
            </option>
            <option value="announcementTitle">
              Announcement Title
            </option>
            <option value="announcementText">
              Announcement Text
            </option>
            <option value="timestamp">
              Timestamp
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={liveAnnouncementStyleTarget}
            onChange={(e) =>
              setLiveAnnouncementStyleTarget(
                e.target.value as LiveAnnouncementStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">
              Entire Block
            </option>
            <option value="announcement">
              Announcement
            </option>
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
          rows={3}
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Latest Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.latestLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              latestLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={
              selectedBlock.data.showTimestamp !== false
            }
            onChange={(e) =>
              updateData({
                showTimestamp: e.target.checked,
              })
            }
          />

          <span>Show Timestamp</span>
        </label>
      </div>
    </div>
  );
}