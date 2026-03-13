"use client";

import {
  getTemplateDesignCardMetadata,
  type OverlayDesignMetadata,
} from "@/lib/templates/templateDesignCardMetadata";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";
import { getTemplateDef } from "@/lib/templates/registry";
import { getTemplatePresetOverlayContent } from "@/lib/templates/templateDesignOverlayContent";
import { renderDesignAwarePageText } from "@/components/designs/designPreviewPrimitives";

type Props = {
  templateKey: string;
  designKey: string;
};

/* ---------------------------------------- */
/* Design key normalization                  */
/* ---------------------------------------- */

function normalizeDesignKey(designKey: string): DesignPresetLayout | "blank" {
  if (designKey === "minimal") return "showcase";
  if (designKey === "gallery") return "festive";
  if (designKey === "classic") return "business";

  if (
    designKey === "blank" ||
    designKey === "modern" ||
    designKey === "elegant" ||
    designKey === "business" ||
    designKey === "showcase" ||
    designKey === "festive"
  ) {
    return designKey;
  }

  return "blank";
}

/* ---------------------------------------- */
/* Metadata resolver                         */
/* ---------------------------------------- */

function resolveMetadata(
  templateKey: string,
  designKey: DesignPresetLayout,
): OverlayDesignMetadata | null {
  const direct = getTemplateDesignCardMetadata(templateKey, designKey);
  if (direct) return direct;

  const templateDef = getTemplateDef(templateKey);
  if (!templateDef) return null;

  const byKey = getTemplateDesignCardMetadata(templateDef.key, designKey);
  if (byKey) return byKey;

  const byTitle = getTemplateDesignCardMetadata(templateDef.title, designKey);
  if (byTitle) return byTitle;

  const byDemoSlug = getTemplateDesignCardMetadata(
    templateDef.demoSlug,
    designKey,
  );
  if (byDemoSlug) return byDemoSlug;

  return null;
}

/* ---------------------------------------- */
/* Content resolver                          */
/* ---------------------------------------- */

function resolveContent(templateKey: string, designKey: DesignPresetLayout) {
  const byKey = getTemplatePresetOverlayContent(templateKey, designKey);
  if (byKey) return byKey;

  const templateDef = getTemplateDef(templateKey);
  if (!templateDef) return null;

  const byTitle = getTemplatePresetOverlayContent(templateDef.title, designKey);
  if (byTitle) return byTitle;

  const byDemoSlug = getTemplatePresetOverlayContent(
    templateDef.demoSlug,
    designKey,
  );
  if (byDemoSlug) return byDemoSlug;

  return null;
}

/* ---------------------------------------- */
/* Metadata + content card preview           */
/* ---------------------------------------- */

