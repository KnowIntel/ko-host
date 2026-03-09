"use client";

import { useEffect, useState } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";
import ShowcaseEditor from "@/components/templates/design-editors/showcase/ShowcaseEditor";
import FestiveEditor from "@/components/templates/design-editors/festive/FestiveEditor";
import {
  createDefaultCountdownBlock,
  createDefaultHeroButtonBlock,
  createDefaultLinksBlock,
  getCountdownBlock,
  getHeroButtonBlock,
  getLinksBlock,
} from "@/components/templates/design-editors/shared/editorUtils";

type Props = {
  templateKey: string;
  designKey?: string;
  initialDraft: BuilderDraft;
  submitLabel?: string;
};

export default function TemplateDraftEditor({
  templateKey,
  designKey = "minimal",
  initialDraft,
  submitLabel = "Continue",
}: Props) {
  const [draft, setDraft] = useState<BuilderDraft>(() => {
    const blocks = Array.isArray(initialDraft.blocks) ? [...initialDraft.blocks] : [];

    if (!getLinksBlock(blocks)) {
      blocks.push(createDefaultLinksBlock());
    }

    if (!getHeroButtonBlock(blocks)) {
      blocks.push(
        createDefaultHeroButtonBlock(
          designKey === "gallery" ? "Shop Now" : "View Gallery",
        ),
      );
    }

    if (designKey === "gallery" && !getCountdownBlock(blocks)) {
      blocks.push(createDefaultCountdownBlock());
    }

    return {
      ...initialDraft,
      title:
        initialDraft.title ||
        (designKey === "gallery" ? "Celebrate the Season" : "Beautiful Art"),
      subtitle:
        initialDraft.subtitle ||
        (designKey === "gallery" ? "Holiday Sale" : "by a Freelancer"),
      subtext:
        initialDraft.subtext ||
        (designKey === "gallery"
          ? "Huge discounts on gifts for the whole family!"
          : ""),
      countdownLabel: initialDraft.countdownLabel || "Sale Ends In:",
      blocks,
    };
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "kht:preview-draft",
        JSON.stringify({
          templateKey,
          designKey,
          draft,
          savedAt: Date.now(),
        }),
      );
    } catch {
      // ignore
    }
  }, [designKey, draft, templateKey]);

  if (designKey === "gallery") {
    return (
      <FestiveEditor
        templateKey={templateKey}
        designKey={designKey}
        draft={draft}
        setDraft={setDraft}
        submitLabel={submitLabel}
      />
    );
  }

  return (
    <ShowcaseEditor
      templateKey={templateKey}
      designKey={designKey}
      draft={draft}
      setDraft={setDraft}
      submitLabel={submitLabel}
    />
  );
}