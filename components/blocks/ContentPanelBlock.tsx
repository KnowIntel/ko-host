"use client";

import { useEffect, useState } from "react";
import type { MicrositeBlock, TextStyle } from "@/lib/templates/builder";

type ContentPanelBlockProps = {
  block: Extract<MicrositeBlock, { type: "content_panel" }>;
  designKey?: string;
};

type ContentPanelBlock = Extract<MicrositeBlock, { type: "content_panel" }>;
type PanelItem = ContentPanelBlock["data"]["panels"][number];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getPanelStorageKey(blockId: string) {
  return `ko-host-content-panel-${blockId}`;
}

function textStyleToCss(style?: TextStyle): React.CSSProperties {
  if (!style) return {};

  return {
    color: style.color,
    fontFamily: style.fontFamily,
    fontSize:
      typeof style.fontSize === "number" ? `${style.fontSize}px` : undefined,
    fontWeight: style.bold ? 700 : undefined,
    fontStyle: style.italic ? "italic" : undefined,
    textDecoration: [
      style.underline ? "underline" : "",
      style.strike ? "line-through" : "",
    ]
      .filter(Boolean)
      .join(" "),
    textAlign: style.align,
    letterSpacing:
      typeof (style as any).letterSpacing === "number"
        ? `${(style as any).letterSpacing}px`
        : undefined,
    lineHeight:
      typeof (style as any).lineHeight === "number"
        ? (style as any).lineHeight
        : undefined,
  };
}

function getBlockAppearanceStyle(block: MicrositeBlock): React.CSSProperties {
  return {
    backgroundColor:
      block.appearance?.backgroundColor &&
      block.appearance.backgroundColor !== "transparent"
        ? block.appearance.backgroundColor
        : undefined,
    borderColor: block.appearance?.borderColor || undefined,
    borderWidth:
      typeof block.appearance?.borderWidth === "number"
        ? `${block.appearance.borderWidth}px`
        : undefined,
    borderStyle:
      typeof block.appearance?.borderWidth === "number" &&
      block.appearance.borderWidth > 0
        ? "solid"
        : undefined,
    borderRadius:
      typeof block.appearance?.borderRadius === "number"
        ? `${block.appearance.borderRadius}px`
        : undefined,
  };
}

