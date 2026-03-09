"use client";

import { useEffect, useMemo, useState } from "react";
import BlockRenderer from "@/components/preview/BlockRenderer";
import MicrositeFooterBrand from "@/components/microsite/MicrositeFooterBrand";
import type { BuilderDraft } from "@/lib/templates/builder";

type PreviewPayload = {
  templateKey?: string;
  designKey?: string;
  draft?: BuilderDraft;
};

export default function DraftPreviewPage() {
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

  if (!draft) {
    return (
      <main className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl text-center text-neutral-600">
          Preview unavailable
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#fcfbf8] text-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <header className="mb-12">
            <h1
              className="text-5xl"
              style={{ fontFamily: "var(--font-great-vibes)" }}
            >
              {draft.title}
            </h1>

            <p
              className="text-xl text-neutral-600"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {draft.subtitle}
            </p>
          </header>

          <div className="space-y-10">
            {draft.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} designKey="minimal" />
            ))}
          </div>
        </div>
      </main>

      <MicrositeFooterBrand />
    </>
  );
}