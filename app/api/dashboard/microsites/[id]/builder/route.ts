import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sanitizeBuilderDraft } from "@/lib/templates/builder";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const rawDraft =
      body?.draft && typeof body.draft === "object" ? body.draft : {};

    const sanitizedDraft = sanitizeBuilderDraft({
      title: String(rawDraft.title || ""),
      slugSuggestion: String(rawDraft.slugSuggestion || ""),
      blocks: Array.isArray(rawDraft.blocks) ? rawDraft.blocks : [],
    });

    const supabaseAdmin = getSupabaseAdmin();

    const { data: microsite, error: micrositeError } = await supabaseAdmin
      .from("microsites")
      .select("id, owner_clerk_user_id, title, slug")
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found." },
        { status: 404 },
      );
    }

    const nextDraft = {
      ...sanitizedDraft,
      title: sanitizedDraft.title || microsite.title || "",
      slugSuggestion: microsite.slug,
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("microsites")
      .update({
        title: nextDraft.title,
        draft: nextDraft,
      })
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .select("id, slug, title, draft")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Failed to save builder draft." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, microsite: updated, draft: nextDraft });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}