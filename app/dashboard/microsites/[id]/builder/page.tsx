// app/dashboard/microsites/[id]/builder/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import TemplateDraftEditor from "@/components/templates/TemplateDraftEditor";
import type { BuilderDraft, MicrositeBlock } from "@/lib/templates/builder";

type MicrositeRecord = {
  id: string;
  slug: string;
  title: string;
  template_key: string;
  selected_design_key?: string | null;
  is_published: boolean;
  paid_until: string | null;
  draft: Partial<BuilderDraft> | null;
};

type PageRow = {
  id: string;
  slug: string;
  title: string | null;
  display_order?: number | null;
  draft?: Partial<BuilderDraft> | null;
  created_at?: string;
  updated_at?: string;
};

type ContextMenuState = {
  pageId: string;
  pageSlug: string;
  x: number;
  y: number;
} | null;

function buildDraftFromRecord(site: MicrositeRecord): BuilderDraft {
  const draft = (site.draft ?? {}) as Partial<BuilderDraft>;

  return {
    ...(draft as BuilderDraft),
    title: draft.title || site.title || "",
    subtitle: draft.subtitle || "",
    subtext: draft.subtext || "",
    description: draft.description || "",
    slugSuggestion: draft.slugSuggestion || site.slug || "",
    blocks: Array.isArray(draft.blocks) ? draft.blocks : [],
  };
}

function buildDraftFromPage(page: PageRow, micrositeSlug: string): BuilderDraft {
  const draft = (page.draft ?? {}) as Partial<BuilderDraft>;

  return {
    ...(draft as BuilderDraft),
    title: draft.title || page.title || "",
    subtitle: draft.subtitle || "",
    subtext: draft.subtext || "",
    description: draft.description || "",
    slugSuggestion: draft.slugSuggestion || micrositeSlug || "",
    blocks: Array.isArray(draft.blocks) ? draft.blocks : [],
  };
}

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function DashboardMicrositeBuilderPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const [site, setSite] = useState<MicrositeRecord | null>(null);
  const [editorDraft, setEditorDraft] = useState<BuilderDraft | null>(null);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pageDraftLoading, setPageDraftLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderingPages, setReorderingPages] = useState(false);

  const [saveMessage, setSaveMessage] = useState(
    "Autosave is enabled while you edit.",
  );

  const [addPageModalOpen, setAddPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [creatingPage, setCreatingPage] = useState(false);
  const [createPageError, setCreatePageError] = useState("");

  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamePageId, setRenamePageId] = useState<string | null>(null);
  const [renamePageName, setRenamePageName] = useState("");
  const [renamingPage, setRenamingPage] = useState(false);
  const [renamePageError, setRenamePageError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  const [deletingPage, setDeletingPage] = useState(false);
  const [deletePageError, setDeletePageError] = useState("");

  const orderedPages = useMemo(
    () =>
      [...pages].sort((a, b) => {
        const aOrder = typeof a.display_order === "number" ? a.display_order : 0;
        const bOrder = typeof b.display_order === "number" ? b.display_order : 0;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }),
    [pages],
  );

  const firstPageId = orderedPages[0]?.id || null;

  async function loadPages(micrositeId: string) {
    try {
      setPagesLoading(true);

      const res = await fetch(
        `/api/dashboard/microsites/${micrositeId}/pages`,
        { cache: "no-store" },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) return [];

      const nextPages = Array.isArray(data?.pages) ? data.pages : [];
      setPages(nextPages);

      return nextPages as PageRow[];
    } finally {
      setPagesLoading(false);
    }
  }

  async function loadPageDraft(pageId: string, micrositeSlug: string) {
    try {
      setPageDraftLoading(true);
      setSaveMessage("Loading page...");

      const res = await fetch(
        `/api/dashboard/microsites/${id}/pages?pageId=${encodeURIComponent(pageId)}`,
        { cache: "no-store" },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.page) {
        setSaveMessage("Failed to load page draft.");
        return;
      }

      const page = data.page as PageRow;
      setEditorDraft(buildDraftFromPage(page, micrositeSlug));

      setPages((prev) =>
        prev.map((item) => (item.id === page.id ? { ...item, ...page } : item)),
      );

      setSaveMessage(`Editing page: ${page.slug}`);
    } finally {
      setPageDraftLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/dashboard/microsites/${id}`, {
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          alert(data?.error || "Failed to load microsite builder.");
          return;
        }

        if (!cancelled) {
          const microsite = data.microsite || null;
          setSite(microsite);

          if (microsite) {
            const nextPages = await loadPages(microsite.id);

            if (!cancelled) {
              if (nextPages.length > 0) {
                const sortedPages = [...nextPages].sort(
                  (a, b) => (a.display_order || 0) - (b.display_order || 0),
                );
                const homePage =
                  sortedPages.find((page) => page.slug === "home") || sortedPages[0];
                setActivePageId(homePage.id);
              } else {
                setEditorDraft(buildDraftFromRecord(microsite));
              }
            }
          }
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : "Unexpected error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!activePageId || !site) return;
    void loadPageDraft(activePageId, site.slug);
  }, [activePageId, site]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contextMenu &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu]);

  async function saveBuilderDraft(draft: BuilderDraft) {
    try {
      setSaving(true);
      setSaveMessage("Saving draft...");

      if (activePageId) {
        const res = await fetch(`/api/dashboard/microsites/${id}/pages`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            pageId: activePageId,
            draft,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          alert(data?.error || "Failed to save page.");
          setSaveMessage("Save failed.");
          return;
        }

        setEditorDraft(draft);
        setPages((prev) =>
          prev.map((page) =>
            page.id === activePageId
              ? {
                  ...page,
                  ...data.page,
                }
              : page,
          ),
        );

        setSaveMessage("Page saved.");
        return;
      }

      const res = await fetch(`/api/dashboard/microsites/${id}/builder`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draft }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "Failed to save.");
        setSaveMessage("Save failed.");
        return;
      }

      setSite((prev) =>
        prev
          ? { ...prev, title: data?.draft?.title || prev.title, draft: data?.draft }
          : prev,
      );

      setEditorDraft(draft);
      setSaveMessage("Draft saved.");

      void loadPages(id);
    } finally {
      setSaving(false);
    }
  }

  function openAddPageModal() {
    setNewPageName("");
    setCreatePageError("");
    setAddPageModalOpen(true);
  }

  function closeAddPageModal() {
    if (creatingPage) return;
    setAddPageModalOpen(false);
    setNewPageName("");
    setCreatePageError("");
  }

  async function createPageFromModal() {
    const safeSlug = normalizeSlug(newPageName);

    if (!safeSlug) {
      setCreatePageError("Enter a valid page name.");
      return;
    }

    try {
      setCreatingPage(true);
      setCreatePageError("");

      const res = await fetch(`/api/dashboard/microsites/${id}/pages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: safeSlug }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setCreatePageError(data?.error || "Failed to create page.");
        return;
      }

      const nextPage = data?.page as PageRow | undefined;

      await loadPages(id);

      if (nextPage?.id) {
        setActivePageId(nextPage.id);
      }

      setAddPageModalOpen(false);
      setNewPageName("");
      setCreatePageError("");
      setSaveMessage(`Created page: ${safeSlug}`);
    } finally {
      setCreatingPage(false);
    }
  }

  function openPageContextMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    page: PageRow,
  ) {
    event.preventDefault();
    setContextMenu({
      pageId: page.id,
      pageSlug: page.slug,
      x: event.clientX,
      y: event.clientY,
    });
  }

