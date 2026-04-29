"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type FileShareUploadRow = {
  id: string;
  block_id: string;
  original_filename: string;
  mime_type: string | null;
  size_bytes: number;
  uploader_name: string | null;
  uploader_email: string | null;
  uploader_message: string | null;
  uploaded_at: string;
  preview_url?: string | null;
};

export default function DashboardMicrositeUploadsPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [uploads, setUploads] = useState<FileShareUploadRow[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [uploadsMessage, setUploadsMessage] = useState("");
  const [downloadAccessCodes, setDownloadAccessCodes] = useState<Record<string, string>>({});
  const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);

  const [uploadSort, setUploadSort] = useState<
    "newest" | "oldest" | "largest" | "smallest"
  >("newest");

  const [uploadFileType, setUploadFileType] = useState<
    "" | "images" | "pdf" | "doc" | "txt"
  >("");

  const [uploadSearch, setUploadSearch] = useState("");

  async function loadUploads() {
    try {
      setUploadsLoading(true);
      setUploadsMessage("");

      const params = new URLSearchParams();

      if (uploadSort) params.set("sort", uploadSort);
      if (uploadFileType) params.set("fileType", uploadFileType);
      if (uploadSearch.trim()) params.set("search", uploadSearch.trim());

      const queryString = params.toString();

      const res = await fetch(
        `/api/dashboard/microsites/${id}/uploads${queryString ? `?${queryString}` : ""}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUploadsMessage(data?.error || "Failed to load uploads.");
        setUploads([]);
        return;
      }

      setUploads(Array.isArray(data?.uploads) ? data.uploads : []);
    } catch (error) {
      setUploadsMessage(
        error instanceof Error ? error.message : "Unexpected error.",
      );
      setUploads([]);
    } finally {
      setUploadsLoading(false);
    }
  }

  async function deleteUpload(uploadId: string) {
    try {
      setDeletingUploadId(uploadId);
      setUploadsMessage("");

      const res = await fetch(
        `/api/dashboard/microsites/${id}/uploads/${uploadId}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUploadsMessage(data?.error || "Failed to delete upload.");
        return;
      }

      setUploads((prev) => prev.filter((item) => item.id !== uploadId));
      setUploadsMessage("Upload deleted.");
    } catch (error) {
      setUploadsMessage(
        error instanceof Error ? error.message : "Unexpected error.",
      );
    } finally {
      setDeletingUploadId(null);
    }
  }

  useEffect(() => {
    if (id) {
      void loadUploads();
    }
  }, [id, uploadSort, uploadFileType]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <Link
          href={`/dashboard/microsites/${id}`}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-950"
        >
          ← Back to Manage
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              Media Uploads
            </h1>
            <div className="mt-1 text-sm text-neutral-600">
              Files submitted through File Share blocks on this microsite.
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadUploads()}
            disabled={uploadsLoading}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900 disabled:opacity-60"
          >
            {uploadsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {uploadsMessage ? (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            {uploadsMessage}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Search
            </div>
            <input
              type="text"
              value={uploadSearch}
              onChange={(e) => setUploadSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void loadUploads();
              }}
              placeholder="Filename, email, message..."
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            />
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              File Type
            </div>
            <select
              value={uploadFileType}
              onChange={(e) =>
                setUploadFileType(
                  e.target.value as "" | "images" | "pdf" | "doc" | "txt",
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            >
              <option value="">All</option>
              <option value="images">Images</option>
              <option value="pdf">PDF</option>
              <option value="doc">Doc / Docx</option>
              <option value="txt">Text</option>
            </select>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Sort
            </div>
            <select
              value={uploadSort}
              onChange={(e) =>
                setUploadSort(
                  e.target.value as "newest" | "oldest" | "largest" | "smallest",
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="largest">Largest</option>
              <option value="smallest">Smallest</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => void loadUploads()}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Apply Search
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-700">Preview</th>
                <th className="px-4 py-3 font-medium text-neutral-700">File</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Uploader</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Email</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Message</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Size</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Uploaded</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Action</th>
              </tr>
            </thead>

            <tbody>
              {uploadsLoading ? (
                <tr>
                  <td className="px-4 py-4 text-neutral-600" colSpan={8}>
                    Loading uploads...
                  </td>
                </tr>
              ) : uploads.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-neutral-600" colSpan={8}>
                    No uploads yet.
                  </td>
                </tr>
              ) : (
                uploads.map((upload) => (
                  <tr key={upload.id} className="border-t border-neutral-200">
                    <td className="px-4 py-4 text-neutral-600">
                      {upload.preview_url ? (
                        <img
                          src={upload.preview_url}
                          alt={upload.original_filename}
                          className="h-14 w-14 rounded-lg border border-neutral-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">
                          —
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-neutral-900">
                      {upload.original_filename}
                    </td>

                    <td className="px-4 py-4 text-neutral-600">
                      {upload.uploader_name || "—"}
                    </td>

                    <td className="px-4 py-4 text-neutral-600">
                      {upload.uploader_email || "—"}
                    </td>

                    <td className="px-4 py-4 text-neutral-600">
                      {upload.uploader_message || "—"}
                    </td>

                    <td className="px-4 py-4 text-neutral-600">
                      {upload.size_bytes
                        ? `${(upload.size_bytes / 1024 / 1024).toFixed(2)} MB`
                        : "0 MB"}
                    </td>

                    <td className="px-4 py-4 text-neutral-600">
                      {upload.uploaded_at
                        ? new Date(upload.uploaded_at).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-4 py-4 text-neutral-600">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={downloadAccessCodes[upload.id] ?? ""}
                          onChange={(e) =>
                            setDownloadAccessCodes((prev) => ({
                              ...prev,
                              [upload.id]: e.target.value,
                            }))
                          }
                          placeholder="Access code if required"
                          className="h-9 w-full min-w-[180px] rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
                        />

                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/api/dashboard/microsites/${id}/uploads/${upload.id}?accessCode=${encodeURIComponent(
                              downloadAccessCodes[upload.id] ?? "",
                            )}`}
                            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:border-neutral-900"
                          >
                            Download
                          </a>

                          <button
                            type="button"
                            onClick={() => void deleteUpload(upload.id)}
                            disabled={deletingUploadId === upload.id}
                            className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:border-red-500 disabled:opacity-60"
                          >
                            {deletingUploadId === upload.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}