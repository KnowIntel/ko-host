"use client";

import { useState } from "react";

const sampleCards = [
  {
    title: "Wedding RSVP",
    subtitle: "Elegant guest experience",
    className: "left-[-70px] top-[120px] rotate-[-10deg] bg-rose-100",
  },
  {
    title: "Creator Link Hub",
    subtitle: "Social-first landing page",
    className: "right-[-80px] top-[150px] rotate-[9deg] bg-blue-100",
  },
  {
    title: "Property Listing",
    subtitle: "Modern listing showcase",
    className: "left-[4%] bottom-[160px] rotate-[7deg] bg-emerald-100",
  },
  {
    title: "Product Launch",
    subtitle: "Bold promo microsite",
    className: "right-[5%] bottom-[120px] rotate-[-7deg] bg-amber-100",
  },
];

export default function ClaimOfferPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setStatus("sending");
    setErrorMessage("");

    try {
      const formData = new FormData(form);

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

      form.reset();
      setFileName("");
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
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full bg-amber-400/10 blur-3xl" />

          {sampleCards.map((card, index) => (
            <div
              key={card.title}
              className={[
                "absolute hidden h-[190px] w-[150px] rounded-[28px] border border-white/20 p-4 shadow-2xl backdrop-blur-xl lg:block",
                card.className,
              ].join(" ")}
              style={{
                animation: `claimCardFloat ${8 + index}s ease-in-out infinite`,
                animationDelay: `${index * 0.8}s`,
              }}
            >
              <div className="h-20 rounded-2xl bg-white/70" />
              <div className="mt-4 text-xs font-black text-neutral-950">
                {card.title}
              </div>
              <div className="mt-1 text-[11px] leading-4 text-neutral-700">
                {card.subtitle}
              </div>
              <div className="mt-4 h-2 w-16 rounded-full bg-neutral-950/20" />
              <div className="mt-2 h-2 w-24 rounded-full bg-neutral-950/10" />
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes claimCardFloat {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-18px);
            }
          }
        `}</style>

        <div className="relative mx-auto max-w-5xl">
          <div className="text-center">
            <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.16)]">
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
                className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14]"
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
            className="mx-auto mt-12 max-w-2xl rounded-[32px] border border-white/10 bg-white p-6 text-neutral-950 shadow-2xl transition duration-300 sm:p-8"
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
                className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />

              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />

              <input
                name="siteUrl"
                placeholder="Microsite URL"
                className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />

              <textarea
                name="description"
                required
                placeholder="Describe your ideal design..."
                className="min-h-[140px] rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="deadline"
                  type="date"
                  className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                />

                <label className="flex h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-600 transition hover:bg-neutral-100">
                  <span className="truncate">
                    {fileName || "Attach design file"}
                  </span>

                  <span className="shrink-0 rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-bold text-white">
                    Choose
                  </span>

                  <input
                    name="file"
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setFileName(e.target.files?.[0]?.name || "")
                    }
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-2 h-12 rounded-full bg-neutral-950 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Submitting..." : "Submit Request"}
              </button>

              {status === "sent" ? (
                <div className="animate-[successPop_0.35s_ease-out] rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-semibold text-green-700">
                  <div className="text-base">Request sent ✅</div>
                  <div className="mt-1 font-medium text-green-700/80">
                    Check your email for confirmation.
                  </div>
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

        <style jsx>{`
          @keyframes successPop {
            0% {
              opacity: 0;
              transform: scale(0.96) translateY(6px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </section>
    </main>
  );
}