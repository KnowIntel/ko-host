import type {
  BuilderBlockType,
  GridPlacement,
  TextStyle,
} from "@/lib/templates/builder";
import { normalizeTemplateName } from "@/lib/templates/normalizeTemplateName";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";

export type OverlayTextStyle = TextStyle;
export type OverlayPlacement = GridPlacement;

export type OverlayPageElement = {
  enabled: boolean;
  style?: OverlayTextStyle;
  grid?: OverlayPlacement;
};

export type OverlaySeedBlock = {
  key: string;
  enabled: boolean;
  type: BuilderBlockType;
  grid?: OverlayPlacement;
  data?: Record<string, unknown>;
};

export type OverlayDesignMetadata = {
  pageColor?: string;
  pageBackground?: string;
  page: {
    title: OverlayPageElement;
    subtitle: OverlayPageElement;
    tagline: OverlayPageElement;
    description: OverlayPageElement;
  };
  blocks: OverlaySeedBlock[];
};

export type TemplateOverlayMetadata = {
  template: string;
  showcase: OverlayDesignMetadata;
  festive: OverlayDesignMetadata;
  modern: OverlayDesignMetadata;
  elegant: OverlayDesignMetadata;
  business: OverlayDesignMetadata;
  blank: OverlayDesignMetadata;
};

/* ---------------------------------------- */
/* Small helpers                            */
/* ---------------------------------------- */

function typedStyle(style: OverlayTextStyle): OverlayTextStyle {
  return style;
}

function pageElement(
  grid: OverlayPlacement,
  style?: OverlayTextStyle,
  enabled = true,
): OverlayPageElement {
  return { enabled, grid, style };
}

function seedBlock(
  key: string,
  type: BuilderBlockType,
  grid: OverlayPlacement,
  data?: Record<string, unknown>,
  enabled = true,
): OverlaySeedBlock {
  return { key, type, grid, data, enabled };
}

/* ---------------------------------------- */
/* Modern                                   */
/* ---------------------------------------- */

