import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/clerk";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidTemplateKey, normalizeTemplateKey } from "@/lib/templates/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  templateKey: z.string().min(1),
  draft: z.object({
    title: z.string().min(1),
    slugSuggestion: z.string().min(1),
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
    return NextResponse.json({ ok: false, error: "Slug must be at least 3 characters" }, { status: 400 });
  }

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
    })
    .select("id")
    .single();

  if (siteErr || !site) {
    const msg = siteErr?.message || "Failed to create microsite";
    if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      return NextResponse.json({ ok: false, error: "That slug is already taken. Try another." }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  // ✅ Do NOT server-fetch /api/stripe/checkout (auth/cookies can break)
  // Instead, send browser to the checkout endpoint (it already handles auth + redirect).
  return NextResponse.json(
    { ok: true, url: `/api/stripe/checkout?micrositeId=${site.id}` },
    { status: 200 }
  );
}