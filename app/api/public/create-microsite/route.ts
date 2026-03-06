import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { requireAuth } from "@/lib/clerk";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidTemplateKey, normalizeTemplateKey } from "@/lib/templates/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LinkSchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().trim().min(1),
  url: z.string().trim().min(3),
});

const BodySchema = z.object({
  templateKey: z.string().min(1),
  draft: z.object({
    title: z.string().min(1),
    slugSuggestion: z.string().min(1),

    siteVisibility: z.enum(["public", "private"]).optional().default("public"),
    privateMode: z.enum(["passcode", "members_only"]).optional(),
    passcode: z.string().optional().default(""),

    announcement: z
      .object({
        headline: z.string().optional().default(""),
        body: z.string().optional().default(""),
      })
      .optional(),

    links: z.array(LinkSchema).optional().default([]),

    contact: z
      .object({
        name: z.string().optional().default(""),
        email: z.string().optional().default(""),
        phone: z.string().optional().default(""),
      })
      .optional(),
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

function normalizePasscode(input: string) {
  return (input || "").replace(/\D/g, "").slice(0, 6);
}

function hashPasscode(passcode: string) {
  return crypto.createHash("sha256").update(passcode).digest("hex");
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

  const siteVisibility = parsed.data.draft.siteVisibility ?? "public";
  const privateMode =
    siteVisibility === "private"
      ? parsed.data.draft.privateMode ?? "passcode"
      : null;

  const rawPasscode = normalizePasscode(parsed.data.draft.passcode ?? "");

  if (siteVisibility === "private" && privateMode === "passcode" && rawPasscode.length !== 6) {
    return NextResponse.json(
      { ok: false, error: "Private passcode must be exactly 6 digits." },
      { status: 400 }
    );
  }

  const passcodeHash =
    siteVisibility === "private" && privateMode === "passcode"
      ? hashPasscode(rawPasscode)
      : null;

  const announcement = parsed.data.draft.announcement;
  const links = parsed.data.draft.links ?? [];
  const contact = parsed.data.draft.contact;

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
      site_visibility: siteVisibility,
      private_mode: privateMode,
      passcode_hash: passcodeHash,
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

  if ((announcement?.headline || "").trim() || (announcement?.body || "").trim()) {
    await sb.from("microsite_announcements").upsert({
      microsite_id: site.id,
      headline: (announcement?.headline || "").trim(),
      body: (announcement?.body || "").trim(),
      updated_at: new Date().toISOString(),
    });
  }

  if ((contact?.name || "").trim() || (contact?.email || "").trim() || (contact?.phone || "").trim()) {
    await sb.from("microsite_contact").upsert({
      microsite_id: site.id,
      name: (contact?.name || "").trim(),
      email: (contact?.email || "").trim(),
      phone: (contact?.phone || "").trim(),
      updated_at: new Date().toISOString(),
    });
  }

  if (links.length) {
    const rows = links
      .map((l, idx) => ({
        microsite_id: site.id,
        label: l.label.trim(),
        url: l.url.trim(),
        sort_order: idx,
      }))
      .filter((x) => x.label && x.url);

    if (rows.length) {
      await sb.from("microsite_links").insert(rows);
    }
  }

  return NextResponse.json(
    { ok: true, url: `/api/stripe/checkout?micrositeId=${site.id}` },
    { status: 200 }
  );
}