"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  MicrositeBlock,
  TextStyle,
} from "@/lib/templates/builder";

type ContentPanelBlockProps = {
  block: Extract<
    MicrositeBlock,
    { type: "content_panel" }
  >;

  designKey?: string;

  blocks?: MicrositeBlock[];

  renderOverlayBlock?: (
    block: MicrositeBlock,
  ) => React.ReactNode;
};

type ContentPanelBlock = Extract<
  MicrositeBlock,
  { type: "content_panel" }
>;

type PanelItem =
  ContentPanelBlock["data"]["panels"][number];

function cx(
  ...classes: Array<
    string | false | null | undefined
  >
) {
  return classes
    .filter(Boolean)
    .join(" ");
}

function getPanelStorageKey(
  blockId: string,
) {
  return `ko-host-content-panel-${blockId}`;
}

function textStyleToCss(
  style?: TextStyle,
): React.CSSProperties {
  if (!style) return {};

  return {
    color:
      style.color,

    fontFamily:
      style.fontFamily,

    fontSize:
      typeof style.fontSize ===
      "number"
        ? `${style.fontSize}px`
        : undefined,

    fontWeight:
      style.bold
        ? 700
        : undefined,

    fontStyle:
      style.italic
        ? "italic"
        : undefined,

    textDecoration: [
      style.underline
        ? "underline"
        : "",

      style.strike
        ? "line-through"
        : "",
    ]
      .filter(Boolean)
      .join(" "),

    textAlign:
      style.align,

    letterSpacing:
      typeof (style as any)
        .letterSpacing ===
      "number"
        ? `${
            (style as any)
              .letterSpacing
          }px`
        : undefined,

    lineHeight:
      typeof (style as any)
        .lineHeight ===
      "number"
        ? (style as any)
            .lineHeight
        : undefined,
  };
}

function getBlockAppearanceStyle(
  block: MicrositeBlock,
): React.CSSProperties {
  const appearance =
    block.appearance as any;

  const backgroundOpacity =
    typeof appearance
      ?.backgroundOpacity ===
    "number"
      ? appearance
          .backgroundOpacity
      : 1;

  const backgroundColor =
    appearance
      ?.backgroundColor;

  function hexToRgba(
    color: string,
    opacity: number,
  ) {
    if (
      !color ||
      color ===
        "transparent"
    ) {
      return color;
    }

    if (
      !color.startsWith(
        "#",
      )
    ) {
      return color;
    }

    const raw =
      color.slice(1);

    const hex =
      raw.length === 3
        ? raw
            .split("")
            .map(
              (character) =>
                character +
                character,
            )
            .join("")
        : raw;

    if (
      hex.length !== 6
    ) {
      return color;
    }

    const red =
      Number.parseInt(
        hex.slice(0, 2),
        16,
      );

    const green =
      Number.parseInt(
        hex.slice(2, 4),
        16,
      );

    const blue =
      Number.parseInt(
        hex.slice(4, 6),
        16,
      );

    if (
      [
        red,
        green,
        blue,
      ].some(
        (value) =>
          Number.isNaN(
            value,
          ),
      )
    ) {
      return color;
    }

    return `rgba(${red}, ${green}, ${blue}, ${Math.max(
      0,
      Math.min(
        1,
        backgroundOpacity,
      ),
    )})`;
  }

  return {
    backgroundColor:
      backgroundColor &&
      backgroundColor !==
        "transparent"
        ? hexToRgba(
            backgroundColor,
            backgroundOpacity,
          )
        : backgroundColor ===
            "transparent"
          ? "transparent"
          : undefined,

    borderColor:
      appearance
        ?.borderColor ||
      undefined,

    borderWidth:
      typeof appearance
        ?.borderWidth ===
      "number"
        ? `${
            appearance.borderWidth
          }px`
        : undefined,

    borderStyle:
      typeof appearance
        ?.borderWidth ===
        "number" &&
      appearance.borderWidth >
        0
        ? "solid"
        : undefined,

    borderRadius:
      typeof appearance
        ?.borderRadius ===
      "number"
        ? `${
            appearance.borderRadius
          }px`
        : undefined,
  };
}

