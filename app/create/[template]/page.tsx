"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  getTemplateDef,
  normalizeTemplateKey,
  TEMPLATE_DEFS,
} from "@/lib/templates/registry";
import TemplateDraftEditor from "@/components/templates/TemplateDraftEditor";

type LegacyDraft = {
  title?: string;
  slugSuggestion?: string;
  announcement?: string | { headline?: string; body?: string };
  links?: Array<{ label?: string; url?: string }>;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export default function CreateTemplatePage() {
  const params = useParams();
  const rawTemplate = String(params?.template || "");
  const templateKey = normalizeTemplateKey(rawTemplate);

  const templateDef = useMemo(() => {
    return getTemplateDef(templateKey) ?? TEMPLATE_DEFS[0];
  }, [templateKey]);

  const initialDraft = useMemo<LegacyDraft>(() => {
    return {
      title: templateDef?.title ?? "",
      slugSuggestion: "",
    };
  }, [templateDef]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Create {templateDef?.title ?? "Microsite"}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Build your microsite, then continue to checkout.
        </p>
      </div>

      <TemplateDraftEditor
        templateKey={templateKey}
        initialDraft={initialDraft}
        submitLabel="Continue"
      />
    </main>
  );
}