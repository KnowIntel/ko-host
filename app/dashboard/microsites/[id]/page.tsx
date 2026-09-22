// app\dashboard\microsites\[id]\page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppModal from "@/components/ui/AppModal";
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

type EmailRecipientRow = {
  email: string;
  source: "cart" | "donation";
  label: string;
};

type ConnectService = {
  id: string;
  slug: string;
  name: string;
};

type ConnectProviderSettings = {
  linked: boolean;
  id: string | null;
  displayName: string;
  enabled: boolean;
  serviceZipCode: string;
  serviceRadiusMiles: number;
  serviceIds: string[];
};

export default function DashboardMicrositeManagePage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  const [emailRecipients, setEmailRecipients] = useState<EmailRecipientRow[]>([]);
  const [emailRecipientsLoading, setEmailRecipientsLoading] = useState(false);
  const [selectedEmailRecipients, setSelectedEmailRecipients] = useState<string[]>([]);

  const [selectAllEmailRecipients, setSelectAllEmailRecipients] = useState(false);
  const [site, setSite] = useState<MicrositeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [connectServices, setConnectServices] = useState<ConnectService[]>([]);
const [connectProvider, setConnectProvider] =
  useState<ConnectProviderSettings | null>(null);

const [connectLoading, setConnectLoading] = useState(true);
const [connectSaving, setConnectSaving] = useState(false);
const [connectMessage, setConnectMessage] = useState("");

const [connectDisplayName, setConnectDisplayName] = useState("");
const [connectEnabled, setConnectEnabled] = useState(false);
const [connectZipCode, setConnectZipCode] = useState("");
const [connectRadiusMiles, setConnectRadiusMiles] = useState(10);
const [connectServiceIds, setConnectServiceIds] = useState<string[]>([]);
const [connectServicesExpanded, setConnectServicesExpanded] = useState(true);

  const [title, setTitle] = useState("");
  const [siteVisibility, setSiteVisibility] = useState<"public" | "private">("public");
  const [passcode, setPasscode] = useState("");
  const [broadcastOnHomepage, setBroadcastOnHomepage] = useState(false);
  const [stripeError, setStripeError] = useState("");  

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

function toggleConnectService(serviceId: string) {
  setConnectServiceIds((prev) =>
    prev.includes(serviceId)
      ? prev.filter((id) => id !== serviceId)
      : [...prev, serviceId],
  );
}

async function saveConnectSettings() {
  try {
    setConnectSaving(true);
    setConnectMessage("Saving Ko-Host Connect settings...");

    const res = await fetch(
      `/api/dashboard/microsites/${id}/connect`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
body: JSON.stringify({
  displayName: connectDisplayName,
  enabled: connectEnabled,
  serviceZipCode: connectZipCode,
  serviceRadiusMiles: connectRadiusMiles,
  serviceIds: connectServiceIds,
}),
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setConnectMessage(
        data?.error ||
          "Failed to save Ko-Host Connect settings.",
      );
      return;
    }

    const provider =
      data?.provider &&
      typeof data.provider === "object"
        ? data.provider
        : null;

    if (provider) {
      setConnectProvider(provider);
      setConnectDisplayName(
  String(provider.displayName || ""),
);

      setConnectEnabled(
        Boolean(provider.enabled),
      );

      setConnectZipCode(
        String(provider.serviceZipCode || ""),
      );

      setConnectRadiusMiles(
        Number(provider.serviceRadiusMiles || 10),
      );

      setConnectServiceIds(
        Array.isArray(provider.serviceIds)
          ? provider.serviceIds.map(String)
          : [],
      );
    }

    setConnectMessage(
      provider?.enabled
        ? "Ko-Host Connect is active for this microsite."
        : "Ko-Host Connect settings saved.",
    );
  } catch (error) {
    setConnectMessage(
      error instanceof Error
        ? error.message
        : "Failed to save Ko-Host Connect settings.",
    );
  } finally {
    setConnectSaving(false);
  }
}

