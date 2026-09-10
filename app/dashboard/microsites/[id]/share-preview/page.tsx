"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SharePreviewSettings = {
  id: string;
  slug: string;
  title?: string | null;

  share_preview_mode?:
    | "auto"
    | "custom"
    | null;

  share_preview_auto_image_url?:
    | string
    | null;

  share_preview_custom_image_url?:
    | string
    | null;
};

export default function SharePreviewPage() {
  const params =
    useParams();

  const id =
    String(
      params?.id ??
        "",
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    site,
    setSite,
  ] =
    useState<SharePreviewSettings | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    regenerating,
    setRegenerating,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const publicUrl =
    useMemo(
      () =>
        site?.slug
          ? `https://${site.slug}.ko-host.com`
          : "",
      [
        site?.slug,
      ],
    );

  const previewMode =
    site?.share_preview_mode ===
    "custom"
      ? "custom"
      : "auto";

  const activeImageUrl =
    previewMode ===
      "custom" &&
    site?.share_preview_custom_image_url
      ? site.share_preview_custom_image_url
      : site?.share_preview_auto_image_url ??
        "";

  /*
   * ================================================================
   * LOAD SETTINGS
   * ================================================================
   */

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      if (!id) {
        return;
      }

      try {
        setLoading(
          true,
        );

        setMessage(
          "",
        );

        const response =
          await fetch(
            `/api/dashboard/microsites/${id}/share-preview`,
            {
              method:
                "GET",

              cache:
                "no-store",
            },
          );

        const payload =
          await response
            .json()
            .catch(
              () => ({}),
            );

        if (!response.ok) {
          if (
            !cancelled
          ) {
            setMessage(
              payload?.error ??
                "Failed to load share preview.",
            );
          }

          return;
        }

if (
  !cancelled
) {
  const loadedSite =
    payload?.microsite ??
    null;

  setSite(
    loadedSite,
  );

  /*
   * ================================================================
   * FIRST-TIME AUTO PREVIEW
   * ================================================================
   *
   * Every published microsite should have an automatic share-preview
   * image available, even if the owner later chooses a custom image.
   *
   * Generate it automatically only when one does not already exist.
   */

  if (
    loadedSite &&
    !loadedSite
      .share_preview_auto_image_url
  ) {
    try {
      setRegenerating(
        true,
      );

      setMessage(
        "Creating your share preview...",
      );

      const regenerateResponse =
        await fetch(
          `/api/dashboard/microsites/${id}/share-preview/regenerate`,
          {
            method:
              "POST",
          },
        );

      const regeneratePayload =
        await regenerateResponse
          .json()
          .catch(
            () => ({}),
          );

      if (
        !regenerateResponse.ok
      ) {
        if (
          !cancelled
        ) {
          setMessage(
            regeneratePayload?.error ??
              "Failed to create the automatic preview image.",
          );
        }

        return;
      }

      if (
        !cancelled
      ) {
        setSite(
          regeneratePayload?.microsite ??
            loadedSite,
        );

        setMessage(
          "Auto-generated preview created.",
        );
      }
    } catch (
      error
    ) {
      if (
        !cancelled
      ) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to create the automatic preview image.",
        );
      }
    } finally {
      if (
        !cancelled
      ) {
        setRegenerating(
          false,
        );
      }
    }
  }
}
      } catch (
        error
      ) {
        if (
          !cancelled
        ) {
          setMessage(
            error instanceof
              Error
              ? error.message
              : "Failed to load share preview.",
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    void load();

    return () => {
      cancelled =
        true;
    };
  }, [id]);

  /*
   * ================================================================
   * USE AUTO IMAGE
   * ================================================================
   */

  async function useAutoImage() {
    if (
      !site
    ) {
      return;
    }

    try {
      setSaving(
        true,
      );

      setMessage(
        "Switching to auto-generated image...",
      );

      const response =
        await fetch(
          `/api/dashboard/microsites/${id}/share-preview`,
          {
            method:
              "POST",

            headers: {
              "content-type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  mode:
                    "auto",
                },
              ),
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => ({}),
          );

      if (
        !response.ok
      ) {
        setMessage(
          payload?.error ??
            "Failed to update share preview.",
        );

        return;
      }

      setSite(
        payload?.microsite ??
          site,
      );

      setMessage(
        "Using auto-generated preview image.",
      );
    } catch (
      error
    ) {
      setMessage(
        error instanceof
          Error
          ? error.message
          : "Failed to update share preview.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  /*
   * ================================================================
   * IMPORT CUSTOM IMAGE
   * ================================================================
   */

  function chooseCustomImage() {
    fileInputRef.current?.click();
  }

  async function handleCustomImage(
    file:
      File,
  ) {
    try {
      setUploading(
        true,
      );

      setMessage(
        "Uploading custom preview image...",
      );

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await fetch(
          `/api/dashboard/microsites/${id}/share-preview/custom-image`,
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => ({}),
          );

      if (
        !response.ok
      ) {
        setMessage(
          payload?.error ??
            "Failed to upload custom preview image.",
        );

        return;
      }

      setSite(
        payload?.microsite ??
          site,
      );

      setMessage(
        "Custom preview image applied.",
      );
    } catch (
      error
    ) {
      setMessage(
        error instanceof
          Error
          ? error.message
          : "Failed to upload custom preview image.",
      );
    } finally {
      setUploading(
        false,
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  /*
   * ================================================================
   * REGENERATE AUTO IMAGE
   * ================================================================
   */

  async function regenerateAutoImage() {
    try {
      setRegenerating(
        true,
      );

      setMessage(
        "Regenerating preview image...",
      );

      const response =
        await fetch(
          `/api/dashboard/microsites/${id}/share-preview/regenerate`,
          {
            method:
              "POST",
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => ({}),
          );

      if (
        !response.ok
      ) {
        setMessage(
          payload?.error ??
            "Failed to regenerate preview image.",
        );

        return;
      }

      setSite(
        payload?.microsite ??
          site,
      );

      setMessage(
        "Auto-generated preview refreshed.",
      );
    } catch (
      error
    ) {
      setMessage(
        error instanceof
          Error
          ? error.message
          : "Failed to regenerate preview image.",
      );
    } finally {
      setRegenerating(
        false,
      );
    }
  }

  /*
   * ================================================================
   * COPY LINK
   * ================================================================
   */

  async function copySiteLink() {
    if (
      !publicUrl
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        publicUrl,
      );

      setCopied(
        true,
      );

      window.setTimeout(
        () => {
          setCopied(
            false,
          );
        },
        1800,
      );
    } catch {
      setMessage(
        "Unable to copy the site link.",
      );
    }
  }

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (
    loading
  ) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          Loading share preview...
        </div>
      </main>
    );
  }

  if (
    !site
  ) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          {message ||
            "Microsite not found."}

          <div className="mt-5">
            <Link
              href={`/dashboard/microsites/${id}`}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ================================================================
   * PAGE
   * ================================================================
   */

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Share Preview
        </h1>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Choose the image people see when your Ko-Host site link is shared in
          messages, social apps, and other services.
        </p>
      </div>

      {/* ============================================================ */}
      {/* PREVIEW CARD */}
      {/* ============================================================ */}

      <div className="mx-auto mt-8 max-w-[820px]">
        <div
          className="relative w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-lg"
          style={{
            aspectRatio:
              "1200 / 630",
          }}
        >
          {activeImageUrl ? (
            <img
              src={
                activeImageUrl
              }
              alt="Current share preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
              <div className="text-base font-semibold text-neutral-800">
                Preview image not generated yet
              </div>

              <div className="mt-2 max-w-md text-sm text-neutral-500">
                Generate an automatic preview from the published site, or
                import your own image.
              </div>
            </div>
          )}
        </div>

        {/* ========================================================== */}
        {/* STATUS */}
        {/* ========================================================== */}

        <div className="mt-4 flex items-center justify-center">
          <div
            className={[
              "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium",

              previewMode ===
              "custom"
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {previewMode ===
            "custom"
              ? "Using custom preview"
              : "Using auto-generated preview"}
          </div>
        </div>

        {/* ========================================================== */}
        {/* PRIMARY ACTIONS */}
        {/* ========================================================== */}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              void useAutoImage()
            }
            className={[
              "inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",

              previewMode ===
              "auto"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900",
            ].join(" ")}
          >
            {saving
              ? "Updating..."
              : "Use Auto-Generated Image"}
          </button>

          <button
            type="button"
            disabled={
              uploading
            }
            onClick={
              chooseCustomImage
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : "Import Custom Image"}
          </button>

          <button
            type="button"
            onClick={() =>
              void copySiteLink()
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {copied
              ? "Copied!"
              : "Copy Site Link"}
          </button>
        </div>

        <input
          ref={
            fileInputRef
          }
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file =
              event.target
                .files?.[0];

            if (!file) {
              return;
            }

            void handleCustomImage(
              file,
            );
          }}
        />

        {/* ========================================================== */}
        {/* AUTO IMAGE TOOLS */}
        {/* ========================================================== */}

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            disabled={
              regenerating
            }
            onClick={() =>
              void regenerateAutoImage()
            }
            className="text-sm font-medium text-neutral-600 underline-offset-4 hover:text-neutral-950 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {regenerating
              ? "Regenerating..."
              : "Regenerate Auto Image"}
          </button>
        </div>

        {/* ========================================================== */}
        {/* SITE URL */}
        {/* ========================================================== */}

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Site Link
          </div>

          <div className="mt-2 break-all font-mono text-sm text-neutral-800">
            {publicUrl}
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">
            {message}
          </div>
        ) : null}
      </div>

      {/* ============================================================ */}
      {/* BACK */}
      {/* ============================================================ */}

      <div className="mt-10 flex justify-end">
        <Link
          href={`/dashboard/microsites/${site.id}`}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}