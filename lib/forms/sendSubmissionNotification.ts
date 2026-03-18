import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSubmissionNotification({
  to,
  pageId,
  pageSlug,
  templateKey,
  designKey,
  fields,
}: {
  to: string;
  pageId: string;
  pageSlug?: string | null;
  templateKey?: string | null;
  designKey?: string | null;
  fields: Record<string, string>;
}) {
  const rows = Object.entries(fields)
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;font-weight:600;">${key}</td>
          <td style="padding:8px;border:1px solid #ddd;">${value || ""}</td>
        </tr>
      `,
    )
    .join("");

  await resend.emails.send({
    from: process.env.FORM_NOTIFICATIONS_FROM_EMAIL || "Ko-Host <onboarding@resend.dev>",
    to,
    subject: `New Ko-Host form submission${pageSlug ? ` — ${pageSlug}` : ""}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2 style="margin-bottom:16px;">New Form Submission</h2>

        <p><strong>Page ID:</strong> ${pageId}</p>
        <p><strong>Page Slug:</strong> ${pageSlug || "-"}</p>
        <p><strong>Template:</strong> ${templateKey || "-"}</p>
        <p><strong>Design:</strong> ${designKey || "-"}</p>

        <table style="border-collapse:collapse;width:100%;margin-top:16px;">
          <tbody>${rows}</tbody>
        </table>
      </div>
    `,
  });
}