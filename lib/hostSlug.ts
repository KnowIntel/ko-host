export const RESERVED_SUBDOMAINS = new Set([
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

export function getSlugFromHost(hostRaw: string | null) {
  const host = (hostRaw || "").toLowerCase();

  // match {slug}.ko-host.com (optional :port)
  const m = host.match(/^([^.]+)\.ko-host\.com(?::\d+)?$/i);
  const slug = m?.[1] || null;

  if (!slug) return null;
  if (RESERVED_SUBDOMAINS.has(slug)) return null;

  return slug;
}