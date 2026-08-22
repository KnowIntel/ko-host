import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

const VALID_REQUEST_TYPES = new Set([
  "question",
  "technical_problem",
  "suggestion",
  "feature_request",
  "billing_account",
  "other",
]);

function requestTypeLabel(
  value: string,
) {
  switch (value) {
    case "question":
      return "Question";

    case "technical_problem":
      return "Technical Problem";

    case "suggestion":
      return "Suggestion";

    case "feature_request":
      return "Feature Request";

    case "billing_account":
      return "Billing / Account";

    default:
      return "Other";
  }
}

function normalizeOptionalSiteUrl(
  value: string,
) {
  const raw =
    String(value || "").trim();

  if (!raw) {
    return "";
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://")
  ) {
    return raw;
  }

  return `https://${raw}`;
}

export async function POST(
  req: Request,
) {
  try {
    const body =
      await req.json();

    const requestType =
      String(
        body.requestType ?? "",
      )
        .trim()
        .toLowerCase();

    const name =
      String(
        body.name ?? "",
      ).trim();

    const email =
      String(
        body.email ?? "",
      )
        .trim()
        .toLowerCase();

    const subject =
      String(
        body.subject ?? "",
      ).trim();

    const message =
      String(
        body.message ?? "",
      ).trim();

    const siteUrl =
      normalizeOptionalSiteUrl(
        String(
          body.siteUrl ?? "",
        ),
      );

    /*
     * ------------------------------------------------
     * VALIDATION
     * ------------------------------------------------
     */

    if (
      !requestType ||
      !VALID_REQUEST_TYPES.has(
        requestType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid request type.",
        },
        {
          status: 400,
        },
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Please enter your name.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Please enter your email address.",
        },
        {
          status: 400,
        },
      );
    }

    const looksLikeEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      );

    if (!looksLikeEmail) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          error:
            "Please enter a subject.",
        },
        {
          status: 400,
        },
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Please enter your message.",
        },
        {
          status: 400,
        },
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        {
          error:
            "Subject must be 200 characters or fewer.",
        },
        {
          status: 400,
        },
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Message must be 5,000 characters or fewer.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ------------------------------------------------
     * SAVE REQUEST
     * ------------------------------------------------
     */

    const supabase =
      getSupabaseAdmin();

    const {
      data: inserted,
      error: insertError,
    } = await supabase
      .from(
        "help_feedback_requests",
      )
      .insert({
        request_type:
          requestType,

        name,
        email,

        subject,
        message,

        site_url:
          siteUrl || null,

        status:
          "new",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(
        "Help feedback insert error:",
        insertError,
      );

      return NextResponse.json(
        {
          error:
            "We could not save your message. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    const requestLabel =
      requestTypeLabel(
        requestType,
      );

    /*
     * ------------------------------------------------
     * ADMIN EMAIL
     * ------------------------------------------------
     */

    const adminSend =
      await resend.emails.send({
        from:
          "Ko-Host Support <support@ko-host.com>",

        to:
          process.env.SUPPORT_EMAIL!,

        replyTo:
          email,

        subject:
          `[${requestLabel}] ${subject}`,

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717;">
            <h2>New Ko-Host Help & Feedback Request</h2>

            <p>
              <strong>Request ID:</strong>
              ${escapeHtml(inserted.id)}
            </p>

            <p>
              <strong>Type:</strong>
              ${escapeHtml(requestLabel)}
            </p>

            <p>
              <strong>Name:</strong>
              ${escapeHtml(name)}
            </p>

            <p>
              <strong>Email:</strong>
              ${escapeHtml(email)}
            </p>

            <p>
              <strong>Microsite:</strong>
              ${escapeHtml(siteUrl || "Not provided")}
            </p>

            <p>
              <strong>Subject:</strong>
              ${escapeHtml(subject)}
            </p>

            <p>
              <strong>Message:</strong>
            </p>

            <div
              style="
                white-space: pre-wrap;
                background: #f5f5f5;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                padding: 16px;
              "
            >${escapeHtml(message)}</div>

            <p style="margin-top: 24px;">
              Reply directly to this email to respond to ${escapeHtml(name)}.
            </p>
          </div>
        `,
      });

    if (adminSend.error) {
      /*
       * The request is already safely stored.
       * Do not make the customer's submission fail
       * just because the notification email failed.
       */
      console.error(
        "Help feedback admin email error:",
        adminSend.error,
      );
    } else {
      await supabase
        .from(
          "help_feedback_requests",
        )
        .update({
          resend_message_id:
            adminSend.data?.id ??
            null,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          inserted.id,
        );
    }

    /*
     * ------------------------------------------------
     * CUSTOMER CONFIRMATION
     * ------------------------------------------------
     */

    const customerSend =
      await resend.emails.send({
        from:
          "Ko-Host Support <support@ko-host.com>",

        to: [
          email,
        ],

        subject:
          "We received your Ko-Host message",

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717;">
            <p>
              Hi ${escapeHtml(name)},
            </p>

            <p>
              Thanks for reaching out to Ko-Host. We received your
              <strong>${escapeHtml(requestLabel.toLowerCase())}</strong>
              and will review it.
            </p>

            <p>
              If your message requires a response, we'll contact you at this email address.
            </p>

            <p>
              <strong>Request ID:</strong>
              ${escapeHtml(inserted.id)}
            </p>

            <p>
              <strong>Subject:</strong>
              ${escapeHtml(subject)}
            </p>

            ${
              siteUrl
                ? `
                  <p>
                    <strong>Microsite:</strong>
                    ${escapeHtml(siteUrl)}
                  </p>
                `
                : ""
            }

            <p>
              <strong>Your message:</strong>
            </p>

            <div
              style="
                white-space: pre-wrap;
                background: #f5f5f5;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                padding: 16px;
              "
            >${escapeHtml(message)}</div>

            <p style="margin-top: 24px;">
              — Ko-Host Support
            </p>
          </div>
        `,
      });

    if (customerSend.error) {
      console.error(
        "Help feedback confirmation email error:",
        customerSend.error,
      );
    }

    return NextResponse.json({
      success: true,

      requestId:
        inserted.id,
    });
  } catch (error) {
    console.error(
      "Help feedback route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit message.",
      },
      {
        status: 500,
      },
    );
  }
}

function escapeHtml(
  value: string,
) {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#39;",
    );
}