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
  const updateHiddenElement = (
    block: any,
    key: string,
    hidden: boolean,
  ) => {
    const currentHidden = Array.isArray(
      block.data.hiddenElements,
    )
      ? block.data.hiddenElements
      : [];

    const nextHidden = hidden
      ? Array.from(
          new Set([
            ...currentHidden,
            key,
          ]),
        )
      : currentHidden.filter(
          (item: string) =>
            item !== key,
        );

    return nextHidden;
  };

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
<option value="fieldText">Field Text</option>
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
  <div className={inspectorLabelClass()}>
    Style Variant
  </div>

  <select
    value={
      selectedBlock.data.layoutVariant ??
      "standard"
    }
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "rsvp"
          ? block
          : {
              ...block,
              data: {
                ...block.data,

                layoutVariant:
                  e.target.value as
                    | "standard"
                    | "invitation_card"
                    | "hero_overlay"
                    | "flyer_stack",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="standard">
      Standard
    </option>

    <option value="invitation_card">
      Invitation Card
    </option>

    <option value="hero_overlay">
      Hero Overlay
    </option>

    <option value="flyer_stack">
      Flyer Stack
    </option>
  </select>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Theme Variant
  </div>

  <select
    value={
      selectedBlock.data.styleVariant ??
      "standard"
    }
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "rsvp"
          ? block
          : {
              ...block,
              data: {
                ...block.data,

                styleVariant:
                  e.target.value as any,
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="standard">
      Standard
    </option>

    <option value="elegant_wedding">
      Elegant Wedding
    </option>

    <option value="modern_minimal">
      Modern Minimal
    </option>

    <option value="glassmorphism">
      Glassmorphism
    </option>

    <option value="editorial_magazine">
      Editorial Magazine
    </option>

    <option value="bold_event">
      Bold Event
    </option>

    <option value="dark_neon">
      Dark Neon
    </option>

    <option value="ticket_style">
      Ticket Style
    </option>
  </select>
</div>

{/* ============================================================
    LAYOUT SPACING
    ============================================================ */}

<div className="mt-5 border-t border-neutral-200 pt-4">
  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
    Layout
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Content Padding
    </div>

    <input
      type="range"
      min={0}
      max={64}
      step={1}
      value={
        selectedBlock.data.contentPadding ??
        24
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  contentPadding:
                    Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    <div className="mt-1 text-right text-[11px] text-neutral-500">
      {selectedBlock.data.contentPadding ??
        24}
      px
    </div>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Section Spacing
    </div>

    <input
      type="range"
      min={0}
      max={48}
      step={1}
      value={
        selectedBlock.data.sectionGap ??
        20
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  sectionGap:
                    Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    <div className="mt-1 text-right text-[11px] text-neutral-500">
      {selectedBlock.data.sectionGap ??
        20}
      px
    </div>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Field Spacing
    </div>

    <input
      type="range"
      min={0}
      max={40}
      step={1}
      value={
        selectedBlock.data.fieldGap ??
        14
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  fieldGap:
                    Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    <div className="mt-1 text-right text-[11px] text-neutral-500">
      {selectedBlock.data.fieldGap ??
        14}
      px
    </div>
  </div>
</div>

{/* ============================================================
    STANDARD
    ============================================================ */}

{(
  selectedBlock.data.layoutVariant ??
  "standard"
) === "standard" ? (
  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Form Max Width
    </div>

    <input
      type="range"
      min={320}
      max={1200}
      step={10}
      value={
        selectedBlock.data.formMaxWidth ??
        760
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  formMaxWidth:
                    Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    <div className="mt-1 text-right text-[11px] text-neutral-500">
      {selectedBlock.data.formMaxWidth ??
        760}
      px
    </div>
  </div>
) : null}

{/* ============================================================
    INVITATION CARD
    ============================================================ */}

{(
  selectedBlock.data.layoutVariant ??
  "standard"
) === "invitation_card" ? (
  <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
      Invitation Card
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Card Width
      </div>

      <input
        type="range"
        min={280}
        max={700}
        step={10}
        value={
          selectedBlock.data.portraitMaxWidth ??
          460
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,

                    portraitMaxWidth:
                      Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />

      <div className="mt-1 text-right text-[11px] text-neutral-500">
        {selectedBlock.data.portraitMaxWidth ??
          460}
        px
      </div>
    </div>
  </div>
) : null}

{/* ============================================================
    HERO OVERLAY
    ============================================================ */}

{(
  selectedBlock.data.layoutVariant ??
  "standard"
) === "hero_overlay" ? (
  <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
      Hero Overlay
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Horizontal Position
      </div>

      <select
        value={
          selectedBlock.data.overlayAlign ??
          "center"
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,

                    overlayAlign:
                      e.target.value as
                        | "left"
                        | "center"
                        | "right",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="left">
          Left
        </option>

        <option value="center">
          Center
        </option>

        <option value="right">
          Right
        </option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Vertical Position
      </div>

      <select
        value={
          selectedBlock.data.overlayVerticalAlign ??
          "center"
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,

                    overlayVerticalAlign:
                      e.target.value as
                        | "top"
                        | "center"
                        | "bottom",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="top">
          Top
        </option>

        <option value="center">
          Center
        </option>

        <option value="bottom">
          Bottom
        </option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Form Width
      </div>

      <input
        type="range"
        min={280}
        max={900}
        step={10}
        value={
          selectedBlock.data.overlayWidth ??
          620
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,

                    overlayWidth:
                      Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />

      <div className="mt-1 text-right text-[11px] text-neutral-500">
        {selectedBlock.data.overlayWidth ??
          620}
        px
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Overlay Opacity
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={
          selectedBlock.data.overlayBackgroundOpacity ??
          0.78
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,

                    overlayBackgroundOpacity:
                      Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />

      <div className="mt-1 text-right text-[11px] text-neutral-500">
        {Math.round(
          (selectedBlock.data
            .overlayBackgroundOpacity ??
            0.78) * 100,
        )}
        %
      </div>
    </div>
  </div>
) : null}

{/* ============================================================
    FLYER STACK
    ============================================================ */}

{(
  selectedBlock.data.layoutVariant ??
  "standard"
) === "flyer_stack" ? (
  <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
      Flyer Stack
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Flyer Width
      </div>

      <input
        type="range"
        min={280}
        max={700}
        step={10}
        value={
          selectedBlock.data.portraitMaxWidth ??
          460
        }
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,

                    portraitMaxWidth:
                      Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />

      <div className="mt-1 text-right text-[11px] text-neutral-500">
        {selectedBlock.data.portraitMaxWidth ??
          460}
        px
      </div>
    </div>
  </div>
) : null}

{/* ============================================================
    IMAGE POSITIONING
    ============================================================ */}

<div className="mt-5 border-t border-neutral-200 pt-4">
  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
    Image Layout
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Image Fit
    </div>

    <select
      value={
        selectedBlock.data.imageFit ??
        "cover"
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  imageFit:
                    e.target.value as
                      | "cover"
                      | "contain"
                      | "stretch",
                },
              },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="cover">
        Cover
      </option>

      <option value="contain">
        Contain
      </option>

      <option value="stretch">
        Stretch
      </option>
    </select>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Horizontal Position
    </div>

    <input
      type="range"
      min={0}
      max={100}
      step={1}
      value={
        selectedBlock.data.imagePositionX ??
        50
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  imagePositionX:
                    Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    <div className="mt-1 text-right text-[11px] text-neutral-500">
      {selectedBlock.data.imagePositionX ??
        50}
      %
    </div>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Vertical Position
    </div>

    <input
      type="range"
      min={0}
      max={100}
      step={1}
      value={
        selectedBlock.data.imagePositionY ??
        50
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  imagePositionY:
                    Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    <div className="mt-1 text-right text-[11px] text-neutral-500">
      {selectedBlock.data.imagePositionY ??
        50}
      %
    </div>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Image Zoom
    </div>

    <input
      type="range"
      min={0.5}
      max={3}
      step={0.05}
      value={
        selectedBlock.data.imageZoom ??
        1
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  imageZoom:
                    Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    <div className="mt-1 text-right text-[11px] text-neutral-500">
      {Math.round(
        (selectedBlock.data.imageZoom ??
          1) * 100,
      )}
      %
    </div>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Image Opacity
    </div>

    <input
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={
        selectedBlock.data.imageOpacity ??
        1
      }
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,

                  imageOpacity:
                    Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />

    <div className="mt-1 text-right text-[11px] text-neutral-500">
      {Math.round(
        (selectedBlock.data.imageOpacity ??
          1) * 100,
      )}
      %
    </div>
  </div>
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

  replyByDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "replyBy",
      !e.target.checked,
    ),
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
  <div className={inspectorLabelClass()}>
    Form Element Order
  </div>

  <div className="mt-2 text-xs text-neutral-500">
    Move sections up or down in the RSVP form.
  </div>

  <div className="mt-4 space-y-2">
    {(() => {
      const availableElements = [
        {
          key: "image",
          label: "Image",
        },
        {
          key: "heading",
          label: "Heading / Intro",
        },
        {
          key: "contactSection",
          label: "Contact Details",
        },
        {
          key: "attending",
          label: "Attendance",
        },
        {
          key: "meal",
          label: "Meal",
        },
        {
          key: "guestToggle",
          label: "Guest Question",
        },
        {
          key: "guestCount",
          label: "Guest Count",
        },
        {
          key: "guestName",
          label: "Guest Names",
        },
        {
          key: "comments",
          label: "Comments",
        },
      ] as const;

      const savedOrder =
        Array.isArray(
          selectedBlock.data.elementOrder,
        )
          ? selectedBlock.data.elementOrder
          : [];

      const normalizedSavedOrder =
        savedOrder
          .map((key: string) => {
            if (
              key === "helperText" ||
              key === "replyBy"
            ) {
              return "heading";
            }

            if (
              key === "nameLabel" ||
              key === "firstName" ||
              key === "lastName" ||
              key === "email" ||
              key === "address"
            ) {
              return "contactSection";
            }

            return key;
          })
          .filter(
            (
              key: string,
              index: number,
              array: string[],
            ) =>
              array.indexOf(key) ===
              index,
          );

      const orderedKeys = [
        ...normalizedSavedOrder.filter(
          (key: string) =>
            availableElements.some(
              (item) =>
                item.key === key,
            ),
        ),

        ...availableElements
          .map(
            (item) =>
              item.key,
          )
          .filter(
            (key) =>
              !normalizedSavedOrder.includes(
                key,
              ),
          ),
      ];

      return orderedKeys.map(
        (
          key,
          index,
        ) => {
          const item =
            availableElements.find(
              (entry) =>
                entry.key === key,
            );

          if (!item) {
            return null;
          }

          const moveItem = (
            direction:
              | "up"
              | "down",
          ) => {
            updateSelectedBlock(
              (block: any) => {
                if (
                  block.type !==
                  "rsvp"
                ) {
                  return block;
                }

                const current =
                  [
                    ...orderedKeys,
                  ];

                const nextIndex =
                  direction ===
                  "up"
                    ? index - 1
                    : index + 1;

                if (
                  nextIndex <
                    0 ||
                  nextIndex >=
                    current.length
                ) {
                  return block;
                }

                [
                  current[
                    index
                  ],
                  current[
                    nextIndex
                  ],
                ] = [
                  current[
                    nextIndex
                  ],
                  current[
                    index
                  ],
                ];

                return {
                  ...block,

                  data: {
                    ...block.data,

                    elementOrder:
                      current,
                  },
                };
              },
            );
          };

          return (
            <div
              key={
                item.key
              }
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2"
            >
              <div className="min-w-0 text-sm font-medium text-neutral-800">
                {
                  item.label
                }
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={
                    index ===
                    0
                  }
                  onClick={() =>
                    moveItem(
                      "up",
                    )
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Move up"
                >
                  ↑
                </button>

                <button
                  type="button"
                  disabled={
                    index ===
                    orderedKeys.length -
                      1
                  }
                  onClick={() =>
                    moveItem(
                      "down",
                    )
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        },
      );
    })()}
  </div>
</div>


<div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
  <div className={inspectorLabelClass()}>
    Contact Details Section
  </div>

  {/* ============================================================ */}
  {/* DISPLAY CONTACT DETAILS SECTION */}
  {/* ============================================================ */}

  <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
    <input
      type="checkbox"
      checked={
        selectedBlock.data
          .contactDetailsDisplay !==
        false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
data: {
  ...block.data,

  contactDetailsDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "contactSection",
      !e.target.checked,
    ),
},
                },
        )
      }
    />

    Display contact details section
  </label>

  {/* ============================================================ */}
  {/* SECTION LABEL */}
  {/* ============================================================ */}

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Section Label
    </div>

    <input
      type="text"
      value={
        selectedBlock.data
          .contactLabel ??
        "Contact Details"
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    contactLabel:
                      e.target.value,
                  },
                },
        )
      }
      className={inspectorInputClass()}
      placeholder="Optional section label"
    />

    <div className="mt-1 text-xs text-neutral-500">
      Leave blank to hide the section label.
    </div>
  </div>

  {/* ============================================================ */}
  {/* CONTACT FIELD CONTROLS */}
  {/* ============================================================ */}

  <div className="mt-5 space-y-4">
    {/* ========================================================== */}
    {/* NAME FIELDS */}
    {/* ========================================================== */}

    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-neutral-800">
          Name Fields
        </div>

        <input
          type="checkbox"
          checked={
            selectedBlock.data
              .nameDisplay !==
            false
          }
          onChange={(e) =>
            updateSelectedBlock(
              (block: any) =>
                block.type !==
                "rsvp"
                  ? block
                  : {
                      ...block,
data: {
  ...block.data,

  nameDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "firstName",
      !e.target.checked,
    ),
},
                    },
            )
          }
        />
      </div>

      {selectedBlock.data
        .nameDisplay !==
      false ? (
        <div className="mt-4 space-y-4">
          {/* FIRST NAME */}

          <div>
            <div
              className={
                inspectorLabelClass()
              }
            >
              First Name Placeholder
            </div>

            <input
              type="text"
              value={
                selectedBlock.data
                  .firstNamePlaceholder ??
                "First Name"
              }
              onChange={(e) =>
                updateSelectedBlock(
                  (block: any) =>
                    block.type !==
                    "rsvp"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            firstNamePlaceholder:
                              e.target
                                .value,
                          },
                        },
                )
              }
              className={
                inspectorInputClass()
              }
            />
          </div>

          {/* LAST NAME */}

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <label className="flex items-center gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={
                  selectedBlock.data
                    .lastNameDisplay !==
                  false
                }
                onChange={(e) =>
                  updateSelectedBlock(
                    (block: any) =>
                      block.type !==
                      "rsvp"
                        ? block
                        : {
                            ...block,
data: {
  ...block.data,

  lastNameDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "lastName",
      !e.target.checked,
    ),
},
                          },
                  )
                }
              />

              Include Last Name field
            </label>

            {selectedBlock.data
              .lastNameDisplay !==
            false ? (
              <div className="mt-3">
                <div
                  className={
                    inspectorLabelClass()
                  }
                >
                  Last Name Placeholder
                </div>

                <input
                  type="text"
                  value={
                    selectedBlock.data
                      .lastNamePlaceholder ??
                    "Last Name"
                  }
                  onChange={(e) =>
                    updateSelectedBlock(
                      (block: any) =>
                        block.type !==
                        "rsvp"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                lastNamePlaceholder:
                                  e.target
                                    .value,
                              },
                            },
                    )
                  }
                  className={
                    inspectorInputClass()
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>

    {/* ========================================================== */}
    {/* EMAIL */}
    {/* ========================================================== */}

    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-neutral-800">
          Email Address
        </div>

        <input
          type="checkbox"
          checked={
            selectedBlock.data
              .emailDisplay !==
            false
          }
          onChange={(e) =>
            updateSelectedBlock(
              (block: any) =>
                block.type !==
                "rsvp"
                  ? block
                  : {
                      ...block,
data: {
  ...block.data,

  emailDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "email",
      !e.target.checked,
    ),
},
                    },
            )
          }
        />
      </div>

      {selectedBlock.data
        .emailDisplay !==
      false ? (
        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Email Placeholder
          </div>

          <input
            type="text"
            value={
              selectedBlock.data
                .emailPlaceholder ??
              "Email Address"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "rsvp"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          emailPlaceholder:
                            e.target
                              .value,
                        },
                      },
              )
            }
            className={
              inspectorInputClass()
            }
          />
        </div>
      ) : null}
    </div>

    {/* ========================================================== */}
    {/* MAILING ADDRESS */}
    {/* ========================================================== */}

    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-neutral-800">
          Mailing Address
        </div>

        <input
          type="checkbox"
          checked={
            selectedBlock.data
              .addressDisplay !==
            false
          }
          onChange={(e) =>
            updateSelectedBlock(
              (block: any) =>
                block.type !==
                "rsvp"
                  ? block
                  : {
                      ...block,
data: {
  ...block.data,

  addressDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "address",
      !e.target.checked,
    ),
},
                    },
            )
          }
        />
      </div>

      {selectedBlock.data
        .addressDisplay !==
      false ? (
        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Address Placeholder
          </div>

          <input
            type="text"
            value={
              selectedBlock.data
                .addressPlaceholder ??
              "Mailing Address"
            }
            onChange={(e) =>
              updateSelectedBlock(
                (block: any) =>
                  block.type !==
                  "rsvp"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          addressPlaceholder:
                            e.target
                              .value,
                        },
                      },
              )
            }
            className={
              inspectorInputClass()
            }
          />
        </div>
      ) : null}
    </div>
  </div>
</div>

<div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
  <div className={inspectorLabelClass()}>
    Attendance Section
  </div>

  <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
    <input
      type="checkbox"
      checked={
        selectedBlock.data.attendingDisplay !==
        false
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "rsvp"
              ? block
              : {
                  ...block,
data: {
  ...block.data,

  attendingDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "attending",
      !e.target.checked,
    ),
},
                },
        )
      }
    />

    Display in public form
  </label>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Label
    </div>

    <input
      type="text"
      value={
        selectedBlock.data.attendingLabel ??
        "Will you be attending?"
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,

                    attendingLabel:
                      e.target.value,
                  },
                },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-4 space-y-3">
    <div className={inspectorLabelClass()}>
      Attendance Options
    </div>

    {(selectedBlock.data.attendingOptions?.length
      ? selectedBlock.data.attendingOptions
      : [
          "Yes",
          "No",
        ]
    )
      .slice(
        0,
        8,
      )
      .map(
        (
          option: string,
          index: number,
          options: string[],
        ) => (
          <div
            key={`attending-option-${index}`}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={
                option
              }
              onChange={(e) =>
                updateSelectedBlock(
                  (
                    block: any,
                  ) => {
                    if (
                      block.type !==
                      "rsvp"
                    ) {
                      return block;
                    }

                    const currentOptions =
                      (
                        block.data
                          .attendingOptions
                          ?.length
                          ? block.data
                              .attendingOptions
                          : [
                              "Yes",
                              "No",
                            ]
                      ).slice(
                        0,
                        8,
                      );

                    const previousValue =
                      currentOptions[
                        index
                      ];

                    const nextOptions =
                      currentOptions.map(
                        (
                          item: string,
                          itemIndex: number,
                        ) =>
                          itemIndex ===
                          index
                            ? e
                                .target
                                .value
                            : item,
                      );

                    return {
                      ...block,

                      data: {
                        ...block.data,

                        attendingOptions:
                          nextOptions,

                        attendingDefaultValue:
                          block.data
                            .attendingDefaultValue ===
                          previousValue
                            ? e
                                .target
                                .value
                            : block
                                .data
                                .attendingDefaultValue,
                      },
                    };
                  },
                )
              }
              className={inspectorInputClass()}
              placeholder={`Attendance option ${
                index +
                1
              }`}
            />

            <button
              type="button"
              disabled={
                options.length <=
                1
              }
              onClick={() =>
                updateSelectedBlock(
                  (
                    block: any,
                  ) => {
                    if (
                      block.type !==
                      "rsvp"
                    ) {
                      return block;
                    }

                    const currentOptions =
                      (
                        block.data
                          .attendingOptions
                          ?.length
                          ? block.data
                              .attendingOptions
                          : [
                              "Yes",
                              "No",
                            ]
                      ).slice(
                        0,
                        8,
                      );

                    const removedValue =
                      currentOptions[
                        index
                      ];

                    const nextOptions =
                      currentOptions.filter(
                        (
                          _item: string,
                          itemIndex: number,
                        ) =>
                          itemIndex !==
                          index,
                      );

                    return {
                      ...block,

                      data: {
                        ...block.data,

                        attendingOptions:
                          nextOptions.length
                            ? nextOptions
                            : [
                                "Yes",
                              ],

                        attendingDefaultValue:
                          block.data
                            .attendingDefaultValue ===
                          removedValue
                            ? nextOptions[
                                0
                              ] ??
                              "Yes"
                            : block
                                .data
                                .attendingDefaultValue,
                      },
                    };
                  },
                )
              }
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="Remove attendance option"
            >
              ×
            </button>
          </div>
        ),
      )}

    <button
      type="button"
      disabled={
        (
          selectedBlock.data
            .attendingOptions
            ?.length ??
          2
        ) >=
        8
      }
      onClick={() =>
        updateSelectedBlock(
          (
            block: any,
          ) => {
            if (
              block.type !==
              "rsvp"
            ) {
              return block;
            }

            const currentOptions =
              (
                block.data
                  .attendingOptions
                  ?.length
                  ? block.data
                      .attendingOptions
                  : [
                      "Yes",
                      "No",
                    ]
              ).slice(
                0,
                8,
              );

            if (
              currentOptions.length >=
              8
            ) {
              return block;
            }

            return {
              ...block,

              data: {
                ...block.data,

                attendingOptions:
                  [
                    ...currentOptions,
                    `Option ${
                      currentOptions.length +
                      1
                    }`,
                  ],
              },
            };
          },
        )
      }
      className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      + Add attendance option
    </button>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Default Value
    </div>

    <select
      value={
        selectedBlock.data
          .attendingDefaultValue ??
        selectedBlock.data
          .attendingOptions?.[
          0
        ] ??
        "Yes"
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) =>
            block.type !==
            "rsvp"
              ? block
              : {
                  ...block,

                  data: {
                    ...block.data,

                    attendingDefaultValue:
                      e.target.value,
                  },
                },
        )
      }
      className={inspectorInputClass()}
    >
      {(selectedBlock.data.attendingOptions?.length
        ? selectedBlock.data.attendingOptions
        : [
            "Yes",
            "No",
          ]
      )
        .slice(
          0,
          8,
        )
        .map(
          (
            option: string,
            index: number,
          ) => (
            <option
              key={`attending-default-${index}`}
              value={
                option
              }
            >
              {option ||
                `Option ${
                  index +
                  1
                }`}
            </option>
          ),
        )}
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

  mealDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "meal",
      !e.target.checked,
    ),
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

  guestDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "guestToggle",
      !e.target.checked,
    ),
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

