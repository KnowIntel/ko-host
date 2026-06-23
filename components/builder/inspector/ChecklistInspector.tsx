"use client";

/**
 * Checklist inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "checklist"
 */
type ChecklistInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function ChecklistInspector({
  selectedBlock,
  updateSelectedBlock,
  makeClientId,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: ChecklistInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Checklist */}
    <div className={inspectorLabelClass()}>Checklist</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "checklist"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 space-y-3">
      {selectedBlock.data.items.map((item: any) => (
        <div
          key={item.id}
          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(item.checked)}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "checklist"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry: any) =>
                            entry.id === item.id
                              ? { ...entry, checked: e.target.checked }
                              : entry,
                          ),
                        },
                      },
                )
              }
            />

            <input
              type="text"
              value={item.label}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "checklist"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry: any) =>
                            entry.id === item.id
                              ? { ...entry, label: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className={toolSetButtonClass("remove")}
              onClick={() =>
                updateSelectedBlock((block: any) =>
                  block.type !== "checklist"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items:
                            block.data.items.length > 1
                              ? block.data.items.filter(
                                  (entry: any) => entry.id !== item.id,
                                )
                              : block.data.items,
                        },
                      },
                )
              }
              title="Remove checklist item"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block: any) =>
            block.type !== "checklist"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: [
                      ...block.data.items,
                      {
                        id: makeClientId("check"),
                        label: "New item",
                        checked: false,
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Item
      </button>
    </div>
    </div>
  );
}