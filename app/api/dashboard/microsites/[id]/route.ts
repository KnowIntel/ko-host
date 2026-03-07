import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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

    const { data, error } = await supabaseAdmin
      .from("microsites")
      .select(
        "id, slug, title, template_key, is_published, paid_until, draft",
      )
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Microsite not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, microsite: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}