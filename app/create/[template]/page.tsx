// app\create\[template]\page.tsx
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
      setSaveState("idle");
      setSaveMessage("Loaded your local draft.");
    } catch {
      setHydratedDraft(initialDraft);
      setLiveDraft(initialDraft);
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
          {
            cache: "no-store",
          },
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.draftRow?.draft) {
          return;
        }

        const savedDraft = data.draftRow.draft as BuilderDraft;
        const merged = mergeDrafts(initialDraft, savedDraft);

        setHydratedDraft(merged);
        setLiveDraft(merged);
        lastSavedDraftRef.current = JSON.stringify(merged);
        setSaveState("idle");
        setSaveMessage("Loaded your saved dashboard draft.");
      } catch {
        // keep current local/editor state if server draft load fails
      }
    }

    void loadServerDraft();
  }, [isSignedIn, templateKey, designKey, initialDraft]);

  async function handleSaveDraft(draft: BuilderDraft) {
    setHydratedDraft(draft);
    setLiveDraft(draft);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // local fallback failure should not block server save attempts
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateKey,
          designKey,
          draft,
        }),
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
  const confirmed = window.confirm(
    'Any unsaved changes to this draft will be lost. Click "Cancel" to stay here and click "Save Draft" first, then Publish. Click "OK" to continue to Publish anyway.',
  );

  if (!confirmed) {
    return;
  }

  router.push(publishHref);
}

  return (
    <main className="min-h-screen bg-[#f6f4f2]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-rose-100/35 via-stone-100/30 to-amber-100/35" />

            <div className="relative">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                  Step 2 of 2
                </span>

                {designBadge ? (
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      badgeClassName(designBadge),
                    ].join(" ")}
                  >
                    {designBadge}
                  </span>
                ) : null}

                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    saveState === "saved"
                      ? "bg-emerald-700 text-white"
                      : saveState === "saving"
                        ? "bg-neutral-900 text-white"
                        : saveState === "error"
                          ? "bg-red-700 text-white"
                          : saveState === "signin-required"
                            ? "bg-amber-600 text-white"
                            : "bg-neutral-200 text-neutral-800",
                  ].join(" ")}
                >
                  {saveState === "saved"
                    ? "Saved"
                    : saveState === "saving"
                      ? "Saving"
                      : saveState === "error"
                        ? "Save Failed"
                        : saveState === "signin-required"
                          ? "Sign In Required"
                          : "Editor Ready"}
                </span>
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                    Create {templateDef.title || "Microsite"}
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-[15px]">
                    You selected{" "}
                    <span className="font-semibold text-neutral-900">
                      {designLabel}
                    </span>
                    . Customize the layout visually using the live page canvas
                    and bottom tool tray.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Template: {templateDef.title}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Design: {designLabel}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Editor
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-neutral-600">
                    {saveMessage}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <Link
                    href="/preview/draft"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Open Preview
                  </Link>

                  <Link
                    href={`/create/${encodeURIComponent(templateKey)}/design`}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Change Design
                  </Link>
                </div>
              </div>
            </div>
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
      />
      </div>
    </main>
  );
}