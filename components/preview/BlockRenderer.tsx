// components\preview\BlockRenderer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SpeedDatingLive from "@/components/blocks/SpeedDatingLive";
import PopBalloonLive from "@/components/blocks/PopBalloonLive";
import AppModal from "@/components/ui/AppModal";
import ContentPanelBlock from "@/components/blocks/ContentPanelBlock";
import EnrollmentBoardBlock from "@/components/blocks/EnrollmentBoardBlock";
import TournamentDisplayBlock from "@/components/blocks/TournamentDisplayBlock";
import type { CSSProperties } from "react";
import {
  ENROLLMENT_BOARD_PROFILE_EVENT,
  type EnrollmentBoardProfileEventDetail,
} from "@/components/blocks/enrollmentBoardEvents";

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
  Architects_Daughter,
  Bungee,
  Courier_Prime,
  Gloria_Hallelujah,
  Luckiest_Guy,
  Open_Sans,
  Oswald,
  Patrick_Hand,
  Source_Sans_3,
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
  onDownloadFrame?: (block: Extract<MicrositeBlock, { type: "frame" }>) => void;
  onFocusTimelineEntry?: (blockId: string, entryId: string) => void;
};

type ThreadAttachment = {
  id: string;
  type: "image" | "gif" | "video" | "audio";
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl?: string;
  url?: string;
};

