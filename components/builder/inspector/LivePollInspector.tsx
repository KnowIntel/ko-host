"use client";

import type {
  LivePollStyleTarget,
  LivePollTextTarget,
} from "@/components/builder/formatting/livePollFormatting";

type LivePollInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  livePollTextTarget:
    LivePollTextTarget;

  setLivePollTextTarget: (
    target: LivePollTextTarget,
  ) => void;

  livePollStyleTarget:
    LivePollStyleTarget;

  setLivePollStyleTarget: (
    target: LivePollStyleTarget,
  ) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LivePollInspector({
  selectedBlock,
  updateSelectedBlock,

  livePollTextTarget,
  setLivePollTextTarget,

  livePollStyleTarget,
  setLivePollStyleTarget,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LivePollInspectorProps) {
  const updateLivePollData = (
    updates: Record<
      string,
      string | boolean
    >,
  ) => {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "live_poll"
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
        Live Poll
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
            value={livePollTextTarget}
            onChange={(e) =>
              setLivePollTextTarget(
                e.target
                  .value as LivePollTextTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="heading">
              Heading
            </option>

            <option value="waitingText">
              Waiting Text
            </option>

            <option value="joinRequiredText">
              Join Required Text
            </option>

            <option value="question">
              Question
            </option>

            <option value="choice">
              Poll Choices
            </option>

            <option value="submitButton">
              Submit Button
            </option>

<option value="votedLabel">
  Voted Message
</option>

            <option value="resultsHeading">
              Results Heading
            </option>

            <option value="resultsText">
              Results
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>
            Style Target
          </div>

          <select
            value={livePollStyleTarget}
            onChange={(e) =>
              setLivePollStyleTarget(
                e.target
                  .value as LivePollStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">
              Entire Block
            </option>

            <option value="choice">
              Poll Choices
            </option>

            <option value="selectedChoice">
              Selected Choice
            </option>

            <option value="submitButton">
              Submit Button
            </option>

            <option value="results">
              Results
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
          value={
            selectedBlock.data.heading ??
            ""
          }
          onChange={(e) =>
            updateLivePollData({
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
          value={
            selectedBlock.data
              .waitingText ?? ""
          }
          onChange={(e) =>
            updateLivePollData({
              waitingText:
                e.target.value,
            })
          }
          rows={2}
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Join Required Text
        </div>

        <textarea
          value={
            selectedBlock.data
              .joinRequiredText ?? ""
          }
          onChange={(e) =>
            updateLivePollData({
              joinRequiredText:
                e.target.value,
            })
          }
          rows={2}
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Submit Button Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data
              .submitButtonLabel ?? ""
          }
          onChange={(e) =>
            updateLivePollData({
              submitButtonLabel:
                e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Voted Label
  </div>

  <input
    type="text"
    value={
      selectedBlock.data
        .votedLabel ?? ""
    }
    onChange={(e) =>
      updateLivePollData({
        votedLabel:
          e.target.value,
      })
    }
    className={inspectorInputClass()}
  />
</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Results Heading
        </div>

        <input
          type="text"
          value={
            selectedBlock.data
              .resultsHeading ?? ""
          }
          onChange={(e) =>
            updateLivePollData({
              resultsHeading:
                e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={
            selectedBlock.data
              .showResults !== false
          }
          onChange={(e) =>
            updateLivePollData({
              showResults:
                e.target.checked,
            })
          }
        />

        Show live results
      </label>
    </div>
  );
}