// components\preview\PlacedBlocksPreview.tsx

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as htmlToImage from "html-to-image";
import {
  LiveRuntimeProvider,
  useLiveRuntime,
} from "@/components/live/LiveRuntimeContext";

import LiveJoinExperience from "@/components/live/LiveJoinExperience";

import type {
  BuilderDraft,
  GridPlacement,
  TextStyle,
} from "@/lib/templates/builder";
import BlockRenderer from "@/components/preview/BlockRenderer";
import {
  getMetadata,
  getResolvedPageColor,
  getResolvedPageGrid,
  getResolvedPageStyle,
  getResolvedPageValue,
  getCanvasInnerBackgroundStyle,
} from "@/components/builder/metadata/metadataResolver";

export type LiveExperienceContext = {
  id: string;
  micrositeId: string;
  name: string;
  status:
    | "before"
    | "live"
    | "paused"
    | "ended"
    | "after";
  isEnabled: boolean;
  startedAt: string | null;
  endedAt: string | null;
};

type Props = {
  draft: BuilderDraft;
  designKey: string;
  previewMode?: boolean;
  micrositeId?: string | null;
  micrositeSlug?: string | null;
  liveExperience?: LiveExperienceContext | null;
  serverNow?: number;
  fixedScale?: number;
  disableAutoScale?: boolean;
  transparentPageBackground?: boolean;
  hideFrame?: boolean;
};

type DraftWithExtras = BuilderDraft & {
  templateName?: string;
  pageColor?: string;
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";

pageLength?: number;

  pages?: Array<{
    id: string;
    slug: string;
    title?: string | null;
    display_order?: number | null;
    draft?: BuilderDraft;
  }>;

  pageVisibility?: Partial<{
    title: boolean;
    subtitle: boolean;
    subtext: boolean;
    description: boolean;
  }>;

  pageElements?: {
    title?: Partial<GridPlacement>;
    subtitle?: Partial<GridPlacement>;
    subtext?: Partial<GridPlacement>;
    description?: Partial<GridPlacement>;
  };

  pageBlockAppearance?: Partial<
    Record<
      "title" | "subtitle" | "subtext" | "description",
      {
        backgroundColor?: string;
      }
    >
  >;
};

type ResolvedGrid = GridPlacement & {
  zIndex?: number;
};

import { MICROSITE_PAGE_WIDTH } from "@/lib/constants/layout";

const BASE_PAGE_WIDTH = MICROSITE_PAGE_WIDTH - 68;

const GRID_COLUMNS = 12;
const GRID_GAP = 16;

const HIDE_PREVIEW_SCROLLBAR_STYLE: React.CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const BOOKMARK_ANIMATION_STYLES = `
  @keyframes koBookmarkPulseDot {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.35);
    }

    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    65% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(1.35);
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.7);
    }
  }

  @keyframes koBookmarkRipple {
    0% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(0.2);
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(3);
    }
  }

  @keyframes koBookmarkFlashHighlight {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.7);
    }

    20% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(1);
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.35);
    }
  }
`;

function getPageLengthConfig(
  length?: unknown,
) {
  const numericLength =
    typeof length === "number"
      ? length
      : Number(length);

  const pageHeight =
    Number.isFinite(numericLength)
      ? Math.max(
          1200,
          Math.min(
            5600,
            Math.round(numericLength),
          ),
        )
      : 1800;

  return {
    widthRatio: 1,
    pageHeight,
  };
}

