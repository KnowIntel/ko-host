// components\templates\DesignLayoutEditor.tsx
"use client";

import AppModal from "@/components/ui/AppModal";
import { BUILDER_TOOL_GUIDES } from "@/components/templates/builderToolGuides";
import { BLOCK_GUIDES } from "@/components/templates/blockGuideContent";
import PopBalloonCanvasPreview from "@/components/blocks/PopBalloonCanvasPreview";
import { applyImagePatch } from "@/components/builder/formatting/imageFormatting";

/* ------------------------------------ INSPECTOR BLOCK FILES - START ------------------------------------ */
import {
  OptionButtonInspector,
  FormFieldInspector,
  HighlightInspector,
  VisitorCounterInspector,
  DonationInspector,
  ProgressBarInspector,
  BookmarkInspector,
  PollInspector,
  LinkHubInspector,
  PostBoardInspector,
  ChecklistInspector,
  CalendarEventInspector,
  ScheduleAgendaInspector,
  TournamentDisplayInspector,
  MapLocationInspector,
  SpreadsheetInspector,
  FileShareInspector,
  PuzzleInspector,
  SpinWheelInspector,
  EnrollmentBoardInspector,
  SpeedDatingInspector,
  PopBalloonInspector,
  RegistryInspector,
  ListingInspector,
  VideoInspector,
  RichTextInspector,
  LabelInspector,
  ImageInspector,
  IconInspector,
  SummaryInspector,
  GalleryInspector,
  ShapeInspector,
  WaveInspector,
  TextControlsInspector,
  ImageCarouselInspector,
  FaqInspector,
  ContentPanelInspector,
  ThreadInspector,
  FrameInspector,
  RsvpInspector,
  CountdownInspector,
  TimelineInspector,
  AudioInspector,
  CheckoutInspector,
  CartInspector,
  LinksInspector,

} from "@/components/builder/inspector";

/* ------------------------------------ INSPECTOR BLOCK FILES - END ------------------------------------ */


/* ------------------------------------ FORMATTING BLOCK FILES - START ------------------------------------ */
import {
  applyImageCaptionStylePatch,
  isImageCaptionFormattingTarget,
} from "@/components/builder/formatting/imageFormatting";

import {
  applyVideoTextStylePatch,
  getVideoTextStyle,
  type VideoTextTarget,
} from "@/components/builder/formatting/videoFormatting";

import {
  applyGalleryTextStylePatch,
  getGalleryTextStyle,
  type GalleryTextTarget,
} from "@/components/builder/formatting/galleryFormatting";

import {
  applyCarouselTextStylePatch,
  getCarouselTextStyle,
  type CarouselTextTarget,
} from "@/components/builder/formatting/carouselFormatting";

import {
  applyContentPanelStylePatch,
  applyContentPanelTextStylePatch,
  getContentPanelTextStyle,
  type ContentPanelStyleTarget,
  type ContentPanelTextTarget,
} from "@/components/builder/formatting/contentPanelFormatting";

import {
  applyFormFieldStylePatch,
  applyFormFieldTextStylePatch,
  getFormFieldTextStyle,
  type FormFieldStyleTarget,
  type FormFieldTextTarget,
} from "@/components/builder/formatting/formFieldFormatting";
















/* ------------------------------------ FORMATTING BLOCK FILES - END ------------------------------------ */

import { getStoreMeta } from "@/lib/utils/getStoreMeta";
import { uploadImage } from "@/lib/uploadImage";
import { uploadAudio } from "@/lib/uploadAudio";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  moveCanvasItemBackward,
  moveCanvasItemForward,
} from "@/components/builder/canvas/canvasItemTransforms";

import {
  Dancing_Script,
  Pacifico,
  Allura,
  Parisienne,
  Sacramento,
  Playball,
  Satisfy,
  Tangerine,
  Prata,
  Marcellus,
  Bodoni_Moda,
  Cinzel,
  Libre_Baskerville,
  Merriweather,
  Lora,
  Crimson_Text,
} from "next/font/google";


import GridCanvas, {
  type CanvasGridItem,
  getGridCanvasScrollableWidth,
} from "@/components/templates/design-editors/shared/GridCanvas";

import BlockRenderer from "@/components/preview/BlockRenderer";
import RichTextTiptapEditor from "@/components/blocks/RichTextTiptapEditor";

import {
  PAGE_DESCRIPTION_BLOCK_ID,
  PAGE_SUBTEXT_BLOCK_ID,
  PAGE_SUBTITLE_BLOCK_ID,
  PAGE_TITLE_BLOCK_ID,
  createEmptySelection,
  isCanvasBlockSelected,
  selectionFromCanvasBlockId,
} from "@/components/templates/design-editors/shared/EditorSelection";

import type {
  BlockAppearance,
  BuilderBlockType,
  BuilderDraft,
  CarouselImageItem,
  FaqItem,
  GalleryImage,
  LinkItem,
  MicrositeBlock,
  PollOption,
  ShapeType,
  TextStyle,
} from "@/lib/templates/builder";

import {
  addBlockTypeToDraft,
  addShapeBlockToDraft,
  removeBlockFromDraft,
  applyStylePatchToSelection,
  applyAppearancePatchToSelection,
  getSelectionBlockAppearance,
  getSelectionTextStyle,
  readFileAsDataUrl,
  addImageCarouselItem,
  removeImageCarouselItem,
  updateImageCarouselField,
  updateImageCarouselNumericField,
  updateImageCarouselToggle,
  updateImageCarouselItemField,
} from "@/components/templates/design-editors/shared/editorUtils";

import {
  normalizeCanvasItems,
  moveCanvasItemToCell,
  resizeCanvasItem,
  bringCanvasItemToFront,
  sendCanvasItemToBack,
} from "@/components/builder/canvas/canvasItemTransforms";

import {
  buildPageCanvasItems,
  applyCanvasItemsToDraft,
} from "@/components/builder/canvas/pageCanvasBuilder";

import {
  getMetadata,
  getResolvedPageColor,
  getCanvasInnerBackgroundStyle,
} from "@/components/builder/metadata/metadataResolver";

import {
  updateFormField,
  updateFormFieldRequired,
} from "@/components/builder/mutations/contentMutations";

import { getCanvasShellClass } from "@/components/builder/ui/editorPanelStyles";
import ImageUploadDropzone from "@/components/builder/ImageUploadDropzone";
import { deleteVideo, uploadVideo } from "@/lib/uploadVideo";

type Props = {
  templateKey: string;
  designKey: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
  onSaveDraft?: (draft: BuilderDraft) => void | Promise<void>;
  publishHref?: string;
  publishLabel?: string;
  onPublishClick?: () => void;
  builderCapacityContent?: React.ReactNode;
  onOpenAddPage?: () => void;
  onDuplicateActivePage?: () => void;
  saveState?: "idle" | "saving" | "saved" | "error" | "signin-required";
  saveMessage?: string;
  microsite?: {
    is_published?: boolean;
    is_active?: boolean;
    slug?: string;
  };
onRemoveActivePage?: () => void;
onRenameActivePage?: () => void;
pages?: Array<{
  id: string;
  slug: string;
  title: string | null;
  display_order?: number | null;
}>;
activePageId?: string | null;
activePageSlug?: string;
micrositeSlug?: string;
onSelectPage?: (pageId: string) => void;
onReorderPages?: (nextPages: Array<{
  id: string;
  slug: string;
  title: string | null;
  display_order?: number | null;
}>) => void | Promise<void>;
};

type PageLengthOption =
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

type DraftPageVisibility = Partial<{
  title: boolean;
  subtitle: boolean;
  subtext: boolean;
  description: boolean;
}>;


type DraftPageElementLayout = {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
  zIndex?: number;
};

type DraftWithPageExtras = BuilderDraft & {
  pageColor?: string;
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
  pageVisibility?: DraftPageVisibility;
  pageElements?: Partial<{
    title: DraftPageElementLayout;
    subtitle: DraftPageElementLayout;
    subtext: DraftPageElementLayout;
    description: DraftPageElementLayout;
  }>;
  pageLength?: PageLengthOption;
  pageBlockAppearance?: Partial<
    Record<
      "title" | "subtitle" | "subtext" | "description",
      {
        backgroundColor?: string;
      }
    >
  >;
};

type AppearancePatch = Partial<
  Pick<
    BlockAppearance,
    | "backgroundColor"
    | "borderColor"
    | "borderWidth"
    | "borderRadius"
    | "textureEnabled"
    | "textureImageUrl"
    | "textureScale"
    | "texturePositionX"
    | "texturePositionY"
    | "backgroundOpacity"
  >
>;

type BottomCategory =
  | "Text"
  | "Media"
  | "Icons"
  | "Layout"
  | "Forms"
  | "Exchange"
  | "Utilities"
  | "Data & Metrics"
  | "Scheduling"
  | "Premium";

type PageBlockType = "title" | "subtitle" | "tagline" | "description";

type ToolDropPayload =
  | {
      kind: "block";
      type: BuilderBlockType;
      label?: string;
      iconName?: string;
      icon?: string;
      iconUrl?: string;
    }
  | { kind: "shape"; type: ShapeType }
  | { kind: "page"; type: PageBlockType };

type SelectedContext =
  | { kind: "none"; label: "Nothing selected" | "Multiple blocks selected" }
  | { kind: "pageText"; blockId: string; label: string }
  | { kind: "label"; blockId: string; label: string }
  | { kind: "textFx"; blockId: string; label: string }
  | { kind: "cta"; blockId: string; label: string }
  | { kind: "image"; blockId: string; label: string }
  | { kind: "imageCarousel"; blockId: string; label: string }
  | { kind: "shape"; blockId: string; label: string }
  | { kind: "otherBlock"; blockId: string; blockType: string; label: string };

type InspectorFocusTarget =
  | null
  | { type: "poll-question"; blockId: string }
  | { type: "poll-option"; blockId: string; optionId: string }
  | { type: "rsvp-heading"; blockId: string }
  | { type: "countdown-heading"; blockId: string }
  | { type: "countdown-target"; blockId: string }
  | { type: "countdown-completed"; blockId: string }
  | { type: "faq-question"; blockId: string; itemId: string }
  | { type: "faq-answer"; blockId: string; itemId: string }
  | { type: "thread-subject"; blockId: string }
  | { type: "links-heading"; blockId: string; itemId?: string }
  | { type: "links-item-label"; blockId: string; itemId: string }
  | { type: "links-item-url"; blockId: string; itemId: string }
  | { type: "carousel-heading"; blockId: string }
  | { type: "carousel-item-title"; blockId: string; itemId: string }
  | { type: "carousel-item-subtitle"; blockId: string; itemId: string }
  | { type: "carousel-item-href"; blockId: string; itemId: string };

const CATEGORY_ORDER: BottomCategory[] = [
  "Text",
  "Media",
  "Icons",
  "Layout",
  "Forms",
  "Exchange",
  "Utilities",
  "Data & Metrics",
  "Scheduling",
  "Premium",
];

const CATEGORY_BUTTONS: Record<
  BottomCategory,
  Array<
    | { kind: "page"; label: string; type: PageBlockType }
    | { kind: "shape"; label: string; type: ShapeType }
    | {
        kind: "block";
        label: string;
        type: BuilderBlockType;
        iconName?: string;
        icon?: string;
      }
    | { kind: "block"; label: "Input Field"; type: "form_field"; iconName?: string; icon?: string }
  >
> = {
  Text: [
{ kind: "page", label: "Title", type: "title" },
{ kind: "page", label: "Subtitle", type: "subtitle" },
{ kind: "block", label: "Label", type: "label" },
{ kind: "block", label: "TextFX", type: "text_fx" },
{ kind: "block", label: "Rich Text", type: "rich_text" },
{ kind: "block", label: "Spreadsheet", type: "spreadsheet" },
  ],
  Media: [
    { kind: "block", label: "Image", type: "image" },
    { kind: "block", label: "Video", type: "video" },
    { kind: "block", label: "Audio", type: "audio" },
    { kind: "block", label: "Gallery", type: "gallery" },
    { kind: "block", label: "Carousel", type: "image_carousel" },
  ],
  Icons: [
    { kind: "block", label: "Circle One", type: "icon", iconName: "circle-one" },
    { kind: "block", label: "Circle Two", type: "icon", iconName: "circle-two" },
    { kind: "block", label: "Circle Three", type: "icon", iconName: "circle-three" },
    { kind: "block", label: "Circle Four", type: "icon", iconName: "circle-four" },
    { kind: "block", label: "Circle Five", type: "icon", iconName: "circle-five" },
    { kind: "block", label: "Circle Six", type: "icon", iconName: "circle-six" },
    { kind: "block", label: "Circle Seven", type: "icon", iconName: "circle-seven" },
    { kind: "block", label: "Circle Eight", type: "icon", iconName: "circle-eight" },
    { kind: "block", label: "Circle Nine", type: "icon", iconName: "circle-nine" },
    { kind: "block", label: "Circle Ten", type: "icon", iconName: "circle-ten" },
    { kind: "block", label: "Arrow Up Thick", type: "icon", iconName: "arrow-up-thick" },
    { kind: "block", label: "Arrow Down Thick", type: "icon", iconName: "arrow-down-thick" },
    { kind: "block", label: "Arrow Left Thick", type: "icon", iconName: "arrow-left-thick" },
    { kind: "block", label: "Arrow Right Thick", type: "icon", iconName: "arrow-right-thick" },
    { kind: "block", label: "Arrow Up Thin", type: "icon", iconName: "arrow-up-thin" },
    { kind: "block", label: "Arrow Down Thin", type: "icon", iconName: "arrow-down-thin" },
    { kind: "block", label: "Arrow Left Thin", type: "icon", iconName: "arrow-left-thin" },
    { kind: "block", label: "Arrow Right Thin", type: "icon", iconName: "arrow-right-thin" },
    { kind: "block", label: "Arrow Rotate", type: "icon", iconName: "arrow-rotate" },
    { kind: "block", label: "Chevron Left", type: "icon", iconName: "chevron-left" },
    { kind: "block", label: "Chevron Right", type: "icon", iconName: "chevron-right" },
    { kind: "block", label: "Add Plus", type: "icon", iconName: "add-plus" },
    { kind: "block", label: "Subtract Minus", type: "icon", iconName: "subtract-minus" },
    { kind: "block", label: "Information Circle", type: "icon", iconName: "information-circle" },
    { kind: "block", label: "Exclamation Round", type: "icon", iconName: "exclamation-round" },
    { kind: "block", label: "Question Mark Circle", type: "icon", iconName: "question-mark-circle" },
    { kind: "block", label: "Question Mark", type: "icon", iconName: "question-mark" },
    { kind: "block", label: "Caution Circle", type: "icon", iconName: "caution-circle" },
    { kind: "block", label: "Paper Airplane", type: "icon", iconName: "paper-airplane" },
    // { kind: "block", label: "Shield", type: "icon", iconName: "shield" },
    { kind: "block", label: "Graduate Cap", type: "icon", iconName: "graduate-cap" },
    { kind: "block", label: "Open Book", type: "icon", iconName: "open-book" },
    { kind: "block", label: "Open Book Empty", type: "icon", iconName: "open-book-empty" },
    { kind: "block", label: "Closed Book", type: "icon", iconName: "closed-book" },
    // { kind: "block", label: "Fire", type: "icon", iconName: "fire" },
    { kind: "block", label: "Dog Paw", type: "icon", iconName: "dog-paw" },
    { kind: "block", label: "Dinosaur Rex", type: "icon", iconName: "dinosaur-rex" },
    { kind: "block", label: "Gable Panel", type: "icon", iconName: "gable-panel" },
    { kind: "block", label: "City", type: "icon", iconName: "city" },
    { kind: "block", label: "Gym Dumbbell", type: "icon", iconName: "gym-dumbbell" },
    { kind: "block", label: "Download", type: "icon", iconName: "download" },
    { kind: "block", label: "External Link", type: "icon", iconName: "external-link" },
    { kind: "block", label: "Furniture Couch", type: "icon", iconName: "furniture-couch" },
    { kind: "block", label: "Refrigerator", type: "icon", iconName: "refrigerator" },
    { kind: "block", label: "Trash Can Waste", type: "icon", iconName: "trash-can-waste" },
    { kind: "block", label: "Box Junk", type: "icon", iconName: "box-junk" },
    { kind: "block", label: "House", type: "icon", iconName: "house" },
    { kind: "block", label: "Stars Five", type: "icon", iconName: "stars-five" },
    { kind: "block", label: "Star", type: "icon", iconName: "star" },
    { kind: "block", label: "Heart", type: "icon", iconName: "heart" },
    { kind: "block", label: "Heart Outline", type: "icon", iconName: "heart-outline" },
    { kind: "block", label: "Square Outline", type: "icon", iconName: "square-outline" },
    { kind: "block", label: "Circle", type: "icon", iconName: "circle" },
    { kind: "block", label: "Open Circle", type: "icon", iconName: "open-circle" },
    { kind: "block", label: "Circle Target", type: "icon", iconName: "circle-target" },
    { kind: "block", label: "Wellness Recovery", type: "icon", iconName: "wellness-recovery" },
    { kind: "block", label: "Nutrition", type: "icon", iconName: "nutrition" },
    // { kind: "block", label: "Mobility", type: "icon", iconName: "mobility" },
    { kind: "block", label: "Balloon", type: "icon", iconName: "balloon" },
    { kind: "block", label: "Plant Root", type: "icon", iconName: "plant-root" },
    { kind: "block", label: "Trees", type: "icon", iconName: "trees" },
    { kind: "block", label: "Dinner Cap", type: "icon", iconName: "dinner-cap" },
    { kind: "block", label: "Formal Shirt", type: "icon", iconName: "formal-shirt" },
    { kind: "block", label: "Formal Dress", type: "icon", iconName: "formal-dress" },
    { kind: "block", label: "Contractor Worker", type: "icon", iconName: "contractor-worker" },
    { kind: "block", label: "Hanger", type: "icon", iconName: "hanger" },
    { kind: "block", label: "Stock Chart Up", type: "icon", iconName: "stock-chart-up" },
    { kind: "block", label: "Stock Chart Down", type: "icon", iconName: "stock-chart-down" },
    { kind: "block", label: "Party Confetti", type: "icon", iconName: "party-confetti" },
    { kind: "block", label: "Four Square", type: "icon", iconName: "four-square" },
    { kind: "block", label: "Number Blocks", type: "icon", iconName: "number-blocks" },
    { kind: "block", label: "Megaphone Speaker", type: "icon", iconName: "megaphone-speaker" },
    { kind: "block", label: "Lock Locked", type: "icon", iconName: "lock-locked" },
    { kind: "block", label: "Lock Unlock", type: "icon", iconName: "lock_unlock" },
    { kind: "block", label: "Gift Box", type: "icon", iconName: "gift-box" },
    { kind: "block", label: "Folder Hierarchy", type: "icon", iconName: "folder-hierarchy" },
    { kind: "block", label: "Export Share", type: "icon", iconName: "export-share" },
    { kind: "block", label: "Download Folder", type: "icon", iconName: "download-folder" },
    { kind: "block", label: "Tools", type: "icon", iconName: "tools" },
    { kind: "block", label: "Eye Glasses", type: "icon", iconName: "eye-glasses" },
    { kind: "block", label: "Flag", type: "icon", iconName: "flag" },
    { kind: "block", label: "Fork Knife Plate", type: "icon", iconName: "fork-knife-plate" },
    { kind: "block", label: "Glass Drink", type: "icon", iconName: "glass-drink" },
    { kind: "block", label: "Headphones", type: "icon", iconName: "headphones" },
    { kind: "block", label: "Help Assistant", type: "icon", iconName: "help-assistant" },
    { kind: "block", label: "Headset Support", type: "icon", iconName: "headset-support" },
    { kind: "block", label: "Recycle", type: "icon", iconName: "recycle" },
    { kind: "block", label: "Barrier Construction", type: "icon", iconName: "barrier-construction" },
    { kind: "block", label: "Champagne Flutes", type: "icon", iconName: "champagne-flutes" },
    { kind: "block", label: "Birthday Cake", type: "icon", iconName: "birthday-cake" },
    { kind: "block", label: "Baby", type: "icon", iconName: "baby" },
    { kind: "block", label: "Music Note Treble Clef", type: "icon", iconName: "music-note-treble-clef" },
    { kind: "block", label: "Music Note", type: "icon", iconName: "music-note" },
    { kind: "block", label: "Notebook Pen", type: "icon", iconName: "notebook-pen" },
    { kind: "block", label: "Play Triangle Solid", type: "icon", iconName: "play-triangle-solid" },
    { kind: "block", label: "Play Triangle Circle", type: "icon", iconName: "play-triangle-circle" },
    { kind: "block", label: "Pause Circle", type: "icon", iconName: "pause-circle" },
    { kind: "block", label: "Eject", type: "icon", iconName: "eject" },
    { kind: "block", label: "Pin Tac", type: "icon", iconName: "pin-tac" },
    { kind: "block", label: "Power On", type: "icon", iconName: "power-on" },
    { kind: "block", label: "Service Tower Signal", type: "icon", iconName: "service-tower-signal" },
    { kind: "block", label: "Trophy", type: "icon", iconName: "trophy" },
    { kind: "block", label: "Medal Check", type: "icon", iconName: "medal-check" },
    { kind: "block", label: "Credit Card", type: "icon", iconName: "credit-card" },
    { kind: "block", label: "Card Spade", type: "icon", iconName: "card-spade" },
    { kind: "block", label: "Card Heart", type: "icon", iconName: "card-heart" },
    { kind: "block", label: "Card Club", type: "icon", iconName: "card-club" },
    { kind: "block", label: "Card Diamond", type: "icon", iconName: "card-diamond" },
    { kind: "block", label: "Archive Box", type: "icon", iconName: "archive-box" },
    { kind: "block", label: "Alphabet Blocks", type: "icon", iconName: "alphabet-blocks" },
    { kind: "block", label: "Magnifying Glass Zoom In", type: "icon", iconName: "magnifying-glass-zoom-in" },
    { kind: "block", label: "Magnifying Glass Zoom Out", type: "icon", iconName: "magnifying-glass-zoom-out" },
    { kind: "block", label: "Magnifying Glass", type: "icon", iconName: "magnifying-glass" },
    { kind: "block", label: "Share", type: "icon", iconName: "share" },
    { kind: "block", label: "Hour Glass Empty", type: "icon", iconName: "hour-glass-empty" },
    { kind: "block", label: "Hour Glass Full", type: "icon", iconName: "hour-glass-full" },
    { kind: "block", label: "Hour Glass Half", type: "icon", iconName: "hour-glass-half" },
    { kind: "block", label: "Clock", type: "icon", iconName: "clock" },
    { kind: "block", label: "Clock Outline", type: "icon", iconName: "clock-outline" },
    { kind: "block", label: "Cross Cancel", type: "icon", iconName: "cross-cancel" },
    { kind: "block", label: "Ban Sign", type: "icon", iconName: "ban-sign" },
    { kind: "block", label: "Wrong Files", type: "icon", iconName: "wrong-files" },
    { kind: "block", label: "More Option", type: "icon", iconName: "more-option" },
    { kind: "block", label: "Settings Gears", type: "icon", iconName: "settings-gears" },
    { kind: "block", label: "Tag Price", type: "icon", iconName: "tag-price" },
    { kind: "block", label: "Mining Dig", type: "icon", iconName: "mining-dig" },
    { kind: "block", label: "Dollar Sign", type: "icon", iconName: "dollar-sign" },
    { kind: "block", label: "Dollar Sign Circle", type: "icon", iconName: "dollar-sign-circle" },
    { kind: "block", label: "Check Square", type: "icon", iconName: "check-square" },
    { kind: "block", label: "Check", type: "icon", iconName: "check" },
    { kind: "block", label: "Check Circle", type: "icon", iconName: "check-circle" },
    { kind: "block", label: "Check Circle Solid", type: "icon", iconName: "check-circle-solid" },
    { kind: "block", label: "Shield Check Plain", type: "icon", iconName: "shield-check-plain" },
    { kind: "block", label: "Shield Check Styled", type: "icon", iconName: "shield-check-styled" },
    { kind: "block", label: "Shield Lock", type: "icon", iconName: "shield-lock" },
    { kind: "block", label: "Open Door", type: "icon", iconName: "open-door" },
    { kind: "block", label: "Envelope", type: "icon", iconName: "envelope" },
    { kind: "block", label: "Person", type: "icon", iconName: "person" },
    { kind: "block", label: "People", type: "icon", iconName: "people" },
    { kind: "block", label: "People Group", type: "icon", iconName: "people-group" },
    { kind: "block", label: "Camera", type: "icon", iconName: "camera" },
    { kind: "block", label: "Calendar", type: "icon", iconName: "calendar" },
    { kind: "block", label: "Calendar Full", type: "icon", iconName: "calendar-full" },
    { kind: "block", label: "Transmission Manual", type: "icon", iconName: "transmission-manual" },
    { kind: "block", label: "Transmission Automatic", type: "icon", iconName: "transmission-automatic" },
    { kind: "block", label: "Tire", type: "icon", iconName: "tire" },
    { kind: "block", label: "Seat", type: "icon", iconName: "seat" },
    { kind: "block", label: "Odometer", type: "icon", iconName: "odometer" },
    { kind: "block", label: "Speedometer", type: "icon", iconName: "speedometer" },
    { kind: "block", label: "Keys", type: "icon", iconName: "keys" },
    { kind: "block", label: "Key", type: "icon", iconName: "key" },
    { kind: "block", label: "Engine", type: "icon", iconName: "engine" },
    { kind: "block", label: "Electric Power", type: "icon", iconName: "electric-power" },
    { kind: "block", label: "Dummy", type: "icon", iconName: "dummy" },
    { kind: "block", label: "Drive Type", type: "icon", iconName: "drive-type" },
    { kind: "block", label: "Car Side", type: "icon", iconName: "car-side" },
    { kind: "block", label: "Car Fuel", type: "icon", iconName: "car-fuel" },
    { kind: "block", label: "Car Front", type: "icon", iconName: "car-front" },
    { kind: "block", label: "Truck Haul", type: "icon", iconName: "truck-haul" },
    { kind: "block", label: "Car Battery", type: "icon", iconName: "car-battery" },
    { kind: "block", label: "Battery", type: "icon", iconName: "battery" },
    { kind: "block", label: "Barcode", type: "icon", iconName: "barcode" },
    { kind: "block", label: "Airplane", type: "icon", iconName: "airplane" },
    { kind: "block", label: "Accident", type: "icon", iconName: "accident" },
    // { kind: "block", label: "Globe", type: "icon", iconName: "globe" },
    { kind: "block", label: "Globe Earth", type: "icon", iconName: "globe-earth" },
    { kind: "block", label: "Message Thread", type: "icon", iconName: "message-thread" },
    { kind: "block", label: "Message", type: "icon", iconName: "message" },
    { kind: "block", label: "Inbox", type: "icon", iconName: "inbox" },
    { kind: "block", label: "Location Pin", type: "icon", iconName: "location-pin" },
    { kind: "block", label: "Location Pin Outline", type: "icon", iconName: "location-pin-outline" },
    { kind: "block", label: "Location Pin Alt", type: "icon", iconName: "location-pin-alt" },
    { kind: "block", label: "Video Camera", type: "icon", iconName: "video-camera" },
    { kind: "block", label: "Training Presentation", type: "icon", iconName: "training-presentation" },
    // { kind: "block", label: "Jagged Line", type: "icon", iconName: "jagged-line" },
    { kind: "block", label: "Phone", type: "icon", iconName: "phone" },
    { kind: "block", label: "Shopping Cart", type: "icon", iconName: "shopping-cart" },
    { kind: "block", label: "Open Quote", type: "icon", iconName: "open-quote" },
    { kind: "block", label: "Close Quote", type: "icon", iconName: "close-quote" },
    { kind: "block", label: "VIP Lanyard", type: "icon", iconName: "vip-lanyard" },
    { kind: "block", label: "Fireworks Festival", type: "icon", iconName: "fireworks-festival" },
    { kind: "block", label: "Bomb Explosion", type: "icon", iconName: "bomb-explosion" },
    { kind: "block", label: "Bomb Grenade", type: "icon", iconName: "bomb-grenade" },
    { kind: "block", label: "Bomb", type: "icon", iconName: "bomb" },
    { kind: "block", label: "Enter Return", type: "icon", iconName: "enter-return" },
    { kind: "block", label: "Hand Point Left", type: "icon", iconName: "hand-point-left" },
    { kind: "block", label: "Hand Point Right", type: "icon", iconName: "hand-point-right" },
    { kind: "block", label: "Thumbs Down Outline", type: "icon", iconName: "thumbs-down-outline" },
    { kind: "block", label: "Thumbs Down Solid", type: "icon", iconName: "thumbs-down-solid" },
    { kind: "block", label: "Thumbs Up Outline", type: "icon", iconName: "thumbs-up-outline" },
    { kind: "block", label: "Thumbs Up Solid", type: "icon", iconName: "thumbs-up-solid" },
    { kind: "block", label: "Fire Flame", type: "icon", iconName: "fire-flame" },



    { kind: "block", label: "Photo Placeholder", type: "icon", iconName: "photo-placeholder" },
  ],
  Layout: [
    { kind: "shape", label: "Rectangle", type: "rectangle" },
    { kind: "shape", label: "Circle", type: "circle" },
    { kind: "shape", label: "Line", type: "line" },
    // { kind: "block", label: "Wave", type: "wave" },
    { kind: "block", label: "Frame", type: "frame" },
    { kind: "block", label: "Content Panel", type: "content_panel"},
    // { kind: "block", label: "Spacer", type: "padding" },
  ],
Forms: [
  { kind: "block", label: "Input Field", type: "form_field" },
  { kind: "block", label: "Option Button", type: "option_button" },
  { kind: "block", label: "Poll", type: "poll" },
  { kind: "block", label: "RSVP", type: "rsvp" },
  { kind: "block", label: "Enrollment Board", type: "enrollment_board" },
  { kind: "block", label: "FAQ", type: "faq" },
],
Exchange: [
  { kind: "block", label: "Thread", type: "thread" },
  {
    kind: "block",
    label: "Post Board",
    type: "post_board",
    iconName: "message-thread",
  },
  { kind: "block", label: "File Share", type: "file_share" },
],
Utilities: [
  { kind: "block", label: "Button", type: "cta" },
  { kind: "block", label: "Link", type: "links" },
  { kind: "block", label: "Link Hub", type: "link_hub" },
  { kind: "block", label: "Bookmark", type: "bookmark" },
],
  "Data & Metrics": [
    { kind: "block", label: "Highlight", type: "highlight" },
    { kind: "block", label: "Summary", type: "summary" },
    { kind: "block", label: "Visitor Counter", type: "visitor_counter" },
    { kind: "block", label: "Progress Bar", type: "progress_bar" },
  ],
Scheduling: [
  { kind: "block", label: "Countdown", type: "countdown" },
  {
    kind: "block",
    label: "Story Timeline",
    type: "timeline",
    iconName: "timeline",
  },
  {
    kind: "block",
    label: "Tournament Display",
    type: "tournament_display",
    iconName: "scheduleAgenda",
  },
  { kind: "block", label: "Checklist", type: "checklist" },
  { kind: "block", label: "Schedule / Agenda", type: "schedule_agenda" },
{
  kind: "block",
  label: "Calendar Event",
  type: "calendar_event",
  iconName: "calendar-full",
},
  { kind: "block", label: "Map / Location", type: "map_location" },
],
Premium: [
  { kind: "block", label: "Registry", type: "registry" },
  // { kind: "block", label: "Speed Dating", type: "speed_dating" },
  // { kind: "block", label: "Pop the Balloon", type: "pop_balloon" },
  { kind: "block", label: "Puzzle", type: "puzzle" },
  { kind: "block", label: "Spin Wheel", type: "spin_wheel" },
  { kind: "block", label: "Donation", type: "donation" },
  { kind: "block", label: "Listing", type: "listing" },
  { kind: "block", label: "Checkout", type: "checkout" },
  { kind: "block", label: "Cart", type: "cart" },
],
};

const TOOL_DESCRIPTIONS: Record<string, string> = {
  Title: "Large headline text for pages",
  Subtitle: "Supporting text under main titles",
  Label: "Small text label or note",
  TextFX: "Stylized animated text effects",
  "Rich Text": "Formatted paragraph text block",

  Image: "Single image with optional caption",
  Video: "Embedded video media block",
  Audio: "Upload and play audio",
  Gallery: "Multiple images in grid layout",
  Carousel: "Swipeable image carousel display",

  Rectangle: "Basic rectangular shape layer",
  Circle: "Basic circular shape layer",
  Line: "Straight divider or accent line",
  // Wave: "Curvy decorative divider line",
  Frame: "Canvas-only capture boundary",
  Spacer: "Adds empty vertical spacing",

  "Input Field": "Collect simple user text input",
  "Option Button": "Selectable radio, toggle, button, or dropdown choices",
  Poll: "Let visitors vote on options",
  RSVP: "Collect event attendance responses",
  "Enrollment Board":
    "Public sign-up, member roster, supporter wall, or enrollment list",
  FAQ: "Expandable questions and answers",
  
  Thread: "Public discussion message thread",
  "Post Board": "Owner announcements with likes and discussion links",
  "File Share": "Upload and share visitor files",

  Bookmark: "Jump point anchor for page navigation",
  Button: "Clickable call-to-action button",
  Link: "Singular or stack of important links",
  "Link Hub": "Social and web link collection",

  Highlight: "Feature stat or key callout",
  Summary: "Display selected input and option values in a clean summary list",
  "Progress Bar": "Visual progress toward a goal",
  Spreadsheet: "Excel-like editable table block",

  Countdown: "Timer counting to an event",
  Checklist: "Trackable list of tasks",
  "Schedule / Agenda": "Timed event schedule list",
  "Map / Location": "Location details with map info",

  Puzzle: "Drag-and-drop image puzzle game",
  "Spin Wheel": "Interactive prize wheel mini-game",
  Registry: "Gift or item registry list",
  "Pop the Balloon": "Interactive elimination game experience",
  Donation: "Collect support or contributions",
  Listing: "Showcase item with details",
  Checkout: "Sell single product or service",
  Cart: "Shopping cart purchase flow",
};

const MIN_CANVAS_ZOOM = 50;
const MAX_CANVAS_ZOOM = 200;
const CANVAS_ZOOM_STEP = 10;
const PREVIEW_MESSAGE_TYPE = "ko-host-preview-draft";
const PREVIEW_READY_MESSAGE_TYPE = "ko-host-preview-ready";
const PREVIEW_RECEIVED_MESSAGE_TYPE = "ko-host-preview-received";
function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const FONT_FAMILY_OPTIONS = [
  "inherit",
  "Abril Fatface",
  "Advent Pro",
  "Alfa Slab One",
  "Allura",
  "Amatic SC",
  "Anton",
  "Architects Daughter",
  "Arial",
  "Bangers",
  "Barlow",
  "Bebas Neue",
  "Black Ops One",
  "Bodoni Moda",
  "Bungee",
  "Bungee Shade",
  "Caveat",
  "Chewy",
  "Chelsea Market",
  "Cinzel",
  "Cormorant Garamond",
  "Courier New",
  "Courier Prime",
  "Creepster",
  "Crimson Text",
  "Dancing Script",
  "DM Sans",
  "Exo 2",
  "Faster One",
  "Georgia",
  "Gloria Hallelujah",
  "Great Vibes",
  "Grenze Gotisch",
  "Handwritten",
  "Helvetica",
  "Indie Flower",
  "Inter",
  "Josefin Slab",
  "Libre Baskerville",
  "Lora",
  "Luckiest Guy",
  "Marcellus",
  "Merriweather",
  "Modern UI",
  "Montserrat",
  "Montserrat SemiBold",
  "Open Sans",
  "Orbitron",
  "Oswald",
  "Pacifico",
  "Parisienne",
  "Patrick Hand",
  "Permanent Marker",
  "Playball",
  "Playfair Display",
  "Poiret One",
  "Poppins",
  "Prata",
  "Rajdhani",
  "Righteous",
  "Rock Salt",
  "Sacramento",
  "Saira Stencil",
  "Satisfy",
  "Six Caps",
  "Smooch Sans",
  "Source Sans Pro",
  "Special Elite",
  "Style Script",
  "system-ui",
  "Tangerine",
  "Teko",
  "Times New Roman",
  "Titan One",
  "Trebuchet MS",
  "Typewriter",
  "Verdana",
  "Wallpoet",
] as const;


const FONT_FAMILY_MAP: Record<string, string> = {
  // Core
  Inter: 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
  "DM Sans":
    'var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif',
  Poppins:
    'var(--font-poppins), Poppins, ui-sans-serif, system-ui, sans-serif',

  "Playfair Display":
    'var(--font-playfair-display), "Playfair Display", ui-serif, Georgia, serif',
  "Cormorant Garamond":
    'var(--font-cormorant), "Cormorant Garamond", ui-serif, Georgia, serif',
  "Great Vibes": 'var(--font-great-vibes), "Great Vibes", cursive',

  // Script
  "Dancing Script":
    'var(--font-dancing-script), "Dancing Script", cursive',
  Pacifico: 'var(--font-pacifico), Pacifico, cursive',
  Allura: 'var(--font-allura), Allura, cursive',
  Parisienne: 'var(--font-parisienne), Parisienne, cursive',
  Sacramento: 'var(--font-sacramento), Sacramento, cursive',
  Playball: 'var(--font-playball), Playball, cursive',
  Satisfy: 'var(--font-satisfy), Satisfy, cursive',
  Tangerine: 'var(--font-tangerine), Tangerine, cursive',

  // Serif
  Prata: 'var(--font-prata), Prata, ui-serif, Georgia, serif',
  Marcellus: 'var(--font-marcellus), Marcellus, ui-serif, Georgia, serif',
  "Bodoni Moda":
    'var(--font-bodoni-moda), "Bodoni Moda", ui-serif, Georgia, serif',
  Cinzel: 'var(--font-cinzel), Cinzel, ui-serif, Georgia, serif',
  "Libre Baskerville":
    'var(--font-libre-baskerville), "Libre Baskerville", ui-serif, Georgia, serif',
  Merriweather:
    'var(--font-merriweather), Merriweather, ui-serif, Georgia, serif',
  Lora: 'var(--font-lora), Lora, ui-serif, Georgia, serif',
  "Crimson Text":
    'var(--font-crimson-text), "Crimson Text", ui-serif, Georgia, serif',

  // Display
  Anton: 'var(--font-anton), Anton, sans-serif',
  Bangers: 'var(--font-bangers), Bangers, cursive',
  Orbitron: 'var(--font-orbitron), Orbitron, sans-serif',
  Righteous: 'var(--font-righteous), Righteous, cursive',
  "Alfa Slab One": 'var(--font-alfa-slab-one), "Alfa Slab One", serif',
  "Permanent Marker":
    'var(--font-permanent-marker), "Permanent Marker", cursive',
  Caveat: 'var(--font-caveat), Caveat, cursive',
  "Indie Flower": 'var(--font-indie-flower), "Indie Flower", cursive',
  "Exo 2": 'var(--font-exo-2), "Exo 2", sans-serif',
  Rajdhani: 'var(--font-rajdhani), Rajdhani, sans-serif',
  Teko: 'var(--font-teko), Teko, sans-serif',
  "Abril Fatface": 'var(--font-abril-fatface), "Abril Fatface", serif',
  "Bebas Neue": 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  "Special Elite": 'var(--font-special-elite), "Special Elite", monospace',

  // System
  Arial: "Arial, Helvetica, sans-serif",
  Helvetica: "Helvetica, Arial, sans-serif",
  Georgia: "Georgia, serif",
  "Times New Roman": '"Times New Roman", Times, serif',
  "Trebuchet MS": '"Trebuchet MS", sans-serif',
  Verdana: "Verdana, sans-serif",
  "Courier New": '"Courier New", monospace',
  "system-ui": "system-ui, sans-serif",

  "Architects Daughter":
  'var(--font-architects-daughter), "Architects Daughter", cursive',
Bungee: 'var(--font-bungee), Bungee, display, sans-serif',
"Courier Prime":
  'var(--font-courier-prime), "Courier Prime", "Courier New", monospace',
"Gloria Hallelujah":
  'var(--font-gloria-hallelujah), "Gloria Hallelujah", cursive',
Handwritten:
  'var(--font-patrick-hand), "Patrick Hand", var(--font-architects-daughter), "Architects Daughter", var(--font-gloria-hallelujah), "Gloria Hallelujah", var(--font-caveat), Caveat, cursive',
"Luckiest Guy": 'var(--font-luckiest-guy), "Luckiest Guy", display, sans-serif',
"Modern UI":
  'var(--font-open-sans), "Open Sans", var(--font-source-sans-3), "Source Sans Pro", "Source Sans 3", ui-sans-serif, system-ui, sans-serif',
"Montserrat SemiBold":
  'var(--font-montserrat), Montserrat, ui-sans-serif, system-ui, sans-serif',
"Open Sans":
  'var(--font-open-sans), "Open Sans", ui-sans-serif, system-ui, sans-serif',
Oswald: 'var(--font-oswald), Oswald, ui-sans-serif, system-ui, sans-serif',
"Patrick Hand": 'var(--font-patrick-hand), "Patrick Hand", cursive',
"Source Sans Pro":
  'var(--font-source-sans-3), "Source Sans Pro", "Source Sans 3", ui-sans-serif, system-ui, sans-serif',
  Chewy: 'Chewy, cursive',
"Black Ops One": '"Black Ops One", sans-serif',
"Chelsea Market": '"Chelsea Market", cursive',
Barlow: 'Barlow, ui-sans-serif, system-ui, sans-serif',
"Smooch Sans": '"Smooch Sans", sans-serif',
"Advent Pro": '"Advent Pro", sans-serif',
"Amatic SC": '"Amatic SC", cursive',
"Titan One": '"Titan One", sans-serif',
Creepster: 'Creepster, cursive',
"Rock Salt": '"Rock Salt", cursive',
"Josefin Slab": '"Josefin Slab", serif',
"Poiret One": '"Poiret One", cursive',
"Saira Stencil": '"Saira Stencil One", sans-serif',
"Six Caps": '"Six Caps", sans-serif',
"Bungee Shade": '"Bungee Shade", sans-serif',
"Faster One": '"Faster One", cursive',
"Style Script": '"Style Script", cursive',
"Grenze Gotisch": '"Grenze Gotisch", serif',
Wallpoet: 'Wallpoet, sans-serif',
Typewriter:
  'var(--font-special-elite), "Special Elite", var(--font-courier-prime), "Courier Prime", "Courier New", monospace',
};


function getPageLengthPx(length: PageLengthOption) {
  if (length === "1200") return 1200;
  if (length === "1400") return 1400;
  if (length === "1600") return 1600;
  if (length === "1800") return 1800;
  if (length === "2000") return 2000;
  if (length === "2400") return 2400;
  if (length === "2800") return 2800;
  if (length === "3200") return 3200;
  if (length === "3600") return 3600;
  if (length === "4000") return 4000;

  return 5600;
}


function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function resolveFontFamily(fontFamily?: string) {
  if (!fontFamily || fontFamily === "inherit") return "inherit";
  return FONT_FAMILY_MAP[fontFamily] ?? fontFamily;
}

function makeClientId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function makeClipboardId() {
  return `clip_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneClipboardBlock(
  block: MicrositeBlock,
): MicrositeBlock {
  return structuredClone(block);
}

function buildCanvasItems(
  draft: BuilderDraft,
  metadata: ReturnType<typeof getMetadata>,
): CanvasGridItem[] {
  const pageItems = buildPageCanvasItems(draft, metadata);
const blockItems: CanvasGridItem[] = draft.blocks.map((block) => ({
  id: block.id,
  type: block.type,
  label: block.label,
  grid: block.grid,
  dataVersion:
    block.type === "progress_bar" ? JSON.stringify(block.data) : undefined,
} as CanvasGridItem));

  return normalizeCanvasItems([...pageItems, ...blockItems]);
}
function isPageBlockId(blockId: string) {
  return (
    blockId === PAGE_TITLE_BLOCK_ID ||
    blockId === PAGE_SUBTITLE_BLOCK_ID ||
    blockId === PAGE_SUBTEXT_BLOCK_ID ||
    blockId === PAGE_DESCRIPTION_BLOCK_ID
  );
}

function isSingletonPageBlockId(blockId: string) {
  return blockId === PAGE_TITLE_BLOCK_ID;
}

function isSingletonPageBlockType(type: PageBlockType) {
  return type === "title";
}

function getPageBlockIdForType(type: PageBlockType) {
  if (type === "title") return PAGE_TITLE_BLOCK_ID;
  if (type === "subtitle") return PAGE_SUBTITLE_BLOCK_ID;
  if (type === "tagline") return PAGE_SUBTEXT_BLOCK_ID;
  if (type === "description") return PAGE_DESCRIPTION_BLOCK_ID;
  return null;
}

function getPageBlockLabel(type: PageBlockType) {
  if (type === "title") return "Title";
  if (type === "subtitle") return "Subtitle";
  if (type === "tagline") return "Tagline";
  if (type === "description") return "Description";
  return "Page Text";
}

function topBarSliderWrapClass() {
  return "inline-flex h-12 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-xs text-white";
}

function topBarSliderClass() {
  return "w-24 accent-blue-500";
}

function getSelectedContext(
  selection: ReturnType<typeof createEmptySelection>,
  draft: BuilderDraft,
): SelectedContext {
  if (selection.type === "page:title") {
    return { kind: "pageText", blockId: PAGE_TITLE_BLOCK_ID, label: "Title" };
  }

  if (selection.type === "page:subtitle") {
    return {
      kind: "pageText",
      blockId: PAGE_SUBTITLE_BLOCK_ID,
      label: "Subtitle",
    };
  }

  if (selection.type === "page:subtext") {
    return {
      kind: "pageText",
      blockId: PAGE_SUBTEXT_BLOCK_ID,
      label: "Tagline",
    };
  }

  if (selection.type === "page:description") {
    return {
      kind: "pageText",
      blockId: PAGE_DESCRIPTION_BLOCK_ID,
      label: "Description",
    };
  }

if (selection.type !== "block") {
  return { kind: "none", label: "Nothing selected" };
}

  const blockId = selection.blockId;
  const block = draft.blocks.find((item) => item.id === blockId);

  const ctaButtonOptions = draft.blocks
  .filter((block) => block.type === "cta")
  .map((block) => ({
    id: block.id,
    label:
      block.type === "cta"
        ? block.data.buttonText || block.label || "Button"
        : "Button",
  }));

  if (!block) {
    return { kind: "none", label: "Nothing selected" };
  }

  if (block.type === "label") {
    return { kind: "label", blockId, label: block.label || "Label" };
  }

  if (block.type === "text_fx") {
    return { kind: "textFx", blockId, label: block.label || "TextFX" };
  }

  if (block.type === "cta") {
    return { kind: "cta", blockId, label: block.label || "Button" };
  }

  if (block.type === "image") {
    return { kind: "image", blockId, label: "Image" };
  }

  if (block.type === "audio") {
    return { kind: "otherBlock", blockId, blockType: "audio", label: "Audio" };
  }

  if (block.type === "frame") {
    return { kind: "otherBlock", blockId, blockType: "frame", label: "Frame" };
  }

  if (block.type === "image_carousel") {
    return {
      kind: "imageCarousel",
      blockId,
      label: block.label || "Image Carousel",
    };
  }

  if (block.type === "shape") {
    return { kind: "shape", blockId, label: block.label || "Shape" };
  }

  if (block.type === "wave") {
  return { kind: "otherBlock", blockId, blockType: "wave", label: block.label || "Wave" };
}

  if (block.type === "highlight") {
    return { kind: "otherBlock", blockId, blockType: block.type, label: block.label || "Highlight" };
  }

    if (block.type === "progress_bar") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Progress Bar",
    };
  }

  if (block.type === "listing") {
    return { kind: "otherBlock", blockId, blockType: block.type, label: block.label || "Listing" };
  }

  if (block.type === "donation") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Donation",
    };
  }

  if (block.type === "link_hub") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Link Hub",
    };
  }

  if (block.type === "checklist") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Checklist",
    };
  }

  if (block.type === "schedule_agenda") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Schedule",
    };
  }

  if (block.type === "map_location") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Map",
    };
  }

    if (block.type === "enrollment_board") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Enrollment Board",
    };
  }

  if (block.type === "file_share") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "File Share",
    };
  }

if (block.type === "speed_dating" || block.type === "pop_balloon") {
  return {
    kind: "otherBlock",
    blockId,
    blockType: block.type,
    label:
      block.type === "pop_balloon"
        ? block.label || "Pop the Balloon"
        : block.label || "Speed Dating",
  };
}

  if (block.type === "registry") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Registry",
    };
  }

    if (block.type === "cart") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Cart",
    };
  }

  if (block.type === "video") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Video",
    };
  }

  if (block.type === "rich_text") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Rich Text",
    };
  }

    if (block.type === "content_panel") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Content Panel",
    };
  }

  return {
    kind: "otherBlock",
    blockId,
    blockType: block.type,
    label: block.label || block.type,
  };
}

function getPostBoardDefaultStyle(target: string) {
  const baseText = {
    fontFamily: "Inter",
    fontSize: 14,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "left",
    color: "#111827",
  };

  if (target === "avatarStyle") {
  return {
    size: 36,
    backgroundColor: "#000000",
    color: "#ffffff",
    fontSize: 12,
    bold: true,
  };
}

if (target === "metaStyle") {
  return {
    fontFamily: "Inter",
    fontSize: 11,
    color: "#6b7280",
    bold: false,
  };
}

if (target === "actionButtonStyle") {
  return {
    height: 22,
    minWidth: 42,
    fontSize: 10,
    color: "#111827",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 999,
  };
}

  if (target === "blockHeadingStyle") {
    return {
      ...baseText,
      fontFamily: "Bebas Neue",
      fontSize: 30,
      bold: true,
      color: "#000000",
    };
  }

  if (target === "cardStyle") {
    return {
      fontFamily: "Inter",
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      borderRadius: 14,
    };
  }

  if (target === "headingStyle") {
    return {
      ...baseText,
      fontSize: 11,
      bold: true,
    };
  }

  if (target === "bodyStyle") {
    return {
      ...baseText,
      fontSize: 11,
    };
  }

  if (target === "buttonStyle") {
    return {
      ...baseText,
      fontSize: 10,
      bold: true,
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      borderRadius: 999,
    };
  }

  return {
    ...baseText,
    fontSize: 11,
  };
}

function hydratePostBoardBlockForJson(block: Extract<MicrositeBlock, { type: "post_board" }>) {
  return {
    ...block,
    data: {
      ...block.data,

      interactionMode: block.data.interactionMode ?? "announcement",
      maxVisibleReplies: block.data.maxVisibleReplies ?? 10,
      requireCommunityPostEmail: block.data.requireCommunityPostEmail ?? true,
      allowReplyEmailCapture: block.data.allowReplyEmailCapture ?? true,
      notifyPostAuthorOnReply: block.data.notifyPostAuthorOnReply ?? true,

      avatarStyle: {
  ...getPostBoardDefaultStyle("avatarStyle"),
  ...((block.data as any).avatarStyle ?? {}),
},

metaStyle: {
  ...getPostBoardDefaultStyle("metaStyle"),
  ...((block.data as any).metaStyle ?? {}),
},

actionButtonStyle: {
  ...getPostBoardDefaultStyle("actionButtonStyle"),
  ...((block.data as any).actionButtonStyle ?? {}),
},

      style: {
        ...getPostBoardDefaultStyle("style"),
        ...((block.data as any).style ?? {}),
      },

      blockHeadingStyle: {
        ...getPostBoardDefaultStyle("blockHeadingStyle"),
        ...((block.data as any).blockHeadingStyle ?? {}),
      },

      cardStyle: {
        ...getPostBoardDefaultStyle("cardStyle"),
        ...((block.data as any).cardStyle ?? {}),
      },

      headingStyle: {
        ...getPostBoardDefaultStyle("headingStyle"),
        ...((block.data as any).headingStyle ?? {}),
      },

      bodyStyle: {
        ...getPostBoardDefaultStyle("bodyStyle"),
        ...((block.data as any).bodyStyle ?? {}),
      },

      buttonStyle: {
        ...getPostBoardDefaultStyle("buttonStyle"),
        ...((block.data as any).buttonStyle ?? {}),
      },

      posts: block.data.posts.map((post) => ({
        ownerAvatarUrl: "",
        authorName: post.ownerDisplayName ?? "",
        authorEmail: "",
        authorAvatarUrl: "",
        contactInfoConfirmed: false,
        isOwnerPost: true,
        replies: [],
        ...post,
      })),
    },
  };
}

function hydrateDraftForJsonExport(sourceDraft: BuilderDraft): BuilderDraft {
  return {
    ...sourceDraft,
    blocks: sourceDraft.blocks.map((block) =>
      block.type === "post_board"
        ? hydratePostBoardBlockForJson(block)
        : block,
    ),
  };
}

function advanceTournamentWinners(matches: any[]) {
  const nextMatches = [...matches];

  const getWinner = (match: any) => {
    const scoreA = Number(match.scoreA);
    const scoreB = Number(match.scoreB);

    if (!match.teamA || !match.teamB) return "";
    if (!Number.isFinite(scoreA) || !Number.isFinite(scoreB)) return "";
    if (scoreA === scoreB) return "";

    return scoreA > scoreB ? match.teamA : match.teamB;
  };

  const applyRound = (
    division: "west" | "east",
    sourceRound: string,
    targetRound: string,
  ) => {
    const sourceMatches = nextMatches.filter(
      (match) =>
        match.division === division && match.roundTitle === sourceRound,
    );

    const targetMatches = nextMatches.filter(
      (match) =>
        match.division === division && match.roundTitle === targetRound,
    );

    sourceMatches.forEach((sourceMatch, sourceIndex) => {
      const winner = getWinner(sourceMatch);
      if (!winner) return;

      sourceMatch.winner = winner;

      const targetIndex = Math.floor(sourceIndex / 2);
      const targetSlot = sourceIndex % 2 === 0 ? "teamA" : "teamB";
      const targetMatch = targetMatches[targetIndex];

      if (targetMatch) {
        targetMatch[targetSlot] = winner;
      }
    });
  };

  applyRound("west", "Round 1", "Round 2");
  applyRound("east", "Round 1", "Round 2");
  applyRound("west", "Round 2", "Division Finals");
  applyRound("east", "Round 2", "Division Finals");

  const westFinal = nextMatches.find(
    (match) =>
      match.division === "west" && match.roundTitle === "Division Finals",
  );

  const eastFinal = nextMatches.find(
    (match) =>
      match.division === "east" && match.roundTitle === "Division Finals",
  );

  const championship = nextMatches.find(
    (match) =>
      match.division === "finals" || match.roundTitle === "Championship",
  );

  const westWinner = westFinal ? getWinner(westFinal) : "";
  const eastWinner = eastFinal ? getWinner(eastFinal) : "";

  if (westFinal && westWinner) westFinal.winner = westWinner;
  if (eastFinal && eastWinner) eastFinal.winner = eastWinner;

  if (championship) {
    if (westWinner) championship.teamA = westWinner;
    if (eastWinner) championship.teamB = eastWinner;
  }

  return nextMatches;
}

function syncTournamentMatchesFromTeams(
  teams: any[],
  existingMatches: any[] = [],
) {
  const safeExistingMatches = Array.isArray(existingMatches)
    ? existingMatches
    : [];

  const getWinnerFromScores = (
    teamA: string,
    teamB: string,
    scoreA: number,
    scoreB: number,
  ) => {
    if (!teamA || !teamB) return "";
    if (scoreA === scoreB) return "";
    return scoreA > scoreB ? teamA : teamB;
  };

  const buildDivision = (division: "west" | "east") => {
    const divisionTeams = teams.filter(
      (team) => (team.division ?? "west") === division,
    );

    const getExisting = (roundTitle: string, index: number) =>
      safeExistingMatches.filter(
        (match) =>
          match?.division === division && match?.roundTitle === roundTitle,
      )[index];

    const makeMatch = (
      roundTitle: string,
      index: number,
      teamA: string,
      teamB: string,
    ) => {
      const existing = getExisting(roundTitle, index);
      const scoreA = existing?.scoreA ?? 0;
      const scoreB = existing?.scoreB ?? 0;
      const inferredWinner = getWinnerFromScores(teamA, teamB, scoreA, scoreB);

      return {
        id: existing?.id ?? makeClientId("match"),
        division,
        roundTitle,
        teamA,
        teamB,
        scoreA,
        scoreB,
        winner:
          existing?.winner === teamA || existing?.winner === teamB
            ? existing.winner
            : inferredWinner,
        status: existing?.status ?? "upcoming",
        gameDate: existing?.gameDate,
        gameTime: existing?.gameTime,
        location: existing?.location,
      };
    };

    const round1 = [
      makeMatch(
        "Round 1",
        0,
        divisionTeams[0]?.name ?? "",
        divisionTeams[1]?.name ?? "",
      ),
      makeMatch(
        "Round 1",
        1,
        divisionTeams[2]?.name ?? "",
        divisionTeams[3]?.name ?? "",
      ),
      makeMatch(
        "Round 1",
        2,
        divisionTeams[4]?.name ?? "",
        divisionTeams[5]?.name ?? "",
      ),
      makeMatch(
        "Round 1",
        3,
        divisionTeams[6]?.name ?? "",
        divisionTeams[7]?.name ?? "",
      ),
    ];

    const round2 = [
      makeMatch(
        "Round 2",
        0,
        round1[0]?.winner || "",
        round1[1]?.winner || "",
      ),
      makeMatch(
        "Round 2",
        1,
        round1[2]?.winner || "",
        round1[3]?.winner || "",
      ),
    ];

    const divisionFinal = makeMatch(
      "Division Finals",
      0,
      round2[0]?.winner || "",
      round2[1]?.winner || "",
    );

    return [...round1, ...round2, divisionFinal];
  };

  const westMatches = buildDivision("west");
  const eastMatches = buildDivision("east");

  const westWinner =
    westMatches.find((match) => match.roundTitle === "Division Finals")
      ?.winner ?? "";

  const eastWinner =
    eastMatches.find((match) => match.roundTitle === "Division Finals")
      ?.winner ?? "";

  const existingChampionship = safeExistingMatches.find(
    (match) =>
      match?.division === "finals" || match?.roundTitle === "Championship",
  );

  const championshipScoreA = existingChampionship?.scoreA ?? 0;
  const championshipScoreB = existingChampionship?.scoreB ?? 0;

  const championship = {
    id: existingChampionship?.id ?? makeClientId("match"),
    division: "finals" as const,
    roundTitle: "Championship",
    teamA: westWinner,
    teamB: eastWinner,
    scoreA: championshipScoreA,
    scoreB: championshipScoreB,
    winner:
      existingChampionship?.winner === westWinner ||
      existingChampionship?.winner === eastWinner
        ? existingChampionship.winner
        : getWinnerFromScores(
            westWinner,
            eastWinner,
            championshipScoreA,
            championshipScoreB,
          ),
    status: existingChampionship?.status ?? "upcoming",
    gameDate: existingChampionship?.gameDate,
    gameTime: existingChampionship?.gameTime,
    location: existingChampionship?.location,
  };

  return [...westMatches, ...eastMatches, championship];
}

const FORM_FIELD_CONFIG_EVENT = "ko-host:form-field-config";

type FormFieldConfigEventDetail = {
  blockId: string;
  dateFormat?: string;
};

function topBarButtonClass(active = false, disabled = false, danger = false) {
  return [
    "inline-flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm transition",
    disabled
      ? "cursor-not-allowed border-white/5 bg-white/[0.03] text-white/25"
      : danger
        ? "border-red-400/40 bg-red-500/10 text-red-100 hover:bg-red-500/20"
        : active
          ? "border-blue-500 bg-blue-600 text-white"
          : "border-white/10 bg-white/5 text-white hover:bg-white/10",
  ].join(" ");
}

function topBarFieldClass(widthClass = "") {
  return [
    "h-10 rounded-md border border-white/10 bg-white px-3 text-sm text-black outline-none transition",
    widthClass,
  ].join(" ");
}

function topBarColorClass(disabled = false) {
  return [
    "h-10 w-10 shrink-0 rounded-md border p-1 transition",
    disabled
      ? "cursor-not-allowed border-white/5 bg-white/[0.03] opacity-40"
      : "border-white/10 bg-white/5",
  ].join(" ");
}
function infoPillClass() {
  return "inline-flex h-11 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white/85";
}

function toBookmarkSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function bottomCategoryClass(active: boolean, category?: BottomCategory) {
  return [
    "inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium transition",
    active
      ? "border-blue-500 bg-blue-600 text-white"
      : category === "Premium"
        ? "border-neutral-300 bg-white text-[rgb(0,0,255)] hover:bg-neutral-100"
        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
  ].join(" ");
}

function actionButtonClass(primary = false) {
  return [
    "inline-flex h-12 items-center justify-center rounded-md border px-4 text-sm font-medium transition",
    primary
      ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
  ].join(" ");
}

function toolButtonClass() {
  return "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-700 transition hover:bg-neutral-100";
}

function inspectorCardClass() {
  return "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm";
}

function inspectorLabelClass() {
  return "text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500";
}

function inspectorInputClass() {
  return "mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none";
}

function inspectorTextareaClass() {
  return "mt-2 min-h-[120px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none";
}

function toolSetButtonClass(kind: "front" | "back" | "remove") {
  if (kind === "remove") {
    return "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 hover:bg-red-100";
  }

  return "inline-flex h-8 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50";
}

function getCategoryIconPath(category: BottomCategory) {
  if (category === "Text") return "/menu-icons/menu-text.svg";
  if (category === "Media") return "/menu-icons/menu-media.svg";
  if (category === "Icons") return "/media-icons/star.svg";
  if (category === "Layout") return "/menu-icons/menu-layout.svg";
  if (category === "Forms") return "/menu-icons/menu-forms.svg";
  if (category === "Exchange") return "/menu-icons/menu-exchange.svg";
  if (category === "Utilities") return "/menu-icons/menu-utilities.svg";
  if (category === "Data & Metrics") return "/menu-icons/menu-data-metrics.svg";
  if (category === "Scheduling") return "/menu-icons/menu-scheduling.svg";
  if (category === "Premium") return "/menu-icons/menu-premium.svg";

  return null;
}

function formatDateValue(
  value: string,
  format: string = "mm-dd-yyyy",
) {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  switch (format) {
    case "yyyy-dd-mm":
      return `${year}-${day}-${String(month).padStart(2, "0")}`;

    case "yyyy-mm-dd":
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    case "mm-dd-yyyy":
      return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}-${year}`;

    case "m-d-yy":
      return `${month}-${day}-${String(year).slice(-2)}`;

    case "m-d-yyyy":
      return `${month}-${day}-${year}`;

    case "mmmm-d-yyyy":
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    default:
      return value;
  }
}

function renderCategoryIcon(category: BottomCategory) {
  const iconPath = getCategoryIconPath(category);

  if (!iconPath) return <span className="text-sm font-semibold">•</span>;

  return (
    <img
      src={iconPath}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="h-5 w-5 object-contain"
    />
  );
}

function getToolIconPath(tool: (typeof CATEGORY_BUTTONS)[BottomCategory][number]) {
  if ("icon" in tool && tool.icon) return tool.icon;

  if (
    tool.kind === "block" &&
    tool.type === "icon" &&
    "iconName" in tool &&
    tool.iconName
  ) {
    return `/media-icons/${tool.iconName}.svg`;
  }

  if (tool.label === "Title") return "/menu-icons/block-title.svg";
  if (tool.label === "Subtitle") return "/menu-icons/block-subtitle.svg";
  if (tool.label === "Label") return "/menu-icons/block-label.svg";
  if (tool.label === "TextFX") return "/menu-icons/block-text-fx.svg";
  if (tool.label === "Rich Text") return "/menu-icons/block-rich-text.svg";
  if (tool.label === "Spreadsheet") return "/menu-icons/block-spreadsheet.svg";

  if (tool.label === "Image") return "/menu-icons/block-image.svg";
  if (tool.label === "Video") return "/menu-icons/block-video.svg";
  if (tool.label === "Audio") return "/menu-icons/block-audio.svg";
  if (tool.label === "Gallery") return "/menu-icons/block-gallery.svg";
  if (tool.label === "Carousel") return "/menu-icons/block-carousel.svg";

  if (tool.label === "Rectangle") return "/menu-icons/block-rectangle.svg";
  if (tool.label === "Circle") return "/menu-icons/block-circle.svg";
  if (tool.label === "Line") return "/menu-icons/block-line.svg";
  // if (tool.label === "Wave") return "/menu-icons/block-line.svg";
  if (tool.label === "Frame") return "/menu-icons/block-frame.svg";
  if (tool.label === "Content Panel") return "/menu-icons/block-content-panel.svg";
  // if (tool.label === "Spacer") return "/menu-icons/block-frame.svg";

  if (tool.label === "Input Field") return "/menu-icons/block-input-field.svg";
  if (tool.label === "Option Button") return "/menu-icons/block-option-button.svg";
  if (tool.label === "Poll") return "/menu-icons/block-poll.svg";
  if (tool.label === "RSVP") return "/menu-icons/block-rsvp.svg";
  if (tool.label === "Enrollment Board") return "/menu-icons/block-enrollment-board.svg";
  if (tool.label === "FAQ") return "/menu-icons/block-faq.svg";

  if (tool.label === "Thread") return "/menu-icons/block-thread.svg";
  if (tool.label === "Post Board") return "/menu-icons/block-post-board.svg";
  if (tool.label === "File Share") return "/menu-icons/block-file-share.svg";

  if (tool.label === "Button") return "/menu-icons/block-button.svg";
  if (tool.label === "Link") return "/menu-icons/block-links.svg";
  if (tool.label === "Link Hub") return "/menu-icons/block-link-hub.svg";
  if (tool.label === "Bookmark") return "/menu-icons/block-bookmark.svg";

  if (tool.label === "Highlight") return "/menu-icons/block-highlight.svg";
  if (tool.label === "Summary") return "/menu-icons/block-summary.svg";
  if (tool.label === "Visitor Counter") return "/menu-icons/block-visitor-counter.svg";
  if (tool.label === "Progress Bar") return "/menu-icons/block-progress-meter.svg";

  if (tool.label === "Countdown") return "/menu-icons/block-countdown.svg";
  if (tool.label === "Story Timeline") return "/menu-icons/block-story-timeline.svg";
  if (tool.label === "Checklist") return "/menu-icons/block-checklist.svg";
  if (tool.label === "Tournament Display") return "/menu-icons/block-tournament-display.svg";
  if (tool.label === "Schedule / Agenda") return "/menu-icons/block-schedule-agenda.svg";
  if (tool.label === "Calendar Event") return "/menu-icons/block-calendar-event.svg";
  if (tool.label === "Map / Location") return "/menu-icons/block-map-location.svg";

  if (tool.label === "Registry") return "/menu-icons/block-registry.svg";
  if (tool.label === "Puzzle") return "/menu-icons/block-puzzle.svg";
  if (tool.label === "Spin Wheel") return "/menu-icons/block-spin-wheel.svg";
  if (tool.label === "Donation") return "/menu-icons/block-donation.svg";
  if (tool.label === "Listing") return "/menu-icons/block-listing.svg";
  if (tool.label === "Checkout") return "/menu-icons/block-checkout.svg";
  if (tool.label === "Cart") return "/menu-icons/block-cart.svg";

  return null;
}

function renderToolGlyph(
  tool: (typeof CATEGORY_BUTTONS)[BottomCategory][number],
  className = "h-5 w-5",
) {
  const iconPath = getToolIconPath(tool);

  if (iconPath) {
    return (
      <img
        src={iconPath}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`${className} object-contain`}
      />
    );
  }

  return <span className="text-sm font-semibold">•</span>;
}

function getSelectedCanvasBlockId(context: SelectedContext): string | null {
  if (context.kind === "none") return null;
  return context.blockId;
}



function getSelectedTextValue(
  draft: BuilderDraft,
  context: SelectedContext,
): string {
  if (context.kind === "pageText") {
    if (context.blockId === PAGE_TITLE_BLOCK_ID) return draft.title ?? "";
    if (context.blockId === PAGE_SUBTITLE_BLOCK_ID) return draft.subtitle ?? "";
    if (context.blockId === PAGE_SUBTEXT_BLOCK_ID) return draft.subtext ?? "";
    if (context.blockId === PAGE_DESCRIPTION_BLOCK_ID) {
      return draft.description ?? "";
    }
    return "";
  }

  if (
  context.kind === "label" ||
  context.kind === "textFx" ||
  context.kind === "cta"
) {
  const block = draft.blocks.find((item) => item.id === context.blockId);

  if (block?.type === "label" || block?.type === "text_fx") {
    return block.data.text ?? "";
  }

  if (block?.type === "cta") {
    return block.data.buttonText ?? "";
  }
}

  return "";
}

function getInlineTextStyle(style?: TextStyle) {
  const decorations: string[] = [];

  if (style?.underline) decorations.push("underline");
  if (style?.strike) decorations.push("line-through");

  return {
    fontFamily: resolveFontFamily(style?.fontFamily),
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: decorations.length ? decorations.join(" ") : "none",
    textAlign: style?.align ?? "left",
    color: style?.color || undefined,
    lineHeight: 1.2,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  } as const;
}

function getPageAppearanceKey(
  blockId: string,
): "title" | "subtitle" | "subtext" | "description" | null {
  if (blockId === PAGE_TITLE_BLOCK_ID) return "title";
  if (blockId === PAGE_SUBTITLE_BLOCK_ID) return "subtitle";
  if (blockId === PAGE_SUBTEXT_BLOCK_ID) return "subtext";
  if (blockId === PAGE_DESCRIPTION_BLOCK_ID) return "description";
  return null;
}

function isTextSelection(context: SelectedContext) {
  return (
    context.kind === "pageText" ||
    context.kind === "label" ||
    context.kind === "textFx"
  );
}

function clampCanvasZoom(value: number) {
  return Math.max(MIN_CANVAS_ZOOM, Math.min(MAX_CANVAS_ZOOM, value));
}

function inspectorSectionId(target: InspectorFocusTarget) {
  if (!target) return null;

  switch (target.type) {
    case "poll-question":
    case "poll-option":
      return "inspector-poll";

    case "rsvp-heading":
      return "inspector-rsvp";

    case "countdown-heading":
    case "countdown-target":
    case "countdown-completed":
      return "inspector-countdown";

    case "faq-question":
    case "faq-answer":
      return "inspector-faq";

    case "thread-subject":
      return "inspector-thread";

    case "links-heading":
    case "links-item-label":
    case "links-item-url":
      return "inspector-links";

    case "carousel-heading":
    case "carousel-item-title":
    case "carousel-item-subtitle":
    case "carousel-item-href":
      return "inspector-image-carousel";

    default:
      return null;
  }
}

export default function DesignLayoutEditor({
  templateKey,
  designKey,
  draft,
  setDraft,
  onSaveDraft,
  publishHref,
  publishLabel = "Publish",
  onPublishClick,
  onOpenAddPage,
  onDuplicateActivePage,
  onRemoveActivePage,
  onRenameActivePage,
  pages,
  activePageId,
  activePageSlug,
  micrositeSlug,
  onSelectPage,
  onReorderPages,
  saveState,
  saveMessage,
  microsite,
  builderCapacityContent,
}: Props) {
  const [resetDraftModalOpen, setResetDraftModalOpen] = useState(false);
  const [clearClipboardModalOpen, setClearClipboardModalOpen] = useState(false);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const selectedPageLength =
    ((draft as DraftWithPageExtras).pageLength ?? "1800") as PageLengthOption;


    
/* ------------------------------------ TARGET TEXT/STYLE BLOCKS - START ------------------------------------ */

const [listingStyleTarget, setListingStyleTarget] = useState<
  "title" | "description" | "metadata" | "price" | "quantity"
>("title");

const [formFieldTextTarget, setFormFieldTextTarget] =
  useState<FormFieldTextTarget>("placeholder");

const [formFieldStyleTarget, setFormFieldStyleTarget] =
  useState<FormFieldStyleTarget>("form");

const [carouselTextTarget, setCarouselTextTarget] =
  useState<CarouselTextTarget>("title");

  const [tournamentDisplayStyleTarget, setTournamentDisplayStyleTarget] =
  useState<
    | "background"
    | "tournamentName"
    | "season"
    | "leftDivisionLabel"
    | "rightDivisionLabel"
    | "teamNames"
    | "record"
    | "score"
    | "status"
    | "finalsLabel"
    | "champion"
  >("background");

  const [contentPanelTextTarget, setContentPanelTextTarget] =
  useState<ContentPanelTextTarget>("heading");

  const [contentPanelStyleTarget, setContentPanelStyleTarget] =
    useState<ContentPanelStyleTarget>("form");


const [galleryTextTarget, setGalleryTextTarget] =
  useState<GalleryTextTarget>("title");

const [optionButtonTextTarget, setOptionButtonTextTarget] = useState<
  "heading" | "label" | "description"
>("label");

const [selectedOptionButtonOptionId, setSelectedOptionButtonOptionId] =
  useState<string | null>(null);

  const [optionButtonSelections, setOptionButtonSelections] = useState<
  Record<string, string[]>
>({});

  const [selectedRsvpElementKey, setSelectedRsvpElementKey] = useState<
    | "form"
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
    | "comments"
  >("heading");

  
/* ------------------------------------ TARGET TEXT/STYLE BLOCKS - END ------------------------------------ */

  const isPublished = microsite?.is_published;
  const isActive = microsite?.is_active;
  const slug = microsite?.slug;
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [fontMenuPosition, setFontMenuPosition] = useState({
    left: 0,
    top: 0,
  });
  const [buildPresetConfirmOpen, setBuildPresetConfirmOpen] = useState(false);
  const [pendingPresetDraft, setPendingPresetDraft] = useState<BuilderDraft | null>(null);
  const [registryLoadingMap, setRegistryLoadingMap] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<BottomCategory>("Text");
  const [editorUploadError, setEditorUploadError] = useState("");
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [flashedToolKey, setFlashedToolKey] = useState<string | null>(null);
  const [selectedGalleryImageId, setSelectedGalleryImageId] =
  useState<string | null>(null);
  const [textureUploadError, setTextureUploadError] = useState("");
  const [categoryMenuView, setCategoryMenuView] = useState<"compact" | "detail">(
    "compact",
  );
  const [selection, setSelection] = useState(createEmptySelection());
  const [openToolMenu, setOpenToolMenu] = useState<BottomCategory | null>(null);
const [pageDragPreview, setPageDragPreview] = useState<typeof pages | null>(null);
  const [toolGuideModalOpen, setToolGuideModalOpen] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
type SmartContentOption = {
  id: string;
  title: string;
  text: string;
};

const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
const [aiOptions, setAiOptions] = useState<SmartContentOption[]>([]);
const [showAiSuggestions, setShowAiSuggestions] = useState(false);

const [aiSubject, setAiSubject] = useState("");
const [aiDetails, setAiDetails] = useState("");
const [aiTone, setAiTone] = useState("Friendly");
const [aiLength, setAiLength] = useState("Short");
const [aiAudience, setAiAudience] = useState("");
const [aiKeywords, setAiKeywords] = useState("");
const [aiContentType, setAiContentType] = useState("Description");
const [aiCreativity, setAiCreativity] = useState(50);
const [aiMatchPageStyle, setAiMatchPageStyle] = useState(true);
const [aiError, setAiError] = useState("");
const [showAiAdvancedOptions, setShowAiAdvancedOptions] =
  useState(false);
  const [removeAllModalOpen, setRemoveAllModalOpen] = useState(false);
  const [inspectorFocusTarget, setInspectorFocusTarget] =
    useState<InspectorFocusTarget>(null);

    const [videoTextTarget, setVideoTextTarget] =
  useState<VideoTextTarget>("title");
  
const [canvasZoom, setCanvasZoom] = useState(() => {
  if (typeof window === "undefined") return 70;

  const saved = window.sessionStorage.getItem("ko-host-builder-canvas-zoom");
  const parsed = saved ? Number(saved) : 70;

  return Number.isFinite(parsed) ? clampCanvasZoom(parsed) : 70;
});
  const [showGridLines, setShowGridLines] = useState(true);
  const [undoStack, setUndoStack] = useState<BuilderDraft[]>([]);
  const [redoStack, setRedoStack] = useState<BuilderDraft[]>([]);
  const isHistoryActionRef = useRef(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const frameCaptureRootRef = useRef<HTMLDivElement | null>(null);
  const initialDraftRef = useRef<BuilderDraft>(cloneDraft(draft));
  const lastDraftRef = useRef<BuilderDraft>(cloneDraft(draft));
  const topBarScrollRef = useRef<HTMLDivElement | null>(null);
  const dockedScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);
  const [blockGuideOpen, setBlockGuideOpen] = useState(false);
  const toolMenuRef = useRef<HTMLDivElement | null>(null);
const [donationStyleTarget, setDonationStyleTarget] =
  useState<"background" | "buttons">("background");

const [postBoardStyleTarget, setPostBoardStyleTarget] = useState<
  | "block"
  | "block_heading"
  | "card"
  | "heading"
  | "body"
  | "buttons"
>("block");
  const pollQuestionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pollOptionInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
const [enrollmentBoardStyleTarget, setEnrollmentBoardStyleTarget] = useState<
  | "block"
  | "form"
  | "inputs"
  | "button"
  | "list"
  | "cards"
  | "heading"
  | "subtitle"
  | "imageLabel"
  | "memberName"
  | "memberQuote"
  | "memberTotal"
>("block");

  const [copied, setCopied] = useState(false);

  const rsvpHeadingInputRef = useRef<HTMLInputElement | null>(null);
const currentSiteName =
  activePageSlug && activePageSlug !== "home"
    ? activePageSlug
    : "Home";
const fallbackSiteSlug = `${templateKey || "site"}-${designKey || "draft"}`
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const currentSiteSlug =
  micrositeSlug?.trim() ||
  (draft as DraftWithPageExtras).slugSuggestion?.trim() ||
  fallbackSiteSlug;

  const currentPageSlug = (activePageSlug || "home").trim().toLowerCase();
  const [draftCopied, setDraftCopied] = useState(false);
const isLiveMicrosite = Boolean(micrositeSlug?.trim());

const currentSiteDisplay = isLiveMicrosite
  ? currentPageSlug && currentPageSlug !== "home"
    ? `${micrositeSlug}.ko-host.com/${currentPageSlug}`
    : `${micrositeSlug}.ko-host.com`
  : "Draft preview — URL assigned after publish";
  const countdownHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const countdownTargetInputRef = useRef<HTMLInputElement | null>(null);
  const countdownCompletedInputRef = useRef<HTMLInputElement | null>(null);
  const richTextEditorRef = useRef<HTMLDivElement | null>(null);
  const [isRichTextEditorEmpty, setIsRichTextEditorEmpty] = useState(true);
  const [richTextLinkModalOpen, setRichTextLinkModalOpen] = useState(false);
  const [buildPresetModalOpen, setBuildPresetModalOpen] = useState(false);
  const [buildPresetJson, setBuildPresetJson] = useState("");
  const [buildPresetError, setBuildPresetError] = useState("");
  const [linkHubTextTarget, setLinkHubTextTarget] = useState<
  "form" | "label" | "description" | "url"
>("form");
  const [richTextLinkValue, setRichTextLinkValue] = useState("https://");
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("kht:recent-colors");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
    } catch {
      return [];
    }
  });
  const faqQuestionInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const faqAnswerInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>(
    {},
  );

  const threadSubjectInputRef = useRef<HTMLInputElement | null>(null);

  const linksHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const linksItemLabelInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const linksItemUrlInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const carouselHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const carouselItemTitleInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const carouselItemSubtitleInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const carouselItemHrefInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const metadata = useMemo(
    () => getMetadata(templateKey, designKey),
    [templateKey, designKey],
  );

  const canvasItems = useMemo(
    () => buildCanvasItems(draft, metadata),
    [draft, metadata],
  );

  const selectedBlockFromDraft =
    selection.type === "block"
      ? draft.blocks.find((item) => item.id === selection.blockId) ?? null
      : null;
    
const [highlightStyleTarget, setHighlightStyleTarget] =
  useState<"heading" | "value" | "body">("heading");


type CountdownStyleTarget =
  | "background"
  | "tiles"
  | "values"
  | "units"
  | "heading";

type TimelineStyleTarget =
  | "title"
  | "date"
  | "entryTitle"
  | "subtitle"
  | "description";

  
type ClipboardEntry = {
  clipboardId: string;
  copiedAt: number;
  block: MicrositeBlock;
};

const [clipboardEntries, setClipboardEntries] = useState<ClipboardEntry[]>(() => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.sessionStorage.getItem("ko-host-canvas-clipboard");
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
});

const [clipboardOpen, setClipboardOpen] = useState(false);

useEffect(() => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      "ko-host-canvas-clipboard",
      JSON.stringify(clipboardEntries),
    );
  } catch {
    // ignore clipboard persistence errors
  }
}, [clipboardEntries]);

const [countdownStyleTarget, setCountdownStyleTarget] =
  useState<CountdownStyleTarget>("background");

const [timelineStyleTarget, setTimelineStyleTarget] =
  useState<TimelineStyleTarget>("entryTitle");

const [calendarEventTextTarget, setCalendarEventTextTarget] =
  useState<
    | "heading"
    | "subtitle"
    | "eventTitle"
    | "eventSubtitle"
    | "eventDate"
    | "eventDetails"
  >("heading");

const [focusedTimelineEntryId, setFocusedTimelineEntryId] =
  useState<string | null>(null);

const [progressBarStyleTarget, setProgressBarStyleTarget] = useState<
  | "background"
  | "bar"
  | "scope"
  | "context"
  | "meterContext"
  | "meterCaption"
>("background");

const textureInputRef = useRef<HTMLInputElement | null>(null);

const [faqStyleTarget, setFaqStyleTarget] = useState<
  "form" | "section" | "question" | "answer"
>("form");

const [summaryStyleTarget, setSummaryStyleTarget] = useState<
  | "header"
  | "subheader"
  | "contentLabel"
  | "content"
  | "footerLabel"
  | "footerAggregate"
  | "footerCaption"
>("content");


const selectedStyle =
selectedBlockFromDraft?.type === "gallery"
  ? (getGalleryTextStyle(
      selectedBlockFromDraft,
      galleryTextTarget,
    ) as TextStyle)
: selectedBlockFromDraft?.type === "enrollment_board"
  ? enrollmentBoardStyleTarget === "heading"
    ? (((selectedBlockFromDraft.data as any).headingStyle ??
        (selectedBlockFromDraft.data as any).style ??
        {}) as TextStyle)
    : enrollmentBoardStyleTarget === "subtitle"
      ? (((selectedBlockFromDraft.data as any).subtitleStyle ??
          (selectedBlockFromDraft.data as any).style ??
          {}) as TextStyle)
      : enrollmentBoardStyleTarget === "imageLabel"
        ? (((selectedBlockFromDraft.data as any).imageLabelStyle ??
            (selectedBlockFromDraft.data as any).subtitleStyle ??
            (selectedBlockFromDraft.data as any).style ??
            {}) as TextStyle)
        : enrollmentBoardStyleTarget === "inputs"
          ? (((selectedBlockFromDraft.data as any).inputStyle ??
              (selectedBlockFromDraft.data as any).style ??
              {}) as TextStyle)
          : enrollmentBoardStyleTarget === "button"
            ? (((selectedBlockFromDraft.data as any).buttonStyle ??
                (selectedBlockFromDraft.data as any).style ??
                {}) as TextStyle)
            : enrollmentBoardStyleTarget === "list"
              ? (((selectedBlockFromDraft.data as any).listStyle ??
                  (selectedBlockFromDraft.data as any).style ??
                  {}) as TextStyle)
              : enrollmentBoardStyleTarget === "cards"
                ? (((selectedBlockFromDraft.data as any).cardStyle ??
                    (selectedBlockFromDraft.data as any).style ??
                    {}) as TextStyle)
                : enrollmentBoardStyleTarget === "memberName"
                  ? (((selectedBlockFromDraft.data as any).memberNameStyle ??
                      (selectedBlockFromDraft.data as any).style ??
                      {}) as TextStyle)
                  : enrollmentBoardStyleTarget === "memberQuote"
                    ? (((selectedBlockFromDraft.data as any).memberQuoteStyle ??
                        (selectedBlockFromDraft.data as any).style ??
                        {}) as TextStyle)
                    : enrollmentBoardStyleTarget === "memberTotal"
                      ? (((selectedBlockFromDraft.data as any).memberTotalStyle ??
                          (selectedBlockFromDraft.data as any).style ??
                          {}) as TextStyle)
                      : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
    : selectedBlockFromDraft?.type === "rsvp"
      ? selectedRsvpElementKey === "form"
        ? selectedBlockFromDraft.data.style ?? {}
        : (
            selectedBlockFromDraft.data.elementStyles?.[selectedRsvpElementKey]
              ?.textStyle ??
            selectedBlockFromDraft.data.style ??
            {}
          )
      : selectedBlockFromDraft?.type === "donation"
        ? donationStyleTarget === "buttons"
          ? (((selectedBlockFromDraft.data as any).buttonStyle ??
              (selectedBlockFromDraft.data as any).style ??
              {}) as TextStyle)
          : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
          : selectedBlockFromDraft?.type === "tournament_display"
  ? tournamentDisplayStyleTarget === "tournamentName"
    ? ((selectedBlockFromDraft.data as any).tournamentNameStyle ?? {})
    : tournamentDisplayStyleTarget === "season"
      ? ((selectedBlockFromDraft.data as any).seasonStyle ?? {})
      : tournamentDisplayStyleTarget === "leftDivisionLabel"
        ? ((selectedBlockFromDraft.data as any).leftDivisionLabelStyle ?? {})
        : tournamentDisplayStyleTarget === "rightDivisionLabel"
          ? ((selectedBlockFromDraft.data as any).rightDivisionLabelStyle ?? {})
          : tournamentDisplayStyleTarget === "teamNames"
            ? ((selectedBlockFromDraft.data as any).teamNameStyle ?? {})
            : tournamentDisplayStyleTarget === "record"
              ? ((selectedBlockFromDraft.data as any).recordStyle ?? {})
              : tournamentDisplayStyleTarget === "score"
                ? ((selectedBlockFromDraft.data as any).scoreStyle ?? {})
                : tournamentDisplayStyleTarget === "status"
                  ? ((selectedBlockFromDraft.data as any).statusStyle ?? {})
                  : tournamentDisplayStyleTarget === "finalsLabel"
                    ? ((selectedBlockFromDraft.data as any).finalsLabelStyle ?? {})
                    : tournamentDisplayStyleTarget === "champion"
                      ? ((selectedBlockFromDraft.data as any).championStyle ?? {})
                      : ((selectedBlockFromDraft.data as any).style ?? {})
        : selectedBlockFromDraft?.type === "listing"
          ? listingStyleTarget === "description"
            ? (selectedBlockFromDraft.data.descriptionStyle ?? {})
            : listingStyleTarget === "metadata"
              ? (selectedBlockFromDraft.data.metadataStyle ?? {})
              : listingStyleTarget === "price"
                ? ((selectedBlockFromDraft.data as any).priceStyle ?? {})
                : listingStyleTarget === "quantity"
                  ? ((selectedBlockFromDraft.data as any).quantityStyle ?? {})
                  : (selectedBlockFromDraft.data.titleStyle ?? {})
: selectedBlockFromDraft?.type === "form_field"
  ? (getFormFieldTextStyle(
      selectedBlockFromDraft,
      formFieldTextTarget,
    ) as TextStyle)

: selectedBlockFromDraft?.type === "option_button"
  ? optionButtonTextTarget === "description"
    ? (((selectedBlockFromDraft.data as any).descriptionStyle ??
        (selectedBlockFromDraft.data as any).labelStyle ??
        (selectedBlockFromDraft.data as any).style ??
        {}) as TextStyle)
    : optionButtonTextTarget === "heading"
      ? (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
      : (((selectedBlockFromDraft.data as any).labelStyle ??
          (selectedBlockFromDraft.data as any).style ??
          {}) as TextStyle)
: selectedBlockFromDraft?.type === "post_board"
  ? postBoardStyleTarget === "block_heading"
  ? (((selectedBlockFromDraft.data as any).blockHeadingStyle ?? {}) as TextStyle)
    : postBoardStyleTarget === "card"
      ? (((selectedBlockFromDraft.data as any).cardStyle ??
          (selectedBlockFromDraft.data as any).style ??
          {}) as TextStyle)
      : postBoardStyleTarget === "heading"
        ? (((selectedBlockFromDraft.data as any).headingStyle ??
            (selectedBlockFromDraft.data as any).style ??
            {}) as TextStyle)
        : postBoardStyleTarget === "body"
          ? (((selectedBlockFromDraft.data as any).bodyStyle ??
              (selectedBlockFromDraft.data as any).style ??
              {}) as TextStyle)
          : postBoardStyleTarget === "buttons"
            ? (((selectedBlockFromDraft.data as any).buttonStyle ??
                (selectedBlockFromDraft.data as any).style ??
                {}) as TextStyle)
            : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
: selectedBlockFromDraft?.type === "visitor_counter"
  ? (((selectedBlockFromDraft.data as any).numberStyle ??
      (selectedBlockFromDraft.data as any).style ??
      {}) as TextStyle)
: selectedBlockFromDraft?.type === "highlight"
  ? highlightStyleTarget === "value"
    ? (selectedBlockFromDraft.data.valueStyle ??
        selectedBlockFromDraft.data.bodyStyle ??
        selectedBlockFromDraft.data.style ??
        {})
    : highlightStyleTarget === "body"
      ? (selectedBlockFromDraft.data.bodyStyle ??
          selectedBlockFromDraft.data.style ??
          {})
      : (selectedBlockFromDraft.data.headingStyle ??
          selectedBlockFromDraft.data.style ??
          {})
                : selectedBlockFromDraft?.type === "faq"
                  ? faqStyleTarget === "question"
                    ? (((selectedBlockFromDraft.data as any).questionStyle ??
                        (selectedBlockFromDraft.data as any).style ??
                        {}) as TextStyle)
                    : faqStyleTarget === "answer"
                      ? (((selectedBlockFromDraft.data as any).answerStyle ??
                          (selectedBlockFromDraft.data as any).style ??
                          {}) as TextStyle)
                      : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
                  : selectedBlockFromDraft?.type === "countdown"
                    ? countdownStyleTarget === "tiles"
                      ? (((selectedBlockFromDraft.data as any).tileStyle ??
                          (selectedBlockFromDraft.data as any).style ??
                          {}) as TextStyle)
                      : countdownStyleTarget === "values"
                        ? (((selectedBlockFromDraft.data as any).standardValueStyle ??
                            (selectedBlockFromDraft.data as any).style ??
                            {}) as TextStyle)
                        : countdownStyleTarget === "units"
                          ? (((selectedBlockFromDraft.data as any).standardUnitStyle ??
                              (selectedBlockFromDraft.data as any).style ??
                              {}) as TextStyle)
                          : countdownStyleTarget === "heading"
                            ? (((selectedBlockFromDraft.data as any).headingStyle ??
                                (selectedBlockFromDraft.data as any).style ??
                                {}) as TextStyle)
                            : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
                    : selectedBlockFromDraft?.type === "link_hub"
                      ? linkHubTextTarget === "label"
                        ? (((selectedBlockFromDraft.data as any).labelStyle ??
                            selectedBlockFromDraft.data.style ??
                            {}) as TextStyle)
                        : linkHubTextTarget === "description"
                          ? (((selectedBlockFromDraft.data as any).descriptionStyle ??
                              selectedBlockFromDraft.data.style ??
                              {}) as TextStyle)
                          : linkHubTextTarget === "url"
                            ? (((selectedBlockFromDraft.data as any).urlStyle ??
                                selectedBlockFromDraft.data.style ??
                                {}) as TextStyle)
                                : enrollmentBoardStyleTarget === "memberTotal"
                            ? (((selectedBlockFromDraft.data as any).memberTotalStyle ??
                                (selectedBlockFromDraft.data as any).style ??
                                {}) as TextStyle)
                            : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
: selectedBlockFromDraft?.type === "content_panel"
  ? (getContentPanelTextStyle(
      selectedBlockFromDraft,
      contentPanelTextTarget,
    ) as TextStyle)
                      : selectedBlockFromDraft?.type === "timeline"
                        ? timelineStyleTarget === "title"
                          ? (((selectedBlockFromDraft.data as any).titleStyle ?? {}) as TextStyle)
                          : timelineStyleTarget === "date"
                            ? (((selectedBlockFromDraft.data as any).dateStyle ?? {}) as TextStyle)
                            : timelineStyleTarget === "entryTitle"
                              ? (((selectedBlockFromDraft.data as any).entryTitleStyle ?? {}) as TextStyle)
                              : timelineStyleTarget === "subtitle"
                                ? (((selectedBlockFromDraft.data as any).subtitleStyle ?? {}) as TextStyle)
                                : (((selectedBlockFromDraft.data as any).descriptionStyle ?? {}) as TextStyle)

                      : selectedBlockFromDraft?.type === "calendar_event"
                        ? calendarEventTextTarget === "heading"
                          ? (((selectedBlockFromDraft.data as any).headingStyle ??
                              (selectedBlockFromDraft.data as any).style ??
                              {}) as TextStyle)
                          : calendarEventTextTarget === "subtitle"
                            ? (((selectedBlockFromDraft.data as any).subtitleStyle ??
                                (selectedBlockFromDraft.data as any).style ??
                                {}) as TextStyle)
                            : calendarEventTextTarget === "eventTitle"
                              ? (((selectedBlockFromDraft.data as any).eventTitleStyle ??
                                  (selectedBlockFromDraft.data as any).style ??
                                  {}) as TextStyle)
                              : calendarEventTextTarget === "eventDate"
                                ? (((selectedBlockFromDraft.data as any).eventDateStyle ??
                                    (selectedBlockFromDraft.data as any).style ??
                                    {}) as TextStyle)
                                : (((selectedBlockFromDraft.data as any).eventDetailsStyle ??
                                    (selectedBlockFromDraft.data as any).style ??
                                    {}) as TextStyle)

                      : selectedBlockFromDraft?.type === "summary"
                        ? summaryStyleTarget === "header"
                          ? (((selectedBlockFromDraft.data as any).headerStyle ??
                              (selectedBlockFromDraft.data as any).style ??
                              {}) as TextStyle)
                          : summaryStyleTarget === "subheader"
                            ? (((selectedBlockFromDraft.data as any).subheaderStyle ??
                                (selectedBlockFromDraft.data as any).style ??
                                {}) as TextStyle)
                            : summaryStyleTarget === "contentLabel"
                              ? (((selectedBlockFromDraft.data as any).labelStyle ??
                                  (selectedBlockFromDraft.data as any).style ??
                                  {}) as TextStyle)
                              : summaryStyleTarget === "content"
                                ? (((selectedBlockFromDraft.data as any).valueStyle ??
                                    (selectedBlockFromDraft.data as any).style ??
                                    {}) as TextStyle)
                                : summaryStyleTarget === "footerLabel"
                                  ? (((selectedBlockFromDraft.data as any).footerLabelStyle ??
                                      (selectedBlockFromDraft.data as any).labelStyle ??
                                      (selectedBlockFromDraft.data as any).style ??
                                      {}) as TextStyle)
                                  : summaryStyleTarget === "footerAggregate"
                                    ? (((selectedBlockFromDraft.data as any).footerAggregateStyle ??
                                        (selectedBlockFromDraft.data as any).style ??
                                        {}) as TextStyle)
                                    : summaryStyleTarget === "footerCaption"
                                      ? (((selectedBlockFromDraft.data as any).footerCaptionStyle ??
                                          (selectedBlockFromDraft.data as any).style ??
                                          {}) as TextStyle)
                                      : (((selectedBlockFromDraft.data as any).labelStyle ??
                                          (selectedBlockFromDraft.data as any).style ??
                                          {}) as TextStyle)

                      : selectedBlockFromDraft?.type === "video"
                        ? (getVideoTextStyle(
                            selectedBlockFromDraft,
                            videoTextTarget,
                          ) as TextStyle)

                        : selectedBlockFromDraft?.type === "image_carousel"
                          ? (getCarouselTextStyle(
                              selectedBlockFromDraft,
                              carouselTextTarget,
                            ) as TextStyle)

                      : selectedBlockFromDraft?.type === "cart" ||
                        selectedBlockFromDraft?.type === "checkout" ||
                        selectedBlockFromDraft?.type === "text_fx" ||
                        selectedBlockFromDraft?.type === "cta" ||
                        selectedBlockFromDraft?.type === "thread" ||
                        selectedBlockFromDraft?.type === "image" ||
                        (selectedBlockFromDraft as any)?.type === "gallery" ||
                        selectedBlockFromDraft?.type === "progress_bar" ||
                        (selectedBlockFromDraft as any)?.type === "link_hub" ||
                        selectedBlockFromDraft?.type === "checklist" ||
                        selectedBlockFromDraft?.type === "schedule_agenda" ||
                        selectedBlockFromDraft?.type === "map_location" ||
                        selectedBlockFromDraft?.type === "file_share" ||
                        selectedBlockFromDraft?.type === "speed_dating" ||
                        selectedBlockFromDraft?.type === "rich_text" ||
                        selectedBlockFromDraft?.type === "links"
                          ? ((((selectedBlockFromDraft as any)?.data?.captionStyle ??
                              (selectedBlockFromDraft as any)?.data?.style ??
                              {}) as TextStyle))

                      : getSelectionTextStyle(draft, selection);

  const selectedAppearance = getSelectionBlockAppearance(draft, selection);
const selectedRsvpElementBackgroundColor =
  selectedBlockFromDraft?.type === "rsvp"
    ? selectedRsvpElementKey === "form"
      ? selectedBlockFromDraft.appearance?.backgroundColor ?? "transparent"
      : selectedBlockFromDraft.data.elementStyles?.[selectedRsvpElementKey]
          ?.backgroundColor ?? "transparent"
    : "transparent";
  const resolvedPageColor =
    (draft as DraftWithPageExtras).pageColor ||
    getResolvedPageColor(draft, designKey, metadata);
  const selectedContext = getSelectedContext(selection, draft);
  const isMultiSelection = selectedBlockIds.length > 1;
  const selectedCanvasBlockId = getSelectedCanvasBlockId(selectedContext);

  const selectedCanvasItem =
    selectedCanvasBlockId != null
      ? canvasItems.find((item) => item.id === selectedCanvasBlockId) ?? null
      : null;

  const selectedBlock =
    selectedContext.kind === "none" || selectedContext.kind === "pageText"
      ? null
      : draft.blocks.find((item) => item.id === selectedContext.blockId) ?? null;

      useEffect(() => {
  if (selectedBlockFromDraft?.type !== "gallery") return;

  const nextTarget =
    ((selectedBlockFromDraft.data as any).galleryTextTarget ??
      "title") as "title" | "description" | "metadata";

  setGalleryTextTarget(nextTarget);
}, [selectedBlockFromDraft?.id, selectedBlockFromDraft]);

const textureEligibleBlockTypes = [
  "label",
  "text_fx",
  "shape",
  "image",
  "video",
  "gallery",
  "image_carousel",
] as const;

const selectedBlockSupportsTexture = Boolean(
  selectedBlock &&
    textureEligibleBlockTypes.includes(selectedBlock.type as any),
);

const selectedBlockTextureEnabled =
  selectedBlock?.type === "label" || selectedBlock?.type === "text_fx"
    ? Boolean((selectedStyle as any).textureEnabled)
    : Boolean(selectedAppearance.textureEnabled);

function applyTextureToSelectedBlock(
  textureUrl: string,
  meta?: {
    sizeBytes?: number;
    originalSizeBytes?: number;
    mimeType?: string;
    storagePath?: string;
  },
) {
  if (!selectedBlock) return;

  if (selectedBlock.type === "label" || selectedBlock.type === "text_fx") {
    updateSelectedBlock((block) => {
      if (block.type !== "label" && block.type !== "text_fx") return block;

      return {
        ...block,
        data: {
          ...block.data,
          style: {
            ...((block.data as any).style ?? {}),
            textureEnabled: true,
            textureImageUrl: textureUrl,
            textureStoragePath: meta?.storagePath ?? "",
            textureSizeBytes: meta?.sizeBytes ?? 0,
            textureOriginalSizeBytes: meta?.originalSizeBytes ?? 0,
            textureMimeType: meta?.mimeType ?? "",
            textureScale: 100,
            texturePositionX: 50,
            texturePositionY: 50,
          },
        },
      };
    });

    return;
  }

  if (
      selectedBlock.type === "shape" ||
      selectedBlock.type === "image" ||
      selectedBlock.type === "video" ||
      selectedBlock.type === "gallery" ||
      selectedBlock.type === "image_carousel"
  ) {
    updateSelectedBlock((block) => ({
      ...block,
      appearance: {
        ...block.appearance,
        textureEnabled: true,
        textureImageUrl: textureUrl,
        textureStoragePath: meta?.storagePath ?? "",
        textureSizeBytes: meta?.sizeBytes ?? 0,
        textureOriginalSizeBytes: meta?.originalSizeBytes ?? 0,
        textureMimeType: meta?.mimeType ?? "",
        textureScale: 100,
        texturePositionX: 50,
        texturePositionY: 50,
      },
    }));

    return;
  }
}

async function handleTextureFileChange(fileList: FileList | null) {
  const file = fileList?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setTextureUploadError("Please choose an image file for the texture.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setTextureUploadError("Texture image must be 2MB or smaller.");
    return;
  }

  try {
    setTextureUploadError("");

    const uploaded = await uploadBuilderImageFile(file);

    applyTextureToSelectedBlock(uploaded.url, {
      storagePath: uploaded.storagePath,
      sizeBytes: uploaded.imageSizeBytes,
      originalSizeBytes: uploaded.imageOriginalSizeBytes,
      mimeType: uploaded.imageMimeType,
    });
  } catch {
    setTextureUploadError("Texture upload failed. Please try again.");
  }
}

function removeTextureFromSelectedBlock() {
  if (!selectedBlock) return;

if (selectedBlock.type === "label" || selectedBlock.type === "text_fx") {
  updateSelectedBlock((block) => {
    if (block.type !== "label" && block.type !== "text_fx") return block;

    return {
      ...block,
      data: {
        ...block.data,
        style: {
          ...((block.data as any).style ?? {}),
          textureEnabled: false,
          textureImageUrl: "",
        },
      },
    };
  });

  return;
}

  applyAppearancePatch({
    textureEnabled: false,
    textureImageUrl: "",
  });
}

      const ctaButtonOptions: Array<{ id: string; label: string }> = draft.blocks
      .filter((block) => block.type === "cta")
      .map((block) => ({
        id: block.id,
        label:
          block.type === "cta"
            ? block.data.buttonText || block.label || "Button"
            : "Button",
      }));
      const threadOptions: Array<{ id: string; label: string }> = draft.blocks
  .filter((block) => block.type === "thread")
  .map((block) => ({
    id: block.id,
    label:
      block.type === "thread"
        ? block.data.subject || block.label || "Thread"
        : "Thread",
  }));

      const selectedBlockGuide = selectedBlock
  ? BLOCK_GUIDES[selectedBlock.type]
  : null;
  
const rsvpElementOptions =
  selectedBlock?.type === "rsvp"
    ? [
        { value: "form", label: "Form" }, // ✅ ADD THIS LINE
        { value: "image", label: "Top Image" },
        { value: "heading", label: "Heading" },
        { value: "nameLabel", label: "Name Label" },
        { value: "firstName", label: "First Name Field" },
        { value: "lastName", label: "Last Name Field" },
        { value: "email", label: "Email Field" },
        { value: "address", label: "Address Field" },
        { value: "attending", label: "Attending Section" },
        { value: "meal", label: "Meal Section" },
        { value: "guestToggle", label: "Guest Toggle Section" },
        { value: "guestCount", label: "Guest Count Control" },
        { value: "guestName", label: "Guest Name Field" },
        { value: "comments", label: "Comments Field" },
      ]
    : [];

  const selectedTextFxBlock =
    selectedBlock?.type === "text_fx" ? selectedBlock : null;

  const isTextFxSelected = Boolean(selectedTextFxBlock);

  const selectedBold = selectedStyle.bold ?? false;
  const selectedItalic = selectedStyle.italic ?? false;
  const selectedUnderline = selectedStyle.underline ?? false;
  const selectedStrike = selectedStyle.strike ?? false;

const showTextControls =
  selectedContext.kind === "pageText" ||
  selectedContext.kind === "label" ||
  selectedContext.kind === "textFx" ||
  selectedContext.kind === "cta" ||
  selectedContext.kind === "image" ||
  selectedBlock?.type === "image" ||
  selectedBlock?.type === "thread" ||
  selectedBlock?.type === "post_board" ||
  selectedBlock?.type === "enrollment_board" ||
  selectedBlock?.type === "form_field" ||
  selectedBlock?.type === "option_button" ||
  selectedBlock?.type === "highlight" ||
  selectedBlock?.type === "summary" ||
  selectedBlock?.type === "visitor_counter" ||
  selectedBlock?.type === "progress_bar" ||
  selectedBlock?.type === "donation" ||
  selectedBlock?.type === "link_hub" ||
  selectedBlock?.type === "checklist" ||
  selectedBlock?.type === "schedule_agenda" ||
  selectedBlock?.type === "calendar_event" ||
  selectedBlock?.type === "map_location" ||
  selectedBlock?.type === "file_share" ||
  selectedBlock?.type === "speed_dating" ||
  selectedBlock?.type === "registry" ||
  selectedBlock?.type === "rsvp" ||
  selectedBlock?.type === "poll" ||
  selectedBlock?.type === "faq" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "gallery" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "content_panel" ||
  selectedBlock?.type === "countdown" ||
  selectedBlock?.type === "timeline" ||
  selectedBlock?.type === "cart" ||
  selectedBlock?.type === "checkout" ||
  selectedBlock?.type === "listing" ||
  selectedBlock?.type === "tournament_display" ||
  selectedBlock?.type === "image_carousel" ||
  selectedBlock?.type === "links";

  const showTypographyControls =
  showTextControls || selectedBlockFromDraft?.type === "gallery";


const showAppearanceControls =
  selectedContext.kind === "label" ||
  selectedContext.kind === "textFx" ||
  selectedContext.kind === "cta" ||
  selectedContext.kind === "image" ||
  selectedContext.kind === "imageCarousel" ||
  selectedContext.kind === "shape" ||
  selectedBlock?.type === "thread" ||
  selectedBlock?.type === "enrollment_board" ||
  selectedBlock?.type === "post_board" ||
  selectedBlock?.type === "listing" ||
  selectedBlock?.type === "tournament_display" ||
  selectedBlock?.type === "progress_bar" ||
  selectedBlock?.type === "donation" ||
  selectedBlock?.type === "link_hub" ||
  selectedBlock?.type === "checklist" ||
  selectedBlock?.type === "schedule_agenda" ||
  selectedBlock?.type === "calendar_event" ||
  selectedBlock?.type === "map_location" ||
  selectedBlock?.type === "file_share" ||
  selectedBlock?.type === "speed_dating" ||
  selectedBlock?.type === "registry" ||
  selectedBlock?.type === "cart" ||
  selectedBlock?.type === "checkout" ||
  selectedBlock?.type === "poll" ||
  selectedBlock?.type === "form_field" ||
  selectedBlock?.type === "option_button" ||
  selectedBlock?.type === "faq" ||
  selectedBlock?.type === "gallery" ||
  selectedBlock?.type === "rsvp" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "content_panel" ||
  selectedBlock?.type === "countdown" ||
  selectedBlock?.type === "timeline" ||
  selectedBlock?.type === "wave" ||
  selectedBlock?.type === "highlight" ||
  selectedBlock?.type === "summary" ||
  selectedBlock?.type === "visitor_counter";

const showBorderWidthRadiusControls =
  selectedContext.kind === "label" ||
  selectedContext.kind === "cta" ||
  selectedContext.kind === "image" ||
  selectedContext.kind === "imageCarousel" ||
  selectedBlockFromDraft?.type === "gallery" ||
  selectedContext.kind === "shape" ||
  selectedBlock?.type === "thread" ||
  selectedBlock?.type === "enrollment_board" ||
  selectedBlock?.type === "post_board" ||
  selectedBlock?.type === "listing" ||
  selectedBlock?.type === "tournament_display" ||
  selectedBlock?.type === "progress_bar" ||
  selectedBlock?.type === "donation" ||
  selectedBlock?.type === "link_hub" ||
  selectedBlock?.type === "checklist" ||
  selectedBlock?.type === "schedule_agenda" ||
  selectedBlock?.type === "calendar_event" ||
  selectedBlock?.type === "map_location" ||
  selectedBlock?.type === "file_share" ||
  selectedBlock?.type === "speed_dating" ||
  selectedBlock?.type === "registry" ||
  selectedBlock?.type === "cart" ||
  selectedBlock?.type === "form_field" ||
  selectedBlock?.type === "option_button" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "content_panel" ||
  selectedBlock?.type === "countdown" ||
  selectedBlock?.type === "timeline" ||
  selectedBlock?.type === "wave" ||
  selectedBlock?.type === "visitor_counter" ||
  selectedBlock?.type === "summary" ||
  selectedBlock?.type === "highlight";

  const selectedTextValue = getSelectedTextValue(draft, selectedContext);

  const selectedPageAppearanceKey =
    selectedContext.kind === "pageText"
      ? getPageAppearanceKey(selectedContext.blockId)
      : null;

  const selectedPageBackgroundColor =
    selectedPageAppearanceKey &&
    (draft as DraftWithPageExtras).pageBlockAppearance?.[
      selectedPageAppearanceKey
    ]?.backgroundColor
      ? (draft as DraftWithPageExtras).pageBlockAppearance?.[
          selectedPageAppearanceKey
        ]?.backgroundColor
      : "transparent";
  const canvasZoomScale = canvasZoom / 100;

  const pageBackgroundImage =
    (draft as DraftWithPageExtras).pageBackgroundImage?.trim() || "";

  const pageBackgroundImageFit =
    (draft as DraftWithPageExtras).pageBackgroundImageFit ?? "zoom";

    const pageScale = Math.max(
      10,
      Math.min(100, (draft as DraftWithPageExtras).pageScale ?? 85),
    );
  const pageSurfaceStyle = useMemo(() => {
  const backgroundColor =
    (draft as DraftWithPageExtras).pageColor ||
    getCanvasInnerBackgroundStyle(draft, designKey, metadata).backgroundColor;

    const backgroundSize =
      pageBackgroundImageFit === "clip"
        ? "contain"
        : pageBackgroundImageFit === "stretch"
          ? "100% 100%"
          : "cover";

    return {
      backgroundColor,
      backgroundImage: pageBackgroundImage
        ? `url("${pageBackgroundImage}")`
        : undefined,
      backgroundSize,
      backgroundPosition: "center top",
      backgroundRepeat: "no-repeat",
    } as CSSProperties;
  }, [
    draft,
    designKey,
    metadata,
    pageBackgroundImage,
    pageBackgroundImageFit,
  ]);

  useEffect(() => {
  const handleTextShortcut = (event: KeyboardEvent) => {
const isCmd = event.ctrlKey || event.metaKey;
if (!isCmd) return;

if (event.key.toLowerCase() === "s") {
  event.preventDefault();

  void (async () => {
const zoomBeforeSave = canvasZoom;

try {
  await onSaveDraft?.(draft);
  downloadBlueprintSnapshot(draft);
} finally {
  window.requestAnimationFrame(() => {
    setCanvasZoom(zoomBeforeSave);

    window.setTimeout(() => {
      setCanvasZoom(zoomBeforeSave);
    }, 250);
  });
}
  })();

  return;
}

if (!selectedBlock) return;

    const key = event.key.toLowerCase();
    if (!["b", "i", "u"].includes(key)) return;

    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }

    if (
      selectedBlock.type !== "label" &&
      selectedBlock.type !== "text_fx" &&
      selectedBlock.type !== "cta" &&
      selectedBlock.type !== "rich_text"
    ) {
      return;
    }

    event.preventDefault();

    updateSelectedBlock((currentBlock) => {
      if (
        currentBlock.type !== "label" &&
        currentBlock.type !== "text_fx" &&
        currentBlock.type !== "cta" &&
        currentBlock.type !== "rich_text"
      ) {
        return currentBlock;
      }

      const currentStyle = ((currentBlock.data as any).style ?? {}) as TextStyle;

      return {
        ...currentBlock,
        data: {
          ...(currentBlock.data as any),
          style: {
            ...currentStyle,
            bold: key === "b" ? !currentStyle.bold : currentStyle.bold,
            italic: key === "i" ? !currentStyle.italic : currentStyle.italic,
            underline:
              key === "u" ? !currentStyle.underline : currentStyle.underline,
          },
        },
      };
    });
  };

  window.addEventListener("keydown", handleTextShortcut);
  return () => window.removeEventListener("keydown", handleTextShortcut);
}, [draft, onSaveDraft, selectedBlock?.id, selectedBlock?.type, updateSelectedBlock]);
  
  useEffect(() => {
  function handleKey(e: KeyboardEvent) {
    if (!selectedBlock) return;

    // prevent interfering with typing
    const tag = (e.target as HTMLElement)?.tagName;

        const isTyping =
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      (e.target as HTMLElement)?.isContentEditable;

    if (isTyping) return;

    const activeIds =
      selectedBlockIds.length > 0
        ? selectedBlockIds
        : selection.type === "block"
          ? [selection.blockId]
          : selectedBlock?.id
            ? [selectedBlock.id]
            : [];

    if (e.ctrlKey && e.shiftKey && e.key === "ArrowUp") {
      e.preventDefault();
      activeIds.forEach((blockId) => handleBringToFront(blockId));
      return;
    }

    if (e.ctrlKey && e.shiftKey && e.key === "ArrowDown") {
      e.preventDefault();
      activeIds.forEach((blockId) => handleSendToBack(blockId));
      return;
    }

    // ALT + ← = left
    if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      const activeIds =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : selection.type === "block"
      ? [selection.blockId]
      : selectedBlock?.id
        ? [selectedBlock.id]
        : [];

alignSelectedBlockHorizontal("left", activeIds);
    }

    // ALT + ↑ = center
    if (e.altKey && e.key === "ArrowUp") {
      e.preventDefault();
      const activeIds =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : selection.type === "block"
      ? [selection.blockId]
      : selectedBlock?.id
        ? [selectedBlock.id]
        : [];

alignSelectedBlockHorizontal("center", activeIds);
    }

    // ALT + → = right
    if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      const activeIds =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : selection.type === "block"
      ? [selection.blockId]
      : selectedBlock?.id
        ? [selectedBlock.id]
        : [];

alignSelectedBlockHorizontal("right", activeIds);
    }
  }

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [selectedBlock]);
  
  useEffect(() => {
  try {
    window.localStorage.setItem(
      "kht:recent-colors",
      JSON.stringify(recentColors.slice(0, 10)),
    );
  } catch {
    // ignore storage errors
  }
}, [recentColors]);

useEffect(() => {
  if (!fontMenuOpen) return;

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement | null;

    if (target?.closest("[data-font-family-menu='true']")) return;

    setFontMenuOpen(false);
  }

  window.addEventListener("mousedown", handleClickOutside);

  return () => {
    window.removeEventListener("mousedown", handleClickOutside);
  };
}, [fontMenuOpen]);

  useEffect(() => {
    if (!inspectorFocusTarget || !selectedBlock) return;

    const sectionId = inspectorSectionId(inspectorFocusTarget);
    if (sectionId) {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }

    if (
      inspectorFocusTarget.type === "poll-question" &&
      selectedBlock.type === "poll" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = pollQuestionInputRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "poll-option" &&
      selectedBlock.type === "poll" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = pollOptionInputRefs.current[inspectorFocusTarget.optionId];
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "rsvp-heading" &&
      selectedBlock.type === "rsvp" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = rsvpHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-heading" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-target" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownTargetInputRef.current;
      if (el) {
        el.focus();
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-completed" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownCompletedInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "faq-question" &&
      selectedBlock.type === "faq" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = faqQuestionInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "faq-answer" &&
      selectedBlock.type === "faq" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = faqAnswerInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "thread-subject" &&
      selectedBlock.type === "thread" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = threadSubjectInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-heading" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-item-label" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksItemLabelInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-item-url" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksItemUrlInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-heading" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = carouselHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-title" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el =
        carouselItemTitleInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-subtitle" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el =
        carouselItemSubtitleInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-href" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el =
        carouselItemHrefInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }
  }, [inspectorFocusTarget, selectedBlock]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!openToolMenu) return;

      const target = event.target as Node | null;
      if (!target) return;

      const clickedInsideMenu = toolMenuRef.current?.contains(target);
      const clickedInsideBottomBar = bottomBarRef.current?.contains(target);

      if (clickedInsideMenu || clickedInsideBottomBar) return;

      setOpenToolMenu(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenToolMenu(null);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [openToolMenu]);

  useEffect(() => {
function handleCanvasShortcuts(event: KeyboardEvent) {
const blockId =
  "blockId" in selectedContext ? selectedContext.blockId : null;

const activeBlockId =
  blockId ?? selectedBlockIds[0] ?? null;

  const target = event.target as HTMLElement | null;
  const isTyping =
    target?.tagName === "INPUT" ||
    target?.tagName === "TEXTAREA" ||
    target?.tagName === "SELECT" ||
    target?.isContentEditable;

if (isTyping) return;

if (event.key === "Escape") {
  event.preventDefault();
  setSelectedBlockIds([]);
  setSelection(createEmptySelection());
  return;
}

if (event.ctrlKey && event.key.toLowerCase() === "z") {
  event.preventDefault();
  handleUndo();
  return;
}

if (event.ctrlKey && event.key.toLowerCase() === "y") {
  event.preventDefault();
  handleRedo();
  return;
}

if (event.ctrlKey && event.key.toLowerCase() === "a") {
  event.preventDefault();

  const selectableIds = draft.blocks.map((block) => block.id);

  setSelectedBlockIds(selectableIds);
  setSelection(createEmptySelection());
  return;
}

if (!activeBlockId && selectedBlockIds.length === 0) return;

if (event.key === "Delete" || event.key === "Backspace") {
  event.preventDefault();

  const idsToDelete =
    selectedBlockIds.length > 0
      ? selectedBlockIds
      : activeBlockId
        ? [activeBlockId]
        : [];

removeCanvasBlocks(idsToDelete);

setSelectedBlockIds([]);
setSelection(createEmptySelection());
return;
}

  if (!event.ctrlKey) return;

if (event.key.toLowerCase() === "c") {
  const active = document.activeElement;

  const isTyping =
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement ||
    active?.getAttribute("contenteditable") === "true";

  if (isTyping) return;

  const idsToCopy =
    selectedBlockIds.length > 0
      ? selectedBlockIds
      : activeBlockId
        ? [activeBlockId]
        : [];

  if (!idsToCopy.length) return;

  event.preventDefault();
  handleCopyCanvasBlocks(idsToCopy);
  return;
}

if (
  event.key.toLowerCase() === "v" ||
  event.key.toLowerCase() === "d"
) {
  event.preventDefault();

  const idsToDuplicate =
    selectedBlockIds.length > 0
      ? selectedBlockIds
      : activeBlockId
        ? [activeBlockId]
        : [];

handleDuplicateCanvasBlocks(idsToDuplicate);

return;
}

  if (event.key.toLowerCase() === "x") {
    event.preventDefault();
const idsToDelete =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : activeBlockId
      ? [activeBlockId]
      : [];

removeCanvasBlocks(idsToDelete);

setSelectedBlockIds([]);
setSelection(createEmptySelection());
return;
  }

  if (event.shiftKey && event.key === "ArrowDown") {
    event.preventDefault();
    handleSendToBack(activeBlockId);
    setSelection(selectionFromCanvasBlockId(activeBlockId));
    return;
  }

  if (event.shiftKey && event.key === "ArrowUp") {
    event.preventDefault();
    handleBringToFront(activeBlockId);
    setSelection(selectionFromCanvasBlockId(activeBlockId));
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    handleBringForward(activeBlockId);
    setSelection(selectionFromCanvasBlockId(activeBlockId));
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    handleSendBackward(activeBlockId);
    setSelection(selectionFromCanvasBlockId(activeBlockId));
  }
}

  window.addEventListener("keydown", handleCanvasShortcuts);

  return () => {
    window.removeEventListener("keydown", handleCanvasShortcuts);
  };
}, [selectedContext, draft, selectedBlockIds]);


  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      const isTypingTarget =
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable === true;

if (isTypingTarget) return;

const hasMovableSelection =
  selectedBlockIds.length > 0 || Boolean(selectedCanvasBlockId);

if (!hasMovableSelection) return;

      const amount = event.shiftKey ? 1 : 0.25;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgeSelectedBlock("left", amount);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgeSelectedBlock("right", amount);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        nudgeSelectedBlock("up", amount);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        nudgeSelectedBlock("down", amount);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCanvasBlockId, selectedBlockIds, metadata]);

  useEffect(() => {
    if (isHistoryActionRef.current) {
      isHistoryActionRef.current = false;
      lastDraftRef.current = cloneDraft(draft);
      return;
    }

    const previous = JSON.stringify(lastDraftRef.current);
    const current = JSON.stringify(draft);

    if (previous !== current) {
      setUndoStack((prev) => [...prev, cloneDraft(lastDraftRef.current)]);
      setRedoStack([]);
      lastDraftRef.current = cloneDraft(draft);
    }
  }, [draft]);

function normalizeRichTextHtml(html?: string) {
  const raw = String(html ?? "").trim();

  if (
    raw === "" ||
    raw === "<br>" ||
    raw === "<p><br></p>" ||
    raw === "<div><br></div>" ||
    raw === "<ul><li><br></li></ul>" ||
    raw === "<ol><li><br></li></ol>"
  ) {
    return "";
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = raw;

  wrapper.querySelectorAll("script, style, iframe, object, embed, meta, link").forEach((node) => {
    node.remove();
  });

  wrapper.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();

      if (
        name.startsWith("on") ||
        name === "class" ||
        name === "id" ||
        name === "data-mce-style" ||
        name === "data-mce-selected"
      ) {
        node.removeAttribute(attr.name);
      }
    });

    if (node instanceof HTMLElement) {
const allowedStyles = [
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "color",
];

      const nextStyle = allowedStyles
        .map((key) => {
          const value = node.style.getPropertyValue(key);
          return value ? `${key}: ${value}` : "";
        })
        .filter(Boolean)
        .join("; ");

      if (nextStyle) {
        node.setAttribute("style", nextStyle);
      } else {
        node.removeAttribute("style");
      }
    }

    if (node instanceof HTMLAnchorElement) {
      const href = node.getAttribute("href") ?? "";

      if (!/^https?:\/\//i.test(href) && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
        node.removeAttribute("href");
      } else {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    }
  });

  const normalized = wrapper.innerHTML.trim();

  if (
    normalized === "" ||
    normalized === "<br>" ||
    normalized === "<p><br></p>" ||
    normalized === "<div><br></div>"
  ) {
    return "";
  }

  return normalized;
}

function isRichTextHtmlEmpty(html?: string) {
  return normalizeRichTextHtml(html) === "";
}

function getPlainTextFromRichTextHtml(html?: string) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(html ?? "");
  return wrapper.textContent?.trim() ?? "";
}

useEffect(() => {
  if (selectedBlock?.type !== "rsvp") return;
  if (selectedRsvpElementKey === "form") return;

  const order = selectedBlock.data.elementOrder ?? [];
  if (!order.includes(selectedRsvpElementKey)) {
    setSelectedRsvpElementKey("heading");
  }
}, [selectedBlock, selectedRsvpElementKey]);

useEffect(() => {
  if (selectedBlock?.type !== "rich_text") return;

  const normalized = normalizeRichTextHtml(
  typeof selectedBlock.data.contentHtml === "string"
    ? selectedBlock.data.contentHtml
    : selectedBlock.data.content ?? "",
);
  setIsRichTextEditorEmpty(isRichTextHtmlEmpty(normalized));

  if (!richTextEditorRef.current) return;

  if (richTextEditorRef.current.innerHTML !== normalized) {
    richTextEditorRef.current.innerHTML = normalized;
  }
}, [
  selectedBlock?.id,
  selectedBlock?.type,
  selectedBlock?.type === "rich_text"
  ? selectedBlock.data.contentHtml ?? selectedBlock.data.content
  : null,
]);

  function pushRecentColor(color: string) {
  if (!color) return;

  setRecentColors((prev) => {
    const normalized = color.toLowerCase();
    const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized)];
    return next.slice(0, 10);
  });
}


async function uploadBuilderImageFile(file: File) {
  return uploadImage(file);
}

async function uploadBuilderAudioFile(file: File) {
  return uploadAudio(file);
}

async function pickColorWithEyeDropper(
  onPick: (color: string) => void,
) {
  try {
    const EyeDropperCtor = (window as Window & {
      EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    }).EyeDropper;

    if (!EyeDropperCtor) {
      setEditorUploadError(
        "Eyedropper is not available in this browser.",
      );
      return;
    }

    const eyeDropper = new EyeDropperCtor();
    const result = await eyeDropper.open();

    if (result?.sRGBHex) {
      onPick(result.sRGBHex);
      pushRecentColor(result.sRGBHex);
    }
  } catch {
    // user cancelled or browser blocked it
  }
}

function resolveMediaLogoFromUrl(url: string) {
  const value = url.toLowerCase();

  if (value.includes("discord")) return "/media-logos/discord.png";
  if (value.includes("facebook")) return "/media-logos/facebook.png";
  if (value.includes("fanvue")) return "/media-logos/fanvue.png";
  if (value.includes("instagram")) return "/media-logos/instagram.png";
  if (value.includes("linkedin")) return "/media-logos/linkedin.png";
  if (value.includes("onlyfans")) return "/media-logos/onlyfans.png";
  if (value.includes("patreon")) return "/media-logos/patreon.png";
  if (value.includes("pinterest")) return "/media-logos/pinterest.png";
  if (value.includes("reddit")) return "/media-logos/reddit.png";
  if (value.includes("signal")) return "/media-logos/signal.png";
  if (value.includes("slack")) return "/media-logos/slack.png";
  if (value.includes("snapchat")) return "/media-logos/snapchat.png";
  if (value.includes("telegram")) return "/media-logos/telegram.png";
  if (value.includes("threads")) return "/media-logos/threads.png";
  if (value.includes("tiktok")) return "/media-logos/tiktok.png";
  if (value.includes("tumblr")) return "/media-logos/tumblr.png";
  if (value.includes("twitch")) return "/media-logos/twitch.png";
  if (value.includes("wechat")) return "/media-logos/wechat.png";
  if (value.includes("whatsapp")) return "/media-logos/whatsapp.png";
  if (value.includes("youtube") || value.includes("youtu.be")) return "/media-logos/youtube.png";
  if (value.includes("twitter") || value.includes("x.com")) return "/media-logos/x.png";

  return "/media-logos/website.png";
}

function applyTextColor(value: string) {
  if (
    selectedBlock?.type === "donation" &&
    donationStyleTarget === "buttons"
  ) {
    updateSelectedBlock((block) =>
      block.type !== "donation"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              buttonStyle: {
                ...(((block.data as any).buttonStyle ?? {})),
                color: value,
              },
            },
          },
    );

    pushRecentColor(value);
    return;
  }

if (selectedBlock?.type === "gallery") {
  const targetStyleKey =
    galleryTextTarget === "description"
      ? "descriptionStyle"
      : galleryTextTarget === "metadata"
        ? "metadataStyle"
        : "titleStyle";

  updateSelectedBlock((block) =>
    block.type !== "gallery"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            [targetStyleKey]: {
              ...((block.data as any)[targetStyleKey] ?? {}),
              color: value,
            },
          },
        },
  );

  pushRecentColor(value);
  return;
}

  applyStylePatch({ color: value });
  pushRecentColor(value);
}

function withRichTextEditor(action: (editor: HTMLDivElement) => void) {
  const editor = richTextEditorRef.current;
  if (!editor || selectedBlock?.type !== "rich_text") return;

  editor.focus();
  action(editor);

  const normalized = normalizeRichTextHtml(editor.innerHTML);
  setIsRichTextEditorEmpty(isRichTextHtmlEmpty(normalized));

  updateSelectedBlock((block) =>
    block.type !== "rich_text"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            content: normalized,
            contentHtml: normalized,
            plainText: getPlainTextFromRichTextHtml(normalized),
          },
        },
  );
}

function normalizeRichTextLinkHref(value: string) {
  const raw = value.trim();

  if (!raw) return "";

  if (
    raw.startsWith("/") ||
    raw.startsWith("#") ||
    /^https?:\/\//i.test(raw) ||
    /^mailto:/i.test(raw) ||
    /^tel:/i.test(raw) ||
    raw.startsWith("//")
  ) {
    return raw;
  }

  return `//${raw}`;
}

function openRichTextLinkModal() {
  setRichTextLinkValue("https://");
  setRichTextLinkModalOpen(true);
}

function applyRichTextLinkFromModal() {
  const raw = richTextLinkValue.trim();
  if (!raw) {
    setRichTextLinkModalOpen(false);
    return;
  }

  const href = normalizeRichTextLinkHref(raw);

  withRichTextEditor((editor) => {
    document.execCommand("createLink", false, href);

    const anchors = editor.querySelectorAll("a");
    const lastAnchor = anchors[anchors.length - 1];

    if (lastAnchor) {
      lastAnchor.setAttribute("href", href);
      lastAnchor.setAttribute("target", "_blank");
      lastAnchor.setAttribute("rel", "noopener noreferrer");
      lastAnchor.setAttribute("data-raw-href", raw);
    }
  });

  setRichTextLinkModalOpen(false);
}

function clearRichTextEditor() {
  if (selectedBlock?.type !== "rich_text") return;

  if (richTextEditorRef.current) {
    richTextEditorRef.current.innerHTML = "";
  }

  setIsRichTextEditorEmpty(true);

  updateSelectedBlock((block) =>
    block.type !== "rich_text"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            content: "",
            listType: "none",
            linkUrl: "",
            style: {
              ...(block.data.style ?? {}),
              bold: false,
              italic: false,
              underline: false,
            },
          },
        },
  );
}

function applyPageTextBoxBackground(value: string) {
  applyPageTextBackgroundColor(value);
  pushRecentColor(value);
}

function applyFillColor(value: string) {
  if (selectedBlock?.type === "countdown") {
    if (countdownStyleTarget === "tiles") {
      updateSelectedBlock((block) =>
        block.type !== "countdown"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                tileStyle: {
                  ...((block.data as any).tileStyle ?? {}),
                  backgroundColor: value,
                },
              },
            },
      );

      pushRecentColor(value);
      return;
    }

    updateSelectedBlock((block) =>
      block.type !== "countdown"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              backgroundColor: value,
            },
          },
    );

    pushRecentColor(value);
    return;
  }

    if (selectedBlock?.type === "timeline") {
    updateSelectedBlock((block) =>
      block.type !== "timeline"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              backgroundColor: value,
            },
          },
    );

    pushRecentColor(value);
    return;
  }

    if (selectedBlock?.type === "icon") {
    updateSelectedBlock((block) =>
      block.type !== "icon"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              icon: {
                ...block.data.icon,
                color: value,
              },
            },
          },
    );

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "donation") {
    updateSelectedBlock((block) => {
      if (block.type !== "donation") return block;

      if (donationStyleTarget === "buttons") {
        return {
          ...block,
          data: {
            ...block.data,
            buttonStyle: {
              ...((block.data as any).buttonStyle ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor: value,
        },
      };
    });

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "faq") {
    updateSelectedBlock((block) => {
      if (block.type !== "faq") return block;

      if (faqStyleTarget === "section") {
        return {
          ...block,
          data: {
            ...block.data,
            sectionStyle: {
              ...((block.data as any).sectionStyle ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      if (faqStyleTarget === "question") {
        return {
          ...block,
          data: {
            ...block.data,
            questionStyle: {
              ...((block.data as any).questionStyle ?? block.data.style ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      if (faqStyleTarget === "answer") {
        return {
          ...block,
          data: {
            ...block.data,
            answerStyle: {
              ...((block.data as any).answerStyle ?? block.data.style ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor: value,
        },
      };
    });

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "progress_bar") {
    updateSelectedBlock((block) => {
      if (block.type !== "progress_bar") return block;

      if (progressBarStyleTarget === "meterContext") {
        return {
          ...block,
          data: {
            ...block.data,
            contextStyle: {
              ...((block.data as any).contextStyle ?? {}),
              color: value,
              align: "center",
            },
          },
        };
      }

      if (progressBarStyleTarget === "meterCaption") {
        return {
          ...block,
          data: {
            ...block.data,
            meterCaptionStyle: {
              ...((block.data as any).meterCaptionStyle ?? {}),
              color: value,
              align: "center",
            },
          },
        };
      }

      if (progressBarStyleTarget === "bar") {
        return {
          ...block,
          data: {
            ...block.data,
            barStyle: {
              ...((block.data as any).barStyle ?? {}),
              color: value,
            },
          },
        };
      }

      if (progressBarStyleTarget === "scope") {
        return {
          ...block,
          data: {
            ...block.data,
            barStyle: {
              ...((block.data as any).barStyle ?? {}),
              scopeBackgroundColor: value,
            },
          },
        };
      }

      if (progressBarStyleTarget === "context") {
        return {
          ...block,
          data: {
            ...block.data,
            contextStyle: {
              ...((block.data as any).contextStyle ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor: value,
        },
      };
    });

    pushRecentColor(value);
    return;
  }
if (selectedBlock?.type === "checkout") {
  updateSelectedBlock((block) =>
    block.type !== "checkout"
      ? block
      : {
          ...block,
          appearance: {
            ...block.appearance,
            backgroundColor: value,
          },
        },
  );

  pushRecentColor(value);
  return;
}

if (selectedBlock?.type === "wave") {
  updateSelectedBlock((block) =>
    block.type !== "wave"
      ? block
      : {
          ...block,
          appearance: {
            ...block.appearance,
            backgroundColor: value,
          },
        },
  );

  pushRecentColor(value);
  return;
}

if (selectedBlock?.type === "link_hub") {
  updateSelectedBlock((block) =>
    block.type !== "link_hub"
      ? block
      : linkHubTextTarget === "form"
        ? {
            ...block,
            appearance: {
              ...block.appearance,
              backgroundColor: value,
            },
          }
        : {
            ...block,
            data: {
              ...block.data,
              cardBackgroundColor: value,
              cardTransparentBackground: false,
            },
          },
  );

  pushRecentColor(value);
  return;
}

if (selectedBlock?.type === "form_field") {
  updateSelectedBlock((block) => {
    if (block.type !== "form_field") return block;

    if (formFieldTextTarget === "inputText") {
      return {
        ...block,
        data: {
          ...block.data,
          inputStyle: {
            ...((block.data as any).inputStyle ?? block.data.style ?? {}),
            color: value,
          },
        },
      };
    }

    return {
      ...block,
      data: {
        ...block.data,
        style: {
          ...((block.data as any).style ?? {}),
          color: value,
        },
        labelStyle: {
          ...((block.data as any).labelStyle ?? block.data.style ?? {}),
          color: value,
        },
      },
    };
  });

  pushRecentColor(value);
  return;
}

if (selectedBlock?.type === "option_button") {
  updateSelectedBlock((block) => {
    if (block.type !== "option_button") return block;

    const styleKey =
      optionButtonTextTarget === "description"
        ? "descriptionStyle"
        : optionButtonTextTarget === "heading"
          ? "style"
          : "labelStyle";

    return {
      ...block,
      data: {
        ...block.data,
        [styleKey]: {
          ...((block.data as any)[styleKey] ?? {}),
          color: value,
        },
      },
    };
  });

  pushRecentColor(value);
  return;
}

if (selectedBlock?.type === "highlight") {
  updateSelectedBlock((block) => {
    if (block.type !== "highlight") return block;

    if (highlightStyleTarget === "heading") {
      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor: value,
        },
      };
    }

    return {
      ...block,
      data: {
        ...block.data,
        cardBackgroundColor: value,
      },
    };
  });

  pushRecentColor(value);
  return;
}

  applyAppearancePatch({ backgroundColor: value });
  pushRecentColor(value);
}

function recentColorButtonClass() {
  return "h-7 w-7 shrink-0 rounded-md border border-white/15 transition hover:scale-105";
}

function eyedropperButtonClass() {
  return "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white transition hover:bg-white/10";
}


function applyBorderColor(value: string) {
  if (selectedBlock?.type === "countdown") {
    if (countdownStyleTarget === "tiles") {
      updateSelectedBlock((block) =>
        block.type !== "countdown"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                tileStyle: {
                  ...((block.data as any).tileStyle ?? {}),
                  borderColor: value,
                },
              },
            },
      );

      pushRecentColor(value);
      return;
    }

    updateSelectedBlock((block) =>
      block.type !== "countdown"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              borderColor: value,
            },
          },
    );

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "progress_bar" && progressBarStyleTarget === "scope") {
    updateSelectedBlock((block) =>
      block.type !== "progress_bar"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              barStyle: {
                ...((block.data as any).barStyle ?? {}),
                borderColor: value,
              },
            },
          },
    );

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "faq" && faqStyleTarget === "section") {
    updateSelectedBlock((block) =>
      block.type !== "faq"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              sectionStyle: {
                ...((block.data as any).sectionStyle ?? {}),
                borderColor: value,
              },
            },
          },
    );

    pushRecentColor(value);
    return;
  }

  applyAppearancePatch({ borderColor: value });
  pushRecentColor(value);
}

function openResetDraftModal() {
  setResetDraftModalOpen(true);
}

function confirmResetDraft() {
  const resetDraft = cloneDraft(initialDraftRef.current);

  isHistoryActionRef.current = true;
  setSelection(createEmptySelection());
  setOpenToolMenu(null);
  setRedoStack([]);
  setUndoStack([]);
  lastDraftRef.current = cloneDraft(resetDraft);
  setDraft(resetDraft);
  setResetDraftModalOpen(false);
}

function updatePageLength(value: PageLengthOption) {
  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    pageLength: value,
  }));
}

async function uploadPuzzleImageToSelectedBlock(blockId: string) {
  await openImagePicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      const uploaded = await uploadBuilderImageFile(file);

      setDraft((current) => ({
        ...current,
        blocks: current.blocks.map((block) =>
          block.id !== blockId || block.type !== "puzzle"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  imageUrl: uploaded.url,
                  imageStoragePath: uploaded.storagePath,
                  imageSizeBytes: uploaded.imageSizeBytes,
                  imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
                  imageMimeType: uploaded.imageMimeType,
                  imageAlt: file.name || "Puzzle image",
                  generatedAt: "",
                  pieces: [],
                },
              },
        ),
      }));
    },
  });
}

async function openAudioPicker(options: {
  onSelect: (files: File[]) => Promise<void> | void;
}) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  input.multiple = false;
  input.click();

  input.onchange = async () => {
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    await options.onSelect(files);
  };
}

async function uploadAudioToSelectedBlock(blockId: string) {
  await openAudioPicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      try {
        setEditorUploadError("");

        const uploaded = await uploadBuilderAudioFile(file);

        updateSelectedBlock((block) =>
          block.id !== blockId || block.type !== "audio"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  audioUrl: uploaded.url,
                  audioStoragePath: uploaded.storagePath,
                  audioMimeType: uploaded.audioMimeType,
                  audioSizeBytes: uploaded.audioSizeBytes,
                },
              },
        );
      } catch {
        setEditorUploadError("Audio upload failed.");
      }
    },
  });
}

function cancelResetDraft() {
  setResetDraftModalOpen(false);
}

const handleVideoUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const signedRes = await fetch("/api/video/signed-upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mime: file.type || "application/octet-stream",
      }),
    });

    const signedData = await signedRes.json().catch(() => ({}));

    if (!signedRes.ok || !signedData?.ok || !signedData?.signedUrl) {
      setEditorUploadError(
        signedData?.error || `Failed to prepare video upload. Status: ${signedRes.status}`,
      );
      return;
    }

    const uploadRes = await fetch(signedData.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || signedData.mime || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      setEditorUploadError(`Failed to upload video. Status: ${uploadRes.status}`);
      return;
    }

    updateSelectedBlock((block) =>
      block.type !== "video"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              videoUrl: signedData.publicUrl,
              videoStoragePath: signedData.storagePath,
              videoSizeBytes: file.size,
              videoMimeType: file.type,
            },
          },
    );

    setEditorUploadError("");
  } catch (err) {
    console.error(err);
    setEditorUploadError("Upload failed");
  } finally {
    e.target.value = "";
  }
};

function applyStylePatch(patch: Partial<TextStyle>) {


    if (selectedBlockFromDraft?.type === "calendar_event") {
    const targetStyleKey =
      calendarEventTextTarget === "heading"
        ? "headingStyle"
        : calendarEventTextTarget === "subtitle"
          ? "subtitleStyle"
          : calendarEventTextTarget === "eventTitle"
            ? "eventTitleStyle"
            : calendarEventTextTarget === "eventDate"
              ? "eventDateStyle"
              : "eventDetailsStyle";

    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlockFromDraft.id && block.type === "calendar_event"
          ? {
              ...block,
              data: {
                ...block.data,
                [targetStyleKey]: {
                  ...((block.data as any)[targetStyleKey] ??
                    block.data.style ??
                    {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));

    return;
  }
  
  if (selectedBlock?.type === "text_fx") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "text_fx"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "faq") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "faq"
        ? {
            ...block,
            data: {
              ...block.data,
              ...(faqStyleTarget === "question"
                ? {
                    questionStyle: {
                      ...((block.data as any).questionStyle ?? block.data.style ?? {}),
                      ...patch,
                    },
                  }
                : faqStyleTarget === "answer"
                  ? {
                      answerStyle: {
                        ...((block.data as any).answerStyle ?? block.data.style ?? {}),
                        ...patch,
                      },
                    }
                  : {
                      style: {
                        ...(block.data.style ?? {}),
                        ...patch,
                      },
                    }),
            },
          }
        : block,
    ),
  }));
  return;
}

  if (selectedBlock?.type === "cta") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "thread") {
    const target = selectedBlock.data.threadStyleTarget ?? "message";

    const targetStyleKey =
      target === "post_block"
        ? "postBlockStyle"
        : target === "subject"
          ? "subjectStyle"
          : target === "name"
            ? "nameStyle"
            : target === "post_button"
              ? "postButtonTextStyle"
              : target === "message"
                ? "messageStyle"
                : "style";

    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "thread"
          ? {
              ...block,
              data: {
                ...block.data,
                [targetStyleKey]: {
                  fontSize:
                    target === "subject"
                      ? 18
                      : target === "name" || target === "post_button"
                        ? 14
                        : target === "message"
                          ? 15
                          : target === "post_block"
                            ? 16
                            : 30,
                  ...((block.data as any)[targetStyleKey] ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "post_board") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== selectedBlock.id || block.type !== "post_board") {
        return block;
      }

      const targetStyleKey =
        postBoardStyleTarget === "block_heading"
          ? "blockHeadingStyle"
          : postBoardStyleTarget === "card"
            ? "cardStyle"
            : postBoardStyleTarget === "heading"
              ? "headingStyle"
              : postBoardStyleTarget === "body"
                ? "bodyStyle"
                : postBoardStyleTarget === "buttons"
                  ? "buttonStyle"
                  : "style";

      return {
        ...block,
        data: {
          ...block.data,
[targetStyleKey]: {
  ...getPostBoardDefaultStyle(targetStyleKey),
  ...((block.data as any)[targetStyleKey] ?? {}),
  ...patch,
},
        },
      };
    }),
  }));

  return;
}

if (selectedBlockFromDraft?.type === "gallery") {
  updateSelectedBlock((block) =>
    applyGalleryTextStylePatch(block, galleryTextTarget, patch),
  );

  return;
}


if (selectedBlock?.type === "enrollment_board") {
  const target = enrollmentBoardStyleTarget;

  const targetStyleKey =
    target === "heading"
      ? "headingStyle"
      : target === "subtitle"
        ? "subtitleStyle"
        : target === "imageLabel"
          ? "imageLabelStyle"
          : target === "memberName"
            ? "memberNameStyle"
            : target === "memberQuote"
              ? "memberQuoteStyle"
              : target === "memberTotal"
                ? "memberTotalStyle"
                : target === "inputs"
                  ? "inputStyle"
                  : target === "button"
                    ? "buttonStyle"
                    : target === "cards"
                      ? "cardStyle"
                      : target === "list"
                        ? "listStyle"
                        : "style";

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id &&
      block.type === "enrollment_board"
        ? {
            ...block,
            data: {
              ...block.data,
              [targetStyleKey]: {
                ...((block.data as any)[targetStyleKey] ?? {}),
                ...patch,
              },
            },
          }
        : block,
    ),
  }));

  return;
}

if (selectedBlock?.type === "image") {
  updateSelectedBlock((block: any) =>
    applyImageCaptionStylePatch(block, patch),
  );

  return;
}

if (selectedBlock?.type === "video") {
  updateSelectedBlock((block) =>
    applyVideoTextStylePatch(block, videoTextTarget, patch),
  );

  return;
}

if (selectedBlock?.type === "image_carousel") {
  updateSelectedBlock((block) =>
    applyCarouselTextStylePatch(block, carouselTextTarget, patch),
  );

  return;
}

if ((selectedBlockFromDraft as any)?.type === "form_field") {
  updateSelectedBlock((block) =>
    applyFormFieldTextStylePatch(block, formFieldTextTarget, patch),
  );

  return;
}

if ((selectedBlockFromDraft as any)?.type === "option_button") {
  const targetBlockId = (selectedBlockFromDraft as any).id;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== targetBlockId || block.type !== "option_button") {
        return block;
      }

      const styleKey =
        optionButtonTextTarget === "description"
          ? "descriptionStyle"
          : optionButtonTextTarget === "heading"
            ? "style"
            : "labelStyle";

      return {
        ...block,
        data: {
          ...block.data,
          [styleKey]: {
            ...((block.data as any)[styleKey] ?? {}),
            ...patch,
          },
        },
      };
    }),
  }));

  return;
}


if (selectedBlockFromDraft?.type === "summary") {
  const summaryBlock = selectedBlockFromDraft;
  const targetBlockId = summaryBlock.id;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== targetBlockId || block.type !== "summary") {
        return block;
      }

const styleKey =
  summaryStyleTarget === "header"
    ? "headerStyle"
    : summaryStyleTarget === "subheader"
      ? "subheaderStyle"
      : summaryStyleTarget === "contentLabel"
        ? "labelStyle"
        : summaryStyleTarget === "content"
          ? "valueStyle"
          : summaryStyleTarget === "footerLabel"
            ? "footerLabelStyle"
            : summaryStyleTarget === "footerAggregate"
              ? "footerAggregateStyle"
              : summaryStyleTarget === "footerCaption"
                ? "footerCaptionStyle"
                : "valueStyle";

      return {
        ...block,
        data: {
          ...block.data,
          [styleKey]: {
            ...((block.data as any)[styleKey] ??
              (block.data as any).style ??
              {}),
            ...patch,
          },
        },
      };
    }),
  }));

  return;
}

  if (selectedBlock?.type === "highlight") {
    const selectedHighlightId = selectedBlock.id;
    const target = highlightStyleTarget;

    requestAnimationFrame(() => {
      setDraft((prev) => {
        let changed = false;

        const nextBlocks = prev.blocks.map((block) => {
          if (block.id !== selectedHighlightId || block.type !== "highlight") {
            return block;
          }

const currentStyle =
  target === "value"
    ? (block.data.valueStyle ?? block.data.bodyStyle ?? block.data.style ?? {})
    : target === "body"
      ? (block.data.bodyStyle ?? block.data.style ?? {})
      : (block.data.headingStyle ?? block.data.style ?? {});

          const nextStyle = {
            ...currentStyle,
            ...patch,
          };

          const isSame =
            (currentStyle.fontFamily ?? null) === (nextStyle.fontFamily ?? null) &&
            (currentStyle.fontSize ?? null) === (nextStyle.fontSize ?? null) &&
            (currentStyle.bold ?? false) === (nextStyle.bold ?? false) &&
            (currentStyle.italic ?? false) === (nextStyle.italic ?? false) &&
            (currentStyle.underline ?? false) === (nextStyle.underline ?? false) &&
            (currentStyle.strike ?? false) === (nextStyle.strike ?? false) &&
            (currentStyle.align ?? "left") === (nextStyle.align ?? "left") &&
            (currentStyle.color ?? null) === (nextStyle.color ?? null);

          if (isSame) {
            return block;
          }

          changed = true;

          return {
            ...block,
            data: {
              ...block.data,
...(target === "value"
  ? { valueStyle: nextStyle }
  : target === "body"
    ? { bodyStyle: nextStyle }
    : { headingStyle: nextStyle }),
            },
          };
        });

        return changed ? { ...prev, blocks: nextBlocks } : prev;
      });
    });

    return;
  }

  if (selectedBlock?.type === "visitor_counter") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "visitor_counter"
        ? {
            ...block,
            data: {
              ...block.data,
              style: {
                ...(block.data.style ?? {}),
                ...patch,
              },
              numberStyle: {
                ...((block.data as any).numberStyle ?? block.data.style ?? {}),
                ...patch,
              },
              labelStyle: {
                ...((block.data as any).labelStyle ?? block.data.style ?? {}),
                ...patch,
              },
              tileStyle: {
                ...((block.data as any).tileStyle ?? block.data.style ?? {}),
                ...patch,
              },
            },
          }
        : block,
    ),
  }));

  return;
}

if (selectedBlock?.type === "progress_bar") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "progress_bar"
        ? {
            ...block,
            data: {
              ...block.data,
              ...(progressBarStyleTarget === "bar" ||
              progressBarStyleTarget === "scope"
                ? {
                    barStyle: {
                      ...((block.data as any).barStyle ?? {}),
                      ...patch,
                    },
                  }
                : progressBarStyleTarget === "context" ||
                    progressBarStyleTarget === "meterContext"
                  ? {
                      contextStyle: {
                        ...((block.data as any).contextStyle ?? {}),
                        ...patch,
                        align:
                          progressBarStyleTarget === "meterContext"
                            ? "center"
                            : ((patch as any).align ?? undefined),
                      },
                    }
                  : progressBarStyleTarget === "meterCaption"
                    ? {
                        meterCaptionStyle: {
                          ...((block.data as any).meterCaptionStyle ?? {}),
                          ...patch,
                          align: "center",
                        },
                      }
                    : {
                        style: {
                          ...(block.data.style ?? {}),
                          ...patch,
                        },
                      }),
            },
          }
        : block,
    ),
  }));
  return;
}

if (selectedBlock?.type === "donation") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== selectedBlock.id || block.type !== "donation") {
        return block;
      }

      if (donationStyleTarget === "buttons") {
        return {
          ...block,
          data: {
            ...block.data,
            buttonStyle: {
              ...(((block.data as any).buttonStyle ?? {})),
              ...patch,
            },
          },
        };
      }

      return {
        ...block,
        data: {
          ...block.data,
          style: {
            ...(block.data.style ?? {}),
            ...patch,
          },
        },
      };
    }),
  }));
  return;
}

if (selectedBlock?.type === "link_hub") {
  const targetStyleKey =
    linkHubTextTarget === "label"
      ? "labelStyle"
      : linkHubTextTarget === "description"
        ? "descriptionStyle"
        : linkHubTextTarget === "url"
          ? "urlStyle"
          : "style";

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "link_hub"
        ? {
            ...block,
            data: {
              ...block.data,
              [targetStyleKey]: {
                ...((block.data as any)[targetStyleKey] ?? block.data.style ?? {}),
                ...patch,
              },
            },
          }
        : block,
    ),
  }));
  return;
}

  if (selectedBlock?.type === "checklist") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "checklist"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "schedule_agenda") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "schedule_agenda"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "map_location") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "map_location"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "file_share") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "file_share"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "speed_dating") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "speed_dating"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "pop_balloon") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "pop_balloon"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "registry") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "registry"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

if (selectedBlock?.type === "timeline") {
  const targetId = selectedBlock.id;

  const targetStyleKey =
    timelineStyleTarget === "title"
      ? "titleStyle"
      : timelineStyleTarget === "date"
        ? "dateStyle"
        : timelineStyleTarget === "entryTitle"
          ? "entryTitleStyle"
          : timelineStyleTarget === "subtitle"
            ? "subtitleStyle"
            : "descriptionStyle";

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === targetId && block.type === "timeline"
        ? {
            ...block,
            data: {
              ...block.data,
              [targetStyleKey]: {
                ...((block.data as any)[targetStyleKey] ?? {}),
                ...patch,
              },
            },
          }
        : block,
    ),
  }));

  return;
}

if (selectedBlock?.type === "countdown") {
  const targetId = selectedBlock.id;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== targetId || block.type !== "countdown") {
        return block;
      }

      const data = block.data as any;

      if (countdownStyleTarget === "values") {
        return {
          ...block,
          data: {
            ...data,
            standardValueStyle: {
              ...(data.standardValueStyle ?? data.style ?? {}),
              ...patch,
            },
          },
        };
      }

      if (countdownStyleTarget === "units") {
        return {
          ...block,
          data: {
            ...data,
            standardUnitStyle: {
              ...(data.standardUnitStyle ?? data.style ?? {}),
              ...patch,
            },
          },
        };
      }

      if (countdownStyleTarget === "heading") {
        return {
          ...block,
          data: {
            ...data,
            headingStyle: {
              ...(data.headingStyle ?? data.style ?? {}),
              ...patch,
            },
          },
        };
      }

      if (countdownStyleTarget === "tiles") {
        return {
          ...block,
          data: {
            ...data,
            tileStyle: {
              ...(data.tileStyle ?? data.style ?? {}),
              ...patch,
            },
          },
        };
      }

      return {
        ...block,
        data: {
          ...data,
          style: {
            ...(data.style ?? {}),
            ...patch,
          },
        },
      };
    }),
  }));

  return;
}

if (selectedBlock?.type === "content_panel") {
  updateSelectedBlock((block) =>
    applyContentPanelTextStylePatch(
      block,
      contentPanelTextTarget,
      patch,
    ),
  );

  return;
}

  if (selectedBlock?.type === "rich_text") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "rich_text"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

if (selectedBlock?.type === "tournament_display") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== selectedBlock.id || block.type !== "tournament_display") {
        return block;
      }

      if (tournamentDisplayStyleTarget === "background") {
        const appearancePatch = patch as any;

        return {
          ...block,
          appearance: {
            ...block.appearance,
            ...(appearancePatch.backgroundColor !== undefined
              ? { backgroundColor: appearancePatch.backgroundColor }
              : {}),
            ...(appearancePatch.backgroundOpacity !== undefined
              ? { backgroundOpacity: appearancePatch.backgroundOpacity }
              : {}),
            ...(appearancePatch.borderColor !== undefined
              ? { borderColor: appearancePatch.borderColor }
              : {}),
            ...(appearancePatch.borderWidth !== undefined
              ? { borderWidth: appearancePatch.borderWidth }
              : {}),
            ...(appearancePatch.borderRadius !== undefined
              ? { borderRadius: appearancePatch.borderRadius }
              : {}),
          },
          data: {
            ...block.data,
            style: {
              ...((block.data as any).style ?? {}),
              ...appearancePatch,
            },
          },
        };
      }

      const styleKey =
        tournamentDisplayStyleTarget === "tournamentName"
          ? "tournamentNameStyle"
          : tournamentDisplayStyleTarget === "season"
            ? "seasonStyle"
            : tournamentDisplayStyleTarget === "leftDivisionLabel"
              ? "leftDivisionLabelStyle"
              : tournamentDisplayStyleTarget === "rightDivisionLabel"
                ? "rightDivisionLabelStyle"
                : tournamentDisplayStyleTarget === "teamNames"
                  ? "matchCardBackgroundStyle"
                  : tournamentDisplayStyleTarget === "record"
                    ? "recordStyle"
                    : tournamentDisplayStyleTarget === "score"
                      ? "scoreStyle"
                      : tournamentDisplayStyleTarget === "status"
                        ? "statusStyle"
                        : tournamentDisplayStyleTarget === "finalsLabel"
                          ? "finalsCardStyle"
                          : tournamentDisplayStyleTarget === "champion"
                            ? "championStyle"
                            : "style";

      return {
        ...block,
        data: {
          ...block.data,
          [styleKey]: {
            ...((block.data as any)[styleKey] ?? {}),
            ...patch,
          },
        },
      };
    }),
  }));

  return;
}

if (selectedBlock?.type === "listing") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "listing"
        ? {
            ...block,
            data: {
              ...block.data,
              ...(listingStyleTarget === "description"
                ? {
                    descriptionStyle: {
                      ...(block.data.descriptionStyle ?? {}),
                      ...patch,
                    },
                  }
                : listingStyleTarget === "metadata"
                  ? {
                      metadataStyle: {
                        ...(block.data.metadataStyle ?? {}),
                        ...patch,
                      },
                    }
                  : listingStyleTarget === "price"
                    ? {
                        priceStyle: {
                          ...((block.data as any).priceStyle ?? {}),
                          ...patch,
                        },
                      }
                    : listingStyleTarget === "quantity"
                      ? {
                          quantityStyle: {
                            ...((block.data as any).quantityStyle ?? {}),
                            ...patch,
                          },
                        }
                      : {
                          titleStyle: {
                            ...(block.data.titleStyle ?? {}),
                            ...patch,
                          },
                        }),
            },
          }
        : block,
    ),
  }));
  return;
}

  if (selectedBlock?.type === "cart") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "cart"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "checkout") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "checkout"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "links") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "links"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  setDraft((prev) => applyStylePatchToSelection(prev, selection, patch));
}

function applyLinksBackgroundColor(value: string) {
  if (selectedBlock?.type !== "links") return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "links"
        ? {
            ...block,
            data: {
              ...block.data,
              backgroundColor: value,
              transparentBackground: false,
            },
          }
        : block,
    ),
  }));

  pushRecentColor(value);
}

function clearLinksBackgroundColor() {
  if (selectedBlock?.type !== "links") return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "links"
        ? {
            ...block,
            data: {
              ...block.data,
              transparentBackground: true,
            },
          }
        : block,
    ),
  }));
}

function clearSelectedBackground() {
  if (selectedBlock?.type === "thread") {
    updateSelectedBlock((block) => {
      if (block.type !== "thread") return block;

      const target = block.data.threadStyleTarget ?? "message";

      if (target === "form") {
        return {
          ...block,
          appearance: {
            ...block.appearance,
            backgroundColor: "transparent",
            backgroundOpacity: 0,
          },
          data: {
            ...block.data,
            formAppearance: {
              ...((block.data as any).formAppearance ?? {}),
              backgroundColor: "transparent",
              backgroundOpacity: 0,
            },
          },
        };
      }

      const appearanceKey =
        target === "post_block"
          ? "postBlockAppearance"
          : target === "post_button"
            ? "postButtonAppearance"
            : "messageAppearance";

      return {
        ...block,
        data: {
          ...block.data,
          [appearanceKey]: {
            ...((block.data as any)[appearanceKey] ?? {}),
            backgroundColor: "transparent",
            backgroundOpacity: 0,
          },
        },
      };
    });

    return;
  }

  applyAppearancePatch({ backgroundColor: "transparent" });
}

function applyAppearancePatch(patch: AppearancePatch) {

  if (selectedBlock?.type === "tournament_display") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== selectedBlock.id || block.type !== "tournament_display") {
        return block;
      }

      if (tournamentDisplayStyleTarget === "teamNames") {
        return {
          ...block,
          data: {
            ...block.data,
            matchCardBackgroundStyle: {
              ...((block.data as any).matchCardBackgroundStyle ?? {}),
              ...patch,
            },
          },
        };
      }

      if (tournamentDisplayStyleTarget === "finalsLabel") {
        return {
          ...block,
          data: {
            ...block.data,
            finalsCardStyle: {
              ...((block.data as any).finalsCardStyle ?? {}),
              ...patch,
            },
          },
        };
      }

      return {
        ...block,
        appearance: {
          ...block.appearance,
          ...patch,
        },
        data: {
          ...block.data,
          style: {
            ...((block.data as any).style ?? {}),
            ...patch,
          },
        },
      };
    }),
  }));

  return;
}

if (selectedBlock?.type === "content_panel") {
  updateSelectedBlock((block) =>
    applyContentPanelStylePatch(
      block,
      contentPanelStyleTarget,
      patch,
    ),
  );

  return;
}

if (selectedBlock?.type === "thread") {
  updateSelectedBlock((block) => {
    if (block.type !== "thread") return block;

    const target = block.data.threadStyleTarget ?? "message";

    const appearanceKey =
      target === "form"
        ? "formAppearance"
        : target === "post_block"
          ? "postBlockAppearance"
          : target === "post_button"
            ? "postButtonAppearance"
            : "messageAppearance";

    if (
      target === "form" ||
      target === "post_block" ||
      target === "message" ||
      target === "post_button"
    ) {
      return {
        ...block,

        // IMPORTANT: form target also updates outer block background
appearance:
  target === "form"
    ? {
        ...block.appearance,
        ...(patch.backgroundColor !== undefined
          ? { backgroundColor: patch.backgroundColor }
          : {}),
        ...(patch.backgroundOpacity !== undefined
          ? { backgroundOpacity: patch.backgroundOpacity }
          : {}),
        ...(patch.borderColor !== undefined
          ? { borderColor: patch.borderColor }
          : {}),
        ...(patch.borderWidth !== undefined
          ? { borderWidth: patch.borderWidth }
          : {}),
        ...(patch.borderRadius !== undefined
          ? { borderRadius: patch.borderRadius }
          : {}),
      }
    : block.appearance,

        data: {
          ...block.data,
[appearanceKey]: {
  ...((block.data as any)[appearanceKey] ?? {}),
  ...(patch.backgroundColor !== undefined
    ? { backgroundColor: patch.backgroundColor }
    : {}),
  ...(patch.backgroundOpacity !== undefined
    ? { backgroundOpacity: patch.backgroundOpacity }
    : {}),
  ...(patch.borderColor !== undefined
    ? { borderColor: patch.borderColor }
    : {}),
  ...(patch.borderWidth !== undefined
    ? { borderWidth: patch.borderWidth }
    : {}),
  ...(patch.borderRadius !== undefined
    ? { borderRadius: patch.borderRadius }
    : {}),
},
        },
      };
    }

    return {
      ...block,
      appearance: {
        ...block.appearance,
        ...patch,
      },
    };
  });

  return;
}

  if (selectedBlock?.type === "link_hub") {
  updateSelectedBlock((block) => {
    if (block.type !== "link_hub") return block;

    if (linkHubTextTarget === "form") {
      return {
        ...block,
        appearance: {
          ...block.appearance,
          ...patch,
        },
      };
    }

    return {
      ...block,
      data: {
        ...block.data,
        ...(patch.backgroundColor !== undefined
          ? {
              cardBackgroundColor: patch.backgroundColor,
              cardTransparentBackground: patch.backgroundColor === "transparent",
            }
          : {}),
        ...(patch.borderColor !== undefined
          ? { cardBorderColor: patch.borderColor }
          : {}),
        ...(patch.borderWidth !== undefined
          ? { cardBorderWidth: patch.borderWidth }
          : {}),
        ...(patch.borderRadius !== undefined
          ? { cardBorderRadius: patch.borderRadius }
          : {}),
      },
    };
  });

  return;
}

if (selectedBlock?.type === "form_field") {
  updateSelectedBlock((block) =>
    applyFormFieldStylePatch(block, formFieldStyleTarget, patch),
  );

  return;
}

  if (selectedBlock?.type === "timeline") {
    updateSelectedBlock((block) =>
      block.type !== "timeline"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              ...patch,
            },
          },
    );
    return;
  }
  
if ((selectedBlock as any)?.type === "post_board") {
  updateSelectedBlock((block) => {
    if (block.type !== "post_board") return block;

    const patchToStyle = {
      ...patch,
    };

    const targetStyleKey =
      postBoardStyleTarget === "block_heading"
        ? "blockHeadingStyle"
        : postBoardStyleTarget === "card"
          ? "cardStyle"
          : postBoardStyleTarget === "heading"
            ? "headingStyle"
            : postBoardStyleTarget === "body"
              ? "bodyStyle"
              : postBoardStyleTarget === "buttons"
                ? "buttonStyle"
                : "style";

    return {
      ...block,
      data: {
        ...block.data,
[targetStyleKey]: {
  ...getPostBoardDefaultStyle(targetStyleKey),
  ...((block.data as any)[targetStyleKey] ?? {}),
  ...patchToStyle,
},
      },
    };
  });

  return;
}

if (selectedBlock?.type === "enrollment_board") {
  updateSelectedBlock((block) => {
    if (block.type !== "enrollment_board") return block;

    const target = enrollmentBoardStyleTarget;

    const targetStyleKey =
  target === "form"
    ? "formStyle"
    : target === "inputs"
      ? "inputStyle"
      : target === "button"
        ? "buttonStyle"
        : target === "cards"
          ? "cardStyle"
          : target === "list"
            ? "listStyle"
            : target === "heading"
              ? "headingStyle"
              : target === "subtitle"
                ? "subtitleStyle"
                : target === "imageLabel"
                  ? "imageLabelStyle"
                  : target === "memberName"
                    ? "memberNameStyle"
                    : target === "memberQuote"
                      ? "memberQuoteStyle"
                      : target === "memberTotal"
                        ? "memberTotalStyle"
                        : "style";

    return {
      ...block,

      appearance:
        target === "block"
          ? {
              ...block.appearance,
              ...patch,
            }
          : block.appearance,

      data: {
        ...block.data,

        [targetStyleKey]: {
          ...((block.data as any)[targetStyleKey] ?? {}),

          ...(patch.backgroundColor !== undefined
            ? { backgroundColor: patch.backgroundColor }
            : {}),

          ...(patch.backgroundOpacity !== undefined
            ? { backgroundOpacity: patch.backgroundOpacity }
            : {}),

          ...(patch.borderColor !== undefined
            ? { borderColor: patch.borderColor }
            : {}),

          ...(patch.borderWidth !== undefined
            ? { borderWidth: patch.borderWidth }
            : {}),

          ...(patch.borderRadius !== undefined
            ? { borderRadius: patch.borderRadius }
            : {}),
        },
      },
    };
  });

  return;
}

if (selectedBlock?.type === "highlight") {
  updateSelectedBlock((block) => {
    if (block.type !== "highlight") return block;

    if (highlightStyleTarget === "heading") {
      return {
        ...block,
        appearance: {
          ...block.appearance,
          ...patch,
        },
      };
    }

    const existingCardBackground =
      block.data.cardBackgroundColor ||
      (block.data as any).cardStyle?.backgroundColor ||
      "#ffffff";

    return {
      ...block,
      data: {
        ...block.data,

        ...(patch.backgroundColor !== undefined
          ? { cardBackgroundColor: patch.backgroundColor }
          : {}),

        ...(patch.backgroundOpacity !== undefined
          ? {
              cardBackgroundOpacity: patch.backgroundOpacity,
              cardBackgroundColor:
                existingCardBackground === "transparent"
                  ? "#ffffff"
                  : existingCardBackground,
            }
          : {}),

        ...(patch.borderColor !== undefined
          ? { cardBorderColor: patch.borderColor }
          : {}),

        ...(patch.borderWidth !== undefined
          ? { cardBorderWidth: patch.borderWidth }
          : {}),

        ...(patch.borderRadius !== undefined
          ? { cardBorderRadius: patch.borderRadius }
          : {}),
      },
    };
  });

  return;
}

if (selectedBlock?.type === "visitor_counter") {
  updateSelectedBlock((block) =>
    block.type !== "visitor_counter"
      ? block
      : {
          ...block,
          appearance: {
            ...block.appearance,
            ...patch,
          },
          data: {
            ...block.data,
            tileStyle: {
              ...((block.data as any).tileStyle ?? {}),
              ...(patch.backgroundColor !== undefined
                ? { backgroundColor: patch.backgroundColor }
                : {}),
              ...(patch.backgroundOpacity !== undefined
                ? { backgroundOpacity: patch.backgroundOpacity }
                : {}),
              ...(patch.borderColor !== undefined
                ? { borderColor: patch.borderColor }
                : {}),
              ...(patch.borderWidth !== undefined
                ? { borderWidth: patch.borderWidth }
                : {}),
              ...(patch.borderRadius !== undefined
                ? { borderRadius: patch.borderRadius }
                : {}),
            },
          },
        },
  );

  return;
}

  setDraft((prev) => applyAppearancePatchToSelection(prev, selection, patch));
}

function applyPageTextBackgroundColor(value: string) {
  if (!selectedPageAppearanceKey) return;

  setDraft((prev) => {
    const next = prev as DraftWithPageExtras;

    return {
      ...prev,
      pageBlockAppearance: {
        ...(next.pageBlockAppearance ?? {}),
        [selectedPageAppearanceKey]: {
          ...(next.pageBlockAppearance?.[selectedPageAppearanceKey] ?? {}),
          backgroundColor: value,
        },
      },
    };
  });
}

function clearPageTextBackgroundColor() {
  if (!selectedPageAppearanceKey) return;

  setDraft((prev) => {
    const next = prev as DraftWithPageExtras;

    return {
      ...prev,
      pageBlockAppearance: {
        ...(next.pageBlockAppearance ?? {}),
        [selectedPageAppearanceKey]: {
          ...(next.pageBlockAppearance?.[selectedPageAppearanceKey] ?? {}),
          backgroundColor: "transparent",
        },
      },
    };
  });
}

function updatePageScale(value: number) {
  const nextValue = Math.max(25, Math.min(150, value));

  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    pageScale: nextValue,
  }));
}

function updateTextFx(
  patch: Partial<{
    mode: "straight" | "arch" | "dip" | "circle";
    intensity: number;
    rotation: number;
    opacity: number;
    letterScaleX: number;
    transformStyle: string;
    transformStrength: number;
    shadowEnabled: boolean;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
    outlineEnabled: boolean;
    outlineColor: string;
    outlineWidth: number;
  }>,
) {
  if (!selectedBlock || selectedBlock.type !== "text_fx") return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((b) =>
      b.id === selectedBlock.id && b.type === "text_fx"
        ? {
            ...b,
            data: {
              ...b.data,
              fx: {
                ...(b.data.fx ?? {}),
                ...patch,
              },
            },
          }
        : b,
    ),
  }));
}

function resetSelectedTextFx() {
  if (!selectedBlock || selectedBlock.type !== "text_fx") return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((b) =>
      b.id === selectedBlock.id && b.type === "text_fx"
        ? {
            ...b,
            data: {
              ...b.data,
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
              ...b.appearance,
              backgroundColor: "transparent",
              borderColor: "#000000",
              borderWidth: 0,
              borderRadius: 0,
            },
          }
        : b,
    ),
  }));
}

function updateSelectedGrid(patch: {
  colStart?: number;
  rowStart?: number;
  colSpan?: number;
  rowSpan?: number;
}) {
  if (!selectedCanvasBlockId) return;

  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);

    const isMoveOnly =
      (typeof patch.colStart === "number" ||
        typeof patch.rowStart === "number") &&
      typeof patch.colSpan !== "number" &&
      typeof patch.rowSpan !== "number";

    if (isMoveOnly) {
      const current = items.find((item) => item.id === selectedCanvasBlockId);
      if (!current?.grid) return prev;

      const updated = moveCanvasItemToCell(items, selectedCanvasBlockId, {
        colStart:
          typeof patch.colStart === "number"
            ? patch.colStart
            : Number(current.grid.colStart ?? 1),
        rowStart:
          typeof patch.rowStart === "number"
            ? patch.rowStart
            : Number(current.grid.rowStart ?? 1),
      });

      return applyCanvasItemsToDraft(prev, updated);
    }

    const updated = resizeCanvasItem(items, selectedCanvasBlockId, patch);
    return applyCanvasItemsToDraft(prev, updated);
  });
}

function updateTextByCanvasId(blockId: string, value: string) {
  if (blockId === PAGE_TITLE_BLOCK_ID) {
    setDraft((prev) => ({ ...prev, title: value }));
    return;
  }

  if (blockId === PAGE_SUBTITLE_BLOCK_ID) {
    setDraft((prev) => ({ ...prev, subtitle: value }));
    return;
  }

  if (blockId === PAGE_SUBTEXT_BLOCK_ID) {
    setDraft((prev) => ({ ...prev, subtext: value }));
    return;
  }

  if (blockId === PAGE_DESCRIPTION_BLOCK_ID) {
    setDraft((prev) => ({ ...prev, description: value }));
    return;
  }

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== blockId) {
        return block;
      }

      if (block.type === "label") {
        return {
          ...block,
          data: {
            ...block.data,
            text: value,
          },
        };
      }

      if (block.type === "text_fx") {
        return {
          ...block,
          data: {
            ...block.data,
            text: value,
          },
        };
      }

if (block.type === "cta") {
  return {
    ...block,
    data: {
      ...block.data,
      buttonText: value,
    },
  };
}

      return block;
    }),
  }));
}

function downloadBlueprintSnapshot(nextDraft: BuilderDraft) {
  const timestamp = Date.now();
  const blueprintJson = JSON.stringify(nextDraft, null, 2);

  const blob = new Blob([blueprintJson], {
    type: "text/plain;charset=utf-8",
  });

const pageName =
  (
    (nextDraft as any)?.title ||
    (nextDraft as any)?.pageName ||
    (nextDraft as any)?.slug ||
    "home"
  )
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "home";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `ko-host-blueprint-${pageName}-${timestamp}.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function isBlockMultiSelected(blockId: string) {
  return selectedBlockIds.includes(blockId);
}

function toggleBlockMultiSelect(blockId: string) {
  setSelectedBlockIds((prev) =>
    prev.includes(blockId)
      ? prev.filter((id) => id !== blockId)
      : [...prev, blockId],
  );
}

function clearMultiSelect() {
  setSelectedBlockIds([]);
}

function alignSelectedBlockHorizontal(
  mode: "left" | "center" | "right",
  idsToAlign: string[],
) {
  const selectedIds = idsToAlign;

  if (!selectedIds.length) return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (!selectedIds.includes(block.id)) return block;

      const currentGrid = block.grid ?? {
        colStart: 1,
        rowStart: 1,
        colSpan: 1,
        rowSpan: 1,
        zIndex: 1,
      };

      const colSpan = Number(currentGrid.colSpan ?? 1);

      const nextColStart =
        mode === "left"
          ? 1
          : mode === "right"
            ? Math.max(1, 12 - colSpan + 1)
            : Math.max(1, Math.round((12 - colSpan) / 2 + 1));

      return {
        ...block,
        grid: {
          colStart: nextColStart,
          rowStart: currentGrid.rowStart ?? 1,
          colSpan,
          rowSpan: currentGrid.rowSpan ?? 1,
          zIndex: currentGrid.zIndex ?? 1,
        },
      };
    }),
  }));
}

function moveGalleryImage(
  blockId: string,
  imageId: string,
  direction: "up" | "down",
) {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "gallery") return block;

      const index = block.data.images.findIndex((img) => img.id === imageId);
      if (index === -1) return block;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= block.data.images.length) {
        return block;
      }

      const nextImages = [...block.data.images];
      [nextImages[index], nextImages[targetIndex]] = [
        nextImages[targetIndex],
        nextImages[index],
      ];

      return {
        ...block,
        data: {
          ...block.data,
          images: nextImages,
        },
      };
    }),
  }));
}
function updateSelectedBlock(
  updater: (block: MicrositeBlock) => MicrositeBlock,
) {
  if (!selectedBlock) return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id ? updater(block) : block,
    ),
  }));
}

function updateSelectedOptionButtonData(patch: Record<string, any>) {
  updateSelectedBlock((block) =>
    block.type !== "option_button"
      ? block
      : {
          ...block,
          data: {
            ...(block.data as any),
            ...patch,
          },
        },
  );
}

function updateSelectedSummaryData(patch: Record<string, any>) {
  updateSelectedBlock((block) =>
    block.type !== "summary"
      ? block
      : {
          ...block,
          data: {
            ...(block.data as any),
            ...patch,
          },
        },
  );
}

function updateSelectedRsvpElementStyle(
  updater: (
    current:
      | {
          textStyle?: TextStyle;
          backgroundColor?: string;
        }
      | undefined,
  ) => {
    textStyle?: TextStyle;
    backgroundColor?: string;
  },
) {
  updateSelectedBlock((block) => {
    if (block.type !== "rsvp") return block;

    if (selectedRsvpElementKey === "form") {
      const nextValue = updater({
        textStyle: block.data.style ?? {},
        backgroundColor: block.appearance?.backgroundColor,
      });

      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor:
            nextValue.backgroundColor ??
            block.appearance?.backgroundColor ??
            "transparent",
        },
        data: {
          ...block.data,
          style: {
            ...(block.data.style ?? {}),
            ...(nextValue.textStyle ?? {}),
          },
        },
      };
    }

    const key = selectedRsvpElementKey;
    const currentElementStyles = block.data.elementStyles ?? {};
    const currentValue = currentElementStyles[key];
    const nextValue = updater(currentValue);

    return {
      ...block,
      data: {
        ...block.data,
        elementStyles: {
          ...currentElementStyles,
          [key]: nextValue,
        },
      },
    };
  });
}


function updateSelectedIconPatch(
  patch: Partial<{
    positionX: number;
    positionY: number;
    zoom: number;
    rotation: number;
    opacity: number;
  }>,
) {
  updateSelectedBlock((block) =>
    block.type !== "icon"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            icon: {
              ...block.data.icon,
              ...patch,
            },
          },
        },
  );
}

function updateSelectedImageFadePatch(
  patch: Partial<{
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
    size: number;
  }>,
) {
  updateSelectedBlock((block) =>
    block.type !== "image"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            image: {
              ...block.data.image,
              fade: {
                top: block.data.image.fade?.top ?? false,
                bottom: block.data.image.fade?.bottom ?? false,
                left: block.data.image.fade?.left ?? false,
                right: block.data.image.fade?.right ?? false,
                size: block.data.image.fade?.size ?? 15,
                ...patch,
              },
            },
          },
        },
  );
}

async function uploadPageBackgroundImage() {
  await openImagePicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      const uploaded = await uploadBuilderImageFile(file);

      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),

        pageBackgroundImage: uploaded.url,
        pageBackgroundImageStoragePath: uploaded.storagePath,
        pageBackgroundImageSizeBytes: uploaded.imageSizeBytes,
        pageBackgroundImageOriginalSizeBytes:
          uploaded.imageOriginalSizeBytes,
        pageBackgroundImageMimeType: uploaded.imageMimeType,

        pageBackgroundImageFit:
          (prev as DraftWithPageExtras).pageBackgroundImageFit ?? "zoom",
      }));
    },
  });
}

async function readFileAsCompressedDataUrl(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputType?: "image/jpeg" | "image/webp";
  },
) {
const {
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.78,
  outputType = "image/jpeg",
} = options || {};

const objectUrl = URL.createObjectURL(file);

const image = await new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new window.Image();

  img.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(img);
  };

  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error("Failed to load image."));
  };

  img.src = objectUrl;
});

  let targetWidth = image.width;
  let targetHeight = image.height;

  const widthRatio = maxWidth / targetWidth;
  const heightRatio = maxHeight / targetHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  targetWidth = Math.max(1, Math.round(targetWidth * ratio));
  targetHeight = Math.max(1, Math.round(targetHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create image canvas.");
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL(outputType, quality);
}

function estimateDataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

function clearPageBackgroundImage() {
  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    pageBackgroundImage: "",
  }));
}
function updatePageBackgroundImageFit(value: "clip" | "zoom" | "stretch") {
  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    pageBackgroundImageFit: value,
  }));
}

  async function openImagePicker(options: {
    multiple?: boolean;
    onSelect: (files: File[]) => Promise<void> | void;
  }) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = Boolean(options.multiple);
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (!files.length) return;
      await options.onSelect(files);
    };
  }
async function uploadDroppedGalleryFiles(
  blockId: string,
  files: FileList | File[],
) {
  const MAX_FILES_PER_ADD = 8;
  const MAX_TOTAL_EMBED_BYTES = 8_500_000;

  const allImageFiles = Array.from(files).filter((file) =>
    file.type.startsWith("image/"),
  );

  const imageFiles = allImageFiles.slice(0, MAX_FILES_PER_ADD);

  if (!imageFiles.length) return;

  if (allImageFiles.length > MAX_FILES_PER_ADD) {
    window.alert(
      `Only the first ${MAX_FILES_PER_ADD} dropped images were added to keep the draft saveable.`,
    );
  }

  const images: GalleryImage[] = [];
  let totalBytes = 0;

  for (const file of imageFiles) {
    const compressedUrl = await readFileAsCompressedDataUrl(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.78,
      outputType: "image/jpeg",
    });

    const nextBytes = estimateDataUrlBytes(compressedUrl);

    if (totalBytes + nextBytes > MAX_TOTAL_EMBED_BYTES) {
      window.alert(
        `Some dropped gallery images were not added because they would make the draft too large to save.\n\nAdded so far: ${formatBytes(totalBytes)}\nNext image: ${formatBytes(nextBytes)}`,
      );
      break;
    }

    totalBytes += nextBytes;

    images.push({
      id: makeClientId("gallery"),
      url: compressedUrl,
    });
  }

  if (!images.length) return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "gallery") return block;

      return {
        ...block,
        data: {
          ...block.data,
          images: [...block.data.images, ...images],
        },
      };
    }),
  }));
}


async function uploadImageToSelectedBlock(
  blockId: string,
  timelineEntryId?: string,
  calendarEventId?: string,
  postBoardPostId?: string,
  contentPanelId?: string,
  tournamentTeamId?: string,
  tournamentDisplayImageTarget?: string,
  contentPanelGridCell?: {
    panelId: string;
    rowId: string;
    columnIndex: number;
  },
) {
  await openImagePicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      const uploaded = await uploadBuilderImageFile(file);

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== blockId) return block;

          if (block.type === "image") {
            return {
              ...block,
              data: {
                ...block.data,
                image: {
                  ...block.data.image,
                  url: uploaded.url,
                  alt: file.name,
                  imageStoragePath: uploaded.storagePath,
                  imageSizeBytes: uploaded.imageSizeBytes,
                  imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
                  imageMimeType: uploaded.imageMimeType,
                },
              },
            };
          }

          if (block.type === "cta") {
            return {
              ...block,
              data: {
                ...block.data,
                buttonImageUrl: uploaded.url,
                buttonImageStoragePath: uploaded.storagePath,
                buttonImageSizeBytes: uploaded.imageSizeBytes,
                buttonImageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
                buttonImageMimeType: uploaded.imageMimeType,
              },
            };
          }

          if (block.type === "listing") {
            return {
              ...block,
              data: {
                ...block.data,
                image: {
                  ...block.data.image,
                  url: uploaded.url,
                  alt: file.name,
                  imageStoragePath: uploaded.storagePath,
                  imageSizeBytes: uploaded.imageSizeBytes,
                  imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
                  imageMimeType: uploaded.imageMimeType,
                },
              },
            };
          }

          if (block.type === "timeline" && timelineEntryId) {
            return {
              ...block,
              data: {
                ...block.data,
                entries: block.data.entries.map((entry) =>
                  entry.id === timelineEntryId
                    ? {
                        ...entry,
                        imageUrl: uploaded.url,
                        imageStoragePath: uploaded.storagePath,
                        imageSizeBytes: uploaded.imageSizeBytes,
                        imageOriginalSizeBytes:
                          uploaded.imageOriginalSizeBytes,
                        imageMimeType: uploaded.imageMimeType,
                        icon: "/media-icons/star.svg",
                      }
                    : entry,
                ),
              },
            };
          }

                    if (block.type === "calendar_event" && calendarEventId) {
            return {
              ...block,
              data: {
                ...block.data,
                events: block.data.events.map((event) =>
                  event.id === calendarEventId
                    ? {
                        ...event,
                        imageUrl: uploaded.url,
                        imageStoragePath: uploaded.storagePath,
                        imageAlt: file.name,
                      }
                    : event,
                ),
              },
            };
          }

          if (block.type === "post_board" && postBoardPostId) {
  return {
    ...block,
    data: {
      ...block.data,
      posts: block.data.posts.map((post) =>
        post.id === postBoardPostId
          ? {
              ...post,
              imageUrl: uploaded.url,
              imageStoragePath: uploaded.storagePath,
            }
          : post,
      ),
    },
  };
}

if (block.type === "content_panel" && contentPanelGridCell) {
  return {
    ...block,
    data: {
      ...block.data,
      panels: block.data.panels.map((panel) => {
        if (panel.id !== contentPanelGridCell.panelId || !panel.grid) {
          return panel;
        }

        return {
          ...panel,
          grid: {
            ...panel.grid,
            rows: panel.grid.rows.map((row) => {
              if (row.id !== contentPanelGridCell.rowId) {
                return row;
              }

              const cells = [...row.cells];

const columns = panel.grid?.columns ?? [];

while (cells.length < columns.length) {
  const targetColumn = columns[cells.length];

                cells.push({
                  id: makeClientId("cell"),
                  type: targetColumn?.type ?? "text",
                  value: "",
                });
              }

              cells[contentPanelGridCell.columnIndex] = {
                ...cells[contentPanelGridCell.columnIndex],
                type: "image",
                imageUrl: uploaded.url,
                imageStoragePath: uploaded.storagePath,
                imageAlt: file.name,
              };

              return {
                ...row,
                cells,
              };
            }),
          },
        };
      }),
    },
  };
}

          if (block.type === "content_panel" && contentPanelId) {
            return {
              ...block,
              data: {
                ...block.data,
                panels: block.data.panels.map((panel) =>
                  panel.id === contentPanelId
                    ? {
                        ...panel,
                        imageUrl: uploaded.url,
                        imageStoragePath: uploaded.storagePath,
                        imageAlt: file.name,
                      }
                    : panel,
                ),
              },
            };
          }

if (
  block.type === "tournament_display" &&
  tournamentDisplayImageTarget
) {
  return {
    ...block,
    data: {
      ...block.data,
      [`${tournamentDisplayImageTarget}ImageUrl`]: uploaded.url,
      [`${tournamentDisplayImageTarget}ImageStoragePath`]:
        uploaded.storagePath,
      [`${tournamentDisplayImageTarget}ImageAlt`]: file.name,
    },
  };
}

if (block.type === "tournament_display" && tournamentTeamId) {
  return {
    ...block,
    data: {
      ...block.data,
      teams: block.data.teams.map((team) =>
        team.id === tournamentTeamId
          ? {
              ...team,
              imageUrl: uploaded.url,
              imageStoragePath: uploaded.storagePath,
            }
          : team,
      ),
    },
  };
}

return block;
        }),
      }));
    },
  });
}

async function uploadGalleryImagesToBlock(blockId: string) {
  await openImagePicker({
    multiple: true,
    onSelect: async (files) => {
      const MAX_FILES_PER_ADD = 24;
      const selectedFiles = files.slice(0, MAX_FILES_PER_ADD);

      if (files.length > MAX_FILES_PER_ADD) {
        window.alert(
          `You selected ${files.length} images. Only the first ${MAX_FILES_PER_ADD} were added at once.`,
        );
      }

      const images: GalleryImage[] = await Promise.all(
        selectedFiles.map(async (file) => {
          const uploaded = await uploadBuilderImageFile(file);

          return {
            id: makeClientId("gallery"),
            url: uploaded.url,
            storagePath: uploaded.storagePath,
            imageSizeBytes: uploaded.imageSizeBytes,
            imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
            imageMimeType: uploaded.imageMimeType,
          } as GalleryImage;
        }),
      );

      if (!images.length) return;

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== blockId || block.type !== "gallery") return block;

          return {
            ...block,
            data: {
              ...block.data,
              images: [...block.data.images, ...images],
            },
          };
        }),
      }));
    },
  });
}

async function uploadImageToCarouselItem(blockId: string, itemId: string) {
  await openImagePicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      const uploaded = await uploadBuilderImageFile(file);

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== blockId || block.type !== "image_carousel") {
            return block;
          }

          return {
            ...block,
            data: {
              ...block.data,
              items: (block.data.items ?? []).map((item: any) =>
                item.id !== itemId
                  ? item
                  : {
                      ...item,
                      imageUrl: uploaded.url,
                      imageStoragePath: uploaded.storagePath,
                      imageSizeBytes: uploaded.imageSizeBytes,
                      imageOriginalSizeBytes:
                        uploaded.imageOriginalSizeBytes,
                      imageMimeType: uploaded.imageMimeType,
                    },
              ),
            },
          };
        }),
      }));
    },
  });
}

async function uploadMultipleImagesToCarousel(blockId: string) {
  await openImagePicker({
    multiple: true,
    onSelect: async (files) => {
      const newItems: CarouselImageItem[] = await Promise.all(
        files.map(async (file, index) => {
          const uploaded = await uploadBuilderImageFile(file);

          return {
            id: makeClientId("carouselitem"),
            imageUrl: uploaded.url,
            imageStoragePath: uploaded.storagePath,
            imageSizeBytes: uploaded.imageSizeBytes,
            imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
            imageMimeType: uploaded.imageMimeType,
            title: `Slide ${index + 1}`,
            subtitle: "",
            href: "",
            openInNewTab: false,
            positionX: 50,
            positionY: 50,
            zoom: 1,
            rotation: 0,
          };
        }),
      );

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === blockId && block.type === "image_carousel"
            ? {
                ...block,
                data: {
                  ...block.data,
                  items: [...block.data.items, ...newItems],
                },
              }
            : block,
        ),
      }));
    },
  });
}

function getIconNameFromUrl(url?: string) {
  const fileName = String(url ?? "").split("/").pop() ?? "";
  return fileName.replace(/\.svg$/i, "") || "star";
}

function getIconUrlFromLabel(label?: string) {
  const normalized = String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `/media-icons/${normalized || "star"}.svg`;
}

function applyIconDefaults(
  block: MicrositeBlock,
  label?: string,
  iconUrl?: string,
): MicrositeBlock {
  if (block.type !== "icon") return block;

  const resolvedIconUrl = iconUrl || getIconUrlFromLabel(label);

  return {
    ...block,
    label: label || block.label || "Icon",
    data: {
      ...block.data,
      icon: {
        ...block.data.icon,
        id: resolvedIconUrl,
        url: resolvedIconUrl,
        alt: label || block.data.icon.alt || "Icon",
      },
    },
  };
}

function addBlock(type: BuilderBlockType, label?: string, iconName?: string) {
  let createdBlockId = "";

  setDraft((prev) => {
    const nextBlocks = addBlockTypeToDraft(prev.blocks, type);

    const created = nextBlocks.find(
      (b) => !prev.blocks.some((p) => p.id === b.id),
    );

    if (created) createdBlockId = created.id;

    if (created?.type === "icon") {
  console.log("CREATED ICON BLOCK", {
    label,
    created,
  });
}

    return {
      ...prev,
      blocks: nextBlocks.map((block) =>
        created && block.id === created.id
  ? applyIconDefaults(block, iconName ?? label, `/media-icons/${iconName ?? "star"}.svg`)
  : block,
      ),
    };
  });

  if (createdBlockId) {
    setSelection(selectionFromCanvasBlockId(createdBlockId));
  }
}

function addShape(type: ShapeType) {
  let createdShapeId = "";

  setDraft((prev) => {
    const nextBlocks = addShapeBlockToDraft(prev.blocks, type);

    const created = nextBlocks.find(
      (b) => !prev.blocks.some((p) => p.id === b.id),
    );

    if (created) createdShapeId = created.id;

    return {
      ...prev,
      blocks: nextBlocks,
    };
  });

  if (createdShapeId) {
    setSelection(selectionFromCanvasBlockId(createdShapeId));
  }
}

function addPageBlock(type: PageBlockType) {
  let createdPageId = "";

  setDraft((prev) => {
    const next = prev as DraftWithPageExtras;
    const pageVisibility = { ...(next.pageVisibility ?? {}) };

    if (type === "title") {
      pageVisibility.title = true;
      createdPageId = PAGE_TITLE_BLOCK_ID;
    }

    if (type === "subtitle") {
      pageVisibility.subtitle = true;
      createdPageId = PAGE_SUBTITLE_BLOCK_ID;
    }

    if (type === "tagline") {
      pageVisibility.subtext = true;
      createdPageId = PAGE_SUBTEXT_BLOCK_ID;
    }

    if (type === "description") {
      pageVisibility.description = true;
      createdPageId = PAGE_DESCRIPTION_BLOCK_ID;
    }

    return {
      ...prev,
      pageVisibility,
    };
  });

  if (createdPageId) {
    setSelection(selectionFromCanvasBlockId(createdPageId));
  }
}

function handleDuplicateCanvasBlock(blockId: string) {
  handleDuplicateCanvasBlocks([blockId]);
}

function handleDuplicateCanvasBlocks(blockIds: string[]) {
  const idsToDuplicate = blockIds.filter((id) => !isPageBlockId(id));
  if (!idsToDuplicate.length) return;

  const duplicatedIds: string[] = [];

  setDraft((prev) => {
    const highestZIndex = Math.max(
      1,
      ...prev.blocks.map((block) => block.grid?.zIndex ?? 1),
    );

    const duplicatedBlocks = idsToDuplicate
      .map((id, index) => {
        const original = prev.blocks.find((block) => block.id === id);
        if (!original) return null;

        const duplicatedBlockId = `block_${Math.random()
          .toString(36)
          .slice(2, 10)}`;

        duplicatedIds.push(duplicatedBlockId);

        const originalGrid = original.grid ?? {
          colStart: 1,
          rowStart: 1,
          colSpan: 4,
          rowSpan: 1,
          zIndex: 1,
        };

        return {
          ...structuredClone(original),
          id: duplicatedBlockId,
          grid: {
            colStart: originalGrid.colStart,
            rowStart: originalGrid.rowStart + 1,
            colSpan: originalGrid.colSpan,
            rowSpan: originalGrid.rowSpan,
            zIndex: highestZIndex + index + 1,
          },
        } as MicrositeBlock;
      })
      .filter(Boolean) as MicrositeBlock[];

    return {
      ...prev,
      blocks: [...prev.blocks, ...duplicatedBlocks],
    };
  });

  window.requestAnimationFrame(() => {
    setSelectedBlockIds(duplicatedIds);

    if (duplicatedIds.length === 1) {
      setSelection(selectionFromCanvasBlockId(duplicatedIds[0]));
    } else {
      setSelection(createEmptySelection());
    }
  });
}

function handleCopyCanvasBlock(blockId: string) {
  handleCopyCanvasBlocks([blockId]);
}

function handleCopyCanvasBlocks(blockIds: string[]) {
  const idsToCopy = blockIds.filter((id) => !isPageBlockId(id));
  if (!idsToCopy.length) return;

  const copiedAt = Date.now();

  const clipboardEntriesToAdd: ClipboardEntry[] = idsToCopy
    .map((id) => {
      const original = draft.blocks.find((block) => block.id === id);
      if (!original) return null;

      return {
        clipboardId: makeClipboardId(),
        copiedAt,
        block: cloneClipboardBlock(original),
      } as ClipboardEntry;
    })
    .filter(Boolean) as ClipboardEntry[];

  if (!clipboardEntriesToAdd.length) return;

  setClipboardEntries((prev) => [...clipboardEntriesToAdd, ...prev]);
  setClipboardOpen(true);
}

function handlePasteClipboardBlock(entry: ClipboardEntry) {
  const cloned = structuredClone(entry.block);

  const newBlockId =
    typeof makeClientId === "function"
      ? makeClientId(cloned.type)
      : `block_${Math.random().toString(36).slice(2, 10)}`;

  const highestZIndex = Math.max(
    1,
    ...draft.blocks.map((block) => block.grid?.zIndex ?? 1),
  );

  const nextBlock: MicrositeBlock = {
    ...cloned,
    id: newBlockId,
    grid: {
      ...(cloned.grid ?? {
        colStart: 1,
        rowStart: 1,
        colSpan: 4,
        rowSpan: 1,
      }),
      zIndex: highestZIndex + 1,
    },
  };

  setDraft((prev) => ({
    ...prev,
    blocks: [...prev.blocks, nextBlock],
  }));

  window.requestAnimationFrame(() => {
    setSelection(selectionFromCanvasBlockId(newBlockId));
  });
}

function handleRemoveClipboardEntry(clipboardId: string) {
  setClipboardEntries((prev) =>
    prev.filter((entry) => entry.clipboardId !== clipboardId),
  );
}

function handleClearClipboard() {
  setClipboardEntries([]);
}

function removeCanvasBlocks(blockIds: string[]) {
  const idsToRemove = new Set(blockIds);

  setDraft((prev) => {
    const next = prev as DraftWithPageExtras;

    return {
      ...prev,
      pageVisibility: {
        ...(next.pageVisibility ?? {}),
        title: idsToRemove.has(PAGE_TITLE_BLOCK_ID)
          ? false
          : (next.pageVisibility?.title ?? true),
        subtitle: idsToRemove.has(PAGE_SUBTITLE_BLOCK_ID)
          ? false
          : (next.pageVisibility?.subtitle ?? true),
        subtext: idsToRemove.has(PAGE_SUBTEXT_BLOCK_ID)
          ? false
          : (next.pageVisibility?.subtext ?? true),
        description: idsToRemove.has(PAGE_DESCRIPTION_BLOCK_ID)
          ? false
          : (next.pageVisibility?.description ?? true),
      },
      blocks: prev.blocks.filter((block) => !idsToRemove.has(block.id)),
    };
  });
}

  function removeCanvasBlock(blockId: string) {
    if (blockId === PAGE_TITLE_BLOCK_ID) {
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageVisibility: {
          ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
          title: false,
        },
      }));
      return;
    }

    if (blockId === PAGE_SUBTITLE_BLOCK_ID) {
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageVisibility: {
          ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
          subtitle: false,
        },
      }));
      return;
    }

    if (blockId === PAGE_SUBTEXT_BLOCK_ID) {
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageVisibility: {
          ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
          subtext: false,
        },
      }));
      return;
    }

    if (blockId === PAGE_DESCRIPTION_BLOCK_ID) {
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageVisibility: {
          ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
          description: false,
        },
      }));
      return;
    }

    setDraft((prev) => ({
      ...prev,
      blocks: removeBlockFromDraft(prev.blocks, blockId),
    }));
  }

function removeAllBlocks() {
  setRemoveAllModalOpen(true);
}

function confirmRemoveAllBlocks() {
  setSelection(createEmptySelection());

  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    blocks: [],
    pageVisibility: {
      ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
      title: false,
      subtitle: false,
      subtext: false,
      description: false,
    },
  }));

  setRemoveAllModalOpen(false);
}

function cancelRemoveAllBlocks() {
  setRemoveAllModalOpen(false);
}

function handleMoveBlock(
  blockId: string,
  patch: { colStart: number; rowStart: number },
) {
  const idsToMove =
    selectedBlockIds.includes(blockId) && selectedBlockIds.length > 1
      ? selectedBlockIds
      : [blockId];

  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);
    const anchorItem = items.find((item) => item.id === blockId);

    if (!anchorItem?.grid) return prev;

    const deltaCol = patch.colStart - (anchorItem.grid.colStart ?? 1);
    const deltaRow = patch.rowStart - (anchorItem.grid.rowStart ?? 1);

    const moved = idsToMove.reduce((nextItems, id) => {
      const item = nextItems.find((current) => current.id === id);

      if (!item?.grid) return nextItems;

      return moveCanvasItemToCell(nextItems, id, {
        colStart: (item.grid.colStart ?? 1) + deltaCol,
        rowStart: (item.grid.rowStart ?? 1) + deltaRow,
      });
    }, items);

    return applyCanvasItemsToDraft(prev, moved);
  });
}

function handleResizeBlock(
  blockId: string,
  patch: {
    colSpan?: number;
    rowSpan?: number;
    colStart?: number;
    rowStart?: number;
  },
) {
  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);

    const resized = items.map((item) =>
      item.id === blockId
        ? {
            ...item,
            grid: {
              ...(item.grid ?? {}),
              ...patch,
            },
          }
        : item,
    );

    return applyCanvasItemsToDraft(prev, resized);
  });
}

  function handleBringToFront(blockId: string) {
    setDraft((prev) => {
      const items = buildCanvasItems(prev, metadata);
      const updated = bringCanvasItemToFront(items, blockId);
      return applyCanvasItemsToDraft(prev, updated);
    });
  }

  function handleSendToBack(blockId: string) {
    setDraft((prev) => {
      const items = buildCanvasItems(prev, metadata);
      const updated = sendCanvasItemToBack(items, blockId);
      return applyCanvasItemsToDraft(prev, updated);
    });
  }

function handleSendBackward(blockId: string) {
  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);
    const updated = moveCanvasItemBackward(items, blockId);
    return applyCanvasItemsToDraft(prev, updated);
  });
}

function handleBringForward(blockId: string) {
  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);
    const updated = moveCanvasItemForward(items, blockId);
    return applyCanvasItemsToDraft(prev, updated);
  });
}

function handlePasteAllClipboardBlocks() {
  if (clipboardEntries.length === 0) return;

  const newBlockIds: string[] = [];

  setDraft((prev) => {
    let nextHighestZIndex = Math.max(
      1,
      ...prev.blocks.map((block) => block.grid?.zIndex ?? 1),
    );

    const pastedBlocks = clipboardEntries.map((entry) => {
      const cloned = structuredClone(entry.block);
      const newBlockId = makeClientId(cloned.type);

      newBlockIds.push(newBlockId);
      nextHighestZIndex += 1;

      return {
        ...cloned,
        id: newBlockId,
        grid: {
          ...(cloned.grid ?? {
            colStart: 1,
            rowStart: 1,
            colSpan: 4,
            rowSpan: 1,
          }),
          zIndex: nextHighestZIndex,
        },
      } as MicrositeBlock;
    });

    return {
      ...prev,
      blocks: [...prev.blocks, ...pastedBlocks],
    };
  });

  window.requestAnimationFrame(() => {
    setSelectedBlockIds(newBlockIds);
    if (newBlockIds[0]) {
      setSelection(selectionFromCanvasBlockId(newBlockIds[0]));
    }
  });
}

function handleCreateToolDrop(
  payload: ToolDropPayload,
  patch: {
    colStart: number;
    rowStart: number;
    colSpan: number;
    rowSpan: number;
  },
) {
  console.log("TOOL DROP PAYLOAD", payload);

  setSelection(createEmptySelection());
  setOpenToolMenu(null);

  if (payload.kind === "page") {
    setDraft((prev) => {
      const next = prev as DraftWithPageExtras;
      const pageVisibility = { ...(next.pageVisibility ?? {}) };
      const pageElements = { ...(next.pageElements ?? {}) };

      let createdPageId = "";

      if (payload.type === "title") {
        pageVisibility.title = true;
        pageElements.title = { ...patch };
        createdPageId = PAGE_TITLE_BLOCK_ID;
      }

      if (payload.type === "subtitle") {
        pageVisibility.subtitle = true;
        pageElements.subtitle = { ...patch };
        createdPageId = PAGE_SUBTITLE_BLOCK_ID;
      }

      if (payload.type === "tagline") {
        pageVisibility.subtext = true;
        pageElements.subtext = { ...patch };
        createdPageId = PAGE_SUBTEXT_BLOCK_ID;
      }

      if (payload.type === "description") {
        pageVisibility.description = true;
        pageElements.description = { ...patch };
        createdPageId = PAGE_DESCRIPTION_BLOCK_ID;
      }

      const nextDraft = {
        ...prev,
        pageVisibility,
        pageElements,
      };

      const items = buildCanvasItems(nextDraft, metadata);
      const updated = createdPageId
        ? bringCanvasItemToFront(items, createdPageId)
        : items;

      return applyCanvasItemsToDraft(nextDraft, updated);
    });

    if (payload.type === "title") {
      setSelection(selectionFromCanvasBlockId(PAGE_TITLE_BLOCK_ID));
    }
    if (payload.type === "subtitle") {
      setSelection(selectionFromCanvasBlockId(PAGE_SUBTITLE_BLOCK_ID));
    }
    if (payload.type === "tagline") {
      setSelection(selectionFromCanvasBlockId(PAGE_SUBTEXT_BLOCK_ID));
    }
    if (payload.type === "description") {
      setSelection(selectionFromCanvasBlockId(PAGE_DESCRIPTION_BLOCK_ID));
    }

    return;
  }

  if (payload.kind === "shape") {
    let createdShapeId = "";

    setDraft((prev) => {
      const nextBlocks = addShapeBlockToDraft(prev.blocks, payload.type);
      const nextDraft: BuilderDraft = {
        ...prev,
        blocks: nextBlocks,
      };

      const nextItems = buildCanvasItems(nextDraft, metadata);
      const createdItem = [...nextItems]
        .reverse()
        .find(
          (item) =>
            item.type === "shape" &&
            !prev.blocks.some((b) => b.id === item.id),
        );

      if (!createdItem) return nextDraft;

      createdShapeId = createdItem.id;

      const withSize = resizeCanvasItem(nextItems, createdItem.id, {
        colSpan: patch.colSpan,
        rowSpan: patch.rowSpan,
      });

      const withPosition = moveCanvasItemToCell(withSize, createdItem.id, {
        colStart: patch.colStart,
        rowStart: patch.rowStart,
      });

      const withFront = bringCanvasItemToFront(withPosition, createdItem.id);

      return applyCanvasItemsToDraft(nextDraft, withFront);
    });

    if (createdShapeId) {
      setSelection(selectionFromCanvasBlockId(createdShapeId));
    }

    return;
  }

  if (payload.kind === "block") {
    let createdBlockId = "";

    setDraft((prev) => {
      const nextBlocks = addBlockTypeToDraft(prev.blocks, payload.type).map(
        (block) =>
          block.type === "icon" && !prev.blocks.some((prevBlock) => prevBlock.id === block.id)
? applyIconDefaults(
    block,
    payload.label,
    payload.iconUrl ?? `/media-icons/${payload.iconName ?? "star"}.svg`,
  )
            : block,
      );
      const nextDraft: BuilderDraft = {
        ...prev,
        blocks: nextBlocks,
      };

      const nextItems = buildCanvasItems(nextDraft, metadata);
      const createdItem = [...nextItems]
        .reverse()
        .find(
          (item) =>
            item.type === payload.type &&
            !prev.blocks.some((b) => b.id === item.id),
        );

      if (!createdItem) return nextDraft;

      createdBlockId = createdItem.id;

      const withSize = resizeCanvasItem(nextItems, createdItem.id, {
        colSpan: patch.colSpan,
        rowSpan: patch.rowSpan,
      });

      const withPosition = moveCanvasItemToCell(withSize, createdItem.id, {
        colStart: patch.colStart,
        rowStart: patch.rowStart,
      });

      const withFront = bringCanvasItemToFront(withPosition, createdItem.id);

      const positionedDraft = applyCanvasItemsToDraft(nextDraft, withFront);

      return {
        ...positionedDraft,
        blocks: positionedDraft.blocks.map((block) =>
          block.id === createdItem.id && block.type === "icon"
            ? applyIconDefaults(block, payload.label, payload.iconUrl)
            : block,
        ),
      };
    });

    if (createdBlockId) {
      setSelection(selectionFromCanvasBlockId(createdBlockId));
    }
  }
}

function handleMarqueeSelectMove(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  if (rect.width < 8 && rect.height < 8) return;

  const selectedIds: string[] = [];

  document.querySelectorAll("[data-canvas-block-id]").forEach((node) => {
    const el = node as HTMLElement;
    const blockId = el.dataset.canvasBlockId;
    if (!blockId) return;

    const parent = el.closest("[data-kht-page-surface='true']") as HTMLElement | null;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const blockRect = el.getBoundingClientRect();

    const blockBox = {
      x: blockRect.left - parentRect.left,
      y: blockRect.top - parentRect.top,
      width: blockRect.width,
      height: blockRect.height,
    };

    const intersects =
      rect.x < blockBox.x + blockBox.width &&
      rect.x + rect.width > blockBox.x &&
      rect.y < blockBox.y + blockBox.height &&
      rect.y + rect.height > blockBox.y;

    if (intersects) {
      selectedIds.push(blockId);
    }
  });

  setSelectedBlockIds(selectedIds);
}

function handleMarqueeSelectEnd() {
  if (selectedBlockIds.length === 1) {
    setSelection(
      selectionFromCanvasBlockId(selectedBlockIds[0]),
    );
    return;
  }

  if (selectedBlockIds.length === 0) {
    setSelection(createEmptySelection());
  }
}

function handleCanvasSelect(
  nextSelection: ReturnType<typeof createEmptySelection>,
  event?: React.MouseEvent<HTMLDivElement>,
) {
  const isBlockSelection = (nextSelection as any).type === "block";
  const blockId = (nextSelection as any).blockId as string | undefined;

if (isBlockSelection && blockId) {
  const isMultiModifier =
    event?.ctrlKey ||
    event?.metaKey;

  if (isMultiModifier) {
    setSelectedBlockIds((prev) =>
      prev.includes(blockId)
        ? prev.filter((id) => id !== blockId)
        : [...prev, blockId],
    );

    setSelection(selectionFromCanvasBlockId(blockId));
    return;
  }

  if (selectedBlockIds.includes(blockId)) {
    setSelection(selectionFromCanvasBlockId(blockId));
    return;
  }

  setSelectedBlockIds([blockId]);
  setSelection(selectionFromCanvasBlockId(blockId));
  return;
}

  setSelectedBlockIds([]);
  setSelection(nextSelection);
}

async function handleCopyDraftJson() {
  try {
    const hydratedDraft = hydrateDraftForJsonExport(draft);

    const { slugSuggestion, ...draftWithoutSlugSuggestion } =
      hydratedDraft as BuilderDraft & { slugSuggestion?: string };

    await navigator.clipboard.writeText(
      JSON.stringify(draftWithoutSlugSuggestion, null, 2),
    );

    setDraftCopied(true);

    window.setTimeout(() => {
      setDraftCopied(false);
    }, 1500);
  } catch {
    // ignore
  }
}

function handleBuildPresetDesign() {
  setBuildPresetError("");

  let parsed: BuilderDraft;

  try {
    parsed = JSON.parse(buildPresetJson) as BuilderDraft;
  } catch {
    setBuildPresetError("Invalid JSON. Please paste valid Design Specs JSON.");
    return;
  }

  if (!parsed || typeof parsed !== "object") {
    setBuildPresetError("Design Specs must be a valid draft object.");
    return;
  }

  if (!Array.isArray(parsed.blocks)) {
    setBuildPresetError("Design Specs must include a blocks array.");
    return;
  }

  const nextDraft: BuilderDraft = {
    ...parsed,
    blocks: parsed.blocks,
  };

  setPendingPresetDraft(nextDraft);
  setBuildPresetConfirmOpen(true);
}

function confirmBuildPresetDesign() {
  if (!pendingPresetDraft) return;

  isHistoryActionRef.current = true;
  setSelection(createEmptySelection());
  setOpenToolMenu(null);
  setRedoStack([]);
  setUndoStack([]);
  lastDraftRef.current = cloneDraft(pendingPresetDraft);

  setDraft(pendingPresetDraft);
  setPendingPresetDraft(null);
  setBuildPresetJson("");
  setBuildPresetError("");
  setBuildPresetConfirmOpen(false);
  setBuildPresetModalOpen(false);
}

async function handleCopyUrl() {
  if (!micrositeSlug?.trim()) return;

  const fullUrl =
    currentPageSlug && currentPageSlug !== "home"
      ? `https://${micrositeSlug.trim()}.ko-host.com/${currentPageSlug}`
      : `https://${micrositeSlug.trim()}.ko-host.com`;

  try {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  } catch {
    // ignore
  }
}

  const canRemoveActivePage =
    Array.isArray(pages) &&
    pages.length > 1 &&
    !!activePageId &&
    pages.findIndex((page) => page.id === activePageId) > 0;

function handleAioClick() {
  if (!isTextSelection(selectedContext)) return;

setAiSubject(selectedContext.label || "");
setAiDetails(selectedTextValue || "");

setAiTone("Friendly");
setAiLength("Short");
setAiAudience("");
setAiKeywords("");
setAiContentType("Description");
setAiCreativity(50);
setAiMatchPageStyle(true);

setAiSuggestions([]);
setAiOptions([]);
setAiError("");
setShowAiAdvancedOptions(false);
setShowAiSuggestions(true);
}

async function generateSmartContent() {
  if (!isTextSelection(selectedContext)) return;

  setAiLoading(true);

setAiSuggestions([]);
setAiOptions([]);
setAiError("");

  try {
    const res = await fetch("/api/ai/text-suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateKey,
        designKey,

        targetLabel: selectedContext.label,
        currentText: selectedTextValue,

        subject: aiSubject,
        details: aiDetails,
        tone: aiTone,
        audience: aiAudience,
        length: aiLength,
        contentType: aiContentType,
        creativity: aiCreativity,
        matchPageStyle: aiMatchPageStyle,

        keywords: aiKeywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });

    const data = (await res.json()) as {
      suggestions?: string[];
      options?: SmartContentOption[];
    };

    setAiSuggestions(
      Array.isArray(data.suggestions) ? data.suggestions : [],
    );

const nextOptions = Array.isArray(data.options) ? data.options : [];

setAiOptions(nextOptions);

if (!nextOptions.length) {
  setAiError("No content options were generated. Try adding more details.");
}
} catch {
  setAiSuggestions([]);
  setAiOptions([]);
  setAiError("Something went wrong while generating content. Please try again.");
} finally {
    setAiLoading(false);
  }
}

  function applyAiSuggestion(value: string) {
    if (!selectedCanvasBlockId) return;
    updateTextByCanvasId(selectedCanvasBlockId, value);
    setShowAiSuggestions(false);
  }

  function zoomInCanvas() {
    setCanvasZoom((prev) => clampCanvasZoom(prev + CANVAS_ZOOM_STEP));
  }

  function zoomOutCanvas() {
    setCanvasZoom((prev) => clampCanvasZoom(prev - CANVAS_ZOOM_STEP));
  }

  function handleUndo() {
    if (!undoStack.length) return;

    const previousDraft = undoStack[undoStack.length - 1];

    isHistoryActionRef.current = true;
    setRedoStack((prevRedo) => [...prevRedo, cloneDraft(draft)]);
    setUndoStack((prevUndo) => prevUndo.slice(0, -1));
    setDraft(cloneDraft(previousDraft));
  }

  function handleRedo() {
    if (!redoStack.length) return;

    const nextDraft = redoStack[redoStack.length - 1];

    isHistoryActionRef.current = true;
    setUndoStack((prevUndo) => [...prevUndo, cloneDraft(draft)]);
    setRedoStack((prevRedo) => prevRedo.slice(0, -1));
    setDraft(cloneDraft(nextDraft));
  }

function openPreviewWindow() {
  const previewWindow = window.open(
    `/preview/draft?ts=${Date.now()}`,
    "_blank",
  );

  if (!previewWindow) return;

  const payload = {
    templateName: templateKey,
    designLayout: designKey,
    draft: cloneDraft(draft),
    updatedAt: new Date().toISOString(),
  };

  let previewReady = false;
  let previewConfirmed = false;

  const sendPayload = () => {
    if (previewWindow.closed || !previewReady || previewConfirmed) return;

    previewWindow.postMessage(
      {
        type: PREVIEW_MESSAGE_TYPE,
        payload,
      },
      window.location.origin,
    );

    try {
      previewWindow.focus();
    } catch {
      // ignore focus errors
    }
  };

  const cleanup = () => {
    window.removeEventListener("message", handlePreviewMessage);
    window.clearInterval(closedCheckTimer);
    window.clearInterval(retrySendTimer);
    window.clearTimeout(safetyTimeout);
  };

  const handlePreviewMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.source !== previewWindow) return;

    const data = event.data as { type?: string } | undefined;
    if (!data?.type) return;

    if (data.type === PREVIEW_READY_MESSAGE_TYPE) {
      previewReady = true;
      sendPayload();
      return;
    }

    if (data.type === PREVIEW_RECEIVED_MESSAGE_TYPE) {
      previewConfirmed = true;
      cleanup();
    }
  };

  window.addEventListener("message", handlePreviewMessage);

  const retrySendTimer = window.setInterval(() => {
    if (previewWindow.closed || previewConfirmed) {
      cleanup();
      return;
    }

    sendPayload();
  }, 700);

  const closedCheckTimer = window.setInterval(() => {
    if (previewWindow.closed) {
      cleanup();
    }
  }, 500);

  const safetyTimeout = window.setTimeout(() => {
    cleanup();
  }, 15000);
}

  function focusInspectorForBlock(target: InspectorFocusTarget) {
    if (!target) return;
    setSelection(selectionFromCanvasBlockId(target.blockId));
    setInspectorFocusTarget(target);
  }

  function SpeedDatingCanvasPreview({
  block,
}: {
  block: Extract<MicrositeBlock, { type: "speed_dating" }>;
}) {
  const [round, setRound] = useState(0);

  const duration = Math.max(
    60,
    Math.min(1800, Number(block.data.roundDurationSeconds) || 120),
  );

  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setRound(0);
    setTimeLeft(duration);
  }, [block.id, duration]);

  useEffect(() => {
  if (!selectedGalleryImageId) return;

  const node = galleryImageCardRefs.current[selectedGalleryImageId];

  if (!node) return;

  requestAnimationFrame(() => {
    node.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}, [selectedGalleryImageId]);

  useEffect(() => {
  function handleFocusTimelineEntry(event: Event) {
    const customEvent = event as CustomEvent<{
      blockId?: string;
      entryId?: string;
    }>;

    const blockId = customEvent.detail?.blockId;
    const entryId = customEvent.detail?.entryId;

    if (!blockId || !entryId) return;

    setSelection(selectionFromCanvasBlockId(blockId));
    setFocusedTimelineEntryId(entryId);

    requestAnimationFrame(() => {
      document
        .getElementById(`timeline-entry-inspector-${entryId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    });
  }

  window.addEventListener(
    "ko-host-focus-timeline-entry",
    handleFocusTimelineEntry,
  );

  return () => {
    window.removeEventListener(
      "ko-host-focus-timeline-entry",
      handleFocusTimelineEntry,
    );
  };
}, []);


  useEffect(() => {
    if (duration <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRound((r) => r + 1);
          return duration;
        }
        return t - 1;
      });
    }, 1000);

    useEffect(() => {
    if (typeof window === "undefined") return;

    window.sessionStorage.setItem(
      "ko-host-builder-canvas-zoom",
      String(canvasZoom),
    );
  }, [canvasZoom]);

    return () => window.clearInterval(timer);
  }, [duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

return (
  <div
    className="h-full w-full overflow-auto rounded-xl p-4"
    style={{
      backgroundColor:
        block.appearance?.backgroundColor &&
        block.appearance.backgroundColor !== "transparent"
          ? block.appearance.backgroundColor
          : "transparent",
      borderColor: block.appearance?.borderColor || undefined,
      borderWidth:
        typeof block.appearance?.borderWidth === "number"
          ? `${block.appearance.borderWidth}px`
          : undefined,
      borderStyle:
        typeof block.appearance?.borderWidth === "number" &&
        block.appearance.borderWidth > 0
          ? "solid"
          : undefined,
      borderRadius:
        typeof block.appearance?.borderRadius === "number"
          ? `${block.appearance.borderRadius}px`
          : undefined,
    }}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-base font-semibold text-neutral-900">
          {block.data.heading || "Speed Dating"}
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Live matchmaking board
        </div>
      </div>

      <div className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600">
        Round {round + 1}
      </div>
    </div>

    {block.data.showTimer !== false && (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Time Remaining
          </div>
          <div className="mt-1 text-3xl font-semibold text-neutral-900">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${((duration - timeLeft) / duration) * 100}%`,
            }}
          />
        </div>
      </div>
    )}
  </div>
);}

function renderCanvasPreview(item: CanvasGridItem) {
    console.log("CANVAS DRAFT BLOCK COUNT", draft.blocks.length);

    if (isPageBlockId(item.id)) {
  const textValue =
    item.id === PAGE_TITLE_BLOCK_ID
      ? draft.title || ""
      : item.id === PAGE_SUBTITLE_BLOCK_ID
        ? draft.subtitle || ""
        : item.id === PAGE_SUBTEXT_BLOCK_ID
          ? draft.subtext || ""
          : draft.description || "";

  const pageTextStyle =
    item.id === PAGE_TITLE_BLOCK_ID
      ? draft.titleStyle
      : item.id === PAGE_SUBTITLE_BLOCK_ID
        ? draft.subtitleStyle
        : item.id === PAGE_SUBTEXT_BLOCK_ID
          ? draft.subtextStyle
          : draft.descriptionStyle;

  const appearanceKey = getPageAppearanceKey(item.id);
  const pageBlockBg =
    appearanceKey &&
    (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]
      ?.backgroundColor &&
    (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]
      ?.backgroundColor !== "transparent"
      ? (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]
          ?.backgroundColor
      : "transparent";

return (
  <div
    className="h-full w-full p-3"
    style={{
      backgroundColor: pageBlockBg,
    }}
  >
    <textarea
      value={textValue}
      onChange={(e) => updateTextByCanvasId(item.id, e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="block h-full w-full resize-none bg-transparent outline-none"
      placeholder="Enter text..."
      style={{
        ...getInlineTextStyle(pageTextStyle),
        padding: 0,
        margin: 0,
        border: "none",
        boxSizing: "border-box",
      }}
    />
  </div>
);
}

    const block = draft.blocks.find((b) => b.id === item.id);

    if (!block) {
      return <div className="text-xs uppercase text-white/60">{item.type}</div>;
    }

if (block.type === "label") {
  const hasTexture = Boolean(
    block.data.style?.textureEnabled && block.data.style?.textureImageUrl,
  );

  return (
    <div
      className="h-full w-full p-2"
      style={{
        backgroundColor:
          block.appearance?.backgroundColor &&
          block.appearance.backgroundColor !== "transparent"
            ? block.appearance.backgroundColor
            : "transparent",
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
        borderRadius:
          typeof block.appearance?.borderRadius === "number"
            ? `${block.appearance.borderRadius}px`
            : undefined,
      }}
    >
      <textarea
        value={block.data.text || ""}
        onChange={(e) => updateTextByCanvasId(block.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="block h-full w-full resize-none bg-transparent outline-none"
        placeholder="Label"
        style={{
          ...getInlineTextStyle(block.data.style),
          padding: 0,
          margin: 0,
          border: "none",
          boxSizing: "border-box",
          backgroundImage: hasTexture
            ? `url("${block.data.style?.textureImageUrl}")`
            : undefined,
          backgroundRepeat: hasTexture ? "repeat" : undefined,
          backgroundSize: hasTexture
            ? `${block.data.style?.textureScale ?? 100}%`
            : undefined,
          backgroundPosition: hasTexture
            ? `${block.data.style?.texturePositionX ?? 50}% ${
                block.data.style?.texturePositionY ?? 50
              }%`
            : undefined,
          backgroundClip: hasTexture ? "text" : undefined,
          WebkitBackgroundClip: hasTexture ? "text" : undefined,
          color: hasTexture ? "transparent" : block.data.style?.color || undefined,
          WebkitTextFillColor: hasTexture ? "transparent" : block.data.style?.color || undefined,
          transform: `translate(${((block.data as any).positionX ?? 50) - 50}%, ${
            ((block.data as any).positionY ?? 50) - 50
          }%)`,
        }}
      />
    </div>
  );
}

if (block.type === "text_fx") {
  const hasTexture = Boolean(
    block.data.style?.textureEnabled && block.data.style?.textureImageUrl,
  );

  return (
    <div className="h-full w-full">
<BlockRenderer
  block={{
    ...block,
    data: {
      ...block.data,
      style: {
        ...block.data.style,
        color: hasTexture ? "transparent" : block.data.style?.color,
        WebkitTextFillColor: hasTexture
          ? "transparent"
          : block.data.style?.color,
        backgroundImage: hasTexture
          ? `url("${block.data.style?.textureImageUrl}")`
          : undefined,
        backgroundRepeat: hasTexture ? "repeat" : undefined,
        backgroundSize: hasTexture
          ? `${block.data.style?.textureScale ?? 100}%`
          : undefined,
        backgroundPosition: hasTexture
          ? `${block.data.style?.texturePositionX ?? 50}% ${
              block.data.style?.texturePositionY ?? 50
            }%`
          : undefined,
        backgroundClip: hasTexture ? "text" : undefined,
        WebkitBackgroundClip: hasTexture ? "text" : undefined,
      } as any,
    },
  }}
  blocks={draft.blocks}
  designKey={designKey}
/>
    </div>
  );
}

    if (block.type === "image") {
      return block.data.image.url ? (
        <div
          className="h-full w-full"
          onDoubleClick={() => void uploadImageToSelectedBlock(block.id)}
          title="Double-click to replace image"
        >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
        </div>
      ) : (
        <ImageUploadDropzone
          label="Drag image here or click to browse"
          className="h-full w-full"
          onUploaded={(url) => {
            setDraft((prev) => ({
              ...prev,
              blocks: prev.blocks.map((item) =>
                item.id === block.id && item.type === "image"
                  ? {
                      ...item,
                      data: {
                        image: {
                          ...item.data.image,
                          url,
                        },
                      },
                    }
                  : item,
              ),
            }));
          }}
        />
      );
    }

    if (block.type === "audio") {
      return block.data.audioUrl ? (
        <div
          className="h-full w-full"
          onDoubleClick={() => void uploadAudioToSelectedBlock(block.id)}
          title="Double-click to replace audio"
        >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
        </div>
      ) : (
        <button
          type="button"
          className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          onClick={() => void uploadAudioToSelectedBlock(block.id)}
        >
          Browse Audio
        </button>
      );
    }

if (block.type === "frame") {
  return (
    <div className="h-full w-full rounded-xl border-2 border-dashed border-neutral-700 bg-transparent" />
  );
}

    if (block.type === "puzzle") {
      return block.data.imageUrl ? (
        <div
          className="h-full w-full"
          onDoubleClick={() => uploadPuzzleImageToSelectedBlock(block.id)}
          title="Double-click to replace puzzle image"
        >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
        </div>
      ) : (
        <div
          className="h-full w-full cursor-pointer"
          onClick={() => uploadPuzzleImageToSelectedBlock(block.id)}
          onDoubleClick={() => uploadPuzzleImageToSelectedBlock(block.id)}
          title="Click to add puzzle image"
        >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
        </div>
      );
    }

if (block.type === "gallery") {
  return (
    <div
      className="h-full w-full"
      onDoubleClick={() => void uploadGalleryImagesToBlock(block.id)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void uploadDroppedGalleryFiles(block.id, e.dataTransfer.files);
      }}
      title="Double-click or drag images here. Large gallery uploads are compressed to keep drafts saveable."
    >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
    </div>
  );
}

    if (block.type === "poll") {
      return (
        <div className="h-full w-full">
          <div
            className="h-full w-full rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            style={{
              backgroundColor:
                block.appearance?.backgroundColor &&
                block.appearance.backgroundColor !== "transparent"
                  ? block.appearance.backgroundColor
                  : undefined,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusInspectorForBlock({
                  type: "poll-question",
                  blockId: block.id,
                });
              }}
              className="block w-full text-left text-sm text-neutral-900"
              style={getInlineTextStyle(block.data.style)}
            >
              {block.data.question || "Your question here"}
            </button>

            <div className="mt-3 space-y-2">
              {block.data.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "poll-option",
                      blockId: block.id,
                      optionId: option.id,
                    });
                  }}
                  className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-800"
                >
                  {option.text || "Option"}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === "rsvp") {
      return (
        <div className="h-full w-full">
          <div
            className="h-full w-full cursor-text"
            onClick={(e) => {
              e.stopPropagation();
              focusInspectorForBlock({
                type: "rsvp-heading",
                blockId: block.id,
              });
            }}
          >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
          </div>
        </div>
      );
    }

    if (block.type === "countdown") {
      return (
        <div className="h-full w-full">
          <div className="h-full w-full rounded-xl border border-transparent p-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusInspectorForBlock({
                  type: "countdown-heading",
                  blockId: block.id,
                });
              }}
              className="block w-full text-left"
            >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
            </button>
          </div>
        </div>
      );
    }

if (block.type === "faq") {
  const behavior =
    ((block.data as any).behavior as
      | "always-open"
      | "accordion"
      | "accordion-single"
      | undefined) ?? "always-open";

  const showIcons = (block.data as any).showIcons !== false;
  const sectionStyle = ((block.data as any).sectionStyle ?? {}) as any;

  const questionStyle = getInlineTextStyle(
    ((block.data as any).questionStyle ?? block.data.style ?? {}) as TextStyle,
  );

  const answerStyle = getInlineTextStyle(
    ((block.data as any).answerStyle ?? block.data.style ?? {}) as TextStyle,
  );

  const sectionBackgroundColor =
    sectionStyle.backgroundColor === "transparent"
      ? "transparent"
      : sectionStyle.backgroundColor ?? "rgba(255,255,255,0.6)";

  const openAll = behavior === "always-open";

  return (
    <div className="h-full w-full overflow-auto rounded-xl">
      <div className="space-y-2 p-2">
        {block.data.items.length ? (
          block.data.items.map((faqItem) => {
            const isOpen = openAll;

            return (
              <div
                key={faqItem.id}
                className="rounded-xl border p-2"
                style={{
                  backgroundColor: sectionBackgroundColor,
                  borderColor: sectionStyle.borderColor ?? "#e5e7eb",
                  borderWidth:
                    typeof sectionStyle.borderWidth === "number"
                      ? `${sectionStyle.borderWidth}px`
                      : sectionStyle.borderWidth ?? "1px",
                  borderStyle: "solid",
                  borderRadius:
                    typeof sectionStyle.borderRadius === "number"
                      ? `${sectionStyle.borderRadius}px`
                      : sectionStyle.borderRadius ?? "0.75rem",
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "faq-question",
                      blockId: block.id,
                      itemId: faqItem.id,
                    });
                  }}
                  className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium"
                  style={questionStyle}
                >
                  <span>{faqItem.question || "Question"}</span>

                  {showIcons && behavior !== "always-open" ? (
                    <span className="shrink-0">›</span>
                  ) : null}
                </button>

                {isOpen ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusInspectorForBlock({
                        type: "faq-answer",
                        blockId: block.id,
                        itemId: faqItem.id,
                      });
                    }}
                    className="mt-2 block w-full text-left text-sm"
                    style={answerStyle}
                  >
                    {faqItem.answer || "Answer"}
                  </button>
                ) : null}
              </div>
            );
          })
        ) : (
          <div
            className="h-full w-full cursor-text"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
          </div>
        )}
      </div>
    </div>
  );
}

    if (block.type === "thread") {
      return (
        <div
          className="h-full w-full cursor-text"
          onClick={(e) => {
            e.stopPropagation();
            focusInspectorForBlock({
              type: "thread-subject",
              blockId: block.id,
            });
          }}
        >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
        </div>
      );
    }

    if (block.type === "links") {
      const textStyle = getInlineTextStyle(block.data.style);
      const textAlign = block.data.style?.align ?? "left";

      return (
        <div
          className="h-full w-full overflow-auto rounded-xl p-2"
          style={{
            backgroundColor: block.data.transparentBackground
              ? "transparent"
              : (block.data.backgroundColor ?? "#ffffff"),
          }}
        >
          {block.data.heading ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusInspectorForBlock({
                  type: "links-heading",
                  blockId: block.id,
                });
              }}
              className="mb-2 block w-full"
              style={{
                ...textStyle,
                textAlign,
              }}
            >
              {block.data.heading}
            </button>
          ) : null}

          <div className="space-y-2">
            {block.data.items.map((linkItem) => (
              <div
                key={linkItem.id}
                className="rounded-xl border border-neutral-200 bg-white/70 p-2"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "links-item-label",
                      blockId: block.id,
                      itemId: linkItem.id,
                    });
                  }}
                  className="block w-full"
                  style={{
                    ...textStyle,
                    textAlign,
                  }}
                >
                  {linkItem.label || "Link"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "links-item-url",
                      blockId: block.id,
                      itemId: linkItem.id,
                    });
                  }}
                  className="mt-1 block w-full"
                  style={{
                    color: block.data.style?.color ?? "#525252",
                    textAlign,
                    fontSize: textStyle.fontSize
                      ? `calc(${textStyle.fontSize} * 0.85)`
                      : undefined,
                    fontFamily: textStyle.fontFamily,
                    fontWeight: textStyle.fontWeight,
                    fontStyle: textStyle.fontStyle,
                    textDecoration: textStyle.textDecoration,
                  }}
                >
                  {linkItem.url || "#"}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "image_carousel") {
  return (
    <div
      className="h-full w-full cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        focusInspectorForBlock({
          type: "carousel-heading",
          blockId: block.id,
        });
      }}
      title="Edit carousel in inspector"
    >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
    </div>
  );
}
if (block.type === "form_field") {
  return (
    <div className="h-full w-full">
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
    </div>
  );
}

if (block.type === "option_button") {
  return (
    <div className="h-full w-full">
      <BlockRenderer
        block={block}
        blocks={draft.blocks}
        designKey={designKey}
        optionButtonSelections={optionButtonSelections}
        onOptionButtonSelectionChange={(change) =>
          setOptionButtonSelections((prev) => ({
            ...prev,
            [change.blockId]: change.selectedOptionIds,
          }))
        }
      />
    </div>
  );
}

if (block.type === "summary") {
  const linkedBlockIds = Array.isArray((block.data as any).linkedBlocks)
    ? ((block.data as any).linkedBlocks as any[]).map((item) => item.blockId)
    : [];

  const linkedBlockSnapshots = draft.blocks.filter((candidate) =>
    linkedBlockIds.includes(candidate.id),
  );

  return (
    <div className="h-full w-full">
      <BlockRenderer
        block={{
          ...block,
          data: {
            ...(block.data as any),
            linkedBlockSnapshots,
          },
        } as any}
        blocks={linkedBlockSnapshots}
        designKey={designKey}
        optionButtonSelections={optionButtonSelections}
      />
    </div>
  );
}

    if (block.type === "listing") {
      return block.data.image.url ? (
        <div
          className="h-full w-full"
          onDoubleClick={() => void uploadImageToSelectedBlock(block.id)}
          title="Double-click to replace listing image"
        >
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
        </div>
      ) : (
        <ImageUploadDropzone
          label="Drag listing image here or click to browse"
          className="h-full w-full"
          onUploaded={(url) => {
            setDraft((prev) => ({
              ...prev,
              blocks: prev.blocks.map((item) =>
                item.id === block.id && item.type === "listing"
                  ? {
                      ...item,
                      data: {
                        ...item.data,
                        image: {
                          ...item.data.image,
                          url,
                        },
                      },
                    }
                  : item,
              ),
            }));
          }}
        />
      );
    }

    if (block.type === "cart") {
  return (
    <div className="h-full w-full">
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
/>
    </div>
  );
}

if (block.type === "progress_bar") {
  return (
    <div className="h-full w-full">
      <BlockRenderer
        key={`${block.id}-${JSON.stringify(block.data)}`}
        block={block}
  blocks={draft.blocks}
        designKey={designKey}
      />
    </div>
  );
}


// Donation render block
if (block.type === "donation") {
  const donationOptions = Array.isArray(block.data.donationOptions)
    ? block.data.donationOptions.filter(
        (item) =>
          item &&
          typeof item.amount === "number" &&
          Number.isFinite(item.amount) &&
          item.amount > 0,
      )
    : [];

  const donationButtonSpacing = Math.max(
    0,
    Number(block.data.buttonSpacing ?? 8),
  );

  return (
    <div
      className="h-full w-full rounded-xl p-4"
      style={{
        backgroundColor:
          block.appearance?.backgroundColor &&
          block.appearance.backgroundColor !== "transparent"
            ? block.appearance.backgroundColor
            : "transparent",
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
        borderRadius:
          typeof block.appearance?.borderRadius === "number"
            ? `${block.appearance.borderRadius}px`
            : undefined,
      }}
    >
      <div
        className="text-base font-semibold text-neutral-900"
        style={getInlineTextStyle(block.data.style)}
      >
        {block.data.heading || "Support This Cause"}
      </div>

      {block.data.description ? (
        <div
          className="mt-2 text-sm text-neutral-600"
          style={getInlineTextStyle(block.data.style)}
        >
          {block.data.description}
        </div>
      ) : null}

      {donationOptions.length ? (
        <div
          className="mt-4 flex flex-wrap"
          style={{
            marginLeft: `-${donationButtonSpacing / 2}px`,
            marginRight: `-${donationButtonSpacing / 2}px`,
          }}
        >
          {donationOptions.map((option, index) => {
            const amount = Number(option.amount || 0);
            const label =
              typeof option.label === "string" && option.label.trim().length > 0
                ? option.label.trim()
                : `$${formatCurrency(amount)}`;

            const buttonStyle = ((block.data as any).buttonStyle ?? {}) as any;
            const donationTextStyle = ((block.data as any).style ?? {}) as any;

            return (
              <button
                key={option.id || `donation-option-${index}`}
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2"
                style={{
                  marginLeft: `${donationButtonSpacing / 2}px`,
                  marginRight: `${donationButtonSpacing / 2}px`,
                  backgroundColor: buttonStyle.backgroundColor ?? "#171717",
                  color: buttonStyle.color ?? "#ffffff",
                  fontFamily:
                    buttonStyle.fontFamily ?? donationTextStyle.fontFamily,
                  fontSize:
                    typeof buttonStyle.fontSize === "number"
                      ? `${buttonStyle.fontSize}px`
                      : undefined,
                  fontWeight: buttonStyle.bold ? 700 : 500,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-500"
          style={getInlineTextStyle(block.data.style)}
        >
          Add donation buttons.
        </div>
      )}
    </div>
  );
}

if (block.type === "link_hub") {
  const imagePlacement = (block.data as any).imagePlacement ?? "floatLeft";
  const isFlush =
    imagePlacement === "flushLeft" || imagePlacement === "flushRight";
  const imageOnRight =
    imagePlacement === "flushRight" || imagePlacement === "floatRight";

const cardPaddingX = Number((block.data as any).cardPaddingX ?? 16);
const cardPaddingY = Number((block.data as any).cardPaddingY ?? 12);
const imageWidth = Number((block.data as any).imageWidth ?? 40);

  const cardShadow =
    (block.data as any).cardShadowEnabled &&
    Number((block.data as any).cardShadowBlur ?? 0) > 0
      ? `${Number((block.data as any).cardShadowX ?? 0)}px ${Number(
          (block.data as any).cardShadowY ?? 0,
        )}px ${Number((block.data as any).cardShadowBlur ?? 0)}px ${
          (block.data as any).cardShadowColor ?? "#000000"
        }`
      : undefined;

  const triggerSymbol =
    (block.data as any).customTriggerEnabled &&
    (block.data as any).customTriggerUrl
      ? (block.data as any).customTriggerUrl
      : (block.data as any).triggerSymbol || "/icons/icon_thin_chevron.png";

  return (
    <div
      className="h-full w-full rounded-xl p-4"
      style={{
        backgroundColor:
          block.appearance?.backgroundColor &&
          block.appearance.backgroundColor !== "transparent"
            ? block.appearance.backgroundColor
            : "transparent",
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
        borderRadius:
          typeof block.appearance?.borderRadius === "number"
            ? `${block.appearance.borderRadius}px`
            : undefined,
      }}
    >
      {String(block.data.heading ?? "").trim() ? (
        <div
          className="mb-3 text-base font-semibold text-neutral-900"
          style={getInlineTextStyle(block.data.style)}
        >
          {block.data.heading}
        </div>
      ) : null}

      <div
  className="flex flex-col"
  style={{
    gap: `${Number((block.data as any).cardGap ?? 12)}px`,
  }}
>
        {block.data.items.map((item, index) => {
          const linkItem = item as LinkItem & {
            description?: string;
            logoUrl?: string;
          };

          const description = String(linkItem.description ?? "").trim();
          const logoUrl = linkItem.logoUrl;

          const imageFrame = (block.data as any).imageFrame ?? "circle";

const imageNode = logoUrl ? (
  <span
    className={[
      "flex shrink-0 items-center justify-center overflow-hidden",
      isFlush
        ? "self-stretch rounded-none border-0"
        : imageFrame === "square"
          ? "rounded-lg border border-neutral-200"
          : "rounded-full border border-neutral-200",
    ].join(" ")}
    style={{
      width: `${imageWidth}px`,
      minWidth: `${imageWidth}px`,
      backgroundColor: "transparent",
      ...(isFlush ? {} : { height: `${imageWidth}px` }),
    }}
  >
    <img src={logoUrl} alt="" className="h-full w-full object-contain" />
  </span>
) : null;

          const triggerNode =
            !imageOnRight && triggerSymbol ? (
              <span
                className="flex self-stretch shrink-0 items-center justify-center"
                style={{
                  width: `${Number((block.data as any).triggerSymbolSize ?? 40) + 32}px`,
                  minWidth: `${Number((block.data as any).triggerSymbolSize ?? 40) + 32}px`,
                }}
              >
                <img
                  src={triggerSymbol}
                  alt=""
                  className="block max-h-none max-w-none object-contain"
                  style={{
                    width: `${Number((block.data as any).triggerSymbolSize ?? 40)}px`,
                    height: `${Number((block.data as any).triggerSymbolSize ?? 40)}px`,
                  }}
                />
              </span>
            ) : null;

          return (
            <div
              key={item.id}
              className="flex items-stretch gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-white"
style={{
  boxShadow: cardShadow,
  backgroundColor:
    (block.data as any).cardTransparentBackground
      ? "transparent"
      : ((block.data as any).cardBackgroundColor ?? undefined),
  borderColor: (block.data as any).cardBorderColor ?? undefined,
  borderWidth:
    typeof (block.data as any).cardBorderWidth === "number"
      ? `${(block.data as any).cardBorderWidth}px`
      : undefined,
  borderRadius:
    typeof (block.data as any).cardBorderRadius === "number"
      ? `${(block.data as any).cardBorderRadius}px`
      : undefined,
  paddingLeft: isFlush ? 0 : `${cardPaddingX}px`,
                paddingRight: isFlush ? 0 : `${cardPaddingX}px`,
                paddingTop: isFlush ? 0 : `${cardPaddingY}px`,
                paddingBottom: isFlush ? 0 : `${cardPaddingY}px`,
              }}
            >
              {!imageOnRight ? imageNode : null}

              <div
                className="min-w-0 flex flex-1 flex-col justify-center"
                style={{
                  paddingLeft: isFlush ? `${cardPaddingX}px` : undefined,
                  paddingRight: isFlush ? `${cardPaddingX}px` : undefined,
                  paddingTop: isFlush ? `${cardPaddingY}px` : undefined,
                  paddingBottom: isFlush ? `${cardPaddingY}px` : undefined,
                }}
              >
                <div
                  className="truncate text-sm font-medium text-neutral-900"
                  style={getInlineTextStyle(
                    (block.data as any).labelStyle ?? block.data.style,
                  )}
                >
                  {item.label || `Link ${index + 1}`}
                </div>

                {description ? (
                  <div
                    className="mt-1 truncate text-xs text-neutral-600"
                    style={getInlineTextStyle(
                      (block.data as any).descriptionStyle ??
                        block.data.style,
                    )}
                  >
                    {description}
                  </div>
                ) : null}

                {(item as any).showUrl && item.url ? (
                  <div
                    className="mt-1 truncate text-xs text-neutral-500"
                    style={getInlineTextStyle(
                      (block.data as any).urlStyle ?? block.data.style,
                    )}
                  >
                    {item.url || "#"}
                  </div>
                ) : null}
              </div>
{triggerNode}

{imageOnRight ? imageNode : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

    if (block.type === "checklist") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "Checklist"}
          </div>

          <div className="space-y-2">
            {block.data.items.slice(0, 5).map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={Boolean(item.checked)}
                  readOnly
                />
                <span
                  className="text-sm text-neutral-900"
                  style={getInlineTextStyle(block.data.style)}
                >
                  {item.label || "Checklist item"}
                </span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "schedule_agenda") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "Schedule"}
          </div>

          <div className="space-y-2">
            {block.data.items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
              >
                <div className="text-xs text-neutral-500">
                  {item.time || "Time"}
                </div>
                <div
                  className="text-sm font-medium text-neutral-900"
                  style={getInlineTextStyle(block.data.style)}
                >
                  {item.title || "Event"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "map_location") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "Location"}
          </div>

          <div className="flex h-40 w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-sm text-neutral-500">
            Map Preview
          </div>

          <div className="mt-2 text-xs text-neutral-500">
            {block.data.address || "Enter address"}
          </div>
        </div>
      );
    }

    if (block.type === "file_share") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "File Share"}
          </div>

          {block.data.subtext ? (
            <div
              className="mb-3 text-sm text-neutral-600"
              style={getInlineTextStyle(block.data.style)}
            >
              {block.data.subtext}
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            Upload / download area
          </div>

          <div className="mt-3 space-y-1 text-xs text-neutral-500">
            <div>
              Public upload: {block.data.allowPublicUpload ? "On" : "Off"}
            </div>
            <div>
              Access code: {block.data.requireAccessCode ? "Required" : "Not required"}
            </div>
          </div>
        </div>
      );
    }

if (block.type === "speed_dating") {
  return <SpeedDatingCanvasPreview block={block} />;
}

if (block.type === "pop_balloon") {
  return <PopBalloonCanvasPreview block={block} />;
}

if (block.type === "registry") {
  return (
    <div
      className="h-full w-full rounded-xl p-4 overflow-auto"
      style={{
        backgroundColor:
          block.appearance?.backgroundColor &&
          block.appearance.backgroundColor !== "transparent"
            ? block.appearance.backgroundColor
            : "transparent",
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
        borderRadius:
          typeof block.appearance?.borderRadius === "number"
            ? `${block.appearance.borderRadius}px`
            : undefined,
      }}
    >
      <div
        className="mb-3 text-base font-semibold text-neutral-900"
        style={getInlineTextStyle(block.data.style)}
      >
        {block.data.heading || "Gift Registry"}
      </div>

      {block.data.description ? (
        <div
          className="mb-3 text-sm text-neutral-600"
          style={getInlineTextStyle(block.data.style)}
        >
          {block.data.description}
        </div>
      ) : null}

      <div className="space-y-2">
        {(block.data.items ?? []).length ? (
          (block.data.items ?? []).slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-3"
            >
              <div
                className="text-sm font-medium text-neutral-900"
                style={getInlineTextStyle(block.data.style)}
              >
                {item.label || "Registry Item"}
              </div>

              {(item.store || item.price) ? (
                <div className="mt-1 text-xs text-neutral-500">
                  {[item.store, item.price].filter(Boolean).join(" • ")}
                </div>
              ) : null}

              {item.note ? (
                <div className="mt-2 text-xs text-neutral-600 line-clamp-3">
                  {item.note}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
            Add registry items in the inspector.
          </div>
        )}
      </div>
    </div>
  );
}

if (block.type === "video") {
  const thumbnailUrl = String((block.data as any).thumbnailUrl ?? "").trim();
  const autoGenerateThumbnail =
    (block.data as any).autoGenerateThumbnail !== false;

  const showCustomThumbnail =
    !autoGenerateThumbnail && Boolean(thumbnailUrl);

  const hasVideo = Boolean(String(block.data.videoUrl ?? "").trim());

  const showTitle = Boolean(String(block.data.title ?? "").trim());
  const showCaption = Boolean((block.data as any).addCaption);
  const caption = String((block.data as any).caption ?? "").trim();
  const captionStyle = ((block.data as any).captionStyle ?? {}) as TextStyle;

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-black"
      style={{
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
        borderRadius:
          typeof block.appearance?.borderRadius === "number"
            ? `${block.appearance.borderRadius}px`
            : undefined,
      }}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        {showCustomThumbnail ? (
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : hasVideo ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-800 to-black">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center text-white shadow-xl backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                Video Uploaded
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                Ready for preview
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Add video URL
          </div>
        )}

        {showTitle ? (
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 w-full px-3 py-2 text-sm font-semibold"
style={{
  ...getInlineTextStyle((block.data as any).titleStyle),
  color: (block.data as any).titleStyle?.color || "#ffffff",
}}
          >
            {String(block.data.title ?? "")}
          </div>
        ) : null}
      </div>

      {showCaption && caption ? (
        <div
          className="shrink-0 px-3 py-2 text-xs"
          style={{
            ...getInlineTextStyle(captionStyle),
            color: captionStyle.color || "#ffffff",
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}

if (block.type === "rich_text") {
  const richTextStyle = getInlineTextStyle(block.data.style);

  return (
    <div
      className="h-full w-full rounded-xl overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();

        const container = e.currentTarget;
        const editor = container.querySelector(
          `[data-canvas-rich-text="${block.id}"]`,
        ) as HTMLDivElement | null;

        if (!editor) return;

        editor.focus();

        const clickedInsideEditor = editor.contains(e.target as Node);

        if (!clickedInsideEditor) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).isContentEditable) {
          e.stopPropagation();
        }
      }}
      style={{
        backgroundColor:
          block.appearance?.backgroundColor &&
          block.appearance.backgroundColor !== "transparent"
            ? block.appearance.backgroundColor
            : "transparent",
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
borderRadius:
  typeof block.appearance?.borderRadius === "number"
    ? `${block.appearance.borderRadius}px`
    : undefined,
      }}
    >
      <div className="h-full w-full p-4">
        {block.data.title ? (
          <div
            className="mb-2 text-lg font-semibold text-neutral-900"
            style={richTextStyle}
          >
            {block.data.title}
          </div>
        ) : null}

        <div
          data-canvas-rich-text={block.id}
          className="min-h-full min-w-0 max-w-full text-sm text-neutral-800 break-words outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-1 [&_li]:list-item [&_li>p]:m-0 [&_li>p]:inline [&_p]:my-0 [&_p+p]:mt-3 [&_p:empty]:min-h-[1em] [&_a]:break-words [&_a]:underline [&_img]:max-w-full [&_img]:h-auto"
          style={richTextStyle}
          dangerouslySetInnerHTML={{
            __html:
              typeof block.data.contentHtml === "string"
                ? block.data.contentHtml
                : block.data.content || "",
          }}
        />
      </div>
    </div>
  );
}

if (block.type === "icon") {
  const icon = block.data.icon;
  const iconUrl =
    icon.url ||
    `/media-icons/${String(block.label || icon.alt || "star")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}.svg`;

  const positionX = icon.positionX ?? 50;
  const positionY = icon.positionY ?? 50;
  const zoom = icon.zoom ?? 1;
  const rotation = icon.rotation ?? 0;
  const translateX = (positionX - 50) * 0.6;
  const translateY = (positionY - 50) * 0.6;

  const isDirectSvg = iconUrl.includes("/circle-");
  const numberedCircleMatch = iconUrl.match(/circle-(one|two|three|four|five|six|seven|eight|nine|ten)\.svg$/);

const numberedCircleValue = numberedCircleMatch
  ? {
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      ten: "10",
    }[numberedCircleMatch[1]]
  : null;

return (
  <div className="flex h-full w-full items-center justify-center overflow-visible">
    {numberedCircleValue ? (
      <svg
        viewBox="0 0 122.88 122.88"
        aria-label={icon.alt || "Icon"}
        className="h-full w-full"
        style={{
          transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          opacity: icon.opacity ?? 1,
        }}
      >
        <circle cx="61.44" cy="61.44" r="61.44" fill={icon.color ?? "#111111"} />
        <text
          x="61.44"
          y="67"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={numberedCircleValue === "10" ? "44" : "58"}
          fontWeight="800"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {numberedCircleValue}
        </text>
      </svg>
    ) : (
      <div
        className="h-full w-full"
        style={{
          transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          opacity: icon.opacity ?? 1,
          backgroundColor: icon.color ?? "#111111",
          WebkitMaskImage: `url("${iconUrl}")`,
          maskImage: `url("${iconUrl}")`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    )}
  </div>
);
}

    if (block.type === "timeline") {
      return (
        <div className="h-full w-full">
<BlockRenderer
  block={block}
  blocks={draft.blocks}
  designKey={designKey}
  onFocusTimelineEntry={(blockId, entryId) => {
    setSelection(selectionFromCanvasBlockId(blockId));
    setFocusedTimelineEntryId(entryId);

    requestAnimationFrame(() => {
      document
        .getElementById(`timeline-entry-inspector-${entryId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    });
  }}
/>
        </div>
      );
    }

    return (
  <BlockRenderer
    block={block}
    blocks={draft.blocks}
    designKey={designKey}
    optionButtonSelections={optionButtonSelections}
    onOptionButtonSelectionChange={(change) =>
      setOptionButtonSelections((prev) => ({
        ...prev,
        [change.blockId]: change.selectedOptionIds,
      }))
    }
  />
);
}

  const scrollbarWidth = getGridCanvasScrollableWidth();

const toolSetItems = [...canvasItems]
  .sort(
    (a, b) =>
      Number(b.grid?.zIndex ?? 1) - Number(a.grid?.zIndex ?? 1),
  )
  .map((item) => ({
    id: item.id,
    label: item.label || item.type,
    kind: isPageBlockId(item.id) ? "page" : item.type,
    canRename: !isPageBlockId(item.id),
    zIndex: Number(item.grid?.zIndex ?? 1),
  }));

function getToolSearchKey(category: BottomCategory, tool: { label: string; type: string }) {
  return `${category}-${tool.type}-${tool.label}`;
}

function toolMatchesSearch(
  query: string,
  category: BottomCategory,
  tool: { label: string; type: string },
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return false;

  const haystack = [
    tool.label,
    tool.type,
    category,
    TOOL_DESCRIPTIONS[tool.label] ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function toggleToolMenu(category: BottomCategory) {
  setActiveCategory(category);
  setOpenToolMenu((prev) => (prev === category ? null : category));
}

function nudgeSelectedBlock(
  direction: "left" | "right" | "up" | "down",
  amount: number = 0.25,
) {
  const idsToMove =
    selectedBlockIds.length > 0
      ? selectedBlockIds
      : selectedCanvasBlockId
        ? [selectedCanvasBlockId]
        : [];

  if (!idsToMove.length) return;

  const deltaCol =
    direction === "left" ? -amount : direction === "right" ? amount : 0;

  const deltaRow =
    direction === "up" ? -amount : direction === "down" ? amount : 0;

  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);

    const moved = idsToMove.reduce((nextItems, id) => {
      const item = nextItems.find((current) => current.id === id);

      if (!item?.grid) return nextItems;

      return moveCanvasItemToCell(nextItems, id, {
        colStart: (item.grid.colStart ?? 1) + deltaCol,
        rowStart: (item.grid.rowStart ?? 1) + deltaRow,
      });
    }, items);

    return applyCanvasItemsToDraft(prev, moved);
  });
}


const handleJumpToFullCanvasView = () => {
  topBarScrollRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const galleryImageCardRefs = useRef<
  Record<string, HTMLDivElement | null>
>({});


const getSaveFailureHelp = (message?: string) => {
  const lowerMessage = String(message ?? "").toLowerCase();

  if (lowerMessage.includes("payload") || lowerMessage.includes("too large")) {
    return "Your draft is likely too large. Remove oversized uploaded images, avoid base64/data URLs, or replace large Supabase-hosted images with /public/designs assets.";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return "Network request failed. Check your internet connection, then try saving again.";
  }

  if (lowerMessage.includes("unauthorized") || lowerMessage.includes("401")) {
    return "Your session may have expired. Sign in again, then retry saving.";
  }

  if (lowerMessage.includes("supabase") || lowerMessage.includes("402")) {
    return "Supabase may be blocking requests due to quota or billing limits. Check Supabase usage and reduce storage/egress.";
  }

  return "Try again. If it keeps failing, reduce large images/files in the draft and check the browser console/network tab for the exact error.";
};

return (
  <div className="flex min-h-screen flex-col bg-[#f3f3f3] pt-4">
    <div className="border-b border-black/10 bg-white px-6 py-3">
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Editing
          </div>

          <div className="mt-1 text-2xl font-semibold text-neutral-900">
            {currentSiteName}
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
        <span>{currentSiteDisplay}</span>

        <button
          type="button"
          onClick={handleCopyUrl}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          {copied ? "Copied!" : "Copy URL"}
        </button>

        <button
          type="button"
          onClick={handleCopyDraftJson}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          {draftCopied ? "Draft Copied!" : "Copy Blueprint"}
        </button>

        <button
          type="button"
          onClick={() => {
            setBuildPresetJson("");
            setBuildPresetError("");
            setBuildPresetModalOpen(true);
          }}
          className="rounded-xl border border-neutral-900 bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800"
        >
          Build From Blueprint
        </button>
      </div>

{buildPresetConfirmOpen ? (
  <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 px-4">
    <div className="relative z-[10002] w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
      <div className="text-lg font-semibold text-neutral-950">
        Replace current draft?
      </div>

      <p className="mt-2 text-sm leading-6 text-neutral-600">
        This will replace the current draft with the pasted Design Specs.\nCurrent unsaved changes will be lost.
      </p>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setPendingPresetDraft(null);
            setBuildPresetConfirmOpen(false);
          }}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={confirmBuildPresetDesign}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Replace Draft
        </button>
      </div>
    </div>
  </div>
) : null}

      {buildPresetModalOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="relative z-[10000] w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="text-lg font-semibold text-neutral-950">
              Build Design From Blueprint
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              Paste Blueprint Design Specs (JSON) below. Building will replace the current draft on this page.
            </p>

<textarea
  autoFocus
  ref={(el) => {
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }}
  value={buildPresetJson}
  onChange={(e) => {
    setBuildPresetJson(e.target.value);
    if (buildPresetError) setBuildPresetError("");
  }}
  placeholder='Paste JSON here, starting with { "title": ... }'
  className="mt-4 min-h-[320px] w-full rounded-2xl border border-neutral-300 bg-white p-4 font-mono text-xs text-neutral-900 outline-none"
/>

            {buildPresetError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {buildPresetError}
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setBuildPresetModalOpen(false);
                  setBuildPresetJson("");
                  setBuildPresetError("");
                }}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBuildPresetDesign}
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Build
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 pr-2">
{(
  pageDragPreview ??
  (pages && pages.length > 0
    ? pages
    : [
        {
          id: "home",
          slug: "home",
          title: "Home",
          display_order: 0,
        },
      ])
).map((page) => {
                const homePage =
                  pages?.find((item) => item.slug === "home") ??
                  pages?.[0] ??
                  null;

                const isHomePage =
                  page.id === "forced-home" ||
                  page.slug === "home" ||
                  page.id === homePage?.id;

                const isActive =
                  activePageId === page.id || (!activePageId && isHomePage);

                return (
                  <div
                    key={page.id}
                    draggable={!isHomePage}
                    onDragStart={(e) => {
                      if (isHomePage) return;
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedPageId(page.id);
                      setPageDragPreview(pages ?? null);
                    }}
onDragEnd={() => {
  setDraggedPageId(null);
}}
                    onDragOver={(e) => {
                      if (isHomePage || !draggedPageId || draggedPageId === page.id) return;

                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";

                      setPageDragPreview((current) => {
                        const allPages = current ?? pages ?? [];
                        const fixedHomePage =
                          allPages.find((item) => item.slug === "home") ?? allPages[0];

                        if (!fixedHomePage || draggedPageId === fixedHomePage.id) {
                          return allPages;
                        }

                        const movablePages = allPages.filter(
                          (item) =>
                            item.id !== fixedHomePage.id &&
                            item.id !== "forced-home" &&
                            item.slug !== "home",
                        );

                        const fromIndex = movablePages.findIndex(
                          (item) => item.id === draggedPageId,
                        );
                        const toIndex = movablePages.findIndex(
                          (item) => item.id === page.id,
                        );

                        if (fromIndex < 0 || toIndex < 0) return allPages;

                        const [movedPage] = movablePages.splice(fromIndex, 1);
                        movablePages.splice(toIndex, 0, movedPage);

                        return [fixedHomePage, ...movablePages];
                      });
                    }}
onDrop={async (e) => {
  e.preventDefault();

  if (
    isHomePage ||
    !draggedPageId ||
    draggedPageId === page.id ||
    !onReorderPages
  ) {
    setDraggedPageId(null);
    return;
  }

  const allPages = pageDragPreview ?? pages ?? [];
  const homePage = allPages[0];
  const movablePages = allPages.slice(1);

  const fromIndex = movablePages.findIndex(
    (item) => item.id === draggedPageId,
  );
  const toIndex = movablePages.findIndex(
    (item) => item.id === page.id,
  );

  if (fromIndex < 0 || toIndex < 0 || !homePage) {
    setDraggedPageId(null);
    setPageDragPreview(null);
    return;
  }

  const [movedPage] = movablePages.splice(fromIndex, 1);
  movablePages.splice(toIndex, 0, movedPage);

  const nextPages = [homePage, ...movablePages];

  setPageDragPreview(nextPages);
  await onReorderPages(nextPages);

  setDraggedPageId(null);
  window.setTimeout(() => {
    setPageDragPreview(null);
  }, 0);
}}
                    className={!isHomePage ? "cursor-move" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPage?.(page.id)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                        isActive
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                      }`}
                    >
                      {isHomePage ? (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          HOME
                        </span>
                      ) : (
                        <span>{page.slug}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={onOpenAddPage}
    disabled={(pages?.length ?? 1) >= 5}
    className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    + Add Page
  </button>

  <button
    type="button"
    onClick={onDuplicateActivePage}
    disabled={!onDuplicateActivePage || !activePageId || (pages?.length ?? 1) >= 5}
    className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Duplicate
  </button>

{activePageSlug && activePageSlug !== "home" ? (
  <>
    <button
      type="button"
      onClick={onRenameActivePage}
      className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
    >
      Rename Page
    </button>

    <button
      type="button"
      onClick={onRemoveActivePage}
      className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
    >
      Remove Page
    </button>
  </>
) : null}
          </div>
</div>
</div>
</div>

<div className="sticky top-0 z-[100] w-full bg-[#809cd4] shadow-md">
  <div
    ref={topBarScrollRef}
    className="flex w-full items-center justify-between gap-4 overflow-x-auto overflow-y-hidden bg-[#2f3541] px-2 py-2 shadow-md"
  >
    <div className="flex items-center justify-between gap-4">
      <div className="sticky left-0 z-0 flex min-w-max items-center gap-2 bg-[#2f3541] py-1 pr-4 pointer-events-auto">

<button
  type="button"
  className={topBarButtonClass(false)}
  onClick={handleJumpToFullCanvasView}
  title="Full canvas view"
  aria-label="Full canvas view"
>
  <Image
    src="/icons/icon_full_page_canvas.png"
    alt=""
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

<button
  type="button"
  className={topBarButtonClass(false, canvasZoom <= MIN_CANVAS_ZOOM)}
  onClick={zoomOutCanvas}
  disabled={canvasZoom <= MIN_CANVAS_ZOOM}
  title="Zoom out canvas"
>
        <Image
          src="/icons/zoom_out_icon.png"
          alt="Zoom Out"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

      <button
        type="button"
        className={topBarButtonClass(false, canvasZoom >= MAX_CANVAS_ZOOM)}
        onClick={zoomInCanvas}
        disabled={canvasZoom >= MAX_CANVAS_ZOOM}
        title="Zoom in canvas"
      >
        <Image
          src="/icons/zoom_in_icon.png"
          alt="Zoom In"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

      <div className={infoPillClass()}>{canvasZoom}%</div>

      <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

      <button
        type="button"
        className={topBarButtonClass(false, undoStack.length === 0)}
        title="Undo"
        onClick={handleUndo}
        disabled={undoStack.length === 0}

          >
            <Image
              src="/icons/icon_main_undo.png"
              alt="Undo"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

      <button
        type="button"
        className={topBarButtonClass(false, redoStack.length === 0)}
        title="Redo"
        onClick={handleRedo}
        disabled={redoStack.length === 0}
          >
            <Image
              src="/icons/icon_main_redo.png"
              alt="Redo"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

      <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

<button
  type="button"
  onClick={openResetDraftModal}
  className={topBarButtonClass(false, false, true)}
  title="Reset Draft"
>
  <Image
    src="/icons/reset_draft_icon.png"
    alt="Reset Draft"
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

      <button
        type="button"
        className={topBarButtonClass(false, false, true)}
        onClick={removeAllBlocks}
        title="Remove all blocks"
      >
        <Image
          src="/icons/remove_all_icon.png"
          alt="Remove All"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

      <button
  type="button"
  className={topBarButtonClass(showGridLines)}
  onClick={() => setShowGridLines((prev) => !prev)}
  title={showGridLines ? "Hide gridlines" : "Show gridlines"}
>
  <Image
    src="/icons/icon_gridlines.png"
    alt="Gridlines"
    width={24}
    height={24}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

      <button
        type="button"
        className={topBarButtonClass(false)}
        onClick={() => void uploadPageBackgroundImage()}
        title="Set page background image"
      >
        <Image
          src="/icons/add_background_image_icon.png"
          alt="Background Image"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

      <button
        type="button"
        className={topBarButtonClass(
          !(draft as DraftWithPageExtras).pageBackgroundImage,
          !(draft as DraftWithPageExtras).pageBackgroundImage,
        )}
        onClick={clearPageBackgroundImage}
        disabled={!(draft as DraftWithPageExtras).pageBackgroundImage}
        title="Clear page background image"
      >
        <Image
          src="/icons/remove_background_image_icon.png"
          alt="Clear Background Image"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

<select
  value={selectedPageLength}
  onChange={(e) => updatePageLength(e.target.value as PageLengthOption)}
  className={topBarFieldClass("w-[90px]")}
  title="Page length"
>
<option value="1200">1200px</option>
<option value="1400">1400px</option>
<option value="1600">1600px</option>
<option value="1800">1800px</option>
<option value="2000">2000px</option>
<option value="2400">2400px</option>
<option value="2800">2800px</option>
<option value="3200">3200px</option>
<option value="3600">3600px</option>
<option value="4000">4000px</option>
<option value="5600">5600px</option>
</select>

<div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

<div className="flex items-center gap-2">
  <input
    type="color"
    value={(draft as DraftWithPageExtras).pageColor ?? "#ffffff"}
    onChange={(e) => {
      const next = e.target.value;

      setDraft((prev) => {
        if ((prev as DraftWithPageExtras).pageColor === next) return prev;

        return {
          ...(prev as DraftWithPageExtras),
          pageColor: next,
        };
      });
    }}
    className={topBarColorClass(false)}
    title="Page color"
  />

  <button
    type="button"
    className={topBarButtonClass(false)}
    title="Pick fill color from screen"
    onClick={async () => {
      try {
        // @ts-ignore
        if (!window.EyeDropper) {
          alert("Eyedropper is not supported in this browser.");
          return;
        }

        // @ts-ignore
        const eyeDropper = new window.EyeDropper();

        const result = await eyeDropper.open();

        if (!result?.sRGBHex) return;

        setDraft((prev) => ({
          ...(prev as DraftWithPageExtras),
          pageColor: result.sRGBHex,
        }));
      } catch {
        // user cancelled
      }
    }}
  >
    <Image
      src="/icons/pick_color_icon.png"
      alt="Pick color"
      width={20}
      height={20}
      className="pointer-events-none h-5 w-5 object-contain"
    />
  </button>
</div>

      <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

      <div className="flex items-center gap-2">
  <div className={infoPillClass()}>{selectedContext.label}</div>

{selectedBlock ? (
  <>
    <button
      type="button"
      className={topBarButtonClass(false)}
      onClick={() => {
const idsToExpand =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : selection.type === "block"
      ? [selection.blockId]
      : selectedBlock?.id
        ? [selectedBlock.id]
        : [];

        if (!idsToExpand.length) return;

        setDraft((prev) => ({
          ...prev,
          blocks: prev.blocks.map((block) => {
            if (!idsToExpand.includes(block.id)) return block;

            const currentGrid = block.grid ?? {
              colStart: 1,
              rowStart: 1,
              colSpan: 4,
              rowSpan: 2,
              zIndex: 1,
            };

            return {
              ...block,
              grid: {
                colStart: 1,
                rowStart: currentGrid.rowStart ?? 1,
                colSpan: 12,
                rowSpan: currentGrid.rowSpan ?? 1,
                zIndex: currentGrid.zIndex ?? 1,
              },
            };
          }),
        }));
      }}
      title="Expand Horizon"
    >
      <Image
        src="/icons/icon_expand_horizon.png"
        alt="Expand Horizon"
        width={30}
        height={30}
        className="pointer-events-none h-[30px] w-[30px] object-contain"
      />
    </button>

<button
  type="button"
  className={topBarButtonClass(false)}
  onClick={() => {
    const activeIds =
      selectedBlockIds.length > 0
        ? selectedBlockIds
        : selection.type === "block"
          ? [selection.blockId]
          : selectedBlock?.id
            ? [selectedBlock.id]
            : [];

    if (!activeIds.length) return;

    alignSelectedBlockHorizontal("left", activeIds);
  }}
  title="Edge Left"
>
  <Image
    src="/icons/icon_edge_left.png"
    alt="Edge Left"
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

<button
  type="button"
  className={topBarButtonClass(false)}
  onClick={() => {
    const activeIds =
      selectedBlockIds.length > 0
        ? selectedBlockIds
        : selection.type === "block"
          ? [selection.blockId]
          : selectedBlock?.id
            ? [selectedBlock.id]
            : [];

    if (!activeIds.length) return;

    alignSelectedBlockHorizontal("center", activeIds);
  }}
  title="Balance Center"
>
  <Image
    src="/icons/icon_balance_center.png"
    alt="Balance Center"
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

<button
  type="button"
  className={topBarButtonClass(false)}
  onClick={() => {
    const activeIds =
      selectedBlockIds.length > 0
        ? selectedBlockIds
        : selection.type === "block"
          ? [selection.blockId]
          : selectedBlock?.id
            ? [selectedBlock.id]
            : [];

    if (!activeIds.length) return;

    alignSelectedBlockHorizontal("right", activeIds);
  }}
  title="Edge Right"
>
  <Image
    src="/icons/icon_edge_right.png"
    alt="Edge Right"
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>
</>
) : null}
</div>

{isTextSelection(selectedContext) ? (
  <button
    type="button"
    className={topBarButtonClass(false)}
    onClick={handleAioClick}
    title="Artificial Intelligent Output"
  >
    <Image
      src="/icons/icon_wand_aio.png"
      alt="AIO"
      width={36}
      height={36}
      className="h-[36px] w-[36px] object-contain"
    />
  </button>
) : null}

      {isTextFxSelected ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />
{selectedBlock?.type === "cta" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={selectedBlock.data.styleType ?? "solid"}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "cta"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  styleType: e.target.value as "solid" | "outline" | "soft",
                },
              },
        )
      }
      className={topBarFieldClass("w-[110px]")}
      title="Button style"
    >
      <option value="solid">Solid</option>
      <option value="outline">Outline</option>
      <option value="soft">Soft</option>
    </select>
  </>
) : null}
          {/* Straight */}
          <button
            type="button"
            className={topBarButtonClass(
              selectedTextFxBlock?.data.fx?.mode === "straight",
            )}
            onClick={() =>
              updateTextFx({
                mode: "straight",
              })
            }
            title="Straight"
          >
            <Image
              src="/icons/fx_straight_icon.png"
              alt="Straight"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          {/* Arch */}
          <button
            type="button"
            className={topBarButtonClass(
              selectedTextFxBlock?.data.fx?.mode === "arch",
            )}
            onClick={() =>
              updateTextFx({
                mode: "arch",
                transformStyle: "normal",
              })
            }
            title="Arch"
          >
            <Image
              src="/icons/fx_arch_icon.png"
              alt="Arch"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          {/* Dip */}
          <button
            type="button"
            className={topBarButtonClass(
              selectedTextFxBlock?.data.fx?.mode === "dip",
            )}
            onClick={() =>
              updateTextFx({
                mode: "dip",
                transformStyle: "normal",
              })
            }
            title="Dip"
          >
            <Image
              src="/icons/fx_dip_icon.png"
              alt="Dip"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          {/* Circle */}
          <button
            type="button"
            className={topBarButtonClass(
              selectedTextFxBlock?.data.fx?.mode === "circle",
            )}
            onClick={() =>
              updateTextFx({
                mode: "circle",
                transformStyle: "normal",
              })
            }
            title="Circle"
          >
            <Image
              src="/icons/fx_circle_icon.png"
              alt="Circle"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={resetSelectedTextFx}
            title="Reset TextFX"
          >
            <Image
              src="/icons/fx_reset_icon.png"
              alt="Reset"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          <div className={topBarSliderWrapClass()}>
            <span>Curve</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedTextFxBlock?.data.fx?.intensity ?? 50}
              onChange={(e) =>
                updateTextFx({ intensity: Number(e.target.value) })
              }
              className={topBarSliderClass()}
              title="Curve intensity"
            />
            <span>{selectedTextFxBlock?.data.fx?.intensity ?? 50}</span>
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Rotate</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={selectedTextFxBlock?.data.fx?.rotation ?? 0}
              onChange={(e) =>
                updateTextFx({ rotation: Number(e.target.value) })
              }
              className={topBarSliderClass()}
              title="Rotation"
            />
            <span>{selectedTextFxBlock?.data.fx?.rotation ?? 0}°</span>
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(
                (selectedTextFxBlock?.data.fx?.opacity ?? 1) * 100,
              )}
              onChange={(e) =>
                updateTextFx({ opacity: Number(e.target.value) / 100 })
              }
              className={topBarSliderClass()}
              title="Opacity"
            />
            <span>
              {Math.round(
                (selectedTextFxBlock?.data.fx?.opacity ?? 1) * 100,
              )}
              %
            </span>
          </div>
        </>
      ) : null}


      {selectedBlock?.type === "cta" ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <select
            value={selectedBlock.data.styleType ?? "solid"}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "cta"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        styleType: e.target.value as "solid" | "outline" | "soft",
                      },
                    },
              )
            }
            className={topBarFieldClass("w-[110px]")}
            title="Button style"
          >
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="soft">Soft</option>
          </select>
        </>
      ) : null}

{selectedBlock?.type === "donation" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={donationStyleTarget}
      onChange={(e) =>
        setDonationStyleTarget(e.target.value as "background" | "buttons")
      }
      className={topBarFieldClass("w-[130px]")}
      title="Donation styling target"
    >
      <option value="background">Background</option>
      <option value="buttons">Buttons</option>
    </select>
  </>
) : null}

{selectedBlock?.type === "enrollment_board" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

<select
  value={enrollmentBoardStyleTarget}
  onChange={(e) =>
    setEnrollmentBoardStyleTarget(
      e.target.value as
        | "block"
        | "form"
        | "inputs"
        | "button"
        | "list"
        | "cards"
        | "heading"
        | "subtitle"
        | "imageLabel"
        | "memberName"
        | "memberQuote"
        | "memberTotal",
    )
  }
  className={topBarFieldClass("w-[190px]")}
  title="Enrollment Board style target"
>
  <option value="block">Block Background</option>
  <option value="form">Form Panel</option>
  <option value="inputs">Input Fields</option>
  <option value="button">Submit Button</option>
  <option value="list">List Area</option>
  <option value="cards">Member Cards</option>
  <option value="heading">Heading</option>
  <option value="subtitle">Form Subheader</option>
  <option value="imageLabel">Image Label</option>
  <option value="memberName">Member Name</option>
  <option value="memberQuote">Member Quote</option>
  <option value="memberTotal">Member Total Label</option>
</select>
  </>
) : null}

      {showTypographyControls ? (
        <>

{null}


{selectedBlock?.type === "frame" ? (
  <FrameInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}


{selectedBlock?.type === "progress_bar" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={progressBarStyleTarget}
      onChange={(e) =>
        setProgressBarStyleTarget(
          e.target.value as
            | "background"
            | "bar"
            | "scope"
            | "context"
            | "meterContext"
            | "meterCaption"
        )
      }
      className={topBarFieldClass("w-[155px]")}
      title="Progress bar style target"
    >
      <option value="background">Background</option>
      <option value="bar">Bar</option>
      <option value="scope">Scope</option>
      <option value="context">Context</option>
      <option value="meterContext">Meter Value</option>
      <option value="meterCaption">Caption</option>
    </select>
  </>
) : null}

{selectedBlock?.type === "highlight" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={highlightStyleTarget}
      onChange={(e) =>
        setHighlightStyleTarget(
          e.target.value as "heading" | "value" | "body",
        )
      }
      className={topBarFieldClass("w-[160px]")}
      title="Highlight text target"
    >
      <option value="heading">Heading</option>
      <option value="value">Number Value</option>
      <option value="body">Body</option>
    </select>
  </>
) : null}

        {selectedBlock?.type === "faq" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={faqStyleTarget}
      onChange={(e) =>
        setFaqStyleTarget(
          e.target.value as "form" | "section" | "question" | "answer",
        )
      }
      className={topBarFieldClass("w-[150px]")}
      title="FAQ style target"
    >
      <option value="content">Content</option>
      <option value="section">Q&A Section</option>
      <option value="question">Section: Question</option>
      <option value="answer">Section: Answer</option>
    </select>
  </>
) : null}


{showTypographyControls ? (
            <>
              <div className="mx-1 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(selectedBold)}
            onClick={() => applyStylePatch({ bold: !selectedBold })}
            title="Bold"

          >
            <Image
              src="/icons/icon_main_bold.png"
              alt="Bold"
              width={24}
              height={24}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(selectedItalic)}
            onClick={() => applyStylePatch({ italic: !selectedItalic })}
            title="Italic"

          >
            <Image
              src="/icons/icon_main_italic.png"
              alt="Italic"
              width={24}
              height={24}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(selectedUnderline)}
            onClick={() => applyStylePatch({ underline: !selectedUnderline })}
            title="Underline"

          >
            <Image
              src="/icons/icon_main_underline.png"
              alt="Underline"
              width={24}
              height={24}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(selectedStrike)}
            onClick={() => applyStylePatch({ strike: !selectedStrike })}
            title="Strikethrough"

          >
            <Image
              src="/icons/icon_main_strikethrough.png"
              alt="Strikethrough"
              width={24}
              height={24}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={() => applyStylePatch({ align: "left" })}
            title="Align left"
            
          >
            <Image
              src="/icons/icon_main_left_align.png"
              alt="Align left"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={() => applyStylePatch({ align: "center" })}
            title="Align center"
            
          >
            <Image
              src="/icons/icon_main_center_align.png"
              alt="Align center"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={() => applyStylePatch({ align: "right" })}
            title="Align right"
            
          >
            <Image
              src="/icons/icon_main_right_align.png"
              alt="Align right"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

<div className="relative" data-font-family-menu="true">
  <button
    type="button"
    className={topBarFieldClass("min-w-[160px] text-left")}
    style={{
      fontFamily: resolveFontFamily(selectedStyle.fontFamily ?? "inherit"),
    }}
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setFontMenuPosition({
        left: rect.left,
        top: rect.bottom + 8,
      });
      setFontMenuOpen((open) => !open);
    }}
    title="Font family"
  >
    {selectedStyle.fontFamily ?? "inherit"}
  </button>

{fontMenuOpen ? (
  <div
    data-font-family-menu="true"
    className="fixed z-[9999999] max-h-80 min-w-[220px] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-xl"
    style={{
      left: fontMenuPosition.left,
      top: fontMenuPosition.top,
    }}
  >
    {FONT_FAMILY_OPTIONS.map((font) => (
      <button
        key={font}
        type="button"
        className={[
          "block w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100",
          (selectedStyle.fontFamily ?? "inherit") === font
            ? "bg-neutral-100 font-semibold"
            : "",
        ].join(" ")}
        style={{
          fontFamily: resolveFontFamily(font),
        }}
        onMouseEnter={() => applyStylePatch({ fontFamily: font })}
        onFocus={() => applyStylePatch({ fontFamily: font })}
        onClick={() => {
          applyStylePatch({ fontFamily: font });
          setFontMenuOpen(false);
        }}
      >
        {font}
      </button>
    ))}
  </div>
) : null}
</div>

<input
  type="number"
  min={1}
  max={480}
  value={selectedStyle.fontSize ?? 16}
  onChange={(e) => {
    const nextFontSize = Math.max(
      1,
      Math.min(480, Number(e.target.value) || 16),
    );

    if (nextFontSize === selectedStyle.fontSize) return;

    applyStylePatch({
      fontSize: nextFontSize,
    });
  }}
  className={topBarFieldClass("w-16")}
  title="Font size"
/>

<input
  type="color"
  value={selectedStyle.color ?? "#111827"}
  onChange={(e) => {
    const value = e.target.value;
    requestAnimationFrame(() => {
      applyTextColor(value);
    });
  }}
  className={topBarColorClass(false)}
  title="Text color"
/>

<button
  type="button"
  className={eyedropperButtonClass()}
  onClick={() =>
    void pickColorWithEyeDropper((color) => {
      requestAnimationFrame(() => {
        applyTextColor(color);
      });
    })
  }
  title="Pick text color from screen"
>
  <Image
    src="/icons/pick_color_icon.png"
    alt="Pick Color"
    width={20}
    height={20}
    className="pointer-events-none object-contain"
  />
</button>
</>
) : null}

{selectedBlock?.type === "links" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <input
      type="color"
      value={
        selectedBlock.data.transparentBackground
          ? "#ffffff"
          : (selectedBlock.data.backgroundColor ?? "#ffffff")
      }
      onChange={(e) => applyLinksBackgroundColor(e.target.value)}
      className={topBarColorClass(false)}
      title="Link block background color"
    />

    <button
      type="button"
      className={eyedropperButtonClass()}
      onClick={() =>
        void pickColorWithEyeDropper((color) => {
          applyLinksBackgroundColor(color);
        })
      }
      title="Pick link block background color from screen"
    >
      <Image
        src="/icons/pick_color_icon.png"
        alt="Pick Color"
        width={20}
        height={20}
        className="pointer-events-none object-contain"
      />
    </button>

    <button
      type="button"
      className={topBarButtonClass(
        Boolean(selectedBlock.data.transparentBackground),
      )}
      onClick={clearLinksBackgroundColor}
      title="Transparent link block background"
    >
      ☐
    </button>
  </>
) : null}

{selectedBlock?.type === "poll" || selectedBlock?.type === "calendar_event" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <input
      type="color"
      value={
        selectedAppearance.backgroundColor === "transparent"
          ? "#ffffff"
          : (selectedAppearance.backgroundColor ?? "#ffffff")
      }
      onChange={(e) => applyFillColor(e.target.value)}
      className={topBarColorClass(false)}
      title={
        selectedBlockFromDraft?.type === "poll"
          ? "Poll background color"
          : "Highlight background color"
      }
    />

    <button
      type="button"
      className={eyedropperButtonClass()}
      onClick={() =>
        void pickColorWithEyeDropper((color) => {
          applyFillColor(color);
        })
      }
      title={
        selectedBlock.type === "poll"
          ? "Pick poll background color from screen"
          : "Pick highlight background color from screen"
      }
    >
      <Image
        src="/icons/pick_color_icon.png"
        alt="Pick Color"
        width={20}
        height={20}
        className="pointer-events-none object-contain"
      />
    </button>

<button
  type="button"
  className={topBarButtonClass(
    selectedBlock?.appearance?.backgroundColor === "transparent",
  )}
onClick={() => {
  if (!selectedBlock) return;

  updateSelectedBlock((block) =>
    block.type === "calendar_event"
      ? {
          ...block,
          appearance: {
            ...(block.appearance ?? {}),
            backgroundColor: "transparent",
            backgroundOpacity: 0,
          } as any,
          data: {
            ...block.data,
            calendarStyle: {
              ...(block.data.calendarStyle ?? {}),
              formBackgroundColor: "transparent",
            },
          },
        }
      : {
          ...block,
          appearance: {
            ...(block.appearance ?? {}),
            backgroundColor: "transparent",
            backgroundOpacity: 0,
          } as any,
        },
  );
}}
title={
  selectedBlock.type === "calendar_event"
    ? "Transparent calendar background"
    : selectedBlock.type === "poll"
      ? "Transparent poll background"
      : "Transparent highlight background"
}
>
  ☐
</button>

    <div className={topBarSliderWrapClass()}>
      <span>BG Opacity</span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(
          (((selectedAppearance as any).backgroundOpacity ?? 1) * 100),
        )}
        onChange={(e) =>
          applyAppearancePatch({
            backgroundOpacity: Number(e.target.value) / 100,
          } as any)
        }
        className={topBarSliderClass()}
        title="Background transparency"
      />
      <span>
        {Math.round(
          (((selectedAppearance as any).backgroundOpacity ?? 1) * 100),
        )}
        %
      </span>
    </div>
  </>
) : null}

{selectedContext.kind === "pageText" ? (
  <>
    <input
      type="color"
      value={
        selectedPageBackgroundColor === "transparent"
          ? "#ffffff"
          : selectedPageBackgroundColor
      }
      onChange={(e) => applyPageTextBoxBackground(e.target.value)}
      className={topBarColorClass(false)}
      title="Text box background color"
    />

    <button
      type="button"
      className={eyedropperButtonClass()}
      onClick={() =>
        void pickColorWithEyeDropper((color) => {
          applyPageTextBoxBackground(color);
        })
      }
      title="Pick text box background color from screen"
    >
      <Image
        src="/icons/pick_color_icon.png"
        alt="Pick Color"
        width={20}
        height={20}
        className="pointer-events-none object-contain"
      />
    </button>

    <button
      type="button"
      className={topBarButtonClass(
        selectedPageBackgroundColor === "transparent",
      )}
      onClick={clearPageTextBackgroundColor}
      title="Transparent text box background"
    >
      ☐
    </button>
  </>
) : null}

          {selectedBlock?.type === "thread" ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <div className={topBarSliderWrapClass()}>
                <span>Messages</span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={selectedBlock.data.maxVisibleMessages ?? 4}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "thread"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              maxVisibleMessages: Math.max(
                                1,
                                Math.min(8, Number(e.target.value) || 4),
                              ),
                            },
                          },
                    )
                  }
                  className={topBarSliderClass()}
                  title="Maximum messages loaded/displayed in the thread"
                />
                <span>{selectedBlock.data.maxVisibleMessages ?? 4}</span>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {selectedBlock?.type === "image" ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <select
            value={selectedBlock.data.image.fitMode ?? "zoom"}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          fitMode: e.target.value as "clip" | "stretch" | "zoom",
                        },
                      },
                    },
              )
            }
            className={topBarFieldClass("w-[120px]")}
            title="Image fit mode"
          >
            <option value="clip">Clip</option>
            <option value="zoom">Zoom</option>
            <option value="stretch">Stretch</option>
          </select>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(
              (selectedBlock.data.image.frame ?? "square") === "square",
            )}
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          frame: "square",
                        },
                      },
                    },
              )
            }
            title="Square frame"
          >
            <Image
              src="/icons/square_icon.png"
              alt="Square"
              width={18}
              height={18}
              className="pointer-events-none"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(
              (selectedBlock.data.image.frame ?? "square") === "circle",
            )}
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          frame: "circle",
                        },
                      },
                    },
              )
            }
            title="Circle / Oval frame"
          >
            <Image
              src="/icons/circle_icon.png"
              alt="Circle"
              width={18}
              height={18}
              className="pointer-events-none"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(
              (selectedBlock.data.image.frame ?? "square") === "diamond",
            )}
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          frame: "diamond",
                        },
                      },
                    },
              )
            }
            title="Diamond frame"
          >
            <Image
              src="/icons/diamond_icon.png"
              alt="Diamond"
              width={18}
              height={18}
              className="pointer-events-none"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(
              (selectedBlock.data.image.frame ?? "square") === "heart",
            )}
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          frame: "heart",
                        },
                      },
                    },
              )
            }
            title="Heart frame"
          >
            <Image
              src="/icons/heart_icon.png"
              alt="Heart"
              width={18}
              height={18}
              className="pointer-events-none"
            />
          </button>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

<div className={topBarSliderWrapClass()}>
  <span>X</span>
  <input
    type="range"
    min={0}
    max={100}
    value={selectedBlock.data.image.positionX ?? 50}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        applyImagePatch(block, {
          positionX: Number(e.target.value),
        }),
      )
    }
    className={topBarSliderClass()}
    title="Image horizontal position"
  />
</div>

<div className={topBarSliderWrapClass()}>
  <span>Y</span>
  <input
    type="range"
    min={0}
    max={100}
    value={selectedBlock.data.image.positionY ?? 50}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        applyImagePatch(block, {
          positionY: Number(e.target.value),
        }),
      )
    }
    className={topBarSliderClass()}
    title="Image vertical position"
  />
</div>

<div className={topBarSliderWrapClass()}>
  <span>Zoom</span>
  <input
    type="range"
    min={50}
    max={300}
    value={Math.round((selectedBlock.data.image.zoom ?? 1) * 100)}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        applyImagePatch(block, {
          zoom: Number(e.target.value) / 100,
        }),
      )
    }
    className={topBarSliderClass()}
    title="Image zoom"
  />
</div>

<div className={topBarSliderWrapClass()}>
  <span>Rotate</span>
  <input
    type="range"
    min={-180}
    max={180}
    value={selectedBlock.data.image.rotation ?? 0}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        applyImagePatch(block, {
          rotation: Number(e.target.value),
        }),
      )
    }
    className={topBarSliderClass()}
    title="Image rotation"
  />
</div>

<div className={topBarSliderWrapClass()}>
  <span>Opacity</span>
  <input
    type="range"
    min={0}
    max={100}
    value={Math.round((selectedBlock.data.image.opacity ?? 1) * 100)}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        applyImagePatch(block, {
          opacity: Number(e.target.value) / 100,
        }),
      )
    }
    className={topBarSliderClass()}
    title="Image opacity"
  />
  <span>
    {Math.round((selectedBlock.data.image.opacity ?? 1) * 100)}%
  </span>
</div>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(Boolean(selectedBlock.data.image.fade?.top))}
            onClick={() =>
              updateSelectedImageFadePatch({
                top: !(selectedBlock.data.image.fade?.top ?? false),
              })
            }
            title="Fade top edge"
          >
            Top
          </button>

          <button
            type="button"
            className={topBarButtonClass(Boolean(selectedBlock.data.image.fade?.bottom))}
            onClick={() =>
              updateSelectedImageFadePatch({
                bottom: !(selectedBlock.data.image.fade?.bottom ?? false),
              })
            }
            title="Fade bottom edge"
          >
            Bottom
          </button>

          <button
            type="button"
            className={topBarButtonClass(Boolean(selectedBlock.data.image.fade?.left))}
            onClick={() =>
              updateSelectedImageFadePatch({
                left: !(selectedBlock.data.image.fade?.left ?? false),
              })
            }
            title="Fade left edge"
          >
            Left
          </button>

          <button
            type="button"
            className={topBarButtonClass(Boolean(selectedBlock.data.image.fade?.right))}
            onClick={() =>
              updateSelectedImageFadePatch({
                right: !(selectedBlock.data.image.fade?.right ?? false),
              })
            }
            title="Fade right edge"
          >
            Right
          </button>

          <div className={topBarSliderWrapClass()}>
            <span>Fade</span>
            <input
              type="range"
              min={0}
              max={50}
              value={selectedBlock.data.image.fade?.size ?? 15}
              onChange={(e) =>
                updateSelectedImageFadePatch({
                  size: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Fade size"
            />
            <span>{selectedBlock.data.image.fade?.size ?? 15}%</span>
          </div>
        </>
      ) : null}

            {selectedBlock?.type === "icon" ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <div className={topBarSliderWrapClass()}>
            <span>X</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedBlock.data.icon.positionX ?? 50}
              onChange={(e) =>
                updateSelectedIconPatch({
                  positionX: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Icon horizontal position"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Y</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedBlock.data.icon.positionY ?? 50}
              onChange={(e) =>
                updateSelectedIconPatch({
                  positionY: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Icon vertical position"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Zoom</span>
            <input
              type="range"
              min={50}
              max={300}
              value={Math.round((selectedBlock.data.icon.zoom ?? 1) * 100)}
              onChange={(e) =>
                updateSelectedIconPatch({
                  zoom: Number(e.target.value) / 100,
                })
              }
              className={topBarSliderClass()}
              title="Icon zoom"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Rotate</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={selectedBlock.data.icon.rotation ?? 0}
              onChange={(e) =>
                updateSelectedIconPatch({
                  rotation: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Icon rotation"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((selectedBlock.data.icon.opacity ?? 1) * 100)}
              onChange={(e) =>
                updateSelectedIconPatch({
                  opacity: Number(e.target.value) / 100,
                })
              }
              className={topBarSliderClass()}
              title="Icon opacity"
            />
            <span>{Math.round((selectedBlock.data.icon.opacity ?? 1) * 100)}%</span>
          </div>
        </>
      ) : null}

{showAppearanceControls ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <input
      type="color"
      value={
        selectedBlock?.type === "rsvp"
          ? selectedRsvpElementBackgroundColor === "transparent"
            ? "#ffffff"
            : selectedRsvpElementBackgroundColor
          : selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
            ? ((selectedBlock.data as any).cardStyle?.backgroundColor === "transparent"
                ? "#ffffff"
                : ((selectedBlock.data as any).cardStyle?.backgroundColor ?? "#ffffff"))
            : selectedBlock?.type === "post_board" && postBoardStyleTarget === "buttons"
              ? ((selectedBlock.data as any).buttonStyle?.backgroundColor === "transparent"
                  ? "#ffffff"
                  : ((selectedBlock.data as any).buttonStyle?.backgroundColor ?? "#ffffff"))
              : selectedAppearance.backgroundColor === "transparent"
                ? "#ffffff"
                : (selectedAppearance.backgroundColor ?? "#ffffff")
      }
      onChange={(e) => {
        if (selectedBlock?.type === "rsvp" && selectedRsvpElementKey === "form") {
          applyAppearancePatch({ backgroundColor: e.target.value });
          return;
        }

        if (selectedBlock?.type === "post_board") {
          applyAppearancePatch({ backgroundColor: e.target.value });
          return;
        }

        applyFillColor(e.target.value);
      }}
      className={topBarColorClass(false)}
      title={
        selectedBlock?.type === "rsvp"
          ? "RSVP element background color"
          : selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
            ? "Post card background color"
            : selectedBlock?.type === "post_board" && postBoardStyleTarget === "buttons"
              ? "Post button background color"
              : "Fill color"
      }
    />

    <button
      type="button"
      className={eyedropperButtonClass()}
      onClick={() =>
        void pickColorWithEyeDropper((color) => {
          if (selectedBlock?.type === "rsvp" && selectedRsvpElementKey === "form") {
            applyAppearancePatch({ backgroundColor: color });
            return;
          }

          if (selectedBlock?.type === "post_board") {
            applyAppearancePatch({ backgroundColor: color });
            return;
          }

          applyFillColor(color);
        })
      }
      title="Pick fill color from screen"
    >
      <Image
        src="/icons/pick_color_icon.png"
        alt="Pick Color"
        width={20}
        height={20}
        className="pointer-events-none object-contain"
      />
    </button>

    <button
      type="button"
      className={topBarButtonClass(
        selectedBlock?.type === "faq" && faqStyleTarget === "section"
          ? ((selectedBlock.data as any).sectionStyle?.backgroundColor === "transparent")
          : selectedBlock?.type === "rsvp"
            ? selectedRsvpElementBackgroundColor === "transparent"
            : selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
              ? ((selectedBlock.data as any).cardStyle?.backgroundColor === "transparent")
              : selectedBlock?.type === "post_board" && postBoardStyleTarget === "buttons"
                ? ((selectedBlock.data as any).buttonStyle?.backgroundColor === "transparent")
                : selectedBlock?.type === "highlight"
                  ? highlightStyleTarget === "heading"
                    ? selectedAppearance.backgroundColor === "transparent"
                    : (selectedBlock.data.cardBackgroundColor ?? "") === "transparent"
                  : selectedAppearance.backgroundColor === "transparent",
                      )}
onClick={() => {
  if (selectedBlock?.type === "faq" && faqStyleTarget === "section") {
    updateSelectedBlock((block) =>
      block.type !== "faq"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              sectionStyle: {
                ...((block.data as any).sectionStyle ?? {}),
                backgroundColor: "transparent",
              },
            },
          },
    );
    return;
  }

  if (selectedBlock?.type === "rsvp") {
    applyAppearancePatch({ backgroundColor: "transparent" });
    return;
  }

  if (selectedBlock?.type === "thread") {
    updateSelectedBlock((block) => {
      if (block.type !== "thread") return block;

      const target = block.data.threadStyleTarget ?? "message";

      if (target === "form") {
        return {
          ...block,
          appearance: {
            ...block.appearance,
            backgroundColor: "transparent",
            backgroundOpacity: 0,
          },
          data: {
            ...block.data,
            formAppearance: {
              ...((block.data as any).formAppearance ?? {}),
              backgroundColor: "transparent",
              backgroundOpacity: 0,
            },
          },
        };
      }

      const appearanceKey =
        target === "post_block"
          ? "postBlockAppearance"
          : target === "post_button"
            ? "postButtonAppearance"
            : "messageAppearance";

      return {
        ...block,
        data: {
          ...block.data,
          [appearanceKey]: {
            ...((block.data as any)[appearanceKey] ?? {}),
            backgroundColor: "transparent",
            backgroundOpacity: 0,
          },
        },
      };
    });

    return;
  }

  if (selectedBlock?.type === "post_board") {
    applyAppearancePatch({ backgroundColor: "transparent" });
    return;
  }

  if (selectedBlock?.type === "highlight") {
    updateSelectedBlock((block) => {
      if (block.type !== "highlight") return block;

      if (highlightStyleTarget === "heading") {
        return {
          ...block,
          appearance: {
            ...block.appearance,
            backgroundColor: "transparent",
          },
        };
      }

      return {
        ...block,
        data: {
          ...block.data,
          cardBackgroundColor: "transparent",
        },
      };
    });

    return;
  }

  if (selectedBlock?.type === "checkout") {
    updateSelectedBlock((block) =>
      block.type !== "checkout"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              backgroundColor: "transparent",
            },
          },
    );
    return;
  }

  applyAppearancePatch({ backgroundColor: "transparent" });
}}
title={
  selectedBlock?.type === "rsvp"
    ? "Transparent RSVP block background"
    : selectedBlock?.type === "thread" &&
        selectedBlock.data.threadStyleTarget === "form"
      ? "Transparent thread form background"
      : selectedBlock?.type === "thread" &&
          selectedBlock.data.threadStyleTarget === "post_block"
        ? "Transparent thread composer background"
        : selectedBlock?.type === "thread" &&
            selectedBlock.data.threadStyleTarget === "message"
          ? "Transparent thread message background"
          : selectedBlock?.type === "thread" &&
              selectedBlock.data.threadStyleTarget === "post_button"
            ? "Transparent thread post button background"
            : selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
              ? "Transparent post card background"
              : selectedBlock?.type === "post_board" && postBoardStyleTarget === "buttons"
                ? "Transparent post button background"
                : "Transparent fill"
}
>
  <Image
    src="/icons/transparent_fill_icon.png"
    alt="Transparent fill"
    width={20}
    height={20}
    className="pointer-events-none object-contain"
  />
</button>

{((selectedBlock?.type === "post_board" &&
  (postBoardStyleTarget === "card" || postBoardStyleTarget === "buttons")) ||
  (selectedBlock?.type === "thread" &&
    ["form", "post_block", "message", "post_button"].includes(
      selectedBlock.data.threadStyleTarget ?? "message",
    ))) ? (
  <div className={topBarSliderWrapClass()}>
    <span>BG Opacity</span>
    <input
      type="range"
      min={0}
      max={100}
      value={
        selectedBlock?.type === "post_board"
          ? Math.round(
              postBoardStyleTarget === "card"
                ? (((selectedBlock.data as any).cardStyle?.backgroundOpacity ?? 1) *
                    100)
                : (((selectedBlock.data as any).buttonStyle?.backgroundOpacity ??
                    1) * 100),
            )
          : selectedBlock?.type === "thread"
            ? selectedBlock.data.threadStyleTarget === "form"
              ? selectedBlock.data.formAppearance?.backgroundOpacity ?? 100
              : selectedBlock.data.threadStyleTarget === "post_block"
                ? selectedBlock.data.postBlockAppearance?.backgroundOpacity ?? 100
                : selectedBlock.data.threadStyleTarget === "post_button"
                  ? selectedBlock.data.postButtonAppearance?.backgroundOpacity ?? 100
                  : selectedBlock.data.messageAppearance?.backgroundOpacity ?? 100
            : 100
      }
      onChange={(e) =>
        applyAppearancePatch({
          backgroundOpacity:
            selectedBlock?.type === "thread"
              ? Number(e.target.value)
              : Number(e.target.value) / 100,
        } as any)
      }
      className={topBarSliderClass()}
      title="Background transparency"
    />
    <span>
      {selectedBlock?.type === "post_board"
        ? Math.round(
            postBoardStyleTarget === "card"
              ? (((selectedBlock.data as any).cardStyle?.backgroundOpacity ?? 1) *
                  100)
              : (((selectedBlock.data as any).buttonStyle?.backgroundOpacity ??
                  1) * 100),
          )
        : selectedBlock?.type === "thread"
          ? selectedBlock.data.threadStyleTarget === "form"
            ? selectedBlock.data.formAppearance?.backgroundOpacity ?? 100
            : selectedBlock.data.threadStyleTarget === "post_block"
              ? selectedBlock.data.postBlockAppearance?.backgroundOpacity ?? 100
              : selectedBlock.data.threadStyleTarget === "post_button"
                ? selectedBlock.data.postButtonAppearance?.backgroundOpacity ?? 100
                : selectedBlock.data.messageAppearance?.backgroundOpacity ?? 100
          : 100}
      %
    </span>
  </div>
) : null}

{selectedBlock?.type === "highlight" ? (
  <div className={topBarSliderWrapClass()}>
    <span>BG Opacity</span>

    <input
      type="range"
      min={0}
      max={100}
      value={
        highlightStyleTarget === "heading"
          ? Number(selectedBlock.appearance?.backgroundOpacity ?? 100)
          : Math.round(
              Number((selectedBlock.data as any).cardBackgroundOpacity ?? 1) *
                100,
            )
      }
      onChange={(e) =>
        applyAppearancePatch({
          backgroundOpacity:
            highlightStyleTarget === "heading"
              ? Number(e.target.value)
              : Number(e.target.value) / 100,
        } as any)
      }
      className={topBarSliderClass()}
      title={
        highlightStyleTarget === "heading"
          ? "Highlight block background transparency"
          : "Highlight card background transparency"
      }
    />

    <span>
      {highlightStyleTarget === "heading"
        ? Number(selectedBlock.appearance?.backgroundOpacity ?? 100)
        : Math.round(
            Number((selectedBlock.data as any).cardBackgroundOpacity ?? 1) *
              100,
          )}
      %
    </span>
  </div>
) : null}

    {selectedBlockSupportsTexture ? (
      <>
        <input
          ref={textureInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleTextureFileChange(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          className={topBarButtonClass()}
          onClick={() => textureInputRef.current?.click()}
          title={
            selectedBlock?.type === "label" || selectedBlock?.type === "text_fx"
              ? "Add texture to text"
              : "Add texture to border/frame"
          }
        >
          <Image
            src="/icons/icon_add_texture.png"
            alt="Add Texture"
            width={30}
            height={30}
            className="pointer-events-none h-[30px] w-[30px] object-contain"
          />
        </button>

        {selectedBlockTextureEnabled ? (
          <button
            type="button"
            className={topBarButtonClass()}
            onClick={removeTextureFromSelectedBlock}
            title="Remove texture"
          >
            <Image
              src="/icons/icon_remove_texture.png"
              alt="Remove Texture"
              width={30}
              height={30}
              className="pointer-events-none h-[30px] w-[30px] object-contain"
            />
          </button>
        ) : null}
      </>
    ) : null}

    <input
      type="color"
      value={
        selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
          ? ((selectedBlock.data as any).cardStyle?.borderColor ?? "#d1d5db")
          : selectedBlock?.type === "post_board" && postBoardStyleTarget === "buttons"
            ? ((selectedBlock.data as any).buttonStyle?.borderColor ?? "#d1d5db")
            : (selectedAppearance.borderColor ?? "#d1d5db")
      }
      onChange={(e) => applyBorderColor(e.target.value)}
      className={topBarColorClass(false)}
      title="Border color"
    />

    <button
      type="button"
      className={eyedropperButtonClass()}
      onClick={() =>
        void pickColorWithEyeDropper((color) => {
          applyBorderColor(color);
        })
      }
      title="Pick border color from screen"
    >
      <Image
        src="/icons/pick_color_icon.png"
        alt="Pick Color"
        width={20}
        height={20}
        className="pointer-events-none object-contain"
      />
    </button>

    {showBorderWidthRadiusControls ? (
      <>
        <div className={topBarSliderWrapClass()}>
          <span>Border</span>
          <input
            type="range"
            min={0}
            max={30}
            value={
              selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
                ? Number(((selectedBlock.data as any).cardStyle ?? {}).borderWidth ?? 0)
                : selectedBlock?.type === "post_board" &&
                    postBoardStyleTarget === "buttons"
                  ? Number(((selectedBlock.data as any).buttonStyle ?? {}).borderWidth ?? 0)
                  : selectedBlock?.type === "form_field" &&
                      formFieldTextTarget === "inputText"
                    ? Number(((selectedBlock.data as any).inputStyle ?? {}).borderWidth ?? 0)
                    : selectedAppearance.borderWidth ?? 0
            }
            onChange={(e) =>
              applyAppearancePatch({
                borderWidth: Number(e.target.value) || 0,
              })
            }
            className={topBarSliderClass()}
            title="Border width"
          />
          <span>
            {selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
              ? Number(((selectedBlock.data as any).cardStyle ?? {}).borderWidth ?? 0)
              : selectedBlock?.type === "post_board" && postBoardStyleTarget === "buttons"
                ? Number(((selectedBlock.data as any).buttonStyle ?? {}).borderWidth ?? 0)
                : selectedBlock?.type === "form_field" && formFieldTextTarget === "inputText"
                  ? Number(((selectedBlock.data as any).inputStyle ?? {}).borderWidth ?? 0)
                  : selectedAppearance.borderWidth ?? 0}
          </span>
        </div>

        <div className={topBarSliderWrapClass()}>
          <span>Radius</span>
          <input
            type="range"
            min={0}
            max={100}
            value={
              selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
                ? Number(((selectedBlock.data as any).cardStyle ?? {}).borderRadius ?? 0)
                : selectedBlock?.type === "post_board" &&
                    postBoardStyleTarget === "buttons"
                  ? Number(((selectedBlock.data as any).buttonStyle ?? {}).borderRadius ?? 0)
                  : selectedBlock?.type === "form_field" &&
                      formFieldTextTarget === "inputText"
                    ? Number(((selectedBlock.data as any).inputStyle ?? {}).borderRadius ?? 0)
                    : selectedAppearance.borderRadius ?? 0
            }
            onChange={(e) =>
              applyAppearancePatch({
                borderRadius: Number(e.target.value) || 0,
              })
            }
            className={topBarSliderClass()}
            title="Corner radius"
          />
          <span>
            {selectedBlock?.type === "post_board" && postBoardStyleTarget === "card"
              ? Number(((selectedBlock.data as any).cardStyle ?? {}).borderRadius ?? 0)
              : selectedBlock?.type === "post_board" && postBoardStyleTarget === "buttons"
                ? Number(((selectedBlock.data as any).buttonStyle ?? {}).borderRadius ?? 0)
                : selectedBlock?.type === "form_field" && formFieldTextTarget === "inputText"
                  ? Number(((selectedBlock.data as any).inputStyle ?? {}).borderRadius ?? 0)
                  : selectedAppearance.borderRadius ?? 0}
          </span>
        </div>
      </>
    ) : null}

    {recentColors.length ? (
      <>
        <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70">Recent</span>

          <div className="flex items-center gap-1">
            {recentColors.map((color) => (
              <button
                key={color}
                type="button"
                className={recentColorButtonClass()}
                style={{ backgroundColor: color }}
                onClick={() => {
                  if (selectedBlock?.type === "post_board") {
                    applyAppearancePatch({ backgroundColor: color });
                    return;
                  }

                  applyFillColor(color);
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      </>
    ) : null}
  </>
) : null}
    </div>
  </div>

</div>

<AppModal
open={showAiSuggestions}
size="wide"
title="Smart Content Assistant"
description="Generate polished microsite content with guided inputs."
confirmText=""
cancelText="Close"
loading={aiLoading}
onCancel={() => setShowAiSuggestions(false)}
>
  <div className="mt-4 max-h-[72vh] overflow-y-auto pr-2">
  <div className="grid min-w-[720px] gap-6 lg:grid-cols-[320px_minmax(360px,1fr)]">
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Subject
        </label>

        <input
          type="text"
          value={aiSubject}
          onChange={(e) => setAiSubject(e.target.value)}
          placeholder="Wedding announcement"
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Details
        </label>

        <textarea
          value={aiDetails}
          onChange={(e) => setAiDetails(e.target.value)}
          placeholder="Add important details, vibe, location, pricing, timing..."
          rows={6}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <button
        type="button"
        onClick={() =>
          setShowAiAdvancedOptions((prev) => !prev)
        }
        className="text-sm font-medium text-neutral-700 hover:text-black"
      >
        {showAiAdvancedOptions
          ? "Hide More Options"
          : "More Options"}
      </button>

      {showAiAdvancedOptions ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Tone
            </label>

            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {[
                "Professional",
                "Friendly",
                "Elegant",
                "Funny",
                "Exciting",
                "Romantic",
                "Bold",
                "Casual",
                "Luxury",
                "Minimal",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Length
            </label>

            <select
              value={aiLength}
              onChange={(e) => setAiLength(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {[
                "Very Short",
                "Short",
                "Medium",
                "Long",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Audience
            </label>

            <input
              type="text"
              value={aiAudience}
              onChange={(e) => setAiAudience(e.target.value)}
              placeholder="Customers, guests, parents..."
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Keywords
            </label>

            <input
              type="text"
              value={aiKeywords}
              onChange={(e) => setAiKeywords(e.target.value)}
              placeholder="live music, outdoor seating"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Content Type
            </label>

            <select
              value={aiContentType}
              onChange={(e) =>
                setAiContentType(e.target.value)
              }
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {[
                "Announcement",
                "Invitation",
                "Description",
                "Welcome message",
                "Promotion",
                "Event details",
                "About us",
                "FAQ answer",
                "Testimonial",
                "Call to action",
                "Menu description",
                "Schedule item",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Creativity Level
              </label>

              <span className="text-xs text-neutral-500">
                {aiCreativity}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={aiCreativity}
              onChange={(e) =>
                setAiCreativity(Number(e.target.value))
              }
              className="w-full"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={aiMatchPageStyle}
              onChange={(e) =>
                setAiMatchPageStyle(e.target.checked)
              }
            />

            Match page style
          </label>
        </div>
      ) : null}

      <button
        type="button"
        onClick={generateSmartContent}
        disabled={aiLoading}
        className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {aiLoading ? "Generating..." : "Generate Options"}
      </button>
    </div>

    <div className="min-w-0">
      {aiLoading ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-600">
          Generating polished content options...
        </div>
      ) : aiError ? (
  <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
    {aiError}
  </div>
) : aiOptions.length ? (
        <div className="space-y-4">
          {aiOptions.map((option) => (
            <div
              key={option.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="mb-2 text-sm font-semibold text-neutral-900">
                {option.title}
              </div>

              <div className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                {option.text}
              </div>

              <button
                type="button"
                onClick={() => applyAiSuggestion(option.text)}
                className="mt-4 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Use This
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-sm text-neutral-500">
          Generate content options to preview polished suggestions here.
        </div>
      )}
    </div>
  </div>
</div>
</AppModal>
</div>

<div className="flex-1 px-6 py-5">
  <button
    type="button"
    className="fixed right-0 top-24 z-[65] flex h-16 w-7 items-center justify-center rounded-l-xl border border-r-0 border-neutral-300 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50"
    onClick={() => setInspectorCollapsed((prev) => !prev)}
    title={inspectorCollapsed ? "Expand inspector" : "Collapse inspector"}
  >
    {inspectorCollapsed ? "◀" : "▶"}
  </button>

  <div
    className={`grid items-start gap-5 ${
      inspectorCollapsed
        ? "xl:grid-cols-[minmax(0,1fr)]"
        : "xl:grid-cols-[minmax(0,1fr)_340px]"
    }`}
  >
    <div
      className={`${getCanvasShellClass(designKey)} h-[calc(100vh-185px)] overflow-y-auto`}
    >
<div className="flex w-full justify-center overflow-auto px-4 py-4">
<div
  ref={frameCaptureRootRef}
  className="origin-top w-full rounded-[8px]"
  style={{
    transform: `scale(${canvasZoom / 100})`,
    transformOrigin: "top center",
    width: `${100 / (canvasZoom / 100)}%`,
  }}
>
        <div
          style={{
            width: "100%",
            minWidth: 0,
          }}
        >
<GridCanvas
  blocks={canvasItems}
  selection={selection as any}
onSelect={(next, event) => {
  // if clicking empty canvas → deselect
  if (!next || (next as any).type === "none") {
    setSelectedBlockIds([]);
    setSelection({ type: "none" });
    return;
  }

  handleCanvasSelect(next as any, event as any);
}}
  onMoveBlock={handleMoveBlock}
  onResizeBlock={handleResizeBlock}
  onBringToFront={handleBringToFront}
  onRemoveBlock={removeCanvasBlock}
    onDuplicateBlock={undefined}
onCreateToolDrop={handleCreateToolDrop}
onMarqueeSelectMove={handleMarqueeSelectMove}
onMarqueeSelectEnd={handleMarqueeSelectEnd}
renderBlockPreview={renderCanvasPreview}
  isItemSelected={(blockId, nextSelection) =>
    selectedBlockIds.includes(blockId) ||
    isCanvasBlockSelected(nextSelection as any, blockId)
  }
  dockedScrollRef={dockedScrollRef}
  showGridLines={showGridLines}
  pageSurfaceStyle={{
    ...pageSurfaceStyle,
    height: `${getPageLengthPx(selectedPageLength)}px`,
    minWidth: `${getGridCanvasScrollableWidth()}px`,
    width: `${getGridCanvasScrollableWidth()}px`,
  }}
/>
        </div>
        </div>
      </div>
    </div>

          {!inspectorCollapsed ? (
            <div className="h-[calc(100vh-185px)] overflow-y-auto pr-2">
              <div className="space-y-4">
<div className={inspectorCardClass()}>
  <div className={inspectorLabelClass()}>Inspector</div>

  <div className="mt-3 flex items-center justify-between gap-3">
<div className="min-w-0 text-lg font-semibold text-neutral-900">
  {isMultiSelection ? "Multiple blocks selected" : selectedContext.label}
</div>

    {!isMultiSelection && selectedBlock && selectedBlockGuide ? (
      <button
        type="button"
        onClick={() => setBlockGuideOpen(true)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-transparent shadow-none transition hover:bg-neutral-100"
        title={`Open ${selectedBlockGuide.title} guide`}
        aria-label={`Open ${selectedBlockGuide.title} guide`}
      >
        <Image
          src="/icons/icon_block_full_guide.png"
          alt=""
          width={16}
          height={16}
          className="pointer-events-none object-contain"
        />
      </button>
    ) : null}
  </div>

  <div className="mt-1 text-sm text-neutral-500">
{isMultiSelection
  ? `${selectedBlockIds.length} blocks selected. Bulk editing is currently disabled.`
  : selectedContext.kind === "none"
    ? "Select a block to edit its settings."
    : "Live properties for the selected canvas item."}
  </div>
</div>

{!isMultiSelection && selectedCanvasItem ? (
  <>
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Position & Size</div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className={inspectorLabelClass()}>X</div>
          <input
            type="number"
            step="0.25"
            value={selectedCanvasItem.grid?.colStart ?? 1}
            onChange={(e) =>
              updateSelectedGrid({
                colStart: Number(e.target.value) || 1,
              })
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Y</div>
          <input
            type="number"
            step="0.25"
            value={selectedCanvasItem.grid?.rowStart ?? 1}
            onChange={(e) =>
              updateSelectedGrid({
                rowStart: Number(e.target.value) || 1,
              })
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Width</div>
          <input
            type="number"
            step="0.25"
            value={selectedCanvasItem.grid?.colSpan ?? 1}
            onChange={(e) =>
              updateSelectedGrid({
                colSpan: Number(e.target.value) || 1,
              })
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Height</div>
          <input
            type="number"
            step="0.25"
            value={selectedCanvasItem.grid?.rowSpan ?? 1}
            onChange={(e) =>
              updateSelectedGrid({
                rowSpan: Number(e.target.value) || 1,
              })
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>
    </div>
  </>
) : null}

{!isMultiSelection && selectedBlock ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Public Display Settings</div>

    <div className="mt-4 grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-700">
        <input
          type="checkbox"
          checked={(selectedBlock as any).showVerticalScrollbar === true}
          onChange={(e) => {
            const checked = e.target.checked;

            updateSelectedBlock((block) => ({
              ...block,
              showVerticalScrollbar: checked,
            } as any));
          }}
        />
        Show Vertical Scrollbar
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-700">
        <input
          type="checkbox"
          checked={(selectedBlock as any).showHorizontalScrollbar === true}
          onChange={(e) => {
            const checked = e.target.checked;

            updateSelectedBlock((block) => ({
              ...block,
              showHorizontalScrollbar: checked,
            } as any));
          }}
        />
        Show Horizontal Scrollbar
      </label>
    </div>

    <div className="mt-3 text-xs leading-5 text-neutral-500">
      Scrollbars appear only when content exceeds the block's visible area.
    </div>
  </div>
) : null}

{showTextControls ? (
  <TextControlsInspector
    selectedBlock={selectedBlock}
    selectedContext={selectedContext}
    selectedTextValue={selectedTextValue}
    selectedTextFxBlock={selectedTextFxBlock}
    updateTextByCanvasId={updateTextByCanvasId}
    updateSelectedBlock={updateSelectedBlock}
    updateTextFx={updateTextFx}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "poll" ? (
  <PollInspector
    selectedBlock={selectedBlock}
    draft={draft}
    updateSelectedBlock={updateSelectedBlock}
    makeClientId={makeClientId}
    pollQuestionInputRef={pollQuestionInputRef}
    pollOptionInputRefs={pollOptionInputRefs}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "rsvp" ? (
  <RsvpInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    rsvpHeadingInputRef={rsvpHeadingInputRef}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "form_field" ? (
<FormFieldInspector
  selectedBlock={selectedBlock}
  setDraft={setDraft}
  updateSelectedBlock={updateSelectedBlock}
  formFieldTextTarget={formFieldTextTarget}
  setFormFieldTextTarget={setFormFieldTextTarget}
  formFieldStyleTarget={formFieldStyleTarget}
  setFormFieldStyleTarget={setFormFieldStyleTarget}
  ctaButtonOptions={ctaButtonOptions}
  updateFormField={updateFormField}
  updateFormFieldRequired={updateFormFieldRequired}
  FORM_FIELD_CONFIG_EVENT={FORM_FIELD_CONFIG_EVENT}
  inspectorCardClass={inspectorCardClass}
  inspectorLabelClass={inspectorLabelClass}
  inspectorInputClass={inspectorInputClass}
/>
) : null}

{!isMultiSelection && selectedBlock?.type === "option_button" ? (
  <OptionButtonInspector
    selectedBlock={selectedBlock}
    draft={draft}
    optionButtonTextTarget={optionButtonTextTarget}
    setOptionButtonTextTarget={setOptionButtonTextTarget}
    selectedOptionButtonOptionId={selectedOptionButtonOptionId}
    setSelectedOptionButtonOptionId={setSelectedOptionButtonOptionId}
    ctaButtonOptions={ctaButtonOptions}
    updateSelectedOptionButtonData={updateSelectedOptionButtonData}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
    openImagePicker={openImagePicker}
    uploadBuilderImageFile={uploadBuilderImageFile}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "countdown" ? (
  <CountdownInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    countdownStyleTarget={countdownStyleTarget}
    setCountdownStyleTarget={setCountdownStyleTarget}
    countdownTargetInputRef={countdownTargetInputRef}
    countdownHeadingInputRef={countdownHeadingInputRef}
    countdownCompletedInputRef={countdownCompletedInputRef}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "timeline" ? (
  <TimelineInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    timelineStyleTarget={timelineStyleTarget}
    setTimelineStyleTarget={setTimelineStyleTarget}
    focusedTimelineEntryId={focusedTimelineEntryId}
    makeClientId={makeClientId}
    uploadImageToSelectedBlock={uploadImageToSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "audio" ? (
  <AudioInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    uploadAudioToSelectedBlock={uploadAudioToSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
  />
) : null}


{!isMultiSelection && selectedBlock?.type === "checkout" ? (
  <CheckoutInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "cart" ? (
  <CartInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "faq" ? (
  <FaqInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    makeClientId={makeClientId}
    faqQuestionInputRefs={faqQuestionInputRefs}
    faqAnswerInputRefs={faqAnswerInputRefs}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "content_panel" ? (
  <ContentPanelInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    CATEGORY_BUTTONS={CATEGORY_BUTTONS}
    contentPanelTextTarget={contentPanelTextTarget}
    setContentPanelTextTarget={setContentPanelTextTarget}
    contentPanelStyleTarget={contentPanelStyleTarget}
    setContentPanelStyleTarget={setContentPanelStyleTarget}
    makeClientId={makeClientId}
    uploadImageToSelectedBlock={uploadImageToSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}


{!isMultiSelection && selectedBlock?.type === "thread" ? (
  <ThreadInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    threadSubjectInputRef={threadSubjectInputRef}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}
{!isMultiSelection && selectedBlock?.type === "summary" ? (
  <SummaryInspector
    selectedBlock={selectedBlock}
    draft={draft}
    summaryStyleTarget={summaryStyleTarget}
    setSummaryStyleTarget={setSummaryStyleTarget}
    updateSelectedSummaryData={updateSelectedSummaryData}
    makeClientId={makeClientId}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "highlight" ? (
  <HighlightInspector
    selectedBlock={selectedBlock}
    draft={draft}
    updateSelectedBlock={updateSelectedBlock}
    makeClientId={makeClientId}
    uploadBuilderImageFile={uploadBuilderImageFile}
    setEditorUploadError={setEditorUploadError}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "visitor_counter" ? (
  <VisitorCounterInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "progress_bar" ? (
  <ProgressBarInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "donation" ? (
  <DonationInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    makeClientId={makeClientId}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "link_hub" ? (
  <LinkHubInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    linkHubTextTarget={linkHubTextTarget}
    setLinkHubTextTarget={setLinkHubTextTarget}
    makeClientId={makeClientId}
    resolveMediaLogoFromUrl={resolveMediaLogoFromUrl}
    uploadBuilderImageFile={uploadBuilderImageFile}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "post_board" ? (
  <PostBoardInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    postBoardStyleTarget={postBoardStyleTarget}
    setPostBoardStyleTarget={setPostBoardStyleTarget}
    threadOptions={threadOptions}
    makeClientId={makeClientId}
    uploadImageToSelectedBlock={uploadImageToSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "checklist" ? (
  <ChecklistInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    makeClientId={makeClientId}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "calendar_event" ? (
  <CalendarEventInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    calendarEventTextTarget={calendarEventTextTarget}
    setCalendarEventTextTarget={setCalendarEventTextTarget}
    makeClientId={makeClientId}
    uploadImageToSelectedBlock={uploadImageToSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "schedule_agenda" ? (
  <ScheduleAgendaInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    makeClientId={makeClientId}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "tournament_display" ? (
  <TournamentDisplayInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    tournamentDisplayStyleTarget={tournamentDisplayStyleTarget}
    setTournamentDisplayStyleTarget={setTournamentDisplayStyleTarget}
    makeClientId={makeClientId}
    uploadImageToSelectedBlock={uploadImageToSelectedBlock}
    syncTournamentMatchesFromTeams={syncTournamentMatchesFromTeams}
    advanceTournamentWinners={advanceTournamentWinners}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "map_location" ? (
  <MapLocationInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "bookmark" ? (
  <BookmarkInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    toBookmarkSlug={toBookmarkSlug}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "spreadsheet" ? (
  <SpreadsheetInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    FONT_FAMILY_OPTIONS={FONT_FAMILY_OPTIONS}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "puzzle" ? (
  <PuzzleInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    uploadPuzzleImageToSelectedBlock={uploadPuzzleImageToSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "spin_wheel" ? (
  <SpinWheelInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "file_share" ? (
  <FileShareInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "enrollment_board" ? (
  <EnrollmentBoardInspector
    selectedBlock={selectedBlock}
    selectedBlockFromDraft={selectedBlockFromDraft}
    draft={draft}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "speed_dating" ? (
  <SpeedDatingInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "pop_balloon" ? (
  <PopBalloonInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "registry" ? (
  <RegistryInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    registryLoadingMap={registryLoadingMap}
    setRegistryLoadingMap={setRegistryLoadingMap}
    getStoreMeta={getStoreMeta}
    makeClientId={makeClientId}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "video" ? (
  <VideoInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    handleVideoUpload={handleVideoUpload}
    uploadBuilderImageFile={uploadBuilderImageFile}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    videoTextTarget={videoTextTarget}
    setVideoTextTarget={setVideoTextTarget}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "rich_text" ? (
  <RichTextInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    RichTextTiptapEditor={RichTextTiptapEditor}
    richTextEditorRef={richTextEditorRef}
    setIsRichTextEditorEmpty={setIsRichTextEditorEmpty}
    normalizeRichTextHtml={normalizeRichTextHtml}
    isRichTextHtmlEmpty={isRichTextHtmlEmpty}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "label" ? (
  <LabelInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "links" ? (
  <LinksInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    makeClientId={makeClientId}
    linksHeadingInputRef={linksHeadingInputRef}
    linksItemLabelInputRefs={linksItemLabelInputRefs}
    linksItemUrlInputRefs={linksItemUrlInputRefs}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "listing" ? (
  <ListingInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    listingStyleTarget={listingStyleTarget}
    setListingStyleTarget={setListingStyleTarget}
    makeClientId={makeClientId}
    uploadImageToSelectedBlock={uploadImageToSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "image" ? (
  <ImageInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    uploadImageToSelectedBlock={uploadImageToSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "image_carousel" ? (
  <ImageCarouselInspector
    selectedBlock={selectedBlock}
    setDraft={setDraft}
    updateSelectedBlock={updateSelectedBlock}
    uploadMultipleImagesToCarousel={uploadMultipleImagesToCarousel}
    uploadImageToCarouselItem={uploadImageToCarouselItem}
    updateImageCarouselField={updateImageCarouselField}
    updateImageCarouselNumericField={updateImageCarouselNumericField}
    updateImageCarouselItemField={updateImageCarouselItemField}
    updateImageCarouselToggle={updateImageCarouselToggle}
    removeImageCarouselItem={removeImageCarouselItem}
    addImageCarouselItem={addImageCarouselItem}
    carouselHeadingInputRef={carouselHeadingInputRef}
    carouselItemTitleInputRefs={carouselItemTitleInputRefs}
    carouselItemSubtitleInputRefs={carouselItemSubtitleInputRefs}
    carouselItemHrefInputRefs={carouselItemHrefInputRefs}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    toolSetButtonClass={toolSetButtonClass}
    carouselTextTarget={carouselTextTarget}
    setCarouselTextTarget={setCarouselTextTarget}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "icon" ? (
  <IconInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    CATEGORY_BUTTONS={CATEGORY_BUTTONS}
    getIconNameFromUrl={getIconNameFromUrl}
    applyFillColor={applyFillColor}
    updateSelectedIconPatch={updateSelectedIconPatch}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "shape" ? (
  <ShapeInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "wave" ? (
  <WaveInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
  />
) : null}

{!isMultiSelection && selectedBlock?.type === "gallery" ? (
  <GalleryInspector
    selectedBlock={selectedBlock}
    updateSelectedBlock={updateSelectedBlock}
    selectedGalleryImageId={selectedGalleryImageId}
    galleryImageCardRefs={galleryImageCardRefs}
    uploadGalleryImagesToBlock={uploadGalleryImagesToBlock}
    moveGalleryImage={moveGalleryImage}
    inspectorCardClass={inspectorCardClass}
    inspectorLabelClass={inspectorLabelClass}
    inspectorInputClass={inspectorInputClass}
    inspectorTextareaClass={inspectorTextareaClass}
    toolSetButtonClass={toolSetButtonClass}
    galleryTextTarget={galleryTextTarget}
    setGalleryTextTarget={setGalleryTextTarget}
  />
) : null}
                
{!isMultiSelection && selectedBlock?.type === "cta" ? (
  <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
      Button Settings
    </div>

    <label className="block">
      <span className="text-xs font-medium text-neutral-600">Button Text</span>
      <input
        type="text"
        value={selectedBlock.data.buttonText || ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    buttonText: e.target.value,
                  },
                }
              : block,
          )
        }
        placeholder="RSVP"
        className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
      />
    </label>

    <label className="block">
      <span className="text-xs font-medium text-neutral-600">Button Link</span>
      <input
        type="text"
        value={selectedBlock.data.buttonUrl || ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    buttonUrl: e.target.value,
                  },
                }
              : block,
          )
        }
        placeholder="https://example.com or /schedule"
        className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
      />
    </label>

    <div>
      <div className="text-xs font-medium text-neutral-600">Button Image</div>

      {selectedBlock.data.buttonImageUrl ? (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-2">
          <img
            src={selectedBlock.data.buttonImageUrl}
            alt=""
            className="h-10 w-10 rounded-lg object-cover"
          />

          <button
            type="button"
            className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-700 hover:bg-neutral-50"
            onClick={() => void uploadImageToSelectedBlock(selectedBlock.id)}
          >
            Replace
          </button>

          <button
            type="button"
            className="h-9 rounded-lg border border-red-200 bg-white px-3 text-xs text-red-600 hover:bg-red-50"
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type === "cta"
                  ? {
                      ...block,
                      data: {
                        ...block.data,
                        buttonImageUrl: "",
                      },
                    }
                  : block,
              )
            }
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
          onClick={() => void uploadImageToSelectedBlock(selectedBlock.id)}
        >
          Browse Image
        </button>
      )}
    </div>

    <div>
<div className="mb-1 flex items-center justify-between">
  <div className="text-xs font-medium text-neutral-600">
    Horizontal Padding
  </div>

  <div className="text-xs text-neutral-500">
    {(selectedBlock.data as any).buttonPaddingX ?? 16}%
  </div>
</div>

  <input
    type="range"
    min={2}
    max={120}
    value={(selectedBlock.data as any).buttonPaddingX ?? 16}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                buttonPaddingX: Number(e.target.value),
              },
            }
          : block,
      )
    }
    className="mt-2 w-full"
  />
</div>

<div>
<div className="mb-1 flex items-center justify-between">
  <div className="text-xs font-medium text-neutral-600">
    Vertical Padding
  </div>

  <div className="text-xs text-neutral-500">
    {(selectedBlock.data as any).buttonPaddingY ?? 8}%
  </div>
</div>

  <input
    type="range"
    min={2}
    max={80}
    value={(selectedBlock.data as any).buttonPaddingY ?? 8}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                buttonPaddingY: Number(e.target.value),
              },
            }
          : block,
      )
    }
    className="mt-2 w-full"
  />
</div>

<div>
<div className="mb-1 flex items-center justify-between">
  <div className="text-xs font-medium text-neutral-600">
    Button Image Size
  </div>

  <div className="text-xs text-neutral-500">
    {(selectedBlock.data as any).buttonImageSize ?? 20}px
  </div>
</div>

  <input
    type="range"
    min={10}
    max={80}
    value={(selectedBlock.data as any).buttonImageSize ?? 20}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                buttonImageSize: Number(e.target.value),
              },
            }
          : block,
      )
    }
    className="mt-2 w-full"
  />
</div>

<div>
  <div className="text-xs font-medium text-neutral-600">
    Image Placement
  </div>

  <div className="mt-2 grid grid-cols-3 gap-2">
    <button
      type="button"
      onClick={() =>
        updateSelectedBlock((block) =>
          block.type === "cta"
            ? {
                ...block,
                data: {
                  ...block.data,
                  buttonImagePlacement: "before",
                },
              }
            : block,
        )
      }
      className={`h-10 rounded-xl border text-xs font-medium transition ${
        (((selectedBlock.data as any).buttonImagePlacement ??
          "before") === "before")
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      Before
    </button>

    <button
      type="button"
      onClick={() =>
        updateSelectedBlock((block) =>
          block.type === "cta"
            ? {
                ...block,
                data: {
                  ...block.data,
                  buttonImagePlacement: "above",
                },
              }
            : block,
        )
      }
      className={`h-10 rounded-xl border text-xs font-medium transition ${
        (((selectedBlock.data as any).buttonImagePlacement ??
          "before") === "above")
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      Above
    </button>

    <button
      type="button"
      onClick={() =>
        updateSelectedBlock((block) =>
          block.type === "cta"
            ? {
                ...block,
                data: {
                  ...block.data,
                  buttonImagePlacement: "after",
                },
              }
            : block,
        )
      }
      className={`h-10 rounded-xl border text-xs font-medium transition ${
        (((selectedBlock.data as any).buttonImagePlacement ??
          "before") === "after")
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      After
    </button>
  </div>
</div>

    <label className="block">
      <span className="text-xs font-medium text-neutral-600">
        Submitted Text
      </span>
      <input
        type="text"
        value={(selectedBlock.data as any).submittedText || "Submitted"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    submittedText: e.target.value,
                  },
                }
              : block,
          )
        }
        placeholder="Submitted"
        className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
      />
    </label>

    <div>
<div className="mb-1 flex items-center justify-between">
  <div className={inspectorLabelClass()}>
    Horizontal Position
  </div>

  <div className="text-xs text-neutral-500">
{Math.round((selectedBlock.data as any).posX ?? 50)}
    %
  </div>
</div>
      <input
        type="range"
        min={0}
        max={100}
        value={(selectedBlock.data as any).posX ?? 50}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    posX: Number(e.target.value),
                  },
                }
              : block,
          )
        }
        className="mt-1 w-full"
      />
    </div>

    <div>
<div className="mb-1 flex items-center justify-between">
  <div className={inspectorLabelClass()}>
    Vertical Position
  </div>

  <div className="text-xs text-neutral-500">
{Math.round((selectedBlock.data as any).posY ?? 50)}
    %
  </div>
</div>
      <input
        type="range"
        min={0}
        max={100}
        value={(selectedBlock.data as any).posY ?? 50}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    posY: Number(e.target.value),
                  },
                }
              : block,
          )
        }
        className="mt-1 w-full"
      />
    </div>
  </div>
) : null}


                <div className={inspectorCardClass()}>
                  <div className={inspectorLabelClass()}>Tool Set</div>

                  <div className="mt-4 space-y-3">
                    {isMultiSelection ? (
  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
    <div className="text-sm font-semibold text-neutral-900">
      {selectedBlockIds.length} blocks selected
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => handleDuplicateCanvasBlocks(selectedBlockIds)}
        className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
      >
        Duplicate
      </button>

      <button
        type="button"
        onClick={() => {
          setDraft((prev) => ({
            ...prev,
            blocks: prev.blocks.filter(
              (block) => !selectedBlockIds.includes(block.id),
            ),
          }));

          setSelectedBlockIds([]);
          setSelection(createEmptySelection());
        }}
        className="h-10 rounded-xl border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  </div>
) : null}
{toolSetItems.map((tool) => (
  <div
    key={tool.id}
    role="button"
    tabIndex={0}
    onClick={() => setSelection(selectionFromCanvasBlockId(tool.id))}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelection(selectionFromCanvasBlockId(tool.id));
      }
    }}
    className={[
      "cursor-pointer rounded-xl p-3 transition-all duration-150",
      selectedBlock?.id === tool.id
        ? "border-2 border-black bg-white shadow-md"
        : "border border-neutral-200 bg-neutral-50 hover:bg-white",
    ].join(" ")}
  >
    <div className="mb-3 min-w-0">
{tool.canRename && selectedBlock?.id === tool.id ? (
  <input
    type="text"
    value={tool.label}
    onClick={(e) => e.stopPropagation()}
    onKeyDown={(e) => e.stopPropagation()}
    onChange={(e) => {
      const nextLabel = e.target.value;

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === tool.id ? { ...block, label: nextLabel } : block,
        ),
      }));
    }}
    className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm font-semibold text-neutral-900"
    placeholder="Block name"
  />
) : (
  <div className="truncate text-sm font-semibold text-neutral-900">
    {tool.label}
  </div>
)}
      <div className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-500">
        {tool.kind}
      </div>
    </div>

    <div className="flex items-center gap-2 overflow-visible">
      {/* DUPLICATE (NEW POSITION) */}
<div className="group relative inline-flex overflow-visible">
<button
  type="button"
  className={toolSetButtonClass("front")}
  onMouseDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDuplicateCanvasBlock(tool.id);
  }}
  aria-label="Duplicate"
>
  ⧉
</button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Duplicate</div>
    <div className="text-[10px] text-white/70">(CTRL+V)</div>
  </div>
</div>

<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("back")}
    onClick={(e) => {
      e.stopPropagation();
      handleSendToBack(tool.id);
      setSelection(selectionFromCanvasBlockId(tool.id));
    }}
    aria-label="Send to back"
  >
    <img
      src="/icons/icon_block_back.png"
      alt=""
      className="pointer-events-none h-4 w-4 object-contain"
    />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Send to back</div>
    <div className="text-[10px] text-white/70">(CTRL+SHIFT+↓)</div>
  </div>
</div>

<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("front")}
    onClick={(e) => {
      e.stopPropagation();
      handleBringToFront(tool.id);
      setSelection(selectionFromCanvasBlockId(tool.id));
    }}
    aria-label="Bring to front"
  >
    <img
      src="/icons/icon_block_front.png"
      alt=""
      className="pointer-events-none h-4 w-4 object-contain"
    />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Bring to front</div>
    <div className="text-[10px] text-white/70">(CTRL+SHIFT+↑)</div>
  </div>
</div>

<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("front")}
    onClick={(e) => {
      e.stopPropagation();
      handleBringForward(tool.id);
      setSelection(selectionFromCanvasBlockId(tool.id));
    }}
    aria-label="Move forward one layer"
  >
    ↑
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Move forward one layer</div>
    <div className="text-[10px] text-white/70">(CTRL+↑)</div>
  </div>
</div>

<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("back")}
    onClick={(e) => {
      e.stopPropagation();
      handleSendBackward(tool.id);
      setSelection(selectionFromCanvasBlockId(tool.id));
    }}
    aria-label="Move backward one layer"
  >
    ↓
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Move backward one layer</div>
    <div className="text-[10px] text-white/70">(CTRL+↓)</div>
  </div>
</div>

{/* REMOVE stays last */}
<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("remove")}
    onClick={(e) => {
      e.stopPropagation();
      removeCanvasBlock(tool.id);
    }}
    aria-label="Remove block"
  >
    ×
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Remove block</div>
    <div className="text-[10px] text-white/70">(CTRL+X)</div>
  </div>
</div>
    </div>
  </div>
))}

                    {!toolSetItems.length ? (
                      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
                        No blocks on canvas.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

<div
  ref={bottomBarRef}
  className="sticky bottom-0 z-[110] border-t border-black/10 bg-[#e9e9e9] shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
>
  <div className="border-b border-black/10 px-6 py-2">
    <div className="rounded-md border border-black/10 bg-white/80 px-2 py-1 shadow-sm backdrop-blur-sm">
      <div
        ref={dockedScrollRef}
        className="overflow-x-auto overflow-y-hidden"
        style={{ height: 18 }}
      >
        <div
          style={{
            width: scrollbarWidth,
            height: 1,
          }}
        />
      </div>
    </div>
  </div>

<div className="relative flex flex-col gap-3 border-b border-black/10 px-3 py-2 md:flex-row md:items-start md:justify-between md:gap-6 md:px-6 md:py-1">
<div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
  {CATEGORY_ORDER.map((category) => (
        <div key={category} className="relative">
          <button
            type="button"
            onClick={() => toggleToolMenu(category)}
            className={bottomCategoryClass(activeCategory === category, category)}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center">
  {renderCategoryIcon(category)}
</span>
            <span>{category}</span>
          </button>

          {openToolMenu === category ? (
            <div
              ref={toolMenuRef}
              className="absolute left-0 top-[calc(100%+10px)] z-[120] w-max max-w-[calc(100vw-32px)] rounded-2xl border border-neutral-300 bg-white p-3 shadow-2xl md:bottom-[calc(100%+10px)] md:top-auto md:max-w-[420px]"
            >
<div className="mb-2 flex items-center justify-between gap-3">
  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
    {category} Tools
  </div>

  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setCategoryMenuView((view) =>
          view === "compact" ? "detail" : "compact",
        );
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white p-1 shadow-sm hover:border-neutral-900"
      title={
        categoryMenuView === "compact"
          ? "Switch to detail view"
          : "Switch to compact view"
      }
      aria-label={
        categoryMenuView === "compact"
          ? "Switch to detail view"
          : "Switch to compact view"
      }
    >
<img
  src={
    categoryMenuView === "compact"
      ? "/icons/icon_menu_detail_view.png"
      : "/icons/icon_menu_compact_view.png"
  }
  alt=""
  className="h-4 w-4 object-contain"
/>
    </button>

    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setToolGuideModalOpen(true);
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-sm font-bold text-neutral-700 shadow-sm hover:border-neutral-900 hover:text-neutral-950"
      title="Open tool guide"
      aria-label="Open tool guide"
    >
      ?
    </button>
  </div>
</div>

{categoryMenuView === "compact" ? (
  <div
  className={
    category === "Icons"
      ? "flex max-h-[260px] max-w-[400px] flex-wrap gap-2 overflow-y-auto pr-1"
      : "flex max-w-[400px] flex-wrap gap-2"
  }
>
    {CATEGORY_BUTTONS[category].map((tool, index) => (
      <button
        key={`${category}-${tool.kind}-${tool.type}-${index}`}
        type="button"
        className={[
  toolButtonClass(),
  toolMatchesSearch(toolSearchQuery, category, tool)
    ? flashedToolKey === getToolSearchKey(category, tool)
      ? "border-blue-500 ring-2 ring-blue-300"
      : "border-blue-300"
    : "",
].join(" ")}
        onClick={() => {
          if (tool.kind === "block") addBlock(
  tool.type,
  tool.label,
  "iconName" in tool ? tool.iconName : undefined,
);
          if (tool.kind === "shape") addShape(tool.type);
          if (tool.kind === "page") addPageBlock(tool.type);
          setOpenToolMenu(null);
        }}
        draggable
        onDragStart={(e) => {
const payload: ToolDropPayload =
  tool.kind === "block"
    ? {
        kind: "block",
        type: tool.type,
        label: tool.label,
iconName: "iconName" in tool ? tool.iconName : undefined,
iconUrl:
  tool.type === "icon"
    ? `/media-icons/${"iconName" in tool ? tool.iconName ?? "star" : "star"}.svg`
    : undefined,
      }
    : tool.kind === "shape"
      ? { kind: "shape", type: tool.type }
      : { kind: "page", type: tool.type };

          e.dataTransfer.setData(
            "application/kht-tool",
            JSON.stringify(payload),
          );
        }}
        title={tool.label}
      >
        {renderToolGlyph(tool, "h-6 w-6")}
      </button>
    ))}
  </div>
) : (
  <div className="flex max-h-[252px] w-[360px] max-w-[calc(100vw-56px)] flex-col gap-2 overflow-y-auto pr-1">
    {CATEGORY_BUTTONS[category].map((tool, index) => (
      <button
        key={`${category}-${tool.kind}-${tool.type}-${index}`}
        type="button"
        className={[
  "flex w-full cursor-grab items-center gap-3 rounded-xl border bg-white px-3 py-2 text-left transition hover:border-blue-500 hover:bg-blue-50 active:cursor-grabbing",
  toolMatchesSearch(toolSearchQuery, category, tool)
    ? flashedToolKey === getToolSearchKey(category, tool)
      ? "border-blue-500 ring-2 ring-blue-300"
      : "border-blue-300"
    : "border-neutral-200",
].join(" ")}
        onClick={() => {
          if (tool.kind === "block") addBlock(
  tool.type,
  tool.label,
  "iconName" in tool ? tool.iconName : undefined,
);
          if (tool.kind === "shape") addShape(tool.type);
          if (tool.kind === "page") addPageBlock(tool.type);
          setOpenToolMenu(null);
        }}
        draggable
        onDragStart={(e) => {
const payload: ToolDropPayload =
  tool.kind === "block"
    ? {
        kind: "block",
        type: tool.type,
        label: tool.label,
iconName: "iconName" in tool ? tool.iconName : undefined,
iconUrl:
  tool.type === "icon"
    ? `/media-icons/${"iconName" in tool ? tool.iconName ?? "star" : "star"}.svg`
    : undefined,
      }
    : tool.kind === "shape"
      ? { kind: "shape", type: tool.type }
      : { kind: "page", type: tool.type };

          e.dataTransfer.setData(
            "application/kht-tool",
            JSON.stringify(payload),
          );
        }}
        title={tool.label}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-800">
          {renderToolGlyph(tool, "h-5 w-5")}
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-semibold text-neutral-900">
            {tool.label}
          </span>
          <span className="block truncate text-xs text-neutral-500">
            {TOOL_DESCRIPTIONS[tool.label] ?? "Drag onto canvas to add"}
          </span>
        </span>
      </button>
    ))}
  </div>
)}
            </div>
          ) : null}
        </div>
      ))}
          <div className="shrink-0">
      <input
        type="search"
        value={toolSearchQuery}
onChange={(e) => {
  const nextQuery = e.target.value;
  setToolSearchQuery(nextQuery);

  const normalizedQuery = nextQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    setOpenToolMenu(null);
    setFlashedToolKey(null);
    return;
  }

  const firstMatch = CATEGORY_ORDER.flatMap((category) =>
    CATEGORY_BUTTONS[category].map((tool) => ({ category, tool })),
  ).find(({ category, tool }) =>
    toolMatchesSearch(normalizedQuery, category, tool),
  );

if (!firstMatch) return;

const nextKey = getToolSearchKey(firstMatch.category, firstMatch.tool);
setActiveCategory(firstMatch.category);
setOpenToolMenu(firstMatch.category);
setFlashedToolKey(nextKey);

window.setTimeout(() => {
  setFlashedToolKey((current) => (current === nextKey ? null : current));
}, 1300);
}}
placeholder="Tool search..."
className="h-[44px] w-[180px] rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
/>
</div>
</div>

<div className="flex w-full flex-row items-center justify-center gap-2 overflow-x-auto pb-1 md:w-auto md:flex-col md:items-end md:justify-start md:overflow-visible">
  <div className="flex flex-nowrap items-center gap-2 md:gap-4 h-12">


        <button
          type="button"
          className={actionButtonClass(false)}
          onClick={openPreviewWindow}
        >
          Open Preview
        </button>

        <button
          type="button"
          className={[
            "inline-flex h-12 items-center justify-center rounded-md border px-4 text-sm font-medium transition",
            saveState === "saving"
              ? "border-blue-600 bg-blue-600 text-white animate-pulse"
              : saveState === "saved"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : saveState === "error"
                  ? "border-red-600 bg-red-600 text-white"
                  : saveState === "signin-required"
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700",
          ].join(" ")}
      onClick={async () => {
const zoomBeforeSave = canvasZoom;

try {
const zoomBeforeSave = canvasZoom;

try {
  await onSaveDraft?.(draft);
  downloadBlueprintSnapshot(draft);
} finally {
  window.requestAnimationFrame(() => {
    setCanvasZoom(zoomBeforeSave);

    window.setTimeout(() => {
      setCanvasZoom(zoomBeforeSave);
    }, 250);
  });
}
} finally {
  window.requestAnimationFrame(() => {
    setCanvasZoom(zoomBeforeSave);

    window.setTimeout(() => {
      setCanvasZoom(zoomBeforeSave);
    }, 250);
  });
}
      }}
          disabled={saveState === "saving"}
        >
          {saveState === "saving"
            ? "Saving..."
            : saveState === "saved"
              ? "Saved ✓"
              : saveState === "error"
                ? "Save Failed"
                : saveState === "signin-required"
                  ? "Sign In to Save"
                  : "Save Draft"}
        </button>


        {publishHref ? (
          <button
            type="button"
            onClick={() => {
              onPublishClick?.();
            }}
            className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-950 bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-black"
          >
            {publishLabel}
          </button>
        ) : null}

        {isPublished && slug ? (
          <a
            href={`https://${slug}.ko-host.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-600 bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Open Public Site
          </a>
        ) : null}
      </div>

{saveMessage ? (
  <div
    className={[
      "max-w-xl rounded-xl px-3 py-2 text-xs leading-5",
      saveState === "error"
        ? "border border-red-200 bg-red-50 text-red-700"
        : "text-neutral-500",
    ].join(" ")}
  >
    <div>{saveMessage}</div>

    {saveState === "error" ? (
      <div className="mt-1 font-medium">
        How to correct it: {getSaveFailureHelp(saveMessage)}
      </div>
    ) : null}
  </div>
) : null}
    </div>
  </div>

<div className="w-full border-t border-white/10 bg-[#2f3541] px-4 py-3">
  <button
    type="button"
    onClick={() => setClipboardOpen((prev) => !prev)}
    className="flex w-full items-center justify-between text-left text-sm font-semibold text-white"
  >
    <span>
  Clipboard ({clipboardEntries.length})
</span>
    <span className="text-xs text-white/70">
      {clipboardOpen ? "Collapse" : "Expand"}
    </span>
  </button>

  {clipboardOpen ? (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          {clipboardEntries.length} copied block
          {clipboardEntries.length === 1 ? "" : "s"}
        </div>

<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={handlePasteAllClipboardBlocks}
    disabled={clipboardEntries.length === 0}
    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
  >
    Paste All
  </button>

  <button
    type="button"
    onClick={() => setClearClipboardModalOpen(true)}
    disabled={clipboardEntries.length === 0}
    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
  >
    Clear All
  </button>
</div>
      </div>

      {clipboardEntries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-sm text-white/50">
          Copied blocks will appear here.
        </div>
      ) : (
<div className="overflow-x-auto pb-1">
  <div className="flex w-max min-w-full gap-3">
    {clipboardEntries.map((entry) => (
      <div
        key={entry.clipboardId}
        className="flex w-[150px] shrink-0 flex-col rounded-lg border border-white/10 bg-black/10 px-3 py-2"
      >
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-white">
            {entry.clipboardId}
          </div>
          <div className="truncate text-[11px] text-white/45">
            {entry.block.label ?? entry.block.type}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handlePasteClipboardBlock(entry)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition hover:bg-white/20"
            title="Paste Block"
          >
            <img
              src="/icons/icon_clipboard_paste.png"
              alt="Paste Block"
              className="h-5 w-5"
            />
          </button>

          <button
            type="button"
            onClick={() => handleRemoveClipboardEntry(entry.clipboardId)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition hover:bg-white/20"
            title="Remove Block from Clipboard"
          >
            <img
              src="/icons/icon_clipboard_remove.png"
              alt="Remove Block from Clipboard"
              className="h-5 w-5"
            />
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
      )}
    </div>
  ) : null}
</div>

{builderCapacityContent ? (
  <div className="w-full border-t border-white/10 bg-[#2f3541]">
    {builderCapacityContent}
  </div>
) : null}
</div>

<AppModal
  open={toolGuideModalOpen}
  title="Builder Tool Guide"
  description="Quick explanations for the tools you can add to your microsite."
  cancelText="Close"
  onCancel={() => setToolGuideModalOpen(false)}
>
  <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-2">
    {CATEGORY_BUTTONS[activeCategory]
  .map((tool) => ({
    name: tool.label,
    purpose:
      BUILDER_TOOL_GUIDES.find((guide) => guide.name === tool.label)?.purpose ??
      "Guide content coming soon.",
    howToUse:
      BUILDER_TOOL_GUIDES.find((guide) => guide.name === tool.label)?.howToUse ??
      "Add this tool from the toolbar, then customize it from the inspector panel.",
  }))
  .map((guide) => (
      <div
        key={guide.name}
        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
      >
        <div className="text-sm font-semibold text-neutral-950">
          {guide.name}
        </div>

        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Purpose
        </div>
        <p className="mt-1 text-sm text-neutral-700">{guide.purpose}</p>

        <div className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          How to use
        </div>
        <p className="mt-1 text-sm text-neutral-700">{guide.howToUse}</p>
      </div>
    ))}
  </div>
</AppModal>

<AppModal
  open={clearClipboardModalOpen}
  title="Clear clipboard?"
  description="This will remove all copied blocks from the clipboard."
  confirmText="Clear All"
  cancelText="Cancel"
  danger
  onConfirm={() => {
    handleClearClipboard();
    setClearClipboardModalOpen(false);
  }}
  onCancel={() => setClearClipboardModalOpen(false)}
/>

<AppModal
  open={richTextLinkModalOpen}
  title="Add Link"
  description="Enter the link URL for the selected text."
  confirmText="Apply Link"
  cancelText="Cancel"
  onConfirm={applyRichTextLinkFromModal}
  onCancel={() => setRichTextLinkModalOpen(false)}
>
  <div className="mt-4">
    <div className={inspectorLabelClass()}>URL</div>
    <input
      type="text"
      value={richTextLinkValue}
      onChange={(e) => setRichTextLinkValue(e.target.value)}
      className={inspectorInputClass()}
      placeholder="https://example.com"
    />
  </div>
</AppModal>

<AppModal
  open={removeAllModalOpen}
  title="Remove all blocks?"
  description="This will clear all page text blocks and custom blocks from the canvas."
  confirmText="Remove All"
  cancelText="Cancel"
  danger
  onConfirm={confirmRemoveAllBlocks}
  onCancel={cancelRemoveAllBlocks}
/>
<AppModal
  open={resetDraftModalOpen}
  title="Reset draft?"
  description="This will restore the draft to the original design layout state that was loaded when this editor opened."
  confirmText="Reset Draft"
  cancelText="Cancel"
  danger
  onConfirm={confirmResetDraft}
  onCancel={cancelResetDraft}
/>

<AppModal
  open={blockGuideOpen}
  title={selectedBlockGuide?.title ?? "Block Guide"}
  cancelText=""
  onCancel={() => setBlockGuideOpen(false)}
>
  {selectedBlockGuide ? (
    <div className="mt-5 flex max-h-[72vh] flex-col">
      <div className="overflow-y-auto pr-2">
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Block Guide
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {selectedBlockGuide.subtitle}
          </p>
        </div>

        <div className="space-y-5">
          {selectedBlockGuide.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <h3 className="text-base font-semibold text-neutral-950">
                {section.title}
              </h3>

              {section.body ? (
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {section.body}
                </p>
              ) : null}

              {section.bullets?.length ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-600">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-5">
        <button
          type="button"
          onClick={() => setBlockGuideOpen(false)}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Close
        </button>
      </div>
    </div>
  ) : null}
</AppModal>
<AppModal
  open={Boolean(textureUploadError)}
  title="Texture Upload Error"
  cancelText="OK"
  onCancel={() => setTextureUploadError("")}
>
  <p className="text-sm text-neutral-700">{textureUploadError}</p>
</AppModal>
<AppModal
  open={Boolean(editorUploadError)}
  title="Upload Error"
  cancelText="OK"
  onCancel={() => setEditorUploadError("")}
>
  <p className="text-sm text-neutral-700">{editorUploadError}</p>
</AppModal>

</div>
  );
}