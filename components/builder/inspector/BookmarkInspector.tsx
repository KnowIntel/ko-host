"use client";

/**
 * Bookmark inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "bookmark"
 */
type BookmarkInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  toBookmarkSlug: (value: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function BookmarkInspector({
  selectedBlock,
  updateSelectedBlock,
  toBookmarkSlug,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: BookmarkInspectorProps) {
  const bookmarkAnimation =
    (selectedBlock.data as any).animation ?? "none";

  return (
    <div className={inspectorCardClass()}>
      {/* Bookmark */}
      <div className={inspectorLabelClass()}>Bookmark</div>

      {/* Bookmark Name */}
      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Bookmark Name
        </div>

        <input
          type="text"
          value={(selectedBlock.data as any).name ?? ""}
          onChange={(e) => {
            const nextName = e.target.value;
            const nextSlug = toBookmarkSlug(nextName);

            updateSelectedBlock((block: any) =>
              block.type !== "bookmark"
                ? block
                : {
                    ...block,
                    label: nextName || "Bookmark",
                    data: {
                      ...block.data,
                      name: nextName,
                      slug: nextSlug || block.id,
                    },
                  },
            );
          }}
          className={inspectorInputClass()}
          placeholder="Section name"
        />
      </div>

      {/* Bookmark URL */}
      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Bookmark URL
        </div>

        <input
          type="text"
          readOnly
          value={`#${
            (selectedBlock.data as any).slug ||
            selectedBlock.id
          }`}
          className={inspectorInputClass()}
        />

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Use this value in Button Link or Link URL.
        </p>
      </div>

      {/* Animation */}
      <div className="mt-6 border-t border-neutral-200 pt-5">
        <div className={inspectorLabelClass()}>
          Animation
        </div>

        <select
          value={bookmarkAnimation}
          onChange={(e) => {
            const animation = e.target.value;

            updateSelectedBlock((block: any) =>
              block.type !== "bookmark"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      animation,
                    },
                  },
            );
          }}
          className={inspectorInputClass()}
        >
          <option value="none">None</option>
          <option value="pulse_dot">Pulse Dot</option>
          <option value="ripple">Ripple</option>
          <option value="flash_highlight">
            Flash Highlight
          </option>
        </select>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Shows a brief visual response when a visitor jumps
          to this bookmark.
        </p>
<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Animation Color
  </div>

  <div className="mt-2 flex items-center gap-3">
    <input
      type="color"
      value={
        (selectedBlock.data as any).animationColor ??
        "#2563EB"
      }
      onChange={(e) => {
        const animationColor =
          e.target.value;

        updateSelectedBlock((block: any) =>
          block.type !== "bookmark"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  animationColor,
                },
              },
        );
      }}
      className="h-9 w-12 cursor-pointer rounded border border-neutral-300 bg-white p-1"
      aria-label="Animation color"
    />

    <input
      type="text"
      value={
        (selectedBlock.data as any).animationColor ??
        "#2563EB"
      }
      onChange={(e) => {
        const animationColor =
          e.target.value;

        updateSelectedBlock((block: any) =>
          block.type !== "bookmark"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  animationColor,
                },
              },
        );
      }}
      className={inspectorInputClass()}
      placeholder="#2563EB"
    />
  </div>
</div>

      </div>
    </div>
  );
}