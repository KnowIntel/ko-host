"use client";

import { useEffect, useMemo, useState } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";

import DesignLayoutEditor from "@/components/templates/DesignLayoutEditor";

type Props = {
  templateName: string;
  designLayout: string;
  initialDraft: BuilderDraft;
  onSave?: (draft: BuilderDraft) => void;
};

function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default function TemplateDraftEditor({
  templateName,
  designLayout,
  initialDraft,
  onSave,
}: Props) {
  const routeKey = useMemo(
    () => `${templateName}::${designLayout}`,
    [templateName, designLayout],
  );

  const [draft, setDraft] = useState<BuilderDraft>(() => cloneDraft(initialDraft));

  useEffect(() => {
    setDraft(cloneDraft(initialDraft));
  }, [routeKey, initialDraft]);

  return (
    <div className="relative">
      <DesignLayoutEditor
        key={routeKey}
        templateKey={templateName}
        designKey={designLayout}
        draft={draft}
        setDraft={setDraft}
      />
    </div>
  );
}