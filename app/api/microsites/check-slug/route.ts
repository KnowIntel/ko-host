// app/api/microsites/check-slug/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

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
      { status: 400 }
    );
  }

  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("microsites")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (error) {
    console.error("check-slug failed", { error, slug: parsed.data.slug });
    return NextResponse.json(
      { ok: false, available: false, error: "Server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, available: !data },
    { status: 200 }
  );
}