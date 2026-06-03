"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EnrollmentModerationActionsProps = {
  micrositeId: string;
  entryId: string;
  status: string;
};

export default function EnrollmentModerationActions({
  micrositeId,
  entryId,
  status,
}: EnrollmentModerationActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"hide" | "restore" | "delete" | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function updateStatus(nextStatus: "active" | "hidden") {
    try {
      setLoadingAction(nextStatus === "active" ? "restore" : "hide");
      setErrorMessage("");

      const res = await fetch(`/api/dashboard/microsites/${micrositeId}/enrollments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId,
          status: nextStatus,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update enrollment.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update enrollment.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function deleteEntry() {
    try {
      setLoadingAction("delete");
      setErrorMessage("");

      const res = await fetch(`/api/dashboard/microsites/${micrositeId}/enrollments`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete enrollment.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete enrollment.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "active" ? (
          <button
            type="button"
            onClick={() => void updateStatus("hidden")}
            disabled={Boolean(loadingAction)}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 disabled:opacity-50"
          >
            {loadingAction === "hide" ? "Hiding..." : "Hide"}
          </button>
        ) : status === "hidden" ? (
          <button
            type="button"
            onClick={() => void updateStatus("active")}
            disabled={Boolean(loadingAction)}
            className="rounded-lg border border-green-300 bg-green-50 px-3 py-1 text-xs font-bold text-green-700 disabled:opacity-50"
          >
            {loadingAction === "restore" ? "Restoring..." : "Restore"}
          </button>
        ) : null}

        {status !== "deleted" ? (
          <button
            type="button"
            onClick={() => void deleteEntry()}
            disabled={Boolean(loadingAction)}
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs font-bold text-red-700 disabled:opacity-50"
          >
            {loadingAction === "delete" ? "Deleting..." : "Delete"}
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="max-w-[220px] text-xs font-bold text-red-600">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}