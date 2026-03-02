// app/s/[slug]/page.tsx
import { notFound } from "next/navigation";

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

  // Phase 3 step 3 will load microsite by slug from Supabase and render based on template.
  // For now, show a deterministic placeholder so routing can be verified.
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">Ko-Host Public Microsite</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {slug}.ko-host.com
        </h1>
        <p className="mt-3 text-sm text-neutral-700">
          Routing is working. Next, we’ll load the microsite record from Supabase
          by slug and render the selected template modules.
        </p>

        <div className="mt-6 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
          <div className="font-medium">Dev tip</div>
          <div className="mt-1">
            You can test locally with{" "}
            <code className="rounded bg-white px-1 py-0.5">/s/{slug}</code>.
          </div>
        </div>
      </div>
    </main>
  );
}