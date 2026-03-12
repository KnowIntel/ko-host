"use client";

import {
  getTemplateDesignOverlayMetadata,
  type OverlayDesignMetadata,
} from "@/lib/templates/templateDesignOverlayMetadata";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";
import { getTemplateDef } from "@/lib/templates/registry";
import { getTemplatePresetOverlayContent } from "@/lib/templates/templateDesignOverlayContent";
import { renderDesignAwarePageText } from "@/components/designs/designPreviewPrimitives";

type Props = {
  templateKey: string;
  designKey: string;
};

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

function resolveMetadata(
  templateKey: string,
  designKey: DesignPresetLayout,
): OverlayDesignMetadata | null {
  const direct = getTemplateDesignOverlayMetadata(templateKey, designKey);
  if (direct) return direct;

  const templateDef = getTemplateDef(templateKey);
  if (!templateDef) return null;

  const byKey = getTemplateDesignOverlayMetadata(templateDef.key, designKey);
  if (byKey) return byKey;

  const byTitle = getTemplateDesignOverlayMetadata(templateDef.title, designKey);
  if (byTitle) return byTitle;

  const byDemoSlug = getTemplateDesignOverlayMetadata(
    templateDef.demoSlug,
    designKey,
  );
  if (byDemoSlug) return byDemoSlug;

  return null;
}

