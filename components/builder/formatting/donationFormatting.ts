import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type DonationBlock =
  Extract<
    MicrositeBlock,
    {
      type: "donation";
    }
  >;

export type DonationTextTarget =
  | "title"
  | "goalAmount"
  | "description"
  | "raisedAmount"
  | "raisedAmountDescriptor"
  | "donorValue"
  | "donorLabel"
  | "percentageValue"
  | "percentageLabel"
  | "daysValue"
  | "daysLabel"
  | "button";

export type DonationStyleTarget =
  | "block"
  | "progressTrack"
  | "progressFill"
  | "metricCards"
  | "button";

function isDonationBlock(
  block: MicrositeBlock,
): block is DonationBlock {
  return (
    block.type === "donation"
  );
}

function getTextStyleKey(
  target:
    DonationTextTarget,
) {
  switch (target) {
    case "title":
      return "titleStyle";

    case "goalAmount":
      return "goalAmountStyle";

    case "description":
      return "descriptionStyle";

case "raisedAmount":
  return "raisedAmountStyle";

case "raisedAmountDescriptor":
  return "raisedAmountDescriptorStyle";

case "donorValue":
  return "donorValueStyle";

    case "donorLabel":
      return "donorLabelStyle";

    case "percentageValue":
      return "percentageValueStyle";

    case "percentageLabel":
      return "percentageLabelStyle";

    case "daysValue":
      return "daysValueStyle";

    case "daysLabel":
      return "daysLabelStyle";

    case "button":
      return "buttonStyle";

    default:
      return "style";
  }
}

export function getDonationTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,

  target:
    DonationTextTarget,
) {
  if (
    !block ||
    block.type !== "donation"
  ) {
    return {};
  }

  const data =
    block.data as any;

  const key =
    getTextStyleKey(
      target,
    );

  return (
    data[key] ??
    data.style ??
    {}
  );
}

export function applyDonationTextStylePatch(
  block:
    MicrositeBlock,

  target:
    DonationTextTarget,

  patch:
    Record<string, any>,
): MicrositeBlock {
  if (
    !isDonationBlock(
      block,
    )
  ) {
    return block;
  }

  const data =
    block.data as any;

  const key =
    getTextStyleKey(
      target,
    );

  return {
    ...block,

    data: {
      ...data,

      [key]: {
        ...(data[key] ??
          data.style ??
          {}),

        ...patch,
      },
    },
  };
}

export function applyDonationStylePatch(
  block:
    MicrositeBlock,

  target:
    DonationStyleTarget,

  patch:
    Record<string, any>,
): MicrositeBlock {
  if (
    !isDonationBlock(
      block,
    )
  ) {
    return block;
  }

  const data =
    block.data as any;

  if (
    target === "block"
  ) {
    return {
      ...block,

      appearance: {
        ...block.appearance,
        ...patch,
      },
    };
  }

  const key =
    target ===
    "progressTrack"
      ? "progressTrackStyle"
      : target ===
          "progressFill"
        ? "progressFillStyle"
        : target ===
            "metricCards"
          ? "metricCardStyle"
          : "buttonStyle";

  return {
    ...block,

    data: {
      ...data,

      [key]: {
        ...(data[key] ??
          {}),

        ...patch,
      },
    },
  };
}