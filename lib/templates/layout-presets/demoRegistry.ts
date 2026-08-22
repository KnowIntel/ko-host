export type DesignDemoDefinition = {
  templateKey: string;
  designKey: string;
  demoSlug: string;
};

export const DESIGN_DEMOS: DesignDemoDefinition[] = [
  {
    templateKey: "group_trip",
    designKey: "dolce",
    demoSlug: "dolce-vita-demo",
  },

  {
    templateKey: "group_trip",
    designKey: "prime",
    demoSlug: "group-trip-prime",
  },
];

export function getDesignDemo(
  templateKey: string,
  designKey: string,
) {
  return DESIGN_DEMOS.find(
    (item) =>
      item.templateKey === templateKey &&
      item.designKey === designKey,
  );
}