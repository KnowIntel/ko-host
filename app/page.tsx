// app/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const RESERVED = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "mail",
  "ftp",
  "blog",
  "support",
]);

export default async function HomePage() {
  const h = await headers();
  const host = (h.get("host") || "").toLowerCase();

  // wildcard: {slug}.ko-host.com -> /s/{slug}
  const m = host.match(/^([^.]+)\.ko-host\.com(?::\d+)?$/i);
  const slugFromHost = m?.[1] || null;

  // ✅ IMPORTANT: do NOT treat reserved subdomains as microsites
  if (slugFromHost && !RESERVED.has(slugFromHost)) {
    redirect(`/s/${slugFromHost}`);
  }

  // apex (and reserved subdomains like www) -> templates funnel
  redirect("/templates");
}