function getColumnWidth(pageWidth: number) {
  return (pageWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
}

function getStrideX(pageWidth: number) {
  return getColumnWidth(pageWidth) + GRID_GAP;
}

function getStrideY(rowHeight: number) {
  return rowHeight + GRID_GAP;
}

function normalizeResolvedGrid(
  grid: Partial<ResolvedGrid> | GridPlacement | undefined,
  fallback: ResolvedGrid,
): ResolvedGrid {
  return {
    colStart: grid?.colStart ?? fallback.colStart,
    rowStart: grid?.rowStart ?? fallback.rowStart,
    colSpan: grid?.colSpan ?? fallback.colSpan,
    rowSpan: grid?.rowSpan ?? fallback.rowSpan,
    zIndex: grid?.zIndex ?? fallback.zIndex ?? 1,
  };
}

function getItemStyle(
  grid: ResolvedGrid,
  pageWidth: number,
  rowHeight: number,
): React.CSSProperties {
  const strideX = getStrideX(pageWidth);
  const strideY = getStrideY(rowHeight);

  return {
    position: "absolute",
    left: (grid.colStart - 1) * strideX,
    top: (grid.rowStart - 1) * strideY,
    width: grid.colSpan * strideX - GRID_GAP,
    height: grid.rowSpan * strideY - GRID_GAP,
    zIndex: grid.zIndex ?? 1,
  };
}

function getInlineTextStyle(style?: TextStyle) {
  const decorations: string[] = [];

  if (style?.underline) decorations.push("underline");
  if (style?.strike) decorations.push("line-through");

  return {
    fontFamily:
      style?.fontFamily && style.fontFamily !== "inherit"
        ? style.fontFamily
        : "inherit",
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: decorations.length ? decorations.join(" ") : "none",
    textAlign: style?.align ?? "left",
    color: style?.color || undefined,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    overflowWrap: "anywhere" as const,
    lineHeight: 1.2,
  };
}


function getPageTextBoxStyle(
  draft: DraftWithExtras,
  key: "title" | "subtitle" | "subtext" | "description",
): React.CSSProperties {
  const bg = draft.pageBlockAppearance?.[key]?.backgroundColor;

  return {
    backgroundColor: bg && bg !== "transparent" ? bg : undefined,
  };
}

function hasMeaningfulText(value?: string) {
  return typeof value === "string" && value.trim().length > 0;
}

function LiveJoinEntryGate({
  joinBlock,
  onGateActiveChange,
}: {
  joinBlock: Extract<
    BuilderDraft["blocks"][number],
    { type: "live_join" }
  > | null;

  onGateActiveChange: (
    active: boolean,
  ) => void;
}) {
const {
  authenticated,
  sessionLoading,
  experience,
} = useLiveRuntime();

const [
  gateWasShown,
  setGateWasShown,
] = useState(false);

const [
  gateFinished,
  setGateFinished,
] = useState(false);

useEffect(() => {
  if (
    !joinBlock ||
    sessionLoading ||
    authenticated
  ) {
    return;
  }

  setGateWasShown(true);
}, [
  joinBlock,
  sessionLoading,
  authenticated,
]);

useEffect(() => {
  if (
    !authenticated ||
    !gateWasShown ||
    gateFinished
  ) {
    return;
  }

  const timeoutId = window.setTimeout(() => {
    setGateFinished(true);
  }, 2000);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [
  authenticated,
  gateWasShown,
  gateFinished,
]);

useEffect(() => {
  const gateActive =
    Boolean(joinBlock) &&
    !sessionLoading &&
    !gateFinished &&
    (!authenticated || gateWasShown);

  onGateActiveChange(gateActive);

  return () => {
    onGateActiveChange(false);
  };
}, [
  joinBlock,
  sessionLoading,
  authenticated,
  gateWasShown,
  gateFinished,
  onGateActiveChange,
]);

if (
  !joinBlock ||
  sessionLoading ||
  gateFinished ||
  (authenticated && !gateWasShown)
) {
  return null;
}

  const data = joinBlock.data as any;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 2147483000,
      }}
    >
      {/* Darkened / blurred microsite */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Temporary entry card */}
      <div
        className="relative w-full max-w-md"
        style={{
          ...(joinBlock.appearance
            ?.backgroundColor
            ? {
                backgroundColor:
                  joinBlock.appearance
                    .backgroundColor,
              }
            : {
                backgroundColor:
                  "#ffffff",
              }),

          borderColor:
            joinBlock.appearance
              ?.borderColor ??
            "#e5e7eb",

          borderWidth: `${
            joinBlock.appearance
              ?.borderWidth ?? 1
          }px`,

          borderStyle: "solid",

          borderRadius: `${
            joinBlock.appearance
              ?.borderRadius ?? 16
          }px`,

          padding: "24px",

          boxShadow:
            "0 24px 80px rgba(0, 0, 0, 0.35)",
        }}
      >
{authenticated && gateWasShown ? (
  <div className="flex min-h-[180px] w-full flex-col items-center justify-center text-center">
    <div
      className="text-xl font-semibold"
      style={
        data.headingStyle ??
        data.style
      }
    >
      You're now connected
    </div>

<div
  className="mt-2 text-sm opacity-70"
  style={
    data.helperTextStyle ??
    data.style
  }
>
  You're now connected to{" "}
  <span className="font-semibold">
    {experience?.name ||
      "the Live Experience"}
  </span>
  .
</div>
  </div>
) : (
  <LiveJoinExperience
    heading={
      data.heading ||
      "Join Live Experience"
    }
    helperText={
      data.helperText ||
      "Enter a display name to participate."
    }
    namePlaceholder={
      data.namePlaceholder ||
      "Display name"
    }
    joinButtonLabel={
      data.joinButtonLabel ||
      "Join Experience"
    }
    connectedLabel={
      data.connectedLabel ||
      "Live Participant"
    }
    leaveButtonLabel={
      data.leaveButtonLabel ||
      "Leave Experience"
    }

    headingStyle={
      data.headingStyle ??
      data.style
    }
    helperTextStyle={
      data.helperTextStyle ??
      data.style
    }
    namePlaceholderStyle={
      data.namePlaceholderStyle ??
      data.style
    }
    joinButtonTextStyle={
      data.joinButtonTextStyle ??
      data.style
    }
    connectedLabelStyle={
      data.connectedLabelStyle ??
      data.style
    }
    participantNameStyle={
      data.participantNameStyle ??
      data.style
    }
    connectedMessageStyle={
      data.connectedMessageStyle ??
      data.style
    }
    leaveButtonTextStyle={
      data.leaveButtonTextStyle ??
      data.style
    }

    inputStyle={
      data.inputStyle ?? {}
    }
    joinButtonStyle={
      data.joinButtonStyle ?? {}
    }
    leaveButtonStyle={
      data.leaveButtonStyle ?? {}
    }
    avatarButtonTextStyle={
  data.avatarButtonTextStyle ?? data.style
}
replaceButtonTextStyle={
  data.replaceButtonTextStyle ?? data.style
}
removeButtonTextStyle={
  data.removeButtonTextStyle ?? data.style
}

avatarButtonStyle={
  data.avatarButtonStyle ?? {}
}
replaceButtonStyle={
  data.replaceButtonStyle ?? {}
}
removeButtonStyle={
  data.removeButtonStyle ?? {}
}
  />
)}
      </div>
    </div>
  );
}

