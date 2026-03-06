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
  site_visibility?: "public" | "private" | null;
  private_mode?: "passcode" | "members_only" | null;
  passcode_hash?: string | null;
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
    .select(
      "id, slug, title, is_published, paid_until, owner_clerk_user_id, site_visibility, private_mode, passcode_hash"
    )
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

  const currentVisibility = microsite.site_visibility === "private" ? "private" : "public";
  const currentPrivateMode =
    microsite.private_mode === "members_only" ? "members_only" : "passcode";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Microsite Settings</h1>
            <p className="mt-2 text-sm text-neutral-700">
              Manage visibility, then generate QR codes and share cards for this microsite.
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

        <form
          action={`/api/dashboard/microsites/${microsite.id}/settings`}
          method="POST"
          className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <div className="text-sm font-semibold text-neutral-900">Site visibility</div>
          <div className="mt-1 text-xs text-neutral-500">
            Public sites open instantly. Private sites require controlled access.
          </div>

          <div className="mt-4 space-y-3">
            <label
              className={[
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
                currentVisibility === "public"
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 bg-white",
              ].join(" ")}
            >
              <input
                type="radio"
                name="siteVisibility"
                value="public"
                defaultChecked={currentVisibility === "public"}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-semibold text-neutral-900">Public</div>
                <div className="text-xs text-neutral-500">
                  Anyone with the link can access the microsite.
                </div>
              </div>
            </label>

            <label
              className={[
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
                currentVisibility === "private"
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 bg-white",
              ].join(" ")}
            >
              <input
                type="radio"
                name="siteVisibility"
                value="private"
                defaultChecked={currentVisibility === "private"}
                className="mt-0.5"
              />
              <div className="w-full">
                <div className="text-sm font-semibold text-neutral-900">Private</div>
                <div className="text-xs text-neutral-500">
                  Restrict access by passcode or approved member device.
                </div>

                <div className="mt-4 space-y-3 rounded-xl border border-neutral-200 bg-white p-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="privateMode"
                      value="passcode"
                      defaultChecked={currentPrivateMode === "passcode"}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Passcode</div>
                      <div className="text-xs text-neutral-500">
                        Visitors enter a 6-digit code to access the site.
                      </div>
                    </div>
                  </label>

                  <div>
                    <label className="text-xs font-medium text-neutral-700">
                      6-digit passcode
                    </label>
                    <input
                      type="text"
                      name="passcode"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={6}
                      placeholder={
                        microsite.passcode_hash ? "•••••• (leave blank to keep current)" : "123456"
                      }
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                    <div className="mt-1 text-[11px] text-neutral-500">
                      Enter a new 6-digit passcode, or leave blank to keep the current one.
                    </div>
                  </div>

                  <label className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="privateMode"
                      value="members_only"
                      defaultChecked={currentPrivateMode === "members_only"}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">
                        Members-only
                      </div>
                      <div className="text-xs text-neutral-500">
                        Only approved member devices should be allowed to access this microsite.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </label>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Save visibility settings
            </button>
          </div>
        </form>

        <div className="mt-6">
          <QRGeneratorClient microsites={[microsite]} />
        </div>
      </div>
    </main>
  );
}