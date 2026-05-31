import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

const settings = [
  {
    key: "microsite_price",
    value: "$12",
    description: "Standard microsite purchase price",
  },
  {
    key: "microsite_duration_days",
    value: "90",
    description: "Microsite active duration",
  },
  {
    key: "claim_offer_price",
    value: "$99",
    description: "Claim Offer base pricing",
  },
  {
    key: "maintenance_mode",
    value: "Disabled",
    description: "Platform maintenance mode",
  },
  {
    key: "max_upload_size_mb",
    value: "10",
    description: "Default upload limit",
  },
];

export default async function AdminSettingsPage() {
  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

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
              Platform Settings
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Configure platform-wide pricing, durations, limits, and operational settings.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Settings" value={settings.length} />
        <Stat label="Microsite Price" value="$12" />
        <Stat label="Duration" value="90 Days" />
        <Stat label="Claim Offer" value="$99" />
        <Stat label="Maintenance" value="Disabled" />
      </section>

      <section className="grid gap-4">
        {settings.map((setting) => (
          <div
            key={setting.key}
            className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-black text-neutral-950">
                  {setting.key}
                </div>

                <div className="mt-1 text-sm text-neutral-500">
                  {setting.description}
                </div>
              </div>

              <div className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-900">
                {setting.value}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-950">
          Future Configuration Controls
        </h2>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Microsite Pricing",
            "Claim Offer Pricing",
            "Duration Settings",
            "Maintenance Mode",
            "Upload Limits",
            "Feature Flags",
            "Email Templates",
            "Stripe Configuration",
            "Platform Branding",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-black tracking-tight text-neutral-950">
        {value}
      </div>
    </div>
  );
}