export default function PlacedBlocksPreview({
  draft,
  designKey,
  previewMode = false,
  micrositeId = null,
  micrositeSlug = null,
  liveExperience = null,
  serverNow,
  fixedScale = 1,
  disableAutoScale = false,
  transparentPageBackground = false,
  hideFrame = false,
}: Props) {
  const typedDraft = draft as DraftWithExtras;
  const templateKey = typedDraft.templateName || "";
  const metadata = getMetadata(templateKey, designKey);
const containerRef = useRef<HTMLDivElement | null>(null);
const revealFocusTargetRef = useRef<string | null>(null);
const [revealFocusRequest, setRevealFocusRequest] = useState<{
  targetId: string;
  collapsed: boolean;
} | null>(null);

useEffect(() => {
  if (!revealFocusRequest?.collapsed) return;

  const target = document.getElementById(
    `block-${revealFocusRequest.targetId}`,
  );

  if (!target) return;

const targetHeight = target.getBoundingClientRect().height;
const viewportHeight = window.innerHeight;

target.scrollIntoView({
  behavior: "smooth",
  block: targetHeight > viewportHeight - 32 ? "start" : "center",
  inline: "center",
});
}, [revealFocusRequest]);

const [containerWidth, setContainerWidth] = useState<number>(0);
const [collapsedRevealIds, setCollapsedRevealIds] =
  useState<Set<string>>(() => new Set());

type LiveAnimation = "focus" | "spotlight";

const [activeLiveAnimation, setActiveLiveAnimation] = useState<{
  blockId: string;
  animation: LiveAnimation;
} | null>(null);

const [liveFocusOffset, setLiveFocusOffset] = useState<{
  x: number;
  y: number;
  scale: number;
} | null>(null);

const handleLiveAnimationClick = useCallback(
  (
    event: React.MouseEvent<HTMLDivElement>,
    blockId: string,
    animation: string,
  ) => {
    if (animation !== "focus" && animation !== "spotlight") {
      return;
    }

const target = event.target;

if (!(target instanceof Element)) return;

    // Preserve normal operation of interactive elements.
    if (
      target.closest(
        [
          "button",
          "input",
          "textarea",
          "select",
          "option",
          "a",
          "label",
          "summary",
          "[contenteditable]",
          '[role="button"]',
          '[role="link"]',
          '[role="textbox"]',
          '[role="slider"]',
          '[role="switch"]',
          '[role="checkbox"]',
          '[role="radio"]',
          '[role="combobox"]',
          '[role="listbox"]',
          '[role="menuitem"]',
          '[role="tab"]',
          "[data-no-live-animation]",
        ].join(","),
      )
    ) {
      return;
    }

if (activeLiveAnimation) {
  if (activeLiveAnimation.blockId === blockId) {
    setActiveLiveAnimation(null);
  }
  return;
}

setActiveLiveAnimation({
  blockId,
  animation,
});
  },
  [activeLiveAnimation],
);


useEffect(() => {
  if (!activeLiveAnimation) return;

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setActiveLiveAnimation(null);
    }
  };

  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("keydown", handleEscape);
  };
}, [activeLiveAnimation]);

const handleRevealCollapsedChange = useCallback(
  (blockId: string, collapsed: boolean) => {
    console.log("PARENT REVEAL HANDLER CALLED", {
      blockId,
      collapsed,
    });

    const revealBlock = (draft.blocks ?? []).find(
      (block) => block.id === blockId,
    );

    const shouldZoomFocus =
      revealBlock?.type === "cta" &&
      revealBlock.data.styleType === "reveal" &&
      (revealBlock.data as any).revealAction === "zoom_focus";

    setCollapsedRevealIds((previous) => {
      const next = new Set(previous);

      if (collapsed) {
        next.add(blockId);
      } else {
        next.delete(blockId);
      }

      return next;
    });

if (shouldZoomFocus) {

  const revealGrid = revealBlock?.grid;

  const underlyingLiveBlock = collapsed && revealGrid
    ? (draft.blocks ?? [])
        .filter((candidate) => {
          if (!candidate.type.startsWith("live_")) return false;
          if (candidate.id === blockId) return false;

          const grid = candidate.grid;
          if (!grid) return false;

          const overlapsHorizontally =
            grid.colStart < revealGrid.colStart + revealGrid.colSpan &&
            grid.colStart + grid.colSpan > revealGrid.colStart;

          const overlapsVertically =
            grid.rowStart < revealGrid.rowStart + revealGrid.rowSpan &&
            grid.rowStart + grid.rowSpan > revealGrid.rowStart;

          return overlapsHorizontally && overlapsVertically;
        })
        .sort(
          (a, b) =>
            (b.grid?.zIndex ?? 0) - (a.grid?.zIndex ?? 0),
        )[0]
    : undefined;

revealFocusTargetRef.current =
  collapsed ? (underlyingLiveBlock?.id ?? null) : null;

setRevealFocusRequest(
  collapsed && underlyingLiveBlock
    ? {
        targetId: underlyingLiveBlock.id,
        collapsed: true,
      }
    : null,
);

console.log("REVEAL LIVE FOCUS TARGET", {
  revealBlockId: blockId,
  collapsed,
  liveBlockId: revealFocusTargetRef.current,
  liveBlockType: underlyingLiveBlock?.type ?? null,
});
}
  },
  [draft.blocks],
);

const [activeBookmarkSlug, setActiveBookmarkSlug] =
  useState<string | null>(null);

const [
  liveJoinGateActive,
  setLiveJoinGateActive,
] = useState(false);

const handleLiveJoinGateActiveChange =
  useCallback((active: boolean) => {
    setLiveJoinGateActive(active);
  }, []);

useEffect(() => {
  let timeoutId: number | null = null;

  function activateBookmarkAnimation(
    slug: string,
  ) {
    const cleanSlug =
      decodeURIComponent(slug).trim();

    if (!cleanSlug) {
      return;
    }

    const bookmark =
      (draft.blocks ?? []).find(
        (candidate) =>
          candidate.type === "bookmark" &&
          String(
            (candidate.data as any).slug ||
              candidate.id,
          ) === cleanSlug,
      );

    if (!bookmark) {
      return;
    }

    const animation =
      (bookmark.data as any).animation ??
      "none";

    if (animation === "none") {
      return;
    }

    /*
     * Clear first so the animation can restart
     * when the same bookmark is clicked again.
     */
    setActiveBookmarkSlug(null);

    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setActiveBookmarkSlug(
          cleanSlug,
        );

        timeoutId =
          window.setTimeout(() => {
            setActiveBookmarkSlug(
              null,
            );
          }, 900);
      });
    });
  }

  /*
   * Native hash navigation.
   */
  function handleHashChange() {
    activateBookmarkAnimation(
      window.location.hash.replace(
        /^#/,
        "",
      ),
    );
  }

  /*
   * Ko-Host Button / Link navigation.
   *
   * CTA navigation uses history.replaceState(),
   * which intentionally does not produce a
   * native hashchange event.
   */
  function handleKoHostBookmarkTarget(
    event: Event,
  ) {
    const customEvent =
      event as CustomEvent<{
        slug?: string;
      }>;

    const slug =
      String(
        customEvent.detail?.slug ??
          "",
      ).trim();

    if (!slug) {
      return;
    }

    activateBookmarkAnimation(
      slug,
    );
  }

  window.addEventListener(
    "hashchange",
    handleHashChange,
  );

  window.addEventListener(
    "ko-host-bookmark-target",
    handleKoHostBookmarkTarget,
  );

  /*
   * Handles arriving on a page whose URL
   * already contains the bookmark hash.
   */
  if (window.location.hash) {
    handleHashChange();
  }

  return () => {
    window.removeEventListener(
      "hashchange",
      handleHashChange,
    );

    window.removeEventListener(
      "ko-host-bookmark-target",
      handleKoHostBookmarkTarget,
    );

    if (timeoutId !== null) {
      window.clearTimeout(
        timeoutId,
      );
    }
  };
}, [draft.blocks]);

