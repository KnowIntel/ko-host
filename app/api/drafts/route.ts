// app/api/drafts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeKey(value: unknown, fallback = "") {
  const next = String(value ?? fallback).trim();
  return next;
}

function resolveTemplateKey(body: any, draft: any) {
  return normalizeKey(
    body?.templateKey ||
      body?.template_key ||
      body?.template ||
      draft?.templateKey ||
      draft?.template_key ||
      "",
  );
}

function resolveDesignKey(body: any, draft: any) {
  return normalizeKey(
    body?.designKey ||
      body?.design_key ||
      body?.design ||
      body?.selectedDesignKey ||
      body?.selected_design_key ||
      draft?.designKey ||
      draft?.design_key ||
      draft?.selectedDesignKey ||
      draft?.selected_design_key ||
      "blank",
    "blank",
  );
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const templateKey = normalizeKey(
      req.nextUrl.searchParams.get("templateKey") ||
        req.nextUrl.searchParams.get("template_key") ||
        req.nextUrl.searchParams.get("template") ||
        "",
    );

    const designKey = normalizeKey(
      req.nextUrl.searchParams.get("designKey") ||
        req.nextUrl.searchParams.get("design_key") ||
        req.nextUrl.searchParams.get("design") ||
        "blank",
      "blank",
    );

    // Fail-safe behavior:
    // Missing template key should never hard-fail draft recovery.
    // Return an empty result so the client can fall back to local storage.
    if (!templateKey) {
      return NextResponse.json({
        ok: true,
        draftRow: null,
        skipped: true,
        recoverable: true,
        message: "Missing templateKey. Cloud draft lookup skipped.",
      });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("microsite_drafts")
      .select("*")
      .eq("owner_clerk_user_id", userId)
      .eq("template_key", templateKey)
      .eq("design_key", designKey)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      draftRow: data ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
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
    const draft = body?.draft;

    if (!draft || typeof draft !== "object") {
      return NextResponse.json(
        { ok: false, error: "Missing draft payload" },
        { status: 400 },
      );
    }

    const templateKey = resolveTemplateKey(body, draft);
    const designKey = resolveDesignKey(body, draft);

    // Fail-safe behavior:
    // Do not hard-fail with 400 when templateKey is missing.
    // Let the client preserve the draft locally and avoid blocking the user.
    if (!templateKey) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        recoverable: true,
        error: "Missing templateKey. Cloud save skipped.",
        saveStrategy: "local-only",
      });
    }

    const title = typeof draft.title === "string" ? draft.title : null;

    // Saved only as a preference. This does not reserve or claim a slug.
    const slugPreference =
      typeof draft.slugSuggestion === "string" && draft.slugSuggestion.trim()
        ? draft.slugSuggestion.trim()
        : null;

    const supabaseAdmin = getSupabaseAdmin();

    const payload = {
      owner_clerk_user_id: userId,
      template_key: templateKey,
      design_key: designKey || "blank",
      title,
      slug_suggestion: slugPreference,
      draft,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("microsite_drafts")
      .upsert(payload, {
        onConflict: "owner_clerk_user_id,template_key,design_key",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      draftRow: data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}