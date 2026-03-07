"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addBlock,
  createStarterDraft,
  moveBlock,
  normalizeLegacyDraft,
  removeBlock,
  sanitizeBuilderDraft,
  updateBlock,
  type BuilderBlockType,
  type BuilderDraft,
  type MicrositeBlock,
} from "@/lib/templates/builder";

type DraftInput = {
  title?: string;
  slugSuggestion?: string;
  announcement?: string | { headline?: string; body?: string };
  links?: Array<{ label?: string; url?: string }>;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  blocks?: MicrositeBlock[];
};

type Props = {
  templateKey: string;
  initialDraft?: DraftInput;
  submitLabel?: string;
  onSubmit?: (draft: BuilderDraft) => void | Promise<void>;
};

const BLOCK_OPTIONS: Array<{ type: BuilderBlockType; label: string }> = [
  { type: "announcement", label: "Announcement" },
  { type: "links", label: "Links" },
  { type: "contact", label: "Contact" },
  { type: "gallery", label: "Gallery" },
  { type: "poll", label: "Poll" },
  { type: "rsvp", label: "RSVP" },
  { type: "richText", label: "Rich Text" },
  { type: "faq", label: "FAQ" },
  { type: "countdown", label: "Countdown" },
  { type: "cta", label: "Call To Action" },
];

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

function textInputClass() {
  return "mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
}

function textareaClass() {
  return "mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 min-h-[110px]";
}

function sectionCardClass() {
  return "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-")
    .slice(0, 63);
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function buildSmartSlugCandidates(title: string, templateKey: string) {
  const cleanTitle = slugify(title);
  const cleanTemplate = slugify(templateKey.replace(/_/g, "-"));
  const words = cleanTitle.split("-").filter(Boolean);
  const compact = words.slice(0, 2).join("-");
  const first = words[0] || cleanTemplate || "site";
  const second = words[1] || "";
  const year = new Date().getFullYear().toString().slice(-2);

  return uniqueStrings([
    cleanTitle,
    compact,
    `${cleanTitle}-page`,
    `${cleanTitle}-hub`,
    `${cleanTitle}-site`,
    `${compact || first}-${year}`,
    `${first}${second ? `-${second}` : ""}-${cleanTemplate}`,
    `${cleanTemplate}-${first}`,
    `${first}-online`,
    `${first}-now`,
    `${first}-info`,
    `${first}-home`,
  ]).map(slugify);
}

