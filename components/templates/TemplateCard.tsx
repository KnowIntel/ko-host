import Link from "next/link";

export default function TemplateCard(props: {
  templateKey: string;
  title: string;
  thumbnailUrl?: string | null;
}) {
  const { templateKey, title, thumbnailUrl } = props;

  return (
    <div className="group">
      <Link href={`/create/${templateKey}`} className="block">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm">
          {/* Thumbnail */}
          <div className="aspect-[4/3] w-full">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                No preview
              </div>
            )}
          </div>

          {/* Darken on hover */}
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/35" />

          {/* Create pill */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center px-3">
            <div className="kht-create inline-flex items-center justify-center rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur">
              Create
            </div>
          </div>
        </div>

        {/* Title under thumbnail */}
        <div className="mt-2 text-center text-xs font-semibold text-neutral-900">{title}</div>
      </Link>

      {/* Guaranteed hover behavior */}
      <style jsx>{`
        /* Default (touch/no-hover): visible */
        .kht-create {
          opacity: 1;
          transition: opacity 160ms ease;
        }

        /* Hover-capable devices: hide until hover */
        @media (hover: hover) and (pointer: fine) {
          .kht-create {
            opacity: 0;
          }
          .group:hover .kht-create {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}