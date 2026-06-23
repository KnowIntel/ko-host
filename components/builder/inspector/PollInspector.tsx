"use client";

import type { RefObject } from "react";

/**
 * Poll inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "poll"
 */
type PollInspectorProps = {
  selectedBlock: any;
  draft: any;

  updateSelectedBlock: any;
  makeClientId: (prefix: string) => string;

  pollQuestionInputRef: RefObject<HTMLTextAreaElement | null>;
  pollOptionInputRefs: RefObject<Record<string, HTMLInputElement | null>>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function PollInspector({
  selectedBlock,
  draft,
  updateSelectedBlock,
  makeClientId,
  pollQuestionInputRef,
  pollOptionInputRefs,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
}: PollInspectorProps) {
  return (
    <div id="inspector-poll" className={inspectorCardClass()}>
      {/* Poll */}
                    <div className={inspectorLabelClass()}>Poll</div>

                    <div>
                      <div className={inspectorLabelClass()}>Question</div>
                      <textarea
                        ref={pollQuestionInputRef}
                        value={selectedBlock.data.question}
                        onChange={(e) =>
                          updateSelectedBlock((block: any) =>
                            block.type !== "poll"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    question: e.target.value,
                                  },
                                },
                          )
                        }
                        className={inspectorTextareaClass()}
                      />
                    </div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Linked Highlight</div>
                      <select
                        value={selectedBlock.data.sourceBlockId ?? ""}
                        onChange={(e) =>
                          updateSelectedBlock((block: any) =>
                            block.type !== "poll"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    sourceBlockId: e.target.value,
                                    sourceType: e.target.value ? "highlight" : undefined,
                                  },
                                },
                          )
                        }
                        className={inspectorInputClass()}
                      >
                        <option value="">Select highlight block</option>
                        {draft.blocks
                          .filter((block: any) => block.type === "highlight")
                          .map((highlightBlock: any) => (
                            <option key={highlightBlock.id} value={highlightBlock.id}>
                              {highlightBlock.label || highlightBlock.data.heading || "Highlight"}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedBlock.data.options.map((option: any) => (
                        <div
                          key={option.id}
                          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                        >
                          <input
                            ref={(el) => {
                              pollOptionInputRefs.current[option.id] = el;
                            }}
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              updateSelectedBlock((block: any) =>
                                block.type !== "poll"
                                  ? block
                                  : {
                                      ...block,
                                      data: {
                                        ...block.data,
                                        options: block.data.options.map((item: any) =>
                                          item.id === option.id
                                            ? { ...item, text: e.target.value }
                                            : item,
                                        ),
                                      },
                                    },
                              )
                            }
                            className={inspectorInputClass()}
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        className={toolSetButtonClass("front")}
                        onClick={() =>
                          updateSelectedBlock((block: any) =>
                            block.type !== "poll"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    options: [
                                      ...block.data.options,
                                      {
                                        id: makeClientId("opt"),
                                        text: "New option",
                                      },
                                    ],
                                  },
                                },
                          )
                        }
                      >
                        Add Option
                      </button>
                    </div>
    </div>
  );
}