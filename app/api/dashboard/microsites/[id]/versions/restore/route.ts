// app/api/dashboard/microsites/[id]/versions/restore/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sanitizeBuilderDraft } from "@/lib/templates/builder";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

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
    const versionId = String(body?.versionId || "");

    if (!versionId) {
      return NextResponse.json(
        { error: "Missing versionId." },
        { status: 400 },
      );
    }

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

    const { data: version, error: versionError } = await supabaseAdmin
      .from("microsite_versions")
      .select("id, microsite_id, draft")
      .eq("id", versionId)
      .eq("microsite_id", id)
      .single();

    if (versionError || !version) {
      return NextResponse.json(
        { error: "Version not found." },
        { status: 404 },
      );
    }

    const rawDraft =
      version?.draft && typeof version.draft === "object" ? version.draft : {};

    const sanitizedDraft = sanitizeBuilderDraft({
      title: String((rawDraft as any).title || ""),
      slugSuggestion: String((rawDraft as any).slugSuggestion || ""),
      blocks: Array.isArray((rawDraft as any).blocks) ? (rawDraft as any).blocks : [],
    });

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
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .select("id, slug, title, draft")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: updateError?.message || "Failed to restore version." },
        { status: 500 },
      );
    }

    const { error: versionInsertError } = await supabaseAdmin
      .from("microsite_versions")
      .insert({
        microsite_id: id,
        draft: nextDraft,
      });

    if (versionInsertError) {
      console.error("microsite restore version insert failed", versionInsertError);
    }

    return NextResponse.json({
      ok: true,
      microsite: updated,
      draft: nextDraft,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}