"use client";

import { useEffect, useMemo, useState } from "react";

type GalleryItem = {
  id: string;
  public_url: string;
  caption: string | null;
  media_type: "image" | "video";
  mime_type: string | null;
};

export default function GalleryBlock({ micrositeSlug }: { micrositeSlug: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [openId, setOpenId] = useState<string | null>(null);

  const openIndex = useMemo(() => {
    if (!openId) return -1;
    return items.findIndex((i) => i.id === openId);
  }, [openId, items]);

  const openItem = openIndex >= 0 ? items[openIndex] : null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/public/gallery/list?slug=${encodeURIComponent(micrositeSlug)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (cancelled) return;

        if (json?.ok) setItems(json.items ?? []);
        else setItems([]);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [micrositeSlug]);

  useEffect(() => {
    if (!openId) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, items]);

  function goPrev() {
    if (items.length === 0 || openIndex < 0) return;
    const next = (openIndex - 1 + items.length) % items.length;
    setOpenId(items[next].id);
  }

  function goNext() {
    if (items.length === 0 || openIndex < 0) return;
    const next = (openIndex + 1) % items.length;
    setOpenId(items[next].id);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">Gallery</div>

      {loading ? (
        <div className="mt-3 text-sm text-neutral-700">Loading...</div>
      ) : items.length === 0 ? (
        <div className="mt-3 text-sm text-neutral-700">No media yet.</div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              className="group overflow-hidden rounded-xl border border-neutral-200 text-left"
              onClick={() => setOpenId(it.id)}
              aria-label="Open media"
            >
              {it.media_type === "video" ? (
                <div className="relative h-40 w-full bg-black">
                  <video
                    src={it.public_url}
                    className="h-40 w-full object-cover opacity-90"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/50 px-3 py-2 text-xs text-white">
                      ▶ Video
                    </div>
                  </div>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.public_url}
                  alt={it.caption ?? "Gallery item"}
                  className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              )}

              {it.caption ? <div className="px-3 py-2 text-xs text-neutral-700">{it.caption}</div> : null}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {openItem ? (
        <div
          className="fixed inset-0 z-50 bg-black/80"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenId(null)}
        >
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="absolute right-0 top-[-44px] rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                onClick={() => setOpenId(null)}
              >
                Close ✕
              </button>

              <div className="relative overflow-hidden rounded-2xl bg-black">
                {/* left tap zone */}
                <button
                  type="button"
                  aria-label="Previous"
                  className="absolute left-0 top-0 h-full w-1/3 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                />
                {/* right tap zone */}
                <button
                  type="button"
                  aria-label="Next"
                  className="absolute right-0 top-0 h-full w-1/3 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                />

                {openItem.media_type === "video" ? (
                  <video
                    src={openItem.public_url}
                    className="max-h-[75vh] w-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={openItem.public_url}
                    alt={openItem.caption ?? "Gallery item"}
                    className="max-h-[75vh] w-full object-contain"
                  />
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                >
                  ← Prev
                </button>

                <div className="min-w-0 flex-1 text-center text-sm text-white/90">
                  {openItem.caption ?? <span className="text-white/70"> </span>}
                </div>

                <button
                  type="button"
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                >
                  Next →
                </button>
              </div>

              <div className="mt-2 text-center text-xs text-white/60">
                Tap left/right side to navigate. Esc closes.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}