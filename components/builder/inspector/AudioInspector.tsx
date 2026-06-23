"use client";

type AudioInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  uploadAudioToSelectedBlock: (blockId: string) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
};

export function AudioInspector({
  selectedBlock,
  updateSelectedBlock,
  uploadAudioToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
}: AudioInspectorProps) {
  return (
    <div id="inspector-audio" className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Audio</div>

      <div className="mt-4">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
          onClick={() => void uploadAudioToSelectedBlock(selectedBlock.id)}
        >
          {selectedBlock.data.audioUrl ? "Replace Audio" : "Browse Audio"}
        </button>

        {selectedBlock.data.audioUrl ? (
          <button
            type="button"
            className="ml-2 inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm text-red-600 hover:bg-red-50"
            onClick={() =>
              updateSelectedBlock((block: any) =>
                block.type !== "audio"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        audioUrl: "",
                      },
                    },
              )
            }
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.loop === true}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "audio"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        loop: e.target.checked,
                      },
                    },
              )
            }
          />
          Repeat
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.autoplay === true}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "audio"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        autoplay: e.target.checked,
                      },
                    },
              )
            }
          />
          Autoplay
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showPlayer !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "audio"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showPlayer: e.target.checked,
                      },
                    },
              )
            }
          />
          Show Player Controls
        </label>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-neutral-500">
        Autoplay may be blocked by browsers, especially on mobile, until the
        visitor taps the page.
      </p>
    </div>
  );
}