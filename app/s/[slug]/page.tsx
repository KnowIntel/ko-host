// app\s\[slug]\page.tsx

import { cookies } from "next/headers";
import crypto from "crypto";
import PlacedBlocksPreview from "@/components/preview/PlacedBlocksPreview";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { BuilderDraft } from "@/lib/templates/builder";
import PrivateMicrositeAccessForm from "@/components/microsite/PrivateMicrositeAccessForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MicrositeRow = {
  id: string;
  slug: string;
  title: string | null;
  is_active?: boolean | null;
  is_published: boolean | null;
  paid_until: string | null;
  selected_design_key: string | null;
  site_visibility: string | null;
  private_mode: string | boolean | null;
  passcode_hash: string | null;
  draft: BuilderDraft | null;
};

type MicrositePageRow = {
  id: string;
  slug: string;
  draft: BuilderDraft | null;
};

function isActivePaidWindow(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

function buildMicrositeAccessCookieName(slug: string) {
  return `kht_access_${slug}`;
}

function buildMicrositeAccessCookieValue(slug: string, passcodeHash: string) {
  return crypto
    .createHash("sha256")
    .update(`${slug}:${passcodeHash}`)
    .digest("hex");
}

function normalizePrivateMode(value: string | boolean | null) {
  if (typeof value === "string") return value;
  if (value === true) return "passcode";
  return "none";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function deterministicUuid(seed: string) {
  const hex = crypto.createHash("sha256").update(seed).digest("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80)
      .toString(16)
      .padStart(2, "0")}${hex.slice(18, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}

function remapDraftPollIds(inputDraft: BuilderDraft, micrositeId: string) {
  const nextDraft = JSON.parse(JSON.stringify(inputDraft)) as BuilderDraft;
  const pollIdMap = new Map<string, string>();

  if (!Array.isArray(nextDraft.blocks)) {
    return { draft: nextDraft, changed: false };
  }

  let changed = false;

  nextDraft.blocks = nextDraft.blocks.map((block: any) => {
    if (block?.type !== "poll") return block;

    const originalPollId = String(block.id || "");
    const nextPollId = isUuid(originalPollId)
      ? originalPollId
      : deterministicUuid(`poll:${micrositeId}:${originalPollId}`);

    if (nextPollId !== originalPollId) {
      changed = true;
    }

    pollIdMap.set(originalPollId, nextPollId);

    return {
      ...block,
      id: nextPollId,
      data: {
        ...block.data,
        options: Array.isArray(block.data?.options)
          ? block.data.options.map((option: any) => {
              const originalOptionId = String(option?.id || "");
              const nextOptionId = isUuid(originalOptionId)
                ? originalOptionId
                : deterministicUuid(
                    `poll-option:${micrositeId}:${originalPollId}:${originalOptionId}`,
                  );

              if (nextOptionId !== originalOptionId) {
                changed = true;
              }

              return {
                ...option,
                id: nextOptionId,
              };
            })
          : [],
      },
    };
  });

  nextDraft.blocks = nextDraft.blocks.map((block: any) => {
    if (
      block?.type === "highlight" &&
      block?.data?.mode === "poll_results" &&
      typeof block?.data?.sourceBlockId === "string" &&
      pollIdMap.has(block.data.sourceBlockId)
    ) {
      changed = true;
      return {
        ...block,
        data: {
          ...block.data,
          sourceBlockId:
            pollIdMap.get(block.data.sourceBlockId) || block.data.sourceBlockId,
        },
      };
    }

    return block;
  });

  return { draft: nextDraft, changed };
}

function PageShell({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-screen bg-[#fcfbf8] px-4 py-16">
      <div className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-base font-semibold text-neutral-900">{title}</div>
        <div className="mt-2 text-sm text-neutral-600">{message}</div>
      </div>
    </main>
  );
}

export default async function PublishedMicrositePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ access?: string }>;
}) {
  const { slug } = await params;
  const { access } = await searchParams;
  const safeSlug = decodeURIComponent(String(slug || ""))
    .trim()
    .toLowerCase();

  if (!safeSlug) {
    return (
      <PageShell
        title="Page unavailable"
        message="No published microsite content available."
      />
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("microsites")
    .select(
      "id, slug, title, is_active, is_published, paid_until, selected_design_key, site_visibility, private_mode, passcode_hash, draft",
    )
    .eq("slug", safeSlug)
    .maybeSingle();

  if (error || !data) {
    return (
      <PageShell
        title="Page unavailable"
        message="This microsite could not be found."
      />
    );
  }

  const microsite = data as MicrositeRow;

  if (microsite.is_active === false) {
    return (
      <PageShell
        title="Page unavailable"
        message="This microsite has been deactivated."
      />
    );
  }

  if (!microsite.is_published) {
    return (
      <PageShell
        title="Page unavailable"
        message="This microsite is currently unpublished."
      />
    );
  }

  if (!isActivePaidWindow(microsite.paid_until)) {
    return (
      <PageShell
        title="Page unavailable"
        message="This microsite is not currently active."
      />
    );
  }

  const privateMode = normalizePrivateMode(microsite.private_mode);
  const isPrivate =
    microsite.site_visibility === "private" && privateMode === "passcode";

  if (isPrivate) {
    const cookieStore = await cookies();
    const accessCookieName = buildMicrositeAccessCookieName(safeSlug);
    const accessCookieValue = cookieStore.get(accessCookieName)?.value || "";

    const expectedCookieValue = microsite.passcode_hash
      ? buildMicrositeAccessCookieValue(safeSlug, microsite.passcode_hash)
      : "";

    const hasAccess =
      Boolean(microsite.passcode_hash) &&
      Boolean(accessCookieValue) &&
      accessCookieValue === expectedCookieValue;

    if (!hasAccess) {
      return (
        <main className="min-h-screen bg-[#fcfbf8] px-4 py-16">
          <div className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-neutral-900">
              Passcode required
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              Enter the passcode to access this microsite.
            </div>

            {access === "invalid" ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Invalid passcode. Please try again.
              </div>
            ) : null}

            <div className="mt-6">
              <PrivateMicrositeAccessForm
                slug={safeSlug}
                returnTo={`/s/${safeSlug}`}
              />
            </div>
          </div>
        </main>
      );
    }
  }

  const { data: pages } = await supabaseAdmin
    .from("microsite_pages")
    .select("id, slug, draft, display_order")
    .eq("microsite_id", microsite.id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1);

  const firstPage = (pages?.[0] || null) as MicrositePageRow | null;
  const homeDraft = firstPage?.draft ?? null;

  const initialDraft =
    (homeDraft && homeDraft.blocks?.length ? homeDraft : null) ??
    microsite.draft ??
    null;

  let draft = initialDraft;

  if (draft) {
        const remapped = remapDraftPollIds(draft, microsite.id);

    if (remapped.changed) {
      draft = remapped.draft;

      if (firstPage?.id) {
        await supabaseAdmin
          .from("microsite_pages")
          .update({
            draft,
          })
          .eq("id", firstPage.id);
      }

      await supabaseAdmin
        .from("microsites")
        .update({
          draft,
        })
        .eq("id", microsite.id);

      const pollBlocks = Array.isArray((draft as any)?.blocks)
        ? (draft as any).blocks.filter((block: any) => block?.type === "poll")
        : [];

      const { data: existingPolls, error: existingPollsError } = await supabaseAdmin
        .from("polls")
        .select("id")
        .eq("microsite_id", microsite.id);

      if (existingPollsError) {
        throw new Error(`existing polls lookup failed: ${existingPollsError.message}`);
      }

      const existingPollIds = (existingPolls ?? []).map((poll) => poll.id);

      if (existingPollIds.length > 0) {
        const { error: deletePollOptionsError } = await supabaseAdmin
          .from("poll_options")
          .delete()
          .in("poll_id", existingPollIds);

        if (deletePollOptionsError) {
          throw new Error(`poll_options delete failed: ${deletePollOptionsError.message}`);
        }

        const { error: deletePollsError } = await supabaseAdmin
          .from("polls")
          .delete()
          .eq("microsite_id", microsite.id);

        if (deletePollsError) {
          throw new Error(`polls delete failed: ${deletePollsError.message}`);
        }
      }

      if (pollBlocks.length > 0) {
        const { error: insertPollsError } = await supabaseAdmin
          .from("polls")
          .insert(
            pollBlocks.map((block: any) => ({
              id: block.id,
              microsite_id: microsite.id,
              is_multi_select: false,
              is_open: true,
              show_results_public: true,
            })),
          );

        if (insertPollsError) {
          throw new Error(`polls insert failed: ${insertPollsError.message}`);
        }

        const optionRows = pollBlocks.flatMap((block: any) =>
          (Array.isArray(block?.data?.options) ? block.data.options : []).map(
            (option: any, index: number) => ({
              id: option.id,
              poll_id: block.id,
              label: option.text || "Option",
              sort_order: index,
            }),
          ),
        );

        if (optionRows.length > 0) {
          const { error: insertPollOptionsError } = await supabaseAdmin
            .from("poll_options")
            .insert(optionRows);

          if (insertPollOptionsError) {
            throw new Error(`poll_options insert failed: ${insertPollOptionsError.message}`);
          }
        }
      }
    }
  }

  const designKey = microsite.selected_design_key || "blank";

  if (!draft) {
    return (
      <PageShell
        title="Page unavailable"
        message="No published microsite content available."
      />
    );
  }

  const pageColor =
    (((draft as any)?.pageColor && String((draft as any).pageColor).trim()) ||
      "#fcfbf8") as string;

  const pageBackgroundImage = String(
    (draft as any)?.pageBackgroundImage || "",
  ).trim();

  const pageBackgroundImageFit = ((draft as any)?.pageBackgroundImageFit ||
    "zoom") as "clip" | "zoom" | "stretch";

  const pageBackgroundSize =
    pageBackgroundImageFit === "clip"
      ? "contain"
      : pageBackgroundImageFit === "stretch"
        ? "100% 100%"
        : "cover";

return (
  <main
  className="w-screen max-w-none overflow-hidden text-neutral-900"
    style={{
      minHeight: "100vh",
      width: "100%",
      margin: 0,
      padding: 0,
      backgroundColor: pageColor,
      ...(pageBackgroundImage
        ? {
            backgroundImage: `url("${pageBackgroundImage}")`,
            backgroundSize: pageBackgroundSize,
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }
        : {}),
    }}
  >
    <div className="w-screen max-w-none overflow-hidden">
<PlacedBlocksPreview
  draft={draft}
  designKey={designKey}
  micrositeId={microsite.id}
  micrositeSlug={microsite.slug}
  serverNow={Date.now()}
  hideFrame={true}
/>
    </div>
  </main>
);
}