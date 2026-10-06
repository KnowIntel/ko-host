import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveSongRequestBlock = Extract<
  MicrositeBlock,
  { type: "live_song_request" }
>;

export type LiveSongRequestTextTarget =
  | "heading"
  | "helperText"
  | "joinRequiredText"
  | "input"
  | "submitButton"
  | "submittedLabel"
  | "queueHeading"
  | "queueText";

export type LiveSongRequestStyleTarget =
  | "block"
  | "input"
  | "submitButton"
  | "queue";

function isLiveSongRequestBlock(
  block: MicrositeBlock,
): block is LiveSongRequestBlock {
  return block.type === "live_song_request";
}

function getTextStyleKey(
  target: LiveSongRequestTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "helperText":
      return "helperTextStyle";

    case "joinRequiredText":
      return "joinRequiredTextStyle";

    case "input":
      return "inputTextStyle";

    case "submitButton":
      return "submitButtonTextStyle";

    case "submittedLabel":
      return "submittedLabelStyle";

    case "queueHeading":
      return "queueHeadingStyle";

    case "queueText":
      return "queueTextStyle";
  }
}

function getStyleKey(
  target: LiveSongRequestStyleTarget,
) {
  switch (target) {
    case "input":
      return "inputStyle";

    case "submitButton":
      return "submitButtonStyle";

    case "queue":
      return "queueStyle";

    case "block":
      return "style";
  }
}

export function getLiveSongRequestTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveSongRequestTextTarget,
) {
  if (
    !block ||
    block.type !== "live_song_request"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyLiveSongRequestTextStylePatch(
  block: MicrositeBlock,
  target: LiveSongRequestTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveSongRequestBlock(block)) {
    return block;
  }

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

export function getLiveSongRequestStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveSongRequestStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_song_request"
  ) {
    return {};
  }

  const data = block.data as any;

  if (target === "block") {
    return {
      ...(data.style ?? {}),
      ...(block.appearance ?? {}),
    };
  }

  const styleKey = getStyleKey(target);

  return data[styleKey] ?? {};
}

export function applyLiveSongRequestStylePatch(
  block: MicrositeBlock,
  target: LiveSongRequestStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveSongRequestBlock(block)) {
    return block;
  }

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