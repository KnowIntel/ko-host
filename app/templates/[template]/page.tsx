import Link from "next/link";
import { getTemplateDef } from "@/lib/templates/registry";

export default function TemplatePreviewPage({ params }: { params: { template: string } }) {
  const t = getTemplateDef(params.template);

  if (!t) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold">Template not found</h1>
        <Link className="mt-4 inline-block underline" href="/templates">
          Back to templates
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{t.title}</h1>
            <p className="mt-2 text-neutral-600">{t.description}</p>
          </div>
          <div className="rounded-full border px-3 py-1 text-sm">{t.priceLabel}</div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/create/${t.key}`}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Create for free
          </Link>
          <Link href="/templates" className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50">
            Browse templates
          </Link>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">What’s included</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {t.features.map((f) => (
            <li key={f} className="rounded-xl border px-3 py-2 text-sm">
              {f}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}