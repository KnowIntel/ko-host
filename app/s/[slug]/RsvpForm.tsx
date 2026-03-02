"use client";

import { useMemo, useState } from "react";

type Props = {
  micrositeSlug: string;
};

export default function RsvpForm({ micrositeSlug }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attendingCount, setAttendingCount] = useState(1);
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [mealChoice, setMealChoice] = useState("");
  const [notes, setNotes] = useState("");

  // honeypot: keep it off-screen; bots often fill it
  const [company, setCompany] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && status !== "submitting";
  }, [name, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          micrositeSlug,
          name: name.trim(),
          email: email.trim(),
          attendingCount,
          hasPlusOne,
          mealChoice: mealChoice.trim(),
          notes: notes.trim(),
          company, // honeypot
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.error ||
          (res.status === 429 ? "Too many submissions. Try again soon." : "Something went wrong.");
        setStatus("error");
        setErrorMsg(msg);
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">RSVP</div>
        <div className="mt-2 text-xl font-semibold tracking-tight">Thanks — you’re all set.</div>
        <p className="mt-2 text-sm text-neutral-700">
          Your RSVP has been recorded.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">RSVP</div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">Will you be attending?</h2>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Name</span>
          <input
            className="h-10 rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Email (optional)</span>
          <input
            className="h-10 rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
          />
        </label>

        <div className="grid gap-1">
          <span className="text-sm font-medium">Number attending</span>
          <input
            className="h-10 rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900"
            type="number"
            min={0}
            max={20}
            value={attendingCount}
            onChange={(e) => setAttendingCount(Number(e.target.value))}
          />
          <p className="text-xs text-neutral-600">Use 0 if you can’t make it.</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasPlusOne}
            onChange={(e) => setHasPlusOne(e.target.checked)}
          />
          Bringing a +1
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Meal choice (optional)</span>
          <input
            className="h-10 rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900"
            value={mealChoice}
            onChange={(e) => setMealChoice(e.target.value)}
            placeholder="Chicken / Fish / Vegetarian"
            maxLength={80}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Notes (optional)</span>
          <textarea
            className="min-h-[90px] rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything we should know?"
            maxLength={500}
          />
        </label>

        {/* Honeypot field (hidden) */}
        <label className="sr-only">
          Company
          <input value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg ?? "Something went wrong."}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting..." : "Submit RSVP"}
        </button>
      </div>
    </form>
  );
}