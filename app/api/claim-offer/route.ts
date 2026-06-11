// app\api\claim-offer\route.ts

import crypto from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);
const ATTACHMENT_BUCKET = "claim-offer-attachments";

function extractMicrositeSlug(value: string) {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) return "";

  try {
    const withProtocol =
      raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `https://${raw}`;

    const url = new URL(withProtocol);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname.endsWith(".ko-host.com")) {
      return hostname.replace(".ko-host.com", "").trim();
    }

    return "";
  } catch {
    return raw
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(".ko-host.com", "")
      .split("/")[0]
      .trim();
  }
}

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
  return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
}

if (!siteUrl) {
  return NextResponse.json(
    { error: "Please fill out the Microsite URL field." },
    { status: 400 },
  );
}

const micrositeSlug = extractMicrositeSlug(siteUrl);

if (!micrositeSlug) {
  return NextResponse.json(
    {
      error:
        "Please enter a valid Ko-Host microsite URL, such as yourname.ko-host.com.",
    },
    { status: 400 },
  );
}

const sb = getSupabaseAdmin();

const { data: microsite, error: micrositeError } = await sb
  .from("microsites")
  .select("id, slug, is_active, is_published, paid_until")
  .eq("slug", micrositeSlug)
  .maybeSingle();

if (micrositeError) {
  console.error("Claim offer microsite lookup error:", micrositeError);

  return NextResponse.json(
    { error: "Could not verify microsite purchase." },
    { status: 500 },
  );
}

const paidUntil = microsite?.paid_until
  ? new Date(String(microsite.paid_until))
  : null;

const isPaidActive =
  microsite !== null &&
  microsite.is_active !== false &&
  (!paidUntil || paidUntil.getTime() > Date.now());

if (!isPaidActive) {
  return NextResponse.json(
    {
      error:
        "You must first purchase a microsite before submitting a custom development request.",
    },
    { status: 403 },
  );
}

    let fileName: string | null = null;
    let filePath: string | null = null;
    let fileSize: number | null = null;
    let fileType: string | null = null;
    let fileBuffer: Buffer | null = null;

    if (file instanceof File && file.size > 0) {
      fileName = file.name;
      fileSize = file.size;
      fileType = file.type || "application/octet-stream";
      fileBuffer = Buffer.from(await file.arrayBuffer());

      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      filePath = `${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await sb.storage
        .from(ATTACHMENT_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType: fileType,
          upsert: false,
        });

      if (uploadError) {
        console.error("Claim offer upload error:", uploadError);
        return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 });
      }
    }

    const { data: inserted, error: insertError } = await sb
      .from("claim_offer_requests")
      .insert({
        name,
        email,
        site_url: siteUrl || null,
        description,
        deadline: deadline || null,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        file_type: fileType,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Claim offer insert error:", insertError);
      return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
    }

    const adminSend = await resend.emails.send({
      from: "Ko-Host <support@ko-host.com>",
      to: process.env.SUPPORT_EMAIL!,
      replyTo: email,
      subject: `New Custom Development Offer Request from ${name}`,
      attachments:
        fileBuffer && fileName
          ? [{ filename: fileName, content: fileBuffer }]
          : undefined,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Ko-Host Custom Development Request</h2>
          <p><strong>Request ID:</strong> ${inserted.id}</p>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Site URL:</strong> ${escapeHtml(siteUrl || "N/A")}</p>
          <p><strong>Deadline:</strong> ${escapeHtml(deadline || "N/A")}</p>
          <p><strong>Attachment:</strong> ${fileName ? escapeHtml(fileName) : "None"}</p>
          <p><strong>Design Description:</strong></p>
          <div style="white-space: pre-wrap;">${escapeHtml(description)}</div>
        </div>
      `,
    });

    if (adminSend.error) {
      console.error("Claim offer admin email error:", adminSend.error);
      return NextResponse.json(
        {
          error:
            typeof adminSend.error?.message === "string"
              ? adminSend.error.message
              : JSON.stringify(adminSend.error),
        },
        { status: 500 },
      );
    }

    await sb
      .from("claim_offer_requests")
      .update({ resend_message_id: adminSend.data?.id ?? null })
      .eq("id", inserted.id);

    await resend.emails.send({
      from: "Ko-Host Support <support@ko-host.com>",
      to: [email],
      subject: "We received your Ko-Host custom development request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi ${escapeHtml(name)},</p>
          <p>We received your custom development request. If we have any questions, we’ll contact you by email.</p>
          <p>Once your requested updates are complete, we’ll send confirmation to this email address.</p>
          <p><strong>Site URL:</strong> ${escapeHtml(siteUrl || "N/A")}</p>
          <p><strong>Deadline:</strong> ${escapeHtml(deadline || "N/A")}</p>
          <p><strong>Your design request:</strong></p>
          <div style="white-space: pre-wrap;">${escapeHtml(description)}</div>
          <p style="margin-top: 24px;">— Ko-Host</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, requestId: inserted.id });
  } catch (error) {
    console.error("Claim offer route error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit request" },
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