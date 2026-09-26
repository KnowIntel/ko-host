import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  MAILBOX_CODE_PATTERN,
  normalizeMailboxCode,
  buildMailboxAccessCookieName,
  buildMailboxAccessCookieValue,
  safeHashesMatch,
  mailboxIsExpired,
} from "@/lib/connect/mailboxAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

const VALID_REASONS = new Set([
  "harassment",
  "spam",
  "fraud_scam",
  "inappropriate_content",
  "unsafe_behavior",
  "other",
]);

function reasonLabel(value: string) {
  switch (value) {
    case "harassment":
      return "Harassment or threatening behavior";

    case "spam":
      return "Spam or unwanted solicitation";

    case "fraud_scam":
      return "Suspected fraud or scam";

    case "inappropriate_content":
      return "Inappropriate content";

    case "unsafe_behavior":
      return "Unsafe behavior or safety concern";

    default:
      return "Other";
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

export async function POST(req: Request) {
  try {
    const formData =
      await req.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json(
        {
          error: "Invalid report submission.",
        },
        {
          status: 400,
        },
      );
    }

    const mailboxCode =
      normalizeMailboxCode(
        String(
          formData.get("mailbox") || "",
        ),
      );

    const threadId = String(
      formData.get("thread") || "",
    ).trim();

    const reason = String(
      formData.get("reason") || "",
    )
      .trim()
      .toLowerCase();

    const details = String(
      formData.get("details") || "",
    ).trim();

    if (
      !MAILBOX_CODE_PATTERN.test(
        mailboxCode,
      ) ||
      !threadId
    ) {
      return NextResponse.json(
        {
          error: "Invalid report submission.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !reason ||
      !VALID_REASONS.has(reason)
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid report reason.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      details.length < 10 ||
      details.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Report details must be between 10 and 5,000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase =
      getSupabaseAdmin();

    /*
     * ------------------------------------------------
     * MAILBOX VALIDATION
     * ------------------------------------------------
     *
     * The mailbox code supplied by the browser is only
     * an identifier. It is NOT authentication.
     */
    const {
      data: mailbox,
      error: mailboxError,
    } = await supabase
      .from("connect_mailboxes")
      .select(
        `
          id,
          request_id,
          mailbox_code,
          pin_hash,
          status,
          expires_at
        `,
      )
      .eq(
        "mailbox_code",
        mailboxCode,
      )
      .maybeSingle();

    if (
      mailboxError ||
      !mailbox ||
      !mailbox.pin_hash ||
      mailbox.status !== "active" ||
      mailboxIsExpired(
        String(mailbox.expires_at),
        String(mailbox.status),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This mailbox is not available.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ------------------------------------------------
     * MAILBOX SESSION AUTHENTICATION
     * ------------------------------------------------
     *
     * Require the same HTTP-only authenticated mailbox
     * session established after successful PIN entry.
     */
    const cookieStore =
      await cookies();

    const incomingCookie =
      cookieStore.get(
        buildMailboxAccessCookieName(
          mailboxCode,
        ),
      )?.value ?? "";

    const expectedCookie =
      buildMailboxAccessCookieValue(
        mailboxCode,
        String(mailbox.pin_hash),
      );

    if (
      !incomingCookie ||
      !safeHashesMatch(
        incomingCookie,
        expectedCookie,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Mailbox authentication is required.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ------------------------------------------------
     * THREAD VALIDATION
     * ------------------------------------------------
     *
     * Never trust a thread/provider ID supplied by the
     * browser. The thread must belong to this exact
     * authenticated mailbox.
     */
    const {
      data: thread,
      error: threadError,
    } = await supabase
      .from(
        "connect_mailbox_threads",
      )
      .select(
        `
          id,
          mailbox_id,
          provider_microsite_id,
          status
        `,
      )
      .eq("id", threadId)
      .eq(
        "mailbox_id",
        mailbox.id,
      )
      .maybeSingle();

    if (
      threadError ||
      !thread ||
      !thread.provider_microsite_id
    ) {
      return NextResponse.json(
        {
          error:
            "This conversation could not be verified.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ------------------------------------------------
     * REQUEST + PROVIDER INFORMATION
     * ------------------------------------------------
     */
    const {
      data: requestRow,
      error: requestError,
    } = await supabase
      .from("connect_requests")
      .select(
        `
          id,
          request_code,
          service,
          notification_email
        `,
      )
      .eq(
        "id",
        mailbox.request_id,
      )
      .maybeSingle();

    if (
      requestError ||
      !requestRow
    ) {
      return NextResponse.json(
        {
          error:
            "The associated request could not be verified.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      data: provider,
    } = await supabase
      .from("microsites")
      .select(
        `
          id,
          title,
          slug
        `,
      )
      .eq(
        "id",
        thread.provider_microsite_id,
      )
      .maybeSingle();

    const providerName =
      provider?.title?.trim() ||
      "Ko-Host Provider";

    /*
     * ------------------------------------------------
     * BASIC DUPLICATE / SPAM GUARD
     * ------------------------------------------------
     *
     * Do not allow the same authenticated mailbox to
     * repeatedly create new reports against the same
     * provider conversation while an existing report
     * is still awaiting review.
     */
    const {
      data: existingReport,
      error: duplicateCheckError,
    } = await supabase
      .from("connect_user_reports")
      .select("id")
      .eq(
        "mailbox_id",
        mailbox.id,
      )
      .eq(
        "thread_id",
        thread.id,
      )
      .eq(
        "reported_by",
        "consumer",
      )
      .in(
        "status",
        ["new", "reviewing"],
      )
      .limit(1)
      .maybeSingle();

    if (duplicateCheckError) {
      console.error(
        "Connect report duplicate check failed:",
        duplicateCheckError,
      );

      return NextResponse.json(
        {
          error:
            "We could not verify this report. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    if (existingReport) {
      return NextResponse.json(
        {
          error:
            "A report for this conversation has already been submitted and is awaiting review.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ------------------------------------------------
     * SAVE REPORT
     * ------------------------------------------------
     *
     * mailbox_id, request_id and provider_microsite_id
     * are all derived server-side.
     */
    const {
      data: inserted,
      error: insertError,
    } = await supabase
      .from("connect_user_reports")
      .insert({
        mailbox_id:
          mailbox.id,

        request_id:
          mailbox.request_id,

        thread_id:
          thread.id,

        provider_microsite_id:
          thread.provider_microsite_id,

        reported_by:
          "consumer",

        reason,

        details,

        status:
          "new",
      })
      .select("id")
      .single();

    if (
      insertError ||
      !inserted
    ) {
      console.error(
        "Connect user report insert failed:",
        insertError,
      );

      return NextResponse.json(
        {
          error:
            "We could not save your report. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ------------------------------------------------
     * ADMIN NOTIFICATION
     * ------------------------------------------------
     *
     * The report is already safely stored at this point.
     * Email failure must not undo the report.
     */
    const reportLabel =
      reasonLabel(reason);

    const consumerEmail =
      String(
        requestRow.notification_email ||
          "",
      ).trim();

    const adminSend =
      await resend.emails.send({
        from:
          "Ko-Host Support <support@ko-host.com>",

        to:
          process.env.SUPPORT_EMAIL!,

        ...(consumerEmail
          ? {
              replyTo:
                consumerEmail,
            }
          : {}),

        subject:
          `[Connect User Report] ${reportLabel}`,

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717;">
            <h2>New Ko-Host Connect User Report</h2>

            <p>
              <strong>Report ID:</strong>
              ${escapeHtml(inserted.id)}
            </p>

            <p>
              <strong>Request:</strong>
              ${escapeHtml(
                String(
                  requestRow.request_code,
                ),
              )}
            </p>

            <p>
              <strong>Service:</strong>
              ${escapeHtml(
                String(
                  requestRow.service,
                ),
              )}
            </p>

            <p>
              <strong>Reported provider:</strong>
              ${escapeHtml(providerName)}
            </p>

            <p>
              <strong>Provider microsite ID:</strong>
              ${escapeHtml(
                String(
                  thread.provider_microsite_id,
                ),
              )}
            </p>

            <p>
              <strong>Mailbox ID:</strong>
              ${escapeHtml(
                String(mailbox.id),
              )}
            </p>

            <p>
              <strong>Thread ID:</strong>
              ${escapeHtml(
                String(thread.id),
              )}
            </p>

            <p>
              <strong>Consumer notification email:</strong>
              ${escapeHtml(
                consumerEmail ||
                  "Not provided",
              )}
            </p>

            <p>
              <strong>Reason:</strong>
              ${escapeHtml(reportLabel)}
            </p>

            <p>
              <strong>Report details:</strong>
            </p>

            <div
              style="
                white-space: pre-wrap;
                background: #f5f5f5;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                padding: 16px;
              "
            >${escapeHtml(details)}</div>

            <p style="margin-top: 24px;">
              This report was submitted from an authenticated
              Ko-Host Connect consumer mailbox.
            </p>
          </div>
        `,
      });

    if (adminSend.error) {
      console.error(
        "Connect user report admin email failed:",
        adminSend.error,
      );
    }

    /*
     * Return to the secured report page. That page will
     * authenticate the mailbox again before displaying
     * the success state.
     */
    const successUrl =
      new URL(
        "/connect/report",
        req.url,
      );

    successUrl.searchParams.set(
      "mailbox",
      mailboxCode,
    );

    successUrl.searchParams.set(
      "thread",
      thread.id,
    );

    successUrl.searchParams.set(
      "submitted",
      "1",
    );

    return NextResponse.redirect(
      successUrl,
      303,
    );
  } catch (error) {
    console.error(
      "Connect user report route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "We could not submit your report. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}