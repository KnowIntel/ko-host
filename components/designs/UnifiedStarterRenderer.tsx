"use client";

import {
  getTemplateDesignOverlayMetadata,
  type OverlayDesignMetadata,
} from "@/lib/templates/templateDesignOverlayMetadata";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";

type Props = {
  templateKey: string;
  designKey: string;
  scale?: "card" | "canvas";
};

function getMetadata(
  templateKey: string,
  designKey: string,
): OverlayDesignMetadata | null {
  return getTemplateDesignOverlayMetadata(
    templateKey,
    designKey as DesignPresetLayout,
  );
}

function renderTitle(metadata: OverlayDesignMetadata, scale: "card" | "canvas") {
  const title = metadata.page.title;
  const size = scale === "card" ? "text-[22px]" : "text-[34px]";

  return (
    <div
      className={`${size} font-semibold leading-tight`}
      style={{ fontFamily: title.style?.fontFamily || "inherit" }}
    >
      {title.value}
    </div>
  );
}

function renderSubtitle(
  metadata: OverlayDesignMetadata,
  scale: "card" | "canvas",
) {
  const subtitle = metadata.page.subtitle;
  const size = scale === "card" ? "text-[10px]" : "text-[16px]";

  return (
    <div
      className={`${size} text-neutral-600`}
      style={{ fontFamily: subtitle.style?.fontFamily || "inherit" }}
    >
      {subtitle.value}
    </div>
  );
}

function renderDescription(
  metadata: OverlayDesignMetadata,
  scale: "card" | "canvas",
) {
  const description = metadata.page.description;
  const size = scale === "card" ? "text-[10px]" : "text-[15px]";

  return (
    <div
      className={`${size} text-neutral-600`}
      style={{ fontFamily: description.style?.fontFamily || "inherit" }}
    >
      {description.value}
    </div>
  );
}

export default function UnifiedStarterRenderer({
  templateKey,
  designKey,
  scale = "card",
}: Props) {
  if (designKey === "blank") return null;

  const metadata = getMetadata(templateKey, designKey);
  if (!metadata) return null;

  return (
    <div className="absolute inset-0 flex flex-col justify-center px-6 py-5">
      {renderTitle(metadata, scale)}
      <div className="mt-2">{renderSubtitle(metadata, scale)}</div>
      <div className="mt-3 max-w-[70%]">{renderDescription(metadata, scale)}</div>
    </div>
  );
}