const liveJoinBlock = useMemo(() => {
  const block = (draft.blocks ?? []).find(
    (
      candidate,
    ): candidate is Extract<
      (typeof draft.blocks)[number],
      { type: "live_join" }
    > =>
      candidate.type === "live_join",
  );

  return block ?? null;
}, [draft.blocks]);

  const pageLengthConfig = useMemo(
    () => getPageLengthConfig(typedDraft.pageLength),
    [typedDraft.pageLength],
  );

const logicalPageWidth = BASE_PAGE_WIDTH;
  const logicalRowHeight = 100;

  const pageColor =
    (typedDraft.pageColor && typedDraft.pageColor.trim()) ||
    getResolvedPageColor(draft, designKey, metadata);

  const pageBackgroundImage = (typedDraft.pageBackgroundImage || "").trim();
  const pageBackgroundImageFit = typedDraft.pageBackgroundImageFit ?? "zoom";

  const pageBackgroundSize =
    pageBackgroundImageFit === "clip"
      ? "contain"
      : pageBackgroundImageFit === "stretch"
        ? "100% 100%"
        : "cover";

  const titleGrid = normalizeResolvedGrid(
    getResolvedPageGrid(
      typedDraft.pageElements?.title,
      metadata?.page.title?.grid,
      {
        colStart: 2,
        rowStart: 1,
        colSpan: 8,
        rowSpan: 2,
        zIndex: 1,
      },
    ),
    {
      colStart: 2,
      rowStart: 1,
      colSpan: 8,
      rowSpan: 2,
      zIndex: 1,
    },
  );

  const subtitleGrid = normalizeResolvedGrid(
    getResolvedPageGrid(
      typedDraft.pageElements?.subtitle,
      metadata?.page.subtitle?.grid,
      {
        colStart: 2,
        rowStart: 3,
        colSpan: 7,
        rowSpan: 1,
        zIndex: 1,
      },
    ),
    {
      colStart: 2,
      rowStart: 3,
      colSpan: 7,
      rowSpan: 1,
      zIndex: 1,
    },
  );

  const subtextGrid = normalizeResolvedGrid(
    getResolvedPageGrid(
      typedDraft.pageElements?.subtext,
      metadata?.page.tagline?.grid,
      {
        colStart: 2,
        rowStart: 4,
        colSpan: 6,
        rowSpan: 1,
        zIndex: 1,
      },
    ),
    {
      colStart: 2,
      rowStart: 4,
      colSpan: 6,
      rowSpan: 1,
      zIndex: 1,
    },
  );

  const descriptionGrid = normalizeResolvedGrid(
    getResolvedPageGrid(
      typedDraft.pageElements?.description,
      metadata?.page.description?.grid,
      {
        colStart: 2,
        rowStart: 5,
        colSpan: 8,
        rowSpan: 2,
        zIndex: 1,
      },
    ),
    {
      colStart: 2,
      rowStart: 5,
      colSpan: 8,
      rowSpan: 2,
      zIndex: 1,
    },
  );

  const titleStyle = getResolvedPageStyle(
    draft.titleStyle,
    metadata?.page.title?.style,
  );
  const subtitleStyle = getResolvedPageStyle(
    draft.subtitleStyle,
    metadata?.page.subtitle?.style,
  );
  const subtextStyle = getResolvedPageStyle(
    draft.subtextStyle,
    metadata?.page.tagline?.style,
  );
  const descriptionStyle = getResolvedPageStyle(
    draft.descriptionStyle,
    metadata?.page.description?.style,
  );

  const titleValue = getResolvedPageValue(
    draft.title,
    metadata?.page.title?.value,
  );
  const subtitleValue = getResolvedPageValue(
    draft.subtitle,
    metadata?.page.subtitle?.value,
  );
  const subtextValue = getResolvedPageValue(
    draft.subtext,
    metadata?.page.tagline?.value,
  );
  const descriptionValue = getResolvedPageValue(
    draft.description,
    metadata?.page.description?.value,
  );

const showTitle =
  typedDraft.pageVisibility?.title === true &&
  (hasMeaningfulText(titleValue) || !!typedDraft.pageElements?.title);

  const showSubtitle =
    typedDraft.pageVisibility?.subtitle !== false &&
    (hasMeaningfulText(subtitleValue) || !!typedDraft.pageElements?.subtitle);

  const showSubtext =
    typedDraft.pageVisibility?.subtext !== false &&
    (hasMeaningfulText(subtextValue) || !!typedDraft.pageElements?.subtext);

  const showDescription =
    typedDraft.pageVisibility?.description !== false &&
    (hasMeaningfulText(descriptionValue) ||
      !!typedDraft.pageElements?.description);

const [listingQuantities, setListingQuantities] = useState<Record<string, number>>({});

