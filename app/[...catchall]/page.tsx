import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BuilderBlocksRenderer from "@/app/s/[slug]/BuilderBlocksRenderer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { MicrositeBlock } from "@/lib/templates/builder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  paid_until: string | null;
  site_visibility?: string | null;
  draft?: {
    title?: string;
    slugSuggestion?: string;
    blocks?: MicrositeBlock[];
  } | null;
};

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

function extractSlugFromHost(host: string) {
  const cleanHost = host.split(":")[0].toLowerCase();

  if (
    cleanHost === "ko-host.com" ||
    cleanHost === "www.ko-host.com" ||
    cleanHost === "localhost" ||
    cleanHost.endsWith(".vercel.app")
  ) {
    return null;
  }

  if (cleanHost.endsWith(".ko-host.com")) {
    const parts = cleanHost.split(".");
    if (parts.length >= 3) {
      return parts[0];
    }
  }

  return null;
}

export default async function PublicSubdomainPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const slug = extractSlugFromHost(host);

  if (!slug) {
    notFound();
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("microsites")
    .select("id, slug, title, is_published, paid_until, site_visibility, draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    notFound();
  }

  const site = data as MicrositeRow | null;

  if (!site) {
    notFound();
  }

  if (!site.is_published) {
    notFound();
  }

  if (!isPaidActive(site.paid_until)) {
    notFound();
  }

  const blocks = Array.isArray(site.draft?.blocks) ? site.draft.blocks : [];

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="mb-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            {site.title || "Untitled Microsite"}
          </h1>
        </div>

        {blocks.length > 0 ? (
          <BuilderBlocksRenderer blocks={blocks} />
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">
              No content yet
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              This microsite has no saved builder blocks yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}