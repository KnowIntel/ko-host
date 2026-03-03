"use client";

import { useEffect, useMemo, useState } from "react";

type GalleryItem = {
  id: string;
  public_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export default function GalleryUploaderClient({ micrositeId }: { micrositeId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/list`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.ok) setItems(json.items ?? []);
      else setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micrositeId]);

  async function fileToBase64(f: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(f);
    });
  }

  async function onUpload() {
    if (!file) return;
    setBusy(true);
    setMsg(null);

    try {
      const base64 = await fileToBase64(file);

      const res = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/upload`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          base64,
          mime: file.type || "image/jpeg",
          caption: caption.trim() ? caption.trim() : null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        setMsg(json?.error || `Upload failed (${res.status})`);
        return;
      }

      setMsg("Uploaded ✅");
      setFile(null);
      setCaption("");
      await refresh();
    } catch (e: any) {
      setMsg(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(itemId: string) {
    if (!confirm("Delete this photo?")) return;
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/delete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setMsg(json?.error || `Delete failed (${res.status})`);
        return;
      }

      setMsg("Deleted ✅");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const canMoveUp = useMemo(() => new Set(items.slice(1).map((i) => i.id)), [items]);
  const canMoveDown = useMemo(() => new Set(items.slice(0, -1).map((i) => i.id)), [items]);

  async function reorder(newItems: GalleryItem[]) {
    // normalize sort_order
    const payload = newItems.map((it, idx) => ({ id: it.id, sort_order: idx }));

    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/reorder`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setMsg(json?.error || `Reorder failed (${res.status})`);
        return;
      }

      setItems(newItems.map((it, idx) => ({ ...it, sort_order: idx })));
      setMsg("Reordered ✅");
    } finally {
      setBusy(false);
    }
  }

  function moveUp(id: string) {
    const idx = items.findIndex((x) => x.id === id);
    if (idx <= 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    reorder(next);
  }

  function moveDown(id: string) {
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0 || idx >= items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    reorder(next);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">Gallery (Wedding template only)</div>

      <div className="mt-4 grid gap-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <input
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          placeholder="Caption (optional)"
          value={caption}
          disabled={busy}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={140}
        />

        <button
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={!file || busy}
          onClick={onUpload}
        >
          {busy ? "Working..." : "Upload Photo"}
        </button>

        {msg ? <div className="text-sm text-neutral-700">{msg}</div> : null}
      </div>

      <div className="mt-6">
        <div className="text-sm font-medium text-neutral-900">Current photos</div>

        {loading ? (
          <div className="mt-2 text-sm text-neutral-700">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-2 text-sm text-neutral-700">No photos yet.</div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((it) => (
              <div key={it.id} className="overflow-hidden rounded-xl border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.public_url} alt={it.caption ?? "Photo"} className="h-40 w-full object-cover" />

                <div className="p-3">
                  {it.caption ? <div className="text-xs text-neutral-700">{it.caption}</div> : null}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                      disabled={busy || !canMoveUp.has(it.id)}
                      onClick={() => moveUp(it.id)}
                      type="button"
                    >
                      ↑
                    </button>
                    <button
                      className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                      disabled={busy || !canMoveDown.has(it.id)}
                      onClick={() => moveDown(it.id)}
                      type="button"
                    >
                      ↓
                    </button>
                    <button
                      className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                      disabled={busy}
                      onClick={() => onDelete(it.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}