import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeWebsite(input?: string | null) {
  const raw = (input || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;

  return raw; // last resort
}

function normalizePhone(input?: string | null) {
  return (input || "").trim();
}

export default async function ContactBlock({
  micrositeId,
}: {
  micrositeId: string;
}) {
  const sb = getSupabaseAdmin();

  // If your table currently only has (email, phone, website), this still works.
  // If you later add "name", it will start showing automatically.
  const { data, error } = await sb
    .from("microsite_contact")
    .select("name, email, phone, website")
    .eq("microsite_id", micrositeId)
    .maybeSingle();

  if (error || !data) return null;

  const name = (data as any).name ? String((data as any).name).trim() : "";
  const email = String((data as any).email || "").trim();
  const phone = normalizePhone((data as any).phone);
  const website = normalizeWebsite((data as any).website);

  if (!name && !email && !phone && !website) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-neutral-600">Contact</div>

      {name ? (
        <div className="mt-2 text-sm font-semibold text-neutral-900">{name}</div>
      ) : null}

      <div className="mt-3 grid gap-2">
        {email ? (
          <a
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            href={`mailto:${email}`}
          >
            Email: <span className="font-mono font-semibold">{email}</span>
          </a>
        ) : null}

        {phone ? (
          <a
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            href={`tel:${phone}`}
          >
            Phone: <span className="font-mono font-semibold">{phone}</span>
          </a>
        ) : null}

        {website ? (
          <a
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            href={website}
            target="_blank"
            rel="noreferrer"
          >
            Website: <span className="font-mono font-semibold">{website}</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}