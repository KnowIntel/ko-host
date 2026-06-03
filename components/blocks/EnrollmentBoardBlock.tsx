"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { MicrositeBlock, TextStyle } from "@/lib/templates/builder";
import { ENROLLMENT_BOARD_PROFILE_EVENT } from "@/components/blocks/enrollmentBoardEvents";

type EnrollmentBoardBlockProps = {
  block: Extract<MicrositeBlock, { type: "enrollment_board" }>;
  micrositeId?: string | null;
  designKey?: string;
};

type EnrollmentEntry = {
  id: string;
  name: string;
  quote?: string | null;
  profileImageUrl?: string | null;
  createdAt?: string;
  isMine?: boolean;
};

const TOKEN_KEY = "kht:enrollment-board:visitor-token";

function makeToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getVisitorToken() {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(TOKEN_KEY);
  if (existing) return existing;

  const next = makeToken();
  window.localStorage.setItem(TOKEN_KEY, next);
  return next;
}

function entryIdKey(micrositeId: string, blockId: string) {
  return `kht:enrollment-board:${micrositeId}:${blockId}:entry-id`;
}

function avatarClass(shape?: string) {
  if (shape === "square") return "rounded-none";
  if (shape === "rounded") return "rounded-xl";
  return "rounded-full";
}

function sortEntries(entries: EnrollmentEntry[], sortOrder?: string) {
  const next = [...entries];

  if (sortOrder === "oldest") {
    return next.sort((a, b) =>
      String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")),
    );
  }

  if (sortOrder === "alphabetical") {
    return next.sort((a, b) => a.name.localeCompare(b.name));
  }

  return next.sort((a, b) =>
    String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")),
  );
}

function withOpacity(color?: string, opacity?: number) {
  if (!color) return undefined;
  if (color === "transparent") return "transparent";

  const safeOpacity =
    typeof opacity === "number" && Number.isFinite(opacity)
      ? Math.max(0, Math.min(1, opacity))
      : 1;

  if (!color.startsWith("#")) return color;

  const hex = color.replace("#", "");
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : hex;

  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) return color;

  return `rgba(${r}, ${g}, ${b}, ${safeOpacity})`;
}

function styleToCss(style?: TextStyle): CSSProperties {
  const next = (style ?? {}) as TextStyle & {
    backgroundColor?: string;
    backgroundOpacity?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    scale?: number;
  };

  const decorations: string[] = [];
  if (next.underline) decorations.push("underline");
  if (next.strike) decorations.push("line-through");

  return {
    fontFamily:
      next.fontFamily && next.fontFamily !== "inherit"
        ? next.fontFamily
        : undefined,
    fontSize: next.fontSize ? `${next.fontSize}px` : undefined,
    fontWeight: next.bold ? 800 : undefined,
    fontStyle: next.italic ? "italic" : undefined,
    textDecoration: decorations.length ? decorations.join(" ") : undefined,
    textAlign: next.align ?? undefined,
    color: next.color || undefined,
    backgroundColor: withOpacity(next.backgroundColor, next.backgroundOpacity),
    borderColor: next.borderColor || undefined,
    borderWidth:
      typeof next.borderWidth === "number" ? `${next.borderWidth}px` : undefined,
    borderStyle:
      typeof next.borderWidth === "number" && next.borderWidth > 0
        ? "solid"
        : undefined,
    borderRadius:
      typeof next.borderRadius === "number"
        ? `${next.borderRadius}px`
        : undefined,
    transform:
      typeof next.scale === "number" && Number.isFinite(next.scale)
        ? `scale(${next.scale})`
        : undefined,
    transformOrigin: "center center",
  };
}

