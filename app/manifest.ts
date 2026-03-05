import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { TEMPLATE_DEFS, getTemplateDef } from "@/lib/templates/registry";

export const dynamic = "force-dynamic";

type ManifestIcon = NonNullable<MetadataRoute.Manifest["icons"]>[number];

function getSubdomainFromHost(host: string) {
  const h = (host || "").toLowerCase().trim();
  if (!h) return null;

  const noPort = h.split(":")[0];

  if (
    !noPort.endsWith(".ko-host.com") &&
    noPort !== "ko-host.com" &&
    noPort !== "www.ko-host.com"
  ) {
    return null;
  }

  if (noPort === "ko-host.com" || noPort === "www.ko-host.com") return null;

  const sub = noPort.split(".")[0];
  if (!sub || sub === "www") return null;

  return sub;
}

function baseIcons(): ManifestIcon[] {
  return [
    { src: "/icon.png", sizes: "192x192", type: "image/png" },
    { src: "/icon.png", sizes: "512x512", type: "image/png" },
    { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png" },
    {
      src: "/icons/pwa-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ];
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const h = await headers();
  const host = (h.get("host") || "").toLowerCase();
  const sub = getSubdomainFromHost(host);

  const base: MetadataRoute.Manifest = {
    id: "/",
    name: "Ko-Host",
    short_name: "Ko-Host",
    description: "Create premium temporary microsites in minutes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#111827",
    categories: ["business", "productivity", "utilities"],
    icons: baseIcons(),
    shortcuts: [
      {
        name: "Create Microsite",
        short_name: "Create",
        description: "Create a new microsite",
        url: "/templates",
        icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Browse Templates",
        short_name: "Templates",
        description: "Browse Ko-Host templates",
        url: "/templates",
        icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
      },
      { src: "/screenshots/mobile.png", sizes: "390x844", type: "image/png" },
    ],
  };

  if (!sub) return base;

  // 1) Demo subdomains (match registry demoSlug)
  const demoMatch = TEMPLATE_DEFS.find((t) => t.demoSlug === sub);
  if (demoMatch) {
    const def = getTemplateDef(demoMatch.key);
    const name = def?.title ? `${def.title} Demo` : "Demo";
    const thumbIcon = def?.thumb ? `/templates/${def.thumb}.png` : null;

    return {
      ...base,
      name,
      short_name: name,
      description: "Preview this template. Customize your own in minutes.",
      id: "/",
      start_url: "/demo",
      scope: "/",
      icons: [
        ...(thumbIcon
          ? ([
              {
                src: thumbIcon,
                sizes: "512x512",
                type: "image/png",
              },
            ] as ManifestIcon[])
          : []),
        ...baseIcons(),
      ],
    };
  }

  // 2) Real microsite subdomains (slug=subdomain)
  try {
    const sb = getSupabaseAdmin();
    const { data: site } = await sb
      .from("microsites")
      .select("slug, title, template_key, is_published, expires_at, paid_until")
      .eq("slug", sub)
      .maybeSingle();

    if (site?.slug) {
      const now = new Date();
      const isExpired = site.expires_at ? new Date(site.expires_at) <= now : false;
      const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;

      if (site.is_published && !isExpired && paidActive) {
        const def = getTemplateDef(site.template_key);
        const name = (site.title || `${site.slug}.ko-host.com`).trim();
        const thumbIcon = def?.thumb ? `/templates/${def.thumb}.png` : null;

        return {
          ...base,
          name,
          short_name: name.length > 12 ? name.slice(0, 12) : name,
          description: def?.description || "A Ko-Host microsite",
          id: "/",
          start_url: "/",
          scope: "/",
          icons: [
            ...(thumbIcon
              ? ([
                  {
                    src: thumbIcon,
                    sizes: "512x512",
                    type: "image/png",
                  },
                ] as ManifestIcon[])
              : []),
            ...baseIcons(),
          ],
          shortcuts: [
            {
              name: "Home",
              short_name: "Home",
              description: "Open this microsite",
              url: "/",
              icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
            },
          ],
        };
      }
    }
  } catch {
    // fall back to base manifest
  }

  return base;
}