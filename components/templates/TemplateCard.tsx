import Link from "next/link";

export default function TemplateCard(props: {
  templateKey: string;
  title: string;
  thumbnailUrl?: string | null;
}) {
  const { templateKey, title, thumbnailUrl } = props;
  const src = thumbnailUrl || "/templates/placeholder.png";

  return (
    <Link href={`/create/${templateKey}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        {/* Media (4:3, fits container) */}
        <div className="relative aspect-[4/3] w-full bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            className="h-full w-full select-none object-cover"
            draggable={false}
            loading="lazy"
            style={{ pointerEvents: "none" }}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-70 transition-opacity group-hover:opacity-90" />

          <div className="pointer-events-none absolute left-3 top-3">
            <div className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-neutral-900 backdrop-blur">
              $12 • 90 days
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-3 flex justify-center px-3">
            <div className="kht-create inline-flex items-center justify-center rounded-xl bg-white/95 px-4 py-2 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur">
              Create
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="text-center text-xs font-semibold text-neutral-900">{title}</div>
        </div>
      </div>

      <style jsx>{`
        .kht-create {
          opacity: 1;
          transform: translateY(0px);
          transition: opacity 160ms ease, transform 160ms ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .kht-create {
            opacity: 0;
            transform: translateY(6px);
          }
          .group:hover .kht-create {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </Link>
  );
}