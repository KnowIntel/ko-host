"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProviderStatus =
  | "new"
  | "viewed"
  | "responded"
  | "scheduled"
  | "completed"
  | "closed";

type StatusAction =
  | "scheduled"
  | "completed";

type Props = {
  micrositeId: string;
  requestCode: string;
  currentStatus: ProviderStatus;
};

export default function ConnectRequestStatusControls({
  micrositeId,
  requestCode,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [pendingStatus, setPendingStatus] =
    useState<StatusAction | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const isCompleted =
    currentStatus === "completed";

  const isScheduled =
    currentStatus === "scheduled";

  async function confirmStatusChange() {
    if (!pendingStatus || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard/microsites/${encodeURIComponent(
          micrositeId,
        )}/connect-requests/${encodeURIComponent(
          requestCode,
        )}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: pendingStatus,
          }),
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to update service status",
        );
      }

      setPendingStatus(null);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update service status",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Service Status
        </div>

        <h2 className="mt-2 text-base font-semibold text-neutral-900">
          Update Service Status
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Keep this request up to date
          after you&apos;ve connected
          with the customer.
        </p>

        {isCompleted ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="text-sm font-semibold text-emerald-800">
              Service Completed
            </div>

            <div className="mt-1 text-xs leading-5 text-emerald-700">
              You confirmed that this
              service has been completed.
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {!isScheduled ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setPendingStatus(
                    "scheduled",
                  );
                }}
                className="inline-flex w-full items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                Mark as Scheduled
              </button>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="text-sm font-semibold text-amber-800">
                  Service Scheduled
                </div>

                <div className="mt-1 text-xs leading-5 text-amber-700">
                  This service is
                  currently marked as
                  scheduled.
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setError(null);
                setPendingStatus(
                  "completed",
                );
              }}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Mark as Completed
            </button>
          </div>
        )}

        {error ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      {pendingStatus ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Confirm Status Change
            </div>

            <h2 className="mt-2 text-xl font-semibold text-neutral-900">
              {pendingStatus ===
              "scheduled"
                ? "Mark this service as scheduled?"
                : "Mark this service as completed?"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {pendingStatus ===
              "scheduled"
                ? "Confirm that you and the customer have scheduled this service."
                : "Confirm that you have finished providing this service to the customer."}
            </p>

            {pendingStatus ===
            "completed" ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                Once marked completed,
                this request cannot be
                moved back to Scheduled.
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  if (saving) return;

                  setError(null);
                  setPendingStatus(null);
                }}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={
                  confirmStatusChange
                }
                className={[
                  "inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                  pendingStatus ===
                  "completed"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700",
                ].join(" ")}
              >
                {saving
                  ? "Updating..."
                  : pendingStatus ===
                      "scheduled"
                    ? "Yes, Scheduled"
                    : "Yes, Completed"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}