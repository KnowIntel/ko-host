import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
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

    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },

      {
        src: "/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
      },

      {
        src: "/icons/pwa-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      }
    ],

    shortcuts: [
      {
        name: "Create Microsite",
        short_name: "Create",
        description: "Create a new microsite",
        url: "/templates",
        icons: [{ src: "/icon.png", sizes: "192x192" }]
      },
      {
        name: "Browse Templates",
        short_name: "Templates",
        description: "Browse Ko-Host templates",
        url: "/templates",
        icons: [{ src: "/icon.png", sizes: "192x192" }]
      }
    ],

    screenshots: [
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide"
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "390x844",
        type: "image/png"
      }
    ]
  };
}