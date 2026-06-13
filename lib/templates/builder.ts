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

  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;

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
  backgroundOpacity?: number;
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
  | "timeline"
  | "wave"
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
  | "content_panel"
  | "gallery"
  | "thread"
  | "enrollment_board"
  | "post_board"
  | "highlight"
  | "showcase"
  | "festiveBackground"
  | "form_field"
  | "shape"
  | "listing"
  | "rich_text"
  | "video"
  | "progress_bar"
  | "visitor_counter"
  | "donation"
  | "link_hub"
  | "checklist"
  | "schedule_agenda"
  | "tournament_display"
  | "calendar_event"
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

  description?: string;
  showUrl?: boolean;
  logoUrl?: string;
  autoGenerateLogo?: boolean;
};

export type GalleryImage = {
  id: string;
  url: string;
  alt?: string;

  href?: string;

  shape?: "square" | "rounded" | "circle";

  title?: string;
  description?: string;
  metadata?: string;

  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  metadataStyle?: TextStyle;

  storagePath?: string;
  imageSizeBytes?: number;
  imageOriginalSizeBytes?: number;
  imageMimeType?: string;
  isEmbeddedDataUrl?: boolean;

  // legacy only — no longer used by Gallery UI/renderer
  caption?: string;
  captionStyle?: TextStyle;
};

export type TimelineEntry = {
  id: string;
  date?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  imageSize?: number;
  imageShape?: "circle" | "rounded" | "square" | "diamond" | "hexagon" | "blob" | "none";
  accentColor?: string;
  alignment?: "auto" | "left" | "right" | "center";
  animation?: "fade" | "slide" | "pop" | "reveal" | "none";
  ctaLabel?: string;
  ctaUrl?: string;
};

export type WaveBlock = BaseBlock & {
  type: "wave";
  label: string;
  data: {
    lineColor: string;
    lineThickness: number;
    waveHeight: number;
    waveFrequency: number;
    opacity: number;
    styleVariant: "gentle" | "ribbon" | "organic" | "double";
    flipVertical: boolean;
  };
};

export type TimelineBlock = BaseBlock & {
  type: "timeline";
  data: {
    heading: string;
    styleVariant: "classic" | "alternating" | "horizontal" | "journey" | "memory";
    entries: TimelineEntry[];
    direction: "ascending" | "descending";
    connectorStyle: "solid" | "dashed" | "dotted" | "none";
    connectorThickness: number;
    lineColor: string;
    nodeColor: string;
    cardBackground: string;
    borderRadius: number;
    shadow: boolean;
    spacing: number;
    animateOnScroll: boolean;
    mobileMode: "auto" | "vertical" | "horizontal";
    titleStyle: TextStyle;
    dateStyle: TextStyle;
    entryTitleStyle: TextStyle;
    subtitleStyle: TextStyle;
    descriptionStyle: TextStyle;
  };
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
export type ListingCardVariant = "stacked" | "compact" | "feature";

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
    fade?: {
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
      size?: number;
    };
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
      transformStrength?: number;

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

    audioStoragePath?: string;
    audioMimeType?: string;
    audioSizeBytes?: number;

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

  export type RsvpStyleVariant =
  | "standard"
  | "elegant_wedding"
  | "modern_minimal"
  | "glassmorphism"
  | "luxury_black"
  | "editorial_magazine"
  | "floral_invitation"
  | "bold_event"
  | "luxury_invitation"
  | "soft_pastel"
  | "dark_neon"
  | "ticket_style"
  | "timeline_rsvp"
  | "split_layout"
  | "floating_panels"
  | "formal_banquet";

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
    styleVariant?: RsvpStyleVariant;

    useChoiceCards?: boolean;

    imageUrl?: string;
    imageFrameShape?: RsvpImageFrameShape;

    elementOrder: RsvpElementKey[];
    hiddenElements?: RsvpElementKey[];

    guestMin?: number;
    guestMax?: number;

    contactLabel?: string;
    firstNamePlaceholder?: string;
    lastNamePlaceholder?: string;
    emailPlaceholder?: string;
    addressPlaceholder?: string;
    nameDisplay?: boolean;
    emailDisplay?: boolean;
    addressDisplay?: boolean;

    attendingLabel?: string;
    attendingOptions?: string[];
    attendingDisplay?: boolean;
    attendingDefaultValue?: string;

    mealLabel?: string;
    mealOptions?: string[];
    mealDisplay?: boolean;
    mealDefaultValue?: string;

    guestLabel?: string;
    guestOptions?: string[];
    guestDisplay?: boolean;
    guestDefaultValue?: string;

    commentsLabel?: string;
    commentsPlaceholder?: string;
    commentsDisplay?: boolean;
    commentsDefaultValue?: string;

    replyByText?: string;
    replyByDisplay?: boolean;

    submitButtonText?: string;

    buttonLayout?: "full" | "compact";
    buttonShape?: "rounded" | "pill" | "square";
    buttonVariant?: "solid" | "outline" | "gradient";
    buttonUppercase?: boolean;

    elementStyles?: RsvpElementStyleMap;

    style?: TextStyle;

    helperText?: string;
    confirmationTitle?: string;
    confirmationMessage?: string;
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

    columnGap?: number;
    rowGap?: number;

    frameThickness?: number;
    frameColor?: string;

    showTitle?: boolean;
    showDescription?: boolean;
    showMetadata?: boolean;

    textPlacement?: "top" | "bottom";
    galleryTextTarget?: "title" | "description" | "metadata";

    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    metadataStyle?: TextStyle;

    // legacy only — no longer used by renderer/inspector
    addCaption?: boolean;
    captionStyle?: TextStyle;
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

export type EnrollmentBoardVariant =
  | "classic_board"
  | "member_wall"
  | "signature_list";

export type EnrollmentBoardBlock = BaseBlock & {
  type: "enrollment_board";
  data: {
    heading?: string;
    subtitle?: string;
    variant: EnrollmentBoardVariant;
    metadataLabel?: string;
    showMetadataField?: boolean;
    showTotalEnrolled?: boolean;

    showHeading?: boolean;
    showSubtitle?: boolean;

    nameLabel?: string;
    quoteLabel?: string;
    emailLabel?: string;
    imageLabel?: string;

    showQuoteField?: boolean;
    showEmailField?: boolean;
    showImageUpload?: boolean;
    showEnrollmentList?: boolean;

    linkedGalleryBlockId?: string;
    linkedCarouselBlockId?: string;

    requireQuote?: boolean;
    requireEmail?: boolean;
    requireImage?: boolean;

    quoteMaxLength?: number;

    submitButtonText?: string;
    successMessage?: string;
    alreadyEnrolledMessage?: string;
    emptyListMessage?: string;

    showProfileImages?: boolean;
    showQuotes?: boolean;
    showEnrollmentCount?: boolean;

    sortOrder?: "newest" | "oldest" | "alphabetical";
    maxVisibleEntries?: number;

    avatarShape?: "circle" | "rounded" | "square";

    style?: TextStyle;
    formStyle?: TextStyle;
    inputStyle?: TextStyle;
    buttonStyle?: TextStyle;
    listStyle?: TextStyle;
    cardStyle?: TextStyle;
    headingStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    memberNameStyle?: TextStyle;
    memberQuoteStyle?: TextStyle;
    memberListPosition?: "standard" | "profile";
    fieldSectionWidth?: number;
    memberTotalLabel?: string;
    memberTotalStyle?: TextStyle & {
    backgroundColor?: string;
    backgroundOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  };

    linkedProfileImageBlockId?: string;
    linkedNameLabelBlockId?: string;
    linkedQuoteLabelBlockId?: string;
  };
};

export type HighlightDisplayStyle = "grid" | "list" | "linear";

export type HighlightType =
  | "manual_stat"
  | "money_raised"
  | "progress"
  | "countdown"
  | "rsvp_count"
  | "poll_result"
  | "visitor_count"
  | "enrollment_records"
  | "calendar_events"
  | "post_board_discussions";

export type HighlightCard = {
  id: string;
  type: HighlightType;

  label?: string;
  value?: string | number;
  unitLabel?: string;
  linearLabel?: string;
  linearDescription?: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  icon?: string;
  showIcon?: boolean;
  imageUrl?: string;
  imagePosition?: "left" | "right";
  imageSize?: number;

  currentValue?: number;
  goalValue?: number;
  unit?: string;
  showProgressBar?: boolean;

  amount?: number;
  currency?: string;
  goalAmount?: number;
  showProgressPercentage?: boolean;

  targetDate?: string;
  targetTime?: string;
  countdownUnits?: "days" | "hours" | "minutes" | "full";

  sourceBlockId?: string;
  sourceFormBlockId?: string;
  sourceType?: "rsvp" | "poll" | "visitor_counter" | "enrollment_board";
  countType?: string;
  pollOptionId?: string;
  displayType?: "count" | "percentage" | "winner";

  fallbackValue?: string | number;
};

export type HighlightBlock = BaseBlock & {
  type: "highlight";
  data: {
    mode?: "top_messages" | "rsvp_count" | "total_funds" | "poll_results";

    heading?: string;
    subtitle?: string;
    showHeading?: boolean;
    showSubtitle?: boolean;

    displayStyle?: HighlightDisplayStyle;
    rotation?: number;
    linearDividerStyle?: "none" | "closed_solid" | "open_solid" | "closed_dotted" | "open_dotted";
    linearDividerColor?: string;
    cardBackgroundColor?: string;
    cards?: HighlightCard[];

    limit?: number;
    sourceBlockId?: string;
    sourceFormBlockId?: string;

    label?: string;
    value?: string | number;
    description?: string;
    icon?: string;

    style?: TextStyle;
    headingStyle?: TextStyle;
    bodyStyle?: TextStyle;
    cardStyle?: TextStyle;
    valueStyle?: TextStyle;
    labelStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    cardBackgroundOpacity?: number;
  };
};

export type VisitorCounterVariant = "flip" | "dial" | "smooth_count";

export type VisitorCounterBlock = BaseBlock & {
  type: "visitor_counter";
  data: {
    heading?: string;
    subtitle?: string;
    label?: string;
    variant?: VisitorCounterVariant;

    showHeading?: boolean;
    showSubtitle?: boolean;
    showLabel?: boolean;
    showIcon?: boolean;
    showLastUpdated?: boolean;

    metricType?: "site_visits" | "page_visits" | "unique_visitors" | "today_visits";

    animationDelayMs?: number;
    animationDurationMs?: number;

    alignment?: "left" | "center" | "right";

    style?: TextStyle;
    numberStyle?: TextStyle;
    labelStyle?: TextStyle;
    tileStyle?: TextStyle;
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

    positionX?: number;
    positionY?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;

shadowEnabled?: boolean;
shadowColor?: string;
shadowBlur?: number;
shadowX?: number;
shadowY?: number;

    fade?: {
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
      size?: number;
    };
  };
};

export type FormFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "state"
  | "checkbox_text";

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
    labelStyle?: TextStyle;
    inputStyle?: TextStyle;
    placeholderStyle?: TextStyle;
    linkedButtonId?: string;
    allowMultipleSelections?: boolean;

    showRating?: boolean;
    ratingValue?: number;
    ratingColor?: string;
    ratingPosition?: "high" | "low";
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
    metadataSeparator?: "none" | ":" | "-" | "|";

    pricePlacement?: "mid" | "lower";
    quantityPlacement?: "mid" | "lower";

    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    metadataStyle?: TextStyle;
    priceStyle?: TextStyle;
    quantityStyle?: TextStyle;

    cardVariant?: ListingCardVariant;
    imageHeightPercent?: number;
    imageWidthPercent?: number;
    rotation?: number;
    scale?: number;

    showTitle?: boolean;
    showPrice?: boolean;
    pricePosition?: "left" | "right" | "belowTitle";
    showImage?: boolean;
    imageShape?: "square" | "rounded" | "circle" | "ticket" | "badge";
    featureBullets?: string[];
    showBullets?: boolean;
    bulletStyle?: "dot" | "checkmark" | "arrow" | "star" | "icon";
    showButton?: boolean;
    buttonText?: string;
    buttonLink?: string;
    buttonAlignment?: "left" | "center" | "right" | "hidden";
  };
};

