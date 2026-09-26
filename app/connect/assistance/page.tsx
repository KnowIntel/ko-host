// app/connect/assistance/page.tsx

import Link from "next/link";
import { cookies } from "next/headers";

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
export const revalidate = 0;

type SearchParams = {
  mailbox?: string;
  thread?: string;
  submitted?: string;
};

function Unavailable() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[28px] border border-[#d9d4c7] bg-white p-7 shadow-xl shadow-black/5 sm:p-9">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d8a7d]">
            Ko-Host Connect
          </div>

          <h1 className="mt-3 text-2xl font-semibold text-neutral-950">
            Assistance unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Assistance requests can only be submitted from an
            active, authenticated Ko-Host Connect mailbox.
          </p>

          <Link
            href="/connect"
            className="mt-6 inline-flex rounded-xl bg-[#173f35] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Ko-Host Connect
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function AssistancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;

  const mailboxCode = normalizeMailboxCode(
    decodeURIComponent(
      String(query.mailbox || ""),
    ),
  );

  const threadId = String(
    query.thread || "",
  ).trim();

  if (
    !MAILBOX_CODE_PATTERN.test(mailboxCode) ||
    !threadId
  ) {
    return <Unavailable />;
  }

  const supabase = getSupabaseAdmin();

  /*
   * The mailbox code identifies the mailbox.
   * It does not authenticate the consumer.
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
    .eq("mailbox_code", mailboxCode)
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
    return <Unavailable />;
  }

  /*
   * Require the authenticated mailbox session created
   * after successful PIN entry.
   */
  const cookieStore = await cookies();

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
    return <Unavailable />;
  }

  /*
   * Verify that the supplied conversation belongs to
   * this exact authenticated mailbox.
   */
  const {
    data: thread,
    error: threadError,
  } = await supabase
    .from("connect_mailbox_threads")
    .select(
      `
        id,
        mailbox_id,
        provider_microsite_id,
        status
      `,
    )
    .eq("id", threadId)
    .eq("mailbox_id", mailbox.id)
    .maybeSingle();

  if (
    threadError ||
    !thread ||
    !thread.provider_microsite_id
  ) {
    return <Unavailable />;
  }

  const { data: provider } =
    await supabase
      .from("microsites")
      .select("title")
      .eq(
        "id",
        thread.provider_microsite_id,
      )
      .maybeSingle();

  const providerName =
    provider?.title?.trim() ||
    "Ko-Host Provider";

  const mailboxReturnUrl =
    `/mailbox/${encodeURIComponent(
      mailboxCode,
    )}`;

  if (query.submitted === "1") {
    return (
      <main className="min-h-screen bg-[#f7f5ef] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-[28px] border border-[#d9d4c7] bg-white p-7 shadow-xl shadow-black/5 sm:p-9">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d8a7d]">
              Ko-Host Connect
            </div>

            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2ed] text-xl text-[#173f35]">
              ✓
            </div>

            <h1 className="mt-4 text-2xl font-semibold text-neutral-950">
              Request received
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Your assistance request has been submitted to
              Ko-Host. We&apos;ll review your message and follow
              up if additional information is needed.
            </p>

            <Link
              href={mailboxReturnUrl}
              className="mt-6 inline-flex rounded-xl bg-[#173f35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f3028]"
            >
              Return to Mailbox
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-[28px] border border-[#d9d4c7] bg-white shadow-xl shadow-black/5">
          <div className="bg-[#173f35] px-6 py-7 text-white sm:px-9">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8d7c9]">
              Ko-Host Connect
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Need Assistance?
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/70">
              Send Ko-Host a question, concern, or request for
              help regarding this Connect conversation.
            </p>
          </div>

          <div className="p-6 sm:p-9">
            <div className="rounded-2xl border border-[#e1ddd4] bg-[#faf9f5] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Conversation with
              </div>

              <div className="mt-1 text-sm font-semibold text-neutral-900">
                {providerName}
              </div>
            </div>

            <form
              action="/api/connect/assistance"
              method="POST"
              className="mt-6 space-y-5"
            >
              <input
                type="hidden"
                name="mailbox"
                value={mailboxCode}
              />

              <input
                type="hidden"
                name="thread"
                value={thread.id}
              />

              <div>
                <label
                  htmlFor="assistanceType"
                  className="block text-xs font-semibold text-neutral-800"
                >
                  How can we help?
                </label>

                <select
                  id="assistanceType"
                  name="assistance_type"
                  required
                  defaultValue=""
                  className="mt-2 h-12 w-full rounded-xl border border-[#cdd5cf] bg-white px-3.5 text-sm text-neutral-900 outline-none focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
                >
                  <option value="" disabled>
                    Select an option
                  </option>

                  <option value="question">
                    General question
                  </option>

                  <option value="conversation_concern">
                    Question or concern about this conversation
                  </option>

                  <option value="provider_issue">
                    I need help with this provider
                  </option>

                  <option value="technical_problem">
                    Technical problem
                  </option>

                  <option value="other">
                    Something else
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold text-neutral-800"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={7}
                  placeholder="Tell us how we can help."
                  className="mt-2 w-full resize-y rounded-xl border border-[#cdd5cf] bg-white px-3.5 py-3 text-sm leading-6 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
                />

                <div className="mt-1 text-[10px] text-neutral-400">
                  Do not include passwords, mailbox PINs,
                  financial account information, or other
                  sensitive information.
                </div>
              </div>

              <div className="rounded-xl border border-[#d7e2dc] bg-[#f1f6f3] px-4 py-3 text-[11px] leading-5 text-[#52665d]">
                This message goes directly to Ko-Host support,
                not to the provider.
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7e2d8] pt-5">
                <Link
                  href={mailboxReturnUrl}
                  className="text-xs font-semibold text-[#55786a] hover:text-[#173f35]"
                >
                  ← Cancel
                </Link>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-[#173f35] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#0f3028]"
                >
                  Send to Ko-Host
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}