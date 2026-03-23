// app/api/microsites/verify-passcode/route.ts
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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

function normalizeSlug(value: string) {
  return String(value || "").trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const slug = normalizeSlug(body?.slug || "");
    const passcode = String(body?.passcode || "").trim();

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Missing slug." },
        { status: 400 },
      );
    }

    if (!/^[A-Za-z0-9]{2,30}$/.test(passcode)) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid passcode." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("microsites")
      .select("slug, passcode_hash, site_visibility, private_mode")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Microsite not found." },
        { status: 404 },
      );
    }

    const isPrivate = data.site_visibility === "private" || data.private_mode;

    if (!isPrivate) {
      return NextResponse.json({ ok: true });
    }

    if (!data.passcode_hash) {
      return NextResponse.json(
        { ok: false, error: "This microsite is not configured for passcode access." },
        { status: 400 },
      );
    }

    const providedHash = hashPasscode(passcode);

    if (providedHash !== data.passcode_hash) {
      return NextResponse.json(
        { ok: false, error: "Invalid passcode." },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(
      buildMicrositeAccessCookieName(slug),
      buildMicrositeAccessCookieValue(slug, data.passcode_hash),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: `/s/${slug}`,
        maxAge: 60 * 60 * 12,
      },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}