function buildModernCanvasMetadata(): OverlayDesignMetadata {
  return {
    pageColor: "#0f1115",
    page: {
      title: pageElement(
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        typedStyle({ fontFamily: "Poppins", fontSize: 44, bold: true, align: "left" }),
      ),
      subtitle: pageElement(
        { colStart: 1, rowStart: 3, colSpan: 10, rowSpan: 1, zIndex: 2 },
        typedStyle({ fontFamily: "Poppins", fontSize: 22, bold: false, align: "left" }),
        false,
      ),
      tagline: pageElement(
        { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 },
        typedStyle({ fontFamily: "Poppins", fontSize: 16, align: "left" }),
        false,
      ),
      description: pageElement(
        { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
        typedStyle({ fontFamily: "Poppins", fontSize: 16, align: "left" }),
      ),
    },

    blocks: [
      seedBlock(
        "cta1",
        "cta",
        { colStart: 1, rowStart: 8, colSpan: 4, rowSpan: 1, zIndex: 10 },
        { heading: "", body: "", buttonText: "Learn More", buttonUrl: "#" },
      ),

      seedBlock(
        "label1",
        "label",
        { colStart: 1, rowStart: 10, colSpan: 4, rowSpan: 1, zIndex: 11 },
        {
          text: "Label 1",
          style: typedStyle({
            fontFamily: "Poppins",
            fontSize: 16,
            bold: true,
            align: "left",
          }),
        },
      ),

      seedBlock(
        "label2",
        "label",
        { colStart: 5, rowStart: 10, colSpan: 4, rowSpan: 1, zIndex: 12 },
        {
          text: "Label 2",
          style: typedStyle({
            fontFamily: "Poppins",
            fontSize: 16,
            bold: true,
            align: "left",
          }),
        },
      ),

      seedBlock(
        "label3",
        "label",
        { colStart: 9, rowStart: 10, colSpan: 4, rowSpan: 1, zIndex: 13 },
        {
          text: "Label 3",
          style: typedStyle({
            fontFamily: "Poppins",
            fontSize: 16,
            bold: true,
            align: "left",
          }),
        },
      ),

      seedBlock(
        "links1",
        "links",
        { colStart: 1, rowStart: 12, colSpan: 12, rowSpan: 2, zIndex: 14 },
        {
          heading: "Quick Links",
          items: [
            { id: "seed_link_1", label: "Overview", url: "#" },
            { id: "seed_link_2", label: "Details", url: "#" },
            { id: "seed_link_3", label: "Contact", url: "#" },
          ],
        },
      ),
    ],
  };
}

/* ---------------------------------------- */
/* Elegant                                  */
/* ---------------------------------------- */

function buildElegantCanvasMetadata(): OverlayDesignMetadata {
  return {
    pageColor: "#f7f2eb",

    page: {
      title: pageElement(
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        typedStyle({
          fontFamily: "Cormorant Garamond",
          fontSize: 46,
          bold: false,
          italic: false,
          underline: false,
          align: "left",
        }),
      ),

      subtitle: pageElement(
        { colStart: 1, rowStart: 3, colSpan: 10, rowSpan: 1, zIndex: 2 },
        typedStyle({
          fontFamily: "Great Vibes",
          fontSize: 28,
          align: "left",
        }),
      ),

      tagline: pageElement(
        { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 },
        typedStyle({ fontFamily: "Cormorant Garamond", fontSize: 16, align: "left" }),
        false,
      ),

      description: pageElement(
        { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
        typedStyle({
          fontFamily: "Cormorant Garamond",
          fontSize: 16,
          bold: true,
          align: "left",
        }),
      ),
    },

    blocks: [
      seedBlock(
        "cta1",
        "cta",
        { colStart: 1, rowStart: 8, colSpan: 4, rowSpan: 1, zIndex: 10 },
        { heading: "", body: "", buttonText: "View Details", buttonUrl: "#" },
      ),

      seedBlock(
        "label1",
        "label",
        { colStart: 1, rowStart: 10, colSpan: 6, rowSpan: 1, zIndex: 11 },
        {
          text: "Label 1",
          style: typedStyle({
            fontFamily: "Cormorant Garamond",
            fontSize: 18,
            align: "left",
          }),
        },
      ),
    ],
  };
}

/* ---------------------------------------- */
/* Remaining builders unchanged              */
/* ---------------------------------------- */

function buildShowcaseCanvasMetadata(): OverlayDesignMetadata {
  return {
    pageColor: "#ffffff",
    page: {
      title: pageElement(
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        typedStyle({
          fontFamily: "inherit",
          fontSize: 88,
          bold: true,
          align: "left",
          color: "#1F46DD",
        }),
      ),

      subtitle: pageElement(
        { colStart: 1, rowStart: 2, colSpan: 5, rowSpan: 1, zIndex: 2 },
        typedStyle({ fontFamily: "inherit", fontSize: 40, align: "left", bold: true }),
      ),

      tagline: pageElement(
        { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 },
        typedStyle({ fontFamily: "inherit", fontSize: 16, align: "left" }),
        false,
      ),

      description: pageElement(
        { colStart: 1, rowStart: 2.5, colSpan: 4, rowSpan: 2, zIndex: 4 },
        typedStyle({ fontFamily: "inherit", fontSize: 38, align: "left" }),
      ),
    },

    blocks: [seedBlock(
        "rsvp1",
        "rsvp",
        { colStart: 1, rowStart: 5, colSpan: 4, rowSpan: 3, zIndex: 10 },
        {
          heading: "RSVP",
          description: "Can you make it to the party",
          buttonLabel: "Submit RSVP",
        },
      ),
      seedBlock(
        "cta1",
        "cta",
        { colStart: 1.5, rowStart: 4, colSpan: 2.5, rowSpan: 0.5, zIndex: 10 },
        {
          heading: "",
          body: "",
          buttonText: "View Details",
          buttonUrl: "#",
        },
      ),
      seedBlock(
        "image1",
        "image",
        { colStart: 6, rowStart: 2, colSpan: 6, rowSpan: 4, zIndex: 9 },
        {
          image: {
            id: "seed_img_1",
            url: "/designs/design_image_placeholder.webp",
            alt: "Showcase image",
          },
        },
      ),
      seedBlock(
        "image2",
        "image",
        { colStart: 6, rowStart: 6, colSpan: 3, rowSpan: 2, zIndex: 9 },
        {
          image: {
            id: "seed_img_2",
            url: "/designs/design_image_placeholder_1536.webp",
            alt: "Showcase image",
          },
        },
      ),
      seedBlock(
        "image3",
        "image",
        { colStart: 9, rowStart: 6, colSpan: 3, rowSpan: 2, zIndex: 9 },
        {
          image: {
            id: "seed_img_3",
            url: "/designs/design_image_placeholder_1536.webp",
            alt: "Showcase image",
          },
        },
      ),
      seedBlock(
        "gallery1",
        "gallery",
        { colStart: 1, rowStart: 8, colSpan: 12, rowSpan: 4, zIndex: 11 },
        {
          grid: 3,
          images: [],
        },
      ),
      seedBlock(
        "links1",
        "links",
        { colStart: 1, rowStart: 12, colSpan: 12, rowSpan: 2, zIndex: 12 },
        {
          heading: "Quick Links",
          items: [
            { id: "seed_link_1", label: "Learn More", url: "#" },
            { id: "seed_link_2", label: "Details", url: "#" },
          ],
        },
      ),
    ],
  };
}

/* ---------------------------------------- */
/* Preset map                                */
/* ---------------------------------------- */

const SHARED_CANVAS_PRESETS = {
  showcase: buildShowcaseCanvasMetadata(),
  festive: buildShowcaseCanvasMetadata(),
  modern: buildModernCanvasMetadata(),
  elegant: buildElegantCanvasMetadata(),
  business: buildModernCanvasMetadata(),
  blank: buildShowcaseCanvasMetadata(),
};

function createTemplateCanvasMetadata(template: string): TemplateOverlayMetadata {
  return {
    template,
    showcase: SHARED_CANVAS_PRESETS.showcase,
    festive: SHARED_CANVAS_PRESETS.festive,
    modern: SHARED_CANVAS_PRESETS.modern,
    elegant: SHARED_CANVAS_PRESETS.elegant,
    business: SHARED_CANVAS_PRESETS.business,
    blank: SHARED_CANVAS_PRESETS.blank,
  };
}

export const TEMPLATE_DESIGN_CANVAS_METADATA: Record<
  string,
  TemplateOverlayMetadata
> = {
  [normalizeTemplateName("Wedding")]: createTemplateCanvasMetadata("Wedding"),
  [normalizeTemplateName("Open House")]: createTemplateCanvasMetadata("Open House"),
  [normalizeTemplateName("Product Launch")]: createTemplateCanvasMetadata("Product Launch"),
  [normalizeTemplateName("Birthday")]: createTemplateCanvasMetadata("Birthday"),
  [normalizeTemplateName("Custom Template")]: createTemplateCanvasMetadata("Custom Template"),
};

export function getTemplateDesignCanvasMetadata(
  templateNameOrKey: string,
  designKey: DesignPresetLayout,
) {
  const entry =
    TEMPLATE_DESIGN_CANVAS_METADATA[
      normalizeTemplateName(templateNameOrKey)
    ];

  if (!entry) return null;

  return entry[designKey] ?? null;
}