async function loadEmailRecipients() {
  try {
    setEmailRecipientsLoading(true);

    const res = await fetch(
      `/api/dashboard/microsites/${id}/email-recipients`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setEmailRecipients([]);
      return;
    }

    const nextRecipients = Array.isArray(data?.recipients)
      ? data.recipients
      : [];

    setEmailRecipients(nextRecipients);
  } catch {
    setEmailRecipients([]);
  } finally {
    setEmailRecipientsLoading(false);
  }
}

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

    setStripeError("No onboarding URL returned.");
  } catch (error) {
    console.error("Connect Stripe error:", error);
    setStripeError("Failed to start Stripe onboarding.");
  }
};

async function loadConnectSettings() {
  try {
    setConnectLoading(true);
    setConnectMessage("");

    const res = await fetch(
      `/api/dashboard/microsites/${id}/connect`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setConnectServices([]);
      setConnectProvider(null);
      setConnectMessage(
        data?.error ||
          "Failed to load Ko-Host Connect settings.",
      );
      return;
    }

    const services = Array.isArray(data?.services)
      ? data.services
      : [];

    const provider =
      data?.provider &&
      typeof data.provider === "object"
        ? data.provider
        : null;

    setConnectServices(services);
    setConnectProvider(provider);
    setConnectDisplayName(
  String(provider?.displayName || ""),
);

    setConnectEnabled(
      Boolean(provider?.enabled),
    );

    setConnectZipCode(
      String(provider?.serviceZipCode || ""),
    );

    setConnectRadiusMiles(
      Number(provider?.serviceRadiusMiles || 10),
    );

    setConnectServiceIds(
      Array.isArray(provider?.serviceIds)
        ? provider.serviceIds.map(String)
        : [],
    );
  } catch (error) {
    setConnectServices([]);
    setConnectProvider(null);

    setConnectMessage(
      error instanceof Error
        ? error.message
        : "Failed to load Ko-Host Connect settings.",
    );
  } finally {
    setConnectLoading(false);
  }
}

useEffect(() => {
  if (id) {
    void loadEmailRecipients();
    void loadConnectSettings();
  }
}, [id]);

