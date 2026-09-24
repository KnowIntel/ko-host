"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ConnectService = {
  id: string;
  slug: string;
  name: string;
  search_tags: string[];
};

type SubmissionSuccess = {
  requestCode: string;
  mailboxCode: string;
  mailboxPin: string;
  mailboxPath: string;
};

type RankedService = ConnectService & {
  searchScore: number;
};

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/*
 * Words that usually add little value when determining
 * which service a consumer is looking for.
 *
 * We do NOT remove meaningful action words such as:
 * cut, clean, repair, remove, install, walk, etc.
 */
const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "can",
  "do",
  "for",
  "from",
  "get",
  "have",
  "i",
  "id",
  "i'd",
  "im",
  "i'm",
  "in",
  "is",
  "it",
  "me",
  "my",
  "need",
  "of",
  "on",
  "please",
  "some",
  "someone",
  "that",
  "the",
  "this",
  "to",
  "want",
  "with",
]);

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .filter(
      (token) =>
        token.length > 0 &&
        !SEARCH_STOP_WORDS.has(token),
    );
}

/*
 * Lightweight stemming for common customer phrasing.
 *
 * This lets related words such as:
 *
 * cleaning -> clean
 * chopped  -> chop
 * trimming -> trim
 * repairs  -> repair
 *
 * contribute to the same service match without requiring
 * every grammatical variation to exist as a database tag.
 */
function stemSearchToken(token: string) {
  let value = token;

  if (
    value.length > 5 &&
    value.endsWith("ies")
  ) {
    value = `${value.slice(0, -3)}y`;
  } else if (
    value.length > 5 &&
    value.endsWith("ing")
  ) {
    value = value.slice(0, -3);

    /*
     * trimming -> trimm -> trim
     * sitting -> sitt -> sit
     */
    if (
      value.length >= 4 &&
      value[value.length - 1] ===
        value[value.length - 2]
    ) {
      value = value.slice(0, -1);
    }
  } else if (
    value.length > 4 &&
    value.endsWith("ed")
  ) {
    value = value.slice(0, -2);

    /*
     * chopped -> chopp -> chop
     */
    if (
      value.length >= 4 &&
      value[value.length - 1] ===
        value[value.length - 2]
    ) {
      value = value.slice(0, -1);
    }
  } else if (
    value.length > 4 &&
    value.endsWith("es")
  ) {
    value = value.slice(0, -2);
  } else if (
    value.length > 3 &&
    value.endsWith("s")
  ) {
    value = value.slice(0, -1);
  }

  return value;
}

function getStemmedTokens(value: string) {
  return getSearchTokens(value).map(
    stemSearchToken,
  );
}

function countTokenOverlap(
  queryTokens: string[],
  candidateTokens: string[],
) {
  const candidateSet = new Set(
    candidateTokens,
  );

  return queryTokens.filter((token) =>
    candidateSet.has(token),
  ).length;
}

