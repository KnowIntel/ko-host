// app/dashboard/microsites/MicrositesTableClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTemplateLayoutRegistry } from "@/lib/templates/layout-presets/layoutRegistry";

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

type StatusFilter =
  | "all"
  | "active"
  | "expired"
  | "draft"
  | "published"
  | "unpublished"
  | "deactivated";

type SortOption =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "expiring-soon"
  | "expiring-last";

type ActionModalState =
  | {
      open: false;
      actionType: null;
      targetId: null;
      targetTitle: null;
    }
  | {
      open: true;
      actionType: "cancelDraft";
      targetId: string;
      targetTitle: string | null;
    };

function getMsUntilExpiration(paidUntil: string | null) {
  if (!paidUntil) return null;

  const time = new Date(paidUntil).getTime();

  if (Number.isNaN(time)) return null;

  return time - Date.now();
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDesignLabel(templateKey: string, designKey: string | null) {
  if (!designKey) return "—";

  try {
    const registry = getTemplateLayoutRegistry(templateKey);

    if (!registry?.layouts?.length) {
      return designKey;
    }

    const matchedLayout = registry.layouts.find(
      (layout) => layout.designKey === designKey,
    );

    return matchedLayout?.card?.label?.trim() || designKey;
  } catch {
    return designKey;
  }
}

function getTemplateDisplayName(templateKey: string) {
  if (!templateKey) return "Unknown";

  return templateKey
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

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
        (m) =>
          m.rowType === "microsite" &&
          m.id === checkoutMicrositeId,
      );

      if (byId) return byId;
    }

    if (checkoutSlug) {
      const bySlug = microsites.find(
        (m) =>
          m.rowType === "microsite" &&
          m.slug === checkoutSlug,
      );

      if (bySlug) return bySlug;
    }

    return null;
  }, [checkoutMicrositeId, checkoutSlug, microsites]);

  const focusPaidActive =
    focusRow && focusRow.rowType === "microsite"
      ? isPaidActive(focusRow.paid_until)
      : false;

  const templateOptions = useMemo(() => {
    return Array.from(
      new Set(
        microsites
          .map((m) => m.template_key)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) =>
      getTemplateDisplayName(a).localeCompare(
        getTemplateDisplayName(b),
      ),
    );
  }, [microsites]);

  const filteredMicrosites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const rows = microsites.filter((m) => {
      const isDeactivated =
        m.rowType === "microsite" &&
        m.is_active === false;

      const active =
        m.rowType === "microsite" &&
        !isDeactivated &&
        isPaidActive(m.paid_until);

      const expired =
        m.rowType === "microsite" &&
        !isDeactivated &&
        Boolean(m.paid_until) &&
        !isPaidActive(m.paid_until);

      const designLabel = getDesignLabel(
        m.template_key,
        m.design_key,
      ).toLowerCase();

      const searchableValues = [
        m.title,
        m.slug,
        m.template_key,
        getTemplateDisplayName(m.template_key),
        m.design_key,
        designLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableValues.includes(query);

      const matchesTemplate =
        templateFilter === "all" ||
        m.template_key === templateFilter;

      let matchesStatus = true;

      switch (statusFilter) {
        case "active":
          matchesStatus = active;
          break;

        case "expired":
          matchesStatus = expired;
          break;

        case "draft":
          matchesStatus = m.rowType === "draft";
          break;

        case "published":
          matchesStatus =
            m.rowType === "microsite" &&
            m.is_published &&
            !isDeactivated;
          break;

        case "unpublished":
          matchesStatus =
            m.rowType === "microsite" &&
            !m.is_published &&
            !isDeactivated;
          break;

        case "deactivated":
          matchesStatus = isDeactivated;
          break;

        default:
          matchesStatus = true;
      }

      return (
        matchesSearch &&
        matchesTemplate &&
        matchesStatus
      );
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "name-asc":
          return (a.title || "(Untitled)").localeCompare(
            b.title || "(Untitled)",
          );

        case "name-desc":
          return (b.title || "(Untitled)").localeCompare(
            a.title || "(Untitled)",
          );

        case "expiring-soon": {
          const aTime =
            a.rowType === "microsite" &&
            a.paid_until &&
            isPaidActive(a.paid_until)
              ? new Date(a.paid_until).getTime()
              : Number.POSITIVE_INFINITY;

          const bTime =
            b.rowType === "microsite" &&
            b.paid_until &&
            isPaidActive(b.paid_until)
              ? new Date(b.paid_until).getTime()
              : Number.POSITIVE_INFINITY;

          return aTime - bTime;
        }

        case "expiring-last": {
          const aTime =
            a.rowType === "microsite" &&
            a.paid_until
              ? new Date(a.paid_until).getTime()
              : Number.NEGATIVE_INFINITY;

          const bTime =
            b.rowType === "microsite" &&
            b.paid_until
              ? new Date(b.paid_until).getTime()
              : Number.NEGATIVE_INFINITY;

          return bTime - aTime;
        }

        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });
  }, [
    microsites,
    searchQuery,
    statusFilter,
    templateFilter,
    sortBy,
  ]);

  const filtersActive =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    templateFilter !== "all" ||
    sortBy !== "newest";

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

    const timer = window.setInterval(() => {
      tries += 1;

      if (tries > max) {
        window.clearInterval(timer);
        return;
      }

      router.refresh();
    }, 2000);

    return () => window.clearInterval(timer);
  }, [
    checkout,
    focusRow,
    focusPaidActive,
    router,
  ]);

  useEffect(() => {
    if (checkout !== "success") return;
    if (!focusRow) return;
    if (!focusPaidActive) return;

    setHighlightedRowId(
      `${focusRow.rowType}:${focusRow.id}`,
    );

    setFeedback({
      type: "success",
      message: `Payment successful. ${
        focusRow.title || "Microsite"
      } is now active.`,
    });

    const url = new URL(window.location.href);

    url.searchParams.delete("checkout");
    url.searchParams.delete("micrositeId");
    url.searchParams.delete("slug");

    window.history.replaceState(
      {},
      "",
      url.toString(),
    );
  }, [
    checkout,
    focusRow,
    focusPaidActive,
  ]);

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setTemplateFilter("all");
    setSortBy("newest");
  }

  function openActionModal(
    actionType: "cancelDraft",
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

  async function togglePublish(
    m: DashboardRow,
    publishOverride?: boolean,
  ) {
    if (m.rowType !== "microsite") return;

    try {
      setBusyId(m.id);

      const next =
        typeof publishOverride === "boolean"
          ? publishOverride
          : !m.is_published;

      setFeedback({
        type: "info",
        message: `${next ? "Publishing" : "Unpublishing"} ${
          m.title || "microsite"
        }...`,
      });

      const res = await fetch(
        `/api/dashboard/microsites/${m.id}/publish`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            publish: next,
          }),
        },
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (res.status === 402) {
        setFeedback({
          type: "error",
          message:
            data?.error ||
            "Payment required to publish.",
        });
        return;
      }

      if (!res.ok) {
        setFeedback({
          type: "error",
          message:
            data?.error ||
            "Failed to update publish status.",
        });
        return;
      }

      if (next) {
        const nextSlug =
          data?.microsite?.slug &&
          typeof data.microsite.slug === "string"
            ? data.microsite.slug
            : m.slug;

        window.location.assign(
          `https://${nextSlug}.ko-host.com`,
        );
        return;
      }

      setFeedback({
        type: "success",
        message: "Microsite unpublished.",
      });

      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function cancelDraft(
    id: string,
    title?: string,
  ) {
    try {
      setBusyId(id);

      setFeedback({
        type: "info",
        message: `Canceling ${title || "draft"}...`,
      });

      const res = await fetch(
        `/api/dashboard/drafts/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        setFeedback({
          type: "error",
          message:
            data?.error ||
            "Failed to cancel draft.",
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

  async function handleConfirmAction() {
    if (!actionModal.open) return;

    if (
      actionModal.actionType === "cancelDraft"
    ) {
      await cancelDraft(
        actionModal.targetId,
        actionModal.targetTitle || undefined,
      );
    }
  }

  const modalConfig = actionModal.open
    ? {
        title: "Cancel draft?",
        message:
          "This will remove the saved draft from your dashboard. This action cannot be undone.",
        confirmLabel: "Cancel Draft",
        confirmClass:
          "inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
      }
    : null;

  const inputClass =
    "h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100";

  const secondaryButtonClass =
    "inline-flex min-h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50";

  return (
    <>
      <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
        {/* -------------------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------------------- */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Microsites
            </h1>

            <p className="mt-1.5 text-sm leading-6 text-neutral-500">
              Manage your microsites and saved drafts.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-neutral-700 transition hover:text-neutral-950"
          >
            <span aria-hidden="true">←</span>
            Back
          </Link>
        </div>

        {/* -------------------------------------------------- */}
        {/* FEEDBACK */}
        {/* -------------------------------------------------- */}

        {feedback ? (
          <div
            className={[
              "mt-5 rounded-xl border px-4 py-3 text-sm font-medium",
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

        {/* -------------------------------------------------- */}
        {/* SEARCH / FILTER / SORT TOOLBAR */}
        {/* -------------------------------------------------- */}

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(150px,0.8fr)_minmax(180px,1fr)_minmax(170px,0.9fr)]">
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                ⌕
              </span>

              <input
                type="search"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search microsites..."
                className={`${inputClass} w-full pl-9`}
                aria-label="Search microsites"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as StatusFilter,
                )
              }
              className={`${inputClass} w-full`}
              aria-label="Filter by status"
            >
              <option value="all">
                All statuses
              </option>
              <option value="active">
                Active
              </option>
              <option value="expired">
                Expired
              </option>
              <option value="draft">
                Drafts
              </option>
              <option value="published">
                Published
              </option>
              <option value="unpublished">
                Unpublished
              </option>
              <option value="deactivated">
                Deactivated
              </option>
            </select>

            <select
              value={templateFilter}
              onChange={(e) =>
                setTemplateFilter(e.target.value)
              }
              className={`${inputClass} w-full`}
              aria-label="Filter by template"
            >
              <option value="all">
                All templates
              </option>

              {templateOptions.map(
                (templateKey) => (
                  <option
                    key={templateKey}
                    value={templateKey}
                  >
                    {getTemplateDisplayName(
                      templateKey,
                    )}
                  </option>
                ),
              )}
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as SortOption,
                )
              }
              className={`${inputClass} w-full`}
              aria-label="Sort microsites"
            >
              <option value="newest">
                Newest first
              </option>
              <option value="oldest">
                Oldest first
              </option>
              <option value="name-asc">
                Name A–Z
              </option>
              <option value="name-desc">
                Name Z–A
              </option>
              <option value="expiring-soon">
                Expiring soon
              </option>
              <option value="expiring-last">
                Expiring last
              </option>
            </select>
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-neutral-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-medium text-neutral-500">
              Showing{" "}
              <span className="font-semibold text-neutral-800">
                {filteredMicrosites.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-neutral-800">
                {microsites.length}
              </span>{" "}
              {microsites.length === 1
                ? "item"
                : "items"}
            </div>

            {filtersActive ? (
              <button
                type="button"
                onClick={clearFilters}
                className="w-fit text-xs font-semibold text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* TABLE */}
        {/* -------------------------------------------------- */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] table-fixed text-left">
              <colgroup>
                <col className="w-[29%]" />
                <col className="w-[19%]" />
                <col className="w-[19%]" />
                <col className="w-[10%]" />
                <col className="w-[23%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80">
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Microsite
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Template & Design
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Published
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200">
                {microsites.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >
                      <div className="text-base font-semibold text-neutral-900">
                        No microsites yet
                      </div>

                      <div className="mt-2 text-sm text-neutral-500">
                        Your microsites and saved drafts will appear here.
                      </div>

                      <Link
                        href="/templates"
                        className="mt-5 inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                      >
                        Browse Templates
                      </Link>
                    </td>
                  </tr>
                ) : filteredMicrosites.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >
                      <div className="text-base font-semibold text-neutral-900">
                        No matching microsites
                      </div>

                      <div className="mt-2 text-sm text-neutral-500">
                        Try changing your search or filters.
                      </div>

                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-5 inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                      >
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredMicrosites.map((m) => {
                    const isDeactivated =
                      m.rowType === "microsite" &&
                      m.is_active === false;

                    const active =
                      m.rowType === "microsite" &&
                      !isDeactivated
                        ? isPaidActive(
                            m.paid_until,
                          )
                        : false;

                    const daysUntilExpiration =
                      m.rowType === "microsite"
                        ? getDaysUntilExpiration(
                            m.paid_until,
                          )
                        : null;

                    const designKey =
                      m.design_key || "blank";

                    const designLabel =
                      getDesignLabel(
                        m.template_key,
                        m.design_key,
                      );

                    const rowKey =
                      `${m.rowType}:${m.id}`;

                    const isHighlighted =
                      highlightedRowId === rowKey;

                    const publicDomain =
                      m.rowType === "microsite" &&
                      m.slug
                        ? `${m.slug}.ko-host.com`
                        : null;

                    return (
                      <tr
                        key={rowKey}
                        className={[
                          "align-top transition-colors hover:bg-neutral-50/70",
                          isHighlighted
                            ? "bg-emerald-50/70"
                            : "bg-white",
                        ].join(" ")}
                      >
                        {/* -------------------------------- */}
                        {/* MICROSITE */}
                        {/* -------------------------------- */}

                        <td className="px-5 py-5">
                          <div className="text-[15px] font-semibold leading-5 text-neutral-950">
                            {m.title ||
                              "(Untitled)"}
                          </div>

                          {publicDomain ? (
                            <div className="mt-1.5 break-all text-xs font-medium leading-5 text-neutral-500">
                              {publicDomain}
                            </div>
                          ) : (
                            <div className="mt-1.5 text-xs font-medium text-neutral-400">
                              Site address not assigned
                            </div>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-4 text-neutral-400">
                            {m.rowType ===
                            "draft" ? (
                              <span>
                                Draft updated{" "}
                                {formatDateTime(
                                  m.updated_at ||
                                    m.created_at,
                                )}
                              </span>
                            ) : (
                              <>
                                <span>
                                  Created{" "}
                                  {formatDate(
                                    m.created_at,
                                  )}
                                </span>

                                <span
                                  aria-hidden="true"
                                  className="text-neutral-300"
                                >
                                  •
                                </span>

                                <span>
                                  Updated{" "}
                                  {formatDate(
                                    m.updated_at ||
                                      m.created_at,
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* -------------------------------- */}
                        {/* TEMPLATE */}
                        {/* -------------------------------- */}

                        <td className="px-5 py-5">
                          <div className="text-sm font-semibold leading-5 text-neutral-800">
                            {getTemplateDisplayName(
                              m.template_key,
                            )}
                          </div>

                          <div className="mt-1.5 text-xs leading-5 text-neutral-500">
                            Design:{" "}
                            <span className="font-medium text-neutral-700">
                              {designLabel}
                            </span>
                          </div>
                        </td>

                        {/* -------------------------------- */}
                        {/* STATUS */}
                        {/* -------------------------------- */}

                        <td className="px-5 py-5">
                          {m.rowType ===
                          "draft" ? (
                            <div>
                              <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                Draft
                              </span>

                              <div className="mt-2 text-xs leading-5 text-neutral-500">
                                Not published yet
                              </div>
                            </div>
                          ) : isDeactivated ? (
                            <div>
                              <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                                Deactivated
                              </span>

                              <div className="mt-2 text-xs leading-5 text-neutral-500">
                                Public access disabled
                              </div>
                            </div>
                          ) : active ? (
                            <div>
                              <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                Active
                              </span>

                              <div className="mt-2 text-xs leading-5 text-neutral-600">
                                Expires{" "}
                                {formatDate(
                                  m.paid_until,
                                )}
                              </div>

                              {daysUntilExpiration !==
                              null ? (
                                <div className="mt-0.5 text-[11px] font-medium leading-5 text-neutral-400">
                                  {daysUntilExpiration ===
                                  1
                                    ? "1 day remaining"
                                    : `${daysUntilExpiration} days remaining`}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                                Expired
                              </span>

                              {m.paid_until ? (
                                <div className="mt-2 text-xs leading-5 text-neutral-500">
                                  Expired{" "}
                                  {formatDate(
                                    m.paid_until,
                                  )}
                                </div>
                              ) : (
                                <div className="mt-2 text-xs leading-5 text-neutral-500">
                                  Payment required
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* -------------------------------- */}
                        {/* PUBLISHED */}
                        {/* -------------------------------- */}

                        <td className="px-5 py-5">
                          {m.rowType ===
                            "microsite" &&
                          m.is_published ? (
                            <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                              No
                            </span>
                          )}
                        </td>

                        {/* -------------------------------- */}
                        {/* ACTIONS */}
                        {/* -------------------------------- */}

                        <td className="px-5 py-5">
                          {m.rowType ===
                          "draft" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href={`/create/${encodeURIComponent(
                                  m.template_key,
                                )}?design=${encodeURIComponent(
                                  designKey,
                                )}&mode=draft`}
                                className={
                                  secondaryButtonClass
                                }
                              >
                                Open Builder
                              </Link>

                              <Link
                                href={`/create/${encodeURIComponent(
                                  m.template_key,
                                )}/publish?design=${encodeURIComponent(
                                  designKey,
                                )}`}
                                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Publish
                              </Link>

                              <button
                                type="button"
                                disabled={
                                  busyId === m.id
                                }
                                onClick={() =>
                                  openActionModal(
                                    "cancelDraft",
                                    m.id,
                                    m.title,
                                  )
                                }
                                className="col-span-2 inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {busyId === m.id
                                  ? "Working..."
                                  : "Cancel Draft"}
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href={`/dashboard/microsites/${m.id}`}
                                className={
                                  secondaryButtonClass
                                }
                              >
                                Manage
                              </Link>

                              {m.is_published &&
                              !isDeactivated ? (
                                <a
                                  href={`https://${m.slug}.ko-host.com`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                  Open Site
                                </a>
                              ) : (
                                <a
                                  href={`/s/${encodeURIComponent(
                                    m.slug,
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={
                                    secondaryButtonClass
                                  }
                                >
                                  Preview
                                </a>
                              )}

                              {!isDeactivated ? (
                                <button
                                  type="button"
                                  disabled={
                                    busyId === m.id
                                  }
                                  onClick={() =>
                                    void togglePublish(
                                      m,
                                      !m.is_published,
                                    )
                                  }
                                  className={[
                                    "inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                                    m.is_published
                                      ? "border border-amber-300 bg-white text-amber-700 hover:border-amber-400 hover:bg-amber-50"
                                      : "border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
                                  ].join(" ")}
                                >
                                  {busyId === m.id
                                    ? "Working..."
                                    : m.is_published
                                      ? "Unpublish"
                                      : "Publish"}
                                </button>
                              ) : (
                                <div />
                              )}

                              <form
                                action="/api/stripe/checkout"
                                method="POST"
                                className="w-full"
                              >
                                <input
                                  type="hidden"
                                  name="micrositeId"
                                  value={m.id}
                                />

                                <button
                                  type="submit"
                                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
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
        </div>

        {/* -------------------------------------------------- */}
        {/* FOOTER */}
        {/* -------------------------------------------------- */}

        <div className="mt-4 flex flex-col gap-1 text-xs leading-5 text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Drafts stay editable. Published microsites can be extended at any time.
          </p>

          {microsites.length > 0 ? (
            <p className="font-medium text-neutral-400">
              {microsites.length}{" "}
              {microsites.length === 1
                ? "item"
                : "items"}{" "}
              total
            </p>
          ) : null}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ACTION MODAL */}
      {/* ---------------------------------------------------- */}

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
              <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-2.5 text-sm font-semibold text-neutral-900">
                {actionModal.targetTitle}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={Boolean(busyId)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep It
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleConfirmAction()
                }
                disabled={Boolean(busyId)}
                className={
                  modalConfig.confirmClass
                }
              >
                {busyId
                  ? "Working..."
                  : modalConfig.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}