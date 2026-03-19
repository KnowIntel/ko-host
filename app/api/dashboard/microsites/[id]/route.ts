// app/api/dashboard/microsites/[id]/route.ts
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
        "id, slug, title, template_key, selected_design_key, is_published, paid_until, draft",
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

// app/api/dashboard/microsites/[id]/route.ts

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("microsites")
      .update({
        is_active: false,
        is_published: false,
      })
      .eq("id", id)
      .eq("owner_clerk_user_id", userId);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}