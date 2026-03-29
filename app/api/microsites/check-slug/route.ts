// app/api/microsites/check-slug/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  slug: z.string().min(3).max(60).regex(/^[a-z0-9-]+$/),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";

  const parsed = QuerySchema.safeParse({ slug });
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        available: false,
        reason: "invalid",
        error: "Invalid slug",
      },
      { status: 400 },
    );
  }

  const sb = getSupabaseAdmin();
  const safeSlug = parsed.data.slug;

  const { data: micrositeData, error: micrositeError } = await sb
    .from("microsites")
    .select("id, slug, is_published, is_active")
    .eq("slug", safeSlug)
    .limit(1);

  if (micrositeError) {
    console.error("check-slug microsite lookup failed", {
      error: micrositeError,
      slug: safeSlug,
    });

    return NextResponse.json(
      { ok: false, available: false, reason: "error", error: "Server error" },
      { status: 500 },
    );
  }

  const isTaken = Array.isArray(micrositeData) && micrositeData.length > 0;

  return NextResponse.json(
    {
      ok: true,
      available: !isTaken,
      reason: isTaken ? "taken" : null,
    },
    { status: 200 },
  );
}