"use client";

import { useState } from "react";

export default function GalleryUploaderClient({ micrositeId }: { micrositeId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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

      setMsg("Uploaded ✅ Open the public microsite page to see it.");
      setFile(null);
      setCaption("");
    } catch (e: any) {
      setMsg(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
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
          {busy ? "Uploading..." : "Upload Photo"}
        </button>

        {msg ? <div className="text-sm text-neutral-700">{msg}</div> : null}
      </div>
    </div>
  );
}