import type {
  BuilderDraft,
  LinkItem,
  MicrositeBlock,
} from "@/lib/templates/builder";
import { normalizeTemplateName } from "@/lib/templates/normalizeTemplateName";
import { TEMPLATE_DESIGN_OVERLAY_CONTENT } from "@/lib/templates/templateDesignOverlayContent";

import {
  createDefaultCountdownBlock,
  createDefaultHeroButtonBlock,
  createDefaultLabelBlock,
  createDefaultLinksBlock,
} from "@/components/templates/design-editors/shared/editorUtils";

type OverlayLink = {
  label: string;
  url: string;
};

type ResolvedOverlayDraft = {
  title?: string;
  subtitle?: string;
  subtext?: string;
  description?: string;
  blocks: MicrositeBlock[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getTemplateOverlay(templateName: string) {
  const normalized = normalizeTemplateName(templateName);

  return (
    TEMPLATE_DESIGN_OVERLAY_CONTENT as Record<string, Record<string, any> | undefined>
  )[normalized] ?? null;
}

function createLinksBlockFromItems(
  items: OverlayLink[],
  heading?: string,
): MicrositeBlock | null {
  if (!items.length) return null;

  const linksBlock = createDefaultLinksBlock();

  if (isNonEmptyString(heading)) {
    linksBlock.data.heading = heading;
  }

  linksBlock.data.items = items.map((link: OverlayLink, index: number) => {
    const fallback = linksBlock.data.items[0];

    const item: LinkItem = {
      id: `${fallback.id}_${index + 1}`,
      label: link.label,
      url: link.url,
    };

    return item;
  });

  return linksBlock;
}

function createLabelBlocks(values: unknown[]): MicrositeBlock[] {
  return values
    .filter(isNonEmptyString)
    .map((text) => createDefaultLabelBlock(text));
}

function resolveShowcaseOverlay(layout: any): ResolvedOverlayDraft {
  const blocks: MicrositeBlock[] = [];

  const linkItems: OverlayLink[] = Array.isArray(layout?.links)
    ? layout.links.filter(
        (link: any) =>
          isNonEmptyString(link?.label) && isNonEmptyString(link?.url),
      )
    : [];

  const linksBlock = createLinksBlockFromItems(linkItems);

  if (linksBlock) blocks.push(linksBlock);

  if (isNonEmptyString(layout?.buttonLabel)) {
    blocks.push(createDefaultHeroButtonBlock(layout.buttonLabel));
  }

  return {
    title: isNonEmptyString(layout?.title) ? layout.title : undefined,
    subtitle: isNonEmptyString(layout?.subtitle) ? layout.subtitle : undefined,
    description: isNonEmptyString(layout?.description)
      ? layout.description
      : undefined,
    blocks,
  };
}

function resolveFestiveOverlay(layout: any): ResolvedOverlayDraft {
  const blocks: MicrositeBlock[] = [];

  if (isNonEmptyString(layout?.buttonLabel)) {
    blocks.push(createDefaultHeroButtonBlock(layout.buttonLabel));
  }

  if (isNonEmptyString(layout?.countdownLabel)) {
    const countdown = createDefaultCountdownBlock();
    countdown.data.heading = layout.countdownLabel;
    blocks.push(countdown);
  }

  const labelBlocks = createLabelBlocks([
    layout?.label1,
    layout?.label2,
    layout?.label3,
  ]);
  blocks.push(...labelBlocks);

  const linkItems: OverlayLink[] = Array.isArray(layout?.links)
    ? layout.links.filter(
        (link: any) =>
          isNonEmptyString(link?.label) && isNonEmptyString(link?.url),
      )
    : [];

  const linksBlock = createLinksBlockFromItems(linkItems, layout?.linksHeading);
  if (linksBlock) blocks.push(linksBlock);

  return {
    title: isNonEmptyString(layout?.title) ? layout.title : undefined,
    subtitle: isNonEmptyString(layout?.subtitle) ? layout.subtitle : undefined,
    description: isNonEmptyString(layout?.description)
      ? layout.description
      : undefined,
    blocks,
  };
}

function resolveModernOverlay(layout: any): ResolvedOverlayDraft {
  const blocks: MicrositeBlock[] = [];

  if (isNonEmptyString(layout?.buttonLabel)) {
    blocks.push(createDefaultHeroButtonBlock(layout.buttonLabel));
  }

  const labelBlocks = createLabelBlocks([
    layout?.label1,
    layout?.label2,
    layout?.label3,
  ]);
  blocks.push(...labelBlocks);

  const linkItems: OverlayLink[] = Array.isArray(layout?.links)
    ? layout.links.filter(
        (link: any) =>
          isNonEmptyString(link?.label) && isNonEmptyString(link?.url),
      )
    : [];

  const linksBlock = createLinksBlockFromItems(linkItems, layout?.linksHeading);
  if (linksBlock) blocks.push(linksBlock);

  return {
    title: isNonEmptyString(layout?.title) ? layout.title : undefined,
    subtitle: isNonEmptyString(layout?.subtitle) ? layout.subtitle : undefined,
    subtext: isNonEmptyString(layout?.subtext) ? layout.subtext : undefined,
    description: isNonEmptyString(layout?.description)
      ? layout.description
      : undefined,
    blocks,
  };
}

function resolveElegantOverlay(layout: any): ResolvedOverlayDraft {
  const blocks: MicrositeBlock[] = [];

  if (isNonEmptyString(layout?.buttonLabel)) {
    blocks.push(createDefaultHeroButtonBlock(layout.buttonLabel));
  }

  if (isNonEmptyString(layout?.countdownLabel)) {
    const countdown = createDefaultCountdownBlock();
    countdown.data.heading = layout.countdownLabel;
    blocks.push(countdown);
  }

  const labelBlocks = createLabelBlocks([
    layout?.label1,
    layout?.label2,
    layout?.label3,
  ]);
  blocks.push(...labelBlocks);

  const linkItems: OverlayLink[] = Array.isArray(layout?.links)
    ? layout.links.filter(
        (link: any) =>
          isNonEmptyString(link?.label) && isNonEmptyString(link?.url),
      )
    : [];

  const linksBlock = createLinksBlockFromItems(linkItems, layout?.linksHeading);
  if (linksBlock) blocks.push(linksBlock);

  return {
    title: isNonEmptyString(layout?.title) ? layout.title : undefined,
    subtitle: isNonEmptyString(layout?.subtitle) ? layout.subtitle : undefined,
    description: isNonEmptyString(layout?.description)
      ? layout.description
      : undefined,
    blocks,
  };
}

function resolveBusinessOverlay(layout: any): ResolvedOverlayDraft {
  const blocks: MicrositeBlock[] = [];

  if (isNonEmptyString(layout?.buttonLabel)) {
    blocks.push(createDefaultHeroButtonBlock(layout.buttonLabel));
  }

  const labelBlocks = createLabelBlocks([
    layout?.label1,
    layout?.label2,
    layout?.label3,
  ]);
  blocks.push(...labelBlocks);

  const linkItems: OverlayLink[] = Array.isArray(layout?.links)
    ? layout.links.filter(
        (link: any) =>
          isNonEmptyString(link?.label) && isNonEmptyString(link?.url),
      )
    : [];

  const linksBlock = createLinksBlockFromItems(linkItems, layout?.linksHeading);
  if (linksBlock) blocks.push(linksBlock);

  return {
    title: isNonEmptyString(layout?.title) ? layout.title : undefined,
    subtitle: isNonEmptyString(layout?.subtitle) ? layout.subtitle : undefined,
    subtext: isNonEmptyString(layout?.subtext) ? layout.subtext : undefined,
    description: isNonEmptyString(layout?.description)
      ? layout.description
      : undefined,
    blocks,
  };
}

function resolveBlankOverlay(layout: any): ResolvedOverlayDraft {
  const blocks: MicrositeBlock[] = [];

  if (isNonEmptyString(layout?.buttonLabel)) {
    blocks.push(createDefaultHeroButtonBlock(layout.buttonLabel));
  }

  if (isNonEmptyString(layout?.countdownLabel)) {
    const countdown = createDefaultCountdownBlock();
    countdown.data.heading = layout.countdownLabel;
    blocks.push(countdown);
  }

  const labelBlocks = createLabelBlocks([
    layout?.label1,
    layout?.label2,
    layout?.label3,
  ]);
  blocks.push(...labelBlocks);

  const linkItems: OverlayLink[] = Array.isArray(layout?.links)
    ? layout.links.filter(
        (link: any) =>
          isNonEmptyString(link?.label) && isNonEmptyString(link?.url),
      )
    : [];

  const linksBlock = createLinksBlockFromItems(linkItems, layout?.linksHeading);
  if (linksBlock) blocks.push(linksBlock);

  return {
    title: isNonEmptyString(layout?.title) ? layout.title : undefined,
    subtitle: isNonEmptyString(layout?.subtitle) ? layout.subtitle : undefined,
    subtext: isNonEmptyString(layout?.subtext) ? layout.subtext : undefined,
    description: isNonEmptyString(layout?.description)
      ? layout.description
      : undefined,
    blocks,
  };
}

function resolveOverlayDraft(
  templateName: string,
  designLayout: string,
): ResolvedOverlayDraft | null {
  const templateOverlay = getTemplateOverlay(templateName);
  if (!templateOverlay) return null;

  const layout = templateOverlay[designLayout];
  if (!layout) return null;

  if (designLayout === "showcase") return resolveShowcaseOverlay(layout);
  if (designLayout === "festive") return resolveFestiveOverlay(layout);
  if (designLayout === "modern") return resolveModernOverlay(layout);
  if (designLayout === "elegant") return resolveElegantOverlay(layout);
  if (designLayout === "business") return resolveBusinessOverlay(layout);
  if (designLayout === "blank") return resolveBlankOverlay(layout);

  return null;
}

export function hydrateDraftFromOverlay(
  draft: BuilderDraft,
  templateName: string,
  designLayout: string,
): BuilderDraft {
  const resolved = resolveOverlayDraft(templateName, designLayout);

  if (!resolved) return draft;

  return {
    ...draft,
    title: resolved.title ?? "",
    subtitle: resolved.subtitle ?? "",
    subtext: resolved.subtext ?? "",
    description: resolved.description ?? "",
    blocks: resolved.blocks,
  } as BuilderDraft;
}