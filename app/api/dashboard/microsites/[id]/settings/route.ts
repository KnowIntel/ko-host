import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePasscode(input: string) {
  return (input || "").replace(/\D/g, "").slice(0, 6);
}

function hashPasscode(passcode: string) {
  return crypto.createHash("sha256").update(passcode).digest("hex");
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: micrositeId } = await ctx.params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const formData = await req.formData();

  const siteVisibilityRaw = String(formData.get("siteVisibility") || "public");
  const privateModeRaw = String(formData.get("privateMode") || "passcode");
  const passcodeRaw = normalizePasscode(String(formData.get("passcode") || ""));

  const siteVisibility = siteVisibilityRaw === "private" ? "private" : "public";
  const privateMode = privateModeRaw === "members_only" ? "members_only" : "passcode";

  if (siteVisibility === "private" && privateMode === "passcode" && passcodeRaw) {
    if (!/^\d{6}$/.test(passcodeRaw)) {
      return NextResponse.redirect(
        new URL(`/dashboard/microsites/${micrositeId}/settings`, req.url)
      );
    }
  }

  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, passcode_hash")
    .eq("id", micrositeId)
    .maybeSingle();

  if (siteErr || !site) {
    return NextResponse.redirect(
      new URL(`/dashboard/microsites/${micrositeId}/settings`, req.url)
    );
  }

  if (site.owner_clerk_user_id !== userId) {
    return NextResponse.redirect(new URL("/dashboard/microsites", req.url));
  }

  const updatePayload: Record<string, unknown> = {
    site_visibility: siteVisibility,
    private_mode: siteVisibility === "private" ? privateMode : null,
    updated_at: new Date().toISOString(),
  };

  if (siteVisibility === "public") {
    updatePayload.passcode_hash = null;
  } else if (privateMode === "members_only") {
    updatePayload.passcode_hash = null;
  } else if (passcodeRaw) {
    updatePayload.passcode_hash = hashPasscode(passcodeRaw);
  } else {
    updatePayload.passcode_hash = site.passcode_hash ?? null;
  }

  const { error: updateErr } = await sb
    .from("microsites")
    .update(updatePayload)
    .eq("id", micrositeId)
    .eq("owner_clerk_user_id", userId);

  if (updateErr) {
    return NextResponse.redirect(
      new URL(`/dashboard/microsites/${micrositeId}/settings`, req.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/dashboard/microsites/${micrositeId}/settings`, req.url)
  );
}