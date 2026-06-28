import type { MicrositeBlock } from "@/lib/templates/builder";

type ThreadBlock = Extract<MicrositeBlock, { type: "thread" }>;

export type ThreadTextTarget =
  | "subject"
  | "captionPill"
  | "postLabel"
  | "placeholderText"
  | "addMediaButton"
  | "addMediaMetadata"
  | "nameCharMaxLabel"
  | "messageCharMaxLabel"
  | "postTypeLabel"
  | "postButton"
  | "voteText"
  | "defaultProfile"
  | "nameText"
  | "messageText";

export type ThreadStyleTarget =
  | "field"
  | "section"
  | "captionPill"
  | "addMediaButton"
  | "postButton"
  | "thumbsUp"
  | "thumbsDown"
  | "defaultProfile"
  | "block";

function isThreadBlock(block: MicrositeBlock): block is ThreadBlock {
  return block.type === "thread";
}

function getTextStyleKey(target: ThreadTextTarget) {
  return target === "subject"
    ? "subjectStyle"
    : target === "captionPill"
      ? "captionPillTextStyle"
      : target === "postLabel"
        ? "postLabelStyle"
        : target === "placeholderText"
          ? "placeholderStyle"
          : target === "addMediaButton"
            ? "addMediaButtonTextStyle"
            : target === "addMediaMetadata"
              ? "addMediaMetadataStyle"
              : target === "nameCharMaxLabel"
                ? "nameCharMaxLabelStyle"
                : target === "messageCharMaxLabel"
                  ? "messageCharMaxLabelStyle"
                  : target === "postTypeLabel"
                    ? "postTypeLabelStyle"
                    : target === "postButton"
                      ? "postButtonAppearanceStyle"
                      : target === "voteText"
                        ? "voteTextStyle"
                        : target === "defaultProfile"
                          ? "defaultProfileTextStyle"
                          : target === "nameText"
                            ? "nameTextStyle"
                            : "messageTextStyle";
}

function getStyleKey(target: ThreadStyleTarget) {
  return target === "field"
    ? "fieldStyle"
    : target === "section"
      ? "sectionStyle"
      : target === "captionPill"
        ? "captionPillStyle"
        : target === "addMediaButton"
          ? "addMediaButtonStyle"
            : target === "postButton"
              ? "postButtonAppearanceStyle"
            : target === "thumbsUp"
              ? "thumbsUpStyle"
              : target === "thumbsDown"
                ? "thumbsDownStyle"
                : target === "defaultProfile"
                  ? "defaultProfileStyle"
                  : "blockStyle";
}

export function getThreadTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ThreadTextTarget,
) {
  if (!block || block.type !== "thread") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyThreadTextStylePatch(
  block: MicrositeBlock,
  target: ThreadTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isThreadBlock(block)) return block;

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
      ...(target === "placeholderText" && patch.color !== undefined
        ? { placeholderColor: patch.color }
        : {}),
    },
  };
}

export function applyThreadStylePatch(
  block: MicrositeBlock,
  target: ThreadStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isThreadBlock(block)) return block;

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
        blockStyle: {
          ...(data.blockStyle ?? {}),
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