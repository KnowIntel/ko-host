"use client";

import { getTemplateLayoutRegistry } from "@/lib/templates/layout-presets/layoutRegistry";

type Props = {
  templateKey: string;
  designKey: string;
};

function getLayout(templateKey: string, designKey: string) {
  const registry = getTemplateLayoutRegistry(templateKey);
  if (!registry) return null;

  return registry.layouts.find((layout) => layout.designKey === designKey) ?? null;
}

function getTextBlock(
  layout: ReturnType<typeof getLayout>,
  type: "title" | "subtitle" | "tagline" | "description",
) {
  return layout?.pageTextBlocks?.find((block) => block.type === type && block.visible !== false) ?? null;
}

function getTextAlignClass(align?: "left" | "center" | "right") {
  if (align === "left") return "text-left";
  if (align === "right") return "text-right";
  return "text-center";
}

export default function LayoutPresetPreviewRenderer({
  templateKey,
  designKey,
}: Props) {
  const layout = getLayout(templateKey, designKey);

  if (!layout) return null;

  const title = getTextBlock(layout, "title");
  const subtitle = getTextBlock(layout, "subtitle");
  const tagline = getTextBlock(layout, "tagline");
  const description = getTextBlock(layout, "description");

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/0 to-black/10" />

      <div className="absolute inset-x-4 top-5 flex flex-col items-center">
        {title ? (
          <div
            className={[
              "max-w-full truncate text-[24px] leading-tight",
              getTextAlignClass(title.style?.align),
              title.style?.bold ? "font-bold" : "font-semibold",
              title.style?.italic ? "italic" : "",
              title.style?.underline ? "underline" : "",
            ].join(" ")}
            style={{
              color: title.style?.color || "#1f2937",
              fontFamily:
                title.style?.fontFamily && title.style.fontFamily !== "inherit"
                  ? title.style.fontFamily
                  : undefined,
            }}
          >
            {title.text || ""}
          </div>
        ) : null}

        {subtitle ? (
          <div
            className={[
              "mt-2 max-w-full truncate text-[12px]",
              getTextAlignClass(subtitle.style?.align),
              subtitle.style?.bold ? "font-bold" : "font-medium",
              subtitle.style?.italic ? "italic" : "",
              subtitle.style?.underline ? "underline" : "",
            ].join(" ")}
            style={{
              color: subtitle.style?.color || "#374151",
              fontFamily:
                subtitle.style?.fontFamily && subtitle.style.fontFamily !== "inherit"
                  ? subtitle.style.fontFamily
                  : undefined,
            }}
          >
            {subtitle.text || ""}
          </div>
        ) : null}

        {tagline ? (
          <div
            className={[
              "mt-2 max-w-full truncate text-[10px]",
              getTextAlignClass(tagline.style?.align),
              tagline.style?.bold ? "font-bold" : "font-medium",
              tagline.style?.italic ? "italic" : "",
              tagline.style?.underline ? "underline" : "",
            ].join(" ")}
            style={{
              color: tagline.style?.color || "#6b7280",
              fontFamily:
                tagline.style?.fontFamily && tagline.style.fontFamily !== "inherit"
                  ? tagline.style.fontFamily
                  : undefined,
            }}
          >
            {tagline.text || ""}
          </div>
        ) : null}

        {description ? (
          <div
            className={[
              "mt-3 max-w-[82%] text-center text-[11px] leading-4 line-clamp-2",
              getTextAlignClass(description.style?.align),
              description.style?.bold ? "font-bold" : "font-medium",
              description.style?.italic ? "italic" : "",
              description.style?.underline ? "underline" : "",
            ].join(" ")}
            style={{
              color: description.style?.color || "#374151",
              fontFamily:
                description.style?.fontFamily &&
                description.style.fontFamily !== "inherit"
                  ? description.style.fontFamily
                  : undefined,
            }}
          >
            {description.text || ""}
          </div>
        ) : null}
      </div>
    </div>
  );
}