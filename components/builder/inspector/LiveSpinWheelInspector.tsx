// components\builder\inspector\LiveSpinWheelInspector.tsx

"use client";

import type {
  LiveSpinWheelStyleTarget,
  LiveSpinWheelTextTarget,
} from "@/components/builder/formatting/liveSpinWheelFormatting";

type LiveSpinWheelInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  liveSpinWheelTextTarget: LiveSpinWheelTextTarget;
  setLiveSpinWheelTextTarget: (
    target: LiveSpinWheelTextTarget,
  ) => void;
  liveSpinWheelStyleTarget: LiveSpinWheelStyleTarget;
  setLiveSpinWheelStyleTarget: (
    target: LiveSpinWheelStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveSpinWheelInspector({
  selectedBlock,
  updateSelectedBlock,
  liveSpinWheelTextTarget,
  setLiveSpinWheelTextTarget,
  liveSpinWheelStyleTarget,
  setLiveSpinWheelStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveSpinWheelInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_spin_wheel"
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
        Live Spin Wheel
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>
          Formatting
        </div>
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>
    Wheel Colors
  </div>

  <p className="mt-1 text-xs text-neutral-500">
    Colors repeat when the wheel has more options.
  </p>

  <div className="mt-3 grid grid-cols-2 gap-3">
    {[
      ["wheelColor1", "#111827"],
      ["wheelColor2", "#e5e7eb"],
      ["wheelColor3", "#9ca3af"],
      ["wheelColor4", "#f3f4f6"],
      ["wheelColor5", "#4b5563"],
      ["wheelColor6", "#d1d5db"],
    ].map(
      ([key, fallback], index) => (
        <label
          key={key}
          className="block"
        >
          <span className="mb-1 block text-xs font-medium text-neutral-600">
            Segment {index + 1}
          </span>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={
                selectedBlock.data[
                  key
                ] ?? fallback
              }
              onChange={(e) =>
                updateData({
                  [key]:
                    e.target.value,
                })
              }
              className="h-9 w-12 cursor-pointer rounded border border-neutral-300 bg-white p-1"
            />

            <input
              type="text"
              value={
                selectedBlock.data[
                  key
                ] ?? fallback
              }
              onChange={(e) =>
                updateData({
                  [key]:
                    e.target.value,
                })
              }
              className={inspectorInputClass()}
            />
          </div>
        </label>
      ),
    )}
  </div>
</div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Text Target
          </div>

          <select
            value={liveSpinWheelTextTarget}
            onChange={(e) =>
              setLiveSpinWheelTextTarget(
                e.target.value as LiveSpinWheelTextTarget,
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
            <option value="wheelText">
  Wheel Option Text
</option>
            <option value="spinButton">
              Spin Button
            </option>
            <option value="resultHeading">
              Result Heading
            </option>
            <option value="resultText">
              Result Text
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={liveSpinWheelStyleTarget}
            onChange={(e) =>
              setLiveSpinWheelStyleTarget(
                e.target.value as LiveSpinWheelStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">Entire Block</option>
            <option value="wheel">Wheel</option>
            <option value="spinButton">
              Spin Button
            </option>
            <option value="result">
              Result Panel
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
          Spin Button Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.spinButtonLabel ?? ""
          }
          onChange={(e) =>
            updateData({
              spinButtonLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Result Heading
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.resultHeading ?? ""
          }
          onChange={(e) =>
            updateData({
              resultHeading: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>
  );
}