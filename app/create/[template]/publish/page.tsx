// app\create\[template]\publish\page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";
import type { BuilderDraft } from "@/lib/templates/builder";

type PublishState = "idle" | "loading" | "success" | "error";

function resolveTemplateFromRoute(rawTemplate: string) {
  const normalized = normalizeTemplateKey(rawTemplate);

  return (
    getTemplateDef(normalized) ||
    TEMPLATE_DEFS.find((t) => normalizeTemplateKey(t.demoSlug) === normalized) ||
    TEMPLATE_DEFS.find((t) => normalizeTemplateKey(t.thumb) === normalized) ||
    TEMPLATE_DEFS.find(
      (t) => normalizeTemplateKey(t.title.replace(/\s+/g, "_")) === normalized,
    ) ||
    TEMPLATE_DEFS[0]
  );
}

function buildCreateDraftStorageKey(templateKey: string, designKey: string) {
  return `kht:create-draft:${templateKey}:${designKey}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function PublishMicrositePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const checkoutFormRef = useRef<HTMLFormElement | null>(null);

  const rawTemplate = String(params?.template || "");
  const rawDesign = searchParams.get("design") || "blank";

  const templateDef = useMemo(
    () => resolveTemplateFromRoute(rawTemplate),
    [rawTemplate],
  );

  const templateKey = templateDef.key;
  const designKey = useMemo(
    () => normalizeTemplateKey(rawDesign || "blank"),
    [rawDesign],
  );

  const storageKey = useMemo(
    () => buildCreateDraftStorageKey(templateKey, designKey),
    [templateKey, designKey],
  );

  const [draft, setDraft] = useState<BuilderDraft | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);

  const [title, setTitle] = useState("");
const [slugSuggestion, setSlugSuggestion] = useState("");
const [siteVisibility, setSiteVisibility] = useState<"public" | "private">(
  "public",
);
const [passcode, setPasscode] = useState("");
const [publishState, setPublishState] = useState<PublishState>("idle");
const [message, setMessage] = useState("");
const [pendingCheckoutId, setPendingCheckoutId] = useState("");
const [createdSlug, setCreatedSlug] = useState("");
const [slugStatus, setSlugStatus] = useState<
  "idle" | "checking" | "available" | "taken" | "invalid" | "error"
>("idle");
const [slugStatusMessage, setSlugStatusMessage] = useState("");

  useEffect(() => {
    setLoadingDraft(true);

    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        setDraft(null);
        setTitle(templateDef.defaultDraft?.title || templateDef.title || "");
        setSlugSuggestion(
          templateDef.defaultDraft?.slugSuggestion ||
            slugify(templateDef.title || templateKey),
        );
        setMessage("No saved builder draft was found for this template/design.");
        return;
      }

      const parsed = JSON.parse(raw) as BuilderDraft;
      setDraft(parsed);

      const resolvedTitle =
        (parsed.title || "").trim() ||
        templateDef.defaultDraft?.title ||
        templateDef.title ||
        "";

      const resolvedSlug =
        (parsed.slugSuggestion || "").trim() ||
        templateDef.defaultDraft?.slugSuggestion ||
        slugify(resolvedTitle || templateDef.title || templateKey);

      setTitle(resolvedTitle);
      setSlugSuggestion(resolvedSlug);
      setMessage("");
    } catch {
      setDraft(null);
      setTitle(templateDef.defaultDraft?.title || templateDef.title || "");
      setSlugSuggestion(
        templateDef.defaultDraft?.slugSuggestion ||
          slugify(templateDef.title || templateKey),
      );
      setMessage("Saved draft could not be loaded.");
    } finally {
      setLoadingDraft(false);
    }
  }, [storageKey, templateDef, templateKey]);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugSuggestion.trim()) {
      setSlugSuggestion(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugSuggestion(slugify(value));
  }
  useEffect(() => {
  const safeSlug = slugify(slugSuggestion);

  if (!safeSlug) {
    setSlugStatus("invalid");
    setSlugStatusMessage("Enter a valid microsite name.");
    return;
  }

  if (safeSlug.length < 3) {
    setSlugStatus("invalid");
    setSlugStatusMessage("Microsite name must be at least 3 characters.");
    return;
  }

  setSlugStatus("checking");
  setSlugStatusMessage("Checking availability...");

  const timer = window.setTimeout(async () => {
    try {
        const res = await fetch(
        `/api/microsites/check-slug?slug=${encodeURIComponent(safeSlug)}`,
        {
            method: "GET",
            cache: "no-store",
        },
        );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSlugStatus("error");
        setSlugStatusMessage(data?.error || "Could not check availability.");
        return;
      }

      if (data?.available) {
        setSlugStatus("available");
        setSlugStatusMessage("This microsite name is available.");
        } else {
        setSlugStatus("taken");
        setSlugStatusMessage(
            data?.reason === "reserved"
            ? "That microsite name is currently reserved."
            : "That microsite name is already taken.",
        );
        }
    } catch {
      setSlugStatus("error");
      setSlugStatusMessage("Could not check availability.");
    }
  }, 400);

  return () => {
    window.clearTimeout(timer);
  };
}, [slugSuggestion]);

  async function handlePreparePublish() {
    if (!draft) {
      setPublishState("error");
      setMessage("No builder draft found. Save your draft first.");
      return;
    }

    const safeTitle = title.trim();
    const safeSlug = slugify(slugSuggestion);

    if (!safeTitle) {
      setPublishState("error");
      setMessage("Please enter a microsite title.");
      return;
    }

    if (!safeSlug) {
      setPublishState("error");
      setMessage("Please choose a valid microsite name.");
      return;
    }

    if (slugStatus === "checking") {
  setPublishState("error");
  setMessage("Please wait for microsite name availability check to finish.");
  return;
}

if (slugStatus === "taken") {
  setPublishState("error");
  setMessage("Please choose a different microsite name.");
  return;
}

if (slugStatus === "invalid" || slugStatus === "error") {
  setPublishState("error");
  setMessage("Please enter a valid available microsite name.");
  return;
}

    if (siteVisibility === "private" && !/^\d{6}$/.test(passcode.trim())) {
      setPublishState("error");
      setMessage("Private sites require a 6-digit numeric passcode.");
      return;
    }

    try {
      setPublishState("loading");
      setMessage("Preparing microsite draft for checkout...");

      const draftPayload: BuilderDraft = {
        ...draft,
        title: safeTitle,
        slugSuggestion: safeSlug,
      };

      const res = await fetch("/api/public/create-microsite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateKey,
          designKey,
          title: safeTitle,
          slugSuggestion: safeSlug,
          siteVisibility,
          privateMode: "passcode",
          passcode: siteVisibility === "private" ? passcode.trim() : "",
          draftJson: draftPayload,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPublishState("error");
        setMessage(data?.error || "Failed to prepare microsite for publish.");
        return;
      }

      const nextPendingCheckoutId = String(data?.pendingCheckoutId || "");
      const nextSlug = String(data?.slug || safeSlug);

      if (!nextPendingCheckoutId) {
        setPublishState("error");
        setMessage("Microsite draft was prepared, but checkout could not start.");
        return;
      }

      setPendingCheckoutId(nextPendingCheckoutId);
      setCreatedSlug(nextSlug);
      setPublishState("success");
      setMessage("Microsite prepared. Redirecting to checkout...");

      window.setTimeout(() => {
        checkoutFormRef.current?.submit();
      }, 150);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error.";
      setPublishState("error");
      setMessage(errorMessage);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4f2]">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-rose-100/35 via-stone-100/30 to-amber-100/35" />

            <div className="relative">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                  Publish Setup
                </span>

                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    publishState === "success"
                      ? "bg-emerald-700 text-white"
                      : publishState === "loading"
                        ? "bg-neutral-900 text-white"
                        : publishState === "error"
                          ? "bg-red-700 text-white"
                          : "bg-neutral-200 text-neutral-800",
                  ].join(" ")}
                >
                  {publishState === "success"
                    ? "Prepared"
                    : publishState === "loading"
                      ? "Preparing"
                      : publishState === "error"
                        ? "Error"
                        : "Ready"}
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                Publish {templateDef.title || "Microsite"}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-[15px]">
                Choose your microsite title and site name before continuing to
                checkout.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                  Template: {templateDef.title}
                </span>
                <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                  Design: {designKey}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
            {loadingDraft ? (
              <div className="text-sm text-neutral-600">
                Loading your saved draft...
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Microsite Title
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
                    placeholder="Enter microsite title"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Microsite Name
                  </div>
                  <input
                    type="text"
                    value={slugSuggestion}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
                    placeholder="choose-your-site-name"
                  />
<div className="mt-2 text-xs text-neutral-500">
  Public URL pattern: {(slugSuggestion || "your-site-name")}.ko-host.com
</div>

<div
  className={[
    "mt-2 text-xs font-medium",
    slugStatus === "available"
      ? "text-emerald-600"
      : slugStatus === "checking"
        ? "text-neutral-500"
        : slugStatus === "taken" ||
            slugStatus === "invalid" ||
            slugStatus === "error"
          ? "text-red-600"
          : "text-neutral-500",
  ].join(" ")}
>
  {slugStatusMessage}
</div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Visibility
                  </div>

                  <div className="mt-2 grid gap-3">
                    <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                      <input
                        type="radio"
                        name="siteVisibility"
                        checked={siteVisibility === "public"}
                        onChange={() => setSiteVisibility("public")}
                      />
                      Public
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                      <input
                        type="radio"
                        name="siteVisibility"
                        checked={siteVisibility === "private"}
                        onChange={() => setSiteVisibility("private")}
                      />
                      Private (6-digit passcode)
                    </label>
                  </div>
                </div>

                {siteVisibility === "private" ? (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Passcode
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={passcode}
                      onChange={(e) =>
                        setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
                      placeholder="6-digit passcode"
                    />
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/create/${encodeURIComponent(
                      templateKey,
                    )}?design=${encodeURIComponent(designKey)}`}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Back to Builder
                  </Link>

                    <button
                    type="button"
                    onClick={() => void handlePreparePublish()}
                    disabled={
                        publishState === "loading" ||
                        loadingDraft ||
                        slugStatus !== "available"
                    }
                    className="inline-flex items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    {publishState === "loading"
                      ? "Preparing..."
                      : "Continue to Checkout"}
                  </button>
                </div>

                {message ? (
                  <div
                    className={[
                      "rounded-xl border px-4 py-3 text-sm",
                      publishState === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : publishState === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-neutral-200 bg-neutral-50 text-neutral-700",
                    ].join(" ")}
                  >
                    {message}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Publish Summary
              </div>

              {(() => {
                const blocks = Array.isArray(draft?.blocks)
                  ? draft.blocks.filter(Boolean)
                  : [];

                const customBlockBreakdown = blocks.reduce((acc, block) => {
                  const type = block?.type || "unknown";
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                const pageVisibility = (draft as {
                  pageVisibility?: Partial<{
                    title: boolean;
                    subtitle: boolean;
                    subtext: boolean;
                    description: boolean;
                  }>;
                }).pageVisibility ?? {};

                const pageElementBreakdown: Record<string, number> = {};
                let pageElementCount = 0;

                if (pageVisibility.title) {
                  pageElementBreakdown.title = 1;
                  pageElementCount += 1;
                }

                if (pageVisibility.subtitle) {
                  pageElementBreakdown.subtitle = 1;
                  pageElementCount += 1;
                }

                if (pageVisibility.subtext) {
                  pageElementBreakdown.tagline = 1;
                  pageElementCount += 1;
                }

                if (pageVisibility.description) {
                  pageElementBreakdown.description = 1;
                  pageElementCount += 1;
                }

                const totalCount =
                  Object.values(customBlockBreakdown).reduce((a, b) => a + b, 0) +
                  pageElementCount;

                const combinedBreakdown = {
                  ...pageElementBreakdown,
                  ...customBlockBreakdown,
                };

                const breakdownText = Object.entries(combinedBreakdown)
                  .map(([type, count]) => `${type}: ${count}`)
                  .join(", ");

                return (
                  <div className="mt-4 space-y-2 text-sm text-neutral-700">
                    <div>Template: {templateDef.title || templateKey}</div>
                    <div>Design: {designKey}</div>
                    <div>Draft Title: {title || "—"}</div>
                    <div>Site Name: {slugSuggestion || "—"}</div>
                    <div>Visibility: {siteVisibility}</div>
                    <div>
                      Blocks: {totalCount}
                      {totalCount > 0 ? (
                        <span className="ml-1 text-neutral-500">
                          ({breakdownText})
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })()}
            </div>

            {publishState === "success" ? (
              <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Pending Checkout Created
                </div>

                <div className="mt-4 space-y-2 text-sm text-emerald-800">
                  <div>Pending Checkout ID: {pendingCheckoutId || "—"}</div>
                  <div>Reserved Site Name: {createdSlug || "—"}</div>
                </div>

                <div className="mt-4 text-xs text-emerald-700">
                  Redirecting into Stripe checkout...
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <form
          ref={checkoutFormRef}
          action="/api/stripe/checkout"
          method="POST"
          className="hidden"
        >
          <input
            type="hidden"
            name="pendingCheckoutId"
            value={pendingCheckoutId}
          />
          <input type="hidden" name="templateKey" value={templateKey} />
          <input type="hidden" name="designKey" value={designKey} />
          <input type="hidden" name="slug" value={createdSlug} />
        </form>
      </div>
    </main>
  );
}