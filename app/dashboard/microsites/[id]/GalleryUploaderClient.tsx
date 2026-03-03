"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type GalleryItem = {
  id: string;
  public_url: string;
  thumbnail_url?: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
  media_type: "image" | "video";
  mime_type: string | null;
};

const MAX_ITEMS = 24;

// match your storage limit
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

function prettyMB(bytes: number) {
  return `${Math.ceil(bytes / (1024 * 1024))}MB`;
}

async function fileToImageJpegThumbnail(videoFile: File): Promise<Blob> {
  // Create hidden video element
  const url = URL.createObjectURL(videoFile);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";

  // Wait metadata (dimensions/duration)
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Could not read video metadata"));
  });

  // Seek to ~0.2s (or start)
  const seekTime = Math.min(0.2, Math.max(0, (video.duration || 0) * 0.05));
  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    try {
      video.currentTime = seekTime;
    } catch {
      // some browsers block; fallback to 0
      video.currentTime = 0;
    }
  });

  const canvas = document.createElement("canvas");
  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;

  // scale to max width 720 for thumbnail
  const maxW = 720;
  const scale = w > maxW ? maxW / w : 1;

  canvas.width = Math.floor(w * scale);
  canvas.height = Math.floor(h * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create thumbnail"))),
      "image/jpeg",
      0.82
    );
  });

  URL.revokeObjectURL(url);
  return blob;
}

export default function GalleryUploaderClient({ micrositeId }: { micrositeId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const atLimit = items.length >= MAX_ITEMS;

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

  async function onUpload() {
    if (!file) return;
    if (atLimit) {
      setMsg(`Gallery limit reached (${MAX_ITEMS}). Delete an item to add another.`);
      return;
    }

    const isVideo = file.type === "video/mp4" || file.type === "video/webm";
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      setMsg(
        `${isVideo ? "Video" : "Image"} too large (${prettyMB(file.size)}). Max allowed is ${prettyMB(
          maxBytes
        )}.`
      );
      return;
    }

    setBusy(true);
    setMsg(null);

    try {
      // 1) signed upload for MEDIA
      const signedRes = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/signed-upload`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          purpose: "media",
          mime: file.type || "application/octet-stream",
          caption: caption.trim() ? caption.trim() : null,
        }),
      });

      const signedJson = await signedRes.json().catch(() => ({}));
      if (!signedRes.ok || !signedJson?.ok) {
        setMsg(signedJson?.error || `Signed upload failed (${signedRes.status})`);
        return;
      }

      const {
        bucket,
        storage_path,
        token,
        public_url,
        mime_type,
        media_type,
        caption: serverCaption,
        next_sort_order,
      } = signedJson as {
        bucket: string;
        storage_path: string;
        token: string;
        public_url: string;
        mime_type: string;
        media_type: "image" | "video";
        caption: string | null;
        next_sort_order: number;
      };

      const sb = getBrowserSupabase();

      // 2) upload MEDIA
      const { error: upErr } = await sb.storage.from(bucket).uploadToSignedUrl(storage_path, token, file, {
        contentType: mime_type,
        upsert: false,
      });

      if (upErr) {
        setMsg(upErr.message || "Upload failed");
        return;
      }

      // 3) if VIDEO: generate thumbnail + upload thumbnail
      let thumbnail_url: string | null = null;

      if (media_type === "video") {
        try {
          const thumbBlob = await fileToImageJpegThumbnail(file);

          const thumbSignedRes = await fetch(
            `/api/dashboard/microsites/${micrositeId}/gallery/signed-upload`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                purpose: "thumbnail",
                mime: "image/jpeg",
                base_storage_path: storage_path,
              }),
            }
          );

          const thumbSignedJson = await thumbSignedRes.json().catch(() => ({}));
          if (thumbSignedRes.ok && thumbSignedJson?.ok) {
            const { storage_path: tPath, token: tToken, public_url: tUrl } = thumbSignedJson as {
              storage_path: string;
              token: string;
              public_url: string;
            };

            const { error: tErr } = await sb.storage.from(bucket).uploadToSignedUrl(tPath, tToken, thumbBlob, {
              contentType: "image/jpeg",
              upsert: true,
            });

            if (!tErr) thumbnail_url = tUrl;
          }
        } catch {
          // thumbnail is best-effort; ignore failures
        }
      }

      // 4) finalize DB row
      const finRes = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/finalize`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storage_path,
          public_url,
          thumbnail_url,
          caption: serverCaption,
          media_type,
          mime_type,
          sort_order: next_sort_order,
        }),
      });

      const finJson = await finRes.json().catch(() => ({}));
      if (!finRes.ok || !finJson?.ok) {
        setMsg(finJson?.error || `Finalize failed (${finRes.status})`);
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
    if (!confirm("Delete this item?")) return;
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
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-neutral-600">Gallery (Wedding template only)</div>
        <div className="text-xs text-neutral-600">
          {items.length}/{MAX_ITEMS}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {atLimit ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Limit reached ({MAX_ITEMS}). Delete an item to upload more.
          </div>
        ) : null}

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
          disabled={busy || atLimit}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <input
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          placeholder="Caption (optional)"
          value={caption}
          disabled={busy || atLimit}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={140}
        />

        <button
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={!file || busy || atLimit}
          onClick={onUpload}
        >
          {busy ? "Uploading..." : "Upload"}
        </button>

        {msg ? <div className="text-sm text-neutral-700">{msg}</div> : null}
      </div>

      <div className="mt-6">
        <div className="text-sm font-medium text-neutral-900">Current items</div>

        {loading ? (
          <div className="mt-2 text-sm text-neutral-700">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-2 text-sm text-neutral-700">No items yet.</div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((it) => (
              <div key={it.id} className="overflow-hidden rounded-xl border border-neutral-200">
                {it.media_type === "video" ? (
                  // If thumbnail exists, show it; else show playable preview
                  it.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.thumbnail_url}
                      alt={it.caption ?? "Video thumbnail"}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <video src={it.public_url} className="h-40 w-full object-cover" controls preload="metadata" />
                  )
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.public_url} alt={it.caption ?? "Media"} className="h-40 w-full object-cover" loading="lazy" />
                )}

                <div className="p-3">
                  {it.caption ? <div className="text-xs text-neutral-700">{it.caption}</div> : null}
                  <div className="mt-1 text-[11px] text-neutral-500">{it.media_type === "video" ? "Video" : "Image"}</div>

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