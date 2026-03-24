import type {
  BuilderDraft,
  MicrositeBlock,
  ImageBlock,
  LabelBlock,
  TextFxBlock,
  ShapeBlock,
  GalleryBlock,
  CtaBlock,
  CountdownBlock,
  LinksBlock,
  PollBlock,
  RsvpBlock,
  FaqBlock,
  MessageThreadBlock,
  ShowcaseBlock,
  FestiveBackgroundBlock,
  PaddingBlock,
  GridPlacement,
} from "@/lib/templates/builder";
import {
  createDefaultBlockAppearance,
  createDefaultTextStyle,
  makeId,
} from "@/lib/templates/builder";
import type {
  DesignLayoutDefinition,
  OptionalBlockConfig,
  PageTextBlockConfig,
} from "./types";

type DraftWithTemplateName = BuilderDraft & {
  templateName?: string;
  pageBackgroundImage?: string;
};

function toGrid(
  placement?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    zIndex?: number;
  },
  fallback?: Partial<GridPlacement>,
): GridPlacement {
  return {
    colStart: placement?.x ?? fallback?.colStart ?? 1,
    rowStart: placement?.y ?? fallback?.rowStart ?? 1,
    colSpan: placement?.width ?? fallback?.colSpan ?? 12,
    rowSpan: placement?.height ?? fallback?.rowSpan ?? 1,
    zIndex: placement?.zIndex ?? fallback?.zIndex ?? 1,
  };
}

function getPageTextBlock(
  layout: DesignLayoutDefinition,
  type: PageTextBlockConfig["type"],
) {
  return (
    layout.pageTextBlocks?.find(
      (block) => block.type === type && block.visible !== false,
    ) ?? null
  );
}

function makeLabelBlock(
  text: string,
  placement?: OptionalBlockConfig["placement"],
  style?: PageTextBlockConfig["style"],
  label = "Label",
): LabelBlock {
  return {
    id: makeId("label"),
    type: "label",
    label,
    grid: toGrid(placement),
    appearance: createDefaultBlockAppearance(),
    data: {
      text,
      style: {
        ...createDefaultTextStyle(),
        ...(style || {}),
      },
    },
  };
}

function makeConfiguredLabelBlock(config: OptionalBlockConfig): LabelBlock {
  return {
    id: makeId("label"),
    type: "label",
    label: config.config?.label || "Label",
    grid: toGrid(config.placement, { colSpan: 4, rowSpan: 1 }),
    appearance: {
      ...createDefaultBlockAppearance(),
      backgroundColor: config.config?.backgroundColor ?? "transparent",
      borderColor: config.config?.borderColor ?? "#D1D5DB",
      borderWidth:
        typeof config.config?.borderWidth === "number"
          ? config.config.borderWidth
          : 0,
      borderRadius:
        typeof config.config?.borderRadius === "number"
          ? config.config.borderRadius
          : 16,
    },
    data: {
      text: config.config?.text || "Label",
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
    },
  };
}

function makeTextFxBlock(config: OptionalBlockConfig): TextFxBlock {
  return {
    id: makeId("textfx"),
    type: "text_fx",
    label: config.config?.label || "TextFX",
    grid: toGrid(config.placement, { colSpan: 6, rowSpan: 2 }),
    appearance: {
      ...createDefaultBlockAppearance(),
      backgroundColor: config.config?.backgroundColor ?? "transparent",
      borderColor: config.config?.borderColor ?? "#D1D5DB",
      borderWidth:
        typeof config.config?.borderWidth === "number"
          ? config.config.borderWidth
          : 0,
      borderRadius:
        typeof config.config?.borderRadius === "number"
          ? config.config.borderRadius
          : 0,
    },
    data: {
      text: config.config?.text || "TextFX",
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
      fx: {
        mode: config.config?.fx?.mode || "straight",
        intensity:
          typeof config.config?.fx?.intensity === "number"
            ? config.config.fx.intensity
            : 50,
        rotation:
          typeof config.config?.fx?.rotation === "number"
            ? config.config.fx.rotation
            : 0,
        opacity:
          typeof config.config?.fx?.opacity === "number"
            ? config.config.fx.opacity
            : 1,
        outline: {
          enabled: config.config?.fx?.outline?.enabled ?? false,
          color: config.config?.fx?.outline?.color || "#000000",
          width:
            typeof config.config?.fx?.outline?.width === "number"
              ? config.config.fx.outline.width
              : 2,
        },
      },
    },
  };
}

