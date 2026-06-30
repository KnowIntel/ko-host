"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  PostBoardStyleTarget as PostBoardUnifiedStyleTarget,
  PostBoardTextTarget,
} from "@/components/builder/formatting/postBoardFormatting";

/**
 * Post Board inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "post_board"
 */
type PostBoardStyleTarget =
  | "block"
  | "block_heading"
  | "card"
  | "heading"
  | "body"
  | "buttons";

type PostBoardInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  postBoardTextTarget: PostBoardTextTarget;
  setPostBoardTextTarget: Dispatch<SetStateAction<PostBoardTextTarget>>;

  postBoardUnifiedStyleTarget: PostBoardUnifiedStyleTarget;
  setPostBoardUnifiedStyleTarget: Dispatch<
    SetStateAction<PostBoardUnifiedStyleTarget>
  >;

  threadOptions: { id: string; label: string }[];

  makeClientId: (prefix: string) => string;
  uploadImageToSelectedBlock: (
    blockId: string,
    imageSlot?: any,
    imageUrl?: any,
    postId?: string,
  ) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function PostBoardInspector({
  selectedBlock,
  updateSelectedBlock,
  postBoardTextTarget,
  setPostBoardTextTarget,
  postBoardUnifiedStyleTarget,
  setPostBoardUnifiedStyleTarget,
  threadOptions,
  makeClientId,
  uploadImageToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
}: PostBoardInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Post Board */}
    <div className={inspectorLabelClass()}>Post Board</div>
<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>
    <select
      value={postBoardTextTarget}
      onChange={(e) =>
        setPostBoardTextTarget(
          e.target.value as PostBoardTextTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="heading">Heading</option>
      <option value="subtitle">Subtitle</option>
      <option value="pinnedPill">Pinned Pill</option>
      <option value="pinnedLabel">Pinned Label</option>
      <option value="ownerDisplayName">Owner Display Name</option>
      <option value="actionButtons">Like / Message Buttons</option>
      <option value="title">Title</option>
      <option value="messageText">Message Text</option>
      <option value="defaultProfile">Default Profile</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Style Target</div>
    <select
      value={postBoardUnifiedStyleTarget}
      onChange={(e) =>
        setPostBoardUnifiedStyleTarget(
          e.target.value as PostBoardUnifiedStyleTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="section">Section</option>
      <option value="pinnedPill">Pinned Pill</option>
      <option value="actionButtons">Like / Message Buttons</option>
      <option value="defaultProfile">Default Profile</option>
      <option value="block">Block</option>
    </select>
  </div>
</div>
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <input
        type="text"
        value={selectedBlock.data.subtitle ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtitle: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Interaction Mode</div>
  <select
    value={selectedBlock.data.interactionMode ?? "announcement"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "post_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                interactionMode: e.target.value as
                  | "announcement"
                  | "community",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="announcement">Announcement Board</option>
    <option value="community">Community Board</option>
  </select>

  <div className="mt-2 text-xs text-neutral-500">
    Announcement Board is owner-created updates. Community Board allows
    visitors to start discussion posts and reply inside this block.
  </div>
</div>

{(selectedBlock.data.interactionMode ?? "announcement") === "community" ? (
  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
    <div className={inspectorLabelClass()}>Community Settings</div>

    <label className="mt-3 flex items-center gap-3 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={selectedBlock.data.requireCommunityPostEmail ?? true}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    requireCommunityPostEmail: e.target.checked,
                  },
                },
          )
        }
      />
      Require email when creating a discussion
    </label>

    <label className="mt-3 flex items-center gap-3 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={selectedBlock.data.allowReplyEmailCapture ?? true}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    allowReplyEmailCapture: e.target.checked,
                  },
                },
          )
        }
      />
      Allow private email on replies
    </label>

    <label className="mt-3 flex items-center gap-3 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={selectedBlock.data.notifyPostAuthorOnReply ?? true}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    notifyPostAuthorOnReply: e.target.checked,
                  },
                },
          )
        }
      />
      Notify original post author of replies
    </label>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Max Visible Replies</div>
      <input
        type="number"
        min={1}
        max={100}
        value={selectedBlock.data.maxVisibleReplies ?? 10}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    maxVisibleReplies: Math.max(
                      1,
                      Math.min(100, Number(e.target.value) || 10),
                    ),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  </div>
) : null}

