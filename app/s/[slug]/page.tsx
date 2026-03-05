import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { TEMPLATE_DEFS, getTemplateDef, type TemplateKey } from "@/lib/templates/registry";

import RsvpForm from "./RsvpForm";
import PollBlock from "./PollBlock";
import GalleryBlock from "./GalleryBlock";

import AnnouncementBlock from "./AnnouncementBlock";
import LinksBlock from "./LinksBlock";
import ContactBlock from "./ContactBlock";

import DemoTemplatePage from "@/components/demo/DemoTemplatePage";

export const dynamic = "force-dynamic";

function isValidSlug(slug: string) {
  return /^[a-z0-9-]{2,40}$/.test(slug);
}

function getDemoTemplateKeyFromSubdomain(subdomain: string): TemplateKey | null {
  const s = (subdomain || "").trim().toLowerCase();
  if (!s) return null;

  const match = TEMPLATE_DEFS.find((t) => t.demoSlug === s);
  return match?.key ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Demo pages: "<Template> Demo"
  if (slug === "demo") {
    const h = await headers();
    const host = (h.get("host") || "").toLowerCase();
    const subdomain = host.split(".")[0];
    const demoKey = getDemoTemplateKeyFromSubdomain(subdomain);
    const def = demoKey ? getTemplateDef(demoKey) : null;

    const name = def?.title ?? "Demo";
    return { title: `${name} Demo` };
  }

  // For now keep default title for public microsites (we can enhance later)
  return { title: "Ko-Host" };
}

export default async function PublicMicrositePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // /demo on any subdomain (e.g. reunion.ko-host.com/demo)
  if (slug === "demo") {
    const h = await headers();
    const host = (h.get("host") || "").toLowerCase(); // e.g. reunion.ko-host.com
    const subdomain = host.split(".")[0]; // reunion

    const demoKey = getDemoTemplateKeyFromSubdomain(subdomain);
    if (!demoKey) return notFound();

    const def = getTemplateDef(demoKey);
    if (!def) return notFound();

    return <DemoTemplatePage template={def} originHost={host} />;
  }

  // Normal microsite render
  if (!isValidSlug(slug)) return notFound();

  const sb = getSupabaseAdmin();

  const { data: site, error } = await sb
    .from("microsites")
    .select("id, slug, title, template_key, is_published, expires_at, paid_until")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !site) return notFound();

  const now = new Date();
  const isExpired = site.expires_at ? new Date(site.expires_at) <= now : false;
  const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;

  // Keep full-site gating (published + not expired + paid)
  if (!site.is_published || isExpired || !paidActive) {
    const headline = !site.is_published
      ? "This microsite isn’t published yet"
      : isExpired
      ? "This microsite has expired"
      : "This microsite’s moment has ended";

    const body = !site.is_published
      ? "The owner hasn’t published this page yet."
      : isExpired
      ? "This page reached its expiration date."
      : "The 90-day access window ended. The owner can repurchase to bring it back.";

    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-neutral-600">Ko-Host</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{headline}</h1>
          <p className="mt-3 text-sm text-neutral-700">{body}</p>
        </div>
      </main>
    );
  }

  const { data: pollRows } = await sb
    .from("polls")
    .select("id, title, description, is_multi_select, show_results_public, is_open")
    .eq("microsite_id", site.id)
    .order("created_at", { ascending: true });

  const polls = pollRows ?? [];

  const pollIds = polls.map((p) => p.id);
  const { data: optionRows } = pollIds.length
    ? await sb
        .from("poll_options")
        .select("id, poll_id, label, sort_order")
        .in("poll_id", pollIds)
        .order("sort_order", { ascending: true })
    : { data: [] as any[] };

  const optionsByPoll = new Map<string, { id: string; label: string }[]>();
  for (const o of optionRows ?? []) {
    const arr = optionsByPoll.get(o.poll_id) ?? [];
    arr.push({ id: o.id, label: o.label });
    optionsByPoll.set(o.poll_id, arr);
  }

  const isWedding = site.template_key === "wedding_rsvp";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">Ko-Host</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {site.title || `${site.slug}.ko-host.com`}
        </h1>
        <div className="mt-2 text-sm text-neutral-700">
          Template: <span className="font-mono">{site.template_key}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        {/* Wedding-only module */}
        {isWedding ? <RsvpForm micrositeSlug={site.slug} /> : null}

        {/* Universal modules */}
        <AnnouncementBlock micrositeId={site.id} />
        <LinksBlock micrositeId={site.id} />
        <ContactBlock micrositeId={site.id} />

        {/* ✅ Gallery available for ALL templates */}
        <GalleryBlock micrositeSlug={site.slug} />

        {/* Polls */}
        {polls.map((p) => (
          <PollBlock
            key={p.id}
            micrositeSlug={site.slug}
            poll={{
              id: p.id,
              title: p.title,
              description: p.description,
              isMultiSelect: p.is_multi_select,
              showResultsPublic: p.show_results_public,
              options: optionsByPoll.get(p.id) ?? [],
            }}
          />
        ))}

        {/* Fallback if literally no modules exist */}
        {!isWedding && polls.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-neutral-600">Modules</div>
            <div className="mt-2 text-sm text-neutral-700">More modules will be added soon.</div>
          </div>
        ) : null}
      </div>
    </main>
  );
}