// app/api/dashboard/microsites/[id]/builder/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sanitizeBuilderDraft } from "@/lib/templates/builder";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const VERSION_THROTTLE_MS = 60 * 1000;

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

    const sanitizedDraft = sanitizeBuilderDraft(rawDraft);

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
      slugSuggestion:
        typeof microsite.slug === "string" ? microsite.slug : "",
    };

    const nowIso = new Date().toISOString();

    const { data: existingPages, error: existingPagesError } = await supabaseAdmin
      .from("microsite_pages")
      .select("id, slug")
      .eq("microsite_id", id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(100);

    if (existingPagesError) {
      return NextResponse.json(
        { error: existingPagesError.message || "Failed to load microsite pages." },
        { status: 500 },
      );
    }

    const existingHomePage = existingPages?.[0] ?? null;

    if (!existingHomePage) {
      const { error: createHomePageError } = await supabaseAdmin
        .from("microsite_pages")
        .insert({
          microsite_id: id,
          slug: "home",
          title: nextDraft.title || microsite.title || "Home",
          draft: nextDraft,
          updated_at: nowIso,
        });

      if (createHomePageError) {
        return NextResponse.json(
          {
            error:
              createHomePageError.message || "Failed to create microsite home page.",
          },
          { status: 500 },
        );
      }
    } else {
      const { error: updateHomePageError } = await supabaseAdmin
        .from("microsite_pages")
        .update({
          title: nextDraft.title || microsite.title || "Home",
          draft: nextDraft,
          updated_at: nowIso,
        })
        .eq("id", existingHomePage.id)
        .eq("microsite_id", id);

      if (updateHomePageError) {
        return NextResponse.json(
          {
            error:
              updateHomePageError.message || "Failed to update microsite home page.",
          },
          { status: 500 },
        );
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("microsites")
      .update({
        title: nextDraft.title,
        draft: nextDraft,
        updated_at: nowIso,
      })
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .select("id, slug, title, draft")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: updateError?.message || "Failed to save builder draft." },
        { status: 500 },
      );
    }

    const { data: latestVersion, error: latestVersionError } = await supabaseAdmin
      .from("microsite_versions")
      .select("id, created_at")
      .eq("microsite_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let shouldInsertVersion = true;

    if (!latestVersionError && latestVersion?.created_at) {
      const latestVersionTime = new Date(latestVersion.created_at).getTime();
      const now = Date.now();

      if (Number.isFinite(latestVersionTime)) {
        shouldInsertVersion = now - latestVersionTime >= VERSION_THROTTLE_MS;
      }
    }

    if (shouldInsertVersion) {
      const { error: versionError } = await supabaseAdmin
        .from("microsite_versions")
        .insert({
          microsite_id: id,
          draft: nextDraft,
        });

      if (versionError) {
        console.error("microsite version insert failed", versionError);
      }
    }

    return NextResponse.json({
      ok: true,
      microsite: updated,
      draft: nextDraft,
      versionCreated: shouldInsertVersion,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}