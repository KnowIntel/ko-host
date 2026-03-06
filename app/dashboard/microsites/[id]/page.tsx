// app/dashboard/microsites/[id]/page.tsx

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type MicrositeRecord = {
  id: string;
  owner_clerk_user_id: string;
  template_key: string;
  slug: string;
  title: string | null;
  is_published: boolean;
  paid_until: string | null;
  created_at: string;
  updated_at?: string | null;
};

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

export default async function MicrositeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("microsites")
    .select(`
      id,
      owner_clerk_user_id,
      template_key,
      slug,
      title,
      is_published,
      paid_until,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("microsite detail failed", error);
    return <div className="p-6">Failed to load microsite.</div>;
  }

  const microsite = data as MicrositeRecord | null;

  if (!microsite) {
    notFound();
  }

  if (microsite.owner_clerk_user_id !== userId) {
    return <div className="p-6">Forbidden</div>;
  }

  const active = isPaidActive(microsite.paid_until);
  const publicUrl = `https://${microsite.slug}.ko-host.com`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-neutral-600">Microsite Manager</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {microsite.title || "(Untitled)"}
            </h1>
            <p className="mt-2 text-sm text-neutral-700">
              Manage this microsite’s access, preview, submissions, and settings.
            </p>
          </div>

          <Link
            href="/dashboard/microsites"
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Back to Microsites
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Title
            </div>
            <div className="mt-2 text-base font-medium text-neutral-900">
              {microsite.title || "(Untitled)"}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Template
            </div>
            <div className="mt-2 font-mono text-sm text-neutral-900">
              {microsite.template_key}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Slug
            </div>
            <div className="mt-2 font-mono text-sm text-neutral-900">
              {microsite.slug}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Public URL
            </div>
            <div className="mt-2 break-all font-mono text-sm text-neutral-900">
              {publicUrl}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Access
            </div>
            <div className="mt-2">
              {active ? (
                <>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                  <div className="mt-2 text-sm text-neutral-700">
                    Paid until{" "}
                    <span className="font-medium">
                      {new Date(microsite.paid_until as string).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                    Not paid
                  </span>
                  <div className="mt-2 text-sm text-neutral-700">
                    Purchase 90 days of access to activate this microsite.
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Published
            </div>
            <div className="mt-2">
              {microsite.is_published ? (
                <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  Yes
                </span>
              ) : (
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                  No
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`/s/${microsite.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Preview Microsite
          </a>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Open Public URL
          </a>

          <Link
            href={`/dashboard/microsites/${microsite.id}/rsvp`}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            View RSVP Submissions
          </Link>

          <Link
            href={`/dashboard/microsites/${microsite.id}/settings`}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Settings
          </Link>

          <form action="/api/stripe/checkout" method="POST" className="inline-flex">
            <input type="hidden" name="micrositeId" value={microsite.id} />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              {active ? "Extend 90 days" : "Pay $12 (90 days)"}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          Publish and unpublish are currently managed from the main microsites table.
        </div>
      </div>
    </main>
  );
}