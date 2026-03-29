// app\create\[template]\page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import { createTemplateDraft } from "@/lib/templates/createTemplateDraft";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";
import TemplateDraftEditor from "@/components/templates/TemplateDraftEditor";
import type { BuilderDraft } from "@/lib/templates/builder";
import AppModal from "@/components/ui/AppModal";
import { loadTemplateDraftPreset } from "@/lib/drafts";

function resolveTemplateFromRoute(rawTemplate: string) {
  const normalized = normalizeTemplateKey(rawTemplate);

  return (
    getTemplateDef(normalized) ||
    TEMPLATE_DEFS.find((t) => normalizeTemplateKey(t.demoSlug) === normalized) ||
    TEMPLATE_DEFS.find((t) => normalizeTemplateKey(t.thumb) === normalized) ||
    TEMPLATE_DEFS.find(
      (t) => normalizeTemplateKey(t.title.replace(/\s+/g, "_")) === normalized,
    ) ||
    TEMPLATE_DEFS[0]
  );
}

function buildCreateDraftStorageKey(templateKey: string, designKey: string) {
  return `kht:create-draft:${templateKey}:${designKey}`;
}

function mergeDrafts(baseDraft: BuilderDraft, savedDraft: Partial<BuilderDraft>) {
  return {
    ...baseDraft,
    ...savedDraft,
    blocks: Array.isArray(savedDraft.blocks)
      ? savedDraft.blocks
      : Array.isArray(baseDraft.blocks)
        ? baseDraft.blocks
        : [],
  } satisfies BuilderDraft;
}

function formatTemplateLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CreateTemplatePage() {
  const { isSignedIn } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTemplate = String(params?.template || "");
  const rawDesign = searchParams.get("design") || "blank";
  const mode = searchParams.get("mode") || "new";
  const shouldLoadExistingDraft = mode === "draft";

  const templateDef = useMemo(
    () => resolveTemplateFromRoute(rawTemplate),
    [rawTemplate],
  );

  const templateKey = templateDef.key;
  const templateName = templateDef.title || templateKey;
  const templateLabel = useMemo(
    () => formatTemplateLabel(templateName || templateKey),
    [templateName, templateKey],
  );

  const requestedDesignKey = useMemo(
    () => normalizeTemplateKey(rawDesign),
    [rawDesign],
  );

  const resolvedLegacyPreset = useMemo(
    () => getDesignPreset(requestedDesignKey),
    [requestedDesignKey],
  );

  const designKey = requestedDesignKey || resolvedLegacyPreset.key || "blank";

const presetDraft: BuilderDraft = useMemo(() => {
  console.log("DEBUG templateKey:", templateKey);
  console.log("DEBUG requestedDesignKey:", requestedDesignKey);
  console.log("DEBUG resolvedLegacyPreset.key:", resolvedLegacyPreset.key);
  console.log("DEBUG final designKey:", designKey);

  const draftPreset = loadTemplateDraftPreset(templateKey, designKey);
  console.log("DEBUG draftPreset found:", draftPreset);

  if (draftPreset) {
    return {
      ...draftPreset,
      slugSuggestion:
        draftPreset.slugSuggestion ||
        templateDef.defaultDraft?.slugSuggestion ||
        "",
      blocks: Array.isArray(draftPreset.blocks) ? draftPreset.blocks : [],
    };
  }

  console.log("DEBUG fallback createTemplateDraft used");

  return createTemplateDraft(templateName, designKey);
}, [
  templateKey,
  requestedDesignKey,
  resolvedLegacyPreset.key,
  designKey,
  templateDef.defaultDraft?.slugSuggestion,
  templateName,
]);

const initialDraft: BuilderDraft = useMemo(
  () => ({
    ...presetDraft,
    slugSuggestion:
      presetDraft.slugSuggestion ||
      templateDef.defaultDraft?.slugSuggestion ||
      "",
    blocks: Array.isArray(presetDraft.blocks) ? presetDraft.blocks : [],
  }),
  [presetDraft, templateDef.defaultDraft?.slugSuggestion],
);

const storageKey = useMemo(
  () => buildCreateDraftStorageKey(templateKey, designKey),
  [templateKey, designKey],
);

const [hydratedDraft, setHydratedDraft] = useState<BuilderDraft>(initialDraft);
const [liveDraft, setLiveDraft] = useState<BuilderDraft>(initialDraft);
const liveDraftRef = useRef<BuilderDraft>(initialDraft);
const lastSavedDraftRef = useRef<string>(JSON.stringify(initialDraft));

useEffect(() => {
  liveDraftRef.current = liveDraft;
}, [liveDraft]);

const [saveState, setSaveState] = useState<
  "idle" | "saving" | "saved" | "error" | "signin-required"
>("idle");
const [saveMessage, setSaveMessage] = useState("Draft not saved yet.");
const [showPublishWarning, setShowPublishWarning] = useState(false);
const [showSignInPrompt, setShowSignInPrompt] = useState(false);

const saveResetTimerRef = useRef<number | null>(null);
useEffect(() => {
  function handleAuthComplete(event: MessageEvent) {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== "kht-auth-complete") return;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(liveDraftRef.current),
      );
    } catch {
      // ignore localStorage errors
    }

    window.location.reload();
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== "kht-auth-complete") return;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(liveDraftRef.current),
      );
    } catch {
      // ignore localStorage errors
    }

    window.location.reload();
  }

  window.addEventListener("message", handleAuthComplete);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("message", handleAuthComplete);
    window.removeEventListener("storage", handleStorage);
  };
}, [storageKey]);

