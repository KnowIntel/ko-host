"use client";

import type { Dispatch, SetStateAction } from "react";

/**
 * Link Hub inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "link_hub"
 */
type LinkHubTextTarget = "form" | "label" | "description" | "url";

type LinkHubInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  linkHubTextTarget: LinkHubTextTarget;
  setLinkHubTextTarget: Dispatch<SetStateAction<LinkHubTextTarget>>;

  makeClientId: (prefix: string) => string;
  resolveMediaLogoFromUrl: (url: string) => string;
  uploadBuilderImageFile: (file: File) => Promise<any>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function LinkHubInspector({
  selectedBlock,
  updateSelectedBlock,
  linkHubTextTarget,
  setLinkHubTextTarget,
  makeClientId,
  resolveMediaLogoFromUrl,
  uploadBuilderImageFile,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: LinkHubInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Link Hub */}
    <div className={inspectorLabelClass()}>Link Hub</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Text Target</div>
      <select
        value={linkHubTextTarget}
        onChange={(e) =>
          setLinkHubTextTarget(
            e.target.value as "form" | "label" | "description" | "url",
          )
        }
        className={inspectorInputClass()}
      >
        <option value="form">Form</option>
        <option value="label">Link Label</option>
        <option value="description">Link Description</option>
        <option value="url">Link URL</option>
      </select>
    </div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Image Placement</div>
  <select
    value={(selectedBlock.data as any).imagePlacement ?? "floatLeft"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "link_hub"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                imagePlacement: e.target.value as any,
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="flushLeft">Flush Left</option>
    <option value="floatLeft">Float Left</option>
    <option value="flushRight">Flush Right</option>
    <option value="floatRight">Float Right</option>
  </select>
</div>

{["floatLeft", "floatRight", "flushLeft", "flushRight"].includes(
  (selectedBlock.data as any).imagePlacement ?? "floatLeft",
) ? (
  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
    <div className="mb-1 flex items-center justify-between">
      <div className={inspectorLabelClass()}>Image Width</div>
      <div className="text-xs text-neutral-500">
        {(selectedBlock.data as any).imageWidth ?? 40}px
      </div>
    </div>

    <input
      type="range"
      min={24}
      max={260}
      value={(selectedBlock.data as any).imageWidth ?? 40}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "link_hub"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  imageWidth: Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    {["floatLeft", "floatRight"].includes(
      (selectedBlock.data as any).imagePlacement ?? "floatLeft",
    ) ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>Image Frame</div>

        <select
          value={(selectedBlock.data as any).imageFrame ?? "circle"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "link_hub"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      imageFrame: e.target.value as "circle" | "square",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="circle">Circle</option>
          <option value="square">Square</option>
        </select>
      </div>
    ) : null}
  </div>
) : null}

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Card Padding</div>

  <div className="mt-3">
    <div className="mb-1 flex items-center justify-between">
      <div className={inspectorLabelClass()}>Horizontal Padding</div>
      <div className="text-xs text-neutral-500">
        {(selectedBlock.data as any).cardPaddingX ?? 16}px
      </div>
    </div>

    <input
      type="range"
      min={0}
      max={80}
      value={(selectedBlock.data as any).cardPaddingX ?? 16}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "link_hub"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  cardPaddingX: Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />
  </div>

  <div className="mt-4">
    <div className="mb-1 flex items-center justify-between">
      <div className={inspectorLabelClass()}>Vertical Padding</div>
      <div className="text-xs text-neutral-500">
        {(selectedBlock.data as any).cardPaddingY ?? 12}px
      </div>
    </div>

    <input
      type="range"
      min={0}
      max={80}
      value={(selectedBlock.data as any).cardPaddingY ?? 12}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "link_hub"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  cardPaddingY: Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />
  </div>

  <div className="mt-4">
    <div className="mb-1 flex items-center justify-between">
      <div className={inspectorLabelClass()}>Padding Between Cards</div>
      <div className="text-xs text-neutral-500">
        {(selectedBlock.data as any).cardGap ?? 12}px
      </div>
    </div>

    <input
      type="range"
      min={0}
      max={80}
      value={(selectedBlock.data as any).cardGap ?? 12}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "link_hub"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  cardGap: Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />
  </div>
</div>

    {["floatLeft", "flushLeft"].includes(
      (selectedBlock.data as any).imagePlacement ?? "floatLeft",
    ) ? (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
          <input
            type="checkbox"
            checked={Boolean((selectedBlock.data as any).customTriggerEnabled)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "link_hub"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        customTriggerEnabled: e.target.checked,
                      },
                    },
              )
            }
          />
          Choose Custom Trigger Symbol
        </label>

{(selectedBlock.data as any).customTriggerEnabled ? (
  <div className="mt-3">
    <div className={inspectorLabelClass()}>Custom Trigger Symbol</div>

    <div className="mt-2 flex items-center gap-3">
      <label className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
        Choose File

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const uploaded = await uploadBuilderImageFile(file);

            updateSelectedBlock((block: any) =>
              block.type !== "link_hub"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      customTriggerUrl: uploaded.url,
                      customTriggerFileName: file.name,
                    },
                  },
            );
          }}
        />
      </label>

      <div className="min-w-0 flex-1 truncate rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500">
        {(selectedBlock.data as any).customTriggerFileName || "No file chosen"}
      </div>
    </div>
    <div className="mt-4">
  <div className="mb-1 flex items-center justify-between">
    <div className={inspectorLabelClass()}>
      Trigger Symbol Size
    </div>

    <div className="text-xs text-neutral-500">
      {(selectedBlock.data as any).triggerSymbolSize ?? 40}px
    </div>
  </div>

  <input
    type="range"
    min={16}
    max={160}
    value={(selectedBlock.data as any).triggerSymbolSize ?? 40}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "link_hub"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                triggerSymbolSize: Number(e.target.value),
              },
            },
      )
    }
    className="w-full"
  />
