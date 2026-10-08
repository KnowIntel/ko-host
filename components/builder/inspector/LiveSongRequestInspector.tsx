"use client";

import type {
  LiveSongRequestStyleTarget,
  LiveSongRequestTextTarget,
} from "@/components/builder/formatting/liveSongRequestFormatting";

type LiveSongRequestInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  liveSongRequestTextTarget: LiveSongRequestTextTarget;
  setLiveSongRequestTextTarget: (
    target: LiveSongRequestTextTarget,
  ) => void;
  liveSongRequestStyleTarget: LiveSongRequestStyleTarget;
  setLiveSongRequestStyleTarget: (
    target: LiveSongRequestStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveSongRequestInspector({
  selectedBlock,
  updateSelectedBlock,
  liveSongRequestTextTarget,
  setLiveSongRequestTextTarget,
  liveSongRequestStyleTarget,
  setLiveSongRequestStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveSongRequestInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_song_request"
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
        Song Request
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
            value={liveSongRequestTextTarget}
            onChange={(e) =>
              setLiveSongRequestTextTarget(
                e.target.value as LiveSongRequestTextTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="heading">Heading</option>
            <option value="helperText">Helper Text</option>
            <option value="joinRequiredText">
              Join Required Text
            </option>
            <option value="input">Input Text</option>
            <option value="submitButton">
              Submit Button
            </option>
            <option value="submittedLabel">
              Submitted Label
            </option>
            <option value="queueHeading">
              Queue Heading
            </option>
            <option value="queueText">
              Queue Text
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={liveSongRequestStyleTarget}
            onChange={(e) =>
              setLiveSongRequestStyleTarget(
                e.target.value as LiveSongRequestStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">Entire Block</option>
            <option value="input">Song Inputs</option>
            <option value="submitButton">
              Submit Button
            </option>
            <option value="queue">Request Queue</option>
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
            updateData({ heading: e.target.value })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Helper Text
        </div>
        <textarea
          value={selectedBlock.data.helperText ?? ""}
          onChange={(e) =>
            updateData({ helperText: e.target.value })
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
          value={selectedBlock.data.joinRequiredText ?? ""}
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
          Song Placeholder
        </div>
        <input
          type="text"
          value={selectedBlock.data.songPlaceholder ?? ""}
          onChange={(e) =>
            updateData({
              songPlaceholder: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Artist Placeholder
        </div>
        <input
          type="text"
          value={selectedBlock.data.artistPlaceholder ?? ""}
          onChange={(e) =>
            updateData({
              artistPlaceholder: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Submit Button Label
        </div>
        <input
          type="text"
          value={selectedBlock.data.submitButtonLabel ?? ""}
          onChange={(e) =>
            updateData({
              submitButtonLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Submitted Label
        </div>
        <input
          type="text"
          value={selectedBlock.data.submittedLabel ?? ""}
          onChange={(e) =>
            updateData({
              submittedLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Queue Heading
        </div>
        <input
          type="text"
          value={selectedBlock.data.queueHeading ?? ""}
          onChange={(e) =>
            updateData({
              queueHeading: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selectedBlock.data.showQueue !== false}
            onChange={(e) =>
              updateData({
                showQueue: e.target.checked,
              })
            }
          />
          <span>Show Request Queue</span>
        </label>
      </div>
    </div>
  );
}