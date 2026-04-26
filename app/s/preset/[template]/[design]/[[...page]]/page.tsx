import PlacedBlocksPreview from "@/components/preview/PlacedBlocksPreview";
import { loadTemplateDraftPreset } from "@/lib/drafts";
import type { BuilderDraft } from "@/lib/templates/builder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function PageShell({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-screen bg-[#fcfbf8] px-4 py-16">
      <div className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-base font-semibold text-neutral-900">{title}</div>
        <div className="mt-2 text-sm text-neutral-600">{message}</div>
      </div>
    </main>
  );
}

type PresetPage = BuilderDraft & {
  id?: string;
  slug?: string;
  draft?: BuilderDraft;
};

export default async function PresetMicrositePage({
  params,
}: {
  params: Promise<{
    template: string;
    design: string;
    page?: string[];
  }>;
}) {
  const { template, design, page } = await params;

  const templateKey = decodeURIComponent(template || "").trim();
  const designKey = decodeURIComponent(design || "").trim();
  const pageSlug = decodeURIComponent(page?.[0] || "home").trim().toLowerCase();

  const presetDraft = loadTemplateDraftPreset(templateKey, designKey) as
    | (BuilderDraft & { pages?: PresetPage[] })
    | null;

  if (!presetDraft) {
    return (
      <PageShell
        title="Preset unavailable"
        message="This design preset could not be found."
      />
    );
  }

  const pages = Array.isArray(presetDraft.pages) ? presetDraft.pages : [];

  const matchedPage =
    pages.find((p) => String(p.slug || "").toLowerCase() === pageSlug) ||
    (pageSlug === "home" ? pages[0] : null);

  const draft =
    matchedPage?.draft ||
    (matchedPage as BuilderDraft | null) ||
    (pageSlug === "home" ? presetDraft : null);

  if (!draft) {
    return (
      <PageShell
        title="Page unavailable"
        message="This preset page could not be found."
      />
    );
  }

  const pageColor =
    (((draft as any)?.pageColor && String((draft as any).pageColor).trim()) ||
      "#fcfbf8") as string;

  const pageBackgroundImage = String(
    (draft as any)?.pageBackgroundImage || "",
  ).trim();

  const pageBackgroundImageFit = ((draft as any)?.pageBackgroundImageFit ||
    "zoom") as "clip" | "zoom" | "stretch";

  const pageBackgroundSize =
    pageBackgroundImageFit === "clip"
      ? "contain"
      : pageBackgroundImageFit === "stretch"
        ? "100% 100%"
        : "cover";

  return (
    <main
      className="w-screen max-w-none overflow-hidden text-neutral-900"
      style={{
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
        backgroundColor: pageColor,
        ...(pageBackgroundImage
          ? {
              backgroundImage: `url("${pageBackgroundImage}")`,
              backgroundSize: pageBackgroundSize,
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
            }
          : {}),
      }}
    >
      <div className="w-screen max-w-none overflow-hidden">
        <PlacedBlocksPreview
          draft={draft}
          designKey={designKey}
          micrositeId={`preset-${templateKey}-${designKey}`}
          micrositeSlug={`preset-${templateKey}-${designKey}`}
          serverNow={Date.now()}
          hideFrame={true}
        />
      </div>
    </main>
  );
}