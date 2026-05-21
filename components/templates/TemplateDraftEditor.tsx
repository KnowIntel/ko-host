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
  onOpenAddPage?: () => void;
  onDuplicateActivePage?: () => void;
  onDraftChange?: (draft: BuilderDraft) => void;
  saveState?: "idle" | "saving" | "saved" | "error" | "signin-required";
  saveMessage?: string;
  microsite?: {
    is_published?: boolean;
    is_active?: boolean;
    slug?: string;
  };
onRemoveActivePage?: () => void;
onRenameActivePage?: () => void;
pages?: Array<{
  id: string;
  slug: string;
  title: string | null;
  display_order?: number | null;
}>;
activePageId?: string | null;
activePageSlug?: string;
micrositeSlug?: string;
onSelectPage?: (pageId: string) => void;
onReorderPages?: (nextPages: Array<{
  id: string;
  slug: string;
  title: string | null;
  display_order?: number | null;
}>) => void | Promise<void>;
};

const AUTOSAVE_DELAY_MS = 10 * 60 * 1000;
const SAVED_STATE_RESET_MS = 2500;

const MAX_DRAFT_BYTES = 20 * 1024 * 1024;

function getJsonPayloadBytes(draft: BuilderDraft, activePageId?: string | null) {
  try {
    const payload = activePageId
      ? {
          pageId: activePageId,
          draft,
        }
      : {
          draft,
        };

    return new Blob([JSON.stringify(payload)]).size;
  } catch {
    return 0;
  }
}

function collectPageMediaBytes(value: unknown) {
  let total = 0;
  const seen = new WeakSet<object>();

  function estimateDataUrlBytes(dataUrl: string) {
    const commaIndex = dataUrl.indexOf(",");
    const payload = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;

    return Math.floor((payload.length * 3) / 4);
  }

  function walk(input: unknown) {
    if (!input || typeof input !== "object") return;

    if (seen.has(input)) return;
    seen.add(input);

    if (Array.isArray(input)) {
      input.forEach(walk);
      return;
    }

    const record = input as Record<string, unknown>;

    for (const [key, rawValue] of Object.entries(record)) {
      if (
        typeof rawValue === "number" &&
        Number.isFinite(rawValue) &&
        rawValue > 0 &&
        (
          key === "sizeBytes" ||
          key === "fileSizeBytes" ||
          key === "imageSizeBytes" ||
          key === "videoSizeBytes" ||
          key === "audioSizeBytes" ||
          key === "mediaSizeBytes" ||
          key === "textureSizeBytes" ||
          key === "buttonImageSizeBytes" ||
          key === "attachmentSizeBytes"
        )
      ) {
        total += rawValue;
      }

      if (
        typeof rawValue === "string" &&
        rawValue.startsWith("data:")
      ) {
        total += estimateDataUrlBytes(rawValue);
      }

      walk(rawValue);
    }
  }

  walk(value);

  return total;
}

function getPageCapacityBytes(draft: BuilderDraft, activePageId?: string | null) {
  return getJsonPayloadBytes(draft, activePageId) + collectPageMediaBytes(draft);
}

function formatDraftBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${bytes} B`;
}

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
  onOpenAddPage,
  onDuplicateActivePage,
  onRemoveActivePage,
  onRenameActivePage,
  onDraftChange,
  saveState,
  saveMessage,
  microsite,
  pages,
  activePageId,
  activePageSlug,
  micrositeSlug,
onSelectPage,
onReorderPages,
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

    const totalBytes = getPageCapacityBytes(draftToSave, activePageId);

if (totalBytes > MAX_DRAFT_BYTES) {
  setLocalSaveState("error");

  setLocalSaveMessage(
    `Builder capacity exceeded (${formatDraftBytes(
      totalBytes,
    )} / ${formatDraftBytes(MAX_DRAFT_BYTES)}). Reduce media usage before saving.`,
  );

  return;
}

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

  const [showBuilderCapacityExpanded, setShowBuilderCapacityExpanded] =
  useState(false);
const currentDraftBytes = useMemo(
  () => getPageCapacityBytes(draft, activePageId),
  [draft, activePageId],
);

const draftUsagePercent = Math.min(
  100,
  Math.round((currentDraftBytes / MAX_DRAFT_BYTES) * 100),
);

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
  microsite={microsite}
  onPublishClick={() => {
    onPublishClick?.();
  }}

onOpenAddPage={onOpenAddPage}
onDuplicateActivePage={onDuplicateActivePage}
onRemoveActivePage={onRemoveActivePage}
onRenameActivePage={onRenameActivePage}
  pages={pages}
  activePageId={activePageId}
  activePageSlug={activePageSlug}
  micrositeSlug={micrositeSlug}
  onSelectPage={onSelectPage}
  onReorderPages={onReorderPages}
  saveState={effectiveSaveState}
  saveMessage={effectiveSaveMessage}
builderCapacityContent={
  <div className="w-full border-t border-neutral-700 bg-neutral-900">
    <button
      type="button"
      onClick={() => setShowBuilderCapacityExpanded((prev) => !prev)}
      className="block w-full"
    >
      <div className="relative h-2 w-full overflow-hidden bg-neutral-800">
        <div
          className={`absolute inset-y-0 left-0 transition-all ${
            draftUsagePercent >= 90
              ? "bg-red-500"
              : draftUsagePercent >= 70
                ? "bg-amber-500"
                : "bg-blue-500"
          }`}
          style={{
            width: `${draftUsagePercent}%`,
          }}
        />
      </div>
    </button>

    {showBuilderCapacityExpanded ? (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">
              Builder Capacity
            </div>

            <div className="mt-1 text-xs text-neutral-400">
              {formatDraftBytes(currentDraftBytes)} used of{" "}
              {formatDraftBytes(MAX_DRAFT_BYTES)}
            </div>
          </div>

          <div
            className={`text-sm font-semibold ${
              draftUsagePercent >= 90
                ? "text-red-400"
                : draftUsagePercent >= 70
                  ? "text-amber-400"
                  : "text-blue-400"
            }`}
          >
            {draftUsagePercent}%
          </div>
        </div>

        <div className="mt-3 text-xs text-neutral-500">
          Large images, textures, videos, galleries, and duplicated media
          increase builder size usage.
        </div>
      </div>
    ) : null}
  </div>
}
/>
  </div>
);
}