import type {
  MicrositeBlock,
  TextStyle,
} from "@/lib/templates/builder";

type HighlightBlock = Extract<
  MicrositeBlock,
  { type: "highlight" }
>;

/*
 * ================================================================
 * TEXT TARGETS
 * ================================================================
 */

export type HighlightTextTarget =
  | "heading"
  | "subtitle"
  | "label"
  | "linearUnitLabel"
  | "value"
  | "prefix"
  | "suffix"
  | "description"
  | "dataCardDataPointLabel"
  | "dataCardValue"
  | "dataCardUnit"
  | "dataCardPercentage";

/*
 * ================================================================
 * STYLE TARGETS
 * ================================================================
 */

export type HighlightStyleTarget =
  | "section"
  | "block"
  | "dataCardFrame"
  | "dataCardImageFrame"
  | "dataCardProgressTrack"
  | "dataCardProgressFill";

function isHighlightBlock(
  block: MicrositeBlock,
): block is HighlightBlock {
  return block.type === "highlight";
}

/*
 * ================================================================
 * TEXT STYLE KEYS
 * ================================================================
 */

function getTextStyleKey(
  target: HighlightTextTarget,
) {
  if (target === "heading") {
    return "headingStyle";
  }

  if (target === "subtitle") {
    return "subtitleStyle";
  }

  if (target === "label") {
    return "labelStyle";
  }

  if (target === "linearUnitLabel") {
    return "linearUnitLabelStyle";
  }

  if (target === "value") {
    return "valueStyle";
  }

  if (target === "prefix") {
    return "prefixStyle";
  }

  if (target === "suffix") {
    return "suffixStyle";
  }

  if (target === "description") {
    return "descriptionStyle";
  }

  if (
    target ===
    "dataCardDataPointLabel"
  ) {
    return "dataCardDataPointLabelStyle";
  }

  if (
    target === "dataCardValue"
  ) {
    return "dataCardValueStyle";
  }

  if (
    target === "dataCardUnit"
  ) {
    return "dataCardUnitStyle";
  }

  return "dataCardPercentageStyle";
}

/*
 * ================================================================
 * GET TEXT STYLE
 * ================================================================
 */

export function getHighlightTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,

  target: HighlightTextTarget,
): TextStyle {
  if (
    !block ||
    block.type !== "highlight"
  ) {
    return {};
  }

  const data =
    block.data as any;

  const styleKey =
    getTextStyleKey(target);

  /*
   * Data Card text targets should fall back to the closest existing
   * Highlight text style if a saved draft does not yet contain the new
   * Data Card-specific style object.
   */
  if (
    target ===
    "dataCardDataPointLabel"
  ) {
    return (
      data.dataCardDataPointLabelStyle ??
      data.labelStyle ??
      data.style ??
      {}
    );
  }

  if (
    target === "dataCardValue"
  ) {
    return (
      data.dataCardValueStyle ??
      data.valueStyle ??
      data.style ??
      {}
    );
  }

  if (
    target === "dataCardUnit"
  ) {
    return (
      data.dataCardUnitStyle ??
      data.labelStyle ??
      data.style ??
      {}
    );
  }

  if (
    target ===
    "dataCardPercentage"
  ) {
    return (
      data.dataCardPercentageStyle ??
      data.valueStyle ??
      data.style ??
      {}
    );
  }

  return (
    data[styleKey] ??
    data.style ??
    {}
  );
}

/*
 * ================================================================
 * APPLY TEXT STYLE
 * ================================================================
 */

export function applyHighlightTextStylePatch(
  block: MicrositeBlock,

  target: HighlightTextTarget,

  patch: Partial<TextStyle>,
): MicrositeBlock {
  if (!isHighlightBlock(block)) {
    return block;
  }

  const data =
    block.data as any;

  const styleKey =
    getTextStyleKey(target);

  return {
    ...block,

    data: {
      ...data,

      [styleKey]: {
        ...(
          data[styleKey] ??
          getHighlightTextStyle(
            block,
            target,
          ) ??
          {}
        ),

        ...patch,
      },
    },
  };
}

/*
 * ================================================================
 * APPEARANCE NORMALIZATION
 * ================================================================
 */

