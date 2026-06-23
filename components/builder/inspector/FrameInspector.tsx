"use client";

type FrameInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function FrameInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: FrameInspectorProps) {
  return (
    <div id="inspector-frame" className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Frame</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Frame Name</div>

        <input
          type="text"
          value={selectedBlock.data.frameName ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "frame"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      frameName: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder="Frame"
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-neutral-500">
        Frame borders show only on the builder canvas. They are hidden on
        public and preview pages.
      </p>
    </div>
  );
}