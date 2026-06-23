"use client";

/**
 * Image inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "image"
 */
type ImageInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  uploadImageToSelectedBlock: (blockId: string) => Promise<any> | void;
  updateSelectedImagePatch: (patch: Record<string, any>) => void;
  updateSelectedImageFadePatch: (patch: Record<string, any>) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function ImageInspector({
  selectedBlock,
  updateSelectedBlock,
  uploadImageToSelectedBlock,
  updateSelectedImagePatch,
  updateSelectedImageFadePatch,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: ImageInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Image */}
                    <div className={inspectorLabelClass()}>Image</div>

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={Boolean((selectedBlock.data as any).addCaption)}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "image"
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
          block.type !== "image"
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
      placeholder="Image caption..."
    />
  </div>
) : null}

                    <button
                      type="button"
                      className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() =>
                        void uploadImageToSelectedBlock(selectedBlock.id)
                      }
                    >
                      Browse Image
                    </button>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <div>
                        <div className={inspectorLabelClass()}>
                          Horizontal Position
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={selectedBlock.data.image.positionX ?? 50}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              positionX: Number(e.target.value),
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {selectedBlock.data.image.positionX ?? 50}%
                        </div>
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>
                          Vertical Position
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={selectedBlock.data.image.positionY ?? 50}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              positionY: Number(e.target.value),
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {selectedBlock.data.image.positionY ?? 50}%
                        </div>
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Zoom</div>
                        <input
                          type="range"
                          min={50}
                          max={300}
                          value={Math.round(
                            (selectedBlock.data.image.zoom ?? 1) * 100,
                          )}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              zoom: Number(e.target.value) / 100,
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {Math.round((selectedBlock.data.image.zoom ?? 1) * 100)}%
                        </div>
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Rotation</div>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          value={selectedBlock.data.image.rotation ?? 0}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              rotation: Number(e.target.value) || 0,
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {selectedBlock.data.image.rotation ?? 0}°
                        </div>
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Opacity</div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(
                            (selectedBlock.data.image.opacity ?? 1) * 100,
                          )}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              opacity: Number(e.target.value) / 100,
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {Math.round((selectedBlock.data.image.opacity ?? 1) * 100)}%
                        </div>
                      </div>
                    </div>

<div className="mt-5">
  <div className={inspectorLabelClass()}>Shadow</div>

  <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
    <input
      type="checkbox"
      checked={Boolean((selectedBlock.data as any).imageShadow?.enabled)}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "image"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  imageShadow: {
                    ...((block.data as any).imageShadow ?? {}),
                    enabled: e.target.checked,
                    color: (block.data as any).imageShadow?.color ?? "#000000",
                    blur: (block.data as any).imageShadow?.blur ?? 15,
                    offsetX: (block.data as any).imageShadow?.offsetX ?? 0,
                    offsetY: (block.data as any).imageShadow?.offsetY ?? 0,
                  },
                } as any,
              },
        )
      }
    />
    Enable Shadow
  </label>

  <div className="mt-4 grid grid-cols-1 gap-3">
    <div>
      <div className={inspectorLabelClass()}>Shadow Color</div>
      <input
        type="color"
        value={(selectedBlock.data as any).imageShadow?.color ?? "#000000"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "image"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageShadow: {
                      ...((block.data as any).imageShadow ?? {}),
                      enabled: true,
                      color: e.target.value,
                    },
                  } as any,
                },
          )
        }
        className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
      />
    </div>

    <div>
                  <div className="flex items-center justify-between">
              <div className={inspectorLabelClass()}>Blur</div>
              <div className="text-xs text-neutral-500">
                {Math.round((((selectedBlock.data as any).imageShadow?.blur ?? 15) / 60) * 100)}%
              </div>
            </div>
      <input
        type="range"
        min={0}
        max={60}
        value={(selectedBlock.data as any).imageShadow?.blur ?? 15}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "image"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageShadow: {
                      ...((block.data as any).imageShadow ?? {}),
                      enabled: true,
                      blur: Number(e.target.value),
                    },
                  } as any,
                },
          )
        }
        className="mt-2 w-full"
      />
    </div>

<div>
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Offset X</div>
    <div className="text-xs text-neutral-500">
      {Math.round(((((selectedBlock.data as any).imageShadow?.offsetX ?? 0) + 60) / 120) * 100)}%
    </div>
  </div>

  <input
    type="range"
    min={-60}
    max={60}
    value={(selectedBlock.data as any).imageShadow?.offsetX ?? 0}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "image"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                imageShadow: {
                  ...((block.data as any).imageShadow ?? {}),
                  enabled: true,
                  offsetX: Number(e.target.value),
                },
              } as any,
            },
      )
    }
    className="mt-2 w-full"
  />
</div>

<div>
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Offset Y</div>
    <div className="text-xs text-neutral-500">
      {Math.round(((((selectedBlock.data as any).imageShadow?.offsetY ?? 0) + 60) / 120) * 100)}%
    </div>
  </div>

  <input
    type="range"
    min={-60}
    max={60}
    value={(selectedBlock.data as any).imageShadow?.offsetY ?? 0}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "image"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                imageShadow: {
                  ...((block.data as any).imageShadow ?? {}),
                  enabled: true,
                  offsetY: Number(e.target.value),
                },
              } as any,
            },
      )
    }
    className="mt-2 w-full"
  />
</div>
  </div>
</div>

<div className="mt-5">
  <div className={inspectorLabelClass()}>Fade Edges</div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedBlock.data.image.fade?.top)}
                            onChange={(e) =>
                              updateSelectedImageFadePatch({
                                top: e.target.checked,
                              })
                            }
                          />
                          Top
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedBlock.data.image.fade?.bottom)}
                            onChange={(e) =>
                              updateSelectedImageFadePatch({
                                bottom: e.target.checked,
                              })
                            }
                          />
                          Bottom
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedBlock.data.image.fade?.left)}
                            onChange={(e) =>
                              updateSelectedImageFadePatch({
                                left: e.target.checked,
                              })
                            }
                          />
                          Left
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedBlock.data.image.fade?.right)}
                            onChange={(e) =>
                              updateSelectedImageFadePatch({
                                right: e.target.checked,
                              })
                            }
                          />
                          Right
                        </label>
                      </div>

                      <div className="mt-4">
                        <div className={inspectorLabelClass()}>Fade Size</div>
                        <input
                          type="range"
                          min={0}
                          max={50}
                          value={selectedBlock.data.image.fade?.size ?? 15}
                          onChange={(e) =>
                            updateSelectedImageFadePatch({
                              size: Number(e.target.value),
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {selectedBlock.data.image.fade?.size ?? 15}%
                        </div>
                      </div>
                    </div>
    </div>
  );
}