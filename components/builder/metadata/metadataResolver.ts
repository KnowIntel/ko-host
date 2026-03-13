import type { BuilderDraft, GridPlacement, TextStyle } from "@/lib/templates/builder";
import type {
  OverlayDesignMetadata,
  OverlayPageElement,
} from "@/lib/templates/templateDesignOverlayMetadata";

import type { DesignPresetLayout } from "@/lib/templates/designPresets";

import { getTemplateDesignOverlayMetadata } from "@/lib/templates/templateDesignOverlayMetadata";

type PageVisibility = {
  title: boolean;
  subtitle: boolean;
  subtext: boolean;
  description: boolean;
};

type GridPlacementWithLayer = GridPlacement & {
  zIndex?: number;
};

type DraftWithExtras = BuilderDraft & {
  pageColor?: string | null;
  pageVisibility?: Partial<PageVisibility>;
  pageElements?: {
    title?: Partial<GridPlacementWithLayer>;
    subtitle?: Partial<GridPlacementWithLayer>;
    subtext?: Partial<GridPlacementWithLayer>;
    description?: Partial<GridPlacementWithLayer>;
  };
};

function coerceDraft(draft: BuilderDraft): DraftWithExtras {
  return draft as DraftWithExtras;
}

export function getMetadata(
  templateKey: string,
  designKey: string,
): OverlayDesignMetadata | null {
  return getTemplateDesignOverlayMetadata(
    templateKey,
    designKey as DesignPresetLayout,
  );
}

export function getMetadataPageElement(
  metadata: OverlayDesignMetadata | null,
  key: "title" | "subtitle" | "tagline" | "description",
): OverlayPageElement | null {
  if (!metadata) return null;
  return metadata.page[key] ?? null;
}

export function getResolvedPageVisibility(
  draft: BuilderDraft,
  metadata: OverlayDesignMetadata | null,
): PageVisibility {
  const visibility = coerceDraft(draft).pageVisibility ?? {};

  return {
    title:
      visibility.title ??
      getMetadataPageElement(metadata, "title")?.enabled ??
      true,

    subtitle:
      visibility.subtitle ??
      getMetadataPageElement(metadata, "subtitle")?.enabled ??
      true,

    subtext:
      visibility.subtext ??
      getMetadataPageElement(metadata, "tagline")?.enabled ??
      false,

    description:
      visibility.description ??
      getMetadataPageElement(metadata, "description")?.enabled ??
      true,
  };
}

export function getResolvedPageStyle(
  draftStyle: TextStyle | undefined,
  metadataStyle: TextStyle | undefined,
) {
  return draftStyle ?? metadataStyle;
}

export function getResolvedPageValue(
  draftValue: string | undefined,
  metadataValue: string | undefined,
) {
  return draftValue || metadataValue || "";
}

export function getResolvedPageGrid(
  draftGrid: Partial<GridPlacementWithLayer> | undefined,
  metadataGrid: GridPlacement | undefined,
  fallback: GridPlacementWithLayer,
) {
  return draftGrid ?? metadataGrid ?? fallback;
}

export function getResolvedPageColor(
  draft: BuilderDraft,
  designKey: string,
  metadata: OverlayDesignMetadata | null,
) {
  const explicit = coerceDraft(draft).pageColor;

  if (explicit) return explicit;

  if (metadata?.pageColor) return metadata.pageColor;

  if (designKey === "modern") return "#0f1115";
  if (designKey === "elegant") return "#f7f2eb";
  if (designKey === "festive") return "#f8f1ea";

  return "#ffffff";
}

export function getCanvasInnerBackgroundStyle(
  draft: BuilderDraft,
  designKey: string,
  metadata: OverlayDesignMetadata | null,
): React.CSSProperties {

  const pageColor = getResolvedPageColor(draft, designKey, metadata);
  const backgroundImage = draft.pageBackground || metadata?.pageBackground || "";

  if (designKey === "modern") {
    return {
      backgroundColor: pageColor,
      backgroundImage: backgroundImage
        ? `linear-gradient(rgba(15,17,21,0.18), rgba(23,26,33,0.18)), url(${backgroundImage})`
        : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  return {
    backgroundColor: pageColor,
    backgroundImage: backgroundImage
      ? `linear-gradient(rgba(255,255,255,0.18), rgba(255,255,255,0.18)), url(${backgroundImage})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}