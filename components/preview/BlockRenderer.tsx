//  components\preview\BlockRenderer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  CarouselImageItem,
  MicrositeBlock,
  LinkItem,
  PollOption,
  FaqItem,
  TextStyle,
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

import {
  Anton,
  Bangers,
  Orbitron,
  Righteous,
  Alfa_Slab_One,
  Permanent_Marker,
  Caveat,
  Indie_Flower,
  Exo_2,
  Rajdhani,
  Teko,
  Abril_Fatface,
} from "next/font/google";

type Props = {
  block: MicrositeBlock;
  designKey?: string;
  micrositeId?: string | null;
};

const THREAD_MAX_NAME_LENGTH = 60;
const THREAD_MAX_MESSAGE_LENGTH = 500;
const THREAD_ACTIVITY_EVENT = "kht-thread-activity";

const anton = Anton({ subsets: ["latin"], weight: "400" });
const bangers = Bangers({ subsets: ["latin"], weight: "400" });
const orbitron = Orbitron({ subsets: ["latin"] });
const righteous = Righteous({ subsets: ["latin"], weight: "400" });
const alfa = Alfa_Slab_One({ subsets: ["latin"], weight: "400" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400" });
const caveat = Caveat({ subsets: ["latin"] });
const indie = Indie_Flower({ subsets: ["latin"], weight: "400" });
const exo = Exo_2({ subsets: ["latin"] });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["400", "600"] });
const teko = Teko({ subsets: ["latin"] });
const abril = Abril_Fatface({ subsets: ["latin"], weight: "400" });

const dancingScript = Dancing_Script({ subsets: ["latin"] });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const allura = Allura({ subsets: ["latin"], weight: "400" });
const parisienne = Parisienne({ subsets: ["latin"], weight: "400" });
const sacramento = Sacramento({ subsets: ["latin"], weight: "400" });
const playball = Playball({ subsets: ["latin"], weight: "400" });
const satisfy = Satisfy({ subsets: ["latin"], weight: "400" });
const tangerine = Tangerine({ subsets: ["latin"], weight: ["400", "700"] });
const prata = Prata({ subsets: ["latin"], weight: "400" });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400" });
const bodoniModa = Bodoni_Moda({ subsets: ["latin"] });
const cinzel = Cinzel({ subsets: ["latin"] });
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const merriweather = Merriweather({ subsets: ["latin"] });
const lora = Lora({ subsets: ["latin"] });
const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

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

  "Dancing Script": `${dancingScript.style.fontFamily}, cursive`,
  Pacifico: `${pacifico.style.fontFamily}, cursive`,
  Allura: `${allura.style.fontFamily}, cursive`,
  Parisienne: `${parisienne.style.fontFamily}, cursive`,
  Sacramento: `${sacramento.style.fontFamily}, cursive`,
  Playball: `${playball.style.fontFamily}, cursive`,
  Satisfy: `${satisfy.style.fontFamily}, cursive`,
  Tangerine: `${tangerine.style.fontFamily}, cursive`,

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

  Merriweather: `${merriweather.style.fontFamily}, ui-serif, Georgia, serif`,
  "Libre Baskerville": `${libreBaskerville.style.fontFamily}, ui-serif, Georgia, serif`,
  "Abril Fatface": `${abril.style.fontFamily}, ui-serif, Georgia, serif`,
  Cinzel: `${cinzel.style.fontFamily}, ui-serif, Georgia, serif`,
  "Crimson Text": `${crimsonText.style.fontFamily}, ui-serif, Georgia, serif`,
  Lora: `${lora.style.fontFamily}, ui-serif, Georgia, serif`,
  Prata: `${prata.style.fontFamily}, ui-serif, Georgia, serif`,
  Marcellus: `${marcellus.style.fontFamily}, ui-serif, Georgia, serif`,
  "Bodoni Moda": `${bodoniModa.style.fontFamily}, ui-serif, Georgia, serif`,
  "IBM Plex Serif":
    'var(--font-ibm-plex-serif), "IBM Plex Serif", ui-serif, Georgia, serif',

  Anton: `${anton.style.fontFamily}, sans-serif`,
  Bangers: `${bangers.style.fontFamily}, cursive`,
  Orbitron: `${orbitron.style.fontFamily}, sans-serif`,
  Righteous: `${righteous.style.fontFamily}, cursive`,
  "Alfa Slab One": `${alfa.style.fontFamily}, serif`,
  "Permanent Marker": `${marker.style.fontFamily}, cursive`,
  Caveat: `${caveat.style.fontFamily}, cursive`,
  "Indie Flower": `${indie.style.fontFamily}, cursive`,
  "Exo 2": `${exo.style.fontFamily}, sans-serif`,
  Rajdhani: `${rajdhani.style.fontFamily}, sans-serif`,
  Teko: `${teko.style.fontFamily}, sans-serif`,
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

