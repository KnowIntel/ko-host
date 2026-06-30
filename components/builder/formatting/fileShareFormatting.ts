import type { MicrositeBlock } from "@/lib/templates/builder";

type FileShareBlock = Extract<MicrositeBlock, { type: "file_share" }>;

export type FileShareTextTarget =
  | "heading"
  | "subtext"
  | "fileAreaText"
  | "settingsText";

export type FileShareStyleTarget = "section" | "block";

function isFileShareBlock(block: MicrositeBlock): block is FileShareBlock {
  return block.type === "file_share";
}

function getTextStyleKey(target: FileShareTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "subtext"
      ? "subtextStyle"
      : target === "fileAreaText"
        ? "fileAreaTextStyle"
        : "settingsTextStyle";
}

function getStyleKey(target: FileShareStyleTarget) {
  return target === "section" ? "sectionStyle" : "style";
}

export function getFileShareTextStyle(
  block: MicrositeBlock | null | undefined,
  target: FileShareTextTarget,
) {
  if (!block || block.type !== "file_share") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyFileShareTextStylePatch(
  block: MicrositeBlock,
  target: FileShareTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isFileShareBlock(block)) return block;

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

export function applyFileShareStylePatch(
  block: MicrositeBlock,
  target: FileShareStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isFileShareBlock(block)) return block;

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