import type { MicrositeBlock } from "@/lib/templates/builder";

type LiveJoinBlock = Extract<
  MicrositeBlock,
  { type: "live_join" }
>;

export type LiveJoinTextTarget =
  | "heading"
  | "helperText"
  | "namePlaceholder"
  | "joinButton"
  | "connectedLabel"
  | "participantName"
  | "connectedMessage"
  | "leaveButton";

export type LiveJoinStyleTarget =
  | "block"
  | "input"
  | "joinButton"
  | "leaveButton";

function isLiveJoinBlock(
  block: MicrositeBlock,
): block is LiveJoinBlock {
  return block.type === "live_join";
}

function getTextStyleKey(
  target: LiveJoinTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "helperText":
      return "helperTextStyle";

    case "namePlaceholder":
      return "namePlaceholderStyle";

    case "joinButton":
      return "joinButtonTextStyle";

    case "connectedLabel":
      return "connectedLabelStyle";

    case "participantName":
      return "participantNameStyle";

    case "connectedMessage":
      return "connectedMessageStyle";

    case "leaveButton":
      return "leaveButtonTextStyle";
  }
}

function getStyleKey(
  target: LiveJoinStyleTarget,
) {
  switch (target) {
    case "input":
      return "inputStyle";

    case "joinButton":
      return "joinButtonStyle";

    case "leaveButton":
      return "leaveButtonStyle";

    case "block":
      return "style";
  }
}

export function getLiveJoinTextStyle(
  block: MicrositeBlock | null | undefined,
  target: LiveJoinTextTarget,
) {
  if (!block || block.type !== "live_join") {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyLiveJoinTextStylePatch(
  block: MicrositeBlock,
  target: LiveJoinTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveJoinBlock(block)) {
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

export function getLiveJoinStyle(
  block: MicrositeBlock | null | undefined,
  target: LiveJoinStyleTarget,
) {
  if (!block || block.type !== "live_join") return {};

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

export function applyLiveJoinStylePatch(
  block: MicrositeBlock,
  target: LiveJoinStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveJoinBlock(block)) {
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