import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const siteUrl = String(formData.get("siteUrl") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const deadline = String(formData.get("deadline") ?? "").trim();
    const file = formData.get("file");

    if (!name || !email || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const attachments =
      file instanceof File && file.size > 0
        ? [
            {
              filename: file.name,
              content: Buffer.from(await file.arrayBuffer()),
            },
          ]
        : undefined;

    const adminSend = await resend.emails.send({
      from: "Ko-Host <support@ko-host.com>",
      to: process.env.SUPPORT_EMAIL!,
      replyTo: email,
      subject: `New Custom Development Offer Request from ${name}`,
      attachments,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Ko-Host Custom Development Request</h2>

          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Site URL:</strong> ${escapeHtml(siteUrl || "N/A")}</p>
          <p><strong>Deadline:</strong> ${escapeHtml(deadline || "N/A")}</p>

          <p><strong>Design Description:</strong></p>
          <div style="white-space: pre-wrap;">${escapeHtml(description)}</div>

          <p style="margin-top: 20px;">
            <strong>Attachment:</strong> ${
              attachments ? "Included" : "None"
            }
          </p>
        </div>
      `,
    });

    if (adminSend.error) {
      console.error("Claim offer admin email error:", adminSend.error);

      return NextResponse.json(
        { error: "Failed to send request" },
        { status: 500 },
      );
    }

    const autoReply = await resend.emails.send({
      from: "Ko-Host Support <support@ko-host.com>",
      to: [email],
      subject: "We received your Ko-Host custom development request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi ${escapeHtml(name)},</p>

          <p>
            We received your custom development request. If we have any questions,
            we’ll contact you by email.
          </p>

          <p>
            Once your requested updates are complete, we’ll send confirmation to
            this email address.
          </p>

          <p><strong>Site URL:</strong> ${escapeHtml(siteUrl || "N/A")}</p>
          <p><strong>Deadline:</strong> ${escapeHtml(deadline || "N/A")}</p>

          <p><strong>Your design request:</strong></p>
          <div style="white-space: pre-wrap;">${escapeHtml(description)}</div>

          <p style="margin-top: 24px;">— Ko-Host</p>
        </div>
      `,
    });

    if (autoReply.error) {
      console.error("Claim offer auto-reply error:", autoReply.error);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Claim offer route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to submit request",
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