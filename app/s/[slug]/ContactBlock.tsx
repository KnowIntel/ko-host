import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function prettyPhone(p?: string | null) {
  return (p || "").trim();
}

export default async function ContactBlock({
  micrositeId,
}: {
  micrositeId: string;
}) {
  const sb = getSupabaseAdmin();

  const { data } = await sb
    .from("microsite_contact")
    .select("email, phone, website")
    .eq("microsite_id", micrositeId)
    .maybeSingle();

  if (!data) return null;

  const email = (data.email || "").trim();
  const phone = prettyPhone(data.phone);
  const website = (data.website || "").trim();

  if (!email && !phone && !website) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">Contact</div>

      <div className="mt-3 grid gap-2">
        {email ? (
          <a
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            href={`mailto:${email}`}
          >
            Email: {email}
          </a>
        ) : null}

        {phone ? (
          <a
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            href={`tel:${phone}`}
          >
            Phone: {phone}
          </a>
        ) : null}

        {website ? (
          <a
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            href={website}
            target="_blank"
            rel="noreferrer"
          >
            Website: {website}
          </a>
        ) : null}
      </div>
    </section>
  );
}