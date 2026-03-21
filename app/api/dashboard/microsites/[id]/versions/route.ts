// app/api/dashboard/microsites/[id]/versions/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: microsite, error: micrositeError } = await supabaseAdmin
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found." },
        { status: 404 },
      );
    }

    const { data: versions, error: versionsError } = await supabaseAdmin
      .from("microsite_versions")
      .select("id, created_at, draft")
      .eq("microsite_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (versionsError) {
      return NextResponse.json(
        { error: versionsError.message || "Failed to load versions." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      versions: versions ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}