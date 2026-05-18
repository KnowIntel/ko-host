// app/create/[template]/page.tsx
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

type LocalBuilderPage = {
  id: string;
  slug: string;
  title: string;
  display_order: number;
  draft: BuilderDraft;
};

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

function formatTemplateLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function safeString(value: unknown, fallback = "") {
  const next = String(value ?? fallback).trim();
  return next || fallback;
}

export default function CreateTemplatePage() {
  const { isSignedIn } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTemplate = String(params?.template || "");
const rawDesign = searchParams.get("design") || "blank";
const resetPreset = searchParams.get("resetPreset") === "1";
const mode = searchParams.get("mode") || "new";
const shouldLoadExistingDraft = !resetPreset && mode === "draft";

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

const fallbackPresetDraft: BuilderDraft = useMemo(
  () => createTemplateDraft(templateName, designKey),
  [templateName, designKey],
);

const [presetDraft, setPresetDraft] =
  useState<BuilderDraft>(fallbackPresetDraft);

const [presetLoading, setPresetLoading] = useState(true);

useEffect(() => {
  let cancelled = false;

  async function loadDbPreset() {
    try {
      setPresetLoading(true);

      const res = await fetch(
        `/api/presets?templateKey=${encodeURIComponent(
          templateKey,
        )}&designKey=${encodeURIComponent(designKey)}`,
        { cache: "no-store" },
      );

      const data = await res.json().catch(() => ({}));

      if (cancelled) return;

      if (!res.ok || !data?.draft) {
        setPresetDraft(fallbackPresetDraft);
        return;
      }

      const nextDraft = data.draft as BuilderDraft;

      setPresetDraft({
        ...nextDraft,
        slugSuggestion:
          nextDraft.slugSuggestion ||
          data.micrositeSlug ||
          templateDef.defaultDraft?.slugSuggestion ||
          "",
        blocks: Array.isArray(nextDraft.blocks) ? nextDraft.blocks : [],
      });
    } catch {
      if (!cancelled) {
        setPresetDraft(fallbackPresetDraft);
      }
    } finally {
      if (!cancelled) {
        setPresetLoading(false);
      }
    }
  }

  void loadDbPreset();

  return () => {
    cancelled = true;
  };
}, [
  templateKey,
  designKey,
  fallbackPresetDraft,
  templateDef.defaultDraft?.slugSuggestion,
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

  const [hydratedDraft, setHydratedDraft] = useState<BuilderDraft>(initialDraft);
  const [liveDraft, setLiveDraft] = useState<BuilderDraft>(initialDraft);
const [builderPages, setBuilderPages] = useState<LocalBuilderPage[]>(() => {
  const draftPages = (initialDraft as BuilderDraft & {
    pages?: LocalBuilderPage[];
  }).pages;

  if (Array.isArray(draftPages) && draftPages.length > 0) {
    return draftPages.map((page, index) => ({
      id: page.id || (index === 0 ? "home" : `page-${index}`),
      slug: page.slug || (index === 0 ? "home" : `page-${index}`),
      title: page.title || (index === 0 ? "Home" : `Page ${index + 1}`),
      display_order: page.display_order ?? index,
      draft: page.draft || (page as unknown as BuilderDraft),
    }));
  }

  return [
    {
      id: "home",
      slug: "home",
      title: "Home",
      display_order: 0,
      draft: initialDraft,
    },
  ];
});

const [activeBuilderPageId, setActiveBuilderPageId] = useState("home");

const [addPageModalOpen, setAddPageModalOpen] = useState(false);
const [newPageName, setNewPageName] = useState("");
const [createPageError, setCreatePageError] = useState("");

const [renamePageModalOpen, setRenamePageModalOpen] = useState(false);
const [renamePageName, setRenamePageName] = useState("");
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

function resolveSafeTemplateKey(draft?: BuilderDraft) {
  const draftWithExtras = draft as BuilderDraft & {
    template_key?: string;
    templateName?: string;
  };

  return safeString(
    templateKey ||
      rawTemplate ||
      params?.template ||
      draftWithExtras?.template_key ||
      draftWithExtras?.templateName ||
      "",
  );
}

  function resolveSafeDesignKey(draft?: BuilderDraft) {
    return safeString(
      designKey ||
        requestedDesignKey ||
        rawDesign ||
        searchParams.get("design") ||
        (draft as BuilderDraft & { designKey?: string })?.designKey ||
        (draft as BuilderDraft & { design_key?: string })?.design_key ||
        (draft as BuilderDraft & { selectedDesignKey?: string })?.selectedDesignKey ||
        (draft as BuilderDraft & { selected_design_key?: string })?.selected_design_key ||
        "blank",
      "blank",
    );
  }

useEffect(() => {
  if (shouldLoadExistingDraft && isSignedIn) return;

  const draftPages = (initialDraft as BuilderDraft & {
    pages?: LocalBuilderPage[];
  }).pages;

  const normalizedPages =
    Array.isArray(draftPages) && draftPages.length > 0
      ? draftPages.map((page, index) => ({
          id: page.id || (index === 0 ? "home" : `page-${index}`),
          slug: page.slug || (index === 0 ? "home" : `page-${index}`),
          title: page.title || (index === 0 ? "Home" : `Page ${index + 1}`),
          display_order: page.display_order ?? index,
          draft: page.draft || (page as unknown as BuilderDraft),
        }))
      : [
          {
            id: "home",
            slug: "home",
            title: "Home",
            display_order: 0,
            draft: initialDraft,
          },
        ];

  const homePage =
    normalizedPages.find((page) => page.id === "home") || normalizedPages[0];

  setBuilderPages(normalizedPages);
  setActiveBuilderPageId(homePage.id);
  setHydratedDraft(homePage.draft);
  setLiveDraft(homePage.draft);
  liveDraftRef.current = homePage.draft;
  lastSavedDraftRef.current = JSON.stringify(homePage.draft);

  setSaveState("idle");
  setSaveMessage("Loaded design preset.");
}, [initialDraft]);

useEffect(() => {
  async function loadServerDraft() {
    if (resetPreset || !isSignedIn || !shouldLoadExistingDraft) return;

    const safeTemplateKey = resolveSafeTemplateKey(initialDraft);
    const safeDesignKey = resolveSafeDesignKey(initialDraft);

    if (!safeTemplateKey) return;

    try {
      const res = await fetch(
        `/api/drafts?templateKey=${encodeURIComponent(
          safeTemplateKey,
        )}&designKey=${encodeURIComponent(safeDesignKey)}`,
        { cache: "no-store" },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) return;
      if (data?.skipped || !data?.draftRow?.draft) return;

const savedDraft = data.draftRow.draft as BuilderDraft;
const savedPages = (savedDraft as BuilderDraft & {
  pages?: LocalBuilderPage[];
}).pages;

if (Array.isArray(savedPages) && savedPages.length > 0) {
  const normalizedPages = savedPages.map((page, index) => ({
    id: page.id || (index === 0 ? "home" : `page-${index}`),
    slug: page.slug || (index === 0 ? "home" : `page-${index}`),
    title: page.title || (index === 0 ? "Home" : `Page ${index + 1}`),
    display_order: page.display_order ?? index,
    draft: page.draft || (page as unknown as BuilderDraft),
  }));

  const homePage =
    normalizedPages.find((page) => page.id === "home") || normalizedPages[0];

  setBuilderPages(normalizedPages);
  setActiveBuilderPageId(homePage.id);
  setHydratedDraft(homePage.draft);
  setLiveDraft(homePage.draft);
  liveDraftRef.current = homePage.draft;
  lastSavedDraftRef.current = JSON.stringify(savedDraft);
  setSaveMessage("Loaded your saved dashboard draft.");
  return;
}

setHydratedDraft(savedDraft);
setLiveDraft(savedDraft);
liveDraftRef.current = savedDraft;
lastSavedDraftRef.current = JSON.stringify(savedDraft);
setSaveMessage("Loaded your saved dashboard draft.");
    } catch {
      // ignore draft preload errors
    }
  }

  void loadServerDraft();
}, [isSignedIn, templateKey, designKey, initialDraft, shouldLoadExistingDraft, resetPreset]);

  function buildDraftWithPages(currentDraft: BuilderDraft = liveDraft) {
  const syncedPages = builderPages.map((page) =>
    page.id === activeBuilderPageId
      ? { ...page, draft: currentDraft }
      : page,
  );

  const homePage = syncedPages.find((page) => page.id === "home") || syncedPages[0];

  return {
    ...(homePage?.draft || currentDraft),
    pages: syncedPages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      display_order: page.display_order,
      draft: page.draft,
    })),
  } as BuilderDraft;
}

