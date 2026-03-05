"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";

type LinkItem = { label: string; url: string };

export default function KoHostItButton(props: {
  templateKey: string;
  draft: {
    title: string;
    slugSuggestion: string;

    // NEW fields from editor
    announcement?: string;
    links?: LinkItem[];
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
}) {
  const { isSignedIn } = useAuth();
  const [busy, setBusy] = useState(false);

  async function startCheckout() {
    try {
      setBusy(true);

      const res = await fetch("/api/public/create-microsite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateKey: props.templateKey,
          draft: props.draft,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok || !data?.url) {
        alert(data?.error || "Failed to start checkout.");
        return;
      }

      window.location.href = data.url as string;
    } finally {
      setBusy(false);
    }
  }

  if (!isSignedIn) {
    return (
      <SignInButton
        mode="modal"
        forceRedirectUrl={typeof window !== "undefined" ? window.location.href : "/templates"}
      >
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Ko-Host It ($12)
        </button>
      </SignInButton>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={startCheckout}
      className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      {busy ? "Starting checkout…" : "Ko-Host It ($12)"}
    </button>
  );
}