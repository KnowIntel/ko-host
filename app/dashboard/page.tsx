// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-2 text-sm text-neutral-700">
        Signed in as <span className="font-mono">{userId ?? "unknown"}</span>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="text-base font-semibold">Wedding RSVP Template</div>
        <div className="mt-1 text-sm text-neutral-700">
          Subscribe to unlock publishing Wedding RSVP microsites. ($14/month)
        </div>

        <form action="/api/stripe/checkout" method="POST" className="mt-4">
          {/* Minimal no-JS checkout trigger (fast + reliable).
              We send JSON via hidden input and parse server-side. */}
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

        <p className="mt-3 text-xs text-neutral-600">
          You can cancel anytime in Stripe Customer Portal (we’ll add that next).
        </p>
      </div>
    </div>
  );
}