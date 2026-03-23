import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePasscode(input: string) {
  return String(input || "")
    .trim()
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 30);
}

function buildMicrositeAccessCookieName(slug: string) {
  return `kht_access_${slug}`;
}

function buildMicrositeAccessCookieValue(slug: string, passcodeHash: string) {
  return crypto
    .createHash("sha256")
    .update(`${slug}:${passcodeHash}`)
    .digest("hex");
}

function hashPasscode(passcode: string) {
  return crypto.createHash("sha256").update(passcode).digest("hex");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const safeSlug = decodeURIComponent(String(slug || "")).trim().toLowerCase();

  const formData = await req.formData().catch(() => null);
  const rawPasscode = normalizePasscode(String(formData?.get("passcode") || ""));
  const returnToRaw = String(formData?.get("returnTo") || "").trim();

  const fallbackReturnTo = `/s/${safeSlug}`;
  const returnTo =
    returnToRaw.startsWith("/s/") ? returnToRaw : fallbackReturnTo;

  if (!safeSlug) {
    return NextResponse.redirect(new URL("/", req.url), 303);
  }

  if (!/^[A-Za-z0-9]{2,30}$/.test(rawPasscode)) {
    return NextResponse.redirect(
      new URL(`${returnTo}?access=invalid`, req.url),
      303,
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: microsite, error } = await supabase
    .from("microsites")
    .select("slug, site_visibility, private_mode, passcode_hash")
    .eq("slug", safeSlug)
    .maybeSingle();

  if (error || !microsite) {
    return NextResponse.redirect(
      new URL(`${returnTo}?access=invalid`, req.url),
      303,
    );
  }

  const privateModeValue =
    typeof microsite.private_mode === "string"
      ? microsite.private_mode
      : microsite.private_mode === true
        ? "passcode"
        : "none";

  if (
    microsite.site_visibility !== "private" ||
    privateModeValue !== "passcode" ||
    !microsite.passcode_hash
  ) {
    return NextResponse.redirect(new URL(returnTo, req.url), 303);
  }

  const incomingHash = hashPasscode(rawPasscode);

  if (incomingHash !== microsite.passcode_hash) {
    return NextResponse.redirect(
      new URL(`${returnTo}?access=invalid`, req.url),
      303,
    );
  }

  const response = NextResponse.redirect(new URL(returnTo, req.url), 303);

  response.cookies.set(
    buildMicrositeAccessCookieName(safeSlug),
    buildMicrositeAccessCookieValue(safeSlug, microsite.passcode_hash),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  );

  return response;
}