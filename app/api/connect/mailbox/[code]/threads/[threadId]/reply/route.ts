import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MailboxRow = {
  id: string;
  mailbox_code: string;
  pin_hash: string;
  status: string;
  expires_at: string;
};

type ThreadRow = {
  id: string;
  mailbox_id: string;
  status: "active" | "closed";
};

function normalizeMailboxCode(
  input: string,
) {
  return String(input || "")
    .trim()
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 10);
}

function buildMailboxAccessCookieName(
  mailboxCode: string,
) {
  return `khc_mailbox_${mailboxCode}`;
}

function buildMailboxAccessCookieValue(
  mailboxCode: string,
  pinHash: string,
) {
  return crypto
    .createHash("sha256")
    .update(
      `${mailboxCode}:${pinHash}`,
    )
    .digest("hex");
}

function safeValuesMatch(
  incomingValue: string,
  expectedValue: string,
) {
  try {
    const incomingBuffer =
      Buffer.from(
        incomingValue,
        "hex",
      );

    const expectedBuffer =
      Buffer.from(
        expectedValue,
        "hex",
      );

    if (
      incomingBuffer.length === 0 ||
      incomingBuffer.length !==
        expectedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      incomingBuffer,
      expectedBuffer,
    );
  } catch {
    return false;
  }
}

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      code: string;
      threadId: string;
    }>;
  },
) {
  try {
    const {
      code,
      threadId,
    } = await params;

    const mailboxCode =
      normalizeMailboxCode(
        decodeURIComponent(
          String(code || ""),
        ),
      );

    if (
      !/^[A-Za-z0-9]{10}$/.test(
        mailboxCode,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Mailbox not available",
        },
        { status: 404 },
      );
    }

    const formData =
      await req.formData();

    const message = String(
      formData.get("message") ?? "",
    ).trim();

    if (!message) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Message is required",
        },
        { status: 400 },
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Message must be 5,000 characters or less",
        },
        { status: 400 },
      );
    }

    const supabase =
      getSupabaseAdmin();

    /*
     * Load the mailbox.
     *
     * We need pin_hash only on the
     * server so we can verify the
     * HttpOnly access session.
     */
    const {
      data: mailboxData,
      error: mailboxError,
    } = await supabase
      .from("connect_mailboxes")
      .select(
        [
          "id",
          "mailbox_code",
          "pin_hash",
          "status",
          "expires_at",
        ].join(","),
      )
      .eq(
        "mailbox_code",
        mailboxCode,
      )
      .maybeSingle();

    const mailbox =
      mailboxData as unknown as
        | MailboxRow
        | null;

    if (
      mailboxError ||
      !mailbox
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Mailbox not available",
        },
        { status: 404 },
      );
    }

    /*
     * Verify mailbox expiration before
     * accepting a message.
     */
    const expiresAt =
      new Date(
        mailbox.expires_at,
      ).getTime();

    const isExpired =
      !Number.isFinite(
        expiresAt,
      ) ||
      expiresAt <= Date.now();

    if (
      mailbox.status !== "active" ||
      isExpired
    ) {
      if (
        mailbox.status === "active" &&
        isExpired
      ) {
        const nowIso =
          new Date().toISOString();

        const {
          error: expireError,
        } = await supabase
          .from(
            "connect_mailboxes",
          )
          .update({
            status: "expired",
            updated_at: nowIso,
          })
          .eq("id", mailbox.id)
          .eq(
            "status",
            "active",
          );

        if (expireError) {
          console.error(
            "Connect mailbox expiration update failed",
            {
              mailboxId:
                mailbox.id,
              expireError,
            },
          );
        }
      }

      return NextResponse.redirect(
        new URL(
          `/mailbox/${encodeURIComponent(
            mailboxCode,
          )}?access=expired`,
          req.url,
        ),
        303,
      );
    }

    /*
     * Verify the existing mailbox
     * access cookie.
     */
    const cookieStore =
      await cookies();

    const cookieName =
      buildMailboxAccessCookieName(
        mailboxCode,
      );

    const incomingCookie =
      cookieStore.get(
        cookieName,
      )?.value ?? "";

    const expectedCookie =
      buildMailboxAccessCookieValue(
        mailboxCode,
        mailbox.pin_hash,
      );

    const hasAccess =
      Boolean(incomingCookie) &&
      safeValuesMatch(
        incomingCookie,
        expectedCookie,
      );

    if (!hasAccess) {
      return NextResponse.redirect(
        new URL(
          `/mailbox/${encodeURIComponent(
            mailboxCode,
          )}?access=invalid`,
          req.url,
        ),
        303,
      );
    }

    /*
     * Critical privacy check:
     *
     * The thread ID supplied in the URL
     * must belong to THIS authenticated
     * mailbox.
     *
     * This prevents someone with access
     * to Mailbox A from posting into a
     * thread belonging to Mailbox B.
     */
    const {
      data: threadData,
      error: threadError,
    } = await supabase
      .from(
        "connect_mailbox_threads",
      )
      .select(
        "id, mailbox_id, status",
      )
      .eq("id", threadId)
      .eq(
        "mailbox_id",
        mailbox.id,
      )
      .maybeSingle();

const thread =
  threadData as unknown as
    | ThreadRow
    | null;

if (
  threadError ||
  !thread
) {
  return NextResponse.json(
    {
      ok: false,
      error: "Conversation not found",
    },
    { status: 404 },
  );
}

if (
  thread.status !== "active"
) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "This conversation is closed",
    },
    { status: 409 },
  );
}

/*
 * Store the consumer reply.
 *
 * Return the inserted row so we can
 * verify that Supabase actually created
 * the message before redirecting.
 */
const {
  data: insertedMessage,
  error: messageError,
} = await supabase
  .from(
    "connect_mailbox_messages",
  )
  .insert({
    thread_id: thread.id,
    sender_type: "consumer",
    message,
  })
  .select(
    `
      id,
      thread_id,
      sender_type,
      message,
      created_at
    `,
  )
  .single();

if (
  messageError ||
  !insertedMessage
) {
  console.error(
    "Connect consumer reply creation failed",
    {
      mailboxId: mailbox.id,
      threadId: thread.id,
      messageError,
      insertedMessage,
    },
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Failed to send message",
    },
    { status: 500 },
  );
}

/*
 * Temporary diagnostic logging.
 *
 * If this appears in the deployment
 * logs, Supabase returned the actual
 * newly inserted message row.
 */
console.log(
  "Connect consumer reply created",
  {
    mailboxId: mailbox.id,
    threadId: thread.id,
    insertedMessage,
  },
);

/*
 * Return to the authenticated
 * consumer mailbox.
 */
return NextResponse.redirect(
  new URL(
    `/mailbox/${encodeURIComponent(
      mailboxCode,
    )}`,
    req.url,
  ),
  303,
);
} catch (error) {
  console.error(
    "Connect consumer mailbox reply handler failed",
    error,
  );

    return NextResponse.json(
      {
        ok: false,
        error: "Server error",
      },
      { status: 500 },
    );
  }
}