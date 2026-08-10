"use client";

import { useMemo, useState } from "react";

/**
 * Icon inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "icon"
 */
type IconInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  CATEGORY_BUTTONS: any;
  getIconNameFromUrl: (url: string) => string;
  applyFillColor: (color: string) => void;
  updateSelectedIconPatch: (patch: Record<string, any>) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function IconInspector({
  selectedBlock,
  updateSelectedBlock,
  CATEGORY_BUTTONS,
  getIconNameFromUrl,
  applyFillColor,
  updateSelectedIconPatch,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: IconInspectorProps) {
  const [iconSearch, setIconSearch] = useState("");

  const iconTools = useMemo(
    () =>
      (CATEGORY_BUTTONS.Icons ?? []).filter(
        (tool: any) =>
          tool.kind === "block" &&
          tool.type === "icon",
      ),
    [CATEGORY_BUTTONS],
  );

  const filteredIconTools = useMemo(() => {
    const query = iconSearch.trim().toLowerCase();

    if (!query) return iconTools;

    return iconTools.filter((tool: any) => {
      const label = String(tool.label ?? "").toLowerCase();
      const iconName = String(tool.iconName ?? "").toLowerCase();

      return (
        label.includes(query) ||
        iconName.includes(query)
      );
    });
  }, [iconSearch, iconTools]);

  const selectedIconName = getIconNameFromUrl(
    selectedBlock.data.icon.url,
  );

  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Icon</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Search Icons</div>

        <input
          type="text"
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          placeholder="Search icons..."
          className={inspectorInputClass()}
        />

        {iconSearch ? (
          <button
            type="button"
            onClick={() => setIconSearch("")}
            className="mt-2 text-xs font-medium text-neutral-500 hover:text-neutral-900"
          >
            Clear search
          </button>
        ) : null}
      </div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Icon</div>

  <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2">
    {filteredIconTools.length > 0 ? (
      <div className="grid grid-cols-1 gap-1">
        {filteredIconTools.map((tool: any) => {
          const iconName = tool.iconName ?? "star";
          const isActive = selectedIconName === iconName;

          return (
            <button
              key={iconName}
              type="button"
              onClick={() => {
                updateSelectedBlock((block: any) =>
                  block.type !== "icon"
                    ? block
                    : {
                        ...block,
                        label: tool.label ?? block.label,
                        data: {
                          ...block.data,
                          icon: {
                            ...block.data.icon,
                            id: `/media-icons/${iconName}.svg`,
                            url: `/media-icons/${iconName}.svg`,
                            alt:
                              tool.label ??
                              block.data.icon.alt ??
                              "Icon",
                          },
                        },
                      },
                );
              }}
              className={[
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-800 hover:bg-neutral-100",
              ].join(" ")}
            >
              <img
                src={`/media-icons/${iconName}.svg`}
                alt=""
                className="h-5 w-5 shrink-0 object-contain"
              />

              <span className="min-w-0 flex-1 truncate">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    ) : (
      <div className="px-3 py-4 text-center text-sm text-neutral-500">
        No matching icons
      </div>
    )}
  </div>

  <div className="mt-1 text-xs text-neutral-500">
    {filteredIconTools.length}{" "}
    {filteredIconTools.length === 1 ? "icon" : "icons"} found
  </div>
</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Icon Color</div>

        <input
          type="color"
          value={selectedBlock.data.icon.color ?? "#111111"}
          onChange={(e) => applyFillColor(e.target.value)}
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {(
          [
            ["Horizontal Position", "positionX", 0, 100, "%"],
            ["Vertical Position", "positionY", 0, 100, "%"],
            ["Zoom", "zoom", 50, 300, "%"],
            ["Rotation", "rotation", -180, 180, "°"],
            ["Opacity", "opacity", 0, 100, "%"],
          ] as [string, string, number, number, string][]
        ).map(([label, key, min, max, suffix]) => {
          const rawValue =
            key === "zoom"
              ? Math.round(
                  (selectedBlock.data.icon.zoom ?? 1) * 100,
                )
              : key === "opacity"
                ? Math.round(
                    (selectedBlock.data.icon.opacity ?? 1) * 100,
                  )
                : ((selectedBlock.data.icon as any)[key] ??
                  (key === "rotation" ? 0 : 50));

          return (
            <div key={String(key)}>
              <div className={inspectorLabelClass()}>
                {label}
              </div>

              <input
                type="range"
                min={Number(min)}
                max={Number(max)}
                value={Number(rawValue)}
                onChange={(e) =>
                  updateSelectedIconPatch({
                    [key]:
                      key === "zoom" || key === "opacity"
                        ? Number(e.target.value) / 100
                        : Number(e.target.value),
                  })
                }
                className="mt-2 w-full"
              />

              <div className="mt-1 text-xs text-neutral-500">
                {Number(rawValue)}
                {suffix}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 