function MetadataPreview({
  metadata,
  content,
  designKey,
}: {
  metadata: OverlayDesignMetadata;
  content: any;
  designKey: DesignPresetLayout;
}) {
  const titleStyle = metadata.page.title.style;
  const subtitleStyle = metadata.page.subtitle.style;
  const taglineStyle = metadata.page.tagline.style;
  const descriptionStyle = metadata.page.description.style;

  const title = String(content?.title || "");
  const subtitle = String(content?.subtitle || "");
  const description = String(content?.description || "");
  const tagline = String(content?.callout || content?.subtext || "");
  const buttonLabel = String(content?.buttonLabel || "View Details");

  if (designKey === "showcase") {
  return (
    <div className="absolute inset-2 grid grid-cols-[0.9fr_1.1fr] gap-4 px-5 py-0">
      <div className="flex flex-col justify-start pr-3 text-neutral-900 min-w-0">
        <div className={`mt-3 ${titleStyle?.bold ? "font-bold" : ""}`}>
          {renderDesignAwarePageText({
            designKey,
            kind: "title",
            value: title,
            style: titleStyle,
          })}
        </div>

        <div className={`mt-4 ${subtitleStyle?.bold ? "font-bold" : ""}`}>
          {renderDesignAwarePageText({
            designKey,
            kind: "subtitle",
            value: subtitle,
            style: subtitleStyle,
          })}
        </div>

        <div className={`mt-4 max-w-[100%] line-clamp-4 ${descriptionStyle?.bold ? "font-bold" : ""}`}>
          {renderDesignAwarePageText({
            designKey,
            kind: "description",
            value: description,
            style: descriptionStyle,
          })}
        </div>

        <div
          className={`mt-5 inline-flex w-fit rounded-full bg-[#1F46DD] px-3 py-1 text-[10px] text-white ${
            content?.style?.bold ? "font-bold" : "font-semibold"
          }`}
        >
          {buttonLabel}
        </div>

        <div className={`mt-5 ${taglineStyle?.bold ? "font-bold" : ""}`}>
          {renderDesignAwarePageText({
            designKey,
            kind: "tagline",
            value: tagline,
            style: taglineStyle,
          })}
        </div>

        <div className={`mt-5 text-[9px] text-neutral-900 ${content?.style?.bold ? "font-bold" : "font-medium"}`}>
          {String(content?.linkLabel || "Learn More")}
        </div>
      </div>

      <div className="grid h-full grid-cols-4 grid-rows-8 gap-2">

        {/* BIG IMAGE */}
        <div className="col-start-1 col-span-4 row-start-2 row-span-3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          <img
            src={String(content?.image1 || "/designs/design_image_placeholder.webp")}
            alt="Preview image 1"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

        {/* SMALL IMAGE LEFT */}
        <div className="col-start-1 col-span-2 row-start-5 row-span-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          <img
            src={String(content?.image2 || "/designs/design_image_placeholder_1536.webp")}
            alt="Preview image 2"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

        {/* SMALL IMAGE RIGHT */}
        <div className="col-start-3 col-span-2 row-start-5 row-span-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          <img
            src={String(content?.image3 || "/designs/design_image_placeholder_1536.webp")}
            alt="Preview image 3"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

      </div>
    </div>
  );
}

  if (designKey === "festive") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-5 text-center">
        <div className="max-w-[82%] drop-shadow-sm">
          {renderDesignAwarePageText({
            designKey,
            kind: "title",
            value: title,
            style: titleStyle,
          })}
        </div>

        <div className="mt-1 drop-shadow-sm">
          {renderDesignAwarePageText({
            designKey,
            kind: "subtitle",
            value: subtitle,
            style: subtitleStyle,
          })}
        </div>

        <div className="mt-2 max-w-[78%] line-clamp-3 drop-shadow-sm">
          {renderDesignAwarePageText({
            designKey,
            kind: "description",
            value: description,
            style: descriptionStyle,
          })}
        </div>

        <div className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-red-700 shadow">
          {buttonLabel}
        </div>

        <div className="mt-3">
          {renderDesignAwarePageText({
            designKey,
            kind: "tagline",
            value: tagline,
            style: taglineStyle,
          })}
        </div>

        <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-black/10 px-2 py-1 text-[9px] font-semibold text-black backdrop-blur-sm">
          <span>12</span>
          <span>:</span>
          <span>34</span>
          <span>:</span>
          <span>56</span>
        </div>
      </div>
    );
  }

  if (designKey === "modern") {
  const labels = [content?.label1, content?.label2, content?.label3].filter(Boolean);

  return (
    <div className="absolute inset-0 px-6 py-5 text-white">
      <div className="relative h-full">
        <div>
          <div className="relative z-20 flex flex-col justify-start text-left">
            {renderDesignAwarePageText({
              designKey,
              kind: "title",
              value: title,
              style: titleStyle,
            })}
          </div>

          <div className="mt-3 max-w-[44%] line-clamp-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "description",
              value: description,
              style: descriptionStyle,
            })}
          </div>

          <div className="mt-4 inline-flex rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-[10px] font-semibold text-white shadow-lg">
            {buttonLabel}
          </div>
        </div>

        {/* 3x5 portrait image */}
        <div className="absolute right-[42px] top-[38px] z-10 h-[175px] w-[128px] overflow-hidden rounded-xl border border-white/10">
          <img
            src={String(content?.image1 || "/designs/design_image_modern_p.webp")}
            alt="Preview"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {labels.map((label) => (
          <div
            key={String(label)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-center backdrop-blur-sm"
          >
            <div className="mx-auto mb-2 h-7 w-10 rounded-md border border-cyan-300/20 bg-gradient-to-br from-cyan-400/15 to-fuchsia-400/15" />

            <div
              className="text-[9px] font-medium text-white"
              style={{
                fontFamily:
                  titleStyle?.fontFamily && titleStyle.fontFamily !== "inherit"
                    ? titleStyle.fontFamily
                    : "Poppins",
              }}
            >
              {String(label)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

  if (designKey === "elegant") {
  return (
    <div className="absolute inset-0 px-6 py-5 text-neutral-900">
  <div className="relative h-full">
    <div className="relative z-20 flex flex-col justify-start text-left">
      <div className="whitespace-nowrap">
        {renderDesignAwarePageText({
          designKey,
          kind: "title",
          value: title,
          style: titleStyle,
        })}
      </div>

      <div className="-mt-0 max-w-[90%]">
        {renderDesignAwarePageText({
          designKey,
          kind: "subtitle",
          value: subtitle,
          style: subtitleStyle,
        })}
      </div>

      <div className="mt-2 max-w-[60%] line-clamp-6">
        {renderDesignAwarePageText({
          designKey,
          kind: "description",
          value: description,
          style: descriptionStyle,
        })}
      </div>

      <div className="mt-4 inline-flex w-fit items-center gap-3 border border-[#d7c8bb] bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#9f7c61]">
        <span
          style={{
            fontFamily:
              titleStyle?.fontFamily && titleStyle.fontFamily !== "inherit"
                ? titleStyle.fontFamily
                : '"Cormorant Garamond", "Times New Roman", serif',
          }}
        >
          {buttonLabel}
        </span>
        <span className="text-[14px] leading-none">→</span>
      </div>
    </div>

    <div className="absolute right-[22px] top-[38px] z-10 h-[175px] w-[98px] overflow-hidden border-4 border-black bg-neutral-100">
      <img
        src={String(content?.image1 || "/designs/design_image_elegant_p916.webp")}
        alt="Preview"
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>
  </div>
</div>
  );
}

  if (designKey === "business") {
  return (
    <div className="absolute inset-2 flex flex-col justify-start px-5 py-5 text-[#1c2d5a]">
      <div className="flex flex-col justify-start text-left">
        <div className="max-w-[100%]">
          {renderDesignAwarePageText({
            designKey,
            kind: "title",
            value: title,
            style: titleStyle,
          })}
        </div>

        <div className="mt-2 max-w-[70%] line-clamp-4">
          {renderDesignAwarePageText({
            designKey,
            kind: "description",
            value: description,
            style: descriptionStyle,
          })}
        </div>

        <div className="mt-5 inline-flex w-fit rounded-md bg-[#2463c5] px-4 py-2 text-[10px] font-semibold text-white shadow-sm">
          {buttonLabel}
        </div>

        <div className="mt-5 flex gap-6">
          <div className="h-[66px] w-[82px]  bg-neutral-100">
            <img
              src={String(content?.image1 || "/designs/design_image_placeholder.webp")}
              alt="Preview image 1"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>

          <div className="h-[86px] w-[102px]  bg-neutral-100">
            <img
              src={String(content?.image2 || "/designs/design_image_placeholder.webp")}
              alt="Preview image 2"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>

          <div className="h-[66px] w-[82px]  bg-neutral-100">
            <img
              src={String(content?.image3 || "/designs/design_image_placeholder.webp")}
              alt="Preview image 3"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

  return null;
}

export default function DesignPreviewRenderer({
  templateKey,
  designKey,
}: Props) {
  const normalizedDesignKey = normalizeDesignKey(designKey);

  if (normalizedDesignKey === "blank") {
    return null;
  }

  const metadata = resolveMetadata(templateKey, normalizedDesignKey);
  const content = resolveContent(templateKey, normalizedDesignKey);

  if (!metadata || !content) {
    return null;
  }

  return (
    <MetadataPreview
      metadata={metadata}
      content={content}
      designKey={normalizedDesignKey}
    />
  );
}