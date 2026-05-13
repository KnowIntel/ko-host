"use client";

import { useState } from "react";
import AppModal from "@/components/ui/AppModal";

export default function PublishToggleButton({
  micrositeId,
  isPublished,
}: {
  micrositeId: string;
  isPublished: boolean;
}) {
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePublishToggle() {
    const res = await fetch(
      `/api/dashboard/microsites/${micrositeId}/publish`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publish: !isPublished }),
      },
    );

    if (res.status === 402) {
      setErrorMessage("Payment required to publish.");
      return;
    }

    if (!res.ok) {
      setErrorMessage("Failed to update publish status.");
      return;
    }

    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handlePublishToggle()}
        className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </button>

      <AppModal
        open={Boolean(errorMessage)}
        title="Publish Error"
        cancelText="OK"
        onCancel={() => setErrorMessage("")}
      >
        <p className="text-sm text-neutral-700">{errorMessage}</p>
      </AppModal>
    </>
  );
}