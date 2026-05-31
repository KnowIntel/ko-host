import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import { logAdminActivity } from "@/lib/admin/logAdminActivity";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

const adminSections = [
  {
    title: "Microsites Manager",
    description: "Review, open, manage, extend, deactivate, and audit platform microsites.",
    href: "/dashboard/admin/microsites",
    status: "Live",
  },
  {
  title: "Featured Microsites",
  description: "Curate homepage showcases, inspiration galleries, and trending microsites.",
  href: "/dashboard/admin/featured",
  status: "Live",
},
  {
    title: "Claim Offer Requests",
    description: "Review custom development requests, attachments, and request statuses.",
    href: "/dashboard/claim-offers",
    status: "Live",
  },

  {
  title: "Feature Requests",
  description: "Review, prioritize, assign, and manage user feature requests.",
  href: "/dashboard/admin/feature-requests",
  status: "Live",
},

{
  title: "Notifications",
  description: "Items requiring attention.",
  href: "/dashboard/admin/notifications",
  status: "Live",
},

  {
    title: "Support Tickets",
    description: "Manage assistance requests, replies, priorities, and linked microsites.",
    href: "/dashboard/admin/support",
    status: "Live",
  },
  {
    title: "Analytics",
    description: "Track platform totals, publish activity, requests, and future traffic insights.",
    href: "/dashboard/admin/analytics",
    status: "Live",
  },
  {
  title: "Payments",
  description: "Review payment health, pending checkouts, paid sites, Stripe readiness, and renewal exposure.",
  href: "/dashboard/admin/payments",
  status: "Live",
},
  {
  title: "System Health",
  description: "Monitor expired sites, publishing issues, Stripe readiness, and urgent queues.",
  href: "/dashboard/admin/health",
  status: "Live",
},
{
  title: "Admin Activity",
  description: "Review logged admin actions, support updates, claim changes, and microsite operations.",
  href: "/dashboard/admin/activity",
  status: "Live",
},
{
  title: "Audit Dashboard",
  description: "Analyze admin activity trends, action frequency, and operational changes.",
  href: "/dashboard/admin/audit",
  status: "Live",
},
  {
  title: "Marketing Campaigns",
  description: "Track Instagram campaigns, QR campaigns, referral traffic, and ad conversions.",
  href: "/dashboard/admin/marketing",
  status: "Live",
},
  {
    title: "Revenue",
    description: "Monitor sales, renewals, Stripe activity, failed payments, and refunds.",
    href: "/dashboard/admin/revenue",
    status: "Live",
  },
  {
  title: "Coupons & Promotions",
  description: "Manage promo codes, free publish campaigns, usage limits, and referral links.",
  href: "/dashboard/admin/coupons",
  status: "Live",
},
  {
    title: "Templates",
    description: "Review registered templates, design layouts, and recommended presets.",
    href: "/dashboard/admin/templates",
    status: "Live",
  },
  {
  title: "Block Registry",
  description: "Manage builder blocks, premium access, beta features, and future usage analytics.",
  href: "/dashboard/admin/blocks",
  status: "Live",
},
  {
  title: "Live Activity",
  description: "Track publishes, submissions, payments, expirations, and admin actions.",
  href: "/dashboard/admin/activity",
  status: "Live",
},
  {
    title: "Users",
    description: "Review user ownership data, microsite counts, and future admin notes.",
    href: "/dashboard/admin/users",
    status: "Live",
  },
  {
  title: "Reported Content",
  description: "Review spam, abuse reports, impersonation claims, and moderation actions.",
  href: "/dashboard/admin/reports",
  status: "Live",
},
{
  title: "Platform Settings",
  description: "Manage platform pricing, limits, and operational configuration.",
  href: "/dashboard/admin/settings",
  status: "Live",
},
  {
    title: "Error Center",
    description: "Track failed emails, Stripe webhooks, uploads, publish errors, and incidents.",
    href: "/dashboard/admin/errors",
    status: "Live",
  },
  {
    title: "Storage",
    description: "Review Supabase buckets, visibility, file limits, and future cleanup tools.",
    href: "/dashboard/admin/storage",
    status: "Live",
  },
{
title: "Email Center",
description: "Track Resend message IDs, request emails, support emails, and future campaign tools.",
href: "/dashboard/admin/email",
status: "Live",
},
  {
    title: "Platform Settings",
    description: "Control pricing, publish duration, feature flags, banners, and maintenance mode.",
    href: "/dashboard/admin/settings",
    status: "Live",
  },
];

