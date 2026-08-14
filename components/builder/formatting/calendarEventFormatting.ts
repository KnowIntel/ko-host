export type CalendarEventTextTarget =
  | "heading"
  | "subtitle"
  | "monthYearLabel"
  | "weeklyDayLabels"
  | "monthlyDateLabels"
  | "monthArrows"
  | "emptyStateText"
  | "scheduledLabel"
  | "eventDot"
  | "eventTitle"
  | "eventSubtitle"
  | "eventDate"
  | "eventMeetingMethod"
  | "eventLocation"
  | "eventAddress"
  | "virtualMeetingLink"
  | "eventDescription"
  | "capacity"
  | "categoryHostTags"
  | "ctaButton"

  // Professional variant
  | "professionalDetailsHeading"
  | "professionalFieldText"
  | "professionalChoiceText"
  | "professionalTimesHeading"
  | "professionalTimeSlotText"
  | "professionalBookingButton"
  | "professionalConfirmationHeading"
  | "professionalConfirmationMessage";

export type CalendarEventStyleTarget =
  | "calendar"
  | "eventCard"
  | "selectedDateCard"
  | "calendarDateCircles"
  | "monthArrowCircles"
  | "ctaButton"

  // Professional variant
  | "professionalDetailsPanel"
  | "professionalField"
  | "professionalChoiceButton"
  | "professionalTimesPanel"
  | "professionalTimeSlotButton"
  | "professionalBookingButton"
  | "professionalConfirmationPanel"

  | "block";

type StylePatch = Record<string, any>;

type CalendarEventBlock = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

function getCalendarEventTextStyleKey(
  target: CalendarEventTextTarget,
) {
  switch (target) {
    case "heading":
      return "headingStyle";

    case "subtitle":
      return "subtitleStyle";

    case "monthYearLabel":
      return "monthYearLabelStyle";

    case "weeklyDayLabels":
      return "weeklyDayLabelsStyle";

    case "monthlyDateLabels":
      return "monthlyDateLabelsStyle";

    case "monthArrows":
      return "monthArrowsStyle";

    case "emptyStateText":
      return "emptyStateTextStyle";

    case "scheduledLabel":
      return "scheduledLabelStyle";

    case "eventDot":
      return "eventDotStyle";

    case "eventTitle":
      return "eventTitleStyle";

    case "eventSubtitle":
      return "eventSubtitleStyle";

    case "eventDate":
      return "eventDateStyle";

    case "eventMeetingMethod":
      return "eventMeetingMethodStyle";

    case "eventLocation":
      return "eventLocationStyle";

    case "eventAddress":
      return "eventAddressStyle";

    case "virtualMeetingLink":
      return "virtualMeetingLinkStyle";

    case "eventDescription":
      return "eventDescriptionStyle";

    case "capacity":
      return "capacityStyle";

    case "categoryHostTags":
      return "categoryHostTagsStyle";

    case "ctaButton":
      return "ctaButtonTextStyle";

    case "professionalDetailsHeading":
      return "professionalDetailsHeadingStyle";

    case "professionalFieldText":
      return "professionalFieldTextStyle";

    case "professionalChoiceText":
      return "professionalChoiceTextStyle";

    case "professionalTimesHeading":
      return "professionalTimesHeadingStyle";

    case "professionalTimeSlotText":
      return "professionalTimeSlotTextStyle";

    case "professionalBookingButton":
      return "professionalBookingButtonTextStyle";

    case "professionalConfirmationHeading":
      return "professionalConfirmationHeadingStyle";

    case "professionalConfirmationMessage":
      return "professionalConfirmationMessageStyle";
  }
}


export function getCalendarEventStyle(
  block: CalendarEventBlock,
  target: CalendarEventStyleTarget,
): StylePatch {
  if (block.type !== "calendar_event") {
    return {};
  }

  if (target === "block") {
    return {
      ...(block.appearance ?? {}),
    };
  }

  const styleKey = getCalendarEventStyleKey(target);

  return {
    ...((block.data as any)[styleKey] ?? {}),
  };
}

function getCalendarEventStyleKey(
  target: Exclude<CalendarEventStyleTarget, "block">,
) {
  switch (target) {
    case "calendar":
      return "calendarStyle";

    case "eventCard":
      return "eventCardStyle";

    case "selectedDateCard":
      return "selectedDateCardStyle";

    case "calendarDateCircles":
      return "calendarDateCirclesStyle";

    case "monthArrowCircles":
      return "monthArrowCirclesStyle";

    case "ctaButton":
      return "ctaButtonStyle";

    case "professionalDetailsPanel":
      return "professionalDetailsPanelStyle";

    case "professionalField":
      return "professionalFieldStyle";

    case "professionalChoiceButton":
      return "professionalChoiceButtonStyle";

    case "professionalTimesPanel":
      return "professionalTimesPanelStyle";

    case "professionalTimeSlotButton":
      return "professionalTimeSlotButtonStyle";

    case "professionalBookingButton":
      return "professionalBookingButtonStyle";

    case "professionalConfirmationPanel":
      return "professionalConfirmationPanelStyle";
  }
}

export function getCalendarEventTextStyle(
  block: CalendarEventBlock,
  target: CalendarEventTextTarget,
): StylePatch {
  if (block.type !== "calendar_event") {
    return {};
  }

  const styleKey = getCalendarEventTextStyleKey(target);

  return {
    ...((block.data as any)[styleKey] ?? {}),
  };
}

export function applyCalendarEventTextStylePatch<
  T extends CalendarEventBlock,
>(
  block: T,
  target: CalendarEventTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "calendar_event") {
    return block;
  }

  const styleKey = getCalendarEventTextStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...((block.data as any)[styleKey] ?? {}),
        ...patch,
      },
    },
  };
}

export function applyCalendarEventStylePatch<
  T extends CalendarEventBlock,
>(
  block: T,
  target: CalendarEventStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "calendar_event") {
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

  const styleKey = getCalendarEventStyleKey(target);

  return {
    ...block,
    data: {
      ...block.data,
      [styleKey]: {
        ...((block.data as any)[styleKey] ?? {}),
        ...patch,
      },
    },
  };
}