export default function EnrollmentBoardBlock({
  block,
  micrositeId,
}: EnrollmentBoardBlockProps) {
  const [visitorToken, setVisitorToken] = useState("");
  const [entries, setEntries] = useState<EnrollmentEntry[]>([]);
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(micrositeId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const blockStyle = styleToCss(block.data.style);
  const formStyle = styleToCss(block.data.formStyle);
  const inputStyle = styleToCss((block.data as any).inputStyle);
  const buttonStyle = styleToCss(block.data.buttonStyle);
  const listStyle = styleToCss((block.data as any).listStyle);
  const cardStyle = styleToCss(block.data.cardStyle);
  const headingStyle = styleToCss((block.data as any).headingStyle);
  const subtitleStyle = styleToCss((block.data as any).subtitleStyle);
  const imageLabelStyle = styleToCss((block.data as any).imageLabelStyle);
  const memberNameStyle = styleToCss((block.data as any).memberNameStyle);
  const memberQuoteStyle = styleToCss((block.data as any).memberQuoteStyle);

  const quoteMaxLength = Math.max(
    25,
    Math.min(500, block.data.quoteMaxLength ?? 150),
  );

  const sortedEntries = useMemo(
    () =>
      sortEntries(entries, block.data.sortOrder).slice(
        0,
        block.data.maxVisibleEntries ?? 24,
      ),
    [entries, block.data.sortOrder, block.data.maxVisibleEntries],
  );

  const hasMine = entries.some((entry) => entry.isMine);

  async function loadEntries(nextToken = visitorToken) {
    if (!micrositeId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const params = new URLSearchParams({
        micrositeId,
        blockId: block.id,
      });

      if (nextToken) params.set("visitorToken", nextToken);

      const res = await fetch(
        `/api/public/enrollment-board?${params.toString()}`,
        { cache: "no-store" },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load enrollments.");
      }

      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load enrollments.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const token = getVisitorToken();
    setVisitorToken(token);
    void loadEntries(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micrositeId, block.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!micrositeId) {
      const localEntry: EnrollmentEntry = {
        id: `local_${Date.now()}`,
        name: name.trim(),
        quote: quote.trim(),
        profileImageUrl: "",
        createdAt: new Date().toISOString(),
        isMine: true,
      };

      setEntries((prev) => [localEntry, ...prev]);
      setName("");
      setQuote("");
      setEmail("");
      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      setStatusMessage(
        block.data.successMessage ?? "You’ve been added to the board.",
      );
      setErrorMessage("");
      return;
    }

    if (hasMine) {
      setErrorMessage(
        block.data.alreadyEnrolledMessage ??
          "You’re already enrolled from this device.",
      );
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    if (block.data.requireQuote && !quote.trim()) {
      setErrorMessage("Quote is required.");
      return;
    }

    if (block.data.requireEmail && !email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    if (block.data.requireImage && !image) {
      setErrorMessage("Profile image is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setStatusMessage("");

      const formData = new FormData();
      formData.set("micrositeId", micrositeId);
      formData.set("blockId", block.id);
      formData.set("visitorToken", visitorToken || getVisitorToken());
      formData.set("name", name.trim());
      formData.set("quote", quote.trim());
      formData.set("email", email.trim());

      if (image) formData.set("image", image);

      const res = await fetch("/api/public/enrollment-board", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            block.data.alreadyEnrolledMessage ||
            "Failed to submit enrollment.",
        );
      }

      if (data.entry?.id) {
        window.localStorage.setItem(
          entryIdKey(micrositeId, block.id),
          data.entry.id,
        );
      }

      setEntries((prev) => [data.entry, ...prev]);
      setName("");
      setQuote("");
      setEmail("");
      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      setStatusMessage(
        block.data.successMessage ?? "You’ve been added to the board.",
      );
      
window.dispatchEvent(
  new CustomEvent(ENROLLMENT_BOARD_PROFILE_EVENT, {
    detail: {
      micrositeId,
      enrollmentBlockId: block.id,
      linkedProfileImageBlockId: block.data.linkedProfileImageBlockId,
      linkedNameLabelBlockId: block.data.linkedNameLabelBlockId,
      linkedQuoteLabelBlockId: block.data.linkedQuoteLabelBlockId,
      profileImageUrl: null,
      name: null,
      quote: null,
      activeCount: Math.max(0, entries.length - 1),
    },
  }),
);

    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit enrollment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entryId: string) {
    if (!micrositeId || deletingId) return;

    try {
      setDeletingId(entryId);
      setErrorMessage("");
      setStatusMessage("");

      const res = await fetch("/api/public/enrollment-board", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          micrositeId,
          blockId: block.id,
          entryId,
          visitorToken: visitorToken || getVisitorToken(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete enrollment.");
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      window.localStorage.removeItem(entryIdKey(micrositeId, block.id));
      setStatusMessage("Your enrollment was removed.");

      window.dispatchEvent(
  new CustomEvent(ENROLLMENT_BOARD_PROFILE_EVENT, {
    detail: {
      micrositeId,
      enrollmentBlockId: block.id,
      activeCount: entries.length + 1,
      linkedProfileImageBlockId: block.data.linkedProfileImageBlockId,
      linkedNameLabelBlockId: block.data.linkedNameLabelBlockId,
      linkedQuoteLabelBlockId: block.data.linkedQuoteLabelBlockId,
      profileImageUrl: null,
      name: null,
      quote: null,
    },
  }),
);


    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete enrollment.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const listClass =
    block.data.variant === "member_wall"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
      : "space-y-3";

const entryClass =
  block.data.variant === "signature_list"
    ? "flex items-center gap-3 py-3"
    : "flex items-center gap-3 p-3 shadow-sm";

  return (
    <div
      className="h-full w-full overflow-auto p-4 text-neutral-950"
      style={{
        borderStyle: "solid",
        ...blockStyle,
      }}
    >
      {block.data.showHeading !== false || block.data.showSubtitle !== false ? (
        <div className="mb-4">
 {block.data.showHeading !== false ? (
  <div
    className="font-black tracking-tight"
    style={{
      marginBottom: 12,
      lineHeight: 1.15,
    }}
  >
    {block.data.heading || "Join the Board"}
  </div>
) : null}

{block.data.showSubtitle !== false ? (
  <div
    className="mt-3 font-medium"
    style={{
      lineHeight: 1.5,
      ...subtitleStyle,
    }}
  >
    {block.data.subtitle || "Add your name to the list."}
  </div>
) : null}

          {block.data.showEnrollmentCount !== false ? (
            <div
              className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: "rgba(0,0,0,0.06)",
                color: subtitleStyle.color ?? "#4b5563",
              }}
            >
              {entries.length} enrolled
            </div>
          ) : null}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="p-3"
        style={{
          borderStyle: "solid",
          ...formStyle,
        }}
      >
        <div className="grid gap-3">
          <input
            type="text"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value.slice(0, 80))}
            placeholder={block.data.nameLabel ?? "Name"}
            className="w-full px-3 py-2 text-sm font-semibold outline-none"
            style={{
              borderStyle: "solid",
              ...inputStyle,
            }}
          />

          {block.data.showQuoteField !== false ? (
            <textarea
              value={quote}
              maxLength={quoteMaxLength}
              onChange={(e) =>
                setQuote(e.target.value.slice(0, quoteMaxLength))
              }
              placeholder={block.data.quoteLabel ?? "Quote or message"}
              className="min-h-[76px] w-full resize-none px-3 py-2 text-sm font-semibold outline-none"
              style={{
                borderStyle: "solid",
                ...inputStyle,
              }}
            />
          ) : null}

          {block.data.showQuoteField !== false ? (
            <div className="text-right text-[11px] font-bold opacity-60">
              {quote.length}/{quoteMaxLength}
            </div>
          ) : null}

          {block.data.showEmailField !== false ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={block.data.emailLabel ?? "Email"}
              className="w-full px-3 py-2 text-sm font-semibold outline-none"
              style={{
                borderStyle: "solid",
                ...inputStyle,
              }}
            />
          ) : null}

          {block.data.showImageUpload !== false ? (
            <label className="block">
<div
  className="mb-1 text-xs font-bold opacity-70"
  style={imageLabelStyle}
>
  {block.data.imageLabel ?? "Profile image"}
</div>
<input
  ref={imageInputRef}
  id={`enrollment-image-${block.id}`}
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
  className="w-full px-3 py-2 text-sm font-semibold"
  style={{
    borderStyle: "solid",
    ...inputStyle,
  }}
/>
            </label>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || hasMine}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              borderStyle: "solid",
              ...buttonStyle,
            }}
          >
            {isSubmitting
              ? "Submitting..."
              : hasMine
                ? "Already enrolled"
                : block.data.submitButtonText || "Submit"}
          </button>
        </div>

        {statusMessage ? (
          <div className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
            {statusMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </form>

      <div
        className="mt-4"
        style={{
          borderStyle: "solid",
          ...listStyle,
        }}
      >
        {isLoading ? (
          <div
            className="p-4 text-sm font-bold"
            style={{
              borderStyle: "solid",
              ...cardStyle,
            }}
          >
            Loading enrollments...
          </div>
        ) : sortedEntries.length ? (
          <div className={listClass}>
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className={entryClass}
                style={{
                  borderStyle: "solid",
                  ...cardStyle,
                }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {block.data.showProfileImages !== false ? (
                    entry.profileImageUrl ? (
                      <img
                        src={entry.profileImageUrl}
                        alt={entry.name}
                        className={`h-11 w-11 shrink-0 object-cover ${avatarClass(
                          block.data.avatarShape,
                        )}`}
                      />
                    ) : (
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center bg-neutral-200 text-sm font-black text-neutral-600 ${avatarClass(
                          block.data.avatarShape,
                        )}`}
                      >
                        {entry.name.slice(0, 1).toUpperCase()}
                      </div>
                    )
                  ) : null}

                  <div className="min-w-0">
                    <div
                      className="truncate text-sm font-black"
                      style={memberNameStyle}
                    >
                      {entry.name}
                    </div>

                    {block.data.showQuotes !== false && entry.quote ? (
                      <div
                        className="mt-0.5 line-clamp-2 text-xs font-medium"
                        style={memberQuoteStyle}
                      >
                        {entry.quote}
                      </div>
                    ) : null}
                  </div>
                </div>

                {entry.isMine ? (
                  <button
                    type="button"
                    onClick={() => void handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    title="Remove your enrollment"
                    aria-label="Remove your enrollment"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="border border-dashed p-4 text-center text-sm font-bold"
            style={{
              ...cardStyle,
            }}
          >
            {block.data.emptyListMessage || "No enrollments yet."}
          </div>
        )}
      </div>
    </div>
  );
}