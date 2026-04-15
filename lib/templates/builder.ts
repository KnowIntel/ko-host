// lib/templates/builder.ts
/* =========================================
   Ko-Host Builder Core Types
   ========================================= */

export type TextAlign = "left" | "center" | "right";

export type TextStyle = {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: TextAlign;
  color?: string;
};

/* =========================================
   TextFX Types
   ========================================= */

export type TextFxType = "straight" | "arch" | "dip" | "circle";

export type TextFxStyle = {
  effectType?: TextFxType;
  bendAmount?: number;
  radius?: number;
  letterSpacing?: number;
  rotation?: number;
  opacity?: number;
};

/* =========================================
   Block Appearance
   ========================================= */

export type BlockAppearance = {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
};

/* =========================================
   Grid Placement
   ========================================= */

export type GridPlacement = {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
  zIndex?: number;
};

export type PageVisibility = {
  title?: boolean;
  subtitle?: boolean;
  subtext?: boolean;
  description?: boolean;
};

export type PageElements = {
  title?: Partial<GridPlacement>;
  subtitle?: Partial<GridPlacement>;
  subtext?: Partial<GridPlacement>;
  description?: Partial<GridPlacement>;
};

export type PageBlockAppearance = Partial<
  Record<
    "title" | "subtitle" | "subtext" | "description",
    {
      backgroundColor?: string;
    }
  >
>;

/* =========================================
   Block Types
   ========================================= */

export type BuilderBlockType =
  | "label"
  | "text_fx"
  | "image"
  | "image_carousel"
  | "links"
  | "cta"
  | "countdown"
  | "padding"
  | "poll"
  | "rsvp"
  | "faq"
  | "gallery"
  | "thread"
  | "highlight"
  | "showcase"
  | "festiveBackground"
  | "form_field"
  | "shape"
  | "listing"
  | "rich_text"
  | "video"
  | "progress_bar"
  | "donation"
  | "link_hub"
  | "checklist"
  | "schedule_agenda"
  | "map_location"
  | "file_share"
  | "speed_dating"
  | "registry";

/* =========================================
   Shared Primitive Types
   ========================================= */

export type LinkItem = {
  id: string;
  label: string;
  url: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  shape?: "square" | "rounded" | "circle";
};

export type ShowcaseImage = {
  id: string;
  url: string;
};

