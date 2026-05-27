"use client";

import { useState } from "react";

export default function ClaimOfferPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setStatus("sending");
  setErrorMessage("");

  try {
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/claim-offer", {
      method: "POST",
      body: formData,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(result?.error || "Something went wrong.");
      return;
    }

    event.currentTarget.reset();
    setStatus("sent");
  } catch (error) {
    setStatus("error");
    setErrorMessage(
      error instanceof Error ? error.message : "Failed to submit request.",
    );
  }
}

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <section className="relative px-6 py-16">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-10 top-20 h-64 w-44 rotate-[-8deg] rounded-3xl border border-white/10 bg-white/10" />
          <div className="absolute right-12 top-28 h-72 w-48 rotate-[8deg] rounded-3xl border border-white/10 bg-white/10" />
          <div className="absolute bottom-20 left-1/4 h-60 w-44 rotate-[5deg] rounded-3xl border border-white/10 bg-white/10" />
          <div className="absolute bottom-10 right-1/4 h-56 w-40 rotate-[-6deg] rounded-3xl border border-white/10 bg-white/10" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="text-center">
            <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-200">
              Limited-Time Offer
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
              Free Custom Development
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70">
              Purchase a Ko-Host microsite and submit your ideal design request.
              We’ll help customize your site with a 48–72 hour turnaround.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              "Fill out the form below with your ideal design, deadline, and contact information.",
              "Submit your request. If we have questions, we’ll communicate by email.",
              "We design and update your custom site, then send confirmation to your email.",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-neutral-950">
                  {index + 1}
                </div>
                <div className="text-sm leading-6 text-white/75">{step}</div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-12 max-w-2xl rounded-[32px] border border-white/10 bg-white p-6 text-neutral-950 shadow-2xl sm:p-8"
          >
            <div className="text-2xl font-black">Claim your offer</div>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Tell us what you need and where to reach you.
            </p>

            <div className="mt-6 grid gap-4">
              <input
                name="name"
                required
                placeholder="Name"
                className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              />

              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              />

              <input
                name="siteUrl"
                placeholder="Microsite URL"
                className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              />

              <textarea
                name="description"
                required
                placeholder="Describe your ideal design..."
                className="min-h-[140px] rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="deadline"
                  type="date"
                  className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                />

                <input
                  name="file"
                  type="file"
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-2 h-12 rounded-full bg-neutral-950 px-6 text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Submitting..." : "Submit Request"}
              </button>

              {status === "sent" ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  Request sent. Check your email for confirmation.
                </div>
              ) : null}

              {status === "error" ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}