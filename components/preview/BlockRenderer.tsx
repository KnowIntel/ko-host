"use client";

import type { MicrositeBlock, ShowcaseBlock } from "@/lib/templates/builder";

function EmptyImagePlaceholder({
  title,
  recommendedSize,
}: {
  title: string;
  recommendedSize: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-100 px-4 text-center">
      <div className="text-sm font-medium text-neutral-600">{title}</div>
      <div className="mt-1 text-xs text-neutral-500">
        ({recommendedSize})
      </div>
    </div>
  );
}

function ShowcaseBlockView({ block }: { block: ShowcaseBlock }) {
  const images = block.data.images ?? [];
  const featured = images.slice(0, 2);
  const gridImages = images.slice(2);

  return (
    <section className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Showcase
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
              Portfolio Highlights
            </h2>
            <p className="max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
              Present your best work in a refined gallery layout designed for
              artists, photographers, illustrators, and creative freelancers.
            </p>
          </div>

          <div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              View Gallery
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {featured.length > 0 ? (
            featured.map((img, index) => (
              <div
                key={img.id}
                className={[
                  "relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100",
                  index === 0 ? "aspect-[4/5]" : "mt-8 aspect-[4/5]",
                ].join(" ")}
              >
                {img.url ? (
                  <img
                    src={img.url}
                    alt={`Featured showcase ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <EmptyImagePlaceholder
                    title="Featured image"
                    recommendedSize="recommended: 800x1200"
                  />
                )}

                <img
                  src="/icons/edit_icon.webp"
                  alt="Edit"
                  className="absolute bottom-3 left-3 h-7 w-7 rounded-full bg-white/90 p-1 shadow-sm"
                />
              </div>
            ))
          ) : (
            <>
              <div className="aspect-[4/5] rounded-3xl border border-neutral-200 bg-neutral-100">
                <EmptyImagePlaceholder
                  title="Featured image"
                  recommendedSize="recommended: 800x1200"
                />
              </div>
              <div className="mt-8 aspect-[4/5] rounded-3xl border border-neutral-200 bg-neutral-100">
                <EmptyImagePlaceholder
                  title="Featured image"
                  recommendedSize="recommended: 800x1200"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
              Gallery
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              A clean visual grid for your work.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {gridImages.map((img, index) => (
            <div
              key={img.id}
              className={[
                "relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100",
                index % 5 === 0
                  ? "aspect-[4/5]"
                  : index % 5 === 1
                    ? "aspect-square"
                    : index % 5 === 2
                      ? "aspect-[5/4]"
                      : index % 5 === 3
                        ? "aspect-[3/4]"
                        : "aspect-square",
              ].join(" ")}
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={`Showcase image ${index + 3}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <EmptyImagePlaceholder
                  title="Empty slot"
                  recommendedSize="recommended: 800x1000"
                />
              )}

              <img
                src="/icons/edit_icon.webp"
                alt="Edit"
                className="absolute bottom-3 left-3 h-6 w-6 rounded-full bg-white/90 p-1 shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-neutral-200 bg-neutral-50 px-6 py-10 text-center sm:px-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Interested in a custom painting?
          </h3>
          <p className="text-sm leading-7 text-neutral-600 sm:text-base">
            Use this section as a conversion point for inquiries, commissions,
            bookings, or collaboration opportunities.
          </p>
          <div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-neutral-900 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BlockRenderer({
  block,
  designKey = "blank",
}: {
  block: MicrositeBlock;
  designKey?: string;
}) {
  switch (block.type) {
    case "showcase":
      return <ShowcaseBlockView block={block} />;

    default:
      return null;
  }
}