export type PollOption = {
  id: string;
  text: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ThreadMessage = {
  id: string;
  name: string;
  message: string;
  votes?: number;
};

export type CarouselImageItem = {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  href?: string;
  openInNewTab?: boolean;
  positionX?: number;
  positionY?: number;
  zoom?: number;
  rotation?: number;
};

export type ListingMetadataItem = {
  id: string;
  label: string;
  value: string;
};

export type RegistryItem = {
  id: string;
  label: string;
  url: string;
  store?: string;
  price?: string;
  note?: string;
  imageUrl?: string;

  // NEW
  quantity?: number;
  purchased?: number;
  contributors?: { name: string; amount?: number }[];
};

export type ShapeType = "rectangle" | "circle" | "line";
export type ImageFitMode = "clip" | "stretch" | "zoom";
export type ImageFrameType = "square" | "circle" | "diamond" | "heart";
export type ListingCardVariant = "stacked" | "compact";

export type ImageFade = {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  size?: number;
};

/* =========================================
   Base Block
   ========================================= */

export type BaseBlock = {
  id: string;
  label: string;
  grid?: GridPlacement;
  appearance?: BlockAppearance;
};

/* =========================================
   Block Definitions
   ========================================= */

export type LabelBlock = BaseBlock & {
  type: "label";
  data: {
    text: string;
    style?: TextStyle;
  };
};

export type TextFxBlock = BaseBlock & {
  type: "text_fx";
  data: {
    text: string;
    style?: TextStyle;
    fx?: {
      mode?: "straight" | "arch" | "dip" | "circle";
      intensity?: number;
      rotation?: number;
      opacity?: number;
      outline?: {
        enabled?: boolean;
        color?: string;
        width?: number;
      };
    };
  };
};

export type ImageBlock = BaseBlock & {
  type: "image";
  data: {
    image: {
      id: string;
      url: string;
      alt?: string;
      fitMode?: ImageFitMode;
      frame?: ImageFrameType;
      positionX?: number;
      positionY?: number;
      zoom?: number;
      rotation?: number;
      opacity?: number;
      fade?: {
        top?: boolean;
        right?: boolean;
        bottom?: boolean;
        left?: boolean;
        size?: number; // percent, 0-50
      };
    };
  };
};

export type ImageCarouselBlock = BaseBlock & {
  type: "image_carousel";
  data: {
    heading?: string;
    items: CarouselImageItem[];
    autoRotate?: boolean;
    intervalMs?: number;
    visibleCount?: 1 | 2 | 3 | 4 | 5 | 6;
    scrollDirection?: "left" | "right" | "up" | "down";
    pauseOnHover?: boolean;
    showOverlay?: boolean;
    showTitles?: boolean;
    openLinksInNewTab?: boolean;
    style?: TextStyle;
  };
};

export type LinksBlock = BaseBlock & {
  type: "links";
  data: {
    heading?: string;
    items: LinkItem[];
    style?: TextStyle;
  };
};

export type CtaBlock = BaseBlock & {
  type: "cta";
  data: {
    heading?: string;
    body?: string;
    buttonText: string;
    buttonUrl: string;
    style?: TextStyle;
    styleType?: "solid" | "outline" | "soft";
  };
};

export type CountdownBlock = BaseBlock & {
  type: "countdown";
  data: {
    heading?: string;
    targetIso: string;
    completedMessage: string;
    style?: TextStyle;
    styleVariant?: "default" | "cards" | "hero";
    showRings?: boolean;
  };
};

export type PaddingBlock = BaseBlock & {
  type: "padding";
  data: {
    height: number;
  };
};

export type PollBlock = BaseBlock & {
  type: "poll";
  data: {
    question: string;
    options: PollOption[];
    style?: TextStyle;
  };
};

export type RsvpBlock = BaseBlock & {
  type: "rsvp";
  data: {
    heading: string;
    collectName: boolean;
    collectEmail: boolean;
    collectPhone?: boolean;
    collectGuestCount?: boolean;
    collectNotes?: boolean;
    style?: TextStyle;
  };
};

export type FaqBlock = BaseBlock & {
  type: "faq";
  data: {
    items: FaqItem[];
    style?: TextStyle;
  };
};

export type GalleryBlock = BaseBlock & {
  type: "gallery";
  data: {
    columns: number;
    rows?: number;
    images: GalleryImage[];
    positionX?: number;
    positionY?: number;
  };
};

export type MessageThreadBlock = BaseBlock & {
  type: "thread";
  data: {
    messages?: ThreadMessage[];
    subject?: string;
    allowAnonymous?: boolean;
    requireApproval?: boolean;
    composerPlaceholder?: string;
    postButtonText?: string;
    postButtonStyle?: "solid" | "outline" | "soft";
    maxVisibleMessages?: number;
    style?: TextStyle;
    namePlaceholder?: string;
    showNameField?: boolean;
    showVoteControls?: boolean;
    showVoteCount?: boolean;
    scrollHeight?: number;
  };
};

export type HighlightBlock = BaseBlock & {
  type: "highlight";
  data: {
    mode?: "top_messages" | "rsvp_count" | "total_funds";
    heading?: string;
    limit?: number;
    sourceBlockId?: string;
    sourceFormBlockId?: string;
    style?: TextStyle;
  };
};

export type ShowcaseBlock = BaseBlock & {
  type: "showcase";
  data: {
    images: ShowcaseImage[];
  };
};

export type FestiveBackgroundBlock = BaseBlock & {
  type: "festiveBackground";
  data: {
    image: {
      id: string;
      url: string;
    };
  };
};

export type ShapeBlock = BaseBlock & {
  type: "shape";
  data: {
    shapeType: ShapeType;
    rotation?: number;
  };
};

export type FormFieldType = "text" | "email" | "phone" | "textarea";

export type FormFieldBlock = BaseBlock & {
  type: "form_field";
  data: {
    label: string;
    placeholder: string;
    required: boolean;
    fieldType: FormFieldType;
    value?: string;
    submitButtonText?: string;
    showLabel?: boolean;
    showPlaceholder?: boolean;
    showRequired?: boolean;
    showSubmitButtonText?: boolean;
    style?: TextStyle;
  };
};

export type ListingBlock = BaseBlock & {
  type: "listing";
  data: {
    image: {
      id: string;
      url: string;
      alt?: string;
      fitMode?: ImageFitMode;
      frame?: ImageFrameType;
      positionX?: number;
      positionY?: number;
      zoom?: number;
      rotation?: number;
      opacity?: number;
    };
    title: string;
    description: string;
    metadata: ListingMetadataItem[];
    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    metadataStyle?: TextStyle;
    cardVariant?: ListingCardVariant;
    imageHeightPercent?: number;
  };
};

export type RichTextBlock = BaseBlock & {
  type: "rich_text";
  data: {
    title?: string;
    content: string;
    style?: TextStyle;
    listType?: "none" | "bullet" | "number";
    linkUrl?: string;
  };
};

export type VideoBlock = BaseBlock & {
  type: "video";
  data: {
    title?: string;
    videoUrl: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    showControls?: boolean;
    style?: TextStyle;
  };
};

export type ProgressBarBlock = BaseBlock & {
  type: "progress_bar";
  data: {
    heading?: string;
    value: number;
    max: number;
    showPercentage?: boolean;
    style?: TextStyle;
  };
};

export type DonationBlock = BaseBlock & {
  type: "donation";
  data: {
    heading?: string;
    description?: string;
    goalAmount?: number;
    currentAmount?: number;
    buttonText?: string;
    buttonUrl?: string;
    style?: TextStyle;
  };
};

export type LinkHubBlock = BaseBlock & {
  type: "link_hub";
  data: {
    heading?: string;
    items: LinkItem[];
    style?: TextStyle;
  };
};

export type ChecklistBlock = BaseBlock & {
  type: "checklist";
  data: {
    heading?: string;
    items: Array<{
      id: string;
      label: string;
      checked?: boolean;
    }>;
    style?: TextStyle;
  };
};

export type ScheduleAgendaBlock = BaseBlock & {
  type: "schedule_agenda";
  data: {
    heading?: string;
    items: Array<{
      id: string;
      time: string;
      title: string;
      description?: string;
    }>;
    style?: TextStyle;
  };
};

export type MapLocationBlock = BaseBlock & {
  type: "map_location";
  data: {
    heading?: string;
    locationName?: string;
    address?: string;
    mapUrl?: string;
    style?: TextStyle;
  };
};

export type FileShareBlock = BaseBlock & {
  type: "file_share";
  data: {
    heading?: string;
    subtext?: string;

    allowPublicUpload: boolean;

    requireAccessCode: boolean;
    accessCode?: string;

    acceptedFileTypes?: string[];
    maxFileSizeMb?: number;

    allowMultiple?: boolean;

    collectName?: boolean;
    collectEmail?: boolean;
    collectMessage?: boolean;

    ownerAlertOnUpload?: boolean;

    style?: TextStyle;
  };
};


export type SpeedDatingBlock = BaseBlock & {
  type: "speed_dating";
  data: {
    heading?: string;
    roundDurationSeconds: number;

    showTimer?: boolean;

    // optional future-safe labels
    leftLabel?: string;
    rightLabel?: string;

    roundStartSound?: "none" | "arrival" | "spark" | "commence" | "cloak" | "vanish"

    style?: TextStyle;
  };
};

export type RegistryBlock = BaseBlock & {
  type: "registry";
  data: {
    heading?: string;
    description?: string;
    items: RegistryItem[];
    style?: TextStyle;
  };
};

export type MicrositeBlock =
  | LabelBlock
  | TextFxBlock
  | ImageBlock
  | ImageCarouselBlock
  | LinksBlock
  | CtaBlock
  | CountdownBlock
  | PaddingBlock
  | PollBlock
  | RsvpBlock
  | FaqBlock
  | GalleryBlock
  | MessageThreadBlock
  | HighlightBlock
  | ShowcaseBlock
  | FestiveBackgroundBlock
  | FormFieldBlock
  | ShapeBlock
  | ListingBlock
  | RichTextBlock
  | VideoBlock
  | ProgressBarBlock
  | DonationBlock
  | LinkHubBlock
  | ChecklistBlock
  | ScheduleAgendaBlock
  | MapLocationBlock
  | FileShareBlock
  | SpeedDatingBlock
  | RegistryBlock;

/* =========================================
   Draft Model
   ========================================= */

export type BuilderDraft = {
  title: string;
  subtitle?: string;
  subtext?: string;
  description?: string;
  countdownLabel?: string;

  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  subtextStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  countdownLabelStyle?: TextStyle;

  slugSuggestion: string;
  pageBackground?: string;
  pageScale?: number;

  pageColor?: string;
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
  pageVisibility?: PageVisibility;
  pageElements?: PageElements;
  pageBlockAppearance?: PageBlockAppearance;

  blocks: MicrositeBlock[];
};

/* =========================================
   Utilities
   ========================================= */

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createDefaultTextStyle(): TextStyle {
  return {
    fontFamily: "inherit",
    fontSize: 16,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "left",
    color: "#111827",
  };
}

export function createDefaultTextFxStyle(): TextFxStyle {
  return {
    effectType: "straight",
    bendAmount: 0,
    radius: 120,
    letterSpacing: 0,
    rotation: 0,
    opacity: 1,
  };
}

export function createDefaultBlockAppearance(): BlockAppearance {
  return {
    backgroundColor: "transparent",
    borderColor: "#D1D5DB",
    borderWidth: 0,
    borderRadius: 16,
  };
}

export function updateTextStyle(
  style: TextStyle | undefined,
  patch: Partial<TextStyle>,
): TextStyle {
  return {
    ...createDefaultTextStyle(),
    ...style,
    ...patch,
  };
}

export function updateBlockAppearance(
  appearance: BlockAppearance | undefined,
  patch: Partial<BlockAppearance>,
): BlockAppearance {
  return {
    ...createDefaultBlockAppearance(),
    ...appearance,
    ...patch,
  };
}

function createDefaultGrid(): GridPlacement {
  return {
    colStart: 1,
    rowStart: 1,
    colSpan: 12,
    rowSpan: 1,
    zIndex: 1,
  };
}

function createDefaultThreadGrid(): GridPlacement {
  return {
    colStart: 1,
    rowStart: 1,
    colSpan: 8,
    rowSpan: 8,
    zIndex: 1,
  };
}

function createDefaultListingGrid(): GridPlacement {
  return {
    colStart: 1,
    rowStart: 1,
    colSpan: 5,
    rowSpan: 6,
    zIndex: 1,
  };
}

function normalizeGridValue(
  grid: GridPlacement | undefined,
  fallback: GridPlacement,
): GridPlacement {
  const colStart =
    typeof grid?.colStart === "number" && Number.isFinite(grid.colStart)
      ? grid.colStart
      : fallback.colStart;

  const rowStart =
    typeof grid?.rowStart === "number" && Number.isFinite(grid.rowStart)
      ? grid.rowStart
      : fallback.rowStart;

  const colSpan =
    typeof grid?.colSpan === "number" && Number.isFinite(grid.colSpan)
      ? grid.colSpan
      : fallback.colSpan;

  const rowSpan =
    typeof grid?.rowSpan === "number" && Number.isFinite(grid.rowSpan)
      ? grid.rowSpan
      : fallback.rowSpan;

  const zIndex =
    typeof grid?.zIndex === "number" && Number.isFinite(grid.zIndex)
      ? grid.zIndex
      : fallback.zIndex;

  return {
    colStart,
    rowStart,
    colSpan,
    rowSpan,
    zIndex,
  };
}

function normalizeThreadBlock(block: MessageThreadBlock): MessageThreadBlock {
  const fallbackGrid = createDefaultThreadGrid();
  const normalizedGrid = normalizeGridValue(block.grid, fallbackGrid);

  const nextColSpan =
    normalizedGrid.colSpan < 6 ? fallbackGrid.colSpan : normalizedGrid.colSpan;

  const nextRowSpan =
    normalizedGrid.rowSpan < 6 ? fallbackGrid.rowSpan : normalizedGrid.rowSpan;

  return {
    ...block,
    grid: {
      ...normalizedGrid,
      colSpan: nextColSpan,
      rowSpan: nextRowSpan,
    },
    data: {
      ...block.data,
      messages: Array.isArray(block.data.messages) ? block.data.messages : [],
      subject:
        typeof block.data.subject === "string" ? block.data.subject : "",
      allowAnonymous: Boolean(block.data.allowAnonymous),
      requireApproval: Boolean(block.data.requireApproval),
      composerPlaceholder:
        typeof block.data.composerPlaceholder === "string"
          ? block.data.composerPlaceholder
          : "Write something…",
      namePlaceholder:
        typeof block.data.namePlaceholder === "string"
          ? block.data.namePlaceholder
          : "Your name",
      showNameField: block.data.showNameField !== false,
      showVoteControls: block.data.showVoteControls !== false,
      showVoteCount: block.data.showVoteCount !== false,
      postButtonText:
        typeof block.data.postButtonText === "string" &&
        block.data.postButtonText.trim()
          ? block.data.postButtonText
          : "Post",
      postButtonStyle:
        block.data.postButtonStyle === "outline" ||
        block.data.postButtonStyle === "soft" ||
        block.data.postButtonStyle === "solid"
          ? block.data.postButtonStyle
          : "solid",
      maxVisibleMessages:
        typeof block.data.maxVisibleMessages === "number" &&
        Number.isFinite(block.data.maxVisibleMessages)
          ? Math.max(1, Math.min(100, Math.floor(block.data.maxVisibleMessages)))
          : 4,
      scrollHeight:
        typeof block.data.scrollHeight === "number" &&
        Number.isFinite(block.data.scrollHeight)
          ? Math.max(120, Math.min(1000, Math.floor(block.data.scrollHeight)))
          : 280,
      style: {
        ...createDefaultTextStyle(),
        fontSize: 30,
        ...(block.data.style ?? {}),
      },
    },
  };
}

function normalizeListingBlock(block: ListingBlock): ListingBlock {
  const fallbackGrid = createDefaultListingGrid();
  const normalizedGrid = normalizeGridValue(block.grid, fallbackGrid);

  const nextColSpan =
    normalizedGrid.colSpan < 4 ? fallbackGrid.colSpan : normalizedGrid.colSpan;

  const nextRowSpan =
    normalizedGrid.rowSpan < 4 ? fallbackGrid.rowSpan : normalizedGrid.rowSpan;

  return {
    ...block,
    grid: {
      ...normalizedGrid,
      colSpan: nextColSpan,
      rowSpan: nextRowSpan,
    },
    data: {
      image: {
        id:
          typeof block.data.image?.id === "string" && block.data.image.id.trim()
            ? block.data.image.id
            : makeId("img"),
        url:
          typeof block.data.image?.url === "string" ? block.data.image.url : "",
        alt:
          typeof block.data.image?.alt === "string" ? block.data.image.alt : "",
        fitMode:
          block.data.image?.fitMode === "clip" ||
          block.data.image?.fitMode === "stretch" ||
          block.data.image?.fitMode === "zoom"
            ? block.data.image.fitMode
            : "zoom",
        frame:
          block.data.image?.frame === "square" ||
          block.data.image?.frame === "circle" ||
          block.data.image?.frame === "diamond" ||
          block.data.image?.frame === "heart"
            ? block.data.image.frame
            : "square",
        positionX:
          typeof block.data.image?.positionX === "number" &&
          Number.isFinite(block.data.image.positionX)
            ? block.data.image.positionX
            : 50,
        positionY:
          typeof block.data.image?.positionY === "number" &&
          Number.isFinite(block.data.image.positionY)
            ? block.data.image.positionY
            : 50,
        zoom:
          typeof block.data.image?.zoom === "number" &&
          Number.isFinite(block.data.image.zoom)
            ? block.data.image.zoom
            : 1,
        rotation:
          typeof block.data.image?.rotation === "number" &&
          Number.isFinite(block.data.image.rotation)
            ? block.data.image.rotation
            : 0,
        opacity:
          typeof block.data.image?.opacity === "number" &&
          Number.isFinite(block.data.image.opacity)
            ? block.data.image.opacity
            : 1,
      },
      title: typeof block.data.title === "string" ? block.data.title : "",
      description:
        typeof block.data.description === "string" ? block.data.description : "",
      metadata: Array.isArray(block.data.metadata)
        ? block.data.metadata.map((item) => ({
            id:
              typeof item?.id === "string" && item.id.trim()
                ? item.id
                : makeId("meta"),
            label: typeof item?.label === "string" ? item.label : "",
            value: typeof item?.value === "string" ? item.value : "",
          }))
        : [],
      titleStyle: {
        ...createDefaultTextStyle(),
        ...(block.data.titleStyle ?? {}),
      },
      descriptionStyle: {
        ...createDefaultTextStyle(),
        ...(block.data.descriptionStyle ?? {}),
      },
      metadataStyle: {
        ...createDefaultTextStyle(),
        ...(block.data.metadataStyle ?? {}),
      },
      cardVariant:
        block.data.cardVariant === "compact" ||
        block.data.cardVariant === "stacked"
          ? block.data.cardVariant
          : "stacked",
      imageHeightPercent:
        typeof block.data.imageHeightPercent === "number" &&
        Number.isFinite(block.data.imageHeightPercent)
          ? Math.max(20, Math.min(80, Math.floor(block.data.imageHeightPercent)))
          : 50,
    },
  };
}

/* =========================================
   Block Factory
   ========================================= */

export function createBlock(type: BuilderBlockType): MicrositeBlock {
  const grid = createDefaultGrid();

  switch (type) {
    case "label":
      return {
        id: makeId("label"),
        type: "label",
        label: "Label",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          text: "New Label",
          style: createDefaultTextStyle(),
        },
      };

    case "text_fx":
      return {
        id: makeId("textfx"),
        type: "text_fx",
        label: "TextFX",
        grid,
        data: {
          text: "TextFX",
          style: {
            fontFamily: "Inter",
            fontSize: 32,
            bold: false,
            italic: false,
            underline: false,
            strike: false,
            align: "center",
            color: "#000000",
          },
          fx: {
            mode: "straight",
            intensity: 50,
            rotation: 0,
            opacity: 1,
          },
        },
        appearance: {
          backgroundColor: "transparent",
          borderColor: "#000000",
          borderWidth: 0,
          borderRadius: 0,
        },
      };

    case "image":
      return {
        id: makeId("image"),
        type: "image",
        label: "Image",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          image: {
            id: makeId("img"),
            url: "",
            fitMode: "zoom",
            frame: "square",
            positionX: 50,
            positionY: 50,
            zoom: 1,
            rotation: 0,
            opacity: 1,
            fade: {
              top: false,
              bottom: false,
              left: false,
              right: false,
              size: 15,
            },
          },
        },
      };

    case "image_carousel":
      return {
        id: makeId("carousel"),
        type: "image_carousel",
        label: "Image Carousel",
        grid: {
          ...grid,
          rowSpan: 3,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "",
          items: [
            {
              id: makeId("carouselitem"),
              imageUrl: "",
              title: "Feature 1",
              subtitle: "",
              href: "#",
              openInNewTab: false,
              positionX: 50,
              positionY: 50,
              zoom: 1,
              rotation: 0,
            },
            {
              id: makeId("carouselitem"),
              imageUrl: "",
              title: "Feature 2",
              subtitle: "",
              href: "#",
              openInNewTab: false,
              positionX: 50,
              positionY: 50,
              zoom: 1,
              rotation: 0,
            },
            {
              id: makeId("carouselitem"),
              imageUrl: "",
              title: "Feature 3",
              subtitle: "",
              href: "#",
              openInNewTab: false,
              positionX: 50,
              positionY: 50,
              zoom: 1,
              rotation: 0,
            },
          ],
          autoRotate: true,
          intervalMs: 3000,
          visibleCount: 1,
          scrollDirection: "right",
          showOverlay: true,
          showTitles: true,
          openLinksInNewTab: false,
          pauseOnHover: true,
          style: createDefaultTextStyle(),
        },
      };

    case "form_field":
      return {
        id: makeId("form"),
        type: "form_field",
        label: "Input Field",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          label: "Input Label",
          placeholder: "Enter value...",
          required: false,
          fieldType: "text",
          value: "",
          submitButtonText: "Submit",
          showLabel: true,
          showPlaceholder: true,
          showRequired: true,
          showSubmitButtonText: true,
          style: createDefaultTextStyle(),
        },
      };

    case "links":
      return {
        id: makeId("links"),
        type: "links",
        label: "Navigation Link",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "",
          items: [{ id: makeId("link"), label: "Home", url: "#" }],
          style: createDefaultTextStyle(),
        },
      };

    case "cta":
      return {
        id: makeId("cta"),
        type: "cta",
        label: "Button",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "",
          body: "",
          buttonText: "Learn More",
          buttonUrl: "#",
          style: createDefaultTextStyle(),
        },
      };

    case "countdown":
      return {
        id: makeId("countdown"),
        type: "countdown",
        label: "Countdown",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "",
          targetIso: "",
          completedMessage: "Countdown finished",
          style: createDefaultTextStyle(),
          styleVariant: "default",
          showRings: true,
        },
      };

    case "padding":
      return {
        id: makeId("padding"),
        type: "padding",
        label: "Spacing",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          height: 40,
        },
      };

    case "poll":
      return {
        id: makeId("poll"),
        type: "poll",
        label: "Poll",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          question: "Your question here",
          options: [
            { id: makeId("opt"), text: "Option 1" },
            { id: makeId("opt"), text: "Option 2" },
          ],
          style: createDefaultTextStyle(),
        },
      };

    case "rsvp":
      return {
        id: makeId("rsvp"),
        type: "rsvp",
        label: "RSVP",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "RSVP",
          collectName: true,
          collectEmail: true,
          collectPhone: false,
          collectGuestCount: false,
          collectNotes: false,
          style: createDefaultTextStyle(),
        },
      };

    case "faq":
      return {
        id: makeId("faq"),
        type: "faq",
        label: "FAQ",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          items: [
            {
              id: makeId("faq"),
              question: "Question",
              answer: "Answer",
            },
          ],
          style: createDefaultTextStyle(),
        },
      };

    case "gallery":
      return {
        id: makeId("gallery"),
        type: "gallery",
        label: "Gallery",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          columns: 2,
          rows: undefined,
          images: [],
        },
      };

    case "thread":
      return {
        id: makeId("thread"),
        type: "thread",
        label: "Message Thread",
        grid: createDefaultThreadGrid(),
        appearance: createDefaultBlockAppearance(),
        data: {
          messages: [],
          subject: "",
          allowAnonymous: false,
          requireApproval: false,
          composerPlaceholder: "Write something…",
          namePlaceholder: "Your name",
          showNameField: true,
          showVoteControls: true,
          showVoteCount: true,
          postButtonText: "Post",
          postButtonStyle: "solid",
          maxVisibleMessages: 4,
          scrollHeight: 280,
          style: {
            ...createDefaultTextStyle(),
            fontSize: 30,
          },
        },
      };

    case "highlight":
      return {
        id: makeId("highlight"),
        type: "highlight",
        label: "Highlight",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          mode: "top_messages",
          heading: "Top Messages",
          limit: 4,
          sourceBlockId: "",
          sourceFormBlockId: "",
          style: createDefaultTextStyle(),
        },
      };

    case "showcase":
      return {
        id: makeId("showcase"),
        type: "showcase",
        label: "Showcase",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          images: [],
        },
      };

    case "festiveBackground":
      return {
        id: makeId("festivebg"),
        type: "festiveBackground",
        label: "Background Image",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          image: {
            id: makeId("img"),
            url: "",
          },
        },
      };

    case "shape":
      return {
        id: makeId("shape"),
        type: "shape",
        label: "Shape",
        grid: {
          ...grid,
          colSpan: 3,
          rowSpan: 2,
        },
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "#E5E7EB",
          borderColor: "#9CA3AF",
          borderWidth: 1,
          borderRadius: 16,
        },
        data: {
          shapeType: "rectangle",
        },
      };

    case "listing":
      return {
        id: makeId("listing"),
        type: "listing",
        label: "Listing",
        grid: createDefaultListingGrid(),
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "#FFFFFF",
          borderColor: "#D1D5DB",
          borderWidth: 1,
          borderRadius: 20,
        },
        data: {
          image: {
            id: makeId("img"),
            url: "",
            alt: "",
            fitMode: "zoom",
            frame: "square",
            positionX: 50,
            positionY: 50,
            zoom: 1,
            rotation: 0,
            opacity: 1,
          },
          title: "Listing Title",
          description: "Add a short description here.",
          metadata: [
            { id: makeId("meta"), label: "Price", value: "$0" },
            { id: makeId("meta"), label: "Location", value: "City, State" },
          ],
          titleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 24,
            bold: true,
          },
          descriptionStyle: {
            ...createDefaultTextStyle(),
            fontSize: 16,
          },
          metadataStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
          },
          cardVariant: "stacked",
          imageHeightPercent: 50,
        },
      };
    case "rich_text":
      return {
        id: makeId("richtext"),
        type: "rich_text",
        label: "Rich Text",
        grid: {
          ...grid,
          rowSpan: 5,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          title: "",
          content: "",
          style: {
            ...createDefaultTextStyle(),
            fontSize: 16,
            align: "left",
          },
          listType: "none",
          linkUrl: "",
        },
      };

    case "video":
      return {
        id: makeId("video"),
        type: "video",
        label: "Video",
        grid: {
          ...grid,
          rowSpan: 4,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          title: "",
          videoUrl: "",
          autoplay: false,
          muted: false,
          loop: false,
          showControls: true,
          style: createDefaultTextStyle(),
        },
      };

    case "progress_bar":
      return {
        id: makeId("progress"),
        type: "progress_bar",
        label: "Progress Bar",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Progress",
          value: 25,
          max: 100,
          showPercentage: true,
          style: createDefaultTextStyle(),
        },
      };

    case "donation":
      return {
        id: makeId("donation"),
        type: "donation",
        label: "Donation",
        grid: {
          ...grid,
          rowSpan: 3,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Support This Cause",
          description: "",
          goalAmount: 1000,
          currentAmount: 0,
          buttonText: "Donate",
          buttonUrl: "#",
          style: createDefaultTextStyle(),
        },
      };

    case "link_hub":
      return {
        id: makeId("linkhub"),
        type: "link_hub",
        label: "Link Hub",
        grid: {
          ...grid,
          rowSpan: 4,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "My Links",
          items: [
            { id: makeId("link"), label: "Link 1", url: "#" },
            { id: makeId("link"), label: "Link 2", url: "#" },
          ],
          style: createDefaultTextStyle(),
        },
      };

    case "registry":
      return {
        id: makeId("registry"),
        type: "registry",
        label: "Registry",
        grid: {
          ...grid,
          rowSpan: 4,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Gift Registry",
          description: "Share gift ideas and registry links.",
          items: [
{
  id: makeId("registryitem"),
  label: "Coffee Maker",
  url: "#",
  store: "Target",
  price: "",
  note: "",
  imageUrl: "",
  quantity: 1,
  purchased: 0,
  contributors: [],
},
{
  id: makeId("registryitem"),
  label: "Dinner Set",
  url: "#",
  store: "Amazon",
  price: "",
  note: "",
  imageUrl: "",
  quantity: 1,
  purchased: 0,
  contributors: [],
}
          ],
          style: createDefaultTextStyle(),
        },
      };

    case "checklist":
      return {
        id: makeId("checklist"),
        type: "checklist",
        label: "Checklist",
        grid: {
          ...grid,
          rowSpan: 4,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Checklist",
          items: [
            { id: makeId("check"), label: "Item 1", checked: false },
            { id: makeId("check"), label: "Item 2", checked: false },
          ],
          style: createDefaultTextStyle(),
        },
      };

    case "schedule_agenda":
      return {
        id: makeId("agenda"),
        type: "schedule_agenda",
        label: "Schedule / Agenda",
        grid: {
          ...grid,
          rowSpan: 4,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Schedule",
          items: [
            {
              id: makeId("agendaitem"),
              time: "10:00 AM",
              title: "Opening",
              description: "",
            },
            {
              id: makeId("agendaitem"),
              time: "11:00 AM",
              title: "Session",
              description: "",
            },
          ],
          style: createDefaultTextStyle(),
        },
      };

    case "map_location":
      return {
        id: makeId("map"),
        type: "map_location",
        label: "Map / Location",
        grid: {
          ...grid,
          rowSpan: 4,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Location",
          locationName: "",
          address: "",
          mapUrl: "",
          style: createDefaultTextStyle(),
        },
      };

    case "file_share":
      return {
        id: makeId("fileshare"),
        type: "file_share",
        label: "File Share",
        grid: {
          ...grid,
          rowSpan: 3,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Secure File Upload",
          subtext: "Upload files privately for the site owner.",
          allowPublicUpload: true,
          requireAccessCode: false,
          accessCode: "",
          acceptedFileTypes: ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "txt"],
          maxFileSizeMb: 25,
          allowMultiple: false,
          collectName: true,
          collectEmail: true,
          collectMessage: true,
          ownerAlertOnUpload: true,
          style: createDefaultTextStyle(),
        },
      };