<div className="mt-4">
  <div className={inspectorLabelClass()}>Style Variant</div>
  <select
    value={selectedBlock.data.variant ?? "standard"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "post_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                variant: e.target.value as "standard" | "compact" | "feature",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="standard">Standard</option>
    <option value="compact">Compact</option>
    <option value="feature">Feature</option>
  </select>
</div>

    <div className="mt-4 grid gap-2">
      {[
        ["showHeading", "Show heading"],
        ["showSubtitle", "Show subtitle"],
        ["showOwnerAvatar", "Show profile image"],
        ["showTimestamps", "Show timestamps"],
        ["showPinnedPostsFirst", "Pinned posts first"],
        ["showLikes", "Show likes"],
        ["showMessages", "Show message button"],
        ["allowImages", "Allow images"],
        ["allowVideos", "Allow videos"],
      ].map(([key, label]) => (
        <label
          key={key}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
        >
          <input
            type="checkbox"
            checked={Boolean((selectedBlock.data as any)[key] ?? true)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "post_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        [key]: e.target.checked,
                      },
                    },
              )
            }
          />
          {label}
        </label>
      ))}
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Max Message Length</div>
      <input
        type="number"
        min={50}
        max={1000}
        value={selectedBlock.data.maxMessageLength ?? 300}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    maxMessageLength: Math.max(
                      50,
                      Math.min(1000, Number(e.target.value) || 300),
                    ),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-5">
  <div className={inspectorLabelClass()}>Card Styling</div>

  <div className="mt-3 grid grid-cols-2 gap-3">
    <div>
      <div className={inspectorLabelClass()}>Card Background</div>
      <input
        type="color"
        value={(selectedBlock.data.cardStyle as any)?.backgroundColor ?? "#ffffff"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cardStyle: {
                      ...((block.data as any).cardStyle ?? {}),
                      backgroundColor: e.target.value,
                    },
                  },
                },
          )
        }
        className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
      />
    </div>

    <div>
      <div className={inspectorLabelClass()}>Border Color</div>
      <input
        type="color"
        value={(selectedBlock.data.cardStyle as any)?.borderColor ?? "#e5e7eb"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cardStyle: {
                      ...((block.data as any).cardStyle ?? {}),
                      borderColor: e.target.value,
                    },
                  },
                },
          )
        }
        className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
      />
    </div>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Card Radius: {(selectedBlock.data.cardStyle as any)?.borderRadius ?? 16}px
    </div>
    <input
      type="range"
      min={0}
      max={40}
      value={(selectedBlock.data.cardStyle as any)?.borderRadius ?? 16}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "post_board"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  cardStyle: {
                    ...((block.data as any).cardStyle ?? {}),
                    borderRadius: Number(e.target.value),
                  },
                },
              },
        )
      }
      className="mt-2 w-full"
    />
  </div>
