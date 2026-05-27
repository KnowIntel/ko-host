import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return <div className="p-6">Unauthorized</div>;
  }

  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  const isAdmin = userEmail === ADMIN_EMAIL;

  const sb = getSupabaseAdmin();

  const { data: entitlement } = await sb
    .from("entitlements")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("template_key", "wedding_rsvp")
    .maybeSingle();

  const isActive = entitlement?.status === "active";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

        <p className="mt-2 text-sm text-neutral-700">
          Manage your templates, microsites, and submissions.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/microsites"
            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            View Microsites
          </Link>

          {isAdmin ? (
            <Link
              href="/dashboard/claim-offers"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
            >
              Claim Offer Requests
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-base font-semibold">Wedding RSVP Template</div>

        {isActive ? (
          <div className="mt-3 text-sm font-medium text-green-600">
            Active Subscription
          </div>
        ) : (
          <>
            <div className="mt-1 text-sm text-neutral-700">
              Subscribe to unlock publishing Wedding RSVP microsites.
            </div>

            <form action="/api/stripe/checkout" method="POST" className="mt-4">
              <input type="hidden" name="templateKey" value="wedding_rsvp" />

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Subscribe ($12/microsite)
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}