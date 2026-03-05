import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function AnnouncementBlock({
  micrositeId,
}: {
  micrositeId: string;
}) {
  const sb = getSupabaseAdmin();

  const { data } = await sb
    .from("microsite_announcements")
    .select("id, title, body, created_at")
    .eq("microsite_id", micrositeId)
    .order("created_at", { ascending: false })
    .limit(1);

  const a = data?.[0];
  if (!a) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">Announcement</div>
      {a.title ? (
        <div className="mt-2 text-lg font-semibold tracking-tight text-neutral-900">
          {a.title}
        </div>
      ) : null}
      <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{a.body}</p>
    </section>
  );
}