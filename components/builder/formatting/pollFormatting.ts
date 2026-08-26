import type {
  MicrositeBlock,
  TextStyle,
} from "@/lib/templates/builder";

type PollBlock = Extract<
  MicrositeBlock,
  { type: "poll" }
>;

/*
 * ================================================================
 * TEXT TARGETS
 * ================================================================
 *
 * question
 *   Poll question / Showcase title.
 *
 * optionText
 *   Normal option label.
 *
 * selectedOptionText
 *   Option label while selected.
 *
 * submitButton
 *   Showcase submit button label.
 */

export type PollTextTarget =
  | "question"
  | "optionText"
  | "selectedOptionText"
  | "submitButton";

/*
 * ================================================================
 * STYLE / APPEARANCE TARGETS
 * ================================================================
 *
 * field
 *   Legacy Simple-poll option field styling.
 *
 * block
 *   Entire Poll block.
 *
 * titleFrame
 *   Showcase title frame.
 *
 * optionFrame
 *   Showcase choice frame.
 *
 * imageFrame
 *   Showcase option image frame.
 *
 * selectionIndicator
 *   Showcase radio / checkbox indicator.
 *
 * submitButton
 *   Showcase Submit button frame.
 */

export type PollStyleTarget =
  | "field"
  | "block"
  | "titleFrame"
  | "optionFrame"
  | "imageFrame"
  | "selectionIndicator"
  | "submitButton";

function isPollBlock(
  block: MicrositeBlock,
): block is PollBlock {
  return block.type === "poll";
}

/*
 * ================================================================
 * TEXT STYLE
 * ================================================================
 */

export function getPollTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,

  target: PollTextTarget,
): TextStyle {
  if (
    !block ||
    block.type !== "poll"
  ) {
    return {};
  }

  const data =
    block.data as any;

  /*
   * Poll question / Showcase title.
   *
   * `style` is now the canonical field.
   * `questionStyle` remains as a legacy fallback for older drafts.
   */
  if (
    target === "question"
  ) {
    return (
      data.style ??
      data.questionStyle ??
      {}
    );
  }

  /*
   * Normal option labels.
   *
   * optionLabelStyle is canonical.
   * optionTextStyle remains as a legacy fallback.
   */
  if (
    target === "optionText"
  ) {
    return (
      data.optionLabelStyle ??
      data.optionTextStyle ??
      data.style ??
      {}
    );
  }

  /*
   * Selected option label.
   */
  if (
    target ===
    "selectedOptionText"
  ) {
    return (
      data.selectedOptionLabelStyle ??
      data.optionLabelStyle ??
      data.optionTextStyle ??
      data.style ??
      {}
    );
  }

  /*
   * Submit button label.
   */
  return (
    data.submitButtonTextStyle ??
    data.style ??
    {}
  );
}

/*
 * ================================================================
 * APPLY TEXT STYLE
 * ================================================================
 */

export function applyPollTextStylePatch(
  block: MicrositeBlock,

  target: PollTextTarget,

  patch: Partial<TextStyle>,
): MicrositeBlock {
  if (!isPollBlock(block)) {
    return block;
  }

  const data =
    block.data as any;

  /*
   * QUESTION / SHOWCASE TITLE
   */
  if (
    target === "question"
  ) {
    const currentStyle =
      data.style ??
      data.questionStyle ??
      {};

    const nextStyle = {
      ...currentStyle,
      ...patch,
    };

    return {
      ...block,

      data: {
        ...data,

        /*
         * Canonical field.
         */
        style:
          nextStyle,

        /*
         * Keep the legacy field synchronized so older render paths
         * and saved drafts continue to behave correctly.
         */
        questionStyle:
          nextStyle,

        /*
         * Legacy color compatibility.
         */
        ...(patch.color !==
        undefined
          ? {
              questionColor:
                patch.color,
            }
          : {}),
      },
    };
  }

  /*
   * NORMAL OPTION LABEL
   */
  if (
    target === "optionText"
  ) {
    const currentStyle =
      data.optionLabelStyle ??
      data.optionTextStyle ??
      {};

    const nextStyle = {
      ...currentStyle,
      ...patch,
    };

    return {
      ...block,

      data: {
        ...data,

        optionLabelStyle:
          nextStyle,

        /*
         * Legacy compatibility.
         */
        optionTextStyle:
          nextStyle,

        ...(patch.color !==
        undefined
          ? {
              optionTextColor:
                patch.color,
            }
          : {}),
      },
    };
  }

  /*
   * SELECTED OPTION LABEL
   */
  if (
    target ===
    "selectedOptionText"
  ) {
    return {
      ...block,

      data: {
        ...data,

        selectedOptionLabelStyle: {
          ...(
            data.selectedOptionLabelStyle ??
            data.optionLabelStyle ??
            data.optionTextStyle ??
            {}
          ),

          ...patch,
        },
      },
    };
  }

  /*
   * SUBMIT BUTTON LABEL
   */
  return {
    ...block,

    data: {
      ...data,

      submitButtonTextStyle: {
        ...(
          data.submitButtonTextStyle ??
          {}
        ),

        ...patch,
      },
    },
  };
}

/*
 * ================================================================
 * APPEARANCE HELPERS
 * ================================================================
 */