export default async function AdminDashboardPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const supabase = getSupabaseAdmin();

const [
  { count: micrositeCount },
  { count: publishedCount },
  { count: supportCount },
  { count: claimOfferCount },
] = await Promise.all([
  supabase
    .from("microsites")
    .select("id", { count: "exact", head: true })
    .eq("is_preset", false),

  supabase
    .from("microsites")
    .select("id", { count: "exact", head: true })
    .eq("is_preset", false)
    .eq("is_published", true),

  supabase
    .from("support_requests")
    .select("id", { count: "exact", head: true }),

  supabase
    .from("claim_offer_requests")
    .select("id", { count: "exact", head: true }),
]);

const quickStats = [
  {
    label: "Microsites",
    value: micrositeCount ?? 0,
  },
  {
    label: "Published",
    value: publishedCount ?? 0,
  },
  {
    label: "Support",
    value: supportCount ?? 0,
  },
  {
    label: "Claim Offers",
    value: claimOfferCount ?? 0,
  },
  {
    label: "Templates",
    value: 26,
  },
  {
    label: "Storage Buckets",
    value: 6,
  },
];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950 p-6 text-white shadow-sm">
        <div className="max-w-3xl">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
            Ko-Host Admin
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Admin Control Center
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-300 sm:text-base">
            A central command dashboard for managing microsites, requests,
            revenue, analytics, users, templates, storage, and platform health.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
  {quickStats.map((stat) => (
    <div
      key={stat.label}
      className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
        {stat.label}
      </div>

      <div className="mt-3 text-3xl font-black tracking-tight text-neutral-950">
        {stat.value}
      </div>
    </div>
  ))}
</section>

<section className="overflow-visible rounded-3xl border border-neutral-200 bg-white p-6 pb-10 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-lg font-black text-neutral-950">
        Quick Actions
      </h2>

      <p className="mt-1 text-sm text-neutral-600">
        Frequently used admin tools.
      </p>
    </div>
  </div>

  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <Link
      href="/dashboard/admin/microsites"
      className="flex min-h-[88px] items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-center text-sm font-bold text-neutral-900 hover:bg-neutral-100"
    >
      Manage Microsites
    </Link>

    <Link
    href="/dashboard/admin/email"
    className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
    >
    Email Center
    </Link>

    <Link
      href="/dashboard/claim-offers"
      className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
    >
      Review Claim Offers
    </Link>

<Link
  href="/dashboard/admin/feature-requests"
  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
>
  Feature Requests
</Link>

    <Link
      href="/dashboard/admin/support"
      className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
    >
      Open Support Queue
    </Link>

    <Link
  href="/dashboard/admin/settings"
  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
>
  Platform Settings
</Link>

    <Link
  href="/dashboard/admin/audit"
  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
>
  Audit Dashboard
</Link>

    <Link
      href="/dashboard/admin/errors"
      className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
    >
      Review Errors
    </Link>
  </div>
</section>

<Link
  href="/dashboard/admin/health"
  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
>
  System Health
</Link>

<Link
  href="/dashboard/admin/activity"
  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
>
  Admin Activity
</Link>

<Link
  href="/dashboard/admin/payments"
  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
>
  Payments
</Link>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminSections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-black tracking-tight text-neutral-950">
                {section.title}
              </h2>

              <span
                className={[
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
                  section.status === "Live"
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                    : section.status === "Next"
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                      : "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
                ].join(" ")}
              >
                {section.status}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {section.description}
            </p>

            <div className="mt-5 text-sm font-bold text-neutral-950">
              Open section{" "}
              <span className="inline-block transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}