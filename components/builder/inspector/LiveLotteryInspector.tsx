"use client";

import type {
  LiveLotteryStyleTarget,
  LiveLotteryTextTarget,
} from "@/components/builder/formatting/liveLotteryFormatting";

type LiveLotteryInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  liveLotteryTextTarget: LiveLotteryTextTarget;
  setLiveLotteryTextTarget: (
    target: LiveLotteryTextTarget,
  ) => void;
  liveLotteryStyleTarget: LiveLotteryStyleTarget;
  setLiveLotteryStyleTarget: (
    target: LiveLotteryStyleTarget,
  ) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveLotteryInspector({
  selectedBlock,
  updateSelectedBlock,
  liveLotteryTextTarget,
  setLiveLotteryTextTarget,
  liveLotteryStyleTarget,
  setLiveLotteryStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveLotteryInspectorProps) {
  const updateData = (
    updates: Record<string, any>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_lottery"
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
        Lottery
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
            value={liveLotteryTextTarget}
            onChange={(e) =>
              setLiveLotteryTextTarget(
                e.target.value as LiveLotteryTextTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="heading">Heading</option>
            <option value="helperText">
              Helper Text
            </option>
            <option value="joinRequiredText">
              Join Required Text
            </option>
            <option value="enterButton">
              Enter Button
            </option>
            <option value="enteredLabel">
              Entered Label
            </option>
            <option value="winnerHeading">
              Winner Heading
            </option>
            <option value="winnerText">
              Winner Text
            </option>
            <option value="waitingForDrawText">
              Waiting for Draw Text
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={liveLotteryStyleTarget}
            onChange={(e) =>
              setLiveLotteryStyleTarget(
                e.target.value as LiveLotteryStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">
              Entire Block
            </option>
            <option value="enterButton">
              Enter Button
            </option>
            <option value="winner">
              Winner Panel
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
          Enter Button Label
        </div>
        <input
          type="text"
          value={selectedBlock.data.enterButtonLabel ?? ""}
          onChange={(e) =>
            updateData({
              enterButtonLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Entered Label
        </div>
        <input
          type="text"
          value={selectedBlock.data.enteredLabel ?? ""}
          onChange={(e) =>
            updateData({
              enteredLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Winner Heading
        </div>
        <input
          type="text"
          value={selectedBlock.data.winnerHeading ?? ""}
          onChange={(e) =>
            updateData({
              winnerHeading: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Waiting for Draw Text
        </div>
        <textarea
          value={
            selectedBlock.data.waitingForDrawText ?? ""
          }
          onChange={(e) =>
            updateData({
              waitingForDrawText: e.target.value,
            })
          }
          rows={2}
          className={inspectorInputClass()}
        />
      </div>
    </div>
  );
}