case "speed_dating":
  return {
    id: makeId("speeddating"),
    type: "speed_dating",
    label: "Speed Dating",
    grid: {
      ...grid,
      rowSpan: 4,
    },
    appearance: createDefaultBlockAppearance(),
    data: {
      heading: "Speed Dating",
      roundDurationSeconds: 120,
      showTimer: true,
      leftLabel: "Men",
      rightLabel: "Women",
      roundStartSound: "spark",
      style: createDefaultTextStyle(),
    },
  };

default:
  throw new Error(`Unsupported block type: ${type}`);
}
}

export function createFestiveBackgroundBlock(): FestiveBackgroundBlock {
  return createBlock("festiveBackground") as FestiveBackgroundBlock;
}

export function createShowcaseBlock(): ShowcaseBlock {
  return createBlock("showcase") as ShowcaseBlock;
}

export function sanitizeBuilderDraft(input: unknown): BuilderDraft {
  const draft =
    input && typeof input === "object" ? (input as Partial<BuilderDraft>) : {};

  const rawBlocks = Array.isArray(draft.blocks)
    ? (draft.blocks as MicrositeBlock[])
    : [];

  const normalizedBlocks = rawBlocks.map((block, index) => {
    if (!block || typeof block !== "object") {
      return block;
    }



    if (block.type === "thread") {
      return normalizeThreadBlock(block as MessageThreadBlock);
    }

    if (block.type === "listing") {
      return normalizeListingBlock(block as ListingBlock);
    }

    const fallbackGrid = {
      ...createDefaultGrid(),
      rowStart: index + 1,
      zIndex: index + 1,
    };

            if (block.type === "file_share") {
      return {
        ...block,
        grid: normalizeGridValue(block.grid, fallbackGrid),
        data: {
          heading:
            typeof block.data.heading === "string"
              ? block.data.heading
              : "Secure File Upload",
          subtext:
            typeof block.data.subtext === "string"
              ? block.data.subtext
              : "",
          allowPublicUpload: block.data.allowPublicUpload !== false,
          requireAccessCode: Boolean(block.data.requireAccessCode),
          accessCode:
            typeof block.data.accessCode === "string"
              ? block.data.accessCode
              : "",
          acceptedFileTypes: Array.isArray(block.data.acceptedFileTypes)
            ? block.data.acceptedFileTypes.filter(
                (item): item is string =>
                  typeof item === "string" && item.trim().length > 0,
              )
            : ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "txt"],
          maxFileSizeMb:
            typeof block.data.maxFileSizeMb === "number" &&
            Number.isFinite(block.data.maxFileSizeMb)
              ? Math.max(1, Math.min(100, Math.floor(block.data.maxFileSizeMb)))
              : 25,
          allowMultiple: Boolean(block.data.allowMultiple),
          collectName: block.data.collectName !== false,
          collectEmail: block.data.collectEmail !== false,
          collectMessage: Boolean(block.data.collectMessage),
          ownerAlertOnUpload: block.data.ownerAlertOnUpload !== false,
          style: {
            ...createDefaultTextStyle(),
            ...(block.data.style ?? {}),
          },
        },
      };
    }

    if (block.type === "image") {
      return {
        ...block,
        grid: normalizeGridValue(block.grid, fallbackGrid),
        data: {
          ...block.data,
          image: {
            ...block.data.image,
            opacity:
              typeof block.data.image?.opacity === "number" &&
              Number.isFinite(block.data.image.opacity)
                ? block.data.image.opacity
                : 1,
            fade: {
              top: Boolean(block.data.image?.fade?.top),
              bottom: Boolean(block.data.image?.fade?.bottom),
              left: Boolean(block.data.image?.fade?.left),
              right: Boolean(block.data.image?.fade?.right),
              size:
                typeof block.data.image?.fade?.size === "number" &&
                Number.isFinite(block.data.image.fade.size)
                  ? Math.max(0, Math.min(50, Math.floor(block.data.image.fade.size)))
                  : 15,
            },
          },
        },
      };
    }

    if (block.type === "rich_text") {
      return {
        ...block,
        grid: normalizeGridValue(block.grid, fallbackGrid),
        data: {
          ...block.data,
          title:
            typeof block.data.title === "string" ? block.data.title : "Document Title",
          content:
            typeof block.data.content === "string" ? block.data.content : "",
          style: {
            ...createDefaultTextStyle(),
            ...(block.data.style ?? {}),
          },
          listType:
            block.data.listType === "bullet" ||
            block.data.listType === "number" ||
            block.data.listType === "none"
              ? block.data.listType
              : "none",
          linkUrl:
            typeof block.data.linkUrl === "string" ? block.data.linkUrl : "",
        },
      };
    }

    if (block.type === "countdown") {
      return {
        ...block,
        grid: normalizeGridValue(block.grid, fallbackGrid),
        data: {
          ...block.data,
          heading:
            typeof block.data.heading === "string" ? block.data.heading : "",
          targetIso:
            typeof block.data.targetIso === "string" ? block.data.targetIso : "",
          completedMessage:
            typeof block.data.completedMessage === "string"
              ? block.data.completedMessage
              : "Countdown finished",
          style: {
            ...createDefaultTextStyle(),
            ...(block.data.style ?? {}),
          },
          styleVariant:
            block.data.styleVariant === "cards" ||
            block.data.styleVariant === "hero" ||
            block.data.styleVariant === "default"
              ? block.data.styleVariant
              : "default",
          showRings: block.data.showRings !== false,
        },
      };
    }

if (block.type === "speed_dating") {
  return {
    ...block,
    grid: normalizeGridValue(block.grid, fallbackGrid),
    data: {
      heading:
        typeof block.data.heading === "string"
          ? block.data.heading
          : "Speed Dating",

      roundDurationSeconds:
        typeof block.data.roundDurationSeconds === "number" &&
        Number.isFinite(block.data.roundDurationSeconds)
          ? Math.max(30, Math.floor(block.data.roundDurationSeconds))
          : 120,

      showTimer: block.data.showTimer !== false,

      leftLabel:
        typeof block.data.leftLabel === "string"
          ? block.data.leftLabel
          : "Men",

      rightLabel:
        typeof block.data.rightLabel === "string"
          ? block.data.rightLabel
          : "Women",

roundStartSound:
  block.data.roundStartSound === "none" ||
  block.data.roundStartSound === "arrival" ||
  block.data.roundStartSound === "spark" ||
  block.data.roundStartSound === "commence" ||
  block.data.roundStartSound === "cloak" ||
  block.data.roundStartSound === "vanish"
    ? block.data.roundStartSound
    : "spark",

      style: {
        ...createDefaultTextStyle(),
        ...(block.data.style ?? {}),
      },
    },
  };
}

    if (block.type === "registry") {
      return {
        ...block,
        grid: normalizeGridValue(block.grid, fallbackGrid),
        data: {
          ...block.data,
          heading:
            typeof block.data.heading === "string"
              ? block.data.heading
              : "Gift Registry",
          description:
            typeof block.data.description === "string"
              ? block.data.description
              : "",
          style: {
            ...createDefaultTextStyle(),
            ...(block.data.style ?? {}),
          },
          items: Array.isArray(block.data.items)
            ? block.data.items.map((item) => ({
                id:
                  typeof item?.id === "string" && item.id.trim()
                    ? item.id
                    : makeId("registryitem"),
                label: typeof item?.label === "string" ? item.label : "",
                url: typeof item?.url === "string" ? item.url : "",
                store: typeof item?.store === "string" ? item.store : "",
                price: typeof item?.price === "string" ? item.price : "",
                note: typeof item?.note === "string" ? item.note : "",
                imageUrl:
                  typeof item?.imageUrl === "string" ? item.imageUrl : "",
                quantity:
                  typeof item?.quantity === "number" &&
                  Number.isFinite(item.quantity)
                    ? Math.max(1, Math.floor(item.quantity))
                    : 1,
                purchased:
                  typeof item?.purchased === "number" &&
                  Number.isFinite(item.purchased)
                    ? Math.max(0, Math.floor(item.purchased))
                    : 0,
                contributors: Array.isArray(item?.contributors)
                  ? item.contributors
                      .map((c) => ({
                        name: typeof c?.name === "string" ? c.name : "",
                        amount:
                          typeof c?.amount === "number" &&
                          Number.isFinite(c.amount)
                            ? c.amount
                            : undefined,
                      }))
                      .filter((c) => c.name.trim())
                  : [],
              }))
            : [],
        },
      };
    }

    return {
      ...block,
      grid: normalizeGridValue(block.grid, fallbackGrid),
    };
  }) as MicrositeBlock[];

  return {
    title: typeof draft.title === "string" ? draft.title : "",
    subtitle: typeof draft.subtitle === "string" ? draft.subtitle : "",
    subtext: typeof draft.subtext === "string" ? draft.subtext : "",
    description: typeof draft.description === "string" ? draft.description : "",
    countdownLabel:
      typeof draft.countdownLabel === "string" ? draft.countdownLabel : "",

    titleStyle: draft.titleStyle ?? createDefaultTextStyle(),
    subtitleStyle: draft.subtitleStyle ?? createDefaultTextStyle(),
    subtextStyle: draft.subtextStyle ?? createDefaultTextStyle(),
    descriptionStyle: draft.descriptionStyle ?? createDefaultTextStyle(),
    countdownLabelStyle:
      draft.countdownLabelStyle ?? createDefaultTextStyle(),

    slugSuggestion:
      typeof draft.slugSuggestion === "string" ? draft.slugSuggestion : "",

    pageBackground:
      typeof draft.pageBackground === "string" ? draft.pageBackground : "",

    pageScale:
      typeof draft.pageScale === "number" && Number.isFinite(draft.pageScale)
        ? Math.max(10, Math.min(100, draft.pageScale))
        : 85,

    pageColor: typeof draft.pageColor === "string" ? draft.pageColor : "",

    pageBackgroundImage:
      typeof draft.pageBackgroundImage === "string"
        ? draft.pageBackgroundImage
        : "",

    pageBackgroundImageFit:
      draft.pageBackgroundImageFit === "clip" ||
      draft.pageBackgroundImageFit === "zoom" ||
      draft.pageBackgroundImageFit === "stretch"
        ? draft.pageBackgroundImageFit
        : "zoom",

    pageVisibility:
      draft.pageVisibility && typeof draft.pageVisibility === "object"
        ? draft.pageVisibility
        : {},

    pageElements:
      draft.pageElements && typeof draft.pageElements === "object"
        ? draft.pageElements
        : {},

    pageBlockAppearance:
      draft.pageBlockAppearance && typeof draft.pageBlockAppearance === "object"
        ? draft.pageBlockAppearance
        : {},

    blocks: normalizedBlocks,
  };
}