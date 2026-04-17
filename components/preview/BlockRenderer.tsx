// components\preview\BlockRenderer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import SpeedDatingLive from "@/components/blocks/SpeedDatingLive";

type SpeedDatingParticipant = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url?: string | null;
  side: "left" | "right";
  waiting: boolean;
};

type SpeedDatingPair = {
  id: string;
  leftParticipant: SpeedDatingParticipant | null;
  rightParticipant: SpeedDatingParticipant | null;
  status: "active" | "open";
};

type SpeedDatingApiState = {
  round: number;
  roundDurationSeconds: number;
  timeLeftSeconds: number;
  leftQueue: SpeedDatingParticipant[];
  rightQueue: SpeedDatingParticipant[];
  activePairs: SpeedDatingPair[];
};

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
  serverNow?: number;
};

type ThreadUiMessage = ThreadMessage & {
  userVote?: -1 | 0 | 1;
};

const THREAD_MAX_NAME_LENGTH = 60;
const THREAD_MAX_MESSAGE_LENGTH = 500;
const THREAD_ACTIVITY_EVENT = "kht-thread-activity";
const THREAD_VOTE_STORAGE_KEY = "kht-thread-votes";

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

function normalizePreviewHref(url?: string) {
  const raw = (url ?? "").trim();

  if (!raw) return "#";

  if (
    raw.startsWith("/") ||
    raw.startsWith("#") ||
    /^https?:\/\//i.test(raw) ||
    /^mailto:/i.test(raw) ||
    /^tel:/i.test(raw) ||
    raw.startsWith("//")
  ) {
    return raw;
  }

  return `//${raw}`;
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

function getThreadHeadingStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  return {
    ...getContainerTextStyle(
      {
        ...style,
        fontSize: 18,
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
  return {
    ...getContainerTextStyle(
      {
        ...style,
        fontSize: 15,
      },
      designKey,
    ),
    lineHeight: 1.3,
  };
}

function getThreadMetaStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  return {
    ...getContainerTextStyle(
      {
        ...style,
        fontSize: 12,
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

function clampFadeSize(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 15;
  return Math.max(0, Math.min(50, value));
}

function getImageFadeMaskStyle(
  image: {
    fade?: {
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
      size?: number;
    };
  },
): React.CSSProperties {
  const fade = image.fade;
  if (!fade) return {};

  const size = clampFadeSize(fade.size);
  const top = Boolean(fade.top);
  const bottom = Boolean(fade.bottom);
  const left = Boolean(fade.left);
  const right = Boolean(fade.right);

  if (!top && !bottom && !left && !right) {
    return {};
  }

  const transparentTop = top ? `${size}%` : "0%";
  const opaqueTopStart = top ? `${size}%` : "0%";
  const opaqueTopEnd = bottom ? `${100 - size}%` : "100%";
  const transparentBottom = bottom ? `${100 - size}%` : "100%";

  const transparentLeft = left ? `${size}%` : "0%";
  const opaqueLeftStart = left ? `${size}%` : "0%";
  const opaqueLeftEnd = right ? `${100 - size}%` : "100%";
  const transparentRight = right ? `${100 - size}%` : "100%";

  const verticalMask = `linear-gradient(to bottom,
    ${top ? "transparent" : "black"} 0%,
    black ${opaqueTopStart},
    black ${opaqueTopEnd},
    ${bottom ? "transparent" : "black"} 100%
  )`;

  const horizontalMask = `linear-gradient(to right,
    ${left ? "transparent" : "black"} 0%,
    black ${opaqueLeftStart},
    black ${opaqueLeftEnd},
    ${right ? "transparent" : "black"} 100%
  )`;

  if ((top || bottom) && (left || right)) {
    return {
      WebkitMaskImage: `${verticalMask}, ${horizontalMask}`,
      WebkitMaskComposite: "source-in",
      maskImage: `${verticalMask}, ${horizontalMask}`,
      maskComposite: "intersect",
    };
  }

  if (top || bottom) {
    return {
      WebkitMaskImage: `linear-gradient(to bottom,
        ${top ? "transparent" : "black"} 0%,
        black ${transparentTop},
        black ${transparentBottom},
        ${bottom ? "transparent" : "black"} 100%
      )`,
      maskImage: `linear-gradient(to bottom,
        ${top ? "transparent" : "black"} 0%,
        black ${transparentTop},
        black ${transparentBottom},
        ${bottom ? "transparent" : "black"} 100%
      )`,
    };
  }

  return {
    WebkitMaskImage: `linear-gradient(to right,
      ${left ? "transparent" : "black"} 0%,
      black ${transparentLeft},
      black ${transparentRight},
      ${right ? "transparent" : "black"} 100%
    )`,
    maskImage: `linear-gradient(to right,
      ${left ? "transparent" : "black"} 0%,
      black ${transparentLeft},
      black ${transparentRight},
      ${right ? "transparent" : "black"} 100%
    )`,
  };
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
      className={[
        "h-full w-full min-h-0 overflow-visible",
        padded ? "p-4" : "",
        className,
      ].join(" ")}
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

  const fadeMaskStyle = getImageFadeMaskStyle(block.data.image);

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={getImageFrameStyle(block)}
    >
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
          ...fadeMaskStyle,
        }}
      />
    </div>
  );
}

function renderListing(
  block: Extract<MicrositeBlock, { type: "listing" }>,
  designKey?: string,
) {
  const image = block.data.image;
  const metadata = Array.isArray(block.data.metadata) ? block.data.metadata : [];
  const cardVariant = block.data.cardVariant ?? "stacked";
  const imageHeightPercent = Math.max(
    20,
    Math.min(80, Number(block.data.imageHeightPercent) || 50),
  );

  const positionX = image.positionX ?? 50;
  const positionY = image.positionY ?? 50;
  const zoom = image.zoom ?? 1;
  const rotation = image.rotation ?? 0;

  const translateX = (positionX - 50) * 0.6;
  const translateY = (positionY - 50) * 0.6;

  const imageObjectFit: React.CSSProperties["objectFit"] =
    image.fitMode === "clip"
      ? "contain"
      : image.fitMode === "stretch"
        ? "fill"
        : "cover";

  if (cardVariant === "compact") {
    return (
      <div
        className="h-full w-full overflow-hidden"
        style={{
          ...getAppearanceStyle(block),
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          className="relative h-full overflow-hidden"
          style={{
            width: "42%",
            minWidth: "42%",
          }}
        >
          {image.url ? (
            <img
              src={image.url}
              alt={image.alt || ""}
              className="h-full w-full"
              style={{
                objectFit: imageObjectFit,
                objectPosition: "center center",
                transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                opacity: image.opacity ?? 1,
              }}
            />
          ) : (
            <div
              className={[
                "flex h-full w-full items-center justify-center border-r border-dashed text-sm",
                getPlaceholderClass(designKey),
              ].join(" ")}
            >
              Add image
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
          <div
            className="font-semibold"
            style={getContainerTextStyle(block.data.titleStyle, designKey)}
          >
            {block.data.title || "Listing Title"}
          </div>

          {block.data.description ? (
            <div
              className="text-sm"
              style={getContainerTextStyle(
                block.data.descriptionStyle,
                designKey,
              )}
            >
              {block.data.description}
            </div>
          ) : null}

          {metadata.length ? (
            <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1">
              {metadata.map((item) => (
                <div key={item.id} className="min-w-0">
                  <span
                    className="mr-1 opacity-60"
                    style={getContainerTextStyle(
                      block.data.metadataStyle,
                      designKey,
                    )}
                  >
                    {item.label}:
                  </span>
                  <span
                    style={getContainerTextStyle(
                      block.data.metadataStyle,
                      designKey,
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={getAppearanceStyle(block)}
    >
      <div className="flex h-full w-full flex-col">
        <div
          className="relative w-full overflow-hidden"
          style={{ height: `${imageHeightPercent}%` }}
        >
          {image.url ? (
            <img
              src={image.url}
              alt={image.alt || ""}
              className="h-full w-full"
              style={{
                objectFit: imageObjectFit,
                objectPosition: "center center",
                transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                opacity: image.opacity ?? 1,
              }}
            />
          ) : (
            <div
              className={[
                "flex h-full w-full items-center justify-center border-b border-dashed text-sm",
                getPlaceholderClass(designKey),
              ].join(" ")}
            >
              Add image
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
          <div
            className="font-semibold"
            style={getContainerTextStyle(block.data.titleStyle, designKey)}
          >
            {block.data.title || "Listing Title"}
          </div>

          {block.data.description ? (
            <div
              className="text-sm"
              style={getContainerTextStyle(
                block.data.descriptionStyle,
                designKey,
              )}
            >
              {block.data.description}
            </div>
          ) : null}

          {metadata.length ? (
            <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1">
              {metadata.map((item) => (
                <div key={item.id} className="min-w-0">
                  <span
                    className="mr-1 opacity-60"
                    style={getContainerTextStyle(
                      block.data.metadataStyle,
                      designKey,
                    )}
                  >
                    {item.label}:
                  </span>
                  <span
                    style={getContainerTextStyle(
                      block.data.metadataStyle,
                      designKey,
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
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
  serverNow?: number,
) {
  function CountdownPreview() {
    const initialNow = serverNow ?? Date.now();
    const [tickNow, setTickNow] = useState(initialNow);
    const [isTicking, setIsTicking] = useState(false);

    useEffect(() => {
      const startedAt = Date.now();
      const baseNow = serverNow ?? startedAt;

      const timer = window.setInterval(() => {
        setIsTicking(true);
        setTickNow(baseNow + (Date.now() - startedAt));

        window.setTimeout(() => {
          setIsTicking(false);
        }, 220);
      }, 1000);

      return () => window.clearInterval(timer);
    }, [serverNow]);

    const target = block.data.targetIso
      ? new Date(block.data.targetIso).getTime()
      : NaN;

    const style = getContainerTextStyle(block.data.style, designKey);
    const variant = block.data.styleVariant ?? "default";
    const showRings = block.data.showRings !== false;
    const appearanceStyle = getAppearanceStyle(block);

    if (!target || Number.isNaN(target)) {
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
              style={style}
            >
              {block.data.heading}
            </div>
          ) : null}

          <div className="mt-2" style={style}>
            Set target date
          </div>
        </Surface>
      );
    }

       const diff = target - tickNow;

    if (diff <= 0) {
      return (
        <Surface
          block={block}
          designKey={designKey}
          className={getSoftSurfaceClass(designKey)}
        >
          <div className="flex h-full w-full items-center justify-center text-center">
            <div style={style}>
              {block.data.completedMessage || "Countdown finished"}
            </div>
          </div>
        </Surface>
      );
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

const format = (n: number) => String(n).padStart(2, "0");

const partsRaw = [
  { label: "D", value: format(days), raw: days },
  { label: "H", value: format(hours), raw: hours },
  { label: "M", value: format(minutes), raw: minutes },
  { label: "S", value: format(seconds), raw: seconds },
];

// Hide days if zero
const parts =
  days > 0
    ? partsRaw
    : partsRaw.filter((p) => p.label !== "D");

    if (variant === "cards") {
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-4 p-4"
          style={appearanceStyle}
        >
          {block.data.heading ? (
            <div
              className={[
                "text-center uppercase tracking-[0.14em]",
                getMutedTextClass(designKey),
              ].join(" ")}
              style={style}
            >
              {block.data.heading}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {parts.map((part, index) => (
              <div key={part.label} className="flex items-center gap-2">
<div
  className={[
    "relative flex min-w-[64px] flex-col items-center justify-center rounded-xl border px-4 py-3 shadow-sm",
    isLightDesign(designKey)
      ? "border-neutral-200 bg-white"
      : "border-white/10 bg-white/5",
  ].join(" ")}
>
  {showRings ? (
    <svg className="absolute inset-0 h-full w-full pointer-events-none">
      <circle
        cx="50%"
        cy="50%"
        r="28"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.1"
      />
      <circle
        cx="50%"
        cy="50%"
        r="28"
        stroke={
  seconds < 10
    ? "#EF4444"
    : seconds < 30
    ? "#F59E0B"
    : isLightDesign(designKey)
    ? "#6366F1"
    : "#A5B4FC"
}
        strokeWidth="2"
        fill="none"
        strokeDasharray={175}
        strokeDashoffset={
          175 -
          (175 *
            (part.label === "S"
              ? seconds / 60
              : part.label === "M"
              ? minutes / 60
              : part.label === "H"
              ? hours / 24
              : days / 365))
        }
        className="transition-all duration-500"
      />
    </svg>
  ) : null}
                   <div
                    className={[
                      "text-xl font-semibold transition-all duration-200",
                      seconds < 10 ? "animate-pulse" : "",
                    ].join(" ")}
                    style={{
                      ...getContainerTextStyle(
                        {
                          ...block.data.style,
                          fontSize: Math.max(
                            20,
                            Number(block.data.style?.fontSize) || 20,
                          ),
                        },
                        designKey,
                      ),
                      transform:
                        seconds < 10
                          ? isTicking
                            ? "scale(1.15)"
                            : "scale(1.05)"
                          : isTicking
                            ? "scale(1.08)"
                            : "scale(1)",
                    }}
                  >
                    {part.value}
                  </div>
                  <div
                    className={[
                      "mt-1 text-[10px]",
                      getMutedTextClass(designKey),
                    ].join(" ")}
                  >
                    {part.label}
                  </div>
                </div>

                {index < parts.length - 1 ? (
                  <span
                    className={[
                      "text-lg font-semibold",
                      getMutedTextClass(designKey),
                    ].join(" ")}
                  >
                    :
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (variant === "hero") {
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 text-center"
          style={appearanceStyle}
        >
          {block.data.heading ? (
            <div
              className={[
                "uppercase tracking-[0.14em]",
                getMutedTextClass(designKey),
              ].join(" ")}
              style={style}
            >
              {block.data.heading}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-4">
            {parts.map((part, index) => (
              <div key={part.label} className="flex items-center gap-4">
                                <div className="relative flex flex-col items-center">
  {showRings ? (
    <svg
      className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2"
      width="80"
      height="80"
      viewBox="0 0 80 80"
    >
      <circle
        cx="40"
        cy="40"
        r="34"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.1"
      />
      <circle
        cx="40"
        cy="40"
        r="34"
        stroke={
          seconds < 10
            ? "#EF4444"
            : seconds < 30
              ? "#F59E0B"
              : isLightDesign(designKey)
                ? "#6366F1"
                : "#A5B4FC"
        }
        strokeWidth="3"
        fill="none"
        strokeDasharray={214}
        strokeDashoffset={
          214 -
          (214 *
            (part.label === "S"
              ? seconds / 60
              : part.label === "M"
                ? minutes / 60
                : part.label === "H"
                  ? hours / 24
                  : days / 365))
        }
        className="transition-all duration-500"
      />
    </svg>
  ) : null}
                  <div
                    className={[
                      "text-4xl font-bold leading-none transition-all duration-200",
                      seconds < 10 ? "animate-pulse" : "",
                    ].join(" ")}
                    style={{
                      ...getContainerTextStyle(
                        {
                          ...block.data.style,
                          fontSize: Math.max(
                            36,
                            Number(block.data.style?.fontSize) || 36,
                          ),
                        },
                        designKey,
                      ),
                      transform:
                        seconds < 10
                          ? isTicking
                            ? "scale(1.15)"
                            : "scale(1.05)"
                          : isTicking
                            ? "scale(1.08)"
                            : "scale(1)",
                    }}
                  >
                    {part.value}
                  </div>
                  <div
                    className={[
                      "mt-1 text-xs",
                      getMutedTextClass(designKey),
                    ].join(" ")}
                  >
                    {part.label}
                  </div>
                </div>

                {index < parts.length - 1 ? (
                  <span
                    className={[
                      "text-3xl font-bold",
                      getMutedTextClass(designKey),
                    ].join(" ")}
                  >
                    :
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      );
    }

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
            style={style}
          >
            {block.data.heading}
          </div>
        ) : null}

        <div
          className="mt-3 flex flex-wrap items-center gap-2"
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {parts.map((part, index) => (
            <div key={part.label} className="flex items-center gap-2">
              <div className="flex items-baseline gap-1">
              <span
                className="font-semibold transition-transform duration-200"
                style={{
                  display: "inline-block",
                  transform: isTicking ? "scale(1.05)" : "scale(1)",
                }}
              >
                {part.value}
              </span>
                <span className={getMutedTextClass(designKey)}>{part.label}</span>
              </div>

              {index < parts.length - 1 ? (
                <span className={getMutedTextClass(designKey)}>:</span>
              ) : null}
            </div>
          ))}
        </div>
      </Surface>
    );
  }

  return <CountdownPreview />;
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

function getHighlightCardClass(designKey?: string) {
  return isLightDesign(designKey)
    ? "rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
    : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm";
}

function getThreadCardClass(designKey?: string, active = false) {
  return [
    isLightDesign(designKey)
      ? "rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
      : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3",
    active
      ? isLightDesign(designKey)
        ? "ring-2 ring-neutral-900/10"
        : "ring-2 ring-white/20"
      : "",
  ].join(" ");
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
): ThreadUiMessage[] {
  const existing = block.data.messages?.filter(
    (message) => message.name?.trim() || message.message?.trim(),
  );

  if (existing && existing.length > 0) {
    return existing.map((message) => ({
      ...message,
      votes: typeof message.votes === "number" ? message.votes : 0,
      userVote: 0,
    }));
  }

  return [
    {
      id: "sample-1",
      name: block.data.allowAnonymous ? "Anon" : "Jordan",
      message: "Looking forward to this.",
      votes: 3,
      userVote: 0,
    },
    {
      id: "sample-2",
      name: block.data.allowAnonymous ? "Anon" : "Taylor",
      message: "Can’t wait to join the conversation.",
      votes: 2,
      userVote: 0,
    },
    {
      id: "sample-3",
      name: block.data.allowAnonymous ? "Anon" : "Morgan",
      message: "Following for updates.",
      votes: 1,
      userVote: 0,
    },
  ];
}

function getInitials(name?: string) {
  const safe = (name || "G").trim();
  if (!safe) return "G";
  const parts = safe.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "G";
}

function readVoteMap(): Record<string, -1 | 1> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(THREAD_VOTE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next: Record<string, -1 | 1> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (value === 1 || value === -1) next[key] = value;
    }

    return next;
  } catch {
    return {};
  }
}

function writeVoteMap(map: Record<string, -1 | 1>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(THREAD_VOTE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function getStoredVote(messageId: string): -1 | 0 | 1 {
  const map = readVoteMap();
  return map[messageId] ?? 0;
}

function setStoredVote(messageId: string, vote: -1 | 1) {
  const map = readVoteMap();
  map[messageId] = vote;
  writeVoteMap(map);
}

function normalizeThreadMessages(rawMessages: any[]): ThreadUiMessage[] {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages.map((message, index) => {
    const id = String(message.id ?? `threadmsg_${index}`);

    return {
      id,
      name: String(message.author_name ?? message.name ?? "Guest"),
      message: String(message.message_text ?? message.message ?? ""),
      votes:
        typeof message.votes === "number"
          ? message.votes
          : Number(message.votes ?? 0) || 0,
      userVote:
        message.userVote === 1 || message.user_vote === 1
          ? 1
          : message.userVote === -1 || message.user_vote === -1
            ? -1
            : getStoredVote(id),
    };
  });
}

function renderThread(
  block: Extract<MicrositeBlock, { type: "thread" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  function ThreadInteractivePreview() {
    const initialMessages = useMemo(
      () => getThreadSampleMessages(block),
      [block.id, block.data.messages, block.data.allowAnonymous],
    );

    const [messages, setMessages] = useState<ThreadUiMessage[]>(initialMessages);
    const [nameValue, setNameValue] = useState("");
    const [messageValue, setMessageValue] = useState("");
    const [isLoading, setIsLoading] = useState(Boolean(micrositeId));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteLoadingId, setVoteLoadingId] = useState<string | null>(null);
    const [threadError, setThreadError] = useState("");

    const showAnonymousBadge = Boolean(block.data.allowAnonymous);
    const showApprovalBadge = Boolean(block.data.requireApproval);
    const showNameField = block.data.showNameField !== false;
    const showVoteControls = block.data.showVoteControls !== false;
    const showVoteCount = block.data.showVoteCount !== false;
    const scrollHeight = Math.max(
      120,
      Math.min(1000, Number(block.data.scrollHeight) || 280),
    );

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
            micrositeId: micrositeId ?? "",
            threadBlockId: block.id,
            sort: "created_desc",
            limit: String(
              Math.max(1, Math.min(100, block.data.maxVisibleMessages ?? 100)),
            ),
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
      block.data.maxVisibleMessages,
    ]);

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

      const optimisticMessage: ThreadUiMessage = {
        id: `threadmsg_${Math.random().toString(36).slice(2, 10)}`,
        name: safeName,
        message: safeMessage,
        votes: 0,
        userVote: 0,
      };

      if (!micrositeId) {
        setMessages((prev) => [optimisticMessage, ...prev]);
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

        setMessages((prev) => [
          {
            id: String(data.message.id),
            name: String(data.message.author_name ?? safeName),
            message: String(data.message.message_text ?? safeMessage),
            votes:
              typeof data.message.votes === "number"
                ? data.message.votes
                : Number(data.message.votes ?? 0) || 0,
            userVote: 0,
          },
          ...prev,
        ]);

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

    async function updateVotes(messageId: string, targetVote: 1 | -1) {
      if (voteLoadingId) return;

      const existing = messages.find((message) => message.id === messageId);
      if (!existing) return;

      const previousVote = existing.userVote ?? 0;
      if (previousVote === targetVote) return;

      const optimisticDelta =
        previousVote === 0 ? targetVote : targetVote - previousVote;
      const optimisticVotes = Math.max(0, (existing.votes ?? 0) + optimisticDelta);

      if (!micrositeId) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  votes: optimisticVotes,
                  userVote: targetVote,
                }
              : message,
          ),
        );
        setStoredVote(messageId, targetVote);
        return;
      }

      setVoteLoadingId(messageId);
      setThreadError("");

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                votes: optimisticVotes,
                userVote: targetVote,
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
            targetVote,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to update vote.");
        }

        const resolvedUserVote =
          data?.message?.userVote === 1 || data?.message?.userVote === -1
            ? data.message.userVote
            : targetVote;

        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  votes:
                    typeof data.message.votes === "number"
                      ? data.message.votes
                      : optimisticVotes,
                  userVote: resolvedUserVote,
                }
              : message,
          ),
        );

        setStoredVote(messageId, resolvedUserVote);

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
                  userVote: previousVote,
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
        <div className="flex h-auto min-h-full w-full flex-col overflow-visible">
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

          <div className="relative z-10 mt-4 shrink-0 pointer-events-auto">
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
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
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
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder={block.data.composerPlaceholder || "Write something…"}
                className={`${getThreadComposerInputClass(designKey)} min-h-[96px] resize-none`}
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
                  className={
                    isLightDesign(designKey) ? "text-neutral-500" : "text-white/55"
                  }
                >
                  {messageValue.length}/{THREAD_MAX_MESSAGE_LENGTH}
                </div>

                {showNameField ? (
                  <div
                    style={getThreadMetaStyle(block.data.style, designKey)}
                    className={
                      isLightDesign(designKey) ? "text-neutral-500" : "text-white/55"
                    }
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
                  className={
                    isLightDesign(designKey) ? "text-neutral-500" : "text-white/55"
                  }
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
            className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1"
            style={{ maxHeight: `${scrollHeight}px` }}
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
                {messages.map((message) => {
                  const currentUserVote = message.userVote ?? 0;

                  return (
                    <div
                      key={message.id}
                      className={getThreadCardClass(
                        designKey,
                        currentUserVote !== 0,
                      )}
                    >
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
                                transform:
                                  currentUserVote === 1 ? "scale(1.08)" : undefined,
                              }}
                              title={
                                currentUserVote === 1
                                  ? "You upvoted this"
                                  : "Upvote"
                              }
                            >
                              <img
                                src="/icons/upvote_icon.png"
                                alt="Upvote"
                                className="h-4 w-4"
                              />
                            </button>

                            {showVoteCount ? (
                              <div
                                className="font-semibold"
                                style={{
                                  ...getThreadMetaStyle(
                                    block.data.style,
                                    designKey,
                                  ),
                                  fontSize: "12px",
                                }}
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
                                transform:
                                  currentUserVote === -1 ? "scale(1.08)" : undefined,
                              }}
                              title={
                                currentUserVote === -1
                                  ? "You downvoted this"
                                  : "Downvote"
                              }
                            >
                              <img
                                src="/icons/downvote_icon.png"
                                alt="Downvote"
                                className="h-4 w-4"
                              />
                            </button>
                          </div>
                        ) : null}

                        {showNameField ? (
                          <div className={getThreadAvatarClass(designKey)}>
                            {getInitials(message.name)}
                          </div>
                        ) : null}

                        <div className="min-w-0 flex-1">
                          {showNameField ? (
                            <div
                              className="font-semibold"
                              style={{
                                ...getThreadMetaStyle(block.data.style, designKey),
                                fontSize: "13px",
                              }}
                            >
                              {message.name || "Guest"}
                            </div>
                          ) : null}

                          <div
                            className={showNameField ? "mt-1" : ""}
                            style={{
                              ...getThreadBodyStyle(block.data.style, designKey),
                              fontSize: "15px",
                              lineHeight: 1.35,
                            }}
                          >
                            {message.message || "Message preview"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

function renderFileShare(
  block: Extract<MicrositeBlock, { type: "file_share" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  function FileSharePreview() {
    const [files, setFiles] = useState<File[]>([]);
    const [accessCode, setAccessCode] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [feedback, setFeedback] = useState<{
      type: "idle" | "success" | "error";
      message: string;
    }>({
      type: "idle",
      message: "",
    });

    const acceptedFileTypes =
      Array.isArray(block.data.acceptedFileTypes) &&
      block.data.acceptedFileTypes.length
        ? block.data.acceptedFileTypes
        : ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "txt"];

    const acceptAttr = acceptedFileTypes.map((item) => `.${item}`).join(",");

    async function handleUpload() {
      if (!micrositeId) {
        setFeedback({
          type: "error",
          message: "Uploads are only available on the live microsite.",
        });
        return;
      }

      if (!block.data.allowPublicUpload) {
        setFeedback({
          type: "error",
          message: "Public uploads are disabled.",
        });
        return;
      }

      if (!files.length) {
        setFeedback({
          type: "error",
          message: "Select at least one file.",
        });
        return;
      }

      try {
        setIsUploading(true);
        setFeedback({ type: "idle", message: "" });

        const formData = new FormData();
        formData.append("micrositeId", micrositeId);
        formData.append("blockId", block.id);

        if (block.data.requireAccessCode) {
          formData.append("accessCode", accessCode);
        }

        if (block.data.collectName) {
          formData.append("name", name);
        }

        if (block.data.collectEmail) {
          formData.append("email", email);
        }

        if (block.data.collectMessage) {
          formData.append("message", message);
        }

        for (const file of files) {
          formData.append("files", file);
        }

        const response = await fetch("/api/file-share/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Upload failed.");
        }

        setFeedback({
          type: "success",
          message:
            files.length === 1
              ? "File uploaded successfully."
              : "Files uploaded successfully.",
        });

        setFiles([]);
        setAccessCode("");
        setName("");
        setEmail("");
        setMessage("");
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Upload failed.",
        });
      } finally {
        setIsUploading(false);
      }
    }

    return (
      <Surface
        block={block}
        designKey={designKey}
        className={getSoftSurfaceClass(designKey)}
      >
        {block.data.heading ? (
          <div style={getContainerTextStyle(block.data.style, designKey)}>
            {block.data.heading}
          </div>
        ) : null}

        {block.data.subtext ? (
          <div
            className="mt-1 text-sm opacity-70"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {block.data.subtext}
          </div>
        ) : null}

        {!block.data.allowPublicUpload ? (
          <div className="mt-4 rounded-xl border border-dashed px-4 py-6 text-sm opacity-70">
            Uploads are currently disabled.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {block.data.requireAccessCode ? (
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Access code"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
              />
            ) : null}

            {block.data.collectName ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
              />
            ) : null}

            {block.data.collectEmail ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
              />
            ) : null}

            {block.data.collectMessage ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message"
                className="min-h-[100px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
              />
            ) : null}

            <div className="space-y-2">
              <label
                className={[
                  "flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium",
                  isLightDesign(designKey)
                    ? "border-neutral-300 bg-white text-neutral-900"
                    : "border-white/15 bg-white/10 text-white",
                ].join(" ")}
                style={getContainerTextStyle(block.data.style, designKey)}
              >
                Choose file
                <input
                  type="file"
                  multiple={Boolean(block.data.allowMultiple)}
                  accept={acceptAttr}
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  className="hidden"
                />
              </label>

              <div
                className="text-xs"
                style={{
                  ...getContainerTextStyle(block.data.style, designKey),
                  opacity: 0.75,
                }}
              >
                {files.length
                  ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
                  : "No file selected"}
              </div>

              <div
                className="text-xs"
                style={{
                  ...getContainerTextStyle(block.data.style, designKey),
                  opacity: 0.75,
                }}
              >
                Accepted: {acceptedFileTypes.join(", ")}
              </div>

              <div
                className="text-xs"
                style={{
                  ...getContainerTextStyle(block.data.style, designKey),
                  opacity: 0.75,
                }}
              >
                Max size: {block.data.maxFileSizeMb ?? 25} MB
              </div>
            </div>

            {files.length ? (
              <div className="rounded-xl border border-dashed px-3 py-3 text-xs">
                <div className="font-medium">Selected files</div>
                <div className="mt-2 space-y-1">
                  {files.map((file) => (
                    <div key={`${file.name}_${file.size}`}>{file.name}</div>
                  ))}
                </div>
              </div>
            ) : null}

            {feedback.message ? (
              <div
                className={[
                  "rounded-xl px-3 py-2 text-sm",
                  feedback.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : feedback.type === "error"
                      ? "border border-red-200 bg-red-50 text-red-700"
                      : "border border-neutral-200 bg-neutral-50 text-neutral-700",
                ].join(" ")}
              >
                {feedback.message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void handleUpload()}
              disabled={isUploading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
      </Surface>
    );
  }

  return <FileSharePreview />;
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
    const widthUnits = Number(block.grid?.colSpan ?? 1);

    let highlightColumns = 1;
    if (widthUnits >= 16.25) {
      highlightColumns = 3;
    } else if (widthUnits >= 8.25) {
      highlightColumns = 2;
    }
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
              limit: "100",
              sort: "votes_desc",
            });

            const res = await fetch(
              `/api/thread/messages?${params.toString()}`,
              {
                cache: "no-store",
              },
            );

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
              micrositeId: micrositeId ?? "",
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
              micrositeId: micrositeId ?? "",
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
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${highlightColumns}, minmax(0, 1fr))`,
              }}
            >
              {items.slice(0, limit).map((msg: any, index: number) => (
                <div
                  key={msg.id}
                  className={getHighlightCardClass(designKey)}
                >
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

function renderRichText(
  block: Extract<MicrositeBlock, { type: "rich_text" }>,
  designKey?: string,
) {
  const style = getContainerTextStyle(block.data.style, designKey);

  const html =
    typeof block.data.content === "string" ? block.data.content : "";

  return (
    <div className="h-full w-full p-3" style={getAppearanceStyle(block)}>
      {block.data.title ? (
        <div
          className="mb-2 font-semibold"
          style={{
            ...style,
            fontSize: Math.max(
              18,
              Number(block.data.style?.fontSize || 16) + 2,
            ),
          }}
        >
          {block.data.title}
        </div>
      ) : null}

      <div
        className="[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-1 [&_p]:my-0 [&_a]:underline"
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function renderProgressBar(
  block: Extract<MicrositeBlock, { type: "progress_bar" }>,
  designKey?: string,
) {
  const rawMax = Number(block.data.max);
  const rawValue = Number(block.data.value);

  const hasValidMax = Number.isFinite(rawMax) && rawMax > 0;
  const hasValidValue = Number.isFinite(rawValue) && rawValue >= 0;

  if (!hasValidMax || !hasValidValue) {
    return (
      <Surface
        block={block}
        designKey={designKey}
        className={getSoftSurfaceClass(designKey)}
      >
        <div
          className="text-base font-semibold"
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {block.data.heading || "Progress"}
        </div>

        <div
          className={[
            "mt-4 rounded-xl border border-dashed px-4 py-6 text-sm",
            isLightDesign(designKey)
              ? "border-neutral-300 bg-neutral-50 text-neutral-500"
              : "border-white/15 bg-white/5 text-white/60",
          ].join(" ")}
        >
          Set valid progress values.
        </div>
      </Surface>
    );
  }

  const max = Math.max(1, rawMax);
  const value = Math.max(0, Math.min(rawValue, max));
  const percent = Math.round((value / max) * 100);

  const statCardClass = isLightDesign(designKey)
    ? "rounded-xl border border-neutral-200 bg-white px-4 py-3"
    : "rounded-xl border border-white/10 bg-white/5 px-4 py-3";

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div
        className="text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.heading || "Progress"}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={statCardClass}>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${getMutedTextClass(designKey)}`}>
            Current
          </div>
          <div
            className="mt-2 text-2xl font-bold leading-none"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {value}
          </div>
        </div>

        <div className={statCardClass}>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${getMutedTextClass(designKey)}`}>
            Goal
          </div>
          <div
            className="mt-2 text-2xl font-bold leading-none"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {max}
          </div>
        </div>
      </div>

      <div
        className={[
          "mt-4 h-4 w-full overflow-hidden rounded-full",
          isLightDesign(designKey) ? "bg-neutral-200" : "bg-white/10",
        ].join(" ")}
      >
        <div
          className={isLightDesign(designKey) ? "h-full bg-neutral-900" : "h-full bg-white"}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div
          className="text-xs"
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {block.data.showPercentage === false
            ? `${value} / ${max}`
            : `${percent}% complete`}
        </div>

        <div className={`text-xs ${getMutedTextClass(designKey)}`}>
          {value} of {max}
        </div>
      </div>
    </Surface>
  );
}

function renderDonation(
  block: Extract<MicrositeBlock, { type: "donation" }>,
  designKey?: string,
) {
  const rawGoal = Number(block.data.goalAmount);
  const rawCurrent = Number(block.data.currentAmount);

  const hasValidGoal = Number.isFinite(rawGoal) && rawGoal > 0;
  const hasValidCurrent = Number.isFinite(rawCurrent) && rawCurrent >= 0;

  if (!hasValidGoal || !hasValidCurrent) {
    return (
      <Surface
        block={block}
        designKey={designKey}
        className={getSoftSurfaceClass(designKey)}
      >
        <div
          className="text-base font-semibold"
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {block.data.heading || "Support This Cause"}
        </div>

        {block.data.description ? (
          <div
            className="mt-2 text-sm"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {block.data.description}
          </div>
        ) : null}

        <div
          className={[
            "mt-4 rounded-xl border border-dashed px-4 py-6 text-sm",
            isLightDesign(designKey)
              ? "border-neutral-300 bg-neutral-50 text-neutral-500"
              : "border-white/15 bg-white/5 text-white/60",
          ].join(" ")}
        >
          Set valid donation amounts.
        </div>
      </Surface>
    );
  }

  const goal = Math.max(1, rawGoal);
  const current = Math.max(0, Math.min(rawCurrent, goal));
  const percent = Math.round((current / goal) * 100);

  const raisedText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(current);

  const goalText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(goal);

  const statCardClass = isLightDesign(designKey)
    ? "rounded-xl border border-neutral-200 bg-white px-4 py-3"
    : "rounded-xl border border-white/10 bg-white/5 px-4 py-3";

  const ctaClass = isLightDesign(designKey)
    ? "inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white"
    : "inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-neutral-900";

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div
        className="text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.heading || "Support This Cause"}
      </div>

      {block.data.description ? (
        <div
          className="mt-2 text-sm"
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {block.data.description}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={statCardClass}>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${getMutedTextClass(designKey)}`}>
            Raised
          </div>
          <div
            className="mt-2 text-2xl font-bold leading-none"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {raisedText}
          </div>
        </div>

        <div className={statCardClass}>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${getMutedTextClass(designKey)}`}>
            Goal
          </div>
          <div
            className="mt-2 text-2xl font-bold leading-none"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {goalText}
          </div>
        </div>
      </div>

      <div
        className={[
          "mt-4 h-4 w-full overflow-hidden rounded-full",
          isLightDesign(designKey) ? "bg-neutral-200" : "bg-white/10",
        ].join(" ")}
      >
        <div
          className={isLightDesign(designKey) ? "h-full bg-neutral-900" : "h-full bg-white"}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div
          className="text-xs"
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {percent}% funded
        </div>

        <div className={`text-xs ${getMutedTextClass(designKey)}`}>
          {raisedText} of {goalText}
        </div>
      </div>

      <div className="mt-4">
        <a
          href={block.data.buttonUrl || "#"}
          target="_blank"
          rel="noreferrer noopener"
          className={ctaClass}
        >
          {block.data.buttonText || "Donate"}
        </a>
      </div>
    </Surface>
  );
}

function renderLinkHub(
  block: Extract<MicrositeBlock, { type: "link_hub" }>,
  designKey?: string,
) {
  const items = Array.isArray(block.data.items) ? block.data.items : [];

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div
        className="mb-3 text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.heading || "My Links"}
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <a
              key={item.id}
              href={normalizePreviewHref(item.url)}
              target="_blank"
              rel="noreferrer noopener"
              className={[
                "group flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition",
                isLightDesign(designKey)
                  ? "border-neutral-200 bg-white hover:bg-neutral-50"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-sm font-medium"
                  style={getContainerTextStyle(block.data.style, designKey)}
                >
                  {item.label || `Link ${index + 1}`}
                </div>

                {item.url ? (
                  <div
                    className={`mt-1 truncate text-xs ${getMutedTextClass(
                      designKey,
                    )}`}
                  >
                    {item.url.replace(/^https?:\/\//i, "").replace(/^\/\//, "")}
                  </div>
                ) : null}
              </div>

              <div
                className={[
                  "shrink-0 text-sm font-semibold transition",
                  isLightDesign(designKey)
                    ? "text-neutral-400 group-hover:text-neutral-700"
                    : "text-white/45 group-hover:text-white/80",
                ].join(" ")}
              >
                →
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div
          className={[
            "rounded-xl border border-dashed px-4 py-6 text-sm",
            isLightDesign(designKey)
              ? "border-neutral-300 bg-neutral-50 text-neutral-500"
              : "border-white/15 bg-white/5 text-white/60",
          ].join(" ")}
        >
          No links yet.
        </div>
      )}
    </Surface>
  );
}

function renderRegistry(
  block: Extract<MicrositeBlock, { type: "registry" }>,
  designKey?: string,
) {
  const items = Array.isArray(block.data.items) ? block.data.items : [];
  const isLight = isLightDesign(designKey);

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div
        className="mb-3 text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.heading || "Gift Registry"}
      </div>

      {block.data.description ? (
        <div
          className={`mb-4 text-sm ${getMutedTextClass(designKey)}`}
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {block.data.description}
        </div>
      ) : null}

      {items.length ? (
        <div className="space-y-4">
          {items.map((item, index) => {
            const href = normalizePreviewHref(item.url);
            const hasImage =
              typeof item.imageUrl === "string" &&
              item.imageUrl.trim().length > 0;
            const hasMeta = Boolean(item.store || item.price);
            const hasNote = Boolean(item.note && item.note.trim());

            const quantity =
              typeof item.quantity === "number" && Number.isFinite(item.quantity)
                ? Math.max(1, Math.floor(item.quantity))
                : 1;

            const purchased =
              typeof item.purchased === "number" && Number.isFinite(item.purchased)
                ? Math.max(0, Math.floor(item.purchased))
                : 0;

            const remaining = Math.max(0, quantity - purchased);

            const contributors = Array.isArray(item.contributors)
              ? item.contributors.filter(
                  (entry) =>
                    entry &&
                    typeof entry === "object" &&
                    typeof entry.name === "string" &&
                    entry.name.trim(),
                )
              : [];

            return (
              <div
                key={item.id}
                className={[
                  "group overflow-hidden rounded-2xl border transition",
                  isLight
                    ? "border-neutral-200 bg-white hover:bg-neutral-50 hover:shadow-md"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                ].join(" ")}
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block"
                >
                  {hasImage ? (
                    <div
                      className={[
                        "relative w-full overflow-hidden border-b",
                        isLight
                          ? "border-neutral-200 bg-neutral-100"
                          : "border-white/10 bg-white/5",
                      ].join(" ")}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.label || `Registry Item ${index + 1}`}
                        className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div
                      className={[
                        "flex h-24 w-full items-center justify-center border-b text-xs font-medium",
                        isLight
                          ? "border-neutral-200 bg-neutral-100 text-neutral-400"
                          : "border-white/10 bg-white/5 text-white/40",
                      ].join(" ")}
                    >
                      Gift Preview
                    </div>
                  )}
                </a>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block"
                      >
                        <div
                          className="truncate text-sm font-semibold"
                          style={getContainerTextStyle(block.data.style, designKey)}
                        >
                          {item.label || `Registry Item ${index + 1}`}
                        </div>
                      </a>

                      {hasMeta ? (
                        <div
                          className={`mt-1 truncate text-xs ${getMutedTextClass(
                            designKey,
                          )}`}
                        >
                          {[item.store, item.price].filter(Boolean).join(" • ")}
                        </div>
                      ) : null}

                      <div
                        className={`mt-2 text-xs ${getMutedTextClass(designKey)}`}
                      >
                        {remaining > 0
                          ? `${remaining} of ${quantity} remaining`
                          : "Fully claimed"}
                      </div>

                      {contributors.length ? (
                        <div
                          className={`mt-1 text-xs ${getMutedTextClass(designKey)}`}
                        >
                          Claimed by:{" "}
                          {contributors
                            .map((entry: any) => entry.name)
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      ) : null}

                      {hasNote ? (
                        <div
                          className={`mt-2 text-xs ${getMutedTextClass(
                            designKey,
                          )}`}
                        >
                          {item.note}
                        </div>
                      ) : null}

                      {item.url ? (
                        <div
                          className={`mt-2 truncate text-[11px] ${getMutedTextClass(
                            designKey,
                          )}`}
                        >
                          {item.url
                            .replace(/^https?:\/\//i, "")
                            .replace(/^\/\//, "")}
                        </div>
                      ) : null}
                    </div>

                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={[
                        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition",
                        isLight
                          ? "bg-neutral-100 text-neutral-500 hover:bg-neutral-900 hover:text-white"
                          : "bg-white/10 text-white/70 hover:bg-white hover:text-neutral-900",
                      ].join(" ")}
                    >
                      Open
                    </a>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div
                      className={[
                        "rounded-full px-3 py-1 text-[11px] font-semibold",
                        remaining > 0
                          ? isLight
                            ? "bg-neutral-100 text-neutral-600"
                            : "bg-white/10 text-white/70"
                          : isLight
                            ? "bg-neutral-900 text-white"
                            : "bg-white text-neutral-900",
                      ].join(" ")}
                    >
                      {remaining > 0 ? "Available" : "Claimed"}
                    </div>

                    <button
                      type="button"
                      disabled
                      className={[
                        "rounded-full px-3 py-1 text-[11px] font-semibold opacity-60",
                        isLight
                          ? "bg-neutral-100 text-neutral-500"
                          : "bg-white/10 text-white/70",
                      ].join(" ")}
                      title="Claim flow UI added. Live claiming logic comes next."
                    >
                      Claim Item
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={[
            "rounded-xl border border-dashed px-4 py-6 text-sm",
            isLightDesign(designKey)
              ? "border-neutral-300 bg-neutral-50 text-neutral-500"
              : "border-white/15 bg-white/5 text-white/60",
          ].join(" ")}
        >
          No registry items yet.
        </div>
      )}
    </Surface>
  );
}

function renderChecklist(
  block: Extract<MicrositeBlock, { type: "checklist" }>,
  designKey?: string,
) {
  const items = Array.isArray(block.data.items) ? block.data.items : [];

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div
        className="mb-3 text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.heading || "Checklist"}
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={[
                "flex items-center gap-3 rounded-xl border px-3 py-3",
                isLightDesign(designKey)
                  ? "border-neutral-200 bg-white"
                  : "border-white/10 bg-white/5",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold",
                  Boolean(item.checked)
                    ? isLightDesign(designKey)
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-white bg-white text-neutral-900"
                    : isLightDesign(designKey)
                      ? "border-neutral-300 bg-white text-neutral-400"
                      : "border-white/20 bg-transparent text-white/40",
                ].join(" ")}
              >
                {item.checked ? "✓" : index + 1}
              </div>

              <div
                className={Boolean(item.checked) ? "opacity-70" : ""}
                style={{
                  ...getContainerTextStyle(block.data.style, designKey),
                  textDecoration: item.checked ? "line-through" : "none",
                }}
              >
                {item.label || "Checklist item"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={[
            "rounded-xl border border-dashed px-4 py-6 text-sm",
            isLightDesign(designKey)
              ? "border-neutral-300 bg-neutral-50 text-neutral-500"
              : "border-white/15 bg-white/5 text-white/60",
          ].join(" ")}
        >
          No checklist items yet.
        </div>
      )}
    </Surface>
  );
}

function renderScheduleAgenda(
  block: Extract<MicrositeBlock, { type: "schedule_agenda" }>,
  designKey?: string,
) {
  const items = Array.isArray(block.data.items) ? block.data.items : [];

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div
        className="mb-3 text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.heading || "Schedule"}
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={[
                "rounded-xl border px-3 py-3",
                isLightDesign(designKey)
                  ? "border-neutral-200 bg-white"
                  : "border-white/10 bg-white/5",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex min-h-[48px] min-w-[72px] shrink-0 flex-col items-center justify-center rounded-lg px-2 py-2 text-center",
                    isLightDesign(designKey)
                      ? "bg-neutral-100"
                      : "bg-white/10",
                  ].join(" ")}
                >
                  <div className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${getMutedTextClass(designKey)}`}>
                    Item
                  </div>
                  <div
                    className="mt-1 text-sm font-semibold"
                    style={getContainerTextStyle(block.data.style, designKey)}
                  >
                    {item.time || `${index + 1}`}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="font-medium"
                    style={getContainerTextStyle(block.data.style, designKey)}
                  >
                    {item.title || "Event"}
                  </div>

                  {item.description ? (
                    <div
                      className="mt-1 text-sm"
                      style={getContainerTextStyle(block.data.style, designKey)}
                    >
                      {item.description}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={[
            "rounded-xl border border-dashed px-4 py-6 text-sm",
            isLightDesign(designKey)
              ? "border-neutral-300 bg-neutral-50 text-neutral-500"
              : "border-white/15 bg-white/5 text-white/60",
          ].join(" ")}
        >
          No schedule items yet.
        </div>
      )}
    </Surface>
  );
}

function renderMapLocation(
  block: Extract<MicrositeBlock, { type: "map_location" }>,
  designKey?: string,
) {
  const heading = block.data.heading?.trim() || "Location";
  const locationName = block.data.locationName?.trim() || "";
  const address = block.data.address?.trim() || "";
  const mapUrl = block.data.mapUrl?.trim() || "";

  const hasUsefulLocation = Boolean(locationName || address || mapUrl);

  if (!hasUsefulLocation) {
    return (
      <Surface
        block={block}
        designKey={designKey}
        className={getSoftSurfaceClass(designKey)}
      >
        <div
          className="mb-3 text-base font-semibold"
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {heading}
        </div>

        <div
          className={[
            "rounded-xl border border-dashed px-4 py-6 text-sm",
            isLightDesign(designKey)
              ? "border-neutral-300 bg-neutral-50 text-neutral-500"
              : "border-white/15 bg-white/5 text-white/60",
          ].join(" ")}
        >
          Add a location name, address, or map link to show this section.
        </div>
      </Surface>
    );
  }

  const mapHref =
    mapUrl ||
    (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address,
        )}`
      : "");

  const embedSrc = address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
    : "";

  const detailCardClass = isLightDesign(designKey)
    ? "mt-3 rounded-xl border border-neutral-200 bg-white p-4"
    : "mt-3 rounded-xl border border-white/10 bg-white/5 p-4";

  const buttonClass = isLightDesign(designKey)
    ? "mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800"
    : "mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-medium text-white";

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
      <div
        className="mb-3 text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {heading}
      </div>

      {embedSrc ? (
        <div
          className={[
            "overflow-hidden rounded-xl border",
            isLightDesign(designKey)
              ? "border-neutral-200"
              : "border-white/10",
          ].join(" ")}
        >
          <iframe
            src={embedSrc}
            title={locationName || heading || "Map"}
            className="h-48 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div
          className={[
            "flex h-40 w-full items-center justify-center rounded-xl border text-sm",
            isLightDesign(designKey)
              ? "border-neutral-200 bg-neutral-100 text-neutral-500"
              : "border-white/10 bg-white/5 text-white/60",
          ].join(" ")}
        >
          Add an address to show the embedded map
        </div>
      )}

      <div className={detailCardClass}>
        {locationName ? (
          <div
            className="text-sm font-semibold"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {locationName}
          </div>
        ) : null}

        {address ? (
          <div
            className="mt-1 text-sm"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            {address}
          </div>
        ) : null}

        {mapHref ? (
          <a
            href={mapHref}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonClass}
          >
            Open Map
          </a>
        ) : null}
      </div>
    </Surface>
  );
}


function renderSpeedDating(
  block: Extract<MicrositeBlock, { type: "speed_dating" }>,
  designKey?: string,
  micrositeId?: string | null,
  serverNow?: number,
) {
  function ParticipantCard({
    participant,
    tone = "default",
  }: {
    participant: SpeedDatingParticipant;
    tone?: "default" | "active" | "waiting";
  }) {
    const toneClass =
      tone === "active"
        ? isLightDesign(designKey)
          ? "border-blue-200 bg-blue-50"
          : "border-blue-400/20 bg-blue-500/10"
        : tone === "waiting"
          ? isLightDesign(designKey)
            ? "border-amber-200 bg-amber-50"
            : "border-amber-400/20 bg-amber-500/10"
          : isLightDesign(designKey)
            ? "border-neutral-200 bg-white"
            : "border-white/10 bg-white/5";

    return (
      <div className={`rounded-2xl border p-3 shadow-sm ${toneClass}`}>
        <div className="flex items-start gap-3">
          {participant.image_url ? (
            <img
              src={participant.image_url}
              alt={participant.name || "Participant"}
              className="h-11 w-11 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold",
                isLightDesign(designKey)
                  ? "border-neutral-200 bg-white text-neutral-700"
                  : "border-white/10 bg-white/10 text-white/80",
              ].join(" ")}
            >
              {(participant.name || "?")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div
              className="truncate text-sm font-semibold"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              {participant.name}
            </div>

            <div className={`mt-0.5 truncate text-xs ${getMutedTextClass(designKey)}`}>
              {participant.title}
            </div>

            <div className={`mt-2 line-clamp-2 text-xs leading-5 ${getMutedTextClass(designKey)}`}>
              {participant.bio}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function EmptySlot({ label }: { label: string }) {
    return (
      <div
        className={[
          "rounded-2xl border border-dashed p-4 text-sm",
          isLightDesign(designKey)
            ? "border-neutral-300 bg-neutral-50 text-neutral-500"
            : "border-white/15 bg-white/5 text-white/60",
        ].join(" ")}
      >
        {label}
      </div>
    );
  }

  function SpeedDatingPreview() {
    const duration = Math.max(
      30,
      Number.isFinite(block.data.roundDurationSeconds)
        ? Math.floor(block.data.roundDurationSeconds)
        : 120,
    );

    const [round, setRound] = useState(0);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [apiState, setApiState] = useState<SpeedDatingApiState | null>(null);

    useEffect(() => {
      setRound(0);
      setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
      async function fetchState() {
        try {
          const url = micrositeId
            ? `/api/speed-dating?micrositeId=${micrositeId}`
            : "/api/speed-dating";

          const res = await fetch(url, { cache: "no-store" });
          const data = await res.json();

          if (data?.ok) {
            setApiState(data);
            setRound(data.round ?? 0);
            setTimeLeft(data.timeLeftSeconds ?? duration);
          }
        } catch {
          // ignore
        }
      }

      void fetchState();
      const interval = window.setInterval(fetchState, 2000);

      return () => window.clearInterval(interval);
    }, [duration, micrositeId]);

    useEffect(() => {
      if (apiState) return;

      const baseTime = serverNow ? Date.now() - serverNow : 0;

      const timer = window.setInterval(() => {
        setTimeLeft((current) => {
          if (current <= 1) {
            setRound((prev) => prev + 1);
            return duration;
          }
          return current - 1;
        });
      }, 1000);

      return () => window.clearInterval(timer);
    }, [apiState, duration, serverNow]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progressPercent =
      duration > 0
        ? Math.max(0, Math.min(100, ((duration - timeLeft) / duration) * 100))
        : 0;

    const leftParticipants = apiState?.leftQueue ?? [];
    const rightParticipants = apiState?.rightQueue ?? [];
    const activePairs = apiState?.activePairs ?? [];

    return (
      <Surface
        block={block}
        designKey={designKey}
        className={getSoftSurfaceClass(designKey)}
      >
        <div className="h-full w-full overflow-auto p-1">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div
                className="truncate text-base font-semibold"
                style={getContainerTextStyle(block.data.style, designKey)}
              >
                {block.data.heading || "Speed Dating"}
              </div>
              <div className={`mt-1 text-xs ${getMutedTextClass(designKey)}`}>
                Live matchmaking board
              </div>
            </div>

            <div
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium",
                isLightDesign(designKey)
                  ? "border-neutral-200 bg-white text-neutral-600"
                  : "border-white/10 bg-white/10 text-white/75",
              ].join(" ")}
            >
              Round {round + 1}
            </div>
          </div>

          {block.data.showTimer !== false ? (
            <div
              className={[
                "rounded-2xl border p-4 shadow-sm",
                isLightDesign(designKey)
                  ? "border-neutral-200 bg-white"
                  : "border-white/10 bg-white/5",
              ].join(" ")}
            >
              <div className={`text-xs font-semibold uppercase tracking-[0.14em] ${getMutedTextClass(designKey)}`}>
                Time Remaining
              </div>

              <div
                className="mt-1 text-3xl font-semibold"
                style={getContainerTextStyle(block.data.style, designKey)}
              >
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>

              <div
                className={[
                  "mt-4 h-2 overflow-hidden rounded-full",
                  isLightDesign(designKey) ? "bg-neutral-200" : "bg-white/10",
                ].join(" ")}
              >
                <div
                  className={isLightDesign(designKey) ? "h-full rounded-full bg-blue-600" : "h-full rounded-full bg-white"}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className={[
              "rounded-2xl border p-4",
              isLightDesign(designKey)
                ? "border-neutral-200 bg-white"
                : "border-white/10 bg-white/5",
            ].join(" ")}>
              <div className="mb-3 font-semibold" style={getContainerTextStyle(block.data.style, designKey)}>
                {block.data.leftLabel ?? "Men"}
              </div>

              <div className="space-y-2">
                {leftParticipants.length ? (
                  leftParticipants.map((p) => (
                    <ParticipantCard key={p.id} participant={p} tone={p.waiting ? "waiting" : "active"} />
                  ))
                ) : (
                  <EmptySlot label="No participants yet" />
                )}
              </div>
            </div>

            <div className={[
              "rounded-2xl border p-4",
              isLightDesign(designKey)
                ? "border-neutral-200 bg-white"
                : "border-white/10 bg-white/5",
            ].join(" ")}>
              <div className="mb-3 font-semibold" style={getContainerTextStyle(block.data.style, designKey)}>
                {block.data.rightLabel ?? "Women"}
              </div>

              <div className="space-y-2">
                {rightParticipants.length ? (
                  rightParticipants.map((p) => (
                    <ParticipantCard key={p.id} participant={p} tone={p.waiting ? "waiting" : "active"} />
                  ))
                ) : (
                  <EmptySlot label="No participants yet" />
                )}
              </div>
            </div>
          </div>

          <div className={[
            "mt-4 rounded-2xl border p-4",
            isLightDesign(designKey)
              ? "border-neutral-200 bg-white"
              : "border-white/10 bg-white/5",
          ].join(" ")}>
            <div className="mb-3 font-semibold" style={getContainerTextStyle(block.data.style, designKey)}>
              Active Pairs
            </div>

            {activePairs.length ? (
              <div className="space-y-3">
                {activePairs.map((pair) => (
                  <div key={pair.id} className="grid grid-cols-3 gap-2">
                    {pair.leftParticipant ? (
                      <ParticipantCard participant={pair.leftParticipant} />
                    ) : (
                      <EmptySlot label="Open slot" />
                    )}

                    <div className="flex items-center justify-center text-xl">↔</div>

                    {pair.rightParticipant ? (
                      <ParticipantCard participant={pair.rightParticipant} />
                    ) : (
                      <EmptySlot label="Open slot" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptySlot label="No active pairs yet" />
            )}
          </div>
        </div>
      </Surface>
    );
  }

  return <SpeedDatingPreview />;
}

function renderCheckout(
  block: Extract<MicrositeBlock, { type: "checkout" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  const data = block.data;

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockId: block.id,
          micrositeId,
        }),
      });

      const rawText = await res.text();

      let payload: any = null;
      try {
        payload = rawText ? JSON.parse(rawText) : null;
      } catch {
        payload = rawText;
      }

      if (!res.ok) {
        const debugMessage = JSON.stringify(
          {
            status: res.status,
            statusText: res.statusText,
            rawText,
            payload,
            micrositeId: micrositeId ?? null,
            blockId: block.id,
          },
          null,
          2,
        );

        console.error("Checkout API error:\n" + debugMessage);

alert(
  JSON.stringify(
    payload,
    null,
    2,
  ),
);

        return;
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      console.error("No checkout URL returned", { rawText, payload });
      alert("No checkout URL returned.");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong starting checkout.");
    }
  };

  return (
<Surface block={block}>
  <div className="flex h-full w-full flex-col gap-3">
    {data.imageUrl ? (
      <img
        src={data.imageUrl}
        alt={data.productName}
        className="h-40 w-full rounded-lg object-cover"
      />
    ) : null}

    <div className="text-base font-semibold">
      {data.productName || "Product"}
    </div>

    {data.description ? (
      <div className="text-sm opacity-70">
        {data.description}
      </div>
    ) : null}

    <div className="text-lg font-bold">
      ${Number(data.price || 0).toFixed(2)}
    </div>

    <button
      onClick={handleCheckout}
      disabled={!micrositeId}
      className="mt-auto w-full rounded-xl bg-black py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      title={
        !micrositeId
          ? "Checkout only works on live microsites right now."
          : undefined
      }
    >
      {!micrositeId
        ? "Live Microsite Required"
        : data.buttonText || "Checkout"}
    </button>
  </div>
</Surface>
  );
}

export default function BlockRenderer({
  block,
  designKey = "blank",
  micrositeId = null,
  serverNow,
}: Props) {
  switch (block.type) {
    case "label":
      return renderLabel(block, designKey);
    case "text_fx":
      return renderTextFx(block, designKey);
    case "image":
      return renderImage(block, designKey);
    case "listing":
      return renderListing(block, designKey);
    case "image_carousel":
      return renderImageCarousel(block, designKey);
    case "form_field":
      return renderFormField(block, designKey);
    case "cta":
      return renderCta(block, designKey);
case "checkout": {
  const data = block.data as any;

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockId: block.id,
          micrositeId,
        }),
      });

      const rawText = await res.text();

      let payload: any = null;
      try {
        payload = rawText ? JSON.parse(rawText) : null;
      } catch {
        payload = rawText;
      }

      if (!res.ok) {
        const debugMessage = JSON.stringify(
          {
            status: res.status,
            statusText: res.statusText,
            rawText,
            payload,
            micrositeId: micrositeId ?? null,
            blockId: block.id,
          },
          null,
          2,
        );

        console.error("Checkout API error:\n" + debugMessage);

alert(JSON.stringify(payload, null, 2));

        return;
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      console.error("No checkout URL returned", {
        rawText,
        payload,
      });
      alert("No checkout URL returned.");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong starting checkout.");
    }
  };

  return (
    <Surface block={block}>
      <div className="flex h-full w-full flex-col gap-3">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.productName}
            className="w-full h-40 object-cover rounded-lg"
          />
        ) : null}

        <div className="font-semibold text-base">
          {data.productName || "Product"}
        </div>

        {data.description ? (
          <div className="text-sm opacity-70">
            {data.description}
          </div>
        ) : null}

        <div className="text-lg font-bold">
          ${Number(data.price || 0).toFixed(2)}
        </div>

        <button
          onClick={handleCheckout}
          disabled={!micrositeId}
          className="mt-auto w-full rounded-xl bg-black py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          title={!micrositeId ? "Checkout only works on live microsites right now." : undefined}
        >
          {!micrositeId
            ? "Live Microsite Required"
            : data.buttonText || "Checkout"}
        </button>
      </div>
    </Surface>
  );
}
    case "countdown":
      return renderCountdown(block, designKey, serverNow);
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
    case "rich_text":
      return renderRichText(block, designKey);
    case "progress_bar":
      return renderProgressBar(block, designKey);
    case "donation":
      return renderDonation(block, designKey);
    case "link_hub":
      return renderLinkHub(block, designKey);
    case "checklist":
      return renderChecklist(block, designKey);
    case "registry":
      return renderRegistry(block, designKey);
    case "schedule_agenda":
      return renderScheduleAgenda(block, designKey);
    case "map_location":
      return renderMapLocation(block, designKey);
    case "file_share":
      return renderFileShare(block, designKey, micrositeId);
    case "speed_dating":
      return (
        <SpeedDatingLive
          heading={block.data.heading}
          roundDurationSeconds={block.data.roundDurationSeconds ?? 120}
          showTimer={block.data.showTimer !== false}
          leftLabel={block.data.leftLabel}
          rightLabel={block.data.rightLabel}
          roundStartSound={block.data.roundStartSound}
        />
      );

    default:
      return <div className="h-full w-full" />;
  }
}