import type { BuilderDraft, MicrositeBlock } from "@/lib/templates/builder";
import type {
  BuilderDraftWithVisuals,
  DesignPreset,
  DesignPresetLayout,
} from "@/lib/templates/designPresets";
import { designPresets } from "@/lib/templates/designPresets";

export type OverlayContent = {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImageUrl?: string | null;
  pageColor?: string | null;
  blocks?: MicrositeBlock[];
};

export type PresetLayoutResolvedDraft = BuilderDraftWithVisuals & {
  pageBackground?: string;
  description?: string;
  meta: {
    presetId: DesignPresetLayout;
    layoutMode: DesignPreset["layout"];
    allowOverlap: boolean;
    allowHalfStep: boolean;
    gridStep: number;
    showTitle: boolean;
    showSubtitle: boolean;
    showDescription: boolean;
  };
};

type DraftLike = Partial<BuilderDraft> & {
  backgroundImageUrl?: string | null;
  pageBackground?: string | null;
  pageColor?: string | null;
};

function hasMeaningfulText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function cloneBlocks(blocks: MicrositeBlock[] | undefined): MicrositeBlock[] {
  if (!blocks?.length) return [];
  return JSON.parse(JSON.stringify(blocks)) as MicrositeBlock[];
}

function resolveTextField(
  existingValue: string | null | undefined,
  overlayValue: string | null | undefined,
): string {
  if (typeof existingValue === "string") return existingValue;
  if (typeof overlayValue === "string") return overlayValue;
  return "";
}

export function getPresetDefinition(
  presetId: DesignPresetLayout | string | null | undefined,
): DesignPreset {
  const resolved =
    presetId && presetId in designPresets
      ? designPresets[presetId as DesignPresetLayout]
      : designPresets.showcase;

  return resolved;
}

export function buildDraftFromPreset(params: {
  presetId: DesignPresetLayout | string | null | undefined;
  overlay?: OverlayContent | null;
  existingDraft?: DraftLike | null;
}): PresetLayoutResolvedDraft {
  const { presetId, overlay, existingDraft } = params;

  const preset = getPresetDefinition(presetId);

  const title = resolveTextField(existingDraft?.title, overlay?.title);
  const subtitle = resolveTextField(existingDraft?.subtitle, overlay?.subtitle);
  const description = resolveTextField(
    (existingDraft as DraftLike & { description?: string })?.description,
    overlay?.description,
  );

  const existingBlocks = cloneBlocks(
    existingDraft?.blocks as MicrositeBlock[] | undefined,
  );
  const overlayBlocks = cloneBlocks(overlay?.blocks);
  const presetBlocks = cloneBlocks(preset.defaultBlocks);

  const blocks =
    overlayBlocks.length > 0
      ? overlayBlocks
      : existingBlocks.length > 0
        ? existingBlocks
        : presetBlocks;

  const backgroundImageUrl =
    existingDraft?.backgroundImageUrl ??
    existingDraft?.pageBackground ??
    overlay?.backgroundImageUrl ??
    preset.styleTheme.backgroundImageUrl ??
    null;

  const pageColor =
    existingDraft?.pageColor ??
    overlay?.pageColor ??
    preset.styleTheme.pageColor;

  return {
    title,
    subtitle,
    subtext:
      (existingDraft as DraftLike & { subtext?: string })?.subtext ?? "",
    slugSuggestion:
      (existingDraft as DraftLike & { slugSuggestion?: string })
        ?.slugSuggestion ?? "",
    blocks,
    description,
    backgroundImageUrl,
    pageBackground: backgroundImageUrl ?? undefined,
    pageColor: pageColor ?? undefined,
    meta: {
      presetId: preset.id,
      layoutMode: preset.layout,
      allowOverlap: preset.gridRules.allowOverlap,
      allowHalfStep: preset.gridRules.allowHalfStep,
      gridStep: preset.gridRules.gridStep,
      showTitle: hasMeaningfulText(title),
      showSubtitle: hasMeaningfulText(subtitle),
      showDescription: hasMeaningfulText(description),
    },
  };
}

export function shouldRenderTitle(
  draft: Pick<BuilderDraft, "title">,
): boolean {
  return hasMeaningfulText(draft.title);
}

export function shouldRenderSubtitle(
  draft: Pick<BuilderDraft, "subtitle">,
): boolean {
  return hasMeaningfulText(draft.subtitle);
}

export function shouldRenderDescription(
  draft: { description?: string | null },
): boolean {
  return hasMeaningfulText(draft.description);
}

export function getPresetGridConfig(presetId: DesignPresetLayout) {
  const preset = getPresetDefinition(presetId);

  return {
    layoutMode: preset.layout,
    gridStep: preset.gridRules.gridStep,
    allowOverlap: preset.gridRules.allowOverlap,
    allowHalfStep: preset.gridRules.allowHalfStep,
  };
}