"use client";

import { useState } from "react";

export default function PrivateMicrositeAccessForm({
  slug,
}: {
  slug: string;
}) {
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = passcode.trim();

    if (!/^[A-Za-z0-9]{2,30}$/.test(trimmed)) {
      setStatus("error");
      setMessage("Enter a valid passcode using 2-30 letters and numbers.");
      return;
    }

    try {
      setBusy(true);
      setStatus("idle");
      setMessage("");

      const res = await fetch("`/api/public/microsites/${encodeURIComponent(slug)}/verify-passcode`", {
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
      <div className="space-y-2">
        <div className="relative">
          <input
            type={showPasscode ? "text" : "password"}
            autoComplete="off"
            maxLength={30}
            value={passcode}
            onChange={(e) =>
              setPasscode(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 30))
            }
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 pr-20 text-sm text-neutral-900 outline-none"
            placeholder="Enter passcode"
          />

          <button
            type="button"
            onClick={() => setShowPasscode((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            {showPasscode ? "Hide" : "Show"}
          </button>
        </div>

        <div className="text-xs text-neutral-500">
          Passcode must be 2-30 characters and use letters and numbers only.
        </div>
      </div>

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