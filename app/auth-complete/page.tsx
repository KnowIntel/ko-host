"use client";

import { useEffect } from "react";

export default function AuthCompletePage() {
  useEffect(() => {
    try {
      window.localStorage.setItem("kht-auth-complete", String(Date.now()));

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "kht-auth-complete" },
          window.location.origin,
        );
      }
    } catch {
      // ignore cross-window errors
    }

    const timer = window.setTimeout(() => {
      window.close();
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-sm text-neutral-600">
        Sign-in complete. This tab will close automatically.
      </div>
    </main>
  );
}