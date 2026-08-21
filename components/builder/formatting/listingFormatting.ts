import type {
  MicrositeBlock,
} from "@/lib/templates/builder";

type ListingBlock = Extract<
  MicrositeBlock,
  { type: "listing" }
>;

export type ListingTextTarget =
  | "title"
  | "description"
  | "metadata"
  | "price"
  | "quantity"
  | "itemizedHeading"
  | "itemizedColumnHeader"
  | "itemizedItem"
  | "itemizedValue"
  | "itemizedTotalLabel"
  | "itemizedTotalValue";

export type ListingStyleTarget =
  | "block"
  | "itemizedRows"
  | "itemizedTotalRow";

function isListingBlock(
  block: MicrositeBlock,
): block is ListingBlock {
  return block.type === "listing";
}

function getTextStyleKey(
  target: ListingTextTarget,
) {
  switch (target) {
    case "title":
      return "titleStyle";

    case "description":
      return "descriptionStyle";

    case "metadata":
      return "metadataStyle";

    case "price":
      return "priceStyle";

    case "quantity":
      return "quantityStyle";

    case "itemizedHeading":
      return "itemizedHeadingStyle";

    case "itemizedColumnHeader":
      return "itemizedColumnHeaderStyle";

    case "itemizedItem":
      return "itemizedItemStyle";

    case "itemizedValue":
      return "itemizedValueStyle";

    case "itemizedTotalLabel":
      return "itemizedTotalLabelStyle";

    case "itemizedTotalValue":
      return "itemizedTotalValueStyle";

    default:
      return "titleStyle";
  }
}

export function getListingTextStyle(
  block:
    | MicrositeBlock
    | null
    | undefined,

  target: ListingTextTarget,
) {
  if (
    !block ||
    block.type !== "listing"
  ) {
    return {};
  }

  const data = block.data as any;

  const styleKey =
    getTextStyleKey(target);

  return (
    data[styleKey] ??
    {}
  );
}

export function applyListingTextStylePatch(
  block: MicrositeBlock,

  target: ListingTextTarget,

  patch: Record<string, any>,
): MicrositeBlock {
  if (!isListingBlock(block)) {
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
        ...(data[styleKey] ?? {}),
        ...patch,
      },
    },
  };
}

export function applyListingStylePatch(
  block: MicrositeBlock,

  target: ListingStyleTarget,

  patch: Record<string, any>,
): MicrositeBlock {
  if (!isListingBlock(block)) {
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

  const styleKey =
    target === "itemizedTotalRow"
      ? "itemizedTotalRowStyle"
      : "itemizedRowStyle";

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