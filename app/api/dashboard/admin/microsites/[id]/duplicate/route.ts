import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

function normalizeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: source, error: sourceError } = await supabase
    .from("microsites")
    .select(
      `
        owner_clerk_user_id,
        slug,
        title,
        template_key,
        selected_design_key,
        site_visibility,
        draft
      `,
    )
    .eq("id", id)
    .eq("is_preset", false)
    .maybeSingle();

  if (sourceError || !source) {
    return NextResponse.json(
      { error: sourceError?.message || "Source microsite not found." },
      { status: 404 },
    );
  }

  const baseSlug = normalizeSlug(`${source.slug || "microsite"} copy`);
  let nextSlug = baseSlug || "microsite-copy";

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const candidate =
      attempt === 1
        ? nextSlug
        : normalizeSlug(`${baseSlug}-${attempt}`);

    const { data: existingMicrosite } = await supabase
      .from("microsites")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    const { data: existingPending } = await supabase
      .from("pending_microsite_checkouts")
      .select("id")
      .eq("slug", candidate)
      .is("processed_at", null)
      .maybeSingle();

    if (!existingMicrosite && !existingPending) {
      nextSlug = candidate;
      break;
    }
  }

  const title = `${source.title || "Untitled Microsite"} Copy`;
  const now = new Date().toISOString();

  const draft =
    source.draft && typeof source.draft === "object"
      ? {
          ...(source.draft as Record<string, unknown>),
          title,
          slugSuggestion: nextSlug,
          broadcastOnHomepage: false,
        }
      : {
          title,
          slugSuggestion: nextSlug,
          blocks: [],
          pages: [],
          broadcastOnHomepage: false,
        };

  const { data: created, error: createError } = await supabase
    .from("pending_microsite_checkouts")
    .insert({
      owner_clerk_user_id: source.owner_clerk_user_id,
      template_key: source.template_key,
      selected_design_key: source.selected_design_key || "blank",
      slug: nextSlug,
      title,
      site_visibility: "public",
      broadcast_on_homepage: false,
      private_mode: "none",
      passcode_hash: null,
      draft,
      stripe_session_id: null,
      processed_at: null,
      updated_at: now,
    })
    .select("id, slug")
    .single();

  if (createError || !created) {
    return NextResponse.json(
      { error: createError?.message || "Failed to duplicate microsite." },
      { status: 500 },
    );
  }

const redirectUrl = new URL(
  `/create/${encodeURIComponent(source.template_key || "")}`,
  _req.url,
);

redirectUrl.searchParams.set(
  "design",
  source.selected_design_key || "blank",
);
redirectUrl.searchParams.set("mode", "draft");

return NextResponse.redirect(redirectUrl);
}