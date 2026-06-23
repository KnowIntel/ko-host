"use client";

import type { Dispatch, SetStateAction } from "react";


type FormFieldConfigEventDetail = {
  blockId: string;
  dateFormat:
    | "yyyy-dd-mm"
    | "yyyy-mm-dd"
    | "mm-dd-yyyy"
    | "m-d-yy"
    | "m-d-yyyy"
    | "mmmm-d-yyyy";
};

/**
 * Option Button inspector section
 * Extracted from DesignLayoutEditor.
 *
 * Important:
 * - This component should NOT decide whether selectedBlock is option_button.
 * - DesignLayoutEditor remains the middleman and only renders this component
 *   when selectedBlock?.type === "option_button".
 */

type OptionButtonTextTarget = "heading" | "label" | "description";

type OptionButtonInspectorSectionProps = {
  selectedBlock: any;
  draft: any;

  optionButtonTextTarget: OptionButtonTextTarget;
  setOptionButtonTextTarget: Dispatch<SetStateAction<OptionButtonTextTarget>>;

  selectedOptionButtonOptionId: string | null;
  setSelectedOptionButtonOptionId: Dispatch<SetStateAction<string | null>>;

  ctaButtonOptions: { id: string; label: string }[];

  updateSelectedOptionButtonData: (patch: Record<string, any>) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;

  openImagePicker: (options: any) => void;
  uploadBuilderImageFile: (file: File) => Promise<any>;
};

export function OptionButtonInspector({
  selectedBlock,
  draft,
  optionButtonTextTarget,
  setOptionButtonTextTarget,
  selectedOptionButtonOptionId,
  setSelectedOptionButtonOptionId,
  ctaButtonOptions,
  updateSelectedOptionButtonData,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
  openImagePicker,
  uploadBuilderImageFile,
}: OptionButtonInspectorSectionProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Option Button */}
    <div className={inspectorLabelClass()}>Option Button</div>

    <div className="mt-4">
  <div className={inspectorLabelClass()}>Text Target</div>
  <select
    value={optionButtonTextTarget}
    onChange={(e) =>
      setOptionButtonTextTarget(
        e.target.value as "heading" | "label" | "description",
      )
    }
    className={inspectorInputClass()}
  >
    <option value="heading">Heading</option>
    <option value="label">Option Label</option>
    <option value="description">Option Description</option>
  </select>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Variant</div>
      <select
        value={(selectedBlock.data as any).variant ?? "push_button"}
        onChange={(e) =>
          updateSelectedOptionButtonData({ variant: e.target.value })
        }
        className={inspectorInputClass()}
      >
        <option value="push_button">Push Button</option>
        <option value="radio">Radio Button</option>
        <option value="toggle">Toggle Switch</option>
        <option value="dropdown">Drop-Down Menu</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={(selectedBlock.data as any).heading ?? ""}
        onChange={(e) =>
          updateSelectedOptionButtonData({ heading: e.target.value })
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={(selectedBlock.data as any).showHeading !== false}
          onChange={(e) =>
            updateSelectedOptionButtonData({ showHeading: e.target.checked })
          }
        />
        Show Heading
      </label>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <input
        type="text"
        value={(selectedBlock.data as any).subtitle ?? ""}
        onChange={(e) =>
          updateSelectedOptionButtonData({ subtitle: e.target.value })
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean((selectedBlock.data as any).showSubtitle)}
          onChange={(e) =>
            updateSelectedOptionButtonData({ showSubtitle: e.target.checked })
          }
        />
        Show Subtitle
      </label>
    </div>

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean((selectedBlock.data as any).allowMultiSelect)}
          onChange={(e) =>
            updateSelectedOptionButtonData({
              allowMultiSelect: e.target.checked,
            })
          }
        />
        Allow Multi-select
      </label>
    </div>

    <div className="mt-4">
  <div className={inspectorLabelClass()}>Linked Submit Button</div>

  <select
    value={(selectedBlock.data as any).linkedButtonId ?? ""}
    onChange={(e) =>
      updateSelectedOptionButtonData({
        linkedButtonId: e.target.value || undefined,
        linkedButtonBlockId: e.target.value || undefined,
      })
    }
    className={inspectorInputClass()}
  >
    <option value="">No linked button</option>

    {ctaButtonOptions.map((button) => (
      <option key={button.id} value={button.id}>
        {button.label}
      </option>
    ))}
  </select>

  <p className="mt-2 text-xs leading-5 text-neutral-500">
    When this button is pressed, this option selection will be included in the combined general submission.
  </p>