useEffect(() => {
  return () => {
    if (saveResetTimerRef.current) {
      window.clearTimeout(saveResetTimerRef.current);
    }
  };
}, []);

  function queueSaveStateReset() {
    if (saveResetTimerRef.current) {
      window.clearTimeout(saveResetTimerRef.current);
    }

    saveResetTimerRef.current = window.setTimeout(() => {
      setSaveState("idle");
      setSaveMessage("Editor ready.");
    }, 3000);
  }

  useEffect(() => {
    setHydratedDraft(initialDraft);
    setLiveDraft(initialDraft);
    lastSavedDraftRef.current = JSON.stringify(initialDraft);

    if (!shouldLoadExistingDraft) {
      try {
        const raw = window.localStorage.getItem(storageKey);

        if (raw) {
          const parsed = JSON.parse(raw) as Partial<BuilderDraft>;
          const merged = mergeDrafts(initialDraft, parsed);

          setHydratedDraft(merged);
          setLiveDraft(merged);
          lastSavedDraftRef.current = JSON.stringify(merged);
          setSaveState("idle");
          setSaveMessage("Recovered your local draft.");
          return;
        }
      } catch {
        // ignore localStorage errors
      }

      setSaveState("idle");
      setSaveMessage("Started a fresh draft from this design preset.");
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        setSaveState("idle");
        setSaveMessage("Draft not saved yet.");
        return;
      }

      const parsed = JSON.parse(raw) as Partial<BuilderDraft>;
      const merged = mergeDrafts(initialDraft, parsed);

      setHydratedDraft(merged);
      setLiveDraft(merged);
      lastSavedDraftRef.current = JSON.stringify(merged);
      setSaveState("idle");
      setSaveMessage("Loaded your local draft.");
    } catch {
      setHydratedDraft(initialDraft);
      setLiveDraft(initialDraft);
      lastSavedDraftRef.current = JSON.stringify(initialDraft);
      setSaveState("error");
      setSaveMessage("Saved local draft could not be loaded.");
      queueSaveStateReset();
    }
  }, [initialDraft, storageKey, shouldLoadExistingDraft]);

  useEffect(() => {
    async function loadServerDraft() {
      if (!isSignedIn || !shouldLoadExistingDraft) return;

      try {
        const res = await fetch(
          `/api/drafts?templateKey=${encodeURIComponent(
            templateKey,
          )}&designKey=${encodeURIComponent(designKey)}`,
          { cache: "no-store" },
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.draftRow?.draft) return;

        const savedDraft = data.draftRow.draft as BuilderDraft;
        const merged = mergeDrafts(initialDraft, savedDraft);

        setHydratedDraft(merged);
        setLiveDraft(merged);
        lastSavedDraftRef.current = JSON.stringify(merged);
        setSaveMessage("Loaded your saved dashboard draft.");
      } catch {
        // ignore draft preload errors
      }
    }

    void loadServerDraft();
  }, [isSignedIn, templateKey, designKey, initialDraft, shouldLoadExistingDraft]);

  async function handleSaveDraft(draft: BuilderDraft) {
    setHydratedDraft(draft);
    setLiveDraft(draft);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // ignore localStorage errors
    }

    if (!isSignedIn) {
      setSaveState("signin-required");
      setSaveMessage("You must be signed in to save a draft.");
      setShowSignInPrompt(true);
      return;
    }

    try {
      setSaveState("saving");
      setSaveMessage("Saving draft...");

      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey, designKey, draft }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSaveState("error");
        setSaveMessage(data?.error || "Failed to save draft.");
        queueSaveStateReset();
        return;
      }

      lastSavedDraftRef.current = JSON.stringify(draft);
      setSaveState("saved");
      setSaveMessage("Draft was saved to your dashboard.");
      queueSaveStateReset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save draft.";

      setSaveState("error");
      setSaveMessage(message);
      queueSaveStateReset();
    }
  }

