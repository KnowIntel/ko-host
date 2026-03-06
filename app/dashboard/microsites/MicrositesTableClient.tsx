"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  template_key: string;
  is_published: boolean;
  paid_until: string | null;
  created_at: string;
  is_favorite: boolean;
};

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

export default function MicrositesTableClient({ microsites }: { microsites: MicrositeRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
  const sp = useSearchParams();

  const checkout = sp.get("checkout");
  const checkoutMicrositeId = sp.get("micrositeId") || "";
  const checkoutSlug = sp.get("slug") || "";

  const focusRow = useMemo(() => {
    if (checkoutMicrositeId) {
      const byId = microsites.find((m) => m.id === checkoutMicrositeId);
      if (byId) return byId;
    }
    if (checkoutSlug) {
      const bySlug = microsites.find((m) => m.slug === checkoutSlug);
      if (bySlug) return bySlug;
    }
    return null;
  }, [checkoutMicrositeId, checkoutSlug, microsites]);

  const focusPaidActive = focusRow ? isPaidActive(focusRow.paid_until) : false;

  useEffect(() => {
    if (checkout !== "success") return;
    if (!focusRow) return;
    if (focusPaidActive) return;

    let tries = 0;
    const max = 5;

    const t = setInterval(() => {
      tries += 1;
      if (tries > max) {
        clearInterval(t);
        return;
      }
      window.location.reload();
    }, 2000);

    return () => clearInterval(t);
  }, [checkout, focusRow, focusPaidActive]);

  useEffect(() => {
    if (checkout !== "success") return;
    if (!focusRow) return;
    if (!focusPaidActive) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("micrositeId");
    url.searchParams.delete("slug");
    window.history.replaceState({}, "", url.toString());
  }, [checkout, focusRow, focusPaidActive]);

  async function togglePublish(m: MicrositeRow, publishOverride?: boolean) {
    try {
      setBusyId(m.id);

      const next = typeof publishOverride === "boolean" ? publishOverride : !m.is_published;

      const res = await fetch(`/api/dashboard/microsites/${m.id}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publish: next }),
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

  async function toggleFavorite(m: MicrositeRow) {
    try {
      setFavoriteBusyId(m.id);

      const res = await fetch(`/api/dashboard/microsites/${m.id}/favorite`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isFavorite: !m.is_favorite }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to update favorite.");
        return;
      }

      window.location.reload();
    } finally {
      setFavoriteBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Microsites</h1>
          <p className="mt-1 text-sm text-neutral-700">
            Showing only favorited microsites with active paid access.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          Back
        </Link>
      </div>

      {checkout === "success" ? (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="text-sm font-semibold text-green-900">Payment successful</div>

          {!focusRow ? (
            <div className="mt-1 text-sm text-green-900/80">
              Returning… If you don’t see your microsite highlighted, refresh once.
            </div>
          ) : !focusPaidActive ? (
            <div className="mt-1 text-sm text-green-900/80">
              Processing payment… this page will refresh automatically.
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-green-900/80">
              <div>
                Access active until{" "}
                <span className="font-medium">
                  {new Date(focusRow.paid_until as string).toLocaleString()}
                </span>
                .
              </div>

              {!focusRow.is_published ? (
                <button
                  type="button"
                  disabled={busyId === focusRow.id}
                  onClick={() => togglePublish(focusRow, true)}
                  className="inline-flex items-center justify-center rounded-xl bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {busyId === focusRow.id ? "Publishing…" : "Publish now"}
                </button>
              ) : (
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-green-800">
                  Already published
                </span>
              )}
            </div>
          )}
        </div>
      ) : checkout === "cancel" ? (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-sm font-semibold text-neutral-900">Checkout canceled</div>
          <div className="mt-1 text-sm text-neutral-700">
            No worries — you can try again anytime from the microsite row.
          </div>
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-700">Favorite</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Title</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Site</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Template</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Access</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Published</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {microsites.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-neutral-600" colSpan={7}>
                  No favorited paid microsites yet.
                </td>
              </tr>
            ) : (
              microsites.map((m) => {
                const active = isPaidActive(m.paid_until);
                const publicUrl = `https://${m.slug}.ko-host.com`;

                const isFocused =
                  (checkoutMicrositeId && m.id === checkoutMicrositeId) ||
                  (checkoutSlug && m.slug === checkoutSlug);

                return (
                  <tr
                    key={m.id}
                    className="border-t border-neutral-200 align-top"
                    style={isFocused ? { backgroundColor: "#FEF9C3" } : undefined}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={favoriteBusyId === m.id}
                        onClick={() => toggleFavorite(m)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-base hover:bg-neutral-50 disabled:opacity-50"
                        aria-label={m.is_favorite ? "Remove favorite" : "Add favorite"}
                        title={m.is_favorite ? "Favorited" : "Favorite"}
                      >
                        <span className={m.is_favorite ? "text-amber-500" : "text-neutral-400"}>
                          ★
                        </span>
                      </button>
                    </td>

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

                    <td className="px-4 py-3">
                      <div className="font-mono text-neutral-900">{m.slug}</div>
                      <div className="mt-1 text-xs font-mono text-neutral-600">{publicUrl}</div>
                    </td>

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
                            Pay $12 (90 days)
                          </button>
                        </form>

                        <button
                          type="button"
                          disabled={busyId === m.id}
                          onClick={() => togglePublish(m)}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900 disabled:opacity-50"
                        >
                          {busyId === m.id ? "Working..." : m.is_published ? "Unpublish" : "Publish"}
                        </button>
                      </div>
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