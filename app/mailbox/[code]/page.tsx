import Link from "next/link";
import { cookies } from "next/headers";
import crypto from "crypto";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type MailboxAccessState =
  | "invalid"
  | "expired"
  | "unavailable";

type MailboxRow = {
  id: string;
  request_id: string;
  mailbox_code: string;
  pin_hash: string;
  status: string;
  created_at: string;
  expires_at: string;
};

type ConnectRequestRow = {
  id: string;
  request_code: string;
  service: string;
  zip_code: string;
  service_needed_date: string | null;
  details: string;
  status: string;
  created_at: string;
  expires_at: string | null;
};

type ProviderMicrositeRow = {
  id: string;
  slug: string;
  title: string;
};

type MailboxThreadRow = {
  id: string;
  mailbox_id: string;
  provider_microsite_id: string;
  status: "active" | "closed";
  created_at: string;
  updated_at: string;
};

type MailboxMessageRow = {
  id: string;
  thread_id: string;
  sender_type: "consumer" | "provider";
  message: string;
  created_at: string;
  updated_at: string;
};

type ConsumerConversation = {
  thread: MailboxThreadRow;
  provider: ProviderMicrositeRow | null;
  messages: MailboxMessageRow[];
};

function normalizeMailboxCode(input: string) {
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
    .update(`${mailboxCode}:${pinHash}`)
    .digest("hex");
}

