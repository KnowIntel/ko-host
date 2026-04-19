// app\dashboard\microsites\[id]\page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type MicrositeSettings = {
  id: string;
  slug: string;
  title: string;
  template_key: string;
  selected_design_key?: string | null;
  site_visibility?: string | null;
  private_mode?: string | boolean | null;
  is_active?: boolean | null;
  is_published: boolean;
  paid_until: string | null;
  broadcast_on_homepage?: boolean | null;
  stripe_account_id?: string | null;
  stripe_charges_enabled?: boolean | null;
};

type FileShareUploadRow = {
  id: string;
  block_id: string;
  original_filename: string;
  mime_type: string | null;
  size_bytes: number;
  uploader_name: string | null;
  uploader_email: string | null;
  uploader_message: string | null;
  uploaded_at: string;
  preview_url?: string | null;
};

export default function DashboardMicrositeManagePage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  const [site, setSite] = useState<MicrositeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [siteVisibility, setSiteVisibility] = useState<"public" | "private">("public");
  const [passcode, setPasscode] = useState("");
  const [broadcastOnHomepage, setBroadcastOnHomepage] = useState(false);

  const [uploads, setUploads] = useState<FileShareUploadRow[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [uploadsMessage, setUploadsMessage] = useState("");
  const [downloadAccessCodes, setDownloadAccessCodes] = useState<
    Record<string, string>
  >({});
  const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);
    const [uploadSort, setUploadSort] = useState<
    "newest" | "oldest" | "largest" | "smallest"
  >("newest");
  const [uploadFileType, setUploadFileType] = useState<
    "" | "images" | "pdf" | "doc" | "txt"
  >("");
  const [uploadSearch, setUploadSearch] = useState("");

  const [paymentsLoading, setPaymentsLoading] = useState(false);
const [paymentsMessage, setPaymentsMessage] = useState("");
const [payments, setPayments] = useState<any[]>([]);
const [paymentsSummary, setPaymentsSummary] = useState<{
  totalPayments: number;
  grossCents: number;
}>({
  totalPayments: 0,
  grossCents: 0,
});

async function loadPayments() {
  try {
    setPaymentsLoading(true);
    setPaymentsMessage("");

    const res = await fetch(`/api/dashboard/microsites/${id}/payments`, {
      method: "GET",
      cache: "no-store",
    });

    const payload = await res.json();

    if (!res.ok) {
      setPayments([]);
      setPaymentsSummary({ totalPayments: 0, grossCents: 0 });
      setPaymentsMessage(payload?.error || "Failed to load payments.");
      return;
    }

    setPayments(Array.isArray(payload?.payments) ? payload.payments : []);
    setPaymentsSummary(
      payload?.summary ?? { totalPayments: 0, grossCents: 0 },
    );
  } catch {
    setPayments([]);
    setPaymentsSummary({ totalPayments: 0, grossCents: 0 });
    setPaymentsMessage("Failed to load payments.");
  } finally {
    setPaymentsLoading(false);
  }
}

const handleConnectStripe = async () => {
  try {
const res = await fetch("/api/stripe/connect/start", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    micrositeId: id,
  }),
});

    const rawText = await res.text();

    let payload: any = null;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      payload = rawText;
    }

    if (!res.ok) {
      const debugMessage = JSON.stringify(
        {
          status: res.status,
          statusText: res.statusText,
          rawText,
          payload,
        },
        null,
        2,
      );

      console.error("Stripe connect start error:\n" + debugMessage);

      alert(
        typeof payload?.details === "string"
          ? payload.details
          : typeof payload?.error === "string"
            ? payload.error
            : `Failed to start Stripe onboarding (${res.status})`,
      );
      return;
    }

    if (payload?.url) {
      window.location.href = payload.url;
      return;
    }

    alert("No onboarding URL returned.");
  } catch (error) {
    console.error("Connect Stripe error:", error);
    alert("Failed to start Stripe onboarding.");
  }
};

