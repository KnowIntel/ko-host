// components\templates\TemplateDraftEditor.tsx

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
const SAVED_STATE_RESET_MS = 2500;

function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBuilderDraft(value: unknown): value is BuilderDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as BuilderDraft).blocks),
  );
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
  const draftRef = useRef<BuilderDraft>(cloneDraft(initialDraft));

  const [localSaveState, setLocalSaveState] = useState<
    "idle" | "saving" | "saved" | "error" | "signin-required"
  >("idle");
  const [localSaveMessage, setLocalSaveMessage] = useState<string>("");

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedAutosaveRef = useRef(false);

  useEffect(() => {
    const nextDraft = cloneDraft(initialDraft);
    setDraft(nextDraft);
    draftRef.current = nextDraft;
    setLocalSaveState("idle");
    setLocalSaveMessage("");
    hasMountedAutosaveRef.current = false;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    if (saveResetTimerRef.current) {
      clearTimeout(saveResetTimerRef.current);
      saveResetTimerRef.current = null;
    }
  }, [routeKey, initialDraft]);

  useEffect(() => {
    draftRef.current = draft;
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  useEffect(() => {
    void onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      if (saveResetTimerRef.current) {
        clearTimeout(saveResetTimerRef.current);
      }
    };
  }, []);

  function resolveDraftForSave(nextDraft?: BuilderDraft) {
    if (isBuilderDraft(nextDraft)) {
      return cloneDraft(nextDraft);
    }

    return cloneDraft(draftRef.current);
  }

  async function runSave(
    nextDraft?: BuilderDraft,
    source: "manual" | "autosave" = "manual",
  ) {
    if (!onSave) return;

    if (saveResetTimerRef.current) {
      clearTimeout(saveResetTimerRef.current);
      saveResetTimerRef.current = null;
    }

    const draftToSave = resolveDraftForSave(nextDraft);

    try {
      setLocalSaveState("saving");

      await onSave(draftToSave);

      setLocalSaveState("saved");
      setLocalSaveMessage(source === "autosave" ? "Draft auto-saved." : "Draft saved.");

      saveResetTimerRef.current = setTimeout(() => {
        setLocalSaveState("idle");
        setLocalSaveMessage("");
      }, SAVED_STATE_RESET_MS);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save draft.";

      if (/unauthorized|sign in|signin|login|logged in/i.test(message)) {
        setLocalSaveState("signin-required");
        setLocalSaveMessage("Sign in to save your draft.");
      } else {
        setLocalSaveState("error");
        setLocalSaveMessage(message || "Failed to save draft.");
      }
    }
  }

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
      void runSave(draftRef.current, "autosave");
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [draft, onSave]);

  const effectiveSaveState =
    saveState && saveState !== "idle" ? saveState : localSaveState;

  const effectiveSaveMessage =
    saveMessage && saveMessage.trim().length > 0
      ? saveMessage
      : localSaveMessage;

  async function handleSaveDraft(nextDraft?: BuilderDraft) {
    const draftToSave = resolveDraftForSave(nextDraft);

    if (isBuilderDraft(nextDraft)) {
      setDraft(draftToSave);
      draftRef.current = draftToSave;
    }

    await runSave(draftToSave, "manual");
  }

  return (
    <div className="relative">
      <DesignLayoutEditor
        templateKey={resolvedTemplateName}
        designKey={resolvedDesignLayout}
        draft={draft}
        setDraft={setDraft}
        onSaveDraft={handleSaveDraft}
        publishHref={publishHref}
        publishLabel={publishLabel}
        onPublishClick={() => {
          onPublishClick?.();
        }}
        saveState={effectiveSaveState}
        saveMessage={effectiveSaveMessage}
      />
    </div>
  );
}