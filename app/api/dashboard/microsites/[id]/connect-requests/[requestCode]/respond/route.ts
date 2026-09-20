import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MicrositeRow = {
  id: string;
  owner_clerk_user_id: string;
};

type ProviderProfileRow = {
  id: string;
  enabled: boolean;
};

type ConnectRequestRow = {
  id: string;
  request_code: string;
  status: string;
};

type RequestMatchRow = {
  id: string;
  status: string;
};

type MailboxRow = {
  id: string;
  status: string;
  expires_at: string;
};

type ThreadRow = {
  id: string;
  status: string;
};

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      requestCode: string;
    }>;
  },
) {
  try {
    const {
      id: micrositeId,
      requestCode,
    } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 },
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
          error: "Message is required",
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

    const sb = getSupabaseAdmin();

    /*
     * Verify that the current Clerk user
     * owns this microsite.
     */
    const {
      data: siteData,
      error: siteError,
    } = await sb
      .from("microsites")
      .select(
        "id, owner_clerk_user_id",
      )
      .eq("id", micrositeId)
      .maybeSingle();

    const site =
      siteData as unknown as
        | MicrositeRow
        | null;

    if (siteError || !site) {
      return NextResponse.json(
        {
          ok: false,
          error: "Microsite not found",
        },
        { status: 404 },
      );
    }

    if (
      site.owner_clerk_user_id !==
      userId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Forbidden",
        },
        { status: 403 },
      );
    }

    /*
     * Verify that this microsite has an
     * enabled Ko-Host Connect provider
     * profile.
     */
    const {
      data: providerData,
      error: providerError,
    } = await sb
      .from(
        "connect_provider_profiles",
      )
      .select("id, enabled")
      .eq(
        "microsite_id",
        micrositeId,
      )
      .maybeSingle();

    const providerProfile =
      providerData as unknown as
        | ProviderProfileRow
        | null;

    if (
      providerError ||
      !providerProfile
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Connect provider profile not found",
        },
        { status: 404 },
      );
    }

    if (!providerProfile.enabled) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Ko-Host Connect is disabled for this microsite",
        },
        { status: 403 },
      );
    }

    /*
     * Load the request by its public-safe
     * request code.
     *
     * Do NOT select notification_email.
     */
    const {
      data: requestData,
      error: requestError,
    } = await sb
      .from("connect_requests")
      .select(
        "id, request_code, status",
      )
      .eq(
        "request_code",
        requestCode,
      )
      .maybeSingle();

    const connectRequest =
      requestData as unknown as
        | ConnectRequestRow
        | null;

    if (
      requestError ||
      !connectRequest
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Connect request not found",
        },
        { status: 404 },
      );
    }

    if (
      connectRequest.status !== "open"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This request is no longer open",
        },
        { status: 409 },
      );
    }

    /*
     * Critical authorization check:
     *
     * The provider may respond only if
     * this request was specifically
     * matched to their provider profile.
     */
    const {
      data: matchData,
      error: matchError,
    } = await sb
      .from(
        "connect_request_matches",
      )
      .select("id, status")
      .eq(
        "request_id",
        connectRequest.id,
      )
      .eq(
        "provider_profile_id",
        providerProfile.id,
      )
      .maybeSingle();

    const match =
      matchData as unknown as
        | RequestMatchRow
        | null;

    if (matchError || !match) {
      /*
       * Do not reveal whether a request
       * exists to an unmatched provider.
       */
      return NextResponse.json(
        {
          ok: false,
          error:
            "Connect request not found",
        },
        { status: 404 },
      );
    }

    if (match.status === "closed") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This provider request is closed",
        },
        { status: 409 },
      );
    }

    /*
     * Load the consumer's private
     * mailbox.
     */
    const {
      data: mailboxData,
      error: mailboxError,
    } = await sb
      .from("connect_mailboxes")
      .select(
        "id, status, expires_at",
      )
      .eq(
        "request_id",
        connectRequest.id,
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

    const mailboxExpiresAt =
      new Date(
        mailbox.expires_at,
      ).getTime();

    const mailboxExpired =
      !Number.isFinite(
        mailboxExpiresAt,
      ) ||
      mailboxExpiresAt <= Date.now();

    if (
      mailbox.status !== "active" ||
      mailboxExpired
    ) {
      /*
       * Keep the stored mailbox status
       * synchronized when its expiration
       * time has passed.
       */
      if (
        mailbox.status === "active" &&
        mailboxExpired
      ) {
        const nowIso =
          new Date().toISOString();

        const { error: expireError } =
          await sb
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

      return NextResponse.json(
        {
          ok: false,
          error:
            "Mailbox is no longer available",
        },
        { status: 410 },
      );
    }

    /*
     * Find this provider's existing
     * private thread.
     */
    const {
      data: existingThreadData,
      error: existingThreadError,
    } = await sb
      .from(
        "connect_mailbox_threads",
      )
      .select("id, status")
      .eq(
        "mailbox_id",
        mailbox.id,
      )
      .eq(
        "provider_microsite_id",
        micrositeId,
      )
      .maybeSingle();

    if (existingThreadError) {
      console.error(
        "Connect mailbox thread lookup failed",
        {
          mailboxId: mailbox.id,
          micrositeId,
          existingThreadError,
        },
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Failed to open private conversation",
        },
        { status: 500 },
      );
    }

    let thread =
      existingThreadData as unknown as
        | ThreadRow
        | null;

    /*
     * Create the provider-specific
     * conversation only when the provider
     * actually sends their first message.
     */
    if (!thread) {
      const {
        data: newThreadData,
        error: newThreadError,
      } = await sb
        .from(
          "connect_mailbox_threads",
        )
        .insert({
          mailbox_id: mailbox.id,
          provider_microsite_id:
            micrositeId,
          status: "active",
        })
        .select("id, status")
        .single();

      if (newThreadError) {
        /*
         * A simultaneous submission could
         * theoretically create the thread
         * between our SELECT and INSERT.
         *
         * Because the database has a
         * unique(mailbox_id,
         * provider_microsite_id)
         * constraint, retry the lookup on
         * a unique-violation race.
         */
        if (
          newThreadError.code ===
          "23505"
        ) {
          const {
            data: retryThreadData,
            error: retryThreadError,
          } = await sb
            .from(
              "connect_mailbox_threads",
            )
            .select("id, status")
            .eq(
              "mailbox_id",
              mailbox.id,
            )
            .eq(
              "provider_microsite_id",
              micrositeId,
            )
            .maybeSingle();

          if (
            retryThreadError ||
            !retryThreadData
          ) {
            console.error(
              "Connect mailbox thread retry failed",
              {
                mailboxId:
                  mailbox.id,
                micrositeId,
                retryThreadError,
              },
            );

            return NextResponse.json(
              {
                ok: false,
                error:
                  "Failed to open private conversation",
              },
              { status: 500 },
            );
          }

          thread =
            retryThreadData as unknown as
              ThreadRow;
        } else {
          console.error(
            "Connect mailbox thread creation failed",
            {
              mailboxId:
                mailbox.id,
              micrositeId,
              newThreadError,
            },
          );

          return NextResponse.json(
            {
              ok: false,
              error:
                "Failed to open private conversation",
            },
            { status: 500 },
          );
        }
      } else {
        thread =
          newThreadData as unknown as
            ThreadRow;
      }
    }

    if (!thread) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Failed to open private conversation",
        },
        { status: 500 },
      );
    }

    if (thread.status !== "active") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This private conversation is closed",
        },
        { status: 409 },
      );
    }

    /*
     * Insert the provider's private
     * message.
     */
    const {
      error: messageError,
    } = await sb
      .from(
        "connect_mailbox_messages",
      )
      .insert({
        thread_id: thread.id,
        sender_type: "provider",
        message,
      });

    if (messageError) {
      console.error(
        "Connect provider message creation failed",
        {
          threadId: thread.id,
          micrositeId,
          requestId:
            connectRequest.id,
          messageError,
        },
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Failed to send response",
        },
        { status: 500 },
      );
    }

    /*
     * Mark this provider assignment as
     * responded.
     *
     * Preserve responded_at once it has
     * already been set.
     */
    const nowIso =
      new Date().toISOString();

    if (
      match.status !== "responded"
    ) {
      const {
        error: matchUpdateError,
      } = await sb
        .from(
          "connect_request_matches",
        )
        .update({
          status: "responded",
          responded_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", match.id)
        .neq("status", "closed");

      if (matchUpdateError) {
        /*
         * The message already exists at
         * this point, so do not report the
         * send as failed. Log the status
         * synchronization failure instead.
         */
        console.error(
          "Connect request match responded update failed",
          {
            matchId: match.id,
            matchUpdateError,
          },
        );
      }
    }

    return NextResponse.redirect(
      new URL(
        `/dashboard/microsites/${micrositeId}/connect-requests/${encodeURIComponent(
          requestCode,
        )}`,
        req.url,
      ),
      303,
    );
  } catch (error) {
    console.error(
      "Connect provider response handler failed",
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