useEffect(() => {
  void loadPayments();
}, [id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/dashboard/microsites/${id}/settings`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMessage(data?.error || "Failed to load microsite settings.");
          return;
        }

        if (!cancelled) {
          const microsite = data?.microsite || null;
          setSite(microsite);
          setTitle(microsite?.title || "");
setSiteVisibility(
  microsite?.site_visibility === "private" &&
    microsite?.private_mode === "passcode"
    ? "private"
    : "public",
);
          setPasscode("");
          setBroadcastOnHomepage(Boolean(microsite?.broadcast_on_homepage));
        }
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : "Unexpected error.";
        setMessage(nextMessage);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      void load();
      void loadUploads();
    }

    return () => {
      cancelled = true;
    };
  }, [id, uploadSort, uploadFileType, uploadSearch]);

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("Saving settings...");

      const res = await fetch(`/api/dashboard/microsites/${id}/settings`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title,
          siteVisibility,
          passcode: siteVisibility === "private" ? passcode.trim() : "",
          broadcastOnHomepage:
            siteVisibility === "public" ? broadcastOnHomepage : false,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Failed to save settings.");
        return;
      }

      setSite(data?.microsite || null);
      setPasscode("");
      setBroadcastOnHomepage(Boolean(data?.microsite?.broadcast_on_homepage));
      setMessage("Settings saved.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Unexpected error.";
      setMessage(nextMessage);
    } finally {
      setSaving(false);
    }
  }

  async function sendBulkEmail() {
  try {
    setEmailStatus("Sending...");

    const res = await fetch(
      `/api/dashboard/microsites/${id}/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      setEmailStatus(data?.error || "Failed to send email.");
      return;
    }

    setEmailStatus("Email sent.");
    setEmailSubject("");
    setEmailMessage("");
  } catch {
    setEmailStatus("Failed to send email.");
  }
}

  async function loadUploads() {
    try {
      setUploadsLoading(true);
      setUploadsMessage("");

      const params = new URLSearchParams();

      if (uploadSort) {
        params.set("sort", uploadSort);
      }

      if (uploadFileType) {
        params.set("fileType", uploadFileType);
      }

      if (uploadSearch.trim()) {
        params.set("search", uploadSearch.trim());
      }

      const queryString = params.toString();
      const url = `/api/dashboard/microsites/${id}/uploads${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUploadsMessage(data?.error || "Failed to load uploads.");
        return;
      }

      setUploads(Array.isArray(data?.uploads) ? data.uploads : []);
    } catch (error) {
      setUploadsMessage(
        error instanceof Error ? error.message : "Unexpected error.",
      );
    } finally {
      setUploadsLoading(false);
    }
  }

  async function openStripeDashboard() {
  try {
    const res = await fetch("/api/stripe/connect/dashboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ micrositeId: id }),
    });

    const data = await res.json();

    if (!res.ok || !data?.url) {
      alert(data?.error || "Failed to open Stripe dashboard");
      return;
    }

    window.open(data.url, "_blank");
  } catch {
    alert("Failed to open Stripe dashboard");
  }
}

    async function deleteUpload(uploadId: string) {
    try {
      setDeletingUploadId(uploadId);
      setUploadsMessage("");

      const res = await fetch(
        `/api/dashboard/microsites/${id}/uploads/${uploadId}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUploadsMessage(data?.error || "Failed to delete upload.");
        return;
      }

      setUploads((prev) => prev.filter((item) => item.id !== uploadId));
      setUploadsMessage("Upload deleted.");
    } catch (error) {
      setUploadsMessage(
        error instanceof Error ? error.message : "Unexpected error.",
      );
    } finally {
      setDeletingUploadId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          Loading microsite settings...
        </div>
      </main>
    );
  }

  if (!site) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          Microsite not found.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Manage {site.title || "Microsite"}
        </h1>

        <div className="mt-3 space-y-1 text-sm text-neutral-600">
          <div>Site Name: {site.slug}</div>
          <div>Template: {site.template_key}</div>
          <div>Design: {site.selected_design_key || "blank"}</div>
          <div>Published: {site.is_published ? "Yes" : "No"}</div>
          <div>Active: {site.is_active === false ? "No" : "Yes"}</div>
          <div>
            Paid Until:{" "}
            {site.paid_until ? new Date(site.paid_until).toLocaleString() : "—"}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/microsites/${site.id}/edit`}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
          >
            Edit Draft
          </Link>

          <a
            href={`/s/${site.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Open Public URL
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-neutral-900">Microsite Settings</div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Title
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            />
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Site Name
            </div>
            <input
              type="text"
              value={site.slug}
              readOnly
              className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600 outline-none"
            />
          </div>
        </div>

        <div className="mt-5">
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
                onChange={() => {
                  setSiteVisibility("private");
                  setBroadcastOnHomepage(false);
                }}
              />
              Private (passcode required)
            </label>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Home Page Broadcast
          </div>

          <label
            className={[
              "mt-2 flex items-start gap-3 rounded-xl border px-3 py-3 text-sm",
              siteVisibility === "private"
                ? "border-neutral-200 bg-neutral-100 text-neutral-400"
                : "border-neutral-200 bg-neutral-50 text-neutral-800",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={siteVisibility === "public" ? broadcastOnHomepage : false}
              disabled={siteVisibility !== "public"}
              onChange={(e) => setBroadcastOnHomepage(e.target.checked)}
              className="mt-0.5"
            />

            <div>
              <div className="font-medium text-neutral-900">
                Broadcast this site on the Ko-Host home page
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Let more people discover your microsite in the Recent Sites section.
                Only public microsites can be featured there.
              </div>
            </div>
          </label>
        </div>

        {siteVisibility === "private" ? (
          <div className="mt-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              New / Updated Passcode
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={30}
              value={passcode}
              onChange={(e) =>
                setPasscode(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 30))
              }
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
              placeholder="Enter passcode"
            />
            <div className="mt-2 text-xs text-neutral-500">
              Leave blank to keep the current passcode.
            </div>
          </div>
        ) : null}

<div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
  <div className="text-sm font-medium text-neutral-900">
    Other settings on this page
  </div>
  <div className="mt-2 text-sm text-neutral-600">
    Control your site’s visibility, access settings, publish status, design, and billing.
  </div>

<div className="mt-4 flex items-center gap-3">
  {!site?.stripe_account_id ? (
    <button
      type="button"
      onClick={handleConnectStripe}
      className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
    >
      Connect Stripe
    </button>
  ) : (
    <>
      <button
        type="button"
        onClick={handleConnectStripe}
        className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Reconnect Stripe
      </button>

      <button
        type="button"
        onClick={() => void openStripeDashboard()}
        className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
      >
        View in Stripe
      </button>

      <div className="text-xs text-green-600 font-medium flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-green-600" />
        Ready to accept payments
      </div>
    </>
  )}
</div>
</div>

<div className="mt-6 flex items-center gap-3">
  <button
    type="button"
    onClick={() => void saveSettings()}
    disabled={saving}
    className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
  >
    {saving ? "Saving..." : "Save Settings"}
  </button>

  {message ? (
    <div className="text-sm text-neutral-600">{message}</div>
  ) : null}
</div>
</div>

      {/* ✅ INSERT UPLOADS BLOCK RIGHT HERE */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Uploads</div>
            <div className="mt-1 text-sm text-neutral-600">
              Files submitted through File Share blocks on this microsite.
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadUploads()}
            disabled={uploadsLoading}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900 disabled:opacity-60"
          >
            {uploadsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {uploadsMessage ? (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            {uploadsMessage}
          </div>
        ) : null}

                <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Search
            </div>
            <input
              type="text"
              value={uploadSearch}
              onChange={(e) => setUploadSearch(e.target.value)}
              placeholder="Filename, email, message..."
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            />
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              File Type
            </div>
            <select
              value={uploadFileType}
              onChange={(e) =>
                setUploadFileType(
                  e.target.value as "" | "images" | "pdf" | "doc" | "txt",
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            >
              <option value="">All</option>
              <option value="images">Images</option>
              <option value="pdf">PDF</option>
              <option value="doc">Doc / Docx</option>
              <option value="txt">Text</option>
            </select>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Sort
            </div>
            <select
              value={uploadSort}
              onChange={(e) =>
                setUploadSort(
                  e.target.value as "newest" | "oldest" | "largest" | "smallest",
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="largest">Largest</option>
              <option value="smallest">Smallest</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-700">Preview</th>
                <th className="px-4 py-3 font-medium text-neutral-700">File</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Uploader</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Email</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Message</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Size</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Uploaded</th>
                <th className="px-4 py-3 font-medium text-neutral-700">Action</th>
              </tr>
            </thead>

              <tbody>
                {uploadsLoading ? (
                  <tr>
                    <td className="px-4 py-4 text-neutral-600" colSpan={8}>
                      Loading uploads...
                    </td>
                  </tr>
                ) : uploads.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-neutral-600" colSpan={8}>
                      No uploads yet.
                    </td>
                  </tr>
                ) : (
                uploads.map((upload) => (
                  <tr key={upload.id} className="border-t border-neutral-200">
                    <td className="px-4 py-4 text-neutral-600">
                      {upload.preview_url ? (
                        <img
                          src={upload.preview_url}
                          alt={upload.original_filename}
                          className="h-14 w-14 rounded-lg border border-neutral-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-neutral-900">
                      {upload.original_filename}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {upload.uploader_name || "—"}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {upload.uploader_email || "—"}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {upload.uploader_message || "—"}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {upload.size_bytes
                        ? `${(upload.size_bytes / 1024 / 1024).toFixed(2)} MB`
                        : "0 MB"}
                    </td>

                    <td className="px-4 py-4 text-neutral-600">
                      {upload.uploaded_at
                        ? new Date(upload.uploaded_at).toLocaleString()
                        : "—"}
                    </td>

<td className="px-4 py-4 text-neutral-600">
  <div className="flex flex-col gap-2">
    <input
      type="text"
      value={downloadAccessCodes[upload.id] ?? ""}
      onChange={(e) =>
        setDownloadAccessCodes((prev) => ({
          ...prev,
          [upload.id]: e.target.value,
        }))
      }
      placeholder="Access code if required"
      className="h-9 w-full min-w-[180px] rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
    />

    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/dashboard/microsites/${site.id}/uploads/${upload.id}?accessCode=${encodeURIComponent(
          downloadAccessCodes[upload.id] ?? "",
        )}`}
        className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:border-neutral-900"
      >
        Download
      </a>

      <button
        type="button"
        onClick={() => void deleteUpload(upload.id)}
        disabled={deletingUploadId === upload.id}
        className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:border-red-500 disabled:opacity-60"
      >
        {deletingUploadId === upload.id ? "Deleting..." : "Delete"}
      </button>
    </div>
  </div>
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <div>
      <div className="text-sm font-semibold text-neutral-900">Payments</div>
      <div className="mt-1 text-sm text-neutral-600">
        Completed checkout payments for this microsite.
      </div>
    </div>

    <button
      type="button"
      onClick={() => void loadPayments()}
      disabled={paymentsLoading}
      className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900 disabled:opacity-60"
    >
      {paymentsLoading ? "Refreshing..." : "Refresh"}
    </button>
  </div>

  {paymentsMessage ? (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
      {paymentsMessage}
    </div>
  ) : null}

  <div className="mt-4 grid gap-3 md:grid-cols-2">
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Total Paid Orders
      </div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">
        {paymentsSummary.totalPayments}
      </div>
    </div>

    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Gross Revenue
      </div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">
        ${(paymentsSummary.grossCents / 100).toFixed(2)}
      </div>
    </div>
  </div>

  <div className="mt-4 overflow-x-auto">
    <table className="min-w-full divide-y divide-neutral-200 text-sm">
      <thead>
        <tr className="text-left text-neutral-500">
          <th className="py-2 pr-4">Date</th>
          <th className="py-2 pr-4">Product</th>
          <th className="py-2 pr-4">Customer</th>
          <th className="py-2 pr-4">Email</th>
          <th className="py-2 pr-4">Amount</th>
          <th className="py-2 pr-4">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100">
        {payments.length ? (
          payments.map((payment) => (
            <tr key={payment.id}>
              <td className="py-3 pr-4 text-neutral-700">
                {payment.created_at
                  ? new Date(payment.created_at).toLocaleString()
                  : "—"}
              </td>
              <td className="py-3 pr-4 text-neutral-900">
                {payment.product_name || "—"}
              </td>
              <td className="py-3 pr-4 text-neutral-700">
                {payment.customer_name || "—"}
              </td>
              <td className="py-3 pr-4 text-neutral-700">
                {payment.customer_email || "—"}
              </td>
              <td className="py-3 pr-4 text-neutral-900">
                {typeof payment.amount_total === "number"
                  ? `$${(payment.amount_total / 100).toFixed(2)}`
                  : "—"}
              </td>
              <td className="py-3 pr-4 text-neutral-700">
                {payment.payment_status || "—"}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="py-6 text-center text-neutral-500">
              No payments yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

<div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
  <div className="text-sm font-semibold text-neutral-900">Send Email</div>
  <div className="mt-1 text-sm text-neutral-600">
    Send an email to customers or users of this microsite.
  </div>

  <div className="mt-5 space-y-4">
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Subject
      </div>
      <input
        type="text"
        value={emailSubject}
        onChange={(e) => setEmailSubject(e.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
      />
    </div>

    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Message
      </div>
      <textarea
        value={emailMessage}
        onChange={(e) => setEmailMessage(e.target.value)}
        className="mt-2 min-h-[120px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
      />
    </div>

    <button
      type="button"
      onClick={() => void sendBulkEmail()}
      className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
    >
      Send Email
    </button>

    {emailStatus ? (
      <div className="text-sm text-neutral-600">{emailStatus}</div>
    ) : null}
  </div>
</div>

    </main>
  );
}