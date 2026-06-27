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
    </div>
  );
}