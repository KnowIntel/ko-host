import type { MicrositeBlock } from "@/lib/templates/builder";

type LinkHubBlock = Extract<MicrositeBlock, { type: "link_hub" }>;

export type LinkHubTextTarget =
  | "heading"
  | "label"
  | "description"
  | "url";

export type LinkHubStyleTarget = "section" | "block";

function isLinkHubBlock(block: MicrositeBlock): block is LinkHubBlock {
  return block.type === "link_hub";
}

function getTextStyleKey(target: LinkHubTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "label"
      ? "labelStyle"
      : target === "description"
        ? "descriptionStyle"
        : "urlStyle";
}

function getStyleKey(target: LinkHubStyleTarget) {
  return target === "section" ? "sectionStyle" : "style";
}

export function getLinkHubTextStyle(
  block: MicrositeBlock | null | undefined,
  target: LinkHubTextTarget,
) {
  if (!block || block.type !== "link_hub") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyLinkHubTextStylePatch(
  block: MicrositeBlock,
  target: LinkHubTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLinkHubBlock(block)) return block;

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...data,
      [styleKey]: {
        ...(data[styleKey] ?? {}),
        ...patch,
      },
    },
  };
}

export function applyLinkHubStylePatch(
  block: MicrositeBlock,
  target: LinkHubStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLinkHubBlock(block)) return block;

  const data = block.data as any;

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...(block.appearance ?? {}),
        ...patch,
      },
      data: {
        ...data,
        style: {
          ...(data.style ?? {}),
          ...patch,
        },
      },
    };
  }

  const styleKey = getStyleKey(target);

  return {
    ...block,
    data: {
      ...data,
      [styleKey]: {
        ...(data[styleKey] ?? {}),
        ...patch,
      },
    },
  };
}