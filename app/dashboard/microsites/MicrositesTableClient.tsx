"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function getMsUntilExpiration(paidUntil: string | null) {
  if (!paidUntil) return null;
  return new Date(paidUntil).getTime() - Date.now();
}

function isPaidActive(paidUntil: string | null) {
  const ms = getMsUntilExpiration(paidUntil);
  return ms !== null && ms > 0;
}

function getDaysUntilExpiration(paidUntil: string | null) {
  const ms = getMsUntilExpiration(paidUntil);
  if (ms === null) return null;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function MicrositesTableClient({
  microsites,
}: {
  microsites: MicrositeRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [busyId, setBusyId] = useState<string | null>(null);

  const checkout = searchParams.get("checkout");
  const checkoutMicrositeId = searchParams.get("micrositeId") || "";
  const checkoutSlug = searchParams.get("slug") || "";

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

    const timer = setInterval(() => {
      tries += 1;

      if (tries > max) {
        clearInterval(timer);
        return;
      }

      router.refresh();
    }, 2000);

    return () => clearInterval(timer);
  }, [checkout, focusRow, focusPaidActive, router]);

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

      const next =
        typeof publishOverride === "boolean"
          ? publishOverride
          : !m.is_published;

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

      router.refresh();
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
            Showing microsites with active paid access, whether published or
            unpublished.
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
          <div className="text-sm font-semibold text-green-900">
            Payment successful
          </div>

          {!focusRow ? (
            <div className="mt-1 text-sm text-green-900/80">
              Refreshing your microsite access status.
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
          <div className="text-sm font-semibold text-neutral-900">
            Checkout canceled
          </div>
          <div className="mt-1 text-sm text-neutral-700">
            No worries — you can try again anytime from the microsite row.
          </div>
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
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
                <td className="px-4 py-4 text-neutral-600" colSpan={6}>
                  No paid microsites yet.
                </td>
              </tr>
            ) : (
              microsites.map((m) => {
                const active = isPaidActive(m.paid_until);
                const publicUrl = `https://${m.slug}.ko-host.com`;
                const daysUntilExpiration = getDaysUntilExpiration(m.paid_until);

                const isFocused =
                  (checkoutMicrositeId && m.id === checkoutMicrositeId) ||
                  (checkoutSlug && m.slug === checkoutSlug);

                return (
                  <tr
                    key={m.id}
                    className="border-t border-neutral-200 align-top"
                    style={isFocused ? { backgroundColor: "#FEF9C3" } : undefined}
                  >
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
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono text-neutral-900">{m.slug}</div>
                      <div className="mt-1 text-xs font-mono text-neutral-600">
                        {publicUrl}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-neutral-800">
                      {m.template_key}
                    </td>

                    <td className="px-4 py-3">
                      {active ? (
                        <div className="text-xs">
                          <span className="rounded-full bg-green-50 px-2 py-1 font-medium text-green-700">
                            Active
                          </span>
                          <div className="mt-1 text-neutral-600">
                            Until {new Date(m.paid_until as string).toLocaleString()}
                          </div>
                          {daysUntilExpiration !== null ? (
                            <div className="mt-1 text-neutral-600">
                              This page will expire in {daysUntilExpiration} day
                              {daysUntilExpiration === 1 ? "" : "s"}.
                            </div>
                          ) : null}
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
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Link
                          href={`/dashboard/microsites/${m.id}`}
                          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                        >
                          Manage
                        </Link>

                        <button
                          type="button"
                          disabled={busyId === m.id}
                          onClick={() => togglePublish(m)}
                          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900 disabled:opacity-50 whitespace-nowrap"
                        >
                          {busyId === m.id
                            ? "Working..."
                            : m.is_published
                              ? "Unpublish"
                              : "Publish"}
                        </button>

                        <form action="/api/stripe/checkout" method="POST" className="inline-flex shrink-0">
                          <input type="hidden" name="micrositeId" value={m.id} />
                          <button
                            type="submit"
                            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 whitespace-nowrap"
                          >
                            {active ? "Extend 90 days" : "Pay $12 (90 days)"}
                          </button>
                        </form>
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