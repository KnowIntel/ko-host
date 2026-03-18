import type { BuilderDraft } from "@/lib/templates/builder";

export const PREVIEW_DRAFT_STORAGE_KEY = "ko-host-preview-draft";
export const PREVIEW_DRAFT_EVENT = "ko-host-preview-draft-updated";

export type PreviewDraftPayload = {
  templateName: string;
  designLayout: string;
  draft: BuilderDraft;
  updatedAt: string;
};

export function clonePreviewDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function buildPreviewDraftPayload(params: {
  templateName: string;
  designLayout: string;
  draft: BuilderDraft;
}): PreviewDraftPayload {
  return {
    templateName: params.templateName,
    designLayout: params.designLayout,
    draft: clonePreviewDraft(params.draft),
    updatedAt: new Date().toISOString(),
  };
}

export function writePreviewDraft(payload: PreviewDraftPayload) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    PREVIEW_DRAFT_STORAGE_KEY,
    JSON.stringify(payload),
  );

  window.dispatchEvent(
    new CustomEvent<PreviewDraftPayload>(PREVIEW_DRAFT_EVENT, {
      detail: payload,
    }),
  );
}

export function readPreviewDraft(): PreviewDraftPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PREVIEW_DRAFT_STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as PreviewDraftPayload;
  } catch {
    return null;
  }
}