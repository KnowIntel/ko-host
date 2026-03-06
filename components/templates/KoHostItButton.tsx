"use client";

import { useMemo, useState } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";

type LinkItem = {
  id?: string;
  label: string;
  url: string;
};

type Draft = {
  title: string;
  slugSuggestion: string;
  siteVisibility?: "public" | "private";
  privateMode?: "passcode" | "members_only";
  passcode?: string;
  announcement?: {
    headline: string;
    body: string;
  };
  links?: LinkItem[];
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
};

export default function KoHostItButton(props: {
  templateKey: string;
  draft: Draft;
}) {
  const { isSignedIn } = useAuth();
  const [busy, setBusy] = useState(false);

  const pathname = usePathname() || "/templates";
  const searchParams = useSearchParams();

  const redirectPath = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  async function startCheckout() {
    try {
      setBusy(true);

      if (!props.draft.title?.trim()) {
        alert("Please enter a page title.");
        return;
      }

      if (!props.draft.slugSuggestion?.trim()) {
        alert("Please enter a site name.");
        return;
      }

      if (
        props.draft.siteVisibility === "private" &&
        props.draft.privateMode === "passcode"
      ) {
        const passcode = (props.draft.passcode || "").trim();

        if (!/^\d{6}$/.test(passcode)) {
          alert("Private passcode must be exactly 6 digits.");
          return;
        }
      }

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
        fallbackRedirectUrl={redirectPath}
        forceRedirectUrl={redirectPath}
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