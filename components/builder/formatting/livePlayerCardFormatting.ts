import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LivePlayerCardBlock = Extract<
  MicrositeBlock,
  { type: "live_player_card" }
>;

export type LivePlayerCardTextTarget =
  | "heading"
  | "name"
  | "detail"
  | "joinRequiredText";

export type LivePlayerCardStyleTarget =
  | "block"
  | "card"
  | "avatar";

function isLivePlayerCardBlock(
  block: MicrositeBlock,
): block is LivePlayerCardBlock {
  return block.type === "live_player_card";
}

function getTextStyleKey(
  target: LivePlayerCardTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "name":
      return "nameStyle";

    case "detail":
      return "detailStyle";

    case "joinRequiredText":
      return "joinRequiredTextStyle";
  }
}

function getStyleKey(
  target: LivePlayerCardStyleTarget,
) {
  switch (target) {
    case "card":
      return "cardStyle";

    case "avatar":
      return "avatarStyle";

    case "block":
      return "style";
  }
}

export function getLivePlayerCardTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LivePlayerCardTextTarget,
) {
  if (
    !block ||
    block.type !== "live_player_card"
  ) {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return (
    data[styleKey] ??
    data.style ??
    {}
  );
}

export function applyLivePlayerCardTextStylePatch(
  block: MicrositeBlock,
  target: LivePlayerCardTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLivePlayerCardBlock(block)) {
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

export function getLivePlayerCardStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LivePlayerCardStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_player_card"
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

export function applyLivePlayerCardStylePatch(
  block: MicrositeBlock,
  target: LivePlayerCardStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLivePlayerCardBlock(block)) {
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