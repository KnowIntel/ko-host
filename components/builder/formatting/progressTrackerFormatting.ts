
import type {
  BlockAppearance,
  MicrositeBlock,
  TextStyle,
} from "@/lib/templates/builder";

type ProgressTrackerBlock = Extract<
  MicrositeBlock,
  { type: "progress_tracker" }
>;

export type ProgressTrackerTextTarget =
  | "title"
  | "rowLabel"
  | "measurementLabel"
  | "targetLabel"
  | "actualLabel"
  | "sessionInfo"
  | "completionStatus"
  | "buttonText"
  | "historyText";

export type ProgressTrackerStyleTarget =
  | "container"
  | "row"
  | "measurementField"
  | "targetField"
  | "actualField"
  | "progressIndicator"
  | "button"
  | "historyContainer"
  | "block";

function isProgressTrackerBlock(
  block: MicrositeBlock,
): block is ProgressTrackerBlock {
  return block.type === "progress_tracker";
}

function getTextStyleKey(
  target: ProgressTrackerTextTarget,
): keyof ProgressTrackerBlock["data"] {
  switch (target) {
    case "title":
      return "titleStyle";
    case "rowLabel":
      return "rowLabelStyle";
    case "measurementLabel":
      return "measurementLabelStyle";
    case "targetLabel":
      return "targetLabelStyle";
    case "actualLabel":
      return "actualLabelStyle";
    case "sessionInfo":
      return "sessionInfoStyle";
    case "completionStatus":
      return "completionStatusStyle";
    case "buttonText":
      return "buttonTextStyle";
    case "historyText":
      return "historyTextStyle";
  }
}

function getAppearanceStyleKey(
  target: Exclude<ProgressTrackerStyleTarget, "block">,
): keyof ProgressTrackerBlock["data"] {
  switch (target) {
    case "container":
      return "containerStyle";
    case "row":
      return "rowStyle";
    case "measurementField":
      return "measurementFieldStyle";
    case "targetField":
      return "targetFieldStyle";
    case "actualField":
      return "actualFieldStyle";
    case "progressIndicator":
      return "progressIndicatorStyle";
    case "button":
      return "buttonStyle";
    case "historyContainer":
      return "historyContainerStyle";
  }
}

export function getProgressTrackerTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ProgressTrackerTextTarget,
): TextStyle {
  if (!block || block.type !== "progress_tracker") {
    return {};
  }

  const key = getTextStyleKey(target);

  return (block.data[key] ?? {}) as TextStyle;
}

export function applyProgressTrackerTextStylePatch<
  TBlock extends MicrositeBlock,
>(
  block: TBlock,
  target: ProgressTrackerTextTarget,
  patch: Partial<TextStyle>,
): TBlock {
  if (!isProgressTrackerBlock(block)) {
    return block;
  }

  const key = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [key]: {
        ...(block.data[key] as TextStyle | undefined ?? {}),
        ...patch,
      },
    },
  } as TBlock;
}

export function getProgressTrackerStyle(
  block: MicrositeBlock | null | undefined,
  target: ProgressTrackerStyleTarget,
): Partial<BlockAppearance> {
  if (!block || block.type !== "progress_tracker") {
    return {};
  }

  if (target === "block") {
    return block.appearance ?? {};
  }

  const key = getAppearanceStyleKey(target);

  return (block.data[key] ?? {}) as Partial<BlockAppearance>;
}

export function applyProgressTrackerStylePatch<
  TBlock extends MicrositeBlock,
>(
  block: TBlock,
  target: ProgressTrackerStyleTarget,
  patch: Partial<BlockAppearance>,
): TBlock {
  if (!isProgressTrackerBlock(block)) {
    return block;
  }

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...(block.appearance ?? {}),
        ...patch,
      },
    } as TBlock;
  }

  const key = getAppearanceStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [key]: {
        ...(block.data[key] as Partial<BlockAppearance> | undefined ?? {}),
        ...patch,
      },
    },
  } as TBlock;
}
