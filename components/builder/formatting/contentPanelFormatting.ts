import type { MicrositeBlock } from "@/lib/templates/builder";

type ContentPanelBlock = Extract<MicrositeBlock, { type: "content_panel" }>;

export type ContentPanelTextTarget =
  | "heading"
  | "subtitle"
  | "activeNavigation"
  | "inactiveNavigation"
  | "content";

export type ContentPanelStyleTarget =
  | "form"
  | "activeNavigation"
  | "inactiveNavigation"
  | "panel";

function isContentPanelBlock(block: MicrositeBlock): block is ContentPanelBlock {
  return block.type === "content_panel";
}

function getTextStyleKey(target: ContentPanelTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "subtitle"
      ? "subtitleStyle"
      : target === "activeNavigation"
        ? "activeNavigationStyle"
: target === "inactiveNavigation"
  ? "navigationStyle"
          : "panelStyle";
}

function getStyleKey(target: ContentPanelStyleTarget) {
  return target === "form"
    ? "style"
    : target === "activeNavigation"
      ? "activeNavigationStyle"
      : target === "inactiveNavigation"
        ? "inactiveNavigationStyle"
        : "panelStyle";
}

export function getContentPanelTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ContentPanelTextTarget,
) {
  if (!block || block.type !== "content_panel") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyContentPanelTextStylePatch(
  block: MicrositeBlock,
  target: ContentPanelTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isContentPanelBlock(block)) return block;

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...data,

      [styleKey]: {
        ...(data[styleKey] ?? data.style ?? {}),
        ...patch,
      },

      ...(target === "activeNavigation" && patch.color !== undefined
        ? { activeNavigationColor: patch.color }
        : {}),

...(target === "inactiveNavigation" && patch.color !== undefined
  ? {
      inactiveNavigationColor: patch.color,
      navigationColor: patch.color,
    }
  : {}),
    },
  };
}

export function applyContentPanelStylePatch(
  block: MicrositeBlock,
  target: ContentPanelStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isContentPanelBlock(block)) return block;

  const data = block.data as any;
  const styleKey = getStyleKey(target);

  return {
    ...block,

    appearance:
      target === "form"
        ? {
            ...block.appearance,
            ...patch,
          }
        : block.appearance,

    data: {
      ...data,

      [styleKey]: {
        ...(data[styleKey] ?? data.style ?? {}),
        ...patch,
      },

      ...(target === "activeNavigation" && patch.backgroundColor !== undefined
        ? { activeNavigationBackground: patch.backgroundColor }
        : {}),

...(target === "inactiveNavigation" && patch.backgroundColor !== undefined
  ? {
      inactiveNavigationBackground: patch.backgroundColor,
      navigationBackground: patch.backgroundColor,
    }
  : {}),

      ...(target === "panel" && patch.backgroundColor !== undefined
        ? { panelBackground: patch.backgroundColor }
        : {}),
    },
  };
}