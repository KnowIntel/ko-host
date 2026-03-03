"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// ✅ duration cap
const MAX_VIDEO_SECONDS = 180;

function prettyMB(bytes: number) {
  return `${Math.ceil(bytes / (1024 * 1024))}MB`;
}

async function getVideoDurationSeconds(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    const dur = await new Promise<number>((resolve, reject) => {
      video.onloadedmetadata = () => resolve(Number.isFinite(video.duration) ? video.duration : 0);
      video.onerror = () => reject(new Error("Could not read video metadata"));
    });

    return dur || 0;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function fileToImageJpegThumbnail(videoFile: File): Promise<Blob> {
  const url = URL.createObjectURL(videoFile);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Could not read video metadata"));
  });

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
      video.currentTime = 0;
    }
  });

  const canvas = document.createElement("canvas");
  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;

  const maxW = 720;
  const scale = w > maxW ? maxW / w : 1;

  canvas.width = Math.floor(w * scale);
  canvas.height = Math.floor(h * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to create thumbnail"))), "image/jpeg", 0.82);
  });

  URL.revokeObjectURL(url);
  return blob;
}

async function uploadWithProgress(
  signedUrl: string,
  fileOrBlob: Blob,
  contentType: string,
  onProgress: (pct: number) => void,
  signal?: AbortSignal
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const pct = Math.max(0, Math.min(100, Math.round((evt.loaded / evt.total) * 100)));
      onProgress(pct);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (HTTP ${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error("Upload failed (network error)"));

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          try {
            xhr.abort();
          } catch {}
          reject(new Error("Upload cancelled"));
        },
        { once: true }
      );
    }

    xhr.send(fileOrBlob);
  });
}

export default function GalleryUploaderClient({ micrositeId }: { micrositeId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  // ✅ inline editing
  const [editId, setEditId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState<string>("");

  const atLimit = items.length >= MAX_ITEMS;

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/list`, { cache: "no-store" });
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
      setMsg(`${isVideo ? "Video" : "Image"} too large (${prettyMB(file.size)}). Max allowed is ${prettyMB(maxBytes)}.`);
      return;
    }

    if (isVideo) {
      setMsg("Checking video duration…");
      const dur = await getVideoDurationSeconds(file).catch(() => 0);
      if (dur > MAX_VIDEO_SECONDS) {
        setMsg(`Video too long (${Math.ceil(dur)}s). Max allowed is ${MAX_VIDEO_SECONDS}s.`);
        return;
      }
      setMsg(null);
    }

    setBusy(true);
    setProgress(0);
    setMsg(null);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
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
        storage_path,
        signed_url,
        public_url,
        mime_type,
        media_type,
        caption: serverCaption,
        next_sort_order,
      } = signedJson as any;

      if (!signed_url) {
        setMsg("Upload error: signed_url missing.");
        return;
      }

      await uploadWithProgress(signed_url, file, mime_type, setProgress, abort.signal);

      let thumbnail_url: string | null = null;

      if (media_type === "video") {
        try {
          const thumbBlob = await fileToImageJpegThumbnail(file);

          const thumbSignedRes = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/signed-upload`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              purpose: "thumbnail",
              mime: "image/jpeg",
              base_storage_path: storage_path,
            }),
          });

          const thumbSignedJson = await thumbSignedRes.json().catch(() => ({}));
          if (thumbSignedRes.ok && thumbSignedJson?.ok) {
            const tSignedUrl = thumbSignedJson?.signed_url;
            const tUrl = thumbSignedJson?.public_url;
            if (tSignedUrl && tUrl) {
              await uploadWithProgress(tSignedUrl, thumbBlob, "image/jpeg", () => {}, abort.signal);
              thumbnail_url = tUrl;
            }
          }
        } catch {
          // ignore
        }
      }

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
      abortRef.current = null;
      setTimeout(() => setProgress(0), 800);
    }
  }

  function onCancelUpload() {
    try {
      abortRef.current?.abort();
    } catch {}
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

      // if you delete the item you're editing, reset edit state
      if (editId === itemId) {
        setEditId(null);
        setEditCaption("");
      }

      setMsg("Deleted ✅");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onSaveCaption(item: GalleryItem) {
    const newCaption = editCaption.trim();
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/dashboard/microsites/${micrositeId}/gallery/update-caption`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          caption: newCaption.length ? newCaption : null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setMsg(json?.error || `Update failed (${res.status})`);
        return;
      }

      // update local list (no reload)
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, caption: json.item.caption } : p)));
      setEditId(null);
      setEditCaption("");
      setMsg("Caption saved ✅");
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

        <div className="flex items-center gap-3">
          <button
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={!file || busy || atLimit}
            onClick={onUpload}
          >
            {busy ? "Uploading..." : "Upload"}
          </button>

          {busy ? (
            <button
              type="button"
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
              onClick={onCancelUpload}
            >
              Cancel
            </button>
          ) : null}
        </div>

        {busy ? (
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>Upload progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
              <div className="h-2 rounded-full bg-neutral-900" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}

        {msg ? <div className="text-sm text-neutral-700">{msg}</div> : null}
        <div className="text-xs text-neutral-500">
          Video limit: {MAX_VIDEO_SECONDS}s • Max video size: {prettyMB(MAX_VIDEO_BYTES)}
        </div>
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
                  <div className="text-[11px] text-neutral-500">
                    {it.media_type === "video" ? "Video" : "Image"}
                  </div>

                  {editId === it.id ? (
                    <div className="mt-2 grid gap-2">
                      <input
                        className="w-full rounded-lg border border-neutral-200 px-2 py-2 text-xs"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        maxLength={140}
                        placeholder="Caption (optional)"
                        disabled={busy}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                          disabled={busy}
                          onClick={() => onSaveCaption(it)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 disabled:opacity-50"
                          disabled={busy}
                          onClick={() => {
                            setEditId(null);
                            setEditCaption("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="text-[11px] text-neutral-500">{editCaption.length}/140</div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      {it.caption ? <div className="text-xs text-neutral-700">{it.caption}</div> : <div className="text-xs text-neutral-400">No caption</div>}
                      <button
                        type="button"
                        className="mt-2 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => {
                          setEditId(it.id);
                          setEditCaption(it.caption ?? "");
                        }}
                      >
                        Edit caption
                      </button>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
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