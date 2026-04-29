"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type EntryRow = {
  id: string;
  microsite_id: string;
  message: string;
  created_at: string;
};

export default function DashboardMicrositeEntriesPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadEntries() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `/api/dashboard/microsites/${id}/entries`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setEntries([]);
        setMessage(data?.error || "Failed to load entries.");
        return;
      }

      setEntries(Array.isArray(data?.entries) ? data.entries : []);
    } catch (error) {
      setEntries([]);
      setMessage(
        error instanceof Error ? error.message : "Unexpected error.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) void loadEntries();
  }, [id]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Back */}
      <div className="mb-6">
        <Link
          href={`/dashboard/microsites/${id}`}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          ← Back to Manage
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              Text Entries
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Submissions from input fields on your microsite.
            </p>
          </div>

          <button
            onClick={() => void loadEntries()}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-900"
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            {message}
          </div>
        )}

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Content</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-neutral-600">
                    Loading...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-neutral-600">
                    No entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="px-4 py-4 text-neutral-600">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-4 py-4 text-neutral-900 whitespace-pre-wrap">
                      {entry.message?.split("<|>").map((part, index) => (
                        <div key={index}>{part}</div>
                        )) || "—"}
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