import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

const couponTools = [
  "Promo codes",
  "Free publish campaigns",
  "Usage limits",
  "Expiration dates",
  "Influencer codes",
  "Referral campaigns",
  "Discount types",
  "Coupon analytics",
];

export default async function AdminCouponsPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Coupons & Promotions
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Future manager for promo codes, free publish campaigns, referral links, and discount tracking.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
          >
            Back to Admin
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-950">
          Future Promotion Tools
        </h2>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {couponTools.map((tool) => (
            <div
              key={tool}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700"
            >
              {tool}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-center text-sm font-bold text-neutral-500">
          Promotions table placeholder
        </div>
      </section>
    </div>
  );
}