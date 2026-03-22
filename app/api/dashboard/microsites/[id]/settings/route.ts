// app/api/dashboard/microsites/[id]/settings/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePasscode(input: string) {
  return (input || "").replace(/\D/g, "").slice(0, 6);
}

function hashPasscode(passcode: string) {
  return crypto.createHash("sha256").update(passcode).digest("hex");
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: micrositeId } = await ctx.params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select(
      "id, slug, title, template_key, selected_design_key, site_visibility, private_mode, is_active, is_published, paid_until, owner_clerk_user_id",
    )
    .eq("id", micrositeId)
    .maybeSingle();

  if (siteErr || !site) {
    return NextResponse.json(
      { ok: false, error: "Microsite not found." },
      { status: 404 },
    );
  }

  if (site.owner_clerk_user_id !== userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    microsite: {
      id: site.id,
      slug: site.slug,
      title: site.title,
      template_key: site.template_key,
      selected_design_key: site.selected_design_key,
      site_visibility: site.site_visibility,
      private_mode: site.private_mode,
      is_active: site.is_active,
      is_published: site.is_published,
      paid_until: site.paid_until,
    },
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: micrositeId } = await ctx.params;

  const { userId } = await auth();
  if (!userId) {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const contentType = req.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let title = "";
  let siteVisibilityRaw = "public";
  let privateModeRaw = "passcode";
  let passcodeRaw = "";

  if (isJson) {
    const body = await req.json().catch(() => ({}));
    title = String(body?.title || "").trim();
    siteVisibilityRaw = String(body?.siteVisibility || "public");
    privateModeRaw = String(body?.privateMode || "passcode");
    passcodeRaw = normalizePasscode(String(body?.passcode || ""));
  } else {
    const formData = await req.formData();
    title = String(formData.get("title") || "").trim();
    siteVisibilityRaw = String(formData.get("siteVisibility") || "public");
    privateModeRaw = String(formData.get("privateMode") || "passcode");
    passcodeRaw = normalizePasscode(String(formData.get("passcode") || ""));
  }

  const siteVisibility = siteVisibilityRaw === "private" ? "private" : "public";
  const privateMode =
    privateModeRaw === "members_only" ? "members_only" : "passcode";

  if (!title) {
    if (isJson) {
      return NextResponse.json(
        { ok: false, error: "Title is required." },
        { status: 400 },
      );
    }

    return NextResponse.redirect(
      new URL(`/dashboard/microsites/${micrositeId}`, req.url),
    );
  }

  if (
    siteVisibility === "private" &&
    privateMode === "passcode" &&
    passcodeRaw &&
    !/^\d{6}$/.test(passcodeRaw)
  ) {
    if (isJson) {
      return NextResponse.json(
        { ok: false, error: "Private microsites require a passcode (min: 2 chars / max: 30 chars)." },
        { status: 400 },
      );
    }

    return NextResponse.redirect(
      new URL(`/dashboard/microsites/${micrositeId}`, req.url),
    );
  }

  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select(
      "id, slug, title, template_key, selected_design_key, site_visibility, private_mode, is_active, is_published, paid_until, owner_clerk_user_id, passcode_hash",
    )
    .eq("id", micrositeId)
    .maybeSingle();

  if (siteErr || !site) {
    if (isJson) {
      return NextResponse.json(
        { ok: false, error: "Microsite not found." },
        { status: 404 },
      );
    }

    return NextResponse.redirect(
      new URL(`/dashboard/microsites/${micrositeId}`, req.url),
    );
  }

  if (site.owner_clerk_user_id !== userId) {
    if (isJson) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/dashboard/microsites", req.url));
  }

  const updatePayload: Record<string, unknown> = {
    title,
    site_visibility: siteVisibility,
    private_mode: siteVisibility === "private" ? privateMode : false,
    updated_at: new Date().toISOString(),
  };

  if (siteVisibility === "public") {
    updatePayload.passcode_hash = null;
  } else if (privateMode === "members_only") {
    updatePayload.passcode_hash = null;
  } else if (passcodeRaw) {
    updatePayload.passcode_hash = hashPasscode(passcodeRaw);
  } else {
    updatePayload.passcode_hash = site.passcode_hash ?? null;
  }

  const { data: updatedSite, error: updateErr } = await sb
    .from("microsites")
    .update(updatePayload)
    .eq("id", micrositeId)
    .eq("owner_clerk_user_id", userId)
    .select(
      "id, slug, title, template_key, selected_design_key, site_visibility, private_mode, is_active, is_published, paid_until",
    )
    .single();

  if (updateErr || !updatedSite) {
    if (isJson) {
      return NextResponse.json(
        { ok: false, error: updateErr?.message || "Failed to save settings." },
        { status: 500 },
      );
    }

    return NextResponse.redirect(
      new URL(`/dashboard/microsites/${micrositeId}`, req.url),
    );
  }

  if (isJson) {
    return NextResponse.json({
      ok: true,
      microsite: updatedSite,
    });
  }

  return NextResponse.redirect(
    new URL(`/dashboard/microsites/${micrositeId}`, req.url),
  );
}