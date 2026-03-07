import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function hashPasscode(passcode: string) {
  return createHash("sha256").update(passcode).digest("hex");
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

    const templateKey = String(body?.templateKey || "");
    const designKey = String(body?.designKey || "blank");
    const title = String(body?.title || body?.draftJson?.title || "").trim();
    const slugSuggestion = String(body?.slugSuggestion || "").trim().toLowerCase();
    const siteVisibility =
      body?.siteVisibility === "private" || body?.siteVisibility === "members_only"
        ? body.siteVisibility
        : "public";
    const privateMode =
      body?.privateMode === "members_only" ? "members_only" : "passcode";
    const passcode = String(body?.passcode || "").trim();
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

    if (!draftJson) {
      return NextResponse.json(
        { ok: false, error: "Missing draft payload." },
        { status: 400 },
      );
    }

    if (siteVisibility === "private" && !/^\d{6}$/.test(passcode)) {
      return NextResponse.json(
        { ok: false, error: "Private sites require a 6-digit numeric passcode." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingPending } = await supabaseAdmin
      .from("pending_microsite_checkouts")
      .select("id")
      .eq("slug", slugSuggestion)
      .maybeSingle();

    if (existingPending) {
      return NextResponse.json(
        { ok: false, error: "That site name is already reserved." },
        { status: 409 },
      );
    }

    const { data: existingMicrosite } = await supabaseAdmin
      .from("microsites")
      .select("id")
      .eq("slug", slugSuggestion)
      .maybeSingle();

    if (existingMicrosite) {
      return NextResponse.json(
        { ok: false, error: "That site name is already taken." },
        { status: 409 },
      );
    }

    const insertRow = {
      owner_clerk_user_id: userId,
      template_key: templateKey,
      slug: slugSuggestion,
      title,
      site_visibility: siteVisibility,
      private_mode: siteVisibility === "public" ? false : privateMode === "passcode",
      passcode_hash:
        siteVisibility === "private" && passcode ? hashPasscode(passcode) : null,
      draft: {
        ...draftJson,
        title,
        slugSuggestion,
      },
      selected_design_key: designKey,
    };

    const { data, error } = await supabaseAdmin
      .from("pending_microsite_checkouts")
      .insert(insertRow)
      .select("id, slug")
      .single();

    if (error || !data) {
      console.error("CREATE MICROSITE DRAFT ERROR:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to create microsite draft" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      pendingCheckoutId: data.id,
      slug: data.slug,
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