function resolveLegacyContent(templateKey: string, designKey: DesignPresetLayout) {
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

function getFirstBlockByType(
  metadata: OverlayDesignMetadata | null,
  type: string,
) {
  return (
    metadata?.blocks.find((block) => block.enabled && block.type === type) ??
    null
  );
}

function MetadataPreview({
  metadata,
  designKey,
}: {
  metadata: OverlayDesignMetadata;
  designKey: DesignPresetLayout;
}) {
  const title = metadata.page.title;
  const subtitle = metadata.page.subtitle;
  const tagline = metadata.page.tagline;
  const description = metadata.page.description;
  const cta = getFirstBlockByType(metadata, "cta");
  const links = getFirstBlockByType(metadata, "links");
  const labels = metadata.blocks
    .filter((block) => block.enabled && block.type === "label")
    .slice(0, 3);

  if (designKey === "showcase") {
    return (
      <div className="absolute inset-0 grid grid-cols-[1.1fr_0.9fr] px-5 py-4">
        <div className="flex flex-col justify-center pr-3 text-neutral-900">
          <div className="max-w-[80%]">
            {renderDesignAwarePageText({
              designKey,
              kind: "title",
              value: title.value,
              style: title.style,
            })}
          </div>

          <div className="mt-1">
            {renderDesignAwarePageText({
              designKey,
              kind: "subtitle",
              value: subtitle.value,
              style: subtitle.style,
            })}
          </div>

          <div className="mt-2 max-w-[82%] line-clamp-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "description",
              value: description.value,
              style: description.style,
            })}
          </div>

          <div className="mt-3 inline-flex w-fit rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-semibold text-white">
            {String(
              (cta?.data as { buttonText?: string })?.buttonText || "View Details",
            )}
          </div>

          <div className="mt-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "tagline",
              value: tagline.value,
              style: tagline.style,
            })}
          </div>

          <div className="mt-1 text-[9px] font-medium text-neutral-900">
            {String(
              (
                links?.data as {
                  items?: Array<{ label?: string }>;
                }
              )?.items?.[0]?.label || "Learn More",
            )}
          </div>
        </div>

        <div />
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
            value: title.value,
            style: title.style,
          })}
        </div>

        <div className="mt-1 drop-shadow-sm">
          {renderDesignAwarePageText({
            designKey,
            kind: "subtitle",
            value: subtitle.value,
            style: subtitle.style,
          })}
        </div>

        <div className="mt-2 max-w-[78%] line-clamp-3 drop-shadow-sm">
          {renderDesignAwarePageText({
            designKey,
            kind: "description",
            value: description.value,
            style: description.style,
          })}
        </div>

        <div className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-red-700 shadow">
          {String(
            (cta?.data as { buttonText?: string })?.buttonText || "View Details",
          )}
        </div>

        <div className="mt-3">
          {renderDesignAwarePageText({
            designKey,
            kind: "tagline",
            value: tagline.value,
            style: tagline.style,
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
    return (
      <div className="absolute inset-0 flex flex-col justify-between px-5 py-5 text-white">
        <div>
          <div className="max-w-[88%]">
            {renderDesignAwarePageText({
              designKey,
              kind: "title",
              value: title.value,
              style: title.style,
            })}
          </div>

          <div className="mt-3 max-w-[100%] line-clamp-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "description",
              value: description.value,
              style: description.style,
            })}
          </div>

          <div className="mt-4 inline-flex rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-[10px] font-semibold text-white shadow-lg">
            {String(
              (cta?.data as { buttonText?: string })?.buttonText || "Learn More",
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {labels.map((label) => (
            <div
              key={label.key}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-center backdrop-blur-sm"
            >
              <div className="mx-auto mb-2 h-7 w-10 rounded-md border border-cyan-300/20 bg-gradient-to-br from-cyan-400/15 to-fuchsia-400/15" />

              <div
                className="text-[9px] font-medium text-white"
                style={{
                  fontFamily:
                    (
                      label.data as {
                        style?: { fontFamily?: string };
                      }
                    )?.style?.fontFamily || "Poppins",
                }}
              >
                {String((label.data as { text?: string })?.text || "Label")}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (designKey === "elegant") {
    return (
      <div className="absolute inset-0 flex flex-col justify-start px-6 py-5 text-neutral-900">
        <div className="flex flex-col justify-start text-left">
          <div className="max-w-[96%]">
            {renderDesignAwarePageText({
              designKey,
              kind: "title",
              value: title.value,
              style: title.style,
            })}
          </div>

          <div className="-mt-1 max-w-[90%]">
            {renderDesignAwarePageText({
              designKey,
              kind: "subtitle",
              value: subtitle.value,
              style: subtitle.style,
            })}
          </div>

          <div className="mt-2 max-w-[66%] line-clamp-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "description",
              value: description.value,
              style: description.style,
            })}
          </div>

          <div className="mt-4 inline-flex w-fit items-center gap-3 border border-[#d7c8bb] bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#9f7c61]">
            <span
              style={{
                fontFamily:
                  title.style?.fontFamily && title.style.fontFamily !== "inherit"
                    ? title.style.fontFamily
                    : '"Cormorant Garamond", "Times New Roman", serif',
              }}
            >
              {String(
                (cta?.data as { buttonText?: string })?.buttonText ||
                  "View Details",
              )}
            </span>
            <span className="text-[14px] leading-none">→</span>
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
              value: title.value,
              style: title.style,
            })}
          </div>

          <div className="mt-3 max-w-[42%] line-clamp-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "description",
              value: description.value,
              style: description.style,
            })}
          </div>

          <div className="mt-5 inline-flex w-fit rounded-md bg-[#2463c5] px-4 py-2 text-[10px] font-semibold text-white shadow-sm">
            {String(
              (cta?.data as { buttonText?: string })?.buttonText || "Learn More",
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function LegacyContentPreview({
  content,
  designKey,
}: {
  content: any;
  designKey: DesignPresetLayout;
}) {
  if (designKey === "showcase") {
    return (
      <div className="absolute inset-0 grid grid-cols-[1.1fr_0.9fr] px-5 py-4">
        <div className="flex flex-col justify-center pr-3 text-neutral-900">
          <div className="max-w-[80%] text-[28px] font-semibold leading-tight">
            {content.title}
          </div>
          <div className="mt-1 text-[9px] text-neutral-700">
            {content.subtitle}
          </div>
          <div className="mt-2 max-w-[82%] text-[10px] leading-4 text-neutral-600 line-clamp-3">
            {content.description}
          </div>
          <div className="mt-3 inline-flex w-fit rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-semibold text-white">
            {content.buttonLabel}
          </div>
          <div className="mt-3 text-[9px] text-neutral-600">
            {content.callout}
          </div>
          <div className="mt-1 text-[9px] font-medium text-neutral-900">
            {content.linkLabel}
          </div>
        </div>
        <div />
      </div>
    );
  }

  if (designKey === "festive") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-5 text-center">
        <div className="max-w-[82%] text-[22px] font-semibold leading-tight text-black drop-shadow-sm">
          {content.title}
        </div>
        <div className="mt-1 text-[12px] font-medium uppercase tracking-wide text-red-700 drop-shadow-sm">
          {content.subtitle}
        </div>
        <div className="mt-2 max-w-[78%] text-[10px] leading-4 text-black line-clamp-3 drop-shadow-sm">
          {content.description}
        </div>
        <div className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-red-700 shadow">
          {content.buttonLabel}
        </div>
        <div className="mt-3 text-[9px] font-medium text-black">
          {content.callout}
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
    const words = String(content.title || "").split(" ");
    const firstPart = words.slice(0, -1).join(" ") || content.title;
    const accentWord = words.slice(-1).join(" ");

    return (
      <div className="absolute inset-0 flex flex-col justify-between px-5 py-5 text-white">
        <div>
          <div
            className="max-w-[88%] text-[22px] font-semibold leading-[1.02] text-white"
            style={{
              fontFamily:
                '"Poppins", "Inter", "Avenir Next", "Segoe UI", sans-serif',
            }}
          >
            {firstPart}
          </div>

          <div
            className="max-w-[88%] text-[22px] font-semibold leading-[1.52] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400"
            style={{
              fontFamily:
                '"Poppins", "Inter", "Avenir Next", "Segoe UI", sans-serif',
            }}
          >
            {accentWord}
          </div>

          <div
            className="mt-3 max-w-[100%] text-[10px] leading-4 text-gray-200 line-clamp-3"
            style={{
              fontFamily:
                '"DM Sans", "Inter", "Avenir Next", "Segoe UI", sans-serif',
            }}
          >
            {content.description}
          </div>

          <div
            className="mt-4 inline-flex rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-[10px] font-semibold text-white shadow-lg"
            style={{
              fontFamily:
                '"Poppins", "Inter", "Avenir Next", "Segoe UI", sans-serif',
            }}
          >
            {content.buttonLabel}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[content.label1, content.label2, content.label3]
            .filter(Boolean)
            .map((label) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-2 h-7 w-10 rounded-md border border-cyan-300/20 bg-gradient-to-br from-cyan-400/15 to-fuchsia-400/15" />
                <div
                  className="text-[9px] font-medium text-white"
                  style={{
                    fontFamily:
                      '"Poppins", "Inter", "Avenir Next", "Segoe UI", sans-serif',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (designKey === "elegant") {
    return (
      <div className="absolute inset-0 flex flex-col justify-start px-6 py-5 text-neutral-900">
        <div className="flex flex-col justify-start text-left">
          <div
            className="max-w-[72%] text-[10px] uppercase tracking-[0.42em] text-neutral-500"
            style={{
              fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            {content.title?.split(" ").slice(0, -1).join(" ") || content.title}
          </div>

          <div
            className="-mt-1 max-w-[96%] text-[52px] leading-[0.9] text-neutral-800"
            style={{
              fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            {content.title?.split(" ").slice(-1).join(" ") || ""}
          </div>

          <div
            className="-mt-1 max-w-[90%] text-[32px] leading-none text-[#b48a68]"
            style={{ fontFamily: '"Great Vibes", "Brush Script MT", cursive' }}
          >
            {content.subtitle}
          </div>

          <div
            className="mt-2 max-w-[66%] text-[10px] font-bold uppercase tracking-[0.28em] leading-4 text-neutral-600 line-clamp-3"
            style={{
              fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            {content.description}
          </div>

          <div className="mt-4 inline-flex w-fit items-center gap-3 border border-[#d7c8bb] bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#9f7c61]">
            <span
              style={{
                fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
              }}
            >
              {content.buttonLabel}
            </span>
            <span className="text-[14px] leading-none">→</span>
          </div>
        </div>
      </div>
    );
  }

  if (designKey === "business") {
    return (
      <div className="absolute inset-2 flex flex-col justify-start px-5 py-5 text-[#1c2d5a]">
        <div className="flex flex-col justify-start text-left">
          <div
            className="max-w-[100%] text-[20px] font-semibold leading-[1.25] text-[#1f2e5a]"
            style={{
              fontFamily:
                '"DM Sans", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
            }}
          >
            {content.title}
          </div>

          <div
            className="mt-3 max-w-[42%] text-[11px] leading-5 text-[#445174] line-clamp-3"
            style={{
              fontFamily:
                '"Poppins", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
            }}
          >
            {content.description}
          </div>

          <div className="mt-5 inline-flex w-fit rounded-md bg-[#2463c5] px-4 py-2 text-[10px] font-semibold text-white shadow-sm">
            {content.buttonLabel}
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
  if (metadata) {
    return <MetadataPreview metadata={metadata} designKey={normalizedDesignKey} />;
  }

  const legacyContent = resolveLegacyContent(templateKey, normalizedDesignKey);
  if (legacyContent) {
    return (
      <LegacyContentPreview
        content={legacyContent}
        designKey={normalizedDesignKey}
      />
    );
  }

  return null;
}