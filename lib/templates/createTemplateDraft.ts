import type {
  BuilderDraft,
  GridPlacement,
  MicrositeBlock,
  TextStyle,
  LabelBlock,
  ImageBlock,
  LinksBlock,
  CtaBlock,
  CountdownBlock,
  GalleryBlock,
  PollBlock,
  RsvpBlock,
  FaqBlock,
  MessageThreadBlock,
  ShowcaseBlock,
  FestiveBackgroundBlock,
  PaddingBlock,
} from "@/lib/templates/builder";
import {
  buildDraftFromPreset,
} from "@/lib/templates/presetLayoutEngine";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";
import { TEMPLATE_DESIGN_OVERLAY_CONTENT } from "@/lib/templates/templateDesignOverlayContent";
import { normalizeTemplateName } from "@/lib/templates/normalizeTemplateName";
import {
  getTemplateDesignOverlayMetadata,
  type OverlayDesignMetadata,
  type OverlayPlacement,
  type OverlaySeedBlock,
} from "@/lib/templates/templateDesignOverlayMetadata";
import {
  createDefaultTextStyle,
  makeId,
} from "@/lib/templates/builder";

type DraftLike = Partial<BuilderDraft> & {
  description?: string;
  backgroundImageUrl?: string | null;
  pageBackground?: string | null;
  pageColor?: string | null;
};

type OverlayLike = {
  title?: string;
  subtitle?: string;
  description?: string;
  blocks?: BuilderDraft["blocks"];
  backgroundImageUrl?: string | null;
  pageBackground?: string | null;
  pageColor?: string | null;
};

/* ---------------------------------------- */
/* Legacy overlay reader                     */
/* ---------------------------------------- */

function readLegacyOverlay(
  templateName: string,
  presetId: DesignPresetLayout,
): OverlayLike | null {
  const normalizedTemplateName = normalizeTemplateName(templateName);
  const templateOverlay = (
    TEMPLATE_DESIGN_OVERLAY_CONTENT as Record<
      string,
      Partial<Record<DesignPresetLayout, OverlayLike>> | undefined
    >
  )[normalizedTemplateName];

  if (!templateOverlay) return null;

  const overlay = templateOverlay[presetId];
  if (!overlay) return null;

  return {
    title: typeof overlay.title === "string" ? overlay.title : undefined,
    subtitle:
      typeof overlay.subtitle === "string" ? overlay.subtitle : undefined,
    description:
      typeof overlay.description === "string" ? overlay.description : undefined,
    blocks: Array.isArray(overlay.blocks) ? overlay.blocks : undefined,
    backgroundImageUrl:
      typeof overlay.backgroundImageUrl === "string"
        ? overlay.backgroundImageUrl
        : null,
    pageBackground:
      typeof overlay.pageBackground === "string" ? overlay.pageBackground : null,
    pageColor: typeof overlay.pageColor === "string" ? overlay.pageColor : null,
  };
}

/* ---------------------------------------- */
/* Grid helper                               */
/* ---------------------------------------- */

function coerceGrid(
  grid: OverlayPlacement | undefined,
  fallback: GridPlacement,
): GridPlacement {
  if (!grid) return fallback;

  return {
    colStart: grid.colStart,
    rowStart: grid.rowStart,
    colSpan: grid.colSpan,
    rowSpan: grid.rowSpan,
    ...(grid.zIndex !== undefined ? { zIndex: grid.zIndex } : {}),
  };
}

function getFallbackGrid(): GridPlacement {
  return {
    colStart: 1,
    rowStart: 1,
    colSpan: 12,
    rowSpan: 1,
    zIndex: 1,
  };
}

/* ---------------------------------------- */
/* Typed seed block builders                 */
/* ---------------------------------------- */

function buildLabelBlock(seed: OverlaySeedBlock): LabelBlock {
  return {
    id: seed.key || makeId("label"),
    type: "label",
    label: "Label",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      text: String(seed.data?.text ?? "Label"),
      style: (seed.data?.style as TextStyle | undefined) ?? createDefaultTextStyle(),
    },
  };
}

function buildImageBlock(seed: OverlaySeedBlock): ImageBlock {
  return {
    id: seed.key || makeId("image"),
    type: "image",
    label: "Image",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      image: {
        id: String((seed.data as any)?.image?.id ?? makeId("img")),
        url: String((seed.data as any)?.image?.url ?? ""),
        alt: String((seed.data as any)?.image?.alt ?? ""),
      },
    },
  };
}

