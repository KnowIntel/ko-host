import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const REQUEST_IMAGE_BUCKET =
  "connect-request-images";

const SIGNED_IMAGE_URL_SECONDS = 60 * 10;

type MatchStatus =
  | "new"
  | "viewed"
  | "responded"
  | "closed";

type RequestStatus =
  | "open"
  | "fulfilled"
  | "cancelled"
  | "expired";

type MicrositeRow = {
  id: string;
  owner_clerk_user_id: string;
  slug: string;
  title: string;
  is_published: boolean;
  is_active: boolean | null;
};

type ProviderProfileRow = {
  id: string;
  microsite_id: string;
  enabled: boolean;
};

type RequestMatchRow = {
  id: string;
  request_id: string;
  provider_profile_id: string;
  status: MatchStatus;
  matched_at: string;
  viewed_at: string | null;
  responded_at: string | null;
  closed_at: string | null;
};

type ConnectRequestRow = {
  id: string;
  request_code: string;
  service: string;
  zip_code: string;
  service_needed_date: string | null;
  details: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};

type RequestPhotoRow = {
  id: string;
  storage_path: string;
  original_file_name: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  sort_order: number;
};

type SignedPhoto = RequestPhotoRow & {
  signedUrl: string;
};

type MailboxMessageRow = {
  id: string;
  thread_id: string;
  sender_type: "consumer" | "provider";
  message: string;
  created_at: string;
  updated_at: string;
};

