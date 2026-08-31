"use client";

import Link from "next/link";

import {
  SignInButton,
  useUser,
} from "@clerk/nextjs";

import {
  useEffect,
  useState,
} from "react";

type SubmitStatus =
  | "idle"
  | "sending"
  | "sent"
  | "error";

const REQUEST_TYPES = [
  {
    value: "question",
    label: "Question",
    icon: "💬",
    description:
      "Ask us anything about using Ko-Host.",
  },

  {
    value: "technical_problem",
    label: "Technical Problem",
    icon: "🛠️",
    description:
      "Something isn't working the way you expected.",
  },

  {
    value: "suggestion",
    label: "Suggestion",
    icon: "💡",
    description:
      "Share an idea for improving Ko-Host.",
  },

  {
    value: "feature_request",
    label: "Feature Request",
    icon: "✨",
    description:
      "Tell us about a feature you'd like to see.",
  },

  {
    value: "billing_account",
    label: "Billing / Account",
    icon: "👤",
    description:
      "Questions about purchases, access, or your account.",
  },

  {
    value: "other",
    label: "Other",
    icon: "✉️",
    description:
      "Something else you'd like to discuss.",
  },
];

export default function HelpFeedbackPage() {
  const {
  isLoaded: isUserLoaded,
  isSignedIn,
  user,
} = useUser();

const accountEmail =
  user?.primaryEmailAddress?.emailAddress ??
  "";

const accountName =
  user?.fullName?.trim() ||
  [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
  "Ko-Host Customer";

  const [
    status,
    setStatus,
  ] =
    useState<SubmitStatus>(
      "idle",
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    requestId,
    setRequestId,
  ] =
    useState("");

  const [
    requestType,
    setRequestType,
  ] =
    useState(
      "question",
    );

  const [
    initialSiteUrl,
    setInitialSiteUrl,
  ] =
    useState("");

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    setInitialSiteUrl(
      params.get(
        "siteUrl",
      ) || "",
    );

    const requestedType =
      params.get(
        "type",
      );

    if (
      requestedType &&
      REQUEST_TYPES.some(
        (item) =>
          item.value ===
          requestedType,
      )
    ) {
      setRequestType(
        requestedType,
      );
    }
  }, []);

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (
    !isUserLoaded ||
    !isSignedIn ||
    !user
  ) {
    setStatus("error");

    setErrorMessage(
      "You must be signed in to your Ko-Host account to send a Help & Feedback request.",
    );

    return;
  }

  const form =
    event.currentTarget;

    setStatus(
      "sending",
    );

    setErrorMessage(
      "",
    );

    setRequestId(
      "",
    );

    try {
      const formData =
        new FormData(
          form,
        );

      const payload = {
        requestType:
          String(
            formData.get(
              "requestType",
            ) ?? "",
          ),

name:
  accountName,

email:
  accountEmail,

        subject:
          String(
            formData.get(
              "subject",
            ) ?? "",
          ),

        siteUrl:
          String(
            formData.get(
              "siteUrl",
            ) ?? "",
          ),

        message:
          String(
            formData.get(
              "message",
            ) ?? "",
          ),
      };

      const response =
        await fetch(
          "/api/help-feedback",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const result =
        await response
          .json()
          .catch(
            () => null,
          );

      if (
        !response.ok
      ) {
        setStatus(
          "error",
        );

        setErrorMessage(
          result?.error ||
            "Something went wrong.",
        );

        return;
      }

      form.reset();

      setRequestType(
        "question",
      );

      setRequestId(
        String(
          result?.requestId ??
            "",
        ),
      );

      setStatus(
        "sent",
      );
    } catch (
      error
    ) {
      setStatus(
        "error",
      );

      setErrorMessage(
        error instanceof
          Error
          ? error.message
          : "Failed to submit your message.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
        {/* BACKGROUND */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-180px] top-[-120px] h-[480px] w-[480px] rounded-full bg-blue-500/20 blur-[120px]" />

          <div className="absolute bottom-[-180px] right-[-100px] h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[130px]" />

          <div className="absolute left-1/2 top-[360px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* HEADER */}

          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              Ko-Host Help & Feedback
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
              How can we help?
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Have a question, found a problem, or have an idea for making Ko-Host better?
              Send us a message.
            </p>
          </div>

          {/* REQUEST TYPE CARDS */}

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REQUEST_TYPES.map(
              (item) => {
                const active =
                  requestType ===
                  item.value;

                return (
                  <button
                    key={
                      item.value
                    }
                    type="button"
                    onClick={() =>
                      setRequestType(
                        item.value,
                      )
                    }
                    className={[
                      "rounded-3xl border p-4 text-left transition",

                      active
                        ? "border-blue-400 bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                        : "border-white/10 bg-white/[0.07] hover:-translate-y-0.5 hover:bg-white/[0.11]",
                    ].join(
                      " ",
                    )}
                  >
                    <div className="text-2xl">
                      {item.icon}
                    </div>

                    <div className="mt-3 text-sm font-black text-white">
                      {
                        item.label
                      }
                    </div>

                    <div className="mt-1 text-xs leading-5 text-white/60">
                      {
                        item.description
                      }
                    </div>
                  </button>
                );
              },
            )}
          </div>

          {/* FORM */}

          <form
            onSubmit={
              handleSubmit
            }
            className="mx-auto mt-10 max-w-2xl rounded-[32px] border border-white/10 bg-white p-5 text-neutral-950 shadow-2xl sm:p-8"
          >
            <input
              type="hidden"
              name="requestType"
              value={
                requestType
              }
            />

            <div className="text-2xl font-black">
              Send us a message
            </div>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Tell us what's on your mind. If your message requires a response, we'll contact you by email.
            </p>

            <div className="mt-6 grid gap-4">
              {/* TYPE */}

              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
                  Request Type
                </div>

                <select
                  value={
                    requestType
                  }
                  onChange={(
                    event,
                  ) =>
                    setRequestType(
                      event
                        .target
                        .value,
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                >
                  {REQUEST_TYPES.map(
                    (
                      item,
                    ) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

{/* ACCOUNT NAME / EMAIL */}

<div className="grid gap-4 sm:grid-cols-2">
  <div>
    <div className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
      Account Name
    </div>

    <input
      type="text"
      value={
        isSignedIn
          ? accountName
          : ""
      }
      readOnly
      tabIndex={-1}
      className="h-12 w-full cursor-default rounded-2xl border border-neutral-200 bg-neutral-100 px-4 text-sm text-neutral-600 outline-none"
    />
  </div>

  <div>
    <div className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
      Account Email
    </div>

    <input
      type="email"
      value={
        isSignedIn
          ? accountEmail
          : ""
      }
      readOnly
      tabIndex={-1}
      className="h-12 w-full cursor-default rounded-2xl border border-neutral-200 bg-neutral-100 px-4 text-sm text-neutral-600 outline-none"
    />
  </div>
</div>

              {/* SUBJECT */}

              <input
                name="subject"
                required
                maxLength={
                  200
                }
                placeholder="Subject"
                className="h-12 rounded-2xl border border-neutral-200 px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />

              {/* OPTIONAL SITE */}

              <div>
                <input
                  name="siteUrl"
                  defaultValue={
                    initialSiteUrl
                  }
                  placeholder="Ko-Host microsite URL (optional)"
                  className="h-12 w-full rounded-2xl border border-neutral-200 px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                />

                <div className="mt-1.5 px-1 text-[11px] leading-4 text-neutral-500">
                  If your question relates to a particular microsite, include its address here.
                </div>
              </div>

              {/* MESSAGE */}

              <textarea
                name="message"
                required
                maxLength={
                  5000
                }
                placeholder="How can we help?"
                className="min-h-[170px] rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />

              {/* SUBMIT */}

{!isUserLoaded ? (
  <button
    type="button"
    disabled
    className="mt-2 h-12 rounded-full bg-neutral-950 px-6 text-sm font-black text-white opacity-60"
  >
    Loading Account...
  </button>
) : !isSignedIn ? (
  <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 p-4">
    <div className="text-sm font-semibold text-blue-950">
      Sign in required
    </div>

    <div className="mt-1 text-xs leading-5 text-blue-800/80">
      Help & Feedback requests can only be sent from a Ko-Host account.
    </div>

    <SignInButton mode="modal">
      <button
        type="button"
        className="mt-3 h-11 rounded-full bg-neutral-950 px-6 text-sm font-black text-white transition hover:bg-neutral-800"
      >
        Sign In to Ko-Host
      </button>
    </SignInButton>
  </div>
) : (
  <button
    type="submit"
    disabled={
      status === "sending" ||
      !accountEmail
    }
    className="mt-2 h-12 rounded-full bg-neutral-950 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {status === "sending"
      ? "Sending..."
      : "Send Message"}
  </button>
)}

              {/* SUCCESS */}

              {status ===
              "sent" ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-semibold text-green-700">
                  <div className="text-base">
                    Message sent ✅
                  </div>

                  <div className="mt-1 font-medium text-green-700/80">
                    Check your email for confirmation.
                  </div>

                  {requestId ? (
                    <div className="mt-2 text-xs font-medium text-green-700/70">
                      Request ID:{" "}
                      {
                        requestId
                      }
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* ERROR */}

              {status ===
              "error" ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {
                    errorMessage
                  }
                </div>
              ) : null}
            </div>
          </form>

          {/* FOOTER ACTIONS */}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link
              href="/templates"
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15"
            >
              Browse Templates
            </Link>

            <Link
              href="/faq"
              className="rounded-full px-4 py-2 font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              Visit FAQ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
} 
