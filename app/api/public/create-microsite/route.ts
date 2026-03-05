import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/clerk";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidTemplateKey, normalizeTemplateKey } from "@/lib/templates/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LinkSchema = z.object({
  label: z.string().optional().default(""),
  url: z.string().optional().default(""),
});

const BodySchema = z.object({
  templateKey: z.string().min(1),
  draft: z.object({
    title: z.string().min(1),
    slugSuggestion: z.string().min(1),

    // NEW optional fields
    announcement: z.string().optional().default(""),
    links: z.array(LinkSchema).optional().default([]),

    contactName: z.string().optional().default(""),
    contactEmail: z.string().optional().default(""),
    contactPhone: z.string().optional().default(""),
  }),
});

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function normalizeLinks(input: Array<{ label?: string; url?: string }>) {
  return (input || [])
    .map((x) => ({
      label: (x.label || "").trim(),
      url: (x.url || "").trim(),
    }))
    .filter((x) => x.label || x.url)
    .slice(0, 20);
}

export async function POST(req: Request) {
  let userId: string;
  try {
    const auth = await requireAuth();
    userId = auth.userId;
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const templateKeyRaw = parsed.data.templateKey;
  const templateKey = normalizeTemplateKey(templateKeyRaw);

  if (!isValidTemplateKey(templateKey)) {
    return NextResponse.json(
      { ok: false, error: `Invalid template key: ${templateKeyRaw}` },
      { status: 400 }
    );
  }

  const title = parsed.data.draft.title.trim();
  const slug = normalizeSlug(parsed.data.draft.slugSuggestion);

  if (!slug || slug.length < 3) {
    return NextResponse.json(
      { ok: false, error: "Slug must be at least 3 characters" },
      { status: 400 }
    );
  }

  const announcementText = (parsed.data.draft.announcement || "").trim();
  const links = normalizeLinks(parsed.data.draft.links || []);
  const contactName = (parsed.data.draft.contactName || "").trim();
  const contactEmail = (parsed.data.draft.contactEmail || "").trim();
  const contactPhone = (parsed.data.draft.contactPhone || "").trim();

  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .insert({
      owner_clerk_user_id: userId,
      template_key: templateKey,
      slug,
      title,
      status: "draft",
      is_published: false,

      // NEW content fields
      announcement_text: announcementText || null,
      links: links.length ? links : null,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
    })
    .select("id")
    .single();

  if (siteErr || !site) {
    const msg = siteErr?.message || "Failed to create microsite";
    if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      return NextResponse.json(
        { ok: false, error: "That slug is already taken. Try another." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: `/api/stripe/checkout?micrositeId=${site.id}` }, { status: 200 });
}