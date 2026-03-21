import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const message = String(body?.message ?? "").trim();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const sb = getSupabaseAdmin();

    const { data: inserted, error: insertError } = await sb
      .from("support_requests")
      .insert({
        name: name || null,
        email,
        message,
        source: "support-page",
        status: "new",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Support insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save support request" },
        { status: 500 },
      );
    }

    const adminSend = await resend.emails.send({
      from: "Ko-Host <support@ko-host.com>",
      to: process.env.SUPPORT_EMAIL!,
      replyTo: email,
      subject: `New Support Request from ${name || "User"}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>New Ko-Host Support Request</h2>
          <p><strong>Ticket ID:</strong> ${inserted.id}</p>
          <p><strong>Name:</strong> ${name || "N/A"}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="white-space: pre-wrap;">${escapeHtml(message)}</div>
        </div>
      `,
    });

    if (adminSend.error) {
      console.error("Admin resend error:", adminSend.error);
      return NextResponse.json(
        { error: "Failed to send support email" },
        { status: 500 },
      );
    }

    await sb
      .from("support_requests")
      .update({
        resend_message_id: adminSend.data?.id ?? null,
      })
      .eq("id", inserted.id);

    const autoReply = await resend.emails.send({
      from: "Ko-Host Support <support@ko-host.com>",
      to: [email],
      subject: "We received your Ko-Host support request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi ${escapeHtml(name || "there")},</p>
          <p>We received your support request and will get back to you as soon as possible.</p>
          <p><strong>Ticket ID:</strong> ${inserted.id}</p>
          <p><strong>Your message:</strong></p>
          <div style="white-space: pre-wrap;">${escapeHtml(message)}</div>
          <p style="margin-top: 24px;">— Ko-Host Support</p>
        </div>
      `,
    });

    if (autoReply.error) {
      console.error("Auto-reply resend error:", autoReply.error);
    }

    return NextResponse.json({
      success: true,
      ticketId: inserted.id,
    });
  } catch (error) {
    console.error("Support route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}