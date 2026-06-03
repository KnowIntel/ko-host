import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function verifyOwner(micrositeId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false as const, status: 401, error: "Unauthorized." };
  }

  const supabase = getSupabaseAdmin();

  const { data: microsite, error } = await supabase
    .from("microsites")
    .select("id, owner_clerk_user_id")
    .eq("id", micrositeId)
    .maybeSingle();

  if (error || !microsite) {
    return { ok: false as const, status: 404, error: "Microsite not found." };
  }

  if (microsite.owner_clerk_user_id !== userId) {
    return { ok: false as const, status: 403, error: "Forbidden." };
  }

  return { ok: true as const, supabase };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: micrositeId } = await ctx.params;
  const verified = await verifyOwner(micrositeId);

  if (!verified.ok) {
    return NextResponse.json(
      { ok: false, error: verified.error },
      { status: verified.status },
    );
  }

  const { data, error } = await verified.supabase
    .from("enrollment_board_entries")
    .select(
      "id, block_id, name, quote, email, profile_image_url, status, created_at",
    )
    .eq("microsite_id", micrositeId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    enrollments: data ?? [],
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: micrositeId } = await ctx.params;
  const verified = await verifyOwner(micrositeId);

  if (!verified.ok) {
    return NextResponse.json(
      { ok: false, error: verified.error },
      { status: verified.status },
    );
  }

  const body = await req.json().catch(() => null);
  const entryId = String(body?.entryId ?? "").trim();
  const status = String(body?.status ?? "").trim();

  if (!entryId) {
    return NextResponse.json(
      { ok: false, error: "Missing entryId." },
      { status: 400 },
    );
  }

  if (status !== "active" && status !== "hidden") {
    return NextResponse.json(
      { ok: false, error: "Invalid status." },
      { status: 400 },
    );
  }

  const { data, error } = await verified.supabase
    .from("enrollment_board_entries")
    .update({
      status,
      deleted_at: status === "active" ? null : new Date().toISOString(),
    })
    .eq("id", entryId)
    .eq("microsite_id", micrositeId)
    .select(
      "id, block_id, name, quote, email, profile_image_url, status, created_at",
    )
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { ok: false, error: "Enrollment not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    enrollment: data,
  });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: micrositeId } = await ctx.params;
  const verified = await verifyOwner(micrositeId);

  if (!verified.ok) {
    return NextResponse.json(
      { ok: false, error: verified.error },
      { status: verified.status },
    );
  }

  const body = await req.json().catch(() => null);
  const entryId = String(body?.entryId ?? "").trim();

  if (!entryId) {
    return NextResponse.json(
      { ok: false, error: "Missing entryId." },
      { status: 400 },
    );
  }

  const { error } = await verified.supabase
    .from("enrollment_board_entries")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", entryId)
    .eq("microsite_id", micrositeId);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}