</div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Linked Summary Block</div>

  <select
    value={(selectedBlock.data as any).linkedSummaryBlockId ?? ""}
    onChange={(e) =>
      updateSelectedOptionButtonData({
        linkedSummaryBlockId: e.target.value || undefined,
      })
    }
    className={inspectorInputClass()}
  >
    <option value="">No linked summary</option>

{draft.blocks
  .filter((block: any) => block.type === "summary")
  .map((summaryBlock: any) => (
        <option key={summaryBlock.id} value={summaryBlock.id}>
          {summaryBlock.label || "Summary"}
        </option>
      ))}
  </select>

  <p className="mt-2 text-xs leading-5 text-neutral-500">
    Links this Option Button to a Summary block for review display.
  </p>
</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Linked Cart Block</div>

  <select
    value={(selectedBlock.data as any).linkedCartBlockId ?? ""}
    onChange={(e) =>
      updateSelectedOptionButtonData({
        linkedCartBlockId: e.target.value || undefined,
      })
    }
    className={inspectorInputClass()}
  >
    <option value="">No linked cart</option>

{draft.blocks
  .filter((block: any) => block.type === "cart")
  .map((cartBlock: any) => (
        <option key={cartBlock.id} value={cartBlock.id}>
          {cartBlock.label || "Cart"}
        </option>
      ))}
  </select>

  <p className="mt-2 text-xs leading-5 text-neutral-500">
    Links this Option Button to a Cart block for future checkout flow.
  </p>