function openRenameModalFromContext() {
  if (!contextMenu) return;
  const homePage = orderedPages[0];
  if (contextMenu.pageId === homePage?.id) return;

  setRenamePageId(contextMenu.pageId);
  setRenamePageName(contextMenu.pageSlug);
  setRenamePageError("");
  setRenameModalOpen(true);
  setContextMenu(null);
}

  function closeRenameModal() {
    if (renamingPage) return;
    setRenameModalOpen(false);
    setRenamePageId(null);
    setRenamePageName("");
    setRenamePageError("");
  }

  async function renamePageFromModal() {
    if (!renamePageId) return;

    const safeSlug = normalizeSlug(renamePageName);

    if (!safeSlug) {
      setRenamePageError("Enter a valid page name.");
      return;
    }

    try {
      setRenamingPage(true);
      setRenamePageError("");

      const res = await fetch(`/api/dashboard/microsites/${id}/pages`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "rename",
          pageId: renamePageId,
          slug: safeSlug,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setRenamePageError(data?.error || "Failed to rename page.");
        return;
      }

      setPages((prev) =>
        prev.map((page) =>
          page.id === renamePageId ? { ...page, ...data.page } : page,
        ),
      );

      closeRenameModal();
      setSaveMessage(`Renamed page to: ${safeSlug}`);
    } finally {
      setRenamingPage(false);
    }
  }

function openDeleteModalFromContext() {
  if (!contextMenu) return;
  const homePage = orderedPages[0];
  if (contextMenu.pageId === homePage?.id) return;

  setDeletePageId(contextMenu.pageId);
  setDeletePageError("");
  setDeleteModalOpen(true);
  setContextMenu(null);
}

  function closeDeleteModal() {
    if (deletingPage) return;
    setDeleteModalOpen(false);
    setDeletePageId(null);
    setDeletePageError("");
  }

  async function deletePageFromModal() {
    if (!deletePageId) return;

    try {
      setDeletingPage(true);
      setDeletePageError("");

      const res = await fetch(`/api/dashboard/microsites/${id}/pages`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          pageId: deletePageId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDeletePageError(data?.error || "Failed to delete page.");
        return;
      }

      const remainingPages = orderedPages.filter((page) => page.id !== deletePageId);
      setPages(remainingPages);

      if (activePageId === deletePageId) {
        const nextPage = remainingPages[0] || null;
        if (nextPage?.id) {
          setActivePageId(nextPage.id);
        }
      }

      closeDeleteModal();
      setSaveMessage("Page deleted.");
    } finally {
      setDeletingPage(false);
    }
  }

  async function reorderPages(nextPages: PageRow[]) {
    try {
      setReorderingPages(true);

      setPages(nextPages.map((page, index) => ({ ...page, display_order: index })));

      const res = await fetch(`/api/dashboard/microsites/${id}/pages`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orderedPageIds: nextPages.map((page) => page.id),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "Failed to reorder pages.");
        await loadPages(id);
        return;
      }

      setPages(Array.isArray(data?.pages) ? data.pages : nextPages);
      setSaveMessage("Pages reordered.");
    } finally {
      setReorderingPages(false);
      setDraggedPageId(null);
    }
  }

  async function handlePageDrop(targetPageId: string) {
    if (!draggedPageId || draggedPageId === targetPageId) {
      setDraggedPageId(null);
      return;
    }

    const currentPages = [...orderedPages];
    const fromIndex = currentPages.findIndex((page) => page.id === draggedPageId);
    const toIndex = currentPages.findIndex((page) => page.id === targetPageId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedPageId(null);
      return;
    }

    const [moved] = currentPages.splice(fromIndex, 1);
    currentPages.splice(toIndex, 0, moved);

    await reorderPages(currentPages);
  }

  if (loading || !site || !editorDraft) {
    return <div className="p-6">Loading builder...</div>;
  }

