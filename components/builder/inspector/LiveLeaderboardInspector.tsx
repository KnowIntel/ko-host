"use client";

import type {
  LiveLeaderboardStyleTarget,
  LiveLeaderboardTextTarget,
} from "@/components/builder/formatting/liveLeaderboardFormatting";

type LiveLeaderboardInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  liveLeaderboardTextTarget: LiveLeaderboardTextTarget;
  setLiveLeaderboardTextTarget: (
    target: LiveLeaderboardTextTarget,
  ) => void;
  liveLeaderboardStyleTarget: LiveLeaderboardStyleTarget;
  setLiveLeaderboardStyleTarget: (
    target: LiveLeaderboardStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveLeaderboardInspector({
  selectedBlock,
  updateSelectedBlock,
  liveLeaderboardTextTarget,
  setLiveLeaderboardTextTarget,
  liveLeaderboardStyleTarget,
  setLiveLeaderboardStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveLeaderboardInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_leaderboard"
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
        Leaderboard
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
            value={liveLeaderboardTextTarget}
            onChange={(e) =>
              setLiveLeaderboardTextTarget(
                e.target.value as LiveLeaderboardTextTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="heading">Heading</option>
            <option value="rank">Rank</option>
            <option value="participant">
              Participant
            </option>
            <option value="score">Score</option>
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
            value={liveLeaderboardStyleTarget}
            onChange={(e) =>
              setLiveLeaderboardStyleTarget(
                e.target.value as LiveLeaderboardStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">
              Entire Block
            </option>
            <option value="row">
              Leaderboard Row
            </option>
            <option value="currentParticipant">
              Current Participant
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
            updateData({ heading: e.target.value })
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
            updateData({ emptyText: e.target.value })
          }
          rows={2}
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
            updateData({ scoreLabel: e.target.value })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Rank Label
        </div>
        <input
          type="text"
          value={selectedBlock.data.rankLabel ?? ""}
          onChange={(e) =>
            updateData({ rankLabel: e.target.value })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Participant Label
        </div>
        <input
          type="text"
          value={
            selectedBlock.data.participantLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              participantLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Maximum Entries
        </div>
        <input
          type="number"
          min={1}
          max={100}
          value={selectedBlock.data.maxEntries ?? 10}
          onChange={(e) =>
            updateData({
              maxEntries: Math.max(
                1,
                Math.min(
                  100,
                  Number(e.target.value) || 1,
                ),
              ),
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 space-y-3">
        {[
          ["showAvatar", "Show Avatar"],
          ["showRank", "Show Rank"],
          ["showScore", "Show Score"],
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