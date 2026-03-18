"use client";

import { useMemo, useState } from "react";

import type {
  BuilderBlockType,
  ShapeType,
  TextAlign,
} from "@/lib/templates/builder";

export type PageBlockType = "title" | "subtitle" | "tagline" | "description";

type Props = {
  selectedFontFamily: string;
  selectedFontSize: number;
  selectedBold: boolean;
  selectedItalic: boolean;
  selectedUnderline: boolean;
  selectedColor: string;
  selectedBackgroundColor: string;
  selectedBorderColor: string;
  selectedBorderWidth: number;
  selectedBorderRadius: number;
  onFontFamilyChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
  onBoldChange: (value: boolean) => void;
  onItalicChange: (value: boolean) => void;
  onUnderlineChange: (value: boolean) => void;
  onAlignChange: (value: TextAlign) => void;
  onColorChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onBorderColorChange: (value: string) => void;
  onBorderWidthChange: (value: number) => void;
  onBorderRadiusChange: (value: number) => void;
  onAddBlock: (type: BuilderBlockType) => void;
  onAddShape: (type: ShapeType) => void;
  onAddPageBlock?: (type: PageBlockType) => void;
};

const FONT_OPTIONS = [
  "inherit",
  "Inter",
  "DM Sans",
  "Poppins",
  "Playfair Display",
  "Cormorant Garamond",
  "Montserrat",
  "Lato",
  "Open Sans",
  "Roboto",
  "Oswald",
  "Merriweather",
  "Raleway",
  "Nunito",
  "Work Sans",
  "Libre Baskerville",
  "Source Sans 3",
  "PT Sans",
  "Figtree",
  "Manrope",
  "Rubik",
  "Space Grotesk",
  "Bebas Neue",
  "Abril Fatface",
  "Cinzel",
  "Quicksand",
  "Josefin Sans",
  "Mulish",
  "Karla",
  "Cabin",
  "Barlow",
  "Archivo",
  "Plus Jakarta Sans",
  "Libre Franklin",
  "Hind",
  "Crimson Text",
  "Lora",
  "IBM Plex Sans",
  "IBM Plex Serif",
  "Arimo",
  "Tinos",
  "M PLUS 1p",
] as const;

const CATEGORY_TABS = [
  "Text",
  "Media",
  "Layout",
  "Forms",
  "Marketing",
  "Social",
  "Utilities",
] as const;

type Category = (typeof CATEGORY_TABS)[number];

const BLOCK_MAP: Record<
  Category,
  ReadonlyArray<{ type: BuilderBlockType; label: string }>
> = {
  Text: [
    { type: "label", label: "Text Label" },
    { type: "text_fx", label: "TextFX (Effects)" }, // ✅ NEW
  ],

  Media: [
    { type: "image", label: "Image" },
    { type: "gallery", label: "Gallery" },
  ],

  Layout: [{ type: "padding", label: "Spacer" }],

  Forms: [
  { type: "form_field", label: "Input Field" }, // ✅ NEW
  { type: "poll", label: "Poll" },
  { type: "rsvp", label: "RSVP" },
],

  Marketing: [
    { type: "cta", label: "Call To Action" },
    { type: "countdown", label: "Countdown" },
    { type: "faq", label: "FAQ" },
  ],

  Social: [{ type: "thread", label: "Message Thread" }],

  Utilities: [{ type: "links", label: "Navigation Link" }],
};

const PAGE_BLOCKS: ReadonlyArray<{ type: PageBlockType; label: string }> = [
  { type: "title", label: "Title" },
  { type: "subtitle", label: "Subtitle" },
  { type: "tagline", label: "Tagline" },
  { type: "description", label: "Description" },
];

const SHAPES: ReadonlyArray<{ type: ShapeType; label: string }> = [
  { type: "rectangle", label: "Rectangle" },
  { type: "circle", label: "Circle" },
  { type: "line", label: "Line" },
];

const panel = "rounded-xl border border-neutral-300 bg-white p-4 shadow-sm";
const sectionTitle = "text-sm font-semibold text-neutral-700";
const field =
  "mt-1 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm";
const button =
  "rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm hover:bg-neutral-100";
