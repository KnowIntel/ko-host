import type {
  TemplateOverlayMetadata,
  OverlayDesignMetadata,
  OverlayPageElement,
  OverlayPlacement,
  OverlaySeedBlock,
  OverlayTextStyle,
} from "@/lib/templates/templateDesignCanvasMetadata";
import { normalizeTemplateName } from "@/lib/templates/normalizeTemplateName";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";

/* ---------------------------------------- */
/* Re-export shared types                    */
/* ---------------------------------------- */

export type {
  TemplateOverlayMetadata,
  OverlayDesignMetadata,
  OverlayPageElement,
  OverlayPlacement,
  OverlaySeedBlock,
  OverlayTextStyle,
};

/* ---------------------------------------- */
/* Small helpers                             */
/* ---------------------------------------- */

function textStyle(style: OverlayTextStyle): OverlayTextStyle {
  return style;
}

/* ---------------------------------------- */
/* Card-only metadata builders               */
/* ---------------------------------------- */

function createCardMetadataFromTemplate(
  template: string,
): TemplateOverlayMetadata {
  const base: OverlayDesignMetadata = {
    pageColor: "#ffffff",
    pageBackground: "",
    page: {
      title: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 1,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 1,
        },
        style: textStyle({
          fontFamily: "Inter",
          fontSize: 22,
          bold: true,
          align: "left",
        }),
      },
      subtitle: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 3,
          colSpan: 12,
          rowSpan: 1,
          zIndex: 2,
        },
        style: textStyle({
          fontFamily: "Inter",
          fontSize: 12,
          align: "left",
        }),
      },
      tagline: {
        enabled: false,
        grid: {
          colStart: 1,
          rowStart: 4,
          colSpan: 12,
          rowSpan: 1,
          zIndex: 3,
        },
        style: textStyle({
          fontFamily: "Inter",
          fontSize: 10,
          align: "left",
        }),
      },
      description: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 5,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 4,
        },
        style: textStyle({
          fontFamily: "Inter",
          fontSize: 10,
          align: "left",
        }),
      },
    },
    blocks: [] as OverlaySeedBlock[],
  };

  const showcase: OverlayDesignMetadata = {
    ...base,
    pageColor: "#ffffff",
    page: {
      ...base.page,
      title: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 1,
          colSpan: 8,
          rowSpan: 1,
          zIndex: 1,
        },
        style: textStyle({
          fontFamily: "inherit",
          fontSize: 30,
          bold: true,
          align: "left",
          color: "#1F46DD",
        }),
      },
      subtitle: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 3,
          colSpan: 4,
          rowSpan: 1,
          zIndex: 2,
        },
        style: textStyle({
          fontFamily: "inherit",
          bold: true,
          fontSize: 14,
          align: "left",
        }),
      },
      description: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 5,
          colSpan: 6,
          rowSpan: 2,
          zIndex: 4,
        },
        style: textStyle({
          fontFamily: "inherit",
          fontSize: 14,
          align: "left",
        }),
      },
      tagline: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 7,
          colSpan: 4,
          rowSpan: 1,
          zIndex: 5,
        },
        style: {
          fontFamily: "Inter",
          bold: true,
          fontSize: 10,
          align: "left",
        },
      },
    },
  };

  const festive: OverlayDesignMetadata = {
    ...base,
    pageColor: "#f8f1ea",
    page: {
      ...base.page,
      title: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 1,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 1,
        },
        style: textStyle({
          fontFamily: "Great Vibes",
          fontSize: 52,
          align: "center",
        }),
      },
      subtitle: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 3,
          colSpan: 12,
          rowSpan: 1,
          zIndex: 2,
        },
        style: textStyle({
          fontFamily: "Cormorant Garamond",
          fontSize: 18,
          align: "center",
        }),
      },
      tagline: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 4,
          colSpan: 12,
          rowSpan: 1,
          zIndex: 3,
        },
        style: textStyle({
          fontFamily: "Inter",
          fontSize: 9,
          bold: true,
          align: "center",
        }),
      },
      description: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 5,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 4,
        },
        style: textStyle({
          fontFamily: "Cormorant Garamond",
          fontSize: 13,
          align: "center",
        }),
      },
    },
  };

  const modern: OverlayDesignMetadata = {
    ...base,
    pageColor: "#0f1115",
    page: {
      ...base.page,
      title: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 1,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 1,
        },
        style: textStyle({
          fontFamily: "Poppins",
          fontSize: 32,
          bold: true,
          align: "left",
        }),
      },
      description: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 5,
          colSpan: 4,
          rowSpan: 2,
          zIndex: 4,
        },
        style: textStyle({
          fontFamily: "DM Sans",
          fontSize: 10,
          align: "left",
        }),
      },
    },
  };

  const elegant: OverlayDesignMetadata = {
    ...base,
    pageColor: "#f7f2eb",
    page: {
      ...base.page,
      title: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 1,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 1,
        },
        style: textStyle({
          fontFamily: "Cormorant Garamond",
          fontSize: 20,
          bold: true,
          align: "left",
        }),
      },
      subtitle: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 3,
          colSpan: 12,
          rowSpan: 1,
          zIndex: 2,
        },
        style: textStyle({
          fontFamily: "Great Vibes",
          fontSize: 42,
          align: "left",
        }),
      },
      description: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 5,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 4,
        },
        style: textStyle({
          fontFamily: "Cormorant Garamond",
          fontSize: 12,
          bold: true,
          align: "left",
        }),
      },
    },
  };

  const business: OverlayDesignMetadata = {
    ...base,
    pageColor: "#ffffff",
    page: {
      ...base.page,
      title: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 1,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 1,
        },
        style: textStyle({
          fontFamily: "DM Sans",
          fontSize: 20,
          bold: true,
          align: "left",
        }),
      },
      description: {
        enabled: true,
        grid: {
          colStart: 1,
          rowStart: 5,
          colSpan: 12,
          rowSpan: 2,
          zIndex: 4,
        },
        style: textStyle({
          fontFamily: "Poppins",
          fontSize: 13,
          align: "left",
        }),
      },
    },
  };

  const blank: OverlayDesignMetadata = {
    ...base,
  };

  return {
    template,
    showcase,
    festive,
    modern,
    elegant,
    business,
    blank,
  };
}

function createTemplateMetadata(template: string): TemplateOverlayMetadata {
  return createCardMetadataFromTemplate(template);
}

export const TEMPLATE_DESIGN_CARD_METADATA: Record<
  string,
  TemplateOverlayMetadata
> = {
  [normalizeTemplateName("Wedding")]: createTemplateMetadata("Wedding"),
  [normalizeTemplateName("Open House")]:
    createTemplateMetadata("Open House"),
  [normalizeTemplateName("Product Launch")]:
    createTemplateMetadata("Product Launch"),
  [normalizeTemplateName("Birthday")]: createTemplateMetadata("Birthday"),
  [normalizeTemplateName("Custom Template")]:
    createTemplateMetadata("Custom Template"),
};

export function getTemplateDesignCardMetadata(
  templateNameOrKey: string,
  designKey: DesignPresetLayout,
) {
  const entry =
    TEMPLATE_DESIGN_CARD_METADATA[
      normalizeTemplateName(templateNameOrKey)
    ];

  if (!entry) return null;

  return entry[designKey] ?? null;
}