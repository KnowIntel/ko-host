// app/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const h = await headers();
  const host = h.get("host") || "";

  // wildcard: {slug}.ko-host.com -> /s/{slug}
  const m = host.match(/^([^.]+)\.ko-host\.com(?::\d+)?$/i);
  const slugFromHost = m?.[1] || null;
  if (slugFromHost) redirect(`/s/${slugFromHost}`);

  // apex -> templates funnel
  redirect("/templates");
}