function getDefaultTextColor(designKey?: string) {
  return isLightDesign(designKey) ? "#111827" : "#ffffff";
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

function getThreadBaseFontSize(style?: TextStyle) {
  return typeof style?.fontSize === "number" && style.fontSize > 0
    ? style.fontSize
    : 30;
}

function getThreadHeadingStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  const base = getThreadBaseFontSize(style);
  return {
    ...getContainerTextStyle(
      {
        ...style,
        fontSize: Math.max(18, base),
      },
      designKey,
    ),
    lineHeight: 1.1,
  };
}

function getThreadBodyStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  const base = getThreadBaseFontSize(style);
  return {
    ...getContainerTextStyle(
      {
        ...style,
        fontSize: Math.max(14, Math.min(base, 30)),
      },
      designKey,
    ),
    lineHeight: 1.25,
  };
}

function getThreadMetaStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  const base = getThreadBaseFontSize(style);
  return {
    ...getContainerTextStyle(
      {
        ...style,
        fontSize: Math.max(11, Math.min(Math.round(base * 0.52), 16)),
      },
      designKey,
    ),
    lineHeight: 1.2,
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

function Surface({
  block,
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
      className={["h-full w-full min-h-0", padded ? "p-4" : "", className].join(
        " ",
      )}
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
  const rotation = (block.data as any).rotation ?? 0;

  if (block.data.shapeType === "line") {
    return (
      <div
        className="flex h-full w-full items-center"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
        }}
      >
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
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
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

  const translateX = (positionX - 50) * 0.6;
  const translateY = (positionY - 50) * 0.6;

  return (
    <div className="h-full w-full overflow-hidden" style={getImageFrameStyle(block)}>
      <img
        src={block.data.image.url}
        alt={block.data.image.alt || ""}
        className="h-full w-full"
        style={{
          objectFit: getImageObjectFit(block),
          objectPosition: "center center",
          transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          opacity: block.data.image.opacity ?? 1,
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
  const style = getContainerTextStyle(block.data.style, designKey);
  const buttonStyleType = (block.data as typeof block.data & {
    styleType?: "solid" | "outline" | "soft";
  }).styleType ?? "solid";

  const justifyContent =
    block.data.style?.align === "left"
      ? "flex-start"
      : block.data.style?.align === "right"
        ? "flex-end"
        : "center";

  const solidStyle: React.CSSProperties = {
    background:
      appearance.backgroundColor && appearance.backgroundColor !== "transparent"
        ? appearance.backgroundColor
        : "#111827",
    color: style.color || "#ffffff",
    borderColor: appearance.borderColor || "transparent",
    borderWidth: appearance.borderWidth,
    borderStyle: appearance.borderStyle,
    borderRadius: appearance.borderRadius,
  };

  const outlineStyle: React.CSSProperties = {
    background: "transparent",
    color: style.color || appearance.borderColor || "#111827",
    borderColor: appearance.borderColor || "#111827",
    borderWidth:
      typeof appearance.borderWidth === "string"
        ? appearance.borderWidth
        : "1px",
    borderStyle: "solid",
    borderRadius: appearance.borderRadius,
  };

  const softStyle: React.CSSProperties = {
    background:
      appearance.backgroundColor && appearance.backgroundColor !== "transparent"
        ? appearance.backgroundColor
        : "rgba(17, 24, 39, 0.10)",
    color: style.color || "#111827",
    borderColor: appearance.borderColor || "transparent",
    borderWidth: appearance.borderWidth,
    borderStyle: appearance.borderStyle,
    borderRadius: appearance.borderRadius,
  };

  const variantStyle =
    buttonStyleType === "outline"
      ? outlineStyle
      : buttonStyleType === "soft"
        ? softStyle
        : solidStyle;

  return (
    <div className="h-full w-full">
      <div
        className="flex h-full w-full px-4 py-2"
        style={{
          justifyContent,
          textAlign: block.data.style?.align ?? "center",
        }}
      >
        <div
          className="inline-flex items-center justify-center px-5 py-2"
          style={{
            ...style,
            ...variantStyle,
          }}
        >
          {block.data.buttonText || "Button"}
        </div>
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

function renderGalleryTile(image: any, index: number) {
  if (!image?.url) {
    return (
      <div
        key={`gallery-empty-${index}`}
        className="flex h-full w-full items-center justify-center overflow-hidden bg-neutral-100 text-[10px] text-neutral-400"
        style={{ borderRadius: "16px" }}
      >
        Empty
      </div>
    );
  }

  const shape = image.shape ?? "square";
  const borderRadius =
    shape === "circle" ? "9999px" : shape === "rounded" ? "16px" : "0px";

  return (
    <div
      key={image.id || image.url || `gallery-${index}`}
      className="h-full w-full overflow-hidden"
      style={{ borderRadius }}
    >
      <img
        src={image.url}
        alt={image.alt || ""}
        className="h-full w-full object-cover"
        style={{ borderRadius }}
      />
    </div>
  );
}

function renderGallery(
  block: Extract<MicrositeBlock, { type: "gallery" }>,
  designKey?: string,
) {
  const columns = Math.max(1, Number(block.data.columns) || 2);
  const images = block.data.images ?? [];

  const explicitRows =
    typeof block.data.rows === "number" && block.data.rows > 0
      ? Math.max(1, Math.floor(block.data.rows))
      : null;

  const tileCount = explicitRows
    ? Math.max(images.length, columns * explicitRows)
    : images.length;

  const rows = explicitRows ?? Math.max(1, Math.ceil(images.length / columns));

  const positionX = block.data.positionX ?? 50;
  const positionY = block.data.positionY ?? 50;

  const translateX = (positionX - 50) * 2;
  const translateY = (positionY - 50) * 2;

  return (
    <div
      className="h-full w-full overflow-hidden p-2"
      style={getAppearanceStyle(block)}
    >
      <div
        className="grid h-full w-full gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          transform: `translate(${translateX}%, ${translateY}%)`,
          transformOrigin: "center center",
        }}
      >
        {Array.from({ length: tileCount }).map((_, index) =>
          renderGalleryTile(images[index], index),
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
      <div style={getContainerTextStyle(block.data.style, designKey)}>FAQs</div>

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

function getHighlightCardClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
    : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm";
}

function getThreadCardClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
    : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3";
}

function getThreadComposerClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
    : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-sm";
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
    ? "mt-3 block w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 outline-none focus:border-neutral-400"
    : "mt-3 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30";
}

function getThreadScrollClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "mt-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400"
    : "mt-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15 hover:scrollbar-thumb-white/25";
}

function getThreadPostButtonClass(
  designKey?: string,
  styleType: "solid" | "outline" | "soft" = "solid",
) {
  if (styleType === "outline") {
    return isLightDesign(designKey)
      ? "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-neutral-300 bg-white px-6 py-3 text-base font-semibold text-neutral-900"
      : "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/20 bg-transparent px-6 py-3 text-base font-semibold text-white";
  }

  if (styleType === "soft") {
    return isLightDesign(designKey)
      ? "inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-neutral-100 px-6 py-3 text-base font-semibold text-neutral-900"
      : "inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white/10 px-6 py-3 text-base font-semibold text-white";
  }

  return isLightDesign(designKey)
    ? "inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-neutral-900 px-6 py-3 text-base font-semibold text-white"
    : "inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-neutral-900";
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
      votes: 3,
    },
    {
      id: "sample-2",
      name: block.data.allowAnonymous ? "Anon" : "Taylor",
      message: "Can’t wait to join the conversation.",
      votes: 2,
    },
    {
      id: "sample-3",
      name: block.data.allowAnonymous ? "Anon" : "Morgan",
      message: "Following for updates.",
      votes: 1,
    },
  ];
}

function getInitials(name?: string) {
  const safe = (name || "G").trim();
  if (!safe) return "G";
  const parts = safe.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "G";
}

function normalizeThreadMessages(rawMessages: any[]): ThreadMessage[] {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .map((message, index) => {
      const createdAtValue =
        typeof message.created_at === "string" ? message.created_at : "";

      const createdAtTimestamp = createdAtValue
        ? Date.parse(createdAtValue)
        : Number.NaN;

      return {
        id: String(message.id ?? `threadmsg_${index}`),
        name: String(message.author_name ?? message.name ?? "Guest"),
        message: String(message.message_text ?? message.message ?? ""),
        votes:
          typeof message.votes === "number"
            ? message.votes
            : Number(message.votes ?? 0) || 0,
        created_at: createdAtValue || undefined,
        _sortTimestamp: Number.isNaN(createdAtTimestamp)
          ? Number.MAX_SAFE_INTEGER - index
          : createdAtTimestamp,
      } as ThreadMessage & { _sortTimestamp?: number };
    })
    .sort((a, b) => {
      const aTime = (a as any)._sortTimestamp ?? 0;
      const bTime = (b as any)._sortTimestamp ?? 0;
      return aTime - bTime;
    })
    .map((message) => {
      const clone = { ...message } as any;
      delete clone._sortTimestamp;
      return clone as ThreadMessage;
    });
}

function renderThread(
  block: Extract<MicrositeBlock, { type: "thread" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  function ThreadInteractivePreview() {
    const initialMessages = useMemo(
      () =>
        getThreadSampleMessages(block).map((message) => ({
          ...message,
          votes: typeof message.votes === "number" ? message.votes : 0,
        })),
      [block.id, block.data.messages, block.data.allowAnonymous],
    );

    const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
    const [nameValue, setNameValue] = useState("");
    const [messageValue, setMessageValue] = useState("");
    const [isLoading, setIsLoading] = useState(Boolean(micrositeId));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteLoadingId, setVoteLoadingId] = useState<string | null>(null);
    const [threadError, setThreadError] = useState("");
    const [hasOverflow, setHasOverflow] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement | null>(null);

    const showAnonymousBadge = Boolean(block.data.allowAnonymous);
    const showApprovalBadge = Boolean(block.data.requireApproval);
    const showNameField = block.data.showNameField !== false;
    const showVoteControls = block.data.showVoteControls !== false;
    const showVoteCount = block.data.showVoteCount !== false;
    const scrollHeight = Math.max(120, Number(block.data.scrollHeight) || 280);

    useEffect(() => {
      if (!micrositeId) {
        setMessages(initialMessages);
        setIsLoading(false);
        return;
      }

      let isCancelled = false;

      async function loadMessages() {
        try {
          setIsLoading(true);
          setThreadError("");

          const params = new URLSearchParams({
            micrositeId,
            threadBlockId: block.id,
          });

          const res = await fetch(`/api/thread/messages?${params.toString()}`, {
            cache: "no-store",
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data?.error || "Failed to load thread messages.");
          }

          if (!isCancelled) {
            const nextMessages = normalizeThreadMessages(data?.messages ?? []);
            setMessages(nextMessages);
          }
        } catch (error) {
          if (!isCancelled) {
            setMessages([]);
            setThreadError(
              error instanceof Error
                ? error.message
                : "Failed to load thread messages.",
            );
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      }

      function handleThreadUpdated(event: Event) {
        const customEvent = event as CustomEvent<{
          micrositeId?: string;
          threadBlockId?: string;
          type?: string;
        }>;

        if (customEvent.detail?.micrositeId !== micrositeId) return;
        if (customEvent.detail?.threadBlockId !== block.id) return;
        void loadMessages();
      }

      void loadMessages();
      window.addEventListener(
        THREAD_ACTIVITY_EVENT,
        handleThreadUpdated as EventListener,
      );

      return () => {
        isCancelled = true;
        window.removeEventListener(
          THREAD_ACTIVITY_EVENT,
          handleThreadUpdated as EventListener,
        );
      };
    }, [
      micrositeId,
      block.id,
      initialMessages,
      block.data.allowAnonymous,
      block.data.requireApproval,
    ]);

    useEffect(() => {
      const node = scrollAreaRef.current;
      if (!node) {
        setHasOverflow(false);
        return;
      }

      const checkOverflow = () => {
        setHasOverflow(node.scrollHeight > node.clientHeight + 2);
      };

      checkOverflow();

      const resizeObserver = new ResizeObserver(() => {
        checkOverflow();
      });

      resizeObserver.observe(node);

      return () => {
        resizeObserver.disconnect();
      };
    }, [messages, isLoading, scrollHeight]);

    const trimmedMessageValue = messageValue.trim();
    const isPostDisabled = isSubmitting || !trimmedMessageValue;

    async function handleSubmit() {
      const nextMessage = messageValue.trim();
      if (!nextMessage || isSubmitting) return;

      const resolvedName = showNameField
        ? nameValue.trim() || (block.data.allowAnonymous ? "Anon" : "Guest")
        : block.data.allowAnonymous
          ? "Anon"
          : "Guest";

      const safeName = resolvedName.slice(0, THREAD_MAX_NAME_LENGTH);
      const safeMessage = nextMessage.slice(0, THREAD_MAX_MESSAGE_LENGTH);

      const optimisticMessage: ThreadMessage = {
        id: `threadmsg_${Math.random().toString(36).slice(2, 10)}`,
        name: safeName,
        message: safeMessage,
        votes: 0,
      };

      if (!micrositeId) {
        setMessages((prev) => [...prev, optimisticMessage]);
        setMessageValue("");
        setNameValue("");
        setThreadError("");
        return;
      }

      try {
        setIsSubmitting(true);
        setThreadError("");

        const res = await fetch("/api/thread/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            micrositeId,
            threadBlockId: block.id,
            authorName: safeName,
            messageText: safeMessage,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to post message.");
        }

        const createdMessage: ThreadMessage = {
          id: String(data.message.id),
          name: String(data.message.author_name ?? safeName),
          message: String(data.message.message_text ?? safeMessage),
          votes:
            typeof data.message.votes === "number"
              ? data.message.votes
              : Number(data.message.votes ?? 0) || 0,
          created_at:
            typeof data.message.created_at === "string"
              ? data.message.created_at
              : undefined,
        };

        setMessages((prev) =>
          normalizeThreadMessages([
            ...prev.map((message) => ({
              id: message.id,
              author_name: message.name,
              message_text: message.message,
              votes: message.votes,
              created_at: (message as any).created_at,
            })),
            {
              id: createdMessage.id,
              author_name: createdMessage.name,
              message_text: createdMessage.message,
              votes: createdMessage.votes,
              created_at: createdMessage.created_at,
            },
          ]),
        );

        setMessageValue("");
        setNameValue("");
        setThreadError("");

        window.dispatchEvent(
          new CustomEvent(THREAD_ACTIVITY_EVENT, {
            detail: {
              micrositeId,
              threadBlockId: block.id,
              type: "message_posted",
            },
          }),
        );
      } catch (error) {
        setThreadError(
          error instanceof Error ? error.message : "Failed to post message.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }

    async function updateVotes(messageId: string, delta: number) {
      if (voteLoadingId) return;

      if (!micrositeId) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  votes: Math.max(0, (message.votes ?? 0) + delta),
                }
              : message,
          ),
        );
        return;
      }

      const existing = messages.find((message) => message.id === messageId);
      if (!existing) return;

      const optimisticVotes = Math.max(0, (existing.votes ?? 0) + delta);

      setVoteLoadingId(messageId);
      setThreadError("");

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                votes: optimisticVotes,
              }
            : message,
        ),
      );

      try {
        const res = await fetch("/api/thread/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
            delta,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to update vote.");
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  votes:
                    typeof data.message.votes === "number"
                      ? data.message.votes
                      : optimisticVotes,
                }
              : message,
          ),
        );

        window.dispatchEvent(
          new CustomEvent(THREAD_ACTIVITY_EVENT, {
            detail: {
              micrositeId,
              threadBlockId: block.id,
              type: "vote_updated",
            },
          }),
        );
      } catch (error) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  votes: existing.votes ?? 0,
                }
              : message,
          ),
        );

        setThreadError(
          error instanceof Error ? error.message : "Failed to update vote.",
        );
      } finally {
        setVoteLoadingId(null);
      }
    }

    return (
      <Surface
        block={block}
        designKey={designKey}
        className={getSoftSurfaceClass(designKey)}
      >
        <div className="flex h-full w-full min-h-0 flex-col overflow-hidden">
          <div
            className={`shrink-0 border-b pb-3 ${getThreadDividerClass(
              designKey,
            )}`}
          >
            <div
              className="font-semibold"
              style={getThreadHeadingStyle(block.data.style, designKey)}
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

          <div className="mt-4 shrink-0 relative z-10 pointer-events-auto">
            <div className={getThreadComposerClass(designKey)}>
              <div
                className="font-medium"
                style={getThreadMetaStyle(block.data.style, designKey)}
              >
                Post a message
              </div>

              {showNameField ? (
                <input
                  type="text"
                  value={nameValue}
                  maxLength={THREAD_MAX_NAME_LENGTH}
                  onChange={(e) =>
                    setNameValue(e.target.value.slice(0, THREAD_MAX_NAME_LENGTH))
                  }
                  placeholder={block.data.namePlaceholder || "Your name"}
                  className={getThreadComposerInputClass(designKey)}
                  style={{
                    ...getThreadBodyStyle(block.data.style, designKey),
                    pointerEvents: "auto",
                    position: "relative",
                    zIndex: 2,
                  }}
                />
              ) : null}

              <textarea
                value={messageValue}
                maxLength={THREAD_MAX_MESSAGE_LENGTH}
                onChange={(e) =>
                  setMessageValue(
                    e.target.value.slice(0, THREAD_MAX_MESSAGE_LENGTH),
                  )
                }
                placeholder={block.data.composerPlaceholder || "Write something…"}
                className={`${getThreadComposerInputClass(
                  designKey,
                )} min-h-[96px] resize-none`}
                style={{
                  ...getThreadBodyStyle(block.data.style, designKey),
                  pointerEvents: "auto",
                  position: "relative",
                  zIndex: 2,
                }}
              />

              <div className="mt-2 flex items-center justify-between gap-3">
                <div
                  style={getThreadMetaStyle(block.data.style, designKey)}
                  className={isLightDesign(designKey) ? "text-neutral-500" : "text-white/55"}
                >
                  {messageValue.length}/{THREAD_MAX_MESSAGE_LENGTH}
                </div>

                {showNameField ? (
                  <div
                    style={getThreadMetaStyle(block.data.style, designKey)}
                    className={isLightDesign(designKey) ? "text-neutral-500" : "text-white/55"}
                  >
                    {nameValue.length}/{THREAD_MAX_NAME_LENGTH}
                  </div>
                ) : null}
              </div>

              {threadError ? (
                <div className="mt-3 text-xs text-red-500">{threadError}</div>
              ) : null}

              <div className="mt-3 flex items-center justify-between gap-3">
                <div
                  style={getThreadMetaStyle(block.data.style, designKey)}
                  className={isLightDesign(designKey) ? "text-neutral-500" : "text-white/55"}
                >
                  {block.data.allowAnonymous
                    ? "Anonymous posting allowed"
                    : "Posting with name"}
                </div>

                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isPostDisabled}
                  className={getThreadPostButtonClass(
                    designKey,
                    block.data.postButtonStyle ?? "solid",
                  )}
                  style={{
                    opacity: isPostDisabled ? 0.6 : 1,
                    cursor: isPostDisabled ? "not-allowed" : "pointer",
                    pointerEvents: "auto",
                  }}
                >
                  {isSubmitting
                    ? "Posting..."
                    : block.data.postButtonText || "Post"}
                </button>
              </div>
            </div>
          </div>

          <div
            ref={scrollAreaRef}
            className={getThreadScrollClass(designKey)}
            style={{
              minHeight: 0,
              maxHeight: `${scrollHeight}px`,
              paddingRight: hasOverflow ? "0.25rem" : 0,
            }}
          >
            {isLoading ? (
              <div className="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-sm text-neutral-500">
                Loading messages...
              </div>
            ) : !messages.length ? (
              <div className="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-sm text-neutral-500">
                No messages yet.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={getThreadCardClass(designKey)}>
                    <div className="flex items-start gap-3">
                      {showVoteControls ? (
                        <div className="flex shrink-0 flex-col items-center justify-start gap-1">
                          <button
                            type="button"
                            onClick={() => void updateVotes(message.id, 1)}
                            disabled={voteLoadingId === message.id}
                            className={
                              isLightDesign(designKey)
                                ? "text-neutral-700"
                                : "text-white/80"
                            }
                            style={{
                              opacity: voteLoadingId === message.id ? 0.5 : 1,
                              cursor:
                                voteLoadingId === message.id
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            👍
                          </button>

                          {showVoteCount ? (
                            <div
                              className="font-semibold"
                              style={getThreadMetaStyle(block.data.style, designKey)}
                            >
                              {message.votes ?? 0}
                            </div>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => void updateVotes(message.id, -1)}
                            disabled={voteLoadingId === message.id}
                            className={
                              isLightDesign(designKey)
                                ? "text-neutral-700"
                                : "text-white/80"
                            }
                            style={{
                              opacity: voteLoadingId === message.id ? 0.5 : 1,
                              cursor:
                                voteLoadingId === message.id
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            👎
                          </button>
                        </div>
                      ) : null}

                      <div className={getThreadAvatarClass(designKey)}>
                        {getInitials(message.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="font-semibold"
                          style={getThreadMetaStyle(block.data.style, designKey)}
                        >
                          {message.name || "Guest"}
                        </div>

                        <div
                          className="mt-1"
                          style={getThreadBodyStyle(block.data.style, designKey)}
                        >
                          {message.message || "Message preview"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Surface>
    );
  }

  return <ThreadInteractivePreview />;
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
                    style={{
                      objectFit: "cover",
                      objectPosition: "center center",
                      transform: `translate(${((item.positionX ?? 50) - 50) * 0.6}%, ${((item.positionY ?? 50) - 50) * 0.6}%) scale(${item.zoom ?? 1}) rotate(${item.rotation ?? 0}deg)`,
                      transformOrigin: "center center",
                    }}
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

  const showLabel = block.data.showLabel !== false;
  const showPlaceholder = block.data.showPlaceholder !== false;
  const showRequired = block.data.showRequired !== false;

  return (
    <div className="h-full w-full p-2" style={getAppearanceStyle(block)}>
      <div className="flex h-full flex-col gap-1">
        {showLabel ? (
          <label
            className="text-sm"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {block.data.label}
            {showRequired && block.data.required ? " *" : ""}
          </label>
        ) : null}

        {block.data.fieldType === "textarea" ? (
          <textarea
            className={`${inputClass} min-h-[96px] resize-none`}
            placeholder={showPlaceholder ? block.data.placeholder : ""}
            defaultValue={block.data.value || ""}
            data-form-field-id={block.id}
            style={getContainerTextStyle(block.data.style, designKey)}
          />
        ) : (
          <input
            type={block.data.fieldType === "phone" ? "tel" : block.data.fieldType}
            className={inputClass}
            placeholder={showPlaceholder ? block.data.placeholder : ""}
            defaultValue={block.data.value || ""}
            data-form-field-id={block.id}
            style={getContainerTextStyle(block.data.style, designKey)}
          />
        )}
      </div>
    </div>
  );
}

function renderShowcase(
  block: Extract<MicrositeBlock, { type: "showcase" }>,
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
          renderGalleryTile(images[index], index),
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

  const outline = fx.outline || {};
  const outlineEnabled = outline.enabled;
  const outlineColor = outline.color || "#000000";
  const outlineWidth = outline.width ?? 2;

  if (mode === "straight") {
    return (
      <div className="h-full w-full p-2" style={getAppearanceStyle(block)}>
        <div
          style={{
            ...style,
            transform: `rotate(${rotation}deg)`,
            opacity,
            WebkitTextStroke: outlineEnabled
              ? `${outlineWidth}px ${outlineColor}`
              : undefined,
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  const fontSize =
    typeof block.data.style?.fontSize === "number"
      ? block.data.style.fontSize
      : 48;

  const radius = 120 + intensity * 2;
  const horizontalPadding = 20;
  const topPadding = Math.max(40, fontSize * 1.1);
  const bottomPadding = Math.max(32, fontSize * 0.65);

  const viewBoxWidth = radius * 2 + horizontalPadding * 2;
  const viewBoxHeight = radius * 2 + topPadding + bottomPadding;
  const centerX = viewBoxWidth / 2;
  const centerY = topPadding + radius;

  const stableTextFxKey = [
    block.type,
    block.data.text || "",
    mode,
    intensity,
    rotation,
    opacity,
    block.data.style?.fontFamily || "",
    block.data.style?.fontSize || "",
    block.data.style?.color || "",
  ].join("|");

  const pathId = `textfx-path-${stableTextFxKey
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)}`;

  let path = "";

  if (mode === "arch") {
    path = `
      M ${horizontalPadding} ${centerY}
      A ${radius} ${radius} 0 0 1 ${viewBoxWidth - horizontalPadding} ${centerY}
    `;
  }

  if (mode === "dip") {
    path = `
      M ${horizontalPadding} ${topPadding}
      A ${radius} ${radius} 0 0 0 ${viewBoxWidth - horizontalPadding} ${topPadding}
    `;
  }

  if (mode === "circle") {
    path = `
      M ${centerX}, ${centerY}
      m -${radius}, 0
      a ${radius},${radius} 0 1,1 ${radius * 2},0
      a ${radius},${radius} 0 1,1 -${radius * 2},0
    `;
  }

  return (
    <div
      className="h-full w-full overflow-visible"
      style={getAppearanceStyle(block)}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMin meet"
        style={{
          transform: `rotate(${rotation}deg)`,
          opacity,
          overflow: "visible",
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

function renderHighlight(
  block: Extract<MicrositeBlock, { type: "highlight" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  function HighlightPreview() {
    const [items, setItems] = useState<any[]>([]);
    const [countValue, setCountValue] = useState<number>(0);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(Boolean(micrositeId));
    const [refreshKey, setRefreshKey] = useState(0);

    const mode = block.data?.mode || "top_messages";
    const limit = Math.max(1, Math.min(12, Number(block.data?.limit) || 4));
    const sourceBlockId = block.data?.sourceBlockId?.trim() || "";
    const sourceFormBlockId = block.data?.sourceFormBlockId?.trim() || "";
    const heading =
      block.data?.heading?.trim() ||
      (mode === "top_messages"
        ? "Top Messages"
        : mode === "rsvp_count"
          ? "RSVP Count"
          : "Total Funds");

    useEffect(() => {
      let cancelled = false;

      async function load() {
        if (!micrositeId) {
          setItems([]);
          setCountValue(0);
          setTotalValue(0);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);

          if (mode === "top_messages") {
            if (!sourceBlockId) {
              if (!cancelled) {
                setItems([]);
                setCountValue(0);
                setTotalValue(0);
              }
              return;
            }

            const params = new URLSearchParams({
              micrositeId,
              threadBlockId: sourceBlockId,
              limit: String(limit),
              sort: "votes_desc",
            });

            const res = await fetch(`/api/thread/messages?${params.toString()}`, {
              cache: "no-store",
            });

            const data = await res.json();

            if (!res.ok) throw new Error();

            if (!cancelled) {
              setItems(data?.messages || []);
              setCountValue(0);
              setTotalValue(0);
            }

            return;
          }

          if (mode === "rsvp_count") {
            const params = new URLSearchParams({
              micrositeId,
              mode: "rsvp_count",
              sourceFormBlockId,
            });

            const res = await fetch(`/api/forms/stats?${params.toString()}`, {
              cache: "no-store",
            });

            const data = await res.json();

            if (!res.ok) throw new Error();

            if (!cancelled) {
              setItems([]);
              setCountValue(typeof data?.count === "number" ? data.count : 0);
              setTotalValue(0);
            }

            return;
          }

          if (mode === "total_funds") {
            const params = new URLSearchParams({
              micrositeId,
              mode: "total_funds",
              sourceFormBlockId,
            });

            const res = await fetch(`/api/forms/stats?${params.toString()}`, {
              cache: "no-store",
            });

            const data = await res.json();

            if (!res.ok) throw new Error();

            if (!cancelled) {
              setItems([]);
              setCountValue(0);
              setTotalValue(typeof data?.total === "number" ? data.total : 0);
            }

            return;
          }

          if (!cancelled) {
            setItems([]);
            setCountValue(0);
            setTotalValue(0);
          }
        } catch {
          if (!cancelled) {
            setItems([]);
            setCountValue(0);
            setTotalValue(0);
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }

      function handleThreadUpdated(event: Event) {
        const customEvent = event as CustomEvent<{
          micrositeId?: string;
          threadBlockId?: string;
          type?: string;
        }>;

        const detail = customEvent.detail;

        if (!detail) return;
        if (detail.micrositeId !== micrositeId) return;

        if (mode === "top_messages") {
          if (!sourceBlockId) return;
          if (detail.threadBlockId !== sourceBlockId) return;
        }

        setRefreshKey((prev) => prev + 1);
      }

      window.addEventListener(
        THREAD_ACTIVITY_EVENT,
        handleThreadUpdated as EventListener,
      );

      void load();

      return () => {
        cancelled = true;
        window.removeEventListener(
          THREAD_ACTIVITY_EVENT,
          handleThreadUpdated as EventListener,
        );
      };
    }, [
      micrositeId,
      mode,
      block.id,
      sourceBlockId,
      sourceFormBlockId,
      limit,
      refreshKey,
    ]);

    return (
      <Surface
        block={block}
        designKey={designKey}
        className={getSoftSurfaceClass(designKey)}
      >
        <div className="flex h-full w-full flex-col gap-3">
          <div
            className="text-sm font-semibold"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {heading}
          </div>

          {isLoading ? (
            <div className="text-xs text-neutral-400">Loading...</div>
          ) : null}

          {!isLoading && mode === "top_messages" && !sourceBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              Select a source thread block.
            </div>
          ) : null}

          {!isLoading && mode === "rsvp_count" && !sourceFormBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              Select a source form block.
            </div>
          ) : null}

          {!isLoading && mode === "total_funds" && !sourceFormBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              Select a source form block.
            </div>
          ) : null}

          {!isLoading && mode === "top_messages" && sourceBlockId && !items.length ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              No data yet.
            </div>
          ) : null}

          {!isLoading && mode === "rsvp_count" && !!sourceFormBlockId ? (
            <div className={getHighlightCardClass(designKey)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60"
                    style={getContainerTextStyle(block.data.style, designKey)}
                  >
                    Responses
                  </div>
                  <div
                    className="mt-2 text-4xl font-bold leading-none"
                    style={getContainerTextStyle(block.data.style, designKey)}
                  >
                    {countValue}
                  </div>
                </div>

                <div className="text-2xl">✉️</div>
              </div>

              <div
                className="mt-3 text-xs opacity-60"
                style={getContainerTextStyle(block.data.style, designKey)}
              >
                Live RSVP count from submitted forms.
              </div>
            </div>
          ) : null}

          {!isLoading && mode === "total_funds" && !!sourceFormBlockId ? (
            <div className={getHighlightCardClass(designKey)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60"
                    style={getContainerTextStyle(block.data.style, designKey)}
                  >
                    Total Raised
                  </div>
                  <div
                    className="mt-2 text-4xl font-bold leading-none"
                    style={getContainerTextStyle(block.data.style, designKey)}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                    }).format(totalValue)}
                  </div>
                </div>

                <div className="text-2xl">💰</div>
              </div>

              <div
                className="mt-3 text-xs opacity-60"
                style={getContainerTextStyle(block.data.style, designKey)}
              >
                Live funding total from submitted forms.
              </div>
            </div>
          ) : null}

          {mode === "top_messages" ? (
            <div className="space-y-3">
              {items.slice(0, limit).map((msg: any, index: number) => (
                <div key={msg.id} className={getHighlightCardClass(designKey)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-bold"
                          style={{
                            background: isLightDesign(designKey)
                              ? "rgba(17,24,39,0.08)"
                              : "rgba(255,255,255,0.12)",
                            color: getDefaultTextColor(designKey),
                          }}
                        >
                          #{index + 1}
                        </div>

                        <div
                          className="truncate text-xs font-semibold"
                          style={getContainerTextStyle(block.data.style, designKey)}
                        >
                          {msg.author_name || msg.name || "Guest"}
                        </div>
                      </div>

                      <div
                        className="mt-2 text-sm leading-5"
                        style={getContainerTextStyle(block.data.style, designKey)}
                      >
                        {msg.message_text || msg.message}
                      </div>
                    </div>

                    <div
                      className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
                      style={{
                        background: isLightDesign(designKey)
                          ? "rgba(17,24,39,0.08)"
                          : "rgba(255,255,255,0.12)",
                        color: getDefaultTextColor(designKey),
                      }}
                    >
                      👍 {msg.votes ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Surface>
    );
  }

  return <HighlightPreview />;
}

export default function BlockRenderer({
  block,
  designKey = "blank",
  micrositeId = null,
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
      return renderThread(block, designKey, micrositeId);
    case "padding":
      return <div className="h-full w-full" />;
    case "showcase":
      return renderShowcase(block);
    case "festiveBackground":
      return renderFestiveBackground(block, designKey);
    case "shape":
      return renderShape(block);
    case "highlight":
      return renderHighlight(block, designKey, micrositeId);
    default:
      return <div className="h-full w-full" />;
  }
}