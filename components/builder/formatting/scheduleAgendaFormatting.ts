import type { MicrositeBlock } from "@/lib/templates/builder";

type ScheduleAgendaBlock = Extract<
  MicrositeBlock,
  { type: "schedule_agenda" }
>;

export type ScheduleAgendaTextTarget =
  | "heading"
  | "headerNote"
  | "columnHeader"
  | "date"
  | "time"
  | "title"
  | "description"
  | "location";

export type ScheduleAgendaStyleTarget =
  | "panel"
  | "block";

function isScheduleAgendaBlock(
  block: MicrositeBlock,
): block is ScheduleAgendaBlock {
  return block.type === "schedule_agenda";
}

function getTextStyleKey(
  target: ScheduleAgendaTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "headerNote":
      return "headerNoteStyle";

    case "columnHeader":
      return "columnHeaderStyle";

    case "date":
      return "dateStyle";

    case "time":
      return "timeStyle";

    case "title":
      return "titleStyle";

    case "description":
      return "descriptionStyle";

    case "location":
      return "locationStyle";

    default:
      return "style";
  }
}

export function getScheduleAgendaTextStyle(
  block: MicrositeBlock | null | undefined,
  target: ScheduleAgendaTextTarget,
) {
  if (
    !block ||
    block.type !== "schedule_agenda"
  ) {
    return {};
  }

  const data = block.data as any;

  const styleKey =
    getTextStyleKey(target);

  return (
    data[styleKey] ??
    data.style ??
    {}
  );
}

export function applyScheduleAgendaTextStylePatch(
  block: MicrositeBlock,
  target: ScheduleAgendaTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (
    !isScheduleAgendaBlock(block)
  ) {
    return block;
  }

  const data = block.data as any;

  const styleKey =
    getTextStyleKey(target);

  return {
    ...block,

    data: {
      ...data,

      [styleKey]: {
        ...(
          data[styleKey] ??
          data.style ??
          {}
        ),

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
  if (
    !isScheduleAgendaBlock(block)
  ) {
    return block;
  }

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

  const isProfessional =
    data.styleVariant ===
    "professional";

  /*
   * Standard:
   * panel → panelStyle
   *
   * Professional:
   * panel → professionalRowStyle
   */
  const styleKey =
    isProfessional
      ? "professionalRowStyle"
      : "panelStyle";

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