"use client";

import type { Dispatch, SetStateAction } from "react";

export const FORM_FIELD_CONFIG_EVENT = "form-field-config";

export type FormFieldConfigEventDetail = {
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
 * Form Field inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor should remain the middleman and only render this when:
 * selectedBlock?.type === "form_field"
 */
type FormFieldTextTarget = "form" | "text";

type FormFieldInspectorSectionProps = {
  selectedBlock: any;
  setDraft: any;
  updateSelectedBlock: any;

  formFieldTextTarget: FormFieldTextTarget;
  setFormFieldTextTarget: Dispatch<SetStateAction<FormFieldTextTarget>>;

  ctaButtonOptions: { id: string; label: string }[];

  updateFormField: any;
  updateFormFieldRequired: any;

  FORM_FIELD_CONFIG_EVENT: string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function FormFieldInspector({
  selectedBlock,
  setDraft,
  updateSelectedBlock,
  formFieldTextTarget,
  setFormFieldTextTarget,
  ctaButtonOptions,
  updateFormField,
  updateFormFieldRequired,
  FORM_FIELD_CONFIG_EVENT,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: FormFieldInspectorSectionProps) {
  return (
    <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Form Field</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Text Target</div>

      <select
        value={formFieldTextTarget}
        onChange={(e) =>
          setFormFieldTextTarget(e.target.value as "form" | "text")
        }
        className={inspectorInputClass()}
      >
        <option value="form">Form</option>
        <option value="text">Text</option>
      </select>
    </div>
    
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Field Type</div>
      <select
        value={selectedBlock.data.fieldType}
        onChange={(e) =>
          setDraft((prev: any) => ({
            ...prev,
            blocks: updateFormField(
              prev.blocks,
              selectedBlock.id,
              "fieldType",
              e.target.value,
            ),
          }))
        }
        className={inspectorInputClass()}
      >
<option value="text">Text</option>
<option value="email">Email</option>
<option value="phone">Phone</option>
<option value="textarea">Textarea</option>
<option value="state">State</option>
<option value="date">Date</option>
<option value="checkbox_text">Checkbox</option>
      </select>
    </div>

    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className={inspectorLabelClass()}>Label</div>
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={selectedBlock.data.showLabel !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "form_field"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showLabel: e.target.checked,
                      },
                    },
              )
            }
          />
          Show
        </label>
      </div>

      <input
        type="text"
        value={selectedBlock.data.label}
        onChange={(e) =>
          setDraft((prev: any) => ({
            ...prev,
            blocks: updateFormField(
              prev.blocks,
              selectedBlock.id,
              "label",
              e.target.value,
            ),
          }))
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className={inspectorLabelClass()}>
          {selectedBlock.data.fieldType === "checkbox_text"
            ? "Checkbox Label Text"
            : "Placeholder"}
        </div>

        {selectedBlock.data.fieldType !== "checkbox_text" ? (
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={selectedBlock.data.showPlaceholder !== false}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "form_field"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showPlaceholder: e.target.checked,
                        },
                      },
                )
              }
            />
            Show
          </label>
        ) : null}
      </div>

      <input
        type="text"
        value={selectedBlock.data.placeholder}
        onChange={(e) =>
          setDraft((prev: any) => ({
            ...prev,
            blocks: updateFormField(
              prev.blocks,
              selectedBlock.id,
              "placeholder",
              e.target.value,
            ),
          }))
        }
        className={inspectorInputClass()}
      />
    </div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Placeholder Text Color</div>

  <input
    type="color"
    value={
      ((selectedBlock.data as any).placeholderStyle?.color as string) ??
      "#bababa"
    }
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "form_field"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                placeholderStyle: {
                  ...((block.data as any).placeholderStyle ?? {}),
                  color: e.target.value,
                },
              },
            },
      )
    }
    className="mt-3 h-10 w-full rounded-xl border border-neutral-300 bg-white"
  />

  <div className="mt-5 flex items-center justify-between">
    <div className={inspectorLabelClass()}>Field Border</div>

    <label className="flex items-center gap-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={(selectedBlock.data as any).fieldBorderEnabled !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "form_field"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    fieldBorderEnabled: e.target.checked,
                  },
                },
          )
        }
      />
      Enable
    </label>
  </div>

  <input
    type="color"
    value={
      ((selectedBlock.data as any).fieldBorderColor as string) ?? "#d4d4d4"
    }
    disabled={(selectedBlock.data as any).fieldBorderEnabled === false}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "form_field"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                fieldBorderColor: e.target.value,
              },
            },
      )
    }
    className="mt-3 h-10 w-full rounded-xl border border-neutral-300 bg-white disabled:opacity-50"
  />
</div>

