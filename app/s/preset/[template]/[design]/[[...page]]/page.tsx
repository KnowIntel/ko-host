import PlacedBlocksPreview from "@/components/preview/PlacedBlocksPreview";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { BuilderDraft } from "@/lib/templates/builder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MicrositeRow = {
  id: string;
  slug: string;
  title: string | null;
  selected_design_key: string | null;
  is_published: boolean | null;
  is_active?: boolean | null;
};

type MicrositePageRow = {
  id: string;
  slug: string;
  title: string | null;
  draft: BuilderDraft | null;
};

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

function normalizeKey(value: string) {
  return decodeURIComponent(String(value || ""))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

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

  const templateKey = normalizeKey(template);
  const designKey = normalizeKey(design);

  const pageSlug = decodeURIComponent(page?.[0] || "home")
    .trim()
    .toLowerCase();

  const supabaseAdmin = getSupabaseAdmin();

  const { data: presetMicrosite, error: presetMicrositeError } =
    await supabaseAdmin
      .from("microsites")
      .select(
        "id, slug, title, selected_design_key, is_published, is_active",
      )
      .eq("selected_design_key", designKey)
      .eq("is_published", true)
      .eq("is_active", true)
      .ilike("slug", `%${templateKey.replace(/_/g, "-")}%`)
      .maybeSingle();

  if (presetMicrositeError || !presetMicrosite) {
    return (
      <PageShell
        title="Preset unavailable"
        message="This design preset could not be found."
      />
    );
  }

  const typedPresetMicrosite = presetMicrosite as MicrositeRow;

  const { data: micrositePage, error: micrositePageError } =
    await supabaseAdmin
      .from("microsite_pages")
      .select("id, slug, title, draft")
      .eq("microsite_id", typedPresetMicrosite.id)
      .eq("slug", pageSlug)
      .maybeSingle();

  if (micrositePageError || !micrositePage) {
    return (
      <PageShell
        title="Page unavailable"
        message="This preset page could not be found."
      />
    );
  }

  const typedMicrositePage = micrositePage as MicrositePageRow;
  const draft = typedMicrositePage.draft ?? null;

  if (!draft) {
    return (
      <PageShell
        title="Page unavailable"
        message="No preset page content is available."
      />
    );
  }

  const pageColor =
    (((draft as any)?.pageColor &&
      String((draft as any).pageColor).trim()) ||
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
          micrositeId={typedPresetMicrosite.id}
          micrositeSlug={typedPresetMicrosite.slug}
          serverNow={Date.now()}
          hideFrame={true}
        />
      </div>
    </main>
  );
}