export type RichTextBlock = BaseBlock & {
  type: "rich_text";
data: {
  title?: string;
  content: string;
  contentHtml?: string;
  contentJson?: unknown;
  plainText?: string;
  pasteMode?: "keep" | "match" | "plain";
  style?: TextStyle;
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    lineHeight?: number;
    letterSpacing?: number;
    paragraphSpacing?: number;
    textAlign?: TextAlign;
  };
  behavior?: {
    maxHeight?: number;
    scrollable?: boolean;
    preserveFormatting?: boolean;
  };
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

    thumbnailUrl?: string;
    thumbnailPath?: string;
    thumbnailFileName?: string;

    autoGenerateThumbnail?: boolean;
    showPlayOverlay?: boolean;

    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    showControls?: boolean;

    addCaption?: boolean;
    caption?: string;
    captionStyle?: TextStyle;

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

    barMode?: "progressive" | "split";
    barForegroundColor?: string;
    barBackgroundColor?: string;
    splitHeadingA?: string;
    splitHeadingB?: string;
    splitHeadingSeparator?: "none" | "|" | ":" | "-";

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
    allowCustomAmount?: boolean;
    customAmountLabel?: string;

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
    labelStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    urlStyle?: TextStyle;
    imageWidth?: number;
    logoFileName?: string;

    imagePlacement?: "flushLeft" | "floatLeft" | "flushRight" | "floatRight";
    imageFrame?: "circle" | "square";

    triggerSymbol?: string;
    triggerSymbolSize?: number;
    triggerSymbolBase?: string;
    triggerSymbolColor?: string;
    customTriggerEnabled?: boolean;
    customTriggerFileName?: string;
    customTriggerUrl?: string;

    cardShadowEnabled?: boolean;
    cardShadowColor?: string;
    cardShadowBlur?: number;
    cardShadowX?: number;
    cardShadowY?: number;
    cardGap?: number;
    cardPaddingX?: number;
    cardPaddingY?: number;

    cardBackgroundColor?: string;
    cardBorderColor?: string;
    cardBorderWidth?: number;
    cardBorderRadius?: number;
    cardTransparentBackground?: boolean;
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

export type TournamentDisplayMode =
  | "bracket"
  | "standings"
  | "matchups";

export type TournamentBracketLayout =
  | "single_elimination"
  | "double_elimination"
  | "east_west"
  | "custom";

export type TournamentTeam = {
  id: string;
  name: string;
  division?: "west" | "east";
  seed?: number;
  wins?: number;
  losses?: number;
  record?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  coach?: string;
  stats?: string;
  color?: string;
};

export type TournamentMatch = {
  id: string;
  roundId?: string;
  roundTitle?: string;
  division?: "east" | "west" | "finals" | "custom";
  teamA?: string;
  teamB?: string;
  scoreA?: number;
  scoreB?: number;
  winner?: string;
  gameDate?: string;
  gameTime?: string;
  location?: string;
  status?: "upcoming" | "live" | "final" | "postponed";
  threadId?: string;
  calendarEventId?: string;
};

export type TournamentRound = {
  id: string;
  title: string;
  division?: "east" | "west" | "finals" | "custom";
  matchIds: string[];
};

export type TournamentDisplayBlock = BaseBlock & {
  type: "tournament_display";
  data: {
    tournamentName?: string;
    season?: string;
    year?: string;
    displayMode?: TournamentDisplayMode;
    designStyle?: "style1" | "style2" | "style3";
    autoGenerateBracket?: boolean;
    bracketLayout?: TournamentBracketLayout;
    mirroredBracket?: boolean;
    leftDivisionLabel?: string;
    rightDivisionLabel?: string;
    finalsLabel?: string;
    teams: TournamentTeam[];
    matches: TournamentMatch[];
    rounds?: TournamentRound[];
    showTeamLogos?: boolean;
    showSeeds?: boolean;
    showRecords?: boolean;
    showScores?: boolean;
    showGameDate?: boolean;
    showLocation?: boolean;
    showStatusBadges?: boolean;
    showDiscussionLinks?: boolean;
    emptyStateText?: string;
    style?: Record<string, any>;
    teamStyle?: Record<string, any>;
    matchStyle?: Record<string, any>;
    bracketStyle?: Record<string, any>;
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

export type CalendarEventEntry = {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingMethod?: string;
  location?: string;
  address?: string;
  virtualLink?: string;
  notes?: string;
  host?: string;
  category?: string;
  capacity?: string;
  rsvpRequired?: boolean;
  imageUrl?: string;
  imageStoragePath?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  buttonText?: string;
  buttonUrl?: string;
  addToCalendarText?: string;
  addToCalendarUrl?: string;

  showLive?: boolean;

showStartTime?: boolean;
showEndTime?: boolean;

showSubtitle?: boolean;

headingImageUrl?: string;
headingImageStoragePath?: string;

imageSize?: number;
};

export type CalendarEventBlock = BaseBlock & {
  type: "calendar_event";
  data: {
    heading?: string;
    subtitle?: string;
    variant: "standard" | "formal" | "simplified" | "compact";
    defaultSelectedDate?: string;
    defaultMonth?: string;

    showHeading?: boolean;
    showSubtitle?: boolean;
    showCalendarHeading?: boolean;
    showEventCount?: boolean;
    showEmptyState?: boolean;

    showCategoryBadge?: boolean;
    showHost?: boolean;
    showCapacity?: boolean;
    showRsvpBadge?: boolean;
    showEventImages?: boolean;
    showCtaButtons?: boolean;

    compactDateFormat?: "weekday" | "short" | "numeric";
    compactMaxVisibleEvents?: number;
    compactViewAllText?: string;
    compactViewAllUrl?: string;
    showCompactImages?: boolean;

    emptyStateText?: string;
    events: CalendarEventEntry[];

    style?: TextStyle;
    headingStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    eventTitleStyle?: TextStyle;
    eventDateStyle?: TextStyle;
    eventDetailsStyle?: TextStyle;

    timeFormat?: "12h" | "24h";
    showHeadingImage?: boolean;
    headingImageSize?: number;

    calendarStyle?: {
      backgroundColor?: string;
      textColor?: string;
      activeDateColor?: string;
      todayBorderColor?: string;
      eventDotColor?: string;
      dateBorderColor?: string;
      scheduledLabelColor?: string;
      monthLabelColor?: string;
      monthArrowColor?: string;
      selectedDateBackgroundColor?: string;
      selectedDateBorderColor?: string;
      formBackgroundColor?: string;
    };
    detailStyle?: {
      backgroundColor?: string;
      borderColor?: string;
      borderRadius?: number;
      shadowEnabled?: boolean;
      textColor?: string;
    };
    buttonStyle?: Record<string, any>;
  };
};

export type PostBoardInteractionMode = "announcement" | "community";

export type PostBoardReply = {
  id: string;
  postId: string;
  sourcePostId: string;
  sourcePostTitle: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  message: string;
  contactInfoConfirmed?: boolean;
  createdAt: string;
};

export type PostBoardPost = {
  id: string;
  title: string;
  subtitle?: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
  ownerDisplayName?: string;
  ownerAvatarUrl?: string;
  pinned?: boolean;
  imageUrl?: string;
  imageStoragePath?: string;
  videoUrl?: string;
  videoStoragePath?: string;
  threadId?: string;
  likeCount?: number;
  messageCount?: number;

  authorName?: string;
  authorEmail?: string;
  authorAvatarUrl?: string;
  contactInfoConfirmed?: boolean;
  isOwnerPost?: boolean;
  replies?: PostBoardReply[];
};

export type PostBoardBlock = BaseBlock & {
  type: "post_board";
  data: {
    heading?: string;
    subtitle?: string;
    interactionMode?: PostBoardInteractionMode;
    showHeading?: boolean;
    showSubtitle?: boolean;
    showOwnerAvatar?: boolean;
    showTimestamps?: boolean;
    showPinnedPostsFirst?: boolean;
    showLikes?: boolean;
    showMessages?: boolean;
    allowImages?: boolean;
    allowVideos?: boolean;
    maxMessageLength?: number;
    maxVisibleReplies?: number;
    requireCommunityPostEmail?: boolean;
    allowReplyEmailCapture?: boolean;
    notifyPostAuthorOnReply?: boolean;
    posts: PostBoardPost[];
    variant?: "standard" | "compact" | "feature";
    style?: Record<string, any>;
    blockHeadingStyle?: Record<string, any>;
    cardStyle?: Record<string, any>;
    headingStyle?: Record<string, any>;
    bodyStyle?: Record<string, any>;
    buttonStyle?: Record<string, any>;
  };
};

export type ContentPanelContentStyle = "plain_text" | "list_grid";

export type ContentPanelGridCell = {
  id: string;
  type?: "text" | "image";
  value?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  imageAlt?: string;
};

export type ContentPanelGridColumn = {
  id: string;
  label: string;
  type?: "text" | "image";
};

export type ContentPanelGridRow = {
  id: string;
  cells: ContentPanelGridCell[];
};

export type ContentPanelGrid = {
  columns: ContentPanelGridColumn[];
  rows: ContentPanelGridRow[];
  showRowLines?: boolean;
  showColumnLines?: boolean;
  showHeaderRow?: boolean;
  freezeHeaderRow?: boolean;
};

export type ContentPanel = {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  contentStyle?: ContentPanelContentStyle;
  grid?: ContentPanelGrid;
  imageUrl?: string;
  imageStoragePath?: string;
  imageAlt?: string;
  imagePosition?: "above" | "below" | "left" | "right";
  badge?: string;
  icon?: string;
  featured?: boolean;
};

export type ContentPanelsVariant = "tabs" | "sidebar" | "cards" | "accordion";

export type ContentPanelsTransition =
  | "none"
  | "fade"
  | "slide_left"
  | "slide_right"
  | "flip"
  | "scale";

export type ContentPanelBlock = BaseBlock & {
  type: "content_panel";
  data: {
    heading?: string;
    subtitle?: string;
    showHeading?: boolean;
    showSubtitle?: boolean;
    variant: ContentPanelsVariant;
    transition: ContentPanelsTransition;
    defaultPanelId?: string;
    rememberSelection?: boolean;
    autoHeight?: boolean;
    fixedHeight?: number;
    panels: ContentPanel[];
    style?: TextStyle;
    headingStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    navigationStyle?: Record<string, any>;
    panelStyle?: Record<string, any>;
    activeNavigationBackground?: string;
    activeNavigationColor?: string;
    inactiveNavigationBackground?: string;
    panelBackground?: string;
  };
};

export type MicrositeBlock =
  | BookmarkBlock
  | PuzzleBlock
  | SpinWheelBlock
  | SpreadsheetBlock
  | TimelineBlock
  | WaveBlock
  | ContentPanelBlock
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
  | PostBoardBlock
  | EnrollmentBoardBlock
  | HighlightBlock
  | VisitorCounterBlock
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
  | TournamentDisplayBlock
  | CalendarEventBlock
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
  pageLength?:
  | "1200"
  | "1400"
  | "1600"
  | "1800"
  | "2000"
  | "2400"
  | "2800"
  | "3200"
  | "3600"
  | "4000"
  | "5600";
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

function normalizePostBoardBlock(block: PostBoardBlock): PostBoardBlock {
  const fallbackGrid = createDefaultThreadGrid();
  const normalizedGrid = normalizeGridValue(block.grid, fallbackGrid);

  return {
    ...block,
    grid: {
      ...normalizedGrid,
      colSpan:
        normalizedGrid.colSpan < 6
          ? fallbackGrid.colSpan
          : normalizedGrid.colSpan,
      rowSpan:
        normalizedGrid.rowSpan < 6
          ? fallbackGrid.rowSpan
          : normalizedGrid.rowSpan,
    },
    data: {
      ...block.data,
      heading:
        typeof block.data.heading === "string" ? block.data.heading : "Updates",
      subtitle:
        typeof block.data.subtitle === "string"
          ? block.data.subtitle
          : "Latest announcements and posts",
      interactionMode:
        block.data.interactionMode === "community"
          ? "community"
          : "announcement",
      showHeading: block.data.showHeading !== false,
      showSubtitle: block.data.showSubtitle !== false,
      showOwnerAvatar: block.data.showOwnerAvatar !== false,
      showTimestamps: block.data.showTimestamps !== false,
      showPinnedPostsFirst: block.data.showPinnedPostsFirst !== false,
      showLikes: block.data.showLikes !== false,
      showMessages: block.data.showMessages !== false,
      allowImages: block.data.allowImages !== false,
      allowVideos: Boolean(block.data.allowVideos),
      maxMessageLength:
        typeof block.data.maxMessageLength === "number" &&
        Number.isFinite(block.data.maxMessageLength)
          ? Math.max(50, Math.min(1000, Math.floor(block.data.maxMessageLength)))
          : 300,
      maxVisibleReplies:
        typeof block.data.maxVisibleReplies === "number" &&
        Number.isFinite(block.data.maxVisibleReplies)
          ? Math.max(1, Math.min(100, Math.floor(block.data.maxVisibleReplies)))
          : 10,
      requireCommunityPostEmail: block.data.requireCommunityPostEmail !== false,
      allowReplyEmailCapture: block.data.allowReplyEmailCapture !== false,
      notifyPostAuthorOnReply: block.data.notifyPostAuthorOnReply !== false,
      variant:
        block.data.variant === "compact" || block.data.variant === "feature"
          ? block.data.variant
          : "standard",
      posts: Array.isArray(block.data.posts)
        ? block.data.posts.map((post) => {
            const ownerDisplayName =
              typeof post.ownerDisplayName === "string"
                ? post.ownerDisplayName
                : "";

            const ownerAvatarUrl =
              typeof post.ownerAvatarUrl === "string"
                ? post.ownerAvatarUrl
                : "";

            const authorName =
              typeof post.authorName === "string"
                ? post.authorName
                : ownerDisplayName;

            const authorEmail =
              typeof post.authorEmail === "string" ? post.authorEmail : "";

            const authorAvatarUrl =
              typeof post.authorAvatarUrl === "string"
                ? post.authorAvatarUrl
                : ownerAvatarUrl;

            return {
              id:
                typeof post.id === "string" && post.id
                  ? post.id
                  : makeId("post"),
              title:
                typeof post.title === "string" && post.title.trim()
                  ? post.title
                  : "Untitled post",
              subtitle: typeof post.subtitle === "string" ? post.subtitle : "",
              message: typeof post.message === "string" ? post.message : "",
              createdAt:
                typeof post.createdAt === "string" && post.createdAt
                  ? post.createdAt
                  : new Date().toISOString(),
              updatedAt:
                typeof post.updatedAt === "string"
                  ? post.updatedAt
                  : undefined,
              ownerDisplayName,
              ownerAvatarUrl,
              authorName,
              authorEmail,
              authorAvatarUrl,
              contactInfoConfirmed:
                Boolean(post.contactInfoConfirmed) || Boolean(authorEmail),
              isOwnerPost: post.isOwnerPost !== false,
              pinned: Boolean(post.pinned),
              imageUrl: typeof post.imageUrl === "string" ? post.imageUrl : "",
              imageStoragePath:
                typeof post.imageStoragePath === "string"
                  ? post.imageStoragePath
                  : "",
              videoUrl: typeof post.videoUrl === "string" ? post.videoUrl : "",
              videoStoragePath:
                typeof post.videoStoragePath === "string"
                  ? post.videoStoragePath
                  : "",
              threadId: typeof post.threadId === "string" ? post.threadId : "",
              likeCount:
                typeof post.likeCount === "number" &&
                Number.isFinite(post.likeCount)
                  ? Math.max(0, Math.floor(post.likeCount))
                  : 0,
replies: Array.isArray((post as any).replies)
  ? (post as any).replies.map((reply: any) => ({
      id:
        typeof reply.id === "string" && reply.id
          ? reply.id
          : makeId("reply"),
      postId:
        typeof reply.postId === "string" && reply.postId
          ? reply.postId
          : post.id,
      sourcePostId:
        typeof reply.sourcePostId === "string" && reply.sourcePostId
          ? reply.sourcePostId
          : post.id,
      sourcePostTitle:
        typeof reply.sourcePostTitle === "string"
          ? reply.sourcePostTitle
          : post.title,
      name:
        typeof reply.name === "string" && reply.name.trim()
          ? reply.name
          : "Guest",
      email: typeof reply.email === "string" ? reply.email : "",
      avatarUrl:
        typeof reply.avatarUrl === "string" ? reply.avatarUrl : "",
      message:
        typeof reply.message === "string" ? reply.message : "",
      contactInfoConfirmed:
        Boolean(reply.contactInfoConfirmed) || Boolean(reply.email),
      createdAt:
        typeof reply.createdAt === "string" && reply.createdAt
          ? reply.createdAt
          : new Date().toISOString(),
    }))
  : [],
messageCount:
  typeof post.messageCount === "number" &&
  Number.isFinite(post.messageCount)
    ? Math.max(0, Math.floor(post.messageCount))
    : Array.isArray((post as any).replies)
      ? (post as any).replies.length
      : 0,
            };
          })
        : [],
style: block.data.style ?? {},
blockHeadingStyle: (block.data as any).blockHeadingStyle ?? {},
cardStyle: block.data.cardStyle ?? {},
headingStyle: (block.data as any).headingStyle ?? {},
bodyStyle: (block.data as any).bodyStyle ?? {},
buttonStyle: block.data.buttonStyle ?? {},
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
  block.data.cardVariant === "stacked" ||
  block.data.cardVariant === "feature"
    ? block.data.cardVariant
    : "stacked",

showTitle:
  typeof block.data.showTitle === "boolean"
    ? block.data.showTitle
    : true,

showPrice:
  typeof block.data.showPrice === "boolean"
    ? block.data.showPrice
    : true,

pricePosition:
  block.data.pricePosition === "left" ||
  block.data.pricePosition === "right" ||
  block.data.pricePosition === "belowTitle"
    ? block.data.pricePosition
    : "right",

showImage:
  typeof block.data.showImage === "boolean"
    ? block.data.showImage
    : true,

imageShape:
  block.data.imageShape === "square" ||
  block.data.imageShape === "rounded" ||
  block.data.imageShape === "circle" ||
  block.data.imageShape === "ticket" ||
  block.data.imageShape === "badge"
    ? block.data.imageShape
    : "rounded",

featureBullets:
  Array.isArray(block.data.featureBullets)
    ? block.data.featureBullets.filter(
        (item): item is string => typeof item === "string",
      )
    : [
        "Access all attractions",
        "Live shows included",
        "Flexible admission",
        "Mobile-friendly ticket",
      ],

showBullets:
  typeof block.data.showBullets === "boolean"
    ? block.data.showBullets
    : true,

bulletStyle:
  block.data.bulletStyle === "checkmark" ||
  block.data.bulletStyle === "arrow" ||
  block.data.bulletStyle === "star" ||
  block.data.bulletStyle === "icon" ||
  block.data.bulletStyle === "dot"
    ? block.data.bulletStyle
    : "dot",

showButton:
  typeof block.data.showButton === "boolean"
    ? block.data.showButton
    : true,

buttonText:
  typeof block.data.buttonText === "string"
    ? block.data.buttonText
    : "Buy Ticket",

buttonLink:
  typeof block.data.buttonLink === "string"
    ? block.data.buttonLink
    : "",

buttonAlignment:
  block.data.buttonAlignment === "left" ||
  block.data.buttonAlignment === "center" ||
  block.data.buttonAlignment === "right" ||
  block.data.buttonAlignment === "hidden"
    ? block.data.buttonAlignment
    : "right",
imageHeightPercent:
  typeof block.data.imageHeightPercent === "number" &&
  Number.isFinite(block.data.imageHeightPercent)
    ? Math.max(20, Math.min(80, Math.floor(block.data.imageHeightPercent)))
    : 50,
imageWidthPercent:
  typeof block.data.imageWidthPercent === "number" &&
  Number.isFinite(block.data.imageWidthPercent)
    ? Math.max(15, Math.min(80, block.data.imageWidthPercent))
    : 35,
rotation:
  typeof block.data.rotation === "number" &&
  Number.isFinite(block.data.rotation)
    ? Math.max(-45, Math.min(45, block.data.rotation))
    : 0,
    },
  };
}

function normalizeVideoBlock(block: VideoBlock): VideoBlock {
  const fallbackGrid: GridPlacement = {
  colStart: 1,
  rowStart: 1,
  colSpan: 6,
  rowSpan: 4,
  zIndex: 1,
};

  return {
    ...block,

    grid: normalizeGridValue(block.grid, fallbackGrid),

    data: {
      ...block.data,

      title:
        typeof block.data.title === "string"
          ? block.data.title
          : "",

      videoUrl:
        typeof block.data.videoUrl === "string"
          ? block.data.videoUrl
          : "",

      videoPath:
        typeof block.data.videoPath === "string"
          ? block.data.videoPath
          : "",

      thumbnailUrl:
        typeof (block.data as any).thumbnailUrl === "string"
          ? (block.data as any).thumbnailUrl
          : "",

      thumbnailPath:
        typeof (block.data as any).thumbnailPath === "string"
          ? (block.data as any).thumbnailPath
          : "",

      thumbnailFileName:
        typeof (block.data as any).thumbnailFileName === "string"
          ? (block.data as any).thumbnailFileName
          : "",

      autoGenerateThumbnail:
        (block.data as any).autoGenerateThumbnail !== false,

      showPlayOverlay:
        (block.data as any).showPlayOverlay !== false,

      autoplay: Boolean(block.data.autoplay),
      muted: Boolean(block.data.muted),
      loop: Boolean(block.data.loop),

      showControls:
        block.data.showControls !== false,

      addCaption:
        Boolean((block.data as any).addCaption),

      caption:
        typeof (block.data as any).caption === "string"
          ? (block.data as any).caption
          : "",

      captionStyle: {
        ...createDefaultTextStyle(),
        ...(((block.data as any).captionStyle ?? {}) as object),
      },

      style: {
        ...createDefaultTextStyle(),
        ...(block.data.style ?? {}),
      },
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

          case "timeline":
      return {
        id: makeId("timeline"),
        type: "timeline",
        label: "Story Timeline",
        grid: {
          ...grid,
          colSpan: 6,
          rowSpan: 6,
        },
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
          borderWidth: 1,
          borderRadius: 24,
        },
        data: {
          heading: "Our Journey",
          styleVariant: "classic",
          entries: [
            {
              id: makeId("timelineentry"),
              date: "2024",
              title: "The Beginning",
              subtitle: "Where it started",
              description: "Add the first moment in your story.",
              imageUrl: "",
              icon: "/media-icons/star.svg",
              imageSize: 64,
              imageShape: "circle",
              accentColor: "#2563EB",
              alignment: "auto",
              animation: "fade",
              ctaLabel: "",
              ctaUrl: "",
            },
            {
              id: makeId("timelineentry"),
              date: "2025",
              title: "The Next Chapter",
              subtitle: "A meaningful milestone",
              description: "Add another important moment here.",
              imageUrl: "",
              icon: "/media-icons/star.svg",
              imageSize: 64,
              imageShape: "rounded",
              accentColor: "#EC4899",
              alignment: "auto",
              animation: "fade",
              ctaLabel: "",
              ctaUrl: "",
            },
          ],
          direction: "ascending",
          connectorStyle: "solid",
          connectorThickness: 3,
          lineColor: "#CBD5E1",
          nodeColor: "#2563EB",
          cardBackground: "#FFFFFF",
          borderRadius: 20,
          shadow: true,
          spacing: 24,
          animateOnScroll: false,
          mobileMode: "auto",
          titleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 26,
            bold: true,
            align: "center",
          },
          dateStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            bold: true,
            color: "#2563EB",
          },
          entryTitleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 20,
            bold: true,
          },
          subtitleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            color: "#6B7280",
          },
          descriptionStyle: {
            ...createDefaultTextStyle(),
            fontSize: 15,
            color: "#374151",
          },
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
          fade: {
            top: false,
            bottom: false,
            left: false,
            right: false,
            size: 15,
          },
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
        transformStrength: 100,
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
          allowMultipleSelections: false,

          showRating: false,
          ratingValue: 0,
          ratingColor: "#F59E0B",
          ratingPosition: "high",

          style: createDefaultTextStyle(),
          labelStyle: createDefaultTextStyle(),
          inputStyle: {
            ...createDefaultTextStyle(),
            paddingTop: 12,
            paddingRight: 12,
            paddingBottom: 12,
            paddingLeft: 12,
          },
          placeholderStyle: {
            ...createDefaultTextStyle(),
            color: "rgb(186, 186, 186)",
          },
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
          audioStoragePath: "",
          audioMimeType: "",
          audioSizeBytes: 0,
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
helperText: "Please let us know if you’ll be joining us.",
confirmationTitle: "Thank you — your RSVP has been received.",
confirmationMessage: "We’re excited to celebrate with you.",
styleVariant: "elegant_wedding",
    imageUrl: "",
      imageFrameShape: "circle",

      useChoiceCards: true,

      contactLabel: "Contact Details",
      firstNamePlaceholder: "First Name",
      lastNamePlaceholder: "Last Name",
      emailPlaceholder: "Email Address",
      addressPlaceholder: "Mailing Address",
      nameDisplay: true,
      emailDisplay: true,
      addressDisplay: true,

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
      
      replyByText: "Reply by May 12",
      replyByDisplay: true,

      submitButtonText: "Submit RSVP →",
      buttonLayout: "full",
      buttonShape: "rounded",
      buttonVariant: "solid",
      buttonUppercase: false,

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

      columnGap: 8,
      rowGap: 8,

      frameThickness: 0,
      frameColor: "#ffffff",

      showTitle: false,
      showDescription: false,
      showMetadata: false,

      textPlacement: "bottom",
      galleryTextTarget: "title",

      titleStyle: {
        ...createDefaultTextStyle(),
        fontSize: 14,
        bold: true,
      },

      descriptionStyle: {
        ...createDefaultTextStyle(),
        fontSize: 12,
      },

      metadataStyle: {
        ...createDefaultTextStyle(),
        fontSize: 11,
        color: "#6b7280",
      },

      // legacy only
      addCaption: false,
      captionStyle: {
        ...createDefaultTextStyle(),
        fontSize: 16,
        color: "#111827",
        align: "left",
      },
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

case "post_board":
  return {
    id: makeId("postboard"),
    type: "post_board",
    label: "Post Board",
    grid: createDefaultThreadGrid(),
    appearance: createDefaultBlockAppearance(),
    data: {
      heading: "Updates",
      subtitle: "Latest announcements and posts",
      showHeading: true,
      showSubtitle: true,
      showOwnerAvatar: true,
      showTimestamps: true,
      showPinnedPostsFirst: true,
      showLikes: true,
      showMessages: true,
      allowImages: true,
      allowVideos: false,
      maxMessageLength: 300,
      variant: "standard",
      posts: [
        {
          id: makeId("post"),
          title: "Welcome update",
          subtitle: "Pinned",
          message:
            "Use this post board to share announcements, updates, and important notes with visitors.",
          createdAt: new Date().toISOString(),
          ownerDisplayName: "Owner",
          pinned: true,
          likeCount: 0,
          messageCount: 0,
        },
      ],
      style: {},
      cardStyle: {},
      buttonStyle: {},
    },
  };


          case "enrollment_board":
      return {
        id: makeId("enrollmentboard"),
        type: "enrollment_board",
        label: "Enrollment Board",
        grid: createDefaultThreadGrid(),
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Join the Board",
          subtitle: "Add your name to the list.",
          variant: "classic_board",

          showHeading: true,
          showSubtitle: true,

          nameLabel: "Name",
          quoteLabel: "Quote or message",
          emailLabel: "Email",
          imageLabel: "Profile image",
          metadataLabel: "Metadata",

          showQuoteField: true,
          showEmailField: true,
          showImageUpload: true,
          showMetadataField: false,
          showTotalEnrolled: true,

          requireQuote: false,
          requireEmail: false,
          requireImage: false,

          quoteMaxLength: 80,

          submitButtonText: "Submit",
          successMessage: "You’ve been added to the board.",
          alreadyEnrolledMessage: "You’re already enrolled from this device.",
          emptyListMessage: "No enrollments yet.",

          showProfileImages: true,
          showQuotes: true,
          showEnrollmentCount: true,
          memberListPosition: "standard",
          fieldSectionWidth: 55,
          memberTotalLabel: " enrolled",
          memberTotalStyle: {
            ...createDefaultTextStyle(),
            fontSize: 12,
            bold: true,
            color: "#4b5563",
            backgroundColor: "#f3f4f6",
            borderRadius: 999,
          },

                    inputStyle: createDefaultTextStyle(),
          listStyle: createDefaultTextStyle(),
          headingStyle: {
            ...createDefaultTextStyle(),
            fontSize: 24,
            bold: true,
          },
          subtitleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            color: "#6b7280",
          },
          memberNameStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            bold: true,
          },
          memberQuoteStyle: {
            ...createDefaultTextStyle(),
            fontSize: 12,
            color: "#6b7280",
          },

          showEnrollmentList: true,

          linkedProfileImageBlockId: "",
          linkedNameLabelBlockId: "",
          linkedQuoteLabelBlockId: "",

          sortOrder: "newest",
          maxVisibleEntries: 24,

          avatarShape: "circle",

          style: createDefaultTextStyle(),
          formStyle: createDefaultTextStyle(),
          cardStyle: createDefaultTextStyle(),
          buttonStyle: {
            ...createDefaultTextStyle(),
            color: "#ffffff",
            bold: true,
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
          heading: "Highlights",
          subtitle: "Key details at a glance.",
          showHeading: true,
          showSubtitle: false,
          displayStyle: "grid",
          rotation: 0,
          limit: 4,
          sourceBlockId: "",
          sourceFormBlockId: "",
          linearDividerStyle: "closed_solid",
          linearDividerColor: "rgba(0,0,0,0.14)", 
          cards: [
            {
              id: makeId("highlight_card"),
              type: "manual_stat",
              label: "Guests",
              value: "120",
              suffix: "+",
              unitLabel: "Guests",
              linearLabel: "Guests",
              description: "Expected attendees",
              icon: "✨",
              showIcon: true,
              imageSize: 40,
            },
          ],
          style: createDefaultTextStyle(),
          headingStyle: createDefaultTextStyle(),
          bodyStyle: createDefaultTextStyle(),
          cardStyle: createDefaultTextStyle(),
          valueStyle: createDefaultTextStyle(),
          labelStyle: createDefaultTextStyle(),
          descriptionStyle: createDefaultTextStyle(),
          cardBackgroundColor: "",
        },
      };


          case "visitor_counter":
      return {
        id: makeId("visitor_counter"),
        type: "visitor_counter",
        label: "Visitor Counter",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Visitor Count",
          subtitle: "See how many people have visited this site.",
          label: "Visitors",
          variant: "flip",
          showHeading: true,
          showSubtitle: false,
          showLabel: true,
          showIcon: true,
          showLastUpdated: false,
          metricType: "site_visits",
          animationDelayMs: 1500,
          animationDurationMs: 800,
          alignment: "center",
          style: createDefaultTextStyle(),
          numberStyle: {
            ...createDefaultTextStyle(),
            fontSize: 42,
            bold: true,
            align: "center",
          },
          labelStyle: {
            ...createDefaultTextStyle(),
            fontSize: 13,
            align: "center",
          },
          tileStyle: createDefaultTextStyle(),
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

case "wave":
  return {
    id: makeId("wave"),
    type: "wave",
    label: "Wave",
    grid: {
      ...grid,
      colSpan: 6,
      rowSpan: 1,
    },
    appearance: {
      ...createDefaultBlockAppearance(),
      backgroundColor: "transparent",
      borderWidth: 0,
    },
    data: {
      lineColor: "#C8A97E",
      lineThickness: 2,
      waveHeight: 40,
      waveFrequency: 3,
      opacity: 1,
      styleVariant: "gentle",
      flipVertical: false,
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
      metadataSeparator: ":",

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

      showTitle: true,
      showPrice: true,
      pricePosition: "right",

      showImage: true,
      imageShape: "rounded",

      featureBullets: [
        "Access all attractions",
        "Live shows included",
        "Flexible admission",
        "Mobile-friendly ticket",
      ],

      showBullets: true,
      bulletStyle: "dot",

      showButton: true,
      buttonText: "Buy Ticket",
      buttonLink: "",
      buttonAlignment: "right",

      imageHeightPercent: 50,
      imageWidthPercent: 35,

      rotation: 0,
    },
  };
      case "content_panel":
      return {
        id: makeId("contentpanel"),
        type: "content_panel",
        label: "Content Panel",
        grid: {
          ...grid,
          colSpan: 6,
          rowSpan: 6,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Information Hub",
          subtitle: "Explore each section below.",
          showHeading: true,
          showSubtitle: true,
          variant: "tabs",
          transition: "fade",
          rememberSelection: false,
          autoHeight: true,
          fixedHeight: 420,
          panels: [
{
  id: makeId("panel"),
  title: "Overview",
  subtitle: "Start here",
  content:
    "Use this panel to introduce your event, guide, menu, resources, or important details.",
  contentStyle: "plain_text",
  grid: {
    showRowLines: false,
    showColumnLines: false,
    showHeaderRow: true,
    freezeHeaderRow: true,
    columns: [
      { id: makeId("col"), label: "Item", type: "text" },
      { id: makeId("col"), label: "Details", type: "text" },
    ],
    rows: [
      {
        id: makeId("row"),
        cells: [
          { id: makeId("cell"), type: "text", value: "Example item" },
          { id: makeId("cell"), type: "text", value: "Example details" },
        ],
      },
    ],
  },
  imagePosition: "above",
  icon: "✨",
  badge: "",
},
{
  id: makeId("panel"),
  title: "Details",
  subtitle: "Helpful information",
  content:
    "Add schedules, instructions, frequently asked questions, resources, or next steps.",
  contentStyle: "plain_text",
  grid: {
    showRowLines: false,
    showColumnLines: false,
    showHeaderRow: true,
    freezeHeaderRow: true,
    columns: [
      { id: makeId("col"), label: "Item", type: "text" },
      { id: makeId("col"), label: "Details", type: "text" },
    ],
    rows: [
      {
        id: makeId("row"),
        cells: [
          { id: makeId("cell"), type: "text", value: "Example item" },
          { id: makeId("cell"), type: "text", value: "Example details" },
        ],
      },
    ],
  },
  imagePosition: "above",
  icon: "📌",
  badge: "",
},
          ],

          style: createDefaultTextStyle(),

headingStyle: {
  ...createDefaultTextStyle(),
  fontSize: 20,
  bold: false,
},

          subtitleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            color: "#6B7280",
          },

          navigationStyle: {
            ...createDefaultTextStyle(),
            bold: true,
          },

          panelStyle: {
            ...createDefaultTextStyle(),
          },

          activeNavigationBackground: "#dbeafe",
          activeNavigationColor: "#1d4ed8",
          inactiveNavigationBackground: "#ffffff",
          panelBackground: "#f9fafb",
        },
      };

      case "rich_text":
      return {
        id: makeId("richtext"),
        type: "rich_text",
        label: "Rich Text",
        grid: {
          ...grid,
          colSpan: 5,
          rowSpan: 5,
        },
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "transparent",
          borderColor: "#D1D5DB",
          borderWidth: 0,
          borderRadius: 16,
        },
        data: {
          title: "",
          content: "<p>Write something here...</p>",
          contentHtml: "<p>Write something here...</p>",
          contentJson: null,
          plainText: "Write something here...",
          pasteMode: "match",
          style: {
            ...createDefaultTextStyle(),
            fontSize: 16,
            align: "left",
          },
          typography: {
            fontFamily: "inherit",
            fontSize: 16,
            color: "#111827",
            lineHeight: 1.4,
            letterSpacing: 0,
            paragraphSpacing: 8,
            textAlign: "left",
          },
          behavior: {
            maxHeight: 0,
            scrollable: false,
            preserveFormatting: false,
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
          autoGenerateThumbnail: true,
          showPlayOverlay: true,
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

  barMode: "progressive",
  barForegroundColor: "#111827",
  barBackgroundColor: "#e5e7eb",
  splitHeadingA: "Option A",
  splitHeadingB: "Option B",
  splitHeadingSeparator: "none",

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
  allowCustomAmount: true,
  customAmountLabel: "Custom Amount",
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
            {
              id: makeId("link"),
              label: "Link 1",
              description: "",
              url: "#",
              showUrl: false,
            },
            {
              id: makeId("link"),
              label: "Link 2",
              description: "",
              url: "#",
              showUrl: false,
            },
          ],

          style: createDefaultTextStyle(),
          labelStyle: createDefaultTextStyle(),
          descriptionStyle: createDefaultTextStyle(),
          urlStyle: createDefaultTextStyle(),

          imagePlacement: "floatLeft",
          imageFrame: "circle",
          imageWidth: 40,

          triggerSymbol: "/icons/icon_thin_chevron.png",
          triggerSymbolSize: 40,

          customTriggerEnabled: false,
          customTriggerUrl: "",
          customTriggerFileName: "",

          cardShadowEnabled: false,
          cardShadowColor: "#000000",
          cardShadowBlur: 0,
          cardShadowX: 0,
          cardShadowY: 0,

          cardPaddingX: 16,
          cardPaddingY: 12,
          cardGap: 12,

          cardBackgroundColor: "#ffffff",
          cardBorderColor: "#e5e7eb",
          cardBorderWidth: 1,
          cardBorderRadius: 12,
          cardTransparentBackground: false,
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

    case "tournament_display":
      return {
        id: makeId("tournament"),
        type: "tournament_display",
        label: "Tournament Display",
        grid: {
          ...grid,
          colSpan: Math.max(grid.colSpan, 8),
          rowSpan: Math.max(grid.rowSpan, 5),
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          tournamentName: "Tournament Bracket",
          season: "Season",
          year: String(new Date().getFullYear()),

          displayMode: "bracket",
          designStyle: "style1",
          autoGenerateBracket: true,

          bracketLayout: "east_west",
          mirroredBracket: true,

          leftDivisionLabel: "West Division",
          rightDivisionLabel: "East Division",
          finalsLabel: "Championship",

          showTeamLogos: true,
          showSeeds: true,
          showRecords: true,
          showScores: true,
          showGameDate: true,
          showLocation: true,
          showStatusBadges: true,
          showDiscussionLinks: true,

          emptyStateText:
            "Add teams and matchups to build your tournament display.",

          teams: [
            {
              id: makeId("team"),
              name: "Eagles",
              seed: 1,
              wins: 14,
              losses: 2,
              record: "14-2",
            },
            {
              id: makeId("team"),
              name: "Hawks",
              seed: 8,
              wins: 6,
              losses: 10,
              record: "6-10",
            },
            {
              id: makeId("team"),
              name: "Wolves",
              seed: 4,
              wins: 10,
              losses: 6,
              record: "10-6",
            },
            {
              id: makeId("team"),
              name: "Titans",
              seed: 5,
              wins: 9,
              losses: 7,
              record: "9-7",
            },
            {
              id: makeId("team"),
              name: "Sharks",
              seed: 3,
              wins: 12,
              losses: 4,
              record: "12-4",
            },
            {
              id: makeId("team"),
              name: "Knights",
              seed: 6,
              wins: 7,
              losses: 9,
              record: "7-9",
            },
            {
              id: makeId("team"),
              name: "Bears",
              seed: 2,
              wins: 11,
              losses: 5,
              record: "11-5",
            },
            {
              id: makeId("team"),
              name: "Falcons",
              seed: 7,
              wins: 6,
              losses: 10,
              record: "6-10",
            },

            {
              id: makeId("team"),
              name: "Tigers",
              seed: 1,
              wins: 13,
              losses: 3,
              record: "13-3",
            },
            {
              id: makeId("team"),
              name: "Panthers",
              seed: 8,
              wins: 5,
              losses: 11,
              record: "5-11",
            },
            {
              id: makeId("team"),
              name: "Dragons",
              seed: 4,
              wins: 10,
              losses: 6,
              record: "10-6",
            },
            {
              id: makeId("team"),
              name: "Cougars",
              seed: 5,
              wins: 8,
              losses: 8,
              record: "8-8",
            },
            {
              id: makeId("team"),
              name: "Lions",
              seed: 3,
              wins: 12,
              losses: 4,
              record: "12-4",
            },
            {
              id: makeId("team"),
              name: "Bulldogs",
              seed: 6,
              wins: 7,
              losses: 9,
              record: "7-9",
            },
            {
              id: makeId("team"),
              name: "Vipers",
              seed: 2,
              wins: 11,
              losses: 5,
              record: "11-5",
            },
            {
              id: makeId("team"),
              name: "Rams",
              seed: 7,
              wins: 6,
              losses: 10,
              record: "6-10",
            },
          ],

          matches: [
            {
              id: makeId("match"),
              division: "west",
              roundTitle: "Round 1",
              teamA: "Eagles",
              teamB: "Hawks",
              scoreA: 78,
              scoreB: 54,
              winner: "Eagles",
              status: "final",
              gameDate: "2026-05-24",
              gameTime: "19:00",
            },
            {
              id: makeId("match"),
              division: "west",
              roundTitle: "Round 1",
              teamA: "Wolves",
              teamB: "Titans",
              scoreA: 67,
              scoreB: 61,
              winner: "Wolves",
              status: "final",
              gameDate: "2026-05-24",
              gameTime: "17:00",
            },
            {
              id: makeId("match"),
              division: "west",
              roundTitle: "Round 1",
              teamA: "Sharks",
              teamB: "Knights",
              scoreA: 84,
              scoreB: 58,
              winner: "Sharks",
              status: "final",
              gameDate: "2026-05-24",
              gameTime: "17:00",
            },
            {
              id: makeId("match"),
              division: "west",
              roundTitle: "Round 1",
              teamA: "Bears",
              teamB: "Falcons",
              scoreA: 71,
              scoreB: 49,
              winner: "Bears",
              status: "final",
              gameDate: "2026-05-24",
              gameTime: "19:00",
            },

            {
              id: makeId("match"),
              division: "west",
              roundTitle: "Round 2",
              teamA: "Eagles",
              teamB: "Wolves",
              scoreA: 0,
              scoreB: 0,
              winner: "Eagles",
              status: "upcoming",
              gameDate: "2026-05-25",
              gameTime: "18:00",
            },
            {
              id: makeId("match"),
              division: "west",
              roundTitle: "Round 2",
              teamA: "Sharks",
              teamB: "Bears",
              scoreA: 0,
              scoreB: 0,
              winner: "Sharks",
              status: "upcoming",
              gameDate: "2026-05-25",
              gameTime: "20:00",
            },
            {
              id: makeId("match"),
              division: "west",
              roundTitle: "Division Finals",
              teamA: "Eagles",
              teamB: "Sharks",
              scoreA: 0,
              scoreB: 0,
              winner: "Eagles",
              status: "upcoming",
              gameDate: "2026-05-26",
              gameTime: "18:00",
            },

            {
              id: makeId("match"),
              division: "east",
              roundTitle: "Round 1",
              teamA: "Tigers",
              teamB: "Panthers",
              scoreA: 76,
              scoreB: 48,
              winner: "Tigers",
              status: "final",
              gameDate: "2026-05-24",
              gameTime: "19:00",
            },
            {
              id: makeId("match"),
              division: "east",
              roundTitle: "Round 1",
              teamA: "Dragons",
              teamB: "Cougars",
              scoreA: 70,
              scoreB: 62,
              winner: "Dragons",
              status: "final",
              gameDate: "2026-05-24",
              gameTime: "17:00",
            },
            {
              id: makeId("match"),
              division: "east",
              roundTitle: "Round 1",
              teamA: "Lions",
              teamB: "Bulldogs",
              scoreA: 82,
              scoreB: 56,
              winner: "Lions",
              status: "final",
              gameDate: "2026-05-24",
              gameTime: "17:00",
            },
            {
              id: makeId("match"),
              division: "east",
              roundTitle: "Round 1",
              teamA: "Vipers",
              teamB: "Rams",
              scoreA: 74,
              scoreB: 53,
              winner: "Vipers",
              status: "final",
              gameDate: "2026-05-24",
              gameTime: "19:00",
            },

            {
              id: makeId("match"),
              division: "east",
              roundTitle: "Round 2",
              teamA: "Tigers",
              teamB: "Dragons",
              scoreA: 0,
              scoreB: 0,
              winner: "Tigers",
              status: "upcoming",
              gameDate: "2026-05-25",
              gameTime: "18:00",
            },
            {
              id: makeId("match"),
              division: "east",
              roundTitle: "Round 2",
              teamA: "Lions",
              teamB: "Vipers",
              scoreA: 0,
              scoreB: 0,
              winner: "Lions",
              status: "upcoming",
              gameDate: "2026-05-25",
              gameTime: "20:00",
            },
            {
              id: makeId("match"),
              division: "east",
              roundTitle: "Division Finals",
              teamA: "Tigers",
              teamB: "Lions",
              scoreA: 0,
              scoreB: 0,
              winner: "Tigers",
              status: "upcoming",
              gameDate: "2026-05-26",
              gameTime: "18:00",
            },

            {
              id: makeId("match"),
              division: "finals",
              roundTitle: "Championship",
              teamA: "Eagles",
              teamB: "Tigers",
              scoreA: 0,
              scoreB: 0,
              winner: "",
              status: "upcoming",
              gameDate: "2026-06-01",
              gameTime: "19:00",
            },
          ],

          rounds: [
            {
              id: makeId("round"),
              title: "Round 1",
              division: "custom",
              matchIds: [],
            },
            {
              id: makeId("round"),
              title: "Round 2",
              division: "custom",
              matchIds: [],
            },
            {
              id: makeId("round"),
              title: "Division Finals",
              division: "custom",
              matchIds: [],
            },
            {
              id: makeId("round"),
              title: "Championship",
              division: "finals",
              matchIds: [],
            },
          ],

          style: createDefaultTextStyle(),
          teamStyle: createDefaultTextStyle(),
          matchStyle: createDefaultTextStyle(),
          bracketStyle: createDefaultTextStyle(),
        },
      };

    case "calendar_event":
      return {
        id: makeId("calendar"),
        type: "calendar_event",
        label: "Calendar Event",
        grid: {
          ...grid,
          rowSpan: 6,
        },
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "Event Calendar",
          subtitle: "Select a date to view event details.",
          variant: "standard",

          defaultSelectedDate: "2026-06-24",
          defaultMonth: "2026-06",

          showHeading: true,
          showSubtitle: true,
          showCalendarHeading: true,
          showEventCount: true,
          showEmptyState: true,

          showCategoryBadge: true,
          showHost: true,
          showCapacity: true,
          showRsvpBadge: true,
          showEventImages: true,
          showCtaButtons: true,

          compactDateFormat: "weekday",
          compactMaxVisibleEvents: 4,
          compactViewAllText: "View All Events",
          compactViewAllUrl: "",
          showCompactImages: true,

          emptyStateText: "No events scheduled for this date.",

          events: [
            {
              id: makeId("calendarevent"),
              title: "Community Meetup",
              subtitle: "Monthly gathering and updates",
              date: "2026-06-24",
              startTime: "6:00 PM",
              endTime: "7:30 PM",
              meetingMethod: "In Person",
              location: "Main Hall",
              address: "",
              virtualLink: "",
              notes:
                "Join us for announcements, networking, and upcoming schedule details.",
              host: "Event Host",
              category: "Featured",
              capacity: "",
              rsvpRequired: false,
              imageUrl: "",
              imageStoragePath: "",
              imageAlt: "",
              imagePosition: "right",
              buttonText: "View Details",
              buttonUrl: "",
              addToCalendarText: "Add to Calendar",
              addToCalendarUrl: "",

              showLive: false,

              showStartTime: true,
              showEndTime: true,

              showSubtitle: true,

              headingImageUrl: "",
              headingImageStoragePath: "",

              imageSize: 64,
            },
          ],

          style: createDefaultTextStyle(),
          headingStyle: createDefaultTextStyle(),
          subtitleStyle: createDefaultTextStyle(),
          eventTitleStyle: createDefaultTextStyle(),
          eventDateStyle: createDefaultTextStyle(),
          eventDetailsStyle: createDefaultTextStyle(),

          timeFormat: "12h",

          showHeadingImage: false,
          headingImageSize: 64,

          calendarStyle: {
            backgroundColor: "",
            textColor: "",
            activeDateColor: "",
            todayBorderColor: "",
            eventDotColor: "",
            dateBorderColor: "",
            scheduledLabelColor: "",
            monthLabelColor: "",
            monthArrowColor: "",
            selectedDateBackgroundColor: "",
            selectedDateBorderColor: "",
            formBackgroundColor: "",
          },

          detailStyle: {
            backgroundColor: "",
            borderColor: "",
            borderRadius: 16,
            shadowEnabled: false,
            textColor: "",
          },

          buttonStyle: {},
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

  if (block.type === "post_board") {
    return normalizePostBoardBlock(block as PostBoardBlock);
  }

  if (block.type === "video") {
    return normalizeVideoBlock(block);
  }

    if (block.type === "listing") {
      return normalizeListingBlock(block as ListingBlock);
    }

    const fallbackGrid = {
      ...createDefaultGrid(),
      rowStart: index + 1,
      zIndex: index + 1,
    };

if (block.type === "content_panel") {
  const data = block.data as any;

  function normalizePanelGrid(rawGrid: any) {
    const rawColumns = Array.isArray(rawGrid?.columns)
      ? rawGrid.columns
      : [
          {
            id: makeId("col"),
            label: "Item",
            type: "text",
          },
          {
            id: makeId("col"),
            label: "Details",
            type: "text",
          },
        ];

    const columns = rawColumns.map((column: any) => ({
      id:
        typeof column?.id === "string" && column.id.trim()
          ? column.id
          : makeId("col"),
      label:
        typeof column?.label === "string" && column.label.trim()
          ? column.label
          : "Column",
      type: column?.type === "image" ? "image" : "text",
    }));

    const safeColumns =
      columns.length > 0
        ? columns
        : [
            {
              id: makeId("col"),
              label: "Item",
              type: "text" as const,
            },
          ];

    const rawRows = Array.isArray(rawGrid?.rows)
      ? rawGrid.rows
      : [
          {
            id: makeId("row"),
            cells: safeColumns.map((column: any) => ({
              id: makeId("cell"),
              type: column.type,
              value: "",
            })),
          },
        ];

    const rows = rawRows.map((row: any) => {
      const rawCells = Array.isArray(row?.cells) ? row.cells : [];

      const cells = safeColumns.map((column: any, columnIndex: number) => {
        const cell = rawCells[columnIndex] ?? {};

        return {
          id:
            typeof cell?.id === "string" && cell.id.trim()
              ? cell.id
              : makeId("cell"),
          type: column.type === "image" || cell?.type === "image" ? "image" : "text",
          value:
            typeof cell?.value === "string"
              ? cell.value
              : "",
          imageUrl:
            typeof cell?.imageUrl === "string"
              ? cell.imageUrl
              : "",
          imageStoragePath:
            typeof cell?.imageStoragePath === "string"
              ? cell.imageStoragePath
              : "",
          imageAlt:
            typeof cell?.imageAlt === "string"
              ? cell.imageAlt
              : "",
        };
      });

      return {
        id:
          typeof row?.id === "string" && row.id.trim()
            ? row.id
            : makeId("row"),
        cells,
      };
    });

    return {
      columns: safeColumns,
      rows:
        rows.length > 0
          ? rows
          : [
              {
                id: makeId("row"),
                cells: safeColumns.map((column: any) => ({
                  id: makeId("cell"),
                  type: column.type,
                  value: "",
                  imageUrl: "",
                  imageStoragePath: "",
                  imageAlt: "",
                })),
              },
            ],
      showRowLines: Boolean(rawGrid?.showRowLines),
      showColumnLines: Boolean(rawGrid?.showColumnLines),
      showHeaderRow: rawGrid?.showHeaderRow !== false,
      freezeHeaderRow: rawGrid?.freezeHeaderRow !== false,
    };
  }

  const panels = Array.isArray(data.panels)
    ? data.panels.map((panel: any) => {
        const contentStyle =
          panel?.contentStyle === "list_grid" ? "list_grid" : "plain_text";

        return {
          id:
            typeof panel?.id === "string" && panel.id.trim()
              ? panel.id
              : makeId("panel"),
          title:
            typeof panel?.title === "string" && panel.title.trim()
              ? panel.title
              : "Panel",
          subtitle:
            typeof panel?.subtitle === "string" ? panel.subtitle : "",
          content:
            typeof panel?.content === "string" ? panel.content : "",
          contentStyle,
          grid: normalizePanelGrid(panel?.grid),
          imageUrl:
            typeof panel?.imageUrl === "string" ? panel.imageUrl : "",
          imageStoragePath:
            typeof panel?.imageStoragePath === "string"
              ? panel.imageStoragePath
              : "",
          imageAlt:
            typeof panel?.imageAlt === "string" ? panel.imageAlt : "",
          imagePosition:
            panel?.imagePosition === "above" ||
            panel?.imagePosition === "below" ||
            panel?.imagePosition === "left" ||
            panel?.imagePosition === "right"
              ? panel.imagePosition
              : "above",
          badge:
            typeof panel?.badge === "string" ? panel.badge : "",
          icon:
            typeof panel?.icon === "string" ? panel.icon : "",
          featured: Boolean(panel?.featured),
        };
      })
    : [];

  const fallbackPanels =
    panels.length > 0
      ? panels
      : [
          {
            id: makeId("panel"),
            title: "Overview",
            subtitle: "Start here",
            content:
              "Use this panel to introduce your event, guide, menu, resources, or important details.",
            contentStyle: "plain_text" as const,
            grid: normalizePanelGrid(null),
            imageUrl: "",
            imageStoragePath: "",
            imageAlt: "",
            imagePosition: "above" as const,
            badge: "",
            icon: "✨",
            featured: false,
          },
        ];

  return {
    ...block,
    grid: normalizeGridValue(block.grid, fallbackGrid),
    data: {
      heading:
        typeof data.heading === "string"
          ? data.heading
          : "Information Hub",
      subtitle:
        typeof data.subtitle === "string"
          ? data.subtitle
          : "Explore each section below.",
      showHeading: data.showHeading !== false,
      showSubtitle: data.showSubtitle !== false,
      variant:
        data.variant === "tabs" ||
        data.variant === "sidebar" ||
        data.variant === "cards" ||
        data.variant === "accordion"
          ? data.variant
          : "tabs",
      transition:
        data.transition === "none" ||
        data.transition === "fade" ||
        data.transition === "slide_left" ||
        data.transition === "slide_right" ||
        data.transition === "flip" ||
        data.transition === "scale"
          ? data.transition
          : "fade",
      defaultPanelId:
        typeof data.defaultPanelId === "string" &&
        fallbackPanels.some((panel: any) => panel.id === data.defaultPanelId)
          ? data.defaultPanelId
          : fallbackPanels[0]?.id,
      rememberSelection: Boolean(data.rememberSelection),
      autoHeight: data.autoHeight !== false,
      fixedHeight:
        typeof data.fixedHeight === "number" && Number.isFinite(data.fixedHeight)
          ? Math.max(180, Math.min(900, Math.floor(data.fixedHeight)))
          : 420,
      panels: fallbackPanels,
      style: {
        ...createDefaultTextStyle(),
        ...(data.style ?? {}),
      },
headingStyle: {
  ...createDefaultTextStyle(),
  fontSize: 20,
  bold:
    typeof data.headingStyle?.bold === "boolean"
      ? data.headingStyle.bold
      : false,
  ...(data.headingStyle ?? {}),
},
      subtitleStyle: {
        ...createDefaultTextStyle(),
        fontSize: 14,
        color: "#6B7280",
        ...(data.subtitleStyle ?? {}),
      },
      navigationStyle: {
        ...createDefaultTextStyle(),
        fontSize: 14,
        bold: true,
        ...(data.navigationStyle ?? {}),
      },
      panelStyle: {
        ...createDefaultTextStyle(),
        fontSize: 14,
        color: "#374151",
        ...(data.panelStyle ?? {}),
      },
      activeNavigationBackground:
        typeof data.activeNavigationBackground === "string"
          ? data.activeNavigationBackground
          : "#dbeafe",
      activeNavigationColor:
        typeof data.activeNavigationColor === "string"
          ? data.activeNavigationColor
          : "#1d4ed8",
      inactiveNavigationBackground:
        typeof data.inactiveNavigationBackground === "string"
          ? data.inactiveNavigationBackground
          : "#ffffff",
      panelBackground:
        typeof data.panelBackground === "string"
          ? data.panelBackground
          : "#f9fafb",
    },
  };
}

        if (block.type === "timeline") {
      const data = block.data as any;

      return {
        ...block,
        grid: normalizeGridValue(block.grid, fallbackGrid),
        data: {
          heading:
            typeof data.heading === "string" ? data.heading : "Our Journey",
          cardLayout:
            data.cardLayout === "standard" ||
            data.cardLayout === "spotlight" ||
            data.cardLayout === "compact"
              ? data.cardLayout
              : "standard",

          styleVariant:
            data.styleVariant === "classic" ||
            data.styleVariant === "alternating" ||
            data.styleVariant === "horizontal" ||
            data.styleVariant === "journey" ||
            data.styleVariant === "memory"
              ? data.styleVariant
              : "classic",

          entries: Array.isArray(data.entries)
            ? data.entries.map((entry: any) => ({
                id:
                  typeof entry?.id === "string" && entry.id.trim()
                    ? entry.id
                    : makeId("timelineentry"),
                date: typeof entry?.date === "string" ? entry.date : "",
                title: typeof entry?.title === "string" ? entry.title : "",
                subtitle:
                  typeof entry?.subtitle === "string" ? entry.subtitle : "",
                description:
                  typeof entry?.description === "string"
                    ? entry.description
                    : "",
                imageUrl:
                  typeof entry?.imageUrl === "string" ? entry.imageUrl : "",
                icon:
                  typeof entry?.icon === "string"
                    ? entry.icon
                    : "/media-icons/star.svg",
                imageShape:
                  entry?.imageShape === "circle" ||
                  entry?.imageShape === "rounded" ||
                  entry?.imageShape === "square" ||
                  entry?.imageShape === "diamond" ||
                  entry?.imageShape === "hexagon" ||
                  entry?.imageShape === "blob" ||
                  entry?.imageShape === "none"
                    ? entry.imageShape
                    : "circle",
                accentColor:
                  typeof entry?.accentColor === "string"
                    ? entry.accentColor
                    : "#2563EB",
                alignment:
                  entry?.alignment === "auto" ||
                  entry?.alignment === "left" ||
                  entry?.alignment === "right" ||
                  entry?.alignment === "center"
                    ? entry.alignment
                    : "auto",
                animation:
                  entry?.animation === "fade" ||
                  entry?.animation === "slide" ||
                  entry?.animation === "pop" ||
                  entry?.animation === "reveal" ||
                  entry?.animation === "none"
                    ? entry.animation
                    : "fade",
                ctaLabel:
                  typeof entry?.ctaLabel === "string" ? entry.ctaLabel : "",
                ctaUrl:
                  typeof entry?.ctaUrl === "string" ? entry.ctaUrl : "",
              }))
            : [],

          direction:
            data.direction === "ascending" || data.direction === "descending"
              ? data.direction
              : "ascending",

          connectorStyle:
            data.connectorStyle === "solid" ||
            data.connectorStyle === "dashed" ||
            data.connectorStyle === "dotted" ||
            data.connectorStyle === "none"
              ? data.connectorStyle
              : "solid",

          connectorThickness:
            typeof data.connectorThickness === "number" &&
            Number.isFinite(data.connectorThickness)
              ? Math.max(1, Math.min(12, data.connectorThickness))
              : 3,

          lineColor:
            typeof data.lineColor === "string" ? data.lineColor : "#CBD5E1",

          nodeColor:
            typeof data.nodeColor === "string" ? data.nodeColor : "#2563EB",

          cardBackground:
            typeof data.cardBackground === "string"
              ? data.cardBackground
              : "#FFFFFF",

          borderRadius:
            typeof data.borderRadius === "number" &&
            Number.isFinite(data.borderRadius)
              ? Math.max(0, Math.min(48, data.borderRadius))
              : 20,

          shadow: data.shadow !== false,

          spacing:
            typeof data.spacing === "number" && Number.isFinite(data.spacing)
              ? Math.max(0, Math.min(80, data.spacing))
              : 24,

          animateOnScroll: Boolean(data.animateOnScroll),

          mobileMode:
            data.mobileMode === "auto" ||
            data.mobileMode === "vertical" ||
            data.mobileMode === "horizontal"
              ? data.mobileMode
              : "auto",

          titleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 26,
            bold: true,
            align: "center",
            ...(data.titleStyle ?? {}),
          },

          dateStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            bold: true,
            color: "#2563EB",
            ...(data.dateStyle ?? {}),
          },

          entryTitleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 20,
            bold: true,
            ...(data.entryTitleStyle ?? {}),
          },

          subtitleStyle: {
            ...createDefaultTextStyle(),
            fontSize: 14,
            color: "#6B7280",
            ...(data.subtitleStyle ?? {}),
          },

          descriptionStyle: {
            ...createDefaultTextStyle(),
            fontSize: 15,
            color: "#374151",
            ...(data.descriptionStyle ?? {}),
          },
        },
      };
    }

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