const blockEntries = useMemo(() => {
  const blocks =
    [...(draft.blocks || [])];

  /*
   * Build a quick lookup of Content Panel slideshow blocks.
   *
   * A block is considered slide-owned only when:
   * 1. It references a Content Panel parent.
   * 2. That parent still exists.
   * 3. The parent is currently a Slide Show.
   * 4. The referenced slide still exists inside that panel.
   *
   * This prevents stale ownership metadata from causing a normal
   * canvas block to disappear later if a panel/slide is removed.
   */
  const contentPanelSlideLookup =
    new Map<
      string,
      Set<string>
    >();

  blocks.forEach((candidate) => {
    if (
      candidate.type !==
      "content_panel"
    ) {
      return;
    }

    if (
      candidate.data
        .styleVariant !==
      "slideshow"
    ) {
      return;
    }

    const slideIds =
      new Set(
        (
          candidate.data
            .panels ?? []
        )
          .map(
            (panel) =>
              panel.id,
          )
          .filter(Boolean),
      );

    contentPanelSlideLookup.set(
      candidate.id,
      slideIds,
    );
  });

  return blocks
    .map((block, index) => {
      const normalizedGrid =
        normalizeResolvedGrid(
          block.grid,
          {
            colStart: 1,
            rowStart:
              index + 1,
            colSpan: 12,
            rowSpan: 1,
            zIndex:
              index + 1,
          },
        );

      const contentPanelParentId =
        block
          .contentPanelParentId
          ?.trim() ??
        "";

      const contentPanelSlideId =
        block
          .contentPanelSlideId
          ?.trim() ??
        "";

      const parentSlideIds =
        contentPanelParentId
          ? contentPanelSlideLookup.get(
              contentPanelParentId,
            )
          : undefined;

      const isSlideOwned =
        Boolean(
          contentPanelParentId &&
            contentPanelSlideId &&
            parentSlideIds?.has(
              contentPanelSlideId,
            ),
        );

      return {
        block,

        grid:
          normalizedGrid,

        zIndex:
          normalizedGrid.zIndex ??
          index + 1,

        rowEnd:
          normalizedGrid.rowStart +
          normalizedGrid.rowSpan -
          1,

        /*
         * Slide ownership metadata.
         *
         * For now this is informational only.
         * The next step will use it to change where the block renders.
         */
        isSlideOwned,

        contentPanelParentId:
          isSlideOwned
            ? contentPanelParentId
            : null,

        contentPanelSlideId:
          isSlideOwned
            ? contentPanelSlideId
            : null,
      };
    })
    .sort(
      (a, b) =>
        a.zIndex -
        b.zIndex,
    );
}, [draft.blocks]);

const availableCartItems = useMemo(() => {
  return blockEntries
    .map(({ block }) => {
      if (block.type !== "listing") return null;

      const data = block.data as any;

      if (!data?.addToCart) return null;

      const safePrice =
        typeof data.price === "number" && Number.isFinite(data.price)
          ? Math.max(0, data.price)
          : 0;

      if (safePrice <= 0) return null;

      const safeTitle =
        typeof data.title === "string" && data.title.trim()
          ? data.title.trim()
          : typeof data.sku === "string" && data.sku.trim()
            ? data.sku.trim()
            : "Item";

      const safeDescription =
        typeof data.description === "string" && data.description.trim()
          ? data.description.trim()
          : typeof data.sku === "string" && data.sku.trim()
            ? data.sku.trim()
            : `ITEM-${block.id.slice(-6).toUpperCase()}`;

      return {
        id: block.id,
        title: safeTitle,
        description: safeDescription,
        price: safePrice,
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        title: string;
        description: string;
        price: number;
      } => item !== null,
    );
}, [blockEntries]);

useEffect(() => {
  function updateWidth() {
    const node = containerRef.current;
    if (!node) return;
    setContainerWidth(node.clientWidth || 0);
  }

  const node = containerRef.current;
  if (!node) return;

  updateWidth();

  const observer = new ResizeObserver(() => {
    updateWidth();
  });

  observer.observe(node);
  window.addEventListener("resize", updateWidth);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", updateWidth);
  };
}, []);

useEffect(() => {
  setListingQuantities((prev) => {
    const validIds = new Set(availableCartItems.map((item) => item.id));
    const next: Record<string, number> = {};

    for (const item of availableCartItems) {
      const rawQty = prev[item.id];
      next[item.id] =
        typeof rawQty === "number" && Number.isFinite(rawQty)
          ? Math.max(0, Math.floor(rawQty))
          : 0;
    }

    return next;
  });
}, [availableCartItems]);