async function handleSaveDraft(draft: BuilderDraft): Promise<void> {
  const draftToSave = buildDraftWithPages(draft);

  setHydratedDraft(draft);
  setLiveDraft(draft);

  if (!isSignedIn) {
    setSaveState("signin-required");
    setSaveMessage(
      "Sign in to save this draft to your dashboard. Unsaved changes are temporary.",
    );
    setShowSignInPrompt(true);
    return;
  }

  const safeTemplateKey = resolveSafeTemplateKey(draftToSave);
  const safeDesignKey = resolveSafeDesignKey(draftToSave);

  if (!safeTemplateKey) {
    setSaveState("error");
    setSaveMessage("Draft could not be saved because the template key is missing.");
    queueSaveStateReset();
    return;
  }

  try {
    setSaveState("saving");
    setSaveMessage("Saving draft...");

    console.log("SAVE DEBUG", {
      hasDraft: !!draftToSave,
      draftType: typeof draftToSave,
      hasBlocks: Array.isArray(draftToSave?.blocks),
      hasPages: Array.isArray((draftToSave as BuilderDraft & { pages?: unknown[] }).pages),
      pageCount: Array.isArray((draftToSave as BuilderDraft & { pages?: unknown[] }).pages)
        ? (draftToSave as BuilderDraft & { pages?: unknown[] }).pages?.length
        : 0,
      templateKey: safeTemplateKey,
      designKey: safeDesignKey,
      draft: draftToSave,
    });

    const res = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateKey: safeTemplateKey,
        designKey: safeDesignKey,
        draft: draftToSave,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const recoverable = Boolean(data?.recoverable || data?.skipped);

      if (recoverable) {
        setSaveState("error");
        setSaveMessage("Dashboard save was skipped. No local draft was saved.");
      } else {
        setSaveState("error");
        setSaveMessage(
          data?.error
            ? `Dashboard save failed: ${data.error}`
            : "Dashboard save failed.",
        );
      }

      queueSaveStateReset();
      return;
    }

    lastSavedDraftRef.current = JSON.stringify(draftToSave);
    setSaveState("saved");
    setSaveMessage("Draft saved to your Dashboard and Blueprint saved to local Downloads Folder.");
    queueSaveStateReset();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save draft.";

    setSaveState("error");
    setSaveMessage(`Dashboard save failed: ${message}`);
    queueSaveStateReset();
  }
}

  function continueToSignIn() {
    setShowSignInPrompt(false);

    const callbackUrl = window.location.href;
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(callbackUrl)}`;

    window.location.href = signInUrl;
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

  function normalizePageSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function openAddPageModal() {
  setNewPageName("");
  setCreatePageError("");
  setAddPageModalOpen(true);
}

function closeAddPageModal() {
  setAddPageModalOpen(false);
  setNewPageName("");
  setCreatePageError("");
}

function createPageFromModal() {
  if (builderPages.length >= 5) {
  setCreatePageError("You can only create up to 5 pages per microsite.");
  return;
}
  const safeSlug = normalizePageSlug(newPageName);

  if (!safeSlug) {
    setCreatePageError("Enter a valid page name.");
    return;
  }

  if (builderPages.some((page) => page.slug === safeSlug)) {
    setCreatePageError("A page with this name already exists.");
    return;
  }

  const nextPage: LocalBuilderPage = {
    id: `page-${Date.now()}`,
    slug: safeSlug,
    title: newPageName.trim(),
    display_order: builderPages.length,
draft: {
  title: newPageName.trim(),
  subtitle: "",
  subtext: "",
  description: "",
  slugSuggestion: initialDraft.slugSuggestion || "",
  blocks: [],
  pageColor: "#ffffff",
  pageBackground: "#ffffff",
  pageBackgroundImage: "",
  pageBackgroundImageFit: "zoom",
  pageScale: initialDraft.pageScale ?? 85,
  pageVisibility: {
    title: true,
    subtitle: false,
    subtext: false,
    description: false,
  },
  pageElements: {
    title: {
      colStart: 1,
      rowStart: 1,
      colSpan: 12,
      rowSpan: 1.5,
      zIndex: 1,
    },
  },
  pageBlockAppearance: {},
},
  };

  setBuilderPages((prev) => [
    ...prev.map((page) =>
      page.id === activeBuilderPageId ? { ...page, draft: liveDraft } : page,
    ),
    nextPage,
  ]);

  setActiveBuilderPageId(nextPage.id);
  setHydratedDraft(nextPage.draft);
  setLiveDraft(nextPage.draft);

  setAddPageModalOpen(false);
  setNewPageName("");
  setCreatePageError("");
}

function selectBuilderPage(pageId: string) {
  const currentDraft = liveDraft;

  setBuilderPages((prev) =>
    prev.map((page) =>
      page.id === activeBuilderPageId ? { ...page, draft: currentDraft } : page,
    ),
  );

  const nextPage = builderPages.find((page) => page.id === pageId);
  if (!nextPage) return;

  setActiveBuilderPageId(pageId);
  setHydratedDraft(nextPage.draft);
  setLiveDraft(nextPage.draft);
}

function duplicateActiveBuilderPage() {
  const currentPage = builderPages.find(
    (page) => page.id === activeBuilderPageId,
  );

  if (!currentPage || builderPages.length >= 5) return;

  const nextId = `page_${Date.now()}`;
  const nextSlug = `${currentPage.slug || "page"}-copy`;

  setBuilderPages((prev) => [
    ...prev,
    {
      ...currentPage,
      id: nextId,
      slug: nextSlug,
      title: `${currentPage.title || "Page"} Copy`,
      display_order: prev.length,
      draft: structuredClone(hydratedDraft),
    },
  ]);

  setActiveBuilderPageId(nextId);
}

function removeActiveBuilderPage() {
  if (activeBuilderPageId === "home") return;

  const remainingPages = builderPages.filter(
    (page) => page.id !== activeBuilderPageId,
  );

  setBuilderPages(remainingPages);
  setActiveBuilderPageId("home");

  const homeDraft = remainingPages.find((page) => page.id === "home")?.draft || initialDraft;
  setHydratedDraft(homeDraft);
  setLiveDraft(homeDraft);
}

function openRenameActivePageModal() {
  if (activeBuilderPageId === "home") return;

  const activePage = builderPages.find((page) => page.id === activeBuilderPageId);
  if (!activePage) return;

  setRenamePageName(activePage.title || activePage.slug);
  setRenamePageModalOpen(true);
}

function renameActivePageFromModal() {
  if (activeBuilderPageId === "home") return;

  const safeSlug = normalizePageSlug(renamePageName);

  if (!safeSlug) return;

const nextTitle = renamePageName.trim() || safeSlug;

setBuilderPages((prev) =>
  prev.map((page) =>
    page.id === activeBuilderPageId
      ? {
          ...page,
          slug: safeSlug,
          title: nextTitle,
          draft: {
            ...page.draft,
            title: nextTitle,
          },
        }
      : page,
  ),
);

setHydratedDraft((prev) => ({
  ...prev,
  title: nextTitle,
}));

setLiveDraft((prev) => ({
  ...prev,
  title: nextTitle,
}));

  setRenamePageModalOpen(false);
  setRenamePageName("");
}

  if (presetLoading) {
    return (
      <main className="min-h-screen bg-[#f6f4f2] p-6 text-sm text-neutral-600">
        Loading design preset...
      </main>
    );
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
  key={`${editorInstanceKey}::${activeBuilderPageId}`}
  templateName={templateKey}
  designLayout={designKey}
  initialDraft={hydratedDraft}
  onSave={handleSaveDraft}
  publishHref={publishHref}
  publishLabel="Publish"
  onPublishClick={handlePublishClick}
  saveState={saveState}
  saveMessage={saveMessage}
  pages={builderPages.map(({ id, slug, title, display_order }) => ({
    id,
    slug,
    title,
    display_order,
  }))}
  activePageId={activeBuilderPageId}
  activePageSlug={
    builderPages.find((page) => page.id === activeBuilderPageId)?.slug || "home"
  }
  onOpenAddPage={openAddPageModal}
  onDuplicateActivePage={duplicateActiveBuilderPage}
  onRemoveActivePage={removeActiveBuilderPage}
  onRenameActivePage={openRenameActivePageModal}
  onSelectPage={selectBuilderPage}

  onReorderPages={(nextPages) => {
  setBuilderPages((prev) => {
    const syncedPages = prev.map((page) =>
      page.id === activeBuilderPageId ? { ...page, draft: liveDraft } : page,
    );

    return nextPages.map((nextPage, index) => {
      const existingPage = syncedPages.find((page) => page.id === nextPage.id);

      return {
        ...(existingPage ?? {
          id: nextPage.id,
          slug: nextPage.slug,
          title: nextPage.title || nextPage.slug,
          draft: initialDraft,
        }),
        slug: nextPage.slug,
        title: nextPage.title || nextPage.slug,
        display_order: index,
      };
    });
  });
}}
/>

{addPageModalOpen ? (
  <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40 px-4">
    <div className="relative z-[2147483647] w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
      <div className="text-lg font-semibold text-neutral-950">
        Add New Page
      </div>

      <p className="mt-2 text-sm text-neutral-600">
        Enter a page name. It will be converted into a clean page slug.
      </p>

      <div className="mt-5">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Page name
        </label>

        <input
          type="text"
          value={newPageName}
          onChange={(e) => {
            setNewPageName(e.target.value);
            if (createPageError) setCreatePageError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              createPageFromModal();
            }
          }}
          placeholder="rsvp"
          autoFocus
          className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
        />

        <div className="mt-2 text-xs text-neutral-500">
          Page URL slug: {normalizePageSlug(newPageName) || "new-page"}
        </div>
      </div>

      {createPageError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {createPageError}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={closeAddPageModal}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={createPageFromModal}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Page
        </button>
      </div>
    </div>
  </div>
) : null}

{renamePageModalOpen ? (
  <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40 px-4">
    <div className="relative z-[2147483647] w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
      <div className="text-lg font-semibold text-neutral-950">
        Rename Page
      </div>

      <div className="mt-5">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Page name
        </label>

        <input
          type="text"
          value={renamePageName}
          onChange={(e) => setRenamePageName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              renameActivePageFromModal();
            }
          }}
          autoFocus
          className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setRenamePageModalOpen(false)}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={renameActivePageFromModal}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Rename Page
        </button>
      </div>
    </div>
  </div>
) : null}

<AppModal
  open={showSignInPrompt}
  title="Sign in required"
description={
  "Drafts are not saved in the browser. You must be signed in to save drafts to your dashboard.\n" +
  "\n" +
  "Option 1: Cancel and return to your draft without saving.\n" +
  "Option 2: Sign in and start a new draft.\n" +
  "\n" +
  "Prior to signing in: Press 'Download Blueprint' and, after signing in, use 'Build From Blueprint' to paste your content (JSON) and restore your work."
}
children={
  <button
    type="button"
    onClick={() => {
      try {
        const { slugSuggestion, ...draftWithoutSlugSuggestion } =
        liveDraft as BuilderDraft & { slugSuggestion?: string };

        const blueprint = JSON.stringify(draftWithoutSlugSuggestion, null, 2);

        const blob = new Blob([blueprint], {
          type: "text/plain;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);

        const pageName =
          (
            (liveDraft as any)?.title ||
            (liveDraft as any)?.pageName ||
            (liveDraft as any)?.slug ||
            "page"
          )
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "page";

        const link = document.createElement("a");
        link.href = url;
        link.download = `ko-host-blueprint-${pageName}-${Date.now()}.txt`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download blueprint:", error);
      }
    }}
    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
  >
    Download Blueprint
  </button>
}
  confirmText="Sign In"
  cancelText="Cancel"
  onConfirm={continueToSignIn}
  onCancel={() => setShowSignInPrompt(false)}
>

</AppModal>
        <AppModal
          open={showPublishWarning}
          title="Publish draft?"
          description="Before publishing, your current draft will be saved to your dashboard."
          confirmText="Continue to Publish"
          cancelText="Cancel"
          onConfirm={continueToPublish}
          onCancel={cancelPublishWarning}
          extraContent={
            !isSignedIn ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-red-700">
                <span className="mr-2 rounded-md bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  IMPORTANT
                </span>

                Prior to signing in, download your Blueprint and use Build From Blueprint
                after signing in to restore your work.
              </div>
            ) : null
          }
        />
      </div>
    </main>
  );
}