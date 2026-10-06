"use client";

import type {
  LivePlayerCardStyleTarget,
  LivePlayerCardTextTarget,
} from "@/components/builder/formatting/livePlayerCardFormatting";

type LivePlayerCardInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  livePlayerCardTextTarget: LivePlayerCardTextTarget;
  setLivePlayerCardTextTarget: (
    target: LivePlayerCardTextTarget,
  ) => void;
  livePlayerCardStyleTarget: LivePlayerCardStyleTarget;
  setLivePlayerCardStyleTarget: (
    target: LivePlayerCardStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LivePlayerCardInspector({
  selectedBlock,
  updateSelectedBlock,
  livePlayerCardTextTarget,
  setLivePlayerCardTextTarget,
  livePlayerCardStyleTarget,
  setLivePlayerCardStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LivePlayerCardInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_player_card"
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
        Player Card
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
            value={livePlayerCardTextTarget}
            onChange={(e) =>
              setLivePlayerCardTextTarget(
                e.target.value as LivePlayerCardTextTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="heading">Heading</option>
            <option value="name">Player Name</option>
            <option value="detail">Player Details</option>
            <option value="joinRequiredText">
              Join Required Text
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={livePlayerCardStyleTarget}
            onChange={(e) =>
              setLivePlayerCardStyleTarget(
                e.target.value as LivePlayerCardStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">Entire Block</option>
            <option value="card">Player Card</option>
            <option value="avatar">Avatar</option>
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
          Score Label
        </div>

        <input
          type="text"
          value={selectedBlock.data.scoreLabel ?? ""}
          onChange={(e) =>
            updateData({
              scoreLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Team Label
        </div>

        <input
          type="text"
          value={selectedBlock.data.teamLabel ?? ""}
          onChange={(e) =>
            updateData({
              teamLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Badges Label
        </div>

        <input
          type="text"
          value={selectedBlock.data.badgesLabel ?? ""}
          onChange={(e) =>
            updateData({
              badgesLabel: e.target.value,
            })
          }
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

      <div className="mt-4 space-y-3">
        {[
          ["showAvatar", "Show Avatar"],
          ["showDisplayName", "Show Display Name"],
          ["showScore", "Show Score"],
          ["showTeam", "Show Team"],
          ["showBadges", "Show Badges"],
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