"use client";

import type { RefObject } from "react";
import type {
  ThreadStyleTarget,
  ThreadTextTarget,
} from "@/components/builder/formatting/threadFormatting";

type ThreadInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  threadTextTarget: ThreadTextTarget;
  setThreadTextTarget: (target: ThreadTextTarget) => void;

  threadStyleTarget: ThreadStyleTarget;
  setThreadStyleTarget: (target: ThreadStyleTarget) => void;

  threadSubjectInputRef: RefObject<HTMLInputElement | null>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function ThreadInspector({
  selectedBlock,
  updateSelectedBlock,

  threadTextTarget,
  setThreadTextTarget,
  threadStyleTarget,
  setThreadStyleTarget,

  threadSubjectInputRef,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: ThreadInspectorProps) {
  return (
    <div id="inspector-thread" className={inspectorCardClass()}>
      {/* Thread / Interactive */}
    <div className={inspectorLabelClass()}>Thread / Interactive</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>
    <select
      value={threadTextTarget}
      onChange={(e) =>
        setThreadTextTarget(e.target.value as ThreadTextTarget)
      }
      className={inspectorInputClass()}
    >
      <option value="subject">Subject</option>
      <option value="captionPill">Caption Pill</option>
      <option value="postLabel">Post Label</option>
      <option value="placeholderText">Placeholder Text</option>
      <option value="addMediaButton">Add Media Button</option>
      <option value="addMediaMetadata">Add Media Metadata</option>
      <option value="nameCharMaxLabel">Name Char Max Label</option>
      <option value="messageCharMaxLabel">Message Char Max Label</option>
      <option value="postTypeLabel">Post Type Label</option>
      <option value="postButton">Post Button</option>
      <option value="voteText">Vote Text</option>
      <option value="defaultProfile">Default Profile</option>
      <option value="nameText">Name Text</option>
      <option value="messageText">Message Text</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Style Target</div>
    <select
      value={threadStyleTarget}
      onChange={(e) =>
        setThreadStyleTarget(e.target.value as ThreadStyleTarget)
      }
      className={inspectorInputClass()}
    >
      <option value="field">Field</option>
      <option value="section">Section</option>
      <option value="captionPill">Caption Pill</option>
      <option value="addMediaButton">Add Media Button</option>
      <option value="postButton">Post Button</option>
      <option value="thumbsUp">Thumbs Up</option>
      <option value="thumbsDown">Thumbs Down</option>
      <option value="defaultProfile">Default Profile</option>
      <option value="block">Block</option>
    </select>
  </div>
</div>

{null}

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

<div className="mt-4">
  <div className={inspectorLabelClass()}>Caption Pill Text</div>
  <input
    type="text"
    maxLength={50}
    value={selectedBlock.data.captionPillText ?? "Open Thread"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "thread"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                captionPillText: e.target.value.slice(0, 50),
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

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Post Label</div>
    <input
      type="text"
      maxLength={80}
      value={selectedBlock.data.postLabel ?? "Post a message"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  postLabel: e.target.value.slice(0, 80),
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

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
    <div className={inspectorLabelClass()}>Add Media Button Text</div>
    <input
      type="text"
      maxLength={40}
      value={selectedBlock.data.addMediaButtonText ?? "Add Media"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  addMediaButtonText: e.target.value.slice(0, 40),
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Add Media Metadata</div>
    <input
      type="text"
      maxLength={120}
      value={
        selectedBlock.data.addMediaMetadataText ??
        "Images, videos, and files supported"
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  addMediaMetadataText: e.target.value.slice(0, 120),
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Post Type Label</div>
    <input
      type="text"
      maxLength={80}
      value={selectedBlock.data.postTypeLabel ?? "Posting with name"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  postTypeLabel: e.target.value.slice(0, 80),
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

</div>
);
}