export default function ContentPanelBlock({ block }: ContentPanelBlockProps) {
  const panels = Array.isArray(block.data.panels) ? block.data.panels : [];

  const fallbackPanelId = panels[0]?.id ?? "";
  const defaultPanelId =
    panels.find((panel) => panel.id === block.data.defaultPanelId)?.id ??
    fallbackPanelId;

  const [selectedPanelId, setSelectedPanelId] = useState(defaultPanelId);

  const baseStyle = ((block.data as any).style ?? {}) as TextStyle;

  const headingStyle = {
    ...baseStyle,
    ...(((block.data as any).headingStyle ?? {}) as TextStyle),
  };

  const subtitleStyle = {
    ...baseStyle,
    ...(((block.data as any).subtitleStyle ?? {}) as TextStyle),
  };

  const navigationStyle = {
    ...baseStyle,
    ...(((block.data as any).navigationStyle ?? {}) as TextStyle),
  };

  const panelStyle = {
    ...baseStyle,
    ...(((block.data as any).panelStyle ?? {}) as TextStyle),
  };

  const activeNavigationBackground =
    typeof (block.data as any).activeNavigationBackground === "string"
      ? (block.data as any).activeNavigationBackground
      : "#dbeafe";

  const activeNavigationColor =
    typeof (block.data as any).activeNavigationColor === "string"
      ? (block.data as any).activeNavigationColor
      : "#1d4ed8";

  const inactiveNavigationBackground =
    typeof (block.data as any).inactiveNavigationBackground === "string"
      ? (block.data as any).inactiveNavigationBackground
      : "#ffffff";

  const panelBackground =
    typeof (block.data as any).panelBackground === "string"
      ? (block.data as any).panelBackground
      : "#f9fafb";

  useEffect(() => {
    if (!block.data.rememberSelection || typeof window === "undefined") return;

    const storedPanelId = window.localStorage.getItem(
      getPanelStorageKey(block.id),
    );

    if (storedPanelId && panels.some((panel) => panel.id === storedPanelId)) {
      setSelectedPanelId(storedPanelId);
    }
  }, [block.id, block.data.rememberSelection, panels]);

  useEffect(() => {
    if (!panels.some((panel) => panel.id === selectedPanelId)) {
      setSelectedPanelId(defaultPanelId);
    }
  }, [defaultPanelId, panels, selectedPanelId]);

  function selectPanel(panelId: string) {
    setSelectedPanelId(panelId);

    if (block.data.rememberSelection && typeof window !== "undefined") {
      window.localStorage.setItem(getPanelStorageKey(block.id), panelId);
    }
  }

  const selectedPanel =
    panels.find((panel) => panel.id === selectedPanelId) ?? panels[0];

  const variant = block.data.variant ?? "tabs";
  const transition = block.data.transition ?? "fade";

  const fixedHeight =
    block.data.autoHeight === false && typeof block.data.fixedHeight === "number"
      ? Math.max(180, block.data.fixedHeight)
      : undefined;

  const contentClass =
    transition === "none"
      ? ""
      : transition === "slide_left"
        ? "animate-[contentPanelSlideLeft_220ms_ease-out]"
        : transition === "slide_right"
          ? "animate-[contentPanelSlideRight_220ms_ease-out]"
          : transition === "scale"
            ? "animate-[contentPanelScale_220ms_ease-out]"
            : transition === "flip"
              ? "animate-[contentPanelFlip_260ms_ease-out]"
              : "animate-[contentPanelFade_200ms_ease-out]";

  if (!panels.length) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/70 p-4 text-center text-sm text-neutral-500">
        Add panels in the Content Panel settings.
      </div>
    );
  }

  return (
    <div
      className="pointer-events-auto relative z-10 flex h-full w-full min-h-0 flex-col overflow-hidden p-4 text-neutral-900"
      style={{
        ...getBlockAppearanceStyle(block),
        height: fixedHeight,
      }}
    >
      <style>{`
        @keyframes contentPanelFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes contentPanelSlideLeft {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes contentPanelSlideRight {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes contentPanelScale {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes contentPanelFlip {
          from { opacity: 0; transform: rotateX(-8deg); }
          to { opacity: 1; transform: rotateX(0); }
        }
      `}</style>

      {block.data.showHeading !== false && block.data.heading ? (
        <div
          className="text-lg font-semibold"
          style={textStyleToCss(headingStyle)}
        >
          {block.data.heading}
        </div>
      ) : null}

      {block.data.showSubtitle !== false && block.data.subtitle ? (
        <div className="mt-1 text-sm" style={textStyleToCss(subtitleStyle)}>
          {block.data.subtitle}
        </div>
      ) : null}

      <div
className={cx(
  "mt-4 flex min-h-0 flex-1 flex-col",
  variant === "sidebar" ? "md:grid md:grid-cols-[180px_1fr] md:gap-4" : "",
)}
      >
        {variant === "accordion" ? (
          <div className="space-y-2">
            {panels.map((panel) => {
              const isOpen = panel.id === selectedPanelId;

              return (
                <div
                  key={panel.id}
                  className="overflow-hidden rounded-xl border border-neutral-200"
                >
<button
  type="button"
  onClick={() => selectPanel(panel.id)}
  className="pointer-events-auto flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-semibold"
  style={{
                      ...textStyleToCss(navigationStyle),
                      backgroundColor: isOpen
                        ? activeNavigationBackground
                        : inactiveNavigationBackground,
                      color: isOpen
                        ? activeNavigationColor
                        : navigationStyle.color,
                    }}
                  >
                    <span>
                      {panel.icon ? (
                        <span className="mr-2">{panel.icon}</span>
                      ) : null}
                      {panel.title}
                    </span>
                    <span>{isOpen ? "−" : "+"}</span>
                  </button>

                  {isOpen ? (
                    <div
                      className={cx("max-h-full overflow-y-auto p-3", contentClass)}
                      style={{
                        ...textStyleToCss(panelStyle),
                        backgroundColor: panelBackground,
                      }}
                    >
                      <PanelContent panel={panel} panelStyle={panelStyle} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <nav
              role="tablist"
              aria-label={block.data.heading || "Content panels"}
              className={cx(
                variant === "tabs"
                  ? "flex gap-2 overflow-x-auto pb-1"
                  : variant === "cards"
                    ? "grid gap-2 sm:grid-cols-2"
                    : "flex gap-2 overflow-x-auto md:flex-col md:overflow-visible",
              )}
            >
              {panels.map((panel) => {
                const isSelected = panel.id === selectedPanelId;

                return (
                  <button
                    key={panel.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`content-panel-${block.id}-${panel.id}`}
                    id={`content-panel-tab-${block.id}-${panel.id}`}
                    onClick={() => selectPanel(panel.id)}
className={cx(
  "pointer-events-auto rounded-xl border px-3 py-2 text-left text-sm transition",
                      isSelected
                        ? "border-blue-500"
                        : panel.featured
                          ? "border-amber-300 hover:opacity-90"
                          : "border-neutral-200 hover:opacity-90",
                      variant === "tabs" ? "shrink-0 font-semibold" : "",
                      variant === "cards" ? "min-h-[72px]" : "",
                    )}
                    style={{
                      ...textStyleToCss(navigationStyle),
                      backgroundColor: isSelected
                        ? activeNavigationBackground
                        : inactiveNavigationBackground,
                      color: isSelected
                        ? activeNavigationColor
                        : navigationStyle.color,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {panel.icon ? <span>{panel.icon}</span> : null}

                      <span className="font-semibold">{panel.title}</span>

                      {panel.featured ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                          Featured
                        </span>
                      ) : null}

                      {panel.badge ? (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                          {panel.badge}
                        </span>
                      ) : null}
                    </div>

                    {variant === "cards" && panel.subtitle ? (
                      <div className="mt-1 text-xs opacity-75">
                        {panel.subtitle}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div
              key={selectedPanel?.id}
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
                variant === "sidebar" ? "mt-0" : "",
                contentClass,
              )}
              style={{
                ...textStyleToCss(panelStyle),
                backgroundColor: panelBackground,
              }}
            >
              {selectedPanel ? (
                <PanelContent panel={selectedPanel} panelStyle={panelStyle} />
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PanelContent({
  panel,
  panelStyle,
}: {
  panel: PanelItem;
  panelStyle?: TextStyle;
}) {
  const panelCss = textStyleToCss(panelStyle);

  const image = panel.imageUrl ? (
    <img
      src={panel.imageUrl}
      alt={panel.imageAlt || panel.title}
      className="max-h-56 w-full rounded-xl object-cover"
    />
  ) : null;

  const text = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        {panel.icon ? <span className="text-lg">{panel.icon}</span> : null}

        <div className="text-base font-semibold">{panel.title}</div>

        {panel.badge ? (
          <span className="rounded-full bg-white px-2 py-0.5 text-xs text-neutral-600">
            {panel.badge}
          </span>
        ) : null}
      </div>

      {panel.subtitle ? (
        <div className="mt-1 text-sm opacity-75">{panel.subtitle}</div>
      ) : null}

{panel.content ? (
  <div
    className="mt-3 whitespace-pre-line"
    style={panelCss}
  >
    {panel.content}
  </div>
) : null}
    </div>
  );

  if (!image) return text;

  if (panel.imagePosition === "left" || panel.imagePosition === "right") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {panel.imagePosition === "left" ? image : text}
        {panel.imagePosition === "left" ? text : image}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {panel.imagePosition === "below" ? text : image}
      {panel.imagePosition === "below" ? image : text}
    </div>
  );
}