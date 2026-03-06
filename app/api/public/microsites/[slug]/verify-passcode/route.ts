import { NextResponse } from "next/server";
import crypto from "crypto";
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
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const formData = await req.formData().catch(() => null);

  const rawPasscode = normalizePasscode(String(formData?.get("passcode") || ""));

  if (!slug) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!/^\d{6}$/.test(rawPasscode)) {
    return NextResponse.redirect(new URL(`/s/${slug}`, req.url));
  }

  const supabase = getSupabaseAdmin();

  const { data: microsite, error } = await supabase
    .from("microsites")
    .select("slug, site_visibility, private_mode, passcode_hash")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !microsite) {
    return NextResponse.redirect(new URL(`/s/${slug}`, req.url));
  }

  if (
    microsite.site_visibility !== "private" ||
    microsite.private_mode !== "passcode" ||
    !microsite.passcode_hash
  ) {
    return NextResponse.redirect(new URL(`/s/${slug}`, req.url));
  }

  const incomingHash = hashPasscode(rawPasscode);

  if (incomingHash !== microsite.passcode_hash) {
    return NextResponse.redirect(new URL(`/s/${slug}`, req.url));
  }

  const response = NextResponse.redirect(new URL(`/s/${slug}`, req.url));

  response.cookies.set(`kohost_passcode_${slug}`, "verified", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