function normalizeAppearancePatch(
  patch: Record<string, any>,
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
            Number(
              patch.backgroundOpacity,
            ),
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
 * APPLY STYLE / APPEARANCE
 * ================================================================
 */

export function applyHighlightStylePatch(
  block: MicrositeBlock,

  target: HighlightStyleTarget,

  patch: Record<string, any>,
): MicrositeBlock {
  if (!isHighlightBlock(block)) {
    return block;
  }

  const data =
    block.data as any;

  /*
   * ================================================================
   * BLOCK
   * ================================================================
   */

  if (target === "block") {
    return {
      ...block,

      appearance: {
        ...(block.appearance ?? {}),

        ...normalizeAppearancePatch(
          patch,
        ),

        ...(patch.textureEnabled !==
        undefined
          ? {
              textureEnabled:
                patch.textureEnabled,
            }
          : {}),

        ...(patch.textureImageUrl !==
        undefined
          ? {
              textureImageUrl:
                patch.textureImageUrl,
            }
          : {}),

        ...(patch.textureScale !==
        undefined
          ? {
              textureScale:
                Number(
                  patch.textureScale,
                ),
            }
          : {}),

        ...(patch.texturePositionX !==
        undefined
          ? {
              texturePositionX:
                Number(
                  patch.texturePositionX,
                ),
            }
          : {}),

        ...(patch.texturePositionY !==
        undefined
          ? {
              texturePositionY:
                Number(
                  patch.texturePositionY,
                ),
            }
          : {}),
      },

      data: {
        ...data,

        style: {
          ...(data.style ?? {}),

          ...patch,
        },
      },
    };
  }

  /*
   * ================================================================
   * SIMPLE HIGHLIGHT SECTION
   * ================================================================
   */

  if (target === "section") {
    return {
      ...block,

      data: {
        ...data,

        cardStyle: {
          ...(data.cardStyle ?? {}),

          ...patch,
        },

        ...(patch.backgroundColor !==
        undefined
          ? {
              cardBackgroundColor:
                patch.backgroundColor,
            }
          : {}),

        ...(patch.backgroundOpacity !==
        undefined
          ? {
              cardBackgroundOpacity:
                Number(
                  patch.backgroundOpacity,
                ),
            }
          : {}),
      },
    };
  }

  /*
   * ================================================================
   * DATA CARD FRAME
   * ================================================================
   */

  if (
    target === "dataCardFrame"
  ) {
    return {
      ...block,

      data: {
        ...data,

        dataCardFrameStyle: {
          ...(data.dataCardFrameStyle ??
            {}),

          ...normalizeAppearancePatch(
            patch,
          ),

          /*
           * Padding is inspector-controlled, but retain it if generic
           * patching ever supplies it.
           */
          ...(patch.padding !==
          undefined
            ? {
                padding:
                  Number(
                    patch.padding,
                  ) || 0,
              }
            : {}),
        },
      },
    };
  }

  /*
   * ================================================================
   * DATA CARD IMAGE FRAME
   * ================================================================
   */

  if (
    target ===
    "dataCardImageFrame"
  ) {
    return {
      ...block,

      data: {
        ...data,

        dataCardImageFrameStyle: {
          ...(data.dataCardImageFrameStyle ??
            {}),

          ...normalizeAppearancePatch(
            patch,
          ),
        },
      },
    };
  }

  /*
   * ================================================================
   * DATA CARD PROGRESS TRACK
   * ================================================================
   */

  if (
    target ===
    "dataCardProgressTrack"
  ) {
    return {
      ...block,

      data: {
        ...data,

        ...(patch.backgroundColor !==
        undefined
          ? {
              progressBarTrackColor:
                patch.backgroundColor,
            }
          : {}),

        ...(patch.backgroundOpacity !==
        undefined
          ? {
              progressBarBackgroundOpacity:
                Number(
                  patch.backgroundOpacity,
                ),
            }
          : {}),

        ...(patch.borderColor !==
        undefined
          ? {
              progressBarBorderColor:
                patch.borderColor,
            }
          : {}),

        ...(patch.borderWidth !==
        undefined
          ? {
              progressBarBorderWidth:
                Number(
                  patch.borderWidth,
                ) || 0,
            }
          : {}),

        ...(patch.borderRadius !==
        undefined
          ? {
              progressBarBorderRadius:
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
   * DATA CARD PROGRESS FILL
   * ================================================================
   */

  return {
    ...block,

    data: {
      ...data,

      ...(patch.backgroundColor !==
      undefined
        ? {
            progressBarFillColor:
              patch.backgroundColor,
          }
        : {}),

      ...(patch.backgroundOpacity !==
      undefined
        ? {
            progressBarFillOpacity:
              Number(
                patch.backgroundOpacity,
              ),
          }
        : {}),

      ...(patch.borderRadius !==
      undefined
        ? {
            progressBarBorderRadius:
              Number(
                patch.borderRadius,
              ) || 0,
          }
        : {}),
    },
  };
}