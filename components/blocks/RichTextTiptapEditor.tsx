"use client";

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
          "min-h-full min-w-0 max-w-full cursor-text break-words outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-1 [&_a]:break-words [&_img]:max-w-full [&_img]:h-auto",
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

    const currentHtml = editor.getHTML();
    const nextHtml = html || `<p>${placeholder}</p>`;

    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, { emitUpdate: false });
    }
  }, [editor, html, placeholder]);

  return (
    <div className={className} style={style}>
      <EditorContent editor={editor} />
    </div>
  );
}