function makeImageBlock(config: OptionalBlockConfig): ImageBlock {
  return {
    id: makeId("image"),
    type: "image",
    label: "Image",
    grid: toGrid(config.placement, { colSpan: 4, rowSpan: 3 }),
    appearance: {
      ...createDefaultBlockAppearance(),
      backgroundColor: config.config?.backgroundColor ?? "transparent",
      borderColor: config.config?.borderColor ?? "#D1D5DB",
      borderWidth:
        typeof config.config?.borderWidth === "number"
          ? config.config.borderWidth
          : 0,
      borderRadius:
        typeof config.config?.borderRadius === "number"
          ? config.config.borderRadius
          : 16,
    },
    data: {
      image: {
        id: makeId("img"),
        url:
          config.config?.src ||
          config.config?.imageSrc ||
          config.config?.url ||
          config.config?.image ||
          "",
        alt: config.config?.alt || "",
        fitMode:
          config.config?.fit === "contain"
            ? "clip"
            : config.config?.fit === "fill"
              ? "stretch"
              : "zoom",
        frame: config.config?.frame || "square",
        positionX:
          typeof config.config?.positionX === "number"
            ? config.config.positionX
            : 50,
        positionY:
          typeof config.config?.positionY === "number"
            ? config.config.positionY
            : 50,
        zoom:
          typeof config.config?.zoom === "number" ? config.config.zoom : 1,
        rotation:
          typeof config.config?.rotation === "number"
            ? config.config.rotation
            : 0,
      },
    },
  };
}

function makeShapeBlock(config: OptionalBlockConfig): ShapeBlock {
  return {
    id: makeId("shape"),
    type: "shape",
    label: "Shape",
    grid: toGrid(config.placement, { colSpan: 3, rowSpan: 2 }),
    appearance: {
      ...createDefaultBlockAppearance(),
      backgroundColor: config.config?.backgroundColor ?? "#E5E7EB",
      borderColor: config.config?.borderColor ?? "#9CA3AF",
      borderWidth:
        typeof config.config?.borderWidth === "number"
          ? config.config.borderWidth
          : 1,
      borderRadius:
        typeof config.config?.borderRadius === "number"
          ? config.config.borderRadius
          : 16,
    },
    data: {
      shapeType: config.config?.shapeType || "rectangle",
    },
  };
}

