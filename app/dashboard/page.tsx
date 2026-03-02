// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6">Unauthorized</div>;
  }

  const sb = getSupabaseAdmin();

  const { data: entitlement } = await sb
    .from("entitlements")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("template_key", "wedding_rsvp")
    .maybeSingle();

  const isActive = entitlement?.status === "active";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="text-base font-semibold">Wedding RSVP Template</div>

        {isActive ? (
          <div className="mt-3 text-sm text-green-600 font-medium">
            Active Subscription
          </div>
        ) : (
          <>
            <div className="mt-1 text-sm text-neutral-700">
              Subscribe to unlock publishing Wedding RSVP microsites.
            </div>

            <form action="/api/stripe/checkout" method="POST" className="mt-4">
              <input
                type="hidden"
                name="templateKey"
                value="wedding_rsvp"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Subscribe ($14/mo)
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}