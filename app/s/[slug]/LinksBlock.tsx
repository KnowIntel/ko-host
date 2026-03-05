import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function LinksBlock({
  micrositeId,
}: {
  micrositeId: string;
}) {
  const sb = getSupabaseAdmin();

  const { data } = await sb
    .from("microsite_links")
    .select("id, label, url, sort_order")
    .eq("microsite_id", micrositeId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const links = data ?? [];
  if (!links.length) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">Links</div>
      <div className="mt-3 grid gap-2">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
          >
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}