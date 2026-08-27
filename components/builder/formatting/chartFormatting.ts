import type {
  MicrositeBlock,
  TextStyle,
} from "@/lib/templates/builder";

type ChartBlock = Extract<
  MicrositeBlock,
  { type: "chart" }
>;

export type ChartTextTarget =
  | "heading"
  | "subtitle"
  | "legend"
  | "axis"
  | "axisLabel"
  | "dataLabel";

export type ChartStyleTarget =
  | "block";

function isChartBlock(
  block: MicrositeBlock,
): block is ChartBlock {
  return block.type === "chart";
}

function getTextStyleKey(
  target: ChartTextTarget,
):
  | "headingStyle"
  | "subtitleStyle"
  | "legendStyle"
  | "axisStyle"
  | "axisLabelStyle"
  | "dataLabelStyle" {
  if (target === "heading") {
    return "headingStyle";
  }

  if (target === "subtitle") {
    return "subtitleStyle";
  }

  if (target === "legend") {
    return "legendStyle";
  }

  if (target === "axis") {
    return "axisStyle";
  }

  if (target === "axisLabel") {
    return "axisLabelStyle";
  }

  return "dataLabelStyle";
}

export function getChartTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ChartTextTarget,
): TextStyle {
  if (!block || block.type !== "chart") {
    return {};
  }

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return {
    ...(data.style ?? {}),
    ...(data[styleKey] ?? {}),
  } as TextStyle;
}

export function applyChartTextStylePatch(
  block: MicrositeBlock,
  target: ChartTextTarget,
  patch: Partial<TextStyle>,
): MicrositeBlock {
  if (!isChartBlock(block)) {
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

export function applyChartStylePatch(
  block: MicrositeBlock,
  target: ChartStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isChartBlock(block)) {
    return block;
  }

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...block.appearance,
        ...patch,
      },
    };
  }

  return block;
}