import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import QRGeneratorClient from "@/app/dashboard/settings/QRGeneratorClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

type MicrositeRow = {
  id: string;
  slug: string;
  title: string | null;
  is_published: boolean;
  paid_until: string | null;
  owner_clerk_user_id: string;
};

export default async function MicrositeSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("microsites")
    .select("id, slug, title, is_published, paid_until, owner_clerk_user_id")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Microsite Settings</h1>
          <p className="mt-2 text-sm text-red-600">Failed to load microsite settings.</p>
        </div>
      </main>
    );
  }

  const microsite = (data ?? null) as MicrositeRow | null;

  if (!microsite) {
    notFound();
  }

  if (microsite.owner_clerk_user_id !== userId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Forbidden</h1>
          <p className="mt-2 text-sm text-neutral-700">
            This microsite does not belong to the current user.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Microsite Settings</h1>
            <p className="mt-2 text-sm text-neutral-700">
              Generate QR codes and share cards for this microsite only.
            </p>
          </div>

          <Link
            href={`/dashboard/microsites/${microsite.id}`}
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Back to Microsite
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Selected Microsite
          </div>
          <div className="mt-2 text-base font-medium text-neutral-900">
            {microsite.title || microsite.slug}
          </div>
          <div className="mt-1 font-mono text-sm text-neutral-600">
            https://{microsite.slug}.ko-host.com
          </div>
        </div>

        <div className="mt-6">
          <QRGeneratorClient microsites={[microsite]} />
        </div>
      </div>
    </main>
  );
}