const cartItems = useMemo(() => {
  return availableCartItems
    .map((item) => {
      const rawQty = listingQuantities[item.id];
      const quantity =
        typeof rawQty === "number" && Number.isFinite(rawQty)
          ? Math.max(0, Math.floor(rawQty))
          : 0;

      if (quantity <= 0) return null;

      return {
        ...item,
        quantity,
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        title: string;
        description: string;
        price: number;
        quantity: number;
      } => item !== null,
    );
}, [availableCartItems, listingQuantities]);

const textRowEnds = [
  showTitle ? titleGrid.rowStart + titleGrid.rowSpan - 1 : 0,
  showSubtitle ? subtitleGrid.rowStart + subtitleGrid.rowSpan - 1 : 0,
  showSubtext ? subtextGrid.rowStart + subtextGrid.rowSpan - 1 : 0,
  showDescription ? descriptionGrid.rowStart + descriptionGrid.rowSpan - 1 : 0,
];

const cartSubtotal = useMemo(() => {
  return cartItems.reduce((sum, item) => {
    const safePrice =
      typeof item.price === "number" && Number.isFinite(item.price)
        ? Math.max(0, item.price)
        : 0;

    const safeQuantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.max(0, Math.floor(item.quantity))
        : 0;

    if (safePrice <= 0 || safeQuantity <= 0) return sum;

    return sum + safePrice * safeQuantity;
  }, 0);
}, [cartItems]);


const contentRowEnd = Math.max(
  ...textRowEnds,

  ...blockEntries
    .filter(
      (entry) =>
        !entry.isSlideOwned,
    )
    .map(
      (entry) =>
        entry.rowEnd,
    ),

  1,
);

const pageHeight = pageLengthConfig.pageHeight;

const availableWidth = Math.round(
  containerRef.current?.getBoundingClientRect().width || containerWidth || logicalPageWidth
);

const fitScale =
  availableWidth > 0
    ? Math.min(1, availableWidth / logicalPageWidth)
    : 1;

const previewScale = disableAutoScale
  ? (fixedScale ?? 1)
  : Math.max(0.01, fitScale);

const scaledPageHeight = pageHeight * previewScale;
const scaledContentWidthPercent =
  previewScale > 0
    ? (containerWidth || logicalPageWidth) / (logicalPageWidth * previewScale) * 100
    : 100;

    useEffect(() => {
  if (
    !activeLiveAnimation ||
    activeLiveAnimation.animation !== "focus"
  ) {
    setLiveFocusOffset(null);
    return;
  }

  const container = containerRef.current;
  if (!container) return;

  const block = Array.from(
    container.querySelectorAll<HTMLElement>(
      "[data-preview-block-id]",
    ),
  ).find(
    (element) =>
      element.dataset.previewBlockId ===
      activeLiveAnimation.blockId,
  );

  if (!block) return;

const calculateOffset = () => {
  const rect = block.getBoundingClientRect();

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const margin = 8;

  const availableWidth = viewportWidth - margin * 2;
  const availableHeight = viewportHeight - margin * 2;

  const zoomScale = Math.min(
    availableWidth / Math.max(rect.width, 1),
    availableHeight / Math.max(rect.height, 1),
    3,
  );

  const scale = Math.max(0.01, previewScale);

  const currentX = liveFocusOffset?.x ?? 0;
  const currentY = liveFocusOffset?.y ?? 0;

  setLiveFocusOffset({
    x:
      currentX +
      (viewportWidth / 2 -
        (rect.left + rect.width / 2)) /
        scale,
    y:
      currentY +
      (viewportHeight / 2 -
        (rect.top + rect.height / 2)) /
        scale,
    scale: zoomScale,
  });
};

  const frame = window.requestAnimationFrame(calculateOffset);

  return () => window.cancelAnimationFrame(frame);
}, [activeLiveAnimation, previewScale]);

return (
  <LiveRuntimeProvider liveExperience={liveExperience}>
    <>

      <style>{BOOKMARK_ANIMATION_STYLES}</style>

      {!previewMode && liveExperience ? (
<LiveJoinEntryGate
  joinBlock={liveJoinBlock}
  onGateActiveChange={
    handleLiveJoinGateActiveChange
  }
/>
      ) : null}

    <div
      ref={containerRef}
  data-ko-preview-scrollbar-hidden="true"
  className="m-0 block w-full max-w-none p-0"
  style={{
    position: "relative",
    width: "100%",
    margin: 0,
    padding: 0,
    overflowX: "auto",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    ...HIDE_PREVIEW_SCROLLBAR_STYLE,
    touchAction: "auto",
    backgroundColor: transparentPageBackground ? "transparent" : pageColor,
    ...(pageBackgroundImage && !transparentPageBackground
      ? {
          backgroundImage: `url("${pageBackgroundImage}")`,
          backgroundSize: pageBackgroundSize,
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }
      : {}),
  }}
>
<div
  style={{
    position: "relative",
    width: "100%",
    minHeight: scaledPageHeight,
    margin: 0,
    padding: 0,
    overflow: "visible",
    WebkitOverflowScrolling: "touch",
    touchAction: "auto",
    backgroundColor: transparentPageBackground ? "transparent" : pageColor,
    boxSizing: "border-box",
    ...(transparentPageBackground
      ? {}
      : getCanvasInnerBackgroundStyle(draft, designKey, metadata)),
    ...(pageBackgroundImage && !transparentPageBackground
      ? {
          backgroundImage: `url("${pageBackgroundImage}")`,
          backgroundSize: pageBackgroundSize,
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }
      : {}),
    ...(hideFrame
      ? {}
      : {
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: "8px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }),
  }}
>
<div
  style={{
    position: "relative",
    width: "100%",
    minHeight: scaledPageHeight,
    margin: 0,
    padding: 0,
overflow: activeLiveAnimation?.animation === "focus"
  ? "visible"
  : "hidden",
  }}
>
<div
  style={{
    position: "absolute",
    left: "50%",
    top: 0,
    width: logicalPageWidth,
    minHeight: pageHeight,
    margin: 0,
    padding: 0,
    overflow: "visible",
    transform: `translateX(-50%) scale(${previewScale})`,
    transformOrigin: "top center",
    willChange: "transform",
  }}
>
  {activeLiveAnimation && (
  <div
    aria-label="Close Live Block animation"
    onClick={() => setActiveLiveAnimation(null)}
    style={{
      position: "absolute",
      inset: 0,
      minHeight: pageHeight,
      zIndex: 2147482000,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      cursor: "pointer",
    }}
  />
)}
{showTitle ? (
  <div
    style={{
      ...getItemStyle(
        titleGrid,
        logicalPageWidth,
        logicalRowHeight,
      ),
      pointerEvents: "none",
    }}
  >
            <div
              className="h-full w-full p-3"
              style={getPageTextBoxStyle(typedDraft, "title")}
            >
              <div style={getInlineTextStyle(titleStyle)}>{titleValue}</div>
            </div>
          </div>
        ) : null}

{showSubtitle ? (
  <div
    style={{
      ...getItemStyle(
        subtitleGrid,
        logicalPageWidth,
        logicalRowHeight,
      ),
      pointerEvents: "none",
    }}
  >
            <div
              className="h-full w-full p-3"
              style={getPageTextBoxStyle(typedDraft, "subtitle")}
            >
              <div style={getInlineTextStyle(subtitleStyle)}>
                {subtitleValue}
              </div>
            </div>
          </div>
        ) : null}

{showSubtext ? (
  <div
    style={{
      ...getItemStyle(
        subtextGrid,
        logicalPageWidth,
        logicalRowHeight,
      ),
      pointerEvents: "none",
    }}
  >
            <div
              className="h-full w-full p-3"
              style={getPageTextBoxStyle(typedDraft, "subtext")}
            >
              <div style={getInlineTextStyle(subtextStyle)}>{subtextValue}</div>
            </div>
          </div>
        ) : null}

{showDescription ? (
  <div
    style={{
      ...getItemStyle(
        descriptionGrid,
        logicalPageWidth,
        logicalRowHeight,
      ),
      pointerEvents: "none",
    }}
  >
            <div
              className="h-full w-full p-3"
              style={getPageTextBoxStyle(typedDraft, "description")}
            >
              <div style={getInlineTextStyle(descriptionStyle)}>
                {descriptionValue}
              </div>
            </div>
          </div>
        ) : null} 

{blockEntries.map(
  ({
    block,
    grid,
    isSlideOwned,
  }) => {
    /*
     * Blocks assigned to a Content Panel slide are no longer
     * rendered as independent page-level canvas blocks.
     *
     * They will be rendered with their owning slide instead.
     */
    if (isSlideOwned) {
      return null;
    }
const baseItemStyle = getItemStyle(
  grid,
  logicalPageWidth,
  logicalRowHeight,
);

const isCollapsedReveal =
  block.type === "cta" &&
  block.data.styleType === "reveal" &&
  collapsedRevealIds.has(block.id);

const itemStyle =
  block.type === "bookmark"
    ? {
        ...baseItemStyle,
        width: 4,
        height: 4,
        minWidth: 4,
        minHeight: 4,
      }
    : isCollapsedReveal
      ? {
          ...baseItemStyle,
          left:
            Number(baseItemStyle.left) +
            Number(baseItemStyle.width) -
            getColumnWidth(logicalPageWidth),
          top:
            Number(baseItemStyle.top) +
            Number(baseItemStyle.height) -
            logicalRowHeight * 1.25,
          width: getColumnWidth(logicalPageWidth),
          height: logicalRowHeight * 1.25,
        }
      : baseItemStyle;
const showVerticalScrollbar =
  (block as any).showVerticalScrollbar === true ||
  (block.data as any)?.showVerticalScrollbar === true;

const showHorizontalScrollbar =
  (block as any).showHorizontalScrollbar === true ||
  (block.data as any)?.showHorizontalScrollbar === true;

const isScrollableBlock =
  block.type === "calendar_event" ||
  showVerticalScrollbar ||
  showHorizontalScrollbar;

const isInteractiveBlock =
  block.type === "live_join" ||
  block.type === "live_trivia" ||
  block.type === "live_poll" ||
  block.type === "live_player_card" ||
  block.type === "live_schedule" ||
  block.type === "live_song_request" ||
  block.type === "live_spin_wheel" ||
  block.type === "live_scavenger_hunt" ||
  block.type === "live_lottery" ||
  block.type === "live_leaderboard" ||
  block.type === "live_mystery_drop" ||
  block.type === "live_announcement" ||
  block.type === "schedule_agenda" ||
  block.type === "checklist" ||
  block.type === "rsvp" ||
  block.type === "letter_fill" ||
  block.type === "form_field" ||
  block.type === "poll" ||
  block.type === "thread" ||
  block.type === "post_board" ||
  block.type === "enrollment_board" ||
  block.type === "file_share" ||
  block.type === "checkout" ||
  block.type === "cart" ||
  block.type === "listing" ||
  block.type === "donation" ||
  block.type === "cta" ||
  block.type === "links" ||
  block.type === "faq" ||
  block.type === "puzzle" ||
  block.type === "spin_wheel" ||
  block.type === "spreadsheet" ||
  block.type === "audio" ||
  block.type === "video" ||
  block.type === "frame";

  async function handleDownloadFrame(
  frameBlock: Extract<BuilderDraft["blocks"][number], { type: "frame" }>,
) {
  const root = containerRef.current;
  if (!root) return;

  const frameEl = root.querySelector<HTMLElement>(
    `[data-preview-block-id="${frameBlock.id}"]`,
  );

  if (!frameEl) return;

  const rootRect = root.getBoundingClientRect();
  const frameRect = frameEl.getBoundingClientRect();

  const dataUrl = await htmlToImage.toPng(root, {
    cacheBust: true,
    pixelRatio: 2,
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return node.dataset.frameDownloadButton !== "true";
    },
  });

  const image = new window.Image();
  image.src = dataUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error("Unable to load frame export image."));
  });

  const scaleX = image.width / rootRect.width;
  const scaleY = image.height / rootRect.height;

  const cropX = (frameRect.left - rootRect.left) * scaleX;
  const cropY = (frameRect.top - rootRect.top) * scaleY;
  const cropWidth = frameRect.width * scaleX;
  const cropHeight = frameRect.height * scaleY;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(cropWidth));
  canvas.height = Math.max(1, Math.round(cropHeight));

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

const croppedUrl = canvas.toDataURL("image/png");

const { jsPDF } = await import("jspdf");

const orientation =
  canvas.width >= canvas.height ? "landscape" : "portrait";

const pdf = new jsPDF({
  orientation,
  unit: "px",
  format: [canvas.width, canvas.height],
});

pdf.addImage(croppedUrl, "PNG", 0, 0, canvas.width, canvas.height);

pdf.save(`${frameBlock.data.frameName?.trim() || "frame-capture"}.pdf`);
}

  return (
<div
  key={block.id}
  data-preview-block-id={block.id}
  data-preview-block-type={block.type}
  onClick={(event) => {
  if (!block.type.startsWith("live_")) return;

  handleLiveAnimationClick(
    event,
    block.id,
    String((block.data as any).animation ?? "none"),
  );
}}
  id={
    block.type === "bookmark"
      ? String((block.data as any).slug || block.id)
      : undefined
  }
style={{
  ...itemStyle,

transform:
  activeLiveAnimation?.blockId === block.id &&
  activeLiveAnimation.animation === "focus" &&
  liveFocusOffset
    ? `translate(${liveFocusOffset.x}px, ${liveFocusOffset.y}px) scale(${liveFocusOffset.scale})`
    : undefined,

transformOrigin: "center center",

  zIndex:
    activeLiveAnimation?.blockId === block.id
      ? 2147483000
      : block.type === "bookmark"
        ? -1
        : itemStyle.zIndex,

  transition:
    activeLiveAnimation?.blockId === block.id
      ? "transform 350ms ease, box-shadow 350ms ease"
      : undefined,

  overflow: isScrollableBlock ? "hidden" : "visible",

  pointerEvents:
    block.type === "bookmark"
      ? "none"
      : liveJoinGateActive &&
          block.type === "live_join"
        ? "none"
        : previewMode
          ? "auto"
          : isInteractiveBlock
            ? "auto"
            : "none",

  isolation: "isolate",
}}
    >

    {block.type === "bookmark" &&
activeBookmarkSlug ===
  String((block.data as any).slug || block.id) ? (
  (() => {
    const animation =
      (block.data as any).animation ?? "none";

const animationColor =
  String(
    (block.data as any).animationColor ??
      "#2563EB",
  );

    if (animation === "none") {
      return null;
    }

    const commonStyle: React.CSSProperties = {
      position: "absolute",
      left: "50%",
      top: "50%",
      pointerEvents: "none",
      zIndex: 9999,
    };

    if (animation === "pulse_dot") {
      return (
        <span
          aria-hidden="true"
          style={{
            ...commonStyle,
            width: 14,
            height: 14,
            borderRadius: "9999px",
backgroundColor: animationColor,
boxShadow: `0 0 0 5px color-mix(in srgb, ${animationColor} 18%, transparent)`,
            animation:
              "koBookmarkPulseDot 800ms ease-out forwards",
          }}
        />
      );
    }

    if (animation === "ripple") {
      return (
        <span
          aria-hidden="true"
          style={{
            ...commonStyle,
            width: 22,
            height: 22,
            borderRadius: "9999px",
            border: `3px solid ${animationColor}`,
            animation:
              "koBookmarkRipple 850ms ease-out forwards",
          }}
        />
      );
    }

    if (animation === "flash_highlight") {
      return (
        <span
          aria-hidden="true"
          style={{
            ...commonStyle,
            width: 52,
            height: 28,
            borderRadius: "9999px",
background: `color-mix(in srgb, ${animationColor} 22%, transparent)`,
boxShadow: `0 0 22px color-mix(in srgb, ${animationColor} 55%, transparent)`,
            animation:
              "koBookmarkFlashHighlight 850ms ease-out forwards",
          }}
        />
      );
    }

    return null;
  })()
) : null}

<div
  data-ko-preview-scrollbar-hidden={
    showVerticalScrollbar || showHorizontalScrollbar ? "false" : "true"
  }
  className="h-full w-full"
  style={{
    height: "100%",
    maxHeight: "100%",
    width: "100%",
    maxWidth: "100%",
overflowX:
  showHorizontalScrollbar
    ? "scroll"
    : "hidden",

overflowY:
  showVerticalScrollbar ||
  block.type === "calendar_event"
    ? "scroll"
    : "hidden",
    WebkitOverflowScrolling: "touch",
    overscrollBehavior: "auto",
    ...(showVerticalScrollbar || showHorizontalScrollbar
      ? {}
      : HIDE_PREVIEW_SCROLLBAR_STYLE),
    pointerEvents:
      block.type === "bookmark"
        ? "none"
        : previewMode
          ? "auto"
          : isInteractiveBlock
            ? "auto"
            : "none",
  }}

  onTouchMove={(event) => {
    if (isScrollableBlock) {
      event.stopPropagation();
    }
  }}
>
{(() => {
  const previewBlock =
    block.type === "text_fx"
      ? (() => {
          const hasTexture = Boolean(
            block.data.style?.textureEnabled &&
              block.data.style?.textureImageUrl,
          );

          return {
            ...block,
            data: {
              ...block.data,
              style: {
                ...block.data.style,
                color: hasTexture
                  ? "transparent"
                  : block.data.style?.color,
                WebkitTextFillColor: hasTexture
                  ? "transparent"
                  : block.data.style?.color,
                backgroundImage: hasTexture
                  ? `url("${block.data.style?.textureImageUrl}")`
                  : undefined,
                backgroundRepeat: hasTexture ? "repeat" : undefined,
                backgroundSize: hasTexture
                  ? `${block.data.style?.textureScale ?? 100}%`
                  : undefined,
                backgroundPosition: hasTexture
                  ? `${block.data.style?.texturePositionX ?? 50}% ${
                      block.data.style?.texturePositionY ?? 50
                    }%`
                  : undefined,
                backgroundClip: hasTexture ? "text" : undefined,
                WebkitBackgroundClip: hasTexture ? "text" : undefined,
              } as any,
            },
          };
        })()
      : block;

return (
  <div
    key={`${previewBlock.id}-${JSON.stringify(previewBlock.data)}`}
    id={`block-${previewBlock.id}`}
    data-public-block-id={previewBlock.id}
    className="h-full w-full"
    style={{
      scrollMarginTop: "24px",
    }}
  >
    <BlockRenderer
      block={previewBlock}
      blocks={draft.blocks}
      pages={typedDraft.pages}
      designKey={designKey}
      micrositeId={micrositeId}
      micrositeSlug={
        micrositeSlug ||
        (draft as any).slug ||
        (draft as any).siteSlug ||
        (draft as any).micrositeSlug ||
        null
      }
      liveExperience={liveExperience}
        serverNow={serverNow}
        previewMode={previewMode}
        onRevealCollapsedChange={handleRevealCollapsedChange}
        revealCollapsed={collapsedRevealIds.has(previewBlock.id)}
        cartItems={cartItems}
      cartSubtotal={cartSubtotal}
      listingQuantities={listingQuantities}
      onDownloadFrame={handleDownloadFrame as any}
      onChangeListingQuantity={(
        listingId: string,
        nextQuantity: number,
      ) => {
        setListingQuantities((prev) => ({
          ...prev,
          [listingId]: Math.max(
            0,
            Math.floor(nextQuantity || 0),
          ),
        }));
      }}
    />
  </div>
);
})()}
    </div>
    </div>
  );
})}
      </div>
    </div>
  </div>
</div>
    </>
  </LiveRuntimeProvider>
);
}