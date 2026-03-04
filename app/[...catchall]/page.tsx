import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CatchAllPage() {
  const h = await headers();
  const host = h.get("host") || "";

  const m = host.match(/^([^.]+)\.ko-host\.com(?::\d+)?$/i);
  const slugFromHost = m?.[1] || null;

  // If we're on a wildcard subdomain, force everything to the microsite root
  if (slugFromHost) {
    redirect(`/s/${slugFromHost}`);
  }

  // Otherwise, just go home
  redirect("/");
}