export default function ContentPanelBlock({
  block,
  blocks = [],
  renderOverlayBlock,
}: ContentPanelBlockProps) {
  const data =
    block.data as any;

  const panels =
    Array.isArray(
      data.panels,
    )
      ? data.panels
      : [];

  const styleVariant =
    data.styleVariant ===
    "slideshow"
      ? "slideshow"
      : "standard";

  const isSlideshow =
    styleVariant ===
    "slideshow";

  /*
   * ================================================================
   * SHARED STYLES
   * ================================================================
   */

  const baseStyle =
    (data.style ??
      {}) as TextStyle;

  const headingStyle: TextStyle =
    {
      ...baseStyle,
      ...(data.headingStyle ??
        {}),
    };

  const subtitleStyle: TextStyle =
    {
      ...baseStyle,
      ...(data.subtitleStyle ??
        {}),
    };

  const navigationStyle: TextStyle =
    {
      ...baseStyle,
      ...(data.navigationStyle ??
        {}),
    };

  const activeNavigationStyle:
    TextStyle = {
    ...navigationStyle,
    ...(data.activeNavigationStyle ??
      {}),
  };

  const inactiveNavigationStyle:
    TextStyle = {
    ...navigationStyle,
    ...(data.inactiveNavigationStyle ??
      {}),
  };

  const panelStyle: TextStyle =
    {
      ...baseStyle,
      ...(data.panelStyle ??
        {}),
    };

  const activeNavigationBackground =
    typeof data.activeNavigationBackground ===
    "string"
      ? data.activeNavigationBackground
      : "#dbeafe";

  const activeNavigationColor =
    typeof data.activeNavigationColor ===
    "string"
      ? data.activeNavigationColor
      : "#1d4ed8";

  const inactiveNavigationBackground =
    typeof data.inactiveNavigationBackground ===
    "string"
      ? data.inactiveNavigationBackground
      : "#ffffff";

  const inactiveNavigationColor =
    typeof data.inactiveNavigationColor ===
    "string"
      ? data.inactiveNavigationColor
      : inactiveNavigationStyle.color ??
        navigationStyle.color;

  const panelBackground =
    typeof data.panelBackground ===
    "string"
      ? data.panelBackground
      : "#f9fafb";

  const fixedHeight =
    data.autoHeight ===
      false &&
    typeof data.fixedHeight ===
      "number"
      ? Math.max(
          180,
          data.fixedHeight,
        )
      : undefined;

  /*
   * ================================================================
   * EMPTY STATE
   * ================================================================
   */

  if (!panels.length) {
    return (
      <div
        className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/70 p-4 text-center text-sm text-neutral-500"
        style={{
          ...getBlockAppearanceStyle(
            block,
          ),

          height:
            fixedHeight,
        }}
      >
        Add panels in the Content Panel settings.
      </div>
    );
  }

  /*
   * ================================================================
   * SLIDE SHOW
   * ================================================================
   */

  if (isSlideshow) {
    return (
<ContentPanelSlideshow
  block={block}
  panels={panels}
  headingStyle={headingStyle}
  subtitleStyle={subtitleStyle}
  panelStyle={panelStyle}
  panelBackground={panelBackground}
  fixedHeight={fixedHeight}
  blocks={blocks}
  renderOverlayBlock={renderOverlayBlock}
/>
    );
  }

  /*
   * ================================================================
   * STANDARD
   * ================================================================
   */

  return (
    <ContentPanelStandard
      block={block}
      panels={panels}
      headingStyle={
        headingStyle
      }
      subtitleStyle={
        subtitleStyle
      }
      navigationStyle={
        navigationStyle
      }
      activeNavigationStyle={
        activeNavigationStyle
      }
      inactiveNavigationStyle={
        inactiveNavigationStyle
      }
      panelStyle={
        panelStyle
      }
      activeNavigationBackground={
        activeNavigationBackground
      }
      activeNavigationColor={
        activeNavigationColor
      }
      inactiveNavigationBackground={
        inactiveNavigationBackground
      }
      inactiveNavigationColor={
        inactiveNavigationColor
      }
      panelBackground={
        panelBackground
      }
      fixedHeight={
        fixedHeight
      }
    />
  );
}

/*
 * ==================================================================
 * STANDARD CONTENT PANEL
 * ==================================================================
 */