<div className="mt-4 grid grid-cols-2 gap-3">
  <div>
    <div className={inspectorLabelClass()}>
      Minimum Guests
    </div>

    <input
      type="number"
      min={1}
      max={
        selectedBlock.data.guestMax ??
        10
      }
      value={
        selectedBlock.data.guestMin ??
        1
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) => {
            if (
              block.type !==
              "rsvp"
            ) {
              return block;
            }

            const nextMin =
              Math.max(
                1,
                Number(
                  e.target.value,
                ) || 1,
              );

            const currentMax =
              Number(
                block.data
                  .guestMax ??
                  10,
              );

            return {
              ...block,

              data: {
                ...block.data,

                guestMin:
                  Math.min(
                    nextMin,
                    Math.max(
                      currentMax,
                      1,
                    ),
                  ),
              },
            };
          },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div>
    <div className={inspectorLabelClass()}>
      Maximum Guests
    </div>

    <input
      type="number"
      min={
        selectedBlock.data.guestMin ??
        1
      }
      max={20}
      value={
        selectedBlock.data.guestMax ??
        10
      }
      onChange={(e) =>
        updateSelectedBlock(
          (block: any) => {
            if (
              block.type !==
              "rsvp"
            ) {
              return block;
            }

            const currentMin =
              Math.max(
                1,
                Number(
                  block.data
                    .guestMin ??
                    1,
                ),
              );

            const nextMax =
              Math.max(
                currentMin,
                Math.min(
                  20,
                  Number(
                    e.target.value,
                  ) ||
                    currentMin,
                ),
              );

            return {
              ...block,

              data: {
                ...block.data,

                guestMax:
                  nextMax,
              },
            };
          },
        )
      }
      className={inspectorInputClass()}
    />
  </div>
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

  commentsDisplay:
    e.target.checked,

  hiddenElements:
    updateHiddenElement(
      block,
      "comments",
      !e.target.checked,
    ),
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
  <div className={inspectorLabelClass()}>
    Button Alignment
  </div>

  <select
    value={
      selectedBlock.data.buttonAlign ??
      "center"
    }
    onChange={(e) =>
      updateSelectedBlock(
        (block: any) =>
          block.type !==
          "rsvp"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  buttonAlign:
                    e.target.value as
                      | "left"
                      | "center"
                      | "right",
                },
              },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="left">
      Left
    </option>

    <option value="center">
      Center
    </option>

    <option value="right">
      Right
    </option>
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