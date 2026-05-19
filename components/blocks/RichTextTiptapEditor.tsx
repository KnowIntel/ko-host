"use client";

import { Extension } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect } from "react";

type PasteMode = "keep" | "match" | "plain";

type RichTextTiptapEditorProps = {
  html: string;
  pasteMode?: PasteMode;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onChange: (payload: {
    contentJson: unknown;
    contentHtml: string;
    plainText: string;
  }) => void;
};

const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
});

function cleanPastedHtml(html: string, pasteMode: PasteMode) {
  if (pasteMode === "plain") return "";

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  wrapper.querySelectorAll("script, style, iframe, object, embed, meta, link").forEach((node) => {
    node.remove();
  });

  wrapper.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();

      if (name.startsWith("on") || name === "class" || name === "id") {
        node.removeAttribute(attr.name);
      }

      if (pasteMode === "match" && name === "style") {
        node.removeAttribute(attr.name);
      }
    });

    if (node instanceof HTMLAnchorElement) {
      const href = node.getAttribute("href") ?? "";

      if (!/^https?:\/\//i.test(href) && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
        node.removeAttribute("href");
      } else {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    }
  });

  return wrapper.innerHTML;
}

export default function RichTextTiptapEditor({
  html,
  pasteMode = "match",
  className,
  style,
  placeholder = "Write something here...",
  onChange,
}: RichTextTiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: html || `<p>${placeholder}</p>`,
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] min-w-0 max-w-full cursor-text break-words outline-none [&_p]:my-0 [&_p]:leading-normal [&_ul]:my-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0 [&_li]:pl-1 [&_li_p]:m-0 [&_li_p]:inline [&_a]:break-words [&_a]:underline [&_img]:h-auto [&_img]:max-w-full",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain") ?? "";
        const pastedHtml = event.clipboardData?.getData("text/html") ?? "";

        if (!text && !pastedHtml) return false;

        event.preventDefault();

        if (pasteMode === "plain") {
          view.dispatch(view.state.tr.insertText(text));
          return true;
        }

        if (pastedHtml.trim()) {
          const cleaned = cleanPastedHtml(pastedHtml, pasteMode);
          editor?.commands.insertContent(cleaned);
          return true;
        }

        view.dispatch(view.state.tr.insertText(text));
        return true;
      },
    },
    onUpdate({ editor }) {
      onChange({
        contentJson: editor.getJSON(),
        contentHtml: editor.getHTML(),
        plainText: editor.getText().trim(),
      });
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;

    const currentHtml = editor.getHTML();
    const nextHtml = html || `<p>${placeholder}</p>`;

    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, { emitUpdate: false });
    }
  }, [editor, html, placeholder]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-black"
            defaultValue="paragraph"
            onChange={(e) => {
              const value = e.target.value;

              if (value === "paragraph") {
                editor.chain().focus().setParagraph().run();
              }

              if (value === "h1") {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }

              if (value === "h2") {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }

              if (value === "h3") {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }
            }}
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>

          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().toggleBold().run()}>
            B
          </button>
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().toggleItalic().run()}>
            I
          </button>
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().toggleUnderline().run()}>
            U
          </button>
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().toggleStrike().run()}>
            S
          </button>

          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            Left
          </button>
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            Center
          </button>
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            Right
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-black"
            defaultValue="16px"
            onChange={(e) =>
              editor.chain().focus().setMark("textStyle", { fontSize: e.target.value }).run()
            }
          >
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
            <option value="40px">40px</option>
          </select>

          <input
            type="color"
            className="h-7 w-10 rounded border border-neutral-300 bg-white"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />

          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            Bulleted List
          </button>

          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            Numbered List
          </button>

          <button
            type="button"
            className="rounded border px-2 py-1 text-xs"
            onClick={() => {
              const url = window.prompt("Enter link URL");
              if (!url) return;
              editor.chain().focus().setLink({ href: url }).run();
            }}
          >
            Link
          </button>

          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
            Clear Formatting
          </button>
        </div>
      </div>

      <div
        className={`${className ?? ""} max-h-[320px] overflow-y-auto`}
        style={style}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}