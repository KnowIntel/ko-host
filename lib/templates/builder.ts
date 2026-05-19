// lib/templates/builder.ts
/* =========================================
   Ko-Host Builder Core Types
   ========================================= */

export type TextAlign = "left" | "center" | "right";

export type TextureFill = {
  textureEnabled?: boolean;
  textureImageUrl?: string;
  textureScale?: number;
  texturePositionX?: number;
  texturePositionY?: number;
};

export type TextStyle = {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: TextAlign;
  color?: string;

  textureEnabled?: boolean;
  textureImageUrl?: string;
  textureScale?: number;
  texturePositionX?: number;
  texturePositionY?: number;
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
  textureEnabled?: boolean;
  textureImageUrl?: string;
  textureScale?: number;
  texturePositionX?: number;
  texturePositionY?: number;
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
  | "bookmark"
  | "puzzle"
  | "spin_wheel"
  | "spreadsheet"
  | "label"
  | "text_fx"
  | "image"
  | "icon"
  | "image_carousel"
  | "links"
  | "cta"
  | "countdown"
  | "audio"
  | "frame"
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
  | "pop_balloon"
  | "registry"
  | "checkout"
  | "cart";

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

export type PuzzleSortLevel = "beginner" | "intermediate" | "advanced";

export type PuzzlePiece = {
  id: string;
  index: number;
  row: number;
  col: number;
  correctX: number;
  correctY: number;
  currentX: number;
  currentY: number;
  widthPercent: number;
  heightPercent: number;
  isEdge: boolean;
  isCorner: boolean;
  isPlaced: boolean;
};


export type PuzzleBlock = BaseBlock & {
  type: "puzzle";
  data: {
    imageUrl: string;
    imageAlt: string;
    pieceCount: number;
    sortLevel: PuzzleSortLevel;
    generatedAt?: string;
    autoSortEdges: boolean;
    autoSortCorners: boolean;
    displayPuzzleImage: boolean;
    pieces: PuzzlePiece[];
  };
};

export type SpinWheelItem = {
  id: string;
  label: string;
  description: string;
  weight: number;
  color: string;
  textColor: string;
  icon: string;
  prizeType: "coupon" | "free_item" | "discount" | "cash" | "message" | "link" | "none" | "mystery";
  prizeValue: string;
  isWinningItem: boolean;
};

export type SpinWheelBlock = BaseBlock & {
  type: "spin_wheel";
  data: {
    title: string;
    subtitle: string;
    items: SpinWheelItem[];
    wheelStyle: "classic" | "premium" | "game_show" | "neon" | "minimal" | "luxury";
    spinMode: "random" | "weighted";
    allowMultipleSpins: boolean;
    requireName: boolean;
    requireEmail: boolean;
    showConfetti: boolean;
    showSound: boolean;
    resultDisplay: "modal" | "card";
    buttonText: string;
    winnerMessage: string;
    loserMessage: string;
    cooldownSeconds: number;
    style: TextStyle;
  };
};

export type SpreadsheetCellFormat = {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textColor?: string;
  backgroundColor?: string;
  horizontalAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  borderColor?: string;
  borderWidth?: number;
  borderSides?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  wrapText?: boolean;
  locked?: boolean;
};

export type SpreadsheetCell = {
  id: string;
  value: string;
  format?: SpreadsheetCellFormat;
};

export type SpreadsheetMergeRange = {
  id: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
};

export type SpreadsheetBlock = BaseBlock & {
  type: "spreadsheet";
  data: {
    title: string;
    caption: string;
    showTitle: boolean;
    showGridlines: boolean;
    showHeaders: boolean;
    allowUserEngagement: boolean;
    rowCount: number;
    columnCount: number;
    columnWidths: Record<string, number>;
    rowHeights: Record<string, number>;
    cells: Record<string, SpreadsheetCell>;
    merges: SpreadsheetMergeRange[];
    frozenRows: number;
    frozenColumns: number;
    defaultCellFormat: SpreadsheetCellFormat;
    selectedCell?: string;
    selectedRange?: {
      startRow: number;
      startCol: number;
      endRow: number;
      endCol: number;
    };
    editMode: boolean;
  };
};

   export type BookmarkBlock = BaseBlock & {
  type: "bookmark";
  data: {
    name: string;
    slug: string;
  };
};

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

    positionX?: number;
    positionY?: number;

    style?: TextStyle;

    fx?: {
      mode?: "straight" | "arch" | "dip" | "circle";
      intensity?: number;
      rotation?: number;
      opacity?: number;
      transformStyle?: string;

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

export type IconBlock = BaseBlock & {
  type: "icon";
  data: {
    icon: {
      id: string;
      url: string;
      alt?: string;
      positionX?: number;
      positionY?: number;
      zoom?: number;
      rotation?: number;
      opacity?: number;
      color?: string;
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
    backgroundColor?: string;
    transparentBackground?: boolean;
  };
};

export type CtaBlock = BaseBlock & {
  type: "cta";
  data: {
    heading?: string;
    body?: string;
    buttonText: string;
    buttonUrl: string;
    buttonImageUrl?: string;
    buttonImageSize?: number;
    buttonPaddingY?: number;
    buttonPaddingX?: number;
    buttonImagePlacement?: "before" | "above" | "after";
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

    tileStyle?: TextStyle;

    headingStyle?: TextStyle;

    standardValueStyle?: TextStyle;

    standardUnitStyle?: TextStyle;

    styleVariant?:
      | "default"
      | "cards"
      | "hero"
      | "stage"
      | "standard";

    animationStyle?:
      | "none"
      | "pulse"
      | "flip"
      | "bounce"
      | "slide";

    alignment?: "left" | "center" | "right";

    spacing?: number;
    stageUnitGap?: number;

    showRings?: boolean;

    showSeparator?: boolean;

    showDays?: boolean;
    showHours?: boolean;
    showMinutes?: boolean;
    showSeconds?: boolean;
  };
};

export type AudioBlock = BaseBlock & {
  type: "audio";
  data: {
    audioUrl?: string;
    autoplay?: boolean;
    loop?: boolean;
    showPlayer?: boolean;
  };
};

export type FrameBlock = BaseBlock & {
  type: "frame";
  data: {
    frameName?: string;
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
    sourceBlockId?: string;
    sourceType?: "highlight";
  };
};

export type RsvpImageFrameShape = "square" | "circle" | "diamond" | "heart";

export type RsvpElementKey =
  | "image"
  | "heading"
  | "nameLabel"
  | "firstName"
  | "lastName"
  | "email"
  | "address"
  | "attending"
  | "meal"
  | "guestToggle"
  | "guestCount"
  | "guestName"
  | "comments";

export type RsvpElementStyleMap = Partial<
  Record<
    RsvpElementKey,
    {
      textStyle?: TextStyle;
      backgroundColor?: string;
    }
  >
>;

export type RsvpBlock = BaseBlock & {
  type: "rsvp";
  data: {
    heading: string;

    imageUrl?: string;
    imageFrameShape?: RsvpImageFrameShape;

    elementOrder: RsvpElementKey[];
    hiddenElements?: RsvpElementKey[];

    guestMin?: number;
    guestMax?: number;

    attendingLabel?: string;
    attendingOptions?: [string, string];
    attendingDisplay?: boolean;
    attendingDefaultValue?: string;

    mealLabel?: string;
    mealOptions?: [string, string];
    mealDisplay?: boolean;
    mealDefaultValue?: string;

    guestLabel?: string;
    guestOptions?: [string, string];
    guestDisplay?: boolean;
    guestDefaultValue?: string;

    commentsLabel?: string;
    commentsPlaceholder?: string;
    commentsDisplay?: boolean;
    commentsDefaultValue?: string;

    submitButtonText?: string;

    elementStyles?: RsvpElementStyleMap;

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

export type ThreadStyleTarget =
  | "form"
  | "post_block"
  | "subject"
  | "name"
  | "message"
  | "post_button";

export type ThreadElementAppearance = {
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderColor?: string;
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

    threadStyleTarget?: ThreadStyleTarget;

    formAppearance?: ThreadElementAppearance;

    postBlockStyle?: TextStyle;
    postBlockAppearance?: ThreadElementAppearance;

    subjectStyle?: TextStyle;
    nameStyle?: TextStyle;

    messageStyle?: TextStyle;
    messageAppearance?: ThreadElementAppearance;

    postButtonTextStyle?: TextStyle;
    postButtonAppearance?: ThreadElementAppearance;
  };
};

export type HighlightBlock = BaseBlock & {
  type: "highlight";
  data: {
    mode?: "top_messages" | "rsvp_count" | "total_funds" | "poll_results";
    heading?: string;
    limit?: number;
    sourceBlockId?: string;
    sourceFormBlockId?: string;
    style?: TextStyle;
    headingStyle?: TextStyle;
    bodyStyle?: TextStyle;
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

    positionX?: number; // 0–100
    positionY?: number; // 0–100
    scale?: number;     // 0.5–3 (same as zoom)
    rotation?: number;  // -180–180
    opacity?: number;   // 0–1

    fade?: {
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
      size?: number; // 0–50
    };
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
      scale?: number;
      opacity?: number;
    };
    title: string;
    description: string;
    price?: number;
    addToCart?: boolean;
    sku?: string;
    metadata: ListingMetadataItem[];

    pricePlacement?: "mid" | "lower";
    quantityPlacement?: "mid" | "lower";

    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    metadataStyle?: TextStyle;
    priceStyle?: TextStyle;
    quantityStyle?: TextStyle;

    cardVariant?: ListingCardVariant;
    imageHeightPercent?: number;
    rotation?: number;
    scale?: number;
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
    videoPath?: string;
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

    displayStyle?: "bar" | "meter";
    meterSectionCount?: number;
    meterStartColor?: string;
    meterEndColor?: string;
    meterNeedleColor?: string;
    meterCaption?: string;
    meterCaptionStyle?: TextStyle;
  };
};

export type DonationBlock = BaseBlock & {
  type: "donation";
  data: {
    heading?: string;
    description?: string;
    buttonSpacing?: number;

    donationOptions: Array<{
      id: string;
      label?: string;
      amount: number;
    }>;
    
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

    leftLabel?: string;
    rightLabel?: string;

    roundStartSound?: "none" | "arrival" | "spark" | "commence" | "cloak" | "vanish";

    style?: TextStyle;
  };
};

export type PopBalloonBlock = BaseBlock & {
  type: "pop_balloon";
  data: {
    title?: string;
    hostName?: string;
    lineupSlots: number;
    requirePopReason?: boolean;
    audienceVotingEnabled?: boolean;
    anonymousViewingEnabled?: boolean;
    matchResultMode?: "public" | "private" | "contact_form" | "private_chat_later";
    theme?: "red_balloons" | "hearts" | "party" | "formal" | "custom";
    prompt?: string;
    style?: TextStyle;
    hostPasscode?: string;
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

export type CheckoutBlock = BaseBlock & {
  type: "checkout";
  data: {
    productName: string;
    price: number;
    currency: string;
    allowQuantity: boolean;
    description?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonSpacing?: number;
    successMessage?: string;
    redirectUrl?: string;
    collectEmail?: boolean;
    collectName?: boolean;
    collectAddress?: boolean;
    style?: TextStyle;
  };
};

/* ✅ ADD THIS (NEW — REQUIRED) */
export type CartBlock = BaseBlock & {
  type: "cart";
  data: {
    heading?: string;
    taxRate?: number;
    discount?: number;
    discountType?: "flat" | "percent";
    buttonText?: string;
    emptyMessage?: string;
    currency?: string;
    style?: TextStyle;
  };
};

export type MicrositeBlock =
  | BookmarkBlock
  | PuzzleBlock
  | SpinWheelBlock
  | SpreadsheetBlock
  | LabelBlock
  | TextFxBlock
  | ImageBlock
  | IconBlock
  | ImageCarouselBlock
  | LinksBlock
  | CtaBlock
  | CountdownBlock
  | AudioBlock
  | FrameBlock
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
  | PopBalloonBlock
  | RegistryBlock
  | CheckoutBlock
  | CartBlock;

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
  pageLength?: "1200" | "1800" | "2400" | "3200" | "4000" | "5600";
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
          : 520,
      style: {
        ...createDefaultTextStyle(),
        fontSize: 30,
        ...(block.data.style ?? {}),
      },
      threadStyleTarget:
        block.data.threadStyleTarget === "form" ||
        block.data.threadStyleTarget === "post_block" ||
        block.data.threadStyleTarget === "subject" ||
        block.data.threadStyleTarget === "name" ||
        block.data.threadStyleTarget === "message" ||
        block.data.threadStyleTarget === "post_button"
          ? block.data.threadStyleTarget
          : "message",
      formAppearance: {
        backgroundColor:
          block.data.formAppearance?.backgroundColor ?? "#ffffff",
        backgroundOpacity:
          typeof block.data.formAppearance?.backgroundOpacity === "number"
            ? Math.max(
                0,
                Math.min(100, block.data.formAppearance.backgroundOpacity),
              )
            : 100,
        borderColor: block.data.formAppearance?.borderColor ?? "#e5e7eb",
      },
      postBlockStyle: {
        ...createDefaultTextStyle(),
        fontSize: 16,
        ...(block.data.postBlockStyle ?? {}),
      },
      postBlockAppearance: {
        backgroundColor:
          block.data.postBlockAppearance?.backgroundColor ?? "#ffffff",
        backgroundOpacity:
          typeof block.data.postBlockAppearance?.backgroundOpacity === "number"
            ? Math.max(
                0,
                Math.min(100, block.data.postBlockAppearance.backgroundOpacity),
              )
            : 100,
        borderColor: block.data.postBlockAppearance?.borderColor ?? "#e5e7eb",
      },
      subjectStyle: {
        ...createDefaultTextStyle(),
        fontSize: 18,
        bold: true,
        ...(block.data.subjectStyle ?? {}),
      },
      nameStyle: {
        ...createDefaultTextStyle(),
        fontSize: 14,
        bold: true,
        ...(block.data.nameStyle ?? {}),
      },
      messageStyle: {
        ...createDefaultTextStyle(),
        fontSize: 15,
        ...(block.data.messageStyle ?? {}),
      },
      messageAppearance: {
        backgroundColor:
          block.data.messageAppearance?.backgroundColor ?? "#ffffff",
        backgroundOpacity:
          typeof block.data.messageAppearance?.backgroundOpacity === "number"
            ? Math.max(
                0,
                Math.min(100, block.data.messageAppearance.backgroundOpacity),
              )
            : 100,
        borderColor: block.data.messageAppearance?.borderColor ?? "#d4d4d8",
      },
      postButtonTextStyle: {
        ...createDefaultTextStyle(),
        fontSize: 14,
        bold: true,
        color: "#ffffff",
        ...(block.data.postButtonTextStyle ?? {}),
      },
      postButtonAppearance: {
        backgroundColor:
          block.data.postButtonAppearance?.backgroundColor ?? "#111827",
        backgroundOpacity:
          typeof block.data.postButtonAppearance?.backgroundOpacity === "number"
            ? Math.max(
                0,
                Math.min(100, block.data.postButtonAppearance.backgroundOpacity),
              )
            : 100,
        borderColor: block.data.postButtonAppearance?.borderColor ?? "#111827",
      },
    },
  };
}

function normalizeListingBlock(block: ListingBlock): ListingBlock {
  const fallbackGrid = createDefaultListingGrid();
  const normalizedGrid = normalizeGridValue(block.grid, fallbackGrid);

  const nextColSpan = Math.max(1, normalizedGrid.colSpan);
  const nextRowSpan = Math.max(1, normalizedGrid.rowSpan);

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
        scale:
          typeof block.data.scale === "number" &&
          Number.isFinite(block.data.scale)
            ? Math.max(0.5, Math.min(1, block.data.scale))
            : 1,
        opacity:
          typeof block.data.image?.opacity === "number" &&
          Number.isFinite(block.data.image.opacity)
            ? block.data.image.opacity
            : 1,
      },
      title: typeof block.data.title === "string" ? block.data.title : "",
      description:
        typeof block.data.description === "string" ? block.data.description : "",
        price:
        typeof block.data.price === "number" &&
        Number.isFinite(block.data.price)
          ? Math.max(0, block.data.price)
          : 0,

      addToCart: Boolean(block.data.addToCart),
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
rotation:
  typeof block.data.rotation === "number" &&
  Number.isFinite(block.data.rotation)
    ? Math.max(-45, Math.min(45, block.data.rotation))
    : 0,
    },
  };
}

