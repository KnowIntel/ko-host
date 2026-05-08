// components\preview\BlockRenderer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SpeedDatingLive from "@/components/blocks/SpeedDatingLive";
import PopBalloonLive from "@/components/blocks/PopBalloonLive";

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

type CartItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
};

type Props = {
  block: MicrositeBlock;
  designKey?: string;
  micrositeId?: string | null;
  micrositeSlug?: string | null;
  serverNow?: number;
  previewMode?: boolean;
  cartItems?: CartItem[];
  cartSubtotal?: number;
  listingQuantities?: Record<string, number>;
  onChangeListingQuantity?: (listingId: string, nextQuantity: number) => void;
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

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const FONT_FAMILY_MAP: Record<string, string> = {
  // Core / system-mapped
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

  // Script / invitation (use NEXT FONT INSTANCES)
  "Dancing Script": `${dancingScript.style.fontFamily}, cursive`,
  Pacifico: `${pacifico.style.fontFamily}, cursive`,
  Allura: `${allura.style.fontFamily}, cursive`,
  Parisienne: `${parisienne.style.fontFamily}, cursive`,
  Sacramento: `${sacramento.style.fontFamily}, cursive`,
  Playball: `${playball.style.fontFamily}, cursive`,
  Satisfy: `${satisfy.style.fontFamily}, cursive`,
  Tangerine: `${tangerine.style.fontFamily}, cursive`,

  // Modern sans
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

  // Serif (use instances)
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

  // Display / stylized (use instances ONLY — no duplicates)
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

  const positionX = block.data.positionX ?? 50;
  const positionY = block.data.positionY ?? 50;
  const scale = block.data.scale ?? 1;
  const rotation = block.data.rotation ?? 0;
  const opacity = block.data.opacity ?? 1;
  const fade = block.data.fade;

  const translateX = (positionX - 50) * 0.6;
  const translateY = (positionY - 50) * 0.6;

  const fadeSize =
    typeof fade?.size === "number" && Number.isFinite(fade.size)
      ? Math.max(0, Math.min(50, fade.size))
      : 15;

  const fadeStyle: React.CSSProperties =
    fade?.top || fade?.bottom || fade?.left || fade?.right
      ? {
          WebkitMaskImage: [
            fade?.top || fade?.bottom
              ? `linear-gradient(to bottom, ${
                  fade?.top ? "transparent" : "black"
                } 0%, black ${fadeSize}%, black ${100 - fadeSize}%, ${
                  fade?.bottom ? "transparent" : "black"
                } 100%)`
              : "",
            fade?.left || fade?.right
              ? `linear-gradient(to right, ${
                  fade?.left ? "transparent" : "black"
                } 0%, black ${fadeSize}%, black ${100 - fadeSize}%, ${
                  fade?.right ? "transparent" : "black"
                } 100%)`
              : "",
          ]
            .filter(Boolean)
            .join(", "),
          maskImage: [
            fade?.top || fade?.bottom
              ? `linear-gradient(to bottom, ${
                  fade?.top ? "transparent" : "black"
                } 0%, black ${fadeSize}%, black ${100 - fadeSize}%, ${
                  fade?.bottom ? "transparent" : "black"
                } 100%)`
              : "",
            fade?.left || fade?.right
              ? `linear-gradient(to right, ${
                  fade?.left ? "transparent" : "black"
                } 0%, black ${fadeSize}%, black ${100 - fadeSize}%, ${
                  fade?.right ? "transparent" : "black"
                } 100%)`
              : "",
          ]
            .filter(Boolean)
            .join(", "),
        }
      : {};

  const transform = `translate(${translateX}%, ${translateY}%) scale(${scale}) rotate(${rotation}deg)`;

  if (block.data.shapeType === "line") {
    return (
      <div
        className="flex h-full w-full items-center"
        style={{
          opacity,
          transform,
          transformOrigin: "center",
          ...fadeStyle,
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
        opacity,
        transform,
        transformOrigin: "center",
        borderRadius:
          block.data.shapeType === "circle"
            ? "9999px"
            : style.borderRadius || "16px",
        minHeight: "100%",
        ...fadeStyle,
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
      <div
        style={{
          ...getContainerTextStyle(block.data.style, designKey),
          transform: `translate(${((block.data as any).positionX ?? 50) - 50}%, ${
            ((block.data as any).positionY ?? 50) - 50
          }%)`,
        }}
      >
        {getLabelText(block)}
      </div>
    </div>
  );
}

function renderVideo(
  block: Extract<MicrositeBlock, { type: "video" }>,
  designKey?: string,
) {
  const titleStyle = getContainerTextStyle(block.data.style, designKey);
  const videoUrl = (block.data.videoUrl ?? "").trim();
  const showCaption = Boolean((block.data as any).addCaption);
  const caption = String((block.data as any).caption ?? "").trim();
  const captionStyle = ((block.data as any).captionStyle ?? {}) as TextStyle;

  if (!videoUrl) {
    return (
      <Placeholder
        block={block}
        designKey={designKey}
        label="Add video URL or upload a video"
      />
    );
  }

  const isDirectVideoFile =
    videoUrl.startsWith("data:video/") ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(videoUrl);

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-hidden p-2">
      {block.data.title ? (
        <div style={titleStyle}>{block.data.title}</div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-black/5">
        {isDirectVideoFile ? (
          <video
            src={videoUrl}
            className="h-full w-full"
            autoPlay={Boolean(block.data.autoplay)}
            muted={Boolean(block.data.muted)}
            loop={Boolean(block.data.loop)}
            controls={Boolean(block.data.showControls)}
            playsInline
          />
        ) : (
          <iframe
            src={videoUrl}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={block.data.title || "Video"}
          />
        )}
      </div>

      {showCaption && caption ? (
<div
  className="shrink-0 px-2 text-xs text-neutral-700"
  style={getContainerTextStyle(captionStyle, designKey)}
>
  {caption}
</div>
      ) : null}
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
  const frameStyle = getImageFrameStyle(block);
  const showCaption = Boolean((block.data as any).addCaption);
  const caption = String((block.data as any).caption ?? "").trim();
  const captionStyle = ((block.data as any).captionStyle ?? {}) as TextStyle;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div
          className="h-full w-full overflow-hidden"
          style={{
            ...frameStyle,
            transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            opacity: block.data.image.opacity ?? 1,
          }}
        >
          <img
            src={block.data.image.url}
            alt={block.data.image.alt || ""}
            className="h-full w-full"
            style={{
              objectFit: getImageObjectFit(block),
              objectPosition: "center center",
              transform: "none",
              opacity: 1,
              ...fadeMaskStyle,
            }}
          />
        </div>
      </div>

      {showCaption && caption ? (
        <div
          className="shrink-0 px-2 py-1 text-xs text-neutral-700"
          style={getContainerTextStyle(captionStyle, designKey)}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}

function renderListing(
  block: Extract<MicrositeBlock, { type: "listing" }>,
  designKey?: string,
  listingQuantities: Record<string, number> = {},
  onChangeListingQuantity?: (listingId: string, nextQuantity: number) => void,
) {
  const image = block.data.image;
  const metadata = Array.isArray(block.data.metadata) ? block.data.metadata : [];
  const price = typeof block.data.price === "number" ? block.data.price : 0;
  const addToCart = !!block.data.addToCart;
  const isSelectable = addToCart && price > 0;
  const quantity =
    typeof listingQuantities[block.id] === "number" &&
    Number.isFinite(listingQuantities[block.id])
      ? Math.max(0, Math.floor(listingQuantities[block.id]))
      : 0;
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

  {price > 0 ? (
    <div className="text-sm font-semibold">
      ${formatCurrency(price)}
    </div>
  ) : null}

  {isSelectable ? (
    <div className="flex items-center gap-2 text-sm">
      <span>Qty</span>

      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-medium"
        onClick={(e) => {
          e.stopPropagation();
          onChangeListingQuantity?.(block.id, Math.max(0, quantity - 1));
        }}
      >
        -
      </button>

      <div className="min-w-[28px] text-center font-semibold">
        {quantity}
      </div>

      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-medium"
        onClick={(e) => {
          e.stopPropagation();
          onChangeListingQuantity?.(block.id, quantity + 1);
        }}
      >
        +
      </button>
    </div>
  ) : null}

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

  {price > 0 ? (
    <div className="text-sm font-semibold">
      ${formatCurrency(price)}
    </div>
  ) : null}

  {isSelectable ? (
    <div className="flex items-center gap-2 text-sm">
      <span>Qty</span>

      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-medium"
        onClick={(e) => {
          e.stopPropagation();
          onChangeListingQuantity?.(block.id, Math.max(0, quantity - 1));
        }}
      >
        -
      </button>

      <div className="min-w-[28px] text-center font-semibold">
        {quantity}
      </div>

      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-medium"
        onClick={(e) => {
          e.stopPropagation();
          onChangeListingQuantity?.(block.id, quantity + 1);
        }}
      >
        +
      </button>
    </div>
  ) : null}

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
  function CtaButtonLive() {
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const appearance = getAppearanceStyle(block);
    const style = getContainerTextStyle(block.data.style, designKey);
    const buttonStyleType =
      ((block.data as any).styleType as "solid" | "outline" | "soft" | undefined) ??
      "solid";

    const submittedText =
      ((block.data as any).submittedText as string | undefined) || "Submitted";

    const justifyContent =
      block.data.style?.align === "left"
        ? "flex-start"
        : block.data.style?.align === "right"
          ? "flex-end"
          : "center";

    const solidStyle: React.CSSProperties = {
      background:
        submitted
          ? "#16a34a"
          : appearance.backgroundColor && appearance.backgroundColor !== "transparent"
            ? appearance.backgroundColor
            : "#111827",
      color: style.color || "#ffffff",
      borderColor: submitted ? "#16a34a" : appearance.borderColor || "transparent",
      borderWidth: appearance.borderWidth,
      borderStyle: appearance.borderStyle,
      borderRadius: appearance.borderRadius,
    };

    const outlineStyle: React.CSSProperties = {
      background: submitted ? "#dcfce7" : "transparent",
      color: submitted ? "#166534" : style.color || appearance.borderColor || "#111827",
      borderColor: submitted ? "#16a34a" : appearance.borderColor || "#111827",
      borderWidth:
        typeof appearance.borderWidth === "string"
          ? appearance.borderWidth
          : "1px",
      borderStyle: "solid",
      borderRadius: appearance.borderRadius,
    };

    const softStyle: React.CSSProperties = {
      background:
        submitted
          ? "#dcfce7"
          : appearance.backgroundColor && appearance.backgroundColor !== "transparent"
            ? appearance.backgroundColor
            : "rgba(17, 24, 39, 0.10)",
      color: submitted ? "#166534" : style.color || "#111827",
      borderColor: submitted ? "#16a34a" : appearance.borderColor || "transparent",
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

    async function handleLinkedFieldSubmit() {
      if (submitting) return;

      const fields = Array.from(
        document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          `[data-linked-button="${block.id}"]`,
        ),
      );

      if (!fields.length) {
        if (block.data.buttonUrl?.trim()) {
          const href = normalizePreviewHref(block.data.buttonUrl);

if (href.startsWith("#")) {
  document.querySelector(href)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
} else {
  window.open(href, "_blank");
}
        }
        return;
      }

      const missingRequired = fields.find(
        (field) => field.dataset.required === "true" && !field.value.trim(),
      );

      if (missingRequired) {
        missingRequired.focus();
        return;
      }

      const values = fields.map((field) => {
        const label = field.dataset.fieldLabel || "Field";
        return {
          label,
          value: field.value.trim(),
        };
      });

      const message = values
        .map((field) => `${field.label}: ${field.value}`)
        .join("<|>");

try {
  setSubmitting(true);

  const startedAt = Date.now();

  const res = await fetch("/api/public/general-submissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      micrositeId: (block as any).micrositeId ?? "",
      hostname:
        typeof window !== "undefined" ? window.location.hostname : "",
      pageSlug:
        typeof window !== "undefined"
          ? window.location.pathname.split("/").filter(Boolean)[1] || "home"
          : "home",
      linkedButtonId: block.id,
      message,
      fields: values,
    }),
  });

  const elapsed = Date.now() - startedAt;
  const remaining = Math.max(0, 2000 - elapsed);

  await new Promise((resolve) => window.setTimeout(resolve, remaining));

  if (!res.ok) throw new Error("Submission failed");

  setSubmitted(true);

  fields.forEach((field) => {
    field.value = "";
  });

  window.setTimeout(() => {
    setSubmitted(false);
  }, 2500);
} catch {
  setSubmitted(false);
} finally {
  setSubmitting(false);
}
    }

const posX = Number((block.data as any).posX ?? 50);
const posY = Number((block.data as any).posY ?? 50);

return (
  <div className="h-full w-full overflow-hidden">
    <div
      className="flex h-full w-full px-4 py-2"
      style={{
        justifyContent,
        alignItems: "center",
        textAlign: block.data.style?.align ?? "center",
      }}
    >
      <button
        type="button"
        onClick={handleLinkedFieldSubmit}
        disabled={submitting}
        className="inline-flex cursor-pointer items-center justify-center px-5 py-2 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          ...style,
          ...variantStyle,
          transform: `translate(${posX - 50}%, ${posY - 50}%)`,
        }}
      >
        {submitted
          ? submittedText
          : submitting
            ? "Submitting..."
            : block.data.buttonText || "Button"}
      </button>
    </div>
  </div>
);
  }

  return <CtaButtonLive />;
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
    const tileStyle = getContainerTextStyle(
      ((block.data as any).tileStyle ?? block.data.style ?? {}) as TextStyle,
      designKey,
    );
    const tileBackgroundColor =
      ((block.data as any).tileStyle?.backgroundColor as string | undefined) ??
      undefined;

    const variant = block.data.styleVariant ?? "default";
    const showRings = block.data.showRings !== false;
const animationStyle =
  ((block.data as any).animationStyle as "pulse" | "flip" | "slide" | undefined) ?? "pulse";

const countdownAnimationTransform = (baseTransform: string) => {
  if (!isTicking) return baseTransform;

  if (animationStyle === "flip") {
    return `${baseTransform} rotateX(-78deg)`;
  }

  if (animationStyle === "slide") {
    return `${baseTransform} translateY(-14px)`;
  }

  return `${baseTransform} scale(1.08)`;
};

const countdownAnimationTransition =
  animationStyle === "flip"
    ? "transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease"
    : animationStyle === "slide"
      ? "transform 180ms ease, opacity 180ms ease"
      : "transform 200ms ease";

const countdownAnimationExtraStyle =
  animationStyle === "flip"
    ? {
        transformStyle: "preserve-3d" as const,
        backfaceVisibility: "hidden" as const,
        transformOrigin: "center center",
      }
    : {};

const appearanceStyle = getAppearanceStyle(block);

if (!target || Number.isNaN(target)) {
  return (
    <Surface block={block} designKey={designKey} className={getSoftSurfaceClass(designKey)}>
      {block.data.heading ? (
        <div
          className={["uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
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
        <Surface block={block} designKey={designKey} className={getSoftSurfaceClass(designKey)}>
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

    const parts = days > 0 ? partsRaw : partsRaw.filter((p) => p.label !== "D");

    if (variant === "cards") {
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-4 p-4"
          style={appearanceStyle}
        >
          {block.data.heading ? (
            <div
              className={["text-center uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
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
                  style={{
                    backgroundColor: tileBackgroundColor,
                    perspective: "700px",
                  }}
                >
                  {showRings ? (
                    <svg className="pointer-events-none absolute inset-0 h-full w-full">
                      <circle cx="50%" cy="50%" r="28" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.1" />
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
                          175 *
                            (part.label === "S"
                              ? seconds / 60
                              : part.label === "M"
                                ? minutes / 60
                                : part.label === "H"
                                  ? hours / 24
                                  : days / 365)
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
                      ...tileStyle,
                      ...countdownAnimationExtraStyle,
                      fontSize: Math.max(20, Number(tileStyle.fontSize) || 20),
                      transition: countdownAnimationTransition,
                      transform: countdownAnimationTransform(
                        seconds < 10
                          ? isTicking
                            ? "scale(1.15)"
                            : "scale(1.05)"
                          : isTicking
                            ? "scale(1.08)"
                            : "scale(1)",
                      ),
                    }}
                  >
                    {part.value}
                  </div>

                  <div className={["mt-1 text-[10px]", getMutedTextClass(designKey)].join(" ")}>
                    {part.label}
                  </div>
                </div>

                {index < parts.length - 1 ? (
                  <span className={["text-lg font-semibold", getMutedTextClass(designKey)].join(" ")}>:</span>
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
              className={["uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
              style={style}
            >
              {block.data.heading}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-4">
            {parts.map((part, index) => (
              <div key={part.label} className="flex items-center gap-4">
                <div
                  className="relative flex flex-col items-center rounded-xl px-3 py-2"
                  style={{
                    backgroundColor: tileBackgroundColor,
                    perspective: "700px",
                  }}
                >
                  {showRings ? (
                    <svg
                      className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2"
                      width="80"
                      height="80"
                      viewBox="0 0 80 80"
                    >
                      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.1" />
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
                          214 *
                            (part.label === "S"
                              ? seconds / 60
                              : part.label === "M"
                                ? minutes / 60
                                : part.label === "H"
                                  ? hours / 24
                                  : days / 365)
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
                      ...tileStyle,
                      ...countdownAnimationExtraStyle,
                      display: "inline-block",
                      fontSize: Math.max(36, Number(tileStyle.fontSize) || 36),
                      transition: countdownAnimationTransition,
                      transform: countdownAnimationTransform(
                        seconds < 10
                          ? isTicking
                            ? "scale(1.15)"
                            : "scale(1.05)"
                          : isTicking
                            ? "scale(1.08)"
                            : "scale(1)",
                      ),
                    }}
                  >
                    {part.value}
                  </div>

                  <div className={["mt-1 text-xs", getMutedTextClass(designKey)].join(" ")}>
                    {part.label}
                  </div>
                </div>

                {index < parts.length - 1 ? (
                  <span className={["text-3xl font-bold", getMutedTextClass(designKey)].join(" ")}>:</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Surface block={block} designKey={designKey} className={getSoftSurfaceClass(designKey)}>
        {block.data.heading ? (
          <div
            className={["uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
            style={style}
          >
            {block.data.heading}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {parts.map((part, index) => (
            <div key={part.label} className="flex items-center gap-2">
              <div
                className="flex items-baseline gap-1 rounded-lg px-2 py-1"
                style={{
                  backgroundColor: tileBackgroundColor,
                  perspective: "700px",
                }}
              >
                <span
                  className="font-semibold transition-transform duration-200"
                  style={{
                    ...tileStyle,
                    ...countdownAnimationExtraStyle,
                    display: "inline-block",
                    transition: countdownAnimationTransition,
                    transform: countdownAnimationTransform(isTicking ? "scale(1.05)" : "scale(1)"),
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
  previewMode = false,
) {
  const typedBlock = block as typeof block & {
    data: typeof block.data & {
      layout?: "vertical" | "horizontal" | "grid";
      backgroundColor?: string;
      transparentBackground?: boolean;
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
    <div
      className="h-full w-full space-y-3 p-2"
      style={{
        ...containerAppearance,
        backgroundColor: typedBlock.data.transparentBackground
          ? "transparent"
          : (typedBlock.data.backgroundColor ?? containerAppearance.backgroundColor),
      }}
    >
      {block.data.heading ? (
        <div style={getContainerTextStyle(block.data.style, designKey)}>
          {block.data.heading}
        </div>
      ) : null}

      <div className={listClass}>
        {block.data.items.map((item: LinkItem) => {
          const rawUrl =
            typeof item.url === "string" ? item.url.trim() : "";

const normalizedHref =
  rawUrl.startsWith("#") ||
  rawUrl.startsWith("/") ||
  rawUrl.startsWith("http://") ||
  rawUrl.startsWith("https://") ||
  rawUrl.startsWith("mailto:") ||
  rawUrl.startsWith("tel:")
    ? rawUrl
    : rawUrl
      ? `https://${rawUrl}`
      : "";

          const content = item.label || "Link";

const itemIsTransparent = typedBlock.data.transparentBackground === true;

const className =
  layout === "horizontal"
    ? [
        "inline-flex items-center justify-center rounded-full px-3 py-2",
        itemIsTransparent
          ? "border border-transparent bg-transparent"
          : isLightDesign(designKey)
            ? "border border-neutral-200 bg-white"
            : "border border-white/10 bg-white/5",
      ].join(" ")
    : layout === "grid"
      ? itemIsTransparent
        ? "block rounded-xl border border-transparent bg-transparent px-3 py-2"
        : getLinkItemClass(designKey)
      : designKey === "showcase"
        ? "block"
        : itemIsTransparent
          ? "block rounded-xl border border-transparent bg-transparent px-3 py-2"
          : getLinkItemClass(designKey);

          const style = getContainerTextStyle(block.data.style, designKey);

          if (!normalizedHref) {
            return (
              <div
                key={item.id}
                className={`${className} opacity-60 cursor-default`}
                style={style}
              >
                {content}
              </div>
            );
          }

const Tag = previewMode ? "span" : "a";

return (
  <Tag
    key={item.id}
    {...(!previewMode
      ? {
          href: normalizedHref,
          target:
            normalizedHref.startsWith("http://") ||
            normalizedHref.startsWith("https://")
              ? "_blank"
              : undefined,
          rel:
            normalizedHref.startsWith("http://") ||
            normalizedHref.startsWith("https://")
              ? "noreferrer noopener"
              : undefined,
        }
      : {})}
    className={className}
    style={style}
  >
    {content}
  </Tag>
);
        })}
      </div>
    </div>
  );
}

function renderGalleryTile(image: any, index: number, showCaption = false) {
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
  const caption = String(image.caption ?? "").trim();
  const captionStyle = ((image.captionStyle ?? {}) as TextStyle);

  return (
    <div
      key={image.id || image.url || `gallery-${index}`}
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ borderRadius }}
    >
      <div className="min-h-0 flex-1 overflow-hidden" style={{ borderRadius }}>
        <img
          src={image.url}
          alt={image.alt || ""}
          className="h-full w-full object-cover"
          style={{ borderRadius }}
        />
      </div>

      {showCaption && caption ? (
<div
  className="shrink-0 px-2 py-1 text-xs text-neutral-700"
  style={getContainerTextStyle(captionStyle)}
>
  {caption}
</div>
      ) : null}
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
          renderGalleryTile(
            images[index],
            index,
            Boolean((block.data as any).addCaption),
          ),
        )}
      </div>
    </div>
  );
}

function renderPoll(
  block: Extract<MicrositeBlock, { type: "poll" }>,
  designKey?: string,
  micrositeSlug?: string | null,
) {
  function PollPreview() {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string>("");

    async function handleVote(optionId: string) {
      if (isSubmitting || !micrositeSlug) return;

      try {
        setIsSubmitting(true);
        setSubmitError("");

        const res = await fetch("/api/public/poll/vote", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            micrositeSlug,
            pollId: block.id,
            optionIds: [optionId],
            company: "",
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          if (data?.error === "Already voted") {
            setSubmitError("Already voted");
            return;
          }
          throw new Error(data?.error || "Vote failed");
        }

        setSelectedOptionId(optionId);

        window.dispatchEvent(
          new CustomEvent("ko-host-poll-vote", {
            detail: {
              pollBlockId: block.id,
              optionId,
            },
          }),
        );
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Vote failed",
        );
      } finally {
        setIsSubmitting(false);
      }
    }

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
          {block.data.options.map((option: PollOption) => {
            const isSelected = selectedOptionId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => void handleVote(option.id)}
                disabled={isSubmitting || !micrositeSlug}
                className={[
                  "w-full rounded-lg border px-3 py-2 text-left transition",
                  isLightDesign(designKey)
                    ? "border-neutral-200"
                    : "border-white/10",
                  selectedOptionId
                    ? isSelected
                      ? "bg-blue-500/10"
                      : "opacity-70"
                    : "hover:bg-black/5",
                ].join(" ")}
                style={getContainerTextStyle(block.data.style, designKey)}
              >
                {option.text || "Option"}
              </button>
            );
          })}
        </div>

        {submitError ? (
          <div className="mt-2 text-xs text-red-500">{submitError}</div>
        ) : null}
      </Surface>
    );
  }

  return <PollPreview />;
}

function renderRsvp(
  block: Extract<MicrositeBlock, { type: "rsvp" }>,
  designKey?: string,
) {
  return <RsvpFormBlock block={block} designKey={designKey} />;
}

function RsvpFormBlock({
  block,
  designKey,
}: {
  block: Extract<MicrositeBlock, { type: "rsvp" }>;
  designKey?: string;
}) {
  const styles = block.data.elementStyles ?? {};
  const hidden = new Set(block.data.hiddenElements ?? []);
  const defaultRsvpOrder = [
  "image",
  "heading",
  "nameLabel",
  "firstName",
  "lastName",
  "email",
  "address",
  "attending",
  "meal",
  "guestToggle",
  "guestCount",
  "guestName",
  "comments",
] as const;

const order = block.data.elementOrder?.length
  ? block.data.elementOrder.includes("comments")
    ? block.data.elementOrder
    : [...block.data.elementOrder, "comments"]
  : [...defaultRsvpOrder];
  const imageShape = block.data.imageFrameShape ?? "circle";
  const guestMin = Math.max(0, block.data.guestMin ?? 0);
  const guestMax = Math.max(guestMin, block.data.guestMax ?? 1);
const attendingLabel = block.data.attendingLabel || "Are you attending?";
const attendingOptions = block.data.attendingOptions ?? ["Yes", "No"];
const attendingDisplay = block.data.attendingDisplay !== false;
const attendingDefaultValue =
  block.data.attendingDefaultValue || attendingOptions[0] || "Yes";
const showAttendingInForm = attendingDisplay && !hidden.has("attending");

const mealLabel = block.data.mealLabel || "Your meal selection:";
const mealOptions = block.data.mealOptions ?? ["Chicken", "Salmon"];
const mealDisplay = block.data.mealDisplay !== false;
const mealDefaultValue = block.data.mealDefaultValue || mealOptions[0] || "Chicken";
const showMealInForm = mealDisplay && !hidden.has("meal");

const guestLabel = block.data.guestLabel || "Are you bringing a guest?";
const guestOptions = block.data.guestOptions ?? ["Yes", "No"];
const guestDisplay = block.data.guestDisplay !== false;
const guestDefaultValue = block.data.guestDefaultValue || guestOptions[1] || "No";
const showGuestInForm =
  guestDisplay &&
  !hidden.has("guestToggle") &&
  !hidden.has("guestCount") &&
  !hidden.has("guestName");

const commentsLabel = block.data.commentsLabel || "Additional comments";
const commentsPlaceholder =
  block.data.commentsPlaceholder || "Additional comments";
const commentsDisplay = block.data.commentsDisplay !== false;
const commentsDefaultValue = block.data.commentsDefaultValue || "";
const showCommentsInForm = commentsDisplay && !hidden.has("comments");

const submitButtonText = block.data.submitButtonText || "Submit RSVP";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

const [isAttending, setIsAttending] = useState(
  attendingDisplay ? true : attendingDefaultValue === attendingOptions[0],
);
const [mealChoice, setMealChoice] = useState(
  mealDisplay ? mealOptions[0] ?? "Chicken" : mealDefaultValue,
);
const [bringingGuest, setBringingGuest] = useState(
  guestDisplay ? false : guestDefaultValue === guestOptions[0],
);
const [guestCount, setGuestCount] = useState(
  guestDisplay ? Math.max(guestMin, 1) : 0,
);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  function getStyle(key: string) {
    const entry = styles[key as keyof typeof styles];
    return {
      ...(entry?.textStyle
        ? getContainerTextStyle(entry.textStyle, designKey)
        : {}),
      ...(entry?.backgroundColor
        ? { backgroundColor: entry.backgroundColor }
        : {}),
    };
  }

  function getFrameClass(shape: string) {
    if (shape === "square") return "rounded-2xl";
    if (shape === "circle") return "rounded-full";
    if (shape === "diamond") return "rotate-45 rounded-2xl";
    return "";
  }

function getMicrositeSlugFromLocation() {
  if (typeof window === "undefined") return "";

  const host = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname;
  const search = new URLSearchParams(window.location.search);

  const qsSlug = search.get("slug");
  if (qsSlug?.trim()) return qsSlug.trim().toLowerCase();

  if (host.endsWith(".ko-host.com")) {
    const sub = host.replace(".ko-host.com", "").split(".")[0] || "";
    if (sub && sub !== "www") return sub;
  }

  const sRouteMatch = pathname.match(/^\/s\/([^/]+)/i);
  if (sRouteMatch?.[1]) {
    return decodeURIComponent(sRouteMatch[1]).toLowerCase();
  }

  const metaSlug =
    document.querySelector('meta[name="ko-host-slug"]')?.getAttribute("content") ?? "";
  if (metaSlug.trim()) return metaSlug.trim().toLowerCase();

  return "";
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setSubmitState("error");
      setSubmitMessage("First name and last name are required.");
      return;
    }

if (bringingGuest && guestCount > 0) {
  const missingGuestName = Array.from({ length: guestCount }).some(
    (_, index) => !(guestNames[index] ?? "").trim(),
  );

  if (missingGuestName) {
    setSubmitState("error");
    setSubmitMessage("Guest name is required for each guest.");
    return;
  }
}

    const micrositeSlug = getMicrositeSlugFromLocation();

if (!micrositeSlug) {
  setSubmitState("error");
  setSubmitMessage(
    "Unable to determine microsite slug. RSVP submission works on public microsite pages, not builder/preview routes.",
  );
  return;
}

    setSubmitting(true);
    setSubmitState("idle");
    setSubmitMessage("");

    try {
      const res = await fetch("/api/public/rsvp/route".replace("/route", ""), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          micrositeSlug,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          address: address.trim(),
isAttending: showAttendingInForm
  ? isAttending
  : attendingDefaultValue === attendingOptions[0],

mealChoice:
  (showAttendingInForm ? isAttending : attendingDefaultValue === attendingOptions[0])
    ? showMealInForm
  ? mealChoice
  : mealDefaultValue
    : "",

bringingGuest: showGuestInForm
  ? bringingGuest
  : guestDefaultValue === guestOptions[0],

guestCount:
  (attendingDisplay ? isAttending : attendingDefaultValue === attendingOptions[0]) &&
  (showGuestInForm ? bringingGuest : guestDefaultValue === guestOptions[0])
    ? guestCount
    : 0,
          guestName: bringingGuest
            ? guestNames
                .slice(0, guestCount)
                .map((name) => name.trim())
                .filter(Boolean)
                .join(", ")
            : "",
          comments: showCommentsInForm ? comments.trim() : commentsDefaultValue.trim(),
          company: company.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setSubmitState("error");
        setSubmitMessage(data?.error || "Failed to submit RSVP.");
        return;
      }

    setSubmitState("success");
    setSubmitMessage("RSVP submitted.");
    setFirstName("");
    setLastName("");
    setEmail("");
    setAddress("");
    setIsAttending(true);
    setMealChoice(mealOptions[0] ?? "Chicken");
    setBringingGuest(false);
    setGuestCount(Math.max(guestMin, 1));
    setGuestNames([]);
    setComments(""); // ✅ ADD THIS LINE
    setCompany("");
    } catch {
      setSubmitState("error");
      setSubmitMessage("Failed to submit RSVP.");
    } finally {
      setSubmitting(false);
    }
  }

function renderImage() {
  if (!block.data.imageUrl) return null;

  const imageStyle = getStyle("image");

  if (imageShape === "heart") {
    const heartClipId = `rsvp-heart-clip-${block.id}`;

    return (
      <div key="image" className="relative z-0 flex justify-center overflow-hidden">
        <div className="h-28 w-28" style={imageStyle}>
          <svg
            viewBox="0 0 100 100"
            className="block h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id={heartClipId} clipPathUnits="objectBoundingBox">
                <path d="M 0.5 0.95 C 0.2 0.72, 0.02 0.5, 0.02 0.28 C 0.02 0.1, 0.16 0.0, 0.3 0.0 C 0.42 0.0, 0.5 0.1, 0.5 0.18 C 0.5 0.1, 0.58 0.0, 0.7 0.0 C 0.84 0.0, 0.98 0.1, 0.98 0.28 C 0.98 0.5, 0.8 0.72, 0.5 0.95 Z" />
              </clipPath>
            </defs>

            <image
              href={block.data.imageUrl}
              x="0"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${heartClipId})`}
            />

            <path
              d="M 50 95 C 20 72, 2 50, 2 28 C 2 10, 16 0, 30 0 C 42 0, 50 10, 50 18 C 50 10, 58 0, 70 0 C 84 0, 98 10, 98 28 C 98 50, 80 72, 50 95 Z"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (imageShape === "diamond") {
    return (
      <div key="image" className="relative z-0 flex justify-center overflow-hidden py-2">
        <div
          className={`relative h-28 w-28 overflow-hidden border border-neutral-200 bg-neutral-100 ${getFrameClass(
            imageShape,
          )}`}
          style={imageStyle}
        >
          <img
            src={block.data.imageUrl}
            alt=""
            className="block h-full w-full -rotate-45 scale-150 object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div key="image" className="relative z-0 flex justify-center overflow-hidden">
      <img
        src={block.data.imageUrl}
        alt=""
        className={`block h-28 w-28 object-cover border border-neutral-200 ${getFrameClass(
          imageShape,
        )}`}
        style={imageStyle}
      />
    </div>
  );
}

function renderField(
  key: string,
  placeholder: string,
  value: string,
  onChange: (v: string) => void,
  type: string = "text",
) {
  const fieldStyle = getStyle(key);

  return (
    <input
      key={key}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="relative z-10 block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-800 outline-none"
      style={{
        ...fieldStyle,
        textAlign: "left",
      }}
    />
  );
}

function renderTextarea(
  key: string,
  placeholder: string,
  value: string,
  onChange: (value: string) => void,
) {
  const fieldStyle = getStyle(key);

  return (
    <textarea
      key={key}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="relative z-10 block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-800 outline-none"
      style={{
        ...fieldStyle,
        textAlign: "left",
      }}
      rows={4}
    />
  );
}

function renderFieldLabel(
  key: string,
  text: string,
) {
  return (
    <div
      key={key}
      className="text-sm font-medium text-neutral-800"
      style={getStyle(key)}
    >
      {text}
    </div>
  );
}

function renderRadioSection(
  key: string,
  label: string,
  options: string[],
  value: string,
  onChange: (value: string) => void,
) {
  const sectionStyle = getStyle(key);

  return (
    <div key={key} className="space-y-2">
      <div
        className="font-medium"
        style={sectionStyle}
      >
        {label}
      </div>

      <div className="relative z-10 flex flex-wrap gap-4">
        {options.map((option) => (
          <label
            key={`${key}-${option}`}
            className="inline-flex items-center gap-2"
            style={sectionStyle}
          >
            <input
              type="radio"
              name={`${block.id}-${key}`}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

  function renderGuestCount() {
    return (
      <div key="guestCount" className="space-y-2" style={getStyle("guestCount")}>
        <div className="text-sm font-medium text-neutral-800">Guest count</div>
        <div className="inline-flex items-center gap-3 rounded-xl border border-neutral-300 bg-white px-3 py-2">
          <button
            type="button"
              onClick={() =>
                setGuestCount((current) => {
                  const next = Math.max(0, current - 1);

                  setGuestNames((prev) => prev.slice(0, next));

                  if (next === 0) {
                    setBringingGuest(false);
                  }

                  return next;
                })
              }
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-base text-neutral-700"
          >
            -
          </button>
          <div className="min-w-[68px] text-center text-sm text-neutral-800">
            {guestCount}
          </div>
          <button
            type="button"
            onClick={() =>
              setGuestCount((current) => {
                const next = Math.min(guestMax, current + 1);
                setGuestNames((prev) => {
                  const copy = [...prev];
                  while (copy.length < next) copy.push("");
                  return copy.slice(0, next);
                });
                return next;
              })
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-base text-neutral-700"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  function renderElement(key: string) {
    switch (key) {
      case "image":
        return renderImage();

      case "heading":
        return (
          <div
            key="heading"
            className="text-center text-2xl font-semibold text-neutral-900"
            style={getStyle("heading")}
          >
            {block.data.heading || "Wedding Invitation RSVP Form"}
          </div>
        );

      case "nameLabel":
        renderFieldLabel("nameLabel", "Name")

      case "firstName":
        return renderField("firstName", "First Name", firstName, setFirstName);

      case "lastName":
        return renderField("lastName", "Last Name", lastName, setLastName);

      case "email":
        return renderField("email", "Email", email, setEmail, "email");

      case "address":
        return renderField("address", "Address", address, setAddress);

case "attending":
  if (!showAttendingInForm) return null;

  return renderRadioSection(
    "attending",
    attendingLabel,
    attendingOptions,
    isAttending ? attendingOptions[0] : attendingOptions[1] ?? "No",
    (next) => setIsAttending(next === attendingOptions[0]),
  );

case "meal":
  if (!showMealInForm) return null;
  if (!(attendingDisplay ? isAttending : attendingDefaultValue === attendingOptions[0])) {
    return null;
  }

  return renderRadioSection(
    "meal",
    mealLabel,
    mealOptions,
    mealChoice,
    setMealChoice,
  );
        if (!isAttending) return null;
          return renderRadioSection(
            "meal",
            mealLabel,
            mealOptions,
            mealChoice,
            setMealChoice,
          );

case "guestToggle":
  if (!showGuestInForm) return null;
  if (!(attendingDisplay ? isAttending : attendingDefaultValue === attendingOptions[0])) {
    return null;
  }

  return renderRadioSection(
    "guestToggle",
    guestLabel,
    guestOptions,
    bringingGuest ? guestOptions[0] : guestOptions[1] ?? "No",
    (next) => {
      const yes = next === guestOptions[0];
      setBringingGuest(yes);
      const nextCount = yes ? Math.max(1, guestMin) : 0;
      setGuestCount(nextCount);
      setGuestNames(yes ? Array.from({ length: nextCount }, () => "") : []);
    },
  );
        if (!isAttending) return null;
          return renderRadioSection(
            "guestToggle",
            guestLabel,
            guestOptions,
            bringingGuest ? guestOptions[0] : guestOptions[1] ?? "No",
            (next) => {
              const yes = next === guestOptions[0];
              setBringingGuest(yes);
              const nextCount = yes ? Math.max(1, guestMin) : 0;
              setGuestCount(nextCount);
              setGuestNames(yes ? Array.from({ length: nextCount }, () => "") : []);
                          },
          );

case "guestCount":
  if (!showGuestInForm) return null;
  if (!(attendingDisplay ? isAttending : attendingDefaultValue === attendingOptions[0])) {
    return null;
  }
  if (!bringingGuest) return null;

  return renderGuestCount();

case "guestName":
  if (!showGuestInForm) return null;
  if (!(attendingDisplay ? isAttending : attendingDefaultValue === attendingOptions[0])) {
    return null;
  }
  if (!bringingGuest || guestCount <= 0) return null;

  return (
    <div key="guestName" className="space-y-3">
      {Array.from({ length: guestCount }).map((_, index) => (
        <input
          key={`guest-name-${index}`}
          type="text"
          placeholder={`Guest Name ${index + 1}`}
          value={guestNames[index] ?? ""}
          onChange={(e) => {
            const next = [...guestNames];
            next[index] = e.target.value;
            setGuestNames(next);
          }}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-800 outline-none"
          style={getStyle("guestName")}
        />
      ))}
    </div>
  );
  if (!isAttending || !bringingGuest || guestCount <= 0) return null;

  return (
    <div key="guestName" className="space-y-3">
      {Array.from({ length: guestCount }).map((_, index) => (
        <input
          key={`guest-name-${index}`}
          type="text"
          placeholder={`Guest Name ${index + 1}`}
          value={guestNames[index] ?? ""}
          onChange={(e) => {
            const next = [...guestNames];
            next[index] = e.target.value;
            setGuestNames(next);
          }}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-800 outline-none"
          style={getStyle("guestName")}
        />
      ))}
    </div>
  );

case "comments":
  if (!showCommentsInForm) return null;

  return (
    <div key="comments" className="space-y-2">
      <div
        className="text-sm font-medium text-neutral-800"
        style={getStyle("comments")}
      >
        {commentsLabel}
      </div>
      {renderTextarea(
        "comments",
        commentsPlaceholder,
        comments,
        setComments,
      )}
    </div>
  );
        return (
          <div key="comments" className="space-y-2">
            <div
              className="text-sm font-medium text-neutral-800"
              style={getStyle("comments")}
            >
              {commentsLabel}
            </div>
            {renderTextarea(
              "comments",
              commentsPlaceholder,
              comments,
              setComments,
            )}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >

      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />

        {order.map((key, index) => {
          if (hidden.has(key as any)) return null;

          if (key === "firstName") {
            const showFirst = !hidden.has("firstName");
            const showLast = !hidden.has("lastName");

            if (!showFirst && !showLast) return null;

            return (
              <div
                key={`name-row-${index}`}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {showFirst ? renderElement("firstName") : <div />}
                {showLast ? renderElement("lastName") : <div />}
              </div>
            );
          }

          if (key === "lastName") {
            return null;
          }

          return renderElement(key);
        })}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : submitButtonText}
        </button>

        {submitState === "success" ? (
          <div className="text-sm text-green-700">{
            submitMessage || "RSVP submitted."
          }</div>
        ) : null}

        {submitState === "error" ? (
          <div className="text-sm text-red-700">{
            submitMessage || "Failed to submit RSVP."
          }</div>
        ) : null}
      </form>
    </Surface>
  );
} 

function renderFaq(
  block: Extract<MicrositeBlock, { type: "faq" }>,
  designKey?: string,
) {
  function FaqLive() {
    const behavior =
      ((block.data as any).behavior as
        | "always-open"
        | "accordion"
        | "accordion-single"
        | undefined) ?? "always-open";

    const showIcons = (block.data as any).showIcons !== false;
    const [openIds, setOpenIds] = useState<string[]>(
      behavior === "always-open"
        ? block.data.items.map((item: FaqItem) => item.id)
        : [],
    );

    const formStyle = getContainerTextStyle(block.data.style, designKey);

    const sectionStyle =
      ((block.data as any).sectionStyle ?? {}) as React.CSSProperties;

    const questionStyle = getContainerTextStyle(
      (block.data as any).questionStyle ?? block.data.style,
      designKey,
    );

    const answerStyle = getContainerTextStyle(
      (block.data as any).answerStyle ?? block.data.style,
      designKey,
    );

    const sectionBackgroundColor =
      sectionStyle.backgroundColor && sectionStyle.backgroundColor !== "transparent"
        ? sectionStyle.backgroundColor
        : sectionStyle.backgroundColor === "transparent"
          ? "transparent"
          : isLightDesign(designKey)
            ? "#ffffff"
            : "rgba(255,255,255,0.05)";

    function toggleItem(itemId: string) {
      if (behavior === "always-open") return;

      setOpenIds((prev) => {
        const isOpen = prev.includes(itemId);

        if (behavior === "accordion-single") {
          return isOpen ? [] : [itemId];
        }

        return isOpen
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];
      });
    }

    return (
      <Surface
        block={{
          ...block,
          appearance: {
            ...block.appearance,
            backgroundColor:
              block.appearance?.backgroundColor === "transparent"
                ? "transparent"
                : block.appearance?.backgroundColor,
            borderColor: block.appearance?.borderColor,
            borderWidth: block.appearance?.borderWidth,
            borderRadius: block.appearance?.borderRadius,
          },
        }}
        designKey={designKey}
        className={
          block.appearance?.backgroundColor === "transparent"
            ? ""
            : getSoftSurfaceClass(designKey)
        }
      >
{((block.data as any).heading ?? "FAQs") ? (
  <div
    style={formStyle}
    className="mb-2 font-semibold"
  >
    {(block.data as any).heading ?? "FAQs"}
  </div>
) : null}

        <div className="mt-3 space-y-2">
          {block.data.items.map((item: FaqItem) => {
            const isOpen =
              behavior === "always-open" || openIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: sectionBackgroundColor,
                  borderColor:
                    (sectionStyle as any).borderColor ||
                    (isLightDesign(designKey)
                      ? "#e5e7eb"
                      : "rgba(255,255,255,0.10)"),
                  borderWidth:
                    typeof (sectionStyle as any).borderWidth === "number"
                      ? `${(sectionStyle as any).borderWidth}px`
                      : ((sectionStyle as any).borderWidth ?? "1px"),
                  borderStyle: "solid",
                  borderRadius:
                    typeof (sectionStyle as any).borderRadius === "number"
                      ? `${(sectionStyle as any).borderRadius}px`
                      : ((sectionStyle as any).borderRadius ?? "0.5rem"),
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  style={questionStyle}
                >
                  <span>{item.question}</span>

                  {showIcons && behavior !== "always-open" ? (
                    <span
                      className="shrink-0 transition-transform duration-200"
                      style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    >
                      ›
                    </span>
                  ) : null}
                </button>

                {isOpen ? (
                  <div className="mt-2" style={answerStyle}>
                    {item.answer}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Surface>
    );
  }

  return <FaqLive />;
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
  const showCaptions = Boolean((block.data as any).addCaption);
  const captionStyle = ((block.data as any).captionStyle ?? {}) as TextStyle;

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

                {showCaptions && String((item as any).caption ?? "").trim() ? (
<div
  className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-1 text-xs text-white"
  style={getContainerTextStyle(captionStyle, designKey)}
>
  {String((item as any).caption ?? "").trim()}
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
  const linkedButtonId = (block.data as any).linkedButtonId ?? "";

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
            data-linked-button={(block.data as any).linkedButtonId || ""}
            data-linked-button-id={linkedButtonId}
            data-field-label={block.data.label || "Field"}
            data-required={block.data.required ? "true" : "false"}
            style={getContainerTextStyle(block.data.style, designKey)}
          />
        ) : (
          <input
            type={block.data.fieldType === "phone" ? "tel" : block.data.fieldType}
            className={inputClass}
            placeholder={showPlaceholder ? block.data.placeholder : ""}
            defaultValue={block.data.value || ""}
            data-form-field-id={block.id}
            data-linked-button={(block.data as any).linkedButtonId || ""}
            data-field-label={block.data.label || "Field"}
            data-required={block.data.required ? "true" : "false"}
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

  const fx = (block.data.fx || {}) as any;
  const mode = fx.mode ?? "straight";
  const intensity = fx.intensity ?? 50;
  const rotation = fx.rotation ?? 0;
  const opacity = fx.opacity ?? 1;
  const letterScaleX = Math.max(0.5, Math.min(2, Number(fx.letterScaleX ?? 1)));

  const shadowEnabled = fx.shadowEnabled === true;
  const shadowColor = fx.shadowColor ?? "#000000";
  const shadowOffsetX = fx.shadowOffsetX ?? 2;
  const shadowOffsetY = fx.shadowOffsetY ?? 2;
  const shadowBlur = fx.shadowBlur ?? 4;

  const outlineEnabled = fx.outlineEnabled === true;
  const outlineColor = fx.outlineColor ?? "#000000";
  const outlineWidth = fx.outlineWidth ?? 2;

  const textShadow = shadowEnabled
    ? `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`
    : undefined;

if (mode === "straight") {
  const textAlign = (block.data.style?.align ?? "center") as "left" | "center" | "right";

  const justifyContent =
    textAlign === "left"
      ? "flex-start"
      : textAlign === "right"
        ? "flex-end"
        : "center";

  return (
    <div
      className="flex h-full w-full p-2"
      style={{
        ...getAppearanceStyle(block),
        justifyContent,
        alignItems: "center",
        textAlign,
      }}
    >
      <div
        style={{
          ...style,
          display: "inline-block",
          transform: `rotate(${rotation}deg) scaleX(${letterScaleX})`,
          transformOrigin: "center center",
          opacity,
          textShadow,
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

  const estimatedTextLength = Math.max(
    fontSize * text.length * 0.62 * letterScaleX,
    fontSize,
  );

  const stableTextFxKey = [
    block.type,
    block.data.text || "",
    mode,
    intensity,
    rotation,
    opacity,
    letterScaleX,
    block.data.style?.fontFamily || "",
    block.data.style?.fontSize || "",
    block.data.style?.color || "",
    outlineEnabled ? outlineColor : "",
    outlineEnabled ? outlineWidth : "",
    shadowEnabled ? shadowColor : "",
    shadowEnabled ? shadowOffsetX : "",
    shadowEnabled ? shadowOffsetY : "",
    shadowEnabled ? shadowBlur : "",
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
          stroke={outlineEnabled ? outlineColor : undefined}
          strokeWidth={outlineEnabled ? outlineWidth : undefined}
          paintOrder={outlineEnabled ? "stroke fill" : undefined}
          filter={
            shadowEnabled
              ? `drop-shadow(${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor})`
              : undefined
          }
          textLength={estimatedTextLength}
          lengthAdjust="spacingAndGlyphs"
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
  micrositeSlug?: string | null,
) {
  function HighlightPreview() {
    const [items, setItems] = useState<any[]>([]);
    const [countValue, setCountValue] = useState<number>(0);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(
      Boolean(micrositeId || micrositeSlug),
    );
    const [refreshKey, setRefreshKey] = useState(0);

    const mode = block.data?.mode || "top_messages";
    const limit = Math.max(1, Math.min(12, Number(block.data?.limit) || 4));
    const rawSourceBlockId = block.data?.sourceBlockId?.trim() || "";
    const resolvedSourceBlockId = rawSourceBlockId;

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
          : mode === "total_funds"
            ? "Total Funds"
            : "Poll Results");

    const headingTextStyle =
      getContainerTextStyle(
        block.data.headingStyle ?? block.data.style,
        designKey,
      );

    const bodyTextStyle =
      getContainerTextStyle(
        block.data.bodyStyle ?? block.data.style,
        designKey,
      );

    useEffect(() => {
      let cancelled = false;

      async function load() {
        if (!micrositeId && !micrositeSlug) {
          setItems([]);
          setCountValue(0);
          setTotalValue(0);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);

          if (mode === "poll_results") {
            if (!resolvedSourceBlockId || !micrositeSlug) {
              if (!cancelled) {
                setItems([]);
                setCountValue(0);
                setTotalValue(0);
              }
              return;
            }

            const params = new URLSearchParams({
              micrositeSlug,
              pollId: resolvedSourceBlockId,
            });

            const res = await fetch(
              `/api/public/poll/results?${params.toString()}`,
              { cache: "no-store" },
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data?.error || "Failed to load poll results");

            if (!cancelled) {
              setItems(data?.results || []);
              setCountValue(typeof data?.total === "number" ? data.total : 0);
              setTotalValue(0);
            }

            return;
          }

          if (mode === "top_messages") {
            if (!resolvedSourceBlockId || !micrositeId) {
              if (!cancelled) {
                setItems([]);
                setCountValue(0);
                setTotalValue(0);
              }
              return;
            }

            const params = new URLSearchParams({
              micrositeId: micrositeId ?? "",
              threadBlockId: resolvedSourceBlockId,
              limit: "100",
              sort: "votes_desc",
            });

            const res = await fetch(
              `/api/thread/messages?${params.toString()}`,
              { cache: "no-store" },
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
          if (!resolvedSourceBlockId) return;
          if (detail.threadBlockId !== resolvedSourceBlockId) return;
        }

        setRefreshKey((prev) => prev + 1);
      }

      function handlePollVote(event: Event) {
        const customEvent = event as CustomEvent<{
          pollBlockId?: string;
          optionId?: string;
        }>;

        if (mode !== "poll_results") return;
        if (!resolvedSourceBlockId) return;
        if (customEvent.detail?.pollBlockId !== resolvedSourceBlockId) return;

        setRefreshKey((prev) => prev + 1);
      }

      window.addEventListener(
        THREAD_ACTIVITY_EVENT,
        handleThreadUpdated as EventListener,
      );
      window.addEventListener(
        "ko-host-poll-vote",
        handlePollVote as EventListener,
      );

      void load();

      return () => {
        cancelled = true;
        window.removeEventListener(
          THREAD_ACTIVITY_EVENT,
          handleThreadUpdated as EventListener,
        );
        window.removeEventListener(
          "ko-host-poll-vote",
          handlePollVote as EventListener,
        );
      };
    }, [
      micrositeId,
      micrositeSlug,
      mode,
      block.id,
      resolvedSourceBlockId,
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
            style={headingTextStyle}
          >
            {heading}
          </div>

          {isLoading ? (
            <div className="text-xs text-neutral-400">Loading...</div>
          ) : null}

          {!isLoading && mode === "top_messages" && !resolvedSourceBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              Select a source thread block.
            </div>
          ) : null}

          {!isLoading && mode === "poll_results" && !resolvedSourceBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              Select a source poll block.
            </div>
          ) : null}

          {!isLoading && mode === "rsvp_count" && !sourceFormBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
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

          {!isLoading && mode === "top_messages" && resolvedSourceBlockId && !items.length ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              No data yet.
            </div>
          ) : null}

          {!isLoading && mode === "poll_results" && resolvedSourceBlockId && !items.length ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              No votes yet.
            </div>
          ) : null}

          {!isLoading && mode === "rsvp_count" && !!sourceFormBlockId ? (
            <div className={getHighlightCardClass(designKey)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60"
                    style={bodyTextStyle}
                  >
                    Responses
                  </div>
                  <div
                    className="mt-2 text-4xl font-bold leading-none"
                    style={bodyTextStyle}
                  >
                    {countValue}
                  </div>
                </div>

                <div className="text-2xl">✉️</div>
              </div>

              <div
                className="mt-3 text-xs opacity-60"
                style={bodyTextStyle}
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
                    style={bodyTextStyle}
                  >
                    Total Raised
                  </div>
                  <div
                    className="mt-2 text-4xl font-bold leading-none"
                    style={bodyTextStyle}
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
                style={bodyTextStyle}
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
                            color: bodyTextStyle.color ?? getDefaultTextColor(designKey),
                          }}
                        >
                          #{index + 1}
                        </div>

                        <div
                          className="truncate text-xs font-semibold"
                          style={bodyTextStyle}
                        >
                          {msg.author_name || msg.name || "Guest"}
                        </div>
                      </div>

                      <div
                        className="mt-2 text-sm leading-5"
                        style={bodyTextStyle}
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
                        color: bodyTextStyle.color ?? getDefaultTextColor(designKey),
                      }}
                    >
                      👍 {msg.votes ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {mode === "poll_results" ? (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${highlightColumns}, minmax(0, 1fr))`,
              }}
            >
              {items.slice(0, limit).map((item: any) => {
                const percent =
                  countValue > 0 ? Math.round((item.count / countValue) * 100) : 0;

                const cardBackground = isLightDesign(designKey)
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(255,255,255,0.08)";

                const badgeBackground = isLightDesign(designKey)
                  ? "rgba(17,24,39,0.08)"
                  : "rgba(255,255,255,0.14)";

                const trackBackground = isLightDesign(designKey)
                  ? "rgba(17,24,39,0.10)"
                  : "rgba(255,255,255,0.16)";

                const fillBackground =
                  bodyTextStyle.color ??
                  (isLightDesign(designKey)
                    ? "rgba(37,99,235,0.85)"
                    : "rgba(255,255,255,0.92)");

                return (
                  <div
                    key={item.optionId}
                    className="rounded-3xl p-4"
                    style={{
                      background: cardBackground,
                      border: isLightDesign(designKey)
                        ? "1px solid rgba(17,24,39,0.08)"
                        : "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate text-sm font-semibold"
                          style={bodyTextStyle}
                        >
                          {item.label || "Option"}
                        </div>

                        <div
                          className="mt-3 h-2 overflow-hidden rounded-full"
                          style={{
                            background: trackBackground,
                          }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percent}%`,
                              background: fillBackground,
                            }}
                          />
                        </div>

                        <div
                          className="mt-2 text-xs opacity-70"
                          style={bodyTextStyle}
                        >
                          {percent}% of votes
                        </div>
                      </div>

                      <div
                        className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
                        style={{
                          background: badgeBackground,
                          color: bodyTextStyle.color ?? getDefaultTextColor(designKey),
                        }}
                      >
                        {item.count ?? 0}
                      </div>
                    </div>
                  </div>
                );
              })}
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
    <div
  className={[
    "h-full w-full p-3",
    !String((block as any)?.data?.text || "").trim()
      ? "pointer-events-none"
      : "",
  ].join(" ")}
  style={getAppearanceStyle(block)}
>
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
        className=""
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

  const backgroundStyle = getContainerTextStyle(block.data.style, designKey);
  const barStyle = ((block.data as any).barStyle ?? {}) as TextStyle;
  const contextStyle = getContainerTextStyle(
    ((block.data as any).contextStyle ?? block.data.style ?? {}) as TextStyle,
    designKey,
  );

  const showContext = (block.data as any).showContext ?? true;
  const contextType = (block.data as any).contextType ?? "percentage";
  const contextLocation = (block.data as any).contextLocation ?? "bottom-left";

  const contextText =
    contextType === "fraction" ? `${value} / ${max}` : `${percent}%`;

  const contextNode = showContext ? (
    <div className="text-xs font-medium" style={contextStyle}>
      {contextText}
    </div>
  ) : null;

  return (
      <Surface
        block={block}
        designKey={designKey}
        className=""
      >
      <div className="flex items-start justify-between gap-3">
        <div
          className="text-base font-semibold"
          style={backgroundStyle}
        >
          {block.data.heading || "Progress"}
        </div>

        {contextLocation === "top-right" ? contextNode : null}
      </div>

      <div
        className={[
          "mt-4 h-4 w-full overflow-hidden rounded-full border",
          isLightDesign(designKey) ? "bg-neutral-200" : "bg-white/10",
        ].join(" ")}
        style={{
          backgroundColor:
            (barStyle as any).scopeBackgroundColor ??
            (barStyle as any).backgroundColor ??
            undefined,
          borderColor: (barStyle as any).borderColor ?? undefined,
        }}
      >
        <div
          className={isLightDesign(designKey) ? "h-full bg-neutral-900" : "h-full bg-white"}
          style={{
            width: `${percent}%`,
            backgroundColor: (barStyle as any).color ?? undefined,
          }}
        />
      </div>

      {contextLocation !== "top-right" && contextNode ? (
        <div
          className={[
            "mt-2 flex",
            contextLocation === "bottom-right"
              ? "justify-end"
              : "justify-start",
          ].join(" ")}
        >
          {contextNode}
        </div>
      ) : null}
    </Surface>
  );
}

function renderDonation(
  block: Extract<MicrositeBlock, { type: "donation" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  const donationOptions = Array.isArray(block.data.donationOptions)
    ? block.data.donationOptions.filter(
        (item) =>
          item &&
          typeof item.amount === "number" &&
          Number.isFinite(item.amount) &&
          item.amount > 0,
      )
    : [];

  const ctaClass = isLightDesign(designKey)
    ? "inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    : "inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60";

  const isConfigured = donationOptions.length > 0;

  async function handleDonationCheckout(amount: number, optionLabel?: string) {
    if (!micrositeId) {
      alert("Donation checkout only works on a live microsite right now.");
      return;
    }

    try {
      const res = await fetch("/api/checkout/create-donation-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          micrositeId,
          blockId: block.id,
          amount,
          label: optionLabel || `Donation $${formatCurrency(amount)}`,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error("Donation checkout failed:", json);
        alert(json.error || "Donation checkout failed");
        return;
      }

      if (json.url) {
        window.location.href = json.url;
        return;
      }

      alert("No checkout URL returned.");
    } catch (err) {
      console.error("Donation checkout error:", err);
      alert("Something went wrong");
    }
  }

return (
  <Surface
    block={block}
    designKey={designKey}
    className=""
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

    {isConfigured ? (
      <div className="mt-4 flex flex-wrap gap-2">
        {donationOptions.map((option, index) => {
          const amount = Number(option.amount || 0);
          const label =
            typeof option.label === "string" && option.label.trim().length > 0
              ? option.label.trim()
              : `$${formatCurrency(amount)}`;

const buttonStyle = (block.data as any).buttonStyle ?? {};

return (
  <button
    key={option.id || `donation-option-${index}`}
    type="button"
    onClick={() => void handleDonationCheckout(amount, label)}
    disabled={!micrositeId}
    className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2 disabled:cursor-not-allowed disabled:opacity-60"
    style={{
      backgroundColor:
        buttonStyle.backgroundColor ??
        (isLightDesign(designKey) ? "#171717" : "#ffffff"),
      color:
        buttonStyle.color ??
        (isLightDesign(designKey) ? "#ffffff" : "#171717"),
      fontFamily: buttonStyle.fontFamily ?? block.data.style?.fontFamily,
      fontSize:
        typeof buttonStyle.fontSize === "number"
          ? `${buttonStyle.fontSize}px`
          : undefined,
      fontWeight: buttonStyle.bold ? 700 : 600,
      fontStyle: buttonStyle.italic ? "italic" : undefined,
      textDecoration: [
        buttonStyle.underline ? "underline" : "",
        buttonStyle.strike ? "line-through" : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined,
    }}
    title={
      !micrositeId
        ? "Donation checkout only works on live microsites right now."
        : undefined
    }
  >
    {label}
  </button>
);
        })}
      </div>
    ) : (
      <div
        className={[
          "mt-4 rounded-xl border border-dashed px-4 py-6 text-sm",
          "border-neutral-300 text-neutral-500"
        ].join(" ")}
      >
        Add fixed donation options in the builder.
      </div>
    )}
  </Surface>
);
}

function renderLinkHub(
  block: Extract<MicrositeBlock, { type: "link_hub" }>,
  designKey?: string,
) {
  const items = Array.isArray(block.data.items) ? block.data.items : [];

  return (
    <Surface block={block} className="">
      <div
        className="mb-3 text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.heading || "My Links"}
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => {
            const linkItem = item as typeof item & {
  logoUrl?: string;
  autoGenerateLogo?: boolean;
};

const logoUrl = linkItem.logoUrl;

            return (
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
                {logoUrl ? (
                  <span
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white",
                      isLightDesign(designKey)
                        ? "border-neutral-200"
                        : "border-white/15",
                    ].join(" ")}
                  >
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                ) : null}

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
                      {item.url
                        .replace(/^https?:\/\//i, "")
                        .replace(/^\/\//, "")}
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

function ScheduleAgendaSubmissions({
  block,
  designKey,
}: {
  block: Extract<MicrositeBlock, { type: "schedule_agenda" }>;
  designKey?: string;
}) {
  const [submissions, setSubmissions] = useState<any[]>([]);

  async function loadSubmissions() {
    try {
      const params = new URLSearchParams({
        hostname: window.location.hostname,
        pageSlug: "home",
        linkedButtonId: block.id,
      });

      const res = await fetch(`/api/public/general-submissions?${params}`);
      const json = await res.json();

      if (json.ok && Array.isArray(json.submissions)) {
        setSubmissions(json.submissions);
      }
    } catch (err) {
      console.error("Unable to load schedule submissions", err);
    }
  }

  useEffect(() => {
    void loadSubmissions();

const handler = (event: Event) => {
  const customEvent = event as CustomEvent;

  if (customEvent.detail) {
    setSubmissions((prev) => [...prev, customEvent.detail]);
  }

  void loadSubmissions();
};

window.addEventListener(`schedule-submitted-${block.id}`, handler);

return () => {
  window.removeEventListener(`schedule-submitted-${block.id}`, handler);
};
  }, [block.id]);

  const items = submissions
    .map((submission) => {
      const fields = Array.isArray(submission.fields) ? submission.fields : [];

      return {
        id: submission.id,
        time: fields.find((field: any) => field.label === "Time")?.value ?? "",
        title:
          fields.find((field: any) => field.label === "Title")?.value ??
          submission.message ??
          "",
        description:
          fields.find((field: any) => field.label === "Description")?.value ??
          "",
      };
    })
    .filter((item) => item.time || item.title || item.description)
    .sort((a, b) => {
      const timeCompare = String(a.time).localeCompare(String(b.time), undefined, {
        numeric: true,
        sensitivity: "base",
      });

      if (timeCompare !== 0) return timeCompare;

      return String(a.title).localeCompare(String(b.title), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

  if (!items.length) return null;

  return (
    <div className="mt-3 space-y-3">
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
                isLightDesign(designKey) ? "bg-neutral-100" : "bg-white/10",
              ].join(" ")}
            >
              <div className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${getMutedTextClass(designKey)}`}>
                User
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
  );
}

function ScheduleAgendaSubmitForm({
  block,
}: {
  block: Extract<MicrositeBlock, { type: "schedule_agenda" }>;
}) {
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const canSubmit = Boolean(time.trim() || title.trim() || description.trim());

  return (
    <div className="grid grid-cols-1 gap-2">
      <select
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-900 opacity-100"
      >
        <option value="">Select time</option>
        {[
          "12:00 AM", "12:30 AM",
          "1:00 AM", "1:30 AM",
          "2:00 AM", "2:30 AM",
          "3:00 AM", "3:30 AM",
          "4:00 AM", "4:30 AM",
          "5:00 AM", "5:30 AM",
          "6:00 AM", "6:30 AM",
          "7:00 AM", "7:30 AM",
          "8:00 AM", "8:30 AM",
          "9:00 AM", "9:30 AM",
          "10:00 AM", "10:30 AM",
          "11:00 AM", "11:30 AM",
          "12:00 PM", "12:30 PM",
          "1:00 PM", "1:30 PM",
          "2:00 PM", "2:30 PM",
          "3:00 PM", "3:30 PM",
          "4:00 PM", "4:30 PM",
          "5:00 PM", "5:30 PM",
          "6:00 PM", "6:30 PM",
          "7:00 PM", "7:30 PM",
          "8:00 PM", "8:30 PM",
          "9:00 PM", "9:30 PM",
          "10:00 PM", "10:30 PM",
          "11:00 PM", "11:30 PM",
        ].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-900 opacity-100"
      />

      <textarea
        placeholder="Description"
        value={description}
        disabled={false}
        readOnly={false}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[64px] resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 opacity-100"
      />

<button
  type="button"
  disabled={!canSubmit || isSubmitting}
  className="relative z-50 h-9 rounded-lg bg-black px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canSubmit || isSubmitting) return;

    const submittedDetail = {
      id: `local-${Date.now()}`,
      message: title.trim() || "Schedule submission",
      fields: [
        { label: "Time", value: time.trim() },
        { label: "Title", value: title.trim() },
        { label: "Description", value: description.trim() },
      ],
    };

    setIsSubmitting(true);
    setStatus("");

    // Add locally immediately, even in builder/localhost preview.
    window.dispatchEvent(
      new CustomEvent(`schedule-submitted-${block.id}`, {
        detail: submittedDetail,
      }),
    );

    try {
      const res = await fetch("/api/public/general-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostname: window.location.hostname,
          pageSlug: "home",
          linkedButtonId: block.id,
          message: title.trim() || "Schedule submission",
          fields: [
            { label: "Type", value: "schedule_agenda" },
            { label: "Block ID", value: block.id },
            { label: "Time", value: time.trim() },
            { label: "Title", value: title.trim() },
            { label: "Description", value: description.trim() },
          ],
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        console.warn("Schedule saved locally only:", json?.error);
        setStatus("Added locally");
      } else {
        setStatus("Added");
      }

      setTime("");
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Schedule submission failed", err);
      setStatus("Added locally");
      setTime("");
      setTitle("");
      setDescription("");
    } finally {
      setIsSubmitting(false);
    }
  }}
>
  {isSubmitting ? "Adding..." : "Submit"}
</button>

      {status ? (
        <div className="text-[11px] font-medium opacity-70">{status}</div>
      ) : null}
    </div>
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
  className={`${getSoftSurfaceClass(designKey)} overflow-y-auto`}
>
      <div
        className="mb-3 text-base font-semibold"
        style={getContainerTextStyle(block.data.style, designKey)}
      >
        {block.data.heading || "Schedule"}
      </div>

{Boolean((block.data as any)?.allowUserEngagement) ? (
  <div
    className={[
      "mb-4 rounded-xl border p-3",
      isLightDesign(designKey)
        ? "border-neutral-200 bg-neutral-50 text-neutral-800"
        : "border-white/10 bg-white/5 text-white/80",
    ].join(" ")}
  >
    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em]">
      Add to schedule
    </div>

    <ScheduleAgendaSubmitForm block={block} />

    <div className="mt-2 text-[11px] opacity-70">
      Public schedule submissions UI enabled.
    </div>
  </div>
) : null}

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

{Boolean((block.data as any)?.allowUserEngagement) ? (
  <ScheduleAgendaSubmissions block={block} designKey={designKey} />
) : null}

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


function renderPopBalloon(
  block: Extract<MicrositeBlock, { type: "pop_balloon" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  return (
    <Surface
      block={block}
      designKey={designKey}
      className={getSoftSurfaceClass(designKey)}
    >
<PopBalloonLive
  micrositeId={micrositeId}
  blockId={block.id}
  title={block.data.title}
  hostName={block.data.hostName}
  lineupSlots={block.data.lineupSlots}
  requirePopReason={block.data.requirePopReason !== false}
  audienceVotingEnabled={Boolean(block.data.audienceVotingEnabled)}
  anonymousViewingEnabled={block.data.anonymousViewingEnabled !== false}
  matchResultMode={block.data.matchResultMode ?? "public"}
  theme={block.data.theme ?? "red_balloons"}
  prompt={block.data.prompt}
  hostPasscode={block.data.hostPasscode}
/>
    </Surface>
  );
}

function renderCheckout(
  block: Extract<MicrositeBlock, { type: "checkout" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  function CheckoutPreview() {
    const data = block.data;
    const [modalMessage, setModalMessage] = useState<string>("");
    const [modalTitle, setModalTitle] = useState<string>("Notice");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCheckout = async () => {
      try {
        setIsSubmitting(true);

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

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          const apiError =
            typeof json?.error === "string"
              ? json.error
              : "Checkout failed";

          setModalTitle("Checkout unavailable");
          setModalMessage(
            apiError === "Stripe not connected"
              ? "Checkout is not available for this microsite yet. Owner must first complete Stripe connection."
              : apiError === "Stripe onboarding not complete"
                ? "Checkout is not available for this microsite yet. Owner must first complete Stripe onboarding."
                : apiError,
          );
          return;
        }

        if (json?.url) {
          window.location.href = json.url;
          return;
        }

        setModalTitle("Checkout unavailable");
        setModalMessage("No checkout URL returned.");
      } catch (err) {
        console.error("Checkout error:", err);
        setModalTitle("Something went wrong");
        setModalMessage("Unable to start checkout right now.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <>
        <Surface block={block}>
          <div className="flex h-full w-full flex-col gap-3">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt={data.productName}
                className="h-40 w-full rounded-lg object-cover"
              />
            ) : null}

            <div
              className="text-base font-semibold"
              style={getContainerTextStyle(data.style, designKey)}
            >
              {data.productName || "Product"}
            </div>

            {data.description ? (
              <div
                className="text-sm opacity-70"
                style={getContainerTextStyle(data.style, designKey)}
              >
                {data.description}
              </div>
            ) : null}

            <div
              className="text-lg font-bold"
              style={getContainerTextStyle(data.style, designKey)}
            >
              ${Number(data.price || 0).toFixed(2)}
            </div>

            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={!micrositeId || isSubmitting}
              className="mt-auto w-full rounded-xl bg-black py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              title={
                !micrositeId
                  ? "Checkout only works on live microsites right now."
                  : undefined
              }
            >
              {!micrositeId
                ? "Live Microsite Required"
                : isSubmitting
                  ? "Starting Checkout..."
                  : data.buttonText || "Checkout"}
            </button>
          </div>
        </Surface>

        {modalMessage && typeof document !== "undefined"
          ? createPortal(
              <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 p-4 pt-24">
                <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                  <div className="text-base font-semibold text-neutral-900">
                    {modalTitle}
                  </div>

                  <div className="mt-2 text-sm text-neutral-600">
                    {modalMessage}
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalMessage("")}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:opacity-90"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}
      </>
    );
  }

  return <CheckoutPreview />;
}

function renderCart(
  block: Extract<MicrositeBlock, { type: "cart" }>,
  designKey?: string,
  micrositeId?: string | null,
  cartItems: CartItem[] = [],
  cartSubtotal: number = 0,
) {
  function CartPreview() {
    const [modalMessage, setModalMessage] = useState<string>("");
    const [modalTitle, setModalTitle] = useState<string>("Notice");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const safeCartItems = Array.isArray(cartItems)
      ? cartItems.filter(
          (item) =>
            item &&
            typeof item.price === "number" &&
            Number.isFinite(item.price) &&
            item.price > 0 &&
            typeof item.quantity === "number" &&
            Number.isFinite(item.quantity) &&
            item.quantity > 0,
        )
      : [];

    const currency = (block.data.currency || "usd").toUpperCase();
    const safeCartSubtotal = safeCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const taxRate = Number(block.data.taxRate || 0);
    const discountValue = Number(block.data.discount || 0);
    const discountType = block.data.discountType || "flat";

    const taxAmount = safeCartSubtotal * taxRate;
    const discountAmount =
      discountType === "percent"
        ? (safeCartSubtotal + taxAmount) * (Math.max(0, discountValue) / 100)
        : Math.max(0, discountValue);

    const total = Math.max(0, safeCartSubtotal + taxAmount - discountAmount);

    async function handleCartCheckout() {
      try {
        setIsSubmitting(true);

        const res = await fetch("/api/checkout/create-cart-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blockId: block.id,
            micrositeId,
            items: safeCartItems,
          }),
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          const apiError =
            typeof json?.error === "string" ? json.error : "Cart checkout failed";

          setModalTitle("Checkout unavailable");
          setModalMessage(
            apiError === "Stripe not connected"
              ? "Checkout is not available for this microsite yet. Owner must first complete Stripe connection."
              : apiError === "Stripe onboarding not complete"
                ? "Checkout is not available for this microsite yet. Owner must first complete Stripe onboarding."
                : apiError,
          );
          return;
        }

        if (json?.url) {
          window.location.href = json.url;
          return;
        }

        setModalTitle("Checkout unavailable");
        setModalMessage("No checkout URL returned.");
      } catch (err) {
        console.error("Cart checkout error:", err);
        setModalTitle("Something went wrong");
        setModalMessage("Unable to start checkout right now.");
      } finally {
        setIsSubmitting(false);
      }
    }

    return (
      <>
        <Surface
          block={block}
          designKey={designKey}
          className={getSoftSurfaceClass(designKey)}
        >
          <div className="flex h-full w-full flex-col gap-3">
            <div
              className="text-base font-semibold"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              {block.data.heading || "Cart"}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {safeCartItems.length > 0 ? (
                safeCartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <div
                        className="truncate font-medium"
                        style={getContainerTextStyle(block.data.style, designKey)}
                      >
                        {item.title}
                      </div>

                      <div
                        className="truncate text-xs opacity-70"
                        style={getContainerTextStyle(block.data.style, designKey)}
                      >
                        {item.description}
                      </div>

                      <div
                        className="text-xs opacity-60"
                        style={getContainerTextStyle(block.data.style, designKey)}
                      >
                        Qty: {item.quantity}
                      </div>
                    </div>

                    <div
                      className="font-semibold"
                      style={getContainerTextStyle(block.data.style, designKey)}
                    >
                      ${formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="text-sm opacity-60"
                  style={getContainerTextStyle(block.data.style, designKey)}
                >
                  {block.data.emptyMessage || "No items selected"}
                </div>
              )}
            </div>

            <div className="space-y-1 border-t pt-3 text-sm">
              <div
                className="flex justify-between"
                style={getContainerTextStyle(block.data.style, designKey)}
              >
                <span>Subtotal</span>
                <span>
                  {currency} ${formatCurrency(safeCartSubtotal)}
                </span>
              </div>

              {taxRate > 0 ? (
                <div
                  className="flex justify-between"
                  style={getContainerTextStyle(block.data.style, designKey)}
                >
                  <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
                  <span>
                    {currency} ${formatCurrency(taxAmount)}
                  </span>
                </div>
              ) : null}

          {discountAmount > 0 ? (
            <div
              className="flex justify-between"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              <span>
                Discount
                {discountType === "percent"
                  ? ` (${Math.max(0, discountValue)}%)`
                  : ""}
              </span>
              <span>- {currency} ${formatCurrency(discountAmount)}</span>
            </div>
          ) : null}

              <div
                className="flex justify-between pt-1 font-semibold"
                style={getContainerTextStyle(block.data.style, designKey)}
              >
                <span>Total</span>
                <span>
                  {currency} ${formatCurrency(total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleCartCheckout()}
              disabled={!micrositeId || safeCartItems.length === 0 || isSubmitting}
              className="mt-2 h-11 rounded-xl bg-neutral-900 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              title={
                !micrositeId
                  ? "Checkout only works on live microsites right now."
                  : safeCartItems.length === 0
                    ? "No cart items available."
                    : undefined
              }
            >
              {!micrositeId
                ? "Live Microsite Required"
                : safeCartItems.length === 0
                  ? block.data.emptyMessage || "No Items Selected"
                  : isSubmitting
                    ? "Starting Checkout..."
                    : block.data.buttonText || "Checkout"}
            </button>
          </div>
        </Surface>

        {modalMessage && typeof document !== "undefined"
          ? createPortal(
              <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 p-4 pt-24">
                <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                  <div className="text-base font-semibold text-neutral-900">
                    {modalTitle}
                  </div>

                  <div className="mt-2 text-sm text-neutral-600">
                    {modalMessage}
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalMessage("")}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:opacity-90"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}
      </>
    );
  }

  return <CartPreview />;
}


function PuzzleRenderer({
  block,
}: {
  block: Extract<MicrositeBlock, { type: "puzzle" }>;
}) {
  const imageUrl = block.data.imageUrl || "";
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1);
  const [boardBounds, setBoardBounds] = useState({
    left: 32,
    top: 8,
    width: 64,
    height: 84,
  });

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLImageElement | null>(null);

  const pieces = block.data.pieces ?? [];
  const pieceCount = block.data.pieceCount || 100;

  const sortLevel =
    block.data.sortLevel === "beginner"
      ? "Beginner"
      : block.data.sortLevel === "advanced"
        ? "Advanced"
        : "Intermediate";

  const roomId =
    typeof window === "undefined"
      ? "default"
      : `${window.location.hostname}_${block.id}`;

  const userId =
    typeof window === "undefined"
      ? "anonymous"
      : (() => {
          let key = window.localStorage.getItem("kohost_puzzle_user_key");
          if (!key) {
            key = `puzzle_${Math.random().toString(36).slice(2, 10)}`;
            window.localStorage.setItem("kohost_puzzle_user_key", key);
          }
          return key;
        })();

  const gridSize = useMemo(() => {
    let rows = 1;
    let cols = pieceCount;

    for (
      let possibleRows = 1;
      possibleRows <= Math.sqrt(pieceCount);
      possibleRows++
    ) {
      if (pieceCount % possibleRows === 0) {
        rows = possibleRows;
        cols = pieceCount / possibleRows;
      }
    }

    return {
      cols,
      rows,
      snapX: 100 / cols,
      snapY: 100 / rows,
    };
  }, [pieceCount]);

  const [piecePositions, setPiecePositions] = useState<
    Record<string, { x: number; y: number }>
  >(() =>
    Object.fromEntries(
      pieces.map((piece: any) => [
        piece.id,
        {
          x: piece.currentX ?? 0,
          y: piece.currentY ?? 0,
        },
      ]),
    ),
  );

useEffect(() => {
  setPiecePositions(
    Object.fromEntries(
      pieces.map((piece: any) => [
        piece.id,
        {
          x: piece.currentX ?? 0,
          y: piece.currentY ?? 0,
        },
      ]),
    ),
  );
}, [block.data.generatedAt]);

  useEffect(() => {
    async function fetchPuzzleState() {
      if (!pieces.length) return;

      try {
        const res = await fetch(
          `/api/puzzle/state?roomId=${encodeURIComponent(roomId)}`,
          { cache: "no-store" },
        );

        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) return;

        const nextPositions = data.positions ?? {};

        setPiecePositions((current) => {
          const merged = { ...current };

          for (const [pieceId, pos] of Object.entries(nextPositions)) {
            const typedPos = pos as { x: number; y: number };
            merged[pieceId] = {
              x: typedPos.x,
              y: typedPos.y,
            };
          }

          return merged;
        });
      } catch (error) {
        console.error("Puzzle state fetch failed:", error);
      }
    }

    void fetchPuzzleState();

    const interval = window.setInterval(() => {
      void fetchPuzzleState();
    }, 800);

    return () => window.clearInterval(interval);
  }, [roomId, pieces.length]);

  useEffect(() => {
    const updateBoardBounds = () => {
      const workspace = workspaceRef.current;
      const board = boardRef.current;
      if (!workspace || !board) return;

      const workspaceRect = workspace.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();

      if (!workspaceRect.width || !workspaceRect.height) return;

      setBoardBounds({
        left: ((boardRect.left - workspaceRect.left) / workspaceRect.width) * 100,
        top: ((boardRect.top - workspaceRect.top) / workspaceRect.height) * 100,
        width: (boardRect.width / workspaceRect.width) * 100,
        height: (boardRect.height / workspaceRect.height) * 100,
      });
    };

    updateBoardBounds();

    const observer = new ResizeObserver(updateBoardBounds);

    if (workspaceRef.current) observer.observe(workspaceRef.current);
    if (boardRef.current) observer.observe(boardRef.current);

    return () => observer.disconnect();
  }, [imageAspectRatio, pieces.length]);

  function getCorrectWorkspacePosition(piece: any) {
    return {
      x: boardBounds.left + (piece.correctX / 100) * boardBounds.width,
      y: boardBounds.top + (piece.correctY / 100) * boardBounds.height,
      width: (piece.widthPercent / 100) * boardBounds.width,
      height: (piece.heightPercent / 100) * boardBounds.height,
    };
  }

  async function persistPiecePosition(
    pieceId: string,
    x: number,
    y: number,
    isPlaced: boolean,
  ) {
    try {
      await fetch(`/api/puzzle/state?roomId=${encodeURIComponent(roomId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "move",
          pieceId,
          x,
          y,
          isPlaced,
          userId,
        }),
      });
    } catch (error) {
      console.error("Puzzle state save failed:", error);
    }
  }

  const placedCount = pieces.filter((piece: any) => {
    const pos = piecePositions[piece.id];
    if (!pos) return false;

    const correct = getCorrectWorkspacePosition(piece);

    return (
      Math.abs(pos.x - correct.x) <= 0.75 &&
      Math.abs(pos.y - correct.y) <= 0.75
    );
  }).length;

  const completion =
    pieces.length > 0 ? Math.round((placedCount / pieces.length) * 100) : 0;

  const isComplete = completion === 100;

  function snapPiece(pieceId: string) {
    const piece = pieces.find((item: any) => item.id === pieceId);
    if (!piece) return;

    setPiecePositions((current) => {
      const existing = current[pieceId] ?? { x: 0, y: 0 };
      const correct = getCorrectWorkspacePosition(piece);

      const snapX = (gridSize.snapX / 100) * boardBounds.width;
      const snapY = (gridSize.snapY / 100) * boardBounds.height;

      const snappedX =
        boardBounds.left +
        Math.round((existing.x - boardBounds.left) / snapX) * snapX;

      const snappedY =
        boardBounds.top +
        Math.round((existing.y - boardBounds.top) / snapY) * snapY;

      const snappedCorrect =
        Math.abs(snappedX - correct.x) <= 0.75 &&
        Math.abs(snappedY - correct.y) <= 0.75;

      const nextX = snappedCorrect
        ? correct.x
        : Math.max(0, Math.min(100, snappedX));

      const nextY = snappedCorrect
        ? correct.y
        : Math.max(0, Math.min(100, snappedY));

      void persistPiecePosition(pieceId, nextX, nextY, snappedCorrect);

      return {
        ...current,
        [pieceId]: {
          x: nextX,
          y: nextY,
        },
      };
    });
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-[inherit] bg-white p-3 text-neutral-900">
{block.data.displayPuzzleImage !== false ? (
  <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50">
    {imageUrl ? (
      <img
        src={imageUrl}
        alt={block.data.imageAlt || "Puzzle image"}
        className="h-full w-full object-contain"
        draggable={false}
        onLoad={(event) => {
          const img = event.currentTarget;
          if (img.naturalWidth && img.naturalHeight) {
            setImageAspectRatio(img.naturalWidth / img.naturalHeight);
          }
        }}
      />
    ) : (
      <div className="px-4 text-center text-sm font-medium text-neutral-500">
        Click the Puzzle block in the builder, then add an image URL in the inspector.
      </div>
    )}
  </div>
) : null}

      <div
        ref={workspaceRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50"
      >
        {pieces.length > 0 ? (
          <div className="absolute left-3 top-3 z-30 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm">
            {isComplete ? "Complete 🎉" : `${completion}% complete`}
          </div>
        ) : null}

        {pieces.length > 0 && imageUrl ? (
          <>
            <div className="absolute bottom-0 left-0 top-0 w-[30%] border-r border-neutral-200 bg-white/70 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Piece Tray
              </div>
              <div className="text-xs leading-5 text-neutral-500">
                Corners and edges start here when auto-sort is enabled.
              </div>
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-medium text-blue-700">
                Live mode enabled
              </div>
            </div>

<div className="absolute inset-y-0 left-[32%] right-4 flex items-center justify-center overflow-hidden p-4">
  <img
    ref={boardRef}
    src={imageUrl}
    alt=""
    className="pointer-events-none max-h-full max-w-full object-contain opacity-15"
    draggable={false}
  />
</div>

            {pieces.map((piece: any) => {
              const correct = getCorrectWorkspacePosition(piece);
              const pos = piecePositions[piece.id] ?? {
                x: piece.currentX ?? 0,
                y: piece.currentY ?? 0,
              };

              const isCorrect =
                Math.abs(pos.x - correct.x) <= 0.75 &&
                Math.abs(pos.y - correct.y) <= 0.75;

              return (
                <button
                  key={piece.id}
                  type="button"
                  disabled={isCorrect}
                  onPointerDown={(event) => {
                    const target = event.currentTarget;
                    const parent = workspaceRef.current;
                    if (!parent) return;

                    target.setPointerCapture(event.pointerId);

                    const parentRect = parent.getBoundingClientRect();
                    const startX = event.clientX;
                    const startY = event.clientY;
                    const startPos = piecePositions[piece.id] ?? {
                      x: piece.currentX ?? 0,
                      y: piece.currentY ?? 0,
                    };

                    const handlePointerMove = (moveEvent: PointerEvent) => {
                      const deltaX =
                        ((moveEvent.clientX - startX) / parentRect.width) * 100;
                      const deltaY =
                        ((moveEvent.clientY - startY) / parentRect.height) * 100;

                      setPiecePositions((current) => ({
                        ...current,
                        [piece.id]: {
                          x: Math.max(0, Math.min(100, startPos.x + deltaX)),
                          y: Math.max(0, Math.min(100, startPos.y + deltaY)),
                        },
                      }));
                    };

                    const handlePointerUp = () => {
                      snapPiece(piece.id);
                      window.removeEventListener(
                        "pointermove",
                        handlePointerMove,
                      );
                      window.removeEventListener("pointerup", handlePointerUp);
                    };

                    window.addEventListener("pointermove", handlePointerMove);
                    window.addEventListener("pointerup", handlePointerUp);
                  }}
                  className={[
                    "absolute touch-none overflow-hidden border-2 bg-white shadow-lg ring-1 transition-all active:shadow-xl",
                    isCorrect
                      ? "cursor-default border-emerald-400 ring-emerald-400/50"
                      : "cursor-grab border-white ring-black/10 active:cursor-grabbing",
                  ].join(" ")}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: `${correct.width}%`,
                    height: `${correct.height}%`,
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${gridSize.cols * 100}% ${
                      gridSize.rows * 100
                    }%`,
                    backgroundPosition: `${piece.col * -100}% ${
                      piece.row * -100
                    }%`,
                    borderRadius: 2,
                    zIndex: isCorrect ? 5 : piece.index + 10,
                    opacity: isCorrect ? 0.95 : 1,
                  }}
                  title={`Piece ${piece.index + 1}`}
                />
              );
            })}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <div className="text-sm font-semibold text-neutral-800">
              Puzzle Pieces Area
            </div>

            <div className="mt-2 text-xs leading-5 text-neutral-500">
              {pieceCount} pieces · {sortLevel}
            </div>

            <div className="mt-2 text-[11px] text-neutral-400">
              Add an image, then press Reset Puzzle.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderSpreadsheet(block: any, previewMode = false) {
  const data = block.data ?? {};

  const [cells, setCells] = useState<Record<string, any>>(data.cells ?? {});
const [activeCell, setActiveCell] = useState<string | null>(
  data.selectedCell ?? "0:0",
);

const [selectedCells, setSelectedCells] = useState<string[]>(
  Array.isArray(data.selectedCells) && data.selectedCells.length > 0
    ? data.selectedCells
    : [data.selectedCell ?? "0:0"],
);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    data.columnWidths ?? {},
  );
  const [rowHeights, setRowHeights] = useState<Record<string, number>>(
    data.rowHeights ?? {},
  );
  const [resizing, setResizing] = useState<null | {
    type: "column" | "row";
    index: number;
    startClient: number;
    startSize: number;
  }>(null);

  useEffect(() => {
    setCells(data.cells ?? {});
  }, [data.cells]);

  useEffect(() => {
    setColumnWidths(data.columnWidths ?? {});
  }, [data.columnWidths]);

  useEffect(() => {
    setRowHeights(data.rowHeights ?? {});
  }, [data.rowHeights]);

  const rowCount = data.rowCount ?? 6;
  const columnCount = data.columnCount ?? 5;

  const getCellKey = (row: number, col: number) => `${row}:${col}`;

  const columnLabels = Array.from({ length: columnCount }, (_, index) => {
    let label = "";
    let current = index;

    while (current >= 0) {
      label = String.fromCharCode((current % 26) + 65) + label;
      current = Math.floor(current / 26) - 1;
    }

    return label;
  });

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (resizing.type === "column") {
        const nextWidth = Math.max(
          48,
          resizing.startSize + event.clientX - resizing.startClient,
        );

        setColumnWidths((current) => {
          const next = {
            ...current,
            [String(resizing.index)]: nextWidth,
          };

          block.data.columnWidths = next;
          return next;
        });
      }

      if (resizing.type === "row") {
        const nextHeight = Math.max(
          24,
          resizing.startSize + event.clientY - resizing.startClient,
        );

        setRowHeights((current) => {
          const next = {
            ...current,
            [String(resizing.index)]: nextHeight,
          };

          block.data.rowHeights = next;
          return next;
        });
      }
    };

    const handleMouseUp = () => setResizing(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [block, resizing]);

  const isOwnerEditMode = data.editMode === true && previewMode !== true;
  const isPublicEditMode = data.allowUserEngagement === true && previewMode === true;
  const isEditable = isOwnerEditMode || isPublicEditMode;

  const updateCellValue = (cellKey: string, value: string) => {
    setCells((current) => {
      const next = {
        ...current,
        [cellKey]: {
          id: current[cellKey]?.id ?? `${cellKey}_${Date.now()}`,
          value,
          format: current[cellKey]?.format ?? {},
        },
      };

      block.data.cells = next;
      block.data.selectedCell = cellKey;

      return next;
    });
  };

const selectCell = (cellKey: string, multiSelect = false) => {
  setActiveCell(cellKey);

  const nextSelectedCells = multiSelect
    ? selectedCells.includes(cellKey)
      ? selectedCells.filter((item) => item !== cellKey)
      : [...selectedCells, cellKey]
    : [cellKey];

  const safeSelectedCells = nextSelectedCells.length ? nextSelectedCells : [cellKey];

  setSelectedCells(safeSelectedCells);

  block.data.selectedCell = cellKey;
  block.data.selectedCells = safeSelectedCells;

  if (typeof window !== "undefined") {
    (window as any).__koHostSpreadsheetActiveCell = {
      ...((window as any).__koHostSpreadsheetActiveCell ?? {}),
      [block.id]: cellKey,
    };
  }
};

  const moveToCell = (row: number, col: number) => {
  const safeRow = Math.max(0, Math.min(rowCount - 1, row));
  const safeCol = Math.max(0, Math.min(columnCount - 1, col));
  const nextCellKey = getCellKey(safeRow, safeCol);

  selectCell(nextCellKey, false);

  window.setTimeout(() => {
    const nextInput = document.querySelector(
      `[data-spreadsheet-cell="${block.id}:${nextCellKey}"]`,
    ) as HTMLInputElement | HTMLTextAreaElement | null;

    nextInput?.focus();
  }, 0);
};

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {data.showTitle !== false ? (
        <div className="border-b border-neutral-200 px-4 py-3">
          <div className="text-base font-semibold text-neutral-900">
            {data.title || "Spreadsheet"}
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="border-collapse" style={{ tableLayout: "fixed" }}>
          {data.showHeaders !== false ? (
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 h-10 min-w-[50px] border border-neutral-200 bg-neutral-100" />

                {columnLabels.map((label, columnIndex) => {
                  const width = columnWidths[String(columnIndex)] ?? 120;

                  return (
                    <th
                      key={label}
                      className="relative h-10 border border-neutral-200 bg-neutral-100 px-2 text-center text-xs font-semibold text-neutral-600"
                      style={{ width, minWidth: width }}
                    >
                      {label}

                      <span
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          setResizing({
                            type: "column",
                            index: columnIndex,
                            startClient: event.clientX,
                            startSize: width,
                          });
                        }}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
          ) : null}

          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => {
              const height = rowHeights[String(rowIndex)] ?? 36;

              return (
                <tr key={rowIndex}>
                  {data.showHeaders !== false ? (
                    <td
                      className="sticky left-0 z-10 border border-neutral-200 bg-neutral-100 px-2 text-center text-xs font-semibold text-neutral-600"
                      style={{ height }}
                    >
                      <span>{rowIndex + 1}</span>

                      <span
                        className="absolute bottom-0 left-0 h-2 w-full cursor-row-resize"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          setResizing({
                            type: "row",
                            index: rowIndex,
                            startClient: event.clientY,
                            startSize: height,
                          });
                        }}
                      />
                    </td>
                  ) : null}

                  {Array.from({ length: columnCount }).map((__, columnIndex) => {
                    const cellKey = getCellKey(rowIndex, columnIndex);
                    const cell = cells[cellKey];
                    const format = {
                      ...(data.defaultCellFormat ?? {}),
                      ...(cell?.format ?? {}),
                    };
                    const isSelected = selectedCells.includes(cellKey);
                    const isWrapped = format.wrapText === true;

                    return (
                      <td
                        key={cellKey}
                        className={`relative p-0 text-sm ${
                          data.showGridlines === false
                            ? "border border-transparent"
                            : "border border-neutral-200"
                        }`}
                        style={{
                          width: columnWidths[String(columnIndex)] ?? 120,
                          minWidth: columnWidths[String(columnIndex)] ?? 120,
                          height,
                          backgroundColor: format.backgroundColor ?? "#FFFFFF",
                        }}
                        onPointerDownCapture={(event) => {
                          const multiSelect = event.ctrlKey || event.metaKey;

                          if (multiSelect) {
                            event.preventDefault();
                            event.stopPropagation();
                          }

                          selectCell(cellKey, multiSelect);
                        }}
                      >
                        {isEditable && format.locked !== true ? (
                          isWrapped ? (
<textarea
  data-spreadsheet-cell={`${block.id}:${cellKey}`}
  value={cell?.value ?? ""}
  onChange={(event) =>
    updateCellValue(cellKey, event.target.value)
  }
  onKeyDown={(event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const [row, col] = cellKey.split(":").map(Number);
    moveToCell(row + 1, col);
  }}
  className={`h-full w-full resize-none bg-transparent px-2 py-1 outline-none ${
    isSelected ? "ring-2 ring-blue-500" : ""
  }`}
  style={{
    fontFamily: format.fontFamily ?? "Inter",
    fontSize: format.fontSize ?? 14,
    fontWeight: format.bold ? 700 : 400,
    fontStyle: format.italic ? "italic" : "normal",
    textDecoration: format.underline
      ? "underline"
      : "none",
    color: format.textColor ?? "#111827",
    textAlign: format.horizontalAlign ?? "left",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  }}
/>
) : (
<input
  data-spreadsheet-cell={`${block.id}:${cellKey}`}
  value={cell?.value ?? ""}
  onChange={(event) =>
    updateCellValue(cellKey, event.target.value)
  }
  onKeyDown={(event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const [row, col] = cellKey.split(":").map(Number);
    moveToCell(row + 1, col);
  }}
  className={`h-full w-full bg-transparent px-2 outline-none ${
    isSelected ? "ring-2 ring-blue-500" : ""
  }`}
  style={{
    fontFamily: format.fontFamily ?? "Inter",
    fontSize: format.fontSize ?? 14,
    fontWeight: format.bold ? 700 : 400,
    fontStyle: format.italic ? "italic" : "normal",
    textDecoration: format.underline
      ? "underline"
      : "none",
    color: format.textColor ?? "#111827",
    textAlign: format.horizontalAlign ?? "left",
    whiteSpace: "nowrap",
  }}
/>
                          )
                        ) : (
                          <div
                            className={`flex h-full min-h-[24px] px-2 ${
                              isWrapped
                                ? "whitespace-normal break-words py-1"
                                : "items-center overflow-hidden whitespace-nowrap"
                            } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                            style={{
                              fontFamily: format.fontFamily ?? "Inter",
                              fontSize: format.fontSize ?? 14,
                              fontWeight: format.bold ? 700 : 400,
                              fontStyle: format.italic ? "italic" : "normal",
                              textDecoration: format.underline
                                ? "underline"
                                : "none",
                              color: format.textColor ?? "#111827",
                              justifyContent:
                                format.horizontalAlign === "center"
                                  ? "center"
                                  : format.horizontalAlign === "right"
                                    ? "flex-end"
                                    : "flex-start",
                              alignItems:
                                format.verticalAlign === "top"
                                  ? "flex-start"
                                  : format.verticalAlign === "bottom"
                                    ? "flex-end"
                                    : "center",
                              whiteSpace: isWrapped ? "normal" : "nowrap",
                              overflowWrap: isWrapped ? "anywhere" : "normal",
                            }}
                          >
                          {cell?.value ?? ""}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderPuzzle(block: Extract<MicrositeBlock, { type: "puzzle" }>) {
  return <PuzzleRenderer block={block} />;
}

function renderSpinWheel(block: any) {
  const data = block.data ?? {};
  const items = (data.items ?? []).filter((item: any) => String(item.label ?? "").trim()).length
    ? data.items
    : [
        { id: "default_1", label: "10% Off", color: "#F97316", textColor: "#FFFFFF", isWinningItem: true },
        { id: "default_2", label: "Free Entry", color: "#EC4899", textColor: "#FFFFFF", isWinningItem: true },
        { id: "default_3", label: "Mystery Gift", color: "#8B5CF6", textColor: "#FFFFFF", isWinningItem: true },
        { id: "default_4", label: "Try Again", color: "#111827", textColor: "#FFFFFF", isWinningItem: false },
      ];

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const size = 240;
  const center = size / 2;
  const radius = 112;
  const anglePerItem = 360 / items.length;

  const polarToCartesian = (angle: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;

    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const createSegmentPath = (index: number) => {
    const startAngle = index * anglePerItem;
    const endAngle = startAngle + anglePerItem;
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArcFlag = anglePerItem > 180 ? 1 : 0;

    return [
      `M ${center} ${center}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  };

const spin = () => {
  if (isSpinning || items.length === 0) return;

  const selectedIndex = Math.floor(Math.random() * items.length);
  const segmentCenterAngle = selectedIndex * anglePerItem + anglePerItem / 2;
  const targetRotation = (360 - segmentCenterAngle) % 360;
  const currentRotation = ((rotation % 360) + 360) % 360;
  const extraRotation = (targetRotation - currentRotation + 360) % 360;
  const finalRotation = rotation + 360 * 6 + extraRotation;

  setIsSpinning(true);
  setResult(null);
  setRotation(finalRotation);

  window.setTimeout(() => {
    setResult(items[selectedIndex]);
    setIsSpinning(false);
  }, 3500);
};

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 p-5 text-center">
      <div>
        <div className="text-xl font-semibold text-neutral-900">
          {data.title || "Spin to Win"}
        </div>
        <div className="mt-1 text-sm text-neutral-500">
          {data.subtitle || "Unlock a surprise reward"}
        </div>
      </div>

      <div className="relative mt-2 h-[260px] w-[260px]">
        <div className="absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-neutral-900" />

        <div
          className="absolute inset-[10px] rounded-full shadow-2xl transition-transform duration-[3500ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full rounded-full">
            {items.map((item: any, index: number) => {
              const midAngle = index * anglePerItem + anglePerItem / 2;
              const textPoint = polarToCartesian(midAngle);

              const wrapWheelLabel = (label: string) => {
  const words = String(label || "").trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > 10 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) lines.push(currentLine);

  return lines.slice(0, 3);
};

              return (
                <g key={item.id ?? index}>
                  <path
                    d={createSegmentPath(index)}
                    fill={item.color || "#F97316"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
<text
  x={(center + textPoint.x) / 2}
  y={(center + textPoint.y) / 2}
  fill={item.textColor || "#FFFFFF"}
  fontSize="10"
  fontWeight="700"
  textAnchor="middle"
  dominantBaseline="middle"
  transform={`rotate(${midAngle}, ${(center + textPoint.x) / 2}, ${(center + textPoint.y) / 2})`}
>
  {wrapWheelLabel(item.label).map((line, lineIndex, lines) => (
    <tspan
      key={`${item.id ?? index}_line_${lineIndex}`}
      x={(center + textPoint.x) / 2}
      dy={lineIndex === 0 ? `${-(lines.length - 1) * 5}` : "11"}
    >
      {line}
    </tspan>
  ))}
</text>
                </g>
              );
            })}

            <circle cx={center} cy={center} r="28" fill="#FFFFFF" stroke="#111827" strokeWidth="4" />
            <circle cx={center} cy={center} r="12" fill="#111827" />
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={isSpinning}
        className="rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:bg-neutral-400"
      >
        {isSpinning ? "Spinning..." : data.buttonText || "Spin Now"}
      </button>

      {result && (
        <div className="mt-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-sm text-neutral-500">
            {result.isWinningItem
              ? data.winnerMessage || "You won!"
              : data.loserMessage || "Try again next time"}
          </div>
          <div className="mt-1 text-lg font-semibold text-neutral-900">
            {result.label}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlockRenderer({
  block,
  designKey,
  micrositeId,
  micrositeSlug,
  serverNow,
  previewMode = false,
  cartItems,
  cartSubtotal,
  listingQuantities,
  onChangeListingQuantity,
}: Props) {
  const safeCartItems = cartItems ?? [];
  const safeCartSubtotal = cartSubtotal ?? 0;
  const safeListingQuantities = listingQuantities ?? {};
  switch (block.type) {
    case "label":
      return renderLabel(block, designKey);

    case "text_fx":
      return renderTextFx(block, designKey);

    case "image":
      return renderImage(block, designKey);

case "listing":
  return renderListing(
    block,
    designKey,
    safeListingQuantities,
    onChangeListingQuantity,
  );

  case "video": {
  const rawUrl = (block.data.videoUrl ?? "").trim();

  const buildEmbedUrl = (url: string) => {
    if (!url) return "";

    if (url.startsWith("data:video/")) return url;
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return url;

    try {
      const parsed = new URL(url);

      // YouTube watch → embed
      if (parsed.hostname.includes("youtube.com") && parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      // youtu.be → embed
      if (parsed.hostname.includes("youtu.be")) {
        const videoId = parsed.pathname.replace(/^\/+/, "");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      // Vimeo
      if (parsed.hostname.includes("vimeo.com")) {
        const videoId = parsed.pathname.replace(/^\/+/, "");
        if (videoId) return `https://player.vimeo.com/video/${videoId}`;
      }

      return url;
    } catch {
      return url;
    }
  };

  const resolvedUrl = buildEmbedUrl(rawUrl);

  const isDirectVideo =
    resolvedUrl.startsWith("data:video/") ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(resolvedUrl);

  return (
    <div className="h-full w-full overflow-hidden rounded-xl bg-black">
      {block.data.title ? (
        <div className="px-3 py-2 text-sm font-semibold text-white">
          {block.data.title}
        </div>
      ) : null}

      {resolvedUrl ? (
        isDirectVideo ? (
          <video
            src={resolvedUrl}
            className="h-full w-full"
            autoPlay={Boolean(block.data.autoplay)}
            muted={Boolean(block.data.muted)}
            loop={Boolean(block.data.loop)}
            controls={Boolean(block.data.showControls)}
            playsInline
          />
        ) : (
          <iframe
            src={resolvedUrl}
            className="h-full w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
          Add video URL
        </div>
      )}
    </div>
  );
}

    case "image_carousel":
      return renderImageCarousel(block, designKey);

    case "form_field":
      return renderFormField(block, designKey);

case "cart":
  return renderCart(
    block,
    designKey,
    micrositeId,
    safeCartItems,
    safeCartSubtotal,
  );

  case "spin_wheel":
    return renderSpinWheel(block);

case "spreadsheet":
  return renderSpreadsheet(block, previewMode);

  case "puzzle":
    return renderPuzzle(block);
  
  case "bookmark":
  return null;

    case "cta":
      return renderCta(block, designKey);

    case "checkout":
      return renderCheckout(block, designKey, micrositeId);
    case "countdown":
      return renderCountdown(block, designKey, serverNow);
    case "links":
      return renderLinks(block, designKey, previewMode);
    case "video":
      return renderVideo(block, designKey);
    case "gallery":
      return renderGallery(block, designKey);
    case "poll":
      return renderPoll(block, designKey, micrositeSlug);
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
      return renderHighlight(block, designKey, micrositeId, micrositeSlug);
    case "rich_text":
      return renderRichText(block, designKey);
    case "progress_bar":
      return renderProgressBar(block, designKey);
    case "donation":
      return renderDonation(block, designKey, micrositeId);
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

case "pop_balloon":
  return renderPopBalloon(block, designKey, micrositeId);

    default:
      return <div className="h-full w-full" />;
  }
}