"use client";

import type { Dispatch, SetStateAction } from "react";

type SummaryStyleTarget =
  | "header"
  | "subheader"
  | "contentLabel"
  | "content"
  | "footerLabel"
  | "footerAggregate"
  | "footerCaption";

type SummaryInspectorProps = {
  selectedBlock: any;
  draft: any;

  summaryStyleTarget: SummaryStyleTarget;
  setSummaryStyleTarget: Dispatch<SetStateAction<SummaryStyleTarget>>;

  updateSelectedSummaryData: (patch: Record<string, any>) => void;

  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function SummaryInspector({
  selectedBlock,
  draft,
  summaryStyleTarget,
  setSummaryStyleTarget,
  updateSelectedSummaryData,
  makeClientId,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: SummaryInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Summary */}
    <div className={inspectorLabelClass()}>Style Target</div>

<select
  value={summaryStyleTarget}
  onChange={(e) =>
    setSummaryStyleTarget(
      e.target.value as
        | "header"
        | "subheader"
        | "contentLabel"
        | "content"
        | "footerLabel"
        | "footerAggregate"
        | "footerCaption",
    )
  }
  className={inspectorInputClass()}
>
  <option value="header">Header</option>
  <option value="subheader">Subheader</option>
  <option value="contentLabel">Content Label</option>
  <option value="content">Content</option>
  <option value="footerLabel">Footer Label</option>
  <option value="footerAggregate">Footer Aggregate</option>
  <option value="footerCaption">Footer Caption</option>
</select>

    <div className="mt-5 border-t border-neutral-200 pt-4">
      <div className={inspectorLabelClass()}>Summary</div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Header</div>
      <input
        type="text"
        value={(selectedBlock.data as any).header ?? ""}
        onChange={(e) => updateSelectedSummaryData({ header: e.target.value })}
        className={inspectorInputClass()}
      />
    </div>

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={(selectedBlock.data as any).showHeader !== false}
        onChange={(e) =>
          updateSelectedSummaryData({ showHeader: e.target.checked })
        }
      />
      Show header
    </label>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subheader</div>
      <input
        type="text"
        value={(selectedBlock.data as any).subheader ?? ""}
        onChange={(e) =>
          updateSelectedSummaryData({ subheader: e.target.value })
        }
        className={inspectorInputClass()}
      />
    </div>

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={Boolean((selectedBlock.data as any).showSubheader)}
        onChange={(e) =>
          updateSelectedSummaryData({ showSubheader: e.target.checked })
        }
      />
      Show subheader
    </label>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className={inspectorLabelClass()}>Footer</div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Footer Label</div>

          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showFooterLabel !== false}
              onChange={(e) =>
                updateSelectedSummaryData({
                  showFooterLabel: e.target.checked,
                })
              }
            />
            Show
          </label>
        </div>

        <input
          type="text"
          value={(selectedBlock.data as any).footerLabel ?? ""}
          onChange={(e) =>
            updateSelectedSummaryData({ footerLabel: e.target.value })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Footer Aggregate</div>

          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={
                (selectedBlock.data as any).showFooterAggregate !== false
              }
              onChange={(e) =>
                updateSelectedSummaryData({
                  showFooterAggregate: e.target.checked,
                })
              }
            />
            Show
          </label>
        </div>

        <input
          type="text"
          value={(selectedBlock.data as any).footerAggregateLabel ?? ""}
          onChange={(e) =>
            updateSelectedSummaryData({
              footerAggregateLabel: e.target.value,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Footer Caption</div>

          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={Boolean((selectedBlock.data as any).showFooterCaption)}
              onChange={(e) =>
                updateSelectedSummaryData({
                  showFooterCaption: e.target.checked,
                })
              }
            />
            Show
          </label>
        </div>

        <input
          type="text"
          value={(selectedBlock.data as any).footerCaption ?? ""}
          onChange={(e) =>
            updateSelectedSummaryData({ footerCaption: e.target.value })
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className={inspectorLabelClass()}>Linked Blocks</div>

      <div className="mt-3">
        <select
          value=""
          onChange={(e) => {
            const blockId = e.target.value;
            if (!blockId) return;

            const linkedBlocks = [
              ...(((selectedBlock.data as any).linkedBlocks ?? []) as any[]),
            ];

            if (linkedBlocks.some((item: any) => item.blockId === blockId)) {
              return;
            }

            const sourceBlock = draft.blocks.find((item: any) => item.id === blockId);

            updateSelectedSummaryData({
              linkedBlocks: [
                ...linkedBlocks,
                {
                  id: makeClientId("summary_link"),
                  blockId,
                  label:
                    sourceBlock?.type === "form_field"
                      ? sourceBlock.data.label
                      : sourceBlock?.type === "option_button"
                        ? sourceBlock.data.heading
                        : sourceBlock?.label ?? "Linked Block",
                  show: true,
                },
              ],
            });
          }}
          className={inspectorInputClass()}
        >
          <option value="">Add linked block...</option>

          {draft.blocks
            .filter(
              (block: any) =>
                block.id !== selectedBlock.id &&
                (block.type === "form_field" ||
                  block.type === "option_button"),
            )
            .map((sourceBlock: any) => (
              <option key={sourceBlock.id} value={sourceBlock.id}>
                {sourceBlock.type === "form_field"
                  ? sourceBlock.data.label || "Input Field"
                  : sourceBlock.type === "option_button"
                    ? sourceBlock.data.heading || "Option Button"
                    : sourceBlock.label}
              </option>
            ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {(((selectedBlock.data as any).linkedBlocks ?? []) as any[]).map(
          (item: any, index: number) => {
            const sourceBlock = draft.blocks.find(
              (block: any) => block.id === item.blockId,
            );

            return (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-neutral-700">
                    {sourceBlock?.type === "form_field"
                      ? "Input Field"
                      : sourceBlock?.type === "option_button"
                        ? "Option Button"
                        : "Missing Block"}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={toolSetButtonClass("front")}
                      onClick={() => {
                        const linkedBlocks = [
                          ...(((selectedBlock.data as any).linkedBlocks ??
                            []) as any[]),
                        ];
                        if (index <= 0) return;

                        [linkedBlocks[index - 1], linkedBlocks[index]] = [
                          linkedBlocks[index],
                          linkedBlocks[index - 1],
                        ];

                        updateSelectedSummaryData({ linkedBlocks });
                      }}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      className={toolSetButtonClass("front")}
                      onClick={() => {
                        const linkedBlocks = [
                          ...(((selectedBlock.data as any).linkedBlocks ??
                            []) as any[]),
                        ];
                        if (index >= linkedBlocks.length - 1) return;

                        [linkedBlocks[index], linkedBlocks[index + 1]] = [
                          linkedBlocks[index + 1],
                          linkedBlocks[index],
                        ];

                        updateSelectedSummaryData({ linkedBlocks });
                      }}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100"
                      onClick={() =>
                        updateSelectedSummaryData({
                          linkedBlocks: (
                            ((selectedBlock.data as any).linkedBlocks ??
                              []) as any[]
                          ).filter((linkedItem) => linkedItem.id !== item.id),
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className={inspectorLabelClass()}>Display Label</div>
                  <input
                    type="text"
                    value={item.label ?? ""}
                    onChange={(e) =>
                      updateSelectedSummaryData({
                        linkedBlocks: (
                          ((selectedBlock.data as any).linkedBlocks ??
                            []) as any[]
                        ).map((linkedItem) =>
                          linkedItem.id === item.id
                            ? { ...linkedItem, label: e.target.value }
                            : linkedItem,
                        ),
                      })
                    }
                    className={inspectorInputClass()}
                  />
                </div>

                <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    checked={item.show !== false}
                    onChange={(e) =>
                      updateSelectedSummaryData({
                        linkedBlocks: (
                          ((selectedBlock.data as any).linkedBlocks ??
                            []) as any[]
                        ).map((linkedItem) =>
                          linkedItem.id === item.id
                            ? { ...linkedItem, show: e.target.checked }
                            : linkedItem,
                        ),
                      })
                    }
                  />
                  Show in summary
                </label>
              </div>
            );
          },
        )}
      </div>
    </div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <label className="flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={(selectedBlock.data as any).showDividers !== false}
          onChange={(e) =>
            updateSelectedSummaryData({ showDividers: e.target.checked })
          }
        />
        Show Dividers
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Divider Color</div>
        <input
          type="color"
          value={
            ((selectedBlock.data as any).dividerColor as string)?.startsWith("#")
              ? (selectedBlock.data as any).dividerColor
              : "#d1d5db"
          }
          onChange={(e) =>
            updateSelectedSummaryData({ dividerColor: e.target.value })
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>
    </div>
    </div>
  );
}