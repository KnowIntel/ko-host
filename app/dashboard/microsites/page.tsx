// app/dashboard/microsites/page.tsx

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import MicrositesTableClient from "./MicrositesTableClient";

export const dynamic = "force-dynamic";

type MicrositeRow = {
  rowType: "microsite";
  id: string;
  slug: string;
  title: string;
  template_key: string;
  design_key: string | null;
  is_active: boolean;
  is_published: boolean;
  paid_until: string | null;
  created_at: string;
  updated_at: string | null;
  is_favorite: boolean;
};

type DraftRow = {
  rowType: "draft";
  id: string;
  slug: string;
  title: string;
  template_key: string;
  design_key: string | null;
  is_active: false;
  is_published: false;
  paid_until: null;
  created_at: string;
  updated_at: string | null;
  is_favorite: false;
};

type DashboardRow = MicrositeRow | DraftRow;

export default async function MicrositesListPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="p-6">Unauthorized</div>;
  }

  const supabase = getSupabaseAdmin();

  const [{ data: microsites, error: micrositesError }, { data: drafts, error: draftsError }] =
    await Promise.all([
      supabase
        .from("microsites")
        .select(`
          id,
          slug,
          title,
          template_key,
          selected_design_key,
          is_active,
          is_published,
          paid_until,
          created_at,
          updated_at,
          is_favorite
        `)
        .eq("owner_clerk_user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("microsite_drafts")
        .select(`
          id,
          title,
          slug_suggestion,
          template_key,
          design_key,
          created_at,
          updated_at
        `)
        .eq("owner_clerk_user_id", userId)
        .order("updated_at", { ascending: false }),
    ]);

  if (micrositesError) {
    console.error("microsites list failed", micrositesError);
    return <div className="p-6">Failed to load microsites.</div>;
  }

  if (draftsError) {
    console.error("drafts list failed", draftsError);
    return <div className="p-6">Failed to load drafts.</div>;
  }

  const micrositeRows: MicrositeRow[] = (microsites ?? []).map((row: any) => ({
    rowType: "microsite",
    id: row.id,
    slug: row.slug || "",
    title: row.title || "",
    template_key: row.template_key || "",
    design_key: row.selected_design_key || null,
    is_active: row.is_active !== false,
    is_published: Boolean(row.is_published),
    paid_until: row.paid_until ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at ?? null,
    is_favorite: Boolean(row.is_favorite),
  }));

  const existingDraftKeys = new Set(
    micrositeRows.map(
      (row) => `${row.template_key}::${row.design_key || "blank"}::${row.slug || ""}`,
    ),
  );

  const draftRows: DraftRow[] = (drafts ?? [])
    .map((row: any) => ({
      rowType: "draft" as const,
      id: row.id,
      slug: row.slug_suggestion || "",
      title: row.title || "",
      template_key: row.template_key || "",
      design_key: row.design_key || "blank",
      is_active: false as const,
      is_published: false as const,
      paid_until: null,
      created_at: row.created_at,
      updated_at: row.updated_at ?? null,
      is_favorite: false as const,
    }))
    .filter(
      (row) =>
        !existingDraftKeys.has(
          `${row.template_key}::${row.design_key || "blank"}::${row.slug || ""}`,
        ),
    );

  const rows: DashboardRow[] = [...micrositeRows, ...draftRows].sort((a, b) => {
    const aTime = new Date(a.updated_at || a.created_at).getTime();
    const bTime = new Date(b.updated_at || b.created_at).getTime();
    return bTime - aTime;
  });

  return <MicrositesTableClient microsites={rows} />;
}