/* =========================================
   Block Factory
   ========================================= */

export function createBlock(type: BuilderBlockType): MicrositeBlock {
  const grid = createDefaultGrid();

  switch (type) {
        case "bookmark":
      return {
        id: makeId("bookmark"),
        type: "bookmark",
        label: "Bookmark",
        grid: {
          ...grid,
          colSpan: 2,
          rowSpan: 1,
        },
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "#DBEAFE",
          borderColor: "#2563EB",
          borderWidth: 1,
          borderRadius: 12,
        },
        data: {
          name: "New Bookmark",
          slug: "new-bookmark",
        },
      };

          case "puzzle":
      return {
        id: makeId("puzzle"),
        type: "puzzle",
        label: "Puzzle",
        grid: {
          ...grid,
          colSpan: 6,
          rowSpan: 6,
        },
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "#FFFFFF",
          borderColor: "#CBD5E1",
          borderWidth: 1,
          borderRadius: 20,
        },
        data: {
          imageUrl: "",
          imageAlt: "",
          pieceCount: 100,
          sortLevel: "intermediate",
          generatedAt: "",
          autoSortEdges: true,
          autoSortCorners: true,
          displayPuzzleImage: true,
          pieces: [],
        },
      };

    case "spin_wheel":
      return {
        id: makeId("spinwheel"),
        type: "spin_wheel",
        label: "Spin Wheel",
        grid: {
          ...grid,
          colSpan: 5,
          rowSpan: 5,
        },
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "#FFFFFF",
          borderColor: "#F59E0B",
          borderWidth: 1,
          borderRadius: 24,
        },
        data: {
          title: "Spin to Win",
          subtitle: "Unlock a surprise reward",
          items: [
            {
              id: makeId("spinitem"),
              label: "10% Off",
              description: "Use code SPIN10",
              weight: 1,
              color: "#F97316",
              textColor: "#FFFFFF",
              icon: "gift",
              prizeType: "coupon",
              prizeValue: "SPIN10",
              isWinningItem: true,
            },
            {
              id: makeId("spinitem"),
              label: "Free Entry",
              description: "",
              weight: 1,
              color: "#EC4899",
              textColor: "#FFFFFF",
              icon: "ticket",
              prizeType: "free_item",
              prizeValue: "",
              isWinningItem: true,
            },
            {
              id: makeId("spinitem"),
              label: "Mystery Gift",
              description: "",
              weight: 1,
              color: "#8B5CF6",
              textColor: "#FFFFFF",
              icon: "sparkles",
              prizeType: "mystery",
              prizeValue: "",
              isWinningItem: true,
            },
            {
              id: makeId("spinitem"),
              label: "Try Again",
              description: "",
              weight: 1,
              color: "#111827",
              textColor: "#FFFFFF",
              icon: "refresh",
              prizeType: "none",
              prizeValue: "",
              isWinningItem: false,
            },
          ],
          wheelStyle: "premium",
          spinMode: "random",
          allowMultipleSpins: false,
          requireName: false,
          requireEmail: false,
          showConfetti: true,
          showSound: true,
          resultDisplay: "modal",
          buttonText: "Spin Now",
          winnerMessage: "You won!",
          loserMessage: "Try again next time",
          cooldownSeconds: 86400,
          style: createDefaultTextStyle(),
        },
      };
      
          case "spreadsheet":
      return {
        id: makeId("spreadsheet"),
        type: "spreadsheet",
        label: "Spreadsheet",
        grid: {
          ...grid,
          colSpan: 7,
          rowSpan: 5,
        },
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "#FFFFFF",
          borderColor: "#CBD5E1",
          borderWidth: 1,
          borderRadius: 16,
        },
        data: {
          title: "Spreadsheet",
          caption: "",
          showTitle: true,
          showGridlines: true,
          showHeaders: true,
          allowUserEngagement: false,
          rowCount: 6,
          columnCount: 5,
          columnWidths: {
            "0": 120,
            "1": 160,
            "2": 120,
            "3": 120,
            "4": 160,
          },
          rowHeights: {
            "0": 36,
            "1": 36,
            "2": 36,
            "3": 36,
            "4": 36,
            "5": 36,
          },
          cells: {
            "0:0": {
              id: makeId("cell"),
              value: "Item",
            },
            "0:1": {
              id: makeId("cell"),
              value: "Description",
            },
            "0:2": {
              id: makeId("cell"),
              value: "Amount",
            },
            "0:3": {
              id: makeId("cell"),
              value: "Status",
            },
            "0:4": {
              id: makeId("cell"),
              value: "Notes",
            },
          },
          merges: [],
          frozenRows: 0,
          frozenColumns: 0,
          defaultCellFormat: {
            fontFamily: "Inter",
            fontSize: 14,
            textColor: "#111827",
            backgroundColor: "#FFFFFF",
            horizontalAlign: "left",
            verticalAlign: "middle",
            wrapText: false,
            locked: false,
          },
          selectedCell: "0:0",
          selectedRange: undefined,
          editMode: true,
        },
      };

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

      positionX: 50,
      positionY: 50,

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
        transformStyle: "normal",
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

    case "icon":
      return {
        id: makeId("icon"),
        type: "icon",
        label: "Icon",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          icon: {
            id: makeId("icon-asset"),
            url: "/media-icons/star.svg",
            positionX: 50,
            positionY: 50,
            zoom: 1,
            rotation: 0,
            opacity: 1,
            color: "#111111",
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
          backgroundColor: "#ffffff",
          transparentBackground: true,
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
          buttonImageUrl: "",
          buttonImageSize: 20,
          buttonPaddingY: 8,
          buttonPaddingX: 20,
          buttonImagePlacement: "before",
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
          tileStyle: createDefaultTextStyle(),
          standardValueStyle: {
            ...createDefaultTextStyle(),
            fontSize: 24,
            color: "#ef4444",
          },
          standardUnitStyle: {
            ...createDefaultTextStyle(),
            fontSize: 11,
            color: "#e5e7eb",
          },
          styleVariant: "default",
          animationStyle: "none",
          alignment: "center",
          showRings: true,
          showDays: true,
          showHours: true,
          showMinutes: true,
          showSeconds: true,
        },
      };

          case "audio":
      return {
        id: makeId("audio"),
        type: "audio",
        label: "Audio",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          audioUrl: "",
          autoplay: false,
          loop: false,
          showPlayer: true,
        },
      };

    case "frame":
      return {
        id: makeId("frame"),
        type: "frame",
        label: "Frame",
        grid: {
          ...grid,
          colSpan: 8,
          rowSpan: 8,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          frameName: "Frame",
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
          sourceBlockId: "",
          sourceType: "highlight",
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
      heading: "Wedding Invitation RSVP Form",
      imageUrl: "",
      imageFrameShape: "circle",
      elementOrder: [
        "image",
        "heading",
        "nameLabel",
        "firstName",
        "lastName",
        "email",
        "address",
        "attending",
        "meal",
        "guestToggle",
        "guestCount",
        "guestName",
        "comments",
      ],
      hiddenElements: [],
      guestMin: 0,
      guestMax: 1,

      attendingLabel: "Are you attending?",
      attendingOptions: ["Yes", "No"],
      attendingDisplay: true,
      attendingDefaultValue: "Yes",

      mealLabel: "Your meal selection:",
      mealOptions: ["Chicken", "Salmon"],
      mealDisplay: true,
      mealDefaultValue: "Chicken",

      guestLabel: "Are you bringing a guest?",
      guestOptions: ["Yes", "No"],
      guestDisplay: true,
      guestDefaultValue: "No",

      commentsLabel: "Additional comments",
      commentsPlaceholder: "Additional comments",
      commentsDisplay: true,
      commentsDefaultValue: "",

      submitButtonText: "Submit RSVP",

      elementStyles: {},
      style: createDefaultTextStyle(),
    },
  };
  return {
    id: makeId("rsvp"),
    type: "rsvp",
    label: "RSVP",
    grid,
    appearance: createDefaultBlockAppearance(),
    data: {
      heading: "Wedding Invitation RSVP Form",
      imageUrl: "",
      imageFrameShape: "circle",
elementOrder: [
  "image",
  "heading",
  "nameLabel",
  "firstName",
  "lastName",
  "email",
  "address",
  "attending",
  "meal",
  "guestToggle",
  "guestCount",
  "guestName",
  "comments",
],
      hiddenElements: [],
      guestMin: 0,
      guestMax: 1,

      attendingLabel: "Are you attending?",
      attendingOptions: ["Yes", "No"],

      mealLabel: "Your meal selection:",
      mealOptions: ["Chicken", "Salmon"],

      guestLabel: "Are you bringing a guest?",
      guestOptions: ["Yes", "No"],

      commentsLabel: "Additional comments",
      commentsPlaceholder: "Additional comments",
      submitButtonText: "Submit RSVP",

      elementStyles: {},
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
          scrollHeight: 520,
          style: {
            ...createDefaultTextStyle(),
            fontSize: 30,
          },
          threadStyleTarget: "message",
          formAppearance: {
            backgroundColor: "#ffffff",
            backgroundOpacity: 100,
            borderColor: "#e5e7eb",
          },
          postBlockStyle: {
            ...createDefaultTextStyle(),
            fontSize: 16,
          },
          postBlockAppearance: {
            backgroundColor: "#ffffff",
            backgroundOpacity: 100,
            borderColor: "#e5e7eb",
          },
          subjectStyle: {
            ...createDefaultTextStyle(),
            fontSize: 18,
            bold: true,
          },
          nameStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            bold: true,
          },
          messageStyle: {
            ...createDefaultTextStyle(),
            fontSize: 15,
          },
          messageAppearance: {
            backgroundColor: "#ffffff",
            backgroundOpacity: 100,
            borderColor: "#d4d4d8",
          },
          postButtonTextStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            bold: true,
            color: "#ffffff",
          },
          postButtonAppearance: {
            backgroundColor: "#111827",
            backgroundOpacity: 100,
            borderColor: "#111827",
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
          headingStyle: createDefaultTextStyle(),
          bodyStyle: createDefaultTextStyle(),
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

  positionX: 50,
  positionY: 50,
  scale: 1,
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
            scale: 1,
            opacity: 1,
          },
          title: "Listing Title",
          description: "Add a short description here.",
          price: 0,
          addToCart: false,
          sku: "",
          metadata: [
            { id: makeId("meta"), label: "Price", value: "$0" },
            { id: makeId("meta"), label: "Location", value: "City, State" },
          ],

          pricePlacement: "mid",
          quantityPlacement: "mid",

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
          priceStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            bold: true,
          },
          quantityStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
          },
          cardVariant: "stacked",
          imageHeightPercent: 50,
          rotation: 0,
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
          videoPath: "",
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

  displayStyle: "bar",
  meterSectionCount: 6,
  meterStartColor: "#f59e0b",
  meterEndColor: "#dc2626",
  meterNeedleColor: "#e5e7eb",
  meterCaption: "",
  meterCaptionStyle: {
    ...createDefaultTextStyle(),
    fontSize: 14,
    align: "center",
  },
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
      donationOptions: [
        { id: makeId("donationopt"), label: "$10", amount: 10 },
        { id: makeId("donationopt"), label: "$25", amount: 25 },
        { id: makeId("donationopt"), label: "$50", amount: 50 },
      ],
      style: createDefaultTextStyle(),
      buttonSpacing: 8,
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

  case "pop_balloon":
  return {
    id: makeId("popballoon"),
    type: "pop_balloon",
    label: "Pop the Balloon",
    grid: {
      ...grid,
      rowSpan: 5,
    },
    appearance: {
      ...createDefaultBlockAppearance(),
      backgroundColor: "#FFFFFF",
      borderColor: "#FCA5A5",
      borderWidth: 1,
      borderRadius: 24,
    },
    data: {
      title: "Pop the Balloon",
      hostName: "Host",
      hostPasscode: "123456",
      lineupSlots: 6,
      requirePopReason: true,
      audienceVotingEnabled: false,
      anonymousViewingEnabled: true,
      matchResultMode: "public",
      theme: "red_balloons",
      prompt: "Introduce yourself and decide who keeps their balloon.",
      style: createDefaultTextStyle(),
    },
  };

    case "cart":
      return {
        id: makeId("cart"),
        type: "cart",
        label: "Cart",
        grid: {
          ...grid,
          rowSpan: 4,
        },
appearance: {
  ...createDefaultBlockAppearance(),
  backgroundColor: "transparent",
  borderColor: "#E5E7EB",
  borderWidth: 1,
  borderRadius: 16,
},
        data: {
          heading: "Cart",
          taxRate: 0,
          discount: 0,
          discountType: "flat",
          buttonText: "Checkout",
          emptyMessage: "No items selected",
          currency: "usd",
          style: createDefaultTextStyle(),
        },
      };
  return {
    id: makeId("cart"),
    type: "cart",
    label: "Cart",
    grid: {
      ...grid,
      rowSpan: 3,
    },
    appearance: {
      ...createDefaultBlockAppearance(),
      backgroundColor: "#FFFFFF",
      borderColor: "#E5E7EB",
      borderWidth: 1,
      borderRadius: 16,
    },
    data: {
      heading: "Cart",
      taxRate: 0,
      discount: 0,
      buttonText: "Checkout",
      style: createDefaultTextStyle(),
    },
  };

  case "checkout":
    return {
      id: makeId("checkout"),
      type: "checkout",
      label: "Checkout",
      grid: {
        ...grid,
        rowSpan: 3,
      },
      appearance: {
        ...createDefaultBlockAppearance(),
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        borderRadius: 16,
      },
      data: {
        productName: "Product",
        price: 10,
        currency: "usd",
        allowQuantity: false,
        description: "",
        imageUrl: "",
        buttonText: "Checkout",
        successMessage: "Payment successful!",
        redirectUrl: "",
        collectEmail: true,
        collectName: false,
        collectAddress: false,
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

    if (block.type === "icon") {
      return {
        ...block,
        grid: normalizeGridValue(block.grid, fallbackGrid),
        data: {
          ...block.data,
          icon: {
            ...block.data.icon,
            positionX:
              typeof block.data.icon?.positionX === "number"
                ? block.data.icon.positionX
                : 50,
            positionY:
              typeof block.data.icon?.positionY === "number"
                ? block.data.icon.positionY
                : 50,
            zoom:
              typeof block.data.icon?.zoom === "number"
                ? block.data.icon.zoom
                : 1,
            rotation:
              typeof block.data.icon?.rotation === "number"
                ? block.data.icon.rotation
                : 0,
            opacity:
              typeof block.data.icon?.opacity === "number"
                ? block.data.icon.opacity
                : 1,
            color:
              typeof block.data.icon?.color === "string"
                ? block.data.icon.color
                : "#111111",
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
      const countdownData = block.data as any;

      return {
        ...block,
        grid: normalizeGridValue(block.grid, fallbackGrid),
        data: {
          ...block.data,

          heading:
            typeof block.data.heading === "string"
              ? block.data.heading
              : "",

          targetIso:
            typeof block.data.targetIso === "string"
              ? block.data.targetIso
              : "",

          completedMessage:
            typeof block.data.completedMessage === "string"
              ? block.data.completedMessage
              : "Countdown finished",

          style: {
            ...createDefaultTextStyle(),
            ...(block.data.style ?? {}),
          },

          tileStyle: {
            ...createDefaultTextStyle(),
            ...(countdownData.tileStyle ?? {}),
          },

          headingStyle: {
            ...createDefaultTextStyle(),
            ...(countdownData.headingStyle ?? {}),
          },

          standardValueStyle: {
            ...createDefaultTextStyle(),
            fontSize: 24,
            color: "#ef4444",
            ...(countdownData.standardValueStyle ?? {}),
          },

          standardUnitStyle: {
            ...createDefaultTextStyle(),
            fontSize: 11,
            color: "#e5e7eb",
            ...(countdownData.standardUnitStyle ?? {}),
          },

          styleVariant:
            countdownData.styleVariant === "cards" ||
            countdownData.styleVariant === "hero" ||
            countdownData.styleVariant === "stage" ||
            countdownData.styleVariant === "standard" ||
            countdownData.styleVariant === "default"
              ? countdownData.styleVariant
              : "default",

          animationStyle:
            countdownData.animationStyle === "pulse" ||
            countdownData.animationStyle === "flip" ||
            countdownData.animationStyle === "bounce" ||
            countdownData.animationStyle === "none"
              ? countdownData.animationStyle
              : "none",

          alignment:
            countdownData.alignment === "left" ||
            countdownData.alignment === "center" ||
            countdownData.alignment === "right"
              ? countdownData.alignment
              : "center",

          spacing:
            typeof countdownData.spacing === "number" &&
            Number.isFinite(countdownData.spacing)
              ? Math.max(0, Math.min(80, countdownData.spacing))
              : 12,

          stageUnitGap:
            typeof countdownData.stageUnitGap === "number" &&
            Number.isFinite(countdownData.stageUnitGap)
              ? Math.max(-40, Math.min(40, countdownData.stageUnitGap))
              : -24,

          showRings: countdownData.showRings !== false,

          showSeparator: countdownData.showSeparator !== false,

          showDays: countdownData.showDays !== false,
          showHours: countdownData.showHours !== false,
          showMinutes: countdownData.showMinutes !== false,
          showSeconds: countdownData.showSeconds !== false,
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

if (block.type === "pop_balloon") {
  return {
    ...block,
    grid: normalizeGridValue(block.grid, fallbackGrid),
    data: {
      title:
        typeof block.data.title === "string"
          ? block.data.title
          : "Pop the Balloon",

      hostName:
        typeof block.data.hostName === "string"
          ? block.data.hostName
          : "Host",

      hostPasscode:
        typeof block.data.hostPasscode === "string"
          ? block.data.hostPasscode
          : "123456",

      lineupSlots:
        typeof block.data.lineupSlots === "number" &&
        Number.isFinite(block.data.lineupSlots)
          ? Math.max(2, Math.min(12, Math.floor(block.data.lineupSlots)))
          : 6,

      requirePopReason: block.data.requirePopReason !== false,

      audienceVotingEnabled: Boolean(block.data.audienceVotingEnabled),

      anonymousViewingEnabled: block.data.anonymousViewingEnabled !== false,

      matchResultMode:
        block.data.matchResultMode === "public" ||
        block.data.matchResultMode === "private" ||
        block.data.matchResultMode === "contact_form" ||
        block.data.matchResultMode === "private_chat_later"
          ? block.data.matchResultMode
          : "public",

      theme:
        block.data.theme === "red_balloons" ||
        block.data.theme === "hearts" ||
        block.data.theme === "party" ||
        block.data.theme === "formal" ||
        block.data.theme === "custom"
          ? block.data.theme
          : "red_balloons",

      prompt:
        typeof block.data.prompt === "string"
          ? block.data.prompt
          : "Introduce yourself and decide who keeps their balloon.",

      style: {
        ...createDefaultTextStyle(),
        ...(block.data.style ?? {}),
      },
    },
  };
}

if (block.type === "donation") {
  return {
    ...block,
    grid: normalizeGridValue(block.grid, fallbackGrid),
    data: {
      heading:
        typeof block.data.heading === "string"
          ? block.data.heading
          : "Support This Cause",

      description:
        typeof block.data.description === "string"
          ? block.data.description
          : "",

      donationOptions: Array.isArray(block.data.donationOptions)
        ? block.data.donationOptions
            .map((opt) => ({
              id:
                typeof opt?.id === "string" && opt.id.trim()
                  ? opt.id
                  : makeId("donationopt"),
              label:
                typeof opt?.label === "string"
                  ? opt.label
                  : `$${Number(opt?.amount || 0)}`,
              amount:
                typeof opt?.amount === "number" &&
                Number.isFinite(opt.amount)
                  ? Math.max(1, opt.amount)
                  : 0,
            }))
            .filter((opt) => opt.amount > 0)
        : [],

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

    if (block.type === "checkout") {
  return {
    ...block,
    grid: normalizeGridValue(block.grid, fallbackGrid),
    data: {
      productName:
        typeof block.data.productName === "string"
          ? block.data.productName
          : "Product",

      price:
        typeof block.data.price === "number" &&
        Number.isFinite(block.data.price)
          ? Math.max(0, block.data.price)
          : 0,

      currency:
        typeof block.data.currency === "string"
          ? block.data.currency.toLowerCase()
          : "usd",

      allowQuantity: Boolean(block.data.allowQuantity),

      description:
        typeof block.data.description === "string"
          ? block.data.description
          : "",

      imageUrl:
        typeof block.data.imageUrl === "string"
          ? block.data.imageUrl
          : "",

      buttonText:
        typeof block.data.buttonText === "string" &&
        block.data.buttonText.trim()
          ? block.data.buttonText
          : "Checkout",

      successMessage:
        typeof block.data.successMessage === "string"
          ? block.data.successMessage
          : "Payment successful!",

      redirectUrl:
        typeof block.data.redirectUrl === "string"
          ? block.data.redirectUrl
          : "",

      collectEmail: block.data.collectEmail !== false,
      collectName: Boolean(block.data.collectName),
      collectAddress: Boolean(block.data.collectAddress),
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

    pageLength:
      (draft as any).pageLength === "1200" ||
      (draft as any).pageLength === "1800" ||
      (draft as any).pageLength === "2400" ||
      (draft as any).pageLength === "3200" ||
      (draft as any).pageLength === "4000" ||
      (draft as any).pageLength === "5600"
        ? (draft as any).pageLength
        : "1800",

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