import TemplateGrid from "@/components/templates/TemplateGrid";

export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  return (
    <main>
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-neutral-600">Ko-Host</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Pick a template. Customize free. Publish for $12.{" "}
                <span className="text-xs text-red-600">(TEMPLATES PAGE v2)</span>
              </h1>
            <p className="mt-3 text-neutral-700">
              Temporary, single-purpose microsites with structured modules (RSVP, polls, gallery, and more).
              No domain purchase. No long-term commitment.
            </p>

            <div className="mt-4 text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">$12</span> per microsite •{" "}
              <span className="font-semibold text-neutral-900">90 days</span> • time stacks on repurchase
            </div>
          </div>
        </div>
      </section>

      <TemplateGrid />
    </main>
  );
}