function formatDate(
  value?: string | null,
) {
  if (!value) return "Flexible / Not specified";

  const parsed = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function getMatchStatusLabel(
  status: MatchStatus,
) {
  switch (status) {
    case "new":
      return "New";

    case "viewed":
      return "Viewed";

    case "responded":
      return "Responded";

    case "closed":
      return "Closed";

    default:
      return status;
  }
}

function getRequestStatusLabel(
  status: RequestStatus,
) {
  switch (status) {
    case "open":
      return "Open";

    case "fulfilled":
      return "Fulfilled";

    case "cancelled":
      return "Cancelled";

    case "expired":
      return "Expired";

    default:
      return status;
  }
}

export default async function ConnectRequestDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
    requestCode: string;
  }>;
}) {
  const { id, requestCode } =
    await params;

  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="p-6">
        Unauthorized
      </div>
    );
  }

  const sb = getSupabaseAdmin();

  // =====================================================
  // Verify microsite ownership
  // =====================================================

  const {
    data: siteData,
    error: siteError,
  } = await sb
    .from("microsites")
    .select(
      [
        "id",
        "owner_clerk_user_id",
        "slug",
        "title",
        "is_published",
        "is_active",
      ].join(","),
    )
    .eq("id", id)
    .maybeSingle();

  const site =
    siteData as unknown as
      | MicrositeRow
      | null;

  if (siteError || !site) {
    return notFound();
  }

  if (
    site.owner_clerk_user_id !== userId
  ) {
    return (
      <div className="p-6">
        Forbidden
      </div>
    );
  }

  // =====================================================
  // Load Connect provider profile
  // =====================================================

  const {
    data: providerData,
    error: providerError,
  } = await sb
    .from("connect_provider_profiles")
    .select(
      [
        "id",
        "microsite_id",
        "enabled",
      ].join(","),
    )
    .eq("microsite_id", site.id)
    .maybeSingle();

  const providerProfile =
    providerData as unknown as
      | ProviderProfileRow
      | null;

  if (
    providerError ||
    !providerProfile
  ) {
    return notFound();
  }

  // =====================================================
  // Load requested Connect request
  // =====================================================
  //
  // Do NOT select notification_email.
  // Providers must never receive it.
  // =====================================================

  const {
    data: requestData,
    error: requestError,
  } = await sb
    .from("connect_requests")
    .select(
      [
        "id",
        "request_code",
        "service",
        "zip_code",
        "service_needed_date",
        "details",
        "status",
        "created_at",
        "updated_at",
        "expires_at",
      ].join(","),
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
    return notFound();
  }

  // =====================================================
  // Verify this provider was actually matched
  // =====================================================

  const {
    data: matchData,
    error: matchError,
  } = await sb
    .from("connect_request_matches")
    .select(
      [
        "id",
        "request_id",
        "provider_profile_id",
        "status",
        "matched_at",
        "viewed_at",
        "responded_at",
        "closed_at",
      ].join(","),
    )
    .eq(
      "request_id",
      connectRequest.id,
    )
    .eq(
      "provider_profile_id",
      providerProfile.id,
    )
    .maybeSingle();

  let match =
    matchData as unknown as
      | RequestMatchRow
      | null;

  if (matchError || !match) {
    /*
     * Deliberately return 404 rather
     * than revealing that another
     * provider's request exists.
     */
    return notFound();
  }

  // =====================================================
  // Mark first actual view
  // =====================================================

  if (match.status === "new") {
    const now =
      new Date().toISOString();

    const {
      data: updatedMatchData,
      error: viewedError,
    } = await sb
      .from(
        "connect_request_matches",
      )
      .update({
        status: "viewed",
        viewed_at: now,
        updated_at: now,
      })
      .eq("id", match.id)
      .eq("status", "new")
      .select(
        [
          "id",
          "request_id",
          "provider_profile_id",
          "status",
          "matched_at",
          "viewed_at",
          "responded_at",
          "closed_at",
        ].join(","),
      )
      .maybeSingle();

    if (viewedError) {
      console.error(
        "Connect request viewed update failed:",
        viewedError,
      );
    } else if (updatedMatchData) {
      match =
        updatedMatchData as unknown as
          RequestMatchRow;
    }
  }

  // =====================================================
  // Load private request photos
  // =====================================================

  const {
    data: photoData,
    error: photoError,
  } = await sb
    .from("connect_request_photos")
    .select(
      [
        "id",
        "storage_path",
        "original_file_name",
        "mime_type",
        "file_size_bytes",
        "sort_order",
      ].join(","),
    )
    .eq(
      "request_id",
      connectRequest.id,
    )
    .order("sort_order", {
      ascending: true,
    });

  if (photoError) {
    console.error(
      "Connect request photos load failed:",
      photoError,
    );
  }

  const photos =
    (photoData ?? []) as unknown as
      RequestPhotoRow[];

  // =====================================================
  // Generate short-lived signed image URLs
  // =====================================================

  const signedPhotos: SignedPhoto[] =
    [];

  for (const photo of photos) {
    const {
      data: signedData,
      error: signedError,
    } = await sb.storage
      .from(REQUEST_IMAGE_BUCKET)
      .createSignedUrl(
        photo.storage_path,
        SIGNED_IMAGE_URL_SECONDS,
      );

    if (
      signedError ||
      !signedData?.signedUrl
    ) {
      console.error(
        "Connect request photo signed URL failed:",
        signedError,
      );

      continue;
    }

    signedPhotos.push({
      ...photo,
      signedUrl:
        signedData.signedUrl,
    });
  }

  // =====================================================
  // Existing provider conversation
  // =====================================================

  const {
    data: mailboxData,
    error: mailboxError,
  } = await sb
    .from("connect_mailboxes")
    .select("id, status, expires_at")
    .eq(
      "request_id",
      connectRequest.id,
    )
    .maybeSingle();

  if (mailboxError) {
    console.error(
      "Connect mailbox lookup failed:",
      mailboxError,
    );
  }

  const mailbox =
    mailboxData as unknown as
      | {
          id: string;
          status: string;
          expires_at: string;
        }
      | null;

let threadId: string | null = null;

let providerMessageCount = 0;

let conversationMessages: MailboxMessageRow[] = [];

