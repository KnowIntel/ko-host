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

function hashPasscode(passcode: string) {
  return crypto.createHash("sha256").update(passcode).digest("hex");
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const safeSlug = decodeURIComponent(String(slug || "")).trim().toLowerCase();

  const body = await req.json().catch(() => null);
  const rawPasscode = normalizePasscode(String(body?.passcode || ""));

  if (!safeSlug) {
    return NextResponse.json(
      { ok: false, error: "Missing microsite slug." },
      { status: 400 },
    );
  }

  if (!/^[A-Za-z0-9]{2,30}$/.test(rawPasscode)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Enter a valid passcode using 2-30 letters and numbers.",
      },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: microsite, error } = await supabase
    .from("microsites")
    .select("slug, site_visibility, private_mode, passcode_hash")
    .eq("slug", safeSlug)
    .maybeSingle();

  if (error || !microsite) {
    return NextResponse.json(
      { ok: false, error: "Microsite not found." },
      { status: 404 },
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
    return NextResponse.json(
      { ok: false, error: "This microsite does not require a passcode." },
      { status: 400 },
    );
  }

  const incomingHash = hashPasscode(rawPasscode);

  if (incomingHash !== microsite.passcode_hash) {
    return NextResponse.json(
      { ok: false, error: "Invalid passcode." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });

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