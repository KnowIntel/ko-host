import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sanitizeBuilderDraft } from "@/lib/templates/builder";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-")
    .slice(0, 63);
}

function normalizeVisibility(value: string | null) {
  if (value === "private") return "private";
  if (value === "members_only") return "members_only";
  return "public";
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let payload: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      payload = await req.json().catch(() => ({}));
    } else {
      const formData = await req.formData();

      payload = {
        templateKey: String(formData.get("templateKey") || ""),
        title: String(formData.get("title") || ""),
        slug: String(formData.get("slug") || ""),
        slugSuggestion: String(formData.get("slugSuggestion") || ""),
        siteVisibility: String(formData.get("siteVisibility") || "public"),
        privateMode:
          String(formData.get("privateMode") || "").toLowerCase() === "true",
        passcode: String(formData.get("passcode") || ""),
        draftJson: String(formData.get("draftJson") || "{}"),
      };
    }

    const templateKey = String(payload.templateKey || "").trim();
    const rawTitle = String(payload.title || "").trim();
    const rawSlug =
      String(payload.slug || "").trim() ||
      String(payload.slugSuggestion || "").trim();

    const siteVisibility = normalizeVisibility(
      String(payload.siteVisibility || "public"),
    );

    const privateMode =
      Boolean(payload.privateMode) || siteVisibility !== "public";

    const passcode = String(payload.passcode || "").trim();

    if (!templateKey) {
      return NextResponse.json(
        { error: "Template key is required." },
        { status: 400 },
      );
    }

    let parsedDraft: unknown = {};

    if (typeof payload.draftJson === "string") {
      parsedDraft = JSON.parse(payload.draftJson || "{}");
    } else if (payload.draftJson && typeof payload.draftJson === "object") {
      parsedDraft = payload.draftJson;
    }

    const parsedDraftRecord =
      parsedDraft && typeof parsedDraft === "object"
        ? (parsedDraft as Record<string, unknown>)
        : {};

    const sanitizedDraft = sanitizeBuilderDraft({
      title: String(parsedDraftRecord.title || rawTitle || ""),
      slugSuggestion: String(parsedDraftRecord.slugSuggestion || rawSlug || ""),
      blocks: Array.isArray(parsedDraftRecord.blocks)
        ? (parsedDraftRecord.blocks as never[])
        : [],
    });

    const title = sanitizedDraft.title || rawTitle;
    const slug = slugify(rawSlug || sanitizedDraft.slugSuggestion || title);

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingPaidSlug, error: paidSlugError } = await supabaseAdmin
      .from("microsites")
      .select("id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (paidSlugError) {
      return NextResponse.json(
        { error: "Failed to validate slug." },
        { status: 500 },
      );
    }

    if (existingPaidSlug) {
      return NextResponse.json(
        { error: "That subdomain is already taken." },
        { status: 409 },
      );
    }

    const draftToStore = {
      ...sanitizedDraft,
      title,
      slugSuggestion: slug,
    };

    const row = {
      owner_clerk_user_id: userId,
      template_key: templateKey,
      slug,
      title,
      site_visibility: siteVisibility,
      private_mode: privateMode,
      passcode_hash: passcode ? passcode : null,
      draft: draftToStore,
    };

    const { data, error } = await supabaseAdmin
      .from("pending_microsite_checkouts")
      .upsert(row, {
        onConflict: "owner_clerk_user_id,slug",
      })
      .select("id, slug, title, template_key, owner_clerk_user_id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to save draft." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      pendingCheckoutId: data.id,
      slug: data.slug,
      title: data.title,
      templateKey: data.template_key,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}