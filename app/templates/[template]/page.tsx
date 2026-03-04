import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATE_DEFS, getTemplateDef } from "@/lib/templates/registry";

export const dynamic = "force-dynamic";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;

  const t = getTemplateDef(template);
  if (!t) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">Ko-Host Template</div>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
            <p className="mt-2 text-neutral-700">{t.description}</p>
          </div>

          {/* ✅ fixed: no priceLabel on TemplateDef */}
          <div className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-800">
            $12 / 90 days
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/create/${t.key}`}
            className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Create
          </Link>

          <Link
            href="/templates"
            className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-900"
          >
            Back to templates
          </Link>
        </div>
      </div>

      {/* Optional: show other templates */}
      <div className="mt-10">
        <div className="text-sm font-semibold text-neutral-900">More templates</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEMPLATE_DEFS.filter((x) => x.key !== t.key).slice(0, 6).map((x) => (
            <Link
              key={x.key}
              href={`/create/${x.key}`}
              className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-800 hover:border-neutral-900"
            >
              {x.title}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}