export type MapLocationTextTarget =
  | "heading"
  | "locationName"
  | "address"
  | "mapUrl";

export type MapLocationStyleTarget =
  | "addressPanel"
  | "block";

type TextStyle = Record<string, any>;
type StylePatch = Record<string, any>;

type MapLocationBlockShape = {
  type: string;
  data: Record<string, any>;
  appearance?: Record<string, any>;
};

export function getMapLocationTextStyle(
  block: MapLocationBlockShape,
  target: MapLocationTextTarget,
): TextStyle {
  if (block.type !== "map_location") return {};

  switch (target) {
    case "heading":
      return (block.data.headingStyle ?? {}) as TextStyle;

    case "locationName":
      return (block.data.locationNameStyle ?? {}) as TextStyle;

    case "address":
      return (block.data.addressStyle ?? {}) as TextStyle;

    case "mapUrl":
      return (block.data.mapUrlStyle ?? {}) as TextStyle;

    default:
      return {};
  }
}

export function applyMapLocationTextStylePatch<
  T extends MapLocationBlockShape,
>(
  block: T,
  target: MapLocationTextTarget,
  patch: StylePatch,
): T {
  if (block.type !== "map_location") return block;

  switch (target) {
    case "heading":
      return {
        ...block,
        data: {
          ...block.data,
          headingStyle: {
            ...(block.data.headingStyle ?? {}),
            ...patch,
          },
        },
      } as T;

    case "locationName":
      return {
        ...block,
        data: {
          ...block.data,
          locationNameStyle: {
            ...(block.data.locationNameStyle ?? {}),
            ...patch,
          },
        },
      } as T;

    case "address":
      return {
        ...block,
        data: {
          ...block.data,
          addressStyle: {
            ...(block.data.addressStyle ?? {}),
            ...patch,
          },
        },
      } as T;

    case "mapUrl":
      return {
        ...block,
        data: {
          ...block.data,
          mapUrlStyle: {
            ...(block.data.mapUrlStyle ?? {}),
            ...patch,
          },
        },
      } as T;

    default:
      return block;
  }
}

export function applyMapLocationStylePatch<
  T extends MapLocationBlockShape,
>(
  block: T,
  target: MapLocationStyleTarget,
  patch: StylePatch,
): T {
  if (block.type !== "map_location") return block;

  switch (target) {
    case "addressPanel":
      return {
        ...block,
        data: {
          ...block.data,
          addressPanelStyle: {
            ...(block.data.addressPanelStyle ?? {}),
            ...patch,
          },
        },
      } as T;

    case "block":
      return {
        ...block,
        appearance: {
          ...(block.appearance ?? {}),
          ...patch,
        },
      } as T;

    default:
      return block;
  }
}