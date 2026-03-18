"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  CarouselImageItem,
  MicrositeBlock,
  LinkItem,
  PollOption,
  FaqItem,
  TextStyle,
  GalleryImage,
  ShowcaseImage,
  ThreadMessage,
} from "@/lib/templates/builder";

import {
  Dancing_Script,
  Pacifico,
  Allura,
  Parisienne,
  Sacramento,
  Playball,
  Satisfy,
  Tangerine,
  Prata,
  Marcellus,
  Bodoni_Moda,
  Cinzel,
  Libre_Baskerville,
  Merriweather,
  Lora,
  Crimson_Text,
} from "next/font/google";

type Props = {
  block: MicrositeBlock;
  designKey?: string;
};

const FONT_FAMILY_MAP: Record<string, string> = {
  Inter: 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
  "DM Sans":
    'var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif',
  Poppins:
    'var(--font-poppins), Poppins, ui-sans-serif, system-ui, sans-serif',
  "Playfair Display":
    'var(--font-playfair-display), "Playfair Display", ui-serif, Georgia, serif',
  "Cormorant Garamond":
    'var(--font-cormorant), "Cormorant Garamond", ui-serif, Georgia, serif',
  "Great Vibes": 'var(--font-great-vibes), "Great Vibes", cursive',

  "Dancing Script":
    'var(--font-dancing-script), "Dancing Script", cursive',
  Pacifico: 'var(--font-pacifico), Pacifico, cursive',
  Allura: 'var(--font-allura), Allura, cursive',
  Parisienne: 'var(--font-parisienne), Parisienne, cursive',
  Sacramento: 'var(--font-sacramento), Sacramento, cursive',
  Playball: 'var(--font-playball), Playball, cursive',
  Satisfy: 'var(--font-satisfy), Satisfy, cursive',
  Tangerine: 'var(--font-tangerine), Tangerine, cursive',

  Montserrat:
    'var(--font-montserrat), Montserrat, ui-sans-serif, system-ui, sans-serif',
  Lato: 'var(--font-lato), Lato, ui-sans-serif, system-ui, sans-serif',
  "Open Sans":
    'var(--font-open-sans), "Open Sans", ui-sans-serif, system-ui, sans-serif',
  Roboto: 'var(--font-roboto), Roboto, ui-sans-serif, system-ui, sans-serif',
  Oswald: 'var(--font-oswald), Oswald, ui-sans-serif, system-ui, sans-serif',
  Raleway:
    'var(--font-raleway), Raleway, ui-sans-serif, system-ui, sans-serif',
  Nunito: 'var(--font-nunito), Nunito, ui-sans-serif, system-ui, sans-serif',
  "Work Sans":
    'var(--font-work-sans), "Work Sans", ui-sans-serif, system-ui, sans-serif',
  "Source Sans 3":
    'var(--font-source-sans-3), "Source Sans 3", ui-sans-serif, system-ui, sans-serif',
  "PT Sans":
    'var(--font-pt-sans), "PT Sans", ui-sans-serif, system-ui, sans-serif',
  Figtree:
    'var(--font-figtree), Figtree, ui-sans-serif, system-ui, sans-serif',
  Manrope:
    'var(--font-manrope), Manrope, ui-sans-serif, system-ui, sans-serif',
  Rubik: 'var(--font-rubik), Rubik, ui-sans-serif, system-ui, sans-serif',
  "Space Grotesk":
    'var(--font-space-grotesk), "Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  "Bebas Neue":
    'var(--font-bebas-neue), "Bebas Neue", ui-sans-serif, system-ui, sans-serif',
  Quicksand:
    'var(--font-quicksand), Quicksand, ui-sans-serif, system-ui, sans-serif',
  "Josefin Sans":
    'var(--font-josefin-sans), "Josefin Sans", ui-sans-serif, system-ui, sans-serif',
  Mulish: 'var(--font-mulish), Mulish, ui-sans-serif, system-ui, sans-serif',
  Karla: 'var(--font-karla), Karla, ui-sans-serif, system-ui, sans-serif',
  Cabin: 'var(--font-cabin), Cabin, ui-sans-serif, system-ui, sans-serif',
  Barlow: 'var(--font-barlow), Barlow, ui-sans-serif, system-ui, sans-serif',
  Archivo:
    'var(--font-archivo), Archivo, ui-sans-serif, system-ui, sans-serif',
  "Plus Jakarta Sans":
    'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  "Libre Franklin":
    'var(--font-libre-franklin), "Libre Franklin", ui-sans-serif, system-ui, sans-serif',
  Hind: 'var(--font-hind), Hind, ui-sans-serif, system-ui, sans-serif',
  "IBM Plex Sans":
    'var(--font-ibm-plex-sans), "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',

  Merriweather:
    'var(--font-merriweather), Merriweather, ui-serif, Georgia, serif',
  "Libre Baskerville":
    'var(--font-libre-baskerville), "Libre Baskerville", ui-serif, Georgia, serif',
  "Abril Fatface":
    'var(--font-abril-fatface), "Abril Fatface", ui-serif, Georgia, serif',
  Cinzel: 'var(--font-cinzel), Cinzel, ui-serif, Georgia, serif',
  "Crimson Text":
    'var(--font-crimson-text), "Crimson Text", ui-serif, Georgia, serif',
  Lora: 'var(--font-lora), Lora, ui-serif, Georgia, serif',
  Prata: 'var(--font-prata), Prata, ui-serif, Georgia, serif',
  Marcellus: 'var(--font-marcellus), Marcellus, ui-serif, Georgia, serif',
  "Bodoni Moda":
    'var(--font-bodoni-moda), "Bodoni Moda", ui-serif, Georgia, serif',
  "IBM Plex Serif":
    'var(--font-ibm-plex-serif), "IBM Plex Serif", ui-serif, Georgia, serif',
};

