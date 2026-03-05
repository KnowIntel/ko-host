import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getTemplateDef } from "@/lib/templates/registry";

export const dynamic = "force-dynamic";

function templateKeyFromSubdomain(sub: string): string | null {
  const s = (sub || "").trim().toLowerCase();

  const map: Record<string, string> = {
    wedding: "wedding_rsvp",
    baby: "baby_shower",
    birthday: "party_birthday",
    reunion: "family_reunion",
    memorial: "memorial_tribute",
    openhouse: "open_house",
    launch: "product_launch",
    waitlist: "product_launch_waitlist",
    crowdfunding: "crowdfunding_campaign",
    property: "property_listing",
    rental: "property_listing_rental",
    portfolio: "resume_portfolio",
  };

  return map[s] ?? null;
}

export default async function DemoPage() {
  const h = await headers();
  const host = (h.get("host") || "").toLowerCase();
  const subdomain = host.split(".")[0] || "";

  const key = templateKeyFromSubdomain(subdomain);
  if (!key) return notFound();

  const def = getTemplateDef(key);
  if (!def) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">Ko-Host Demo</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {def.title} Demo
        </h1>
        <p className="mt-2 text-sm text-neutral-700">
          Demo preview for <span className="font-mono">{subdomain}</span>.ko-host.com
        </p>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">What you get</div>
          <div className="mt-2 text-sm text-neutral-700">
            Lightweight demo experience. Interactive submissions are disabled.
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-neutral-600">Modules</div>
          <div className="mt-2 text-sm text-neutral-700">
            Gallery • Polls • RSVP (template-dependent)
          </div>
        </div>
      </div>
    </main>
  );
}