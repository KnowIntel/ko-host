// app/s/[slug]/page.tsx
import { cookies } from "next/headers";
import crypto from "crypto";
import PlacedBlocksPreview from "@/components/preview/PlacedBlocksPreview";
import MicrositeFooterBrand from "@/components/microsite/MicrositeFooterBrand";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { BuilderDraft } from "@/lib/templates/builder";
import PrivateMicrositeAccessForm from "@/components/microsite/PrivateMicrositeAccessForm";

export const dynamic = "force-dynamic";

type MicrositeRow = {
  id: string;
  slug: string;
  title: string | null;
  is_active?: boolean | null;
  is_published: boolean | null;
  paid_until: string | null;
  selected_design_key: string | null;
  site_visibility: string | null;
  private_mode: boolean | null;
  passcode_hash: string | null;
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

function PageShell({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <>
      <main className="min-h-screen bg-[#fcfbf8] px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-base font-semibold text-neutral-900">{title}</div>
          <div className="mt-2 text-sm text-neutral-600">{message}</div>
        </div>
      </main>
      <MicrositeFooterBrand />
    </>
  );
}

export default async function PublishedMicrositePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const safeSlug = decodeURIComponent(String(slug || "")).trim().toLowerCase();

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

  const isPrivate =
    microsite.site_visibility === "private" || microsite.private_mode;

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
        <>
          <main className="min-h-screen bg-[#fcfbf8] px-4 py-16">
            <div className="mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="text-base font-semibold text-neutral-900">
                Passcode required
              </div>
              <div className="mt-2 text-sm text-neutral-600">
                Enter the 6-digit passcode to access this microsite.
              </div>

              <div className="mt-6">
                <PrivateMicrositeAccessForm slug={safeSlug} />
              </div>
            </div>
          </main>
          <MicrositeFooterBrand />
        </>
      );
    }
  }

  const draft = microsite.draft ?? null;
  const designKey = microsite.selected_design_key || "blank";

  if (!draft) {
    return (
      <PageShell
        title="Page unavailable"
        message="No published microsite content available."
      />
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#fcfbf8] text-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <PlacedBlocksPreview draft={draft} designKey={designKey} />
        </div>
      </main>

      <MicrositeFooterBrand />
    </>
  );
}