function resolveFontFamily(fontFamily?: string) {
  if (!fontFamily || fontFamily === "inherit") return "inherit";
  return FONT_FAMILY_MAP[fontFamily] ?? fontFamily;
}

function getLabelText(block: Extract<MicrositeBlock, { type: "label" }>) {
  return block.data.text || "Label";
}

function getTextDecoration(style?: TextStyle) {
  const decorations: string[] = [];
  if (style?.underline) decorations.push("underline");
  if (style?.strike) decorations.push("line-through");
  return decorations.length ? decorations.join(" ") : "none";
}

function getTextStyle(style?: TextStyle): React.CSSProperties {
  return {
    fontFamily: resolveFontFamily(style?.fontFamily),
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: getTextDecoration(style),
    textAlign: style?.align ?? "left",
    color: style?.color || undefined,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.2,
  };
}

function isLightDesign(designKey?: string) {
  return (
    designKey === "showcase" ||
    designKey === "festive" ||
    designKey === "elegant" ||
    designKey === "business" ||
    designKey === "blank"
  );
}

function getSoftSurfaceClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "border-neutral-200 bg-neutral-50"
    : "border-white/10 bg-white/5";
}

function getPlaceholderClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "border-neutral-300 text-neutral-400"
    : "border-white/15 text-white/50";
}

function getMutedTextClass(designKey?: string) {
  return isLightDesign(designKey) ? "text-neutral-500" : "text-white/60";
}

function getLinkItemClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "rounded-lg border border-neutral-200 bg-white px-3 py-2"
    : "rounded-lg border border-white/10 bg-white/5 px-3 py-2";
}

function getButtonClass(designKey?: string) {
  if (designKey === "showcase") {
    return "flex h-full w-full items-center justify-center rounded-full bg-neutral-900 px-4 py-2";
  }

  if (designKey === "festive") {
    return "flex h-full w-full items-center justify-center rounded-full bg-red-700 px-4 py-2";
  }

  if (designKey === "elegant") {
    return "flex h-full w-full items-center justify-center rounded-full border border-stone-400 bg-white/70 px-4 py-2 backdrop-blur-sm";
  }

  if (designKey === "business") {
    return "flex h-full w-full items-center justify-center rounded-xl bg-neutral-900 px-5 py-3";
  }

  if (designKey === "blank") {
    return "flex h-full w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2";
  }

  return "flex h-full w-full items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 shadow-lg";
}

function getDefaultTextColor(designKey?: string) {
  return isLightDesign(designKey) ? "#111827" : "#ffffff";
}

function getButtonTextStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  return {
    ...getTextStyle(style),
    color: style?.color || (designKey === "elegant" ? "#44403c" : "#ffffff"),
  };
}

function getContainerTextStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  return {
    ...getTextStyle(style),
    color: style?.color || getDefaultTextColor(designKey),
  };
}

function getAppearanceStyle(block: MicrositeBlock): React.CSSProperties {
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

function getImageFrameClipPath(
  frame?: "square" | "circle" | "diamond" | "heart",
): React.CSSProperties["clipPath"] {
  if (frame === "diamond") {
    return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  }

  if (frame === "heart") {
    return "polygon(50% 92%, 37% 80%, 24% 67%, 13% 53%, 8% 38%, 11% 24%, 20% 13%, 32% 9%, 43% 14%, 50% 24%, 57% 14%, 68% 9%, 80% 13%, 89% 24%, 92% 38%, 87% 53%, 76% 67%, 63% 80%)";
  }

  return undefined;
}

function getImageFrameStyle(
  block: Extract<MicrositeBlock, { type: "image" }>,
): React.CSSProperties {
  const frame = block.data.image.frame ?? "square";
  const base = getAppearanceStyle(block);

  if (frame === "circle") {
    return {
      ...base,
      borderRadius: "9999px",
      overflow: "hidden",
    };
  }

  if (frame === "diamond" || frame === "heart") {
    return {
      ...base,
      clipPath: getImageFrameClipPath(frame),
      overflow: "hidden",
    };
  }

  return {
    ...base,
    overflow: "hidden",
  };
}

function getImageObjectFit(
  block: Extract<MicrositeBlock, { type: "image" }>,
): React.CSSProperties["objectFit"] {
  const mode = block.data.image.fitMode ?? "zoom";
  if (mode === "clip") return "contain";
  if (mode === "stretch") return "fill";
  return "cover";
}

function getImageTransformStyle(
  block: Extract<MicrositeBlock, { type: "image" }>,
): React.CSSProperties {
  const rotation = Number(block.data.image.rotation ?? 0);
  const positionX = Number(block.data.image.positionX ?? 50);
  const positionY = Number(block.data.image.positionY ?? 50);

  return {
    objectFit: getImageObjectFit(block),
    objectPosition: `${positionX}% ${positionY}%`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: "center center",
  };
}

function Surface({
  block,
  designKey,
  children,
  className = "",
  padded = true,
}: {
  block: MicrositeBlock;
  designKey?: string;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={["h-full w-full", padded ? "p-4" : "", className].join(" ")}
      style={getAppearanceStyle(block)}
    >
      {children}
    </div>
  );
}

function Placeholder({
  block,
  designKey,
  label,
}: {
  block: MicrositeBlock;
  designKey?: string;
  label: string;
}) {
  return (
    <div
      className={[
        "flex h-full min-h-[120px] w-full items-center justify-center border border-dashed text-sm",
        getPlaceholderClass(designKey),
      ].join(" ")}
      style={getAppearanceStyle(block)}
    >
      {label}
    </div>
  );
}

function renderShape(block: Extract<MicrositeBlock, { type: "shape" }>) {
  const style = getAppearanceStyle(block);

  if (block.data.shapeType === "line") {
    return (
      <div className="flex h-full w-full items-center">
        <div
          className="w-full"
          style={{
            height: `${Math.max(2, block.appearance?.borderWidth || 4)}px`,
            backgroundColor:
              block.appearance?.borderColor ||
              block.appearance?.backgroundColor ||
              "#111827",
            borderRadius: "999px",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{
        ...style,
        borderRadius:
          block.data.shapeType === "circle"
            ? "9999px"
            : style.borderRadius || "16px",
        minHeight: "100%",
      }}
    />
  );
}

function renderLabel(
  block: Extract<MicrositeBlock, { type: "label" }>,
  designKey?: string,
) {
  return (
    <div className="h-full w-full p-2" style={getAppearanceStyle(block)}>
      <div style={getContainerTextStyle(block.data.style, designKey)}>
        {getLabelText(block)}
      </div>
    </div>
  );
}

function renderImage(
  block: Extract<MicrositeBlock, { type: "image" }>,
  designKey?: string,
) {
  if (!block.data.image.url) {
    return (
      <Placeholder
        block={block}
        designKey={designKey}
        label="Double-click for Image"
      />
    );
  }

  const positionX = block.data.image.positionX ?? 50;
  const positionY = block.data.image.positionY ?? 50;
  const zoom = block.data.image.zoom ?? 1;
  const rotation = block.data.image.rotation ?? 0;

  return (
    <div className="h-full w-full" style={getImageFrameStyle(block)}>
      <img
        src={block.data.image.url}
        alt={block.data.image.alt || ""}
        className="h-full w-full"
        style={{
          objectFit: getImageObjectFit(block),
          objectPosition: `${positionX}% ${positionY}%`,
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}

function renderCta(
  block: Extract<MicrositeBlock, { type: "cta" }>,
  designKey?: string,
) {
  const appearance = getAppearanceStyle(block);

  return (
    <div className="h-full w-full">
      <div
        className={getButtonClass(designKey)}
        style={{
          ...getButtonTextStyle(block.data.style, designKey),
          background: appearance.backgroundColor || undefined,
          borderRadius: appearance.borderRadius,
          borderColor: appearance.borderColor,
          borderWidth: appearance.borderWidth,
          borderStyle: appearance.borderStyle,
        }}
      >
        {block.data.buttonText || "Button"}
      </div>
    </div>
  );
}

function renderCountdown(
  block: Extract<MicrositeBlock, { type: "countdown" }>,
  designKey?: string,
) {
  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      {block.data.heading ? (
        <div
          className={[
            "uppercase tracking-[0.14em]",
            getMutedTextClass(designKey),
          ].join(" ")}
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {block.data.heading}
        </div>
      ) : null}

      <div
        className="mt-2"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.targetIso
          ? new Date(block.data.targetIso).toLocaleString()
          : "Set target date"}
      </div>
    </Surface>
  );
}

function renderLinks(
  block: Extract<MicrositeBlock, { type: "links" }>,
  designKey?: string,
) {
  const typedBlock = block as typeof block & {
    data: typeof block.data & {
      layout?: "vertical" | "horizontal" | "grid";
    };
  };

  const layout = typedBlock.data.layout || "vertical";
  const containerAppearance = getAppearanceStyle(block);

  const listClass =
    layout === "horizontal"
      ? "flex flex-wrap items-center gap-2"
      : layout === "grid"
        ? "grid grid-cols-2 gap-2"
        : designKey === "business"
          ? "grid h-full grid-cols-2 gap-2"
          : designKey === "showcase"
            ? "space-y-2"
            : "grid gap-2";

  return (
    <div className="h-full w-full space-y-3 p-2" style={containerAppearance}>
      {block.data.heading ? (
        <div style={getContainerTextStyle(block.data.style, designKey)}>
          {block.data.heading}
        </div>
      ) : null}

      <div className={listClass}>
        {block.data.items.map((item: LinkItem) => (
          <div
            key={item.id}
            className={
              layout === "horizontal"
                ? [
                    "inline-flex items-center justify-center rounded-full px-3 py-2",
                    isLightDesign(designKey)
                      ? "border border-neutral-200 bg-white"
                      : "border border-white/10 bg-white/5",
                  ].join(" ")
                : layout === "grid"
                  ? getLinkItemClass(designKey)
                  : designKey === "showcase"
                    ? "block"
                    : getLinkItemClass(designKey)
            }
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {item.label || "Link"}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderGalleryTile(
  image: GalleryImage | ShowcaseImage | undefined,
  index: number,
  designKey?: string,
) {
  const emptyClass = isLightDesign(designKey)
    ? "border-neutral-200 bg-white"
    : "border-white/10 bg-white/5";

  if (!image?.url) {
    return (
      <div
        key={image?.id ?? `empty-${index}`}
        className={`h-full w-full rounded-lg border ${emptyClass}`}
      />
    );
  }

  return (
    <div
      key={image.id ?? `img-${index}`}
      className={`h-full w-full overflow-hidden rounded-lg border ${emptyClass}`}
    >
      <img src={image.url} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function renderGallery(
  block: Extract<MicrositeBlock, { type: "gallery" }>,
  designKey?: string,
) {
  const gridCount = Math.max(1, Number(block.data.grid) || 2);
  const images = block.data.images ?? [];
  const tileCount = Math.max(images.length, gridCount * 2, 4);
  const rows = Math.max(1, Math.ceil(tileCount / gridCount));

  return (
    <div
      className="h-full w-full overflow-hidden p-2"
      style={getAppearanceStyle(block)}
    >
      <div
        className="grid h-full w-full gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridCount}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: tileCount }).map((_, index) =>
          renderGalleryTile(images[index], index, designKey),
        )}
      </div>
    </div>
  );
}

function renderPoll(
  block: Extract<MicrositeBlock, { type: "poll" }>,
  designKey?: string,
) {
  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div style={getContainerTextStyle(block.data.style, designKey)}>
        {block.data.question || "Poll"}
      </div>

      <div className="mt-3 space-y-2">
        {block.data.options.map((option: PollOption) => (
          <div
            key={option.id}
            className={[
              "rounded-lg border px-3 py-2",
              isLightDesign(designKey)
                ? "border-neutral-200"
                : "border-white/10",
            ].join(" ")}
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {option.text || "Option"}
          </div>
        ))}
      </div>
    </Surface>
  );
}

function renderRsvp(
  block: Extract<MicrositeBlock, { type: "rsvp" }>,
  designKey?: string,
) {
  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div style={getContainerTextStyle(block.data.style, designKey)}>
        {block.data.heading || "RSVP"}
      </div>

      <div
        className="mt-3 grid gap-2"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.collectName ? <div>Name</div> : null}
        {block.data.collectEmail ? <div>Email</div> : null}
        {block.data.collectPhone ? <div>Phone</div> : null}
        {block.data.collectGuestCount ? <div>Guest Count</div> : null}
        {block.data.collectNotes ? <div>Notes</div> : null}
      </div>
    </Surface>
  );
}

function renderFaq(
  block: Extract<MicrositeBlock, { type: "faq" }>,
  designKey?: string,
) {
  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div style={getContainerTextStyle(block.data.style, designKey)}>
        FAQs
      </div>

      <div className="mt-3 space-y-2">
        {block.data.items.map((item: FaqItem) => (
          <div
            key={item.id}
            className={[
              "rounded-lg border p-3",
              isLightDesign(designKey)
                ? "border-neutral-200 bg-white"
                : "border-white/10 bg-white/5",
            ].join(" ")}
          >
            <div style={getContainerTextStyle(block.data.style, designKey)}>
              {item.question}
            </div>
            <div
              className="mt-1"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

function getThreadBadgeClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "inline-flex items-center rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-sm"
    : "inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80";
}

function getThreadCardClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
    : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3";
}

function getThreadComposerClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
    : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3";
}

function getThreadAvatarClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-700"
    : "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white/80";
}

function getThreadDividerClass(designKey?: string) {
  return isLightDesign(designKey) ? "border-neutral-200" : "border-white/10";
}

function getThreadComposerInputClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500"
    : "mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/55";
}

function getThreadScrollClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "mt-4 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400"
    : "mt-4 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15 hover:scrollbar-thumb-white/25";
}

function getThreadPostButtonClass(
  designKey?: string,
  styleType: "solid" | "outline" | "soft" = "solid",
) {
  if (styleType === "outline") {
    return isLightDesign(designKey)
      ? "inline-flex items-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900"
      : "inline-flex items-center rounded-xl border border-white/20 bg-transparent px-3 py-2 text-xs font-medium text-white";
  }

  if (styleType === "soft") {
    return isLightDesign(designKey)
      ? "inline-flex items-center rounded-xl bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-900"
      : "inline-flex items-center rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white";
  }

  return isLightDesign(designKey)
    ? "inline-flex items-center rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white"
    : "inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-medium text-neutral-900";
}

function getThreadSampleMessages(
  block: Extract<MicrositeBlock, { type: "thread" }>,
): ThreadMessage[] {
  const existing = block.data.messages?.filter(
    (message) => message.name?.trim() || message.message?.trim(),
  );

  if (existing && existing.length > 0) {
    return existing;
  }

  return [
    {
      id: "sample-1",
      name: block.data.allowAnonymous ? "Anon" : "Jordan",
      message: "Looking forward to this.",
    },
    {
      id: "sample-2",
      name: block.data.allowAnonymous ? "Anon" : "Taylor",
      message: "Can’t wait to join the conversation.",
    },
    {
      id: "sample-3",
      name: block.data.allowAnonymous ? "Anon" : "Morgan",
      message: "Following for updates.",
    },
  ];
}

function getInitials(name?: string) {
  const safe = (name || "G").trim();
  if (!safe) return "G";
  const parts = safe.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "G";
}

function renderThread(
  block: Extract<MicrositeBlock, { type: "thread" }>,
  designKey?: string,
) {
  const messages = getThreadSampleMessages(block);
  const showAnonymousBadge = Boolean(block.data.allowAnonymous);
  const showApprovalBadge = Boolean(block.data.requireApproval);
  const maxVisibleMessages = Math.max(
    1,
    Math.min(8, Number(block.data.maxVisibleMessages) || 4),
  );

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div className="flex h-full w-full min-h-0 flex-col">
        <div
          className={`shrink-0 border-b pb-3 ${getThreadDividerClass(designKey)}`}
        >
          <div
            className="text-base font-semibold"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {block.data.subject || "Message Thread"}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {showAnonymousBadge ? (
              <div className={getThreadBadgeClass(designKey)}>Anonymous</div>
            ) : null}

            {showApprovalBadge ? (
              <div className={getThreadBadgeClass(designKey)}>
                Approval Required
              </div>
            ) : null}

            {!showAnonymousBadge && !showApprovalBadge ? (
              <div className={getThreadBadgeClass(designKey)}>Open Thread</div>
            ) : null}
          </div>
        </div>

        <div className={getThreadScrollClass(designKey)}>
          <div className="space-y-3">
            {messages.slice(0, maxVisibleMessages).map((message) => (
              <div key={message.id} className={getThreadCardClass(designKey)}>
                <div className="flex items-start gap-3">
                  <div className={getThreadAvatarClass(designKey)}>
                    {getInitials(message.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-semibold"
                      style={getContainerTextStyle(block.data.style, designKey)}
                    >
                      {message.name || "Guest"}
                    </div>

                    <div
                      className="mt-1 text-sm"
                      style={getContainerTextStyle(block.data.style, designKey)}
                    >
                      {message.message || "Message preview"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 shrink-0">
          <div className={getThreadComposerClass(designKey)}>
            <div
              className="text-sm font-medium"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              Post a message
            </div>

            <div className={getThreadComposerInputClass(designKey)}>
              {block.data.composerPlaceholder || "Write something…"}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {block.data.allowAnonymous
                  ? "Anonymous posting allowed"
                  : "Posting with name"}
              </div>

              <div
                className={getThreadPostButtonClass(
                  designKey,
                  block.data.postButtonStyle ?? "solid",
                )}
              >
                {block.data.postButtonText || "Post"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Surface>
  );
}

function getImageCarouselItemLink(
  item: CarouselImageItem,
  openLinksInNewTab?: boolean,
) {
  const href = item.href?.trim() || "";
  const shouldOpenNewTab = Boolean(item.openInNewTab ?? openLinksInNewTab);

  return {
    href,
    target: shouldOpenNewTab ? "_blank" : undefined,
    rel: shouldOpenNewTab ? "noreferrer noopener" : undefined,
  };
}

function getVisibleCarouselItems(
  items: CarouselImageItem[],
  startIndex: number,
  visibleCount: number,
) {
  if (!items.length) return [];

  return Array.from({ length: Math.min(visibleCount, items.length) }).map(
    (_, offset) => items[(startIndex + offset) % items.length],
  );
}

function ImageCarouselPreview({
  block,
  designKey,
}: {
  block: Extract<MicrositeBlock, { type: "image_carousel" }>;
  designKey?: string;
}) {
  const items = block.data.items ?? [];
  const visibleCount = Math.max(
    1,
    Math.min(6, Number(block.data.visibleCount) || 1),
  );
  const intervalMs = Math.max(1000, Number(block.data.intervalMs) || 3000);
  const autoRotate = Boolean(block.data.autoRotate);
  const showOverlay = Boolean(block.data.showOverlay);
  const showTitles = Boolean(block.data.showTitles);
  const openLinksInNewTab = Boolean(block.data.openLinksInNewTab);
  const direction = block.data.scrollDirection ?? "right";

  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoRotate || isPaused || items.length <= visibleCount) return;

    const timer = window.setInterval(() => {
      setStartIndex((prev) => {
        if (direction === "left" || direction === "up") {
          return (prev - 1 + items.length) % items.length;
        }

        return (prev + 1) % items.length;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [autoRotate, isPaused, intervalMs, items.length, visibleCount, direction]);

  useEffect(() => {
    setStartIndex(0);
  }, [items.length, visibleCount]);

  const visibleItems = useMemo(
    () => getVisibleCarouselItems(items, startIndex, visibleCount),
    [items, startIndex, visibleCount],
  );

  if (!items.length) {
    return (
      <Placeholder
        block={block}
        designKey={designKey}
        label="Add carousel images"
      />
    );
  }

  const gridColsClass =
    visibleCount <= 1
      ? "grid-cols-1"
      : visibleCount === 2
        ? "grid-cols-2"
        : visibleCount === 3
          ? "grid-cols-3"
          : "grid-cols-4";

  return (
    <div
      className="h-full w-full overflow-hidden p-2"
      style={getAppearanceStyle(block)}
    >
      <div
        className="flex h-full w-full min-h-0 flex-col"
        onMouseEnter={() => {
          if (block.data.pauseOnHover) setIsPaused(true);
        }}
        onMouseLeave={() => {
          if (block.data.pauseOnHover) setIsPaused(false);
        }}
      >
        {block.data.heading ? (
          <div
            className="mb-2 shrink-0 px-1 text-sm font-semibold"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {block.data.heading}
          </div>
        ) : null}

        <div className={`grid min-h-0 flex-1 gap-2 ${gridColsClass}`}>
          {visibleItems.map((item) => {
            const link = getImageCarouselItemLink(item, openLinksInNewTab);

            const content = (
              <div
                className={[
                  "group relative h-full min-h-[140px] w-full overflow-hidden rounded-xl border",
                  isLightDesign(designKey)
                    ? "border-neutral-200 bg-white"
                    : "border-white/10 bg-white/5",
                ].join(" ")}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={[
                      "flex h-full w-full items-center justify-center text-sm",
                      getPlaceholderClass(designKey),
                    ].join(" ")}
                  >
                    Carousel image
                  </div>
                )}

                {showOverlay || showTitles ? (
                  <div
                    className={[
                      "absolute inset-x-0 bottom-0 p-3",
                      showOverlay
                        ? "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                        : "",
                    ].join(" ")}
                  >
                    {showTitles && (item.title || item.subtitle) ? (
                      <div className="min-w-0">
                        {item.title ? (
                          <div className="truncate text-sm font-semibold text-white">
                            {item.title}
                          </div>
                        ) : null}
                        {item.subtitle ? (
                          <div className="mt-0.5 truncate text-xs text-white/85">
                            {item.subtitle}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );

            return link.href ? (
              <a
                key={item.id}
                href={link.href}
                target={link.target}
                rel={link.rel}
                className="block h-full w-full cursor-pointer transition hover:opacity-95"
              >
                {content}
              </a>
            ) : (
              <div key={item.id} className="h-full w-full">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function renderImageCarousel(
  block: Extract<MicrositeBlock, { type: "image_carousel" }>,
  designKey?: string,
) {
  return <ImageCarouselPreview block={block} designKey={designKey} />;
}

function renderFormField(
  block: Extract<MicrositeBlock, { type: "form_field" }>,
  designKey?: string,
) {
  const inputClass = isLightDesign(designKey)
    ? "w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
    : "w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white";

  return (
    <div className="h-full w-full p-2" style={getAppearanceStyle(block)}>
      <div className="flex h-full flex-col gap-1">
        <label
          className="text-sm"
          style={getContainerTextStyle(undefined, designKey)}
        >
          {block.data.label}
          {block.data.required ? " *" : ""}
        </label>

        {block.data.fieldType === "textarea" ? (
          <textarea
            className={`${inputClass} min-h-[96px] resize-none`}
            placeholder={block.data.placeholder}
            defaultValue={block.data.value || ""}
            data-form-field-id={block.id}
          />
        ) : (
          <input
            type={block.data.fieldType === "phone" ? "tel" : block.data.fieldType}
            className={inputClass}
            placeholder={block.data.placeholder}
            defaultValue={block.data.value || ""}
            data-form-field-id={block.id}
          />
        )}
      </div>
    </div>
  );
}

function renderShowcase(
  block: Extract<MicrositeBlock, { type: "showcase" }>,
  designKey?: string,
) {
  const images = block.data.images ?? [];
  const tileCount = Math.max(images.length, 9);

  return (
    <div
      className="h-full w-full overflow-hidden p-2"
      style={getAppearanceStyle(block)}
    >
      <div className="grid h-full w-full grid-cols-3 gap-2">
        {Array.from({ length: tileCount }).map((_, index) =>
          renderGalleryTile(images[index], index, designKey),
        )}
      </div>
    </div>
  );
}

function renderFestiveBackground(
  block: Extract<MicrositeBlock, { type: "festiveBackground" }>,
  designKey?: string,
) {
  if (!block.data.image.url) {
    return (
      <Placeholder
        block={block}
        designKey={designKey}
        label="Background image"
      />
    );
  }

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={getAppearanceStyle(block)}
    >
      <img
        src={block.data.image.url}
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/* =========================================
   TEXT FX RENDERER
   ========================================= */

function renderTextFx(
  block: Extract<MicrositeBlock, { type: "text_fx" }>,
  designKey?: string,
) {
  const text = block.data.text || "TextFX";
  const style = getContainerTextStyle(block.data.style, designKey);

  const fx = block.data.fx || {};
  const mode = fx.mode ?? "straight";
  const intensity = fx.intensity ?? 50;
  const rotation = fx.rotation ?? 0;
  const opacity = fx.opacity ?? 1;

  if (mode === "straight") {
    return (
      <div className="h-full w-full p-2" style={getAppearanceStyle(block)}>
        <div
          style={{
            ...style,
            transform: `rotate(${rotation}deg)`,
            opacity,
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  const radius = 120 + intensity * 2;
  const viewBoxSize = radius * 2 + 40;
  const pathId = `textfx-path-${block.id}`;

  let path = "";

  if (mode === "arch") {
    path = `
      M 20 ${radius + 20}
      A ${radius} ${radius} 0 0 1 ${viewBoxSize - 20} ${radius + 20}
    `;
  }

  if (mode === "dip") {
    path = `
      M 20 ${radius + 20}
      A ${radius} ${radius} 0 0 0 ${viewBoxSize - 20} ${radius + 20}
    `;
  }

  if (mode === "circle") {
    path = `
      M ${viewBoxSize / 2}, ${viewBoxSize / 2}
      m -${radius}, 0
      a ${radius},${radius} 0 1,1 ${radius * 2},0
      a ${radius},${radius} 0 1,1 -${radius * 2},0
    `;
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={getAppearanceStyle(block)}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          opacity,
        }}
      >
        <defs>
          <path id={pathId} d={path} fill="none" />
        </defs>

        <text
          fill={style.color || "#000"}
          fontFamily={style.fontFamily}
          fontSize={style.fontSize}
          fontWeight={style.fontWeight}
          fontStyle={style.fontStyle}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export default function BlockRenderer({
  block,
  designKey = "blank",
}: Props) {
  switch (block.type) {
    case "label":
      return renderLabel(block, designKey);
    case "text_fx":
      return renderTextFx(block, designKey);
    case "image":
      return renderImage(block, designKey);
    case "image_carousel":
      return renderImageCarousel(block, designKey);
    case "form_field":
      return renderFormField(block, designKey);
    case "cta":
      return renderCta(block, designKey);
    case "countdown":
      return renderCountdown(block, designKey);
    case "links":
      return renderLinks(block, designKey);
    case "gallery":
      return renderGallery(block, designKey);
    case "poll":
      return renderPoll(block, designKey);
    case "rsvp":
      return renderRsvp(block, designKey);
    case "faq":
      return renderFaq(block, designKey);
    case "thread":
      return renderThread(block, designKey);
    case "padding":
      return <div className="h-full w-full" />;
    case "showcase":
      return renderShowcase(block, designKey);
    case "festiveBackground":
      return renderFestiveBackground(block, designKey);
    case "shape":
      return renderShape(block);
    default:
      return <div className="h-full w-full" />;
  }
}