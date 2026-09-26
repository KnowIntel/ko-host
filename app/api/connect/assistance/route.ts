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

const VALID_ASSISTANCE_TYPES = new Set([
  "question",
  "conversation_concern",
  "provider_issue",
  "technical_problem",
  "other",
]);

function assistanceTypeLabel(value: string) {
  switch (value) {
    case "question":
      return "General question";

    case "conversation_concern":
      return "Question or concern about conversation";

    case "provider_issue":
      return "Help with provider";

    case "technical_problem":
      return "Technical problem";

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
          error:
            "Invalid assistance request.",
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

    const assistanceType = String(
      formData.get("assistance_type") || "",
    )
      .trim()
      .toLowerCase();

    const message = String(
      formData.get("message") || "",
    ).trim();

    if (
      !MAILBOX_CODE_PATTERN.test(
        mailboxCode,
      ) ||
      !threadId
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid assistance request.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !assistanceType ||
      !VALID_ASSISTANCE_TYPES.has(
        assistanceType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid assistance type.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      message.length < 10 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Message must be between 10 and 5,000 characters.",
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
     * The mailbox code identifies the mailbox.
     * It does NOT authenticate the consumer.
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
     * The supplied thread must belong to this exact
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
     * Prevent repeated unresolved assistance submissions
     * for the same conversation.
     */
    const {
      data: existingRequests,
      error: duplicateCheckError,
    } = await supabase
      .from(
        "connect_assistance_requests",
      )
      .select("id")
      .eq(
        "mailbox_id",
        mailbox.id,
      )
      .eq(
        "thread_id",
        thread.id,
      )
      .in(
        "status",
        ["new", "reviewing"],
      )
      .limit(1);

    if (duplicateCheckError) {
      console.error(
        "Connect assistance duplicate check failed:",
        duplicateCheckError,
      );

      return NextResponse.json(
        {
          error:
            "We could not verify this assistance request. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      existingRequests &&
      existingRequests.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "An assistance request for this conversation is already awaiting review.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ------------------------------------------------
     * SAVE ASSISTANCE REQUEST
     * ------------------------------------------------
     *
     * All relationship IDs are derived or verified
     * server-side.
     */
    const {
      data: inserted,
      error: insertError,
    } = await supabase
      .from(
        "connect_assistance_requests",
      )
      .insert({
        mailbox_id:
          mailbox.id,

        request_id:
          mailbox.request_id,

        thread_id:
          thread.id,

        provider_microsite_id:
          thread.provider_microsite_id,

        assistance_type:
          assistanceType,

        message,

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
        "Connect assistance insert failed:",
        insertError,
      );

      return NextResponse.json(
        {
          error:
            "We could not save your assistance request. Please try again.",
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
     * Database storage happens first. Email failure does
     * not discard the assistance request.
     */
    const assistanceLabel =
      assistanceTypeLabel(
        assistanceType,
      );

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
          `[Connect Assistance] ${assistanceLabel}`,

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717;">
            <h2>New Ko-Host Connect Assistance Request</h2>

            <p>
              <strong>Assistance ID:</strong>
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
              <strong>Provider:</strong>
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
              <strong>Assistance type:</strong>
              ${escapeHtml(
                assistanceLabel,
              )}
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
              This assistance request was submitted from an
              authenticated Ko-Host Connect consumer mailbox.
            </p>
          </div>
        `,
      });

    if (adminSend.error) {
      console.error(
        "Connect assistance admin email failed:",
        adminSend.error,
      );
    }

    /*
     * Return to the secured Assistance page.
     */
    const successUrl =
      new URL(
        "/connect/assistance",
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
      "Connect assistance route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "We could not submit your assistance request. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}