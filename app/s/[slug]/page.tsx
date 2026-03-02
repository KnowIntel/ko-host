// app/s/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import RsvpForm from "./RsvpForm";

export const dynamic = "force-dynamic";

function isValidSlug(slug: string) {
  return /^[a-z0-9-]{2,40}$/.test(slug);
}

export default async function PublicMicrositePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isValidSlug(slug)) return notFound();

  const sb = getSupabaseAdmin();

  const { data: site, error } = await sb
    .from("microsites")
    .select("id, slug, title, template_key, is_published, expires_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !site) return notFound();

  const now = new Date();
  const isExpired = site.expires_at ? new Date(site.expires_at) <= now : false;

  if (!site.is_published || isExpired) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-neutral-600">Ko-Host</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">This site isn’t available</h1>
          <p className="mt-3 text-sm text-neutral-700">
            {isExpired ? "This microsite has expired." : "This microsite is not published yet."}
          </p>
        </div>
      </main>
    );
  }

  const isWedding = site.template_key === "wedding_rsvp";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">Ko-Host</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {site.title || `${site.slug}.ko-host.com`}
        </h1>
        <div className="mt-2 text-sm text-neutral-700">
          Template: <span className="font-mono">{site.template_key}</span>
        </div>
      </div>

      <div className="mt-6">
        {isWedding ? (
          <RsvpForm micrositeSlug={site.slug} />
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-neutral-600">Modules</div>
            <div className="mt-2 text-sm text-neutral-700">
              This template’s modules will be implemented next.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}