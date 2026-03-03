"use client";

import { useEffect, useState } from "react";

type GalleryItem = {
  id: string;
  public_url: string;
  caption: string | null;
};

export default function GalleryBlock({ micrositeSlug }: { micrositeSlug: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/public/gallery/list?slug=${encodeURIComponent(micrositeSlug)}`, {
          cache: "no-store",
        });
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

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">Gallery</div>

      {loading ? (
        <div className="mt-3 text-sm text-neutral-700">Loading...</div>
      ) : items.length === 0 ? (
        <div className="mt-3 text-sm text-neutral-700">No photos yet.</div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => (
            <figure key={it.id} className="overflow-hidden rounded-xl border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.public_url}
                alt={it.caption ?? "Gallery photo"}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              {it.caption ? (
                <figcaption className="px-3 py-2 text-xs text-neutral-700">{it.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}