// app\api\connect\mailbox\[code]\access\route.ts

import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  MAILBOX_CODE_PATTERN,
  normalizeMailboxCode,
  buildMailboxAccessCookieName,
  buildMailboxAccessCookieValue,
  safeHashesMatch,
  mailboxIsExpired,
} from "@/lib/connect/mailboxAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAILBOX_PIN_PATTERN = /^\d{6}$/;

// Keep the authenticated browser session short-lived.
// The mailbox itself currently exists for 30 days.
const MAILBOX_SESSION_MAX_AGE = 60 * 60 * 12;

function normalizeMailboxPin(input: string) {
  return String(input || "")
    .trim()
    .replace(/\D/g, "")
    .slice(0, 6);
}

function hashMailboxPin(pin: string) {
  return crypto
    .createHash("sha256")
    .update(pin, "utf8")
    .digest("hex");
}


export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      code: string;
    }>;
  },
) {
  const { code } = await params;

  const safeCode = normalizeMailboxCode(
    decodeURIComponent(String(code || "")),
  );

  const fallbackReturnTo = `/mailbox/${encodeURIComponent(
    safeCode,
  )}`;

  /*
   * Reject malformed mailbox URLs before touching Supabase.
   */
  if (!MAILBOX_CODE_PATTERN.test(safeCode)) {
    return NextResponse.redirect(
      new URL("/connect", req.url),
      303,
    );
  }

  const formData = await req.formData().catch(() => null);

  const pin = normalizeMailboxPin(
    String(formData?.get("pin") || ""),
  );

  const returnToRaw = String(
    formData?.get("returnTo") || "",
  ).trim();

  /*
   * Only allow this form to redirect back into the mailbox
   * route for the mailbox being authenticated.
   *
   * Do not trust arbitrary returnTo values from the browser.
   */
  const expectedReturnTo =
    `/mailbox/${safeCode}`;

  const returnTo =
    returnToRaw === expectedReturnTo
      ? returnToRaw
      : fallbackReturnTo;

  if (!MAILBOX_PIN_PATTERN.test(pin)) {
    return NextResponse.redirect(
      new URL(
        `${returnTo}?access=invalid`,
        req.url,
      ),
      303,
    );
  }

  const supabase = getSupabaseAdmin();

  /*
   * The consumer never receives direct database access.
   * Verification happens server-side through the service
   * role client.
   */
  const {
    data: mailbox,
    error,
  } = await supabase
    .from("connect_mailboxes")
    .select(
      `
        id,
        mailbox_code,
        pin_hash,
        status,
        expires_at
      `,
    )
    .eq("mailbox_code", safeCode)
    .maybeSingle();

  /*
   * Deliberately return the same result for:
   * - mailbox not found
   * - database lookup failure
   * - incorrect PIN
   *
   * This avoids exposing useful mailbox/account information
   * through the authentication response.
   */
  if (
    error ||
    !mailbox ||
    !mailbox.pin_hash
  ) {
    return NextResponse.redirect(
      new URL(
        `${returnTo}?access=invalid`,
        req.url,
      ),
      303,
    );
  }

  /*
   * Do not allow authentication into a closed or expired
   * mailbox.
   */
const mailboxExpired = mailboxIsExpired(
  String(mailbox.expires_at),
  String(mailbox.status),
);

  if (mailboxExpired) {
    /*
     * Keep the stored status synchronized when expiration
     * is detected during access.
     */
    if (mailbox.status !== "expired") {
      await supabase
        .from("connect_mailboxes")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", mailbox.id);
    }

    return NextResponse.redirect(
      new URL(
        `${returnTo}?access=expired`,
        req.url,
      ),
      303,
    );
  }

  if (mailbox.status !== "active") {
    return NextResponse.redirect(
      new URL(
        `${returnTo}?access=unavailable`,
        req.url,
      ),
      303,
    );
  }

  /*
   * Compare the submitted PIN against the stored hash.
   */
  const incomingPinHash =
    hashMailboxPin(pin);

  if (
    !safeHashesMatch(
      incomingPinHash,
      String(mailbox.pin_hash),
    )
  ) {
    return NextResponse.redirect(
      new URL(
        `${returnTo}?access=invalid`,
        req.url,
      ),
      303,
    );
  }

  /*
   * Successful authentication.
   *
   * The cookie contains neither the raw PIN nor its raw
   * database hash. It contains a deterministic derivative
   * that the mailbox page can independently recreate after
   * loading the mailbox server-side.
   */
  const response = NextResponse.redirect(
    new URL(returnTo, req.url),
    303,
  );

response.cookies.set(
  buildMailboxAccessCookieName(safeCode),
  buildMailboxAccessCookieValue(
    safeCode,
    String(mailbox.pin_hash),
  ),
  {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAILBOX_SESSION_MAX_AGE,
  },
);

  return response;
}