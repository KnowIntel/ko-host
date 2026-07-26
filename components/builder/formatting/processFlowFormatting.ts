export type ProcessFlowTextTarget =
  | "heading"
  | "subtitle"
  | "stepNumber"
  | "stepHeading"
  | "stepDescription"
  | "badge"
  | "duration";

export type ProcessFlowStyleTarget =
  | "card"
  | "stepIcon"
  | "connector"
  | "block";

type StylePatch = Record<string, any>;

type ProcessFlowBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getTextStyleKey(
  target: ProcessFlowTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "stepNumber":
      return "stepNumberStyle";

    case "stepHeading":
      return "stepHeadingStyle";

    case "stepDescription":
      return "stepDescriptionStyle";

    case "badge":
      return "badgeStyle";

    case "duration":
      return "durationStyle";
  }
}

function getStyleKey(
  target: Exclude<ProcessFlowStyleTarget, "block">,
) {
  switch (target) {
    case "card":
      return "cardStyle";

    case "stepIcon":
      return "stepIconStyle";

    case "connector":
      return "connectorAppearanceStyle";
  }
}

export function getProcessFlowTextStyle(
  block: ProcessFlowBlockShape | null | undefined,
  target: ProcessFlowTextTarget,
) {
  if (!block || block.type !== "process_flow") {
    return {};
  }

  const styleKey = getTextStyleKey(target);

  return block.data[styleKey] ?? {};
}

export function applyProcessFlowTextStylePatch<
  T extends ProcessFlowBlockShape,
>(
  block: T,
  target: ProcessFlowTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "process_flow") {
    return block;
  }

  const styleKey = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...(block.data[styleKey] ?? {}),
        ...patch,
      },
    },
  } as T;
}

export function applyProcessFlowStylePatch<
  T extends ProcessFlowBlockShape,
>(
  block: T,
  target: ProcessFlowStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "process_flow") {
    return block;
  }

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...(block.appearance ?? {}),
        ...patch,
      },
    } as T;
  }

  const styleKey = getStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...(block.data[styleKey] ?? {}),
        ...patch,
      },
    },
  } as T;
}