import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function AnnouncementBlock({
  micrositeId,
}: {
  micrositeId: string;
}) {
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("microsite_announcements")
    .select("id, title, body, created_at")
    .eq("microsite_id", micrositeId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return null;

  const a = data?.[0];
  if (!a) return null;

  const title = (a.title || "").trim();
  const body = (a.body || "").trim();
  if (!title && !body) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-neutral-600">Announcement</div>

      {title ? (
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-neutral-900">
          {title}
        </h2>
      ) : null}

      {body ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{body}</p>
      ) : null}
    </section>
  );
}