</div>

    {((selectedBlock.data as any).variant ?? "push_button") === "dropdown" ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>Placeholder</div>
        <input
          type="text"
          value={(selectedBlock.data as any).placeholder ?? "Select"}
          onChange={(e) =>
            updateSelectedOptionButtonData({ placeholder: e.target.value })
          }
          className={inspectorInputClass()}
        />
      </div>
    ) : null}

    {["dropdown", "radio"].includes(
  (selectedBlock.data as any).variant ?? "push_button",
) ? (
  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
    <div className={inspectorLabelClass()}>Placeholder Text Color</div>

    <input
      type="color"
      value={
        ((selectedBlock.data as any).placeholderStyle?.color as string) ??
        "#bababa"
      }
      onChange={(e) =>
        updateSelectedOptionButtonData({
          placeholderStyle: {
            ...((selectedBlock.data as any).placeholderStyle ?? {}),
            color: e.target.value,
          },
        })
      }
      className="mt-3 h-10 w-full rounded-xl border border-neutral-300 bg-white"
    />

    {((selectedBlock.data as any).variant ?? "push_button") === "dropdown" ? (
      <>
        <div className="mt-5 flex items-center justify-between">
          <div className={inspectorLabelClass()}>Field Border</div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).fieldBorderEnabled !== false}
              onChange={(e) =>
                updateSelectedOptionButtonData({
                  fieldBorderEnabled: e.target.checked,
                })
              }
            />
            Enable
          </label>
        </div>

        <input
          type="color"
          value={
            ((selectedBlock.data as any).fieldBorderColor as string) ??
            "#d4d4d4"
          }
          disabled={(selectedBlock.data as any).fieldBorderEnabled === false}
          onChange={(e) =>
            updateSelectedOptionButtonData({
              fieldBorderColor: e.target.value,
            })
          }
          className="mt-3 h-10 w-full rounded-xl border border-neutral-300 bg-white disabled:opacity-50"
        />
      </>
    ) : null}
  </div>
) : null}

    {["radio", "toggle"].includes(
      (selectedBlock.data as any).variant ?? "push_button",
    ) ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label Position</div>
        <select
          value={(selectedBlock.data as any).labelPosition ?? "right"}
          onChange={(e) =>
            updateSelectedOptionButtonData({ labelPosition: e.target.value })
          }
          className={inspectorInputClass()}
        >
          <option value="right">Right of control</option>
          <option value="left">Left of control</option>
        </select>
      </div>
    ) : null}

    {((selectedBlock.data as any).variant ?? "push_button") ===
    "push_button" ? (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>Push Button Settings</div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Frame</div>
          <select
            value={(selectedBlock.data as any).pushButtonFrame ?? "square"}
            onChange={(e) =>
              updateSelectedOptionButtonData({
                pushButtonFrame: e.target.value,
              })
            }
            className={inspectorInputClass()}
          >
            <option value="square">Square</option>
            <option value="circle">Circle</option>
          </select>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Layout</div>
          <select
            value={(selectedBlock.data as any).pushButtonLayout ?? "grid"}
            onChange={(e) =>
              updateSelectedOptionButtonData({
                pushButtonLayout: e.target.value,
              })
            }
            className={inspectorInputClass()}
          >
            <option value="grid">Grid</option>
            <option value="horizontal_scroll">Horizontal Scroll</option>
            <option value="vertical_stack">Vertical Stack</option>
          </select>
        </div>

{((selectedBlock.data as any).pushButtonLayout ?? "grid") === "grid" ? (
  <div className="mt-4">
    <div className={inspectorLabelClass()}>Tiles Per Row</div>

    <input
      type="number"
      min={1}
      max={8}
      value={Number((selectedBlock.data as any).pushButtonColumns ?? 2)}
      onChange={(e) =>
        updateSelectedOptionButtonData({
          pushButtonColumns: Math.max(
            1,
            Math.min(8, Number(e.target.value) || 1),
          ),
        })
      }
      className={inspectorInputClass()}
    />

    <p className="mt-2 text-xs leading-5 text-neutral-500">
      Controls how many push button tiles appear on each row when Layout is Grid.
    </p>
  </div>
) : null}

        {[
          ["horizontalPadding", "Horizontal Padding"],
          ["verticalPadding", "Vertical Padding"],
          ["optionGap", "Spacing Between Buttons"],
        ].map(([key, label]) => (
          <div key={key} className="mt-4">
            <div className="flex items-center justify-between">
              <div className={inspectorLabelClass()}>{label}</div>
              <div className="text-xs text-neutral-500">
                {Number((selectedBlock.data as any)[key] ?? 16)}px
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={64}
              value={Number((selectedBlock.data as any)[key] ?? 16)}
              onChange={(e) =>
                updateSelectedOptionButtonData({
                  [key]: Number(e.target.value),
                })
              }
              className="mt-2 w-full"
            />
          </div>
        ))}

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showCheckmark !== false}
              onChange={(e) =>
                updateSelectedOptionButtonData({
                  showCheckmark: e.target.checked,
                })
              }
            />
            Show Checkmark
          </label>

          <label className="flex items-center gap-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showOptionImages !== false}
              onChange={(e) =>
                updateSelectedOptionButtonData({
                  showOptionImages: e.target.checked,
                })
              }
            />
            Show Images
          </label>

          <label className="flex items-center gap-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={
                (selectedBlock.data as any).showOptionDescriptions !== false
              }
              onChange={(e) =>
                updateSelectedOptionButtonData({
                  showOptionDescriptions: e.target.checked,
                })
              }
            />
            Show Descriptions
          </label>
        </div>
      </div>
    ) : null}

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Options</div>

    <button
      type="button"
      onClick={() => {
        const options = [...(((selectedBlock.data as any).options ?? []) as any[])];

        const nextId = `option_${options.length + 1}`;

        updateSelectedOptionButtonData({
          options: [
            ...options,
            {
              id: nextId,
              label: `Option ${options.length + 1}`,
              value: nextId,
            },
          ],
        });

        setSelectedOptionButtonOptionId(nextId);
      }}
      className={toolSetButtonClass("front")}
    >
      Add
    </button>
  </div>

  <div className="mt-3 space-y-2">
    {(((selectedBlock.data as any).options ?? []) as any[]).map(
      (option: any) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setSelectedOptionButtonOptionId(option.id)}
          className={[
            "w-full rounded-xl border px-3 py-3 text-left text-sm transition",
            selectedOptionButtonOptionId === option.id
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-700",
          ].join(" ")}
        >
          {option.label}
        </button>
      ),
    )}
  </div>

  {selectedOptionButtonOptionId ? (
    (() => {
      const options = (((selectedBlock.data as any).options ?? []) as any[]);
      const option = options.find(
        (item: any) => item.id === selectedOptionButtonOptionId,
      );

      if (!option) return null;

      return (
        <div className="mt-4 space-y-4">
          <div>
            <div className={inspectorLabelClass()}>Label</div>

            <input
              type="text"
              value={option.label ?? ""}
              onChange={(e) =>
                updateSelectedOptionButtonData({
                  options: options.map((item: any) =>
                    item.id === option.id
                      ? { ...item, label: e.target.value }
                      : item,
                  ),
                })
              }
              className={inspectorInputClass()}
            />
          </div>

          <div>
            <div className={inspectorLabelClass()}>Value</div>

            <input
              type="text"
              value={option.value ?? ""}
              onChange={(e) =>
                updateSelectedOptionButtonData({
                  options: options.map((item: any) =>
                    item.id === option.id
                      ? { ...item, value: e.target.value }
                      : item,
                  ),
                })
              }
              className={inspectorInputClass()}
            />
          </div>

          {((selectedBlock.data as any).variant ?? "push_button") ===
          "push_button" ? (
            <div>
              <div className={inspectorLabelClass()}>Description</div>

              <textarea
                value={option.description ?? ""}
                onChange={(e) =>
                  updateSelectedOptionButtonData({
                    options: options.map((item: any) =>
                      item.id === option.id
                        ? { ...item, description: e.target.value }
                        : item,
                    ),
                  })
                }
                className={inspectorTextareaClass()}
              />
            </div>
          ) : null}

<div className="rounded-xl border border-neutral-200 bg-white p-3">
  <div className={inspectorLabelClass()}>Price</div>

  <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
    <input
      type="checkbox"
      checked={option.showPrice !== false}
      onChange={(e) =>
        updateSelectedOptionButtonData({
          options: options.map((item: any) =>
            item.id === option.id
              ? { ...item, showPrice: e.target.checked }
              : item,
          ),
        })
      }
    />
    Show Price
  </label>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Price Type</div>
    <select
      value={option.priceMode ?? "fixed"}
      onChange={(e) =>
        updateSelectedOptionButtonData({
          options: options.map((item: any) =>
            item.id === option.id
              ? { ...item, priceMode: e.target.value }
              : item,
          ),
        })
      }
      className={inspectorInputClass()}
    >
      <option value="fixed">Price</option>
      <option value="range">Price Range</option>
    </select>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Price Label</div>
    <input
      type="text"
      value={option.priceLabel ?? "Price"}
      onChange={(e) =>
        updateSelectedOptionButtonData({
          options: options.map((item: any) =>
            item.id === option.id
              ? { ...item, priceLabel: e.target.value }
              : item,
          ),
        })
      }
      className={inspectorInputClass()}
    />
  </div>

  {(option.priceMode ?? "fixed") === "range" ? (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Minimum</div>
        <input
          type="text"
          value={option.priceMin ?? ""}
          onChange={(e) =>
            updateSelectedOptionButtonData({
              options: options.map((item: any) =>
                item.id === option.id
                  ? { ...item, priceMin: e.target.value }
                  : item,
              ),
            })
          }
          placeholder="$0.00"
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Maximum</div>
        <input
          type="text"
          value={option.priceMax ?? ""}
          onChange={(e) =>
            updateSelectedOptionButtonData({
              options: options.map((item: any) =>
                item.id === option.id
                  ? { ...item, priceMax: e.target.value }
                  : item,
              ),
            })
          }
          placeholder="$0.00"
          className={inspectorInputClass()}
        />
      </div>
    </div>
  ) : (
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Price</div>
      <input
        type="text"
        value={option.price ?? ""}
        onChange={(e) =>
          updateSelectedOptionButtonData({
            options: options.map((item: any) =>
              item.id === option.id
                ? { ...item, price: e.target.value }
                : item,
            ),
          })
        }
        placeholder="$0.00"
        className={inspectorInputClass()}
      />
    </div>
  )}
</div>

          <div>
  <div className={inspectorLabelClass()}>Image</div>

  {option.imageUrl ? (
    <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={option.imageUrl}
        alt=""
        className="h-28 w-full object-cover"
      />
    </div>
  ) : null}

  <div className="mt-3 flex gap-2">
    <button
      type="button"
      onClick={() =>
        openImagePicker({
          multiple: false,
          onSelect: async (files: File[]) => {
            const file = files[0];
            if (!file) return;

            const uploaded = await uploadBuilderImageFile(file);

            updateSelectedOptionButtonData({
              options: options.map((item: any) =>
                item.id === option.id
                  ? {
                      ...item,
                      imageUrl: uploaded.url,
                      imageStoragePath:
                        (uploaded as any).path ??
                        (uploaded as any).storagePath ??
                        "",
                    }
                  : item,
              ),
            });
          },
        })
      }
      className={toolSetButtonClass("front")}
    >
      Upload
    </button>

    {option.imageUrl ? (
      <button
        type="button"
        onClick={() =>
          updateSelectedOptionButtonData({
            options: options.map((item: any) =>
              item.id === option.id
                ? {
                    ...item,
                    imageUrl: "",
                    imageStoragePath: "",
                  }
                : item,
            ),
          })
        }
        className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100"
      >
        Remove Image
      </button>
    ) : null}
  </div>
</div>

{option.imageUrl ? (
  <div className="mt-4">
    <div className="flex items-center justify-between">
      <div className={inspectorLabelClass()}>Image Size</div>
      <div className="text-xs text-neutral-500">
        {Number((selectedBlock.data as any).optionImageSize ?? 56)}px
      </div>
    </div>

    <input
      type="range"
      min={24}
      max={160}
      value={Number((selectedBlock.data as any).optionImageSize ?? 56)}
      onChange={(e) =>
        updateSelectedOptionButtonData({
          optionImageSize: Number(e.target.value),
        })
      }
      className="mt-2 w-full"
    />
  </div>
) : null}

          <label className="flex items-center gap-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={Boolean(option.disabled)}
              onChange={(e) =>
                updateSelectedOptionButtonData({
                  options: options.map((item: any) =>
                    item.id === option.id
                      ? { ...item, disabled: e.target.checked }
                      : item,
                  ),
                })
              }
            />
            Disabled
          </label>

          <button
            type="button"
            onClick={() => {
              const nextOptions = options.filter(
                (item: any) => item.id !== option.id,
              );

              updateSelectedOptionButtonData({
                options: nextOptions,
              });

              setSelectedOptionButtonOptionId(
                nextOptions[0]?.id ?? null,
              );
            }}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm text-red-700 hover:bg-red-100"
          >
            Remove Option
          </button>
        </div>
      );
    })()
  ) : null}