if (block.type === "gallery") {
  const data = block.data as any;

  return {
    ...block,
    grid: normalizeGridValue(block.grid, fallbackGrid),
    data: {
      ...block.data,

      columns: Math.max(1, Math.min(12, Number(block.data.columns) || 2)),

      rows:
        typeof block.data.rows === "number" && Number.isFinite(block.data.rows)
          ? Math.max(1, Math.min(12, Math.floor(block.data.rows)))
          : block.data.rows,

      images: Array.isArray(block.data.images)
        ? block.data.images.map((image) => ({
            ...image,
            url:
              typeof image.url === "string" && !image.url.startsWith("data:")
                ? image.url
                : "",
            isEmbeddedDataUrl:
              typeof image.url === "string" && image.url.startsWith("data:"),

            title:
              typeof (image as any).title === "string"
                ? (image as any).title
                : "",

            description:
              typeof (image as any).description === "string"
                ? (image as any).description
                : "",

            metadata:
              typeof (image as any).metadata === "string"
                ? (image as any).metadata
                : "",

            titleStyle: {
              ...createDefaultTextStyle(),
              ...((image as any).titleStyle ?? {}),
            },

            descriptionStyle: {
              ...createDefaultTextStyle(),
              ...((image as any).descriptionStyle ?? {}),
            },

            metadataStyle: {
              ...createDefaultTextStyle(),
              ...((image as any).metadataStyle ?? {}),
            },
          }))
        : [],

      columnGap: Math.max(0, Number(data.columnGap ?? 8)),
      rowGap: Math.max(0, Number(data.rowGap ?? 8)),

      frameThickness: Math.max(0, Number(data.frameThickness ?? 0)),
      frameColor: String(data.frameColor ?? "#ffffff"),

      showTitle: Boolean(data.showTitle),
      showDescription: Boolean(data.showDescription),
      showMetadata: Boolean(data.showMetadata),

      textPlacement: data.textPlacement === "top" ? "top" : "bottom",

      galleryTextTarget:
        data.galleryTextTarget === "description" ||
        data.galleryTextTarget === "metadata"
          ? data.galleryTextTarget
          : "title",

      titleStyle: {
        ...createDefaultTextStyle(),
        fontSize: 14,
        bold: true,
        ...(data.titleStyle ?? {}),
      },

      descriptionStyle: {
        ...createDefaultTextStyle(),
        fontSize: 12,
        ...(data.descriptionStyle ?? {}),
      },

      metadataStyle: {
        ...createDefaultTextStyle(),
        fontSize: 11,
        color: "#6b7280",
        ...(data.metadataStyle ?? {}),
      },

      // legacy only — forced off so old caption UI/display stops appearing
      addCaption: false,
      captionStyle: {
        ...createDefaultTextStyle(),
        ...(data.captionStyle ?? {}),
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

      allowCustomAmount:
        typeof (block.data as any).allowCustomAmount === "boolean"
          ? (block.data as any).allowCustomAmount
          : true,

      customAmountLabel:
        typeof (block.data as any).customAmountLabel === "string"
          ? (block.data as any).customAmountLabel
          : "Custom Amount",

      buttonSpacing:
        typeof (block.data as any).buttonSpacing === "number"
          ? Math.max(0, (block.data as any).buttonSpacing)
          : 8,

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

if (block.type === "enrollment_board") {
  const data = block.data as any;

  return {
    ...block,
    grid: normalizeGridValue(block.grid, fallbackGrid),

    data: {
      ...data,

      showEnrollmentList: data.showEnrollmentList !== false,
      showMetadataField: Boolean(data.showMetadataField),
      showTotalEnrolled: data.showTotalEnrolled !== false,

      metadataLabel:
        typeof data.metadataLabel === "string"
          ? data.metadataLabel
          : "Metadata",

      memberListPosition:
        data.memberListPosition === "profile"
          ? "profile"
          : "standard",

      fieldSectionWidth:
        typeof data.fieldSectionWidth === "number" &&
        Number.isFinite(data.fieldSectionWidth)
          ? Math.max(35, Math.min(70, data.fieldSectionWidth))
          : 55,

      memberTotalLabel:
        typeof data.memberTotalLabel === "string"
          ? data.memberTotalLabel
          : " enrolled",

      linkedProfileImageBlockId:
        typeof data.linkedProfileImageBlockId === "string"
          ? data.linkedProfileImageBlockId
          : "",

      linkedNameLabelBlockId:
        typeof data.linkedNameLabelBlockId === "string"
          ? data.linkedNameLabelBlockId
          : "",

      linkedQuoteLabelBlockId:
        typeof data.linkedQuoteLabelBlockId === "string"
          ? data.linkedQuoteLabelBlockId
          : "",

      linkedGalleryBlockId:
        typeof data.linkedGalleryBlockId === "string"
          ? data.linkedGalleryBlockId
          : "",

      linkedCarouselBlockId:
        typeof data.linkedCarouselBlockId === "string"
          ? data.linkedCarouselBlockId
          : "",

      style: {
        ...createDefaultTextStyle(),
        ...(data.style ?? {}),
      },

      formStyle: {
        ...createDefaultTextStyle(),
        ...(data.formStyle ?? {}),
      },

      inputStyle: {
        ...createDefaultTextStyle(),
        ...(data.inputStyle ?? {}),
      },

      buttonStyle: {
        ...createDefaultTextStyle(),
        ...(data.buttonStyle ?? {}),
      },

      listStyle: {
        ...createDefaultTextStyle(),
        ...(data.listStyle ?? {}),
      },

      cardStyle: {
        ...createDefaultTextStyle(),
        ...(data.cardStyle ?? {}),
      },

      headingStyle: {
        ...createDefaultTextStyle(),
        ...(data.headingStyle ?? {}),
      },

      subtitleStyle: {
        ...createDefaultTextStyle(),
        ...(data.subtitleStyle ?? {}),
      },

      imageLabelStyle: {
        ...createDefaultTextStyle(),
        ...(data.imageLabelStyle ?? {}),
      },

      memberNameStyle: {
        ...createDefaultTextStyle(),
        ...(data.memberNameStyle ?? {}),
      },

      memberQuoteStyle: {
        ...createDefaultTextStyle(),
        ...(data.memberQuoteStyle ?? {}),
      },

      memberTotalStyle: {
        ...createDefaultTextStyle(),
        ...(data.memberTotalStyle ?? {}),
      },
    },
  };
}

if (block.type === "form_field") {
  const data = block.data as any;

  return {
    ...block,
    grid: normalizeGridValue(block.grid, fallbackGrid),
    data: {
      ...block.data,

      label:
        typeof block.data.label === "string"
          ? block.data.label
          : "Input Label",

      placeholder:
        typeof block.data.placeholder === "string"
          ? block.data.placeholder
          : "Enter value...",

      required: Boolean(block.data.required),

      fieldType:
        block.data.fieldType === "text" ||
        block.data.fieldType === "email" ||
        block.data.fieldType === "phone" ||
        block.data.fieldType === "textarea" ||
        block.data.fieldType === "state" ||
        block.data.fieldType === "checkbox_text"
          ? block.data.fieldType
          : "text",

      value:
        typeof block.data.value === "string"
          ? block.data.value
          : "",

      submitButtonText:
        typeof block.data.submitButtonText === "string"
          ? block.data.submitButtonText
          : "Submit",

      linkedButtonId:
        typeof data.linkedButtonId === "string" && data.linkedButtonId.trim()
          ? data.linkedButtonId
          : undefined,

      allowMultipleSelections: Boolean(data.allowMultipleSelections),

      showLabel: block.data.showLabel !== false,
      showPlaceholder: block.data.showPlaceholder !== false,
      showRequired: block.data.showRequired !== false,
      showSubmitButtonText:
        block.data.showSubmitButtonText !== false,

      showRating: Boolean(data.showRating),

      ratingValue:
        typeof data.ratingValue === "number" &&
        Number.isFinite(data.ratingValue)
          ? Math.max(0, Math.min(5, Math.floor(data.ratingValue)))
          : 0,

      ratingColor:
        typeof data.ratingColor === "string" &&
        data.ratingColor.trim()
          ? data.ratingColor
          : "#F59E0B",

      ratingPosition:
        data.ratingPosition === "low" ||
        data.ratingPosition === "high"
          ? data.ratingPosition
          : "high",

      style: {
        ...createDefaultTextStyle(),
        ...(block.data.style ?? {}),
      },

      labelStyle: {
        ...createDefaultTextStyle(),
        ...((block.data as any).labelStyle ?? block.data.style ?? {}),
      },

      inputStyle: {
        ...createDefaultTextStyle(),
        paddingTop: 12,
        paddingRight: 12,
        paddingBottom: 12,
        paddingLeft: 12,
        ...((block.data as any).inputStyle ?? block.data.style ?? {}),
      },

      placeholderStyle: {
        ...createDefaultTextStyle(),
        color: "rgb(186, 186, 186)",
        ...((block.data as any).placeholderStyle ?? {}),
      },
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
  (draft as any).pageLength === "1400" ||
  (draft as any).pageLength === "1600" ||
  (draft as any).pageLength === "1800" ||
  (draft as any).pageLength === "2000" ||
  (draft as any).pageLength === "2400" ||
  (draft as any).pageLength === "2800" ||
  (draft as any).pageLength === "3200" ||
  (draft as any).pageLength === "3600" ||
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