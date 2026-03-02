// app/s/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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

  if (error) {
    // deterministic: log and show 404 to avoid leaking internal errors publicly
    console.error("microsite lookup failed", { slug, error });
    return notFound();
  }

  if (!site) return notFound();

  const now = new Date();
  const isExpired = site.expires_at ? new Date(site.expires_at) <= now : false;

  if (!site.is_published || isExpired) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-neutral-600">Ko-Host</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            This site isn’t available
          </h1>
          <p className="mt-3 text-sm text-neutral-700">
            {isExpired
              ? "This microsite has expired."
              : "This microsite is not published yet."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">Ko-Host Public Microsite</div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {site.title || `${site.slug}.ko-host.com`}
        </h1>

        <div className="mt-3 text-sm text-neutral-700">
          <div>
            <span className="font-medium">Template:</span>{" "}
            <span className="font-mono">{site.template_key}</span>
          </div>
          <div className="mt-1">
            <span className="font-medium">Slug:</span>{" "}
            <span className="font-mono">{site.slug}</span>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
          <div className="font-medium">Next</div>
          <div className="mt-1">
            Phase 4 will render the actual template modules (RSVP, polls, gallery,
            etc.) based on <code className="rounded bg-white px-1 py-0.5">template_key</code>.
          </div>
        </div>
      </div>
    </main>
  );
}