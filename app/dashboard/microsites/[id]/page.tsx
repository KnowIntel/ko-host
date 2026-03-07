"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TemplateDraftEditor from "@/components/templates/TemplateDraftEditor";
import type { MicrositeBlock } from "@/lib/templates/builder";

type MicrositeRecord = {
  id: string;
  slug: string;
  title: string;
  template_key: string;
  is_published: boolean;
  paid_until: string | null;
  draft: {
    title?: string;
    slugSuggestion?: string;
    blocks?: MicrositeBlock[];
  } | null;
};

export default function DashboardMicrositeManagePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [site, setSite] = useState<MicrositeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/dashboard/microsites/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          alert(data?.error || "Failed to load microsite.");
          return;
        }

        if (!cancelled) {
          setSite(data.microsite || null);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unexpected error.";
        alert(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function saveBuilderDraft(draft: {
    title: string;
    slugSuggestion: string;
    blocks: MicrositeBlock[];
  }) {
    try {
      setSaving(true);

      const res = await fetch(`/api/dashboard/microsites/${id}/builder`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ draft }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "Failed to save builder draft.");
        return;
      }

      setSite((prev) =>
        prev
          ? {
              ...prev,
              title: data?.draft?.title || prev.title,
              slug: data?.microsite?.slug || prev.slug,
              draft: data?.draft || prev.draft,
            }
          : prev,
      );

      router.push("/dashboard/microsites");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error.";
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          Loading microsite...
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
          <div>Published: {site.is_published ? "Yes" : "No"}</div>
          <div>
            Preview:{" "}
            <a
              href={`/s/${site.slug}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              /s/{site.slug}
            </a>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-end">
        <div className="text-sm text-neutral-600">
          {saving ? "Saving..." : "Edit your microsite content below"}
        </div>
      </div>

      <TemplateDraftEditor
        templateKey={site.template_key}
        initialDraft={{
          title: site.draft?.title || site.title || "",
          slugSuggestion: site.slug || "",
          blocks: Array.isArray(site.draft?.blocks) ? site.draft.blocks : [],
        }}
        submitLabel={saving ? "Saving..." : "Save Changes"}
        onSubmit={saveBuilderDraft}
      />
    </main>
  );
}