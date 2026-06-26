"use client";

import type {
  RsvpStyleTarget,
  RsvpTextTarget,
} from "@/components/builder/formatting/rsvpFormatting";

type RsvpInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  rsvpTextTarget: RsvpTextTarget;
  setRsvpTextTarget: (target: RsvpTextTarget) => void;

  rsvpStyleTarget: RsvpStyleTarget;
  setRsvpStyleTarget: (target: RsvpStyleTarget) => void;

  rsvpHeadingInputRef: React.RefObject<HTMLInputElement | null>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function RsvpInspector({
  selectedBlock,
  updateSelectedBlock,

  rsvpTextTarget,
  setRsvpTextTarget,
  rsvpStyleTarget,
  setRsvpStyleTarget,

  rsvpHeadingInputRef,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: RsvpInspectorProps) {
  return (
  <div id="inspector-rsvp" className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>RSVP</div>
<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>
    <select
      value={rsvpTextTarget}
      onChange={(e) => setRsvpTextTarget(e.target.value as RsvpTextTarget)}
      className={inspectorInputClass()}
    >
      <option value="heading">Heading</option>
      <option value="helperText">Helper Text</option>
      <option value="badgeText">Badge Text</option>
      <option value="sectionLabel">Section Label</option>
      <option value="placeholderText">Placeholder Text</option>
      <option value="optionText">Option Text</option>
      <option value="submitButton">Submit Button</option>
      <option value="confirmationTitle">Confirmation Title</option>
      <option value="confirmationMessage">Confirmation Message</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Style Target</div>
    <select
      value={rsvpStyleTarget}
      onChange={(e) => setRsvpStyleTarget(e.target.value as RsvpStyleTarget)}
      className={inspectorInputClass()}
    >
      <option value="field">Field</option>
      <option value="section">Section</option>
      <option value="buttonDefault">Button Default</option>
      <option value="buttonSelection">Button Selection</option>
      <option value="submitButton">Submit Button</option>
      <option value="block">Block</option>
    </select>
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Variant</div>
      <select
        value={selectedBlock.data.styleVariant ?? "standard"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    styleVariant: e.target.value as any,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="standard">Standard</option>
        <option value="elegant_wedding">Elegant Wedding</option>
        <option value="modern_minimal">Modern Minimal</option>
        <option value="glassmorphism">Glassmorphism</option>
        <option value="luxury_black">Luxury Black</option>
        <option value="editorial_magazine">Editorial Magazine</option>
        <option value="floral_invitation">Floral Invitation</option>
        <option value="bold_event">Bold Event</option>
        <option value="luxury_invitation">Luxury Invitation</option>
        <option value="soft_pastel">Soft Pastel</option>
        <option value="dark_neon">Dark Neon</option>
        <option value="ticket_style">Ticket Style</option>
        <option value="timeline_rsvp">Timeline RSVP</option>
        <option value="split_layout">Split Layout</option>
        <option value="floating_panels">Floating Panels</option>
        <option value="formal_banquet">Formal Banquet</option>
      </select>
    </div>

    <label className="mt-4 flex items-center gap-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={selectedBlock.data.useChoiceCards ?? true}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    useChoiceCards: e.target.checked,
                  },
                },
          )
        }
      />
      Use premium choice cards
    </label>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        ref={rsvpHeadingInputRef}
        type="text"
        value={selectedBlock.data.heading}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
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
      <div className={inspectorLabelClass()}>Helper Text</div>
      <textarea
        value={selectedBlock.data.helperText ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    helperText: e.target.value,
                  },
                },
          )
        }
        className={`${inspectorInputClass()} min-h-[80px] py-2`}
        placeholder="Please let us know if you’ll be joining us."
      />
    </div>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Reply-By Badge</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.replyByDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      replyByDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display reply-by badge
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Badge Text</div>
        <input
          type="text"
          value={selectedBlock.data.replyByText ?? "Reply by May 12"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      replyByText: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Choose Image</div>
      <input
        type="text"
        value={selectedBlock.data.imageUrl ?? ""}
        placeholder="Paste image URL"
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageUrl: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Image Frame Shape</div>
      <select
        value={selectedBlock.data.imageFrameShape ?? "circle"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageFrameShape: e.target.value as
                      | "square"
                      | "circle"
                      | "diamond"
                      | "heart",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="square">Square</option>
        <option value="circle">Circle</option>
        <option value="diamond">Diamond</option>
        <option value="heart">Heart</option>
      </select>
    </div>
    
<div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
  <div className={inspectorLabelClass()}>Contact Details Section</div>

  <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
    <input
      type="checkbox"
      checked={selectedBlock.data.nameDisplay !== false}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  nameDisplay: e.target.checked,
                },
              },
        )
      }
    />
    Display contact details section
  </label>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Section Label</div>

    <input
      type="text"
      value={selectedBlock.data.contactLabel ?? "Contact Details"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  contactDetailsLabel: e.target.value,
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-5 space-y-4">
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-neutral-800">
          Name Fields
        </div>

        <input
          type="checkbox"
          checked={selectedBlock.data.nameDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      nameFieldsDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className={inspectorLabelClass()}>First Name Placeholder</div>

          <input
            type="text"
            value={
              selectedBlock.data.firstNamePlaceholder ?? "First Name"
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "rsvp"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        firstNamePlaceholder: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Last Name Placeholder</div>

          <input
            type="text"
            value={
              selectedBlock.data.lastNamePlaceholder ?? "Last Name"
            }
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "rsvp"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        lastNamePlaceholder: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-neutral-800">
          Email Address
        </div>

        <input
          type="checkbox"
          checked={selectedBlock.data.emailDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      emailDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Email Placeholder</div>

        <input
          type="text"
          value={
            selectedBlock.data.emailPlaceholder ?? "Email Address"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      emailPlaceholder: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-neutral-800">
          Mailing Address
        </div>

        <input
          type="checkbox"
          checked={selectedBlock.data.addressDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      addressDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Address Placeholder</div>

        <input
          type="text"
          value={
            selectedBlock.data.addressPlaceholder ?? "Mailing Address"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      addressPlaceholder: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>
  </div>
</div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Are You Attending Section</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.attendingDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      attendingDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display in public form
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label</div>
        <input
          type="text"
          value={selectedBlock.data.attendingLabel ?? "Are you attending?"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      attendingLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div className={inspectorLabelClass()}>Attendance Options</div>

        {(selectedBlock.data.attendingOptions?.length
          ? selectedBlock.data.attendingOptions
          : ["Yes", "No"]
        )
          .slice(0, 8)
          .map((option: string, index: number, options: string[]) => (
            <div
              key={`attending-option-${index}`}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={option}
                onChange={(e) =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "rsvp") return block;

                    const currentOptions = (
                      block.data.attendingOptions?.length
                        ? block.data.attendingOptions
                        : ["Yes", "No"]
                    ).slice(0, 8);

                    const previousValue = currentOptions[index];

                    const nextOptions = currentOptions.map(
                      (item: string, itemIndex: number) =>
                        itemIndex === index ? e.target.value : item,
                    );

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        attendingOptions: nextOptions,
                        attendingDefaultValue:
                          block.data.attendingDefaultValue === previousValue
                            ? e.target.value
                            : block.data.attendingDefaultValue,
                      },
                    };
                  })
                }
                className={inspectorInputClass()}
                placeholder={`Attendance option ${index + 1}`}
              />

              <button
                type="button"
                disabled={options.length <= 1}
                onClick={() =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "rsvp") return block;

                    const currentOptions = (
                      block.data.attendingOptions?.length
                        ? block.data.attendingOptions
                        : ["Yes", "No"]
                    ).slice(0, 8);

                    const removedValue = currentOptions[index];

                    const nextOptions = currentOptions.filter(
                      (_item: string, itemIndex: number) => itemIndex !== index,
                    );

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        attendingOptions: nextOptions.length
                          ? nextOptions
                          : ["Yes"],
                        attendingDefaultValue:
                          block.data.attendingDefaultValue === removedValue
                            ? nextOptions[0] ?? "Yes"
                            : block.data.attendingDefaultValue,
                      },
                    };
                  })
                }
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ×
              </button>
            </div>
          ))}

        <button
          type="button"
          disabled={(selectedBlock.data.attendingOptions?.length ?? 2) >= 8}
          onClick={() =>
            updateSelectedBlock((block: any) => {
              if (block.type !== "rsvp") return block;

              const currentOptions = (
                block.data.attendingOptions?.length
                  ? block.data.attendingOptions
                  : ["Yes", "No"]
              ).slice(0, 8);

              if (currentOptions.length >= 8) return block;

              return {
                ...block,
                data: {
                  ...block.data,
                  attendingOptions: [
                    ...currentOptions,
                    `Option ${currentOptions.length + 1}`,
                  ],
                },
              };
            })
          }
          className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add attendance option
        </button>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Default Table Value</div>
        <select
          value={
            selectedBlock.data.attendingDefaultValue ??
            selectedBlock.data.attendingOptions?.[0] ??
            "Yes"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      attendingDefaultValue: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          {(selectedBlock.data.attendingOptions?.length
            ? selectedBlock.data.attendingOptions
            : ["Yes", "No"]
          )
            .slice(0, 8)
            .map((option: string, index: number) => (
              <option key={`attending-default-${index}`} value={option}>
                {option || `Option ${index + 1}`}
              </option>
            ))}
        </select>
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Meal Section</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.mealDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      mealDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display in public form
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label</div>
        <input
          type="text"
          value={selectedBlock.data.mealLabel ?? "Your meal selection:"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      mealLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div className={inspectorLabelClass()}>Meal Options</div>

        {(selectedBlock.data.mealOptions?.length
          ? selectedBlock.data.mealOptions
          : ["Chicken", "Salmon"]
        )
          .slice(0, 8)
          .map((option: string, index: number, options: string[]) => (
            <div key={`meal-option-${index}`} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "rsvp") return block;

                    const currentOptions = (block.data.mealOptions?.length
                      ? block.data.mealOptions
                      : ["Chicken", "Salmon"]
                    ).slice(0, 8);

                    const previousValue = currentOptions[index];
                    const nextOptions = currentOptions.map((item: string, itemIndex: number) =>
                      itemIndex === index ? e.target.value : item,
                    );

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        mealOptions: nextOptions,
                        mealDefaultValue:
                          block.data.mealDefaultValue === previousValue
                            ? e.target.value
                            : block.data.mealDefaultValue,
                      },
                    };
                  })
                }
                className={inspectorInputClass()}
                placeholder={`Meal option ${index + 1}`}
              />

              <button
                type="button"
                disabled={options.length <= 1}
                onClick={() =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "rsvp") return block;

                    const currentOptions = (block.data.mealOptions?.length
                      ? block.data.mealOptions
                      : ["Chicken", "Salmon"]
                    ).slice(0, 8);

                    const removedValue = currentOptions[index];
                    const nextOptions = currentOptions.filter(
                      (_item: string, itemIndex: number) => itemIndex !== index,
                    );

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        mealOptions: nextOptions.length ? nextOptions : ["Chicken"],
                        mealDefaultValue:
                          block.data.mealDefaultValue === removedValue
                            ? nextOptions[0] ?? "Chicken"
                            : block.data.mealDefaultValue,
                      },
                    };
                  })
                }
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                title="Remove meal option"
              >
                ×
              </button>
            </div>
          ))}

        <button
          type="button"
          disabled={(selectedBlock.data.mealOptions?.length ?? 2) >= 8}
          onClick={() =>
            updateSelectedBlock((block: any) => {
              if (block.type !== "rsvp") return block;

              const currentOptions = (block.data.mealOptions?.length
                ? block.data.mealOptions
                : ["Chicken", "Salmon"]
              ).slice(0, 8);

              if (currentOptions.length >= 8) return block;

              return {
                ...block,
                data: {
                  ...block.data,
                  mealOptions: [
                    ...currentOptions,
                    `Option ${currentOptions.length + 1}`,
                  ],
                },
              };
            })
          }
          className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add meal option
        </button>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Default Table Value</div>
        <select
          value={
            selectedBlock.data.mealDefaultValue ??
            selectedBlock.data.mealOptions?.[0] ??
            "Chicken"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      mealDefaultValue: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          {(selectedBlock.data.mealOptions?.length
            ? selectedBlock.data.mealOptions
            : ["Chicken", "Salmon"]
          )
            .slice(0, 8)
            .map((option: string, index: number) => (
              <option key={`meal-default-${index}`} value={option}>
                {option || `Option ${index + 1}`}
              </option>
            ))}
        </select>
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Guest Section</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.guestDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      guestDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display in public form
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label</div>
        <input
          type="text"
          value={selectedBlock.data.guestLabel ?? "Are you bringing a guest?"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      guestLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div className={inspectorLabelClass()}>Guest Options</div>

        {(selectedBlock.data.guestOptions?.length
          ? selectedBlock.data.guestOptions
          : ["Yes", "No"]
        )
          .slice(0, 8)
          .map((option: string, index: number, options: string[]) => (
            <div
              key={`guest-option-${index}`}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={option}
                onChange={(e) =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "rsvp") return block;

                    const currentOptions = (
                      block.data.guestOptions?.length
                        ? block.data.guestOptions
                        : ["Yes", "No"]
                    ).slice(0, 8);

                    const previousValue = currentOptions[index];

                    const nextOptions = currentOptions.map(
                      (item: string, itemIndex: number) =>
                        itemIndex === index ? e.target.value : item,
                    );

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        guestOptions: nextOptions,
                        guestDefaultValue:
                          block.data.guestDefaultValue === previousValue
                            ? e.target.value
                            : block.data.guestDefaultValue,
                      },
                    };
                  })
                }
                className={inspectorInputClass()}
                placeholder={`Guest option ${index + 1}`}
              />

              <button
                type="button"
                disabled={options.length <= 1}
                onClick={() =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "rsvp") return block;

                    const currentOptions = (
                      block.data.guestOptions?.length
                        ? block.data.guestOptions
                        : ["Yes", "No"]
                    ).slice(0, 8);

                    const removedValue = currentOptions[index];

                    const nextOptions = currentOptions.filter(
                      (_item: string, itemIndex: number) => itemIndex !== index,
                    );

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        guestOptions: nextOptions.length
                          ? nextOptions
                          : ["Yes"],
                        guestDefaultValue:
                          block.data.guestDefaultValue === removedValue
                            ? nextOptions[0] ?? "Yes"
                            : block.data.guestDefaultValue,
                      },
                    };
                  })
                }
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ×
              </button>
            </div>
          ))}

        <button
          type="button"
          disabled={(selectedBlock.data.guestOptions?.length ?? 2) >= 8}
          onClick={() =>
            updateSelectedBlock((block: any) => {
              if (block.type !== "rsvp") return block;

              const currentOptions = (
                block.data.guestOptions?.length
                  ? block.data.guestOptions
                  : ["Yes", "No"]
              ).slice(0, 8);

              if (currentOptions.length >= 8) return block;

              return {
                ...block,
                data: {
                  ...block.data,
                  guestOptions: [
                    ...currentOptions,
                    `Option ${currentOptions.length + 1}`,
                  ],
                },
              };
            })
          }
          className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add guest option
        </button>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Default Table Value</div>
        <select
          value={
            selectedBlock.data.guestDefaultValue ??
            selectedBlock.data.guestOptions?.[0] ??
            "Yes"
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      guestDefaultValue: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          {(selectedBlock.data.guestOptions?.length
            ? selectedBlock.data.guestOptions
            : ["Yes", "No"]
          )
            .slice(0, 8)
            .map((option: string, index: number) => (
              <option key={`guest-default-${index}`} value={option}>
                {option || `Option ${index + 1}`}
              </option>
            ))}
        </select>
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Comments Section</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.commentsDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      commentsDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display in public form
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Default Table Value</div>
        <textarea
          value={selectedBlock.data.commentsDefaultValue ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      commentsDefaultValue: e.target.value,
                    },
                  },
            )
          }
          className={`${inspectorInputClass()} min-h-[80px] py-2`}
          placeholder="Optional default comments value"
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label</div>
        <input
          type="text"
          value={selectedBlock.data.commentsLabel ?? "Additional comments"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      commentsLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Placeholder</div>
        <input
          type="text"
          value={selectedBlock.data.commentsPlaceholder ?? "Additional comments"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      commentsPlaceholder: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Submit Button</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Button Text</div>

        <input
          type="text"
          value={selectedBlock.data.submitButtonText ?? "Submit RSVP →"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      submitButtonText: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Button Layout</div>

        <select
          value={selectedBlock.data.buttonLayout ?? "full"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      buttonLayout: e.target.value as "full" | "compact",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="full">Full Width</option>
          <option value="compact">Compact</option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Button Shape</div>

        <select
          value={selectedBlock.data.buttonShape ?? "rounded"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      buttonShape: e.target.value as
                        | "rounded"
                        | "pill"
                        | "square",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="rounded">Rounded</option>
          <option value="pill">Pill</option>
          <option value="square">Square</option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Button Variant</div>

        <select
          value={selectedBlock.data.buttonVariant ?? "solid"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      buttonVariant: e.target.value as
                        | "solid"
                        | "outline"
                        | "gradient",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="solid">Solid</option>
          <option value="outline">Outline</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>

      <label className="mt-4 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.buttonUppercase ?? false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      buttonUppercase: e.target.checked,
                    },
                  },
            )
          }
        />
        Uppercase button text
      </label>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Confirmation State</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Confirmation Title</div>

        <input
          type="text"
          value={
            selectedBlock.data.confirmationTitle ??
            "Thank you — your RSVP has been received."
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      confirmationTitle: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Confirmation Message</div>

        <textarea
          value={
            selectedBlock.data.confirmationMessage ??
            "We’re excited to celebrate with you."
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      confirmationMessage: e.target.value,
                    },
                  },
            )
          }
          className={`${inspectorInputClass()} min-h-[90px] py-2`}
          placeholder="We’re excited to celebrate with you."
        />
      </div>
    </div>
    </div>
  );
}