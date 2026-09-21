import Link from "next/link";

export const metadata = {
  title: "Ko-Host Connect | Find Local Services",
  description:
    "Connect with local service providers through Ko-Host Connect.",
};

type ConnectProvider = {
  title: string;
  slug: string;
  imageUrl: string | null;
  services: string[];
};

export default async function ConnectPage() {
  let providers: ConnectProvider[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "https://ko-host.com"}/api/connect/providers`,
      {
        cache: "no-store",
      },
    );

    if (response.ok) {
      const data = await response.json();

      if (data?.ok && Array.isArray(data.providers)) {
        providers = data.providers;
      }
    }
  } catch (error) {
    console.error(
      "Failed to load Connect providers:",
      error,
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-neutral-900">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            Ko-Host
            <span className="ml-2 font-normal text-[#65745b]">
              Connect
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
          >
            Back to Ko-Host
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-[#78856e]/25 bg-[#78856e]/10 px-4 py-1.5 text-sm font-semibold text-[#56624e]">
            Local needs. Local providers.
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            What do you need help with?
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            Tell Ko-Host Connect what you need and give
            local providers an opportunity to respond
            privately.
          </p>
        </div>

        {/* TWO PATHS */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
          {/* CONSUMER */}
          <div className="flex flex-col rounded-3xl border border-[#78856e]/25 bg-white p-7 shadow-sm sm:p-9">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#65745b]">
              For Customers
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              I need a service
            </h2>

            <p className="mt-4 leading-7 text-neutral-600">
              Describe what you need, when you need it,
              and where. Ko-Host Connect can match your
              request with participating local providers.
            </p>

            <div className="mt-auto pt-8">
              <Link
                href="/connect/request"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#596650] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#4b5744]"
              >
                Request a Service
              </Link>
            </div>
          </div>

          {/* PROVIDER */}
          <div className="flex flex-col rounded-3xl border border-[#b59b73]/30 bg-[#eee8dc] p-7 shadow-sm sm:p-9">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#79684f]">
              For Providers
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              I provide a service
            </h2>

            <p className="mt-4 leading-7 text-neutral-700">
              Put your Ko-Host microsite to work. Choose
              the services you provide and your service
              area to receive relevant local requests.
            </p>

            <div className="mt-auto pt-8">
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-neutral-900/15 bg-white px-5 py-3.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900/30"
              >
                Manage My Services
              </Link>
            </div>
          </div>
        </div>
      </section>
{/* HOW IT WORKS */}
<section className="border-t border-black/10 bg-white px-5 py-16 sm:py-20">
  <div className="mx-auto w-full max-w-5xl">
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#65745b]">
        How It Works
      </div>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        From request to connection.
      </h2>

      <p className="mt-4 leading-7 text-neutral-600">
        Tell us what you need and let relevant local
        providers come to you.
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {[
        {
          number: "1",
          title: "Submit Your Request",
          description:
            "Choose a service, enter your location, and tell providers what you need.",
        },
        {
          number: "2",
          title: "Hear From Providers",
          description:
            "Matched local providers can respond privately through your Ko-Host mailbox.",
        },
        {
          number: "3",
          title: "Choose Who Fits",
          description:
            "Review your private conversations and decide which provider you want to work with.",
        },
      ].map((step) => (
        <div
          key={step.number}
          className="rounded-3xl border border-[#78856e]/20 bg-[#f7f5ef] p-6"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#596650] text-sm font-semibold text-white">
            {step.number}
          </div>

          <h3 className="mt-5 text-xl font-semibold tracking-tight">
            {step.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
{/* CONNECT PROVIDERS */}
{providers.length > 0 && (
  <section className="border-t border-black/10 bg-[#f7f5ef] px-5 py-16 sm:py-20">
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#65745b]">
          Local Providers
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Meet providers on Ko-Host Connect.
        </h2>

        <p className="mt-4 leading-7 text-neutral-600">
          Explore participating providers and the services
          they offer.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-5">
        {providers.map((provider) => (
          <Link
            key={provider.slug}
            href={`/s/${provider.slug}`}
            className="group flex w-full flex-col overflow-hidden rounded-3xl border border-[#78856e]/20 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
          >
            <div className="aspect-[16/10] overflow-hidden bg-[#e8e5dc]">
              {provider.imageUrl ? (
                <img
                  src={provider.imageUrl}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <span className="text-xl font-semibold text-[#65745b]">
                    {provider.title}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl font-semibold tracking-tight">
                {provider.title}
              </h3>

              {provider.services.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {provider.services
                    .slice(0, 3)
                    .map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-[#78856e]/10 px-3 py-1 text-xs font-medium text-[#56624e]"
                      >
                        {service}
                      </span>
                    ))}

                  {provider.services.length > 3 && (
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                      +{provider.services.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-auto pt-6 text-sm font-semibold text-[#596650]">
                View Provider →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
)}

{/* TRUST & PRIVACY */}
<section className="border-t border-black/10 bg-white px-5 py-16 sm:py-20">
  <div className="mx-auto w-full max-w-5xl">
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#65745b]">
        Private by Design
      </div>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Connect without giving out your contact information.
      </h2>

      <p className="mt-4 leading-7 text-neutral-600">
        Ko-Host Connect keeps the conversation inside your
        private mailbox while you decide who you want to work
        with.
      </p>
    </div>

    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-3xl border border-[#78856e]/20 bg-[#f7f5ef] p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#78856e]/10 text-lg text-[#596650]">
          🔒
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight">
          Contact Info Stays Private
        </h3>

        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Your phone number and email address are not shared
          with matched providers.
        </p>
      </div>

      <div className="rounded-3xl border border-[#78856e]/20 bg-[#f7f5ef] p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#78856e]/10 text-lg text-[#596650]">
          💬
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight">
          Private Mailbox
        </h3>

        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Providers respond through your private Ko-Host
          Mailbox instead of contacting you directly.
        </p>
      </div>

      <div className="rounded-3xl border border-[#78856e]/20 bg-[#f7f5ef] p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#78856e]/10 text-lg text-[#596650]">
          👤
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight">
          Separate Conversations
        </h3>

        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Each provider gets a separate conversation and
          cannot see your discussions with other providers.
        </p>
      </div>

      <div className="rounded-3xl border border-[#78856e]/20 bg-[#f7f5ef] p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#78856e]/10 text-lg text-[#596650]">
          ⏱
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight">
          Temporary by Default
        </h3>

        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Your temporary mailbox remains available for 12
          days and is then automatically removed.
        </p>
      </div>
    </div>

    <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[#b59b73]/25 bg-[#eee8dc] px-6 py-5 text-center sm:px-8">
      <p className="text-sm leading-6 text-neutral-700">
        <span className="font-semibold text-neutral-900">
          You stay in control.
        </span>{" "}
        Review provider responses, ask questions privately,
        and decide who you want to continue doing business
        with.
      </p>
    </div>
  </div>
</section>

    </main>
  );
}