function scoreSearchCandidate(
  query: string,
  candidate: string,
  isCanonicalName: boolean,
) {
  const normalizedQuery =
    normalizeSearchText(query);

  const normalizedCandidate =
    normalizeSearchText(candidate);

  if (
    !normalizedQuery ||
    !normalizedCandidate
  ) {
    return 0;
  }

  /*
   * Highest confidence:
   * exact canonical service name.
   */
  if (
    normalizedQuery ===
    normalizedCandidate
  ) {
    return isCanonicalName
      ? 10000
      : 9000;
  }

  /*
   * Very strong phrase match.
   *
   * Example:
   * "I need a tree chopped down"
   * contains tag "tree chopped down".
   */
  if (
    normalizedQuery.includes(
      normalizedCandidate,
    )
  ) {
    return (
      (isCanonicalName ? 7000 : 6500) +
      normalizedCandidate.length
    );
  }

  /*
   * Useful while typing.
   *
   * Example:
   * "tree rem" begins matching
   * "tree removal".
   */
  if (
    normalizedCandidate.startsWith(
      normalizedQuery,
    )
  ) {
    return (
      (isCanonicalName ? 6000 : 5500) +
      normalizedQuery.length
    );
  }

  const queryTokens =
    getStemmedTokens(normalizedQuery);

  const candidateTokens =
    getStemmedTokens(
      normalizedCandidate,
    );

  if (
    queryTokens.length === 0 ||
    candidateTokens.length === 0
  ) {
    return 0;
  }

  const overlap = countTokenOverlap(
    queryTokens,
    candidateTokens,
  );

  if (overlap === 0) {
    /*
     * Last-resort partial token matching,
     * primarily useful while the user is
     * still typing a word.
     */
    let partialMatches = 0;

    for (const queryToken of queryTokens) {
      if (queryToken.length < 3) {
        continue;
      }

      const hasPartial =
        candidateTokens.some(
          (candidateToken) =>
            candidateToken.startsWith(
              queryToken,
            ) ||
            queryToken.startsWith(
              candidateToken,
            ),
        );

      if (hasPartial) {
        partialMatches += 1;
      }
    }

    if (partialMatches === 0) {
      return 0;
    }

    return (
      partialMatches * 250 +
      (isCanonicalName ? 100 : 0)
    );
  }

  const queryCoverage =
    overlap / queryTokens.length;

  const candidateCoverage =
    overlap /
    candidateTokens.length;

  let score =
    overlap * 700 +
    queryCoverage * 500 +
    candidateCoverage * 300;

  /*
   * Give canonical service names a modest
   * preference when otherwise equally relevant.
   */
  if (isCanonicalName) {
    score += 150;
  }

  /*
   * Matching multiple meaningful words is
   * significantly stronger than matching one
   * generic word.
   */
  if (overlap >= 2) {
    score += 900;
  }

  if (
    overlap === queryTokens.length &&
    queryTokens.length > 1
  ) {
    score += 700;
  }

  return score;
}

function getServiceSearchScore(
  service: ConnectService,
  query: string,
) {
  let bestScore =
    scoreSearchCandidate(
      query,
      service.name,
      true,
    );

  for (const tag of service.search_tags) {
    const tagScore =
      scoreSearchCandidate(
        query,
        tag,
        false,
      );

    if (tagScore > bestScore) {
      bestScore = tagScore;
    }
  }

  return bestScore;
}