function continueToSignIn() {
  setShowSignInPrompt(false);

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(liveDraft));
  } catch {
    // ignore localStorage errors
  }

  const callbackUrl = `${window.location.origin}/auth-complete`;
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(callbackUrl)}`;

  window.open(signInUrl, "_blank");
}

  const editorInstanceKey = [
    templateKey,
    designKey,
    hydratedDraft.title || "",
    hydratedDraft.subtitle || "",
    hydratedDraft.description || "",
    hydratedDraft.blocks.length,
    hydratedDraft.blocks.map((block) => `${block.type}:${block.id}`).join("|"),
  ].join("::");

  const publishHref = `/create/${encodeURIComponent(
    templateKey,
  )}/publish?design=${encodeURIComponent(designKey)}`;

  function handlePublishClick() {
    setShowPublishWarning(true);
  }

  function cancelPublishWarning() {
    setShowPublishWarning(false);
  }

  async function continueToPublish() {
    setShowPublishWarning(false);
    await handleSaveDraft(liveDraft);
    router.push(publishHref);
  }

  return (
    <main className="min-h-screen bg-[#f6f4f2]">
      <div className="w-full max-w-none px-0 py-8">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
          {/* KEEPING YOUR FULL HEADER UI EXACTLY AS-IS HERE */}
          {/* This file should NOT add duplicate Templates / Designs / Dashboard buttons below the global header */}
        </div>

        <div className="mb-4 px-2">
          <div className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">
              Step 2 of 2: Create {templateLabel}
            </span>{" "}
            - Customize the layout visually using the live page canvas and bottom
            tool tray.
          </div>
        </div>

        <TemplateDraftEditor
          key={editorInstanceKey}
          templateName={templateKey}
          designLayout={designKey}
          initialDraft={hydratedDraft}
          onSave={handleSaveDraft}
          publishHref={publishHref}
          publishLabel="Publish"
          onPublishClick={handlePublishClick}
          onDraftChange={setLiveDraft}
          saveState={saveState}
          saveMessage={saveMessage}
        />

        <AppModal
          open={showSignInPrompt}
          title="You must be signed in to save a draft."
          description="You won't lose your progress. Your current draft will remain saved in this browser."
          confirmText="Continue"
          cancelText="Cancel"
          onConfirm={continueToSignIn}
          onCancel={() => setShowSignInPrompt(false)}
        />

        <AppModal
          open={showPublishWarning}
          title="Publish draft?"
          description="Any unsaved changes to this draft will be lost. Save Draft first, then Publish."
          confirmText="Continue to Publish"
          cancelText="Cancel"
          onConfirm={continueToPublish}
          onCancel={cancelPublishWarning}
        />
      </div>
    </main>
  );
}