function normalizeAppearancePatch(
  patch: Record<
    string,
    any
  >,
) {
  return {
    ...(patch.backgroundColor !==
    undefined
      ? {
          backgroundColor:
            patch.backgroundColor,
        }
      : {}),

    ...(patch.backgroundOpacity !==
    undefined
      ? {
          backgroundOpacity:
            patch.backgroundOpacity,
        }
      : {}),

    ...(patch.borderColor !==
    undefined
      ? {
          borderColor:
            patch.borderColor,
        }
      : {}),

    ...(patch.borderWidth !==
    undefined
      ? {
          borderWidth:
            Number(
              patch.borderWidth,
            ) || 0,
        }
      : {}),

    ...(patch.borderRadius !==
    undefined
      ? {
          borderRadius:
            Number(
              patch.borderRadius,
            ) || 0,
        }
      : {}),
  };
}

/*
 * ================================================================
 * APPLY APPEARANCE STYLE
 * ================================================================
 */

export function applyPollStylePatch(
  block: MicrositeBlock,

  target: PollStyleTarget,

  patch: Record<
    string,
    any
  >,
): MicrositeBlock {
  if (!isPollBlock(block)) {
    return block;
  }

  const data =
    block.data as any;

  /*
   * ================================================================
   * BLOCK
   * ================================================================
   */

  if (
    target === "block"
  ) {
    return {
      ...block,

      appearance: {
        ...block.appearance,

        ...patch,
      },

      data: {
        ...data,

        /*
         * Retain legacy blockStyle compatibility.
         */
        blockStyle: {
          ...(
            data.blockStyle ??
            {}
          ),

          ...patch,
        },
      },
    };
  }

  /*
   * ================================================================
   * SIMPLE POLL FIELD
   * ================================================================
   */

  if (
    target === "field"
  ) {
    const normalizedPatch =
      normalizeAppearancePatch(
        patch,
      );

    return {
      ...block,

      data: {
        ...data,

        fieldStyle: {
          ...(
            data.fieldStyle ??
            {}
          ),

          ...normalizedPatch,
        },

        /*
         * Legacy compatibility.
         */
        ...(patch.backgroundColor !==
        undefined
          ? {
              fieldBackgroundColor:
                patch.backgroundColor,

              optionBackgroundColor:
                patch.backgroundColor,
            }
          : {}),

        ...(patch.backgroundOpacity !==
        undefined
          ? {
              fieldBackgroundOpacity:
                patch.backgroundOpacity,

              optionBackgroundOpacity:
                patch.backgroundOpacity,
            }
          : {}),

        ...(patch.borderColor !==
        undefined
          ? {
              fieldBorderColor:
                patch.borderColor,

              optionBorderColor:
                patch.borderColor,
            }
          : {}),

        ...(patch.borderWidth !==
        undefined
          ? {
              fieldBorderWidth:
                Number(
                  patch.borderWidth,
                ) || 0,

              optionBorderWidth:
                Number(
                  patch.borderWidth,
                ) || 0,
            }
          : {}),

        ...(patch.borderRadius !==
        undefined
          ? {
              fieldBorderRadius:
                Number(
                  patch.borderRadius,
                ) || 0,

              optionBorderRadius:
                Number(
                  patch.borderRadius,
                ) || 0,
            }
          : {}),
      },
    };
  }

  /*
   * ================================================================
   * SHOWCASE TITLE FRAME
   * ================================================================
   */

  if (
    target ===
    "titleFrame"
  ) {
    return {
      ...block,

      data: {
        ...data,

        titleFrameStyle: {
          ...(
            data.titleFrameStyle ??
            {}
          ),

          ...normalizeAppearancePatch(
            patch,
          ),
        },
      },
    };
  }

  /*
   * ================================================================
   * SHOWCASE CHOICE FRAME
   * ================================================================
   */

  if (
    target ===
    "optionFrame"
  ) {
    return {
      ...block,

      data: {
        ...data,

        optionFrameStyle: {
          ...(
            data.optionFrameStyle ??
            {}
          ),

          ...normalizeAppearancePatch(
            patch,
          ),
        },
      },
    };
  }

  /*
   * ================================================================
   * SHOWCASE IMAGE FRAME
   * ================================================================
   */

  if (
    target ===
    "imageFrame"
  ) {
    return {
      ...block,

      data: {
        ...data,

        imageFrameStyle: {
          ...(
            data.imageFrameStyle ??
            {}
          ),

          ...normalizeAppearancePatch(
            patch,
          ),
        },
      },
    };
  }

  /*
   * ================================================================
   * SHOWCASE SELECTION INDICATOR
   * ================================================================
   */

  if (
    target ===
    "selectionIndicator"
  ) {
    return {
      ...block,

      data: {
        ...data,

        selectionIndicatorStyle: {
          ...(
            data.selectionIndicatorStyle ??
            {}
          ),

          /*
           * The standard appearance toolbar controls the normal
           * circle state. The inspector separately controls
           * `selectedColor`.
           */
          ...(patch.backgroundColor !==
          undefined
            ? {
                backgroundColor:
                  patch.backgroundColor,
              }
            : {}),

          ...(patch.borderColor !==
          undefined
            ? {
                borderColor:
                  patch.borderColor,
              }
            : {}),

          ...(patch.borderWidth !==
          undefined
            ? {
                borderWidth:
                  Number(
                    patch.borderWidth,
                  ) || 0,
              }
            : {}),

          /*
           * Keep this target compatible with generic radius controls
           * even though the renderer will visually keep the selector
           * circular.
           */
          ...(patch.borderRadius !==
          undefined
            ? {
                borderRadius:
                  Number(
                    patch.borderRadius,
                  ) || 0,
              }
            : {}),
        },
      },
    };
  }

  /*
   * ================================================================
   * SHOWCASE SUBMIT BUTTON
   * ================================================================
   */

  return {
    ...block,

    data: {
      ...data,

      submitButtonStyle: {
        ...(
          data.submitButtonStyle ??
          {}
        ),

        ...normalizeAppearancePatch(
          patch,
        ),
      },
    },
  };
}