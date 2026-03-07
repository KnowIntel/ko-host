import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { MicrositeBlock } from "@/lib/templates/builder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  paid_until: string | null;
  draft?: {
    title?: string;
    slugSuggestion?: string;
    blocks?: MicrositeBlock[];
  } | null;
};

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function PublicMicrositePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("microsites")
    .select("id, slug, title, is_published, paid_until, draft")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const site = data as MicrositeRow;

  if (!isPaidActive(site.paid_until)) {
    notFound();
  }

  const blocks = Array.isArray(site.draft?.blocks) ? site.draft.blocks : [];

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="mb-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Ko-Host Preview
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
            {site.title || "Untitled Microsite"}
          </h1>
          <div className="mt-3 text-sm text-neutral-600">/s/{site.slug}</div>
        </div>

        <div className="space-y-6">
          {blocks.map((block) => {
            if (block.type === "announcement") {
              return (
                <SectionCard key={block.id} title={block.data.headline || "Announcement"}>
                  <div className="whitespace-pre-wrap text-neutral-700">
                    {block.data.body || ""}
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "links") {
              return (
                <SectionCard key={block.id} title={block.data.heading || "Links"}>
                  <div className="flex flex-col gap-3">
                    {block.data.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800"
                      >
                        {item.label || "Untitled link"}
                        {item.url ? (
                          <div className="mt-1 text-xs text-neutral-500">{item.url}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "countdown") {
              return (
                <SectionCard key={block.id} title={block.data.heading || "Countdown"}>
                  <div className="text-sm text-neutral-700">
                    Target: {block.data.targetIso || "Not set"}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {block.data.completedMessage || ""}
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "contact") {
              return (
                <SectionCard key={block.id} title={block.data.heading || "Contact"}>
                  <div className="space-y-2 text-sm text-neutral-700">
                    {block.data.name ? <div>Name: {block.data.name}</div> : null}
                    {block.data.email ? <div>Email: {block.data.email}</div> : null}
                    {block.data.phone ? <div>Phone: {block.data.phone}</div> : null}
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "rsvp") {
              return (
                <SectionCard key={block.id} title={block.data.heading || "RSVP"}>
                  <div className="space-y-2 text-sm text-neutral-700">
                    {block.data.eventDate ? (
                      <div>Event date: {block.data.eventDate}</div>
                    ) : null}
                    <div>
                      Collect guest count: {block.data.collectGuestCount ? "Yes" : "No"}
                    </div>
                    <div>
                      Collect meal choice: {block.data.collectMealChoice ? "Yes" : "No"}
                    </div>
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "richText") {
              return (
                <SectionCard key={block.id} title={block.data.heading || "Details"}>
                  <div className="whitespace-pre-wrap text-neutral-700">
                    {block.data.body || ""}
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "faq") {
              return (
                <SectionCard key={block.id} title={block.data.heading || "FAQ"}>
                  <div className="space-y-3">
                    {block.data.items.map((item) => (
                      <div key={item.id} className="rounded-xl border border-neutral-200 p-4">
                        <div className="font-medium text-neutral-900">
                          {item.question || "Untitled question"}
                        </div>
                        <div className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
                          {item.answer || ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "gallery") {
              return (
                <SectionCard key={block.id} title={block.data.heading || "Gallery"}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {block.data.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-neutral-200 p-4 text-sm text-neutral-700"
                      >
                        <div>{item.url || "No image URL"}</div>
                        {item.caption ? (
                          <div className="mt-2 text-neutral-500">{item.caption}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "poll") {
              return (
                <SectionCard key={block.id} title={block.data.question || "Poll"}>
                  <div className="space-y-3">
                    {block.data.options.map((option) => (
                      <div
                        key={option.id}
                        className="rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800"
                      >
                        {option.text || "Untitled option"}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (block.type === "cta") {
              return (
                <SectionCard key={block.id} title={block.data.heading || "Call To Action"}>
                  <div className="whitespace-pre-wrap text-neutral-700">
                    {block.data.body || ""}
                  </div>
                  <div className="mt-4 rounded-xl bg-neutral-900 px-4 py-2 text-center text-sm font-medium text-white">
                    {block.data.buttonText || "Learn more"}
                  </div>
                </SectionCard>
              );
            }

            return null;
          })}
        </div>
      </div>
    </main>
  );
}