import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import GalleryUploaderClient from "./GalleryUploaderClient";

export const dynamic = "force-dynamic";

export default async function MicrositeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const sb = getSupabaseAdmin();

  const { data: site, error } = await sb
    .from("microsites")
    .select("id, slug, title, template_key, is_published, paid_until, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !site) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-neutral-600">Dashboard</div>
          <h1 className="mt-2 text-2xl font-semibold">Microsite not found</h1>
          <div className="mt-4">
            <Link className="text-sm underline" href="/dashboard/microsites">
              Back to microsites
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Ownership check (server-side)
  // NOTE: this relies on your microsites table having owner_clerk_user_id (it does)
  const { data: ownerRow } = await sb
    .from("microsites")
    .select("owner_clerk_user_id")
    .eq("id", id)
    .maybeSingle();

  if (!ownerRow || ownerRow.owner_clerk_user_id !== userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Forbidden</h1>
          <p className="mt-2 text-sm text-neutral-700">You don’t have access to this microsite.</p>
        </div>
      </main>
    );
  }

  const publicUrl = `/s/${site.slug}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">Microsite</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {site.title || site.slug}
        </h1>
        <div className="mt-2 text-sm text-neutral-700">
          Template: <span className="font-mono">{site.template_key}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm"
            href={publicUrl}
            target="_blank"
          >
            View public page
          </Link>

          <Link
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm"
            href="/dashboard/microsites"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        {site.template_key === "wedding_rsvp" ? (
          <GalleryUploaderClient micrositeId={site.id} />
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-neutral-600">Gallery</div>
            <div className="mt-2 text-sm text-neutral-700">
              Gallery is only enabled for the <span className="font-mono">wedding_rsvp</span>{" "}
              template right now.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}