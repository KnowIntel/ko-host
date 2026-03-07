// app/dashboard/microsites/page.tsx

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import MicrositesTableClient from "./MicrositesTableClient";

export const dynamic = "force-dynamic";

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  template_key: string;
  is_published: boolean;
  paid_until: string | null;
  created_at: string;
  is_favorite: boolean;
};

export default async function MicrositesListPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="p-6">Unauthorized</div>;
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("microsites")
    .select(`
      id,
      slug,
      title,
      template_key,
      is_published,
      paid_until,
      created_at,
      is_favorite
    `)
    .eq("owner_clerk_user_id", userId)
    .not("paid_until", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("microsites list failed", error);
    return <div className="p-6">Failed to load microsites.</div>;
  }

  return <MicrositesTableClient microsites={(data ?? []) as MicrositeRow[]} />;
}