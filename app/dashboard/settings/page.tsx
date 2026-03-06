import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import QRGeneratorClient from "./QRGeneratorClient";

export const dynamic = "force-dynamic";

type MicrositeRow = {
  id: string;
  slug: string;
  title: string | null;
};

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("microsites")
    .select("id, slug, title")
    .eq("owner_clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-red-600">
            Failed to load your microsites.
          </p>
        </div>
      </main>
    );
  }

  const microsites = (data ?? []) as MicrositeRow[];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <p className="mt-2 text-sm text-neutral-700">
          Generate QR codes and share cards for your microsites.
        </p>

        <div className="mt-6">
          <QRGeneratorClient microsites={microsites} />
        </div>
      </div>
    </main>
  );
}