export default function ConnectRequestPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [
    services,
    setServices,
  ] = useState<ConnectService[]>([]);

  const [
    servicesLoading,
    setServicesLoading,
  ] = useState(true);

  const [
    servicesError,
    setServicesError,
  ] = useState("");

  const [service, setService] =
    useState("");

  const [
    serviceSearch,
    setServiceSearch,
  ] = useState("");

  const [
    showServices,
    setShowServices,
  ] = useState(false);

  const [zipCode, setZipCode] =
    useState("");

  const [
    serviceNeededDate,
    setServiceNeededDate,
  ] = useState("");

  const [details, setDetails] =
    useState("");

  const [
    notificationEmail,
    setNotificationEmail,
  ] = useState("");

  const [images, setImages] =
    useState<File[]>([]);

  const [
    imagePreviews,
    setImagePreviews,
  ] = useState<string[]>([]);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    submissionSuccess,
    setSubmissionSuccess,
  ] =
    useState<SubmissionSuccess | null>(
      null,
    );

  const [
    copiedField,
    setCopiedField,
  ] = useState<
    "link" | "pin" | ""
  >("");

  /*
   * Load active Ko-Host Connect services,
   * including their natural-language
   * search vocabulary.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        setServicesLoading(true);
        setServicesError("");

        const response = await fetch(
          "/api/connect/services",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result = await response
          .json()
          .catch(() => ({}));

        if (
          !response.ok ||
          !result?.ok
        ) {
          throw new Error(
            result?.error ||
              "Unable to load Ko-Host Connect services.",
          );
        }

        const loadedServices =
          Array.isArray(
            result?.services,
          )
            ? result.services.filter(
                (
                  item: unknown,
                ): item is ConnectService => {
                  if (
                    !item ||
                    typeof item !==
                      "object"
                  ) {
                    return false;
                  }

                  const candidate =
                    item as Record<
                      string,
                      unknown
                    >;

                  return (
                    typeof candidate.id ===
                      "string" &&
                    typeof candidate.slug ===
                      "string" &&
                    typeof candidate.name ===
                      "string" &&
                    Array.isArray(
                      candidate.search_tags,
                    ) &&
                    candidate.search_tags.every(
                      (tag) =>
                        typeof tag ===
                        "string",
                    )
                  );
                },
              )
            : [];

        if (cancelled) return;

        setServices(
          loadedServices,
        );

        if (
          loadedServices.length === 0
        ) {
          setServicesError(
            "No Ko-Host Connect services are currently available.",
          );
        }
      } catch (loadError) {
        if (cancelled) return;

        setServices([]);

        setServicesError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load Ko-Host Connect services.",
        );
      } finally {
        if (!cancelled) {
          setServicesLoading(false);
        }
      }
    }

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Rank services by customer intent.
   *
   * Empty search:
   * preserve the database/catalog order.
   *
   * Search entered:
   * compare the query against both the
   * canonical service name and all
   * database search tags.
   */
  const filteredServices =
    useMemo(() => {
      const query =
        serviceSearch.trim();

      if (!query) {
        return services;
      }

      return services
        .map(
          (
            item,
          ): RankedService => ({
            ...item,
            searchScore:
              getServiceSearchScore(
                item,
                query,
              ),
          }),
        )
        .filter(
          (item) =>
            item.searchScore > 0,
        )
        .sort((a, b) => {
          if (
            b.searchScore !==
            a.searchScore
          ) {
            return (
              b.searchScore -
              a.searchScore
            );
          }

          return a.name.localeCompare(
            b.name,
          );
        });
    }, [
      serviceSearch,
      services,
    ]);

  /*
   * Build temporary browser preview URLs
   * for selected images.
   */
  useEffect(() => {
    const previews = images.map(
      (file) =>
        URL.createObjectURL(file),
    );

    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  function chooseService(
    item: ConnectService,
  ) {
    setService(item.name);
    setServiceSearch(item.name);
    setShowServices(false);
    setError("");
  }

  function handleImageSelection(
    files: FileList | null,
  ) {
    if (!files) return;

    const incoming =
      Array.from(files);

    const validFiles =
      incoming.filter((file) => {
        const validType = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(file.type);

        const validSize =
          file.size <=
          MAX_IMAGE_SIZE_BYTES;

        return (
          validType &&
          validSize
        );
      });

    setImages((current) => {
      const available =
        MAX_IMAGES -
        current.length;

      if (available <= 0) {
        return current;
      }

      return [
        ...current,
        ...validFiles.slice(
          0,
          available,
        ),
      ];
    });

    if (
      incoming.length !==
      validFiles.length
    ) {
      setError(
        "Photos must be JPG, PNG, or WebP and 5MB or smaller.",
      );
    } else if (
      images.length +
        validFiles.length >
      MAX_IMAGES
    ) {
      setError(
        `You can upload up to ${MAX_IMAGES} photos.`,
      );
    } else {
      setError("");
    }

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function removeImage(
    index: number,
  ) {
    setImages((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !==
          index,
      ),
    );

    setError("");
  }

  async function copyValue(
    value: string,
    field: "link" | "pin",
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField(
          (current) =>
            current === field
              ? ""
              : current,
        );
      }, 1800);
    } catch {
      setCopiedField("");
    }
  }

  function getMailboxUrl(
    path: string,
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      return path;
    }

    return `${window.location.origin}${path}`;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSubmissionSuccess(null);
    setCopiedField("");

    if (servicesLoading) {
      setError(
        "Services are still loading. Please try again in a moment.",
      );
      return;
    }

    if (servicesError) {
      setError(
        "Services could not be loaded. Please refresh the page and try again.",
      );
      return;
    }

    if (!service) {
      setError(
        "Select the service you need.",
      );
      return;
    }

    const selectedService =
      services.find(
        (item) =>
          item.name === service,
      );

    if (!selectedService) {
      setError(
        "Select a valid service from the list.",
      );
      return;
    }

    if (
      !/^\d{5}$/.test(
        zipCode.trim(),
      )
    ) {
      setError(
        "Enter a valid 5-digit ZIP code.",
      );
      return;
    }

    if (!details.trim()) {
      setError(
        "Tell providers a little about what you need.",
      );
      return;
    }

    if (
      notificationEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        notificationEmail.trim(),
      )
    ) {
      setError(
        "Enter a valid notification email address.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData =
        new FormData();

      formData.append(
        "service",
        selectedService.name,
      );

      formData.append(
        "zipCode",
        zipCode.trim(),
      );

      formData.append(
        "serviceNeededDate",
        serviceNeededDate,
      );

      formData.append(
        "details",
        details.trim(),
      );

      formData.append(
        "notificationEmail",
        notificationEmail.trim(),
      );

      images.forEach((image) => {
        formData.append(
          "images",
          image,
        );
      });

      const response =
        await fetch(
          "/api/connect/requests",
          {
            method: "POST",
            body: formData,
          },
        );

      const result =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result?.error ||
            "Unable to submit your request.",
        );
      }

      const requestCode =
        String(
          result?.request?.code ??
            "",
        );

      const mailboxCode =
        String(
          result?.mailbox?.code ??
            "",
        );

      const mailboxPin =
        String(
          result?.mailbox?.pin ??
            "",
        );

      const mailboxPath =
        String(
          result?.mailbox?.path ??
            "",
        );

      if (!requestCode) {
        throw new Error(
          "The request was created, but no request code was returned.",
        );
      }

      if (
        !mailboxCode ||
        !mailboxPin ||
        !mailboxPath
      ) {
        throw new Error(
          "The request was created, but the private mailbox credentials were not returned.",
        );
      }

      setSubmissionSuccess({
        requestCode,
        mailboxCode,
        mailboxPin,
        mailboxPath,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      setError(
        submitError instanceof
          Error
          ? submitError.message
          : "Unable to submit your request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Successful request + private mailbox.
   */
  if (submissionSuccess) {
    const mailboxUrl =
      getMailboxUrl(
        submissionSuccess.mailboxPath,
      );

    return (
      <main className="min-h-screen bg-[#f7f5ef] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[28px] border border-[#d9d4c7] bg-white shadow-xl shadow-black/5">
            <div className="bg-[#173f35] px-6 py-8 text-white sm:px-9">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8d7c9]">
                Ko-Host Connect
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Your request is live.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                Your private Ko-Host
                Mailbox has been created.
                Provider responses for
                this request will be kept
                there.
              </p>
            </div>

            <div className="p-6 sm:p-9">
              <div className="rounded-2xl border border-[#d9d4c7] bg-[#faf9f5] p-5">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                  Request Code
                </div>

                <div className="mt-2 break-all text-lg font-semibold text-neutral-950">
                  {
                    submissionSuccess.requestCode
                  }
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[22px] border border-[#cddbd3] bg-[#f1f6f3]">
                <div className="border-b border-[#d7e2dc] px-5 py-5 sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#173f35] text-xl text-white">
                      ✉
                    </div>

                    <div>
                      <div className="text-base font-semibold text-[#173f35]">
                        Your Private
                        Mailbox
                      </div>

                      <p className="mt-1 text-xs leading-5 text-[#52665d]">
                        Save your mailbox
                        link and PIN.
                        You&apos;ll need
                        the PIN to access
                        provider
                        responses.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d8a7d]">
                      Mailbox Link
                    </div>

                    <div className="mt-2 rounded-xl border border-[#d7e2dc] bg-white p-3">
                      <div className="break-all text-xs font-semibold leading-5 text-neutral-700">
                        {mailboxUrl}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void copyValue(
                          mailboxUrl,
                          "link",
                        )
                      }
                      className="mt-2 inline-flex items-center justify-center rounded-lg border border-[#b9cbc1] bg-white px-3 py-2 text-xs font-bold text-[#315847] transition hover:bg-[#f7faf8]"
                    >
                      {copiedField ===
                      "link"
                        ? "Copied!"
                        : "Copy Mailbox Link"}
                    </button>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d8a7d]">
                      Private PIN
                    </div>

                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex-1 rounded-xl border border-[#d7e2dc] bg-white px-4 py-3">
                        <div className="font-mono text-2xl font-semibold tracking-[0.22em] text-[#173f35]">
                          {
                            submissionSuccess.mailboxPin
                          }
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          void copyValue(
                            submissionSuccess.mailboxPin,
                            "pin",
                          )
                        }
                        className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-[#b9cbc1] bg-white px-4 text-xs font-bold text-[#315847] transition hover:bg-[#f7faf8]"
                      >
                        {copiedField ===
                        "pin"
                          ? "Copied!"
                          : "Copy PIN"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#d6c99f] bg-[#fff9e8] px-4 py-3">
                    <div className="text-xs font-semibold text-[#705d22]">
                      Save your PIN now.
                    </div>

                    <p className="mt-1 text-[11px] leading-5 text-[#75683e]">
                      For your privacy,
                      Ko-Host does not
                      store your PIN in
                      readable form. Keep
                      this PIN somewhere
                      safe so you can
                      access this mailbox
                      later.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#d7e2dc] bg-white/70 px-4 py-3 text-[11px] leading-5 text-[#52665d]">
This temporary mailbox
remains active for{" "}
<strong className="font-semibold text-[#284c3e]">
  30 days
</strong>
                    . Each provider
                    conversation will stay
                    private from other
                    providers.
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href={
                    submissionSuccess.mailboxPath
                  }
                  className="inline-flex items-center justify-center rounded-xl bg-[#173f35] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f3028]"
                >
                  Open My Mailbox →
                </Link>

                <Link
                  href="/connect"
                  className="inline-flex items-center justify-center rounded-xl border border-[#d8d4ca] bg-white px-5 py-3.5 text-sm font-bold text-neutral-700 transition hover:bg-[#faf9f5]"
                >
                  Back to Ko-Host Connect
                </Link>
              </div>

              <p className="mt-5 text-center text-[11px] leading-5 text-neutral-500">
                Your personal contact
                information is never
                shared with providers.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      {/* HERO */}
      <section className="px-4 pt-5 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-[#d9d4c7] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center px-6 py-9 sm:px-9 lg:px-12 lg:py-12">
              <Link
                href="/connect"
                className="w-fit text-xs font-semibold uppercase tracking-[0.18em] text-[#55786a]"
              >
                Ko-Host Connect
              </Link>

              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.98] tracking-tight text-[#173f35] sm:text-5xl">
                Need Something Done?
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-7 text-neutral-600">
                Tell us what you need.
                Ko-Host Connect helps your
                request reach relevant
                local service providers
                without posting your
                personal contact
                information publicly.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Free to post",
                  "Local providers",
                  "Private responses",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-[#d8dfd9] bg-[#f5f8f5] px-3 py-1.5 text-[11px] font-bold text-[#355b4c]"
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[260px] lg:min-h-[390px]">
              <Image
                src="/connect/connect-request-hero.png"
                alt="Neighborhood homes and local community"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* REQUEST FORM */}
      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl overflow-visible rounded-[28px] border border-[#d9d4c7] bg-white shadow-lg shadow-black/5"
        >
          <div className="border-b border-[#e7e2d8] px-5 py-6 sm:px-8">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d8a7d]">
              Local Service Request
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Tell us what you need
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              A few details help Ko-Host
              Connect route your request
              to the right providers.
            </p>
          </div>

          <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
            {/* STEP 1 */}
            <section>
              <StepHeading
                number="1"
                title="What service do you need?"
                subtitle="Describe what you need or choose a service."
              />

              <div className="relative mt-4">
                <input
                  type="text"
                  value={serviceSearch}
                  disabled={
                    servicesLoading ||
                    Boolean(
                      servicesError,
                    )
                  }
                  onChange={(event) => {
                    setServiceSearch(
                      event.target
                        .value,
                    );

                    setService("");
                    setShowServices(
                      true,
                    );
                  }}
                  onFocus={() => {
                    if (
                      !servicesLoading &&
                      !servicesError
                    ) {
                      setShowServices(
                        true,
                      );
                    }
                  }}
                  placeholder={
                    servicesLoading
                      ? "Loading services..."
                      : servicesError
                        ? "Services unavailable"
                        : "Describe what you need..."
                  }
                  autoComplete="off"
                  className="w-full rounded-2xl border border-[#d8d4ca] bg-white px-4 py-3.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
                />

                {showServices &&
                !servicesLoading &&
                !servicesError ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-64 overflow-y-auto rounded-2xl border border-[#d8d4ca] bg-white p-2 shadow-xl">
                    {filteredServices.length ? (
                      filteredServices.map(
                        (item) => (
                          <button
                            key={
                              item.id
                            }
                            type="button"
                            onClick={() =>
                              chooseService(
                                item,
                              )
                            }
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-neutral-800 transition hover:bg-[#f2f6f3]"
                          >
                            <span>
                              {
                                item.name
                              }
                            </span>

                            <span className="text-[#6e9583]">
                              →
                            </span>
                          </button>
                        ),
                      )
                    ) : (
                      <div className="px-3 py-5 text-center text-sm text-neutral-500">
                        No matching
                        services.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {servicesLoading ? (
                <p className="mt-2 text-[11px] text-neutral-400">
                  Loading available
                  services...
                </p>
              ) : null}

              {servicesError ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                  {servicesError}
                </div>
              ) : null}

              {service ? (
                <div className="mt-3 inline-flex rounded-full bg-[#eaf2ed] px-3 py-1.5 text-xs font-bold text-[#315847]">
                  Selected: {service}
                </div>
              ) : null}
            </section>

            <Divider />

            {/* STEP 2 */}
            <section>
              <StepHeading
                number="2"
                title="Where do you need it?"
                subtitle="Enter the ZIP code where the service is needed."
              />

              <div className="mt-4 max-w-xs">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipCode}
                  onChange={(event) =>
                    setZipCode(
                      event.target.value
                        .replace(
                          /\D/g,
                          "",
                        )
                        .slice(0, 5),
                    )
                  }
                  placeholder="ZIP code"
                  className="w-full rounded-2xl border border-[#d8d4ca] bg-white px-4 py-3.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
                />
              </div>
            </section>

            <Divider />

            {/* STEP 3 */}
            <section>
              <StepHeading
                number="3"
                title="When do you need it?"
                subtitle="Choose a date, or leave it blank if you're flexible."
              />

              <div className="mt-4 max-w-xs">
                <input
                  type="date"
                  value={
                    serviceNeededDate
                  }
                  onChange={(event) =>
                    setServiceNeededDate(
                      event.target
                        .value,
                    )
                  }
                  className="w-full rounded-2xl border border-[#d8d4ca] bg-white px-4 py-3.5 text-sm text-neutral-950 outline-none transition focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
                />
              </div>
            </section>

            <Divider />

            {/* STEP 4 */}
            <section>
              <StepHeading
                number="4"
                title="Add a few details"
                subtitle="Describe the job and optionally include up to 5 photos."
              />

              <div className="mt-4">
                <div className="text-xs font-bold text-neutral-600">
                  Add photos
                </div>

                <div className="mt-3 flex items-center gap-2 sm:gap-3">
                  {imagePreviews.map(
                    (
                      preview,
                      index,
                    ) => (
                      <div
                        key={
                          preview
                        }
                        className="group relative aspect-square min-w-0 flex-1 overflow-hidden rounded-xl border border-[#d8d4ca] bg-neutral-100 sm:h-14 sm:w-14 sm:flex-none"
                      >
                        <Image
                          src={
                            preview
                          }
                          alt={`Selected photo ${
                            index +
                            1
                          }`}
                          fill
                          unoptimized
                          className="object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index,
                            )
                          }
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[11px] font-bold text-white opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                          aria-label={`Remove photo ${
                            index +
                            1
                          }`}
                        >
                          ×
                        </button>
                      </div>
                    ),
                  )}

                  {Array.from({
                    length:
                      Math.max(
                        0,
                        MAX_IMAGES -
                          images.length,
                      ),
                  }).map(
                    (_, index) => (
                      <button
                        key={`empty-photo-${index}`}
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="flex aspect-square min-w-0 flex-1 items-center justify-center rounded-xl border border-dashed border-[#a9b8af] bg-[#f7faf8] text-xl font-light text-[#55786a] transition hover:border-[#6e9583] hover:bg-[#eef5f0] sm:h-14 sm:w-14 sm:flex-none"
                        aria-label="Add photo"
                      >
                        +
                      </button>
                    ),
                  )}

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(
                      event,
                    ) =>
                      handleImageSelection(
                        event
                          .target
                          .files,
                      )
                    }
                    className="hidden"
                  />
                </div>

                <textarea
                  value={details}
                  onChange={(event) =>
                    setDetails(
                      event.target
                        .value,
                    )
                  }
                  rows={6}
                  maxLength={3000}
                  placeholder="Example: I need the front and back lawn mowed and edged. The backyard is fenced and accessible through the side gate..."
                  className="mt-4 w-full resize-y rounded-2xl border border-[#d8d4ca] bg-white px-4 py-3.5 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
                />

                <div className="mt-1.5 text-right text-[10px] text-neutral-400">
                  {details.length}
                  /3000
                </div>
              </div>
            </section>

            <Divider />

            {/* PRIVATE MAILBOX */}
            <section>
              <div>
                <h3 className="text-base font-semibold text-neutral-950 sm:text-lg">
                  Your Private Ko-Host
                  Mailbox
                </h3>

                <p className="mt-0.5 text-xs leading-5 text-neutral-500">
                  Provider responses stay
                  private.
                </p>
              </div>

              <div className="mt-4 overflow-hidden rounded-[22px] border border-[#cddbd3] bg-[#f1f6f3]">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#173f35] text-xl text-white shadow-sm">
                      ✉
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-[#173f35]">
                        No need to share
                        your personal
                        contact
                        information.
                      </div>

                      <p className="mt-1.5 text-xs leading-5 text-[#52665d]">
                        Providers respond
                        through a
                        temporary Ko-Host
                        Mailbox created
                        for this request.
                        You&apos;ll
                        receive a private
                        mailbox link and
                        PIN after
                        submitting.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-4">
                    {[
                      "Submit Request",
                      "Get Private Mailbox",
                      "Review Responses",
                      "Choose Who to Connect With",
                    ].map(
                      (
                        item,
                        index,
                      ) => (
                        <div
                          key={
                            item
                          }
                          className="rounded-xl border border-[#d7e2dc] bg-white px-3 py-3 text-center"
                        >
                          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7b9589]">
                            Step{" "}
                            {index +
                              1}
                          </div>

                          <div className="mt-1 text-[10px] font-bold leading-4 text-[#284c3e]">
                            {item}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-[#d7e2dc] bg-white/70 px-4 py-3 text-[11px] leading-5 text-[#52665d]">
Your mailbox will
remain available for
<strong className="font-semibold text-[#284c3e]">
  {" "}
  30 days
</strong>
.
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-xs font-bold text-neutral-700">
                  Email me when providers
                  respond{" "}
                  <span className="font-medium text-neutral-400">
                    (optional)
                  </span>
                </label>

                <input
                  type="email"
                  value={
                    notificationEmail
                  }
                  onChange={(event) =>
                    setNotificationEmail(
                      event.target
                        .value,
                    )
                  }
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-[#d8d4ca] bg-white px-4 py-3.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-[#6e9583] focus:ring-4 focus:ring-[#6e9583]/10"
                />

                <p className="mt-2 text-[11px] leading-5 text-neutral-500">
                  This email is used by
                  Ko-Host for request and
                  mailbox notifications
                  only. It is never shown
                  to providers.
                </p>
              </div>
            </section>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}
          </div>

          {/* SUBMIT */}
          <div className="border-t border-[#e7e2d8] bg-[#fbfaf7] px-5 py-6 sm:px-8">
            <button
              type="submit"
              disabled={
                submitting ||
                servicesLoading ||
                Boolean(
                  servicesError,
                )
              }
              className="flex w-full items-center justify-center rounded-2xl bg-[#173f35] px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3028] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting..."
                : servicesLoading
                  ? "Loading Services..."
                  : "Submit My Request →"}
            </button>

            <div className="mt-3 text-center text-[11px] font-semibold text-neutral-500">
              Your personal contact
              information is never shared
              with providers.
            </div>
          </div>
        </form>
      </section>

      {/* TRUST STRIP */}
      <section className="border-t border-[#ddd8cc] bg-[#eee9de] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-bold text-[#53665d]">
          <span>
            ✓ Free to submit
          </span>
          <span>
            ✓ Local matching
          </span>
          <span>
            ✓ Private responses
          </span>
          <span>
            ✓ Temporary mailbox
          </span>
        </div>
      </section>
    </main>
  );
}

function StepHeading({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#173f35] text-xs font-semibold text-white">
        {number}
      </div>

      <div>
        <h3 className="text-base font-semibold text-neutral-950 sm:text-lg">
          {title}
        </h3>

        <p className="mt-0.5 text-xs leading-5 text-neutral-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px bg-[#ece8df]" />
  );
}