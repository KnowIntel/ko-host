"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { getTemplateDef, normalizeTemplateKey, TEMPLATE_DEFS } from "@/lib/templates/registry";
import { TemplateDraftEditor } from "@/components/templates/TemplateDraftEditor";

export default function CreateTemplatePage() {
  const params = useParams();

  const raw = useMemo(() => {
    const v = (params as any)?.template;
    if (Array.isArray(v)) return v[0] ?? "";
    return typeof v === "string" ? v : "";
  }, [params]);

  const normalized = useMemo(() => normalizeTemplateKey(raw), [raw]);
  const t = useMemo(() => getTemplateDef(raw), [raw]);

  if (!t) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold">Template not found</h1>

        <div className="mt-4 rounded-xl border bg-white p-4 text-sm">
          <div>
            <span className="font-medium">raw param:</span> {raw || "(empty)"}
          </div>
          <div>
            <span className="font-medium">normalized:</span> {normalized || "(empty)"}
          </div>
          <div className="mt-2 text-xs text-neutral-600">
            known keys: {TEMPLATE_DEFS.map((x) => x.key).join(", ")}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <TemplateDraftEditor templateKey={t.key} templateTitle={t.title} defaultDraft={t.defaultDraft} />
    </main>
  );
}