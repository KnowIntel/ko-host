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

export default async function CatchAllPage() {
  const h = await headers();
  const host = (h.get("host") || "").toLowerCase();

  const m = host.match(/^([^.]+)\.ko-host\.com(?::\d+)?$/i);
  const slugFromHost = m?.[1] || null;

  if (slugFromHost && !RESERVED.has(slugFromHost)) {
    redirect(`/s/${slugFromHost}`);
  }

  redirect("/templates");
}