function safeValuesMatch(
  incomingValue: string,
  expectedValue: string,
) {
  try {
    const incomingBuffer = Buffer.from(
      incomingValue,
      "hex",
    );

    const expectedBuffer = Buffer.from(
      expectedValue,
      "hex",
    );

    if (
      incomingBuffer.length === 0 ||
      incomingBuffer.length !== expectedBuffer.length
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

function formatDate(value: string | null) {
  if (!value) {
    return "Flexible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Flexible";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function AccessMessage({
  access,
}: {
  access?: MailboxAccessState;
}) {
  if (access === "invalid") {
    return (
      <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        That PIN is incorrect. Please try again.
      </div>
    );
  }

  if (access === "expired") {
    return (
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        This temporary Ko-Host Mailbox has expired.
      </div>
    );
  }

  if (access === "unavailable") {
    return (
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700">
        This mailbox is currently unavailable.
      </div>
    );
  }

  return null;
}

function MailboxAccessForm({
  mailboxCode,
}: {
  mailboxCode: string;
}) {
  const returnTo = `/mailbox/${mailboxCode}`;

  return (
    <form
      action={`/api/connect/mailbox/${encodeURIComponent(
        mailboxCode,
      )}/access`}
      method="POST"
      className="mt-7"
    >
      <input
        type="hidden"
        name="returnTo"
        value={returnTo}
      />

      <label
        htmlFor="mailbox-pin"
        className="text-xs font-semibold uppercase tracking-[0.12em] text-[#52665d]"
      >
        6-Digit PIN
      </label>

      <input
        id="mailbox-pin"
        name="pin"
        type="password"
        inputMode="numeric"
        pattern="[0-9]{6}"
        minLength={6}
        maxLength={6}
        autoComplete="one-time-code"
        required
        placeholder="••••••"
        className="mt-2 h-14 w-full rounded-2xl border border-[#cdd5cf] bg-white px-4 text-center font-mono text-2xl font-black tracking-[0.3em] text-[#173f35] outline-none transition placeholder:text-neutral-300 focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
      />

      <button
        type="submit"
        className="mt-4 flex h-13 w-full items-center justify-center rounded-2xl bg-[#173f35] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3028]"
      >
        Open My Mailbox →
      </button>
    </form>
  );
}

function MailboxUnavailable({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-[28px] border border-[#d9d4c7] bg-white shadow-xl shadow-black/5">
          <div className="bg-[#173f35] px-6 py-8 text-white sm:px-9">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8d7c9]">
              Ko-Host Connect
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>

          <div className="p-6 sm:p-9">
            <p className="text-sm leading-6 text-neutral-600">
              {message}
            </p>

            <Link
              href="/connect"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#173f35] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f3028]"
            >
              Back to Ko-Host Connect
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function MailboxPage({
  params,
  searchParams,
}: {
  params: Promise<{
    code: string;
  }>;

  searchParams: Promise<{
    access?: string;
  }>;
}) {
  const { code } = await params;
  const query = await searchParams;

  const safeCode = normalizeMailboxCode(
    decodeURIComponent(String(code || "")),
  );

  if (!/^[A-Za-z0-9]{10}$/.test(safeCode)) {
    return (
      <MailboxUnavailable
        title="Mailbox unavailable"
        message="This Ko-Host Mailbox link is not valid."
      />
    );
  }

  const supabase = getSupabaseAdmin();

  const {
    data: mailboxData,
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
        created_at,
        expires_at
      `,
    )
    .eq("mailbox_code", safeCode)
    .maybeSingle();

  if (
    mailboxError ||
    !mailboxData
  ) {
    return (
      <MailboxUnavailable
        title="Mailbox unavailable"
        message="This Ko-Host Mailbox could not be found."
      />
    );
  }

  const mailbox =
    mailboxData as MailboxRow;

  const expiresAt = new Date(
    mailbox.expires_at,
  ).getTime();

  const isExpired =
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now() ||
    mailbox.status === "expired";

  if (isExpired) {
    if (mailbox.status !== "expired") {
      await supabase
        .from("connect_mailboxes")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", mailbox.id);
    }

    return (
      <MailboxUnavailable
        title="Mailbox expired"
        message="This temporary Ko-Host Mailbox has reached the end of its 12-day access period."
      />
    );
  }

  if (mailbox.status !== "active") {
    return (
      <MailboxUnavailable
        title="Mailbox unavailable"
        message="This Ko-Host Mailbox is no longer active."
      />
    );
  }

  const cookieStore = await cookies();

  const cookieName =
    buildMailboxAccessCookieName(safeCode);

  const incomingCookie =
    cookieStore.get(cookieName)?.value ?? "";

  const expectedCookie =
    buildMailboxAccessCookieValue(
      safeCode,
      mailbox.pin_hash,
    );

  const hasAccess =
    Boolean(incomingCookie) &&
    safeValuesMatch(
      incomingCookie,
      expectedCookie,
    );

  if (!hasAccess) {
    const accessState: MailboxAccessState | undefined =
      query.access === "invalid" ||
      query.access === "expired" ||
      query.access === "unavailable"
        ? query.access
        : undefined;

    return (
      <main className="min-h-screen bg-[#f7f5ef] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-[28px] border border-[#d9d4c7] bg-white shadow-xl shadow-black/5">
            <div className="bg-[#173f35] px-6 py-8 text-white sm:px-9">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8d7c9]">
                Ko-Host Connect
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Private Mailbox
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Enter the 6-digit PIN you received when
                this request was submitted.
              </p>
            </div>

            <div className="p-6 sm:p-9">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2ed] text-xl text-[#173f35]">
                  ✉
                </div>

                <div>
                  <div className="text-sm font-semibold text-neutral-950">
                    Mailbox {safeCode}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Your PIN protects the private provider
                    responses associated with this request.
                  </p>
                </div>
              </div>

              <AccessMessage
                access={accessState}
              />

              <MailboxAccessForm
                mailboxCode={safeCode}
              />

              <div className="mt-5 rounded-xl border border-[#d7e2dc] bg-[#f1f6f3] px-4 py-3 text-[11px] leading-5 text-[#52665d]">
                Your personal contact information is not
                shared with providers. Mailbox access
                automatically expires after 12 days.
              </div>

              <Link
                href="/connect"
                className="mt-6 inline-flex text-xs font-bold text-[#55786a] transition hover:text-[#173f35]"
              >
                ← Back to Ko-Host Connect
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * The consumer is authenticated at this point.
   *
   * Only now do we load the private request information.
   */
  const {
    data: requestData,
    error: requestError,
  } = await supabase
    .from("connect_requests")
    .select(
      `
        id,
        request_code,
        service,
        zip_code,
        service_needed_date,
        details,
        status,
        created_at,
        expires_at
      `,
    )
    .eq("id", mailbox.request_id)
    .maybeSingle();

  if (
    requestError ||
    !requestData
  ) {
    return (
      <MailboxUnavailable
        title="Request unavailable"
        message="The request associated with this mailbox could not be loaded."
      />
    );
  }

const request =
  requestData as ConnectRequestRow;

/*
 * The consumer has successfully authenticated
 * into this mailbox.
 *
 * Load every provider-specific thread belonging
 * to THIS mailbox only.
 */
const {
  data: threadData,
  error: threadError,
} = await supabase
  .from("connect_mailbox_threads")
  .select(
    `
      id,
      mailbox_id,
      provider_microsite_id,
      status,
      created_at,
      updated_at
    `,
  )
  .eq("mailbox_id", mailbox.id)
  .order("created_at", {
    ascending: true,
  });

if (threadError) {
  console.error(
    "Connect consumer mailbox threads load failed:",
    threadError,
  );
}

const threads =
  (threadData ?? []) as unknown as
    MailboxThreadRow[];

const conversations: ConsumerConversation[] = [];

for (const thread of threads) {
  /*
   * Load the provider's public-facing
   * microsite identity.
   *
   * We intentionally do NOT load the
   * provider owner's Clerk ID or other
   * private account information.
   */
  const {
    data: providerData,
    error: providerError,
  } = await supabase
    .from("microsites")
    .select(
      `
        id,
        slug,
        title
      `,
    )
    .eq(
      "id",
      thread.provider_microsite_id,
    )
    .maybeSingle();

  if (providerError) {
    console.error(
      "Connect mailbox provider load failed:",
      {
        threadId: thread.id,
        providerMicrositeId:
          thread.provider_microsite_id,
        providerError,
      },
    );
  }

  const provider =
    providerData
      ? (providerData as unknown as
          ProviderMicrositeRow)
      : null;

  /*
   * Each query is restricted to exactly
   * one thread.
   *
   * This preserves the V1 privacy model:
   * providers never share a conversation
   * with one another.
   */
  const {
    data: messageData,
    error: messageError,
  } = await supabase
    .from("connect_mailbox_messages")
    .select(
      `
        id,
        thread_id,
        sender_type,
        message,
        created_at,
        updated_at
      `,
    )
    .eq("thread_id", thread.id)
    .order("created_at", {
      ascending: true,
    });

  if (messageError) {
    console.error(
      "Connect consumer mailbox messages load failed:",
      {
        threadId: thread.id,
        messageError,
      },
    );
  }

  const messages =
    (messageData ?? []) as unknown as
      MailboxMessageRow[];

  conversations.push({
    thread,
    provider,
    messages,
  });
}

return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="overflow-hidden rounded-[28px] border border-[#d9d4c7] bg-white shadow-lg shadow-black/5">
          <div className="bg-[#173f35] px-6 py-7 text-white sm:px-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8d7c9]">
                  Ko-Host Connect
                </div>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  Your Private Mailbox
                </h1>

                <p className="mt-2 text-sm text-white/70">
                  Request {request.request_code}
                </p>
              </div>

              <div className="w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-[#dcebe4]">
                ● Mailbox Active
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            {/* REQUEST SUMMARY */}
            <section className="border-b border-[#e7e2d8] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6d8a7d]">
                Your Request
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                {request.service}
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <RequestDetail
                  label="Location"
                  value={request.zip_code}
                />

                <RequestDetail
                  label="Service Needed"
                  value={formatDate(
                    request.service_needed_date,
                  )}
                />

                <RequestDetail
                  label="Submitted"
                  value={formatDateTime(
                    request.created_at,
                  )}
                />

                <RequestDetail
                  label="Status"
                  value={
                    request.status
                      ? request.status
                          .charAt(0)
                          .toUpperCase() +
                        request.status.slice(1)
                      : "Open"
                  }
                />
              </div>

              <div className="mt-5 rounded-2xl border border-[#e1ddd4] bg-[#faf9f5] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Request Details
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                  {request.details}
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-[#d7e2dc] bg-[#f1f6f3] px-4 py-3 text-[11px] leading-5 text-[#52665d]">
                Mailbox expires{" "}
                <strong className="font-semibold text-[#284c3e]">
                  {formatDate(mailbox.expires_at)}
                </strong>
                .
              </div>
            </section>

{/* PROVIDER RESPONSES */}
<section className="p-6 sm:p-8">
  <div className="flex items-start justify-between gap-4">
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6d8a7d]">
        Provider Responses
      </div>

      <h2 className="mt-2 text-xl font-semibold text-neutral-950">
        Your conversations
      </h2>
    </div>

    <div className="rounded-full bg-[#eaf2ed] px-3 py-1.5 text-[10px] font-semibold text-[#315847]">
      {conversations.length}{" "}
      {conversations.length === 1
        ? "Response"
        : "Responses"}
    </div>
  </div>

  {conversations.length === 0 ? (
    <div className="mt-7 flex min-h-[320px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#cdd5cf] bg-[#fafbf9] px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf2ed] text-2xl text-[#173f35]">
        ✉
      </div>

      <h3 className="mt-4 text-base font-semibold text-neutral-900">
        No provider responses yet
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-neutral-500">
        When a matched provider responds
        to your request, their private
        conversation will appear here.
      </p>

      <div className="mt-5 rounded-xl border border-[#e1ddd4] bg-white px-4 py-3 text-[11px] leading-5 text-neutral-500">
        Providers cannot see each
        other&apos;s messages, pricing,
        or conversations.
      </div>
    </div>
  ) : (
    <div className="mt-6 space-y-5">
      {conversations.map(
        (conversation) => {
          const providerName =
            conversation.provider
              ?.title?.trim() ||
            "Ko-Host Provider";

          const providerSlug =
            conversation.provider
              ?.slug?.trim() || "";

          return (
            <div
              key={conversation.thread.id}
              className="overflow-hidden rounded-[22px] border border-[#d9d4c7] bg-[#fafbf9]"
            >
              {/* PROVIDER HEADER */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1ddd4] bg-white px-4 py-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-neutral-950">
                    {providerName}
                  </div>

                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6d8a7d]">
                    Private Provider
                    Conversation
                  </div>
                </div>

                {providerSlug ? (
                  <Link
                    href={`/s/${encodeURIComponent(
                      providerSlug,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#cdd5cf] bg-white px-3 py-2 text-[11px] font-semibold text-[#315847] transition hover:border-[#6e9583] hover:bg-[#f1f6f3]"
                  >
                    View Provider →
                  </Link>
                ) : null}
              </div>

              {/* CONVERSATION */}
              {conversation.messages
                .length > 0 ? (
                <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
                  {conversation.messages.map(
                    (message) => {
                      const isConsumer =
                        message.sender_type ===
                        "consumer";

                      return (
                        <div
                          key={message.id}
                          className={[
                            "flex",
                            isConsumer
                              ? "justify-end"
                              : "justify-start",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "max-w-[88%] rounded-2xl px-3.5 py-3",
                              isConsumer
                                ? "rounded-br-md bg-[#173f35] text-white"
                                : "rounded-bl-md border border-[#e1ddd4] bg-white text-neutral-900",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "mb-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
                                isConsumer
                                  ? "text-[#b8d7c9]"
                                  : "text-[#6d8a7d]",
                              ].join(
                                " ",
                              )}
                            >
                              {isConsumer
                                ? "You"
                                : providerName}
                            </div>

                            <div className="whitespace-pre-wrap break-words text-sm leading-6">
                              {
                                message.message
                              }
                            </div>

                            <div
                              className={[
                                "mt-1.5 text-[10px]",
                                isConsumer
                                  ? "text-white/60"
                                  : "text-neutral-400",
                              ].join(
                                " ",
                              )}
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
              ) : (
                <div className="px-5 py-8 text-center text-xs text-neutral-500">
                  This conversation does
                  not have any messages
                  yet.
                </div>
              )}

{/* CONSUMER REPLY */}
{conversation.thread.status ===
"active" ? (
  <div className="border-t border-[#e1ddd4] bg-white p-4">
    <form
      action={`/api/connect/mailbox/${encodeURIComponent(
        safeCode,
      )}/threads/${encodeURIComponent(
        conversation.thread.id,
      )}/reply`}
      method="POST"
      className="space-y-3"
    >
      <div>
        <label
          htmlFor={`reply-${conversation.thread.id}`}
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6d8a7d]"
        >
          Reply to {providerName}
        </label>

        <textarea
          id={`reply-${conversation.thread.id}`}
          name="message"
          required
          maxLength={5000}
          rows={3}
          placeholder={`Write a private message to ${providerName}...`}
          className="w-full resize-y rounded-xl border border-[#cdd5cf] bg-white px-3.5 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[10px] leading-4 text-neutral-400">
          Only you and{" "}
          <strong className="font-bold text-neutral-500">
            {providerName}
          </strong>{" "}
          can see this conversation.
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-[#173f35] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0f3028]"
        >
          Send Reply →
        </button>
      </div>
    </form>
  </div>
) : (
  <div className="border-t border-[#e1ddd4] bg-neutral-50 px-4 py-3 text-center text-[11px] font-bold text-neutral-500">
    This conversation is closed.
  </div>
)}
            </div>
          );
        },
      )}

      <div className="rounded-xl border border-[#d7e2dc] bg-[#f1f6f3] px-4 py-3 text-[11px] leading-5 text-[#52665d]">
        Each provider conversation is
        private. Providers cannot see
        other providers&apos; messages,
        pricing, or conversations.
      </div>
    </div>
  )}
</section>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="text-[11px] text-neutral-500">
            Private Ko-Host Connect Mailbox
          </div>

          <Link
            href="/connect"
            className="text-xs font-bold text-[#55786a] transition hover:text-[#173f35]"
          >
            Back to Ko-Host Connect →
          </Link>
        </div>
      </div>
    </main>
  );
}

function RequestDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e1ddd4] bg-white px-3 py-3">
      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </div>

      <div className="mt-1 text-xs font-bold text-neutral-800">
        {value}
      </div>
    </div>
  );
}