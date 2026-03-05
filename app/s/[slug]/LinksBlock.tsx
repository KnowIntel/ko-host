import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeUrl(input: string) {
  const raw = (input || "").trim();
  if (!raw) return null;

  // Allow mailto / tel as-is
  if (/^(mailto:|tel:)/i.test(raw)) return raw;

  // If already has a scheme, keep it
  if (/^https?:\/\//i.test(raw)) return raw;

  // If looks like a domain/path, assume https
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;

  return null;
}

export default async function LinksBlock({
  micrositeId,
}: {
  micrositeId: string;
}) {
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("microsite_links")
    .select("id, label, url, sort_order, created_at")
    .eq("microsite_id", micrositeId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return null;

  const linksRaw = data ?? [];
  const links = linksRaw
    .map((l) => ({
      id: l.id as string,
      label: (l.label || "").trim(),
      url: normalizeUrl(String(l.url || "")),
    }))
    .filter((l) => l.label && l.url);

  if (!links.length) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-neutral-600">Links</div>

      <div className="mt-3 grid gap-2">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url!}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate">{l.label}</span>
              <span className="shrink-0 text-neutral-400 group-hover:text-neutral-600">
                ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}