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

export function isContentPanelBlock(
  block: MicrositeBlock,
): block is ContentPanelBlock {
  return block.type === "content_panel";
}

export function getContentPanelTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ContentPanelTextTarget,
) {
  if (!block || block.type !== "content_panel") return {};

  const styleKey =
    target === "heading"
      ? "headingStyle"
      : target === "subtitle"
        ? "subtitleStyle"
        : target === "activeNavigation"
          ? "activeNavigationTextStyle"
          : target === "inactiveNavigation"
            ? "inactiveNavigationTextStyle"
            : "contentStyle";

  return ((block.data as any)[styleKey] ?? {}) as Record<string, any>;
}

export function applyContentPanelTextStylePatch(
  block: MicrositeBlock,
  target: ContentPanelTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isContentPanelBlock(block)) return block;

  const styleKey =
    target === "heading"
      ? "headingStyle"
      : target === "subtitle"
        ? "subtitleStyle"
        : target === "activeNavigation"
          ? "activeNavigationTextStyle"
          : target === "inactiveNavigation"
            ? "inactiveNavigationTextStyle"
            : "contentStyle";

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...((block.data as any)[styleKey] ?? {}),
        ...patch,
      },
    } as any,
  };
}

export function getContentPanelStyle(
  block: MicrositeBlock | null | undefined,
  target: ContentPanelStyleTarget,
) {
  if (!block || block.type !== "content_panel") return {};

  const styleKey =
    target === "form"
      ? "formStyle"
      : target === "activeNavigation"
        ? "activeNavigationStyle"
        : target === "inactiveNavigation"
          ? "inactiveNavigationStyle"
          : "panelStyle";

  return ((block.data as any)[styleKey] ?? {}) as Record<string, any>;
}

export function applyContentPanelStylePatch(
  block: MicrositeBlock,
  target: ContentPanelStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isContentPanelBlock(block)) return block;

  const styleKey =
    target === "form"
      ? "formStyle"
      : target === "activeNavigation"
        ? "activeNavigationStyle"
        : target === "inactiveNavigation"
          ? "inactiveNavigationStyle"
          : "panelStyle";

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
      ...block.data,
      [styleKey]: {
        ...((block.data as any)[styleKey] ?? {}),
        ...patch,
      },
    } as any,
  };
}

export function applyContentPanelPatch(
  block: MicrositeBlock,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isContentPanelBlock(block)) return block;

  return {
    ...block,
    data: {
      ...block.data,
      ...patch,
    } as any,
  };
}