</div>
  </div>
) : (
<div className="mt-3">
  <div className={inspectorLabelClass()}>Trigger Symbol</div>

  {(() => {
    const triggerOptions = [
      {
        label: "Thin Chevron",
        base: "trigger_symbol_thin_chevron",
      },
      {
        label: "Bold Chevron",
        base: "trigger_symbol_bold_chevron",
      },
      {
        label: "Triple Chevron",
        base: "trigger_symbol_triple_chevron",
      },
      {
        label: "Right Arrow",
        base: "trigger_symbol_right_arrow",
      },
      {
        label: "Solid Arrowhead",
        base: "trigger_symbol_solid_arrowhead",
      },
      {
        label: "Open Arrowhead",
        base: "trigger_symbol_open_arrowhead",
      },
      {
        label: "Play Triangle",
        base: "trigger_symbol_play_triangle",
      },
      {
        label: "External Link",
        base: "trigger_symbol_external_link",
      },
    ];

    const triggerColors = [
      { label: "Black", value: "black", swatch: "#000000" },
      { label: "White", value: "white", swatch: "#ffffff" },
      { label: "Blue", value: "blue", swatch: "#2563eb" },
      { label: "Red", value: "red", swatch: "#dc2626" },
      { label: "Gray", value: "gray", swatch: "#6b7280" },
      { label: "Green", value: "green", swatch: "#16a34a" },
    ];

    const selectedTriggerSymbol =
      (selectedBlock.data as any).triggerSymbol ??
      "/icons/trigger_symbol_thin_chevron_black.png";

    const selectedFileName =
      selectedTriggerSymbol.split("/").pop()?.replace(".png", "") ??
      "trigger_symbol_thin_chevron_black";

    const selectedColor =
      (selectedBlock.data as any).triggerSymbolColor ??
      triggerColors.find((color: any) =>
        selectedFileName.endsWith(`_${color.value}`),
      )?.value ??
      "black";

    const selectedBase =
      triggerOptions.find((option: any) =>
        selectedFileName.startsWith(option.base),
      )?.base ?? "trigger_symbol_thin_chevron";

    const buildTriggerPath = (base: string, color: string) =>
      `/icons/${base}_${color}.png`;

    return (
      <>
        <select
          value={selectedBase}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "link_hub"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      triggerSymbol: buildTriggerPath(
                        e.target.value,
                        selectedColor,
                      ),
                      triggerSymbolBase: e.target.value,
                      triggerSymbolColor: selectedColor,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          {triggerOptions.map((option: any) => (
            <option key={option.base} value={option.base}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="mt-3 flex items-center justify-between gap-2">
          {triggerColors.map((color: any) => {
            const isSelected = selectedColor === color.value;

            return (
              <button
                key={color.value}
                type="button"
                title={color.label}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "link_hub"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            triggerSymbol: buildTriggerPath(
                              selectedBase,
                              color.value,
                            ),
                            triggerSymbolBase: selectedBase,
                            triggerSymbolColor: color.value,
                          },
                        },
                  )
                }
                className={[
                  "h-7 w-7 rounded border transition",
                  isSelected
                    ? "border-neutral-950 ring-2 ring-neutral-950/20"
                    : "border-neutral-400 hover:scale-105",
                ].join(" ")}
                style={{ backgroundColor: color.swatch }}
              />
            );
          })}
        </div>
      </>
    );
  })()}
