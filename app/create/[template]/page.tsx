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
import { loadTemplateDraftPreset } from "@/lib/drafts";

      // AFTER CREATING DESIGN PRESETS, UPDATE THIS:
      import playfulBirthdayDraft from "@/drafts/birthday/playful.draft";
      import grownBirthdayDraft from "@/drafts/birthday/grown.draft";
      import elegantBabyShowerDraft from "@/drafts/baby_shower/elegant.draft";
      import babyShowerPlayfulDraft from "@/drafts/baby_shower/playful.draft";
      import weddingModernDraft from "@/drafts/wedding/modern.draft";
      import weddingClassicDraft from "@/drafts/wedding/classic.draft";

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

  const draftRegistry: Record<string, BuilderDraft> = {
  "birthday:grown": grownBirthdayDraft as BuilderDraft,
  "wedding:modern": weddingModernDraft as BuilderDraft,
  "wedding:classic": weddingClassicDraft as BuilderDraft,
};

const presetDraft: BuilderDraft = useMemo(() => {
  const draftRegistry: Record<string, BuilderDraft> = {
    "birthday:grown": grownBirthdayDraft as BuilderDraft,
    "birthday:playful": playfulBirthdayDraft as BuilderDraft,
    "wedding:modern": weddingModernDraft as BuilderDraft,
    "wedding:classic": weddingClassicDraft as BuilderDraft,
  };

  console.log("PRESET DEBUG", {
  templateName,
  templateKey,
  designKey,
  registryKeys: Object.keys(draftRegistry),
});

  const registryTemplateKey = String(templateName || "")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "_");

const registryKey = `${registryTemplateKey}:${designKey}`;
  const registryDraft = draftRegistry[registryKey];

  if (registryDraft) {
    return {
      ...registryDraft,
      slugSuggestion:
        registryDraft.slugSuggestion ||
        templateDef.defaultDraft?.slugSuggestion ||
        "",
      blocks: Array.isArray(registryDraft.blocks) ? registryDraft.blocks : [],
    };
  }

  const draftPreset = loadTemplateDraftPreset(templateKey, designKey);

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

  return createTemplateDraft(templateName, designKey);
}, [
  templateKey,
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

  function buildFallbackStorageKeyForDraft(draft?: BuilderDraft) {
    return buildCreateDraftStorageKey(
      resolveSafeTemplateKey(draft) || "unknown",
      resolveSafeDesignKey(draft) || "blank",
    );
  }

  function persistDraftLocally(nextDraft: BuilderDraft) {
    const keys = Array.from(
      new Set([storageKey, buildFallbackStorageKeyForDraft(nextDraft)]),
    );

    for (const key of keys) {
      try {
        window.localStorage.setItem(key, JSON.stringify(nextDraft));
      } catch {
        // ignore localStorage errors
      }
    }
  }

useEffect(() => {
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

  if (resetPreset) {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore localStorage errors
    }

    setBuilderPages(normalizedPages);
    setActiveBuilderPageId(homePage.id);
    setHydratedDraft(homePage.draft);
    setLiveDraft(homePage.draft);
    lastSavedDraftRef.current = JSON.stringify(homePage.draft);

    setSaveState("idle");
    setSaveMessage("Loaded code preset. Saved local/dashboard drafts ignored.");
    return;
  }

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

    setBuilderPages(normalizedPages);
    setActiveBuilderPageId(homePage.id);
    setHydratedDraft(homePage.draft);
    setLiveDraft(homePage.draft);
    lastSavedDraftRef.current = JSON.stringify(homePage.draft);

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
}, [initialDraft, storageKey, shouldLoadExistingDraft, resetPreset]);

useEffect(() => {
  if (!resetPreset) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore localStorage errors
  }

  setHydratedDraft(initialDraft);
  setLiveDraft(initialDraft);
  liveDraftRef.current = initialDraft;
  lastSavedDraftRef.current = JSON.stringify(initialDraft);
  setSaveMessage("Preset reloaded from code.");
}, [resetPreset, storageKey, initialDraft]);

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

  // Always preserve full multi-page draft locally first.
  persistDraftLocally(draftToSave);

  if (!isSignedIn) {
    setSaveState("signin-required");
    setSaveMessage(
      "Draft saved in this browser. Sign in to save it to your dashboard.",
    );
    setShowSignInPrompt(true);
    return;
  }

  const safeTemplateKey = resolveSafeTemplateKey(draftToSave);
  const safeDesignKey = resolveSafeDesignKey(draftToSave);

  if (!safeTemplateKey) {
    setSaveState("saved");
    setSaveMessage("Draft saved in this browser. Cloud save was skipped.");
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
        setSaveState("saved");
        setSaveMessage("Draft saved in this browser. Cloud save was skipped.");
      } else {
        setSaveState("error");
        setSaveMessage(
          data?.error
            ? `Draft saved in this browser, but dashboard save failed: ${data.error}`
            : "Draft saved in this browser, but dashboard save failed.",
        );
      }

      queueSaveStateReset();
      return;
    }

    lastSavedDraftRef.current = JSON.stringify(draftToSave);
    setSaveState("saved");
    setSaveMessage("Draft was saved to your dashboard.");
    queueSaveStateReset();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save draft.";

    setSaveState("error");
    setSaveMessage(
      `Draft saved in this browser, but dashboard save failed: ${message}`,
    );
    queueSaveStateReset();
  }
}

  function continueToSignIn() {
    setShowSignInPrompt(false);

    persistDraftLocally(liveDraft);

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
/>

{addPageModalOpen ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
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