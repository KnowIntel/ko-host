"use client";

import { useEffect, useMemo, useState } from "react";
import PlacedBlocksPreview from "@/components/preview/PlacedBlocksPreview";
import MicrositeFooterBrand from "@/components/microsite/MicrositeFooterBrand";
import type { BuilderDraft } from "@/lib/templates/builder";

type PreviewPayload = {
  templateKey?: string;
  designKey?: string;
  draft?: BuilderDraft;
};

export default function PublishedMicrositePage() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("kht:preview-draft");

      if (!raw) {
        setIsReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as PreviewPayload;
      setPayload(parsed);
    } catch {
      setPayload(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  const draft = useMemo(() => payload?.draft ?? null, [payload]);
  const designKey = payload?.designKey || "blank";

  if (!isReady) {
    return (
      <main className="min-h-screen bg-[#fcfbf8] px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-neutral-900">
            Loading page...
          </div>
        </div>
      </main>
    );
  }

  if (!draft) {
    return (
      <main className="min-h-screen bg-[#fcfbf8] px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-base font-semibold text-neutral-900">
            Page unavailable
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            No published microsite content available.
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#fcfbf8] text-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <PlacedBlocksPreview draft={draft} designKey={designKey} />
        </div>
      </main>

      <MicrositeFooterBrand />
    </>
  );
}