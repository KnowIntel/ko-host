"use client";

import type {
  LiveMysteryDropStyleTarget,
  LiveMysteryDropTextTarget,
} from "@/components/builder/formatting/liveMysteryDropFormatting";

type LiveMysteryDropInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  liveMysteryDropTextTarget: LiveMysteryDropTextTarget;
  setLiveMysteryDropTextTarget: (
    target: LiveMysteryDropTextTarget,
  ) => void;
  liveMysteryDropStyleTarget: LiveMysteryDropStyleTarget;
  setLiveMysteryDropStyleTarget: (
    target: LiveMysteryDropStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveMysteryDropInspector({
  selectedBlock,
  updateSelectedBlock,
  liveMysteryDropTextTarget,
  setLiveMysteryDropTextTarget,
  liveMysteryDropStyleTarget,
  setLiveMysteryDropStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveMysteryDropInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_mystery_drop"
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
        Mystery Drop
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
            value={liveMysteryDropTextTarget}
            onChange={(e) =>
              setLiveMysteryDropTextTarget(
                e.target.value as LiveMysteryDropTextTarget,
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
            <option value="availableLabel">
              Available Label
            </option>
            <option value="revealButton">
              Reveal Button
            </option>
            <option value="revealedLabel">
              Revealed Label
            </option>
            <option value="content">
              Drop Content
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={liveMysteryDropStyleTarget}
            onChange={(e) =>
              setLiveMysteryDropStyleTarget(
                e.target.value as LiveMysteryDropStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">
              Entire Block
            </option>
            <option value="drop">
              Drop Panel
            </option>
            <option value="revealButton">
              Reveal Button
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
            updateData({ heading: e.target.value })
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
            updateData({ waitingText: e.target.value })
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
          Available Label
        </div>
        <input
          type="text"
          value={
            selectedBlock.data.availableLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              availableLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Reveal Button Label
        </div>
        <input
          type="text"
          value={
            selectedBlock.data.revealButtonLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              revealButtonLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Revealed Label
        </div>
        <input
          type="text"
          value={
            selectedBlock.data.revealedLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              revealedLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>
  );
}