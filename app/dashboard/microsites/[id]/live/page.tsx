import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import LiveManager from "@/components/live/admin/LiveManager";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function MicrositeLiveManagerPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="p-6">
        Unauthorized
      </div>
    );
  }

  const sb = getSupabaseAdmin();

  const {
    data: site,
    error: siteError,
  } = await sb
    .from("microsites")
    .select(
      "id, owner_clerk_user_id, slug, title",
    )
    .eq("id", id)
    .maybeSingle();

  if (siteError || !site) {
    return notFound();
  }

  if (
    site.owner_clerk_user_id !== userId
  ) {
    return (
      <div className="p-6">
        Forbidden
      </div>
    );
  }

  const {
    data: experience,
    error: experienceError,
  } = await sb
    .from("live_experiences")
    .select(
      "id, name, status, is_enabled",
    )
    .eq("microsite_id", site.id)
    .eq(
      "owner_clerk_user_id",
      userId,
    )
    .maybeSingle();

  if (experienceError) {
    console.error(
      "Live Manager experience lookup failed:",
      experienceError,
    );

    return (
      <div className="p-6">
        Failed to load Live Manager.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm text-neutral-600">
              Ko-Host
            </div>

            <h1 className="mt-2 text-xl font-semibold tracking-tight">
              Live Manager
            </h1>

            <div className="mt-2 text-sm text-neutral-700">
              <div>
                <span className="font-medium">
                  Microsite:
                </span>{" "}
                {site.title ||
                  "(Untitled)"}
              </div>

              <div>
                <span className="font-medium">
                  Slug:
                </span>{" "}
                <span className="font-mono">
                  {site.slug}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/microsites/${site.id}`}
              className="text-sm font-medium text-neutral-900 underline underline-offset-4"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      {!experience ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Live is not enabled
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Open this microsite in the
            builder and add a Live block
            to initialize its Live
            experience.
          </p>
        </div>
      ) : (
        <LiveManager
          micrositeId={site.id}
          experience={{
            id: experience.id,
            name: experience.name,
            status:
              experience.status,
            isEnabled:
              experience.is_enabled,
          }}
        />
      )}
    </div>
  );
}