import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("microsites")
    .select(
      `
        id,
        slug,
        title,
        template_key,
        selected_design_key,
        owner_clerk_user_id,
        is_active,
        is_published,
        paid_until,
        created_at,
        updated_at,
        draft
      `,
    )
    .eq("id", id)
    .eq("is_preset", false)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Microsite not found" },
      { status: 404 },
    );
  }

  const filename = `${data.slug || data.id}-draft-export.json`;

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}