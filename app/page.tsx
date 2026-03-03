// app/page.tsx
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

type Template = {
  template_key: string;
  name: string;
  description: string;
  hero_icon: string | null;
};

async function fetchTemplates(): Promise<Template[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  const res = await fetch(`${base}/api/templates`, {
    next: { revalidate: 300 }
  });
  if (!res.ok) return [];
  return (await res.json()) as Template[];
}

export default async function HomePage() {
  const templates = await fetchTemplates();

  return (
    <main>
      <section className="border-b border-neutral-200">
        <Container className="py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight">
              Temporary microsites. Zero fuss.
            </h1>
            <p className="mt-4 text-neutral-700">
              Pick a template, claim a subdomain, publish a single-purpose site with the exact tools you need.
              Not a general site builder—structured modules per template.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/sign-up">Start free (publish requires subscription)</ButtonLink>
              <ButtonLink href="/#templates" variant="secondary">
                Browse templates
              </ButtonLink>
            </div>

            <p className="mt-4 text-sm text-neutral-600">
              Pricing: <span className="font-medium text-neutral-900">$12 / microsite (90 days)</span>. Subscribe only to
              the templates you use.
            </p>
          </div>
        </Container>
      </section>

      <section id="templates">
        <Container className="py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Template gallery</h2>
              <p className="mt-2 text-neutral-700">
                Each template activates matching tools (RSVP, polls, gallery, booking, etc.).
              </p>
            </div>

            <ButtonLink href="/dashboard" variant="secondary">
              Go to dashboard
            </ButtonLink>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.template_key}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{t.name}</div>
                    <div className="mt-2 text-sm text-neutral-700">{t.description}</div>
                  </div>
                  <div className="text-2xl">{t.hero_icon ?? "🧩"}</div>
                </div>

                <div className="mt-4">
                  <ButtonLink href="/sign-up">Use this template</ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}