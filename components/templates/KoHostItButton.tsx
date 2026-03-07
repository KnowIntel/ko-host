"use client";

import { useMemo, useState } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";

export default function KoHostItButton(props: {
  templateKey: string;
  designKey?: string;
  draft: any;
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

      const res = await fetch("/api/public/create-microsite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateKey: props.templateKey,
          designKey: props.designKey || "blank",
          draft: props.draft,
        }),
      });

      const data = await res.json();

      if (!data?.url) {
        alert("Failed to start checkout");
        return;
      }

      window.location.href = data.url;
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
        <button className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
          Ko-Host It ($12)
        </button>
      </SignInButton>
    );
  }

  return (
    <button
      disabled={busy}
      onClick={startCheckout}
      className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
    >
      {busy ? "Starting checkout…" : "Ko-Host It ($12)"}
    </button>
  );
}