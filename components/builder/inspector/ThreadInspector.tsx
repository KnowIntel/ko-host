"use client";

import type { RefObject } from "react";

type ThreadInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  threadSubjectInputRef: RefObject<HTMLInputElement | null>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function ThreadInspector({
  selectedBlock,
  updateSelectedBlock,
  threadSubjectInputRef,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: ThreadInspectorProps) {
  return (
    <div id="inspector-thread" className={inspectorCardClass()}>
      {/* Thread / Interactive */}
    <div className={inspectorLabelClass()}>Thread / Interactive</div>

        <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Target</div>
      <select
        value={selectedBlock.data.threadStyleTarget ?? "message"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "thread"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    threadStyleTarget: e.target.value as
                      | "form"
                      | "post_block"
                      | "subject"
                      | "name"
                      | "message"
                      | "post_button",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="form">Form</option>
        <option value="post_block">Post message composer</option>
        <option value="subject">Subject</option>
        <option value="name">Name</option>
        <option value="message">Posted messages</option>
        <option value="post_button">Post button</option>
      </select>
    </div>

        {["form", "post_block", "message", "post_button"].includes(
      selectedBlock.data.threadStyleTarget ?? "message",
    ) ? (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>Target Appearance</div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Background Color</div>
          <input
            type="color"
            value={
              selectedBlock.data.threadStyleTarget === "form"
                ? selectedBlock.data.formAppearance?.backgroundColor ?? "#ffffff"
                : selectedBlock.data.threadStyleTarget === "post_block"
                  ? selectedBlock.data.postBlockAppearance?.backgroundColor ??
                    "#ffffff"
                  : selectedBlock.data.threadStyleTarget === "post_button"
                    ? selectedBlock.data.postButtonAppearance?.backgroundColor ??
                      "#111827"
                    : selectedBlock.data.messageAppearance?.backgroundColor ??
                      "#ffffff"
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) => {
                if (block.type !== "thread") return block;

                const target = block.data.threadStyleTarget ?? "message";
                const key =
                  target === "form"
                    ? "formAppearance"
                    : target === "post_block"
                      ? "postBlockAppearance"
                      : target === "post_button"
                        ? "postButtonAppearance"
                        : "messageAppearance";

                return {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: {
                      ...((block.data as any)[key] ?? {}),
                      backgroundColor: e.target.value,
                    },
                  },
                };
              })
            }
            className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
          />
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Transparency</div>
          <input
            type="range"
            min={0}
            max={100}
            value={
              selectedBlock.data.threadStyleTarget === "form"
                ? selectedBlock.data.formAppearance?.backgroundOpacity ?? 100
                : selectedBlock.data.threadStyleTarget === "post_block"
                  ? selectedBlock.data.postBlockAppearance?.backgroundOpacity ??
                    100
                  : selectedBlock.data.threadStyleTarget === "post_button"
                    ? selectedBlock.data.postButtonAppearance
                        ?.backgroundOpacity ?? 100
                    : selectedBlock.data.messageAppearance?.backgroundOpacity ??
                      100
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) => {
                if (block.type !== "thread") return block;

                const target = block.data.threadStyleTarget ?? "message";
                const key =
                  target === "form"
                    ? "formAppearance"
                    : target === "post_block"
                      ? "postBlockAppearance"
                      : target === "post_button"
                        ? "postButtonAppearance"
                        : "messageAppearance";

                return {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: {
                      ...((block.data as any)[key] ?? {}),
                      backgroundOpacity: Math.max(
                        0,
                        Math.min(100, Number(e.target.value) || 0),
                      ),
                    },
                  },
                };
              })
            }
            className="mt-2 w-full"
          />
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Border Color</div>
          <input
            type="color"
            value={
              selectedBlock.data.threadStyleTarget === "form"
                ? selectedBlock.data.formAppearance?.borderColor ?? "#e5e7eb"
                : selectedBlock.data.threadStyleTarget === "post_block"
                  ? selectedBlock.data.postBlockAppearance?.borderColor ??
                    "#e5e7eb"
                  : selectedBlock.data.threadStyleTarget === "post_button"
                    ? selectedBlock.data.postButtonAppearance?.borderColor ??
                      "#111827"
                    : selectedBlock.data.messageAppearance?.borderColor ??
                      "#d4d4d8"
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) => {
                if (block.type !== "thread") return block;

                const target = block.data.threadStyleTarget ?? "message";
                const key =
                  target === "form"
                    ? "formAppearance"
                    : target === "post_block"
                      ? "postBlockAppearance"
                      : target === "post_button"
                        ? "postButtonAppearance"
                        : "messageAppearance";

                return {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: {
                      ...((block.data as any)[key] ?? {}),
                      borderColor: e.target.value,
                    },
                  },
                };
              })
            }
            className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
          />
        </div>
      </div>
    ) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subject</div>
      <input
        ref={threadSubjectInputRef}
        type="text"
        value={selectedBlock.data.subject ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "thread"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subject: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.allowAnonymous)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "thread"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      allowAnonymous: e.target.checked,
                    },
                  },
            )
          }
        />
        Allow anonymous posting
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.requireApproval)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "thread"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      requireApproval: e.target.checked,
                    },
                  },
            )
          }
        />
        Require approval
      </label>
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Display</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Max Visible Messages</div>
        <input
          type="number"
          min={1}
          max={100}
          value={selectedBlock.data.maxVisibleMessages ?? 4}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "thread"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      maxVisibleMessages: Math.max(
                        1,
                        Math.min(100, Number(e.target.value) || 4),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showNameField !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "thread"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showNameField: e.target.checked,
                      },
                    },
              )
            }
          />
          Show name field
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showVoteControls !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "thread"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showVoteControls: e.target.checked,
                      },
                    },
              )
            }
          />
          Show vote controls
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showVoteCount !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "thread"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showVoteCount: e.target.checked,
                      },
                    },
              )
            }
          />
          Show vote count
        </label>
      </div>
    </div>

<div className="mt-5">
  <div className={inspectorLabelClass()}>Composer</div>

  {selectedBlock.data.showNameField !== false ? (
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Name Placeholder</div>
      <input
        type="text"
        maxLength={60}
        value={selectedBlock.data.namePlaceholder ?? "Your name"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "thread"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    namePlaceholder: e.target.value.slice(0, 60),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  ) : null}

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Composer Placeholder</div>
    <input
      type="text"
      maxLength={120}
      value={selectedBlock.data.composerPlaceholder ?? "Write something…"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  composerPlaceholder: e.target.value.slice(0, 120),
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Post Button Text</div>
    <input
      type="text"
      maxLength={30}
      value={selectedBlock.data.postButtonText ?? "Post"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  postButtonText: e.target.value.slice(0, 30),
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Post Button Style</div>
    <select
      value={selectedBlock.data.postButtonStyle ?? "solid"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  postButtonStyle: e.target.value as
                    | "solid"
                    | "outline"
                    | "soft",
                },
              },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="solid">Solid</option>
      <option value="outline">Outline</option>
      <option value="soft">Soft</option>
    </select>
  </div>
</div>

<div className="mt-5">
  <div className={inspectorLabelClass()}>Messages</div>

  <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
    Messages are now read-only in the inspector and come from live microsite data.
  </div>
</div>
    </div>
  );
}