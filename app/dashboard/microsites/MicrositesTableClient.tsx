// app/dashboard/microsites/MicrositesTableClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type DashboardRow = {
  rowType: "microsite" | "draft";
  id: string;
  slug: string;
  title: string;
  template_key: string;
  design_key: string | null;
  is_active?: boolean;
  is_published: boolean;
  paid_until: string | null;
  created_at: string;
  updated_at: string | null;
  is_favorite: boolean;
};

type FeedbackState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

type ActionModalState =
  | {
      open: false;
      actionType: null;
      targetId: null;
      targetTitle: null;
    }
  | {
      open: true;
      actionType: "cancelDraft" | "deactivateMicrosite" | "reactivateMicrosite";
      targetId: string;
      targetTitle: string | null;
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

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function MicrositesTableClient({
  microsites,
}: {
  microsites: DashboardRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<ActionModalState>({
    open: false,
    actionType: null,
    targetId: null,
    targetTitle: null,
  });

  const checkout = searchParams.get("checkout");
  const checkoutMicrositeId = searchParams.get("micrositeId") || "";
  const checkoutSlug = searchParams.get("slug") || "";

  const focusRow = useMemo(() => {
    if (checkoutMicrositeId) {
      const byId = microsites.find(
        (m) => m.rowType === "microsite" && m.id === checkoutMicrositeId,
      );
      if (byId) return byId;
    }

    if (checkoutSlug) {
      const bySlug = microsites.find(
        (m) => m.rowType === "microsite" && m.slug === checkoutSlug,
      );
      if (bySlug) return bySlug;
    }

    return null;
  }, [checkoutMicrositeId, checkoutSlug, microsites]);

  const focusPaidActive =
    focusRow && focusRow.rowType === "microsite"
      ? isPaidActive(focusRow.paid_until)
      : false;

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [feedback]);

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

    setHighlightedRowId(`${focusRow.rowType}:${focusRow.id}`);
    setFeedback({
      type: "success",
      message: `Payment successful. ${focusRow.title || "Microsite"} is now active.`,
    });

    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("micrositeId");
    url.searchParams.delete("slug");
    window.history.replaceState({}, "", url.toString());
  }, [checkout, focusRow, focusPaidActive]);

  function openActionModal(
    actionType: "cancelDraft" | "deactivateMicrosite" | "reactivateMicrosite",
    targetId: string,
    targetTitle?: string,
  ) {
    setActionModal({
      open: true,
      actionType,
      targetId,
      targetTitle: targetTitle || null,
    });
  }

  function closeActionModal() {
    if (busyId) return;

    setActionModal({
      open: false,
      actionType: null,
      targetId: null,
      targetTitle: null,
    });
  }

  async function togglePublish(m: DashboardRow, publishOverride?: boolean) {
    if (m.rowType !== "microsite") return;

    try {
      setBusyId(m.id);
      setFeedback({
        type: "info",
        message: `${m.is_published ? "Unpublishing" : "Publishing"} ${m.title || "microsite"}...`,
      });

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
        setFeedback({
          type: "error",
          message: "Payment required to publish.",
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFeedback({
          type: "error",
          message: data?.error || "Failed to update publish status.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: next ? "Microsite published." : "Microsite unpublished.",
      });

      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function cancelDraft(id: string, title?: string) {
    try {
      setBusyId(id);
      setFeedback({
        type: "info",
        message: `Canceling ${title || "draft"}...`,
      });

      const res = await fetch(`/api/dashboard/drafts/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data?.error || "Failed to cancel draft.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: "Draft canceled.",
      });

      closeActionModal();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function deactivateMicrosite(id: string, title?: string) {
    try {
      setBusyId(id);
      setFeedback({
        type: "info",
        message: `Deactivating ${title || "microsite"}...`,
      });

      const res = await fetch(`/api/dashboard/microsites/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data?.error || "Failed to deactivate microsite.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: "Microsite deactivated.",
      });

      closeActionModal();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function reactivateMicrosite(id: string, title?: string) {
    try {
      setBusyId(id);
      setFeedback({
        type: "info",
        message: `Reactivating ${title || "microsite"}...`,
      });

      const res = await fetch(`/api/dashboard/microsites/${id}/reactivate`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data?.error || "Failed to reactivate microsite.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: "Microsite reactivated.",
      });

      closeActionModal();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmAction() {
    if (!actionModal.open) return;

    if (actionModal.actionType === "cancelDraft") {
      await cancelDraft(actionModal.targetId, actionModal.targetTitle || undefined);
      return;
    }

    if (actionModal.actionType === "deactivateMicrosite") {
      await deactivateMicrosite(
        actionModal.targetId,
        actionModal.targetTitle || undefined,
      );
      return;
    }

    if (actionModal.actionType === "reactivateMicrosite") {
      await reactivateMicrosite(
        actionModal.targetId,
        actionModal.targetTitle || undefined,
      );
    }
  }

  const modalConfig = actionModal.open
    ? actionModal.actionType === "cancelDraft"
      ? {
          title: "Cancel draft?",
          message:
            "This will remove the saved draft from your dashboard. This action cannot be undone.",
          confirmLabel: "Cancel Draft",
          confirmClass:
            "inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
        }
      : actionModal.actionType === "deactivateMicrosite"
        ? {
            title: "Deactivate microsite?",
            message:
              "This will disable public access and unpublish the microsite until you reactivate it.",
            confirmLabel: "Deactivate",
            confirmClass:
              "inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
          }
        : {
            title: "Reactivate microsite?",
            message:
              "This will restore the microsite. If paid time is still active, it will become publicly available again.",
            confirmLabel: "Reactivate",
            confirmClass:
              "inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60",
          }
    : null;

  return (
    <>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Microsites</h1>
            <p className="mt-1 text-sm text-neutral-700">
              Showing saved drafts and published microsites.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Back
          </Link>
        </div>

        {feedback ? (
          <div
            className={[
              "mt-4 rounded-xl border px-4 py-3 text-sm",
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : feedback.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-blue-200 bg-blue-50 text-blue-700",
            ].join(" ")}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-700">Title</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Site</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Template</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Published</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>

            <tbody>
              {microsites.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-neutral-600" colSpan={6}>
                    No microsites or drafts yet.
                  </td>
                </tr>
              ) : (
                microsites.map((m) => {
                  const isDeactivated =
                    m.rowType === "microsite" && m.is_active === false;
                  const active =
                    m.rowType === "microsite" && !isDeactivated
                      ? isPaidActive(m.paid_until)
                      : false;
                  const publicUrl = m.slug ? `https://${m.slug}.ko-host.com` : "—";
                  const daysUntilExpiration =
                    m.rowType === "microsite"
                      ? getDaysUntilExpiration(m.paid_until)
                      : null;
                  const designKey = m.design_key || "blank";
                  const rowKey = `${m.rowType}:${m.id}`;
                  const isHighlighted = highlightedRowId === rowKey;
                  const deactivateLabel =
                    m.is_published || m.paid_until ? "Deactivate" : "Remove";

                  return (
                    <tr
                      key={rowKey}
                      className={[
                        "border-t border-neutral-200 align-top transition-colors",
                        isHighlighted ? "bg-emerald-50/70" : "",
                      ].join(" ")}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {m.title || "(Untitled)"}
                        <div className="mt-1 text-xs text-neutral-500">
                          {m.rowType === "draft"
                            ? `Draft updated ${formatDate(m.updated_at || m.created_at)}`
                            : `Created ${formatDate(m.created_at)}`}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono text-neutral-900">
                          {m.slug || "—"}
                        </div>
                        <div className="mt-1 text-xs font-mono text-neutral-600">
                          {m.slug ? publicUrl : "No site name yet"}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-neutral-800">
                        <div>{m.template_key}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          Design: {designKey}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {m.rowType === "draft" ? (
                          <div className="text-xs">
                            <span className="rounded-full bg-amber-50 px-2 py-1 font-medium text-amber-700">
                              Draft only
                            </span>
                            <div className="mt-1 text-neutral-600">
                              Not published yet
                            </div>
                          </div>
                        ) : isDeactivated ? (
                          <div className="text-xs">
                            <span className="rounded-full bg-red-50 px-2 py-1 font-medium text-red-700">
                              Deactivated
                            </span>
                            <div className="mt-1 text-neutral-600">
                              Public access is disabled
                            </div>
                          </div>
                        ) : active ? (
                          <div className="text-xs">
                            <span className="rounded-full bg-green-50 px-2 py-1 font-medium text-green-700">
                              Active
                            </span>
                            <div className="mt-1 text-neutral-600">
                              Until {new Date(m.paid_until as string).toLocaleString()}
                            </div>
                            {daysUntilExpiration !== null ? (
                              <div className="mt-1 text-neutral-600">
                                Expires in {daysUntilExpiration} day
                                {daysUntilExpiration === 1 ? "" : "s"}.
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="rounded-full bg-neutral-100 px-2 py-1 font-medium text-neutral-700">
                              Unpaid / expired
                            </span>
                            <div className="mt-1 text-neutral-600">
                              Payment required
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {m.rowType === "draft" ? (
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                            No
                          </span>
                        ) : m.is_published ? (
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
                        {m.rowType === "draft" ? (
                          <div className="grid min-w-[260px] grid-cols-2 gap-2">
                            <Link
                              href={`/create/${encodeURIComponent(
                                m.template_key,
                              )}?design=${encodeURIComponent(designKey)}`}
                              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900"
                            >
                              Open Builder
                            </Link>

                            <button
                              type="button"
                              disabled={busyId === m.id}
                              onClick={() => openActionModal("cancelDraft", m.id, m.title)}
                              className="inline-flex w-full items-center justify-center rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:border-red-500 disabled:opacity-50"
                            >
                              {busyId === m.id ? "Working..." : "Cancel"}
                            </button>
                          </div>
                        ) : (
                          <div className="grid min-w-[260px] grid-cols-2 gap-2">
                            <Link
                              href={`/dashboard/microsites/${m.id}`}
                              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900"
                            >
                              Manage
                            </Link>

                            {m.is_published && !isDeactivated ? (
                              <a
                                href={`https://${m.slug}.ko-host.com`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900"
                              >
                                Open Public URL
                              </a>
                            ) : (
                              <a
                                href={`/s/${m.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900"
                              >
                                Preview Microsite
                              </a>
                            )}

                            {isDeactivated ? (
                              <button
                                type="button"
                                disabled={busyId === m.id}
                                onClick={() =>
                                  openActionModal("reactivateMicrosite", m.id, m.title)
                                }
                                className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-medium text-emerald-700 hover:border-emerald-500 disabled:opacity-50"
                              >
                                {busyId === m.id ? "Working..." : "Reactivate"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busyId === m.id}
                                onClick={() =>
                                  openActionModal("deactivateMicrosite", m.id, m.title)
                                }
                                className="inline-flex w-full items-center justify-center rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:border-red-500 disabled:opacity-50"
                              >
                                {busyId === m.id ? "Working..." : deactivateLabel}
                              </button>
                            )}

                            <form
                              action="/api/stripe/checkout"
                              method="POST"
                              className="w-full"
                            >
                              <input type="hidden" name="micrositeId" value={m.id} />
                              <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800"
                              >
                                Extend 90 days
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-neutral-600">
          Drafts stay editable. Published microsites can be extended any time.
        </p>
      </div>

      {actionModal.open && modalConfig ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="text-lg font-semibold text-neutral-950">
              {modalConfig.title}
            </div>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {modalConfig.message}
            </p>

            {actionModal.targetTitle ? (
              <div className="mt-3 text-sm font-medium text-neutral-900">
                {actionModal.targetTitle}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={Boolean(busyId)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep It
              </button>

              <button
                type="button"
                onClick={() => void handleConfirmAction()}
                disabled={Boolean(busyId)}
                className={modalConfig.confirmClass}
              >
                {busyId ? "Working..." : modalConfig.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}