function makeGalleryBlock(config: OptionalBlockConfig): GalleryBlock {
  return {
    id: makeId("gallery"),
    type: "gallery",
    label: "Gallery",
    grid: toGrid(config.placement, { colSpan: 6, rowSpan: 3 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      grid:
        typeof config.config?.grid === "number" ? config.config.grid : 2,
      images: Array.isArray(config.config?.images)
        ? config.config.images.map((image: any) => ({
            id: image.id || makeId("gallery"),
            url: image.url || "",
          }))
        : [],
    },
  };
}

function makeCtaBlock(config: OptionalBlockConfig): CtaBlock {
  return {
    id: makeId("cta"),
    type: "cta",
    label: "Button",
    grid: toGrid(config.placement, { colSpan: 3, rowSpan: 1 }),
    appearance: {
      ...createDefaultBlockAppearance(),
      backgroundColor:
        config.config?.backgroundColor ??
        config.config?.appearance?.backgroundColor ??
        createDefaultBlockAppearance().backgroundColor,
      borderColor:
        config.config?.borderColor ??
        config.config?.appearance?.borderColor ??
        createDefaultBlockAppearance().borderColor,
      borderWidth:
        typeof config.config?.borderWidth === "number"
          ? config.config.borderWidth
          : typeof config.config?.appearance?.borderWidth === "number"
            ? config.config.appearance.borderWidth
            : createDefaultBlockAppearance().borderWidth,
      borderRadius:
        typeof config.config?.borderRadius === "number"
          ? config.config.borderRadius
          : typeof config.config?.appearance?.borderRadius === "number"
            ? config.config.appearance.borderRadius
            : createDefaultBlockAppearance().borderRadius,
    },
    data: {
      heading: config.config?.heading || "",
      body: config.config?.body || "",
      buttonText: config.config?.buttonText || "Learn More",
      buttonUrl: config.config?.buttonUrl || "#",
      styleType: config.config?.styleType || "solid",
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
    },
  };
}

function makeCountdownBlock(config: OptionalBlockConfig): CountdownBlock {
  return {
    id: makeId("countdown"),
    type: "countdown",
    label: "Countdown",
    grid: toGrid(config.placement, { colSpan: 4, rowSpan: 2 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      heading: config.config?.heading || "",
      targetIso: config.config?.targetIso || "",
      completedMessage: config.config?.completedMessage || "Countdown finished",
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
    },
  };
}

function makeLinksBlock(config: OptionalBlockConfig): LinksBlock {
  return {
    id: makeId("links"),
    type: "links",
    label: "Navigation Link",
    grid: toGrid(config.placement, { colSpan: 4, rowSpan: 2 }),
    appearance: {
      ...createDefaultBlockAppearance(),
      ...(config.config?.appearance || {}),
    },
    data: {
      heading: config.config?.heading || "",
      items: Array.isArray(config.config?.items)
        ? config.config.items.map((item: any) => ({
            id: item.id || makeId("link"),
            label: item.label || "Link",
            url: item.url || "#",
          }))
        : [],
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
      layout: config.config?.layout || "vertical",
    } as any,
  };
}

function makePollBlock(config: OptionalBlockConfig): PollBlock {
  return {
    id: makeId("poll"),
    type: "poll",
    label: "Poll",
    grid: toGrid(config.placement, { colSpan: 4, rowSpan: 2 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      question: config.config?.question || "Your question here",
      options: Array.isArray(config.config?.options)
        ? config.config.options.map((option: any) => ({
            id: option.id || makeId("opt"),
            text: option.text || "Option",
          }))
        : [],
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
    },
  };
}

function makeRsvpBlock(config: OptionalBlockConfig): RsvpBlock {
  return {
    id: makeId("rsvp"),
    type: "rsvp",
    label: "RSVP",
    grid: toGrid(config.placement, { colSpan: 4, rowSpan: 3 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      heading: config.config?.heading || "RSVP",
      collectName: config.config?.collectName ?? true,
      collectEmail: config.config?.collectEmail ?? true,
      collectPhone: config.config?.collectPhone ?? false,
      collectGuestCount: config.config?.collectGuestCount ?? false,
      collectNotes: config.config?.collectNotes ?? false,
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
    },
  };
}

function makeFaqBlock(config: OptionalBlockConfig): FaqBlock {
  return {
    id: makeId("faq"),
    type: "faq",
    label: "FAQ",
    grid: toGrid(config.placement, { colSpan: 5, rowSpan: 3 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      items: Array.isArray(config.config?.items)
        ? config.config.items.map((item: any) => ({
            id: item.id || makeId("faq"),
            question: item.question || "Question",
            answer: item.answer || "Answer",
          }))
        : [],
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
    },
  };
}

function makeThreadBlock(config: OptionalBlockConfig): MessageThreadBlock {
  return {
    id: makeId("thread"),
    type: "thread",
    label: "Message Thread",
    grid: toGrid(config.placement, { colSpan: 5, rowSpan: 3 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      messages: Array.isArray(config.config?.messages)
        ? config.config.messages.map((message: any) => ({
            id: message.id || makeId("msg"),
            name: message.name || "Name",
            message: message.message || "Message",
          }))
        : [],
      subject: config.config?.subject || "",
      allowAnonymous: config.config?.allowAnonymous ?? false,
      requireApproval: config.config?.requireApproval ?? false,
      style: {
        ...createDefaultTextStyle(),
        ...(config.config?.style || {}),
      },
    },
  };
}

function makeShowcaseBlock(config: OptionalBlockConfig): ShowcaseBlock {
  return {
    id: makeId("showcase"),
    type: "showcase",
    label: "Showcase",
    grid: toGrid(config.placement, { colSpan: 6, rowSpan: 4 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      images: Array.isArray(config.config?.images)
        ? config.config.images.map((image: any) => ({
            id: image.id || makeId("show"),
            url: image.url || "",
          }))
        : [],
    },
  };
}

function makeFestiveBackgroundBlock(
  config: OptionalBlockConfig,
): FestiveBackgroundBlock {
  return {
    id: makeId("festivebg"),
    type: "festiveBackground",
    label: "Background Image",
    grid: toGrid(config.placement, { colSpan: 12, rowSpan: 8 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      image: {
        id: makeId("img"),
        url:
          config.config?.src ||
          config.config?.imageSrc ||
          config.config?.url ||
          config.config?.image ||
          "",
      },
    },
  };
}

function makePaddingBlock(config: OptionalBlockConfig): PaddingBlock {
  return {
    id: makeId("padding"),
    type: "padding",
    label: "Spacing",
    grid: toGrid(config.placement, { colSpan: 12, rowSpan: 1 }),
    appearance: createDefaultBlockAppearance(),
    data: {
      height:
        typeof config.config?.height === "number" ? config.config.height : 40,
    },
  };
}

function optionalConfigToBlock(config: OptionalBlockConfig): MicrositeBlock | null {
  switch (config.type) {
    case "label":
      return makeConfiguredLabelBlock(config);
    case "text_fx":
      return makeTextFxBlock(config);
    case "image":
      return makeImageBlock(config);
    case "shape":
      return makeShapeBlock(config);
    case "gallery":
      return makeGalleryBlock(config);
    case "cta":
      return makeCtaBlock(config);
    case "countdown":
      return makeCountdownBlock(config);
    case "links":
      return makeLinksBlock(config);
    case "poll":
      return makePollBlock(config);
    case "rsvp":
      return makeRsvpBlock(config);
    case "faq":
      return makeFaqBlock(config);
    case "thread":
      return makeThreadBlock(config);
    case "showcase":
      return makeShowcaseBlock(config);
    case "padding":
      return makePaddingBlock(config);
    default:
      return null;
  }
}
export function createDraftFromLayoutDefinition(args: {
  templateKey: string;
  layout: DesignLayoutDefinition;
  slugSuggestion?: string;
}): DraftWithTemplateName {
  const { templateKey, layout, slugSuggestion = "" } = args;

  const title = getPageTextBlock(layout, "title");
  const subtitle = getPageTextBlock(layout, "subtitle");
  const subtitleSecondary = getPageTextBlock(layout, "subtitle_secondary");
  const tagline = getPageTextBlock(layout, "tagline");
  const taglineSecondary = getPageTextBlock(layout, "tagline_secondary");
  const description = getPageTextBlock(layout, "description");
  const descriptionSecondary = getPageTextBlock(layout, "description_secondary");

  const extraTextBlocks: MicrositeBlock[] = [];

  if (subtitleSecondary?.text) {
    extraTextBlocks.push(
      makeLabelBlock(
        subtitleSecondary.text,
        subtitleSecondary.placement,
        subtitleSecondary.style,
        "Subtitle Secondary",
      ),
    );
  }

  if (taglineSecondary?.text) {
    extraTextBlocks.push(
      makeLabelBlock(
        taglineSecondary.text,
        taglineSecondary.placement,
        taglineSecondary.style,
        "Tagline Secondary",
      ),
    );
  }

  if (descriptionSecondary?.text) {
    extraTextBlocks.push(
      makeLabelBlock(
        descriptionSecondary.text,
        descriptionSecondary.placement,
        descriptionSecondary.style,
        "Description Secondary",
      ),
    );
  }

  const optionalBlocks = (layout.optionalBlocks || [])
    .map(optionalConfigToBlock)
    .filter(Boolean) as MicrositeBlock[];

  return {
    templateName: templateKey,
    pageBackgroundImage: layout.card.thumbnail || "",
    title: title?.text || "",
    subtitle: subtitle?.text || "",
    subtext: tagline?.text || "",
    description: description?.text || "",
    slugSuggestion,
    pageBackground: layout.page?.backgroundColor || "#ffffff",
    pageVisibility: {
      title: !!title,
      subtitle: !!subtitle,
      subtext: !!tagline,
      description: !!description,
    },
    pageElements: {
      title: title ? toGrid(title.placement) : undefined,
      subtitle: subtitle ? toGrid(subtitle.placement) : undefined,
      subtext: tagline ? toGrid(tagline.placement) : undefined,
      description: description ? toGrid(description.placement) : undefined,
    },
    titleStyle: title?.style
      ? { ...createDefaultTextStyle(), ...title.style }
      : createDefaultTextStyle(),
    subtitleStyle: subtitle?.style
      ? { ...createDefaultTextStyle(), ...subtitle.style }
      : createDefaultTextStyle(),
    subtextStyle: tagline?.style
      ? { ...createDefaultTextStyle(), ...tagline.style }
      : createDefaultTextStyle(),
    descriptionStyle: description?.style
      ? { ...createDefaultTextStyle(), ...description.style }
      : createDefaultTextStyle(),
    blocks: [...optionalBlocks, ...extraTextBlocks].sort((a, b) => {
      const aZ = a.grid?.zIndex ?? 1;
      const bZ = b.grid?.zIndex ?? 1;
      return aZ - bZ;
    }),
  };
}