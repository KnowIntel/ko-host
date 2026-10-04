"use client";

import type {
  LiveTriviaStyleTarget,
  LiveTriviaTextTarget,
} from "@/components/builder/formatting/liveTriviaFormatting";

type LiveTriviaInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  liveTriviaTextTarget:
    LiveTriviaTextTarget;

  setLiveTriviaTextTarget: (
    target: LiveTriviaTextTarget,
  ) => void;

  liveTriviaStyleTarget:
    LiveTriviaStyleTarget;

  setLiveTriviaStyleTarget: (
    target: LiveTriviaStyleTarget,
  ) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveTriviaInspector({
  selectedBlock,
  updateSelectedBlock,

  liveTriviaTextTarget,
  setLiveTriviaTextTarget,

  liveTriviaStyleTarget,
  setLiveTriviaStyleTarget,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveTriviaInspectorProps) {
  const updateLiveTriviaData = (
    updates: Record<
      string,
      string | boolean
    >,
  ) => {
    updateSelectedBlock(
      (block: any) =>
        block.type !== "live_trivia"
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
        Live Trivia
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>
          Formatting
        </div>

        <div className="mt-3">
          <div
            className={inspectorLabelClass()}
          >
            Text Target
          </div>

          <select
            value={liveTriviaTextTarget}
            onChange={(e) =>
              setLiveTriviaTextTarget(
                e.target
                  .value as LiveTriviaTextTarget,
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
              Answer Choices
            </option>

            <option value="submitButton">
              Submit Button
            </option>

            <option value="result">
              Answer Result
            </option>

            <option value="score">
              Score
            </option>

            <option value="leaderboardHeading">
              Leaderboard Heading
            </option>

            <option value="leaderboardText">
              Leaderboard Entries
            </option>
          </select>
        </div>

        <div className="mt-3">
          <div
            className={inspectorLabelClass()}
          >
            Style Target
          </div>

          <select
            value={liveTriviaStyleTarget}
            onChange={(e) =>
              setLiveTriviaStyleTarget(
                e.target
                  .value as LiveTriviaStyleTarget,
              )
            }
            className={inspectorInputClass()}
          >
            <option value="block">
              Entire Block
            </option>

            <option value="choice">
              Answer Choices
            </option>

            <option value="selectedChoice">
              Selected Answer
            </option>

            <option value="submitButton">
              Submit Button
            </option>

            <option value="leaderboard">
              Leaderboard
            </option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Heading
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.heading ??
            ""
          }
          onChange={(e) =>
            updateLiveTriviaData({
              heading: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Waiting Text
        </div>

        <textarea
          value={
            selectedBlock.data
              .waitingText ?? ""
          }
          onChange={(e) =>
            updateLiveTriviaData({
              waitingText:
                e.target.value,
            })
          }
          rows={2}
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Join Required Text
        </div>

        <textarea
          value={
            selectedBlock.data
              .joinRequiredText ?? ""
          }
          onChange={(e) =>
            updateLiveTriviaData({
              joinRequiredText:
                e.target.value,
            })
          }
          rows={2}
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Submit Button Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data
              .submitButtonLabel ?? ""
          }
          onChange={(e) =>
            updateLiveTriviaData({
              submitButtonLabel:
                e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Correct Answer Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data
              .correctLabel ?? ""
          }
          onChange={(e) =>
            updateLiveTriviaData({
              correctLabel:
                e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Incorrect Answer Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data
              .incorrectLabel ?? ""
          }
          onChange={(e) =>
            updateLiveTriviaData({
              incorrectLabel:
                e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Answered Label
        </div>

        <input
          type="text"
          value={
            selectedBlock.data
              .answeredLabel ?? ""
          }
          onChange={(e) =>
            updateLiveTriviaData({
              answeredLabel:
                e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div
          className={inspectorLabelClass()}
        >
          Leaderboard Heading
        </div>

        <input
          type="text"
          value={
            selectedBlock.data
              .leaderboardHeading ?? ""
          }
          onChange={(e) =>
            updateLiveTriviaData({
              leaderboardHeading:
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
              .showLeaderboard !== false
          }
          onChange={(e) =>
            updateLiveTriviaData({
              showLeaderboard:
                e.target.checked,
            })
          }
        />

        Show leaderboard
      </label>
    </div>
  );
}