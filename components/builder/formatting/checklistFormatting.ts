import type {
  BlockAppearance,
  MicrositeBlock,
  TextStyle,
} from "@/lib/templates/builder";

type ChecklistBlock = Extract<
  MicrositeBlock,
  { type: "checklist" }
>;

export type ChecklistTextTarget =
  | "heading"
  | "columnHeader"
  | "time"
  | "title"
  | "subtitle"
  | "details"
  | "completedText";

export type ChecklistStyleTarget =
  | "row"
  | "completedRow"
  | "iconCell"
  | "status"
  | "block";

function isChecklistBlock(
  block: MicrositeBlock,
): block is ChecklistBlock {
  return block.type === "checklist";
}

function getChecklistTextStyleKey(
  target: ChecklistTextTarget,
):
  | "headingStyle"
  | "columnHeaderStyle"
  | "timeStyle"
  | "titleStyle"
  | "subtitleStyle"
  | "detailsStyle"
  | "completedTextStyle" {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "columnHeader":
      return "columnHeaderStyle";

    case "time":
      return "timeStyle";

    case "title":
      return "titleStyle";

    case "subtitle":
      return "subtitleStyle";

    case "details":
      return "detailsStyle";

    case "completedText":
      return "completedTextStyle";
  }
}

function getChecklistStyleKey(
  target: Exclude<ChecklistStyleTarget, "block">,
):
  | "rowStyle"
  | "completedRowStyle"
  | "iconCellStyle"
  | "statusStyle" {
  switch (target) {
    case "row":
      return "rowStyle";

    case "completedRow":
      return "completedRowStyle";

    case "iconCell":
      return "iconCellStyle";

    case "status":
      return "statusStyle";
  }
}

export function getChecklistTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ChecklistTextTarget,
): TextStyle {
  if (!block || block.type !== "checklist") {
    return {};
  }

  const styleKey = getChecklistTextStyleKey(target);

  return {
    ...(block.data.style ?? {}),
    ...(block.data[styleKey] ?? {}),
  };
}

export function applyChecklistTextStylePatch<
  TBlock extends MicrositeBlock,
>(
  block: TBlock,
  target: ChecklistTextTarget,
  patch: Partial<TextStyle>,
): TBlock {
  if (!isChecklistBlock(block)) {
    return block;
  }

  const styleKey = getChecklistTextStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...(block.data[styleKey] ?? {}),
        ...patch,
      },
    },
  } as TBlock;
}

export function getChecklistStyle(
  block: MicrositeBlock | null | undefined,
  target: ChecklistStyleTarget,
): Partial<BlockAppearance> {
  if (!block || block.type !== "checklist") {
    return {};
  }

  if (target === "block") {
    return block.appearance ?? {};
  }

  const styleKey = getChecklistStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyChecklistStylePatch<
  TBlock extends MicrositeBlock,
>(
  block: TBlock,
  target: ChecklistStyleTarget,
  patch: Partial<BlockAppearance>,
): TBlock {
  if (!isChecklistBlock(block)) {
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

  const styleKey = getChecklistStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...(block.data[styleKey] ?? {}),
        ...patch,
      },
    },
  } as TBlock;
}