import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSlugFromHost } from "@/lib/hostSlug";

export const dynamic = "force-dynamic";

export default async function CatchAllPage() {
  const h = await headers();
  const slug = getSlugFromHost(h.get("host"));

  if (slug) redirect(`/s/${slug}`);

  redirect("/templates");
}