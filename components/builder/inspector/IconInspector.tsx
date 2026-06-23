"use client";

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
  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Icon</div>

      <div className="mt-4">
        <select
          value={getIconNameFromUrl(selectedBlock.data.icon.url)}
          onChange={(e) => {
            const iconName = e.target.value;
            const iconTool = CATEGORY_BUTTONS.Icons.find(
              (tool: any) =>
                tool.kind === "block" &&
                tool.type === "icon" &&
                tool.iconName === iconName,
            );

            updateSelectedBlock((block: any) =>
              block.type !== "icon"
                ? block
                : {
                    ...block,
                    label: iconTool?.label ?? block.label,
                    data: {
                      ...block.data,
                      icon: {
                        ...block.data.icon,
                        id: `/media-icons/${iconName}.svg`,
                        url: `/media-icons/${iconName}.svg`,
                        alt: iconTool?.label ?? block.data.icon.alt ?? "Icon",
                      },
                    },
                  },
            );
          }}
          className={inspectorInputClass()}
        >
          {CATEGORY_BUTTONS.Icons.filter(
            (tool: any) => tool.kind === "block" && tool.type === "icon",
          ).map((tool: any) => (
            <option key={tool.iconName ?? tool.label} value={tool.iconName ?? "star"}>
              {tool.label}
            </option>
          ))}
        </select>
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
              ? Math.round((selectedBlock.data.icon.zoom ?? 1) * 100)
              : key === "opacity"
                ? Math.round((selectedBlock.data.icon.opacity ?? 1) * 100)
                : ((selectedBlock.data.icon as any)[key] ??
                  (key === "rotation" ? 0 : 50));

          return (
            <div key={String(key)}>
              <div className={inspectorLabelClass()}>{label}</div>
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