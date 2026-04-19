// app/api/dashboard/microsites/[id]/send-email/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 },
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing microsite id" },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => null);

    const subject =
      body && typeof body === "object" && typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      body && typeof body === "object" && typeof body.message === "string"
        ? body.message.trim()
        : "";

    const requestedRecipients =
      body &&
      typeof body === "object" &&
      Array.isArray(body.recipients)
        ? body.recipients
.filter((item: unknown): item is string => typeof item === "string")
.map((item: string) => item.trim().toLowerCase())
            .filter(Boolean)
        : [];

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required." },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    if (!requestedRecipients.length) {
      return NextResponse.json(
        { error: "Select at least one recipient." },
        { status: 400 },
      );
    }

    const { data: microsite, error: micrositeError } = await supabase
      .from("microsites")
      .select("id, slug, title, owner_clerk_user_id")
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .maybeSingle();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found." },
        { status: 404 },
      );
    }

    const { data: cartRows, error: cartError } = await supabase
      .from("cart_checkouts")
      .select("buyer_email")
      .eq("slug", microsite.slug)
      .not("buyer_email", "is", null);

    if (cartError) {
      return NextResponse.json(
        { error: "Failed to load buyer emails." },
        { status: 500 },
      );
    }

    const { data: donationRows, error: donationError } = await supabase
      .from("donation_checkouts")
      .select("buyer_email")
      .eq("microsite_id", microsite.id)
      .not("buyer_email", "is", null);

    if (donationError) {
      return NextResponse.json(
        { error: "Failed to load donor emails." },
        { status: 500 },
      );
    }

    const emailSet = new Set<string>();

    for (const row of cartRows ?? []) {
      const email =
        typeof row?.buyer_email === "string" ? row.buyer_email.trim() : "";
      if (email) emailSet.add(email.toLowerCase());
    }

    for (const row of donationRows ?? []) {
      const email =
        typeof row?.buyer_email === "string" ? row.buyer_email.trim() : "";
      if (email) emailSet.add(email.toLowerCase());
    }

const allowedRecipients = Array.from(emailSet);


if (!allowedRecipients.length) {
  return NextResponse.json(
    { error: "No recipient emails found for this microsite." },
    { status: 400 },
  );
}

const allowedRecipientSet = new Set(allowedRecipients);

const recipients = requestedRecipients.filter((email: string) =>
  allowedRecipientSet.has(email),
);

    if (!recipients.length) {
      return NextResponse.json(
        { error: "None of the selected recipients are valid for this microsite." },
        { status: 400 },
      );
    }

    const siteTitle = microsite.title?.trim() || microsite.slug || "Ko-Host Site";

    const html = `
<div style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;">
    <div style="background:#000;color:#fff;padding:16px 20px;">
      <div style="font-size:18px;font-weight:bold;">
        ${siteTitle}
      </div>
      <div style="font-size:12px;opacity:0.7;">
        Powered by Ko-Host
      </div>
    </div>

    <div style="padding:20px;">
      <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;color:#111827;">
${message}
      </div>

      <p style="margin-top:20px;font-size:12px;color:#666;">
        Sent regarding ${siteTitle}
      </p>
    </div>
  </div>
</div>
`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${siteTitle} <no-reply@ko-host.com>`,
        to: "no-reply@ko-host.com",
        bcc: recipients,
        subject,
        html,
      }),
    });

    const resendPayload = await resendRes.json().catch(() => null);

    if (!resendRes.ok) {
      console.error("RESEND BULK EMAIL ERROR", {
        status: resendRes.status,
        resendPayload,
      });

      return NextResponse.json(
        {
          error:
            resendPayload?.message ||
            resendPayload?.error ||
            "Failed to send email.",
        },
        { status: 500 },
      );
    }

return NextResponse.json({
  ok: true,
  recipientCount: recipients.length,
});
} catch (error) {
  console.error("SEND EMAIL API ERROR", error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Unexpected server error",
      details: error,
    },
    { status: 500 },
  );
}
}