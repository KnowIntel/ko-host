// components/templates/TemplateDraftEditor.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";
import DesignLayoutEditor from "@/components/templates/DesignLayoutEditor";

type Props = {
  templateName?: string;
  designLayout?: string;
  templateKey?: string;
  submitLabel?: string;
  initialDraft: BuilderDraft;
  onSave?: (draft: BuilderDraft) => void | Promise<void>;
  onSubmit?: (draft: BuilderDraft) => Promise<void> | void;
  publishHref?: string;
  publishLabel?: string;
  onPublishClick?: () => void;
  onDraftChange?: (draft: BuilderDraft) => void;
  saveState?: "idle" | "saving" | "saved" | "error" | "signin-required";
  saveMessage?: string;
};

const AUTOSAVE_DELAY_MS = 10 * 60 * 1000;

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
  publishHref,
  publishLabel,
  onPublishClick,
  onDraftChange,
  saveState,
  saveMessage,
}: Props) {
  const resolvedTemplateName = templateName ?? templateKey ?? "";
  const resolvedDesignLayout = designLayout ?? "blank";

  const routeKey = useMemo(
    () => `${resolvedTemplateName}::${resolvedDesignLayout}`,
    [resolvedTemplateName, resolvedDesignLayout],
  );

  const [draft, setDraft] = useState<BuilderDraft>(() => cloneDraft(initialDraft));

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedAutosaveRef = useRef(false);

  useEffect(() => {
    setDraft(cloneDraft(initialDraft));
    hasMountedAutosaveRef.current = false;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }, [routeKey, initialDraft]);

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  useEffect(() => {
    void onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    if (!onSave) return;

    if (!hasMountedAutosaveRef.current) {
      hasMountedAutosaveRef.current = true;
      return;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      void onSave(draft);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [draft, onSave]);

  return (
    <div className="relative">
      <DesignLayoutEditor
        templateKey={resolvedTemplateName}
        designKey={resolvedDesignLayout}
        draft={draft}
        setDraft={setDraft}
        onSaveDraft={onSave}
        publishHref={publishHref}
        publishLabel={publishLabel}
        onPublishClick={() => {
          onPublishClick?.();
        }}
        saveState={saveState}
        saveMessage={saveMessage}
      />
    </div>
  );
}