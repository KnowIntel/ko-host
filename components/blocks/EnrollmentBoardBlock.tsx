"use client";

import { useEffect, useMemo, useState } from "react";
import type { MicrositeBlock } from "@/lib/templates/builder";

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

  const quoteMaxLength = Math.max(
    25,
    Math.min(500, block.data.quoteMaxLength ?? 150),
  );

  const sortedEntries = useMemo(
    () => sortEntries(entries, block.data.sortOrder).slice(0, block.data.maxVisibleEntries ?? 24),
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
      setStatusMessage(block.data.successMessage ?? "You’ve been added to the board.");
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

      if (image) {
        formData.set("image", image);
      }

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
        window.localStorage.setItem(entryIdKey(micrositeId, block.id), data.entry.id);
      }

      setEntries((prev) => [data.entry, ...prev]);
      setName("");
      setQuote("");
      setEmail("");
      setImage(null);
      setStatusMessage(block.data.successMessage ?? "You’ve been added to the board.");

      const imageInput = document.getElementById(
        `enrollment-image-${block.id}`,
      ) as HTMLInputElement | null;

      if (imageInput) imageInput.value = "";
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
        headers: {
          "Content-Type": "application/json",
        },
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
      ? "flex items-center justify-between gap-3 border-b border-neutral-200 py-3"
      : "flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm";

  return (
    <div className="h-full w-full overflow-auto rounded-3xl border border-neutral-200 bg-white/90 p-4 text-neutral-950 shadow-sm">
      {block.data.showHeading !== false || block.data.showSubtitle !== false ? (
        <div className="mb-4">
          {block.data.showHeading !== false ? (
            <div className="text-xl font-black tracking-tight">
              {block.data.heading || "Join the Board"}
            </div>
          ) : null}

          {block.data.showSubtitle !== false ? (
            <div className="mt-1 text-sm font-medium text-neutral-500">
              {block.data.subtitle || "Add your name to the list."}
            </div>
          ) : null}

          {block.data.showEnrollmentCount !== false ? (
            <div className="mt-2 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
              {entries.length} enrolled
            </div>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="grid gap-3">
          <input
            type="text"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value.slice(0, 80))}
            placeholder={block.data.nameLabel ?? "Name"}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-900"
          />

          {block.data.showQuoteField !== false ? (
            <textarea
              value={quote}
              maxLength={quoteMaxLength}
              onChange={(e) => setQuote(e.target.value.slice(0, quoteMaxLength))}
              placeholder={block.data.quoteLabel ?? "Quote or message"}
              className="min-h-[76px] w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-900"
            />
          ) : null}

          {block.data.showQuoteField !== false ? (
            <div className="text-right text-[11px] font-bold text-neutral-400">
              {quote.length}/{quoteMaxLength}
            </div>
          ) : null}

          {block.data.showEmailField !== false ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={block.data.emailLabel ?? "Email"}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-900"
            />
          ) : null}

          {block.data.showImageUpload !== false ? (
            <label className="block">
              <div className="mb-1 text-xs font-bold text-neutral-500">
                {block.data.imageLabel ?? "Profile image"}
              </div>
              <input
                id={`enrollment-image-${block.id}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700"
              />
            </label>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || hasMine}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2 text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
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

      <div className="mt-4">
        {isLoading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-bold text-neutral-500">
            Loading enrollments...
          </div>
        ) : sortedEntries.length ? (
          <div className={listClass}>
            {sortedEntries.map((entry) => (
              <div key={entry.id} className={entryClass}>
                <div className="flex min-w-0 items-center gap-3">
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
                    <div className="truncate text-sm font-black text-neutral-950">
                      {entry.name}
                    </div>

                    {block.data.showQuotes !== false && entry.quote ? (
                      <div className="mt-0.5 line-clamp-2 text-xs font-medium text-neutral-500">
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
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
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
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-center text-sm font-bold text-neutral-500">
            {block.data.emptyListMessage || "No enrollments yet."}
          </div>
        )}
      </div>
    </div>
  );
}