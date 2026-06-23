"use client";

/**
 * File Share inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "file_share"
 */
type FileShareInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;
};

export function FileShareInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
}: FileShareInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* File Share */}
    <div className={inspectorLabelClass()}>File Share</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "file_share"
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
      <div className={inspectorLabelClass()}>Subtext</div>
      <textarea
        value={selectedBlock.data.subtext ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "file_share"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtext: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.allowPublicUpload)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      allowPublicUpload: e.target.checked,
                    },
                  },
            )
          }
        />
        Allow public upload
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.requireAccessCode)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      requireAccessCode: e.target.checked,
                    },
                  },
            )
          }
        />
        Require access code
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.allowMultiple)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      allowMultiple: e.target.checked,
                    },
                  },
            )
          }
        />
        Allow multiple files
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.collectName !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      collectName: e.target.checked,
                    },
                  },
            )
          }
        />
        Collect name
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.collectEmail !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      collectEmail: e.target.checked,
                    },
                  },
            )
          }
        />
        Collect email
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.collectMessage)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      collectMessage: e.target.checked,
                    },
                  },
            )
          }
        />
        Collect message
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.ownerAlertOnUpload !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      ownerAlertOnUpload: e.target.checked,
                    },
                  },
            )
          }
        />
        Owner alert on upload
      </label>
    </div>

    {selectedBlock.data.requireAccessCode ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>Access Code</div>
        <input
          type="text"
          value={selectedBlock.data.accessCode ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      accessCode: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder="Enter access code"
        />
      </div>
    ) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Accepted File Types</div>
      <input
        type="text"
        value={(selectedBlock.data.acceptedFileTypes ?? []).join(", ")}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "file_share"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    acceptedFileTypes: e.target.value
                      .split(",")
                      .map((entry: string) => entry.trim().toLowerCase())
                      .filter((entry: string) => entry.length > 0),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="pdf, jpg, jpeg, png, webp, doc, docx, txt"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Max File Size (MB)</div>
      <input
        type="number"
        min={1}
        max={100}
        value={selectedBlock.data.maxFileSizeMb ?? 25}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "file_share"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    maxFileSizeMb: Math.max(
                      1,
                      Math.min(100, Number(e.target.value) || 25),
                    ),
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