</div>

    <div className="mt-5 space-y-3">
      <div className={inspectorLabelClass()}>Posts</div>

      {selectedBlock.data.posts.map((post: any) => (
        <div
          key={post.id}
          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <label className="mb-3 flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={Boolean(post.pinned)}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "post_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          posts: block.data.posts.map((entry: any) =>
                            entry.id === post.id
                              ? { ...entry, pinned: e.target.checked }
                              : entry,
                          ),
                        },
                      },
                )
              }
            />
            Pin post
          </label>

          <div className={inspectorLabelClass()}>Title</div>
          <input
            type="text"
            value={post.title}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "post_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        posts: block.data.posts.map((entry: any) =>
                          entry.id === post.id
                            ? { ...entry, title: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Subtitle / Category</div>
            <input
              type="text"
              value={post.subtitle ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "post_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          posts: block.data.posts.map((entry: any) =>
                            entry.id === post.id
                              ? { ...entry, subtitle: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Message</div>
            <textarea
              value={post.message}
              maxLength={selectedBlock.data.maxMessageLength ?? 300}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "post_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          posts: block.data.posts.map((entry: any) =>
                            entry.id === post.id
                              ? { ...entry, message: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorTextareaClass()}
            />
            <div className="mt-1 text-xs text-neutral-500">
              {post.message.length}/{selectedBlock.data.maxMessageLength ?? 300}
            </div>
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Owner Display Name</div>
            <input
              type="text"
              value={post.ownerDisplayName ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "post_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          posts: block.data.posts.map((entry: any) =>
                            entry.id === post.id
                              ? { ...entry, ownerDisplayName: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Image URL</div>
            <input
              type="text"
              value={post.imageUrl ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "post_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          posts: block.data.posts.map((entry: any) =>
                            entry.id === post.id
                              ? { ...entry, imageUrl: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <button
  type="button"
  className="mt-2 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50"
  onClick={() =>
    void uploadImageToSelectedBlock(
      selectedBlock.id,
      undefined,
      undefined,
      post.id,
    )
  }
>
  Browse Post Image
</button>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Video URL</div>
  <input
    type="text"
    value={post.videoUrl ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "post_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                posts: block.data.posts.map((entry: any) =>
                  entry.id === post.id
                    ? { ...entry, videoUrl: e.target.value }
                    : entry,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
    placeholder="https://..."
  />
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Discussion Thread</div>
  <select
    value={post.threadId ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "post_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                posts: block.data.posts.map((entry: any) =>
                  entry.id === post.id
                    ? { ...entry, threadId: e.target.value }
                    : entry,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="">No linked thread</option>

    {threadOptions.map((thread) => (
      <option key={thread.id} value={thread.id}>
        {thread.label}
      </option>
    ))}
  </select>

  <div className="mt-1 text-xs text-neutral-500">
    Link this post to an existing Thread block for visitor discussion.
  </div>
</div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className={inspectorLabelClass()}>Likes</div>
              <input
                type="number"
                min={0}
                value={post.likeCount ?? 0}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "post_board"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            posts: block.data.posts.map((entry: any) =>
                              entry.id === post.id
                                ? {
                                    ...entry,
                                    likeCount: Math.max(
                                      0,
                                      Number(e.target.value) || 0,
                                    ),
                                  }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <div>
              <div className={inspectorLabelClass()}>Messages</div>
              <input
                type="number"
                min={0}
                value={post.messageCount ?? 0}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "post_board"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            posts: block.data.posts.map((entry: any) =>
                              entry.id === post.id
                                ? {
                                    ...entry,
                                    messageCount: Math.max(
                                      0,
                                      Number(e.target.value) || 0,
                                    ),
                                  }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>
          </div>

          <div className="mt-3 flex justify-between gap-2">
            <button
              type="button"
              className={toolSetButtonClass("front")}
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "post_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          posts: [
                            ...block.data.posts,
                            {
                              ...post,
                              id: makeClientId("post"),
                              title: `${post.title || "Post"} Copy`,
                              createdAt: new Date().toISOString(),
                            },
                          ],
                        },
                      },
                )
              }
            >
              Duplicate
            </button>

            <button
              type="button"
              className={toolSetButtonClass("remove")}
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "post_board"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          posts:
                            block.data.posts.length > 1
                              ? block.data.posts.filter(
                                  (entry: any) => entry.id !== post.id
                                )
                              : block.data.posts,
                        },
                      },
                )
              }
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block: any) =>
            block.type !== "post_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    posts: [
                      ...block.data.posts,
                      {
                        id: makeClientId("post"),
                        title: "New update",
                        subtitle: "",
                        message: "Write a short announcement here.",
                        createdAt: new Date().toISOString(),
                        ownerDisplayName: "Owner",
                        pinned: false,
                        likeCount: 0,
                        messageCount: 0,
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Post
      </button>
    </div>
    </div>
  );
}