useEffect(() => {
  if (selectAllEmailRecipients) {
    setSelectedEmailRecipients(emailRecipients.map((item) => item.email));
  } else if (
    emailRecipients.length > 0 &&
    selectedEmailRecipients.length === emailRecipients.length
  ) {
    setSelectedEmailRecipients([]);
  }
}, [selectAllEmailRecipients, emailRecipients]);

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

  function toggleEmailRecipient(email: string) {
  setSelectedEmailRecipients((prev) =>
    prev.includes(email)
      ? prev.filter((item) => item !== email)
      : [...prev, email],
  );
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
          recipients: selectedEmailRecipients,
        }),
      },
    );

    const rawText = await res.text();

    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = rawText;
    }

    if (!res.ok) {
      console.error("Send email failed:", {
        status: res.status,
        statusText: res.statusText,
        rawText,
        data,
      });

      setEmailStatus(
        typeof data?.error === "string"
          ? data.error
          : typeof data === "string" && data
            ? data
            : "Failed to send email.",
      );
      return;
    }

    setEmailStatus("Email sent.");
    setEmailSubject("");
    setEmailMessage("");
  } catch (error) {
    console.error("Send email request failed:", error);
    setEmailStatus(
      error instanceof Error ? error.message : "Failed to send email.",
    );
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
    setStripeError("Failed to open Stripe dashboard");
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
  href={`https://${site.slug}.ko-host.com`}
  target="_blank"
  rel="noreferrer"
  className="inline-flex items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
>
  Open Public URL
</a>

<a
  href={`/api/qr?text=${encodeURIComponent(
    `https://${site.slug}.ko-host.com`,
  )}&filename=${encodeURIComponent(`${site.slug}-qr-code.png`)}`}
  download={`${site.slug}-qr-code.png`}
  target="_blank"
  rel="noreferrer"
  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
>
  Download QR Code
</a>

<Link
  href={`/dashboard/microsites/${site.id}/share-preview`}
  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
>
  Share Preview
</Link>
        </div>
      </div>

<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
  <div className="text-sm font-semibold text-neutral-900">
    Microsite Settings
  </div>

  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="text-sm font-semibold text-neutral-900">
          Ko-Host Connect
        </div>

        <div className="mt-1 max-w-2xl text-sm text-neutral-600">
          Link this microsite to Ko-Host Connect to receive relevant service
          requests from people looking for providers in your area.
        </div>
      </div>

      {connectProvider?.linked ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Linked
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-neutral-400" />
          Not Linked
        </div>
      )}
    </div>

    {connectLoading ? (
      <div className="mt-5 rounded-xl border border-neutral-200 bg-white px-4 py-4 text-sm text-neutral-500">
        Loading Ko-Host Connect settings...
      </div>
    ) : (
      <>
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={connectEnabled}
            onChange={(e) => setConnectEnabled(e.target.checked)}
            className="mt-1"
          />

          <div>
            <div className="text-sm font-medium text-neutral-900">
              Receive Connect Requests
            </div>

            <div className="mt-1 text-xs leading-5 text-neutral-500">
              When enabled, this microsite can receive matching requests based
              on the services and service area you select below.
            </div>
          </div>
</label>

<div className="mt-5">
  <button
    type="button"
    onClick={() =>
      setConnectServicesExpanded((current) => !current)
    }
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left transition hover:border-neutral-300"
    aria-expanded={connectServicesExpanded}
  >
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Services You Provide
      </div>

      <div className="mt-1 text-xs text-neutral-500">
        {connectServiceIds.length === 0
          ? "No services selected"
          : `${connectServiceIds.length} ${
              connectServiceIds.length === 1
                ? "service"
                : "services"
            } selected`}
      </div>
    </div>

    <span
      className={[
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm text-neutral-600 transition-transform duration-200",
        connectServicesExpanded ? "rotate-180" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      ▼
    </span>
  </button>

  {connectServicesExpanded ? (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {connectServices.map((service) => {
        const checked = connectServiceIds.includes(service.id);

        return (
          <label
            key={service.id}
            className={[
              "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
              checked
                ? "border-emerald-400 bg-emerald-50 text-neutral-900"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                toggleConnectService(service.id)
              }
            />

            <span>{service.name}</span>
          </label>
        );
      })}
    </div>
  ) : null}
</div>

<div className="mt-5">
  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
    Services You Provide
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {connectServices.map((service) => {
              const checked = connectServiceIds.includes(service.id);

              return (
                <label
                  key={service.id}
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                    checked
                      ? "border-emerald-400 bg-emerald-50 text-neutral-900"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleConnectService(service.id)}
                  />

                  <span>{service.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Service ZIP Code
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={connectZipCode}
              onChange={(e) =>
                setConnectZipCode(
                  e.target.value.replace(/\D/g, "").slice(0, 5),
                )
              }
              placeholder="22401"
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            />

            <div className="mt-2 text-xs text-neutral-500">
              Enter the ZIP code at the center of your service area.
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Service Radius
            </div>

            <select
              value={connectRadiusMiles}
              onChange={(e) =>
                setConnectRadiusMiles(Number(e.target.value))
              }
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
            >
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
            </select>

            <div className="mt-2 text-xs text-neutral-500">
              Matching requests within this service area can be sent to you.
            </div>
          </div>
        </div>

        {!site.is_published ? (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This microsite is not published yet. You can configure Ko-Host
            Connect now, but it must be published before it can receive
            requests.
          </div>
        ) : null}

        {connectMessage ? (
          <div className="mt-4 text-sm text-neutral-600">
            {connectMessage}
          </div>
        ) : null}

        <div className="mt-5">
          <button
            type="button"
            onClick={() => void saveConnectSettings()}
            disabled={connectSaving}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {connectSaving
              ? "Saving..."
              : connectProvider?.linked
                ? "Save Connect Settings"
                : "Link to Ko-Host Connect"}
          </button>
        </div>
      </>
    )}
  </div>

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

<div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
  <div>
    <div className="text-sm font-semibold text-neutral-900">Manage Content</div>
    <div className="mt-1 text-sm text-neutral-600">
      Review submissions, text entries, and uploaded media from this microsite.
    </div>
  </div>

<div className="mt-5 grid gap-3 md:grid-cols-3">
  {site.template_key === "wedding_rsvp" ? (
    <Link
      href={`/dashboard/microsites/${site.id}/rsvp`}
      className="inline-flex items-center justify-center rounded-xl border border-violet-300 bg-white px-4 py-3 text-sm font-medium text-violet-700 hover:border-violet-500"
    >
      View RSVP Submissions
    </Link>
  ) : (
    <button
      type="button"
      disabled
      className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-400"
    >
      RSVP Submissions
    </button>
  )}

  <Link
    href={`/dashboard/microsites/${site.id}/calendar-bookings`}
    className="inline-flex items-center justify-center rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:border-blue-500"
  >
    Calendar Bookings
  </Link>

  <Link
    href={`/dashboard/microsites/${site.id}/entries`}
    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:border-neutral-900"
  >
    View Text Entries
  </Link>

  <Link
    href={`/dashboard/microsites/${site.id}/uploads`}
    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:border-neutral-900"
  >
    View Media Uploads
  </Link>

  <Link
    href={`/dashboard/microsites/${site.id}/enrollments`}
    className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-medium text-emerald-700 hover:border-emerald-500"
  >
    Enrollment Board
  </Link>
  <Link
  href={`/dashboard/microsites/${site.id}/connect-requests`}
  className={[
    "inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium",
    connectProvider?.linked
      ? "border-emerald-300 bg-white text-emerald-700 hover:border-emerald-500"
      : "border-neutral-200 bg-neutral-50 text-neutral-400",
  ].join(" ")}
  onClick={(e) => {
    if (!connectProvider?.linked) {
      e.preventDefault();
    }
  }}
  aria-disabled={!connectProvider?.linked}
>
  Connect Requests
</Link>
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
    Select recipients for this microsite, then send your message.
  </div>

  <div className="mt-5">
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
      Recipients
    </div>

    <label className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={selectAllEmailRecipients}
        onChange={(e) => setSelectAllEmailRecipients(e.target.checked)}
      />
      Select All
    </label>

    <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-neutral-200 bg-white">
      {emailRecipientsLoading ? (
        <div className="px-4 py-4 text-sm text-neutral-500">
          Loading recipients...
        </div>
      ) : emailRecipients.length === 0 ? (
        <div className="px-4 py-4 text-sm text-neutral-500">
          No recipient emails found yet.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {emailRecipients.map((recipient) => (
            <label
              key={`${recipient.source}-${recipient.email}`}
              className="flex items-start gap-3 px-4 py-3 text-sm text-neutral-800"
            >
              <input
                type="checkbox"
                checked={selectedEmailRecipients.includes(recipient.email)}
                onChange={() => toggleEmailRecipient(recipient.email)}
                className="mt-0.5"
              />
              <div className="min-w-0">
                <div className="font-medium text-neutral-900">
                  {recipient.email}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {recipient.label}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  </div>

  <div className="mt-5">
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

  <div className="mt-5">
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
      Message
    </div>
    <textarea
      value={emailMessage}
      onChange={(e) => setEmailMessage(e.target.value)}
      className="mt-2 min-h-[120px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
    />
  </div>

  <div className="mt-5">
    <button
      type="button"
      onClick={() => void sendBulkEmail()}
      disabled={!selectedEmailRecipients.length}
      className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      Send Email
    </button>
  </div>

  {emailStatus ? (
    <div className="mt-3 text-sm text-neutral-600">{emailStatus}</div>
  ) : null}
</div>

    </main>
  );
  <AppModal
  open={Boolean(stripeError)}
  title="Stripe Error"
  cancelText="OK"
  onCancel={() => setStripeError("")}
>
  <p className="text-sm text-neutral-700">{stripeError}</p>
</AppModal>
}
