"use client";

import { useEffect, useMemo, useState } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";

import DesignLayoutEditor from "@/components/templates/DesignLayoutEditor";

type Props = {
  templateName?: string;
  designLayout?: string;
  templateKey?: string;
  submitLabel?: string;
  initialDraft: BuilderDraft;
  onSave?: (draft: BuilderDraft) => void;
  onSubmit?: (draft: BuilderDraft) => Promise<void> | void;
};

function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default function TemplateDraftEditor({
  templateName,
  designLayout,
  templateKey,
  submitLabel: _submitLabel,
  initialDraft,
  onSave,
  onSubmit,
}: Props) {
  const resolvedTemplateName = templateName ?? templateKey ?? "";
  const resolvedDesignLayout = designLayout ?? "blank";

  const routeKey = useMemo(
    () => `${resolvedTemplateName}::${resolvedDesignLayout}`,
    [resolvedTemplateName, resolvedDesignLayout],
  );

  const [draft, setDraft] = useState<BuilderDraft>(() => cloneDraft(initialDraft));

  useEffect(() => {
    setDraft(cloneDraft(initialDraft));
  }, [routeKey, initialDraft]);

  useEffect(() => {
    if (onSave) {
      onSave(draft);
    }
  }, [draft, onSave]);

  useEffect(() => {
    void onSubmit;
  }, [onSubmit]);

  return (
    <div className="relative">
      <DesignLayoutEditor
        key={routeKey}
        templateKey={resolvedTemplateName}
        designKey={resolvedDesignLayout}
        draft={draft}
        setDraft={setDraft}
      />
    </div>
  );
}