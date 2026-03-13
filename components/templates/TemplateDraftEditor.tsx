"use client";

import { useState } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";

import DesignLayoutEditor from "@/components/templates/DesignLayoutEditor";

type Props = {
  templateName: string;
  designLayout: string;
  initialDraft: BuilderDraft;
  onSave?: (draft: BuilderDraft) => void;
};

type PreviewPayload = {
  templateKey?: string;
  designKey?: string;
  draft?: BuilderDraft;
};

export default function TemplateDraftEditor({
  templateName,
  designLayout,
  initialDraft,
  onSave,
}: Props) {

  const [draft, setDraft] = useState<BuilderDraft>(initialDraft);

  function buildPreviewPayload(): PreviewPayload {
    return {
      templateKey: templateName,
      designKey: designLayout,
      draft,
    };
  }

  function persistPreviewDraft() {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      "kht:preview-draft",
      JSON.stringify(buildPreviewPayload()),
    );
  }

  function handleSave() {
    persistPreviewDraft();

    if (!onSave) return;
    onSave(draft);
  }

  function handleOpenPreview() {
    persistPreviewDraft();
    window.open("/preview/draft", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="relative">

      <div className="pb-28">

        <DesignLayoutEditor
          templateKey={templateName}
          designKey={designLayout}
          draft={draft}
          setDraft={setDraft}
        />

      </div>

      <div className="sticky bottom-0 z-40 mt-6">
        <div className="rounded-[24px] border border-neutral-200 bg-white/95 px-4 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur">

          <div className="flex flex-wrap items-center justify-end gap-3">

            <button
              type="button"
              onClick={handleOpenPreview}
              className="rounded-xl border border-neutral-300 bg-white px-6 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Open Preview
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-black px-6 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Save Draft
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}