"use client";

import { useState } from "react";

const sampleCards = [
  {
    title: "Beta Testing",
    subtitle: "Professional launch preview",
    image:
      "/designs/design-cards/design-card_beta_testing_professional.webp",
    className:
      "left-[300px] top-[650px] rotate-[-10deg] hidden xl:block",
    glow: "from-blue-500/20 to-cyan-400/10",
  },

  {
    title: "Birthday Event",
    subtitle: "Elegant celebration page",
    image:
      "/designs/design-cards/design-card_birthday_grown.webp",
    className:
      "right-[-50px] bottom-[380px] rotate-[8deg] hidden xl:block",
    glow: "from-pink-500/20 to-orange-300/10",
  },

  {
    title: "Community Alert",
    subtitle: "Local news & updates",
    image:
      "/designs/design-cards/design-card_community_alert_newsletter.webp",
    className:
      "left-[30px] bottom-[120px] rotate-[4deg] hidden lg:block",
    glow: "from-emerald-400/20 to-green-200/10",
  },

  {
    title: "Creator Link Hub",
    subtitle: "Social-first creator page",
    image:
      "/designs/design-cards/design-card_creator_link_hub_canvas.webp",
    className:
      "right-[40px] top-[40px] rotate-[-6deg] hidden 2xl:block",
    glow: "from-fuchsia-500/20 to-violet-400/10",
  },

  {
    title: "Election Campaign",
    subtitle: "City council promotion",
    image:
      "/designs/design-cards/design-card_election_campaign_city.webp",
    className:
      "left-[120px] top-[350px] rotate-[7deg] hidden 2xl:block",
    glow: "from-blue-400/20 to-indigo-300/10",
  },

  {
    title: "Family Reunion",
    subtitle: "Casual family gathering",
    image:
      "/designs/design-cards/design-card_family_reunion_casual.webp",
    className:
      "right-[260px] bottom-[180px] rotate-[5deg] hidden xl:block",
    glow: "from-yellow-400/20 to-orange-200/10",
  },

  {
    title: "Vehicle Listing",
    subtitle: "For sale by owner",
    image:
      "/designs/design-cards/design-card_for_sale_by_owner_auto.webp",
    className:
      "left-[220px] top-[40px] rotate-[-5deg] hidden 2xl:block",
    glow: "from-neutral-400/20 to-zinc-300/10",
  },

  {
    title: "Graduation",
    subtitle: "Spotlight celebration",
    image:
      "/designs/design-cards/design-card_graduation_spotlight.webp",
    className:
      "right-[220px] bottom-[40px] rotate-[-7deg] hidden 2xl:block",
    glow: "from-amber-400/20 to-yellow-200/10",
  },

  {
    title: "Guided Tutorial",
    subtitle: "Educational walkthrough",
    image:
      "/designs/design-cards/design-card_guided_tutorial_fabulous.webp",
    className:
      "left-[340px] bottom-[30px] rotate-[6deg] hidden 2xl:block",
    glow: "from-purple-500/20 to-pink-300/10",
  },

  {
    title: "Memory Timeline",
    subtitle: "Story & milestone journey",
    image:
      "/designs/design-cards/design-card_memory_timeline_timeless.webp",
    className:
      "right-[-100px] top-[640px] rotate-[4deg] hidden 2xl:block",
    glow: "from-stone-400/20 to-neutral-200/10",
  },

  {
    title: "Open House",
    subtitle: "Luxury property showcase",
    image:
      "/designs/design-cards/design-card_open_house_signature.webp",
    className:
      "left-[450px] top-[300px] rotate-[-5deg] hidden 2xl:block",
    glow: "from-sky-500/20 to-cyan-200/10",
  },

  {
    title: "Pet Adoption",
    subtitle: "Welcome home companion",
    image:
      "/designs/design-cards/design-card_pet_adoption_welcome.webp",
    className:
      "right-[480px] bottom-[260px] rotate-[7deg] hidden 2xl:block",
    glow: "from-lime-400/20 to-green-200/10",
  },

  {
    title: "Restaurant",
    subtitle: "Hometown dining microsite",
    image:
      "/designs/design-cards/design-card_restaurant_hometown.webp",
    className:
      "left-[580px] bottom-[260px] rotate-[-4deg] hidden 2xl:block",
    glow: "from-red-500/20 to-orange-300/10",
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
  {sampleCards.map((card) => (
    <div
      key={card.title}
      className={`absolute ${card.className} animate-kht-float`}
    >
<div
  className={`relative w-[220px] overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${card.glow} p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl`}
>
        <div className="rounded-[27px] bg-neutral-950/80 p-3">
<div className="aspect-[4/3] w-full overflow-hidden">
  <img
    src={card.image}
    alt={card.title}
    className="h-full w-full object-cover"
  />
</div>

          <div className="mt-3">
            <div className="text-sm font-black text-white">
              {card.title}
            </div>

            <div className="mt-1 text-xs leading-5 text-white/60">
              {card.subtitle}
            </div>
          </div>

          <div className="mt-3 h-1.5 w-16 rounded-full bg-white/20" />
        </div>
      </div>
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