function buildLinksBlock(seed: OverlaySeedBlock): LinksBlock {
  return {
    id: seed.key || makeId("links"),
    type: "links",
    label: "Navigation Link",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      heading: String(seed.data?.heading ?? ""),
      items: Array.isArray(seed.data?.items)
        ? (seed.data?.items as LinksBlock["data"]["items"])
        : [],
    },
  };
}

function buildCtaBlock(seed: OverlaySeedBlock): CtaBlock {
  return {
    id: seed.key || makeId("cta"),
    type: "cta",
    label: "Button",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      heading: String(seed.data?.heading ?? ""),
      body: String(seed.data?.body ?? ""),
      buttonText: String(seed.data?.buttonText ?? "Learn More"),
      buttonUrl: String(seed.data?.buttonUrl ?? "#"),
    },
  };
}

function buildCountdownBlock(seed: OverlaySeedBlock): CountdownBlock {
  return {
    id: seed.key || makeId("countdown"),
    type: "countdown",
    label: "Countdown",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      heading: String(seed.data?.heading ?? ""),
      targetIso: String(seed.data?.targetIso ?? ""),
      completedMessage: String(seed.data?.completedMessage ?? "Countdown finished"),
    },
  };
}

function buildGalleryBlock(seed: OverlaySeedBlock): GalleryBlock {
  return {
    id: seed.key || makeId("gallery"),
    type: "gallery",
    label: "Gallery",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      grid: Number(seed.data?.grid ?? 3),
      images: Array.isArray(seed.data?.images)
        ? (seed.data?.images as GalleryBlock["data"]["images"])
        : [],
    },
  };
}

function buildPollBlock(seed: OverlaySeedBlock): PollBlock {
  return {
    id: seed.key || makeId("poll"),
    type: "poll",
    label: "Poll",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      question: String(seed.data?.question ?? "Poll"),
      options: Array.isArray(seed.data?.options)
        ? (seed.data?.options as PollBlock["data"]["options"])
        : [],
    },
  };
}

function buildRsvpBlock(seed: OverlaySeedBlock): RsvpBlock {
  return {
    id: seed.key || makeId("rsvp"),
    type: "rsvp",
    label: "RSVP",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      heading: String(seed.data?.heading ?? "RSVP"),
      collectName: Boolean(seed.data?.collectName ?? true),
      collectEmail: Boolean(seed.data?.collectEmail ?? true),
      collectPhone: Boolean(seed.data?.collectPhone ?? false),
      collectGuestCount: Boolean(seed.data?.collectGuestCount ?? false),
      collectNotes: Boolean(seed.data?.collectNotes ?? false),
    },
  };
}

function buildFaqBlock(seed: OverlaySeedBlock): FaqBlock {
  return {
    id: seed.key || makeId("faq"),
    type: "faq",
    label: "FAQ",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      items: Array.isArray(seed.data?.items)
        ? (seed.data?.items as FaqBlock["data"]["items"])
        : [],
    },
  };
}

function buildThreadBlock(seed: OverlaySeedBlock): MessageThreadBlock {
  return {
    id: seed.key || makeId("thread"),
    type: "thread",
    label: "Message Thread",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      subject: String(seed.data?.subject ?? ""),
      allowAnonymous: Boolean(seed.data?.allowAnonymous ?? false),
      requireApproval: Boolean(seed.data?.requireApproval ?? false),
      messages: Array.isArray(seed.data?.messages)
        ? (seed.data?.messages as NonNullable<MessageThreadBlock["data"]["messages"]>)
        : [],
    },
  };
}

function buildShowcaseBlock(seed: OverlaySeedBlock): ShowcaseBlock {
  return {
    id: seed.key || makeId("showcase"),
    type: "showcase",
    label: "Showcase",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      images: Array.isArray(seed.data?.images)
        ? (seed.data?.images as ShowcaseBlock["data"]["images"])
        : [],
    },
  };
}

function buildFestiveBackgroundBlock(
  seed: OverlaySeedBlock,
): FestiveBackgroundBlock {
  return {
    id: seed.key || makeId("festivebg"),
    type: "festiveBackground",
    label: "Background Image",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      image: {
        id: String((seed.data as any)?.image?.id ?? makeId("img")),
        url: String((seed.data as any)?.image?.url ?? ""),
      },
    },
  };
}

function buildPaddingBlock(seed: OverlaySeedBlock): PaddingBlock {
  return {
    id: seed.key || makeId("padding"),
    type: "padding",
    label: "Spacing",
    grid: coerceGrid(seed.grid, getFallbackGrid()),
    data: {
      height: Number(seed.data?.height ?? 40),
    },
  };
}

