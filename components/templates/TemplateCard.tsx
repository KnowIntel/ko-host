import Link from "next/link";

export default function TemplateCard(props: {
  templateKey: string;
  title: string;
  thumbnailUrl?: string | null;
}) {
  const { templateKey, title, thumbnailUrl } = props;
  const src = thumbnailUrl || "/templates/placeholder.png";

  return (
    <Link
      href={`/create/${templateKey}`}
      className="group block"
      style={{
        width: "140px",          // ✅ hard clamp
        maxWidth: "140px",
        minWidth: "140px",
      }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
        style={{
          width: "140px",        // ✅ hard clamp (again)
          maxWidth: "140px",
          minWidth: "140px",
        }}
      >
        {/* Media */}
        <div
          className="relative bg-neutral-100"
          style={{
            width: "140px",
            height: "105px",     // 4:3 at 140px width => 105px height
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            draggable={false}
            loading="lazy"
            style={{
              pointerEvents: "none",
              width: "140px",
              height: "105px",
              objectFit: "cover",
              userSelect: "none",
              display: "block",
            }}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0), rgba(0,0,0,0))",
              opacity: 0.7,
              transition: "opacity 160ms ease",
            }}
          />

          <div className="pointer-events-none absolute left-2 top-2">
            <div className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-neutral-900 backdrop-blur">
              $12 • 90 days
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-2 flex justify-center px-2">
            <div className="kht-create inline-flex items-center justify-center rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm backdrop-blur">
              Create
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-2 py-2">
          <div
            className="text-center text-[11px] font-semibold text-neutral-900"
            style={{
              lineHeight: "1.2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={title}
          >
            {title}
          </div>
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
          .group:hover .pointer-events-none.absolute.inset-0 {
            opacity: 0.9;
          }
        }
      `}</style>
    </Link>
  );
}