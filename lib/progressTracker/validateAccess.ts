import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type {
  BuilderDraft,
  ProgressTrackerBlock,
} from "@/lib/templates/builder";

type AccessResult =
  | {
      ok: true;
      block: ProgressTrackerBlock;
    }
  | {
      ok: false;
      status: 403 | 404 | 500;
      error: string;
    };

function findTracker(
  draft: BuilderDraft | null,
  blockId: string
): ProgressTrackerBlock | null {
  const block = draft?.blocks?.find(
    (candidate) =>
      candidate.id === blockId &&
      candidate.type === "progress_tracker"
  );

  return block?.type === "progress_tracker"
    ? block
    : null;
}

export async function validateProgressTrackerAccess(
  micrositeId: string,
  blockId: string
): Promise<AccessResult> {
  if (!micrositeId || !blockId) {
    return {
      ok: false,
      status: 404,
      error: "Tracker not found.",
    };
  }

  const supabase = getSupabaseAdmin();

  const { data: site, error: siteError } = await supabase
    .from("microsites")
    .select(
      "id, slug, is_active, is_published, paid_until, site_visibility, private_mode, passcode_hash, draft"
    )
    .eq("id", micrositeId)
    .maybeSingle();

  if (siteError) {
    return {
      ok: false,
      status: 500,
      error: "Unable to verify microsite.",
    };
  }

  if (!site) {
    return {
      ok: false,
      status: 404,
      error: "Microsite not found.",
    };
  }

  if (
    site.is_active === false ||
    !site.is_published ||
    !site.paid_until ||
    new Date(site.paid_until).getTime() <= Date.now()
  ) {
    return {
      ok: false,
      status: 403,
      error: "Microsite is not currently available.",
    };
  }

  const privateMode =
    typeof site.private_mode === "string"
      ? site.private_mode
      : site.private_mode === true
        ? "passcode"
        : "none";

  if (
    site.site_visibility === "private" &&
    privateMode === "passcode"
  ) {
    const cookieStore = await cookies();

    const supplied =
      cookieStore.get(`kht_access_${site.slug}`)?.value ?? "";

    const expected = site.passcode_hash
      ? crypto
          .createHash("sha256")
          .update(`${site.slug}:${site.passcode_hash}`)
          .digest("hex")
      : "";

    if (!expected || supplied !== expected) {
      return {
        ok: false,
        status: 403,
        error: "Microsite access required.",
      };
    }
  }

  const { data: pages, error: pagesError } = await supabase
    .from("microsite_pages")
    .select("draft")
    .eq("microsite_id", micrositeId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (pagesError) {
    return {
      ok: false,
      status: 500,
      error: "Unable to verify published pages.",
    };
  }

  for (const page of pages ?? []) {
    const block = findTracker(
      page.draft as BuilderDraft | null,
      blockId
    );

    if (block) {
      return { ok: true, block };
    }
  }

  // Match the homepage's legacy draft fallback.
  const firstPageDraft = (pages?.[0]?.draft ??
    null) as BuilderDraft | null;

  if (!firstPageDraft?.blocks?.length) {
    const block = findTracker(
      site.draft as BuilderDraft | null,
      blockId
    );

    if (block) {
      return { ok: true, block };
    }
  }

  return {
    ok: false,
    status: 404,
    error: "Published tracker not found.",
  };
}