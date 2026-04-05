import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function hashPasscode(passcode: string) {
  return createHash("sha256").update(passcode).digest("hex");
}

function normalizeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));

    
const templateKey = String(body?.templateKey || "").trim();
const designKey = String(body?.designKey || "blank").trim();
const title = String(body?.title || body?.draftJson?.title || "").trim();
const slugSuggestion = normalizeSlug(body?.slugSuggestion || "");
const siteVisibility = body?.siteVisibility === "private" ? "private" : "public";
const passcode = String(body?.passcode || "").trim();
const broadcastOnHomepage = Boolean(body?.broadcastOnHomepage);
const draftJson =
  body?.draftJson && typeof body.draftJson === "object" ? body.draftJson : null;

if (!templateKey) {
  return NextResponse.json(
    { ok: false, error: "Missing template key." },
    { status: 400 },
  );
}

if (!title) {
  return NextResponse.json(
    { ok: false, error: "Missing title." },
    { status: 400 },
  );
}

if (!slugSuggestion) {
  return NextResponse.json(
    { ok: false, error: "Missing site name." },
    { status: 400 },
  );
}

    if (slugSuggestion.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Site name must be at least 3 characters." },
        { status: 400 },
      );
    }

    if (!draftJson) {
      return NextResponse.json(
        { ok: false, error: "Missing draft payload." },
        { status: 400 },
      );
    }

if (siteVisibility === "private" && !/^[A-Za-z0-9]{2,30}$/.test(passcode)) {
  return NextResponse.json(
    {
      ok: false,
      error: "Private sites require a passcode using 2-30 letters and numbers.",
    },
    { status: 400 },
  );
}

if (siteVisibility === "private" && broadcastOnHomepage) {
  return NextResponse.json(
    {
      ok: false,
      error: "Private microsites cannot be broadcast on the home page.",
    },
    { status: 400 },
  );
}

    const supabaseAdmin = getSupabaseAdmin();

const { data: existingMicrosite, error: existingMicrositeError } =
  await supabaseAdmin
    .from("microsites")
    .select("id, owner_clerk_user_id, slug, is_published, is_active")
    .eq("slug", slugSuggestion)
    .maybeSingle();

    if (existingMicrositeError) {
      return NextResponse.json(
        {
          ok: false,
          error: existingMicrositeError.message || "Failed to check live site names.",
        },
        { status: 500 },
      );
    }

    if (
      existingMicrosite &&
      existingMicrosite.owner_clerk_user_id !== userId
    ) {
      return NextResponse.json(
        { ok: false, error: "That site name is already taken." },
        { status: 409 },
      );
    }

const { data: existingPendingRows, error: existingPendingForOwnerError } =
  await supabaseAdmin
    .from("pending_microsite_checkouts")
    .select("id, owner_clerk_user_id, processed_at")
    .eq("owner_clerk_user_id", userId)
    .eq("template_key", templateKey)
    .eq("selected_design_key", designKey)
    .is("processed_at", null)
    .order("id", { ascending: false })
    .limit(1);

if (existingPendingForOwnerError) {
  return NextResponse.json(
    {
      ok: false,
      error:
        existingPendingForOwnerError.message ||
        "Failed to check pending microsite checkout.",
    },
    { status: 500 },
  );
}

const existingPendingForOwner =
  Array.isArray(existingPendingRows) && existingPendingRows.length > 0
    ? existingPendingRows[0]
    : null;

const rowPayload = {
  owner_clerk_user_id: userId,
  template_key: templateKey,
  slug: slugSuggestion,
  title,
  site_visibility: siteVisibility,
  broadcast_on_homepage: broadcastOnHomepage,
  private_mode: siteVisibility === "private" ? "passcode" : "none",
  passcode_hash:
    siteVisibility === "private" && passcode ? hashPasscode(passcode) : null,
  draft: {
    ...draftJson,
    title,
    slugSuggestion,
    broadcastOnHomepage,
  },
  selected_design_key: designKey,
  stripe_session_id: null,
  processed_at: null,
  updated_at: new Date().toISOString(),
};

if (existingPendingForOwner) {
      const { data, error } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .update(rowPayload)
        .eq("id", existingPendingForOwner.id)
        .select("id, slug")
        .single();

      if (error || !data) {
        console.error("UPDATE MICROSITE DRAFT ERROR:", error);
        return NextResponse.json(
          {
            ok: false,
            error: error?.message || "Failed to update microsite draft",
            details: error?.details || null,
            hint: error?.hint || null,
            code: error?.code || null,
          },
          { status: 500 },
        );
      }

return NextResponse.json({
  ok: true,
  pendingCheckoutId: data.id,
  slug: data.slug,
  requestedSlug: data.slug,
  broadcastOnHomepage,
});
    }

    const { data, error } = await supabaseAdmin
      .from("pending_microsite_checkouts")
      .insert(rowPayload)
      .select("id, slug")
      .single();

    if (error || !data) {
      console.error("CREATE MICROSITE DRAFT ERROR:", error);
      return NextResponse.json(
        {
          ok: false,
          error: error?.message || "Failed to create microsite draft",
          details: error?.details || null,
          hint: error?.hint || null,
          code: error?.code || null,
        },
        { status: 500 },
      );
    }

return NextResponse.json({
  ok: true,
  pendingCheckoutId: data.id,
  slug: data.slug,
  requestedSlug: data.slug,
});
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}