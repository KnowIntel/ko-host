"use client";

import type { RefObject } from "react";

type RichTextInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  RichTextTiptapEditor: any;

  richTextEditorRef: RefObject<HTMLDivElement | null>;
  setIsRichTextEditorEmpty: (value: boolean) => void;

  normalizeRichTextHtml: (html: string) => string;
  isRichTextHtmlEmpty: (html: string) => boolean;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;
};

export function RichTextInspector({
  selectedBlock,
  updateSelectedBlock,
  RichTextTiptapEditor,
  richTextEditorRef,
  setIsRichTextEditorEmpty,
  normalizeRichTextHtml,
  isRichTextHtmlEmpty,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
}: RichTextInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Rich Text</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Paste Mode</div>
        <select
          value={selectedBlock.data.pasteMode ?? "match"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "rich_text"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      pasteMode: e.target.value as "match" | "keep" | "plain",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="match">Match Site Style</option>
          <option value="keep">Keep Formatting</option>
          <option value="plain">Plain Text</option>
        </select>

        <div className="mt-1 text-xs text-neutral-500">
          Recommended: Match Site Style keeps structure while removing messy
          pasted styling.
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Content</div>

        <div className="relative">
          <RichTextTiptapEditor
            html={
              typeof selectedBlock.data.contentHtml === "string"
                ? selectedBlock.data.contentHtml
                : selectedBlock.data.content ?? ""
            }
            pasteMode={selectedBlock.data.pasteMode ?? "match"}
            className={`${inspectorTextareaClass()} min-h-[220px] relative z-20 min-w-0 max-w-full cursor-text break-words`}
            style={{
              textAlign: selectedBlock.data.style?.align ?? "left",
            }}
            onChange={({ contentJson, contentHtml, plainText }: any) => {
              const normalized = normalizeRichTextHtml(contentHtml);

              setIsRichTextEditorEmpty(isRichTextHtmlEmpty(normalized));

              updateSelectedBlock((block: any) =>
                block.type !== "rich_text"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        content: normalized,
                        contentHtml: normalized,
                        contentJson,
                        plainText,
                      },
                    },
              );
            }}
          />
        </div>

        <div className="mt-2">
          <div className="text-xs text-neutral-500">
            Use the toolbar above to format selected text, create lists, and add
            inline links.
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-black hover:bg-neutral-100"
              onClick={() => {
                if (richTextEditorRef.current) {
                  richTextEditorRef.current.innerHTML = "";
                  richTextEditorRef.current.focus();
                }

                setIsRichTextEditorEmpty(true);

                updateSelectedBlock((block: any) =>
                  block.type !== "rich_text"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          content: "",
                          contentHtml: "",
                          contentJson: null,
                          plainText: "",
                          listType: "none",
                          linkUrl: "",
                          style: {
                            ...(block.data.style ?? {}),
                            bold: false,
                            italic: false,
                            underline: false,
                            strike: false,
                          },
                        },
                      },
                );
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}