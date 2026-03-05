import Link from "next/link";
import type { TemplateDef } from "@/lib/templates/registry";
import DemoStickyCta from "./DemoStickyCta";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.png`;
}

export default function DemoTemplatePage({
  template,
  originHost,
}: {
  template: TemplateDef;
  originHost: string; // e.g. reunion.ko-host.com
}) {
  const demoUrl = `https://${originHost}/demo`;
  const thumbUrl = thumbToImageUrl(template.thumb);

  const tags = (template.tags && template.tags.length ? template.tags : [template.category]).slice(
    0,
    4
  );
  const features = template.features && template.features.length ? template.features : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Hero */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-neutral-500">Ko-Host Demo</div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            {template.title} Demo
          </h1>

          <p className="mt-2 text-sm text-neutral-700">{template.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-neutral-800"
              >
                {t}
              </span>
            ))}
            <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[12px] font-semibold text-white">
              Setup: ~{template.setupMins} min
            </span>
            {template.badge ? (
              <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[12px] font-semibold text-white">
                {template.badge}
              </span>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/create/${template.key}`}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Create this template
            </Link>

            <a
              href={demoUrl}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Refresh demo
            </a>
          </div>

          <div className="mt-3 text-[12px] text-neutral-500">
            Tip: this demo is read-only. Your real page can be edited and published in minutes.
          </div>
        </div>

        {/* Screenshot / Preview */}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbUrl}
            alt={`${template.title} preview`}
            className="h-[260px] w-full object-cover"
            draggable={false}
          />
          <div className="p-5">
            <div className="text-sm font-semibold text-neutral-900">What you’ll get</div>
            <ul className="mt-2 space-y-2 text-sm text-neutral-700">
              {(features.length ? features : ["Gallery", "Polls", "Announcements"]).map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-[2px] text-emerald-600">●</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="text-[12px] font-semibold text-neutral-600">Demo URL</div>
              <div className="mt-1 break-all font-mono text-[12px] font-semibold text-neutral-900">
                {demoUrl}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* “Looks real” sections */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">Announcement</div>
          <p className="mt-2 text-sm text-neutral-700">
            This is a polished, shareable page. Swap demo text with your real content.
          </p>
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            “Quick update: new details posted. Check back here for changes.”
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">Links</div>
          <p className="mt-2 text-sm text-neutral-700">
            Add your key links so visitors can act immediately.
          </p>
          <div className="mt-4 grid gap-2">
            {["Primary link", "Secondary link", "Contact"].map((x) => (
              <div
                key={x}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900"
              >
                {x}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">Gallery</div>
          <p className="mt-2 text-sm text-neutral-700">
            Show images that make the page feel premium and credible.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="aspect-square rounded-2xl border border-neutral-200 bg-neutral-100"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop CTA */}
      <div className="mt-8 hidden md:block">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Make it yours</div>
              <div className="mt-1 text-sm text-neutral-700">
                Create your {template.title.toLowerCase()} page, customize it, and publish when ready.
              </div>
            </div>

            <Link
              href={`/create/${template.key}`}
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Create this template
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <DemoStickyCta templateKey={template.key} />
    </main>
  );
}