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
  return (
    <div className={inspectorCardClass()}>
      {/* Bookmark */}
    <div className={inspectorLabelClass()}>Bookmark</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Bookmark Name</div>
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Bookmark URL</div>
      <input
        type="text"
        readOnly
        value={`#${(selectedBlock.data as any).slug || selectedBlock.id}`}
        className={inspectorInputClass()}
      />
      <p className="mt-2 text-xs leading-5 text-neutral-500">
        Use this value in Button Link or Link URL.
      </p>
    </div>
    </div>
  );
}