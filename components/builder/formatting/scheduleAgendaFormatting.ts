import type { MicrositeBlock } from "@/lib/templates/builder";

type ScheduleAgendaBlock = Extract<
  MicrositeBlock,
  { type: "schedule_agenda" }
>;

export type ScheduleAgendaTextTarget =
  | "heading"
  | "time"
  | "opening"
  | "description";

export type ScheduleAgendaStyleTarget =
  | "panel"
  | "block";

function isScheduleAgendaBlock(
  block: MicrositeBlock,
): block is ScheduleAgendaBlock {
  return block.type === "schedule_agenda";
}

function getTextStyleKey(target: ScheduleAgendaTextTarget) {
  return target === "heading"
    ? "headingStyle"
    : target === "time"
      ? "timeStyle"
      : target === "opening"
        ? "titleStyle"
        : "descriptionStyle";
}

export function getScheduleAgendaTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ScheduleAgendaTextTarget,
) {
  if (!block || block.type !== "schedule_agenda") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyScheduleAgendaTextStylePatch(
  block: MicrositeBlock,
  target: ScheduleAgendaTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isScheduleAgendaBlock(block)) return block;

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...data,
      [styleKey]: {
        ...(data[styleKey] ?? data.style ?? {}),
        ...patch,
      },
    },
  };
}

export function applyScheduleAgendaStylePatch(
  block: MicrositeBlock,
  target: ScheduleAgendaStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isScheduleAgendaBlock(block)) return block;

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...(block.appearance ?? {}),
        ...patch,
      },
    };
  }

  const data = block.data as any;

  return {
    ...block,
    data: {
      ...data,
      panelStyle: {
        ...(data.panelStyle ?? {}),
        ...patch,
      },
    },
  };
}