"use client";

/**
 * Donation inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "donation"
 */
type DonationInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;
};

export function DonationInspector({
  selectedBlock,
  updateSelectedBlock,
  makeClientId,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
}: DonationInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Donation */}
    <div className={inspectorLabelClass()}>Donation</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "donation"
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
      <div className={inspectorLabelClass()}>Description</div>
      <textarea
        value={selectedBlock.data.description ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "donation"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    description: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
    <input
      type="checkbox"
      checked={(selectedBlock.data as any).allowCustomAmount ?? true}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "donation"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  allowCustomAmount: e.target.checked,
                },
              },
        )
      }
    />
    Allow custom donation amount
  </label>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Custom Button Label</div>
    <input
      type="text"
      value={(selectedBlock.data as any).customAmountLabel ?? "Custom Amount"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "donation"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  customAmountLabel: e.target.value,
                },
              },
        )
      }
      className={inspectorInputClass()}
      placeholder="Custom Amount"
    />
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Donation Buttons</div>

      <div className="mt-3 space-y-3">
{(Array.isArray(selectedBlock.data.donationOptions)
  ? selectedBlock.data.donationOptions
  : []
).map((option: any, index: number) => (
          <div
            key={option.id || `donation-option-${index}`}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="grid grid-cols-[1fr_140px_auto] items-end gap-3">
              <div>
                <div className={inspectorLabelClass()}>Button Label</div>
                <input
                  type="text"
                  value={option.label ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "donation"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
donationOptions: (
  Array.isArray(block.data.donationOptions)
    ? block.data.donationOptions
    : []
).map((item: any) =>
                                item.id !== option.id
                                  ? item
                                  : {
                                      ...item,
                                      label: e.target.value,
                                    },
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>Amount</div>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={option.amount ?? 0}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "donation"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
donationOptions: (
  Array.isArray(block.data.donationOptions)
    ? block.data.donationOptions
    : []
).map((item: any) =>
                                item.id !== option.id
                                  ? item
                                  : {
                                      ...item,
                                      amount: Math.max(
                                        1,
                                        Number(e.target.value) || 1,
                                      ),
                                    },
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "donation"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
donationOptions: (
  Array.isArray(block.data.donationOptions)
    ? block.data.donationOptions
    : []
).filter((item: any) => item.id !== option.id)
                            },
                          },
                    )
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-300 bg-white text-lg font-medium text-red-600 hover:border-red-500"
                  title="Remove donation button"
                  aria-label="Remove donation button"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "donation"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      donationOptions: [
                        ...(Array.isArray(block.data.donationOptions)
                          ? block.data.donationOptions
                          : []),
                        {
                          id: makeClientId("donationopt"),
                          label: "$10",
                          amount: 10,
                        },
                      ],
                    },
                  },
            )
          }
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 hover:border-neutral-900"
        >
          Add Donation Button
        </button>
      </div>
    </div>
    <div className="mt-4">
  <div className={inspectorLabelClass()}>
    Button Spacing
  </div>

  <input
    type="number"
    min="0"
    max="100"
    value={selectedBlock.data.buttonSpacing ?? 12}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "donation"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                buttonSpacing: Math.max(
                  0,
                  Number(e.target.value) || 0,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
    placeholder="12"
  />
</div>
    </div>
  );
}