"use client";

type LiveJoinInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;
  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function LiveJoinInspector({
  selectedBlock,
  updateSelectedBlock,
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

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Heading
        </div>

        <input
          type="text"
          value={selectedBlock.data.heading ?? ""}
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