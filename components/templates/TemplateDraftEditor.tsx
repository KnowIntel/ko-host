"use client";

import { useState } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";

import DesignLayoutEditor from "@/components/templates/DesignLayoutEditor";

import BlankEditor from "@/components/templates/design-editors/blank/BlankEditor";
import FestiveEditor from "@/components/templates/design-editors/festive/FestiveEditor";
import ShowcaseEditor from "@/components/templates/design-editors/showcase/ShowcaseEditor";
import ModernEditor from "@/components/templates/design-editors/modern/ModernEditor";
import ElegantEditor from "@/components/templates/design-editors/elegant/ElegantEditor";
import BusinessEditor from "@/components/templates/design-editors/business/BusinessEditor";

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
  /* ---------------------------------------- */
  /* Main live draft state                     */
  /* ---------------------------------------- */

  const [draft, setDraft] = useState<BuilderDraft>(initialDraft);

  /* ---------------------------------------- */
  /* Safe toggle                               */
  /* ---------------------------------------- */
  /* Flip to false for instant fallback. */

  const USE_MASTER_EDITOR = true;

  /* ---------------------------------------- */
  /* Preview pipeline                          */
  /* ---------------------------------------- */

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

  /* ---------------------------------------- */
  /* Legacy fallback editor                    */
  /* ---------------------------------------- */

  function renderLegacyEditor() {
    const sharedProps = {
      draft,
      setDraft,
      templateKey: templateName,
      designKey: designLayout,
    };

    switch (designLayout) {
      case "blank":
        return <BlankEditor {...sharedProps} />;

      case "festive":
        return <FestiveEditor {...sharedProps} />;

      case "showcase":
        return <ShowcaseEditor {...sharedProps} />;

      case "modern":
        return <ModernEditor {...sharedProps} />;

      case "elegant":
        return <ElegantEditor {...sharedProps} />;

      case "business":
        return <BusinessEditor {...sharedProps} />;

      default:
        return <BlankEditor {...sharedProps} />;
    }
  }

  return (
    <div className="relative">
      <div className="pb-28">
        {USE_MASTER_EDITOR ? (
          <DesignLayoutEditor
            templateKey={templateName}
            designKey={designLayout}
            draft={draft}
            setDraft={setDraft}
          />
        ) : (
          renderLegacyEditor()
        )}
      </div>

      {/* Frozen bottom action bar */}
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