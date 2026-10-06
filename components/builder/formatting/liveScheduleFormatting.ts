import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type LiveScheduleBlock = Extract<
  MicrositeBlock,
  { type: "live_schedule" }
>;

export type LiveScheduleTextTarget =
  | "heading"
  | "time"
  | "title"
  | "description"
  | "status"
  | "emptyText";

export type LiveScheduleStyleTarget =
  | "block"
  | "item"
  | "currentItem";

function isLiveScheduleBlock(
  block: MicrositeBlock,
): block is LiveScheduleBlock {
  return block.type === "live_schedule";
}

function getTextStyleKey(
  target: LiveScheduleTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "time":
      return "timeStyle";

    case "title":
      return "titleStyle";

    case "description":
      return "descriptionStyle";

    case "status":
      return "statusStyle";

    case "emptyText":
      return "emptyTextStyle";
  }
}

function getStyleKey(
  target: LiveScheduleStyleTarget,
) {
  switch (target) {
    case "item":
      return "itemStyle";

    case "currentItem":
      return "currentItemStyle";

    case "block":
      return "style";
  }
}

export function getLiveScheduleTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveScheduleTextTarget,
) {
  if (
    !block ||
    block.type !== "live_schedule"
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

export function applyLiveScheduleTextStylePatch(
  block: MicrositeBlock,
  target: LiveScheduleTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveScheduleBlock(block)) {
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

export function getLiveScheduleStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,
  target: LiveScheduleStyleTarget,
) {
  if (
    !block ||
    block.type !== "live_schedule"
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

export function applyLiveScheduleStylePatch(
  block: MicrositeBlock,
  target: LiveScheduleStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isLiveScheduleBlock(block)) {
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