</div>
        )}
      </div>
    ) : null}

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <label className="flex items-center justify-between gap-3">
        <div className={inspectorLabelClass()}>Add Shadow</div>
        <input
          type="checkbox"
          checked={Boolean((selectedBlock.data as any).cardShadowEnabled)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "link_hub"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      cardShadowEnabled: e.target.checked,
                    },
                  },
            )
          }
        />
      </label>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <div className={inspectorLabelClass()}>Blur</div>
          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).cardShadowBlur ?? 0}px
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={(selectedBlock.data as any).cardShadowBlur ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "link_hub"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      cardShadowBlur: Number(e.target.value),
                    },
                  },
            )
          }
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Shadow Color</div>
        <input
          type="color"
          value={(selectedBlock.data as any).cardShadowColor ?? "#000000"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "link_hub"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      cardShadowColor: e.target.value,
                    },
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className={inspectorLabelClass()}>Offset X</div>
          <input
            type="number"
            value={(selectedBlock.data as any).cardShadowX ?? 0}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "link_hub"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cardShadowX: Number(e.target.value),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Offset Y</div>
          <input
            type="number"
            value={(selectedBlock.data as any).cardShadowY ?? 0}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "link_hub"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        cardShadowY: Number(e.target.value),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "link_hub"
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

    <div className="mt-4 space-y-3">
      {selectedBlock.data.items.map((rawItem: any) => {
        const item = rawItem as any & {
          description?: string;
          logoUrl?: string;
          autoGenerateLogo?: boolean;
        };

        const autoGenerateLogo = item.autoGenerateLogo ?? true;
        const logoPreviewUrl =
          item.logoUrl ||
          (autoGenerateLogo ? resolveMediaLogoFromUrl(item.url ?? "") : "");

        return (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="flex items-start gap-3">
              <span className="mt-5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-white text-[10px] text-neutral-400">
                {logoPreviewUrl ? (
                  <img src={logoPreviewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  "Logo"
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className={inspectorLabelClass()}>Label</div>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "link_hub"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              items: block.data.items.map((entry: any) =>
                                entry.id === item.id
                                  ? { ...entry, label: e.target.value }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />

                <div className="mt-4">
                  <div className={inspectorLabelClass()}>Description</div>
                  <input
                    type="text"
                    value={(item as any).description ?? ""}
                    onChange={(e) =>
                      updateSelectedBlock((block: any) =>
                        block.type !== "link_hub"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                items: block.data.items.map((entry: any) =>
                                  entry.id === item.id
                                    ? { ...entry, description: e.target.value }
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
  <div className="mb-2 flex items-center justify-between gap-3">
    <div className={inspectorLabelClass()}>URL</div>

    <label className="flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={Boolean((item as any).showUrl)}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "link_hub"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: block.data.items.map((entry: any) =>
                      entry.id === item.id
                        ? { ...entry, showUrl: e.target.checked }
                        : entry,
                    ),
                  },
                },
          )
        }
      />
      Show URL
    </label>
  </div>

  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => {
                      const nextUrl = e.target.value;

                      updateSelectedBlock((block: any) =>
                        block.type !== "link_hub"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                items: block.data.items.map((entry: any) => {
                                  if (entry.id !== item.id) return entry;

                                  const shouldAutoGenerate =
                                    (entry as any as { autoGenerateLogo?: boolean }).autoGenerateLogo ?? true;

                                  return {
                                    ...entry,
                                    url: nextUrl,
                                    logoUrl: shouldAutoGenerate
                                      ? resolveMediaLogoFromUrl(nextUrl)
                                      : (entry as any).logoUrl,
                                  };
                                }),
                              },
                            },
                      );
                    }}
                    className={inspectorInputClass()}
                  />
                </div>
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={autoGenerateLogo}
                onChange={(e) => {
                  const checked = e.target.checked;

                  updateSelectedBlock((block: any) =>
                    block.type !== "link_hub"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: block.data.items.map((entry: any) =>
                              entry.id === item.id
                                ? {
                                    ...entry,
                                    autoGenerateLogo: checked,
                                    logoUrl: checked
                                      ? resolveMediaLogoFromUrl(entry.url)
                                      : (entry as any).logoUrl,
                                  }
                                : entry,
                            ),
                          },
                        },
                  );
                }}
              />
              Auto-Generate Logo
            </label>

{!autoGenerateLogo ? (
  <div className="mt-3">
    <div className={inspectorLabelClass()}>Custom Logo</div>

    <div className="mt-2 flex items-center gap-3">
      <label className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
        Choose File
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const uploaded = await uploadBuilderImageFile(file);

            updateSelectedBlock((block: any) =>
              block.type !== "link_hub"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      items: block.data.items.map((entry: any) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              logoUrl: uploaded.url,
                              logoFileName: file.name,
                              autoGenerateLogo: false,
                            }
                          : entry,
                      ),
                    },
                  },
            );
          }}
        />
      </label>

      <div className="min-w-0 flex-1 truncate rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500">
        {(item as any).logoFileName || "No file chosen"}
      </div>
    </div>
  </div>
) : null}

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "link_hub"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: [
                              ...block.data.items,
                              {
                                ...item,
                                id: makeClientId("link"),
                                logoUrl: logoPreviewUrl,
                                autoGenerateLogo,
                              },
                            ],
                          },
                        },
                  )
                }
                title="Duplicate link"
              >
                Duplicate
              </button>

              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "link_hub"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items:
                              block.data.items.length > 1
                                ? block.data.items.filter((entry: any) => entry.id !== item.id)
                                : block.data.items,
                          },
                        },
                  )
                }
                title="Remove link"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block: any) =>
            block.type !== "link_hub"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: [
                      ...block.data.items,
                      {
                        id: makeClientId("link"),
                        label: "New Link",
                        description: "",
                        url: "#",
                        logoUrl: resolveMediaLogoFromUrl("#"),
                        autoGenerateLogo: true,
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Link
      </button>
    </div>
    </div>
  );
}