function ContentPanelStandard({
  block,
  panels,
  headingStyle,
  subtitleStyle,
  navigationStyle,
  activeNavigationStyle,
  inactiveNavigationStyle,
  panelStyle,
  activeNavigationBackground,
  activeNavigationColor,
  inactiveNavigationBackground,
  inactiveNavigationColor,
  panelBackground,
  fixedHeight,
}: {
  block: ContentPanelBlock;

  panels: PanelItem[];

  headingStyle: TextStyle;

  subtitleStyle: TextStyle;

  navigationStyle: TextStyle;

  activeNavigationStyle: TextStyle;

  inactiveNavigationStyle: TextStyle;

  panelStyle: TextStyle;

  activeNavigationBackground:
    string;

  activeNavigationColor:
    string;

  inactiveNavigationBackground:
    string;

  inactiveNavigationColor?:
    string;

  panelBackground:
    string;

  fixedHeight?:
    number;
}) {
  const fallbackPanelId =
    panels[0]?.id ??
    "";

  const defaultPanelId =
    panels.find(
      (panel) =>
        panel.id ===
        block.data
          .defaultPanelId,
    )?.id ??
    fallbackPanelId;

  const [
    selectedPanelId,
    setSelectedPanelId,
  ] = useState(
    defaultPanelId,
  );

  const variant =
    block.data.variant ??
    "tabs";

  const transition =
    block.data.transition ??
    "fade";

  /*
   * ================================================================
   * REMEMBER SELECTION
   * ================================================================
   */

  useEffect(() => {
    if (
      !block.data
        .rememberSelection ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    const storedPanelId =
      window.localStorage.getItem(
        getPanelStorageKey(
          block.id,
        ),
      );

    if (
      storedPanelId &&
      panels.some(
        (panel) =>
          panel.id ===
          storedPanelId,
      )
    ) {
      setSelectedPanelId(
        storedPanelId,
      );
    }
  }, [
    block.id,
    block.data
      .rememberSelection,
    panels,
  ]);

  useEffect(() => {
    if (
      !panels.some(
        (panel) =>
          panel.id ===
          selectedPanelId,
      )
    ) {
      setSelectedPanelId(
        defaultPanelId,
      );
    }
  }, [
    defaultPanelId,
    panels,
    selectedPanelId,
  ]);

  function selectPanel(
    panelId: string,
  ) {
    setSelectedPanelId(
      panelId,
    );

    if (
      block.data
        .rememberSelection &&
      typeof window !==
        "undefined"
    ) {
      window.localStorage.setItem(
        getPanelStorageKey(
          block.id,
        ),

        panelId,
      );
    }
  }

  const selectedPanel =
    panels.find(
      (panel) =>
        panel.id ===
        selectedPanelId,
    ) ??
    panels[0];

  const contentClass =
    transition === "none"
      ? ""
      : transition ===
          "slide_left"
        ? "animate-[contentPanelSlideLeft_220ms_ease-out]"
        : transition ===
            "slide_right"
          ? "animate-[contentPanelSlideRight_220ms_ease-out]"
          : transition ===
              "scale"
            ? "animate-[contentPanelScale_220ms_ease-out]"
            : transition ===
                "flip"
              ? "animate-[contentPanelFlip_260ms_ease-out]"
              : "animate-[contentPanelFade_200ms_ease-out]";

  return (
    <div
      className="pointer-events-auto relative flex h-full w-full min-h-0 flex-col overflow-hidden p-4 text-neutral-900"
      style={{
        ...getBlockAppearanceStyle(
          block,
        ),

        height:
          fixedHeight,
      }}
    >
      <ContentPanelKeyframes />

      {block.data
        .showHeading !==
        false &&
      block.data.heading ? (
        <div
          className="text-lg"
          style={textStyleToCss(
            headingStyle,
          )}
        >
          {
            block.data
              .heading
          }
        </div>
      ) : null}

      {block.data
        .showSubtitle !==
        false &&
      block.data
        .subtitle ? (
        <div
          className="mt-1 text-sm"
          style={textStyleToCss(
            subtitleStyle,
          )}
        >
          {
            block.data
              .subtitle
          }
        </div>
      ) : null}

      <div
        className={cx(
          "mt-4 flex min-h-0 flex-1 flex-col",

          variant ===
            "sidebar"
            ? "md:grid md:grid-cols-[180px_1fr] md:gap-4"
            : "",
        )}
      >
        {variant ===
        "accordion" ? (
          <div className="space-y-2">
            {panels.map(
              (panel) => {
                const isOpen =
                  panel.id ===
                  selectedPanelId;

                return (
                  <div
                    key={
                      panel.id
                    }
                    className="overflow-hidden rounded-xl border border-neutral-200"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        selectPanel(
                          panel.id,
                        )
                      }
                      className="pointer-events-auto flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-semibold"
                      style={{
                        ...textStyleToCss(
                          isOpen
                            ? activeNavigationStyle
                            : inactiveNavigationStyle,
                        ),

                        backgroundColor:
                          isOpen
                            ? activeNavigationBackground
                            : inactiveNavigationBackground,

                        color:
                          isOpen
                            ? activeNavigationColor
                            : inactiveNavigationColor,
                      }}
                    >
                      <span>
                        {panel.icon ? (
                          <span className="mr-2">
                            {
                              panel.icon
                            }
                          </span>
                        ) : null}

                        {
                          panel.title
                        }
                      </span>

                      <span>
                        {isOpen
                          ? "−"
                          : "+"}
                      </span>
                    </button>

                    {isOpen ? (
                      <div
                        className={cx(
                          "max-h-full overflow-y-auto p-3",

                          contentClass,
                        )}
                        style={{
                          ...textStyleToCss(
                            panelStyle,
                          ),

                          backgroundColor:
                            panelBackground,
                        }}
                      >
                        <PanelContent
                          panel={
                            panel
                          }
                          panelStyle={
                            panelStyle
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <>
            <nav
              role="tablist"
              aria-label={
                block.data
                  .heading ||
                "Content panels"
              }
              className={cx(
                variant ===
                  "tabs"
                  ? "flex gap-2 overflow-x-auto pb-1"
                  : variant ===
                      "cards"
                    ? "grid gap-2 sm:grid-cols-2"
                    : "flex gap-2 overflow-x-auto md:flex-col md:overflow-visible",
              )}
            >
              {panels.map(
                (panel) => {
                  const isSelected =
                    panel.id ===
                    selectedPanelId;

                  return (
                    <button
                      key={
                        panel.id
                      }
                      type="button"
                      role="tab"
                      aria-selected={
                        isSelected
                      }
                      aria-controls={`content-panel-${block.id}-${panel.id}`}
                      id={`content-panel-tab-${block.id}-${panel.id}`}
                      onClick={() =>
                        selectPanel(
                          panel.id,
                        )
                      }
                      className={cx(
                        "pointer-events-auto rounded-xl border px-3 py-2 text-left text-sm transition",

                        isSelected
                          ? "border-blue-500"
                          : panel.featured
                            ? "border-amber-300 hover:opacity-90"
                            : "border-neutral-200 hover:opacity-90",

                        variant ===
                          "tabs"
                          ? "shrink-0 font-semibold"
                          : "",

                        variant ===
                          "cards"
                          ? "min-h-[72px]"
                          : "",
                      )}
                      style={{
                        ...textStyleToCss(
                          isSelected
                            ? activeNavigationStyle
                            : inactiveNavigationStyle,
                        ),

                        backgroundColor:
                          isSelected
                            ? activeNavigationBackground
                            : inactiveNavigationBackground,

                        color:
                          isSelected
                            ? activeNavigationColor
                            : inactiveNavigationColor,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {panel.icon ? (
                          <span>
                            {
                              panel.icon
                            }
                          </span>
                        ) : null}

                        <span className="font-semibold">
                          {
                            panel.title
                          }
                        </span>

                        {panel.featured ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                            Featured
                          </span>
                        ) : null}

                        {panel.badge ? (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                            {
                              panel.badge
                            }
                          </span>
                        ) : null}
                      </div>

                      {variant ===
                        "cards" &&
                      panel.subtitle ? (
                        <div className="mt-1 text-xs opacity-75">
                          {
                            panel.subtitle
                          }
                        </div>
                      ) : null}
                    </button>
                  );
                },
              )}
            </nav>

            <div
              key={
                selectedPanel?.id
              }
              role="tabpanel"
              id={
                selectedPanel
                  ? `content-panel-${block.id}-${selectedPanel.id}`
                  : undefined
              }
              aria-labelledby={
                selectedPanel
                  ? `content-panel-tab-${block.id}-${selectedPanel.id}`
                  : undefined
              }
              className={cx(
                "mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-neutral-200 p-4",

                variant ===
                  "sidebar"
                  ? "mt-0"
                  : "",

                contentClass,
              )}
              style={{
                ...textStyleToCss(
                  panelStyle,
                ),

                backgroundColor:
                  panelBackground,
              }}
            >
              {selectedPanel ? (
                <PanelContent
                  panel={
                    selectedPanel
                  }
                  panelStyle={
                    panelStyle
                  }
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/*
 * ==================================================================
 * SLIDE SHOW
 * ==================================================================
 */

function ContentPanelSlideshow({
  block,
  panels,
  headingStyle,
  subtitleStyle,
  panelStyle,
  panelBackground,
  fixedHeight,
  blocks,
  renderOverlayBlock,
}: {
  block: ContentPanelBlock;

  panels: PanelItem[];

  headingStyle: TextStyle;

  subtitleStyle: TextStyle;

  panelStyle: TextStyle;

  panelBackground: string;

  fixedHeight?: number;

  blocks: MicrositeBlock[];

  renderOverlayBlock?: (
    block: MicrositeBlock,
  ) => React.ReactNode;
}) {
  const data =
    block.data as any;

  const slideshowMode =
    data.slideshowMode ===
    "automatic"
      ? "automatic"
      : "manual";

  const slideshowDirection =
    data.slideshowDirection ===
    "right"
      ? "right"
      : "left";

  const slideshowLoop =
    data.slideshowLoop !==
    false;

  const showArrows =
    data.slideshowShowArrows !==
    false;

  const showIndicators =
    data.slideshowShowIndicators !==
    false;

  const intervalSeconds =
    Math.max(
      1,
      Math.min(
        120,
        Number(
          data.slideshowInterval ??
            5,
        ) || 5,
      ),
    );

  const initialIndex =
    Math.max(
      0,
      panels.findIndex(
        (panel) =>
          panel.id ===
          data.defaultPanelId,
      ),
    );

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(
    initialIndex,
  );

  const [
    transitionDirection,
    setTransitionDirection,
  ] = useState<
    "left" | "right"
  >(
    slideshowDirection,
  );

  const [
    transitionKey,
    setTransitionKey,
  ] = useState(0);

  const activeIndexRef =
    useRef(
      activeIndex,
    );

  useEffect(() => {
    activeIndexRef.current =
      activeIndex;
  }, [
    activeIndex,
  ]);

  /*
   * Keep selected index valid when slides are added/removed.
   */
  useEffect(() => {
    if (
      activeIndex >=
      panels.length
    ) {
      setActiveIndex(
        Math.max(
          0,
          panels.length -
            1,
        ),
      );
    }
  }, [
    activeIndex,
    panels.length,
  ]);

  /*
   * If the owner changes the default slide, use it.
   */
  useEffect(() => {
    const defaultIndex =
      panels.findIndex(
        (panel) =>
          panel.id ===
          data.defaultPanelId,
      );

    if (
      defaultIndex >= 0
    ) {
      setActiveIndex(
        defaultIndex,
      );
    }
  }, [
    data.defaultPanelId,
    panels,
  ]);

  function goToIndex(
    nextIndex: number,
    direction:
      | "left"
      | "right",
  ) {
    if (
      !panels.length
    ) {
      return;
    }

    let normalizedIndex =
      nextIndex;

    if (
      nextIndex <
      0
    ) {
      normalizedIndex =
        slideshowLoop
          ? panels.length -
            1
          : 0;
    }

    if (
      nextIndex >=
      panels.length
    ) {
      normalizedIndex =
        slideshowLoop
          ? 0
          : panels.length -
            1;
    }

    if (
      normalizedIndex ===
      activeIndexRef.current
    ) {
      return;
    }

    setTransitionDirection(
      direction,
    );

    setActiveIndex(
      normalizedIndex,
    );

    activeIndexRef.current =
      normalizedIndex;

    setTransitionKey(
      (current) =>
        current + 1,
    );
  }

  function goNext() {
    goToIndex(
      activeIndexRef.current +
        1,

      slideshowDirection,
    );
  }

  function goPrevious() {
    goToIndex(
      activeIndexRef.current -
        1,

      slideshowDirection ===
        "left"
        ? "right"
        : "left",
    );
  }

  /*
   * ================================================================
   * AUTOMATIC PLAY
   * ================================================================
   */

  useEffect(() => {
    if (
      slideshowMode !==
        "automatic" ||
      panels.length <=
        1
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          const currentIndex =
            activeIndexRef.current;

          const atEnd =
            currentIndex >=
            panels.length -
              1;

          if (
            atEnd &&
            !slideshowLoop
          ) {
            return;
          }

          goToIndex(
            currentIndex +
              1,

            slideshowDirection,
          );
        },

        intervalSeconds *
          1000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [
    slideshowMode,
    intervalSeconds,
    slideshowDirection,
    slideshowLoop,
    panels.length,
  ]);

  const activePanel =
    panels[
      activeIndex
    ] ??
    panels[0];

/*
 * ================================================================
 * ACTIVE SLIDE OVERLAY BLOCKS
 * ================================================================
 */

const activeSlideBlocks =
  activePanel
    ? blocks.filter(
        (candidate) =>
          candidate.id !== block.id &&
          candidate.contentPanelParentId ===
            block.id &&
          candidate.contentPanelSlideId ===
            activePanel.id,
      )
    : [];

function getSlideOverlayStyle(
  childBlock: MicrositeBlock,
): React.CSSProperties {
  const parentGrid =
    block.grid;

  const childGrid =
    childBlock.grid;

  if (
    !parentGrid ||
    !childGrid ||
    !parentGrid.colSpan ||
    !parentGrid.rowSpan
  ) {
    return {
      position: "absolute",
      inset: 0,
    };
  }

  const left =
    ((childGrid.colStart -
      parentGrid.colStart) /
      parentGrid.colSpan) *
    100;

  const top =
    ((childGrid.rowStart -
      parentGrid.rowStart) /
      parentGrid.rowSpan) *
    100;

  const width =
    (childGrid.colSpan /
      parentGrid.colSpan) *
    100;

  const height =
    (childGrid.rowSpan /
      parentGrid.rowSpan) *
    100;

  return {
    position: "absolute",

    left: `${left}%`,
    top: `${top}%`,

    width: `${width}%`,
    height: `${height}%`,

    zIndex:
      childGrid.zIndex ??
      1,

    overflow: "visible",
  };
}

  const slideAnimationClass =
    transitionDirection ===
    "right"
      ? "animate-[contentPanelSlideshowFromLeft_420ms_cubic-bezier(.22,.8,.22,1)]"
      : "animate-[contentPanelSlideshowFromRight_420ms_cubic-bezier(.22,.8,.22,1)]";

  const controlStyle =
    (data.slideshowControlStyle ??
      {}) as React.CSSProperties;

  const indicatorStyle =
    (data.slideshowIndicatorStyle ??
      {}) as any;

  const indicatorSize =
    Math.max(
      4,
      Math.min(
        28,
        Number(
          indicatorStyle.size ??
            8,
        ) || 8,
      ),
    );

  const indicatorGap =
    Math.max(
      2,
      Math.min(
        30,
        Number(
          indicatorStyle.gap ??
            6,
        ) || 6,
      ),
    );

  const inactiveIndicatorColor =
    String(
      indicatorStyle.backgroundColor ??
        "rgba(17,24,39,0.28)",
    );

  const activeIndicatorColor =
    String(
      indicatorStyle.activeBackgroundColor ??
        "#111827",
    );

  const canGoPrevious =
    slideshowLoop ||
    activeIndex >
      0;

  const canGoNext =
    slideshowLoop ||
    activeIndex <
      panels.length -
        1;

  return (
    <div
      className="pointer-events-auto relative flex h-full w-full min-h-0 flex-col overflow-hidden text-neutral-900"
      style={{
        ...getBlockAppearanceStyle(
          block,
        ),

        height:
          fixedHeight,
      }}
    >
      <ContentPanelKeyframes />

      {/* ========================================================== */}
      {/* SHARED HEADING */}
      {/* ========================================================== */}

      {(block.data
        .showHeading !==
        false &&
        block.data
          .heading) ||
      (block.data
        .showSubtitle !==
        false &&
        block.data
          .subtitle) ? (
        <div className="relative z-20 px-4 pt-4">
          {block.data
            .showHeading !==
            false &&
          block.data
            .heading ? (
            <div
              className="text-lg"
              style={textStyleToCss(
                headingStyle,
              )}
            >
              {
                block.data
                  .heading
              }
            </div>
          ) : null}

          {block.data
            .showSubtitle !==
            false &&
          block.data
            .subtitle ? (
            <div
              className="mt-1 text-sm"
              style={textStyleToCss(
                subtitleStyle,
              )}
            >
              {
                block.data
                  .subtitle
              }
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ========================================================== */}
      {/* SLIDE VIEWPORT */}
      {/* ========================================================== */}

      <div className="relative min-h-0 flex-1 overflow-hidden">
<div
  key={`${activePanel?.id}-${transitionKey}`}
  className={cx(
    "absolute inset-0 h-full w-full",

    slideAnimationClass,
  )}
  style={{
    backgroundColor:
      panelBackground,
  }}
>
  {/* ========================================================== */}
  {/* SLIDE'S OWN CONTENT */}
  {/* ========================================================== */}

  <div
    className="absolute inset-0 h-full w-full overflow-y-auto p-4"
    style={textStyleToCss(
      panelStyle,
    )}
  >
    {activePanel ? (
      <PanelContent
        panel={activePanel}
        panelStyle={panelStyle}
        slideshow
      />
    ) : null}
  </div>

  {/* ========================================================== */}
  {/* BLOCKS ATTACHED TO THIS SLIDE */}
  {/* ========================================================== */}

  {renderOverlayBlock
    ? activeSlideBlocks.map(
        (slideBlock) => (
          <div
            key={slideBlock.id}
            data-content-panel-overlay-block-id={
              slideBlock.id
            }
            style={getSlideOverlayStyle(
              slideBlock,
            )}
          >
            <div className="h-full w-full">
              {renderOverlayBlock(
                slideBlock,
              )}
            </div>
          </div>
        ),
      )
    : null}
</div>

        {/* ======================================================== */}
        {/* MANUAL / OPTIONAL ARROWS */}
        {/* ======================================================== */}

        {showArrows &&
        panels.length >
          1 ? (
          <>
            <button
              type="button"
              onClick={
                goPrevious
              }
              disabled={
                !canGoPrevious
              }
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 z-30 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border text-xl shadow-sm backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                backgroundColor:
                  "rgba(255,255,255,0.82)",

                borderColor:
                  "rgba(17,24,39,0.16)",

                color:
                  "#111827",

                ...controlStyle,
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={
                goNext
              }
              disabled={
                !canGoNext
              }
              aria-label="Next slide"
              className="absolute right-3 top-1/2 z-30 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border text-xl shadow-sm backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                backgroundColor:
                  "rgba(255,255,255,0.82)",

                borderColor:
                  "rgba(17,24,39,0.16)",

                color:
                  "#111827",

                ...controlStyle,
              }}
            >
              ›
            </button>
          </>
        ) : null}

        {/* ======================================================== */}
        {/* INDICATORS */}
        {/* ======================================================== */}

        {showIndicators &&
        panels.length >
          1 ? (
          <div
            className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center rounded-full bg-black/10 px-3 py-2 backdrop-blur"
            style={{
              gap:
                `${indicatorGap}px`,
            }}
          >
            {panels.map(
              (
                panel,
                index,
              ) => {
                const isActive =
                  index ===
                  activeIndex;

                return (
                  <button
                    key={
                      panel.id
                    }
                    type="button"
                    onClick={() => {
                      if (
                        index ===
                        activeIndex
                      ) {
                        return;
                      }

                      goToIndex(
                        index,

                        index >
                          activeIndex
                          ? slideshowDirection
                          : slideshowDirection ===
                              "left"
                            ? "right"
                            : "left",
                      );
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={
                      isActive
                        ? "true"
                        : undefined
                    }
                    className="shrink-0 rounded-full transition-all"
                    style={{
                      width:
                        isActive
                          ? `${Math.round(
                              indicatorSize *
                                2.25,
                            )}px`
                          : `${indicatorSize}px`,

                      height:
                        `${indicatorSize}px`,

                      backgroundColor:
                        isActive
                          ? activeIndicatorColor
                          : inactiveIndicatorColor,
                    }}
                  />
                );
              },
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/*
 * ==================================================================
 * SHARED PANEL CONTENT
 * ==================================================================
 */

function PanelContent({
  panel,
  panelStyle,
  slideshow = false,
}: {
  panel: PanelItem;

  panelStyle?: TextStyle;

  slideshow?: boolean;
}) {
  const panelCss =
    textStyleToCss(
      panelStyle,
    );

  const image =
    panel.imageUrl ? (
      <img
        src={
          panel.imageUrl
        }
        alt={
          panel.imageAlt ||
          panel.title
        }
        className={cx(
          "w-full rounded-xl object-cover",

          slideshow
            ? "max-h-[70%]"
            : "max-h-56",
        )}
      />
    ) : null;

  const body =
    panel.contentStyle ===
    "list_grid" ? (
      <PanelListGrid
        panel={
          panel
        }
        panelStyle={
          panelStyle
        }
      />
    ) : panel.content ? (
      <div
        className="mt-3 whitespace-pre-line"
        style={
          panelCss
        }
      >
        {
          panel.content
        }
      </div>
    ) : null;

  const text = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        {panel.icon ? (
          <span className="text-lg">
            {
              panel.icon
            }
          </span>
        ) : null}

        <div className="text-base">
          {
            panel.title
          }
        </div>

        {panel.badge ? (
          <span className="rounded-full bg-white px-2 py-0.5 text-xs text-neutral-600">
            {
              panel.badge
            }
          </span>
        ) : null}
      </div>

      {panel.subtitle ? (
        <div className="mt-1 text-sm opacity-75">
          {
            panel.subtitle
          }
        </div>
      ) : null}

      {body}
    </div>
  );

  if (!image) {
    return text;
  }

  if (
    panel.imagePosition ===
      "left" ||
    panel.imagePosition ===
      "right"
  ) {
    return (
      <div className="grid h-full gap-4 md:grid-cols-2">
        {panel.imagePosition ===
        "left"
          ? image
          : text}

        {panel.imagePosition ===
        "left"
          ? text
          : image}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {panel.imagePosition ===
      "below"
        ? text
        : image}

      {panel.imagePosition ===
      "below"
        ? image
        : text}
    </div>
  );
}

/*
 * ==================================================================
 * LIST GRID
 * ==================================================================
 */

function PanelListGrid({
  panel,
  panelStyle,
}: {
  panel: PanelItem;

  panelStyle?: TextStyle;
}) {
  const panelCss =
    textStyleToCss(
      panelStyle,
    );

  const grid =
    panel.grid;

  const columns =
    grid?.columns ??
    [];

  const rows =
    grid?.rows ??
    [];

  if (!columns.length) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-neutral-300 p-4 text-sm opacity-70">
        Add columns to this grid.
      </div>
    );
  }

  const showRowLines =
    Boolean(
      grid?.showRowLines,
    );

  const showColumnLines =
    Boolean(
      grid?.showColumnLines,
    );

  const showHeaderRow =
    grid?.showHeaderRow !==
    false;

  const freezeHeaderRow =
    grid?.freezeHeaderRow !==
    false;

  return (
    <div className="mt-3 max-w-full overflow-auto rounded-xl border border-neutral-200 bg-white/70">
      <table
        className="w-full min-w-max border-collapse text-left"
        style={
          panelCss
        }
      >
        {showHeaderRow ? (
          <thead
            className={
              freezeHeaderRow
                ? "sticky top-0 z-10 bg-white"
                : ""
            }
          >
            <tr>
              {columns.map(
                (column) => (
                  <th
                    key={
                      column.id
                    }
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{
                      ...panelCss,

                      borderRight:
                        showColumnLines
                          ? "1px solid rgba(0,0,0,0.12)"
                          : undefined,

                      borderBottom:
                        showRowLines
                          ? "1px solid rgba(0,0,0,0.12)"
                          : undefined,
                    }}
                  >
                    {
                      column.label
                    }
                  </th>
                ),
              )}
            </tr>
          </thead>
        ) : null}

        <tbody>
          {rows.map(
            (row) => (
              <tr
                key={
                  row.id
                }
              >
                {columns.map(
                  (
                    column,
                    columnIndex,
                  ) => {
                    const cell =
                      row.cells[
                        columnIndex
                      ];

                    return (
                      <td
                        key={`${row.id}-${column.id}`}
                        className="px-3 py-2 align-top"
                        style={{
                          ...panelCss,

                          borderRight:
                            showColumnLines
                              ? "1px solid rgba(0,0,0,0.12)"
                              : undefined,

                          borderBottom:
                            showRowLines
                              ? "1px solid rgba(0,0,0,0.12)"
                              : undefined,
                        }}
                      >
                        {(column.type ??
                          cell?.type ??
                          "text") ===
                        "image" ? (
                          cell?.imageUrl ? (
                            <img
                              src={
                                cell.imageUrl
                              }
                              alt={
                                cell.imageAlt ||
                                column.label
                              }
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-[9px] opacity-60">
                              Image
                            </div>
                          )
                        ) : (
                          <span>
                            {
                              cell?.value ??
                              ""
                            }
                          </span>
                        )}
                      </td>
                    );
                  },
                )}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

/*
 * ==================================================================
 * KEYFRAMES
 * ==================================================================
 */

function ContentPanelKeyframes() {
  return (
    <style>{`
      @keyframes contentPanelFade {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      @keyframes contentPanelSlideLeft {
        from {
          opacity: 0;
          transform: translateX(16px);
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes contentPanelSlideRight {
        from {
          opacity: 0;
          transform: translateX(-16px);
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes contentPanelScale {
        from {
          opacity: 0;
          transform: scale(0.97);
        }

        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes contentPanelFlip {
        from {
          opacity: 0;
          transform: rotateX(-8deg);
        }

        to {
          opacity: 1;
          transform: rotateX(0);
        }
      }

      @keyframes contentPanelSlideshowFromRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes contentPanelSlideshowFromLeft {
        from {
          opacity: 0;
          transform: translateX(-100%);
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `}</style>
  );
}