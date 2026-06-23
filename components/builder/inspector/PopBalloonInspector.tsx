"use client";

/**
 * Pop the Balloon inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "pop_balloon"
 */
type PopBalloonInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function PopBalloonInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: PopBalloonInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Pop the Balloon</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Title</div>
        <input
          type="text"
          value={selectedBlock.data.title ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      title: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Host Name</div>
        <input
          type="text"
          value={selectedBlock.data.hostName ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      hostName: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Host Passcode</div>
        <input
          type="text"
          value={selectedBlock.data.hostPasscode ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      hostPasscode: e.target.value,
                    },
                  },
            )
          }
          placeholder="123456"
          className={inspectorInputClass()}
        />
        <div className="mt-1 text-xs text-neutral-500">
          Used to unlock host controls on the public site.
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Lineup Slots</div>
        <input
          type="range"
          min={2}
          max={12}
          value={selectedBlock.data.lineupSlots ?? 6}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      lineupSlots: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.lineupSlots ?? 6} lineup spots
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Match Result</div>
        <select
          value={selectedBlock.data.matchResultMode ?? "public"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      matchResultMode: e.target.value as
                        | "public"
                        | "private"
                        | "contact_form"
                        | "private_chat_later",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="public">Show winner publicly</option>
          <option value="private">Private reveal only</option>
          <option value="contact_form">Send contact form</option>
          <option value="private_chat_later">Private chat later</option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Theme</div>
        <select
          value={selectedBlock.data.theme ?? "red_balloons"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      theme: e.target.value as
                        | "red_balloons"
                        | "hearts"
                        | "party"
                        | "formal"
                        | "custom",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="red_balloons">Red Balloons</option>
          <option value="hearts">Hearts</option>
          <option value="party">Party</option>
          <option value="formal">Formal</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Prompt</div>
        <textarea
          value={selectedBlock.data.prompt ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      prompt: e.target.value,
                    },
                  },
            )
          }
          className={`${inspectorInputClass()} min-h-[90px]`}
        />
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <span>Require pop reason</span>
          <input
            type="checkbox"
            checked={selectedBlock.data.requirePopReason !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "pop_balloon"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        requirePopReason: e.target.checked,
                      },
                    },
              )
            }
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <span>Audience voting</span>
          <input
            type="checkbox"
            checked={Boolean(selectedBlock.data.audienceVotingEnabled)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "pop_balloon"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        audienceVotingEnabled: e.target.checked,
                      },
                    },
              )
            }
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <span>Anonymous viewing</span>
          <input
            type="checkbox"
            checked={selectedBlock.data.anonymousViewingEnabled !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "pop_balloon"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        anonymousViewingEnabled: e.target.checked,
                      },
                    },
              )
            }
          />
        </label>
      </div>
    </div>
  );
}