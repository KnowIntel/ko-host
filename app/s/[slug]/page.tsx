import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  type TemplateKey,
} from "@/lib/templates/registry";

import RsvpForm from "./RsvpForm";
import PollBlock from "./PollBlock";
import GalleryBlock from "./GalleryBlock";

import AnnouncementBlock from "./AnnouncementBlock";
import LinksBlock from "./LinksBlock";
import ContactBlock from "./ContactBlock";

import DemoTemplatePage from "@/components/demo/DemoTemplatePage";

export const dynamic = "force-dynamic";

type SiteRecord = {
  id: string;
  slug: string;
  title: string | null;
  template_key: string;
  is_published: boolean;
  expires_at: string | null;
  paid_until: string | null;
};

function isValidSlug(slug: string) {
  return /^[a-z0-9-]{2,40}$/.test(slug);
}

function getSubdomainFromHost(host: string) {
  const normalized = (host || "").toLowerCase().split(":")[0];
  const parts = normalized.split(".");
  if (parts.length < 3) return null;

  const subdomain = parts[0];
  if (!subdomain || subdomain === "www") return null;

  return subdomain;
}

function getDemoTemplateKeyFromSubdomain(subdomain: string | null): TemplateKey | null {
  const s = (subdomain || "").trim().toLowerCase();
  if (!s) return null;

  const match = TEMPLATE_DEFS.find((t) => t.demoSlug === s);
  return match?.key ?? null;
}

function titleForSite(site: { title: string | null; slug: string }) {
  const t = (site.title || "").trim();
  if (t) return `${t} | Ko-Host`;
  return `${site.slug}.ko-host.com | Ko-Host`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "demo") {
    const h = await headers();
    const host = (h.get("host") || "").toLowerCase();
    const subdomain = getSubdomainFromHost(host);
    const demoKey = getDemoTemplateKeyFromSubdomain(subdomain);
    const def = demoKey ? getTemplateDef(demoKey) : null;

    const name = def?.title ?? "Demo";
    return { title: `${name} Demo` };
  }

  if (!isValidSlug(slug)) return { title: "Ko-Host" };

  const sb = getSupabaseAdmin();
  const { data: site } = await sb
    .from("microsites")
    .select("slug, title, is_published, expires_at, paid_until")
    .eq("slug", slug)
    .maybeSingle();

  if (!site) return { title: "Ko-Host" };

  const now = new Date();
  const isExpired = site.expires_at ? new Date(site.expires_at) <= now : false;
  const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;

  if (!site.is_published) return { title: "Not Published | Ko-Host" };
  if (isExpired) return { title: "Expired | Ko-Host" };
  if (!paidActive) return { title: "Access Ended | Ko-Host" };

  return { title: titleForSite(site) };
}

export default async function PublicMicrositePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "demo") {
    const h = await headers();
    const host = (h.get("host") || "").toLowerCase();
    const subdomain = getSubdomainFromHost(host);

    const demoKey = getDemoTemplateKeyFromSubdomain(subdomain);
    if (!demoKey) return notFound();

    const def = getTemplateDef(demoKey);
    if (!def) return notFound();

    return <DemoTemplatePage template={def} originHost={host} />;
  }

  if (!isValidSlug(slug)) return notFound();

  const sb = getSupabaseAdmin();

  const { data: site, error } = await sb
    .from("microsites")
    .select("id, slug, title, template_key, is_published, expires_at, paid_until")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !site) {
    console.error("public microsite lookup failed", { slug, error });
    return notFound();
  }

  const typedSite = site as SiteRecord;

  const now = new Date();
  const isExpired = typedSite.expires_at ? new Date(typedSite.expires_at) <= now : false;
  const paidActive = typedSite.paid_until ? new Date(typedSite.paid_until) > now : false;

  if (!typedSite.is_published || isExpired || !paidActive) {
    const headline = !typedSite.is_published
      ? "This microsite isn’t published yet"
      : isExpired
        ? "This microsite has expired"
        : "This microsite’s moment has ended";

    const body = !typedSite.is_published
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
    .eq("microsite_id", typedSite.id)
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

  const { data: annRows } = await sb
    .from("microsite_announcements")
    .select("id")
    .eq("microsite_id", typedSite.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const hasAnnouncement = !!annRows?.length;

  const { data: linkRows } = await sb
    .from("microsite_links")
    .select("id")
    .eq("microsite_id", typedSite.id)
    .limit(1);

  const hasLinks = !!linkRows?.length;

  const { data: contactRow } = await sb
    .from("microsite_contact")
    .select("email, phone, website")
    .eq("microsite_id", typedSite.id)
    .maybeSingle();

  const hasContact =
    !!(contactRow?.email || "").trim() ||
    !!(contactRow?.phone || "").trim() ||
    !!(contactRow?.website || "").trim();

  const isWedding = typedSite.template_key === "wedding_rsvp";

  const shouldShowEmptyFallback =
    !isWedding && polls.length === 0 && !hasAnnouncement && !hasLinks && !hasContact;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">Ko-Host</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {typedSite.title || `${typedSite.slug}.ko-host.com`}
        </h1>
        <div className="mt-2 text-sm text-neutral-700">
          Template: <span className="font-mono">{typedSite.template_key}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        {isWedding ? <RsvpForm micrositeSlug={typedSite.slug} /> : null}

        <AnnouncementBlock micrositeId={typedSite.id} />
        <LinksBlock micrositeId={typedSite.id} />
        <ContactBlock micrositeId={typedSite.id} />

        <GalleryBlock micrositeSlug={typedSite.slug} />

        {polls.map((p) => (
          <PollBlock
            key={p.id}
            micrositeSlug={typedSite.slug}
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

        {shouldShowEmptyFallback ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-neutral-600">Modules</div>
            <div className="mt-2 text-sm text-neutral-700">
              Add an announcement, links, or contact info to make this microsite useful.
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}