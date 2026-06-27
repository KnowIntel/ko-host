"use client";

import type { RefObject } from "react";
import type {
  FaqStyleTarget,
  FaqTextTarget,
} from "@/components/builder/formatting/faqFormatting";

type FaqInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  makeClientId: (prefix: string) => string;

  faqTextTarget: FaqTextTarget;
  setFaqTextTarget: (target: FaqTextTarget) => void;

  faqStyleTarget: FaqStyleTarget;
  setFaqStyleTarget: (target: FaqStyleTarget) => void;

  faqQuestionInputRefs: RefObject<Record<string, HTMLInputElement | null>>;
  faqAnswerInputRefs: RefObject<Record<string, HTMLTextAreaElement | null>>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function FaqInspector({
  selectedBlock,
  updateSelectedBlock,
  makeClientId,

  faqTextTarget,
  setFaqTextTarget,
  faqStyleTarget,
  setFaqStyleTarget,

  faqQuestionInputRefs,
  faqAnswerInputRefs,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
}: FaqInspectorProps) {
  return (
    <div id="inspector-faq" className={inspectorCardClass()}>
      {/* FAQ */}
                    <div className={inspectorLabelClass()}>FAQ</div>

<div className={inspectorCardClass()}>
  <label className={inspectorLabelClass()}>Text Target</label>

  <select
    value={faqTextTarget}
    onChange={(e) =>
      setFaqTextTarget(e.target.value as FaqTextTarget)
    }
    className={inspectorInputClass()}
  >
    <option value="heading">Heading</option>
    <option value="question">Question</option>
    <option value="answer">Answer</option>
  </select>
</div>

<div className={inspectorCardClass()}>
  <label className={inspectorLabelClass()}>Style Target</label>

  <select
    value={faqStyleTarget}
    onChange={(e) =>
      setFaqStyleTarget(e.target.value as FaqStyleTarget)
    }
    className={inspectorInputClass()}
  >
    <option value="field">Field</option>
    <option value="block">Block</option>
  </select>
</div>

                    <div className="mt-4">
  <div className={inspectorLabelClass()}>Heading</div>
  <input
    type="text"
    value={(selectedBlock.data as any).heading ?? "FAQs"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "faq"
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
    placeholder="FAQs"
  />
</div>

                    <div className="mt-4">
  <div className={inspectorLabelClass()}>FAQ Behavior</div>

  <select
    value={(selectedBlock.data as any).behavior ?? "always-open"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "faq"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                behavior: e.target.value as
                  | "always-open"
                  | "accordion"
                  | "accordion-single",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="always-open">Always Open</option>
    <option value="accordion">Collapse / Expand</option>
    <option value="accordion-single">Only One Open at a Time</option>
  </select>
</div>

<div className="mt-4">
  <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
    <input
      type="checkbox"
      checked={(selectedBlock.data as any).showIcons !== false}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "faq"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  showIcons: e.target.checked,
                },
              },
        )
      }
    />
    Show Chevron Icons
  </label>
</div>

                    <div className="mt-4 space-y-3">
                      {selectedBlock.data.items.map((faqItem: any) => (
                        <div
                          key={faqItem.id}
                          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                        >
                          <div className={inspectorLabelClass()}>Question</div>
                          <input
                            ref={(el) => {
                              faqQuestionInputRefs.current[faqItem.id] = el;
                            }}
                            type="text"
                            value={faqItem.question}
                            onChange={(e) =>
                              updateSelectedBlock((block: any) =>
                                block.type !== "faq"
                                  ? block
                                  : {
                                      ...block,
                                      data: {
                                        ...block.data,
                                        items: block.data.items.map((item: any) =>
                                          item.id === faqItem.id
                                            ? {
                                                ...item,
                                                question: e.target.value,
                                              }
                                            : item,
                                        ),
                                      },
                                    },
                              )
                            }
                            className={inspectorInputClass()}
                          />

                          <div className="mt-4">
                            <div className={inspectorLabelClass()}>Answer</div>
                            <textarea
                              ref={(el) => {
                                faqAnswerInputRefs.current[faqItem.id] = el;
                              }}
                              value={faqItem.answer}
                              onChange={(e) =>
                                updateSelectedBlock((block: any) =>
                                  block.type !== "faq"
                                    ? block
                                    : {
                                        ...block,
                                        data: {
                                          ...block.data,
                                          items: block.data.items.map((item: any) =>
                                            item.id === faqItem.id
                                              ? {
                                                  ...item,
                                                  answer: e.target.value,
                                                }
                                              : item,
                                          ),
                                        },
                                      },
                                )
                              }
                              className={inspectorTextareaClass()}
                            />
                          </div>

                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              className={toolSetButtonClass("remove")}
                              onClick={() =>
                                updateSelectedBlock((block: any) =>
                                  block.type !== "faq"
                                    ? block
                                    : {
                                        ...block,
                                        data: {
                                          ...block.data,
                                          items:
                                            block.data.items.length > 1
                                              ? block.data.items.filter(
                                                  (item: any) =>
                                                    item.id !== faqItem.id,
                                                )
                                              : block.data.items,
                                        },
                                      },
                                )
                              }
                              title="Remove FAQ item"
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
                            block.type !== "faq"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    items: [
                                      ...block.data.items,
                                      {
                                        id: makeClientId("faq"),
                                        question: "Question",
                                        answer: "Answer",
                                      },
                                    ],
                                  },
                                },
                          )
                        }
                      >
                        Add FAQ Item
                      </button>
                    </div>
    </div>
  );
}