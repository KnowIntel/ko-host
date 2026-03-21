"use client";

import { useEffect, useRef, useState } from "react";

import type { BuilderDraft } from "@/lib/templates/builder";
import { cloneDraft } from "../utils";

type UseDraftHistoryArgs = {
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
};

export function useDraftHistory({ draft, setDraft }: UseDraftHistoryArgs) {
  const [undoStack, setUndoStack] = useState<BuilderDraft[]>([]);
  const [redoStack, setRedoStack] = useState<BuilderDraft[]>([]);

  const isHistoryActionRef = useRef(false);
  const lastDraftRef = useRef<BuilderDraft>(cloneDraft(draft));

  useEffect(() => {
    if (isHistoryActionRef.current) {
      isHistoryActionRef.current = false;
      lastDraftRef.current = cloneDraft(draft);
      return;
    }

    const previous = JSON.stringify(lastDraftRef.current);
    const current = JSON.stringify(draft);

    if (previous !== current) {
      setUndoStack((prev) => [...prev, cloneDraft(lastDraftRef.current)]);
      setRedoStack([]);
      lastDraftRef.current = cloneDraft(draft);
    }
  }, [draft]);

  function handleUndo() {
    if (!undoStack.length) return;

    const previousDraft = undoStack[undoStack.length - 1];

    isHistoryActionRef.current = true;
    setRedoStack((prevRedo) => [...prevRedo, cloneDraft(draft)]);
    setUndoStack((prevUndo) => prevUndo.slice(0, -1));
    setDraft(cloneDraft(previousDraft));
  }

  function handleRedo() {
    if (!redoStack.length) return;

    const nextDraft = redoStack[redoStack.length - 1];

    isHistoryActionRef.current = true;
    setUndoStack((prevUndo) => [...prevUndo, cloneDraft(draft)]);
    setRedoStack((prevRedo) => prevRedo.slice(0, -1));
    setDraft(cloneDraft(nextDraft));
  }

  return {
    undoStack,
    redoStack,
    handleUndo,
    handleRedo,
    isHistoryActionRef,
    lastDraftRef,
    setUndoStack,
    setRedoStack,
  };
}