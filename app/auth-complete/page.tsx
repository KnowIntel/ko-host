"use client";

import { useEffect } from "react";

export default function AuthCompletePage() {
  useEffect(() => {
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "kht-auth-complete" },
          window.location.origin,
        );
      }

      window.localStorage.setItem(
        "kht-auth-complete",
        String(Date.now()),
      );
    } catch {
      // ignore cross-window errors
    }

    window.close();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-sm text-neutral-600">Sign-in complete. You can close this tab.</div>
    </main>
  );
}