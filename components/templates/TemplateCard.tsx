import Link from "next/link";

const W = 140;
const H = 105;

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
      style={{ width: W, maxWidth: W, minWidth: W }}
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {/* Media */}
        <div className="relative bg-neutral-100" style={{ width: W, height: H, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            draggable={false}
            loading="lazy"
            style={{
              pointerEvents: "none",
              width: W,
              height: H,
              objectFit: "cover",
              userSelect: "none",
              display: "block",
            }}
          />

          {/* Price pill (top-left) */}
          <div className="absolute left-2 top-2 z-20">
            <div className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-neutral-900 backdrop-blur">
              $12 • 90 days
            </div>
          </div>

          {/* ✅ Create pill (top-right) */}
          <div className="absolute right-2 top-2 z-30">
            <div className="inline-flex items-center gap-1 rounded-full bg-neutral-900/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
              Create <span className="text-white/80">→</span>
            </div>
          </div>

          {/* DEBUG marker */}
          <div className="absolute bottom-2 left-2 z-30 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
            PILL-ON
          </div>
        </div>

        {/* Footer title */}
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
    </Link>
  );
}