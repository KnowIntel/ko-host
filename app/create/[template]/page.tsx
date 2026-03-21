// app/create/[template]/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import { getTemplateLayoutRegistry } from "@/lib/templates/layout-presets/layoutRegistry";
import { createDraftFromLayoutDefinition } from "@/lib/templates/layout-presets/layoutToDraft";
import { createTemplateDraft } from "@/lib/templates/createTemplateDraft";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";
import TemplateDraftEditor from "@/components/templates/TemplateDraftEditor";
import type { BuilderDraft } from "@/lib/templates/builder";

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

function badgeClassName(badge?: "Popular" | "New" | "Recommended" | null) {
  if (badge === "Popular") return "bg-neutral-950 text-white";
  if (badge === "New") return "bg-cyan-700 text-white";
  if (badge === "Recommended") return "bg-emerald-700 text-white";
  return "bg-neutral-200 text-neutral-800";
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

  const layoutRegistry = useMemo(
    () => getTemplateLayoutRegistry(templateKey),
    [templateKey],
  );

  const migratedLayout = useMemo(
    () =>
      layoutRegistry?.layouts.find(
        (layout) => normalizeTemplateKey(layout.designKey) === requestedDesignKey,
      ) ?? null,
    [layoutRegistry, requestedDesignKey],
  );

  const resolvedLegacyPreset = useMemo(
    () => getDesignPreset(requestedDesignKey),
    [requestedDesignKey],
  );

  const designKey = migratedLayout
    ? migratedLayout.designKey
    : resolvedLegacyPreset.key;

  const designLabel = migratedLayout
    ? migratedLayout.card.label
    : resolvedLegacyPreset.label;

  const designBadge: "Popular" | "New" | "Recommended" | null = migratedLayout
    ? migratedLayout.recommended
      ? "Recommended"
      : null
    : resolvedLegacyPreset.badge ?? null;

  const presetDraft: BuilderDraft = useMemo(() => {
    return migratedLayout
      ? createDraftFromLayoutDefinition({
          templateKey,
          layout: migratedLayout,
          slugSuggestion: templateDef.defaultDraft?.slugSuggestion || "",
        })
      : createTemplateDraft(templateName, designKey);
  }, [
    migratedLayout,
    templateKey,
    templateDef.defaultDraft?.slugSuggestion,
    templateName,
    designKey,
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
  const lastSavedDraftRef = useRef<string>(JSON.stringify(initialDraft));

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error" | "signin-required"
  >("idle");

  const [saveMessage, setSaveMessage] = useState("Draft not saved yet.");
  const [showPublishWarning, setShowPublishWarning] = useState(false);

  const saveResetTimerRef = useRef<number | null>(null);

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
  }, [initialDraft, storageKey]);

  useEffect(() => {
    async function loadServerDraft() {
      if (!isSignedIn) return;

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
      } catch {}
    }

    void loadServerDraft();
  }, [isSignedIn, templateKey, designKey, initialDraft]);

  async function handleSaveDraft(draft: BuilderDraft) {
    setHydratedDraft(draft);
    setLiveDraft(draft);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {}

    if (!isSignedIn) {
      setSaveState("signin-required");
      setSaveMessage("In order to save, you must be signed in.");
      window.open("/sign-in", "_blank", "noopener,noreferrer");
      queueSaveStateReset();
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

  function continueToPublish() {
    setShowPublishWarning(false);
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

        {showPublishWarning ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
            <div className="w-full max-w-none px-0 py-8">
              <div className="text-lg font-semibold text-neutral-950">
                Publish draft?
              </div>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Any unsaved changes to this draft will be lost. Save Draft first,
                then Publish.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelPublishWarning}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={continueToPublish}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Continue to Publish
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}