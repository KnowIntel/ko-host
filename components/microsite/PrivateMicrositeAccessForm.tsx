// components/microsite/PrivateMicrositeAccessForm.tsx
"use client";

import { useState } from "react";

export default function PrivateMicrositeAccessForm({
  slug,
}: {
  slug: string;
}) {
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = passcode.trim();

    if (!/^\d{6}$/.test(trimmed)) {
      setStatus("error");
      setMessage("Enter a valid 6-digit passcode.");
      return;
    }

    try {
      setBusy(true);
      setStatus("idle");
      setMessage("");

      const res = await fetch("/api/microsites/verify-passcode", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          slug,
          passcode: trimmed,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error || "Invalid passcode.");
        return;
      }

      setStatus("success");
      setMessage("Access granted. Loading microsite...");
      window.location.reload();
    } catch {
      setStatus("error");
      setMessage("Could not verify passcode.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={passcode}
        onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
        placeholder="6-digit passcode"
      />

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Checking..." : "Unlock Microsite"}
      </button>

      {message ? (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-sm",
            status === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-neutral-200 bg-neutral-50 text-neutral-700",
          ].join(" ")}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}