function buildSeededBlock(seed: OverlaySeedBlock): MicrositeBlock {
  switch (seed.type) {
    case "label":
      return buildLabelBlock(seed);
    case "image":
      return buildImageBlock(seed);
    case "links":
      return buildLinksBlock(seed);
    case "cta":
      return buildCtaBlock(seed);
    case "countdown":
      return buildCountdownBlock(seed);
    case "gallery":
      return buildGalleryBlock(seed);
    case "poll":
      return buildPollBlock(seed);
    case "rsvp":
      return buildRsvpBlock(seed);
    case "faq":
      return buildFaqBlock(seed);
    case "thread":
      return buildThreadBlock(seed);
    case "showcase":
      return buildShowcaseBlock(seed);
    case "festiveBackground":
      return buildFestiveBackgroundBlock(seed);
    case "padding":
      return buildPaddingBlock(seed);
    default:
      return buildLabelBlock({
        ...seed,
        type: "label",
      });
  }
}

/* ---------------------------------------- */
/* Metadata-based draft builder              */
/* ---------------------------------------- */

function buildDraftFromMetadata(params: {
  metadata: OverlayDesignMetadata;
  existingDraft?: Partial<BuilderDraft> | null;
}): BuilderDraft {
  const { metadata, existingDraft } = params;

  return {
    title: metadata.page.title.value ?? "",
    subtitle: metadata.page.subtitle.value ?? "",
    subtext: metadata.page.tagline.value ?? "",
    description: metadata.page.description.value ?? "",
    slugSuggestion:
      (existingDraft as { slugSuggestion?: string } | null | undefined)
        ?.slugSuggestion ?? "",
    titleStyle: metadata.page.title.style,
    subtitleStyle: metadata.page.subtitle.style,
    subtextStyle: metadata.page.tagline.style,
    descriptionStyle: metadata.page.description.style,
    pageVisibility: {
      title: metadata.page.title.enabled,
      subtitle: metadata.page.subtitle.enabled,
      subtext: metadata.page.tagline.enabled,
      description: metadata.page.description.enabled,
    },
    pageElements: {
      title: metadata.page.title.grid,
      subtitle: metadata.page.subtitle.grid,
      subtext: metadata.page.tagline.grid,
      description: metadata.page.description.grid,
    },
    pageBackground:
      metadata.pageBackground ??
      (existingDraft as DraftLike | null | undefined)?.pageBackground ??
      "",
    pageColor:
      metadata.pageColor ??
      (existingDraft as DraftLike | null | undefined)?.pageColor ??
      "",
    blocks: metadata.blocks.filter((block) => block.enabled).map(buildSeededBlock),
  } as BuilderDraft;
}

/* ---------------------------------------- */
/* Main template draft creator               */
/* ---------------------------------------- */

export function createTemplateDraft(params: {
  presetId: DesignPresetLayout;
  templateName: string;
  existingDraft?: Partial<BuilderDraft> | null;
}): BuilderDraft {
  const { presetId, templateName, existingDraft } = params;

  const metadata = getTemplateDesignOverlayMetadata(templateName, presetId);

  if (metadata) {
    return buildDraftFromMetadata({
      metadata,
      existingDraft: existingDraft ?? null,
    });
  }

  const legacyOverlay = readLegacyOverlay(templateName, presetId);

  const resolvedDraft = buildDraftFromPreset({
    presetId,
    overlay: legacyOverlay ?? undefined,
    existingDraft: (existingDraft as DraftLike | null | undefined) ?? null,
  });

  return {
    title: resolvedDraft.title ?? "",
    subtitle: resolvedDraft.subtitle ?? "",
    subtext: resolvedDraft.subtext ?? "",
    slugSuggestion:
      (
        existingDraft as
          | (Partial<BuilderDraft> & { slugSuggestion?: string })
          | null
          | undefined
      )?.slugSuggestion ?? "",
    description: resolvedDraft.description ?? "",
    blocks: resolvedDraft.blocks ?? [],
    pageBackground:
      resolvedDraft.pageBackground ??
      resolvedDraft.backgroundImageUrl ??
      legacyOverlay?.pageBackground ??
      legacyOverlay?.backgroundImageUrl ??
      (existingDraft as DraftLike | null | undefined)?.pageBackground ??
      (existingDraft as DraftLike | null | undefined)?.backgroundImageUrl ??
      "",
    pageColor:
      resolvedDraft.pageColor ??
      legacyOverlay?.pageColor ??
      (existingDraft as DraftLike | null | undefined)?.pageColor ??
      "",
  } as unknown as BuilderDraft;
}