async function checkSlugAvailability(slug: string) {
  const res = await fetch(
    `/api/microsites/check-slug?slug=${encodeURIComponent(slug)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || "Failed to check site name.");
  }

  const available =
    typeof data?.available === "boolean"
      ? data.available
      : typeof data?.isAvailable === "boolean"
        ? data.isAvailable
        : false;

  return available;
}

export default function TemplateDraftEditor({
  templateKey,
  initialDraft,
  submitLabel = "Continue",
  onSubmit,
}: Props) {
  const router = useRouter();

  const initial = useMemo(() => {
    if (initialDraft?.blocks?.length) {
      return sanitizeBuilderDraft({
        title: initialDraft.title ?? "",
        slugSuggestion: initialDraft.slugSuggestion ?? "",
        blocks: initialDraft.blocks,
      });
    }

    if (initialDraft) {
      return sanitizeBuilderDraft(normalizeLegacyDraft(initialDraft));
    }

    return createStarterDraft("");
  }, [initialDraft]);

  const [draft, setDraft] = useState<BuilderDraft>(initial);
  const [newBlockType, setNewBlockType] = useState<BuilderBlockType>("announcement");
  const [siteVisibility, setSiteVisibility] = useState<"public" | "private" | "members_only">("public");
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugMessage, setSlugMessage] = useState("");
  const [isAutoGeneratingSlug, setIsAutoGeneratingSlug] = useState(false);

  const slugRequestIdRef = useRef(0);
  const hasManuallyEditedSlugRef = useRef(false);
  const lastGeneratedTitleRef = useRef("");

  function setTitle(value: string) {
    setDraft((prev) => ({ ...prev, title: value }));
  }

  function setSlugSuggestion(value: string) {
    setDraft((prev) => ({ ...prev, slugSuggestion: slugify(value) }));
  }

  function handleAddBlock() {
    setDraft((prev) => addBlock(prev, newBlockType));
  }

  function handleRemoveBlock(blockId: string) {
    setDraft((prev) => removeBlock(prev, blockId));
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setDraft((prev) => moveBlock(prev, index, index - 1));
  }

  function handleMoveDown(index: number) {
    if (index === draft.blocks.length - 1) return;
    setDraft((prev) => moveBlock(prev, index, index + 1));
  }

  async function validateSlug(slugValue: string) {
    const normalized = slugify(slugValue);

    if (!normalized) {
      setSlugStatus("invalid");
      setSlugMessage("Enter a site name.");
      return false;
    }

    if (normalized.length < 3) {
      setSlugStatus("invalid");
      setSlugMessage("Must be at least 3 characters.");
      return false;
    }

    const requestId = ++slugRequestIdRef.current;
    setSlugStatus("checking");
    setSlugMessage("Checking...");

    try {
      const available = await checkSlugAvailability(normalized);

      if (requestId !== slugRequestIdRef.current) {
        return false;
      }

      if (available) {
        setSlugStatus("available");
        setSlugMessage("Available");
        return true;
      }

      setSlugStatus("taken");
      setSlugMessage("Taken");
      return false;
    } catch {
      if (requestId !== slugRequestIdRef.current) {
        return false;
      }

      setSlugStatus("error");
      setSlugMessage("Could not verify.");
      return false;
    }
  }

async function generateAvailableSlug(force = false) {
  const baseTitle = (draft.title || initialDraft?.title || "site").trim();
  if (!baseTitle) return;

  if (!force && hasManuallyEditedSlugRef.current) return;

  const titleKey = `${baseTitle}::${templateKey}`;
  if (!force && lastGeneratedTitleRef.current === titleKey) return;

  const currentSlug = slugify(draft.slugSuggestion);
  const baseSlug = slugify(baseTitle || templateKey || "site") || "site";

  const candidates = force
    ? uniqueStrings([
        `${currentSlug || baseSlug}-2`,
        `${currentSlug || baseSlug}-3`,
        `${currentSlug || baseSlug}-4`,
        `${baseSlug}-2`,
        `${baseSlug}-3`,
        `${baseSlug}-4`,
        ...buildSmartSlugCandidates(baseTitle, templateKey)
          .filter((candidate) => candidate !== currentSlug)
          .map((candidate) => `${candidate}-2`),
        ...buildSmartSlugCandidates(baseTitle, templateKey)
          .filter((candidate) => candidate !== currentSlug),
      ]).map(slugify)
    : buildSmartSlugCandidates(baseTitle, templateKey);

  if (!candidates.length) return;

  setIsAutoGeneratingSlug(true);
  setSlugStatus("checking");
  setSlugMessage("Generating...");

  try {
    for (const candidate of candidates) {
      if (!candidate) continue;
      if (force && candidate === currentSlug) continue;

      try {
        const available = await checkSlugAvailability(candidate);

        if (available) {
          setDraft((prev) => ({
            ...prev,
            slugSuggestion: candidate,
          }));
          setSlugStatus("available");
          setSlugMessage("Available");
          lastGeneratedTitleRef.current = titleKey;
          return;
        }
      } catch {
        // continue
      }
    }

    setSlugStatus("taken");
    setSlugMessage("Taken");
  } finally {
    setIsAutoGeneratingSlug(false);
  }
}

  useEffect(() => {
    if (!draft.title?.trim()) return;
    void generateAvailableSlug(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.title, templateKey]);

  useEffect(() => {
    const normalized = slugify(draft.slugSuggestion);

    if (!normalized) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }

    const timer = window.setTimeout(() => {
      void validateSlug(normalized);
    }, 350);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.slugSuggestion]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);

      const cleaned = sanitizeBuilderDraft(draft);
      const normalizedSlug = slugify(cleaned.slugSuggestion);

      setDraft({
        ...cleaned,
        slugSuggestion: normalizedSlug,
      });

      const slugOk = await validateSlug(normalizedSlug);

      if (!slugOk) {
        return;
      }

      if (!onSubmit && siteVisibility === "private") {
        if (!/^\d{6}$/.test(passcode.trim())) {
          alert("Private sites require a 6-digit numeric passcode.");
          return;
        }
      }

      if (onSubmit) {
        await onSubmit({
          ...cleaned,
          slugSuggestion: normalizedSlug,
        });
        return;
      }

      const createRes = await fetch("/api/public/create-microsite", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          templateKey,
          title: cleaned.title,
          slugSuggestion: normalizedSlug,
          siteVisibility,
          privateMode: siteVisibility !== "public",
          passcode: siteVisibility === "private" ? passcode.trim() : "",
          draftJson: {
            ...cleaned,
            slugSuggestion: normalizedSlug,
          },
        }),
      });

      const createData = await createRes.json().catch(() => ({}));

      if (!createRes.ok) {
        alert(createData?.error || "Failed to save microsite draft.");
        return;
      }

      const checkoutForm = document.createElement("form");
      checkoutForm.method = "POST";
      checkoutForm.action = "/api/stripe/checkout";

      const micrositeIdInput = document.createElement("input");
      micrositeIdInput.type = "hidden";
      micrositeIdInput.name = "pendingCheckoutId";
      micrositeIdInput.value = String(createData.pendingCheckoutId || "");
      checkoutForm.appendChild(micrositeIdInput);

      const slugInput = document.createElement("input");
      slugInput.type = "hidden";
      slugInput.name = "slug";
      slugInput.value = String(createData.slug || "");
      checkoutForm.appendChild(slugInput);

      const templateKeyInput = document.createElement("input");
      templateKeyInput.type = "hidden";
      templateKeyInput.name = "templateKey";
      templateKeyInput.value = String(templateKey);
      checkoutForm.appendChild(templateKeyInput);

      document.body.appendChild(checkoutForm);
      checkoutForm.submit();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error.";
      alert(message);
    } finally {
      setSubmitting(false);
      router.refresh();
    }
  }

  function updateAnnouncement(blockId: string, field: "headline" | "body", value: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "announcement"
          ? {
              ...block,
              data: {
                ...block.data,
                [field]: value,
              },
            }
          : block,
      ),
    );
  }

  function updateLinksHeading(blockId: string, value: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "links"
          ? {
              ...block,
              data: {
                ...block.data,
                heading: value,
              },
            }
          : block,
      ),
    );
  }

  function updateLinkItem(
    blockId: string,
    itemId: string,
    field: "label" | "url",
    value: string,
  ) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "links"
          ? {
              ...block,
              data: {
                ...block.data,
                items: block.data.items.map((item) =>
                  item.id === itemId ? { ...item, [field]: value } : item,
                ),
              },
            }
          : block,
      ),
    );
  }

  function addLinkItem(blockId: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "links"
          ? {
              ...block,
              data: {
                ...block.data,
                items: [
                  ...block.data.items,
                  {
                    id: `link_${Math.random().toString(36).slice(2, 10)}`,
                    label: "",
                    url: "",
                  },
                ],
              },
            }
          : block,
      ),
    );
  }

  function removeLinkItem(blockId: string, itemId: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "links"
          ? {
              ...block,
              data: {
                ...block.data,
                items: block.data.items.filter((item) => item.id !== itemId),
              },
            }
          : block,
      ),
    );
  }

  function updateContact(
    blockId: string,
    field: "heading" | "name" | "email" | "phone",
    value: string,
  ) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "contact"
          ? {
              ...block,
              data: {
                ...block.data,
                [field]: value,
              },
            }
          : block,
      ),
    );
  }

  function updateGalleryHeading(blockId: string, value: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "gallery"
          ? {
              ...block,
              data: {
                ...block.data,
                heading: value,
              },
            }
          : block,
      ),
    );
  }

  function addGalleryItem(blockId: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "gallery"
          ? {
              ...block,
              data: {
                ...block.data,
                items: [
                  ...block.data.items,
                  {
                    id: `gallery_${Math.random().toString(36).slice(2, 10)}`,
                    url: "",
                    caption: "",
                  },
                ],
              },
            }
          : block,
      ),
    );
  }

  function updateGalleryItem(
    blockId: string,
    itemId: string,
    field: "url" | "caption",
    value: string,
  ) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "gallery"
          ? {
              ...block,
              data: {
                ...block.data,
                items: block.data.items.map((item) =>
                  item.id === itemId ? { ...item, [field]: value } : item,
                ),
              },
            }
          : block,
      ),
    );
  }

  function removeGalleryItem(blockId: string, itemId: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "gallery"
          ? {
              ...block,
              data: {
                ...block.data,
                items: block.data.items.filter((item) => item.id !== itemId),
              },
            }
          : block,
      ),
    );
  }

  function updatePoll(
    blockId: string,
    field: "question" | "allowMultiple",
    value: string | boolean,
  ) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "poll"
          ? {
              ...block,
              data: {
                ...block.data,
                [field]: value,
              },
            }
          : block,
      ),
    );
  }

  function addPollOption(blockId: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "poll"
          ? {
              ...block,
              data: {
                ...block.data,
                options: [
                  ...block.data.options,
                  {
                    id: `poll_option_${Math.random().toString(36).slice(2, 10)}`,
                    text: "",
                  },
                ],
              },
            }
          : block,
      ),
    );
  }

  function updatePollOption(blockId: string, optionId: string, value: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "poll"
          ? {
              ...block,
              data: {
                ...block.data,
                options: block.data.options.map((option) =>
                  option.id === optionId ? { ...option, text: value } : option,
                ),
              },
            }
          : block,
      ),
    );
  }

  function removePollOption(blockId: string, optionId: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "poll"
          ? {
              ...block,
              data: {
                ...block.data,
                options: block.data.options.filter((option) => option.id !== optionId),
              },
            }
          : block,
      ),
    );
  }

  function updateRsvp(
    blockId: string,
    field:
      | "heading"
      | "eventDate"
      | "collectGuestCount"
      | "collectMealChoice"
      | "notesPlaceholder",
    value: string | boolean,
  ) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "rsvp"
          ? {
              ...block,
              data: {
                ...block.data,
                [field]: value,
              },
            }
          : block,
      ),
    );
  }

  function updateRichText(blockId: string, field: "heading" | "body", value: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "richText"
          ? {
              ...block,
              data: {
                ...block.data,
                [field]: value,
              },
            }
          : block,
      ),
    );
  }

  function updateFaqHeading(blockId: string, value: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "faq"
          ? {
              ...block,
              data: {
                ...block.data,
                heading: value,
              },
            }
          : block,
      ),
    );
  }

  function addFaqItem(blockId: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "faq"
          ? {
              ...block,
              data: {
                ...block.data,
                items: [
                  ...block.data.items,
                  {
                    id: `faq_${Math.random().toString(36).slice(2, 10)}`,
                    question: "",
                    answer: "",
                  },
                ],
              },
            }
          : block,
      ),
    );
  }

  function updateFaqItem(
    blockId: string,
    itemId: string,
    field: "question" | "answer",
    value: string,
  ) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "faq"
          ? {
              ...block,
              data: {
                ...block.data,
                items: block.data.items.map((item) =>
                  item.id === itemId ? { ...item, [field]: value } : item,
                ),
              },
            }
          : block,
      ),
    );
  }

  function removeFaqItem(blockId: string, itemId: string) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "faq"
          ? {
              ...block,
              data: {
                ...block.data,
                items: block.data.items.filter((item) => item.id !== itemId),
              },
            }
          : block,
      ),
    );
  }

  function updateCountdown(
    blockId: string,
    field: "heading" | "targetIso" | "completedMessage",
    value: string,
  ) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "countdown"
          ? {
              ...block,
              data: {
                ...block.data,
                [field]: value,
              },
            }
          : block,
      ),
    );
  }

  function updateCta(
    blockId: string,
    field: "heading" | "body" | "buttonText" | "buttonUrl",
    value: string,
  ) {
    setDraft((prev) =>
      updateBlock(prev, blockId, (block) =>
        block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                [field]: value,
              },
            }
          : block,
      ),
    );
  }

  function slugToneClass() {
    if (slugStatus === "available") return "text-blue-600";
    if (
      slugStatus === "taken" ||
      slugStatus === "invalid" ||
      slugStatus === "error"
    ) {
      return "text-red-600";
    }
    return "text-neutral-500";
  }

  const siteNamePreview = draft.slugSuggestion
    ? `${draft.slugSuggestion}.ko-host.com`
    : "your-site-name.ko-host.com";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={sectionCardClass()}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-neutral-900">Title</label>
            <input
              value={draft.title}
              onChange={(e) => setTitle(e.target.value)}
              className={textInputClass()}
              placeholder="Dedication"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-neutral-900">
                Site Name
              </label>

              {!onSubmit && (
                <button
                  type="button"
                  onClick={() => {
                    hasManuallyEditedSlugRef.current = false;
                    void generateAvailableSlug(true);
                  }}
                  disabled={isAutoGeneratingSlug}
                  className="text-xs font-medium text-neutral-700 underline underline-offset-4 disabled:opacity-50"
                >
                  {isAutoGeneratingSlug ? "Generating..." : "Generate suggestion"}
                </button>
              )}
            </div>

            <input
              value={draft.slugSuggestion}
              onChange={(e) => {
                hasManuallyEditedSlugRef.current = true;
                setSlugSuggestion(e.target.value);
              }}
              className={textInputClass()}
              placeholder="your-site-name"
            />

            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
              <div className="truncate text-neutral-500">
                {siteNamePreview}
              </div>
              <div className={`shrink-0 text-right font-medium ${slugToneClass()}`}>
                {slugMessage || ""}
              </div>
            </div>
          </div>

          {!onSubmit && (
            <>
              <div>
                <label className="text-sm font-medium text-neutral-900">
                  Site Visibility
                </label>
                <select
                  value={siteVisibility}
                  onChange={(e) =>
                    setSiteVisibility(
                      e.target.value as "public" | "private" | "members_only",
                    )
                  }
                  className={textInputClass()}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="members_only">Members Only</option>
                </select>
              </div>

              {siteVisibility === "private" && (
                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Passcode
                  </label>
                  <input
                    value={passcode}
                    onChange={(e) =>
                      setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    maxLength={6}
                    className={textInputClass()}
                    placeholder="123456"
                  />
                  <div className="mt-2 text-xs text-neutral-500">
                    Enter a 6-digit numeric passcode.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={sectionCardClass()}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="min-w-0 flex-1">
            <label className="text-sm font-medium text-neutral-900">Add Section</label>
            <select
              value={newBlockType}
              onChange={(e) => setNewBlockType(e.target.value as BuilderBlockType)}
              className={textInputClass()}
            >
              {BLOCK_OPTIONS.map((option) => (
                <option key={option.type} value={option.type}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddBlock}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Add Block
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {draft.blocks.map((block, index) => (
          <div key={block.id} className={sectionCardClass()}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {index + 1}. {block.label}
                </div>
                <div className="text-xs text-neutral-500">{block.type}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-900 disabled:opacity-40"
                >
                  Move Up
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === draft.blocks.length - 1}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-900 disabled:opacity-40"
                >
                  Move Down
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveBlock(block.id)}
                  className="rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>

            {block.type === "announcement" && (
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-900">Headline</label>
                  <input
                    value={block.data.headline}
                    onChange={(e) =>
                      updateAnnouncement(block.id, "headline", e.target.value)
                    }
                    className={textInputClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">Body</label>
                  <textarea
                    value={block.data.body}
                    onChange={(e) =>
                      updateAnnouncement(block.id, "body", e.target.value)
                    }
                    className={textareaClass()}
                  />
                </div>
              </div>
            )}

            {block.type === "links" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-900">Heading</label>
                  <input
                    value={block.data.heading}
                    onChange={(e) => updateLinksHeading(block.id, e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div className="space-y-3">
                  {block.data.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-neutral-200 p-3"
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-neutral-900">
                            Label
                          </label>
                          <input
                            value={item.label}
                            onChange={(e) =>
                              updateLinkItem(block.id, item.id, "label", e.target.value)
                            }
                            className={textInputClass()}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-neutral-900">
                            URL
                          </label>
                          <input
                            value={item.url}
                            onChange={(e) =>
                              updateLinkItem(block.id, item.id, "url", e.target.value)
                            }
                            className={textInputClass()}
                            placeholder="https://"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLinkItem(block.id, item.id)}
                        className="mt-3 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-700"
                      >
                        Remove Link
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addLinkItem(block.id)}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-900"
                >
                  Add Link
                </button>
              </div>
            )}

            {block.type === "contact" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-neutral-900">Heading</label>
                  <input
                    value={block.data.heading}
                    onChange={(e) => updateContact(block.id, "heading", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">Name</label>
                  <input
                    value={block.data.name}
                    onChange={(e) => updateContact(block.id, "name", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">Email</label>
                  <input
                    value={block.data.email}
                    onChange={(e) => updateContact(block.id, "email", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">Phone</label>
                  <input
                    value={block.data.phone}
                    onChange={(e) => updateContact(block.id, "phone", e.target.value)}
                    className={textInputClass()}
                  />
                </div>
              </div>
            )}

            {block.type === "gallery" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-900">Heading</label>
                  <input
                    value={block.data.heading}
                    onChange={(e) => updateGalleryHeading(block.id, e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div className="space-y-3">
                  {block.data.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-neutral-200 p-3"
                    >
                      <div className="grid gap-3">
                        <div>
                          <label className="text-sm font-medium text-neutral-900">
                            Image URL
                          </label>
                          <input
                            value={item.url}
                            onChange={(e) =>
                              updateGalleryItem(block.id, item.id, "url", e.target.value)
                            }
                            className={textInputClass()}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-neutral-900">
                            Caption
                          </label>
                          <input
                            value={item.caption ?? ""}
                            onChange={(e) =>
                              updateGalleryItem(
                                block.id,
                                item.id,
                                "caption",
                                e.target.value,
                              )
                            }
                            className={textInputClass()}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeGalleryItem(block.id, item.id)}
                        className="mt-3 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-700"
                      >
                        Remove Image
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addGalleryItem(block.id)}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-900"
                >
                  Add Image
                </button>
              </div>
            )}

            {block.type === "poll" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-900">Question</label>
                  <input
                    value={block.data.question}
                    onChange={(e) => updatePoll(block.id, "question", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-neutral-900">
                  <input
                    type="checkbox"
                    checked={block.data.allowMultiple}
                    onChange={(e) =>
                      updatePoll(block.id, "allowMultiple", e.target.checked)
                    }
                  />
                  Allow multiple selections
                </label>

                <div className="space-y-3">
                  {block.data.options.map((option) => (
                    <div
                      key={option.id}
                      className="rounded-xl border border-neutral-200 p-3"
                    >
                      <label className="text-sm font-medium text-neutral-900">
                        Option
                      </label>
                      <input
                        value={option.text}
                        onChange={(e) =>
                          updatePollOption(block.id, option.id, e.target.value)
                        }
                        className={textInputClass()}
                      />

                      <button
                        type="button"
                        onClick={() => removePollOption(block.id, option.id)}
                        className="mt-3 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-700"
                      >
                        Remove Option
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addPollOption(block.id)}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-900"
                >
                  Add Option
                </button>
              </div>
            )}

            {block.type === "rsvp" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-neutral-900">Heading</label>
                  <input
                    value={block.data.heading}
                    onChange={(e) => updateRsvp(block.id, "heading", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Event Date
                  </label>
                  <input
                    value={block.data.eventDate}
                    onChange={(e) => updateRsvp(block.id, "eventDate", e.target.value)}
                    className={textInputClass()}
                    placeholder="2026-06-20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Notes Placeholder
                  </label>
                  <input
                    value={block.data.notesPlaceholder}
                    onChange={(e) =>
                      updateRsvp(block.id, "notesPlaceholder", e.target.value)
                    }
                    className={textInputClass()}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-neutral-900">
                  <input
                    type="checkbox"
                    checked={block.data.collectGuestCount}
                    onChange={(e) =>
                      updateRsvp(block.id, "collectGuestCount", e.target.checked)
                    }
                  />
                  Collect guest count
                </label>

                <label className="flex items-center gap-2 text-sm text-neutral-900">
                  <input
                    type="checkbox"
                    checked={block.data.collectMealChoice}
                    onChange={(e) =>
                      updateRsvp(block.id, "collectMealChoice", e.target.checked)
                    }
                  />
                  Collect meal choice
                </label>
              </div>
            )}

            {block.type === "richText" && (
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-900">Heading</label>
                  <input
                    value={block.data.heading}
                    onChange={(e) => updateRichText(block.id, "heading", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">Body</label>
                  <textarea
                    value={block.data.body}
                    onChange={(e) => updateRichText(block.id, "body", e.target.value)}
                    className={textareaClass()}
                  />
                </div>
              </div>
            )}

            {block.type === "faq" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-900">Heading</label>
                  <input
                    value={block.data.heading}
                    onChange={(e) => updateFaqHeading(block.id, e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div className="space-y-3">
                  {block.data.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-neutral-200 p-3"
                    >
                      <div className="grid gap-3">
                        <div>
                          <label className="text-sm font-medium text-neutral-900">
                            Question
                          </label>
                          <input
                            value={item.question}
                            onChange={(e) =>
                              updateFaqItem(
                                block.id,
                                item.id,
                                "question",
                                e.target.value,
                              )
                            }
                            className={textInputClass()}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-neutral-900">
                            Answer
                          </label>
                          <textarea
                            value={item.answer}
                            onChange={(e) =>
                              updateFaqItem(block.id, item.id, "answer", e.target.value)
                            }
                            className={textareaClass()}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFaqItem(block.id, item.id)}
                        className="mt-3 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-700"
                      >
                        Remove FAQ
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addFaqItem(block.id)}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-900"
                >
                  Add FAQ
                </button>
              </div>
            )}

            {block.type === "countdown" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-neutral-900">Heading</label>
                  <input
                    value={block.data.heading}
                    onChange={(e) => updateCountdown(block.id, "heading", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Target ISO Date
                  </label>
                  <input
                    value={block.data.targetIso}
                    onChange={(e) => updateCountdown(block.id, "targetIso", e.target.value)}
                    className={textInputClass()}
                    placeholder="2026-12-31T23:59:59"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Completed Message
                  </label>
                  <input
                    value={block.data.completedMessage}
                    onChange={(e) =>
                      updateCountdown(block.id, "completedMessage", e.target.value)
                    }
                    className={textInputClass()}
                  />
                </div>
              </div>
            )}

            {block.type === "cta" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-neutral-900">Heading</label>
                  <input
                    value={block.data.heading}
                    onChange={(e) => updateCta(block.id, "heading", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-neutral-900">Body</label>
                  <textarea
                    value={block.data.body}
                    onChange={(e) => updateCta(block.id, "body", e.target.value)}
                    className={textareaClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Button Text
                  </label>
                  <input
                    value={block.data.buttonText}
                    onChange={(e) => updateCta(block.id, "buttonText", e.target.value)}
                    className={textInputClass()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Button URL
                  </label>
                  <input
                    value={block.data.buttonUrl}
                    onChange={(e) => updateCta(block.id, "buttonUrl", e.target.value)}
                    className={textInputClass()}
                    placeholder="https://"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={
            submitting ||
            slugStatus === "checking" ||
            slugStatus === "taken" ||
            slugStatus === "invalid" ||
            slugStatus === "error"
          }
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? "Working..." : submitLabel}
        </button>
      </div>
    </form>
  );
}