type ThreadUiMessage = ThreadMessage & {
  userVote?: -1 | 0 | 1;
  attachments?: ThreadAttachment[];
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
const architectsDaughter = Architects_Daughter({ subsets: ["latin"], weight: "400" });
const bungee = Bungee({ subsets: ["latin"], weight: "400" });
const courierPrime = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"] });
const gloriaHallelujah = Gloria_Hallelujah({ subsets: ["latin"], weight: "400" });
const luckiestGuy = Luckiest_Guy({ subsets: ["latin"], weight: "400" });
const openSans = Open_Sans({ subsets: ["latin"] });
const oswaldFont = Oswald({ subsets: ["latin"] });
const patrickHand = Patrick_Hand({ subsets: ["latin"], weight: "400" });
const sourceSans3 = Source_Sans_3({ subsets: ["latin"] });
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
  "Architects Daughter": `${architectsDaughter.style.fontFamily}, cursive`,
  Bungee: `${bungee.style.fontFamily}, display, sans-serif`,
  "Courier Prime": `${courierPrime.style.fontFamily}, "Courier New", monospace`,
  "Gloria Hallelujah": `${gloriaHallelujah.style.fontFamily}, cursive`,
  Handwritten: `${patrickHand.style.fontFamily}, ${architectsDaughter.style.fontFamily}, ${gloriaHallelujah.style.fontFamily}, ${caveat.style.fontFamily}, cursive`,
  "Luckiest Guy": `${luckiestGuy.style.fontFamily}, display, sans-serif`,
  "Modern UI": `${openSans.style.fontFamily}, ${sourceSans3.style.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
  "Montserrat SemiBold":
    'var(--font-montserrat), Montserrat, ui-sans-serif, system-ui, sans-serif',
  "Patrick Hand": `${patrickHand.style.fontFamily}, cursive`,
  "Source Sans Pro": `${sourceSans3.style.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
  Typewriter: `${courierPrime.style.fontFamily}, "Courier New", monospace`,
  Teko: `${teko.style.fontFamily}, sans-serif`,
  "Special Elite": 'var(--font-special-elite), "Special Elite", monospace',
};


function resolveFontFamily(fontFamily?: string) {
  if (!fontFamily || fontFamily === "inherit") return "inherit";
  return FONT_FAMILY_MAP[fontFamily] ?? fontFamily;
}

function normalizePreviewHref(url?: string, micrositeSlug?: string | null) {
  const raw = (url ?? "").trim();

  if (!raw) return "#";

  if (
    raw.startsWith("#") ||
    /^https?:\/\//i.test(raw) ||
    /^mailto:/i.test(raw) ||
    /^tel:/i.test(raw) ||
    raw.startsWith("//")
  ) {
    return raw;
  }

  if (typeof window === "undefined") return raw;

  if (raw.startsWith("/")) {
    const pagePath = raw.replace(/^\/+/, "");
    const { origin, hostname, pathname } = window.location;

    const parts = pathname.split("/").filter(Boolean);
    const isPathMicrosite = parts[0] === "s" && Boolean(parts[1]);
    const pathSlug = isPathMicrosite ? parts[1] : micrositeSlug?.trim();

    if (pathSlug) {
      return pagePath
        ? `${origin}/s/${pathSlug}/${pagePath}`
        : `${origin}/s/${pathSlug}`;
    }

    const isSubdomainMicrosite =
      hostname.endsWith(".ko-host.com") && hostname !== "ko-host.com";

    if (isSubdomainMicrosite) {
      return pagePath ? `${origin}/${pagePath}` : origin;
    }

    return raw;
  }

  return `https://${raw}`;
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
    ...getTextTextureStyle(style),    
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
  const hasTexture = Boolean(style?.textureEnabled && style.textureImageUrl);

  return {
    ...getTextStyle(style),
    color: hasTexture
      ? "transparent"
      : style?.color || getDefaultTextColor(designKey),
    WebkitTextFillColor: hasTexture ? "transparent" : undefined,
  };
}

function getThreadHeadingStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  return {
    ...getContainerTextStyle(
      {
        fontSize: 18,
        ...style,
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

function hexToRgba(hex: string, opacity = 1) {
  if (!hex || hex === "transparent") return undefined;

  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
}

function getAppearanceStyle(block: MicrositeBlock): React.CSSProperties {
  const textureEnabled = Boolean(block.appearance?.textureEnabled);
  const textureUrl = block.appearance?.textureImageUrl || "";
  const textureScale = Number(block.appearance?.textureScale ?? 100);
  const texturePositionX = Number(block.appearance?.texturePositionX ?? 50);
  const texturePositionY = Number(block.appearance?.texturePositionY ?? 50);

  return {
backgroundColor:
  block.appearance?.backgroundColor &&
  block.appearance.backgroundColor !== "transparent"
    ? hexToRgba(
        block.appearance.backgroundColor,
        typeof (block.appearance as any).backgroundOpacity === "number"
          ? (block.appearance as any).backgroundOpacity
          : 1,
      )
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

function getTextureBorderStyle(
  appearance?: MicrositeBlock["appearance"],
): React.CSSProperties {
  if (!appearance?.textureEnabled || !appearance.textureImageUrl) {
    return {};
  }

  return {
    borderStyle: "solid",
    borderWidth: `${Math.max(2, appearance.borderWidth ?? 8)}px`,
    borderColor: "transparent",
    borderImage: `url("${appearance.textureImageUrl}") 30 round`,
  };
}

function getTextureBackgroundStyle(
  appearance?: MicrositeBlock["appearance"],
): React.CSSProperties {
  if (
    !appearance?.textureEnabled ||
    !appearance.textureImageUrl
  ) {
    return {};
  }

  const scale = Math.max(
    10,
    Math.min(400, appearance.textureScale ?? 100),
  );

  const positionX = appearance.texturePositionX ?? 50;
  const positionY = appearance.texturePositionY ?? 50;

  return {
    backgroundImage: `url(${appearance.textureImageUrl})`,
    backgroundRepeat: "repeat",
    backgroundSize: `${scale}%`,
    backgroundPosition: `${positionX}% ${positionY}%`,
  };
}

function getTextTextureStyle(
  style?: TextStyle,
): React.CSSProperties {
  if (!style?.textureEnabled || !style.textureImageUrl) {
    return {};
  }

  const scale = Math.max(
    10,
    Math.min(400, style.textureScale ?? 100),
  );

  const positionX = style.texturePositionX ?? 50;
  const positionY = style.texturePositionY ?? 50;

  return {
    backgroundImage: `url(${style.textureImageUrl})`,
    backgroundRepeat: "repeat",
    backgroundSize: `${scale}%`,
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
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
  styleOverride,
  id,
}: {
  block: MicrositeBlock;
  designKey?: string;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  styleOverride?: React.CSSProperties;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={[
        "h-full w-full min-h-0 overflow-visible",
        padded ? "p-4" : "",
        className,
      ].join(" ")}
      style={{
        ...getAppearanceStyle(block),
        ...(styleOverride ?? {}),
      }}
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
const textureFaceStyle =
  block.appearance?.textureEnabled && block.appearance?.textureImageUrl
    ? {
        backgroundImage: `url("${block.appearance.textureImageUrl}")`,
        backgroundSize: `${block.appearance.textureScale ?? 100}%`,
        backgroundPosition: `${block.appearance.texturePositionX ?? 50}% ${
          block.appearance.texturePositionY ?? 50
        }%`,
        backgroundRepeat: "repeat",
      }
    : {};

const style = {
  ...getAppearanceStyle(block),
  ...textureFaceStyle,
};

  const positionX = block.data.positionX ?? 50;
  const positionY = block.data.positionY ?? 50;
  const scale = block.data.scale ?? 1;
  const rotation = block.data.rotation ?? 0;
  const opacity = block.data.opacity ?? 1;
  const fade = block.data.fade;

  const shadowColor = block.data.shadowColor ?? "#000000";
  const shadowBlur = block.data.shadowBlur ?? 0;
  const shadowX = block.data.shadowX ?? 0;
  const shadowY = block.data.shadowY ?? 0;

const boxShadow =
  block.data.shadowEnabled && shadowBlur > 0
    ? `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`
    : undefined;

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
        className="flex h-full w-full items-center overflow-hidden"
        style={{
          opacity,
          transform,
          transformOrigin: "center",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          ...fadeStyle,
        }}
      >
        <div
          className="w-full shrink-0"
          style={{
            height: `${Math.max(2, block.appearance?.borderWidth || 4)}px`,
            backgroundColor:
              block.appearance?.borderColor ||
              block.appearance?.backgroundColor ||
              "#111827",
            borderRadius: "999px",
            boxShadow,
            overflow: "hidden",
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
        boxShadow,
        ...fadeStyle,
      }}
    />
  );
}

function renderWave(block: Extract<MicrositeBlock, { type: "wave" }>) {
  const data = block.data as any;
  const appearanceStyle = getAppearanceStyle(block);

  const lineColor = data.lineColor || "#C8A97E";
  const lineThickness =
    typeof data.lineThickness === "number" ? data.lineThickness : 2;
  const waveHeight =
    typeof data.waveHeight === "number" ? data.waveHeight : 40;
  const waveFrequency =
    typeof data.waveFrequency === "number" ? data.waveFrequency : 3;
  const opacity =
    typeof data.opacity === "number" ? data.opacity : 1;

  const segments = Math.max(1, Math.min(8, Math.floor(waveFrequency)));
  const segmentWidth = 720 / segments;

  const path = Array.from({ length: segments })
    .map((_, index) => {
      const startX = index * segmentWidth;
      const midX = startX + segmentWidth / 2;
      const endX = startX + segmentWidth;

      return `${index === 0 ? `M ${startX} 50` : ""} C ${
        startX + segmentWidth * 0.25
      } ${50 - waveHeight}, ${midX - segmentWidth * 0.25} ${
        50 + waveHeight
      }, ${midX} 50 S ${endX - segmentWidth * 0.25} ${
        50 - waveHeight
      }, ${endX} 50`;
    })
    .join(" ");

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={appearanceStyle}
    >
      <svg
        viewBox="0 0 720 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        style={{
          opacity,
          transform: data.flipVertical ? "scaleY(-1)" : undefined,
        }}
      >
        <path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineThickness}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function EnrollmentLinkedLabel({
  block,
  designKey,
}: {
  block: Extract<MicrositeBlock, { type: "label" }>;
  designKey?: string;
}) {
  const [overrideText, setOverrideText] = useState<string | null>(null);

  useEffect(() => {
    function handleEnrollmentProfileUpdate(event: Event) {
      const customEvent =
        event as CustomEvent<EnrollmentBoardProfileEventDetail>;

      if (customEvent.detail?.linkedNameLabelBlockId === block.id) {
        setOverrideText(customEvent.detail.name || null);
        return;
      }

      if (customEvent.detail?.linkedQuoteLabelBlockId === block.id) {
        setOverrideText(customEvent.detail.quote || null);
      }
    }

    window.addEventListener(
      ENROLLMENT_BOARD_PROFILE_EVENT,
      handleEnrollmentProfileUpdate,
    );

    return () => {
      window.removeEventListener(
        ENROLLMENT_BOARD_PROFILE_EVENT,
        handleEnrollmentProfileUpdate,
      );
    };
  }, [block.id]);

  return renderLabelBase(block, designKey, overrideText);
}

function renderLabelBase(
  block: Extract<MicrositeBlock, { type: "label" }>,
  designKey?: string,
  overrideText?: string | null,
) {
  const hasTexture = Boolean(
    block.data.style?.textureEnabled && block.data.style?.textureImageUrl,
  );

  const fade = (block.data as any).fade ?? {};
  const fadeSize = Math.max(0, Math.min(50, Number(fade.size ?? 15)));

  const fadeMasks = [
    fade.top
      ? `linear-gradient(to bottom, transparent 0%, black ${fadeSize}%, black 100%)`
      : "",
    fade.bottom
      ? `linear-gradient(to top, transparent 0%, black ${fadeSize}%, black 100%)`
      : "",
    fade.left
      ? `linear-gradient(to right, transparent 0%, black ${fadeSize}%, black 100%)`
      : "",
    fade.right
      ? `linear-gradient(to left, transparent 0%, black ${fadeSize}%, black 100%)`
      : "",
  ].filter(Boolean);

  const fadeMaskImage = fadeMasks.length ? fadeMasks.join(", ") : undefined;

  return (
    <div
      className="h-full w-full p-2"
      style={{
        ...getAppearanceStyle(block),
        WebkitMaskImage: fadeMaskImage,
        maskImage: fadeMaskImage,
        WebkitMaskComposite: fadeMasks.length > 1 ? "source-in" : undefined,
        maskComposite: fadeMasks.length > 1 ? "intersect" : undefined,
      }}
    >
      <div
        style={{
          ...getContainerTextStyle(block.data.style, designKey),
          display: "block",
          width: "100%",
          textAlign: block.data.style?.align ?? "left",

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

          color: hasTexture
            ? "transparent"
            : block.data.style?.color ?? undefined,

          WebkitTextFillColor: hasTexture
            ? "transparent"
            : block.data.style?.color ?? undefined,

          transform: `translate(${((block.data as any).positionX ?? 50) - 50}%, ${
            ((block.data as any).positionY ?? 50) - 50
          }%)`,
        }}
      >
        {overrideText ?? getLabelText(block)}
      </div>
    </div>
  );
}

function renderLabel(
  block: Extract<MicrositeBlock, { type: "label" }>,
  designKey?: string,
) {
  return <EnrollmentLinkedLabel block={block} designKey={designKey} />;
}


function renderVideo(
  block: Extract<MicrositeBlock, { type: "video" }>,
  designKey?: string,
) {
  function VideoPreview() {
    const titleStyle = getContainerTextStyle(block.data.style, designKey);
    const rawVideoUrl = (block.data.videoUrl ?? "").trim();

    const buildEmbedUrl = (url: string) => {
      if (!url) return "";

      if (url.startsWith("data:video/")) return url;
      if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return url;
      if (url.includes("/storage/v1/object/public/")) return url;

      try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtube.com") && parsed.pathname === "/watch") {
          const videoId = parsed.searchParams.get("v");
          if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        if (parsed.hostname.includes("youtu.be")) {
          const videoId = parsed.pathname.replace(/^\/+/, "");
          if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        if (parsed.hostname.includes("vimeo.com")) {
          const videoId = parsed.pathname.replace(/^\/+/, "");
          if (videoId) return `https://player.vimeo.com/video/${videoId}`;
        }

        return url;
      } catch {
        return url;
      }
    };

    const videoUrl = buildEmbedUrl(rawVideoUrl);

    const autoGenerateThumbnail =
      (block.data as any).autoGenerateThumbnail !== false;

    const thumbnailUrl = String((block.data as any).thumbnailUrl ?? "").trim();
    const showCustomThumbnail = !autoGenerateThumbnail && Boolean(thumbnailUrl);
    const showPlayOverlay = (block.data as any).showPlayOverlay !== false;

    const showCaption = Boolean((block.data as any).addCaption);
    const caption = String((block.data as any).caption ?? "").trim();
    const captionStyle = ((block.data as any).captionStyle ?? {}) as TextStyle;

    const [started, setStarted] = useState(Boolean(block.data.autoplay));

    if (!videoUrl && !showCustomThumbnail) {
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
      /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(videoUrl) ||
      videoUrl.includes("/storage/v1/object/public/");

    const frameStyle: React.CSSProperties = {
      border: `${Math.max(1, block.appearance?.borderWidth ?? 1)}px solid ${
        block.appearance?.borderColor ?? "#e5e7eb"
      }`,
      borderRadius:
        typeof block.appearance?.borderRadius === "number"
          ? `${block.appearance.borderRadius}px`
          : "12px",
      backgroundColor: "rgba(0,0,0,0.05)",
    };

    const embedSrc =
      videoUrl && !isDirectVideoFile
        ? `${videoUrl}${videoUrl.includes("?") ? "&" : "?"}autoplay=${
            started || block.data.autoplay ? 1 : 0
          }&mute=${block.data.muted ? 1 : 0}&loop=${
            block.data.loop ? 1 : 0
          }&controls=${block.data.showControls !== false ? 1 : 0}`
        : videoUrl;

    const startVideo = () => {
      setStarted(true);
    };

    return (
      <div
        className="flex h-full w-full flex-col gap-2 overflow-hidden p-2"
        style={getAppearanceStyle(block)}
      >
        {block.data.title ? (
          <div style={titleStyle}>{block.data.title}</div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl" style={frameStyle}>
          <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
            {isDirectVideoFile ? (
              <video
                src={videoUrl}
                poster={!started && showCustomThumbnail ? thumbnailUrl : undefined}
                className="relative z-10 h-full w-full object-cover"
                autoPlay={Boolean(block.data.autoplay) || started}
                muted={Boolean(block.data.muted)}
                loop={Boolean(block.data.loop)}
                controls={block.data.showControls !== false}
                playsInline
                preload="metadata"
                style={{
                  height: "100%",
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                  pointerEvents: "auto",
                }}
              />
            ) : videoUrl ? (
              <iframe
                key={embedSrc}
                src={embedSrc}
                className="relative z-10 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={block.data.title || "Video"}
                style={{
                  height: "100%",
                  width: "100%",
                  display: "block",
                  border: "none",
                  pointerEvents: "auto",
                }}
              />
            ) : null}

            {showCustomThumbnail && !started && !block.data.autoplay ? (
              <button
                type="button"
                className="absolute inset-0 z-30 flex h-full w-full cursor-pointer items-center justify-center border-0 bg-black p-0"
                onClick={startVideo}
              >
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />

                {showPlayOverlay ? (
                  <img
                    src="/icons/button_video_play.png"
                    alt=""
                    className="pointer-events-none relative z-10 h-16 w-16 object-contain"
                    draggable={false}
                  />
                ) : null}
              </button>
            ) : null}

            {!showCustomThumbnail &&
            showPlayOverlay &&
            !started &&
            !block.data.autoplay &&
            block.data.showControls === false ? (
              <button
                type="button"
                className="absolute inset-0 z-30 flex h-full w-full cursor-pointer items-center justify-center border-0 bg-transparent p-0"
                onClick={startVideo}
              >
                <img
                  src="/icons/button_video_play.png"
                  alt=""
                  className="pointer-events-none h-16 w-16 object-contain"
                  draggable={false}
                />
              </button>
            ) : null}
          </div>
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

  return <VideoPreview />;
}

function EnrollmentLinkedImage({
  block,
  designKey,
}: {
  block: Extract<MicrositeBlock, { type: "image" }>;
  designKey?: string;
}) {
  const [overrideUrl, setOverrideUrl] = useState<string | null>(null);

  useEffect(() => {
    function handleEnrollmentProfileUpdate(event: Event) {
      const customEvent =
        event as CustomEvent<EnrollmentBoardProfileEventDetail>;

      if (
        customEvent.detail?.linkedProfileImageBlockId !== block.id
      ) {
        return;
      }

      setOverrideUrl(customEvent.detail.profileImageUrl || null);
    }

    window.addEventListener(
      ENROLLMENT_BOARD_PROFILE_EVENT,
      handleEnrollmentProfileUpdate,
    );

    return () => {
      window.removeEventListener(
        ENROLLMENT_BOARD_PROFILE_EVENT,
        handleEnrollmentProfileUpdate,
      );
    };
  }, [block.id]);

  return renderImageBase(block, designKey, overrideUrl);
}

function renderImageBase(
  block: Extract<MicrositeBlock, { type: "image" }>,
  designKey?: string,
  overrideUrl?: string | null,
) {
  const imageUrl = overrideUrl || block.data.image.url;

if (!imageUrl) {
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
const imageShadow = (block.data as any).imageShadow ?? {};
const imageShadowStyle =
  imageShadow.enabled
    ? {
        filter: `drop-shadow(${Number(imageShadow.offsetX ?? 0)}px ${Number(
          imageShadow.offsetY ?? 8,
        )}px ${Number(imageShadow.blur ?? 16)}px ${
          imageShadow.color ?? "rgba(0,0,0,0.35)"
        })`,
      }
    : {};

  return (
<div className="flex h-full w-full flex-col overflow-visible">
  <div className="min-h-0 flex-1 overflow-visible">
    <div
      className="h-full w-full overflow-visible"
style={{
  ...frameStyle,
  ...imageShadowStyle,
  borderColor:
    block.appearance?.textureEnabled && block.appearance?.textureImageUrl
      ? "transparent"
      : frameStyle.borderColor,
  borderImageSource:
    block.appearance?.textureEnabled && block.appearance?.textureImageUrl
      ? `url("${block.appearance.textureImageUrl}")`
      : undefined,
  borderImageSlice:
    block.appearance?.textureEnabled && block.appearance?.textureImageUrl
      ? 30
      : undefined,
  borderImageRepeat:
    block.appearance?.textureEnabled && block.appearance?.textureImageUrl
      ? "round"
      : undefined,
  padding: undefined,
  transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
  transformOrigin: "center center",
  opacity: block.data.image.opacity ?? 1,
}}
        >
<img
  src={imageUrl}
  alt={block.data.image.alt || ""}
  className="h-full w-full"
  style={{
    objectFit: getImageObjectFit(block),
    objectPosition: "center center",
    transform: "none",
    opacity: 1,
    borderRadius: "inherit",
    display: "block",
    backgroundColor: "transparent",
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

function renderImage(
  block: Extract<MicrositeBlock, { type: "image" }>,
  designKey?: string,
) {
  return <EnrollmentLinkedImage block={block} designKey={designKey} />;
}

function renderIcon(block: Extract<MicrositeBlock, { type: "icon" }>) {
  const icon = block.data.icon;
  console.log("ICON DEBUG", {
  id: block.id,
  label: block.label,
  alt: icon.alt,
  url: icon.url,
});
  const iconUrl =
    icon.url && !icon.url.endsWith("/star.svg")
      ? icon.url
      : `/media-icons/${String(block.label || icon.alt || "star")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}.svg`;
  const positionX = icon.positionX ?? 50;
  const positionY = icon.positionY ?? 50;
  const zoom = icon.zoom ?? 1;
  const rotation = icon.rotation ?? 0;

  const translateX = (positionX - 50) * 0.6;
  const translateY = (positionY - 50) * 0.6;
  const numberedCircleMatch = iconUrl.match(/circle-(one|two|three|four|five|six|seven|eight|nine|ten)\.svg$/);

const numberedCircleValue = numberedCircleMatch
  ? {
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      ten: "10",
    }[numberedCircleMatch[1]]
  : null;

return (
  <div className="flex h-full w-full items-center justify-center overflow-visible">
{numberedCircleValue ? (
  <svg
    viewBox="0 0 122.88 122.88"
    aria-label={icon.alt || "Icon"}
    className="h-full w-full"
    style={{
      transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
      transformOrigin: "center center",
      opacity: icon.opacity ?? 1,
    }}
  >
    <circle cx="61.44" cy="61.44" r="61.44" fill={icon.color ?? "#111111"} />
    <text
      x="61.44"
      y="67"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#ffffff"
      fontSize={numberedCircleValue === "10" ? "44" : "58"}
      fontWeight="800"
      fontFamily="Arial, Helvetica, sans-serif"
    >
      {numberedCircleValue}
    </text>
  </svg>
) : (
      <div
        className="h-full w-full"
        style={{
          transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          opacity: icon.opacity ?? 1,
          backgroundColor: icon.color ?? "#111111",
          WebkitMaskImage: `url("${iconUrl}")`,
          maskImage: `url("${iconUrl}")`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
        aria-label={icon.alt || "Icon"}
      />
    )}
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
  const metadataSeparator = (block.data as any).metadataSeparator ?? ":";
const renderedMetadataSeparator =
  metadataSeparator === "none" ? "" : ` ${metadataSeparator} `;
  const price = typeof block.data.price === "number" ? block.data.price : 0;
  const addToCart = !!block.data.addToCart;
  const isSelectable = addToCart && price > 0;

  const pricePlacement = (block.data as any).pricePlacement ?? "mid";
  const quantityPlacement = (block.data as any).quantityPlacement ?? "mid";

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

  const cardRotation = Math.max(
    -45,
    Math.min(45, Number((block.data as any).rotation) || 0),
  );

  const cardScale = Math.max(
    0.5,
    Math.min(1, Number((block.data as any).scale) || 1),
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

  const priceNode =
    price > 0 ? (
      <div
        className="text-sm font-semibold"
        style={getContainerTextStyle((block.data as any).priceStyle, designKey)}
      >
        ${formatCurrency(price)}
      </div>
    ) : null;

  const quantityNode = isSelectable ? (
    <div
      className={[
        "flex items-center gap-2 text-sm",
        ((block.data as any).quantityStyle?.align ?? "left") === "center"
          ? "justify-center"
          : ((block.data as any).quantityStyle?.align ?? "left") === "right"
            ? "justify-end"
            : "justify-start",
      ].join(" ")}
      style={getContainerTextStyle((block.data as any).quantityStyle, designKey)}
    >
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

      <div className="min-w-[28px] text-center font-semibold">{quantity}</div>

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
  ) : null;

  const metadataNode = metadata.length ? (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {metadata.map((item) => (
        <div key={item.id} className="min-w-0">
          <span
            className="mr-1 opacity-60"
            style={getContainerTextStyle(block.data.metadataStyle, designKey)}
          >
            {item.label}
{renderedMetadataSeparator}
          </span>
          <span style={getContainerTextStyle(block.data.metadataStyle, designKey)}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  ) : null;

  const contentNode = (
    <>
      <div
        className="font-semibold"
        style={getContainerTextStyle(block.data.titleStyle, designKey)}
      >
        {block.data.title || "Listing Title"}
      </div>

      {pricePlacement === "mid" ? priceNode : null}
      {quantityPlacement === "mid" ? quantityNode : null}

      {block.data.description ? (
        <div
          className="text-sm"
          style={getContainerTextStyle(block.data.descriptionStyle, designKey)}
        >
          {block.data.description}
        </div>
      ) : null}

      <div className="mt-auto space-y-2">
        {metadataNode}
        {pricePlacement === "lower" ? priceNode : null}
        {quantityPlacement === "lower" ? quantityNode : null}
      </div>
    </>
  );

  const imageNode = (
    <>
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
            "flex h-full w-full items-center justify-center border-dashed text-sm",
            getPlaceholderClass(designKey),
          ].join(" ")}
        >
          Add image
        </div>
      )}
    </>
  );

  if (cardVariant === "feature") {
    const showTitle = (block.data as any).showTitle ?? true;
    const showPrice = (block.data as any).showPrice ?? true;
    const showImage = (block.data as any).showImage ?? true;
    const showBullets = (block.data as any).showBullets ?? true;
    const showButton = (block.data as any).showButton ?? true;

    const pricePosition = (block.data as any).pricePosition ?? "right";
    const imageShape = (block.data as any).imageShape ?? "rounded";
    const bulletStyle = (block.data as any).bulletStyle ?? "dot";
    const buttonText = (block.data as any).buttonText || "Buy Ticket";
    const buttonLink = (block.data as any).buttonLink || "";
    const buttonAlignment = (block.data as any).buttonAlignment ?? "right";

    const featureBullets = Array.isArray((block.data as any).featureBullets)
      ? (block.data as any).featureBullets.filter(
          (item: unknown): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
      : [];

    const featureImageWidth = Math.max(
      20,
      Math.min(50, Number((block.data as any).imageWidthPercent) || 35),
    );

    const bulletMark =
      bulletStyle === "checkmark"
        ? "✓"
        : bulletStyle === "arrow"
          ? "→"
          : bulletStyle === "star"
            ? "★"
            : bulletStyle === "icon"
              ? "◆"
              : "•";

    const imageShapeClass =
      imageShape === "circle"
        ? "rounded-full"
        : imageShape === "ticket"
          ? "rounded-[22px]"
          : imageShape === "badge"
            ? "rounded-full"
            : imageShape === "rounded"
              ? "rounded-2xl"
              : "rounded-none";

    const buttonJustify =
      buttonAlignment === "center"
        ? "justify-center"
        : buttonAlignment === "left"
          ? "justify-start"
          : "justify-end";

    const featureButton =
      showButton && buttonAlignment !== "hidden" ? (
        <div className={["mt-auto flex", buttonJustify].join(" ")}>
          {buttonLink ? (
            <a
              href={buttonLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {buttonText}
            </a>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {buttonText}
            </button>
          )}
        </div>
      ) : null;

    return (
      <div
        className="h-full w-full overflow-visible"
        style={{
          transform: `scale(${cardScale}) rotate(${cardRotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        <div
          className="flex h-full w-full flex-col gap-3 overflow-hidden p-4"
          style={getAppearanceStyle(block)}
        >
          <div
            className={[
              "flex gap-3",
              pricePosition === "belowTitle"
                ? "flex-col items-start"
                : "items-start justify-between",
            ].join(" ")}
          >
            <div className="min-w-0">
              {showTitle ? (
                <div
                  className="font-semibold uppercase tracking-[0.04em]"
                  style={getContainerTextStyle(block.data.titleStyle, designKey)}
                >
                  {block.data.title || "Listing Title"}
                </div>
              ) : null}

              {showPrice && pricePosition === "belowTitle" ? priceNode : null}
            </div>

            {showPrice && pricePosition !== "belowTitle" ? (
              <div className={pricePosition === "left" ? "order-first" : ""}>
                {priceNode}
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 gap-4">
            {showImage ? (
              <div
                className={[
                  "relative min-h-[88px] shrink-0 overflow-hidden border border-black/10 bg-black/5",
                  imageShapeClass,
                ].join(" ")}
                style={{
                  width: `${featureImageWidth}%`,
                }}
              >
                {imageNode}
              </div>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {showBullets ? (
                <div className="space-y-1.5 text-sm">
                  {featureBullets.map((item: string, index: number) => (
                    <div key={`${item}-${index}`} className="flex gap-2">
                      <span className="shrink-0 opacity-70">{bulletMark}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {featureButton}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cardVariant === "compact") {
    return (
      <div
        className="h-full w-full overflow-visible"
        style={{
          transform: `scale(${cardScale}) rotate(${cardRotation}deg)`,
          transformOrigin: "center center",
        }}
      >
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
              width: `${block.data.imageWidthPercent ?? 35}%`,
              minWidth: `${block.data.imageWidthPercent ?? 35}%`,
              flexShrink: 0,
            }}
          >
            {imageNode}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 pt-3 pb-6">
            {contentNode}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full overflow-visible"
      style={{
        transform: `scale(${cardScale}) rotate(${cardRotation}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div className="h-full w-full overflow-hidden" style={getAppearanceStyle(block)}>
        <div className="flex h-full w-full flex-col">
          <div
            className="relative w-full overflow-hidden"
            style={{ height: `${imageHeightPercent}%` }}
          >
            {imageNode}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pt-3 pb-6">
            {contentNode}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCta(
  block: Extract<MicrositeBlock, { type: "cta" }>,
  designKey?: string,
  micrositeSlug?: string | null,
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
    document.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(`[data-linked-button="${block.id}"]`),
  );

  if (!fields.length) {
    if (block.data.buttonUrl?.trim()) {
      const href = normalizePreviewHref(block.data.buttonUrl, micrositeSlug);

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

  const checkboxFields = fields.filter(
    (field): field is HTMLInputElement =>
      field instanceof HTMLInputElement && field.type === "checkbox",
  );

  const checkboxGroups = new Map<string, HTMLInputElement[]>();

  checkboxFields.forEach((field) => {
    const groupKey = field.dataset.checkboxGroup || block.id;
    const current = checkboxGroups.get(groupKey) ?? [];
    checkboxGroups.set(groupKey, [...current, field]);
  });

  checkboxGroups.forEach((groupFields) => {
    const allowMultiple = groupFields.some(
      (field) => field.dataset.allowMultipleSelections === "true",
    );

    if (allowMultiple) return;

    const checkedFields = groupFields.filter((field) => field.checked);

    checkedFields.slice(1).forEach((field) => {
      field.checked = false;
    });
  });

  const missingRequired = fields.find((field) => {
    if (field.dataset.required !== "true") return false;

    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      return !field.checked;
    }

    return !field.value.trim();
  });

  if (missingRequired) {
    missingRequired.focus();
    return;
  }

  const values = fields.map((field) => {
    const label = field.dataset.fieldLabel || "Field";

    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      return {
        label,
        value: field.checked ? "true" : "false",
      };
    }

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
      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        field.checked = false;
        return;
      }

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

const buttonImagePlacement =
  ((block.data as any).buttonImagePlacement as
    | "before"
    | "above"
    | "after"
    | undefined) ?? "before";

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
  className={[
    "inline-flex cursor-pointer items-center justify-center transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70",
    buttonImagePlacement === "above"
      ? "flex-col gap-2"
      : "flex-row gap-2",
  ].join(" ")}
  style={{
    ...style,
    ...variantStyle,
    transform: `translate(${posX - 50}%, ${posY - 50}%)`,
    paddingTop: `${(block.data as any).buttonPaddingY ?? 8}px`,
    paddingBottom: `${(block.data as any).buttonPaddingY ?? 8}px`,
    paddingLeft: `${(block.data as any).buttonPaddingX ?? 20}px`,
    paddingRight: `${(block.data as any).buttonPaddingX ?? 20}px`,
  }}
>
  {block.data.buttonImageUrl &&
  buttonImagePlacement !== "after" ? (
    <img
      src={block.data.buttonImageUrl}
      alt=""
      style={{
        width: `${(block.data as any).buttonImageSize ?? 20}px`,
        height: `${(block.data as any).buttonImageSize ?? 20}px`,
      }}
      className="shrink-0 object-cover"
    />
  ) : null}

  <span>
    {submitted
      ? submittedText
      : submitting
        ? "Submitting..."
        : block.data.buttonText || "Button"}
  </span>

  {block.data.buttonImageUrl &&
  buttonImagePlacement === "after" ? (
    <img
      src={block.data.buttonImageUrl}
      alt=""
      style={{
        width: `${(block.data as any).buttonImageSize ?? 20}px`,
        height: `${(block.data as any).buttonImageSize ?? 20}px`,
      }}
      className="shrink-0 object-cover"
    />
  ) : null}
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

    const data = block.data as any;
    const appearanceStyle = getAppearanceStyle(block);

    const headingStyle = getContainerTextStyle(
      ((data.headingStyle ?? data.style ?? {}) as TextStyle),
      designKey,
    );

    const backgroundTextStyle = getContainerTextStyle(
      block.data.style,
      designKey,
    );

    const tileStyle = getContainerTextStyle(
      ((data.tileStyle ?? block.data.style ?? {}) as TextStyle),
      designKey,
    );

    const valueStyle = getContainerTextStyle(
      ((data.standardValueStyle ?? block.data.style ?? {}) as TextStyle),
      designKey,
    );

    const unitStyle = getContainerTextStyle(
      ((data.standardUnitStyle ?? block.data.style ?? {}) as TextStyle),
      designKey,
    );

    const tileBackgroundColor =
      (data.tileStyle?.backgroundColor as string | undefined) ?? undefined;

    const tileBorderColor =
      (data.tileStyle?.borderColor as string | undefined) ?? undefined;

    const variant = (data.styleVariant ?? "default") as
      | "default"
      | "cards"
      | "hero"
      | "stage"
      | "standard";

    const showRings = data.showRings !== false;
    const showSeparator = data.showSeparator !== false;
    const spacing =
      typeof data.spacing === "number" && Number.isFinite(data.spacing)
        ? Math.max(0, Math.min(80, data.spacing))
        : 12;
    const stageUnitGap =
      typeof data.stageUnitGap === "number" && Number.isFinite(data.stageUnitGap)
        ? Math.max(-40, Math.min(40, data.stageUnitGap))
        : -24;

    const rawAnimationStyle =
      (data.animationStyle as
        | "none"
        | "pulse"
        | "flip"
        | "slide"
        | "bounce"
        | undefined) ?? "none";

    const animationStyle =
      rawAnimationStyle === "slide" ? "bounce" : rawAnimationStyle;

    const alignment =
      (data.alignment as "left" | "center" | "right" | undefined) ?? "center";

    const alignmentClass =
      alignment === "left"
        ? "items-start text-left"
        : alignment === "right"
          ? "items-end text-right"
          : "items-center text-center";

    const justifyClass =
      alignment === "left"
        ? "justify-start"
        : alignment === "right"
          ? "justify-end"
          : "justify-center";

    const showDays = data.showDays !== false;
    const showHours = data.showHours !== false;
    const showMinutes = data.showMinutes !== false;
    const showSeconds = data.showSeconds !== false;

    const countdownAnimationTransform = (baseTransform: string) => {
      if (animationStyle === "none") return baseTransform;
      if (!isTicking) return baseTransform;

      if (animationStyle === "flip") {
        return `${baseTransform} rotateX(-78deg)`;
      }

      if (animationStyle === "bounce") {
        return `${baseTransform} translateY(-14px)`;
      }

      return `${baseTransform} scale(1.08)`;
    };

    const countdownAnimationTransition =
      animationStyle === "flip"
        ? "transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease"
        : animationStyle === "bounce"
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

    if (!target || Number.isNaN(target)) {
      return (
        <div
          className={[
            "flex h-full w-full flex-col justify-center gap-2 p-4",
            alignmentClass,
          ].join(" ")}
          style={appearanceStyle}
        >
          {block.data.heading ? (
            <div
              className={["uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
              style={headingStyle}
            >
              {block.data.heading}
            </div>
          ) : null}

          <div style={backgroundTextStyle}>Set target date</div>
        </div>
      );
    }

    const diff = target - tickNow;

    if (diff <= 0) {
      return (
        <div
          className="flex h-full w-full items-center justify-center p-4 text-center"
          style={appearanceStyle}
        >
          <div style={backgroundTextStyle}>
            {block.data.completedMessage || "Countdown finished"}
          </div>
        </div>
      );
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const format = (n: number) => String(n).padStart(2, "0");

    const parts = [
      {
        key: "days",
        label: "DAYS",
        shortLabel: "D",
        value: format(days),
        raw: days,
        visible: showDays,
      },
      {
        key: "hours",
        label: "HOURS",
        shortLabel: "H",
        value: format(hours),
        raw: hours,
        visible: showHours,
      },
      {
        key: "minutes",
        label: "MINUTES",
        shortLabel: "M",
        value: format(minutes),
        raw: minutes,
        visible: showMinutes,
      },
      {
        key: "seconds",
        label: "SECONDS",
        shortLabel: "S",
        value: format(seconds),
        raw: seconds,
        visible: showSeconds,
      },
    ].filter((p) => p.visible);

    const getProgress = (part: (typeof parts)[number]) =>
      part.shortLabel === "S"
        ? seconds / 60
        : part.shortLabel === "M"
          ? minutes / 60
          : part.shortLabel === "H"
            ? hours / 24
            : Math.min(days / 365, 1);

    const valueFontNumber = Number(valueStyle.fontSize) || 24;
    const unitFontNumber = Number(unitStyle.fontSize) || 11;

    if (variant === "standard" || variant === "stage") {
      return (
        <div
          className={[
            "flex h-full w-full flex-col justify-center gap-2 p-4",
            alignmentClass,
          ].join(" ")}
          style={appearanceStyle}
        >
          {block.data.heading ? (
            <div
              className={["uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
              style={headingStyle}
            >
              {block.data.heading}
            </div>
          ) : null}

          <div
            className={[
              "flex w-full flex-wrap",
              variant === "stage" ? "items-end" : "items-baseline",
              justifyClass,
            ].join(" ")}
            style={{ gap: `${spacing}px` }}
          >
            {parts.map((part) => (
              <div
                key={part.key}
                className={
                  variant === "stage"
                    ? "flex flex-col items-center"
                    : "flex items-baseline gap-1"
                }
              >
                <span
                  className="font-bold leading-none"
                  style={{
                    ...valueStyle,
                    fontSize: valueStyle.fontSize ?? "24px",
                  }}
                >
                  {part.value}
                </span>

<span
  className={[
    "uppercase tracking-[0.12em]",
    variant === "stage" ? "" : "",
  ].join(" ")}
                  style={{
                    ...unitStyle,
                    fontSize: unitStyle.fontSize ?? "11px",
                    marginTop: variant === "stage" ? `${stageUnitGap}px` : undefined,
                  }}
                >
                  {part.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (variant === "cards" || variant === "hero") {
      const isHero = variant === "hero";
      const ringSize = Math.max(isHero ? 86 : 70, valueFontNumber * (isHero ? 2.45 : 2.8));
      const ringStroke = isHero ? 3 : 2;
      const ringRadius = ringSize / 2 - ringStroke * 3;
      const ringCircumference = 2 * Math.PI * ringRadius;

      return (
        <div
          className={[
            "flex h-full w-full flex-col justify-center gap-4 p-4",
            alignmentClass,
          ].join(" ")}
          style={appearanceStyle}
        >
          {block.data.heading ? (
            <div
              className={["uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
              style={headingStyle}
            >
              {block.data.heading}
            </div>
          ) : null}

          <div
            className={[
              "flex w-full flex-wrap items-center",
              justifyClass,
            ].join(" ")}
            style={{ gap: `${spacing}px` }}
          >
            {parts.map((part, index) => (
              <div key={part.key} className="flex items-center gap-2">
                <div
                  className={[
                    "relative flex flex-col items-center justify-center rounded-xl border px-3 py-3 shadow-sm",
tileBorderColor
  ? "border bg-white"
  : isLightDesign(designKey)
    ? "border-neutral-200 bg-white"
    : "border-white/10 bg-white/5",
                  ].join(" ")}
                  style={{
                    ...tileStyle,
                    backgroundColor: tileBackgroundColor,
                    borderColor: tileBorderColor,
                    perspective: "700px",
                    minWidth: ringSize + 18,
                  }}
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      width: ringSize,
                      height: ringSize,
                    }}
                  >
                    {showRings ? (
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        width={ringSize}
                        height={ringSize}
                        viewBox={`0 0 ${ringSize} ${ringSize}`}
                      >
                        <circle
                          cx={ringSize / 2}
                          cy={ringSize / 2}
                          r={ringRadius}
                          stroke="currentColor"
                          strokeWidth={ringStroke}
                          fill="none"
                          opacity="0.1"
                        />
                        <circle
                          cx={ringSize / 2}
                          cy={ringSize / 2}
                          r={ringRadius}
                          stroke={
                            seconds < 10
                              ? "#EF4444"
                              : seconds < 30
                                ? "#F59E0B"
                                : isLightDesign(designKey)
                                  ? "#6366F1"
                                  : "#A5B4FC"
                          }
                          strokeWidth={ringStroke}
                          fill="none"
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={
                            ringCircumference -
                            ringCircumference * getProgress(part)
                          }
                          className="transition-all duration-500"
                        />
                      </svg>
                    ) : null}

                    <span
                      className={[
                        "relative z-10 font-bold leading-none transition-all duration-200",
                        animationStyle === "pulse" && seconds < 10
                        ? "animate-pulse"
                        : "",
                      ].join(" ")}
                      style={{
                        ...valueStyle,
                        ...countdownAnimationExtraStyle,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: valueStyle.fontSize ?? (isHero ? "36px" : "24px"),
                        transition: countdownAnimationTransition,
transform:
  animationStyle === "none"
    ? "scale(1)"
    : countdownAnimationTransform(
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
                    </span>
                  </div>

                  <div
                    className="mt-1 uppercase tracking-[0.12em]"
                    style={{
                      ...unitStyle,
                      fontSize: unitStyle.fontSize ?? (isHero ? "12px" : "10px"),
                    }}
                  >
                    {part.label}
                  </div>
                </div>

                {showSeparator && index < parts.length - 1 ? (
                  <span
                    className={isHero ? "text-3xl font-bold" : "text-lg font-semibold"}
                    style={unitStyle}
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
      <div
        className={[
          "flex h-full w-full flex-col justify-center gap-3 p-4",
          alignmentClass,
        ].join(" ")}
        style={appearanceStyle}
      >
        {block.data.heading ? (
          <div
            className={["uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
            style={headingStyle}
          >
            {block.data.heading}
          </div>
        ) : null}

        <div
          className={[
            "flex w-full flex-wrap items-center",
            justifyClass,
          ].join(" ")}
          style={{ gap: `${spacing}px` }}
        >
          {parts.map((part, index) => (
            <div key={part.key} className="flex items-center gap-2">
              <div
                className="flex items-baseline gap-1 rounded-lg border px-2 py-1"
                style={{
                  ...tileStyle,
                  backgroundColor: tileBackgroundColor,
                  borderColor: tileBorderColor,
                  perspective: "700px",
                }}
              >
                <span
                  className="font-semibold transition-transform duration-200"
style={{
  ...valueStyle,
  ...countdownAnimationExtraStyle,
  display: "inline-block",
  transition:
    animationStyle === "none"
      ? "none"
      : countdownAnimationTransition,
  transform:
    animationStyle === "none"
      ? "scale(1)"
      : countdownAnimationTransform(
          isTicking ? "scale(1.05)" : "scale(1)",
        ),
}}
                >
                  {part.value}
                </span>

                <span style={unitStyle}>{part.label}</span>
              </div>

              {showSeparator && index < parts.length - 1 ? (
                <span style={unitStyle}>:</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <CountdownPreview />;
}

function renderTimeline(
  block: Extract<MicrositeBlock, { type: "timeline" }>,
  designKey?: string,
  onFocusTimelineEntry?: (blockId: string, entryId: string) => void,
) {
  const data = block.data as any;
  const appearanceStyle = getAppearanceStyle(block);

  const headingStyle = getContainerTextStyle(data.titleStyle, designKey);
  const dateStyle = getContainerTextStyle(data.dateStyle, designKey);
  const titleStyle = getContainerTextStyle(data.entryTitleStyle, designKey);
  const subtitleStyle = getContainerTextStyle(data.subtitleStyle, designKey);
  const descriptionStyle = getContainerTextStyle(data.descriptionStyle, designKey);

  const entries = Array.isArray(data.entries) ? data.entries : [];
  const orderedEntries =
    data.direction === "descending" ? [...entries].reverse() : entries;

  const variant = data.styleVariant ?? "classic";
  const isHorizontal = variant === "horizontal";
  const isMemory = variant === "memory";
  const isAlternating = variant === "alternating";
  const isJourney = variant === "journey";

  const spacing =
    typeof data.spacing === "number" && Number.isFinite(data.spacing)
      ? data.spacing
      : 24;

const cardWidth =
  typeof data.cardWidth === "number" && Number.isFinite(data.cardWidth)
    ? Math.max(80, Math.min(520, data.cardWidth))
    : 260;

const nodeSize = 16;
const connectorThickness =
  typeof data.connectorThickness === "number" && Number.isFinite(data.connectorThickness)
    ? Math.max(1, Math.min(24, data.connectorThickness))
    : 3;

const journeyConnectorHeight =
  typeof data.journeyConnectorHeight === "number" &&
  Number.isFinite(data.journeyConnectorHeight)
    ? Math.max(120, Math.min(360, data.journeyConnectorHeight))
    : 170;

const journeyCardsPerRow =
  typeof data.journeyCardsPerRow === "number" &&
  Number.isFinite(data.journeyCardsPerRow)
    ? Math.max(1, Math.min(5, Math.floor(data.journeyCardsPerRow)))
    : 3;

  const connectorBorderStyle =
    data.connectorStyle === "dashed"
      ? "dashed"
      : data.connectorStyle === "dotted"
        ? "dotted"
        : "solid";

  const showConnector = data.connectorStyle !== "none";

const renderJourneyPath = () => {
  const rowCount = Math.max(1, Math.ceil(orderedEntries.length / journeyCardsPerRow));
  const svgHeight = rowCount * journeyConnectorHeight;

  const d = Array.from({ length: rowCount })
    .map((_, index) => {
      const y = index * journeyConnectorHeight + 40;
      const nextY = (index + 1) * journeyConnectorHeight + 40;
      const isLast = index === rowCount - 1;

      if (index % 2 === 0) {
        return isLast
          ? `M 5 ${y} H 95`
          : `M 5 ${y} H 95 V ${nextY} H 5`;
      }

      return isLast
        ? `M 95 ${y} H 5`
        : `M 95 ${y} H 5 V ${nextY} H 95`;
    })
    .join(" ");

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox={`0 0 100 ${svgHeight}`}
    >
      <path
        d={d}
        fill="none"
        stroke={data.lineColor || "#CBD5E1"}
        strokeWidth={connectorThickness}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
        strokeDasharray={
          data.connectorStyle === "dashed"
            ? "10 8"
            : data.connectorStyle === "dotted"
              ? "2 8"
              : undefined
        }
      />
    </svg>
  );
};

  const imageShapeClass = (shape?: string) => {
    switch (shape) {
      case "circle":
        return "rounded-full";
      case "rounded":
        return "rounded-2xl";
      case "square":
        return "rounded-none";
      case "diamond":
        return "rotate-45 rounded-lg";
      case "hexagon":
        return "rounded-[28%]";
      case "blob":
        return "rounded-[38%_62%_55%_45%/45%_42%_58%_55%]";
      case "none":
        return "hidden";
      default:
        return "rounded-2xl";
    }
  };

const renderMedia = (entry: any) => {
  if (entry.imageShape === "none") return null;

  const imageSize =
    typeof entry.imageSize === "number" && Number.isFinite(entry.imageSize)
      ? Math.max(24, Math.min(160, entry.imageSize))
      : 64;

if (entry.imageUrl) {
  return (
    <div
      className={[
        "shrink-0 overflow-hidden bg-neutral-100",
        imageShapeClass(entry.imageShape),
      ].join(" ")}
      style={{
        width: `${imageSize}px`,
        height: `${imageSize}px`,
      }}
    >
      <img
        src={entry.imageUrl}
        alt=""
        className={[
          "h-full w-full object-cover",
          entry.imageShape === "diamond" ? "-rotate-45 scale-150" : "",
        ].join(" ")}
      />
    </div>
  );
}

if (entry.icon) {
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden border bg-white",
        imageShapeClass(entry.imageShape),
      ].join(" ")}
      style={{
        width: `${imageSize}px`,
        height: `${imageSize}px`,
        borderColor: data.nodeColor || entry.accentColor || "#2563EB",
      }}
    >
      <img
        src={entry.icon}
        alt=""
        className="h-1/2 w-1/2 object-contain"
      />
    </div>
  );
}

return null;
};

  const getPlacementOffset = (entry: any) =>
  entry.useDefaultPlacement === false &&
  typeof entry.placementOffset === "number" &&
  Number.isFinite(entry.placementOffset)
    ? Math.max(-160, Math.min(160, entry.placementOffset))
    : 0;

const renderEntryCard = (entry: any, index: number) => {
    const accentColor = entry.accentColor || data.nodeColor || "#2563EB";
    const cardLayout = data.cardLayout ?? "standard";
    const isSpotlightCard = cardLayout === "spotlight";
    const isStoryCard = cardLayout === "story";

return (
<div
  key={entry.id || index}
  onPointerDownCapture={(e) => {
    e.stopPropagation();

    onFocusTimelineEntry?.(block.id, entry.id);
  }}
  className={[
          "relative min-w-0 border p-4",
          data.shadow !== false ? "shadow-md" : "",
          isMemory ? "bg-white/90" : "",
        ].join(" ")}
style={{
width: `${cardWidth}px`,
maxWidth: "100%",
  
          backgroundColor: entry.cardBackground || data.cardBackground || "#FFFFFF",
          borderColor: accentColor,
          borderRadius:
            typeof data.borderRadius === "number"
              ? `${data.borderRadius}px`
              : "20px",
        }}
      >
<div
  className={[
    "min-w-0",
    isSpotlightCard || isStoryCard
      ? "flex flex-col items-center gap-3 text-center"
      : "flex gap-3",
  ].join(" ")}
>
  {(isSpotlightCard || !isStoryCard) && renderMedia(entry)}

  <div
    className={
      isSpotlightCard || isStoryCard
        ? "min-w-0 w-full"
        : "min-w-0 flex-1"
    }
  >
            {entry.date ? (
              <div
                className="mb-1 whitespace-normal break-words text-xs font-semibold uppercase tracking-[0.12em]"
                style={dateStyle}
              >
                {entry.date}
              </div>
            ) : null}

            {entry.title ? (
              <div
                className="whitespace-normal break-words font-semibold leading-tight"
                style={titleStyle}
              >
                {entry.title}
              </div>
            ) : null}

            {entry.subtitle ? (
              <div
                className="mt-1 whitespace-normal break-words text-sm"
                style={subtitleStyle}
              >
                {entry.subtitle}
              </div>
            ) : null}

{isStoryCard ? (
  <div className="mt-3 flex justify-center">
    {renderMedia(entry)}
  </div>
) : null}

{entry.description ? (
  <div
    className="mt-2 whitespace-normal break-words text-sm leading-relaxed"
    style={descriptionStyle}
  >
    {entry.description}
  </div>
) : null}

            {entry.ctaLabel ? (
              <a
                href={normalizePreviewHref(entry.ctaUrl || "#")}
                className="mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {entry.ctaLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full overflow-auto p-4" style={appearanceStyle}>
      {data.heading ? (
        <div className="mb-4 whitespace-normal break-words" style={headingStyle}>
          {data.heading}
        </div>
      ) : null}

      {isHorizontal ? (
        <div className="relative">
          {showConnector ? (
            <div
              className="absolute left-0 right-0 top-5 border-t"
              style={{
                borderColor: data.lineColor || "#CBD5E1",
                borderTopStyle: connectorBorderStyle,
                borderTopWidth: connectorThickness,
              }}
            />
          ) : null}

<div
  className="relative flex overflow-x-auto pb-2"
  style={{ gap: `${spacing}px` }}
>
            {orderedEntries.map((entry: any, index: number) => (
              <div
  key={entry.id || index}
  className="shrink-0 pt-10"
  style={{
    transform: getPlacementOffset(entry)
      ? `translateY(${getPlacementOffset(entry)}px)`
      : undefined,
  }}
>
                <div
                  className="absolute top-3 h-4 w-4 rounded-full border-2 bg-white"
                  style={{
                    borderColor: data.nodeColor || entry.accentColor || "#2563EB",
                  }}
                />
                {renderEntryCard(entry, index)}
              </div>
            ))}
          </div>
        </div>
      ) : isMemory ? (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${Math.min(cardWidth, 220)}px, 1fr))`,
            gap: `${spacing}px`,
          }}
        >
{orderedEntries.map((entry: any, index: number) => (
  <div
    key={entry.id || index}
    style={{
      transform: getPlacementOffset(entry)
        ? `translateY(${getPlacementOffset(entry)}px)`
        : undefined,
    }}
  >
    {renderEntryCard(entry, index)}
  </div>
))}
        </div>
      ) : (
        <div className="relative">
{showConnector ? (
  isJourney ? (
    renderJourneyPath()
  ) : (
    <div
      className="absolute bottom-0 top-0 w-0 border-l"
      style={{
        left: isAlternating ? "50%" : "20px",
        transform: "translateX(-50%)",
        borderColor: data.lineColor || "#CBD5E1",
        borderLeftStyle: connectorBorderStyle,
        borderLeftWidth: connectorThickness,
      }}
    />
  )
) : null}

          <div
  className={isJourney ? "relative" : "relative flex flex-col"}
  style={
    isJourney
      ? {
          display: "grid",
          gridTemplateColumns: `repeat(${journeyCardsPerRow}, ${cardWidth}px)`,
          justifyContent: "space-between",
          columnGap: `${spacing}px`,
          rowGap: `${Math.max(24, journeyConnectorHeight - 120)}px`,
          minHeight: `${Math.ceil(orderedEntries.length / journeyCardsPerRow) * journeyConnectorHeight + cardWidth}px`,
          position: "relative",
        }
      : { gap: `${spacing}px` }
  }
>
            {orderedEntries.map((entry: any, index: number) => {
            const rightSide = isAlternating && index % 2 === 1;
if (isJourney) {
  const segmentIndex = Math.floor(index / journeyCardsPerRow);
  const rawPositionInSegment = index % journeyCardsPerRow;
  const leftToRight = segmentIndex % 2 === 0;

  const visualColumn = leftToRight
    ? rawPositionInSegment + 1
    : journeyCardsPerRow - rawPositionInSegment;

  return (
    <div
      key={entry.id || index}
      className="relative flex justify-center"
      style={{
        gridColumn: visualColumn,
        gridRow: segmentIndex + 1,
      }}
    >
<div
  className="relative"
  style={{
    width: `${cardWidth}px`,
    transform: getPlacementOffset(entry)
  ? `translateY(${getPlacementOffset(entry)}px)`
  : undefined,
  }}
>
        <div
          className="absolute -top-2 left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 bg-white"
          style={{
            borderColor: data.nodeColor || entry.accentColor || "#2563EB",
          }}
        />

        {renderEntryCard(entry, index)}
      </div>
    </div>
  );
}

              if (isAlternating) {
                return (
                  <div
                    key={entry.id || index}
                    className="relative grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-start gap-4"
                    style={undefined}
                  >
<div className="flex min-w-0 justify-end">
  {!rightSide ? renderEntryCard(entry, index) : null}
</div>

<div className="relative z-10 flex justify-center pt-4">
                      <div
                        className="h-4 w-4 rounded-full border-2 bg-white"
                        style={{
                          borderColor: data.nodeColor || entry.accentColor || "#2563EB",
                        }}
                      />
                    </div>

<div className="flex min-w-0 justify-start">
  {rightSide ? renderEntryCard(entry, index) : null}
</div>
                  </div>
                );
              }

              return (
                <div
                  key={entry.id || index}
                  className="relative grid grid-cols-[40px_minmax(0,1fr)] items-start gap-4"
                >
                  <div className="relative z-10 flex justify-center pt-4">
                    <div
                      className="h-4 w-4 rounded-full border-2 bg-white"
                      style={{
                        borderColor: data.nodeColor || entry.accentColor || "#2563EB",
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    {renderEntryCard(entry, index)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function renderFrame(
  block: Extract<MicrositeBlock, { type: "frame" }>,
  onDownloadFrame?: (block: Extract<MicrositeBlock, { type: "frame" }>) => void,
) {
  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        data-frame-download-button="true"
        className="absolute right-2 top-2 z-20 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-neutral-700"
        onClick={(e) => {
          e.stopPropagation();
          onDownloadFrame?.(block);
        }}
      >
        Download
      </button>
    </div>
  );
}

function renderAudio(
  block: Extract<MicrositeBlock, { type: "audio" }>,
) {
  const audioUrl = block.data.audioUrl?.trim();

  if (!audioUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500">
        Add audio
      </div>
    );
  }

return (
  <div className="flex h-full w-full items-center justify-center">
    <audio
      controls={block.data.showPlayer !== false}
      autoPlay={Boolean(block.data.autoplay)}
      loop={Boolean(block.data.loop)}
      preload="auto"
      playsInline
      className="w-full"
      src={audioUrl}
    />
  </div>
);
}

function renderLinks(
  block: Extract<MicrositeBlock, { type: "links" }>,
  designKey?: string,
  previewMode = false,
  micrositeSlug?: string | null,
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

const normalizedHref = rawUrl ? normalizePreviewHref(rawUrl, micrositeSlug) : "";

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

function renderGalleryTile(
  image: any,
  index: number,
  options?: {
    showTitle?: boolean;
    showDescription?: boolean;
    showMetadata?: boolean;
    textPlacement?: "top" | "bottom";
    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    metadataStyle?: TextStyle;
    frameThickness?: number;
    frameColor?: string;
    onSelect?: () => void;
    isSelected?: boolean;
  },
) {
  const frameThickness = options?.frameThickness ?? 0;
  const frameColor = options?.frameColor ?? "#ffffff";
  const onSelect = options?.onSelect;
  const isSelected = Boolean(options?.isSelected);

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

  const href = String(image.href ?? "").trim();

  const title = String((image as any).title ?? "").trim();
  const description = String((image as any).description ?? "").trim();
  const metadata = String((image as any).metadata ?? "").trim();

  const titleStyle = ((image as any).titleStyle ??
    options?.titleStyle ??
    {}) as TextStyle;

  const descriptionStyle = ((image as any).descriptionStyle ??
    options?.descriptionStyle ??
    {}) as TextStyle;

  const metadataStyle = ((image as any).metadataStyle ??
    options?.metadataStyle ??
    {}) as TextStyle;

  const showTextPanel =
    (options?.showTitle && title) ||
    (options?.showDescription && description) ||
    (options?.showMetadata && metadata);

  const textPanel = showTextPanel ? (
    <div className="shrink-0 space-y-1 px-2 py-2">
      {options?.showTitle && title ? (
        <div
          className="text-sm font-semibold leading-tight"
          style={getContainerTextStyle(titleStyle)}
        >
          {title}
        </div>
      ) : null}

{options?.showDescription ? (
  <div
    className="text-xs leading-snug"
    style={{
      ...getContainerTextStyle(descriptionStyle),
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      minHeight: "2.6em",
      maxHeight: "2.6em",
    }}
  >
    {description}
  </div>
) : null}

      {options?.showMetadata && metadata ? (
        <div
          className="text-[11px] leading-tight opacity-75"
          style={getContainerTextStyle(metadataStyle)}
        >
          {metadata}
        </div>
      ) : null}
    </div>
  ) : null;

  const content = (
    <div
      onClick={onSelect}
      className={[
        "flex h-full w-full flex-col overflow-hidden transition",
        onSelect ? "cursor-pointer" : "",
        isSelected ? "ring-2 ring-blue-500" : "",
      ].join(" ")}
      style={{
        borderRadius,
        border:
          frameThickness > 0
            ? `${frameThickness}px solid ${frameColor || "#ffffff"}`
            : "0px solid transparent",
        backgroundColor:
          frameThickness > 0 ? frameColor || "#ffffff" : undefined,
      }}
    >
      {options?.textPlacement === "top" ? textPanel : null}

      <div className="min-h-0 flex-1 overflow-hidden" style={{ borderRadius }}>
        <img
          src={image.url}
          alt={image.alt || title || ""}
          className="h-full w-full object-cover"
          style={{ borderRadius }}
        />
      </div>

      {options?.textPlacement !== "top" ? textPanel : null}
    </div>
  );

  if (href) {
    return (
      <a
        key={image.id || image.url || `gallery-${index}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block h-full w-full"
      >
        {content}
      </a>
    );
  }

  return (
    <div key={image.id || image.url || `gallery-${index}`} className="h-full w-full">
      {content}
    </div>
  );
}

function EnrollmentLinkedGallery({
  block,
  designKey,
}: {
  block: Extract<MicrositeBlock, { type: "gallery" }>;
  designKey?: string;
}) {
  const [overrideImages, setOverrideImages] = useState<any[] | null>(null);

  useEffect(() => {
    function handleEnrollmentProfileUpdate(event: Event) {
      const customEvent =
        event as CustomEvent<EnrollmentBoardProfileEventDetail>;

      if (customEvent.detail?.linkedGalleryBlockId !== block.id) {
        return;
      }

      const columns = Math.max(1, Number(block.data.columns) || 2);
      const rows =
        typeof block.data.rows === "number" && block.data.rows > 0
          ? Math.max(1, Math.floor(block.data.rows))
          : 1;

      const maxImages = columns * rows;

      const nextImages = (customEvent.detail.entries ?? [])
        .filter((entry) => entry.profileImageUrl)
        .slice(0, maxImages)
        .map((entry) => ({
          id: entry.id,
          url: entry.profileImageUrl || "",
          alt: entry.name || "",
          caption: entry.name || "",
        }));

      setOverrideImages(nextImages);
    }

    window.addEventListener(
      ENROLLMENT_BOARD_PROFILE_EVENT,
      handleEnrollmentProfileUpdate,
    );

    return () => {
      window.removeEventListener(
        ENROLLMENT_BOARD_PROFILE_EVENT,
        handleEnrollmentProfileUpdate,
      );
    };
  }, [block.id, block.data.columns, block.data.rows]);

  return renderGalleryBase(block, designKey, overrideImages);
}

function renderGalleryBase(
  block: Extract<MicrositeBlock, { type: "gallery" }>,
  designKey?: string,
  overrideImages?: any[] | null,
) {
  const columns = Math.max(1, Number(block.data.columns) || 2);
  const images = overrideImages ?? block.data.images ?? [];

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

  const columnGap = Math.max(0, Number((block.data as any).columnGap ?? 8));
  const rowGap = Math.max(0, Number((block.data as any).rowGap ?? 8));
  const frameThickness = Math.max(
    0,
    Number((block.data as any).frameThickness ?? 0),
  );
  const frameColor = String((block.data as any).frameColor ?? "#ffffff");

  const translateX = (positionX - 50) * 2;
  const translateY = (positionY - 50) * 2;

  const showTitle = Boolean((block.data as any).showTitle);
  const showDescription = Boolean((block.data as any).showDescription);
  const showMetadata = Boolean((block.data as any).showMetadata);
  const textPlacement =
    (block.data as any).textPlacement === "top" ? "top" : "bottom";

  const titleStyle = ((block.data as any).titleStyle ?? {}) as TextStyle;
  const descriptionStyle = ((block.data as any).descriptionStyle ??
    {}) as TextStyle;
  const metadataStyle = ((block.data as any).metadataStyle ?? {}) as TextStyle;

  return (
    <div
      className="h-full w-full overflow-hidden p-2"
      style={{
        ...getAppearanceStyle(block),
        ...getTextureBorderStyle(block.appearance),
      }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          columnGap,
          rowGap,
          transform: `translate(${translateX}%, ${translateY}%)`,
          transformOrigin: "center center",
        }}
      >
        {Array.from({ length: tileCount }).map((_, index) =>
          renderGalleryTile(images[index], index, {
            showTitle,
            showDescription,
            showMetadata,
            textPlacement,
            titleStyle,
            descriptionStyle,
            metadataStyle,
            frameThickness,
            frameColor,
          }),
        )}
      </div>
    </div>
  );
}

function renderGallery(
  block: Extract<MicrositeBlock, { type: "gallery" }>,
  designKey?: string,
) {
  return <EnrollmentLinkedGallery block={block} designKey={designKey} />;
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
  const styleVariant = block.data.styleVariant ?? "standard";

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
  const attendingOptions = (block.data.attendingOptions?.length
  ? block.data.attendingOptions
  : ["Yes", "No"]
)
  .map((option) => option.trim())
  .filter(Boolean)
  .slice(0, 8);

if (!attendingOptions.length) {
  attendingOptions.push("Yes");
}
  const attendingDisplay = block.data.attendingDisplay !== false;
  const attendingDefaultValue =
    block.data.attendingDefaultValue || attendingOptions[0] || "Yes";
  const showAttendingInForm = attendingDisplay && !hidden.has("attending");

  const mealLabel = block.data.mealLabel || "Meal Selection";
  const mealOptions = (block.data.mealOptions?.length
  ? block.data.mealOptions
  : ["Chicken", "Salmon"]
)
  .map((option) => option.trim())
  .filter(Boolean)
  .slice(0, 8);

if (!mealOptions.length) {
  mealOptions.push("Chicken");
}
  const mealDisplay = block.data.mealDisplay !== false;
  const mealDefaultValue =
  block.data.mealDefaultValue && mealOptions.includes(block.data.mealDefaultValue)
    ? block.data.mealDefaultValue
    : mealOptions[0] || "Chicken";
  const showMealInForm = mealDisplay && !hidden.has("meal");

  const guestLabel = block.data.guestLabel || "Guest";
  const guestOptions = (block.data.guestOptions?.length
  ? block.data.guestOptions
  : ["Yes", "No"]
)
  .map((option) => option.trim())
  .filter(Boolean)
  .slice(0, 8);

if (!guestOptions.length) {
  guestOptions.push("Yes");
}
  const guestDisplay = block.data.guestDisplay !== false;
  const guestDefaultValue = block.data.guestDefaultValue || guestOptions[1] || "No";
  const showGuestInForm =
    guestDisplay &&
    !hidden.has("guestToggle") &&
    !hidden.has("guestCount") &&
    !hidden.has("guestName");

  const commentsLabel = block.data.commentsLabel || "Additional Comments";
  const commentsPlaceholder =
    block.data.commentsPlaceholder || "Share any notes, song requests, or details.";
  const commentsDisplay = block.data.commentsDisplay !== false;
  const commentsDefaultValue = block.data.commentsDefaultValue || "";
  const showCommentsInForm = commentsDisplay && !hidden.has("comments");

const helperText =
  block.data.helperText || "Please let us know if you’ll be joining us.";
const replyByText = block.data.replyByText || "Reply by May 12";
const replyByDisplay = block.data.replyByDisplay !== false;
const confirmationTitle =
  block.data.confirmationTitle || "Thank you — your RSVP has been received.";
const confirmationMessage =
  block.data.confirmationMessage || "We’re excited to celebrate with you.";

const submitButtonText = block.data.submitButtonText || "Submit RSVP →";
const buttonLayout = block.data.buttonLayout ?? "full";
const buttonShape = block.data.buttonShape ?? "rounded";
const buttonVariant = block.data.buttonVariant ?? "solid";
const buttonUppercase = block.data.buttonUppercase ?? false;
const useChoiceCards = block.data.useChoiceCards ?? true;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isAttending, setIsAttending] = useState(
    attendingDefaultValue === attendingOptions[0],
  );
  const [mealChoice, setMealChoice] = useState(mealDefaultValue);
  const [bringingGuest, setBringingGuest] = useState(
    guestDefaultValue === guestOptions[0],
  );
  const [guestCount, setGuestCount] = useState(
    guestDefaultValue === guestOptions[0] ? Math.max(guestMin, 1) : 0,
  );
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [comments, setComments] = useState(commentsDefaultValue);
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

const attendingYesValue = attendingOptions[0] ?? "Yes";
const attendingNoValue = attendingOptions[1] ?? "No";
const guestYesValue = guestOptions[0] ?? "Yes";
const guestNoValue = guestOptions[1] ?? "No";

const isCurrentlyAttending = showAttendingInForm
  ? isAttending
  : attendingDefaultValue === attendingYesValue;

const isCurrentlyBringingGuest = showGuestInForm
  ? bringingGuest
  : guestDefaultValue === guestYesValue;

  const variantClassMap: Record<string, string> = {
    standard:
      "border-neutral-200 bg-white text-neutral-900 shadow-[0_18px_60px_rgba(15,23,42,0.10)]",
    elegant_wedding:
      "border-[#e6dcc8] bg-[#fffaf0] text-[#30291f] shadow-[0_24px_70px_rgba(120,97,60,0.14)]",
    modern_minimal:
      "border-neutral-200 bg-white text-neutral-950 shadow-sm",
    glassmorphism:
      "border-white/35 bg-white/45 text-neutral-950 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl",
    luxury_black:
      "border-[#bfa46a]/50 bg-[#11100d] text-[#fff8e8] shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
    editorial_magazine:
      "border-neutral-900 bg-white text-neutral-950 shadow-[10px_10px_0_rgba(0,0,0,0.10)]",
    floral_invitation:
      "border-pink-100 bg-[#fff7f5] text-[#3f2a2a] shadow-[0_20px_60px_rgba(190,120,130,0.16)]",
    bold_event:
      "border-transparent bg-gradient-to-br from-fuchsia-600 via-rose-500 to-orange-400 text-white shadow-[0_24px_80px_rgba(225,29,72,0.30)]",
    luxury_invitation:
      "border-[#d8c08d] bg-[#fbf6ea] text-[#2d2418] shadow-[0_24px_80px_rgba(122,89,38,0.16)]",
    soft_pastel:
      "border-pink-100 bg-gradient-to-br from-pink-50 via-violet-50 to-sky-50 text-neutral-900 shadow-[0_24px_70px_rgba(147,113,160,0.16)]",
    dark_neon:
      "border-cyan-300/60 bg-[#080b16] text-white shadow-[0_0_45px_rgba(34,211,238,0.22)]",
    ticket_style:
      "border-dashed border-neutral-300 bg-white text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.12)]",
    timeline_rsvp:
      "border-neutral-200 bg-white text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.12)]",
    split_layout:
      "border-neutral-200 bg-white text-neutral-950 shadow-[0_24px_70px_rgba(15,23,42,0.14)]",
    floating_panels:
      "border-white bg-neutral-50 text-neutral-950 shadow-[0_28px_90px_rgba(15,23,42,0.18)]",
    formal_banquet:
      "border-[#c7a76c]/60 bg-[#111827] text-[#fff8e8] shadow-[0_24px_80px_rgba(15,23,42,0.35)]",
  };

  const darkVariant =
    styleVariant === "luxury_black" ||
    styleVariant === "dark_neon" ||
    styleVariant === "formal_banquet" ||
    styleVariant === "bold_event";

  function getStyle(key: string) {
    const entry = styles[key as keyof typeof styles];
    return {
      ...(entry?.textStyle ? getContainerTextStyle(entry.textStyle, designKey) : {}),
      ...(entry?.backgroundColor ? { backgroundColor: entry.backgroundColor } : {}),
    };
  }

  function sectionClass() {
    return darkVariant
      ? "rounded-2xl border border-white/15 bg-white/10 p-4"
      : "rounded-2xl border border-black/10 bg-white/70 p-4";
  }

  function inputClass() {
    return darkVariant
      ? "relative z-10 block min-h-[50px] w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/45"
      : "relative z-10 block min-h-[50px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400";
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
      const res = await fetch("/api/public/rsvp", {
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
          isAttending: isCurrentlyAttending,
          mealChoice: isCurrentlyAttending
            ? showMealInForm
              ? mealChoice
              : mealDefaultValue
            : "",
bringingGuest: isCurrentlyBringingGuest,
guestCount: isCurrentlyAttending && isCurrentlyBringingGuest ? guestCount : 0,
          guestName: isCurrentlyBringingGuest
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
setSubmitMessage(`${confirmationTitle} ${confirmationMessage}`.trim());
      setFirstName("");
      setLastName("");
      setEmail("");
      setAddress("");
      setIsAttending(attendingDefaultValue === attendingOptions[0]);
      setMealChoice(mealDefaultValue);
setBringingGuest(guestDefaultValue === guestYesValue);
setGuestCount(guestDefaultValue === guestYesValue ? Math.max(guestMin, 1) : 0);
      setGuestNames([]);
      setComments(commentsDefaultValue);
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
            <svg viewBox="0 0 100 100" className="block h-full w-full">
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
          className={`block h-28 w-28 border border-neutral-200 object-cover ${getFrameClass(
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
    return (
      <input
        key={key}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass()}
        style={{ ...getStyle(key), textAlign: "left" }}
      />
    );
  }

  function renderTextarea(
    key: string,
    placeholder: string,
    value: string,
    onChange: (value: string) => void,
  ) {
    return (
      <textarea
        key={key}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass()} min-h-[120px] resize-none`}
        style={{ ...getStyle(key), textAlign: "left" }}
        rows={4}
      />
    );
  }

  function renderFieldLabel(key: string, text: string) {
    return (
      <div
        key={key}
        className={darkVariant ? "text-sm font-semibold text-white/90" : "text-sm font-semibold text-neutral-800"}
        style={getStyle(key)}
      >
        {text}
      </div>
    );
  }

  function renderChoiceSection(
    key: string,
    label: string,
    options: string[],
    value: string,
    onChange: (value: string) => void,
  ) {
    return (
      <div key={key} className={sectionClass()}>
        <div className="mb-3 text-sm font-semibold" style={getStyle(key)}>
          {label}
        </div>

        {useChoiceCards ? (
          <div className="relative z-10 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((option) => {
              const selected = value === option;

              return (
                <button
                  key={`${key}-${option}`}
                  type="button"
                  onClick={() => onChange(option)}
                  className={[
                    "min-h-[46px] rounded-2xl border px-4 py-3 text-left text-sm font-medium transition duration-200",
                    "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
                    selected
                      ? darkVariant
                        ? "border-white bg-white text-neutral-950 shadow-lg"
                        : "border-neutral-950 bg-neutral-950 text-white shadow-lg"
                      : darkVariant
                        ? "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400",
                  ].join(" ")}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="relative z-10 flex flex-wrap gap-4">
            {options.map((option) => (
              <label
                key={`${key}-${option}`}
                className={
                  darkVariant
                    ? "inline-flex items-center gap-2 text-sm text-white/85"
                    : "inline-flex items-center gap-2 text-sm text-neutral-800"
                }
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
        )}
      </div>
    );
  }

  function renderGuestCount() {
    return (
      <div key="guestCount" className={sectionClass()} style={getStyle("guestCount")}>
        <div className="mb-3 text-sm font-semibold">Guest Count</div>

        <div className="inline-flex items-center gap-3 rounded-2xl border border-current/15 bg-white/10 px-3 py-2">
          <button
            type="button"
            onClick={() =>
              setGuestCount((current) => {
                const next = Math.max(0, current - 1);
                setGuestNames((prev) => prev.slice(0, next));

                if (next === 0) setBringingGuest(false);

                return next;
              })
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-current/20 text-base"
          >
            -
          </button>

          <div className="min-w-[68px] text-center text-sm">{guestCount}</div>

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
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-current/20 text-base"
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

      case "icon":
        return null;

      case "heading":
        return (
          <div key="heading" className="space-y-2 text-center">
            <div
              className="text-2xl font-semibold tracking-tight"
              style={getStyle("heading")}
            >
              {block.data.heading || "RSVP"}
            </div>
{helperText ? (
  <div className={darkVariant ? "text-sm text-white/65" : "text-sm text-neutral-500"}>
    {helperText}
  </div>
) : null}

{replyByDisplay && replyByText ? (
  <div
    className={
      darkVariant
        ? "mx-auto inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80"
        : "mx-auto inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700"
    }
  >
    {replyByText}
  </div>
) : null}
          </div>
        );

      case "nameLabel":
        if (block.data.nameDisplay === false) return null;

        return renderFieldLabel(
          "nameLabel",
          block.data.contactLabel || "Contact Details",
        );

      case "firstName":
        if (block.data.nameDisplay === false) return null;

        return renderField(
          "firstName",
          block.data.firstNamePlaceholder || "First Name",
          firstName,
          setFirstName,
        );

      case "lastName":
        if (block.data.nameDisplay === false) return null;

        return renderField(
          "lastName",
          block.data.lastNamePlaceholder || "Last Name",
          lastName,
          setLastName,
        );

      case "email":
        if (block.data.emailDisplay === false) return null;

        return renderField(
          "email",
          block.data.emailPlaceholder || "Email Address",
          email,
          setEmail,
          "email",
        );

      case "address":
        if (block.data.addressDisplay === false) return null;

        return renderField(
          "address",
          block.data.addressPlaceholder || "Mailing Address",
          address,
          setAddress,
        );

      case "attending":
        if (!showAttendingInForm) return null;

        return renderChoiceSection(
          "attending",
          attendingLabel,
          attendingOptions,
isAttending ? attendingYesValue : attendingNoValue,
(next) => setIsAttending(next === attendingYesValue),
        );

      case "meal":
        if (!showMealInForm || !isCurrentlyAttending) return null;

        return renderChoiceSection("meal", mealLabel, mealOptions, mealChoice, setMealChoice);

      case "guestToggle":
        if (!showGuestInForm || !isCurrentlyAttending) return null;

        return renderChoiceSection(
          "guestToggle",
          guestLabel,
          guestOptions,
bringingGuest ? guestYesValue : guestNoValue,
(next) => {
  const yes = next === guestYesValue;
            setBringingGuest(yes);

            const nextCount = yes ? Math.max(1, guestMin) : 0;
            setGuestCount(nextCount);
            setGuestNames(yes ? Array.from({ length: nextCount }, () => "") : []);
          },
        );

      case "guestCount":
        if (!showGuestInForm || !isCurrentlyAttending || !bringingGuest) return null;
        return renderGuestCount();

      case "guestName":
        if (!showGuestInForm || !isCurrentlyAttending || !bringingGuest || guestCount <= 0) {
          return null;
        }

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
                className={inputClass()}
                style={getStyle("guestName")}
              />
            ))}
          </div>
        );

      case "comments":
        if (!showCommentsInForm) return null;

        return (
          <div key="comments" className={sectionClass()}>
            <div
              className="mb-3 text-sm font-semibold"
              style={getStyle("comments")}
            >
              {commentsLabel}
            </div>
            {renderTextarea("comments", commentsPlaceholder, comments, setComments)}
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
  className={
    block.appearance?.backgroundColor === "transparent"
      ? "h-full overflow-hidden bg-transparent"
      : `${getSoftSurfaceClass(designKey)} h-full overflow-hidden`
  }
>
  <form
        onSubmit={handleSubmit}
className={[
  "mx-auto flex h-full w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-[24px] border p-6 sm:p-8",
  block.appearance?.backgroundColor === "transparent"
    ? "border-transparent bg-transparent shadow-none"
    : variantClassMap[styleVariant] ?? variantClassMap.standard,
].join(" ")}
      >
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />

        {(() => {
          const rendered: React.ReactNode[] = [];

          const showContactSection =
            block.data.nameDisplay !== false ||
            block.data.emailDisplay !== false ||
            block.data.addressDisplay !== false;

          if (showContactSection) {
            rendered.push(
              <div
                key="contact-details-card"
                className={
                  darkVariant
                    ? "space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
                    : "space-y-4 rounded-[28px] border border-neutral-200 bg-neutral-50/80 p-5"
                }
              >
                {renderElement("nameLabel")}

                {block.data.nameDisplay !== false ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {renderElement("firstName")}
                    {renderElement("lastName")}
                  </div>
                ) : null}

                {block.data.emailDisplay !== false
                  ? renderElement("email")
                  : null}

                {block.data.addressDisplay !== false
                  ? renderElement("address")
                  : null}
              </div>,
            );
          }

          order.forEach((key) => {
            if (
              key === "nameLabel" ||
              key === "firstName" ||
              key === "lastName" ||
              key === "email" ||
              key === "address"
            ) {
              return;
            }

            if (hidden.has(key as any)) return;

            rendered.push(renderElement(key));
          });

          return rendered;
        })()}

        <button
          type="submit"
          disabled={submitting}
className={[
  "inline-flex min-h-[52px] items-center justify-center px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
  buttonLayout === "full" ? "w-full" : "w-fit self-center",
  buttonShape === "pill"
    ? "rounded-full"
    : buttonShape === "square"
      ? "rounded-none"
      : "rounded-2xl",
  buttonUppercase ? "uppercase tracking-[0.18em]" : "",
  buttonVariant === "outline"
    ? darkVariant
      ? "border border-white/35 bg-transparent text-white hover:bg-white/10"
      : "border border-neutral-950 bg-transparent text-neutral-950 hover:bg-neutral-950 hover:text-white"
    : buttonVariant === "gradient"
      ? "border border-transparent bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-400 text-white hover:opacity-90"
      : darkVariant
        ? "bg-white text-neutral-950 hover:bg-white/90"
        : "bg-neutral-950 text-white hover:bg-neutral-800",
].join(" ")}
        >
          {submitting ? "Submitting..." : submitButtonText}
        </button>

        {submitState === "success" ? (
          <div
            className={
              darkVariant
                ? "rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100"
                : "rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            }
          >
            {submitMessage}
          </div>
        ) : null}

        {submitState === "error" ? (
          <div
            className={
              darkVariant
                ? "rounded-2xl border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100"
                : "rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            }
          >
            {submitMessage || "Failed to submit RSVP."}
          </div>
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
      attachments: Array.isArray((message as any).attachments)
        ? (message as any).attachments
        : [],
      votes: typeof message.votes === "number" ? message.votes : 0,
      userVote: 0,
    }));
  }

  return [
    {
      id: "sample-1",
      name: block.data.allowAnonymous ? "Anon" : "Jordan",
      message: "Looking forward to this.",
      attachments: [],
      votes: 3,
      userVote: 0,
    },
    {
      id: "sample-2",
      name: block.data.allowAnonymous ? "Anon" : "Taylor",
      message: "Can’t wait to join the conversation.",
      attachments: [],
      votes: 2,
      userVote: 0,
    },
    {
      id: "sample-3",
      name: block.data.allowAnonymous ? "Anon" : "Morgan",
      message: "Following for updates.",
      attachments: [],
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

    const attachments = Array.isArray(message.attachments)
      ? message.attachments.filter(
          (item: any) =>
            item &&
            typeof item.id === "string" &&
            (item.type === "image" ||
              item.type === "gif" ||
              item.type === "video" ||
              item.type === "audio") &&
            typeof item.name === "string" &&
            typeof item.mimeType === "string" &&
            typeof item.sizeBytes === "number" &&
            (typeof item.dataUrl === "string" || typeof item.url === "string"),
        )
      : [];

    return {
      id,
      name: String(message.author_name ?? message.name ?? "Guest"),
      message: String(message.message_text ?? message.message ?? ""),
      attachments,
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


function renderPostBoard(
  block: Extract<MicrositeBlock, { type: "post_board" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  const posts = Array.isArray(block.data.posts) ? block.data.posts : [];

  const defaultPostBoardTextStyle = {
    fontFamily: "inherit",
    fontSize: 14,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "left",
    color: "#111827",
  } as any;

  const blockStyle = {
    ...defaultPostBoardTextStyle,
    ...((block.data as any).style ?? {}),
  } as any;

  const blockHeadingStyle = {
    ...defaultPostBoardTextStyle,
    fontSize: 16,
    bold: true,
    color: "#111827",
    ...((block.data as any).blockHeadingStyle ?? {}),
  } as any;

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 16,
    ...((block.data as any).cardStyle ?? {}),
  } as any;

  const headingStyle = {
    ...defaultPostBoardTextStyle,
    fontSize: 14,
    bold: true,
    color: "#111827",
    ...((block.data as any).headingStyle ?? {}),
  } as any;

  const bodyStyle = {
    ...defaultPostBoardTextStyle,
    fontSize: 14,
    color: "#374151",
    ...((block.data as any).bodyStyle ?? {}),
  } as any;

  const buttonStyle = {
    ...defaultPostBoardTextStyle,
    fontSize: 12,
    bold: true,
    color: "#374151",
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 999,
    ...((block.data as any).buttonStyle ?? {}),
  } as any;

  const avatarStyle = {
  size: 36,
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: 12,
  bold: true,
  ...((block.data as any).avatarStyle ?? {}),
} as any;

const metaStyle = {
  fontFamily: "Inter",
  fontSize: 11,
  color: "#6b7280",
  bold: false,
  ...((block.data as any).metaStyle ?? {}),
} as any;

const actionButtonStyle = {
  height: 22,
  minWidth: 42,
  fontSize: 10,
  color: "#111827",
  backgroundColor: "#ffffff",
  borderColor: "#e5e7eb",
  borderWidth: 1,
  borderRadius: 999,
  ...((block.data as any).actionButtonStyle ?? {}),
} as any;

  const interactionMode = block.data.interactionMode ?? "announcement";
  const isCommunityBoard = interactionMode === "community";

  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [communityReplies, setCommunityReplies] = useState<Record<string, any[]>>({});
  const [communityLoading, setCommunityLoading] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostError, setNewPostError] = useState("");

  const [newPostForm, setNewPostForm] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    title: "",
    message: "",
  });

  const [replyForms, setReplyForms] = useState<
    Record<
      string,
      {
        name: string;
        email: string;
        avatarUrl: string;
        message: string;
      }
    >
  >({});

useEffect(() => {
  if (!isCommunityBoard || !micrositeId) return;

  let cancelled = false;

  async function loadCommunityBoard() {
    try {
      setCommunityLoading(true);

const params = new URLSearchParams({
  micrositeId: micrositeId ?? "",
  blockId: block.id,
});

      const res = await fetch(
        `/api/public/post-board/community?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load community board.");
      }

      if (cancelled) return;

      const mappedPosts = Array.isArray(data.posts)
        ? data.posts.map((post: any) => ({
            id: post.post_id,
            title: post.title,
            subtitle: "Community post",
            message: post.message,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            ownerDisplayName: post.author_name,
            ownerAvatarUrl: post.author_avatar_url ?? "",
            authorName: post.author_name,
            authorEmail: post.author_email ?? "",
            authorAvatarUrl: post.author_avatar_url ?? "",
            contactInfoConfirmed: Boolean(post.contact_info_confirmed),
            isOwnerPost: false,
            pinned: Boolean(post.pinned),
            likeCount: Number(post.like_count ?? 0),
            messageCount: Number(post.message_count ?? 0),
          }))
        : [];

      const mappedReplies: Record<string, any[]> = {};

      if (Array.isArray(data.replies)) {
        data.replies.forEach((reply: any) => {
          const postId = String(reply.post_id ?? "");

          if (!postId) return;

          mappedReplies[postId] = [
            ...(mappedReplies[postId] ?? []),
            {
              id: reply.reply_id,
              postId,
              sourcePostId: postId,
              sourcePostTitle: reply.source_post_title,
              name: reply.author_name,
              email: reply.author_email ?? "",
              avatarUrl: reply.author_avatar_url ?? "",
              message: reply.message,
              contactInfoConfirmed: Boolean(reply.contact_info_confirmed),
              createdAt: reply.created_at,
            },
          ];
        });
      }

      setCommunityPosts(mappedPosts);
      setCommunityReplies(mappedReplies);
    } catch {
      // fallback to draft data
    } finally {
      if (!cancelled) {
        setCommunityLoading(false);
      }
    }
  }

  void loadCommunityBoard();

  return () => {
    cancelled = true;
  };
}, [isCommunityBoard, micrositeId, block.id]);

  const maxMessageLength =
    typeof block.data.maxMessageLength === "number"
      ? Math.max(50, Math.min(1000, block.data.maxMessageLength))
      : 300;

  const maxVisibleReplies =
    typeof block.data.maxVisibleReplies === "number"
      ? Math.max(1, Math.min(100, block.data.maxVisibleReplies))
      : 10;

  const allPosts = isCommunityBoard ? communityPosts : posts;

  const sortedPosts = [...allPosts].sort((a, b) => {
    if (block.data.showPinnedPostsFirst !== false) {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) {
        return Boolean(a.pinned) ? -1 : 1;
      }
    }

    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();

    return bTime - aTime;
  });

  function formatPostTime(value?: string) {
    const time = value ? new Date(value).getTime() : 0;

    if (!time || Number.isNaN(time)) return "Just now";

    const diffMs = Date.now() - time;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  }

  function getPostInitials(name?: string) {
    const safeName = typeof name === "string" && name.trim() ? name.trim() : "Owner";

    return safeName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  function getYouTubeEmbedUrl(url?: string) {
    if (!url) return "";

    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace("www.", "");

      let videoId = "";

      if (host === "youtube.com" || host === "m.youtube.com") {
        videoId =
          parsed.searchParams.get("v") ||
          parsed.pathname.match(/^\/shorts\/([^/?#]+)/)?.[1] ||
          parsed.pathname.match(/^\/embed\/([^/?#]+)/)?.[1] ||
          "";
      }

      if (host === "youtu.be") {
        videoId = parsed.pathname.replace("/", "").split("?")[0];
      }

      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
        : "";
    } catch {
      return "";
    }
  }

  function getPostMessage(message?: string) {
    const safeMessage = typeof message === "string" ? message : "";

    if (safeMessage.length <= maxMessageLength) return safeMessage;

    return `${safeMessage.slice(0, maxMessageLength).trim()}…`;
  }

  function getPostBoardBoxStyle(style?: {
    backgroundColor?: string;
    backgroundOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  }) {
    function postBoardWithOpacity(color?: string, opacity?: number) {
      if (!color) return undefined;
      if (color === "transparent") return "transparent";

      const safeOpacity =
        typeof opacity === "number" && Number.isFinite(opacity)
          ? Math.max(0, Math.min(1, opacity))
          : 1;

      if (!color.startsWith("#")) return color;

      const hex = color.replace("#", "");
      const fullHex =
        hex.length === 3
          ? hex
              .split("")
              .map((char) => `${char}${char}`)
              .join("")
          : hex;

      const r = parseInt(fullHex.slice(0, 2), 16);
      const g = parseInt(fullHex.slice(2, 4), 16);
      const b = parseInt(fullHex.slice(4, 6), 16);

      if ([r, g, b].some((value) => Number.isNaN(value))) return color;

      return `rgba(${r}, ${g}, ${b}, ${safeOpacity})`;
    }

    return {
      backgroundColor: postBoardWithOpacity(
        style?.backgroundColor,
        style?.backgroundOpacity,
      ),
      borderColor: style?.borderColor || undefined,
      borderWidth:
        typeof style?.borderWidth === "number"
          ? `${style.borderWidth}px`
          : undefined,
      borderRadius:
        typeof style?.borderRadius === "number"
          ? `${style.borderRadius}px`
          : undefined,
    };
  }

  const isCompact = block.data.variant === "compact";
  const isFeature = block.data.variant === "feature";

  async function handleLikePost(postId: string, fallbackCount: number) {
    if (likeLoading[postId] || likedPosts[postId]) return;

    const currentCount = likeCounts[postId] ?? fallbackCount ?? 0;

    setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    setLikeCounts((prev) => ({ ...prev, [postId]: currentCount + 1 }));

    if (!micrositeId) {
      return;
    }

    try {
      setLikeLoading((prev) => ({ ...prev, [postId]: true }));

      const res = await fetch("/api/public/post-board/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          micrositeId,
          blockId: block.id,
          postId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to like post.");
      }

      setLikedPosts((prev) => ({ ...prev, [postId]: true }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]:
          typeof data.likeCount === "number" ? data.likeCount : currentCount + 1,
      }));
    } catch {
      setLikedPosts((prev) => ({ ...prev, [postId]: false }));
      setLikeCounts((prev) => ({ ...prev, [postId]: currentCount }));
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }

async function handleCreateCommunityPost() {
  const name = newPostForm.name.trim();
  const email = newPostForm.email.trim();
  const title = newPostForm.title.trim();
  const message = newPostForm.message.trim();
  const avatarUrl = newPostForm.avatarUrl.trim();

  setNewPostError("");

  if (!name || !title || !message) {
    setNewPostError("Please add your name, discussion title, and message.");
    return;
  }

  if ((block.data.requireCommunityPostEmail ?? true) && !email) {
    setNewPostError("Email is required to start a discussion. It will not be shown publicly.");
    return;
  }

  const postId = `community_post_${Date.now()}`;

  const optimisticPost = {
    id: postId,
    title,
    subtitle: "Community post",
    message,
    createdAt: new Date().toISOString(),
    ownerDisplayName: name,
    ownerAvatarUrl: avatarUrl,
    authorName: name,
    authorEmail: email,
    authorAvatarUrl: avatarUrl,
    contactInfoConfirmed: Boolean(email),
    isOwnerPost: false,
    pinned: false,
    likeCount: 0,
    messageCount: 0,
  };

  setCommunityPosts((prev) => [optimisticPost, ...prev]);

  setNewPostForm({
    name: "",
    email: "",
    avatarUrl: "",
    title: "",
    message: "",
  });

  setShowNewPostForm(false);

  if (!micrositeId) return;

  try {
    const res = await fetch("/api/public/post-board/community", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create_post",
        micrositeId,
        blockId: block.id,
        postId,
        authorName: name,
        authorEmail: email,
        authorAvatarUrl: avatarUrl,
        title,
        message,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to save community post.");
    }
  } catch {
    // Keep optimistic preview behavior even if persistence fails.
  }
}

async function handleCreateReply(post: any) {
  const form = replyForms[post.id] ?? {
    name: "",
    email: "",
    avatarUrl: "",
    message: "",
  };

  const name = form.name.trim();
  const email = form.email.trim();
  const avatarUrl = form.avatarUrl.trim();
  const message = form.message.trim();

  if (!name || !message) return;

  const replyId = `reply_${Date.now()}`;

  const reply = {
    id: replyId,
    postId: post.id,
    sourcePostId: post.id,
    sourcePostTitle: post.title || "Untitled post",
    name,
    email,
    avatarUrl,
    message,
    contactInfoConfirmed: Boolean(email),
    createdAt: new Date().toISOString(),
  };

  setCommunityReplies((prev) => ({
    ...prev,
    [post.id]: [...(prev[post.id] ?? []), reply],
  }));

  setCommunityPosts((prev) =>
    prev.map((entry) =>
      entry.id === post.id
        ? {
            ...entry,
            messageCount: Number(entry.messageCount ?? 0) + 1,
          }
        : entry,
    ),
  );

  setReplyForms((prev) => ({
    ...prev,
    [post.id]: {
      name: "",
      email: "",
      avatarUrl: "",
      message: "",
    },
  }));

  setExpandedPostId(null);

  if (!micrositeId) return;

  try {
    const res = await fetch("/api/public/post-board/community", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create_reply",
        micrositeId,
        blockId: block.id,
        replyId,
        postId: post.id,
        sourcePostTitle: post.title || "Untitled post",
        sourcePostAuthorEmail:
          typeof post.authorEmail === "string" ? post.authorEmail : "",
        shouldNotifyPostAuthor:
          block.data.notifyPostAuthorOnReply !== false &&
          Boolean(post.authorEmail),
        authorName: name,
        authorEmail: email,
        authorAvatarUrl: avatarUrl,
        message,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to save reply.");
    }
  } catch {
    // Keep optimistic preview behavior even if persistence fails.
  }
}

  return (
    <Surface
      block={block}
      designKey={designKey}
      className={`${getSoftSurfaceClass(designKey)} overflow-y-auto`}
      styleOverride={getPostBoardBoxStyle(block.appearance as any)}
    >
{block.data.showHeading !== false ? (
  <div
    className={isFeature ? "text-xl font-bold" : "text-base font-semibold"}
    style={getContainerTextStyle(blockHeadingStyle, designKey)}
  >
    {block.data.heading || "Updates"}
  </div>
) : null}

      {block.data.showSubtitle !== false ? (
        <div
          className={`mt-1 ${isFeature ? "text-sm" : "text-xs"} ${getMutedTextClass(
            designKey,
          )}`}
          style={getContainerTextStyle(blockStyle, designKey)}
        >
          {block.data.subtitle || "Latest announcements and posts"}
        </div>
      ) : null}

{isCommunityBoard && showNewPostForm ? (
  <div
    className={[
      "relative z-20 mt-4 rounded-xl border p-3 pointer-events-auto",
      isLightDesign(designKey)
        ? "border-neutral-200 bg-white"
        : "border-white/10 bg-white/5",
    ].join(" ")}
    onMouseDown={(e) => e.stopPropagation()}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="text-sm font-semibold">Start a discussion</div>

    <div className="mt-3 grid grid-cols-1 gap-2">
      <input
        type="text"
        value={newPostForm.name}
        onChange={(e) =>
          setNewPostForm((prev) => ({ ...prev, name: e.target.value }))
        }
        className="h-10 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900"
        placeholder="Your name"
      />

      <input
        type="email"
        value={newPostForm.email}
        onChange={(e) =>
          setNewPostForm((prev) => ({ ...prev, email: e.target.value }))
        }
        className="h-10 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900"
        placeholder="Your email (privately stored)"
      />

      <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700">
        Choose Profile Image
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = () => {
              setNewPostForm((prev) => ({
                ...prev,
                avatarUrl: typeof reader.result === "string" ? reader.result : "",
              }));
            };

            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
      </label>

      {newPostForm.avatarUrl ? (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <img
            src={newPostForm.avatarUrl}
            alt="Selected profile"
            className="h-8 w-8 rounded-full object-cover"
          />
          Profile image selected
        </div>
      ) : null}

      <input
        type="text"
        value={newPostForm.title}
        onChange={(e) =>
          setNewPostForm((prev) => ({ ...prev, title: e.target.value }))
        }
        className="h-10 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900"
        placeholder="Discussion title"
      />

      <textarea
        value={newPostForm.message}
        onChange={(e) =>
          setNewPostForm((prev) => ({ ...prev, message: e.target.value }))
        }
        className="min-h-[84px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        placeholder="Start the conversation..."
      />

      <div className="text-[11px] text-neutral-500">
        Email is required and never shown publicly. It is stored privately and can be used for reply notifications.
      </div>

      {newPostError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {newPostError}
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white"
          onClick={handleCreateCommunityPost}
        >
          Post Discussion
        </button>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700"
          onClick={() => {
            setShowNewPostForm(false);
            setNewPostError("");
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
) : null}

      <div
        className={
          block.data.showHeading !== false ||
          block.data.showSubtitle !== false ||
          isCommunityBoard
            ? "mt-4"
            : ""
        }
      >
        {sortedPosts.length ? (
          <div className={isCompact ? "space-y-2" : "space-y-3"}>
            {sortedPosts.map((post) => {
              const ownerName =
                post.authorName ||
                post.ownerDisplayName ||
                "Owner";

              const ownerAvatar =
                post.authorAvatarUrl ||
                post.ownerAvatarUrl ||
                "";

const savedReplies = Array.isArray((post as any).replies)
  ? (post as any).replies
  : [];

const replies = [
  ...savedReplies,
  ...(communityReplies[post.id] ?? []),
];

const isExpanded = expandedPostId === post.id;

              return (
                <article
                  key={post.id}
                  className={[
                    "rounded-xl border",
                    isFeature ? "p-4" : isCompact ? "p-3" : "p-3",
                    isLightDesign(designKey)
                      ? "border-neutral-200 bg-white"
                      : "border-white/10 bg-white/5",
                  ].join(" ")}
                  style={{
                    ...getContainerTextStyle(cardStyle, designKey),
                    ...getPostBoardBoxStyle(cardStyle),
                  }}
                >
                  <div className="flex items-start gap-3">
                    {block.data.showOwnerAvatar !== false ? (
                      ownerAvatar ? (
                        <img
                          src={ownerAvatar}
                          alt={`${ownerName} avatar`}
                          className={[
                            "shrink-0 rounded-full object-cover",
                            isFeature ? "h-11 w-11" : "h-9 w-9",
                          ].join(" ")}
                        />
                      ) : (
<div
  className="flex shrink-0 items-center justify-center rounded-full"
  style={{
    width: `${avatarStyle.size}px`,
    height: `${avatarStyle.size}px`,
    backgroundColor: avatarStyle.backgroundColor,
    color: avatarStyle.color,
    fontSize: `${avatarStyle.fontSize}px`,
    fontWeight: avatarStyle.bold ? 700 : 400,
  }}
>
  {getPostInitials(ownerName)}
</div>
                      )
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
<div
  className="text-sm font-semibold"
  style={getContainerTextStyle(metaStyle, designKey)}
>
  {ownerName}
</div>

                        {block.data.showTimestamps !== false ? (
<div
  className="text-xs"
  style={getContainerTextStyle(metaStyle, designKey)}
>
  {formatPostTime(post.createdAt)}
</div>
                        ) : null}

                        {post.contactInfoConfirmed ? (
                          <div
                            className={[
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              isLightDesign(designKey)
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-emerald-400/15 text-emerald-100",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                isLightDesign(designKey)
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
                              ].join(" ")}
                            >
                              📧 Replies can reach me
                            </div>
                          </div>
                        ) : null}

                        {post.pinned ? (
                          <div
                            className={[
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                              isLightDesign(designKey)
                                ? "bg-neutral-100 text-neutral-700"
                                : "bg-white/10 text-white/75",
                            ].join(" ")}
                          >
                            Pinned
                          </div>
                        ) : null}
                      </div>

                      {post.subtitle ? (
                        <div className={`mt-1 text-xs ${getMutedTextClass(designKey)}`}>
                          {post.subtitle}
                        </div>
                      ) : null}

                      <div
                        className={[
                          "mt-2 font-semibold",
                          isFeature ? "text-lg" : "text-sm",
                        ].join(" ")}
                        style={getContainerTextStyle(headingStyle, designKey)}
                      >
                        {post.title || "Untitled post"}
                      </div>

                      {post.message ? (
                        <div
                          className={[
                            "mt-1 leading-snug",
                            isCompact ? "text-xs" : "text-sm",
                          ].join(" ")}
                          style={{
                            ...getContainerTextStyle(bodyStyle, designKey),
                            ...getPostBoardBoxStyle(bodyStyle),
                          }}
                        >
                          {getPostMessage(post.message)}
                        </div>
                      ) : null}

                      {post.imageUrl && block.data.allowImages !== false ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title || "Post image"}
                          className="mt-3 max-h-52 w-full rounded-xl border object-cover"
                        />
                      ) : null}

                      {post.videoUrl && block.data.allowVideos ? (
                        getYouTubeEmbedUrl(post.videoUrl) ? (
                          <div
                            className="relative z-20 mt-3 pointer-events-auto"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <iframe
                              src={getYouTubeEmbedUrl(post.videoUrl)}
                              title={post.title || "Post video"}
                              className="mt-3 aspect-video w-full rounded-xl border"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />

                            <a
                              href={post.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-700"
                            >
                              Open video
                            </a>
                          </div>
                        ) : (
                          <video
                            src={post.videoUrl}
                            controls
                            className="mt-3 max-h-52 w-full rounded-xl border object-cover"
                          />
                        )
                      ) : null}

                      <div className="relative z-20 mt-3 flex items-center gap-2 pointer-events-auto">
                        {block.data.showLikes !== false ? (
                          <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleLikePost(post.id, post.likeCount ?? 0);
                            }}
                            disabled={
                              Boolean(likeLoading[post.id]) ||
                              Boolean(likedPosts[post.id])
                            }
                            className={[
                              "rounded-full border px-3 py-1 text-xs font-semibold pointer-events-auto",
                              isLightDesign(designKey)
                                ? "border-neutral-200 bg-neutral-50 text-neutral-700"
                                : "border-white/10 bg-white/5 text-white/75",
                            ].join(" ")}
style={{
  ...getContainerTextStyle(buttonStyle, designKey),
  ...getPostBoardBoxStyle(buttonStyle),
  height: `${actionButtonStyle.height}px`,
  minWidth: `${actionButtonStyle.minWidth}px`,
  fontSize: `${actionButtonStyle.fontSize}px`,
  backgroundColor: actionButtonStyle.backgroundColor,
  borderColor: actionButtonStyle.borderColor,
  borderWidth: `${actionButtonStyle.borderWidth}px`,
  borderRadius: `${actionButtonStyle.borderRadius}px`,
  color: actionButtonStyle.color,
}}
                            aria-label={`Like ${post.title || "post"}`}
                          >
                            ♥ {likeCounts[post.id] ?? post.likeCount ?? 0}
                          </button>
                        ) : null}

                        {block.data.showMessages !== false ? (
                          isCommunityBoard ? (
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPostId(isExpanded ? null : post.id);
                              }}
                              className={[
                                "rounded-full border px-3 py-1 text-xs font-semibold pointer-events-auto",
                                isLightDesign(designKey)
                                  ? "border-neutral-200 bg-neutral-50 text-neutral-700"
                                  : "border-white/10 bg-white/5 text-white/75",
                              ].join(" ")}
style={{
  ...getContainerTextStyle(buttonStyle, designKey),
  ...getPostBoardBoxStyle(buttonStyle),
  height: `${actionButtonStyle.height}px`,
  minWidth: `${actionButtonStyle.minWidth}px`,
  fontSize: `${actionButtonStyle.fontSize}px`,
  backgroundColor: actionButtonStyle.backgroundColor,
  borderColor: actionButtonStyle.borderColor,
  borderWidth: `${actionButtonStyle.borderWidth}px`,
  borderRadius: `${actionButtonStyle.borderRadius}px`,
  color: actionButtonStyle.color,
}}
                            >
                              💬 {replies.length || post.messageCount || 0}
                            </button>
                          ) : (
                            <a
                              href={post.threadId ? `#thread-${post.threadId}` : "#"}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();

                                if (!post.threadId) {
                                  e.preventDefault();
                                  return;
                                }

                                const target = document.getElementById(
                                  `thread-${post.threadId}`,
                                );

                                if (target) {
                                  e.preventDefault();

                                  target.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });

                                  window.history.replaceState(
                                    null,
                                    "",
                                    `#thread-${post.threadId}`,
                                  );

                                  setTimeout(() => {
                                    const nameInput = target.querySelector(
                                      'input[type="text"]',
                                    ) as HTMLInputElement | null;

                                    if (nameInput) {
                                      nameInput.focus();
                                      nameInput.select();
                                    }
                                  }, 350);
                                }
                              }}
                              className={[
                                "rounded-full border px-3 py-1 text-xs font-semibold pointer-events-auto",
                                isLightDesign(designKey)
                                  ? "border-neutral-200 bg-neutral-50 text-neutral-700"
                                  : "border-white/10 bg-white/5 text-white/75",
                              ].join(" ")}
style={{
  ...getContainerTextStyle(buttonStyle, designKey),
  ...getPostBoardBoxStyle(buttonStyle),

  height: `${actionButtonStyle.height}px`,
  minWidth: `${actionButtonStyle.minWidth}px`,
  fontSize: `${actionButtonStyle.fontSize}px`,
  backgroundColor: actionButtonStyle.backgroundColor,
  borderColor: actionButtonStyle.borderColor,
  borderWidth: `${actionButtonStyle.borderWidth}px`,
  borderRadius: `${actionButtonStyle.borderRadius}px`,
  color: actionButtonStyle.color,
}}
                              aria-label={`Open discussion for ${post.title || "post"}`}
                            >
                              💬 {post.messageCount ?? 0}
                            </a>
                          )
                        ) : null}
                      </div>

                      {isCommunityBoard && isExpanded ? (
                        <div
                          className={[
                            "mt-4 rounded-xl border p-3",
                            isLightDesign(designKey)
                              ? "border-neutral-200 bg-neutral-50"
                              : "border-white/10 bg-white/5",
                          ].join(" ")}
                        >
                          <div className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
                            Replies
                          </div>

                          <div
                            className="mt-3 space-y-3 overflow-y-auto pr-1"
                            style={{
                              maxHeight: replies.length > maxVisibleReplies ? 280 : undefined,
                            }}
                          >
                            {replies.length ? (
                              replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className={[
                                    "rounded-xl border p-3",
                                    isLightDesign(designKey)
                                      ? "border-neutral-200 bg-white"
                                      : "border-white/10 bg-black/10",
                                  ].join(" ")}
                                >
                                  <div className="flex items-start gap-2">
                                    {reply.avatarUrl ? (
                                      <img
                                        src={reply.avatarUrl}
                                        alt={`${reply.name} avatar`}
                                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div
                                        className={[
                                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                          isLightDesign(designKey)
                                            ? "bg-neutral-900 text-white"
                                            : "bg-white text-neutral-900",
                                        ].join(" ")}
                                      >
                                        {getPostInitials(reply.name)}
                                      </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <div className="text-sm font-semibold">
                                          {reply.name}
                                        </div>

                                        {reply.contactInfoConfirmed ? (
                                          <div className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                            Contact info confirmed
                                          </div>
                                        ) : null}
                                      </div>

                                      <div className="mt-1 text-sm">
                                        {reply.message}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm opacity-70">
                                No replies yet.
                              </div>
                            )}
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-2">
                            <input
                              type="text"
                              value={replyForms[post.id]?.name ?? ""}
                              onChange={(e) =>
                                setReplyForms((prev) => ({
                                  ...prev,
                                  [post.id]: {
                                    ...(prev[post.id] ?? {
                                      name: "",
                                      email: "",
                                      avatarUrl: "",
                                      message: "",
                                    }),
                                    name: e.target.value,
                                  },
                                }))
                              }
                              className="h-10 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900"
                              placeholder="Your name"
                            />

                            {block.data.allowReplyEmailCapture !== false ? (
                              <input
                                type="email"
                                value={replyForms[post.id]?.email ?? ""}
                                onChange={(e) =>
                                  setReplyForms((prev) => ({
                                    ...prev,
                                    [post.id]: {
                                      ...(prev[post.id] ?? {
                                        name: "",
                                        email: "",
                                        avatarUrl: "",
                                        message: "",
                                      }),
                                      email: e.target.value,
                                    },
                                  }))
                                }
                                className="h-10 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900"
                                placeholder="Email optional, privately stored"
                              />
                            ) : null}

<label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700">
  Choose Profile Image

  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        setReplyForms((prev) => ({
          ...prev,
          [post.id]: {
            ...(prev[post.id] ?? {
              name: "",
              email: "",
              avatarUrl: "",
              message: "",
            }),
            avatarUrl:
              typeof reader.result === "string"
                ? reader.result
                : "",
          },
        }));
      };

      reader.readAsDataURL(file);

      e.target.value = "";
    }}
  />
</label>

{replyForms[post.id]?.avatarUrl ? (
  <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
    <img
      src={replyForms[post.id]?.avatarUrl}
      alt="Selected profile"
      className="h-8 w-8 rounded-full object-cover"
    />
    Profile image selected
  </div>
) : null}

                            <textarea
                              value={replyForms[post.id]?.message ?? ""}
                              onChange={(e) =>
                                setReplyForms((prev) => ({
                                  ...prev,
                                  [post.id]: {
                                    ...(prev[post.id] ?? {
                                      name: "",
                                      email: "",
                                      avatarUrl: "",
                                      message: "",
                                    }),
                                    message: e.target.value,
                                  },
                                }))
                              }
                              className="min-h-[84px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
                              placeholder="Write a reply..."
                            />

                            <div className="text-[11px] opacity-70">
                              Optional email is private and is not shown publicly.
                              Replies are associated with: “{post.title || "Untitled post"}”.
                            </div>

                            <button
                              type="button"
                              className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white"
                              onClick={() => handleCreateReply(post)}
                            >
                              Submit Reply
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
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
            No posts yet.
          </div>
        )}
      </div>
      {isCommunityBoard && !showNewPostForm ? (
  <button
    type="button"
    className="relative z-20 mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 pointer-events-auto"
    onMouseDown={(e) => e.stopPropagation()}
    onClick={(e) => {
      e.stopPropagation();
      setShowNewPostForm(true);
      setNewPostError("");
    }}
  >
    Start a Discussion
  </button>
) : null}
    </Surface>
  );
}

function renderThread(
  block: Extract<MicrositeBlock, { type: "thread" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  function withOpacity(color?: string, opacity?: number) {
    const safeColor = color || "transparent";
    const safeOpacity =
      typeof opacity === "number" && Number.isFinite(opacity)
        ? Math.max(0, Math.min(100, opacity)) / 100
        : 1;

    if (safeColor === "transparent") return "transparent";

    if (!safeColor.startsWith("#")) return safeColor;

    const hex = safeColor.replace("#", "");
    const fullHex =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => `${char}${char}`)
            .join("")
        : hex;

    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);

    if ([r, g, b].some((value) => Number.isNaN(value))) return safeColor;

    return `rgba(${r}, ${g}, ${b}, ${safeOpacity})`;
  }

  function getThreadElementBoxStyle(
    appearance?: {
      backgroundColor?: string;
      backgroundOpacity?: number;
      borderColor?: string;
    },
  ) {
    return {
      backgroundColor: withOpacity(
        appearance?.backgroundColor,
        appearance?.backgroundOpacity,
      ),
      borderColor: appearance?.borderColor || undefined,
    };
  }

  function ThreadInteractivePreview() {
    const initialMessages = useMemo(
      () => getThreadSampleMessages(block),
      [block.id, block.data.messages, block.data.allowAnonymous],
    );

    const [messages, setMessages] = useState<ThreadUiMessage[]>(initialMessages);
    const [nameValue, setNameValue] = useState("");
    const [messageValue, setMessageValue] = useState("");
    const [attachments, setAttachments] = useState<ThreadAttachment[]>([]);
    const attachmentInputRef = useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState(Boolean(micrositeId));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteLoadingId, setVoteLoadingId] = useState<string | null>(null);
    const [threadError, setThreadError] = useState("");

    const showAnonymousBadge = Boolean(block.data.allowAnonymous);
    const showApprovalBadge = Boolean(block.data.requireApproval);
    const showNameField = block.data.showNameField !== false;
    const showVoteControls = block.data.showVoteControls !== false;
    const showVoteCount = block.data.showVoteCount !== false;


    const baseStyle = block.data.style;
    const subjectStyle = block.data.subjectStyle ?? baseStyle;
    const nameStyle = block.data.nameStyle ?? baseStyle;
    const messageStyle = block.data.messageStyle ?? baseStyle;
    const postBlockStyle = block.data.postBlockStyle ?? baseStyle;
    const postButtonTextStyle = block.data.postButtonTextStyle ?? baseStyle;

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
const trimmedNameValue = nameValue.trim();

const isNameRequired = showNameField && !block.data.allowAnonymous;

const isPostDisabled =
  isSubmitting ||
  (!trimmedMessageValue && attachments.length === 0) ||
  (isNameRequired && !trimmedNameValue);

    function getAttachmentType(file: File): ThreadAttachment["type"] | null {
      if (file.type === "image/gif") return "gif";
      if (file.type.startsWith("image/")) return "image";
      if (file.type.startsWith("video/")) return "video";
      if (file.type.startsWith("audio/")) return "audio";
      return null;
    }

function getAttachmentLimit(type: ThreadAttachment["type"]) {
  if (type === "video") return 20 * 1024 * 1024;
  if (type === "audio") return 5 * 1024 * 1024;
  return 2 * 1024 * 1024;
}

    function handleAttachmentChange(fileList: FileList | null) {
      const file = fileList?.[0];
      if (!file) return;

      const type = getAttachmentType(file);

      if (!type) {
        setThreadError("Unsupported media type.");
        return;
      }

      const limit = getAttachmentLimit(type);

      if (file.size > limit) {
        setThreadError(
type === "video"
  ? "Videos must be 20MB or smaller."
  : type === "audio"
    ? "Audio/voice notes must be 5MB or smaller."
    : "Images and GIFs must be 2MB or smaller."
        );
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : "";

        if (!dataUrl) {
          setThreadError("Could not read media file.");
          return;
        }

        setAttachments((prev) => [
          ...prev,
          {
            id: `attachment_${Math.random().toString(36).slice(2, 10)}`,
            type,
            name: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            dataUrl,
          },
        ].slice(0, 4));

        setThreadError("");
      };

      reader.onerror = () => {
        setThreadError("Could not read media file.");
      };

      reader.readAsDataURL(file);
    }

    function renderThreadAttachments(items?: ThreadAttachment[]) {
      if (!items?.length) return null;

      return (
        <div className="mt-3 grid gap-2">
          {items.map((attachment) => {
            const src = attachment.url || attachment.dataUrl || "";

            if (!src) return null;

            if (attachment.type === "video") {
              return (
                <video
                  key={attachment.id}
                  src={src}
                  controls
className="w-full rounded-xl border"
style={{
  maxHeight: "140px",
  objectFit: "contain",
}}
                />
              );
            }

            if (attachment.type === "audio") {
              return (
                <audio
                  key={attachment.id}
                  src={src}
                  controls
                  className="w-full"
                />
              );
            }

            return (
              <img
                key={attachment.id}
                src={src}
                alt={attachment.name || "Thread attachment"}
className="mx-auto rounded-xl border"
style={{
  maxHeight: "140px",
  maxWidth: "320px",
  objectFit: "contain",
}}
              />
            );
          })}
        </div>
      );
    }

    async function handleSubmit() {
      const nextMessage = messageValue.trim();
            if ((!nextMessage && attachments.length === 0) || isSubmitting) return;

if (isNameRequired && !nameValue.trim()) {
  setThreadError("Name is required to post.");
  return;
}

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
        attachments,
      };

      if (!micrositeId) {
        setMessages((prev) => [optimisticMessage, ...prev]);
        setMessageValue("");
        setNameValue("");
        setAttachments([]);

        if (attachmentInputRef.current) {
          attachmentInputRef.current.value = "";
        }

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
            attachments,
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
            attachments: Array.isArray(data.message.attachments)
              ? data.message.attachments
              : [],
          },
          ...prev,
        ]);

        setMessageValue("");
        setNameValue("");
        setAttachments([]);

        if (attachmentInputRef.current) {
          attachmentInputRef.current.value = "";
        }

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
  className={
    block.data.threadStyleTarget === "form" &&
    block.data.formAppearance?.backgroundColor === "transparent"
      ? "bg-transparent"
      : getSoftSurfaceClass(designKey)
  }
  id={`thread-${block.id}`}
  styleOverride={
    block.data.threadStyleTarget === "form"
      ? {
          backgroundColor: "transparent",
        }
      : undefined
  }
>
        <div
          className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border p-3"
          style={{
  ...getThreadElementBoxStyle(block.data.formAppearance),
  backgroundColor:
    block.data.formAppearance?.backgroundColor === "transparent"
      ? "transparent"
      : getThreadElementBoxStyle(block.data.formAppearance).backgroundColor,
}}
        >
          <div
            className={`shrink-0 border-b pb-3 ${getThreadDividerClass(
              designKey,
            )}`}
          >
            <div
              className="font-semibold"
              style={getThreadHeadingStyle(subjectStyle, designKey)}
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
            <div
              className={`${getThreadComposerClass(designKey)} border`}
              style={getThreadElementBoxStyle(block.data.postBlockAppearance)}
            >
              <div
                className="font-medium"
                style={getThreadMetaStyle(nameStyle, designKey)}
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
                    ...getThreadBodyStyle(nameStyle, designKey),
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
                  ...getThreadBodyStyle(messageStyle, designKey),
                  pointerEvents: "auto",
                  position: "relative",
                  zIndex: 2,
                }}
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm">
                  Add media
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept="image/*,.gif,video/*,audio/*"
                    className="hidden"
                    onChange={(e) => {
                      handleAttachmentChange(e.target.files);
                      e.target.value = "";
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>

                <div
                  className={
                    isLightDesign(designKey)
                      ? "text-xs text-neutral-500"
                      : "text-xs text-white/55"
                  }
                >
                  GIF/Image 2MB • Video 5MB • Audio 1MB
                </div>
              </div>

              {attachments.length ? (
                <div className="mt-3 space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700"
                    >
                      <span className="min-w-0 truncate">{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((item) => item.id !== attachment.id),
                          )
                        }
                        className="shrink-0 font-semibold text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}              

              <div className="mt-2 flex items-center justify-between gap-3">
                <div
                  style={getThreadMetaStyle(messageStyle, designKey)}
                  className={
                    isLightDesign(designKey) ? "text-neutral-500" : "text-white/55"
                  }
                >
                  {messageValue.length}/{THREAD_MAX_MESSAGE_LENGTH}
                </div>

                {showNameField ? (
                  <div
                    style={getThreadMetaStyle(nameStyle, designKey)}
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
                  style={getThreadMetaStyle(nameStyle, designKey)}
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
                    ...getThreadBodyStyle(postButtonTextStyle, designKey),
                    ...getThreadElementBoxStyle(block.data.postButtonAppearance),
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

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
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
                    style={getThreadElementBoxStyle(
                      block.data.messageAppearance,
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
                                    postBlockStyle,
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
                                ...getThreadMetaStyle(nameStyle, designKey),
                                fontSize: "13px",
                              }}
                            >
                              {message.name || "Guest"}
                            </div>
                          ) : null}

                          <div
                            className={showNameField ? "mt-1" : ""}
                            style={{
                              ...getThreadBodyStyle(messageStyle, designKey),
                              fontSize: "15px",
                              lineHeight: 1.35,
                            }}
                          >
                            {message.message || "Message preview"}
                            {renderThreadAttachments(message.attachments)}
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

function EnrollmentLinkedCarousel({
  block,
  designKey,
}: {
  block: Extract<MicrositeBlock, { type: "image_carousel" }>;
  designKey?: string;
}) {
  const [overrideItems, setOverrideItems] = useState<any[] | null>(null);

  useEffect(() => {
    function handleEnrollmentProfileUpdate(event: Event) {
      const customEvent =
        event as CustomEvent<EnrollmentBoardProfileEventDetail>;

      if (
        customEvent.detail?.linkedCarouselBlockId !== block.id
      ) {
        return;
      }

      const nextItems = (customEvent.detail.entries ?? [])
        .filter((entry) => entry.profileImageUrl)
        .map((entry) => ({
          id: entry.id,
          imageUrl: entry.profileImageUrl || "",
          title: entry.name || "",
          subtitle: entry.quote || "",
          caption: entry.quote || "",
          positionX: 50,
          positionY: 50,
          zoom: 1,
          rotation: 0,
        }));

      setOverrideItems(nextItems);
    }

    window.addEventListener(
      ENROLLMENT_BOARD_PROFILE_EVENT,
      handleEnrollmentProfileUpdate,
    );

    return () => {
      window.removeEventListener(
        ENROLLMENT_BOARD_PROFILE_EVENT,
        handleEnrollmentProfileUpdate,
      );
    };
  }, [block.id]);

  return (
    <ImageCarouselPreview
      block={block}
      designKey={designKey}
      overrideItems={overrideItems}
    />
  );
}

function ImageCarouselPreview({
  block,
  designKey,
  overrideItems,
}: {
  block: Extract<MicrositeBlock, { type: "image_carousel" }>;
  designKey?: string;
  overrideItems?: any[] | null;
}) {
  const items = overrideItems ?? block.data.items ?? [];
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
      style={{
  ...getAppearanceStyle(block),
  ...getTextureBorderStyle(block.appearance),
}}
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
  block.appearance?.textureEnabled && block.appearance?.textureImageUrl
    ? ""
    : isLightDesign(designKey)
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
  style={getContainerTextStyle(captionStyle)}
>
  {String((item as any).caption ?? "").trim()}
</div>
                ) : null}
              </div>
            );

            return link.href ? (
<a
  key={item.id}
  onClick={(e) => e.stopPropagation()}
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
  return (
    <EnrollmentLinkedCarousel
      block={block}
      designKey={designKey}
    />
  );
}


function renderFormField(
  block: Extract<MicrositeBlock, { type: "form_field" }>,
  designKey?: string,
) {
  function FormFieldPreview() {
const inputClass = isLightDesign(designKey)
  ? "w-full rounded border border-neutral-300 bg-white px-3 py-2"
  : "w-full rounded border border-white/15 bg-white/5 px-3 py-2";

    const inputStyle = ((block.data as any).inputStyle ??
      block.data.style ??
      {}) as any;

    const inputVisualStyle: React.CSSProperties = {
      ...getContainerTextStyle(inputStyle, designKey),

      color: inputStyle.color ?? getDefaultTextColor(designKey),
      WebkitTextFillColor: inputStyle.color ?? getDefaultTextColor(designKey),

      backgroundColor: inputStyle.backgroundColor ?? undefined,

      borderColor: inputStyle.borderColor ?? undefined,
      borderWidth:
        typeof inputStyle.borderWidth === "number"
          ? `${inputStyle.borderWidth}px`
          : undefined,
      borderStyle:
        typeof inputStyle.borderWidth === "number" && inputStyle.borderWidth > 0
          ? "solid"
          : undefined,
      borderRadius:
        typeof inputStyle.borderRadius === "number"
          ? `${inputStyle.borderRadius}px`
          : undefined,

      paddingTop:
        typeof inputStyle.paddingTop === "number"
          ? `${inputStyle.paddingTop}px`
          : undefined,
      paddingLeft:
        typeof inputStyle.paddingLeft === "number"
          ? `${inputStyle.paddingLeft}px`
          : undefined,
      paddingRight:
        typeof inputStyle.paddingRight === "number"
          ? `${inputStyle.paddingRight}px`
          : undefined,
      paddingBottom:
        typeof inputStyle.paddingBottom === "number"
          ? `${inputStyle.paddingBottom}px`
          : undefined,
    };

const placeholderStyle = "placeholder:opacity-100";

const placeholderColor =
  ((block.data as any).placeholderStyle?.color as string | undefined) ||
  "rgb(186, 186, 186)";

const safePlaceholderClassName = `ko-form-placeholder-${block.id.replace(
  /[^a-zA-Z0-9_-]/g,
  "",
)}`;

    const showLabel = block.data.showLabel !== false;
    const showPlaceholder = block.data.showPlaceholder !== false;
    const showRequired = block.data.showRequired !== false;
    const linkedButtonId = (block.data as any).linkedButtonId ?? "";
    const fieldLabel = block.data.label || "Field";
    const fieldType = (block.data as any).fieldType ?? "text";

    const stateOptions = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
      "DC",
    ];

    const sharedFieldProps = {
      "data-form-field-id": block.id,
      "data-linked-button": linkedButtonId,
      "data-linked-button-id": linkedButtonId,
      "data-field-label": fieldLabel,
      "data-required": block.data.required ? "true" : "false",
      "data-field-type": fieldType,
    };

    const showRating = (block.data as any).showRating === true;
    const initialRating = Math.max(
      0,
      Math.min(5, Number((block.data as any).ratingValue ?? 0)),
    );

    const [ratingValue, setRatingValue] = useState(initialRating);
    const [stateValue, setStateValue] = useState(block.data.value || "");

    const ratingColor = (block.data as any).ratingColor || "#F59E0B";
    const ratingPosition =
      (block.data as any).ratingPosition === "low" ? "low" : "high";

    const ratingStars = (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index < ratingValue;

          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRatingValue(index + 1);
              }}
              className="transition-transform hover:scale-110"
              style={{ color: ratingColor }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M12 2l3.1 6.3 7 .9-5 4.8 1.2 6.9L12 17.8 5.7 21l1.2-6.9-5-4.8 7-.9L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>
    );

return (
  <div className="h-full w-full p-2" style={getAppearanceStyle(block)}>
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .${safePlaceholderClassName}::placeholder {
            color: ${placeholderColor} !important;
            opacity: 1 !important;
            -webkit-text-fill-color: ${placeholderColor} !important;
          }
          .${safePlaceholderClassName}::-webkit-input-placeholder {
            color: ${placeholderColor} !important;
            opacity: 1 !important;
            -webkit-text-fill-color: ${placeholderColor} !important;
          }
        `,
      }}
    />

<div className="flex h-full flex-col gap-2">
  {showRating && ratingPosition === "high" ? ratingStars : null}

  {showLabel && fieldType !== "checkbox_text" ? (
<label
  style={getContainerTextStyle(
        (block.data as any).labelStyle ?? block.data.style,
        designKey,
      )}
    >
      {block.data.label}
      {showRequired && block.data.required ? " *" : ""}
    </label>
  ) : null}

  {fieldType === "textarea" ? (
    <textarea
      className={`${inputClass} ${placeholderStyle} ${safePlaceholderClassName} min-h-[96px] resize-none`}
      placeholder={showPlaceholder ? block.data.placeholder : ""}
      defaultValue={block.data.value || ""}
      style={inputVisualStyle}
      {...sharedFieldProps}
    />
  ) : fieldType === "state" ? (
<select
  className={`${inputClass} ${placeholderStyle} ${safePlaceholderClassName}`}
  value={stateValue}
  onChange={(e) => setStateValue(e.target.value)}
  style={{
    ...inputVisualStyle,
    color: stateValue ? inputVisualStyle.color : placeholderColor,
    WebkitTextFillColor: stateValue
      ? inputVisualStyle.WebkitTextFillColor
      : placeholderColor,
  }}
  {...sharedFieldProps}
>
  <option
    value=""
    disabled
    style={{
      color: placeholderColor,
      WebkitTextFillColor: placeholderColor,
    }}
  >
    {showPlaceholder
      ? block.data.placeholder || "Select state..."
      : "Select state..."}
  </option>

  {stateOptions.map((state) => (
    <option
      key={state}
      value={state}
      style={{
        color: inputVisualStyle.color,
        WebkitTextFillColor: inputVisualStyle.WebkitTextFillColor,
      }}
    >
      {state}
    </option>
  ))}
</select>
  ) : fieldType === "checkbox_text" ? (
    <label
      className="flex items-center gap-3"
      style={getContainerTextStyle(inputStyle, designKey)}
    >
      <input
        type="checkbox"
        defaultChecked={block.data.value === "true"}
        data-checkbox-group={linkedButtonId || block.id}
        data-allow-multiple-selections={
          (block.data as any).allowMultipleSelections ? "true" : "false"
        }
        style={{
          accentColor: inputStyle.color ?? undefined,
          width:
            typeof inputStyle.fontSize === "number"
              ? `${Math.max(14, inputStyle.fontSize)}px`
              : undefined,
          height:
            typeof inputStyle.fontSize === "number"
              ? `${Math.max(14, inputStyle.fontSize)}px`
              : undefined,
          borderColor: inputStyle.borderColor ?? undefined,
          borderWidth:
            typeof inputStyle.borderWidth === "number"
              ? `${inputStyle.borderWidth}px`
              : undefined,
          borderStyle:
            typeof inputStyle.borderWidth === "number" &&
            inputStyle.borderWidth > 0
              ? "solid"
              : undefined,
          borderRadius:
            typeof inputStyle.borderRadius === "number"
              ? `${inputStyle.borderRadius}px`
              : undefined,
        }}
        {...sharedFieldProps}
      />

      <span style={getContainerTextStyle(inputStyle, designKey)}>
        {block.data.placeholder || block.data.label || "Checkbox Label"}
        {showRequired && block.data.required ? " *" : ""}
      </span>
    </label>
  ) : (
    <input
      type={fieldType === "phone" ? "tel" : fieldType}
      className={`${inputClass} ${placeholderStyle} ${safePlaceholderClassName}`}
      placeholder={showPlaceholder ? block.data.placeholder : ""}
      defaultValue={block.data.value || ""}
      style={inputVisualStyle}
      {...sharedFieldProps}
    />
  )}

  {showRating && ratingPosition === "low" ? ratingStars : null}
</div>
      </div>
    );
  }

  return <FormFieldPreview />;
}

function renderOptionButton(
  block: Extract<MicrositeBlock, { type: "option_button" }>,
  designKey?: string,
) {
  function OptionButtonPreview() {
    const data = block.data as any;
    const options = Array.isArray(data.options) ? data.options : [];
    const allowMultiSelect = Boolean(data.allowMultiSelect);
    const variant = data.variant ?? "push_button";
    const [selectedIds, setSelectedIds] = useState<string[]>(
      Array.isArray(data.selectedOptionIds) ? data.selectedOptionIds : [],
    );

    function toggleOption(optionId: string) {
      setSelectedIds((current) => {
        if (allowMultiSelect) {
          return current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
        }

        return current.includes(optionId) ? [] : [optionId];
      });
    }

    const labelStyle = getContainerTextStyle(
      data.labelStyle ?? data.style ?? {},
      designKey,
    );

    const optionTextStyle = getContainerTextStyle(
      data.optionStyle ?? data.style ?? {},
      designKey,
    );

    const headingStyle = getContainerTextStyle(data.style ?? {}, designKey);

    const selectedBorderColor = data.selectedBorderColor ?? "#f59e0b";
    const selectedCheckColor = data.selectedCheckColor ?? "#f59e0b";
    const checkmarkColor = data.checkmarkColor ?? "#ffffff";

    const sharedDataAttrs = {
      "data-form-field-id": block.id,
      "data-field-type": "option_button",
      "data-field-label": data.heading || block.label || "Option Button",
      "data-required": "false",
      "data-option-button-value": selectedIds.join(","),
    };

    if (variant === "dropdown") {
      return (
        <div className="h-full w-full p-2" style={getAppearanceStyle(block)}>
          <div className="flex h-full flex-col gap-2">
            {data.showHeading !== false ? (
              <div style={headingStyle}>{data.heading || "Choose an Option"}</div>
            ) : null}

            {data.showSubtitle ? (
              <div className="text-sm opacity-75" style={headingStyle}>
                {data.subtitle}
              </div>
            ) : null}

            <select
              className={
                isLightDesign(designKey)
                  ? "w-full rounded border border-neutral-300 bg-white px-3 py-2"
                  : "w-full rounded border border-white/15 bg-white/5 px-3 py-2"
              }
              value={selectedIds[0] ?? ""}
              onChange={(e) =>
                setSelectedIds(e.target.value ? [e.target.value] : [])
              }
              style={optionTextStyle}
              {...sharedDataAttrs}
            >
              <option value="">{data.placeholder || "Select"}</option>
              {options.map((option: any) => (
                <option
                  key={option.id}
                  value={option.id}
                  disabled={Boolean(option.disabled)}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full w-full p-2" style={getAppearanceStyle(block)}>
        <div className="flex h-full flex-col gap-3">
          {data.showHeading !== false ? (
            <div style={headingStyle}>{data.heading || "Choose an Option"}</div>
          ) : null}

          {data.showSubtitle ? (
            <div className="text-sm opacity-75" style={headingStyle}>
              {data.subtitle}
            </div>
          ) : null}

          <div
            className={
              variant === "push_button"
                ? data.pushButtonLayout === "vertical_stack"
                  ? "flex flex-col gap-3"
                  : data.pushButtonLayout === "horizontal_scroll"
                    ? "flex gap-3 overflow-x-auto"
                    : "grid grid-cols-2 gap-3"
                : "flex flex-col gap-3"
            }
          >
            {options.map((option: any) => {
              const selected = selectedIds.includes(option.id);
              const disabled = Boolean(option.disabled);

              if (variant === "radio" || variant === "toggle") {
                const control =
                  variant === "radio" ? (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        borderColor: selected ? selectedBorderColor : undefined,
                      }}
                    >
                      {selected ? (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: selectedBorderColor }}
                        />
                      ) : null}
                    </span>
                  ) : (
                    <span
                      className="relative h-6 w-11 shrink-0 rounded-full border transition"
                      style={{
                        backgroundColor: selected
                          ? selectedBorderColor
                          : "rgba(148, 163, 184, 0.25)",
                        borderColor: selected ? selectedBorderColor : undefined,
                      }}
                    >
                      <span
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition"
                        style={{
                          left: selected ? "20px" : "2px",
                        }}
                      />
                    </span>
                  );

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleOption(option.id)}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      ...optionTextStyle,
                      borderColor: selected ? selectedBorderColor : undefined,
                    }}
                    aria-pressed={selected}
                    data-option-id={option.id}
                    data-option-label={option.label}
                    data-option-value={option.value ?? option.id}
                    {...sharedDataAttrs}
                  >
                    {data.labelPosition === "left" ? (
                      <>
                        <span className="flex-1" style={labelStyle}>
                          {option.label}
                        </span>
                        {control}
                      </>
                    ) : (
                      <>
                        {control}
                        <span className="flex-1" style={labelStyle}>
                          {option.label}
                        </span>
                      </>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleOption(option.id)}
                  className="relative flex min-w-[140px] flex-col items-center justify-center gap-2 border text-center transition disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    ...optionTextStyle,
                    paddingLeft: data.horizontalPadding ?? 16,
                    paddingRight: data.horizontalPadding ?? 16,
                    paddingTop: data.verticalPadding ?? 16,
                    paddingBottom: data.verticalPadding ?? 16,
                    borderRadius:
                      data.pushButtonFrame === "circle" ? "9999px" : undefined,
                    borderColor: selected ? selectedBorderColor : undefined,
                    borderWidth: selected ? 2 : undefined,
                  }}
                  aria-pressed={selected}
                  data-option-id={option.id}
                  data-option-label={option.label}
                  data-option-value={option.value ?? option.id}
                  {...sharedDataAttrs}
                >
                  {selected && data.showCheckmark !== false ? (
                    <span
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: selectedCheckColor,
                        color: checkmarkColor,
                      }}
                    >
                      ✓
                    </span>
                  ) : null}

                  {data.showOptionImages !== false && option.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={option.imageUrl}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : null}

                  <span style={labelStyle}>{option.label}</span>

                  {data.showOptionDescriptions !== false &&
                  option.description ? (
                    <span className="text-xs opacity-75">
                      {option.description}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return <OptionButtonPreview />;
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
  const transformStyle = String(fx.transformStyle ?? "normal");
const transformStrength = Math.max(
  0,
  Math.min(200, Number(fx.transformStrength ?? 100)),
);
const transformMultiplier = transformStrength / 100;
  const positionX = block.data.positionX ?? 50;
  const positionY = block.data.positionY ?? 50;

  const translateX = (positionX - 50) * 0.6;
  const translateY = (positionY - 50) * 0.6;

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
  transform: `translate(${translateX}%, ${translateY}%)`,
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
        {transformStyle === "normal"
  ? text
  : text.split("").map((char, index) => {
      const offset =
        transformStyle === "wave"
          ? Math.sin(index * 0.9) * 6 * transformMultiplier
          : transformStyle === "rise"
            ? -index * 1.5 * transformMultiplier
            : transformStyle === "dipLetters"
              ? index * 1.5 * transformMultiplier
              : transformStyle === "stagger"
                ? (index % 2 === 0 ? -5 : 5) * transformMultiplier
                : transformStyle === "bounce"
                  ? (index % 2 === 0 ? -7 : 0) * transformMultiplier
                  : 0;

      const rotate =
        transformStyle === "tiltLeft"
          ? -8 * transformMultiplier
          : transformStyle === "tiltRight"
            ? 8 * transformMultiplier
            : 0;

      return (
        <span
          key={`${char}-${index}`}
          style={{
            display: "inline-block",
            transform: `translateY(${offset}px) rotate(${rotate}deg)`,
            whiteSpace: char === " " ? "pre" : undefined,
          }}
        >
          {char}
        </span>
      );
    })}
      </div>
    </div>
  );
}

  const fontSize =
    typeof block.data.style?.fontSize === "number"
      ? block.data.style.fontSize
      : 48;

  const curveStrength = Math.max(0, Math.min(100, intensity));
  const radius = 1200 - curveStrength * 10;
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
      style={{
  ...getAppearanceStyle(block),
  transform: `translate(${translateX}%, ${translateY}%)`,
}}
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
    const [highlightCardValues, setHighlightCardValues] = useState<Record<string, number>>({});
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

    const displayStyle = block.data?.displayStyle ?? "grid";
function hexToRgba(color: string, opacity: number) {
  if (!color || color === "transparent") return color;
  if (!color.startsWith("#")) return color;

  const hex = color.replace("#", "");
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : hex;

  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) return color;

  return `rgba(${r}, ${g}, ${b}, ${Math.max(
    0,
    Math.min(1, opacity),
  )})`;
}

const cardOpacity = block.data?.cardBackgroundOpacity ?? 1;
const cardBackgroundColor =
  block.data.cardBackgroundColor || (block.data as any).cardStyle?.backgroundColor || "";

    const normalizedCards =
      Array.isArray(block.data?.cards) && block.data.cards.length
        ? block.data.cards
        : block.data?.label || block.data?.value || block.data?.description || block.data?.icon
          ? [
              {
                id: `${block.id}-legacy-highlight-card`,
                type: "manual_stat" as const,
                label: block.data.label,
                value: block.data.value,
                description: block.data.description,
                icon: block.data.icon,
                showIcon: Boolean(block.data.icon),
              },
            ]
          : [];

    const useCardRenderer = normalizedCards.length > 0;

    const heading =
      block.data?.heading?.trim() ||
      (useCardRenderer
        ? "Highlights"
        : mode === "top_messages"
          ? "Top Messages"
          : mode === "rsvp_count"
            ? "RSVP Count"
            : mode === "total_funds"
              ? "Total Funds"
              : "Poll Results");

    const subtitle = block.data?.subtitle?.trim() || "";

    const headingTextStyle = getContainerTextStyle(
      block.data.headingStyle ?? block.data.style,
      designKey,
    );

    const bodyTextStyle = getContainerTextStyle(
      block.data.bodyStyle ?? block.data.style,
      designKey,
    );

const valueTextStyle = getContainerTextStyle(
  block.data.valueStyle ?? block.data.bodyStyle ?? block.data.style,
  designKey,
);

const labelTextStyle = getContainerTextStyle(
  block.data.bodyStyle ?? block.data.labelStyle ?? block.data.style,
  designKey,
);

const descriptionTextStyle = getContainerTextStyle(
  block.data.bodyStyle ?? block.data.descriptionStyle ?? block.data.style,
  designKey,
);

const linearDividerStyle = block.data.linearDividerStyle ?? "closed_solid";
const linearDividerColor =
  block.data.linearDividerColor ?? "rgba(0,0,0,0.14)";

function getLinearDividerCss(
  cardIndex: number,
): CSSProperties | undefined {
  if (linearDividerStyle === "none") return undefined;
  if (cardIndex >= normalizedCards.length - 1) return undefined;

  const isOpen =
    linearDividerStyle === "open_solid" ||
    linearDividerStyle === "open_dotted";

  const isDotted =
    linearDividerStyle === "closed_dotted" ||
    linearDividerStyle === "open_dotted";

  return {
    position: "absolute",
    right: 0,
    top: isOpen ? "18%" : 0,
    bottom: isOpen ? "18%" : 0,
    width: 0,
    borderRight: `1px ${isDotted ? "dotted" : "solid"} ${linearDividerColor}`,
    pointerEvents: "none",
  };
}

    function formatNumber(value: string | number | undefined) {
      if (value === undefined || value === null || value === "") return "0";

      if (typeof value === "number") {
        return new Intl.NumberFormat("en-US").format(value);
      }

      return value;
    }

    function formatMoney(value: number | undefined, currency = "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(value) || 0);
    }

    function getCountdownValue(card: any) {
      if (!card.targetDate) return card.fallbackValue ?? "0";

      const target = new Date(
        `${card.targetDate}${card.targetTime ? `T${card.targetTime}` : "T00:00"}`,
      );

      const diff = target.getTime() - Date.now();

      if (!Number.isFinite(diff) || diff <= 0) return "0";

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (card.countdownUnits === "minutes") return minutes;
      if (card.countdownUnits === "hours") return hours;
      if (card.countdownUnits === "full") {
        return `${days}d ${hours % 24}h`;
      }

      return days;
    }

    function getCardValue(card: any) {
      if (card.type === "money_raised") {
        return formatMoney(card.amount ?? card.fallbackValue, card.currency || "USD");
      }

      if (card.type === "progress") {
        const current = Number(card.currentValue ?? card.fallbackValue ?? 0);
        const goal = Number(card.goalValue ?? 0);

        if (goal > 0) {
          return `${formatNumber(current)} of ${formatNumber(goal)}${card.unit ? ` ${card.unit}` : ""}`;
        }

        return `${formatNumber(current)}${card.unit ? ` ${card.unit}` : ""}`;
      }

      if (card.type === "countdown") {
        return formatNumber(getCountdownValue(card));
      }

if (
card.type === "rsvp_count" ||
card.type === "poll_result" ||
card.type === "visitor_count" ||
card.type === "enrollment_records" ||
card.type === "calendar_events" ||
card.type === "post_board_discussions"
) {
  const liveValue = highlightCardValues[card.id];

  return `${card.prefix ?? ""}${formatNumber(
    typeof liveValue === "number" ? liveValue : card.fallbackValue ?? 0,
  )}${card.suffix ?? ""}`;
}

      return `${card.prefix ?? ""}${formatNumber(card.value)}${card.suffix ?? ""}`;
    }

    function getCardDescription(card: any) {
      if (card.description) return card.description;

      if (card.type === "money_raised" && card.goalAmount) {
        const amount = Number(card.amount ?? 0);
        const goal = Number(card.goalAmount ?? 0);
        const percent = goal > 0 ? Math.round((amount / goal) * 100) : 0;

        return `${percent}% of goal`;
      }

      if (card.type === "rsvp_count") return "RSVP summary";
      if (card.type === "poll_result") return "Poll result";
      if (card.type === "visitor_count") return "Visitor activity";
      if (card.type === "enrollment_records") return "Enrollment summary";
      if (card.type === "calendar_events") return "Calendar event summary";
      if (card.type === "post_board_discussions") return "Discussion summary";

      return "";
    }

    function getProgressPercent(card: any) {
      const current = Number(card.currentValue ?? card.amount ?? 0);
      const goal = Number(card.goalValue ?? card.goalAmount ?? 0);

      if (!goal || goal <= 0) return 0;

      return Math.max(0, Math.min(100, Math.round((current / goal) * 100)));
    }

useEffect(() => {
  if (!useCardRenderer) return;

  const sourceCards = normalizedCards.filter(
    (card: any) =>
      [
        "enrollment_records",
        "calendar_events",
        "post_board_discussions",
      ].includes(card.type) &&
      String(card.sourceBlockId ?? "").trim(),
  );

  if (!sourceCards.length) return;

  let cancelled = false;

  async function loadSourceCounts() {
    if (!micrositeId) return;

    const nextValues: Record<string, number> = {};

    await Promise.all(
      sourceCards.map(async (card: any) => {
        try {
          //
          // Enrollment Board
          //
          if (card.type === "enrollment_records") {
            const params = new URLSearchParams({
              micrositeId: String(micrositeId),
              blockId: String(card.sourceBlockId ?? "").trim(),
            });

            const res = await fetch(
              `/api/public/enrollment-board/count?${params.toString()}`,
              { cache: "no-store" },
            );

            const data = await res.json();

            if (!res.ok) {
              throw new Error();
            }

            nextValues[card.id] =
              card.countType === "total_submissions"
                ? Number(data.totalSubmissions ?? 0)
                : Number(data.activeCount ?? 0);

            return;
          }

          //
          // Calendar Events
          //
          if (card.type === "calendar_events") {
            const params = new URLSearchParams({
              micrositeId: String(micrositeId),
              blockId: String(card.sourceBlockId ?? "").trim(),
            });

            const res = await fetch(
              `/api/public/highlight-source-count?${params.toString()}&sourceType=calendar_events`,
              { cache: "no-store" },
            );

            const data = await res.json();

            nextValues[card.id] = Number(data.count ?? 0);
            return;
          }

          //
          // Post Board Discussions
          //
          if (card.type === "post_board_discussions") {
            const params = new URLSearchParams({
              micrositeId: String(micrositeId),
              blockId: String(card.sourceBlockId ?? "").trim(),
            });

            const res = await fetch(
              `/api/public/highlight-source-count?${params.toString()}&sourceType=post_board_discussions`,
              { cache: "no-store" },
            );

            const data = await res.json();

            nextValues[card.id] = Number(data.count ?? 0);
            return;
          }
        } catch {
          nextValues[card.id] = Number(card.fallbackValue ?? 0);
        }
      }),
    );

    if (!cancelled) {
      setHighlightCardValues((prev) => ({
        ...prev,
        ...nextValues,
      }));
    }
  }

  function handleSourceUpdated() {
    void loadSourceCounts();
  }

  void loadSourceCounts();

  window.addEventListener(
    "kht:enrollment-board-profile-updated",
    handleSourceUpdated,
  );

  return () => {
    cancelled = true;

    window.removeEventListener(
      "kht:enrollment-board-profile-updated",
      handleSourceUpdated,
    );
  };
}, [useCardRenderer, micrositeId, block.data.cards, refreshKey]);

    useEffect(() => {
      if (useCardRenderer) {
        setIsLoading(false);
        return;
      }

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
      useCardRenderer,
    ]);

    return (
<Surface
  block={block}
  designKey={designKey}
  className="overflow-hidden bg-transparent"
>
<div
  className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden rounded-[inherit]"
  style={{
    transform: `rotate(${Number(block.data.rotation ?? 0)}deg)`,
    transformOrigin: "center center",
    backgroundColor:
      block.appearance?.backgroundColor === "transparent"
        ? "transparent"
        : hexToRgba(
            block.appearance?.backgroundColor || "#ffffff",
            Number(block.appearance?.backgroundOpacity ?? 100) / 100,
          ),
  }}
>
          {block.data.showHeading !== false ? (
            <div className="text-sm font-semibold" style={headingTextStyle}>
              {heading}
            </div>
          ) : null}

          {block.data.showSubtitle === true && subtitle ? (
            <div className="-mt-2 text-xs opacity-70" style={bodyTextStyle}>
              {subtitle}
            </div>
          ) : null}

{useCardRenderer ? (
  <div
    className={
displayStyle === "linear"
  ? "flex w-full overflow-x-auto rounded-2xl bg-transparent"
        : displayStyle === "list"
          ? "grid gap-3"
          : "grid gap-3 overflow-y-auto pr-1"
    }
    style={
      displayStyle === "linear"
        ? {
            WebkitOverflowScrolling: "touch",
          }
        : displayStyle === "list"
          ? undefined
          : {
              gridTemplateColumns: `repeat(${highlightColumns}, minmax(0, 1fr))`,
            }
    }
  >
              {normalizedCards.map((card: any, cardIndex: number) => {
                const percent = getProgressPercent(card);
                const shouldShowProgress =
                  card.showProgressBar ||
                  card.showProgressPercentage ||
                  card.type === "progress" ||
                  card.type === "money_raised";

                return (
<div
  key={card.id}
  className={
    displayStyle === "linear"
      ? "relative flex min-w-[150px] flex-1 items-center gap-3 px-4 py-3"
      : displayStyle === "list"
        ? "flex items-center justify-between gap-4 px-4 py-3 shadow-sm"
        : "rounded-2xl px-4 py-3 shadow-sm"
  }
  style={{
    backgroundColor:
      cardBackgroundColor === "transparent"
        ? "transparent"
        : hexToRgba(
            cardBackgroundColor ||
              (isLightDesign(designKey) ? "#ffffff" : "#111827"),
            cardOpacity,
          ),
    borderStyle: "solid",
borderColor:
  Number((block.data as any).cardBorderWidth ?? 0) > 0
    ? (
        (block.data as any).cardBorderColor ??
        (isLightDesign(designKey)
          ? "rgba(229,231,235,1)"
          : "rgba(255,255,255,0.10)")
      )
    : "transparent",

borderWidth:
  typeof (block.data as any).cardBorderWidth === "number"
    ? `${(block.data as any).cardBorderWidth}px`
    : "0px",

borderRadius:
  typeof (block.data as any).cardBorderRadius === "number"
    ? `${(block.data as any).cardBorderRadius}px`
    : "16px",

backdropFilter:
  displayStyle === "linear"
    ? undefined
    : "blur(8px)",
  }}
>
<div className="min-w-0 flex-1">
  <div
    className={
      displayStyle === "linear"
        ? "flex items-center gap-3"
        : "flex items-start justify-between gap-3"
    }
  >
    {displayStyle === "linear" &&
    card.imagePosition !== "right" &&
    card.imageUrl ? (
      <img
        src={card.imageUrl}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{
          width: `${Number(card.imageSize ?? 40)}px`,
          height: `${Number(card.imageSize ?? 40)}px`,
        }}
      />
    ) : displayStyle === "linear" &&
      card.imagePosition !== "right" &&
      card.showIcon !== false &&
      card.icon ? (
      <div className="shrink-0 text-2xl">{card.icon}</div>
    ) : null}

    <div className="min-w-0 flex-1">
      {displayStyle !== "linear" && card.label ? (
        <div
          className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60"
          style={labelTextStyle}
        >
          {card.label}
        </div>
      ) : null}

      <div
        className={
          displayStyle === "linear" ? "leading-none" : "mt-2 leading-none"
        }
        style={{
          fontSize: displayStyle === "linear" ? "24px" : "32px",
          fontWeight: 800,
          ...valueTextStyle,
        }}
      >
        {getCardValue(card)}
      </div>

      {displayStyle === "linear" ? (
        <div
          className="mt-1 truncate text-xs font-semibold opacity-70"
          style={labelTextStyle}
        >
          {card.unitLabel || card.linearLabel || card.label || ""}
        </div>
      ) : null}
    </div>

    {displayStyle === "linear" &&
    card.imagePosition === "right" &&
    card.imageUrl ? (
      <img
        src={card.imageUrl}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{
          width: `${Number(card.imageSize ?? 40)}px`,
          height: `${Number(card.imageSize ?? 40)}px`,
        }}
      />
    ) : displayStyle === "linear" &&
      card.imagePosition === "right" &&
      card.showIcon !== false &&
      card.icon ? (
      <div className="shrink-0 text-2xl">{card.icon}</div>
    ) : !displayStyle || displayStyle !== "linear" ? (
      card.showIcon !== false && card.icon ? (
        <div className="shrink-0 text-2xl">{card.icon}</div>
      ) : null
    ) : null}
  </div>

  {shouldShowProgress ? (
    <div className="mt-3">
      <div
        className="h-2 overflow-hidden rounded-full"
        style={{
          background: isLightDesign(designKey)
            ? "rgba(17,24,39,0.10)"
            : "rgba(255,255,255,0.16)",
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            background:
              valueTextStyle.color ??
              (isLightDesign(designKey)
                ? "rgba(37,99,235,0.85)"
                : "rgba(255,255,255,0.92)"),
          }}
        />
      </div>

      {card.showProgressPercentage ? (
        <div
          className="mt-1 text-[11px] opacity-60"
          style={descriptionTextStyle}
        >
          {percent}% complete
        </div>
      ) : null}
    </div>
  ) : null}

  {displayStyle !== "linear" && getCardDescription(card) ? (
    <div
      className="mt-3 text-xs opacity-60"
      style={descriptionTextStyle}
    >
      {getCardDescription(card)}
    </div>
  ) : null}
</div>

                    {displayStyle === "linear" && getLinearDividerCss(cardIndex) ? (
                      <span style={getLinearDividerCss(cardIndex)} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          {!useCardRenderer && isLoading ? (
            <div className="text-xs text-neutral-400">Loading...</div>
          ) : null}

          {!useCardRenderer && !isLoading && mode === "top_messages" && !resolvedSourceBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              Select a source thread block.
            </div>
          ) : null}

          {!useCardRenderer && !isLoading && mode === "poll_results" && !resolvedSourceBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              Select a source poll block.
            </div>
          ) : null}

          {!useCardRenderer && !isLoading && mode === "rsvp_count" && !sourceFormBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              Select a source form block.
            </div>
          ) : null}

          {!useCardRenderer && !isLoading && mode === "total_funds" && !sourceFormBlockId ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              Select a source form block.
            </div>
          ) : null}

          {!useCardRenderer && !isLoading && mode === "top_messages" && resolvedSourceBlockId && !items.length ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              No data yet.
            </div>
          ) : null}

          {!useCardRenderer && !isLoading && mode === "poll_results" && resolvedSourceBlockId && !items.length ? (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-sm opacity-60"
              style={bodyTextStyle}
            >
              No votes yet.
            </div>
          ) : null}

          {!useCardRenderer && !isLoading && mode === "rsvp_count" && !!sourceFormBlockId ? (
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

              <div className="mt-3 text-xs opacity-60" style={bodyTextStyle}>
                Live RSVP count from submitted forms.
              </div>
            </div>
          ) : null}

          {!useCardRenderer && !isLoading && mode === "total_funds" && !!sourceFormBlockId ? (
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

              <div className="mt-3 text-xs opacity-60" style={bodyTextStyle}>
                Live funding total from submitted forms.
              </div>
            </div>
          ) : null}

          {!useCardRenderer && mode === "top_messages" ? (
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
              style={{
                pointerEvents: "auto",
                WebkitOverflowScrolling: "touch",
              }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${highlightColumns}, minmax(0, 1fr))`,
                }}
              >
                {items.slice(0, limit).map((msg: any, index: number) => {
                  const msgAttachments = Array.isArray(msg.attachments)
                    ? msg.attachments.filter(
                        (item: any) =>
                          item &&
                          typeof item.id === "string" &&
                          (item.type === "image" ||
                            item.type === "gif" ||
                            item.type === "video" ||
                            item.type === "audio") &&
                          (typeof item.dataUrl === "string" ||
                            typeof item.url === "string"),
                      )
                    : [];

                  return (
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
                                color:
                                  bodyTextStyle.color ??
                                  getDefaultTextColor(designKey),
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

                          <div className="mt-2 text-sm leading-5" style={bodyTextStyle}>
                            {msg.message_text || msg.message}
                          </div>

                          {msgAttachments.length ? (
                            <div className="mt-3 grid gap-2">
                              {msgAttachments.map((attachment: any) => {
                                const src = attachment.url || attachment.dataUrl || "";

                                if (!src) return null;

                                if (attachment.type === "video") {
                                  return (
                                    <video
                                      key={attachment.id}
                                      src={src}
                                      controls
                                      className="w-full rounded-xl border"
                                      style={{
                                        maxHeight: "180px",
                                        objectFit: "contain",
                                      }}
                                    />
                                  );
                                }

                                if (attachment.type === "audio") {
                                  return (
                                    <audio
                                      key={attachment.id}
                                      src={src}
                                      controls
                                      className="w-full"
                                    />
                                  );
                                }

                                return (
                                  <img
                                    key={attachment.id}
                                    src={src}
                                    alt={attachment.name || "Thread attachment"}
                                    className="mx-auto rounded-xl border"
                                    style={{
                                      maxHeight: "180px",
                                      maxWidth: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                );
                              })}
                            </div>
                          ) : null}
                        </div>

                        <div
                          className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
                          style={{
                            background: isLightDesign(designKey)
                              ? "rgba(17,24,39,0.08)"
                              : "rgba(255,255,255,0.12)",
                            color:
                              bodyTextStyle.color ?? getDefaultTextColor(designKey),
                          }}
                        >
                          👍 {msg.votes ?? 0}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {!useCardRenderer && mode === "poll_results" ? (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${highlightColumns}, minmax(0, 1fr))`,
              }}
            >
              {items.slice(0, limit).map((item: any) => {
                const percent =
                  countValue > 0 ? Math.round((item.count / countValue) * 100) : 0;

                return (
                  <div key={item.optionId} className={getHighlightCardClass(designKey)}>
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
                            background: isLightDesign(designKey)
                              ? "rgba(17,24,39,0.10)"
                              : "rgba(255,255,255,0.16)",
                          }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percent}%`,
                              background:
                                bodyTextStyle.color ??
                                (isLightDesign(designKey)
                                  ? "rgba(37,99,235,0.85)"
                                  : "rgba(255,255,255,0.92)"),
                            }}
                          />
                        </div>

                        <div className="mt-2 text-xs opacity-70" style={bodyTextStyle}>
                          {percent}% of votes
                        </div>
                      </div>

                      <div
                        className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
                        style={{
                          background: isLightDesign(designKey)
                            ? "rgba(17,24,39,0.08)"
                            : "rgba(255,255,255,0.14)",
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
    typeof block.data.contentHtml === "string"
      ? block.data.contentHtml
      : typeof block.data.content === "string"
        ? block.data.content
        : "";

  const plainText =
    typeof block.data.plainText === "string"
      ? block.data.plainText
      : html.replace(/<[^>]*>/g, "").trim();

  const behavior = (block.data as any).behavior ?? {};
  const maxHeight = Number(behavior.maxHeight ?? 0);
  const scrollable = Boolean(behavior.scrollable && maxHeight > 0);

  return (
    <div
      className={[
        "h-full w-full min-w-0 overflow-hidden p-3",
        !plainText.trim() ? "pointer-events-none" : "",
      ].join(" ")}
      style={getAppearanceStyle(block)}
    >
      {block.data.title ? (
        <div
          className="mb-2 font-semibold break-words"
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
        className={[
          "rich-text-content min-w-0 max-w-full break-words",
          "[&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:list-decimal [&_ol]:pl-6",
          "[&_li]:ml-1 [&_li]:list-item [&_li>p]:m-0 [&_li>p]:inline",
          "[&_p]:my-0 [&_p+p]:mt-3 [&_p:empty]:min-h-[1em]",
          "[&_a]:underline [&_a]:break-words",
          "[&_h1]:text-[1.8em] [&_h1]:font-bold [&_h1]:leading-tight",
          "[&_h2]:text-[1.45em] [&_h2]:font-bold [&_h2]:leading-tight",
          "[&_h3]:text-[1.2em] [&_h3]:font-semibold [&_h3]:leading-tight",
          "[&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic",
          "[&_img]:max-w-full [&_img]:h-auto",
          scrollable ? "overflow-y-auto" : "overflow-hidden",
        ].join(" ")}
        style={{
          ...style,
          lineHeight: 1.4,
          maxHeight: scrollable ? `${maxHeight}px` : undefined,
        }}
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
      <Surface block={block} designKey={designKey} className="">
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

  const displayStyle = (block.data as any).displayStyle ?? "bar";

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

if (displayStyle === "meter") {
  const sectionCount = Math.max(
    1,
    Math.min(20, Number((block.data as any).meterSectionCount) || 6),
  );

  const startColor = (block.data as any).meterStartColor || "#f59e0b";
  const endColor = (block.data as any).meterEndColor || "#dc2626";
  const needleColor = (block.data as any).meterNeedleColor || "#e5e7eb";
  const caption = (block.data as any).meterCaption ?? "";
  const captionStyle = getContainerTextStyle(
    ((block.data as any).meterCaptionStyle ?? {}) as TextStyle,
    designKey,
  );

  const centerX = 140;
  const centerY = 132;
  const outerRadius = 106;
  const innerRadius = 78;
  const gapDegrees = 2.2;
  const sectionDegrees = 180 / sectionCount;
  const needlePercent = Math.max(0, Math.min(100, percent));
  const needleAngle = 180 + (needlePercent / 100) * 180;

  const hexToRgb = (hex: string) => {
    const normalized = hex.replace("#", "");
    const parsed = Number.parseInt(
      normalized.length === 3
        ? normalized
            .split("")
            .map((char) => char + char)
            .join("")
        : normalized,
      16,
    );

    return {
      r: (parsed >> 16) & 255,
      g: (parsed >> 8) & 255,
      b: parsed & 255,
    };
  };

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
      .map((value) =>
        Math.max(0, Math.min(255, Math.round(value)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;

  const mixColor = (from: string, to: string, amount: number) => {
    const start = hexToRgb(from);
    const end = hexToRgb(to);

    return rgbToHex(
      start.r + (end.r - start.r) * amount,
      start.g + (end.g - start.g) * amount,
      start.b + (end.b - start.b) * amount,
    );
  };

  const pointOnCircle = (radius: number, angle: number) => {
    const radians = (angle * Math.PI) / 180;

    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  };

  const describeGaugeSection = (startAngle: number, endAngle: number) => {
    const outerStart = pointOnCircle(outerRadius, startAngle);
    const outerEnd = pointOnCircle(outerRadius, endAngle);
    const innerEnd = pointOnCircle(innerRadius, endAngle);
    const innerStart = pointOnCircle(innerRadius, startAngle);

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
      "Z",
    ].join(" ");
  };

  const needleTip = pointOnCircle(innerRadius + 12, needleAngle);
  const needleBaseLeft = pointOnCircle(10, needleAngle + 112);
  const needleBaseRight = pointOnCircle(10, needleAngle - 112);

  return (
    <Surface block={block} designKey={designKey} className="">
    <div className="text-center text-base font-semibold" style={backgroundStyle}>
      {block.data.heading || "Progress"}
    </div>

      <div className="mt-4 flex min-h-0 flex-1 justify-center">
        <div className="relative h-full w-full">
          <svg
  viewBox="0 0 280 170"
  className="h-full w-full overflow-visible"
  preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Progress meter ${percent}%`}
          >
            <defs>
              <filter
                id={`progress-meter-soft-shadow-${block.id}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="2.25"
                  floodOpacity="0.28"
                />
              </filter>
            </defs>

            {Array.from({ length: sectionCount }).map((_, index) => {
              const startAngle =
                180 + index * sectionDegrees + gapDegrees / 2;
              const endAngle =
                180 + (index + 1) * sectionDegrees - gapDegrees / 2;

              const color =
                sectionCount === 1
                  ? startColor
                  : mixColor(startColor, endColor, index / (sectionCount - 1));

              return (
                <path
                  key={`meter-arc-${index}`}
                  d={describeGaugeSection(startAngle, endAngle)}
                  fill={color}
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth="1"
                  filter={`url(#progress-meter-soft-shadow-${block.id})`}
                />
              );
            })}

            <polygon
              points={`${needleTip.x},${needleTip.y} ${needleBaseLeft.x},${needleBaseLeft.y} ${needleBaseRight.x},${needleBaseRight.y}`}
              fill={needleColor}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="1"
              filter={`url(#progress-meter-soft-shadow-${block.id})`}
            />

            <circle
              cx={centerX}
              cy={centerY}
              r="11"
              fill={needleColor}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="2"
              filter={`url(#progress-meter-soft-shadow-${block.id})`}
            />
          </svg>

{showContext ? (
  <div
    className="-mt-5 w-full text-center text-xs font-medium"
    style={{
      ...contextStyle,
      textAlign: "center",
    }}
  >
    {contextText}
  </div>
) : null}

{caption ? (
  <div className="mt-1 text-center" style={captionStyle}>
    {caption}
  </div>
) : null}
        </div>
      </div>

    </Surface>
  );
}

const barMode = ((block.data as any).barMode ?? "progressive") as
  | "progressive"
  | "split";

const barForegroundColor =
  (block.data as any).barForegroundColor ??
  (barStyle as any).color ??
  (isLightDesign(designKey) ? "#111827" : "#ffffff");

const barBackgroundColor =
  (block.data as any).barBackgroundColor ??
  (barStyle as any).scopeBackgroundColor ??
  (barStyle as any).backgroundColor ??
  (isLightDesign(designKey) ? "#e5e7eb" : "rgba(255,255,255,0.12)");

const splitHeadingA = ((block.data as any).splitHeadingA ?? "Option A").trim();
const splitHeadingB = ((block.data as any).splitHeadingB ?? "Option B").trim();

const splitHeadingSeparator =
  ((block.data as any).splitHeadingSeparator ?? "none") as
    | "none"
    | "|"
    | ":"
    | "-";

const splitLeftPercent = percent;
const splitRightPercent = Math.max(0, 100 - splitLeftPercent);

const splitLabelA =
  splitHeadingSeparator === "none"
    ? splitHeadingA
    : `${splitHeadingA} ${splitHeadingSeparator}`;

const splitLabelB =
  splitHeadingSeparator === "none"
    ? splitHeadingB
    : `${splitHeadingSeparator} ${splitHeadingB}`;

const splitContextLocation =
  contextLocation === "bottom" ? "bottom" : "top";

if (barMode === "split") {
  return (
    <Surface block={block} designKey={designKey} className="">
      <div className="text-base font-semibold" style={backgroundStyle}>
        {block.data.heading || "Progress"}
      </div>

      <div className="mt-4">
        {showContext && splitContextLocation === "top" ? (
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0 text-sm font-semibold" style={contextStyle}>
              <span className="truncate">{splitLabelA}</span>{" "}
              <span>{splitLeftPercent}%</span>
            </div>

            <div
              className="min-w-0 text-right text-sm font-semibold"
              style={contextStyle}
            >
              <span>{splitRightPercent}%</span>{" "}
              <span className="truncate">{splitLabelB}</span>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0 text-sm font-semibold" style={contextStyle}>
              <span className="truncate">{splitLabelA}</span>
            </div>

            <div
              className="min-w-0 text-right text-sm font-semibold"
              style={contextStyle}
            >
              <span className="truncate">{splitLabelB}</span>
            </div>
          </div>
        )}

        <div
          className="flex h-4 w-full overflow-hidden rounded-full border"
          style={{
            backgroundColor: barBackgroundColor,
            borderColor: (barStyle as any).borderColor ?? undefined,
          }}
        >
          <div
            className="h-full"
            style={{
              width: `${splitLeftPercent}%`,
              backgroundColor: barForegroundColor,
            }}
          />

          <div
            className="h-full"
            style={{
              width: `${splitRightPercent}%`,
              backgroundColor: barBackgroundColor,
            }}
          />
        </div>

        {showContext && splitContextLocation === "bottom" ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold" style={contextStyle}>
              {splitLeftPercent}%
            </div>

            <div className="text-xs font-semibold" style={contextStyle}>
              {splitRightPercent}%
            </div>
          </div>
        ) : null}
      </div>
    </Surface>
  );
}

return (
  <Surface block={block} designKey={designKey} className="">
    <div className="flex items-start justify-between gap-3">
      <div className="text-base font-semibold" style={backgroundStyle}>
        {block.data.heading || "Progress"}
      </div>

      {contextLocation === "top-right" ? contextNode : null}
    </div>

    <div
      className="mt-4 h-4 w-full overflow-hidden rounded-full border"
      style={{
        backgroundColor: barBackgroundColor,
        borderColor: (barStyle as any).borderColor ?? undefined,
      }}
    >
      <div
        className="h-full"
        style={{
          width: `${percent}%`,
          backgroundColor: barForegroundColor,
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

function renderVisitorCounter(
  block: Extract<MicrositeBlock, { type: "visitor_counter" }>,
  designKey?: string,
  micrositeId?: string | null,
) {
  function VisitorCounterPreview() {
    const variant = block.data.variant ?? "flip";
    const alignment = block.data.alignment ?? "center";
    const metricType = block.data.metricType ?? "site_visits";
    const animationDelayMs = Math.max(
      0,
      Number(block.data.animationDelayMs ?? 1500),
    );

    const [count, setCount] = useState(0);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;

      async function loadCount() {
        if (!micrositeId) {
          setCount(0);
          setLastUpdated(null);
          return;
        }

        try {
          const params = new URLSearchParams({
            micrositeId,
            metricType,
          });

          const res = await fetch(
            `/api/public/visitor-count?${params.toString()}`,
            { cache: "no-store" },
          );

          const data = await res.json();

          if (!res.ok) throw new Error();

          window.setTimeout(() => {
            if (cancelled) return;

            setCount(Number(data.count ?? 0));
            setLastUpdated(data.lastUpdated ?? null);
          }, animationDelayMs);
        } catch {
          if (!cancelled) {
            setCount(0);
            setLastUpdated(null);
          }
        }
      }

      void loadCount();

      return () => {
        cancelled = true;
      };
    }, [micrositeId, metricType, animationDelayMs]);

    const baseTextStyle = getContainerTextStyle(block.data.style, designKey);
    const numberTextStyle = getContainerTextStyle(
      block.data.numberStyle ?? block.data.style,
      designKey,
    );
    const labelTextStyle = getContainerTextStyle(
      block.data.labelStyle ?? block.data.style,
      designKey,
    );

    const alignClass =
      alignment === "left"
        ? "items-start text-left"
        : alignment === "right"
          ? "items-end text-right"
          : "items-center text-center";

    const formattedCount = new Intl.NumberFormat("en-US").format(count);
    const digits = String(count).padStart(4, "0").split("");

    const digitTileClass = [
      "flex h-12 min-w-9 items-center justify-center rounded-xl px-2 text-2xl font-black shadow-sm transition-all duration-500",
      isLightDesign(designKey)
        ? "bg-neutral-950 text-white"
        : "bg-white text-neutral-950",
    ].join(" ");

    return (
      <Surface block={block} designKey={designKey} className="">
        <div className={`flex h-full min-h-0 flex-col justify-center gap-3 ${alignClass}`}>
          {block.data.showHeading !== false ? (
            <div className="text-base font-semibold" style={baseTextStyle}>
              {block.data.heading || "Visitor Count"}
            </div>
          ) : null}

          {block.data.showSubtitle === true && block.data.subtitle ? (
            <div className="text-xs opacity-70" style={baseTextStyle}>
              {block.data.subtitle}
            </div>
          ) : null}

          {variant === "smooth_count" ? (
            <div
              className="leading-none transition-all duration-500"
              style={{
                fontSize: 48,
                fontWeight: 900,
                ...numberTextStyle,
              }}
            >
              {formattedCount}
            </div>
          ) : variant === "dial" ? (
            <div className="flex justify-center gap-1.5">
              {digits.map((digit, index) => (
                <div
                  key={`${block.id}-dial-${index}`}
                  className={[
                    "relative flex h-14 min-w-9 items-center justify-center overflow-hidden rounded-2xl border px-2 text-2xl font-black shadow-sm transition-all duration-500",
                    isLightDesign(designKey)
                      ? "border-neutral-200 bg-white text-neutral-950"
                      : "border-white/10 bg-white/10 text-white",
                  ].join(" ")}
                  style={numberTextStyle}
                >
                  <div className="absolute inset-x-1 top-1 h-px bg-white/30" />
                  <div className="absolute inset-x-1 bottom-1 h-px bg-black/10" />
                  {digit}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center gap-1.5">
              {digits.map((digit, index) => (
                <div
                  key={`${block.id}-flip-${index}`}
                  className={digitTileClass}
                  style={numberTextStyle}
                >
                  {digit}
                </div>
              ))}
            </div>
          )}

          {block.data.showLabel !== false ? (
            <div
              className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70"
              style={labelTextStyle}
            >
              {block.data.showIcon !== false ? "👁️ " : ""}
              {block.data.label || "Visitors"}
            </div>
          ) : null}

          {block.data.showLastUpdated === true ? (
            <div className="text-[11px] opacity-50" style={baseTextStyle}>
              {lastUpdated ? "Last updated just now" : "Waiting for visits"}
            </div>
          ) : null}
        </div>
      </Surface>
    );
  }

  return <VisitorCounterPreview />;
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

  const isConfigured = donationOptions.length > 0;
  const [donationError, setDonationError] = useState("");
  const [customAmountOpen, setCustomAmountOpen] = useState(false);
  const [customAmountValue, setCustomAmountValue] = useState("");

  const buttonStyle = (block.data as any).buttonStyle ?? {};
  const showCustomAmount = (block.data as any).allowCustomAmount !== false;
  const customAmountLabel =
    (block.data as any).customAmountLabel || "Custom Amount";

  const buttonBaseStyle = {
    marginLeft: `${Math.max(0, Number(block.data.buttonSpacing ?? 8)) / 2}px`,
    marginRight: `${Math.max(0, Number(block.data.buttonSpacing ?? 8)) / 2}px`,
    backgroundColor:
      buttonStyle.backgroundColor ??
      (isLightDesign(designKey) ? "#171717" : "#ffffff"),
    color:
      buttonStyle.color ?? (isLightDesign(designKey) ? "#ffffff" : "#171717"),
    fontFamily: buttonStyle.fontFamily ?? block.data.style?.fontFamily,
    fontSize:
      typeof buttonStyle.fontSize === "number"
        ? `${buttonStyle.fontSize}px`
        : undefined,
    fontWeight: buttonStyle.bold ? 700 : 600,
    fontStyle: buttonStyle.italic ? "italic" : undefined,
    textDecoration:
      [
        buttonStyle.underline ? "underline" : "",
        buttonStyle.strike ? "line-through" : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined,
  };

  async function handleDonationCheckout(amount: number, optionLabel?: string) {
    if (!micrositeId) {
      setDonationError(
        "Donation checkout only works on a live microsite right now.",
      );
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
        setDonationError(json.error || "Donation checkout failed");
        return;
      }

      if (json.url) {
        window.location.href = json.url;
        return;
      }

      setDonationError("No checkout URL returned.");
    } catch (err) {
      console.error("Donation checkout error:", err);
      setDonationError("Something went wrong");
    }
  }

  function handleCustomAmountContinue() {
    const amount = Number(customAmountValue);

    if (!Number.isFinite(amount) || amount <= 0) {
      setDonationError("Enter a valid donation amount.");
      return;
    }

    setCustomAmountOpen(false);
    void handleDonationCheckout(amount, "Custom Donation");
  }

  return (
    <>
      <Surface block={block} designKey={designKey} className="">
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

        {isConfigured || showCustomAmount ? (
          <div
            className="mt-4 flex flex-row flex-wrap items-center"
            style={{
              marginLeft: `-${
                Math.max(0, Number(block.data.buttonSpacing ?? 8)) / 2
              }px`,
              marginRight: `-${
                Math.max(0, Number(block.data.buttonSpacing ?? 8)) / 2
              }px`,
            }}
          >
            {donationOptions.map((option, index) => {
              const amount = Number(option.amount || 0);
              const label =
                typeof option.label === "string" &&
                option.label.trim().length > 0
                  ? option.label.trim()
                  : `$${formatCurrency(amount)}`;

              return (
                <button
                  key={option.id || `donation-option-${index}`}
                  type="button"
                  onClick={() => void handleDonationCheckout(amount, label)}
                  disabled={!micrositeId}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                  style={buttonBaseStyle}
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

            {showCustomAmount ? (
              <button
                type="button"
                onClick={() => setCustomAmountOpen(true)}
                disabled={!micrositeId}
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                style={buttonBaseStyle}
                title={
                  !micrositeId
                    ? "Donation checkout only works on live microsites right now."
                    : undefined
                }
              >
                {customAmountLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <div
            className={[
              "mt-4 rounded-xl border border-dashed px-4 py-6 text-sm",
              "border-neutral-300 text-neutral-500",
            ].join(" ")}
          >
            Add fixed donation options in the builder.
          </div>
        )}
      </Surface>

      <AppModal
        open={customAmountOpen}
        title="Custom Donation"
        description="Enter the amount you would like to donate."
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={handleCustomAmountContinue}
        onCancel={() => setCustomAmountOpen(false)}
      >
        <div className="mt-4">
          <label className="text-sm font-medium text-neutral-700">
            Donation Amount
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={customAmountValue}
            onChange={(e) => setCustomAmountValue(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            placeholder="25.00"
          />
        </div>
      </AppModal>

      <AppModal
        open={Boolean(donationError)}
        title="Checkout Error"
        cancelText="OK"
        onCancel={() => setDonationError("")}
      >
        <p className="text-sm text-neutral-700">{donationError}</p>
      </AppModal>
    </>
  );
}

function renderLinkHub(
  block: Extract<MicrositeBlock, { type: "link_hub" }>,
  designKey?: string,
) {
  const items = Array.isArray(block.data.items) ? block.data.items : [];

  const imagePlacement = (block.data as any).imagePlacement ?? "floatLeft";
  const isFlush =
    imagePlacement === "flushLeft" || imagePlacement === "flushRight";
  const imageOnRight =
    imagePlacement === "flushRight" || imagePlacement === "floatRight";

  const cardPaddingX = Number((block.data as any).cardPaddingX ?? 16);
  const cardPaddingY = Number((block.data as any).cardPaddingY ?? 12);
  const imageWidth = Number((block.data as any).imageWidth ?? 40);
  const triggerSymbolSize = Number(
    (block.data as any).triggerSymbolSize ?? 40,
  );

  const triggerSymbol =
    (block.data as any).customTriggerEnabled &&
    (block.data as any).customTriggerUrl
      ? (block.data as any).customTriggerUrl
      : (block.data as any).triggerSymbol || "/icons/icon_thin_chevron.png";

  const cardShadow =
    (block.data as any).cardShadowEnabled &&
    Number((block.data as any).cardShadowBlur ?? 0) > 0
      ? `${Number((block.data as any).cardShadowX ?? 0)}px ${Number(
          (block.data as any).cardShadowY ?? 0,
        )}px ${Number((block.data as any).cardShadowBlur ?? 0)}px ${
          (block.data as any).cardShadowColor ?? "#000000"
        }`
      : undefined;

  return (
    <Surface block={block} className="">
      {String(block.data.heading ?? "").trim() ? (
        <div
          className="mb-3 text-base font-semibold"
          style={getContainerTextStyle(block.data.style, designKey)}
        >
          {block.data.heading}
        </div>
      ) : null}

      {items.length ? (
        <div
  className="flex flex-col"
  style={{
    gap: `${Number((block.data as any).cardGap ?? 12)}px`,
  }}
>
          {items.map((item, index) => {
            const linkItem = item as typeof item & {
              description?: string;
              showUrl?: boolean;
              logoUrl?: string;
              autoGenerateLogo?: boolean;
            };

            const logoUrl = linkItem.logoUrl;
            const description = String(linkItem.description ?? "").trim();

const imageFrame = (block.data as any).imageFrame ?? "circle";

const imageNode = logoUrl ? (
  <span
    className={[
      "flex shrink-0 items-center justify-center overflow-hidden",
      isFlush
        ? "self-stretch rounded-none border-0"
        : imageFrame === "square"
          ? "rounded-lg border"
          : "rounded-full border",
      isLightDesign(designKey) ? "border-neutral-200" : "border-white/15",
    ].join(" ")}
    style={{
      width: `${imageWidth}px`,
      minWidth: `${imageWidth}px`,
      backgroundColor: "transparent",
      ...(isFlush
        ? {}
        : {
            height: `${imageWidth}px`,
          }),
    }}
  >
    <img
      src={logoUrl}
      alt=""
      className="h-full w-full object-contain"
    />
  </span>
) : null;

            const triggerNode =
              !imageOnRight && triggerSymbol ? (
                <span
                  className="flex self-stretch shrink-0 items-center justify-center"
                  style={{
                  width: `${triggerSymbolSize + 20}px`,
                  minWidth: `${triggerSymbolSize + 20}px`,
                  }}
                >
                  <img
                    src={triggerSymbol}
                    alt=""
                    className="block max-h-none max-w-none object-contain"
                    style={{
                      width: `${triggerSymbolSize}px`,
                      height: `${triggerSymbolSize}px`,
                    }}
                  />
                </span>
              ) : null;

            return (
              <a
                key={item.id}
                href={normalizePreviewHref(item.url)}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(e) => e.stopPropagation()}
                className={[
                  "group relative z-10 flex cursor-pointer items-stretch gap-3 overflow-hidden rounded-xl border transition pointer-events-auto",
                  isLightDesign(designKey)
                    ? "border-neutral-200 bg-white hover:bg-neutral-50"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                ].join(" ")}
style={{
  boxShadow: cardShadow,
  backgroundColor:
    (block.data as any).cardTransparentBackground
      ? "transparent"
      : ((block.data as any).cardBackgroundColor ?? undefined),
  borderColor: (block.data as any).cardBorderColor ?? undefined,
  borderWidth:
    typeof (block.data as any).cardBorderWidth === "number"
      ? `${(block.data as any).cardBorderWidth}px`
      : undefined,
  borderRadius:
    typeof (block.data as any).cardBorderRadius === "number"
      ? `${(block.data as any).cardBorderRadius}px`
      : undefined,
  paddingLeft: isFlush ? 0 : `${cardPaddingX}px`,
                  paddingRight: isFlush ? 0 : `${cardPaddingX}px`,
                  paddingTop: isFlush ? 0 : `${cardPaddingY}px`,
                  paddingBottom: isFlush ? 0 : `${cardPaddingY}px`,
                }}
              >
                {!imageOnRight ? imageNode : null}

                <div
                  className="min-w-0 flex flex-1 flex-col justify-center"
                  style={{
                    paddingLeft: isFlush ? `${cardPaddingX}px` : undefined,
                    paddingRight: isFlush ? `${cardPaddingX}px` : undefined,
                    paddingTop: isFlush ? `${cardPaddingY}px` : undefined,
                    paddingBottom: isFlush ? `${cardPaddingY}px` : undefined,
                  }}
                >
                  <div
                    className="truncate text-sm font-medium"
                    style={getContainerTextStyle(
                      (block.data as any).labelStyle ?? block.data.style,
                      designKey,
                    )}
                  >
                    {item.label || `Link ${index + 1}`}
                  </div>

                  {description ? (
                    <div
                      className="mt-1 truncate text-xs"
                      style={getContainerTextStyle(
                        (block.data as any).descriptionStyle ??
                          block.data.style,
                        designKey,
                      )}
                    >
                      {description}
                    </div>
                  ) : null}

                  {linkItem.showUrl && item.url ? (
                    <div
                      className="mt-1 truncate text-xs"
                      style={getContainerTextStyle(
                        (block.data as any).urlStyle ?? block.data.style,
                        designKey,
                      )}
                    >
                      {item.url
                        .replace(/^https?:\/\//i, "")
                        .replace(/^\/\//, "")}
                    </div>
                  ) : null}
                </div>

                {triggerNode}

                {imageOnRight ? imageNode : null}
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

function renderCalendarEvent(
  block: Extract<MicrositeBlock, { type: "calendar_event" }>,
  designKey?: string,
) {
  const events = Array.isArray(block.data.events)
    ? block.data.events.map((event) => ({
        id: typeof event.id === "string" && event.id ? event.id : "event",
        title: typeof event.title === "string" ? event.title : "Event",
        subtitle: typeof event.subtitle === "string" ? event.subtitle : "",
        date: typeof event.date === "string" ? event.date : "",
        startTime: typeof event.startTime === "string" ? event.startTime : "",
        endTime: typeof event.endTime === "string" ? event.endTime : "",
        meetingMethod:
          typeof event.meetingMethod === "string" ? event.meetingMethod : "",
        location: typeof event.location === "string" ? event.location : "",
        address: typeof event.address === "string" ? event.address : "",
        virtualLink:
          typeof event.virtualLink === "string" ? event.virtualLink : "",
        notes: typeof event.notes === "string" ? event.notes : "",
        host: typeof event.host === "string" ? event.host : "",
        category: typeof event.category === "string" ? event.category : "",
        capacity: typeof event.capacity === "string" ? event.capacity : "",
        rsvpRequired: Boolean(event.rsvpRequired),
        imageUrl: typeof event.imageUrl === "string" ? event.imageUrl : "",
        imageStoragePath:
          typeof event.imageStoragePath === "string"
            ? event.imageStoragePath
            : "",
        imageAlt: typeof event.imageAlt === "string" ? event.imageAlt : "",
        imagePosition:
          event.imagePosition === "left" || event.imagePosition === "right"
            ? event.imagePosition
            : "right",
        buttonText:
          typeof event.buttonText === "string" ? event.buttonText : "",
        buttonUrl: typeof event.buttonUrl === "string" ? event.buttonUrl : "",
        addToCalendarText:
          typeof event.addToCalendarText === "string"
            ? event.addToCalendarText
            : "Add to Calendar",
addToCalendarUrl:
  typeof event.addToCalendarUrl === "string"
    ? event.addToCalendarUrl
    : "",

showLive: Boolean((event as any).showLive),
showStartTime: (event as any).showStartTime !== false,
showEndTime: (event as any).showEndTime !== false,
showSubtitle: (event as any).showSubtitle !== false,
      }))
    : [];

  const calendarStyle = {
    backgroundColor:
      typeof block.data.calendarStyle?.backgroundColor === "string"
        ? block.data.calendarStyle.backgroundColor
        : "",
    textColor:
      typeof block.data.calendarStyle?.textColor === "string"
        ? block.data.calendarStyle.textColor
        : "",
    activeDateColor:
      typeof block.data.calendarStyle?.activeDateColor === "string"
        ? block.data.calendarStyle.activeDateColor
        : "",
    todayBorderColor:
      typeof block.data.calendarStyle?.todayBorderColor === "string"
        ? block.data.calendarStyle.todayBorderColor
        : "",
    eventDotColor:
      typeof block.data.calendarStyle?.eventDotColor === "string"
        ? block.data.calendarStyle.eventDotColor
        : "",
    dateBorderColor:
      typeof block.data.calendarStyle?.dateBorderColor === "string"
        ? block.data.calendarStyle.dateBorderColor
        : "",
    scheduledLabelColor:
      typeof block.data.calendarStyle?.scheduledLabelColor === "string"
        ? block.data.calendarStyle.scheduledLabelColor
        : "",
    monthLabelColor:
      typeof block.data.calendarStyle?.monthLabelColor === "string"
        ? block.data.calendarStyle.monthLabelColor
        : "",
    monthArrowColor:
      typeof block.data.calendarStyle?.monthArrowColor === "string"
        ? block.data.calendarStyle.monthArrowColor
        : "",
    selectedDateBackgroundColor:
      typeof block.data.calendarStyle?.selectedDateBackgroundColor === "string"
        ? block.data.calendarStyle.selectedDateBackgroundColor
        : "",
    selectedDateBorderColor:
      typeof block.data.calendarStyle?.selectedDateBorderColor === "string"
        ? block.data.calendarStyle.selectedDateBorderColor
        : "",
    formBackgroundColor:
      typeof block.data.calendarStyle?.formBackgroundColor === "string"
        ? block.data.calendarStyle.formBackgroundColor
        : "",
  };

  const detailStyle = {
    backgroundColor:
      typeof block.data.detailStyle?.backgroundColor === "string"
        ? block.data.detailStyle.backgroundColor
        : "",
    textColor:
      typeof block.data.detailStyle?.textColor === "string"
        ? block.data.detailStyle.textColor
        : "",
    borderColor:
      typeof block.data.detailStyle?.borderColor === "string"
        ? block.data.detailStyle.borderColor
        : "",
    borderRadius:
      typeof block.data.detailStyle?.borderRadius === "number" &&
      Number.isFinite(block.data.detailStyle.borderRadius)
        ? block.data.detailStyle.borderRadius
        : 16,
    shadowEnabled: Boolean(block.data.detailStyle?.shadowEnabled),
  };

  const headingTextStyle = getContainerTextStyle(
  (block.data as any).headingStyle ?? block.data.style,
  designKey,
);

const subtitleTextStyle = getContainerTextStyle(
  (block.data as any).subtitleStyle ?? block.data.style,
  designKey,
);

const eventTitleTextStyle = getContainerTextStyle(
  (block.data as any).eventTitleStyle ?? block.data.style,
  designKey,
);

const eventSubtitleTextStyle = getContainerTextStyle(
  (block.data as any).eventSubtitleStyle ?? block.data.style,
  designKey,
);

const eventDateTextStyle = getContainerTextStyle(
  (block.data as any).eventDateStyle ?? block.data.style,
  designKey,
);

const eventDetailsTextStyle = getContainerTextStyle(
  (block.data as any).eventDetailsStyle ?? block.data.style,
  designKey,
);

  const baseTextStyle = getContainerTextStyle(block.data.style, designKey);

  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  const todayDate = new Date();
  const todayKey = todayDate.toISOString().slice(0, 10);

  const fallbackSelectedDate =
    block.data.defaultSelectedDate || events[0]?.date || todayKey;

  const [selectedDate, setSelectedDate] = useState(fallbackSelectedDate);

  const initialMonthDate = (() => {
    const monthSource =
      block.data.defaultMonth ||
      fallbackSelectedDate.slice(0, 7) ||
      todayKey.slice(0, 7);

    const parsed = new Date(`${monthSource}-01T00:00:00`);

    return Number.isNaN(parsed.getTime())
      ? new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
      : parsed;
  })();

  const [visibleMonth, setVisibleMonth] = useState(initialMonthDate);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = Array.from({ length: firstDay + daysInMonth }).map(
    (_, index) => {
      if (index < firstDay) return null;

      const dayNumber = index - firstDay + 1;
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        dayNumber,
      ).padStart(2, "0")}`;

      return { dayNumber, dateKey };
    },
  );

  function moveMonth(direction: number) {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  }

  function formatEventDate(dateValue?: string) {
    if (!dateValue) return "Date TBD";

    const parsed = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return parsed.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatEventTime(timeValue?: string) {
  if (!timeValue) return "";

  const timeFormat = (block.data as any).timeFormat ?? "12h";

  if (timeFormat === "24h") return timeValue;

  const [hourRaw, minuteRaw] = timeValue.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return timeValue;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

  function formatCompactDate(dateValue?: string) {
    if (!dateValue) return "Date TBD";

    const parsed = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    const format = block.data.compactDateFormat ?? "weekday";

    if (format === "numeric") {
      return parsed.toLocaleDateString(undefined, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }

    if (format === "short") {
      return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }

    return parsed.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  function eventStatusLabel(dateValue?: string) {
    if (!dateValue) return "";
    if (dateValue < todayKey) return "Past Event";
    if (dateValue === todayKey) return "Today";
    return "Upcoming";
  }

  function copyMeetingLink(eventId: string, link?: string) {
    if (!link || typeof navigator === "undefined" || !navigator.clipboard) return;

    void navigator.clipboard.writeText(link).then(() => {
      setCopiedEventId(eventId);
      setTimeout(() => setCopiedEventId(null), 1600);
    });
  }

  const sortedEvents = [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const selectedEvents = events.filter((event) => event.date === selectedDate);

  const visibleEvents =
    block.data.variant === "simplified" ? sortedEvents : selectedEvents;

  const selectedDateLabel =
    block.data.variant === "simplified" ? "" : formatEventDate(selectedDate);

  const selectedDateCount = visibleEvents.length;

  const compactMaxVisibleEvents =
    typeof block.data.compactMaxVisibleEvents === "number" &&
    Number.isFinite(block.data.compactMaxVisibleEvents)
      ? Math.max(1, Math.min(20, block.data.compactMaxVisibleEvents))
      : 4;

  const compactEvents = sortedEvents.slice(0, compactMaxVisibleEvents);
  const compactHasMoreEvents = sortedEvents.length > compactEvents.length;

  const calendarPanel = (
    <div
      className={[
        "rounded-[1.75rem] border p-4 shadow-sm",
        isLightDesign(designKey)
          ? "border-neutral-200 bg-white"
          : "border-white/10 bg-white/5",
      ].join(" ")}
      style={{
        backgroundColor: calendarStyle.backgroundColor || undefined,
        color: calendarStyle.textColor || baseTextStyle.color || undefined,
        fontFamily: baseTextStyle.fontFamily,
        fontSize: baseTextStyle.fontSize,
        fontWeight: baseTextStyle.fontWeight,
        fontStyle: baseTextStyle.fontStyle,
        textDecoration: baseTextStyle.textDecoration,
      }}
    >
      {block.data.showCalendarHeading !== false ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className={[
              "inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg leading-none transition",
              isLightDesign(designKey)
                ? "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
                : "border-white/10 bg-white/10 hover:bg-white/15",
            ].join(" ")}
            style={{
              color:
                calendarStyle.monthArrowColor ||
                calendarStyle.textColor ||
                baseTextStyle.color ||
                undefined,
              fontFamily: baseTextStyle.fontFamily,
            }}
            aria-label="Previous month"
          >
            ‹
          </button>

          <div className="flex-1 text-center">
            <div
              className="text-center text-sm font-bold"
              style={{
                ...baseTextStyle,
                textAlign: "center",
                color:
                  calendarStyle.monthLabelColor ||
                  calendarStyle.textColor ||
                  baseTextStyle.color ||
                  undefined,
              }}
            >
              {monthLabel}
            </div>

            {block.data.showEventCount !== false ? (
              <div
                className="mt-0.5 text-center text-[11px]"
                style={{
                  color:
                    calendarStyle.scheduledLabelColor ||
                    calendarStyle.textColor ||
                    baseTextStyle.color ||
                    undefined,
                  fontFamily: baseTextStyle.fontFamily,
                  fontWeight: baseTextStyle.fontWeight,
                  fontStyle: baseTextStyle.fontStyle,
                }}
              >
                {events.length} scheduled{" "}
                {events.length === 1 ? "event" : "events"}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => moveMonth(1)}
            className={[
              "inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg leading-none transition",
              isLightDesign(designKey)
                ? "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
                : "border-white/10 bg-white/10 hover:bg-white/15",
            ].join(" ")}
            style={{
              color:
                calendarStyle.monthArrowColor ||
                calendarStyle.textColor ||
                baseTextStyle.color ||
                undefined,
              fontFamily: baseTextStyle.fontFamily,
            }}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      ) : null}

      <div
        className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] opacity-60"
        style={{
          color: calendarStyle.textColor || baseTextStyle.color || undefined,
          fontFamily: baseTextStyle.fontFamily,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayEvents = events.filter((event) => event.date === cell.dateKey);
          const hasEvent = dayEvents.length > 0;
          const eventCount = dayEvents.length;
          const isSelected = selectedDate === cell.dateKey;
          const isToday = todayKey === cell.dateKey;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelectedDate(cell.dateKey);
              }}
              className={[
                "pointer-events-auto group relative z-10 flex aspect-square flex-col items-center justify-center rounded-2xl border text-xs font-semibold transition",
                isSelected
                  ? "shadow-md"
                  : isLightDesign(designKey)
                    ? "bg-neutral-50 hover:bg-white"
                    : "bg-white/5 hover:bg-white/10",
              ].join(" ")}
              style={{
                backgroundColor:
                  isSelected && calendarStyle.selectedDateBackgroundColor
                    ? calendarStyle.selectedDateBackgroundColor
                    : isSelected && calendarStyle.activeDateColor
                      ? calendarStyle.activeDateColor
                      : undefined,
                borderColor:
                  isSelected && calendarStyle.selectedDateBorderColor
                    ? calendarStyle.selectedDateBorderColor
                    : isToday && calendarStyle.todayBorderColor
                      ? calendarStyle.todayBorderColor
                      : !isToday && !isSelected && calendarStyle.dateBorderColor
                        ? calendarStyle.dateBorderColor
                        : undefined,
                color:
                  calendarStyle.textColor || baseTextStyle.color || undefined,
                fontFamily: baseTextStyle.fontFamily,
                fontSize: baseTextStyle.fontSize,
                fontWeight: baseTextStyle.fontWeight,
                fontStyle: baseTextStyle.fontStyle,
              }}
              aria-label={`View events for ${cell.dateKey}`}
            >
              <span>{cell.dayNumber}</span>

              {hasEvent ? (
                <>
                  <span className="mt-1 flex items-center justify-center gap-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            calendarStyle.eventDotColor ||
                            calendarStyle.textColor ||
                            baseTextStyle.color ||
                            undefined,
                        }}
                      />
                    ))}
                  </span>

                  {eventCount > 1 ? (
                    <span
                      className={[
                        "absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold",
                        isSelected
                          ? "bg-white text-neutral-950"
                          : "bg-neutral-900 text-white",
                      ].join(" ")}
                    >
                      {eventCount}
                    </span>
                  ) : null}
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  const eventCards = (
    <div className="space-y-3">
      {block.data.variant !== "simplified" ? (
        <div
          className={[
            "rounded-2xl border px-4 py-3",
            isLightDesign(designKey)
              ? "border-neutral-200 bg-neutral-50"
              : "border-white/10 bg-white/5",
          ].join(" ")}
          style={{
            color: calendarStyle.textColor || baseTextStyle.color || undefined,
            fontFamily: baseTextStyle.fontFamily,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.12em] opacity-60">
                Selected Date
              </div>

              <div
                className="mt-1 text-sm font-semibold"
                style={headingTextStyle}
              >
                {selectedDateLabel}
              </div>
            </div>

            {block.data.showEventCount !== false ? (
              <div
                className={[
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  isLightDesign(designKey)
                    ? "border-neutral-300 bg-white"
                    : "border-white/15 bg-white/10",
                ].join(" ")}
              >
                {selectedDateCount}{" "}
                {selectedDateCount === 1 ? "event" : "events"}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {visibleEvents.length ? (
        visibleEvents.map((event) => {
          const status = eventStatusLabel(event.date);
          const shouldShowImage =
            block.data.showEventImages !== false && Boolean(event.imageUrl);

          return (
            <div
              key={event.id}
              className={[
                "rounded-2xl border p-4",
                detailStyle.shadowEnabled ? "shadow-lg" : "",
                isLightDesign(designKey)
                  ? "border-neutral-200 bg-white"
                  : "border-white/10 bg-white/5",
              ].join(" ")}
              style={{
                backgroundColor: detailStyle.backgroundColor || undefined,
                borderColor: detailStyle.borderColor || undefined,
                color:
                  detailStyle.textColor || baseTextStyle.color || undefined,
                fontFamily: baseTextStyle.fontFamily,
                fontSize: baseTextStyle.fontSize,
                fontWeight: baseTextStyle.fontWeight,
                fontStyle: baseTextStyle.fontStyle,
                borderRadius:
                  typeof detailStyle.borderRadius === "number"
                    ? detailStyle.borderRadius
                    : undefined,
              }}
            >
              <div
                className={[
                  "flex gap-4",
                  shouldShowImage && event.imagePosition === "left"
                    ? "flex-col sm:flex-row"
                    : shouldShowImage
                      ? "flex-col sm:flex-row-reverse"
                      : "flex-col",
                ].join(" ")}
              >
                {shouldShowImage ? (
                  <div className="w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
                    <img
                      src={event.imageUrl}
                      alt={event.imageAlt || event.title || "Event image"}
                      className="h-40 w-full object-cover sm:h-full"
                    />
                  </div>
                ) : null}

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {block.data.showCategoryBadge !== false && event.category ? (
                      <div className="inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-80">
                        {event.category}
                      </div>
                    ) : null}

                    {status ? (
                      <div className="inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
                        {status}
                      </div>
                    ) : null}

                    {block.data.showRsvpBadge !== false && event.rsvpRequired ? (
                      <div className="inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
                        RSVP Required
                      </div>
                    ) : null}
                  </div>

<div className="font-semibold" style={eventTitleTextStyle}>
  {event.title || "Event"}
</div>

                  {event.subtitle ? (
                    <div className="mt-1 text-sm">
                      {event.subtitle}
                    </div>
                  ) : null}

                  <div className="mt-3 text-xs" style={eventDateTextStyle}>
{formatEventDate(event.date)}
{[
  event.showStartTime !== false ? formatEventTime(event.startTime) : "",
  event.showEndTime !== false ? formatEventTime(event.endTime) : "",
].filter(Boolean).length
  ? ` • ${[
event.showStartTime !== false ? formatEventTime(event.startTime) : "",
event.showEndTime !== false ? formatEventTime(event.endTime) : "",
    ]
      .filter(Boolean)
      .join(" - ")}`
  : ""}
                  </div>

                  {event.location || event.meetingMethod ? (
                    <div className="mt-2 text-sm" style={eventDetailsTextStyle}>
                      {[event.meetingMethod, event.location]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  ) : null}

{event.address ? (
  <div className="mt-1 text-sm" style={eventDetailsTextStyle}>
    {event.address}
  </div>
) : null}

{block.data.showHost !== false && event.host ? (
  <div className="mt-2 text-xs" style={eventDetailsTextStyle}>
    Hosted by {event.host}
  </div>
) : null}

{block.data.showCapacity !== false && event.capacity ? (
  <div className="mt-1 text-xs" style={eventDetailsTextStyle}>
    Capacity: {event.capacity}
  </div>
) : null}

{event.notes ? (
  <div className="mt-2 text-sm" style={eventDetailsTextStyle}>
    {event.notes}
  </div>
) : null}

                  {event.virtualLink ? (
                    <a
                      href={event.virtualLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold underline"
                    >
                      Open virtual link
                    </a>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.virtualLink ? (
                      <button
                        type="button"
                        onClick={() =>
                          copyMeetingLink(event.id, event.virtualLink)
                        }
                        className="inline-flex rounded-xl border px-4 py-2 text-xs font-semibold"
                      >
                        {copiedEventId === event.id
                          ? "Copied!"
                          : "Copy Meeting Link"}
                      </button>
                    ) : null}

                    {event.addToCalendarText && event.addToCalendarUrl ? (
                      <a
                        href={event.addToCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-xl border px-4 py-2 text-xs font-semibold"
                      >
                        {event.addToCalendarText}
                      </a>
                    ) : null}

                    {block.data.showCtaButtons !== false &&
                    event.buttonText &&
                    event.buttonUrl ? (
                      <a
                        href={event.buttonUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white"
                      >
                        {event.buttonText}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : block.data.showEmptyState !== false ? (
        <div
          className={[
            "rounded-2xl border border-dashed px-6 py-10 text-center",
            isLightDesign(designKey)
              ? "border-neutral-300 bg-neutral-50 text-neutral-500"
              : "border-white/15 bg-white/5 text-white/60",
          ].join(" ")}
          style={{
            fontFamily: baseTextStyle.fontFamily,
            color: baseTextStyle.color || undefined,
          }}
        >
          <div className="text-3xl">📅</div>

          <div className="mt-3 font-medium">
            {block.data.emptyStateText || "No events scheduled for this date."}
          </div>

          <div className="mt-1 text-xs opacity-70">
            Select another date to view scheduled activities.
          </div>
        </div>
      ) : null}
    </div>
  );

  const compactList = (
    <div className="space-y-3">
      {compactEvents.map((event) => {
        const shouldShowImage =
          block.data.showCompactImages !== false && Boolean(event.imageUrl);

        return (
          <div
            key={event.id}
            className={[
              "flex items-center gap-4 rounded-2xl border p-3",
              isLightDesign(designKey)
                ? "border-neutral-200 bg-white"
                : "border-white/10 bg-white/5",
            ].join(" ")}
            style={{
              backgroundColor: detailStyle.backgroundColor || undefined,
              borderColor: detailStyle.borderColor || undefined,
              color: detailStyle.textColor || baseTextStyle.color || undefined,
              fontFamily: baseTextStyle.fontFamily,
              borderRadius:
                typeof detailStyle.borderRadius === "number"
                  ? detailStyle.borderRadius
                  : undefined,
            }}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-neutral-100 text-xs font-semibold">
              {shouldShowImage ? (
                <img
                  src={event.imageUrl}
                  alt={event.imageAlt || event.title || "Event image"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>📅</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
<div className="relative pr-14">
  <div className="truncate font-semibold" style={eventTitleTextStyle}>
    {event.title || "Event"}
  </div>

  {event.showLive ? (
    <span
      className="absolute right-0 top-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.15em] text-white"
      style={{
        backgroundColor: "#dc2626",
      }}
    >
      LIVE
    </span>
  ) : null}
</div>

{event.showSubtitle !== false && event.subtitle ? (
  <div
    className="mt-1 truncate text-xs opacity-75"
    style={eventSubtitleTextStyle}
  >
    {event.subtitle}
  </div>
) : null}

<div className="mt-1 text-xs opacity-75" style={eventDateTextStyle}>
{formatCompactDate(event.date)}
{[
  event.showStartTime !== false ? formatEventTime(event.startTime) : "",
  event.showEndTime !== false ? formatEventTime(event.endTime) : "",
].filter(Boolean).length
  ? ` • ${[
      event.showStartTime !== false ? formatEventTime(event.startTime) : "",
      event.showEndTime !== false ? formatEventTime(event.endTime) : "",
    ]
      .filter(Boolean)
      .join(" - ")}`
  : ""}
              </div>

{event.location || event.meetingMethod ? (
  <div
    className="mt-1 truncate text-sm opacity-80"
    style={eventDetailsTextStyle}
  >
    {[event.meetingMethod, event.location]
      .filter(Boolean)
      .join(" • ")}
  </div>
) : null}


            </div>
          </div>
        );
      })}

      {compactHasMoreEvents && block.data.compactViewAllUrl ? (
        <a
          href={block.data.compactViewAllUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-semibold underline"
          style={{
            color:
              detailStyle.textColor ||
              eventDetailsTextStyle.color ||
              baseTextStyle.color ||
              undefined,
            fontFamily:
              eventDetailsTextStyle.fontFamily ||
              baseTextStyle.fontFamily,
          }}
        >
          {block.data.compactViewAllText || "View All Events"} →
        </a>
      ) : null}
    </div>
  );

  return (
<Surface
  block={block}
  designKey={designKey}
  className={
    block.appearance?.backgroundColor === "transparent" ||
    calendarStyle.formBackgroundColor === "transparent"
      ? "h-full overflow-auto bg-transparent shadow-none"
      : `${getSoftSurfaceClass(designKey)} h-full overflow-auto`
  }
>
  <div
    className="rounded-[inherit]"
    style={{
      backgroundColor:
        block.appearance?.backgroundColor === "transparent" ||
        calendarStyle.formBackgroundColor === "transparent"
          ? "transparent"
          : calendarStyle.formBackgroundColor ||
            block.appearance?.backgroundColor ||
            undefined,
      boxShadow:
        block.appearance?.backgroundColor === "transparent" ||
        calendarStyle.formBackgroundColor === "transparent"
          ? "none"
          : undefined,
      fontFamily: baseTextStyle.fontFamily,
      color: baseTextStyle.color || undefined,
    }}
  >
{block.data.showHeading !== false ? (
  <div className="mb-3 flex items-center gap-3">
    {(block.data as any).showHeadingImage &&
    (block.data as any).headingImageUrl ? (
      <img
        src={(block.data as any).headingImageUrl}
        alt=""
        style={{
          width: `${(block.data as any).headingImageSize ?? 80}px`,
          height: `${(block.data as any).headingImageSize ?? 80}px`,
          objectFit: "cover",
          borderRadius: 12,
        }}
      />
    ) : null}

    <div className="text-base font-semibold" style={headingTextStyle}>
      {block.data.heading || "Event Calendar"}
    </div>
  </div>
) : null}

{block.data.showSubtitle !== false ? (
  <div className="mt-1 text-sm opacity-80" style={subtitleTextStyle}>
    {block.data.subtitle || "Select a date to view event details."}
  </div>
) : null}

        {block.data.variant === "compact" ? (
          <div className="mt-4">{compactList}</div>
        ) : block.data.variant === "simplified" ? (
          <div className="mt-4">{eventCards}</div>
        ) : block.data.variant === "formal" ? (
          <div className="mt-4 space-y-4">
            {calendarPanel}
            {eventCards}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
            {calendarPanel}
            {eventCards}
          </div>
        )}
      </div>
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

    const buttonSpacing = Math.max(0, Number(data.buttonSpacing ?? 12));

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
<Surface
  block={{
    ...block,
    appearance: {
      ...block.appearance,
      backgroundColor:
        block.appearance?.backgroundColor === "#FFFFFF"
          ? "transparent"
          : block.appearance?.backgroundColor,
    },
  }}
>
  <div
    className="flex h-full w-full flex-col bg-transparent"
    style={{
      gap: `${Math.max(buttonSpacing, 20)}px`,
      backgroundColor: "transparent",
    }}
  >
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
  className=""
>
          <div className="flex h-full w-full flex-col gap-3">
            <div
              className="text-base font-semibold"
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              {block.data.heading || "Cart"}
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
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

  window.requestAnimationFrame(() => {
    const nextInput = document.querySelector(
      `[data-spreadsheet-cell="${block.id}:${nextCellKey}"]`,
    ) as HTMLInputElement | HTMLTextAreaElement | null;

    if (!nextInput) return;

    nextInput.focus();

    if ("select" in nextInput) {
      nextInput.select();
    }
  });
};

  return (
    <div className="isolate relative z-0 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
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
    event.stopPropagation();

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
    event.stopPropagation();

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
  onDownloadFrame,
  onFocusTimelineEntry,
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

    case "icon":
      return renderIcon(block);

case "listing":
  return renderListing(
    block,
    designKey,
    safeListingQuantities,
    onChangeListingQuantity,
  );

    case "image_carousel":
      return renderImageCarousel(block, designKey);

    case "form_field":
      return renderFormField(block, designKey);

    case "option_button":
      return renderOptionButton(block, designKey);

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

    case "checkout":
      return renderCheckout(block, designKey, micrositeId);
case "cta":
  return renderCta(block, designKey, micrositeSlug);

    case "countdown":
      return renderCountdown(block, designKey, serverNow);

case "timeline":
  return renderTimeline(block, designKey, onFocusTimelineEntry);

    case "audio":
      return renderAudio(block);

    case "frame":
      return renderFrame(block, onDownloadFrame);
    case "links":
      return renderLinks(block, designKey, previewMode, micrositeSlug);
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
    case "enrollment_board":
      return (
        <EnrollmentBoardBlock
          block={block}
          micrositeId={micrositeId}
          designKey={designKey}
        />
      );

case "post_board":
  return renderPostBoard(block, designKey, micrositeId);
    case "padding":
      return <div className="h-full w-full" />;
    case "showcase":
      return renderShowcase(block);
    case "festiveBackground":
      return renderFestiveBackground(block, designKey);
    case "shape":
      return block.data.shapeType === "line" ? (
        <div
          className="h-full w-full overflow-hidden"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {renderShape(block)}
        </div>
      ) : (
        renderShape(block)
      );
    case "wave":
    return renderWave(block);
    case "highlight":
      return renderHighlight(block, designKey, micrositeId, micrositeSlug);
    case "visitor_counter":
      return renderVisitorCounter(block, designKey, micrositeId);
    case "rich_text":
      return renderRichText(block, designKey);
    case "content_panel":
      return <ContentPanelBlock block={block} designKey={designKey} />;
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
    case "tournament_display":
      return <TournamentDisplayBlock block={block} designKey={designKey} />;
    case "calendar_event":
      return renderCalendarEvent(block, designKey);
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