if (mailbox) {
  const {
    data: threadData,
    error: threadError,
  } = await sb
    .from("connect_mailbox_threads")
    .select("id")
    .eq("mailbox_id", mailbox.id)
    .eq(
      "provider_microsite_id",
      site.id,
    )
    .maybeSingle();

  if (threadError) {
    console.error(
      "Connect mailbox thread lookup failed:",
      threadError,
    );
  }

  const thread =
    threadData as unknown as
      | { id: string }
      | null;

  if (thread) {
    threadId = thread.id;

    /*
     * Load only this provider's private
     * conversation.
     *
     * Because the thread itself is tied
     * to site.id above, messages from
     * other providers cannot appear here.
     */
    const {
      data: messageData,
      error: messageError,
    } = await sb
      .from("connect_mailbox_messages")
      .select(
        [
          "id",
          "thread_id",
          "sender_type",
          "message",
          "created_at",
          "updated_at",
        ].join(","),
      )
      .eq("thread_id", thread.id)
      .order("created_at", {
        ascending: true,
      });

    if (messageError) {
      console.error(
        "Connect mailbox messages load failed:",
        messageError,
      );
    } else {
      conversationMessages =
        (messageData ??
          []) as unknown as
          MailboxMessageRow[];

      providerMessageCount =
        conversationMessages.filter(
          (message) =>
            message.sender_type ===
            "provider",
        ).length;
    }
  }
}

  const mailboxExpired =
    !mailbox ||
    mailbox.status !== "active" ||
    new Date(
      mailbox.expires_at,
    ).getTime() <= Date.now();

  const canRespond =
    connectRequest.status ===
      "open" &&
    !mailboxExpired &&
    providerProfile.enabled;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-emerald-700">
                Ko-Host Connect
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                {connectRequest.service}
              </h1>

              <div className="mt-2 text-sm text-neutral-500">
                Request #
                <span className="ml-1 font-mono">
                  {
                    connectRequest.request_code
                  }
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold",
                  match.status === "responded"
                    ? "bg-emerald-50 text-emerald-700"
                    : match.status === "closed"
                      ? "bg-neutral-100 text-neutral-600"
                      : match.status === "new"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700",
                ].join(" ")}
              >
                {getMatchStatusLabel(
                  match.status,
                )}
              </span>

              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                {getRequestStatusLabel(
                  connectRequest.status,
                )}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Service
              </div>

              <div className="mt-1 font-semibold text-neutral-900">
                {connectRequest.service}
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Location
              </div>

              <div className="mt-1 font-semibold text-neutral-900">
                ZIP{" "}
                {connectRequest.zip_code}
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Service Needed
              </div>

              <div className="mt-1 font-semibold text-neutral-900">
                {formatDate(
                  connectRequest.service_needed_date,
                )}
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Received
              </div>

              <div className="mt-1 font-semibold text-neutral-900">
                {formatDateTime(
                  match.matched_at,
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* MAIN REQUEST */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">
                Request Details
              </h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                {connectRequest.details}
              </p>
            </section>

            {signedPhotos.length > 0 ? (
              <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Request Photos
                  </h2>

                  <span className="text-xs text-neutral-500">
                    {
                      signedPhotos.length
                    }{" "}
                    {signedPhotos.length ===
                    1
                      ? "photo"
                      : "photos"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {signedPhotos.map(
                    (photo) => (
                      <a
                        key={photo.id}
                        href={
                          photo.signedUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                      >
                        <img
                          src={
                            photo.signedUrl
                          }
                          alt={
                            photo.original_file_name ||
                            "Request photo"
                          }
                          className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
                        />
                      </a>
                    ),
                  )}
                </div>

                <p className="mt-3 text-xs text-neutral-400">
                  Request photos use
                  temporary private links.
                </p>
              </section>
            ) : null}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4">
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
              <h2 className="text-base font-semibold text-neutral-900">
                Respond Privately
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Your response will be
                delivered to the
                consumer&apos;s private
                Ko-Host Mailbox. Their
                personal email and phone
                number are not shared.
              </p>

<div className="mt-4 rounded-xl border border-emerald-100 bg-white p-3">
  <div className="text-xs font-medium text-neutral-500">
    Your responses
  </div>

  <div className="mt-1 text-xl font-semibold text-neutral-900">
    {providerMessageCount}
  </div>
</div>

{conversationMessages.length > 0 ? (
  <div className="mt-4">
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Conversation
      </div>

      <div className="text-xs text-neutral-400">
        {conversationMessages.length}{" "}
        {conversationMessages.length === 1
          ? "message"
          : "messages"}
      </div>
    </div>

    <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-3">
      {conversationMessages.map(
        (message) => {
          const isProvider =
            message.sender_type ===
            "provider";

          return (
            <div
              key={message.id}
              className={[
                "flex",
                isProvider
                  ? "justify-end"
                  : "justify-start",
              ].join(" ")}
            >
              <div
                className={[
                  "max-w-[88%] rounded-2xl px-3.5 py-3",
                  isProvider
                    ? "rounded-br-md bg-emerald-600 text-white"
                    : "rounded-bl-md bg-neutral-100 text-neutral-900",
                ].join(" ")}
              >
                <div
                  className={[
                    "mb-1 text-[11px] font-semibold",
                    isProvider
                      ? "text-emerald-100"
                      : "text-neutral-500",
                  ].join(" ")}
                >
                  {isProvider
                    ? "You"
                    : "Customer"}
                </div>

                <div className="whitespace-pre-wrap break-words text-sm leading-6">
                  {message.message}
                </div>

                <div
                  className={[
                    "mt-1.5 text-[10px]",
                    isProvider
                      ? "text-emerald-100"
                      : "text-neutral-400",
                  ].join(" ")}
                >
                  {formatDateTime(
                    message.created_at,
                  )}
                </div>
              </div>
            </div>
          );
        },
      )}
    </div>
  </div>
) : (
  <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-4 text-center">
    <div className="text-sm font-medium text-neutral-700">
      No messages yet
    </div>

    <div className="mt-1 text-xs leading-5 text-neutral-500">
      Send the first private response
      to start a conversation with the
      customer.
    </div>
  </div>
)}

{canRespond ? (
  <form
    action={`/api/dashboard/microsites/${site.id}/connect-requests/${encodeURIComponent(
      connectRequest.request_code,
    )}/respond`}
    method="post"
    className="mt-4 space-y-3"
  >
    <div>
      <label
        htmlFor="provider-response-message"
        className="mb-1.5 block text-xs font-semibold text-neutral-700"
      >
        Message to customer
      </label>

      <textarea
        id="provider-response-message"
        name="message"
        required
        maxLength={5000}
        rows={6}
        placeholder="Introduce yourself, explain how you can help, and include any relevant pricing or availability."
        className="w-full resize-y rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>

    <button
      type="submit"
      className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
    >
      {threadId
        ? "Send Message"
        : "Respond Privately"}
    </button>

    <p className="text-center text-xs leading-5 text-neutral-500">
      This message is visible only to
      the customer in their private
      Ko-Host Mailbox.
    </p>
  </form>
) : (
                <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
                  {mailboxExpired
                    ? "This private mailbox is no longer available."
                    : !providerProfile.enabled
                      ? "Ko-Host Connect is currently disabled for this microsite."
                      : "This request is no longer open for responses."}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Provider
              </div>

              <div className="mt-2 font-semibold text-neutral-900">
                {site.title ||
                  "(Untitled)"}
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                /s/{site.slug}
              </div>

              {threadId ? (
                <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                  Private conversation
                  started
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                  No conversation started
                  yet
                </div>
              )}
            </section>

            <Link
              href={`/dashboard/microsites/${site.id}/connect-requests`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
            >
              Back to Connect Requests
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}