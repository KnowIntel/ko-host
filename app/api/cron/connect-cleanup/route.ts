// app/api/cron/connect-cleanup/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";
import { Resend } from "resend";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

type ReminderType =
  | "3_day"
  | "2_day"
  | "1_day";

type ReminderMailbox = {
  id: string;
  request_id: string;
  mailbox_code: string;
  expires_at: string;
  reminder_3_day_sent_at: string | null;
  reminder_2_day_sent_at: string | null;
  reminder_1_day_sent_at: string | null;
};

type RequestRow = {
  id: string;
  request_code: string;
  service: string;
  notification_email: string | null;
};

function getReminderType(
  mailbox: ReminderMailbox,
  nowMs: number,
): ReminderType | null {
  const expiresAtMs =
    new Date(mailbox.expires_at).getTime();

  if (!Number.isFinite(expiresAtMs)) {
    return null;
  }

  const remainingMs =
    expiresAtMs - nowMs;

  const oneDayMs =
    24 * 60 * 60 * 1000;

  /*
   * Reminder windows:
   *
   * 3-day: 48–72 hours remaining
   * 2-day: 24–48 hours remaining
   * 1-day:  0–24 hours remaining
   *
   * Each reminder has its own sent timestamp so repeated
   * cron runs inside the same window do not resend it.
   */

  if (
    remainingMs > 2 * oneDayMs &&
    remainingMs <= 3 * oneDayMs &&
    !mailbox.reminder_3_day_sent_at
  ) {
    return "3_day";
  }

  if (
    remainingMs > oneDayMs &&
    remainingMs <= 2 * oneDayMs &&
    !mailbox.reminder_2_day_sent_at
  ) {
    return "2_day";
  }

  if (
    remainingMs > 0 &&
    remainingMs <= oneDayMs &&
    !mailbox.reminder_1_day_sent_at
  ) {
    return "1_day";
  }

  return null;
}

function reminderLabel(
  type: ReminderType,
) {
  switch (type) {
    case "3_day":
      return "3 days";

    case "2_day":
      return "2 days";

    case "1_day":
      return "1 day";
  }
}

function reminderColumn(
  type: ReminderType,
) {
  switch (type) {
    case "3_day":
      return "reminder_3_day_sent_at";

    case "2_day":
      return "reminder_2_day_sent_at";

    case "1_day":
      return "reminder_1_day_sent_at";
  }
}

function formatExpirationDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "soon";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function GET(
  request: NextRequest,
) {
  const authorization =
    request.headers.get(
      "authorization",
    );

  const expectedAuthorization =
    `Bearer ${process.env.CRON_SECRET}`;

  if (
    !process.env.CRON_SECRET ||
    authorization !==
      expectedAuthorization
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const sb =
    getSupabaseAdmin();

  const nowDate =
    new Date();

  const now =
    nowDate.toISOString();

  const nowMs =
    nowDate.getTime();

  let remindersSent = 0;
  let reminderFailures = 0;

  try {
    // =====================================================
    // Send mailbox expiration reminders
    // =====================================================

    const reminderWindowEnd =
      new Date(
        nowMs +
          3 *
            24 *
            60 *
            60 *
            1000,
      ).toISOString();

    const {
      data: reminderMailboxes,
      error: reminderMailboxError,
    } = await sb
      .from("connect_mailboxes")
      .select(
        `
          id,
          request_id,
          mailbox_code,
          expires_at,
          reminder_3_day_sent_at,
          reminder_2_day_sent_at,
          reminder_1_day_sent_at
        `,
      )
      .eq("status", "active")
      .gt("expires_at", now)
      .lte(
        "expires_at",
        reminderWindowEnd,
      )
      .limit(500);

    if (reminderMailboxError) {
      throw reminderMailboxError;
    }

    const mailboxesNeedingReminder =
      (
        reminderMailboxes ??
        []
      )
        .map((mailbox) => ({
          mailbox:
            mailbox as ReminderMailbox,

          reminderType:
            getReminderType(
              mailbox as ReminderMailbox,
              nowMs,
            ),
        }))
        .filter(
          (
            item,
          ): item is {
            mailbox: ReminderMailbox;
            reminderType: ReminderType;
          } =>
            item.reminderType !==
            null,
        );

    if (
      mailboxesNeedingReminder.length >
      0
    ) {
      const reminderRequestIds =
        Array.from(
          new Set(
            mailboxesNeedingReminder.map(
              (item) =>
                item.mailbox
                  .request_id,
            ),
          ),
        );

      const {
        data: reminderRequests,
        error: reminderRequestError,
      } = await sb
        .from("connect_requests")
        .select(
          `
            id,
            request_code,
            service,
            notification_email
          `,
        )
        .in(
          "id",
          reminderRequestIds,
        );

      if (reminderRequestError) {
        throw reminderRequestError;
      }

      const requestsById =
        new Map<
          string,
          RequestRow
        >(
          (
            reminderRequests ??
            []
          ).map((row) => [
            String(row.id),
            row as RequestRow,
          ]),
        );

      for (
        const {
          mailbox,
          reminderType,
        } of
        mailboxesNeedingReminder
      ) {
        const requestRow =
          requestsById.get(
            mailbox.request_id,
          );

        if (!requestRow) {
          console.error(
            "Connect reminder request not found:",
            mailbox.request_id,
          );

          reminderFailures += 1;
          continue;
        }

        const notificationEmail =
          String(
            requestRow.notification_email ||
              "",
          ).trim();

        /*
         * No notification email means there is nowhere
         * to send a reminder. Leave the timestamp unset.
         */
        if (!notificationEmail) {
          continue;
        }

        const mailboxUrl =
          `${request.nextUrl.origin}/mailbox/${mailbox.mailbox_code}`;

        const timeRemaining =
          reminderLabel(
            reminderType,
          );

        const expirationDate =
          formatExpirationDate(
            mailbox.expires_at,
          );

        const isFinalReminder =
          reminderType ===
          "1_day";

        try {
          const reminderSend =
            await resend.emails.send({
              from:
                "Ko-Host Connect <support@ko-host.com>",

              to: [
                notificationEmail,
              ],

              subject:
                isFinalReminder
                  ? `Final reminder: Your Ko-Host Connect mailbox expires in 1 day`
                  : `Reminder: Your Ko-Host Connect mailbox expires in ${timeRemaining}`,

              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto;">
                  <h2 style="margin-bottom: 8px;">
                    ${
                      isFinalReminder
                        ? "Your Ko-Host Connect mailbox expires tomorrow"
                        : `Your Ko-Host Connect mailbox expires in ${timeRemaining}`
                    }
                  </h2>

                  <p>
                    This is a reminder that your private Ko-Host Connect mailbox for
                    <strong>${escapeHtml(
                      requestRow.service,
                    )}</strong>
                    is approaching its expiration date.
                  </p>

                  <div style="margin: 24px 0; padding: 20px; background: #f5f5f4; border-radius: 12px;">
                    <p style="margin: 0 0 8px;">
                      <strong>Service:</strong>
                      ${escapeHtml(
                        requestRow.service,
                      )}
                    </p>

                    <p style="margin: 0 0 8px;">
                      <strong>Request Code:</strong>
                      ${escapeHtml(
                        requestRow.request_code,
                      )}
                    </p>

                    <p style="margin: 0;">
                      <strong>Mailbox expiration:</strong>
                      ${escapeHtml(
                        expirationDate,
                      )}
                    </p>
                  </div>

                  <p>
                    After your mailbox expires, this request and its private
                    provider conversations will no longer be available.
                  </p>

                  <p>
                    If you still need information from your conversations,
                    please review your mailbox before it expires.
                  </p>

                  <div style="margin-top: 28px;">
                    <a
                      href="${mailboxUrl}"
                      style="display: inline-block; background: #171717; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 999px; font-weight: bold;"
                    >
                      Open My Mailbox
                    </a>
                  </div>

                  <p style="margin-top: 24px; color: #737373; font-size: 13px;">
                    For your security, this reminder does not include your
                    mailbox PIN. Use the PIN provided when your Connect request
                    was originally submitted.
                  </p>

                  <p style="margin-top: 24px;">
                    — Ko-Host Connect
                  </p>
                </div>
              `,
            });

          if (reminderSend.error) {
            console.error(
              `Connect ${reminderType} expiration reminder failed:`,
              reminderSend.error,
            );

            reminderFailures += 1;
            continue;
          }

          /*
           * Only mark the reminder as sent after Resend
           * successfully accepts the email.
           */
          const sentColumn =
            reminderColumn(
              reminderType,
            );

          const {
            error: reminderUpdateError,
          } = await sb
            .from(
              "connect_mailboxes",
            )
            .update({
              [sentColumn]:
                new Date().toISOString(),
            })
            .eq(
              "id",
              mailbox.id,
            )
            .is(
              sentColumn,
              null,
            );

          if (
            reminderUpdateError
          ) {
            console.error(
              `Connect ${reminderType} reminder timestamp update failed:`,
              reminderUpdateError,
            );

            reminderFailures += 1;
            continue;
          }

          remindersSent += 1;
        } catch (
          reminderEmailError
        ) {
          console.error(
            `Connect ${reminderType} expiration reminder failed:`,
            reminderEmailError,
          );

          reminderFailures += 1;
        }
      }
    }

    // =====================================================
    // Find requests whose mailboxes have expired
    // =====================================================

    const {
      data: expiredMailboxes,
      error: mailboxError,
    } = await sb
      .from("connect_mailboxes")
      .select(
        "id, request_id, mailbox_code, expires_at",
      )
      .lte("expires_at", now)
      .limit(500);

    if (mailboxError) {
      throw mailboxError;
    }

    if (!expiredMailboxes?.length) {
      return NextResponse.json({
        ok: true,
        remindersSent,
        reminderFailures,
        deletedRequests: 0,
        deletedPhotos: 0,
        message:
          "Connect cleanup completed. No expired mailboxes found.",
      });
    }

    const requestIds =
      Array.from(
        new Set(
          expiredMailboxes.map(
            (mailbox) =>
              mailbox.request_id,
          ),
        ),
      );

    // =====================================================
    // Load private photo paths before deleting DB records
    // =====================================================

    const {
      data: photoRows,
      error: photoError,
    } = await sb
      .from(
        "connect_request_photos",
      )
      .select(
        "request_id, storage_path",
      )
      .in(
        "request_id",
        requestIds,
      );

    if (photoError) {
      throw photoError;
    }

    const storagePaths =
      Array.from(
        new Set(
          (
            photoRows ?? []
          )
            .map(
              (photo) =>
                photo.storage_path,
            )
            .filter(
              (
                path,
              ): path is string =>
                typeof path ===
                  "string" &&
                path.length > 0,
            ),
        ),
      );

    // =====================================================
    // Delete private Storage objects first
    // =====================================================

    if (
      storagePaths.length > 0
    ) {
      const {
        error: storageError,
      } = await sb.storage
        .from(
          "connect-request-images",
        )
        .remove(
          storagePaths,
        );

      if (storageError) {
        throw storageError;
      }
    }

    // =====================================================
    // Delete expired requests
    //
    // Foreign-key cascades remove:
    // - photo metadata
    // - mailbox
    // - mailbox threads/messages
    // - request matches
    // - Connect reports
    // - Connect assistance requests
    // =====================================================

    const {
      data: deletedRequests,
      error: deleteError,
    } = await sb
      .from("connect_requests")
      .delete()
      .in(
        "id",
        requestIds,
      )
      .select("id");

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      ok: true,
      remindersSent,
      reminderFailures,
      deletedRequests:
        deletedRequests?.length ??
        0,
      deletedPhotos:
        storagePaths.length,
    });
  } catch (error) {
    console.error(
      "Connect cleanup failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        remindersSent,
        reminderFailures,
        error:
          "Connect cleanup failed.",
      },
      {
        status: 500,
      },
    );
  }
}