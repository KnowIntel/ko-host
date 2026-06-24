"use client";

/**
 * Video inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "video"
 */

import type { VideoTextTarget } from "@/components/builder/formatting/videoFormatting";
type VideoInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  handleVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadBuilderImageFile: (file: File) => Promise<any>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  videoTextTarget: VideoTextTarget;
  setVideoTextTarget: (target: VideoTextTarget) => void;
};

export function VideoInspector({
  selectedBlock,
  updateSelectedBlock,
  handleVideoUpload,
  uploadBuilderImageFile,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,

  videoTextTarget,
  setVideoTextTarget,
}: VideoInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Video */}
      
<div className={inspectorLabelClass()}>Video</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>
    <select
      value={videoTextTarget}
      onChange={(e) =>
        setVideoTextTarget(e.target.value as VideoTextTarget)
      }
      className={inspectorInputClass()}
    >
      <option value="title">Title</option>
      <option value="caption">Caption</option>
    </select>
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Title</div>
      <input
        type="text"
        value={selectedBlock.data.title ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "video"
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

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={Boolean((selectedBlock.data as any).addCaption)}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "video"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                addCaption: e.target.checked,
              } as any,
            },
      )
    }
  />
  Add caption
</label>

    {(selectedBlock.data as any).addCaption ? (
      <div className="mt-3">
        <div className={inspectorLabelClass()}>Caption</div>
        <input
          type="text"
          value={(selectedBlock.data as any).caption ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "video"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      caption: e.target.value,
                    } as any,
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder="Video caption..."
        />
      </div>
    ) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Upload Video</div>

      <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-black px-4 text-sm font-semibold text-white hover:opacity-90">
          <span className="leading-none">Choose File</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
          />
        </label>

        <div className="flex h-11 min-w-0 items-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-500">
          <span className="truncate">
            {selectedBlock.data.videoUrl?.trim() || "No file chosen"}
          </span>
        </div>
      </div>
    </div>

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={(selectedBlock.data as any).autoGenerateThumbnail !== false}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "video"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                autoGenerateThumbnail: e.target.checked,
              } as any,
            },
      )
    }
  />
  Auto-generate thumbnail
</label>

{(selectedBlock.data as any).autoGenerateThumbnail === false ? (
  <div className="mt-4">
    <div className={inspectorLabelClass()}>Upload Thumbnail</div>

    <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
      <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-black px-4 text-sm font-semibold text-white hover:opacity-90">
        <span className="leading-none">Choose File</span>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const uploaded = await uploadBuilderImageFile(file);

            updateSelectedBlock((block: any) =>
              block.type !== "video"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      thumbnailUrl: uploaded.url,
                      thumbnailPath: uploaded.storagePath,
                      thumbnailFileName: file.name,
                    } as any,
                  },
            );
          }}
        />
      </label>

      <div className="flex h-11 min-w-0 items-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-500">
        <span className="truncate">
          {(selectedBlock.data as any).thumbnailFileName || "No thumbnail chosen"}
        </span>
      </div>
    </div>

    <p className="mt-2 text-xs leading-5 text-neutral-500">
      Recommended thumbnail ratio: 16:9 for best video frame fit.
    </p>
  </div>
) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Video URL (YouTube, Vimeo, direct file, etc.)
      </div>
      <input
        type="text"
        value={selectedBlock.data.videoUrl ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "video"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    videoUrl: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="https://..."
      />
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3">

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
  <input
    type="checkbox"
    checked={(selectedBlock.data as any).showPlayOverlay !== false}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "video"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                showPlayOverlay: e.target.checked,
              } as any,
            },
      )
    }
  />
  Play Overlay
</label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.autoplay)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "video"
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

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.muted)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "video"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      muted: e.target.checked,
                    },
                  },
            )
          }
        />
        Muted
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.loop)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "video"
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
        Loop
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.showControls)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "video"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showControls: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Controls
      </label>
    </div>
    </div>
  );
}