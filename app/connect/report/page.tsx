// app/connect/report/page.tsx

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
            Report unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Reports can only be submitted from an active,
            authenticated Ko-Host Connect mailbox.
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

export default async function ReportUserPage({
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
   * Load the mailbox server-side.
   * A mailbox code supplied in the URL is NOT authentication.
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
   * Require the same authenticated mailbox cookie used by
   * the private consumer mailbox.
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
   * The requested thread must actually belong to this
   * authenticated mailbox.
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
              Report received
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Your report regarding{" "}
              <strong>
                {providerName}
              </strong>{" "}
              has been submitted to Ko-Host for review.
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
              Report User
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/70">
              Report concerning behavior within a private
              Ko-Host Connect conversation.
            </p>
          </div>

          <div className="p-6 sm:p-9">
            <div className="rounded-2xl border border-[#e1ddd4] bg-[#faf9f5] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Provider
              </div>

              <div className="mt-1 text-sm font-semibold text-neutral-900">
                {providerName}
              </div>
            </div>

            <form
              action="/api/connect/report"
              method="POST"
              className="mt-6 space-y-5"
            >
              {/*
                These values identify the mailbox/thread,
                but the API must independently authenticate
                and verify them. They are never trusted merely
                because they came from this form.
              */}
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
                  htmlFor="reason"
                  className="block text-xs font-semibold text-neutral-800"
                >
                  Reason for report
                </label>

                <select
                  id="reason"
                  name="reason"
                  required
                  defaultValue=""
                  className="mt-2 h-12 w-full rounded-xl border border-[#cdd5cf] bg-white px-3.5 text-sm text-neutral-900 outline-none focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
                >
                  <option value="" disabled>
                    Select a reason
                  </option>

                  <option value="harassment">
                    Harassment or threatening behavior
                  </option>

                  <option value="spam">
                    Spam or unwanted solicitation
                  </option>

                  <option value="fraud_scam">
                    Suspected fraud or scam
                  </option>

                  <option value="inappropriate_content">
                    Inappropriate content
                  </option>

                  <option value="unsafe_behavior">
                    Unsafe behavior or safety concern
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="details"
                  className="block text-xs font-semibold text-neutral-800"
                >
                  Tell us what happened
                </label>

                <textarea
                  id="details"
                  name="details"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={7}
                  placeholder="Please provide enough information for Ko-Host to review your concern."
                  className="mt-2 w-full resize-y rounded-xl border border-[#cdd5cf] bg-white px-3.5 py-3 text-sm leading-6 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
                />

                <div className="mt-1 text-[10px] text-neutral-400">
                  Do not include passwords, PINs, financial
                  account information, or other sensitive
                  information.
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-900">
                If you believe someone is in immediate danger,
                contact the appropriate emergency services.
                This form is for reporting conduct to Ko-Host.
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
                  className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-xs font-semibold text-white transition hover:bg-red-800"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}