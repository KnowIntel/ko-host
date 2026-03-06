// app/dashboard/microsites/[id]/page.tsx

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type MicrositeRecord = {
  id: string;
  owner_clerk_user_id: string;
  slug: string;
  title: string | null;
};

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
    .select("id, owner_clerk_user_id, slug, title")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-red-900">
            Failed to load microsite
          </h1>

          <div className="mt-4 space-y-2 text-sm text-red-900">
            <div>
              <span className="font-semibold">Microsite ID:</span> {id}
            </div>
            <div>
              <span className="font-semibold">User ID:</span> {userId}
            </div>
            <div>
              <span className="font-semibold">Error message:</span> {error.message}
            </div>
            <div>
              <span className="font-semibold">Error code:</span> {error.code ?? "(none)"}
            </div>
            <div>
              <span className="font-semibold">Error details:</span> {error.details ?? "(none)"}
            </div>
            <div>
              <span className="font-semibold">Error hint:</span> {error.hint ?? "(none)"}
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/dashboard/microsites"
              className="text-sm font-medium text-red-900 underline underline-offset-4"
            >
              Back to Microsites
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const microsite = data as MicrositeRecord | null;

  if (!microsite) {
    notFound();
  }

  if (microsite.owner_clerk_user_id !== userId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Forbidden</h1>
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
        <div className="text-sm text-neutral-600">Microsite Manager</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {microsite.title || "(Untitled)"}
        </h1>
        <p className="mt-2 text-sm text-neutral-700">
          Debug load succeeded.
        </p>

        <div className="mt-6 space-y-2 text-sm text-neutral-800">
          <div>
            <span className="font-semibold">ID:</span> {microsite.id}
          </div>
          <div>
            <span className="font-semibold">Slug:</span> {microsite.slug}
          </div>
          <div>
            <span className="font-semibold">Owner:</span> {microsite.owner_clerk_user_id}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard/microsites"
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Back to Microsites
          </Link>
        </div>
      </div>
    </main>
  );
}