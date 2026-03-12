"use client";

import type { BuilderBlockType, TextAlign } from "@/lib/templates/builder";

export type PageBlockType = "title" | "subtitle" | "tagline" | "description";

type Props = {
  selectedFontFamily: string;
  selectedFontSize: number;
  selectedBold: boolean;
  selectedItalic: boolean;
  selectedUnderline: boolean;
  selectedColor: string;
  onFontFamilyChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
  onBoldChange: (value: boolean) => void;
  onItalicChange: (value: boolean) => void;
  onUnderlineChange: (value: boolean) => void;
  onAlignChange: (value: TextAlign) => void;
  onColorChange: (value: string) => void;
  onAddBlock: (type: BuilderBlockType) => void;
  onAddPageBlock?: (type: PageBlockType) => void;
};

const FONT_OPTIONS = [
  "inherit",
  "Inter",
  "DM Sans",
  "Poppins",
  "Cormorant Garamond",
  "Great Vibes",
  "Playfair Display",
];

const PAGE_BLOCKS: Array<{ type: PageBlockType; label: string }> = [
  { type: "title", label: "Title" },
  { type: "subtitle", label: "Subtitle" },
  { type: "tagline", label: "Tagline" },
  { type: "description", label: "Description" },
];

const BLOCKS: Array<{ type: BuilderBlockType; label: string }> = [
  { type: "label", label: "Label" },
  { type: "image", label: "Image" },
  { type: "links", label: "Navigation Link" },
  { type: "cta", label: "Button" },
  { type: "countdown", label: "Countdown" },
  { type: "padding", label: "Spacing" },
  { type: "poll", label: "Poll" },
  { type: "rsvp", label: "RSVP" },
  { type: "faq", label: "FAQ" },
  { type: "gallery", label: "Gallery" },
  { type: "thread", label: "Message Thread" },
];

export default function ToolboxPanel({
  selectedFontFamily,
  selectedFontSize,
  selectedBold,
  selectedItalic,
  selectedUnderline,
  selectedColor,
  onFontFamilyChange,
  onFontSizeChange,
  onBoldChange,
  onItalicChange,
  onUnderlineChange,
  onAlignChange,
  onColorChange,
  onAddBlock,
  onAddPageBlock,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-4 text-white shadow-sm">
        <div className="text-sm font-semibold">Typography</div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs uppercase tracking-[0.16em] text-white/55">
              Font
            </label>
            <select
              value={selectedFontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.16em] text-white/55">
              Size
            </label>
            <input
              type="number"
              min={8}
              max={120}
              value={selectedFontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value) || 16)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.16em] text-white/55">
              Font Color
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded border border-white/15 bg-transparent"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onBoldChange(!selectedBold)}
              className={[
                "rounded-xl border px-3 py-2 text-sm",
                selectedBold
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-white/10 bg-black/20 text-white/75",
              ].join(" ")}
            >
              B
            </button>

            <button
              type="button"
              onClick={() => onItalicChange(!selectedItalic)}
              className={[
                "rounded-xl border px-3 py-2 text-sm italic",
                selectedItalic
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-white/10 bg-black/20 text-white/75",
              ].join(" ")}
            >
              I
            </button>

            <button
              type="button"
              onClick={() => onUnderlineChange(!selectedUnderline)}
              className={[
                "rounded-xl border px-3 py-2 text-sm underline",
                selectedUnderline
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-white/10 bg-black/20 text-white/75",
              ].join(" ")}
            >
              U
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onAlignChange("left")}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => onAlignChange("center")}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => onAlignChange("right")}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
            >
              Right
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-4 text-white shadow-sm">
        <div className="text-sm font-semibold">Page Text</div>

        <div className="mt-4 grid gap-2">
          {PAGE_BLOCKS.map((block) => (
            <button
              key={block.type}
              type="button"
              onClick={() => onAddPageBlock?.(block.type)}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
            >
              {block.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-4 text-white shadow-sm">
        <div className="text-sm font-semibold">Toolbox</div>

        <div className="mt-4 grid gap-2">
          {BLOCKS.map((block) => (
            <button
              key={block.type}
              type="button"
              onClick={() => onAddBlock(block.type)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/kht-block-type", block.type);
              }}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
            >
              {block.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}