{(selectedBlock.data as any).fieldType === "date" ? (
  <div className="mt-4">
    <div className={inspectorLabelClass()}>Date Format</div>

<select
  value={(selectedBlock.data as any).dateFormat ?? "mm-dd-yyyy"}
  onChange={(e) => {
    const nextDateFormat = e.target.value as
      | "yyyy-dd-mm"
      | "yyyy-mm-dd"
      | "mm-dd-yyyy"
      | "m-d-yy"
      | "m-d-yyyy"
      | "mmmm-d-yyyy";

    const formBlockId = selectedBlock.id;

    updateSelectedBlock((block: any) =>
      block.type !== "form_field"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              dateFormat: nextDateFormat,
            },
          },
    );

    setDraft((prev: any) => ({
      ...prev,
      blocks: prev.blocks.map((block: any) => {
        if (block.id === formBlockId && block.type === "form_field") {
          return {
            ...block,
            data: {
              ...block.data,
              dateFormat: nextDateFormat,
            },
          };
        }

        return block;
      }),
    }));

    window.dispatchEvent(
      new CustomEvent<FormFieldConfigEventDetail>(
        FORM_FIELD_CONFIG_EVENT,
        {
          detail: {
            blockId: formBlockId,
            dateFormat: nextDateFormat,
          },
        },
      ),
    );
  }}
  className={inspectorInputClass()}
>
  <option value="yyyy-dd-mm">
    YYYY-DD-MM (1993-24-05)
  </option>

  <option value="yyyy-mm-dd">
    YYYY-MM-DD (1993-05-24)
  </option>

  <option value="mm-dd-yyyy">
    MM-DD-YYYY (05-24-1993)
  </option>

  <option value="m-d-yy">
    M-D-YY (5-24-93)
  </option>

  <option value="m-d-yyyy">
    M-D-YYYY (5-24-1993)
  </option>

  <option value="mmmm-d-yyyy">
    MMMM D, YYYY (May 24, 1993)
  </option>
</select>
  </div>
) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Linked Submit Button</div>

      <select
        value={(selectedBlock.data as any).linkedButtonId ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "form_field"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    linkedButtonId: e.target.value || undefined,
                  },
                },
          )
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
        When this button is pressed, this field will be included in the combined general submission.
      </p>
    </div>

    {selectedBlock.data.fieldType === "checkbox_text" ? (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
          <input
            type="checkbox"
            checked={Boolean((selectedBlock.data as any).allowMultipleSelections)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "form_field"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        allowMultipleSelections: e.target.checked,
                      },
                    },
              )
            }
          />
          Allow Multiple Selections
        </label>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          When off, only one checkbox connected to the same submit button should be selected.
        </p>
      </div>
    ) : null}

    {formFieldTextTarget === "text" ? (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>Text Area Padding</div>

        {[
          ["paddingTop", "Top Padding"],
          ["paddingLeft", "Left Padding"],
          ["paddingRight", "Right Padding"],
          ["paddingBottom", "Bottom Padding"],
        ].map(([key, label]) => (
          <div key={key} className="mt-4">
            <div className="flex items-center justify-between">
              <div className={inspectorLabelClass()}>{label}</div>
              <div className="text-xs text-neutral-500">
                {Number(((selectedBlock.data as any).inputStyle ?? {})[key] ?? 12)}px
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={160}
              value={Number(((selectedBlock.data as any).inputStyle ?? {})[key] ?? 12)}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "form_field"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          inputStyle: {
                            ...((block.data as any).inputStyle ??
                              block.data.style ??
                              {}),
                            [key]: Number(e.target.value),
                          },
                        },
                      },
                )
              }
              className="mt-2 w-full"
            />
          </div>
        ))}
      </div>
    ) : null}

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean((selectedBlock.data as any).showRating)}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "form_field"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showRating: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Rating
      </label>

      {(selectedBlock.data as any).showRating ? (
        <div className="mt-4 grid grid-cols-1 gap-3">
          <div>
            <div className={inspectorLabelClass()}>Star Color</div>
            <input
              type="color"
              value={(selectedBlock.data as any).ratingColor ?? "#F59E0B"}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "form_field"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          ratingColor: e.target.value,
                        },
                      },
                )
              }
              className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
            />
          </div>

          <div>
            <div className={inspectorLabelClass()}>Rating Position</div>
            <select
              value={(selectedBlock.data as any).ratingPosition ?? "high"}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "form_field"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          ratingPosition: e.target.value as "high" | "low",
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            >
              <option value="high">High Level</option>
              <option value="low">Low Level</option>
            </select>
          </div>
        </div>
      ) : null}
    </div>

    <div className="mt-4">
      <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <span className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={Boolean(selectedBlock.data.required)}
            onChange={(e) =>
              setDraft((prev: any) => ({
                ...prev,
                blocks: updateFormFieldRequired(
                  prev.blocks,
                  selectedBlock.id,
                  e.target.checked,
                ),
              }))
            }
          />
          Required field
        </span>

        <span className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={selectedBlock.data.showRequired !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "form_field"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showRequired: e.target.checked,
                      },
                    },
              )
            }
          />
          Show
        </span>
      </label>
    </div>
  </div>
  );
}