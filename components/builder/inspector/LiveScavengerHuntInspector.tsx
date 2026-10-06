"use client";

import type {
  LiveScavengerHuntStyleTarget,
  LiveScavengerHuntTextTarget,
} from "@/components/builder/formatting/liveScavengerHuntFormatting";

type LiveScavengerHuntInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  liveScavengerHuntTextTarget: LiveScavengerHuntTextTarget;
  setLiveScavengerHuntTextTarget: (
    target: LiveScavengerHuntTextTarget,
  ) => void;
  liveScavengerHuntStyleTarget: LiveScavengerHuntStyleTarget;
  setLiveScavengerHuntStyleTarget: (
    target: LiveScavengerHuntStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveScavengerHuntInspector({
  selectedBlock,
  updateSelectedBlock,
  liveScavengerHuntTextTarget,
  setLiveScavengerHuntTextTarget,
  liveScavengerHuntStyleTarget,
  setLiveScavengerHuntStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveScavengerHuntInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_scavenger_hunt"
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
        Scavenger Hunt
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
            value={liveScavengerHuntTextTarget}
            onChange={(e) =>
              setLiveScavengerHuntTextTarget(
                e.target.value as LiveScavengerHuntTextTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="heading">Heading</option>
            <option value="waitingText">
              Waiting Text
            </option>
            <option value="joinRequiredText">
              Join Required Text
            </option>
            <option value="itemTitle">
              Item Title
            </option>
            <option value="itemDescription">
              Item Description
            </option>
            <option value="completedLabel">
              Completed Label
            </option>
            <option value="progress">
              Progress
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={liveScavengerHuntStyleTarget}
            onChange={(e) =>
              setLiveScavengerHuntStyleTarget(
                e.target.value as LiveScavengerHuntStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">
              Entire Block
            </option>
            <option value="item">
              Hunt Item
            </option>
            <option value="completedItem">
              Completed Item
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
          Waiting Text
        </div>

        <textarea
          value={selectedBlock.data.waitingText ?? ""}
          onChange={(e) =>
            updateData({
              waitingText: e.target.value,
            })
          }
          rows={3}
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Join Required Text
        </div>

        <textarea
          value={
            selectedBlock.data.joinRequiredText ?? ""
          }
          onChange={(e) =>
            updateData({
              joinRequiredText: e.target.value,
            })
          }
          rows={3}
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

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Progress Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.progressLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              progressLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={
              selectedBlock.data.showProgress !== false
            }
            onChange={(e) =>
              updateData({
                showProgress: e.target.checked,
              })
            }
          />
          <span>Show Progress</span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={
              selectedBlock.data.showPoints !== false
            }
            onChange={(e) =>
              updateData({
                showPoints: e.target.checked,
              })
            }
          />
          <span>Show Points</span>
        </label>
      </div>
    </div>
  );
}