const blockButton =
  "rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-sm hover:bg-neutral-100";

function AddGrid<T extends string>({
  items,
  onClick,
}: {
  items: ReadonlyArray<{ type: T; label: string }>;
  onClick: (type: T) => void;
}) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <button
          key={item.type}
          type="button"
          className={blockButton}
          onClick={() => onClick(item.type)}
          draggable
          onDragStart={(e) =>
            e.dataTransfer.setData("application/kht-block-type", item.type)
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function ToolboxPanel({
  selectedFontFamily,
  selectedFontSize,
  selectedBold,
  selectedItalic,
  selectedUnderline,
  selectedColor,
  selectedBackgroundColor,
  selectedBorderColor,
  selectedBorderWidth,
  selectedBorderRadius,
  onFontFamilyChange,
  onFontSizeChange,
  onBoldChange,
  onItalicChange,
  onUnderlineChange,
  onAlignChange,
  onColorChange,
  onBackgroundColorChange,
  onBorderColorChange,
  onBorderWidthChange,
  onBorderRadiusChange,
  onAddBlock,
  onAddShape,
  onAddPageBlock,
}: Props) {
  const [activeTab, setActiveTab] = useState<Category>("Text");

  const sortedFonts = useMemo(
    () => [
      FONT_OPTIONS[0],
      ...FONT_OPTIONS.slice(1).sort((a, b) => a.localeCompare(b)),
    ],
    [],
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className={panel}>
        <div className={sectionTitle}>Typography</div>

        <select
          value={selectedFontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className={field}
        >
          {sortedFonts.map((font) => (
            <option
              key={font}
              value={font}
              style={{
                fontFamily: font === "inherit" ? "inherit" : font,
              }}
            >
              {font}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={8}
          max={240}
          value={selectedFontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value) || 16)}
          className={field}
        />

        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="mt-2"
        />

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className={button}
            onClick={() => onBoldChange(!selectedBold)}
          >
            B
          </button>

          <button
            type="button"
            className={button}
            onClick={() => onItalicChange(!selectedItalic)}
          >
            I
          </button>

          <button
            type="button"
            className={button}
            onClick={() => onUnderlineChange(!selectedUnderline)}
          >
            U
          </button>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          <button
            type="button"
            className={button}
            onClick={() => onAlignChange("left")}
          >
            Left
          </button>
          <button
            type="button"
            className={button}
            onClick={() => onAlignChange("center")}
          >
            Center
          </button>
          <button
            type="button"
            className={button}
            onClick={() => onAlignChange("right")}
          >
            Right
          </button>
        </div>
      </div>

      <div className={panel}>
        <div className={sectionTitle}>Block Background</div>
        <input
          type="color"
          value={selectedBackgroundColor}
          onChange={(e) => onBackgroundColorChange(e.target.value)}
          className="mt-2"
        />
      </div>

      <div className={panel}>
        <div className={sectionTitle}>Borders</div>

        <input
          type="color"
          value={selectedBorderColor}
          onChange={(e) => onBorderColorChange(e.target.value)}
          className="mt-2"
        />

        <input
          type="number"
          min={0}
          max={40}
          value={selectedBorderWidth}
          onChange={(e) => onBorderWidthChange(Number(e.target.value) || 0)}
          className={field}
        />

        <input
          type="number"
          min={0}
          max={999}
          value={selectedBorderRadius}
          onChange={(e) => onBorderRadiusChange(Number(e.target.value) || 0)}
          className={field}
        />
      </div>

      <div className={panel}>
        <div className={sectionTitle}>Page Text</div>
        <AddGrid items={PAGE_BLOCKS} onClick={(t) => onAddPageBlock?.(t)} />
      </div>

      <div className={panel}>
        <div className={sectionTitle}>Shapes</div>
        <AddGrid items={SHAPES} onClick={onAddShape} />
      </div>

      <div className={panel}>
        <div className="mb-3 flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1 text-sm ${
                activeTab === tab ? "bg-black text-white" : "bg-neutral-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AddGrid items={BLOCK_MAP[activeTab]} onClick={onAddBlock} />
      </div>
    </div>
  );
}