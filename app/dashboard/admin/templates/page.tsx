import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getTemplateLayoutRegistry } from "@/lib/templates/layout-presets/layoutRegistry";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

const templateKeys = [
  "wedding_rsvp",
  "baby_shower",
  "memorial_tribute",
  "enthusiast_networking",
  "birthday_party",
  "family_reunion",
  "property_listing",
  "roast_session",
  "product_launch",
  "crowdfunding_campaign",
  "resume_profile",
  "beta_testing",
  "restaurant_menu",
  "sweepstakes",
  "learning_lab",
  "for_sale_by_owner",
  "community_alert",
  "church_event",
  "graduation",
  "pet_adoption",
  "memory_timeline",
  "photo_gallery",
  "creator_link_hub",
  "guided_tutorial",
  "election_campaign",
  "live_entertainment",
];

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminTemplatesPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const rows = templateKeys.map((templateKey) => {
    const registry = getTemplateLayoutRegistry(templateKey);
    const layouts = registry?.layouts ?? [];
    const nonBlankLayouts = layouts.filter((layout) => layout.designKey !== "blank");
    const recommended = layouts.find((layout) => layout.recommended);

    return {
      templateKey,
      label: formatLabel(templateKey),
      layoutCount: nonBlankLayouts.length,
      totalLayoutCount: layouts.length,
      recommendedDesign: recommended?.designKey || "—",
      designs: nonBlankLayouts.map((layout) => ({
        designKey: layout.designKey,
        label: layout.card?.label || layout.designKey,
        recommended: Boolean(layout.recommended),
      })),
    };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Templates
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Review registered Ko-Host templates and their available design layouts.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Registered Templates" value={rows.length} />
        <Stat
          label="Design Layouts"
          value={rows.reduce((total, row) => total + row.layoutCount, 0)}
        />
        <Stat
          label="With Recommended Layout"
          value={rows.filter((row) => row.recommendedDesign !== "—").length}
        />
        <Stat label="Manager Status" value="Read Only" />
      </section>

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-4">
          <h2 className="text-sm font-black text-neutral-950">
            Template Registry
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-[0.08em] text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-black">Template</th>
                <th className="px-4 py-3 font-black">Key</th>
                <th className="px-4 py-3 font-black">Layouts</th>
                <th className="px-4 py-3 font-black">Recommended</th>
                <th className="px-4 py-3 font-black">Designs</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.templateKey} className="border-t border-neutral-100 align-top">
                  <td className="px-4 py-4 font-bold text-neutral-950">
                    {row.label}
                  </td>

                  <td className="px-4 py-4 font-mono text-xs font-semibold text-neutral-700">
                    {row.templateKey}
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-200">
                      {row.layoutCount}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-mono text-xs font-semibold text-neutral-700">
                    {row.recommendedDesign}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex max-w-xl flex-wrap gap-2">
                      {row.designs.length ? (
                        row.designs.map((design) => (
                          <span
                            key={design.designKey}
                            className={[
                              "rounded-full px-2.5 py-1 text-xs font-bold ring-1",
                              design.recommended
                                ? "bg-green-50 text-green-700 ring-green-200"
                                : "bg-neutral-100 text-neutral-600 ring-neutral-200",
                            ].join(" ")}
                            title={design.designKey}
                          >
                            {design.label}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-semibold text-neutral-400">
                          No custom layouts
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
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