return (
  <main className="w-full max-w-none px-0 py-0">
      <div className="mb-1 flex justify-end text-sm text-neutral-600">
        {saving
          ? "Saving..."
          : pageDraftLoading
            ? "Loading page..."
            : reorderingPages
              ? "Reordering pages..."
              : saveMessage}
      </div>

      <div className="mb-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 pr-2">
          {orderedPages.map((page, index) => {
  const isHomePage = index === 0;

  return (
    <button
      key={page.id}
      type="button"
      draggable={!isHomePage}
      onDragStart={() => {
        if (!isHomePage) setDraggedPageId(page.id);
      }}
      onDragOver={(e) => {
        if (!isHomePage || draggedPageId) {
          e.preventDefault();
        }
      }}
      onDrop={() => void handlePageDrop(page.id)}
      onClick={() => setActivePageId(page.id)}
      onContextMenu={(e) => {
        if (isHomePage) return;
        openPageContextMenu(e, page);
      }}
      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
        activePageId === page.id
          ? "bg-black text-white"
          : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
      }`}
    >
      {isHomePage ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            activePageId === page.id
              ? "bg-white/20 text-white"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          HOME
        </span>
      ) : (
        <span>{page.slug}</span>
      )}
    </button>
  );
})}
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={openAddPageModal}
              className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              + Add Page
            </button>
          </div>
        </div>

        {pagesLoading ? (
          <div className="mt-2 text-xs text-neutral-500">
            Loading pages...
          </div>
        ) : null}
      </div>

      <TemplateDraftEditor
        key={`${site.id}::${activePageId || "root"}::${site.selected_design_key || "blank"}::${editorDraft.title || ""}::${editorDraft.blocks.length}`}
        templateKey={site.template_key}
        designLayout={site.selected_design_key || "blank"}
        initialDraft={editorDraft}
        onSave={saveBuilderDraft}
      />

      {contextMenu ? (
        <div
          ref={contextMenuRef}
          className="fixed z-[70] min-w-[180px] rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 140),
            left: Math.min(contextMenu.x, window.innerWidth - 220),
          }}
        >
          <button
            type="button"
            onClick={openRenameModalFromContext}
            className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100"
          >
            Rename page
          </button>
          <button
            type="button"
            onClick={openDeleteModalFromContext}
            className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
          >
            Delete page
          </button>
        </div>
      ) : null}

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
                    void createPageFromModal();
                  }
                }}
                placeholder="rsvp"
                autoFocus
                className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
              />
              <div className="mt-2 text-xs text-neutral-500">
                Page URL slug: {normalizeSlug(newPageName) || "new-page"}
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
                disabled={creatingPage}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void createPageFromModal()}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={creatingPage}
              >
                {creatingPage ? "Creating..." : "Create Page"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {renameModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="text-lg font-semibold text-neutral-950">
              Rename Page
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              Update the page name. The public page slug will update too.
            </p>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Page name
              </label>
              <input
                type="text"
                value={renamePageName}
                onChange={(e) => {
                  setRenamePageName(e.target.value);
                  if (renamePageError) setRenamePageError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void renamePageFromModal();
                  }
                }}
                placeholder="rsvp"
                autoFocus
                className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
              />
              <div className="mt-2 text-xs text-neutral-500">
                Page URL slug: {normalizeSlug(renamePageName) || "page-name"}
              </div>
            </div>

            {renamePageError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {renamePageError}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeRenameModal}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                disabled={renamingPage}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void renamePageFromModal()}
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                disabled={renamingPage}
              >
                {renamingPage ? "Saving..." : "Save Rename"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="text-lg font-semibold text-neutral-950">
              Delete Page?
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              This will permanently remove this page and its saved content.
            </p>

            {deletePageError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deletePageError}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                disabled={deletingPage}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void deletePageFromModal()}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                disabled={deletingPage}
              >
                {deletingPage ? "Deleting..." : "Delete Page"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}