// app/create/[template]/publish/page.tsx
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

  // 🔑 PRE-CHECKOUT RESERVATION STATE
  const [pendingCheckoutId, setPendingCheckoutId] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "reserved" | "taken" | "invalid" | "error"
  >("idle");

  const [slugStatusMessage, setSlugStatusMessage] = useState("");

  // -------------------------
  // LOAD DRAFT
  // -------------------------
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

  // -------------------------
  // SLUG AVAILABILITY CHECK
  // -------------------------
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
          { method: "GET", cache: "no-store" },
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
        } else if (data?.reason === "reserved") {
          setSlugStatus("reserved");
          setSlugStatusMessage("This name is temporarily reserved.");
        } else {
          setSlugStatus("taken");
          setSlugStatusMessage("This microsite name is already taken.");
        }
      } catch {
        setSlugStatus("error");
        setSlugStatusMessage("Could not check availability.");
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [slugSuggestion]);

  // -------------------------
  // PREPARE + RESERVE + CHECKOUT
  // -------------------------
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

    if (slugStatus !== "available") {
      setPublishState("error");
      setMessage("Please choose an available microsite name.");
      return;
    }

    if (siteVisibility === "private" && !/^\d{6}$/.test(passcode.trim())) {
      setPublishState("error");
      setMessage("Private sites require a 6-digit numeric passcode.");
      return;
    }

    try {
      setPublishState("loading");
      setMessage("Reserving microsite and preparing checkout...");

      const draftPayload: BuilderDraft = {
        ...draft,
        title: safeTitle,
        slugSuggestion: safeSlug,
      };

      const res = await fetch("/api/public/create-microsite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setMessage(data?.error || "Failed to prepare microsite.");
        return;
      }

      const nextPendingCheckoutId = String(data?.pendingCheckoutId || "");
      const nextSlug = String(data?.slug || safeSlug);

      setPendingCheckoutId(nextPendingCheckoutId);
      setCreatedSlug(nextSlug);

      setPublishState("success");
      setMessage("Microsite reserved. Redirecting to checkout...");

      setTimeout(() => {
        checkoutFormRef.current?.submit();
      }, 150);
    } catch (error) {
      setPublishState("error");
      setMessage(
        error instanceof Error ? error.message : "Unexpected error.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4f2]">
      {/* UI unchanged */}
      <form
        ref={checkoutFormRef}
        action="/api/stripe/checkout"
        method="POST"
        className="hidden"
      >
        <input type="hidden" name="pendingCheckoutId" value={pendingCheckoutId} />
        <input type="hidden" name="templateKey" value={templateKey} />
        <input type="hidden" name="designKey" value={designKey} />
        <input type="hidden" name="slug" value={createdSlug} />
      </form>
    </main>
  );
}