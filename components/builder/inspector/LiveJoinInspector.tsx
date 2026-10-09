"use client";

import type {
  LiveJoinStyleTarget,
  LiveJoinTextTarget,
} from "@/components/builder/formatting/liveJoinFormatting";

type LiveJoinInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
liveJoinTextTarget: LiveJoinTextTarget;
setLiveJoinTextTarget: (target: LiveJoinTextTarget) => void;
liveJoinStyleTarget: LiveJoinStyleTarget;
setLiveJoinStyleTarget: (target: LiveJoinStyleTarget) => void;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveJoinInspector({
  selectedBlock,
  updateSelectedBlock,
  liveJoinTextTarget,
  setLiveJoinTextTarget,
  liveJoinStyleTarget,
  setLiveJoinStyleTarget,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: LiveJoinInspectorProps) {
  const updateLiveJoinData = (
    updates: Record<string, string>,
  ) => {
    updateSelectedBlock((block: any) =>
      block.type !== "live_join"
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
        Join Experience
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
      value={liveJoinTextTarget}
      onChange={(e) =>
        setLiveJoinTextTarget(
          e.target.value as LiveJoinTextTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="heading">Heading</option>
      <option value="helperText">Helper Text</option>
      <option value="namePlaceholder">Name Placeholder</option>
      <option value="joinButton">Join Button</option>
      <option value="connectedLabel">Connected Label</option>
      <option value="participantName">Participant Name</option>
      <option value="connectedMessage">Connected Message</option>
      <option value="leaveButton">Leave Button</option>
      <option value="avatarButton">Avatar Button</option>
      <option value="replaceButton">Replace Button</option>
      <option value="removeButton">Remove Button</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Style Target
    </div>

    <select
      value={liveJoinStyleTarget}
      onChange={(e) =>
        setLiveJoinStyleTarget(
          e.target.value as LiveJoinStyleTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="block">Entire Block</option>
      <option value="input">Name Input</option>
      <option value="joinButton">Join Button</option>
      <option value="leaveButton">Leave Button</option>
      <option value="avatarButton">Avatar Button</option>
      <option value="replaceButton">Replace Button</option>
      <option value="removeButton">Remove Button</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>
      Animation
    </div>

    <select
      value={selectedBlock.data.animation ?? "none"}
      onChange={(e) =>
        updateLiveJoinData({
          animation: e.target.value,
        })
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
          Heading (Before Joining)
        </div>

        <input
          type="text"
          value={selectedBlock.data.heading ?? "Join Live Experience"}
          onChange={(e) =>
            updateLiveJoinData({
              heading: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Heading (After Joining)
        </div>

        <input
          type="text"
          value={
            selectedBlock.data.headingAfterJoining ??
            "Leave Live Experience"
          }
          onChange={(e) =>
            updateLiveJoinData({
              headingAfterJoining: e.target.value,
            })
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
            updateLiveJoinData({
              helperText: e.target.value,
            })
          }
          rows={3}
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Name Placeholder
        </div>

        <input
          type="text"
          value={selectedBlock.data.namePlaceholder ?? ""}
          onChange={(e) =>
            updateLiveJoinData({
              namePlaceholder: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Join Button Label
        </div>

        <input
          type="text"
          value={selectedBlock.data.joinButtonLabel ?? ""}
          onChange={(e) =>
            updateLiveJoinData({
              joinButtonLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Connected Label
        </div>

        <input
          type="text"
          value={selectedBlock.data.connectedLabel ?? ""}
          onChange={(e) =>
            updateLiveJoinData({
              connectedLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Leave Button Label
        </div>

        <input
          type="text"
          value={selectedBlock.data.leaveButtonLabel ?? ""}
          onChange={(e) =>
            updateLiveJoinData({
              leaveButtonLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>
  );
}