</div>


{((selectedBlock.data as any).variant ?? "push_button") === "push_button" ? (
  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
    <div className={inspectorLabelClass()}>Tile Colors</div>

    <div className="mt-4 flex items-center justify-between">
      <div className={inspectorLabelClass()}>General Border Color</div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={
            (selectedBlock.data as any).generalBorderEnabled !== false
          }
          onChange={(e) =>
            updateSelectedOptionButtonData({
              generalBorderEnabled: e.target.checked,
            })
          }
        />
        Enable
      </label>
    </div>

    <input
      type="color"
      value={
        (selectedBlock.data as any).generalBorderColor ?? "#d4d4d4"
      }
      disabled={
        (selectedBlock.data as any).generalBorderEnabled === false
      }
      onChange={(e) =>
        updateSelectedOptionButtonData({
          generalBorderColor: e.target.value,
        })
      }
      className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white disabled:opacity-50"
    />

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Selected Border / Control
      </div>

      <input
        type="color"
        value={
          (selectedBlock.data as any).selectedBorderColor ?? "#f59e0b"
        }
        onChange={(e) =>
          updateSelectedOptionButtonData({
            selectedBorderColor: e.target.value,
            selectedCheckColor: e.target.value,
          })
        }
        className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Checkmark Color</div>

      <input
        type="color"
        value={(selectedBlock.data as any).checkmarkColor ?? "#ffffff"}
        onChange={(e) =>
          updateSelectedOptionButtonData({
            checkmarkColor: e.target.value,
          })
        }
        className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
      />
    </div>
  </div>
) : null}
    </div>
  );
}
