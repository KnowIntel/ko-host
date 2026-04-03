// app/api/dashboard/microsites/[id]/pages/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sanitizeBuilderDraft } from "@/lib/templates/builder";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function getOwnedMicrosite(id: string, userId: string) {
  const sb = getSupabaseAdmin();

  const { data: microsite, error: micrositeError } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, title, slug")
    .eq("id", id)
    .maybeSingle();

  if (micrositeError || !microsite) {
    return {
      ok: false as const,
      status: 404,
      error: "Microsite not found",
    };
  }

  if (microsite.owner_clerk_user_id !== userId) {
    return {
      ok: false as const,
      status: 403,
      error: "Forbidden",
    };
  }

  return {
    ok: true as const,
    microsite,
    sb,
  };
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const micrositeResult = await getOwnedMicrosite(id, userId);

  if (!micrositeResult.ok) {
    return NextResponse.json(
      { error: micrositeResult.error },
      { status: micrositeResult.status },
    );
  }

  const { sb } = micrositeResult;
  const url = new URL(req.url);
  const pageId = String(url.searchParams.get("pageId") || "").trim();
  const pageSlug = String(url.searchParams.get("slug") || "").trim();

  if (pageId || pageSlug) {
    let query = sb
      .from("microsite_pages")
      .select("id, slug, title, display_order, draft, created_at, updated_at")
      .eq("microsite_id", id);

    if (pageId) {
      query = query.eq("id", pageId);
    } else {
      query = query.eq("slug", normalizeSlug(pageSlug));
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page: data });
  }

  const { data, error } = await sb
    .from("microsite_pages")
    .select("id, slug, title, display_order, created_at, updated_at")
    .eq("microsite_id", id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pages: data || [] });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const slugRaw = String(body?.slug || "");
  const slug = normalizeSlug(slugRaw);

  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  const micrositeResult = await getOwnedMicrosite(id, userId);
  if (!micrositeResult.ok) {
    return NextResponse.json(
      { error: micrositeResult.error },
      { status: micrositeResult.status },
    );
  }

  const { sb } = micrositeResult;

  const { data: existing } = await sb
    .from("microsite_pages")
    .select("id")
    .eq("microsite_id", id)
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Page with this slug already exists." },
      { status: 400 },
    );
  }

  const { data: lastPage } = await sb
    .from("microsite_pages")
    .select("display_order")
    .eq("microsite_id", id)
    .order("display_order", { ascending: false })
    .limit(100)
    .maybeSingle();

  const nextDisplayOrder =
    typeof lastPage?.display_order === "number" ? lastPage.display_order + 1 : 0;

  const blankDraft = sanitizeBuilderDraft({
    title: "",
    subtitle: "",
    subtext: "",
    description: "",
    slugSuggestion: micrositeResult.microsite.slug || "",
    blocks: [],
    pageScale: 85,
    pageVisibility: {},
    pageElements: {},
  });

  const { data, error } = await sb
    .from("microsite_pages")
    .insert({
      microsite_id: id,
      slug,
      title: slug,
      display_order: nextDisplayOrder,
      draft: blankDraft,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ page: data });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "").trim();

  const micrositeResult = await getOwnedMicrosite(id, userId);
  if (!micrositeResult.ok) {
    return NextResponse.json(
      { error: micrositeResult.error },
      { status: micrositeResult.status },
    );
  }

  const { microsite, sb } = micrositeResult;

  if (action === "reorder") {
    const orderedPageIds = Array.isArray(body?.orderedPageIds)
      ? body.orderedPageIds.map((value: unknown) => String(value))
      : [];

    if (orderedPageIds.length === 0) {
      return NextResponse.json(
        { error: "orderedPageIds required" },
        { status: 400 },
      );
    }

    const { data: existingPages, error: existingPagesError } = await sb
      .from("microsite_pages")
      .select("id")
      .eq("microsite_id", id);

    if (existingPagesError) {
      return NextResponse.json(
        { error: existingPagesError.message },
        { status: 500 },
      );
    }

    const existingIds = new Set((existingPages || []).map((page) => String(page.id)));

    if (
      orderedPageIds.length !== existingIds.size ||
      orderedPageIds.some((pageId: string) => !existingIds.has(pageId))
    ) {
      return NextResponse.json(
        { error: "Invalid page ordering." },
        { status: 400 },
      );
    }

    for (let index = 0; index < orderedPageIds.length; index += 1) {
      const pageId = orderedPageIds[index];

      const { error } = await sb
        .from("microsite_pages")
        .update({
          display_order: index,
          updated_at: new Date().toISOString(),
        })
        .eq("microsite_id", id)
        .eq("id", pageId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data: pages, error: reloadError } = await sb
      .from("microsite_pages")
      .select("id, slug, title, display_order, created_at, updated_at")
      .eq("microsite_id", id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (reloadError) {
      return NextResponse.json({ error: reloadError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pages: pages || [] });
  }

  if (action === "rename") {
    const pageId = String(body?.pageId || "").trim();
    const slug = normalizeSlug(String(body?.slug || ""));

    if (!pageId || !slug) {
      return NextResponse.json(
        { error: "pageId and slug required" },
        { status: 400 },
      );
    }

    const { data: existingPage, error: existingPageError } = await sb
      .from("microsite_pages")
      .select("id, slug")
      .eq("microsite_id", id)
      .eq("id", pageId)
      .maybeSingle();

    if (existingPageError || !existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const { data: duplicatePage } = await sb
      .from("microsite_pages")
      .select("id")
      .eq("microsite_id", id)
      .eq("slug", slug)
      .neq("id", pageId)
      .maybeSingle();

    if (duplicatePage) {
      return NextResponse.json(
        { error: "Page with this slug already exists." },
        { status: 400 },
      );
    }

    const { data: updatedPage, error: updateError } = await sb
      .from("microsite_pages")
      .update({
        slug,
        title: slug,
        updated_at: new Date().toISOString(),
      })
      .eq("microsite_id", id)
      .eq("id", pageId)
      .select("id, slug, title, display_order, updated_at")
      .single();

    if (updateError || !updatedPage) {
      return NextResponse.json(
        { error: updateError?.message || "Failed to rename page." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, page: updatedPage });
  }

  if (action === "delete") {
    const pageId = String(body?.pageId || "").trim();

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId required" },
        { status: 400 },
      );
    }

    const { data: existingPages, error: existingPagesError } = await sb
      .from("microsite_pages")
      .select("id, slug")
      .eq("microsite_id", id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (existingPagesError) {
      return NextResponse.json(
        { error: existingPagesError.message },
        { status: 500 },
      );
    }

    if ((existingPages || []).length <= 1) {
      return NextResponse.json(
        { error: "At least one page must remain." },
        { status: 400 },
      );
    }

    const pageToDelete = (existingPages || []).find((page) => page.id === pageId);

    if (!pageToDelete) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (pageToDelete.slug === "home") {
      return NextResponse.json(
        { error: "The home page cannot be deleted." },
        { status: 400 },
      );
    }

    const { error: deleteError } = await sb
      .from("microsite_pages")
      .delete()
      .eq("microsite_id", id)
      .eq("id", pageId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete page." },
        { status: 500 },
      );
    }

    const { data: remainingPages, error: reloadError } = await sb
      .from("microsite_pages")
      .select("id, slug, title, display_order, created_at, updated_at")
      .eq("microsite_id", id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (reloadError) {
      return NextResponse.json({ error: reloadError.message }, { status: 500 });
    }

    for (let index = 0; index < (remainingPages || []).length; index += 1) {
      const page = remainingPages![index];

      await sb
        .from("microsite_pages")
        .update({
          display_order: index,
          updated_at: new Date().toISOString(),
        })
        .eq("microsite_id", id)
        .eq("id", page.id);
    }

    return NextResponse.json({ ok: true });
  }

  const pageId = String(body?.pageId || "").trim();
  const rawDraft =
    body?.draft && typeof body.draft === "object" ? body.draft : null;

  if (!pageId) {
    return NextResponse.json({ error: "pageId required" }, { status: 400 });
  }

  if (!rawDraft) {
    return NextResponse.json({ error: "draft required" }, { status: 400 });
  }

  const { data: existingPage, error: existingPageError } = await sb
    .from("microsite_pages")
    .select("id, slug, title, display_order, draft")
    .eq("microsite_id", id)
    .eq("id", pageId)
    .maybeSingle();

  if (existingPageError || !existingPage) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const sanitizedDraft = sanitizeBuilderDraft(rawDraft);

  const nextDraft = {
    ...sanitizedDraft,
    title:
      typeof sanitizedDraft.title === "string" && sanitizedDraft.title.trim()
        ? sanitizedDraft.title
        : existingPage.title || "",
    slugSuggestion: microsite.slug || "",
  };

  const nowIso = new Date().toISOString();

  const { data: updatedPage, error: updateError } = await sb
    .from("microsite_pages")
    .update({
      title: nextDraft.title || existingPage.title || existingPage.slug,
      draft: nextDraft,
      updated_at: nowIso,
    })
    .eq("microsite_id", id)
    .eq("id", pageId)
    .select("id, slug, title, display_order, draft, updated_at")
    .single();

  if (updateError || !updatedPage) {
    return NextResponse.json(
      { error: updateError?.message || "Failed to save page draft." },
      { status: 500 },
    );
  }

  const isHomePage =
    existingPage.slug === "home" ||
    existingPage.display_order === 0;

  if (isHomePage) {
    const { error: micrositeUpdateError } = await sb
      .from("microsites")
      .update({
        title: nextDraft.title || microsite.title || existingPage.slug,
        draft: nextDraft,
        updated_at: nowIso,
      })
      .eq("id", id)
      .eq("owner_clerk_user_id", userId);

    if (micrositeUpdateError) {
      return NextResponse.json(
        {
          error:
            micrositeUpdateError.message ||
            "Failed to sync microsite draft.",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    page: updatedPage,
    draft: nextDraft,
  });
}