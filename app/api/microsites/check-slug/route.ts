// app/api/microsites/check-slug/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";

  const parsed = QuerySchema.safeParse({ slug });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, available: false, error: "Invalid slug" },
      { status: 400 },
    );
  }

  const sb = getSupabaseAdmin();
  const safeSlug = parsed.data.slug;

  const { data: pendingData, error: pendingError } = await sb
    .from("pending_microsite_checkouts")
    .select("id")
    .eq("slug", safeSlug)
    .maybeSingle();

  if (pendingError) {
    console.error("check-slug pending lookup failed", {
      error: pendingError,
      slug: safeSlug,
    });

    return NextResponse.json(
      { ok: false, available: false, error: "Server error" },
      { status: 500 },
    );
  }

  if (pendingData) {
    return NextResponse.json(
      { ok: true, available: false, reason: "reserved" },
      { status: 200 },
    );
  }

  const { data: micrositeData, error: micrositeError } = await sb
    .from("microsites")
    .select("id")
    .eq("slug", safeSlug)
    .maybeSingle();

  if (micrositeError) {
    console.error("check-slug microsite lookup failed", {
      error: micrositeError,
      slug: safeSlug,
    });

    return NextResponse.json(
      { ok: false, available: false, error: "Server error" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      available: !micrositeData,
      reason: micrositeData ? "taken" : null,
    },
    { status: 200 },
  );
}