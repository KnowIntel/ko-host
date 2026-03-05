import Link from "next/link";
import { useMemo } from "react";

const W = 140; // keep in sync with grid
const H = 105; // 4:3

function formatLabel(title: string) {
  return (title || "").trim();
}

export default function TemplateCard(props: {
  templateKey: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;

  badge?: "Popular" | "New" | null;

  isFavorite?: boolean;
  onToggleFavorite?: (templateKey: string) => void;

  onPreview?: (templateKey: string) => void;

  // ✅ added to match TemplateGrid (can be unused by UI)
  tags?: string[];
  setupMins?: number;
}) {
  const {
    templateKey,
    title,
    description,
    thumbnailUrl,
    badge = null,
    isFavorite = false,
    onToggleFavorite,
    onPreview,
    tags = [],
    setupMins = 3,
  } = props;

  // keep TS happy (we may not render tags now)
  useMemo(() => tags, [tags]);

  const src = thumbnailUrl || "/templates/placeholder.png";

  function onClickPreview(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onPreview?.(templateKey);
  }

  function onClickFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(templateKey);
  }

  return (
    <Link
      href={`/create/${templateKey}`}
      className="group block"
      style={{ width: W, maxWidth: W, minWidth: W }}
    >
      <div
        className={[
          "relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm",
          "transition-all duration-200 ease-out will-change-transform",
          "group-hover:-translate-y-1 group-hover:shadow-lg",
        ].join(" ")}
        style={{ width: W, maxWidth: W, minWidth: W, transform: "translateZ(0)" }}
      >
        {/* Hover glow */}
        <div className="pointer-events-none absolute -inset-16 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.30),transparent_55%)]" />
        </div>

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

          {/* Image overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-70 transition-opacity duration-150 group-hover:opacity-90" />

          {/* Price pill */}
          <div className="pointer-events-none absolute left-2 top-2">
            <div className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-neutral-900 backdrop-blur">
              $12
            </div>
          </div>

          {/* Badge */}
          {badge ? (
            <div className="pointer-events-none absolute right-2 top-2">
              <div
                className={[
                  "rounded-full px-2 py-1 text-[10px] font-semibold text-white backdrop-blur",
                  badge === "Popular" ? "bg-neutral-900/90" : "bg-emerald-600/90",
                ].join(" ")}
              >
                {badge}
              </div>
            </div>
          ) : null}

          {/* Favorite star (top-right) */}
          <button
            type="button"
            onClick={onClickFavorite}
            className={[
              "absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full",
              "bg-white/90 backdrop-blur shadow-sm border border-neutral-200",
              "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
              "hover:bg-white",
            ].join(" ")}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Unfavorite" : "Favorite"}
          >
            <span className={isFavorite ? "text-amber-500" : "text-neutral-500"}>★</span>
          </button>

          {/* Slim hover overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <div className="absolute inset-0 bg-black/35" />
          </div>

          <div className="absolute inset-x-0 bottom-2 px-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <div className="flex items-center justify-between gap-2">
              {/* duration */}
              <div className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-neutral-900 shadow-sm backdrop-blur">
                {setupMins} min
              </div>

              <div className="flex items-center gap-2">
                {/* Preview */}
                <button
                  type="button"
                  onClick={onClickPreview}
                  className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm backdrop-blur hover:bg-white"
                >
                  Preview
                </button>

                {/* Create (link click) */}
                <div className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-neutral-800">
                  Create
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2">
          <div
            className="text-[12px] font-semibold tracking-tight text-neutral-900"
            style={{
              lineHeight: "1.2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={title}
          >
            {formatLabel(title)}
          </div>

          <div
            className="mt-1 text-[10px] font-medium text-neutral-500"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={description || ""}
          >
            {description || ""}
          </div>
        </div>

        {/* Shine */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="absolute -left-10 top-0 h-full w-24 rotate-12 bg-white/20 blur-xl" />
        </div>
      </div>
    </Link>
  );
}