"use client";

import Link from "next/link";
import { useState } from "react";

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  template_key: string;
  is_published: boolean;
  paid_until: string | null;
  created_at: string;
};

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

export default function MicrositesTableClient({ microsites }: { microsites: MicrositeRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function togglePublish(m: MicrositeRow) {
    try {
      setBusyId(m.id);

      const res = await fetch(`/api/dashboard/microsites/${m.id}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publish: !m.is_published }),
      });

      if (res.status === 402) {
        alert("Payment required to publish.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to update publish status.");
        return;
      }

      window.location.reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Microsites</h1>
          <p className="mt-1 text-sm text-neutral-700">
            Manage your sites and view submissions. Pay per microsite for 90 days.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          Back
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-700">Title</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Slug</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Template</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Access</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Published</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {microsites.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-neutral-600" colSpan={6}>
                  No microsites yet.
                </td>
              </tr>
            ) : (
              microsites.map((m) => {
                const active = isPaidActive(m.paid_until);
                const publicUrl = `https://${m.slug}.ko-host.com`;

                return (
                  <tr key={m.id} className="border-t border-neutral-200 align-top">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      <Link
                        href={`/dashboard/microsites/${m.id}`}
                        className="underline underline-offset-4"
                      >
                        {m.title || "(Untitled)"}
                      </Link>

                      <div className="mt-1 text-xs text-neutral-600">
                        <a
                          className="underline underline-offset-4"
                          href={`/s/${m.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Preview (/s/{m.slug})
                        </a>
                        <span className="mx-2">·</span>
                        <span className="font-mono">{publicUrl}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-neutral-800">{m.slug}</td>
                    <td className="px-4 py-3 font-mono text-neutral-800">{m.template_key}</td>

                    <td className="px-4 py-3">
                      {active ? (
                        <div className="text-xs">
                          <span className="rounded-full bg-green-50 px-2 py-1 font-medium text-green-700">
                            Active
                          </span>
                          <div className="mt-1 text-neutral-600">
                            Until {new Date(m.paid_until as string).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                          Not paid
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {m.is_published ? (
                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          Yes
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/dashboard/microsites/${m.id}`}
                          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                        >
                          Manage
                        </Link>

                        <Link
                          href={`/dashboard/microsites/${m.id}/rsvp`}
                          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                        >
                          RSVP submissions
                        </Link>

                        <form action="/api/stripe/checkout" method="POST" className="inline-flex">
                          <input type="hidden" name="micrositeId" value={m.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800"
                          >
                            Pay $14 (90 days)
                          </button>
                        </form>

                        <button
                          type="button"
                          disabled={busyId === m.id}
                          onClick={() => togglePublish(m)}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900 disabled:opacity-50"
                        >
                          {busyId === m.id
                            ? "Working..."
                            : m.is_published
                            ? "Unpublish"
                            : "Publish"}
                        </button>
                      </div>

                      {!active && !m.is_published ? (
                        <div className="mt-2 text-xs text-neutral-600">Pay to unlock publishing.</div>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-neutral-600">
        Repurchase to extend time. Paid time stacks automatically.
      </p>
    </div>
  );
}