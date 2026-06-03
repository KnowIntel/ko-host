// app\api\dashboard\drafts\latest\route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const url = new URL(req.url);
    const templateKey = url.searchParams.get("templateKey") || "";
    const designKey = url.searchParams.get("designKey") || "blank";

    if (!templateKey) {
      return NextResponse.json(
        { ok: false, error: "Missing templateKey" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("microsite_drafts")
      .select("draft, updated_at")
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

    if (!data?.draft) {
      return NextResponse.json(
        { ok: false, draft: null, error: "No draft found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      draft: data.draft,
      updatedAt: data.updated_at,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load latest draft." },
      { status: 500 },
    );
  }
}