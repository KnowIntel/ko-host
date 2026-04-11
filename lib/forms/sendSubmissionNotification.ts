import { Resend } from "resend";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendSubmissionNotification({
  to,
  micrositeId,
  pageSlug,
  templateKey,
  designKey,
  fields,
}: {
  to: string;
  micrositeId: string;
  pageSlug?: string | null;
  templateKey?: string | null;
  designKey?: string | null;
  fields: Record<string, string>;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const resend = new Resend(resendApiKey);

  const rows = Object.entries(fields)
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;font-weight:600;">${escapeHtml(
            key,
          )}</td>
          <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(
            value || "",
          )}</td>
        </tr>
      `,
    )
    .join("");

  await resend.emails.send({
    from:
      process.env.FORM_NOTIFICATIONS_FROM_EMAIL ||
      "Ko-Host <onboarding@resend.dev>",
    to,
    subject: `New Ko-Host form submission${pageSlug ? ` — ${pageSlug}` : ""}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2 style="margin-bottom:16px;">New Form Submission</h2>

        <p><strong>Microsite ID:</strong> ${escapeHtml(micrositeId)}</p>
        <p><strong>Page Slug:</strong> ${escapeHtml(pageSlug || "-")}</p>
        <p><strong>Template:</strong> ${escapeHtml(templateKey || "-")}</p>
        <p><strong>Design:</strong> ${escapeHtml(designKey || "-")}</p>

        <table style="border-collapse:collapse;width:100%;margin-top:16px;">
          <tbody>${rows}</tbody>
        </table>
      </div>
    `,
  });
}