import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveAnnouncementBlock = Extract<
  MicrositeBlock,
  { type: "live_announcement" }
>;

export type LiveAnnouncementTextTarget =
  | "heading"
  | "emptyText"
  | "latestLabel"
  | "announcementTitle"
  | "announcementText"
  | "timestamp";

export type LiveAnnouncementStyleTarget =
  | "block"
  | "announcement";

function isLiveAnnouncementBlock(
  block: MicrositeBlock,
): block is LiveAnnouncementBlock {
  return block.type === "live_announcement";
}

function getTextStyleKey(
  target: LiveAnnouncementTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "emptyText":
      return "emptyTextStyle";

    case "latestLabel":
      return "latestLabelStyle";

    case "announcementTitle":
      return "announcementTitleStyle";

    case "announcementText":
      return "announcementTextStyle";

    case "timestamp":
      return "timestampStyle";
  }
}

function getStyleKey(
  target: LiveAnnouncementStyleTarget,
) {
  switch (target) {
    case "announcement":
      return "announcementStyle";

    case "block":
      return "style";
  }
}

export function getLiveAnnouncementTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveAnnouncementTextTarget,
) {
  if (
    !block ||
    block.type !== "live_announcement"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyLiveAnnouncementTextStylePatch(
  block: MicrositeBlock,
  target: LiveAnnouncementTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveAnnouncementBlock(block)) {
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

export function getLiveAnnouncementStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveAnnouncementStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_announcement"
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

export function applyLiveAnnouncementStylePatch(
  block: MicrositeBlock,
  target: LiveAnnouncementStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveAnnouncementBlock(block)) {
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