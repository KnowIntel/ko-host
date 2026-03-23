// \app\dashboard\microsites\[id]\page.tsx

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
  private_mode?: boolean | null;
  is_active?: boolean | null;
  is_published: boolean;
  paid_until: string | null;
};

export default function DashboardMicrositeManagePage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [site, setSite] = useState<MicrositeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [siteVisibility, setSiteVisibility] = useState<"public" | "private">("public");
  const [passcode, setPasscode] = useState("");

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
            microsite?.site_visibility === "private" || microsite?.private_mode
              ? "private"
              : "public",
          );
          setPasscode("");
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
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

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
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Failed to save settings.");
        return;
      }

      setSite(data?.microsite || null);
      setPasscode("");
      setMessage("Settings saved.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Unexpected error.";
      setMessage(nextMessage);
    } finally {
      setSaving(false);
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
                onChange={() => setSiteVisibility("private")}
              />
              Private (passcode required)
            </label>
          </div>
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
          <div className="text-sm font-medium text-neutral-900">Other settings on this page</div>
          <div className="mt-2 text-sm text-neutral-600">
            This manage page now covers title, visibility, passcode, publish status,
            active status, design reference, paid-until status, and direct draft editing.
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
    </main>
  );
}