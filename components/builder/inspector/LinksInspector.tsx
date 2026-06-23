"use client";

import type { RefObject } from "react";

type LinksInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  makeClientId: (prefix: string) => string;

  linksHeadingInputRef: RefObject<HTMLInputElement | null>;
  linksItemLabelInputRefs: RefObject<Record<string, HTMLInputElement | null>>;
  linksItemUrlInputRefs: RefObject<Record<string, HTMLInputElement | null>>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function LinksInspector({
  selectedBlock,
  updateSelectedBlock,
  makeClientId,
  linksHeadingInputRef,
  linksItemLabelInputRefs,
  linksItemUrlInputRefs,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: LinksInspectorProps) {
  return (
    <div id="inspector-links" className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Links</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Heading</div>
        <input
          ref={linksHeadingInputRef}
          type="text"
          value={selectedBlock.data.heading ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "links"
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
            <div className={inspectorLabelClass()}>Label</div>
            <input
              ref={(el) => {
                linksItemLabelInputRefs.current[item.id] = el;
              }}
              type="text"
              value={item.label}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "links"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry: any) =>
                            entry.id === item.id
                              ? {
                                  ...entry,
                                  label: e.target.value,
                                }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <div className="mt-4">
              <div className={inspectorLabelClass()}>URL</div>
              <input
                ref={(el) => {
                  linksItemUrlInputRefs.current[item.id] = el;
                }}
                type="text"
                value={item.url}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "links"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: block.data.items.map((entry: any) =>
                              entry.id === item.id
                                ? {
                                    ...entry,
                                    url: e.target.value,
                                  }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />

              <div className="mt-1 text-[11px] text-neutral-500">
                Example internal page link:{" "}
                <span className="font-mono">
                  /
                  {item.label && item.label.trim().length > 0
                    ? item.label.trim().toLowerCase().replace(/\s+/g, "-")
                    : "page_name"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "links"
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
                title="Remove link"
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
              block.type !== "links"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      items: [
                        ...block.data.items,
                        {
                          id: makeClientId("link"),
                          label: "New Link",
                          url: "#",
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Link
        </button>
      </div>
    </div>
  );
}