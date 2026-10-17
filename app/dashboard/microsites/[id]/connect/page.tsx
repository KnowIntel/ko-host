// app/dashboard/microsites/[id]/connect/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type MicrositeInfo = { id: string; title: string; slug: string; is_published: boolean };

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

export default function KoHostConnectManagementPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [site, setSite] = useState<MicrositeInfo | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteError, setSiteError] = useState("");
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
    if (!id) return;
    void loadConnectSettings();
    let cancelled = false;
    async function loadSite() {
      try {
        setSiteLoading(true);
        const res = await fetch(`/api/dashboard/microsites/${id}/settings`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.microsite) {
          setSiteError(data?.error || "Unable to load microsite.");
          return;
        }
        setSite(data.microsite);
      } catch (error) {
        if (!cancelled) setSiteError(error instanceof Error ? error.message : "Unable to load microsite.");
      } finally {
        if (!cancelled) setSiteLoading(false);
      }
    }
    void loadSite();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Ko-Host Connect</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage your microsite's provider listing and service requests.</p>
        </div>
        <Link href={`/dashboard/microsites/${id}`} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50">Back to Dashboard</Link>
      </div>
      {siteLoading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm">Loading microsite...</div>
      ) : !site ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-red-700">{siteError || "Microsite not found."}</div>
      ) : (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-sm text-neutral-600">Microsite: <span className="font-medium text-neutral-900">{site.title || site.slug}</span></div>
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
  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
    Provider Display Name
  </div>

  <input
    type="text"
    maxLength={100}
    value={connectDisplayName}
    onChange={(e) =>
      setConnectDisplayName(e.target.value)
    }
    placeholder="Your Lawn Guy"
    className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
  />

  <div className="mt-2 text-xs text-neutral-500">
    This is the business or provider name customers will see on Ko-Host Connect.
  </div>
</div>

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

        </section>
      )}
    </main>
  );
}
